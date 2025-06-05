export type Command =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'blockquote'
  | 'bulletList'
  | 'numberList'
  | 'link'
  | 'table'
  | 'foreColor'
  | 'backColor'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'indent'
  | 'outdent'
  | 'undo'
  | 'redo'
  | 'image'
  | 'video'
  | 'audio'
  | 'codeBlock'
  | 'heading'
  | 'quote'
  | 'horizontalRule'
  | 'removeFormat';

export type EditorState = {
  html: string;
  markdown: string;
  charCount: number;
  canUndo: boolean;
  canRedo: boolean;
  selection: Selection | null;
};

export type ToolbarButton = {
  command: Command;
  icon: React.ComponentType;
  label: string;
  shortcut?: string;
};
export type EditorFeatures = {
  showAIPrompt: boolean;
  showSpecialChars: boolean;
  showMarkdown: boolean;
  showHtml: boolean;
  showColorPicker: { type: 'fore' | 'back', x: number, y: number } | null;
  showTableSelector: { x: number, y: number } | null;
  showContextMenu: { x: number, y: number } | null;
  showLinkDialog: { x: number, y: number } | null;
  showAIAssistant: { x: number, y: number } | null;
}


export interface EditorAttachments {
  id: string;
  name: string;
  progress: number;
  type: string,
  size: number | string;
}