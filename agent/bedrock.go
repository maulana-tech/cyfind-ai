package agent

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"iter"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/maulana-tech/aera/llm"
	"github.com/aws/smithy-go/eventstream"
)

// bedrockProvider implements llm.Provider via the AWS Bedrock Converse API
// with Bearer token (API key) authentication — no SigV4 signing.
type bedrockProvider struct {
	client  *http.Client
	region  string
	apiKey  string
	modelID string
}

func newBedrockProvider(region, apiKey, model string, cfg Config) (llm.Provider, error) {
	client, err := quotaAwareHTTPClient(cfg.Proxy, cfg.SessionHeaderKey)
	if err != nil {
		return nil, err
	}
	if region == "" {
		region = "ap-southeast-2"
	}
	return &bedrockProvider{
		client:  client,
		region:  region,
		apiKey:  apiKey,
		modelID: model,
	}, nil
}

func (p *bedrockProvider) endpoint(action string) string {
	return fmt.Sprintf("https://bedrock-runtime.%s.amazonaws.com/model/%s/%s",
		p.region, url.PathEscape(p.modelID), action)
}

// ── Converse API request types ──────────────────────────────────────────────

type converseRequest struct {
	Messages        []converseMessage     `json:"messages"`
	System          []converseSystemBlock `json:"system,omitempty"`
	InferenceConfig *converseInference    `json:"inferenceConfig,omitempty"`
	ToolConfig      *converseToolConfig   `json:"toolConfig,omitempty"`
}

type converseMessage struct {
	Role    string               `json:"role"`
	Content []converseContentBlk `json:"content"`
}

type converseContentBlk struct {
	Text       string              `json:"text,omitempty"`
	ToolUse    *converseToolUse    `json:"toolUse,omitempty"`
	ToolResult *converseToolResult `json:"toolResult,omitempty"`
}

type converseToolUse struct {
	ToolUseID string          `json:"toolUseId"`
	Name      string          `json:"name"`
	Input     json.RawMessage `json:"input"`
}

type converseToolResult struct {
	ToolUseID string               `json:"toolUseId"`
	Content   []converseContentBlk `json:"content"`
	Status    string               `json:"status,omitempty"`
}

type converseSystemBlock struct {
	Text string `json:"text"`
}

type converseInference struct {
	MaxTokens     int      `json:"maxTokens,omitempty"`
	Temperature   *float64 `json:"temperature,omitempty"`
	StopSequences []string `json:"stopSequences,omitempty"`
}

type converseToolConfig struct {
	Tools []converseToolDef `json:"tools"`
}

type converseToolDef struct {
	ToolSpec converseToolSpec `json:"toolSpec"`
}

type converseToolSpec struct {
	Name        string         `json:"name"`
	Description string         `json:"description"`
	InputSchema converseSchema `json:"inputSchema"`
}

type converseSchema struct {
	JSON map[string]any `json:"json"`
}

// ── Converse API response types ─────────────────────────────────────────────

type converseResponse struct {
	Output     converseOutput `json:"output"`
	StopReason string         `json:"stopReason"`
	Usage      converseUsage  `json:"usage"`
}

type converseOutput struct {
	Message converseMessage `json:"message"`
}

type converseUsage struct {
	InputTokens  int `json:"inputTokens"`
	OutputTokens int `json:"outputTokens"`
}

// ── Request building ────────────────────────────────────────────────────────

