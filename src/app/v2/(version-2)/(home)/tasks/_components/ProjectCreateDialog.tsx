"use client";

import React, { useState } from "react";
import { FolderPlus } from "lucide-react";
import { useTasks } from "../_lib/tasks-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ProjectCreateDialog() {
  const { isProjectCreateOpen, setIsProjectCreateOpen, handleCreateProject } = useTasks();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.slice(0, 3).toUpperCase()) {
      setSlug(val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase());
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    const ok = await handleCreateProject({
      name: name.trim(),
      slug: slug.trim() || name.slice(0, 3).toUpperCase(),
      description: description.trim() || undefined,
      icon: "Users",
    });
    setIsSubmitting(false);
    if (ok) {
      setName("");
      setSlug("");
      setDescription("");
      setIsProjectCreateOpen(false);
    }
  };

  return (
    <Dialog open={isProjectCreateOpen} onOpenChange={setIsProjectCreateOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <FolderPlus className="size-4 text-primary" />
            Create Team / Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Team / Project Name</label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Engineering, Marketing..."
              className="h-9 text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Identifier / Slug</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toUpperCase())}
              placeholder="e.g. ENG"
              maxLength={6}
              className="h-9 text-xs font-mono uppercase"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Description (Optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this team or project for?"
              className="text-xs resize-none h-20"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsProjectCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
