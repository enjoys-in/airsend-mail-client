import React, { useRef, useCallback, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ImageIcon,
  Paperclip,
  Type,
  Palette,
  File,
  FileText,
  FileImage,
  Archive,
  Mail,
  FileIcon,
  ChevronDown,
  RemoveFormatting,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useHtmlEditor } from "./htmlEditor";

export interface PlainTextEditorToolbarProps {
  className?: string;
  hideFontSelector?: boolean;
  hideColors?: boolean;
  hideAttachments?: boolean;
  fonts?: string[];
}

export const textColors = [
  "#000000",
  "#333333",
  "#666666",
  "#999999",
  "#CCCCCC",
  "#FFFFFF",
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#10B981",
  "#06B6D4",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#64748B",
];

export const backgroundColors = [
  "#FFFFFF",
  "#F8FAFC",
  "#F1F5F9",
  "#E2E8F0",
  "#FEE2E2",
  "#FFEDD5",
  "#FEF3C7",
  "#D1FAE5",
  "#CFFAFE",
  "#DBEAFE",
  "#E0E7FF",
  "#EDE9FE",
  "#FCE7F3",
];

const DEFAULT_FONTS = [
  "Inter",
  "Roboto",
  "Segoe UI",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Courier New",
];

export const PlainTextEditorToolbar: React.FC<PlainTextEditorToolbarProps> = ({
  className,
  hideFontSelector = false,
  hideColors = false,
  hideAttachments = false,
  fonts = DEFAULT_FONTS,
}) => {
  const {
    formatText,
    editorRef,
    insertAdvancedList,
    handleFileUpload,
    attachments,
  } = useHtmlEditor();

  const [selectedFont, setSelectedFont] = useState<string>("Inter");
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [alignment, setAlignment] = useState<"left" | "center" | "right" | "justify">("left");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAlignment = (alignType: "left" | "center" | "right" | "justify") => {
    setAlignment(alignType);
    const cmd = `justify${alignType.charAt(0).toUpperCase()}${alignType.slice(1)}`;
    formatText(cmd);
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    formatText("fontName", font);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const img = `<img src="${result}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" alt="${file.name}" />`;
        editorRef.current?.focus();
        document.execCommand("insertHTML", false, img);
      };
      reader.readAsDataURL(file);
    }
  };

  const getFileIcon = useCallback((fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <File className="w-3.5 h-3.5 text-orange-500" />;
      case "doc":
      case "docx":
      case "xls":
      case "xlsx":
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
      case "zip":
      case "rar":
        return <Archive className="w-3.5 h-3.5 text-amber-500" />;
      case "eml":
        return <Mail className="w-3.5 h-3.5 text-violet-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <FileImage className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <FileIcon className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  }, []);

  return (
    <div
      className={cn(
        "flex items-center gap-1 border-b border-border/60 bg-muted/30 px-3 py-1.5 overflow-x-auto text-muted-foreground select-none scrollbar-none",
        className
      )}
    >
      {/* Inline Formatting */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          label="Bold (Ctrl+B)"
          active={typeof document !== "undefined" && document.queryCommandState("bold")}
          onClick={() => formatText("bold")}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic (Ctrl+I)"
          active={typeof document !== "undefined" && document.queryCommandState("italic")}
          onClick={() => formatText("italic")}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline (Ctrl+U)"
          active={typeof document !== "undefined" && document.queryCommandState("underline")}
          onClick={() => formatText("underline")}
        >
          <Underline className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          active={typeof document !== "undefined" && document.queryCommandState("strikeThrough")}
          onClick={() => formatText("strikeThrough")}
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="mx-1 h-4 bg-border/60" />

      {/* Lists Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title="Lists"
            aria-label="Lists"
            className="h-7.5 gap-1 rounded-md px-2 text-muted-foreground hover:text-foreground hover:bg-muted/70"
          >
            <List className="w-4 h-4" />
            <ChevronDown className="w-3 h-3 text-muted-foreground/70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase">List Types</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => formatText("insertUnorderedList")}>
            • Bullet List
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => formatText("insertOrderedList")}>
            1. Numbered List
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => insertAdvancedList("alphabetList")}>
            a. Alphabet List
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => insertAdvancedList("nestedBullet")}>
            ⤷ Nested Bullet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => insertAdvancedList("nestedNumber")}>
            1.1. Nested Number
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => insertAdvancedList("nestedAlphabet")}>
            1.a. Mixed Alpha
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Alignment */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          label="Align left"
          active={alignment === "left"}
          onClick={() => handleAlignment("left")}
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align center"
          active={alignment === "center"}
          onClick={() => handleAlignment("center")}
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align right"
          active={alignment === "right"}
          onClick={() => handleAlignment("right")}
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Justify"
          active={alignment === "justify"}
          onClick={() => handleAlignment("justify")}
        >
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="mx-1 h-4 bg-border/60" />

      {/* Media & Attachments */}
      {!hideAttachments && (
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            label="Insert image"
            onClick={() => imageInputRef.current?.click()}
          >
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            label="Attach files"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-4 h-4" />
          </ToolbarButton>

          {/* Hidden inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            multiple
            max={10 - (attachments?.length || 0)}
            onChange={handleImageUpload}
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            max={10 - (attachments?.length || 0)}
            onChange={handleFileUpload}
          />

          {attachments && attachments.length > 0 && (
            <div className="ml-1.5 flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5">
              <span className="text-[11px] font-semibold text-primary whitespace-nowrap">
                {attachments.length} {attachments.length === 1 ? "file" : "files"}
              </span>
              {attachments.slice(0, 2).map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-1">
                  {getFileIcon(attachment.file.name)}
                </div>
              ))}
              {attachments.length > 2 && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  +{attachments.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Clear Formatting */}
      <ToolbarButton
        label="Clear formatting"
        onClick={() => formatText("removeFormat")}
      >
        <RemoveFormatting className="w-4 h-4" />
      </ToolbarButton>

      {/* Right-aligned Font & Color Pickers */}
      <div className="ml-auto flex items-center gap-1 pl-2">
        {!hideFontSelector && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Font"
                className="h-7.5 gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70"
              >
                <Type className="w-3.5 h-3.5 text-muted-foreground/70" />
                <span className="truncate max-w-[80px]">{selectedFont}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground/70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase">Font Family</DropdownMenuLabel>
              {fonts.map((font) => (
                <DropdownMenuItem
                  key={font}
                  onClick={() => handleFontChange(font)}
                  className="text-xs"
                >
                  <span style={{ fontFamily: font }}>{font}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {!hideColors && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Color palette"
                aria-label="Text and background color"
                className="h-7.5 w-7.5 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70"
              >
                <Palette className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 p-3 space-y-3">
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Text Color
                </h4>
                <div className="grid grid-cols-8 gap-1.5 mb-2">
                  {textColors.map((color, i) => (
                    <button
                      key={`text-${color}-${i}`}
                      type="button"
                      className="w-5 h-5 rounded-md border border-border/60 hover:scale-115 transition-transform shadow-xs"
                      style={{ backgroundColor: color }}
                      onClick={() => formatText("foreColor", color)}
                      title={`Text: ${color}`}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => {
                    setSelectedColor(e.target.value);
                    formatText("foreColor", e.target.value);
                  }}
                  className="h-7 cursor-pointer"
                />
              </div>

              <DropdownMenuSeparator />

              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Highlight Background
                </h4>
                <div className="grid grid-cols-8 gap-1.5">
                  {backgroundColors.map((color, i) => (
                    <button
                      key={`bg-${color}-${i}`}
                      type="button"
                      className="w-5 h-5 rounded-md border border-border/60 hover:scale-115 transition-transform shadow-xs"
                      style={{ backgroundColor: color }}
                      onClick={() => formatText("hiliteColor", color)}
                      title={`Highlight: ${color}`}
                    />
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

const ToolbarButton: React.FC<{
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, active, onClick, children }) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    title={label}
    aria-label={label}
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      "h-7.5 w-7.5 rounded-md p-0 transition-all duration-150",
      active
        ? "bg-primary/15 text-primary border border-primary/25 font-semibold"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
    )}
  >
    {children}
  </Button>
);
