package notify

import (
	"strings"
	"testing"
	"unicode/utf8"
)

func TestTruncateBytesKeepsValidUTF8(t *testing.T) {
	// This is the most important invariant in this package. WeCom limits by
	// **byte**, a multibyte character is 2-3 bytes, and any implementation that cuts
	// hard by byte would cut such a character in half, producing invalid UTF-8
	// rejected by the platform. The multibyte/Latin-mixed inputs below (lengths chosen
	// coprime) are deliberate multibyte fixtures that hit every possible cut point.
	inputs := []string{
		"ßÄÖÜäöü",
		"café mixed résumé content",
		"aàbébîcödüe",
		"🔴🟠🟡🔵", // 4-byte emoji, a wrong cut is more obvious
		strings.Repeat("€", 100),
	}
	for _, in := range inputs {
		for max := 1; max <= len(in)+2; max++ {
			got := TruncateBytes(in, max)
			if !utf8.ValidString(got) {
				t.Fatalf("input %q max=%d: produced invalid UTF-8 %q", in, max, got)
			}
			if len(got) > max {
				t.Fatalf("input %q max=%d: result %d bytes exceeds the cap", in, max, len(got))
			}
			// The content must not be changed when not truncated.
			if len(in) <= max && got != in {
				t.Fatalf("input %q max=%d: changed the content without exceeding the cap -> %q", in, max, got)
			}
		}
	}
}

func TestTruncateBytesZeroMeansUnlimited(t *testing.T) {
	long := strings.Repeat("x", 10000)
	if got := TruncateBytes(long, 0); got != long {
		t.Fatal("max=0 should mean no limit")
	}
	if got := TruncateBytes(long, -5); got != long {
		t.Fatal("max<0 should mean no limit")
	}
}

func TestTruncateBytesEllipsisBudget(t *testing.T) {
	// When max is smaller than the ellipsis itself, appending the ellipsis must not
	// in turn exceed the cap.
	got := TruncateBytes("abcdefgh", 1)
	if len(got) > 1 {
		t.Fatalf("with max=1 the result %q length %d exceeds the cap", got, len(got))
	}
	// The normal case should carry the ellipsis.
	if got := TruncateBytes("abcdefgh", 5); !strings.HasSuffix(got, ellipsis) {
		t.Fatalf("expected an ellipsis, got %q", got)
	}
}

func TestTruncateRunesCountsCharactersNotBytes(t *testing.T) {
	// The measure difference from TruncateBytes must be kept: Telegram limits by
	// character, and the byte measure would cut a multibyte message short. The
	// multibyte input here is a deliberate fixture (ASCII cannot
	// distinguish a rune count from a byte count).
	s := "αβγδεζηθικ"
	got := TruncateRunes(s, 5)
	if n := utf8.RuneCountInString(got); n != 5 {
		t.Fatalf("expected 5 characters, got %d (%q)", n, got)
	}
	// The same string should be clearly shorter under the byte measure.
	if utf8.RuneCountInString(TruncateBytes(s, 5)) >= 5 {
		t.Fatal("the byte measure should not produce the same character count as the character measure")
	}
}

func TestOneLineCollapsesWhitespace(t *testing.T) {
	got := OneLine("line one\n\nline two\twith tabs   multi space", 0)
	if strings.ContainsAny(got, "\n\t") {
		t.Fatalf("all whitespace should be folded, got %q", got)
	}
	if strings.Contains(got, "  ") {
		t.Fatalf("consecutive spaces should not be kept, got %q", got)
	}
	// It must still be readable and valid after truncation. The multibyte input is a
	// deliberate fixture for the character-count truncation.
	got = OneLine("αβγδεζηθικ", 4)
	if n := utf8.RuneCountInString(got); n != 4 {
		t.Fatalf("expected 4 characters, got %d (%q)", n, got)
	}
}

func TestTruncateHTMLNeverCutsTagInHalf(t *testing.T) {
	// Truncating HTML directly would cut out a fragment like `<a href="htt`, and the
	// platform would reject the whole message.
	s := `<b>Title</b>body body body<a href="https://example.com/very/long/path">View detail</a>`
	for max := 1; max <= utf8.RuneCountInString(s)+2; max++ {
		got := TruncateHTML(s, max)
		if n := utf8.RuneCountInString(got); max > 0 && n > max {
			t.Fatalf("max=%d: result %d characters exceeds the cap", max, n)
		}
		// The tail must have no unclosed `<` (i.e. the last segment has a `<` but no `>`).
		if lt := strings.LastIndex(got, "<"); lt >= 0 && !strings.Contains(got[lt:], ">") {
			t.Fatalf("max=%d: a tail tag was cut off -> %q", max, got)
		}
	}
}

func TestAssetLineOmitsExcess(t *testing.T) {
	if got := assetLine(nil, 3); got != "" {
		t.Fatalf("no assets should return an empty string, got %q", got)
	}
	if got := assetLine([]string{"a", "b"}, 3); got != "a, b" {
		t.Fatalf("under the cap all should be listed, got %q", got)
	}
	// When over the cap it must note the total, otherwise the reader does not know
	// how many assets were not listed.
	got := assetLine([]string{"a", "b", "c", "d", "e"}, 2)
	if !strings.Contains(got, "5 total") {
		t.Fatalf("should note the total 5, got %q", got)
	}
}

func TestSeverityAndStatusLabels(t *testing.T) {
	if AtLeast("", "low") {
		t.Fatal("an empty level has ordinal 0 and should be blocked by any threshold")
	}
	if !AtLeast("critical", "") {
		t.Fatal("an empty threshold should pass")
	}
	if got := StatusLabel("fixed"); got != "Fixed" {
		t.Fatalf("unexpected status mapping, got %q", got)
	}
	// An unknown status is echoed as-is, with no fabricated label.
	if got := StatusLabel("weird_status"); got != "weird_status" {
		t.Fatalf("an unknown status should be echoed as-is, got %q", got)
	}
}

// TestTruncateHTMLNeverCutsEntity covers an omission the audit pointed out:
// truncation must avoid not only a half tag but also a cut-off HTML entity.
//
// After `&amp;` is cut into `&amp`, a parser that only recognizes entities may
// reject the **whole** message — and an over-long digest message is common to
// begin with, so the cost is too high.
func TestTruncateHTMLNeverCutsEntity(t *testing.T) {
	s := "aaaa&amp;bbbb&lt;cccc&quot;dddd"
	for max := 1; max <= utf8.RuneCountInString(s)+2; max++ {
		got := TruncateHTML(s, max)
		// The tail must not have an entity fragment "has & but no corresponding ;".
		if amp := strings.LastIndex(got, "&"); amp >= 0 && !strings.Contains(got[amp:], ";") {
			t.Fatalf("max=%d: left an entity fragment in the tail %q", max, got[amp:])
		}
		if strings.Contains(got, "&amp\x00") {
			t.Fatalf("max=%d: a malformed entity appeared", max)
		}
	}
}
