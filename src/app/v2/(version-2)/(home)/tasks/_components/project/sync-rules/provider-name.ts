import type { SyncParams } from "@tasks/_fetchers/integration-sync/types";

const PROVIDER_NAMES: Record<SyncParams["provider"], string> = {
  github: "GitHub",
  gitea: "Gitea",
  gitlab: "GitLab",
};

export function providerName(provider: SyncParams["provider"]) {
  return PROVIDER_NAMES[provider];
}
