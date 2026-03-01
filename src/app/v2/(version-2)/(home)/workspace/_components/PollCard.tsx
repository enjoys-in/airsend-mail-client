"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Check,
  Lock,
  Trash2,
  Users,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "../_lib/chat-store";
import type { Poll } from "../_lib/chat-types";

interface PollCardProps {
  poll: Poll;
  email: string;
  /** IDs the current user has voted for */
  myVoteIds?: string[];
}

export function PollCard({ poll, email, myVoteIds = [] }: PollCardProps) {
  const { votePoll, closePoll, deletePoll } = useChatStore();
  const [selectedIds, setSelectedIds] = useState<string[]>(myVoteIds);
  const [isVoting, setIsVoting] = useState(false);
  const hasVoted = myVoteIds.length > 0;
  const showResults = hasVoted || poll.isClosed;
  const isCreator = poll.createdBy === email;

  const maxVotes = useMemo(
    () => Math.max(...poll.options.map((o:any) => o.voteCount), 1),
    [poll.options]
  );

  const toggleOption = (optionId: string) => {
    if (poll.isClosed) return;
    if (poll.isMultiSelect) {
      setSelectedIds((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedIds([optionId]);
    }
  };

  const handleVote = async () => {
    if (selectedIds.length === 0) return;
    setIsVoting(true);
    await votePoll(poll.id, selectedIds, email);
    setIsVoting(false);
  };

  const handleClose = () => closePoll(poll.id, email);
  const handleDelete = () => deletePoll(poll.id, email);

  return (
    <div className="rounded-lg border bg-card shadow-sm max-w-sm w-full">
      {/* Header */}
      <div className="p-3 pb-2 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm font-semibold leading-tight">{poll.question}</p>
          </div>
          {poll.isClosed && (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              <Lock className="h-3 w-3 mr-1" />
              Closed
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>by {poll.creatorName ?? poll.createdBy}</span>
          {poll.isMultiSelect && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
              Multi
            </Badge>
          )}
          {poll.isAnonymous && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              <EyeOff className="h-2.5 w-2.5 mr-0.5" />
              Anonymous
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Options */}
      <div className="p-3 space-y-2">
        {poll.options.map((option:any) => {
          const isSelected = selectedIds.includes(option.id);
          const wasVoted = myVoteIds.includes(option.id);
          const pct = poll.totalVotes > 0 ? Math.round((option.voteCount / poll.totalVotes) * 100) : 0;

          return (
            <button
              key={option.id}
              onClick={() => !poll.isClosed && toggleOption(option.id)}
              disabled={poll.isClosed}
              className={cn(
                "relative w-full rounded-md border px-3 py-2 text-left text-sm transition-colors",
                "hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                isSelected && !showResults && "border-primary bg-primary/5",
                poll.isClosed && "cursor-default hover:bg-transparent",
              )}
            >
              {/* Background fill for results */}
              {showResults && (
                <div
                  className="absolute inset-0 rounded-md bg-primary/10 transition-all"
                  style={{ width: `${pct}%` }}
                />
              )}

              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Checkbox / Radio indicator */}
                  <div
                    className={cn(
                      "h-4 w-4 shrink-0 rounded border flex items-center justify-center",
                      poll.isMultiSelect ? "rounded-sm" : "rounded-full",
                      isSelected || wasVoted
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/40",
                    )}
                  >
                    {(isSelected || wasVoted) && <Check className="h-3 w-3" />}
                  </div>
                  <span className="truncate">{option.text}</span>
                </div>
                {showResults && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {option.voteCount} ({pct}%)
                  </span>
                )}
              </div>

              {/* Voter names (non-anonymous) */}
              {showResults && !poll.isAnonymous && option.voters && option.voters.length > 0 && (
                <div className="relative mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Users className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {option.voters.slice(0, 3).join(", ")}
                    {option.voters.length > 3 && ` +${option.voters.length - 3}`}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <Separator />
      <div className="p-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1">
          {!poll.isClosed && !hasVoted && selectedIds.length > 0 && (
            <Button size="sm" className="h-7 text-xs" onClick={handleVote} disabled={isVoting}>
              {isVoting ? "Voting..." : "Vote"}
            </Button>
          )}
          {!poll.isClosed && hasVoted && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleVote} disabled={isVoting}>
              {isVoting ? "Updating..." : "Change Vote"}
            </Button>
          )}
          {isCreator && !poll.isClosed && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleClose}>
              <Lock className="h-3 w-3 mr-1" />
              Close
            </Button>
          )}
          {isCreator && (
            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
