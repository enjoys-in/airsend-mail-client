-- Rollback: drop all workspace tables in reverse dependency order

DROP TABLE IF EXISTS public.api_cache;
DROP TABLE IF EXISTS workspace.tasks;
DROP TABLE IF EXISTS workspace.notifications;
DROP TABLE IF EXISTS workspace.dm_messages;
DROP TABLE IF EXISTS workspace.dm_participants;
DROP TABLE IF EXISTS workspace.dm_conversations;
DROP TABLE IF EXISTS workspace.message_reactions;
DROP TABLE IF EXISTS workspace.message_attachments;
DROP TABLE IF EXISTS workspace.messages;
DROP TABLE IF EXISTS workspace.channels;
DROP TABLE IF EXISTS workspace.team_members;
DROP TABLE IF EXISTS workspace.teams;
DROP TABLE IF EXISTS workspace.schema_migrations;
DROP SCHEMA IF EXISTS workspace;
