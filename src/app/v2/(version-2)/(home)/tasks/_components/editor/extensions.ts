import { createBaseExtensions } from "@tasks/_packages/editor";
import type { AnyExtension } from "@tiptap/core";
import type { Highlighter } from "shiki";
import { AttachmentCard } from "@tasks/_components/task/extensions/attachment-card";
import { EmbedBlock } from "@tasks/_components/task/extensions/embed-block";
import { KaneoIssueLink } from "@tasks/_components/task/extensions/kaneo-issue-link";
import { MermaidBlock } from "@tasks/_components/task/extensions/mermaid-block";
import { ShikiCodeBlock } from "@tasks/_components/task/extensions/shiki-code-block";
import { TaskItemWithCheckbox } from "@tasks/_components/task/extensions/task-item-with-checkbox";
import { EditorKeymap } from "./editor-keymap";
import { detectCodeLanguage } from "./detect-code-language";

export function createEditorExtensions({
  placeholder,
  highlighter,
  resolveLanguage,
  image,
  extra = [],
  mermaidErrorKey,
}: {
  placeholder: string;
  highlighter: () => Highlighter | null;
  resolveLanguage: (language: string) => string;
  image: AnyExtension;
  extra?: AnyExtension[];
  mermaidErrorKey?: string;
}) {
  return createBaseExtensions({
    placeholder,
    keymap: [EditorKeymap],
    decorations: [
      ShikiCodeBlock.configure({
        highlighter,
        resolveLanguage,
        detectLanguage: detectCodeLanguage,
        themeDark: "github-dark",
        themeLight: "github-light",
      }),
      mermaidErrorKey
        ? MermaidBlock.configure({ errorKey: mermaidErrorKey })
        : MermaidBlock,
    ],
    extra,
    nodes: {
      embedBlock: EmbedBlock,
      attachmentCard: AttachmentCard,
      kaneoIssueLink: KaneoIssueLink,
      image,
      taskItem: TaskItemWithCheckbox,
    },
  });
}
