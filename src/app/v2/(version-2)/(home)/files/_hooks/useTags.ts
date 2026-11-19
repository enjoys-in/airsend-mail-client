"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccountProvider } from "../_components/providers/account-provider";
import { filesApiClient } from "../_lib/files-client";
import type { CreateTagSchema, File, Tag, UpdateTagSchema } from "../_lib/files-types";
import { createTagSchema, updateTagSchema } from "../_lib/files-types";
import { toast } from "sonner";

const TAGS_QUERY_KEY = "tags";
const FILES_QUERY_KEY = "files";

export function useTags(parentId?: string) {
  const queryClient = useQueryClient();
  const { providerId, accountId } = useAccountProvider();

  const tagsQueryKey = [TAGS_QUERY_KEY, providerId, accountId];
  const filesQueryKey = [FILES_QUERY_KEY, providerId, accountId, parentId];

  const {
    data: tags,
    isLoading,
    error,
  } = useQuery<Tag[]>({
    queryKey: tagsQueryKey,
    queryFn: () => filesApiClient.getTags(providerId, accountId),
    enabled: !!providerId && !!accountId,
  });

  const createTagMutation = useMutation({
    mutationFn: (data: CreateTagSchema) => {
      const validatedData = createTagSchema.parse(data);
      return filesApiClient.createTag(validatedData, providerId, accountId);
    },
    onSuccess: () => {
      toast.success("Tag created successfully");
      queryClient.invalidateQueries({ queryKey: tagsQueryKey });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create tag");
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: (data: UpdateTagSchema) => {
      const validatedData = updateTagSchema.parse(data);
      return filesApiClient.updateTag(validatedData, providerId, accountId);
    },
    onSuccess: () => {
      toast.success("Tag updated successfully");
      queryClient.invalidateQueries({ queryKey: tagsQueryKey });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update tag");
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: string) => filesApiClient.deleteTag(id, providerId, accountId),
    onSuccess: () => {
      toast.success("Tag deleted successfully");
      queryClient.invalidateQueries({ queryKey: tagsQueryKey });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete tag");
    },
  });

  const addTagsToFileMutation = useMutation({
    mutationFn: (variables: { fileId: string; tagIds: string[]; onSuccess?: () => void }) =>
      filesApiClient.addTagToFile(variables.fileId, variables.tagIds, providerId, accountId),
    onSuccess: (_, variables) => {
      toast.success("Tag added to file successfully");
      queryClient.invalidateQueries({ queryKey: filesQueryKey });
      queryClient.invalidateQueries({ queryKey: tagsQueryKey });
      variables.onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to add tag to file");
    },
  });

  const removeTagsFromFileMutation = useMutation({
    mutationFn: (variables: { fileId: string; tagIds: string[]; onSuccess?: () => void }) =>
      filesApiClient.removeTagFromFile(variables.fileId, variables.tagIds, providerId, accountId),
    onSuccess: (_, variables) => {
      toast.success("Tag removed from file successfully");
      queryClient.invalidateQueries({ queryKey: filesQueryKey });
      queryClient.invalidateQueries({ queryKey: tagsQueryKey });
      variables.onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to remove tag from file");
    },
  });

  return {
    tags: tags ?? [],
    isLoading,
    error,
    createTag: createTagMutation.mutate,
    updateTag: updateTagMutation.mutate,
    deleteTag: deleteTagMutation.mutate,
    addTagsToFile: addTagsToFileMutation.mutate,
    removeTagsFromFile: removeTagsFromFileMutation.mutate,
  };
}
