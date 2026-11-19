import { discordChatProvider } from "@tasks/_components/project/integrations/chat-webhook/chat-webhook-providers";
import { ChatWebhookSettings } from "@tasks/_components/project/integrations/chat-webhook/chat-webhook-settings";

export function DiscordIntegrationSettings({
  projectId,
}: {
  projectId: string;
}) {
  return (
    <ChatWebhookSettings projectId={projectId} provider={discordChatProvider} />
  );
}
