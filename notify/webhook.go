package notify

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"text/template"
	"time"
)

// webhookChannel is the generic Webhook adapter: the user customizes the URL, method, request
// headers, and JSON template. Its existence means this feature need not write a separate
// implementation for Slack / Mattermost / Discord / a self-hosted system — those platforms can all
// be covered by one configurable template.
type webhookChannel struct{}

func (webhookChannel) Kind() string { return KindWebhook }

// A generic Webhook has no official limit, so returning 0 means no rate limit by default, to be
// customized by the user per the peer's capability.
func (webhookChannel) DefaultRatePerMin() int { return 0 }

// Mask url and headers: the target address itself often carries a token, and custom headers usually
// hold auth credentials, both of which appear in the interface echo, so both must be blocked.
// The cost is that when editing, if you want to change one header you must re-fill the whole header
// set (a masked value is interpreted as "keep the original") — this trade-off is deliberate: better
// to fill it in once more than to echo credentials to the browser.
func (webhookChannel) SecretKeys() []string { return []string{"url", "headers"} }

// The destination is url. When changing url you must re-state headers — otherwise the original
// Authorization header would be sent as-is to the new address, which is exactly the main path of a
// mask bypass.
func (webhookChannel) DestinationKeys() []string { return []string{"url"} }

// webhookDefaultTemplate is the fallback request body when no template is filled in: a plain JSON
// structure that covers the vast majority of "receive one JSON and store it" self-hosted receivers.
const webhookDefaultTemplate = `{
  "title": {{json .Title}},
  "batch": {{.Batch}},
  "count": {{.Count}},
  "items": [
{{- range $i, $it := .Items}}
{{- if $i}},{{end}}
    {
      "finding_id": {{$it.FindingID}},
      "name": {{json $it.Name}},
      "vulnclass": {{json $it.VulnClass}},
      "severity": {{json $it.Severity}},
      "summary": {{json $it.Summary}},
      "assets": {{json $it.Assets}},
      "detail_url": {{json $it.DetailURL}}
    }
{{- end}}
  ]
}`

// webhookTemplateData is the context exposed to the user template.
type webhookTemplateData struct {
	Title   string
	Batch   bool
	Count   int
	Items   []webhookItem
	HomeURL string
	// SentAt is this delivery's time (RFC3339), for the receiver to record.
	SentAt string
}

type webhookItem struct {
	FindingID     int64
	Name          string
	VulnClass     string
	Severity      string
	SeverityLabel string
	Summary       string
	Assets        []string
	DetailURL     string
	FromStatus    string
	ToStatus      string
	// StatusLabel is the readable description of a status change, such as "Pending → Fixed"; empty
	// for a non-status-change.
	StatusLabel string
}

func (webhookChannel) Validate(cfg map[string]any) error {
	raw := cfgString(cfg, "url")
	if raw == "" {
		return errors.New("missing target URL")
	}
	if err := validateHTTPURL(raw); err != nil {
		return fmt.Errorf("invalid target URL: %w", err)
	}
	if m := strings.ToUpper(cfgString(cfg, "method")); m != "" && m != http.MethodGet && m != http.MethodPost && m != http.MethodPut && m != http.MethodPatch {
		return fmt.Errorf("unsupported method %s (available: GET/POST/PUT/PATCH)", m)
	}
	if tpl := cfgString(cfg, "body_template"); tpl != "" {
		if _, err := parseWebhookTemplate(tpl); err != nil {
			return fmt.Errorf("request-body template syntax error: %w", err)
		}
	}
	return nil
}

