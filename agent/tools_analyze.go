package agent

import (
	"context"
	"encoding/json"
	"regexp"
	"strings"

	actool "github.com/maulana-tech/aera/tool"
)

func responseAnalyzeTool() actool.CoreTool {
	return readTool("response_analyze",
		"Analyze an HTTP response body and headers for common vulnerability indicators. "+
			"Returns a structured report of detected patterns: error messages (SQL, stack traces, debug info), "+
			"reflected input markers, security header issues, information leakage, and technology fingerprints. "+
			"Use this after http_request to quickly triage a response instead of parsing it manually.",
		obj(map[string]any{
			"body":        str("The HTTP response body to analyze"),
			"headers":     map[string]any{"type": "object", "description": "Response headers as key-value pairs", "additionalProperties": map[string]any{"type": "string"}},
			"status_code": intp("HTTP status code"),
			"probe":       str("Optional: a probe string you injected (e.g. '\"><script>alert(1)</script>') — if found reflected in the body, it is flagged"),
		}, "body"),
		func(_ context.Context, raw json.RawMessage) (actool.Result, error) {
			var in struct {
				Body       string            `json:"body"`
				Headers    map[string]string `json:"headers"`
				StatusCode int               `json:"status_code"`
				Probe      string            `json:"probe"`
			}
			if err := json.Unmarshal(raw, &in); err != nil {
				return actool.Errorf("invalid input: " + err.Error()), nil
			}

			r := analyzeResponse(in.Body, in.Headers, in.StatusCode, in.Probe)
			b, _ := json.Marshal(r)
			return actool.Text(string(b)), nil
		})
}

type analysisReport struct {
	SQLErrors       []string `json:"sql_errors,omitempty"`
	StackTraces     []string `json:"stack_traces,omitempty"`
	DebugInfo       []string `json:"debug_info,omitempty"`
	Reflection      []string `json:"reflection,omitempty"`
	InfoLeakage     []string `json:"info_leakage,omitempty"`
	SecurityHeaders []string `json:"security_headers,omitempty"`
	Technologies    []string `json:"technologies,omitempty"`
	Interesting     []string `json:"interesting,omitempty"`
}

var (
	sqlErrorPatterns = []struct {
		re    *regexp.Regexp
		label string
	}{
		{regexp.MustCompile(`(?i)(?:mysql_|mysqli_|pg_|sqlite_|ORA-\d{5}|SQL syntax|Unclosed quotation|SQLSTATE\[)`), "SQL error message"},
		{regexp.MustCompile(`(?i)you have an error in your SQL`), "MySQL syntax error"},
		{regexp.MustCompile(`(?i)Warning:.*\bmysql`), "PHP MySQL warning"},
		{regexp.MustCompile(`(?i)PostgreSQL.*ERROR`), "PostgreSQL error"},
		{regexp.MustCompile(`(?i)Microsoft.*ODBC.*SQL`), "MSSQL ODBC error"},
		{regexp.MustCompile(`(?i)SQLite.*error`), "SQLite error"},
		{regexp.MustCompile(`(?i)Unclosed quotation mark`), "MSSQL unclosed quote"},
	}

	stackTracePatterns = []struct {
		re    *regexp.Regexp
		label string
	}{
		{regexp.MustCompile(`(?:at .+\(.+:\d+:\d+\))`), "JavaScript stack trace"},
		{regexp.MustCompile(`Traceback \(most recent call last\)`), "Python traceback"},
		{regexp.MustCompile(`(?:java\.\w+\.[\w.]+Exception)`), "Java exception"},
		{regexp.MustCompile(`(?:Fatal error:.*in .+ on line \d+)`), "PHP fatal error"},
		{regexp.MustCompile(`(?:goroutine \d+ \[)`), "Go goroutine dump"},
		{regexp.MustCompile(`(?:#\d+ .+\.rb:\d+)`), "Ruby stack trace"},
		{regexp.MustCompile(`(?:Microsoft\.AspNetCore|System\.Web)`), ".NET stack trace"},
	}

	infoLeakPatterns = []struct {
		re    *regexp.Regexp
		label string
	}{
		{regexp.MustCompile(`(?i)(?:internal server error|debug mode|DJANGO_SETTINGS_MODULE)`), "debug/internal info"},
		{regexp.MustCompile(`(?i)\b(?:root|admin|password|passwd|secret|api[_-]?key|access[_-]?token)\b\s*[:=]\s*\S`), "potential credential leak"},
		{regexp.MustCompile(`(?:\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b)`), "internal IP address"},
		{regexp.MustCompile(`(?i)(?:\/(?:home|var|usr|etc|opt|tmp)\/[\w/.-]+)`), "server path disclosure"},
		{regexp.MustCompile(`(?i)(?:phpinfo\(\)|<title>phpinfo)`), "phpinfo() exposed"},
		{regexp.MustCompile(`(?i)(?:directory listing|index of /)`), "directory listing"},
	}

	techPatterns = []struct {
		re    *regexp.Regexp
		label string
	}{
		{regexp.MustCompile(`(?i)(?:X-Powered-By|Server):\s*(.+)`), ""},
		{regexp.MustCompile(`(?i)<meta[^>]*generator[^>]*content="([^"]+)"`), "CMS: $1"},
		{regexp.MustCompile(`(?i)(?:wp-content|wp-includes)`), "WordPress"},
		{regexp.MustCompile(`(?i)(?:laravel_session|XSRF-TOKEN.*laravel)`), "Laravel"},
		{regexp.MustCompile(`(?i)express`), "Express.js"},
		{regexp.MustCompile(`(?i)(?:django|csrfmiddlewaretoken)`), "Django"},
		{regexp.MustCompile(`(?i)(?:ASP\.NET|__VIEWSTATE)`), "ASP.NET"},
		{regexp.MustCompile(`(?i)(?:next\.js|__NEXT_DATA__)`), "Next.js"},
	}
)

