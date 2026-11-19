/**
 * The S3-compatible services the "Add storage" route offers. They all use the same backend provider (`POST /api/account/s3`);
 * a service only changes the hints in the form and whether a custom endpoint is required.
 */
export type S3ServiceId = "aws" | "r2" | "minio" | "spaces" | "b2" | "wasabi" | "other";

export type S3Service = {
	id: S3ServiceId;
	label: string;
	/** One line under the label in the picker. */
	description: string;
	/** Everything but Amazon S3 needs the endpoint of the service. */
	endpointRequired: boolean;
	endpointPlaceholder: string;
	/** Shown under the endpoint field. */
	endpointHint: string;
};

export const S3_SERVICES: S3Service[] = [
	{
		id: "aws",
		label: "Amazon S3",
		description: "A bucket in your AWS account",
		endpointRequired: false,
		endpointPlaceholder: "Not needed for Amazon S3",
		endpointHint: "Leave empty: Amazon S3 is reached through its region.",
	},
	{
		id: "r2",
		label: "Cloudflare R2",
		description: "R2 bucket with an S3 API token",
		endpointRequired: true,
		endpointPlaceholder: "https://<account-id>.r2.cloudflarestorage.com",
		endpointHint: "Your account's S3 API endpoint, from the R2 dashboard. Any region works: R2 ignores it.",
	},
	{
		id: "minio",
		label: "MinIO",
		description: "Self-hosted, on your own server",
		endpointRequired: true,
		endpointPlaceholder: "http://192.168.1.10:9000",
		endpointHint:
			"The S3 API address of your MinIO server (not the console). Use an IP address or a DNS name that supports bucket subdomains: localhost does not work.",
	},
	{
		id: "spaces",
		label: "DigitalOcean Spaces",
		description: "A Space in your DigitalOcean account",
		endpointRequired: true,
		endpointPlaceholder: "https://nyc3.digitaloceanspaces.com",
		endpointHint: "The regional endpoint of your Space, without the Space name in front.",
	},
	{
		id: "b2",
		label: "Backblaze B2",
		description: "B2 bucket with an S3-compatible key",
		endpointRequired: true,
		endpointPlaceholder: "https://s3.us-west-004.backblazeb2.com",
		endpointHint: "The S3 endpoint shown on your bucket's page. Use the application key, not the master key.",
	},
	{
		id: "wasabi",
		label: "Wasabi",
		description: "Wasabi hot cloud storage",
		endpointRequired: true,
		endpointPlaceholder: "https://s3.us-east-1.wasabisys.com",
		endpointHint: "The endpoint of the region your bucket is in.",
	},
	{
		id: "other",
		label: "Other S3-compatible",
		description: "Any service that speaks the S3 API",
		endpointRequired: true,
		endpointPlaceholder: "https://s3.example.com",
		endpointHint: "The S3 API endpoint your provider gives you.",
	},
];

export const DEFAULT_S3_SERVICE: S3ServiceId = "aws";

export function isS3ServiceId(value: unknown): value is S3ServiceId {
	return S3_SERVICES.some(service => service.id === value);
}

export function getS3Service(id: S3ServiceId | undefined): S3Service {
	return S3_SERVICES.find(service => service.id === id) ?? S3_SERVICES[0]!;
}
