// Types only: the shape of the backend's `pinned_file` row (the drizzle schema stays in the backend repo).
export type PinnedFileTableSelect = {
	id: string;
	userId: string;
	fileId: string;
	name: string;
	type: string;
	mimeType: string | null;
	provider: string;
	accountId: string;
	createdAt: Date;
	updatedAt: Date;
};