func (p *bedrockProvider) buildRequest(req llm.CompletionRequest) converseRequest {
	cr := converseRequest{}

	if joined := joinBedrockSystem(req.System); joined != "" {
		cr.System = []converseSystemBlock{{Text: joined}}
	}

	for _, m := range req.Messages {
		cm := converseMessage{Role: string(m.Role)}
		for _, b := range m.Content {
			switch b.Type {
			case llm.BlockText:
				if b.Text != "" {
					cm.Content = append(cm.Content, converseContentBlk{Text: b.Text})
				}
			case llm.BlockToolUse:
				inp := b.Input
				if len(inp) == 0 {
					inp = json.RawMessage("{}")
				}
				cm.Content = append(cm.Content, converseContentBlk{
					ToolUse: &converseToolUse{
						ToolUseID: b.ID,
						Name:      b.Name,
						Input:     inp,
					},
				})
			case llm.BlockToolResult:
				var trContent []converseContentBlk
				for _, sub := range b.Content {
					if sub.Type == llm.BlockText && sub.Text != "" {
						trContent = append(trContent, converseContentBlk{Text: sub.Text})
					}
				}
				if len(trContent) == 0 {
					trContent = []converseContentBlk{{Text: "(empty)"}}
				}
				status := "success"
				if b.IsError {
					status = "error"
				}
				cm.Content = append(cm.Content, converseContentBlk{
					ToolResult: &converseToolResult{
						ToolUseID: b.ToolUseID,
						Content:   trContent,
						Status:    status,
					},
				})
			case llm.BlockThinking:
				// Non-Anthropic models on Bedrock do not support thinking blocks.
			}
		}
		if len(cm.Content) > 0 {
			cr.Messages = append(cr.Messages, cm)
		}
	}

	maxTok := req.MaxTokens
	if maxTok == 0 {
		maxTok = 8192
	}
	cr.InferenceConfig = &converseInference{
		MaxTokens:   maxTok,
		Temperature: req.Temperature,
	}
	if len(req.Stop) > 0 {
		cr.InferenceConfig.StopSequences = req.Stop
	}

	if len(req.Tools) > 0 {
		tc := &converseToolConfig{}
		for _, t := range req.Tools {
			tc.Tools = append(tc.Tools, converseToolDef{
				ToolSpec: converseToolSpec{
					Name:        t.Name,
					Description: t.Description,
					InputSchema: converseSchema{JSON: t.InputSchema},
				},
			})
		}
		cr.ToolConfig = tc
	}

	return cr
}

func joinBedrockSystem(segs []string) string {
	var parts []string
	for _, s := range segs {
		if s = strings.TrimSpace(s); s != "" {
			parts = append(parts, s)
		}
	}
	return strings.Join(parts, "\n\n")
}

// ── Complete (non-streaming) ────────────────────────────────────────────────

