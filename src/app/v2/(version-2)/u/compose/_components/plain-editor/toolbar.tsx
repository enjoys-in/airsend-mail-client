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
} from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Separator } from "@/components/ui/separator";
import { useHtmlEditor } from "./htmlEditor";

interface ToolbarProps {
    className?: string;
}
export const textColors = [
    "#000000",
    "#333333",
    "#666666",
    "#999999",
    "#CCCCCC",
    "#FFFFFF",
    "#FF0000",
    "#FF6B6B",
    "#FF9999",
    "#FFCCCC",
    "#00FF00",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#0000FF",
    "#6C5CE7",
    "#A29BFE",
    "#DDA0DD",
    "#FFFF00",
    "#FDCB6E",
    "#F39C12",
    "#E17055",
    "#FF00FF",
    "#E84393",
    "#FD79A8",
    "#FDCB6E",
    "#00FFFF",
    "#00B894",
    "#00CEC9",
    "#81ECEC",
    "#FFA500",
    "#E17055",
    "#D63031",
    "#74B9FF",
];

export const backgroundColors = [
    "#FFFFFF",
    "#F8F9FA",
    "#E9ECEF",
    "#DEE2E6",
    "#CED4DA",
    "#ADB5BD",
    "#FFE6E6",
    "#FFE6CC",
    "#FFFFCC",
    "#E6FFE6",
    "#E6F3FF",
    "#F0E6FF",
    "#FFB3B3",
    "#FFD1B3",
    "#FFFF99",
    "#B3FFB3",
    "#B3D9FF",
    "#D9B3FF",
    "#FF9999",
    "#FFCC99",
    "#FFFF66",
    "#99FF99",
    "#99CCFF",
    "#CC99FF",
    "#FF6666",
    "#FFB366",
    "#FFFF33",
    "#66FF66",
    "#66B3FF",
    "#B366FF",
    "#FF3333",
    "#FF9933",
    "#FFFF00",
    "#33FF33",
    "#3399FF",
    "#9933FF",
    "#FF0000",
    "#FF6600",
    "#CCCC00",
    "#00CC00",
    "#0066CC",
    "#6600CC",
];
export const PlainTextEditorToolbar: React.FC<ToolbarProps> = () => {
    const {
        formatText,
        editorRef,
        insertAdvancedList,
        handleFileUpload,
        attachments,
    } = useHtmlEditor();
    const [selectedFont, setSelectedFont] = useState<string>("Inter");
    const [selectedColor, setSelectedColor] = useState<string>("#000000");
    const [alignment, setAlignment] = useState<"left" | "center" | "right">(
        "left"
    );
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAlignment = (alignType: "left" | "center" | "right") => {
        setAlignment(alignType);
        const cmd = `justify${alignType.charAt(0).toUpperCase()}${alignType.slice(
            1
        )}`;
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
                const img = `<img src="${result}" style="max-width: 100%; height: auto; margin: 10px 0;" alt="${file.name}" />`;
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
                return <File className="w-4 h-4 text-orange-500" />;
            case "doc":
            case "docx":
                return <FileText className="w-4 h-4 text-orange-500" />;
            case "xls":
            case "xlsx":
                return <FileText className="w-4 h-4 text-orange-500" />;
            case "zip":
            case "rar":
                return <Archive className="w-4 h-4 text-orange-500" />;
            case "eml":
                return <Mail className="w-4 h-4 text-orange-500" />;
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
                return <FileImage className="w-4 h-4 text-orange-500" />;
            default:
                return <FileIcon className="w-4 h-4 text-orange-500" />;
        }
    }, []);

    return (
        <div className="flex items-center gap-1  border-b border-border overflow-x-auto">
            <Button
                variant={document.queryCommandState("bold") ? "secondary" : "ghost"}
                size="sm"
                onClick={() => formatText("bold")}
            >
                <Bold className="w-4 h-4" />
            </Button>

            <Button
                variant={document.queryCommandState("italic") ? "secondary" : "ghost"}
                size="sm"
                onClick={() => formatText("italic")}
            >
                <Italic className="w-4 h-4" />
            </Button>

            <Button
                variant={
                    document.queryCommandState("underline") ? "secondary" : "ghost"
                }
                size="sm"
                onClick={() => formatText("underline")}
            >
                <Underline className="w-4 h-4" />
            </Button>

            <Button
                variant={
                    document.queryCommandState("strikeThrough") ? "secondary" : "ghost"
                }
                size="sm"
                onClick={() => formatText("strikeThrough")}
            >
                <Strikethrough className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="mx-2 h-6" />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <List className="w-4 h-4" />
                        <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 overflow-y-auto">
                    <DropdownMenuItem onClick={() => formatText("insertUnorderedList")}>
                        • Bullet List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => formatText("insertOrderedList")}>
                        1. Numbered List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertAdvancedList("alphabetList")}>
                        a. Alphabet List
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertAdvancedList("nestedBullet")}>
                        ⤷ Nested Bullet
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertAdvancedList("nestedNumber")}>
                        1.1. Nested Number
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => insertAdvancedList("nestedAlphabet")}
                    >
                        1.a. Mixed Number/Alpha
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => insertAdvancedList("deepNested")}>
                        1.1.1 Deep Nested
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button
                variant={alignment === "left" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleAlignment("left")}
            >
                <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
                variant={alignment === "center" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleAlignment("center")}
            >
                <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
                variant={alignment === "right" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => handleAlignment("right")}
            >
                <AlignRight className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="mx-2 h-6" />

            <Button
                variant="ghost"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
            >
                <ImageIcon className="w-4 h-4" />
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
            >
                <Paperclip className="w-4 h-4" />
            </Button>

            {/* Hidden inputs */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                multiple
                max={10 - attachments.length}

                onChange={handleImageUpload}
            />
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                max={10 - attachments.length}
                onChange={handleFileUpload}
            />

            {attachments.length > 0 && (
                <div className="ml-4 flex items-center gap-2 max-w-xs overflow-x-auto">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {attachments.length} file{attachments.length > 1 ? "s" : ""}
                    </span>
                    {attachments.slice(0, 3).map((attachment) => (
                        <div key={attachment.id} className="flex items-center gap-1">
                            {getFileIcon(attachment.file.name)}
                            {attachment.progress < 100 && (
                                <div className="w-6 h-2 bg-orange-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500"
                                        style={{ width: `${attachment.progress}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    {attachments.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                            +{attachments.length - 3}
                        </span>
                    )}
                </div>
            )}

            <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <Type className="w-4 h-4 mr-1" />
                            {selectedFont}
                            <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {["Inter", "Arial", "Helvetica", "Times New Roman", "Georgia"].map(
                            (font) => (
                                <DropdownMenuItem
                                    key={font}
                                    onClick={() => handleFontChange(font)}
                                >
                                    <span style={{ fontFamily: font }}>{font}</span>
                                </DropdownMenuItem>
                            )
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <Palette className="w-4 h-4" />
                            <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80">
                        <div className="p-3 space-y-4">
                            <div>
                                <h4 className="text-sm font-medium mb-2">Text Color</h4>
                                <div className="grid grid-cols-8 gap-1 mb-2">
                                    {textColors.map((color, i) => (
                                        <button
                                            key={`text-${color}-${i}`}
                                            className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                                            style={{ backgroundColor: color }}
                                            onClick={() => formatText("foreColor", color)}
                                            title={`Text color: ${color}`}
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
                                    className="h-8"
                                />
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-2">Background Color</h4>
                                <div className="grid grid-cols-8 gap-1 mb-2">
                                    {backgroundColors.map((color, i) => (
                                        <button
                                            key={`bg-${color}-${i}`}
                                            className="w-6 h-6 rounded border hover:scale-110 transition-transform"
                                            style={{ backgroundColor: color }}
                                            onClick={() => formatText("hiliteColor", color)}
                                            title={`Background color: ${color}`}
                                        />
                                    ))}
                                </div>
                                <Input
                                    type="color"
                                    onChange={(e) => formatText("hiliteColor", e.target.value)}
                                    className="h-8"
                                />
                            </div>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