func (c webhookChannel) Send(ctx context.Context, cfg map[string]any, m Message) (int, error) {
	if err := c.Validate(cfg); err != nil {
		return 0, Permanent(err)
	}
	method := strings.ToUpper(cfgString(cfg, "method"))
	if method == "" {
		method = http.MethodPost
	}

	// GET carries no request body: stuffing the content into the query exceeds the template's
	// capability and does not fit GET semantics, so GET is only suitable for a "hit = trigger a
	// hook" kind of receiver.
	var payload any
	if method != http.MethodGet {
		body, err := renderWebhookBody(cfgString(cfg, "body_template"), m)
		if err != nil {
			return 0, Permanent(err)
		}
		// The template renders a string-form JSON, which is converted to json.RawMessage and sent
		// as-is here, to avoid a second escaping wrapping the user's carefully crafted structure
		// inside a JSON string.
		if !json.Valid([]byte(body)) {
			return 0, Permanent(errors.New("the request-body template rendered a result that is not valid JSON"))
		}
		payload = json.RawMessage(body)
	}

	headers := cfgMap(cfg, "headers")
	if ct := cfgString(cfg, "content_type"); ct != "" {
		// Allow an override, but apply it after headers to guarantee the explicit config takes
		// priority.
		if headers == nil {
			headers = map[string]string{}
		}
		headers["Content-Type"] = ct
	}
	if _, err := doJSON(ctx, method, cfgString(cfg, "url"), headers, payload); err != nil {
		return 0, err
	}
	// A generic Webhook does not truncate the body (the receiver is the user's own service, and the
	// size is decided by body_template), so the whole batch counts as delivered.
	return len(m.Items), nil
}

// renderWebhookBody renders the request body with the user template (or the default template).
func renderWebhookBody(tpl string, m Message) (string, error) {
	if strings.TrimSpace(tpl) == "" {
		tpl = webhookDefaultTemplate
	}
	t, err := parseWebhookTemplate(tpl)
	if err != nil {
		return "", fmt.Errorf("request-body template syntax error: %w", err)
	}
	var buf bytes.Buffer
	if err := t.Execute(&buf, newWebhookTemplateData(m)); err != nil {
		return "", fmt.Errorf("failed to render the request-body template: %w", err)
	}
	return buf.String(), nil
}

// parseWebhookTemplate parses the template.
//
// missingkey=zero makes a missing map key render as the zero value rather than error — but this
// file's context is a struct, so its main effect is to keep range from erroring when .Items is
// empty. What really needs guarding against is .Items being nil.
func parseWebhookTemplate(tpl string) (*template.Template, error) {
	return template.New("body").Funcs(webhookTemplateFuncs).Option("missingkey=zero").Parse(tpl)
}

// webhookTemplateFuncs are the helper functions exposed to the template.
var webhookTemplateFuncs = template.FuncMap{
	// json serializes any value to JSON.
	//
	// This function is not a nice-to-have but a necessity: without it, the user can only write
	// {{.Title}} to interpolate directly, and as soon as the vulnerability title has a quote or
	// newline, the whole request body is no longer valid JSON — the receiver rejects it, and the
	// error message points at "JSON parse failure", with no way to associate it with a quote in the
	// title.
	"json": func(v any) (string, error) {
		raw, err := json.Marshal(v)
		if err != nil {
			return "", err
		}
		return string(raw), nil
	},
	// jsons is for embedding a JSON fragment inside another JSON string value (doing one layer of
	// string escaping).
	"jsons": func(v any) (string, error) {
		raw, err := json.Marshal(v)
		if err != nil {
			return "", err
		}
		quoted, err := json.Marshal(string(raw))
		if err != nil {
			return "", err
		}
		// Strip the outer quotes: the caller decides whether to add quotes.
		return string(quoted[1 : len(quoted)-1]), nil
	},
}

func newWebhookTemplateData(m Message) webhookTemplateData {
	d := webhookTemplateData{
		Title:   markdownTitle(m),
		Batch:   m.Batch,
		Count:   len(m.Items),
		HomeURL: m.HomeURL,
		SentAt:  time.Now().Format(time.RFC3339),
		Items:   make([]webhookItem, 0, len(m.Items)),
	}
	for _, it := range m.Items {
		wi := webhookItem{
			FindingID:     it.FindingID,
			Name:          it.Name,
			VulnClass:     it.VulnClass,
			Severity:      it.Severity,
			SeverityLabel: SeverityLabel(it.Severity),
			Summary:       it.Summary,
			Assets:        append([]string{}, it.Assets...),
			DetailURL:     it.DetailURL,
			FromStatus:    it.FromStatus,
			ToStatus:      it.ToStatus,
		}
		if it.IsStatusChange() {
			wi.StatusLabel = StatusLabel(it.FromStatus) + " → " + StatusLabel(it.ToStatus)
		}
		d.Items = append(d.Items, wi)
	}
	return d
}
