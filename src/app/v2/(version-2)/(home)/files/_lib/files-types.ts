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
  userId?: string;
  fileId: string;
  name?: string;
  type?: string;
  provider?: string;
  accountId?: string;
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
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-west-1", label: "US West (N. California)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "us-gov-east-1", label: "AWS GovCloud (US-East)" },
  { value: "us-gov-west-1", label: "AWS GovCloud (US-West)" },
  { value: "ca-central-1", label: "Canada (Central)" },
  { value: "ca-west-1", label: "Canada (Calgary)" },
  { value: "mx-central-1", label: "Mexico (Central)" },
  { value: "eu-north-1", label: "Europe (Stockholm)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "eu-west-2", label: "Europe (London)" },
  { value: "eu-west-3", label: "Europe (Paris)" },
  { value: "eu-central-1", label: "Europe (Frankfurt)" },
  { value: "eu-central-2", label: "Europe (Zurich)" },
  { value: "eu-south-1", label: "Europe (Milan)" },
  { value: "eu-south-2", label: "Europe (Spain)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  { value: "ap-northeast-2", label: "Asia Pacific (Seoul)" },
  { value: "ap-northeast-3", label: "Asia Pacific (Osaka)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
  { value: "ap-southeast-3", label: "Asia Pacific (Jakarta)" },
  { value: "ap-southeast-4", label: "Asia Pacific (Melbourne)" },
  { value: "ap-southeast-5", label: "Asia Pacific (Malaysia)" },
  { value: "ap-east-1", label: "Asia Pacific (Hong Kong)" },
  { value: "ap-east-2", label: "Asia Pacific (Taipei)" },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
  { value: "ap-south-2", label: "Asia Pacific (Hyderabad)" },
  { value: "ap-southeast-6", label: "Asia Pacific (Thailand)" },
  { value: "cn-north-1", label: "China (Beijing)" },
  { value: "cn-northwest-1", label: "China (Ningxia)" },
  { value: "sa-east-1", label: "South America (São Paulo)" },
  { value: "me-south-1", label: "Middle East (Bahrain)" },
  { value: "me-central-1", label: "Middle East (UAE)" },
  { value: "af-south-1", label: "Africa (Cape Town)" },
  { value: "il-central-1", label: "Israel (Tel Aviv)" },
] as const;

export type AWSRegion = (typeof AWS_REGIONS)[number]["value"];

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
  name?: string;
  type?: string;
  mimeType?: string;
  provider?: string;
  accountId?: string;
}

export interface SessionUser {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  emailVerified?: boolean;
  defaultAccountId?: string | null;
  defaultProviderId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export const LEGAL_UPDATE_DATE = "July 29, 2025";
export const WEBSITE_NAME = "Nimbus";
export const COMPANY_NAME = "Borea Inc.";
export const URL = "https://nimbus.storage";
export const CONTACT_EMAIL = "hello@nimbus.storage";
export const ADDRESS = "251 Little Falls Drive Wilmington, DE 19808";
export const STATE = "Delaware";
export const COUNTRY = "USA";

export interface CheckEmailExists {
  exists: boolean;
}

export type Auth = any;
export type auth = any;

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const emailSchema = z.string().email("Please enter a valid email address");

export const emailObjectSchema = z.object({
  email: emailSchema,
});

export const nicknameSchema = z.string().max(100).nullable().optional();

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be less than 100 characters");

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  remember: z.boolean().optional(),
});

export const signUpSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export interface WaitlistCount {
  count: number;
}


export function getFileExtension(filename: string): string {
  if (!filename) return "";
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
}

