package service

import "errors"

// ── Sentinel errors ──

var (
	ErrForbidden  = errors.New("forbidden: insufficient permissions")
	ErrNotFound   = errors.New("not found")
	ErrBadInput   = errors.New("bad input: invalid or missing fields")
	ErrPollClosed = errors.New("poll is closed and no longer accepts votes")
)

// strPtr returns a pointer to s. Convenience for building Event structs.
func strPtr(s string) *string {
	return &s
}
