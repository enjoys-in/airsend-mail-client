-- Rollback migration 000002
DROP TABLE IF EXISTS workspace.user_presence;
DROP TABLE IF EXISTS workspace.invitations;
DROP TABLE IF EXISTS workspace.permissions;
DROP TABLE IF EXISTS workspace.webhook_deliveries;
DROP TABLE IF EXISTS workspace.webhooks;
DROP TABLE IF EXISTS workspace.events;
