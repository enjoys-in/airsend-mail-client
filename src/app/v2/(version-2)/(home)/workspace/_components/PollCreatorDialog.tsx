"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, X, BarChart3, GripVertical } from "lucide-react";
import { useChatStore } from "../_lib/chat-store";
import type { CreatePollInput } from "../_lib/chat-types";

interface PollCreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelId: string;
  email: string;
}

export function PollCreatorDialog({ open, onOpenChange, channelId, email }: PollCreatorDialogProps) {
  const { createPoll } = useChatStore();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const reset = () => {
    setQuestion("");
    setOptions(["", ""]);
    setIsMultiSelect(false);
    setIsAnonymous(false);
  };

  const canSubmit = question.trim().length > 0 && options.filter((o) => o.trim()).length >= 2;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    const input: CreatePollInput = {
      question: question.trim(),
      options: options.filter((o) => o.trim()).map((o) => o.trim()),
      isMultiSelect,
      isAnonymous,
    };
    await createPoll(channelId, input, email);
    setIsSubmitting(false);
    reset();
    onOpenChange(false);
  };

  const validOptions = options.filter((o) => o.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Create Poll
          </DialogTitle>
          <DialogDescription>
            Create a poll for this channel. Members can vote on options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="poll-question">Question</Label>
            <Input
              id="poll-question"
              placeholder="What would you like to ask?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  <Input
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    className="flex-1"
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => removeOption(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={addOption}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add option
              </Button>
            )}
          </div>

          <Separator />

          {/* Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Allow multiple votes</p>
                <p className="text-xs text-muted-foreground">Members can select more than one option</p>
              </div>
              <Switch checked={isMultiSelect} onCheckedChange={setIsMultiSelect} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Anonymous voting</p>
                <p className="text-xs text-muted-foreground">Voter identities are hidden</p>
              </div>
              <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            </div>
          </div>

          {/* Preview */}
          {canSubmit && (
            <>
              <Separator />
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Preview</p>
                <p className="text-sm font-semibold">{question}</p>
                <div className="space-y-1">
                  {validOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="h-3 w-3 rounded-full border border-muted-foreground/40" />
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  {isMultiSelect && <span>Multi-select</span>}
                  {isAnonymous && <span>Anonymous</span>}
                  <span>{validOptions.length} options</span>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Poll"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
