import { z } from "zod";

// Provider definitions
export const providers = ["credential", "google", "microsoft", "s3", "box", "dropbox"] as const;
export const providerSlugs = ["c", "g", "m", "s3", "b", "d"] as const;

export const driveProviderSchema = z.enum(["google", "microsoft", "s3", "box", "dropbox"]);
export const driveProviderSlugSchema = z.enum(providerSlugs);

export type DriveProvider = z.infer<typeof driveProviderSchema>;
export type DriveProviderSlug = z.infer<typeof driveProviderSlugSchema>;

export const providerSlugMap: Record<DriveProviderSlug, DriveProvider> = {
  c: "google", // fallback
  g: "google",
  m: "microsoft",
  s3: "s3",
  b: "box",
  d: "dropbox",
};

export const slugProviderMap: Record<DriveProvider, DriveProviderSlug> = {
  google: "g",
  microsoft: "m",
  s3: "s3",
  box: "b",
  dropbox: "d",
};

export function slugToProvider(slug?: string | null): DriveProvider | undefined {
  if (!slug) return undefined;
  return providerSlugMap[slug as DriveProviderSlug];
}

export function providerToSlug(provider?: string | null): DriveProviderSlug | undefined {
  if (!provider) return undefined;
  return slugProviderMap[provider as DriveProvider];
}

// File and metadata types
export type FileType = "file" | "folder" | "shortcut" | "other";

export interface FileMetadata {
  name: string;
  mimeType: string;
  parentId?: string;
  description?: string;
  size?: number;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  providerMetadata?: Record<string, unknown>;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  parentId?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: number;
  children?: Tag[];
}

export interface FileTag {
  id: string;
  fileId: string;
  tagId: string;
  userId: string;
  createdAt: string;
}

export interface File extends FileMetadata {
  id: string;
  type: FileType;
  parentId: string;
  size: number;
  createdTime: string;
  modifiedTime: string;
  tags?: Tag[];
  trashed?: boolean;
}

export interface DriveInfo {
  totalSpace: number;
  usedSpace: number;
  trashSize: number;
  trashItems: number;
  fileCount: number;
  state?: string;
  providerMetadata?: Record<string, unknown>;
}

export interface PinnedFile {
  id: string;
  userId: string;
  fileId: string;
  createdAt?: string | Date | null;
}

export interface LimitedAccessAccount {
  id: string;
  providerId: DriveProvider;
  accountId: string;
  scope: string;
  nickname?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ApiResponse<T = unknown> {
  route: string;
  success: boolean;
  message?: string;
  data?: T;
}

export interface UserSchema {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

// Constants
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const AWS_REGIONS = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-central-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
] as const;

// Schemas
export const createTagSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().default("#808080"),
  parentId: z.string().nullable().optional(),
});

export const updateTagSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50).optional(),
  color: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

export const createFileSchema = z.object({
  name: z.string().min(1).max(100),
  mimeType: z.string().min(1).max(100),
  parent: z.string().optional(),
});

export const deleteFileSchema = z.object({
  fileId: z.string(),
});

export const updateFileSchema = z.object({
  fileId: z.string(),
  name: z.string().min(1).max(100),
});

export const moveFileSchema = z.object({
  sourceId: z.string(),
  targetParentId: z.string(),
  newName: z.string().max(100).optional(),
});

export const createS3AccountSchema = z.object({
  accessKeyId: z.string().min(1, "Access Key ID is required"),
  secretAccessKey: z.string().min(1, "Secret Access Key is required"),
  region: z.string().min(1, "Region is required"),
  bucketName: z.string().min(1, "Bucket name is required"),
  endpoint: z.string().url().optional(),
  nickname: z.string().nullable().optional(),
});

export type CreateTagSchema = z.infer<typeof createTagSchema>;
export type UpdateTagSchema = z.infer<typeof updateTagSchema>;
export type CreateFileSchema = z.infer<typeof createFileSchema>;
export type DeleteFileSchema = z.infer<typeof deleteFileSchema>;
export type UpdateFileSchema = z.infer<typeof updateFileSchema>;
export type MoveFileSchema = z.infer<typeof moveFileSchema>;
export type CreateS3AccountSchema = z.infer<typeof createS3AccountSchema>;

export interface GetFilesSchema {
  parentId?: string;
  pageSize?: number;
  pageToken?: string;
  returnedValues?: string[];
}

export interface GetFileByIdSchema {
  fileId: string;
  returnedValues?: string[];
}

export interface UploadFileSchema {
  file: any;
  parentId: string;
}

export interface CreatePinnedFile {
  fileId: string;
}
