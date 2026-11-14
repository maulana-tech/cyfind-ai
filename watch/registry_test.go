package watch

import (
	"context"
	"sync"
	"testing"
	"time"
)

type fakeStore struct {
	mu         sync.Mutex
	active     []Watch
	detections []Detection
}

func (s *fakeStore) setActive(ws []Watch) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.active = ws
}
func (s *fakeStore) ListActiveWatches() ([]Watch, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	out := make([]Watch, len(s.active))
	copy(out, s.active)
	return out, nil
}
func (s *fakeStore) RecordDetection(d Detection) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.detections = append(s.detections, d)
	return nil
}
func (s *fakeStore) detCount() int {
	s.mu.Lock()
	defer s.mu.Unlock()
	return len(s.detections)
}

func TestRegistrySyncLifecycle(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	store := &fakeStore{}
	// long interval so watchers just idle (we test lifecycle, not detections)
	store.setActive([]Watch{
		{ID: "1", Address: "0xA", RPCURL: "x", Interval: time.Hour},
		{ID: "2", Address: "0xB", RPCURL: "x", Interval: time.Hour},
	})
	rf := func(_, _ string) (Reader, error) {
		return &fakeReader{block: 0, call: func(_, _ string) (string, error) { return "0x1", nil }}, nil
	}
	reg := NewRegistry(store, rf, nil)

	if err := reg.Sync(ctx); err != nil {
		t.Fatal(err)
	}
	if reg.Running() != 2 {
		t.Fatalf("expected 2 running, got %d", reg.Running())
	}
	// idempotent: syncing the same active set does not spawn duplicates
	_ = reg.Sync(ctx)
	if reg.Running() != 2 {
		t.Fatalf("re-sync changed count to %d", reg.Running())
	}
	// drop watch 2 → it should be stopped
	store.setActive([]Watch{{ID: "1", Address: "0xA", RPCURL: "x", Interval: time.Hour}})
	if err := reg.Sync(ctx); err != nil {
		t.Fatal(err)
	}
	if reg.Running() != 1 {
		t.Fatalf("expected 1 running after removal, got %d", reg.Running())
	}
	reg.Stop()
	if reg.Running() != 0 {
		t.Fatalf("expected 0 running after Stop, got %d", reg.Running())
	}
}

func TestStoreSinkEmitRecords(t *testing.T) {
	store := &fakeStore{}
	s := storeSink{store: store, logf: func(string, ...any) {}}
	s.Emit(Detection{WatchID: "1", Kind: "invariant", RuleID: "c", Label: "x>=y", Block: 7, Observed: "left=1 right=2 (>=)"})
	if store.detCount() != 1 {
		t.Fatalf("expected 1 recorded detection, got %d", store.detCount())
	}
}
