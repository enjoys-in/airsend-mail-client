"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Copy, Check } from "lucide-react";
import ProfileCard from "./ProfileCard";
import type { TeamMember } from "../_lib/chat-types";

// ---------------------------------------------------------------------------
// MentionHighlight — renders @mention with styling + profile card popup
// ---------------------------------------------------------------------------

interface MentionHighlightProps {
  member: TeamMember;
  onSendMessage?: (userId: string) => void;
  className?: string;
}

export default function MentionHighlight({
  member,
  onSendMessage,
  className,
}: MentionHighlightProps) {
  return (
    <ProfileCard member={member} onSendMessage={onSendMessage}>
      <button
        className={cn(
          "inline-flex items-center rounded bg-yellow-500/15 px-1 py-0.5 text-xs font-semibold text-yellow-600 transition-colors hover:bg-yellow-500/25 dark:text-yellow-400",
          className,
        )}
      >
        @{member.displayName}
      </button>
    </ProfileCard>
  );
}

// ---------------------------------------------------------------------------
// renderContentWithMentions — parses message content and renders:
// 1. ```lang\ncode``` multi-line code blocks
// 2. `inline code`
// 3. **bold**, *italic*
// 4. @mentions as clickable ProfileCard-linked highlights
// 5. URLs as clickable links
// ---------------------------------------------------------------------------

export function renderContentWithMentions(
  content: string,
  members: TeamMember[],
  onSendMessage?: (userId: string) => void,
): React.ReactNode {
  // Phase 1: Split on fenced code blocks (```lang\n...\n```)
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Text before the code block
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      segments.push(
        <React.Fragment key={`text-${lastIndex}`}>
          {renderInlineContent(textBefore, members, onSendMessage, lastIndex)}
        </React.Fragment>,
      );
    }

    // Render code block
    const lang = match[1] || "";
    const code = match[2].replace(/\n$/, "");
    segments.push(
      <CodeBlock key={`code-${match.index}`} language={lang} code={code} />,
    );

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last code block
  if (lastIndex < content.length) {
    const remaining = content.slice(lastIndex);
    segments.push(
      <React.Fragment key={`text-${lastIndex}`}>
        {renderInlineContent(remaining, members, onSendMessage, lastIndex)}
      </React.Fragment>,
    );
  }

  return segments.length === 0
    ? renderInlineContent(content, members, onSendMessage, 0)
    : segments;
}

// ---------------------------------------------------------------------------
// renderInlineContent — handles inline markdown, mentions, URLs
// ---------------------------------------------------------------------------

function renderInlineContent(
  text: string,
  members: TeamMember[],
  onSendMessage?: (userId: string) => void,
  baseKey: number = 0,
): React.ReactNode {
  // Split by @username patterns
  const parts = text.split(/(@\w[\w.]*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      const username = part.slice(1);
      const member = members.find(
        (m) =>
          m.username === username ||
          m.displayName.toLowerCase().replace(/\s/g, ".") === username,
      );
      if (member) {
        return (
          <MentionHighlight
            key={`${baseKey}-${i}`}
            member={member}
            onSendMessage={onSendMessage}
          />
        );
      }
    }

    return (
      <React.Fragment key={`${baseKey}-${i}`}>
        {renderFormattedText(part, `${baseKey}-${i}`)}
      </React.Fragment>
    );
  });
}

// ---------------------------------------------------------------------------
// renderFormattedText — handles **bold**, *italic*, `code`, URLs
// ---------------------------------------------------------------------------

function renderFormattedText(text: string, keyPrefix: string): React.ReactNode {
  // Process inline code first: `code`
  if (text.includes("`")) {
    const parts = text.split(/`([^`]+)`/g);
    return parts.map((p, j) =>
      j % 2 === 1 ? (
        <code
          key={`${keyPrefix}-c-${j}`}
          className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-pink-600 dark:text-pink-400"
        >
          {p}
        </code>
      ) : (
        <React.Fragment key={`${keyPrefix}-c-${j}`}>
          {renderBoldItalicUrl(p, `${keyPrefix}-c-${j}`)}
        </React.Fragment>
      ),
    );
  }

  return renderBoldItalicUrl(text, keyPrefix);
}

function renderBoldItalicUrl(text: string, keyPrefix: string): React.ReactNode {
  // Bold **text**
  if (text.includes("**")) {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, j) =>
      j % 2 === 1 ? (
        <strong key={`${keyPrefix}-b-${j}`}>{p}</strong>
      ) : (
        <React.Fragment key={`${keyPrefix}-b-${j}`}>
          {renderItalicUrl(p, `${keyPrefix}-b-${j}`)}
        </React.Fragment>
      ),
    );
  }

  return renderItalicUrl(text, keyPrefix);
}

function renderItalicUrl(text: string, keyPrefix: string): React.ReactNode {
  // Italic *text* (but not **)
  if (text.includes("*") && !text.includes("**")) {
    const parts = text.split(/\*(.*?)\*/g);
    return parts.map((p, j) =>
      j % 2 === 1 ? (
        <em key={`${keyPrefix}-i-${j}`}>{p}</em>
      ) : (
        <React.Fragment key={`${keyPrefix}-i-${j}`}>
          {renderUrl(p, `${keyPrefix}-i-${j}`)}
        </React.Fragment>
      ),
    );
  }

  return renderUrl(text, keyPrefix);
}

function renderUrl(text: string, keyPrefix: string): React.ReactNode {
  if (/https?:\/\//.test(text)) {
    const parts = text.split(/(https?:\/\/[^\s]+)/g);
    return parts.map((p, j) =>
      /^https?:\/\//.test(p) ? (
        <a
          key={`${keyPrefix}-u-${j}`}
          href={p}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80"
        >
          {p}
        </a>
      ) : (
        <React.Fragment key={`${keyPrefix}-u-${j}`}>{p}</React.Fragment>
      ),
    );
  }
  return <>{text}</>;
}

// ---------------------------------------------------------------------------
// CodeBlock — fenced code block with copy button & language label
// ---------------------------------------------------------------------------

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-border/60 bg-zinc-950 dark:bg-zinc-900">
      {/* Header with language + copy */}
      <div className="flex items-center justify-between border-b border-border/30 bg-zinc-900/50 px-3 py-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-zinc-400 transition-colors hover:text-zinc-200"
        >
          {copied ? (
            <>
              <Check className="size-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3" />
              Copy
            </>
          )}
        </button>
      </div>
      {/* Code content */}
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed">
        <code className="font-mono text-zinc-100">{code}</code>
      </pre>
    </div>
  );
}