func (p *bedrockProvider) Complete(ctx context.Context, req llm.CompletionRequest) (llm.Message, string, llm.Usage, error) {
	body, err := json.Marshal(p.buildRequest(req))
	if err != nil {
		return llm.Message{}, "", llm.Usage{}, fmt.Errorf("bedrock: marshal: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, "POST", p.endpoint("converse"), bytes.NewReader(body))
	if err != nil {
		return llm.Message{}, "", llm.Usage{}, err
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+p.apiKey)

	resp, err := p.client.Do(httpReq)
	if err != nil {
		return llm.Message{}, "", llm.Usage{}, fmt.Errorf("bedrock: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return llm.Message{}, "", llm.Usage{}, fmt.Errorf("bedrock: read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		clip := string(respBody)
		if len(clip) > 500 {
			clip = clip[:500]
		}
		return llm.Message{}, "", llm.Usage{}, fmt.Errorf("bedrock: HTTP %d: %s", resp.StatusCode, clip)
	}

	return parseConverseResponse(respBody)
}

func parseConverseResponse(raw []byte) (llm.Message, string, llm.Usage, error) {
	var r converseResponse
	if err := json.Unmarshal(raw, &r); err != nil {
		clip := string(raw)
		if len(clip) > 500 {
			clip = clip[:500]
		}
		return llm.Message{}, "", llm.Usage{}, fmt.Errorf("bedrock: decode: %w (body: %s)", err, clip)
	}

	var blocks []llm.ContentBlock
	for _, b := range r.Output.Message.Content {
		if b.Text != "" {
			blocks = append(blocks, llm.TextBlock(b.Text))
		}
		if b.ToolUse != nil {
			inp := b.ToolUse.Input
			if len(inp) == 0 {
				inp = json.RawMessage("{}")
			}
			blocks = append(blocks, llm.ContentBlock{
				Type:  llm.BlockToolUse,
				ID:    b.ToolUse.ToolUseID,
				Name:  b.ToolUse.Name,
				Input: inp,
			})
		}
	}

	usage := llm.Usage{
		InputTokens:  r.Usage.InputTokens,
		OutputTokens: r.Usage.OutputTokens,
	}

	return llm.Message{Role: llm.RoleAssistant, Content: blocks}, r.StopReason, usage, nil
}

// ── Stream ──────────────────────────────────────────────────────────────────

func (p *bedrockProvider) Stream(ctx context.Context, req llm.CompletionRequest) iter.Seq2[llm.StreamEvent, error] {
	return func(yield func(llm.StreamEvent, error) bool) {
		body, err := json.Marshal(p.buildRequest(req))
		if err != nil {
			yield(llm.StreamEvent{}, fmt.Errorf("bedrock: marshal: %w", err))
			return
		}

		httpReq, err := http.NewRequestWithContext(ctx, "POST", p.endpoint("converse-stream"), bytes.NewReader(body))
		if err != nil {
			yield(llm.StreamEvent{}, err)
			return
		}
		httpReq.Header.Set("Content-Type", "application/json")
		httpReq.Header.Set("Accept", "application/vnd.amazon.eventstream")
		httpReq.Header.Set("Authorization", "Bearer "+p.apiKey)

		resp, err := p.client.Do(httpReq)
		if err != nil {
			yield(llm.StreamEvent{}, fmt.Errorf("bedrock: %w", err))
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			errBody, _ := io.ReadAll(resp.Body)
			clip := string(errBody)
			if len(clip) > 500 {
				clip = clip[:500]
			}
			yield(llm.StreamEvent{}, fmt.Errorf("bedrock: HTTP %d: %s", resp.StatusCode, clip))
			return
		}

		decoder := eventstream.NewDecoder()
		var stopReason string
		var payloadBuf []byte

		for {
			msg, err := decoder.Decode(resp.Body, payloadBuf)
			if err != nil {
				if err == io.EOF {
					break
				}
				yield(llm.StreamEvent{}, fmt.Errorf("bedrock stream: %w", err))
				return
			}

			msgType := esHeaderString(msg.Headers, ":message-type")
			if msgType == "exception" {
				exType := esHeaderString(msg.Headers, ":exception-type")
				yield(llm.StreamEvent{}, fmt.Errorf("bedrock: %s: %s", exType, string(msg.Payload)))
				return
			}

			evType := esHeaderString(msg.Headers, ":event-type")
			events := parseConverseStreamEvent(evType, msg.Payload, &stopReason)
			for _, ev := range events {
				if !yield(ev, nil) {
					return
				}
			}
		}
	}
}

func esHeaderString(headers eventstream.Headers, name string) string {
	v := headers.Get(name)
	if v == nil {
		return ""
	}
	if sv, ok := v.(eventstream.StringValue); ok {
		return string(sv)
	}
	return fmt.Sprintf("%v", v)
}

func parseConverseStreamEvent(evType string, payload []byte, stopReason *string) []llm.StreamEvent {
	switch evType {
	case "messageStart":
		return []llm.StreamEvent{{Type: llm.SEMessageStart}}

	case "contentBlockStart":
		var e struct {
			Start struct {
				ToolUse *struct {
					ToolUseID string `json:"toolUseId"`
					Name      string `json:"name"`
				} `json:"toolUse"`
			} `json:"start"`
		}
		if json.Unmarshal(payload, &e) == nil && e.Start.ToolUse != nil {
			return []llm.StreamEvent{{
				Type:     llm.SEToolUseStart,
				ToolID:   e.Start.ToolUse.ToolUseID,
				ToolName: e.Start.ToolUse.Name,
			}}
		}

	case "contentBlockDelta":
		var e struct {
			Delta struct {
				Text    string `json:"text"`
				ToolUse *struct {
					Input string `json:"input"`
				} `json:"toolUse"`
			} `json:"delta"`
		}
		if json.Unmarshal(payload, &e) != nil {
			return nil
		}
		if e.Delta.Text != "" {
			return []llm.StreamEvent{{Type: llm.SETextDelta, Text: e.Delta.Text}}
		}
		if e.Delta.ToolUse != nil && e.Delta.ToolUse.Input != "" {
			return []llm.StreamEvent{{Type: llm.SEToolInputJSON, Text: e.Delta.ToolUse.Input}}
		}

	case "messageStop":
		var e struct {
			StopReason string `json:"stopReason"`
		}
		if json.Unmarshal(payload, &e) == nil {
			*stopReason = e.StopReason
		}

	case "metadata":
		var e struct {
			Usage struct {
				InputTokens  int `json:"inputTokens"`
				OutputTokens int `json:"outputTokens"`
			} `json:"usage"`
		}
		if json.Unmarshal(payload, &e) != nil {
			return nil
		}
		return []llm.StreamEvent{
			{
				Type:       llm.SEMessageDelta,
				StopReason: *stopReason,
				Usage:      llm.Usage{InputTokens: e.Usage.InputTokens, OutputTokens: e.Usage.OutputTokens},
			},
			{Type: llm.SEMessageStop},
		}
	}
	return nil
}

// bedrockRegionFromEnv returns the Bedrock region from environment variables.
func bedrockRegionFromEnv() string {
	if r := os.Getenv("BEDROCK_REGION"); r != "" {
		return r
	}
	if r := os.Getenv("AWS_REGION"); r != "" {
		return r
	}
	if r := os.Getenv("AWS_DEFAULT_REGION"); r != "" {
		return r
	}
	return "ap-southeast-2"
}
