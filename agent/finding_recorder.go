package agent

import (
	"context"

	"github.com/Autumn-27/cyfind/db"
)

// FindingRecorder is injected by the host; agents never synthesize or copy
// evidence bodies themselves. Its implementation owns the atomic write.
type FindingRecorder interface {
	Record(context.Context, db.RecordFindingInput, []db.TrafficRef) (*db.RecordedFinding, error)
}

// Tool-use guidance is appended without replacing the user's editable prompt.
// It does not require capture or claim that unavailable traffic tools exist.
const findingTrafficGuidance = "\n\n**Finding traffic evidence (optional)**: when reporting a finding with report_finding, if you have HTTP request/response that you have viewed and confirmed supports the finding's conclusion, you may bind the real IDs in reproduction order with traffic_refs; domain and time are only for candidate filtering and do not imply an association. For non-HTTP findings such as TCP, or when nothing was captured or there is no exact match, omit or pass [], keep other verifiable evidence such as command output and logs in evidence, and it is advisable to explain why it is unbound. Do not guess IDs, and do not re-probe just to capture traffic."

func (t *ToolSet) SetFindingRecorder(r FindingRecorder)   { t.findingRecorder = r }
func (w *Worker) SetFindingRecorder(r FindingRecorder)    { w.findingRecorder = r }
func (p *Planner) SetFindingRecorder(r FindingRecorder)   { p.findingRecorder = r }
func (m *MainAgent) SetFindingRecorder(r FindingRecorder) { m.findingRecorder = r }
