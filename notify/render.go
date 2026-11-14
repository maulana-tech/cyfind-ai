package notify

import (
	"strings"
	"unicode/utf8"
)

const ellipsis = "…"

// TruncateBytes truncates s to no more than max bytes, guaranteeing the result is valid UTF-8 and
// does not cut a character in half.
//
// Why it must cut on a character boundary: the WeCom group bot's markdown has a 4096-**byte** hard
// cap (not a character count), and a Chinese character is 3 bytes. Slicing directly by byte would
// cut a Chinese character in half and produce invalid UTF-8 — the platform would either reject the
// whole message or display it as garbled boxes. The approach here is to step back from the budget
// position to the nearest rune-start byte (utf8.RuneStart identifies a continuation byte
// 0b10xxxxxx).
//
// max<=0 means no limit. An ellipsis is appended after truncation, unless max is too small to fit
// the ellipsis.
func TruncateBytes(s string, max int) string {
	if max <= 0 || len(s) <= max {
		return s
	}
	budget := max - len(ellipsis)
	suffix := ellipsis
	if budget < 0 {
		// max is shorter than the ellipsis: drop the ellipsis and truncate plainly, to avoid the
		// result exceeding max instead.
		budget = max
		suffix = ""
	}
	cut := budget
	for cut > 0 && !utf8.RuneStart(s[cut]) {
		cut--
	}
	return s[:cut] + suffix
}

// OneLine compresses multi-line text into a single line: it folds all whitespace, then truncates by
// character count. Used for the title line of an IM message — a summary often has newlines, and
// stuffing them straight into a table/title breaks the layout. max<=0 means no length limit.
func OneLine(s string, max int) string {
	s = strings.Join(strings.Fields(s), " ")
	return TruncateRunes(s, max)
}

// TruncateRunes truncates s to no more than max characters (not bytes), appending an ellipsis when
// it overflows. max<=0 means no limit.
//
// The difference from TruncateBytes is the platform's measure: WeCom limits by byte, Telegram
// limits by character count. Using the wrong measure does not error, it only cuts the message far
// shorter than expected (1 Chinese char = 3 bytes, so a 4096-byte cut leaves about 1365 chars), so
// both functions must be kept and chosen per channel.
func TruncateRunes(s string, max int) string {
	if max <= 0 {
		return s
	}
	runes := []rune(s)
	if len(runes) <= max {
		return s
	}
	if max <= 1 {
		return string(runes[:max])
	}
	return string(runes[:max-1]) + ellipsis
}

// TruncateHTML truncates an HTML fragment by character count, guaranteeing it does not produce a
// half tag.
//
// Truncating HTML by character directly would cut out a broken tag like `<a href="htt`, and the
// platform parser would either error and reject the whole message or swallow the following body as
// an attribute value. The approach here is: truncate by character first, then check whether the
// tail has an unclosed `<`, and if so step back to before it.
//
// It does not do tag balancing (completing a </b> etc.): Telegram's HTML parser auto-closes
// unclosed tags, and implementing balancing yourself would have to handle quotes in attributes,
// comments, and self-closing tags — a complexity out of proportion to the benefit.
func TruncateHTML(s string, max int) string {
	if max <= 0 || len([]rune(s)) <= max {
		return s
	}
	cut := TruncateRunes(s, max)
	// If the tail is a fragment starting with `<` (the last `<` has no `>` after it), step back to
	// before the `<`.
	if lt := strings.LastIndex(cut, "<"); lt >= 0 && !strings.Contains(cut[lt:], ">") {
		cut = cut[:lt]
	}
	// If the tail is a cut-off HTML entity (e.g. `&amp;` cut into `&amp`), step back too. An entity
	// fragment can make the **whole message** be rejected by a parser that only recognizes entities
	// — a digest message exceeding the length cap is common to begin with, and not worth dropping a
	// whole notification over.
	if amp := strings.LastIndex(cut, "&"); amp >= 0 && !strings.Contains(cut[amp:], ";") {
		cut = cut[:amp]
	}
	return cut
}

// packItemCount computes how many items fit **completely** within the budget, for a digest message
// to pack by whole item.
//
// Why pack by whole item rather than render the full text then truncate: truncation makes the
// latter-half items vanish into thin air, while their delivery records are still marked as
// delivered — not visible in the message, not visible in the delivery history, and the
// vulnerability is just gone. Packing by whole item leaves the items that do not fit in the DB as
// the next batch, and the kept the caller receives is the number this message actually delivered.
//
// Parameters: maxSize<=0 means no limit; reserve is the amount reserved for the message
// header/footer; size does the measuring (platforms differ: WeCom/DingTalk by byte, Telegram by
// character count — using the wrong measure does not error, it only compresses a Chinese message to
// far below the cap); render renders item idx into its actual text — the length varies by content
// and cannot be estimated.
//
// Returns at least 1 (as long as there are items). Even a single extremely over-long item must be
// sent and relies on the caller's final truncation as a fallback, otherwise one over-long
// vulnerability would permanently stall the whole batch in place.
func packItemCount(items []Item, maxSize, reserve int, footer string, size func(string) int, render func(Item, int) string) int {
	if maxSize <= 0 {
		return len(items)
	}
	budget := maxSize - reserve - size(footer)
	if budget < 0 {
		budget = 0
	}
	used := 0
	for i, it := range items {
		used += size(render(it, i))
		if used > budget && i > 0 {
			return i
		}
	}
	return len(items)
}

// byteSize / runeSize are the two measures for packItemCount, named out to avoid a bare
// func(s string) int closure at the call site, which would make it hard to see at a glance which
// measure is used.
func byteSize(s string) int { return len(s) }
func runeSize(s string) int { return utf8.RuneCountInString(s) }

// assetLine renders an asset list into a one-line display text, omitting the rest and noting the
// total when there are more than limit. A vulnerability may anchor dozens of assets, and listing
// them all would overflow the message.
func assetLine(assets []string, limit int) string {
	if len(assets) == 0 {
		return ""
	}
	if limit <= 0 || len(assets) <= limit {
		return strings.Join(assets, ", ")
	}
	return strings.Join(assets[:limit], ", ") + " and " + itoa(len(assets)) + " total"
}

// itoa is a short alias for strconv.Itoa, used only for concatenating display text, to avoid
// importing strconv everywhere.
func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	var buf [20]byte
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}
