"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccountProvider } from "../_components/providers/account-provider";
import { filesApiClient } from "../_lib/files-client";
import type {
  CreateFileSchema,
  DeleteFileSchema,
  File,
  GetFileByIdSchema,
  GetFilesSchema,
  MoveFileSchema,
  UpdateFileSchema,
} from "../_lib/files-types";
import { toast } from "sonner";

export function useGetFiles({ parentId = "root", pageSize = 30, pageToken, returnedValues }: GetFilesSchema) {
  const { providerId, accountId } = useAccountProvider();
  return useQuery({
    queryKey: ["files", providerId, accountId, parentId],
    queryFn: async () => {
      return filesApiClient.getFiles({ parentId, pageSize, pageToken, returnedValues }, providerId, accountId);
    },
    enabled: !!providerId && !!accountId,
    retry: 2,
  });
}

export function useGetFile({ fileId, returnedValues }: GetFileByIdSchema) {
  const { providerId, accountId } = useAccountProvider();
  return useQuery({
    queryKey: ["file", providerId, accountId, fileId],
    queryFn: async () => {
      return filesApiClient.getFile(fileId, providerId, accountId);
    },
    enabled: !!providerId && !!accountId,
    retry: 2,
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();
  const { providerId, accountId } = useAccountProvider();
  return useMutation({
    mutationFn: async ({ fileId }: DeleteFileSchema) => {
      return filesApiClient.deleteFile({ fileId }, providerId, accountId);
    },
    onMutate: async (deletedFile) => {
      await queryClient.cancelQueries({ queryKey: ["files"] });
      const previousFiles = queryClient.getQueryData<File[]>(["files", providerId, accountId]);
      queryClient.setQueryData(["files", providerId, accountId], (old: File[] = []) =>
        old.filter((file) => file.id !== deletedFile.fileId)
      );
      return { previousFiles };
    },
    onError: (_, __, context) => {
      if (context?.previousFiles) {
        queryClient.setQueryData(["files", providerId, accountId], context.previousFiles);
      }
      toast.error("Failed to delete file");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useUpdateFile() {
  const queryClient = useQueryClient();
  const { providerId, accountId } = useAccountProvider();
  return useMutation({
    mutationFn: async ({ fileId, name }: UpdateFileSchema) => {
      return filesApiClient.updateFile({ fileId, name }, providerId, accountId);
    },
    onMutate: async ({ fileId, ...dataToUpdate }) => {
      await queryClient.cancelQueries({ queryKey: ["files"] });
      const previousFiles = queryClient.getQueryData<File[]>(["files", providerId, accountId]);
      queryClient.setQueryData(["files", providerId, accountId], (old: File[] = []) =>
        old.map((file) => (file.id === fileId ? { ...file, ...dataToUpdate } : file))
      );
      return { previousFiles };
    },
    onError: (_, __, context) => {
      if (context?.previousFiles) {
        queryClient.setQueryData(["files", providerId, accountId], context.previousFiles);
      }
      toast.error("Failed to update file");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  const { providerId, accountId } = useAccountProvider();
  return useMutation({
    mutationFn: async ({ name, mimeType, parent }: CreateFileSchema) => {
      return filesApiClient.createFolder({ name, mimeType, parent }, providerId, accountId);
    },
    onSuccess: () => {
      toast.success("Folder created successfully");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: () => {
      toast.error("Failed to create folder");
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  const { providerId, accountId } = useAccountProvider();
  return useMutation({
    mutationFn: async ({ file, parentId }: { file: globalThis.File; parentId: string }) => {
      return filesApiClient.uploadFile(parentId, file, providerId, accountId);
    },
    onSuccess: (data) => {
      toast.success(`${data?.name || "File"} uploaded successfully`);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload file");
    },
  });
}

export function useDownloadFile() {
  const { providerId, accountId } = useAccountProvider();
  return useMutation({
    mutationFn: async ({
      fileId,
      exportMimeType,
      fileName,
      onProgress,
    }: {
      fileId: string;
      exportMimeType?: string;
      fileName?: string;
      onProgress?: (progress: number) => void;
    }) => {
      const response = await filesApiClient.downloadFile(fileId, exportMimeType, providerId, accountId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to download file");
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = fileName || "download";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const contentLength = response.headers.get("Content-Length");
      const total = contentLength ? Number.parseInt(contentLength, 10) : 0;
      let loaded = 0;

      if (response.body && total > 0) {
        const reader = response.body.getReader();
        const chunks: BlobPart[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          loaded += value.length;
          if (onProgress) onProgress(Math.round((loaded / total) * 100));
        }
        const blob = new Blob(chunks);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      return { success: true, filename };
    },
    onSuccess: (data) => {
      toast.success(`${data.filename} downloaded successfully`);
    },
    onError: (error: any) => {
      toast.error(error instanceof Error ? error.message : "Failed to download file");
    },
  });
}

export function useMoveFile() {
  const queryClient = useQueryClient();
  const { providerId, accountId } = useAccountProvider();
  return useMutation({
    mutationFn: async ({ sourceId, targetParentId, newName }: MoveFileSchema & { parentId?: string }) => {
      return filesApiClient.moveFile({ sourceId, targetParentId, newName }, providerId, accountId);
    },
    onSuccess: async () => {
      toast.success("File moved successfully");
      await queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: async (error: any) => {
      toast.error(error.message || "Failed to move file");
    },
  });
}
