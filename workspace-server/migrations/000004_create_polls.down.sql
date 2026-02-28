-- ============================================================================
-- Migration 000004 DOWN: Drop polls tables
-- ============================================================================

DROP TABLE IF EXISTS workspace.poll_votes;
DROP TABLE IF EXISTS workspace.poll_options;
DROP TABLE IF EXISTS workspace.polls;
