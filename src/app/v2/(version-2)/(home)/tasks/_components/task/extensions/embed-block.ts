import { EmbedBlock as EmbedBlockNode } from "@tasks/_packages/editor";
import { i18n } from "@tasks/_lib/i18n";

export const EmbedBlock = EmbedBlockNode.configure({
  embeddedContentTitle: () =>
    i18n.t("tasks:detail.editor.embed.embeddedContent"),
  onlyYoutubeInlineLabel: () =>
    i18n.t("tasks:detail.editor.embed.onlyYoutubeInline"),
});
