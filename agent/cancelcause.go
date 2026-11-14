package agent

import (
	"context"
	"errors"
	"fmt"
)

// AbortCause names why an agent run's context was cancelled. Every cancellation
// site should attach one so the activity trace can report the real initiator.
type AbortCause struct {
	Code  string
	Short string
	Text  string
}

func (c *AbortCause) Error() string { return c.Text }

func cause(code, short, text string) *AbortCause {
	return &AbortCause{Code: code, Short: short, Text: text}
}

// Causef builds a cause that includes runtime-specific detail.
func Causef(code, short, format string, args ...any) *AbortCause {
	return &AbortCause{Code: code, Short: short, Text: fmt.Sprintf(format, args...)}
}

var (
	// Task-level execution context.
	AbortPausedByUser = cause("paused_by_user", "the user paused the task",
		"The user paused the task via the task control interface (POST /api/tasks/{id}/control, action=pause). This Planner/Worker run was actively cancelled; a running intent returns to the frontier (open) and, after the task resumes, is re-claimed and executed from the start")
	AbortPausedByOrchestrator = cause("paused_by_orchestrator", "the orchestration Agent paused the task",
		"The orchestration Agent called the pause_task tool to pause this task. This Planner/Worker run was actively cancelled; a running intent returns to the frontier (open) and is re-executed after resume")
	AbortTaskDeleted = cause("task_deleted", "the task was deleted",
		"The task is being deleted (DELETE /api/tasks/{id}), and the deletion barrier cancelled the task's running Planner, Worker, and main Agent; this run's result will no longer be used")
	AbortPausedOnReload = cause("paused_on_reload", "the backend restored the task's paused state",
		"At startup the backend restored the task's paused state from the state persisted in the database. This run was cancelled; normally there is no running Agent during the recovery phase")
	AbortGoalMet = cause("goal_met", "the planner judged the task goals achieved",
		"The planner judged the task goals achieved and set the task to done, then cancelled still-running Workers; these intents are marked stopped rather than failed")
	AbortSettleDrainTimeout = cause("settle_drain_timeout", "the wait for task-timeout wrap-up is used up",
		"After the task reached its timeout, it waited for running Workers to wrap up gracefully, but the 90-second drain grace was still not enough, so a hard cancel was performed; the intent is marked exhausted, and facts and assets already written during wrap-up are kept")

	// Per-work context.
	AbortKilledByPlanner = cause("killed_by_planner", "the planner terminated this intent",
		"The planner called kill_work to actively terminate this intent, usually meaning the direction drifted or has no further value; the intent is marked stopped and is not re-claimed automatically")
	AbortWorkPausedByUser = cause("work_paused_by_user", "the user paused this Worker intent",
		"The user paused a running Worker. This call was cancelled and the intent became paused; the already-registered intent, facts, findings, and activity records are all kept, and it re-executes from the start after resume")
	AbortWorkCancelledByUser = cause("work_cancelled_by_user", "the user deleted this Worker intent",
		"The user deleted a running Worker. This call was cancelled; after the Worker exits the write region, the server handles the intent per the user's chosen deletion mode — a soft delete only marks it deleted and keeps all output, while a hard delete cascades to remove the intent and the downstream nodes supported only by it")
	AbortWorkFinished = cause("work_finished", "the Worker finished normally and released its context",
		"The Worker finished normally, and the engine releases its context resources in detachWork. This is not a run interruption; if it appears in an interruption message, a cancel and a settle event raced")
	AbortPausedRaceGuard = cause("paused_race_guard", "a new run was refused while the task is paused",
		"While the task is paused, the engine refuses to issue a new execution context, to prevent a race between claim and pause from letting a Worker start anyway; an already-claimed intent returns to the frontier")

	// Main Agent and standalone conversation contexts.
	AbortChatStoppedByUser = cause("chat_stopped_by_user", "the user stopped this conversation turn",
		"The user clicked stop, actively aborting this run of the main Agent or chat Agent. The activity records already produced are kept, and the next message can still be sent")
	AbortChatPausedWithTask = cause("chat_paused_with_task", "pausing the task also aborted the main-Agent conversation",
		"When the user paused the task, the running main-Agent conversation was cancelled along with it. The activity records already produced are kept; the turn's message is not replayed automatically after the task resumes")
	AbortChatTurnFinished = cause("chat_turn_finished", "this conversation turn finished normally and released its context",
		"This conversation turn finished normally, and the server is releasing its context resources. This is not a run interruption; if it appears in an interruption message, a cancel and a settle event raced")

	// Process-level and per-run hard backstop.
	AbortShutdown = cause("shutdown", "the backend process is shutting down",
		"The backend process received SIGINT or SIGTERM and is restarting, updating, or shutting down. All running Agents are cancelled; after a restart, leftover running intents are reset to open and re-executed")
	AbortRunHardTimeout = cause("run_hard_timeout", "the single-run hard-timeout backstop fired",
		"A single run exceeded the soft wall-clock budget plus extra grace, meaning a model request or some tool did not return for a long time, so the normal round-boundary wrap-up could not run. Focus on the last tool call before the interruption that did not return")
)

// AbortReason resolves the named cause attached to a cancelled run context.
func AbortReason(ctx context.Context) (code, short, text string, ok bool) {
	c := context.Cause(ctx)
	if c == nil {
		return "", "", "", false
	}
	var ac *AbortCause
	if errors.As(c, &ac) {
		return ac.Code, ac.Short, ac.Text, true
	}
	switch {
	case errors.Is(c, context.DeadlineExceeded):
		return "deadline_exceeded", "the upstream context reached its deadline",
			"The upstream context reached its deadline, but the setter did not attach a named cause via WithTimeoutCause: " + c.Error(), true
	case errors.Is(c, context.Canceled):
		return "canceled_no_cause", "the canceller attached no named cause",
			"The upstream context was cancelled, but the canceller did not attach a named cause via context.WithCancelCause; register a cause in agent/cancelcause.go and wire it into that cancellation point", true
	default:
		return "other", firstLine(c.Error(), 80), c.Error(), true
	}
}
