import z from "zod";

// Storage the files app can connect: any S3-compatible bucket, or a Telegram chat used through a bot.
const providers = ["s3", "telegram"] as const;
const providerSlugs = ["s3", "tg"] as const;

export const driveProviderSchema = z.enum(providers);
export const driveProviderSlugSchema = z.enum(providerSlugs);
export const driveProviderParamSchema = z.object({
	providerId: driveProviderSchema,
	accountId: z.string(),
});
export const driveProviderSlugParamSchema = z.object({
	providerSlug: driveProviderSlugSchema,
	accountId: z.string(),
});
export type DriveProvider = z.infer<typeof driveProviderSchema>;
export type DriveProviderSlug = z.infer<typeof driveProviderSlugSchema>;
export type DriveProviderSlugParam = z.infer<typeof driveProviderSlugParamSchema>;

// Single source of truth for provider <-> slug mappings (same order in both lists).
const providerMappings = providerSlugs.reduce(
	(acc, slug, index) => {
		const provider = providers[index];
		if (!provider) throw new Error(`Provider not found for slug: ${slug}`);
		acc.slugToProvider.set(slug, provider);
		acc.providerToSlug.set(provider, slug);
		return acc;
	},
	{
		slugToProvider: new Map<DriveProviderSlug, DriveProvider>(),
		providerToSlug: new Map<DriveProvider, DriveProviderSlug>(),
	}
);

export function slugToProvider(slug: DriveProviderSlug): DriveProvider | undefined {
	return providerMappings.slugToProvider.get(slug);
}

export function providerToSlug(provider: DriveProvider): DriveProviderSlug | undefined {
	return providerMappings.providerToSlug.get(provider);
}
