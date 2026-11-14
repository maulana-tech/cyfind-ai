package agent

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"io"
	"net/http"
	"net/http/cookiejar"
	"strings"
	"sync"
	"time"

	actool "github.com/Autumn-27/norma/tool"
)

// httpSession is a per-worker HTTP client with a persistent cookie jar.
// Created lazily on first http_request call and reused for the worker's lifetime.
type httpSession struct {
	mu     sync.Mutex
	client *http.Client
}

func newHTTPSession() *httpSession { return &httpSession{} }

func (s *httpSession) getClient() *http.Client {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.client != nil {
		return s.client
	}
	jar, _ := cookiejar.New(nil)
	s.client = &http.Client{
		Jar:     jar,
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}
	return s.client
}

func (s *httpSession) httpRequestTool() actool.CoreTool {
	return writeTool("http_request",
		"Send an HTTP request with a persistent cookie jar (cookies carry across calls within this worker run). "+
			"Use this for authenticated flows, API testing, and any multi-step HTTP interaction. "+
			"The cookie jar automatically stores Set-Cookie responses and resends them on subsequent requests to the same domain.",
		obj(map[string]any{
			"method":           str("HTTP method: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD"),
			"url":              str("The absolute URL to request"),
			"headers":          map[string]any{"type": "object", "description": "Custom request headers as key-value pairs", "additionalProperties": map[string]any{"type": "string"}},
			"body":             str("Request body (for POST/PUT/PATCH). Send raw string; set Content-Type header accordingly."),
			"follow_redirects": map[string]any{"type": "boolean", "description": "Follow HTTP redirects (default true)"},
			"timeout_seconds":  intp("Request timeout in seconds (default 30, max 120)"),
		}, "method", "url"),
		func(_ context.Context, raw json.RawMessage) (actool.Result, error) {
			var in struct {
				Method          string            `json:"method"`
				URL             string            `json:"url"`
				Headers         map[string]string `json:"headers"`
				Body            string            `json:"body"`
				FollowRedirects *bool             `json:"follow_redirects"`
				TimeoutSeconds  int               `json:"timeout_seconds"`
			}
			if err := json.Unmarshal(raw, &in); err != nil {
				return actool.Errorf("invalid input: " + err.Error()), nil
			}

			in.Method = strings.ToUpper(strings.TrimSpace(in.Method))
			if in.Method == "" {
				in.Method = "GET"
			}

			client := s.getClient()

			noRedirect := in.FollowRedirects != nil && !*in.FollowRedirects
			if noRedirect {
				client = &http.Client{
					Jar:       client.Jar,
					Timeout:   client.Timeout,
					Transport: client.Transport,
					CheckRedirect: func(*http.Request, []*http.Request) error {
						return http.ErrUseLastResponse
					},
				}
			}

			timeout := 30 * time.Second
			if in.TimeoutSeconds > 0 {
				if in.TimeoutSeconds > 120 {
					in.TimeoutSeconds = 120
				}
				timeout = time.Duration(in.TimeoutSeconds) * time.Second
			}
			client.Timeout = timeout

			var bodyReader io.Reader
			if in.Body != "" {
				bodyReader = strings.NewReader(in.Body)
			}

			req, err := http.NewRequest(in.Method, in.URL, bodyReader)
			if err != nil {
				return actool.Errorf("build request: " + err.Error()), nil
			}

			for k, v := range in.Headers {
				req.Header.Set(k, v)
			}

			resp, err := client.Do(req)
			if err != nil {
				return actool.Errorf("request failed: " + err.Error()), nil
			}
			defer resp.Body.Close()

			const maxBody = 200_000
			body, _ := io.ReadAll(io.LimitReader(resp.Body, maxBody+1))
			truncated := len(body) > maxBody
			if truncated {
				body = body[:maxBody]
			}

			respHeaders := make(map[string]string, len(resp.Header))
			for k := range resp.Header {
				respHeaders[k] = resp.Header.Get(k)
			}

			result := map[string]any{
				"status":      resp.StatusCode,
				"status_text": resp.Status,
				"headers":     respHeaders,
				"body":        string(body),
			}
			if truncated {
				result["truncated"] = true
			}

			u := req.URL
			if jar := client.Jar; jar != nil {
				cookies := jar.Cookies(u)
				if len(cookies) > 0 {
					cs := make([]map[string]string, len(cookies))
					for i, c := range cookies {
						cs[i] = map[string]string{"name": c.Name, "value": c.Value}
					}
					result["session_cookies"] = cs
				}
			}

			b, _ := json.Marshal(result)
			return actool.Text(string(b)), nil
		})
}

// ClearCookies resets the session's cookie jar (useful between targets).
func (s *httpSession) ClearCookies() {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.client != nil {
		jar, _ := cookiejar.New(nil)
		s.client.Jar = jar
	}
}

// httpSessionKey attaches an httpSession to a ToolSet. Lazily created on first use.
var httpSessions = struct {
	mu       sync.Mutex
	sessions map[*ToolSet]*httpSession
}{sessions: make(map[*ToolSet]*httpSession)}

func (t *ToolSet) httpSession() *httpSession {
	httpSessions.mu.Lock()
	defer httpSessions.mu.Unlock()
	if s, ok := httpSessions.sessions[t]; ok {
		return s
	}
	s := newHTTPSession()
	httpSessions.sessions[t] = s
	return s
}

// CleanupHTTPSession removes the HTTP session for this ToolSet. Call on worker exit.
func (t *ToolSet) CleanupHTTPSession() {
	httpSessions.mu.Lock()
	defer httpSessions.mu.Unlock()
	delete(httpSessions.sessions, t)
}

func (t *ToolSet) httpRequest() actool.CoreTool {
	return t.httpSession().httpRequestTool()
}

