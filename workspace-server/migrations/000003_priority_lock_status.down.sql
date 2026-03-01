ALTER TABLE workspace.messages DROP COLUMN IF EXISTS priority;
ALTER TABLE workspace.channels DROP COLUMN IF EXISTS is_locked;
ALTER TABLE workspace.dm_messages DROP COLUMN IF EXISTS priority;
DROP TABLE IF EXISTS workspace.channel_members;