func analyzeResponse(body string, headers map[string]string, statusCode int, probe string) analysisReport {
	var r analysisReport

	for _, p := range sqlErrorPatterns {
		if p.re.MatchString(body) {
			r.SQLErrors = append(r.SQLErrors, p.label)
		}
	}

	for _, p := range stackTracePatterns {
		if p.re.MatchString(body) {
			r.StackTraces = append(r.StackTraces, p.label)
		}
	}

	for _, p := range infoLeakPatterns {
		if p.re.MatchString(body) {
			r.InfoLeakage = append(r.InfoLeakage, p.label)
		}
	}

	for _, p := range techPatterns {
		if p.re.MatchString(body) {
			label := p.label
			if label == "" {
				m := p.re.FindStringSubmatch(body)
				if len(m) > 1 {
					label = strings.TrimSpace(m[1])
				}
			}
			if label != "" {
				r.Technologies = appendUnique(r.Technologies, label)
			}
		}
	}

	if probe != "" && strings.Contains(body, probe) {
		r.Reflection = append(r.Reflection, "probe string reflected verbatim in response body")
		if strings.Contains(strings.ToLower(body), "<script") && strings.Contains(body, probe) {
			r.Reflection = append(r.Reflection, "probe appears near script context — possible XSS")
		}
	}

	secHeaders := map[string]string{
		"Content-Security-Policy":   "CSP",
		"X-Content-Type-Options":    "X-Content-Type-Options",
		"X-Frame-Options":           "X-Frame-Options",
		"Strict-Transport-Security": "HSTS",
		"X-XSS-Protection":          "X-XSS-Protection",
	}
	normalizedHeaders := make(map[string]string, len(headers))
	for k, v := range headers {
		normalizedHeaders[strings.ToLower(k)] = v
	}
	for header, label := range secHeaders {
		if _, ok := normalizedHeaders[strings.ToLower(header)]; !ok {
			r.SecurityHeaders = append(r.SecurityHeaders, "missing: "+label)
		}
	}

	if v, ok := normalizedHeaders["server"]; ok {
		r.Technologies = appendUnique(r.Technologies, "Server: "+v)
	}
	if v, ok := normalizedHeaders["x-powered-by"]; ok {
		r.Technologies = appendUnique(r.Technologies, "X-Powered-By: "+v)
	}

	if v, ok := normalizedHeaders["set-cookie"]; ok {
		lower := strings.ToLower(v)
		if !strings.Contains(lower, "httponly") {
			r.SecurityHeaders = append(r.SecurityHeaders, "cookie missing HttpOnly flag")
		}
		if !strings.Contains(lower, "secure") {
			r.SecurityHeaders = append(r.SecurityHeaders, "cookie missing Secure flag")
		}
	}

	if statusCode == 403 {
		r.Interesting = append(r.Interesting, "403 Forbidden — endpoint exists but access denied (try bypass)")
	}
	if statusCode == 500 {
		r.Interesting = append(r.Interesting, "500 Internal Server Error — may indicate injection or unhandled input")
	}
	if statusCode == 302 || statusCode == 301 {
		if loc, ok := normalizedHeaders["location"]; ok {
			r.Interesting = append(r.Interesting, "redirect to: "+loc)
		}
	}

	if strings.Contains(strings.ToLower(body), "access-control-allow-origin: *") ||
		normalizedHeaders["access-control-allow-origin"] == "*" {
		r.SecurityHeaders = append(r.SecurityHeaders, "CORS: wildcard Access-Control-Allow-Origin")
	}

	return r
}

func appendUnique(slice []string, val string) []string {
	for _, s := range slice {
		if s == val {
			return slice
		}
	}
	return append(slice, val)
}
