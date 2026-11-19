import type { DriveProvider } from "@nimbus/_packages/shared";

/** Display names for the storage providers the files app supports. */
export const PROVIDER_LABELS: Record<DriveProvider, string> = {
	s3: "S3-compatible",
	telegram: "Telegram",
};

export function providerLabel(providerId: string): string {
	return PROVIDER_LABELS[providerId as DriveProvider] ?? providerId;
}
