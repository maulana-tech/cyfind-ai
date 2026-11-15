package agent

import (
	"context"
	"encoding/json"
	"sync"
	"time"

	"github.com/google/uuid"
	actool "github.com/maulana-tech/aera/tool"
)

// OASTCallback records one HTTP request that hit a webhook endpoint.
type OASTCallback struct {
	Time    time.Time         `json:"time"`
	Method  string            `json:"method"`
	Path    string            `json:"path"`
	Headers map[string]string `json:"headers"`
	Body    string            `json:"body"`
	From    string            `json:"from"`
}

// OASTStore holds active webhook tokens and their received callbacks.
// Shared across all workers; the server registers incoming requests.
type OASTStore struct {
	mu      sync.Mutex
	tokens  map[string]*oastEntry
	baseURL string
}

type oastEntry struct {
	Label     string         `json:"label"`
	Created   time.Time      `json:"created"`
	Callbacks []OASTCallback `json:"callbacks"`
}

// NewOASTStore creates a callback store. baseURL is the externally reachable
// CYFIND URL (e.g. "http://192.168.1.10:8787") used to build webhook URLs.
func NewOASTStore(baseURL string) *OASTStore {
	return &OASTStore{tokens: make(map[string]*oastEntry), baseURL: baseURL}
}

// SetBaseURL updates the externally reachable URL prefix used to build callback URLs.
func (s *OASTStore) SetBaseURL(u string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.baseURL = u
}

// Register creates a new token and returns its callback URL.
func (s *OASTStore) Register(label string) (token, callbackURL string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	token = uuid.New().String()[:12]
	s.tokens[token] = &oastEntry{Label: label, Created: time.Now()}
	callbackURL = s.baseURL + "/oast/" + token
	return
}

// RecordCallback stores an incoming request for a token. Returns false if unknown.
func (s *OASTStore) RecordCallback(token string, cb OASTCallback) bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	e, ok := s.tokens[token]
	if !ok {
		return false
	}
	if len(e.Callbacks) < 100 {
		e.Callbacks = append(e.Callbacks, cb)
	}
	return true
}

// Check returns the callbacks received for a token.
func (s *OASTStore) Check(token string) ([]OASTCallback, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	e, ok := s.tokens[token]
	if !ok {
		return nil, false
	}
	return e.Callbacks, true
}

// Cleanup removes tokens older than maxAge.
func (s *OASTStore) Cleanup(maxAge time.Duration) {
	s.mu.Lock()
	defer s.mu.Unlock()
	cutoff := time.Now().Add(-maxAge)
	for k, v := range s.tokens {
		if v.Created.Before(cutoff) {
			delete(s.tokens, k)
		}
	}
}

// WebhookTools returns the webhook_create and webhook_check tools.
func WebhookTools(store *OASTStore) []actool.CoreTool {
	if store == nil {
		return nil
	}
	return []actool.CoreTool{
		webhookCreate(store),
		webhookCheck(store),
	}
}

func webhookCreate(store *OASTStore) actool.CoreTool {
	return writeTool("webhook_create",
		"Create a unique out-of-band (OOB) callback URL for blind vulnerability testing. "+
			"Inject this URL into payloads (blind XSS, blind SSRF, blind XXE, etc.) and later check "+
			"webhook_check to see if the target made a request to it. Each call returns a fresh unique URL.",
		obj(map[string]any{
			"label": str("Short label describing the test (e.g. 'blind-xss-login-form', 'ssrf-redirect')"),
		}, "label"),
		func(_ context.Context, raw json.RawMessage) (actool.Result, error) {
			var in struct {
				Label string `json:"label"`
			}
			if err := json.Unmarshal(raw, &in); err != nil {
				return actool.Errorf("invalid input: " + err.Error()), nil
			}
			token, callbackURL := store.Register(in.Label)
			out := map[string]string{
				"token":        token,
				"callback_url": callbackURL,
				"hint":         "Inject this URL in payloads. Use webhook_check with this token to see if any requests arrived.",
			}
			b, _ := json.Marshal(out)
			return actool.Text(string(b)), nil
		})
}

func webhookCheck(store *OASTStore) actool.CoreTool {
	return readTool("webhook_check",
		"Check if a webhook URL received any callbacks. Returns all HTTP requests that hit the "+
			"webhook endpoint since creation. Use after injecting the webhook URL from webhook_create.",
		obj(map[string]any{
			"token": str("The webhook token returned by webhook_create"),
		}, "token"),
		func(_ context.Context, raw json.RawMessage) (actool.Result, error) {
			var in struct {
				Token string `json:"token"`
			}
			if err := json.Unmarshal(raw, &in); err != nil {
				return actool.Errorf("invalid input: " + err.Error()), nil
			}
			callbacks, ok := store.Check(in.Token)
			if !ok {
				return actool.Errorf("unknown token: " + in.Token), nil
			}
			out := map[string]any{
				"token":          in.Token,
				"callback_count": len(callbacks),
				"callbacks":      callbacks,
			}
			if len(callbacks) == 0 {
				out["status"] = "no callbacks received yet"
			} else {
				out["status"] = "callbacks received — the target made outbound requests to this URL"
			}
			b, _ := json.Marshal(out)
			return actool.Text(string(b)), nil
		})
}
