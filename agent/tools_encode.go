package agent

import (
	"context"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html"
	"net/url"
	"strings"
	"unicode/utf8"

	actool "github.com/Autumn-27/norma/tool"
)

func payloadEncodeTool() actool.CoreTool {
	return readTool("payload_encode",
		"Encode or transform a payload string using one or more encoding schemes, applied in order (chaining). "+
			"Use this to craft filter-bypass payloads for XSS, SQLi, SSTI, path traversal, SSRF, and other injection tests. "+
			"Supports: url, double_url, html, base64, hex, unicode, js_escape, and raw (no-op passthrough).",
		obj(map[string]any{
			"payload": str("The raw payload string to encode"),
			"encodings": map[string]any{
				"type":        "array",
				"description": "Encoding(s) to apply, in order. Each step transforms the output of the previous. Example: [\"html\", \"url\"] first HTML-encodes, then URL-encodes the result.",
				"items":       map[string]any{"type": "string", "enum": []string{"url", "double_url", "html", "base64", "hex", "unicode", "js_escape", "raw"}},
			},
		}, "payload", "encodings"),
		func(_ context.Context, raw json.RawMessage) (actool.Result, error) {
			var in struct {
				Payload   string   `json:"payload"`
				Encodings []string `json:"encodings"`
			}
			if err := json.Unmarshal(raw, &in); err != nil {
				return actool.Errorf("invalid input: " + err.Error()), nil
			}
			if len(in.Encodings) == 0 {
				return actool.Errorf("encodings array must not be empty"), nil
			}

			result := in.Payload
			for _, enc := range in.Encodings {
				switch enc {
				case "url":
					result = url.QueryEscape(result)
				case "double_url":
					result = url.QueryEscape(url.QueryEscape(result))
				case "html":
					result = html.EscapeString(result)
				case "base64":
					result = base64.StdEncoding.EncodeToString([]byte(result))
				case "hex":
					result = hex.EncodeToString([]byte(result))
				case "unicode":
					result = unicodeEscape(result)
				case "js_escape":
					result = jsEscape(result)
				case "raw":
					// passthrough
				default:
					return actool.Errorf("unknown encoding: " + enc), nil
				}
			}

			out := map[string]string{
				"original": in.Payload,
				"encoded":  result,
				"chain":    strings.Join(in.Encodings, " → "),
			}
			b, _ := json.Marshal(out)
			return actool.Text(string(b)), nil
		})
}

func payloadDecodeTool() actool.CoreTool {
	return readTool("payload_decode",
		"Decode an encoded payload string using one or more decoding schemes, applied in order (chaining). "+
			"Use this to decode responses, cookies, tokens, or encoded parameters from targets. "+
			"Supports: url, double_url, html, base64, hex, unicode, raw (no-op passthrough).",
		obj(map[string]any{
			"payload": str("The encoded payload string to decode"),
			"decodings": map[string]any{
				"type":        "array",
				"description": "Decoding(s) to apply, in order. Each step transforms the output of the previous. Example: [\"url\", \"base64\"] first URL-decodes, then base64-decodes the result.",
				"items":       map[string]any{"type": "string", "enum": []string{"url", "double_url", "html", "base64", "hex", "unicode", "raw"}},
			},
		}, "payload", "decodings"),
		func(_ context.Context, raw json.RawMessage) (actool.Result, error) {
			var in struct {
				Payload   string   `json:"payload"`
				Decodings []string `json:"decodings"`
			}
			if err := json.Unmarshal(raw, &in); err != nil {
				return actool.Errorf("invalid input: " + err.Error()), nil
			}
			if len(in.Decodings) == 0 {
				return actool.Errorf("decodings array must not be empty"), nil
			}

			result := in.Payload
			for _, dec := range in.Decodings {
				var err error
				switch dec {
				case "url":
					result, err = url.QueryUnescape(result)
					if err != nil {
						return actool.Errorf("url decode failed: " + err.Error()), nil
					}
				case "double_url":
					result, err = url.QueryUnescape(result)
					if err != nil {
						return actool.Errorf("url decode (pass 1) failed: " + err.Error()), nil
					}
					result, err = url.QueryUnescape(result)
					if err != nil {
						return actool.Errorf("url decode (pass 2) failed: " + err.Error()), nil
					}
				case "html":
					result = html.UnescapeString(result)
				case "base64":
					b, err := base64.StdEncoding.DecodeString(result)
					if err != nil {
						b, err = base64.RawStdEncoding.DecodeString(result)
					}
					if err != nil {
						return actool.Errorf("base64 decode failed: " + err.Error()), nil
					}
					result = string(b)
				case "hex":
					b, err := hex.DecodeString(result)
					if err != nil {
						return actool.Errorf("hex decode failed: " + err.Error()), nil
					}
					result = string(b)
				case "unicode":
					result = unicodeUnescape(result)
				case "raw":
					// passthrough
				default:
					return actool.Errorf("unknown decoding: " + dec), nil
				}
			}

			out := map[string]string{
				"original": in.Payload,
				"decoded":  result,
				"chain":    strings.Join(in.Decodings, " → "),
			}
			b, _ := json.Marshal(out)
			return actool.Text(string(b)), nil
		})
}

func unicodeUnescape(s string) string {
	var b strings.Builder
	i := 0
	for i < len(s) {
		if i+5 < len(s) && s[i] == '\\' && s[i+1] == 'u' {
			var r rune
			n, err := fmt.Sscanf(s[i+2:i+6], "%04x", &r)
			if err == nil && n == 1 {
				b.WriteRune(r)
				i += 6
				continue
			}
		}
		b.WriteByte(s[i])
		i++
	}
	return b.String()
}

func unicodeEscape(s string) string {
	var b strings.Builder
	for _, r := range s {
		if r < 128 && r >= 32 && r != '<' && r != '>' && r != '&' && r != '"' && r != '\'' {
			b.WriteRune(r)
		} else {
			if r <= 0xFFFF {
				fmt.Fprintf(&b, "\\u%04x", r)
			} else {
				// surrogate pair for supplementary characters
				r -= 0x10000
				hi := 0xD800 + (r>>10)&0x3FF
				lo := 0xDC00 + r&0x3FF
				fmt.Fprintf(&b, "\\u%04x\\u%04x", hi, lo)
			}
		}
	}
	return b.String()
}

func jsEscape(s string) string {
	var b strings.Builder
	for i := 0; i < len(s); {
		r, size := utf8.DecodeRuneInString(s[i:])
		switch r {
		case '\\':
			b.WriteString("\\\\")
		case '\'':
			b.WriteString("\\'")
		case '"':
			b.WriteString("\\\"")
		case '\n':
			b.WriteString("\\n")
		case '\r':
			b.WriteString("\\r")
		case '\t':
			b.WriteString("\\t")
		case '<':
			b.WriteString("\\x3c")
		case '>':
			b.WriteString("\\x3e")
		case '/':
			b.WriteString("\\/")
		default:
			if r < 32 || r > 126 {
				if r <= 0xFFFF {
					fmt.Fprintf(&b, "\\u%04x", r)
				} else {
					fmt.Fprintf(&b, "\\u%04x", r)
				}
			} else {
				b.WriteRune(r)
			}
		}
		i += size
	}
	return b.String()
}
