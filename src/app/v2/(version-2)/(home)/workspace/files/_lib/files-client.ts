import type {
  CreateFileSchema,
  CreateTagSchema,
  DeleteFileSchema,
  File,
  GetFilesSchema,
  LimitedAccessAccount,
  MoveFileSchema,
  Tag,
  UpdateFileSchema,
  UpdateTagSchema,
  DriveInfo,
  PinnedFile,
  CreateS3AccountSchema,
} from "./files-types";

class FilesApiClient {
  private getHeaders(providerId?: string | null, accountId?: string | null): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (providerId) headers["X-Provider-Id"] = providerId;
    if (accountId) headers["X-Account-Id"] = accountId;
    return headers;
  }

  // Files
  async getFiles(
    params: GetFilesSchema,
    providerId?: string | null,
    accountId?: string | null
  ): Promise<File[]> {
    const sp = new URLSearchParams();
    if (params.parentId) sp.set("parentId", params.parentId);
    if (params.pageSize) sp.set("pageSize", String(params.pageSize));
    if (params.pageToken) sp.set("pageToken", params.pageToken);
    if (params.returnedValues) {
      params.returnedValues.forEach((v) => sp.append("returnedValues", v));
    }

    const res = await fetch(`/api/files/files?${sp.toString()}`, {
      headers: this.getHeaders(providerId, accountId),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || "Failed to fetch files");
    }
    return res.json();
  }

  async getFile(
    fileId: string,
    providerId?: string | null,
    accountId?: string | null
  ): Promise<File> {
    const res = await fetch(`/api/files/files/${fileId}`, {
      headers: this.getHeaders(providerId, accountId),
    });
    if (!res.ok) throw new Error("Failed to fetch file");
    return res.json();
  }

  async deleteFile(
    data: DeleteFileSchema,
    providerId?: string | null,
    accountId?: string | null
  ): Promise<void> {
    const sp = new URLSearchParams({ fileId: data.fileId });
    const res = await fetch(`/api/files/files?${sp.toString()}`, {
      method: "DELETE",
      headers: this.getHeaders(providerId, accountId),
    });
    if (!res.ok) throw new Error("Failed to delete file");
  }

  async updateFile(
    data: UpdateFileSchema,
    providerId?: string | null,
    accountId?: string | null
  ): Promise<File> {
    const sp = new URLSearchParams({ fileId: data.fileId, name: data.name });
    const res = await fetch(`/api/files/files?${sp.toString()}`, {
      method: "PUT",
      headers: this.getHeaders(providerId, accountId),
    });
    if (!res.ok) throw new Error("Failed to update file");
    return res.json();
  }

  async createFolder(
    data: CreateFileSchema,
    providerId?: string | null,
    accountId?: string | null
  ): Promise<File> {
    const sp = new URLSearchParams();
    sp.set("name", data.name);
    sp.set("mimeType", data.mimeType || "application/vnd.google-apps.folder");
    if (data.parent) sp.set("parent", data.parent);

    const res = await fetch(`/api/files/files?${sp.toString()}`, {
      method: "POST",
      headers: this.getHeaders(providerId, accountId),
    });
    if (!res.ok) throw new Error("Failed to create folder");
    return res.json();
  }

  async moveFile(
    data: MoveFileSchema,
    providerId?: string | null,
    accountId?: string | null
  ): Promise<File> {
    const res = await fetch(`/api/files/files/move`, {
      method: "POST",
      headers: this.getHeaders(providerId, accountId),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to move file");
    return res.json();
  }

  async uploadFile(
    parentId: string,
    file: globalThis.File,
    providerId?: string | null,
    accountId?: string | null
  ): Promise<File> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("parentId", parentId);

    const headers: Record<string, string> = {};
    if (providerId) headers["X-Provider-Id"] = providerId;
    if (accountId) headers["X-Account-Id"] = accountId;

    const res = await fetch(`/api/files/files/upload?parentId=${parentId}`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload file");
    return res.json();
  }

  async downloadFile(
    fileId: string,
    exportMimeType?: string,
    providerId?: string | null,
    accountId?: string | null
  ): Promise<Response> {
    const sp = new URLSearchParams({ fileId });
    if (exportMimeType) sp.set("exportMimeType", exportMimeType);

    return fetch(`/api/files/files/download?${sp.toString()}`, {
      headers: this.getHeaders(providerId, accountId),
    });
  }

  // Tags
  async getTags(providerId?: string | null, accountId?: string | null): Promise<Tag[]> {
    const res = await fetch(`/api/files/tags`, {
      headers: this.getHeaders(providerId, accountId),
    });
    if (!res.ok) return [];
    return res.json();
  }

  async createTag(
    data: CreateTagSchema,
    providerId?: string | null,
    accountId?: string | null
  ): Promise<Tag> {
    const res = await fetch(`/api/files/tags`, {
      method: "POST",
      headers: this.getHeaders(providerId, accountId),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create tag");
    return res.json();
  }

  async updateTag(
    data: UpdateTagSchema,
    providerId?: string | null,
    accountId?: string | null
  ): Promise<Tag> {
    const { id, ...body } = data;
    const res = await fetch(`/api/files/tags/${id}`, {
      method: "PUT",
      headers: this.getHeaders(providerId, accountId),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to update tag");
    return res.json();
  }

  async deleteTag(
    id: string,
    providerId?: string | null,
    accountId?: string | null
  ): Promise<void> {
    const res = await fetch(`/api/files/tags/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(providerId, accountId),
    });
    if (!res.ok) throw new Error("Failed to delete tag");
  }

  async addTagToFile(
    fileId: string,
    tagIds: string[],
    providerId?: string | null,
    accountId?: string | null
  ): Promise<void> {
    const res = await fetch(`/api/files/tags/files/${fileId}`, {
      method: "POST",
      headers: this.getHeaders(providerId, accountId),
      body: JSON.stringify({ tagIds }),
    });
    if (!res.ok) throw new Error("Failed to add tag");
  }

  async removeTagFromFile(
    fileId: string,
    tagIds: string[],
    providerId?: string | null,
    accountId?: string | null
  ): Promise<void> {
    const res = await fetch(`/api/files/tags/files/${fileId}`, {
      method: "DELETE",
      headers: this.getHeaders(providerId, accountId),
      body: JSON.stringify({ tagIds }),
    });
    if (!res.ok) throw new Error("Failed to remove tag");
  }

  // Drives
  async getDriveInfo(providerId?: string | null, accountId?: string | null): Promise<DriveInfo> {
    const res = await fetch(`/api/files/drives`, {
      headers: this.getHeaders(providerId, accountId),
    });
    if (!res.ok) {
      return {
        totalSpace: 100 * 1024 * 1024 * 1024,
        usedSpace: 5 * 1024 * 1024 * 1024,
        trashSize: 0,
        trashItems: 0,
        fileCount: 0,
      };
    }
    return res.json();
  }

  async getPinnedFiles(providerId?: string | null, accountId?: string | null): Promise<PinnedFile[]> {
    const res = await fetch(`/api/files/drives/pinned`, {
      headers: this.getHeaders(providerId, accountId),
    });
    if (!res.ok) return [];
    return res.json();
  }

  async pinFile(fileId: string, providerId?: string | null, accountId?: string | null): Promise<void> {
    await fetch(`/api/files/drives/pin`, {
      method: "POST",
      headers: this.getHeaders(providerId, accountId),
      body: JSON.stringify({ fileId }),
    });
  }

  async unpinFile(fileId: string, providerId?: string | null, accountId?: string | null): Promise<void> {
    await fetch(`/api/files/drives/unpin`, {
      method: "DELETE",
      headers: this.getHeaders(providerId, accountId),
      body: JSON.stringify({ fileId }),
    });
  }

  // Accounts
  async getAccounts(): Promise<LimitedAccessAccount[]> {
    const res = await fetch(`/api/files/account`);
    if (!res.ok) return [];
    return res.json();
  }

  async createS3Account(data: CreateS3AccountSchema): Promise<LimitedAccessAccount> {
    const res = await fetch(`/api/files/account/s3`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to connect S3");
    return res.json();
  }

  async unlinkAccount(providerId: string, accountId: string): Promise<void> {
    await fetch(`/api/files/account`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, accountId }),
    });
  }
}

export const filesApiClient = new FilesApiClient();
