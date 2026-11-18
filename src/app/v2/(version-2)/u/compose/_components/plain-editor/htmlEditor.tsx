import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
  useState,
} from "react";
import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  Palette,
  X,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  backgroundColors,
  PlainTextEditorToolbar,
  textColors,
} from "./toolbar";
import AttachmentCard from "./attachmentCard";
import { ofss } from "@/db/ofs";
import { useAppSelector } from "@/store/hooks";
import { API } from "@/lib/api/handler";
import { __config } from "@/constants/config";

const textPalette = Array.from(
  new Set(
    [
      "#000000",
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
      "#FFA500",
      "#800000",
      "#008000",
      "#000080",
      "#808000",
    ].concat(textColors, backgroundColors)
  )
);

export interface AttachmentWithProgress {
  file: File;
  progress: number; // 0-100
  uploaded: boolean;
  id: string;
  abort?: AbortController;
}

export interface EditorContextType {
  formatText: (command: string, value?: string) => void;
  getHTML: () => string;
  setHTML: (html: string) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  insertAdvancedList: (
    type:
      | "alphabetList"
      | "nestedBullet"
      | "nestedNumber"
      | "nestedAlphabet"
      | "deepNested"
  ) => void;
  insertImage: (src: string) => void;
  insertLink: (url: string, text?: string, target?: "_blank" | "_self") => void;
  attachments: AttachmentWithProgress[];
  setAttachments: React.Dispatch<
    React.SetStateAction<AttachmentWithProgress[]>
  >;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeAttachment: (id: string) => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export interface HtmlEditorProps {
  children?: ReactNode;
  defaultValue?: string;
  value?: string;
  placeholder?: string;
  fontFamily?: string;
  fontSize?: string;
  height?: string | number;
  className?: string;
  footerElement?: React.ReactNode;
  headerElement?: React.ReactNode;
  toolbarPoistion?: "top" | "bottom" | "none";
  toolbarPosition?: "top" | "bottom" | "none";
  sticky?: boolean;
  onChange?: (html: string) => void;
  attachments?: AttachmentWithProgress[];
  setAttachments?: React.Dispatch<
    React.SetStateAction<AttachmentWithProgress[]>
  >;
  tabId?: number | string;
  accountEmail?: string;
  onUploadFiles?: (files: File[]) => Promise<void> | void;
  onDeleteFile?: (attachmentId: string, fileName: string) => Promise<boolean> | boolean;
  readOnly?: boolean;
}

export const HtmlEditor: React.FC<HtmlEditorProps> = ({
  children,
  defaultValue = "<p>Write your content here...</p>",
  value,
  placeholder = "Write your message here...",
  fontFamily = "Inter, sans-serif",
  fontSize,
  height = "200px",
  className,
  footerElement,
  headerElement,
  toolbarPoistion,
  toolbarPosition: explicitToolbarPosition,
  sticky = false,
  onChange,
  attachments: externalAttachments,
  setAttachments: externalSetAttachments,
  tabId,
  accountEmail: explicitAccountEmail,
  onUploadFiles,
  onDeleteFile,
  readOnly = false,
}) => {
  const toolbarPos = explicitToolbarPosition || toolbarPoistion || "top";
  const editorRef = useRef<HTMLDivElement>(null);

  // Decoupled account email: use prop if provided, else fall back to redux store
  const reduxAccount = useAppSelector((state) => state.accounts.currAccount);
  const accountEmail = explicitAccountEmail || reduxAccount?.email || "";

  // Internal attachment fallback state if caller does not manage attachments
  const [internalAttachments, setInternalAttachments] = useState<AttachmentWithProgress[]>([]);
  const attachments = externalAttachments ?? internalAttachments;
  const setAttachments = externalSetAttachments ?? setInternalAttachments;

  const currentTabId = tabId?.toString() ?? "default";
  const [htmlContent, setHtmlContent] = useState<string>(value ?? defaultValue);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState<boolean>(false);
  const [floatingPosition, setFloatingPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showLinkDialog, setShowLinkDialog] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [linkTarget, setLinkTarget] = useState<"_blank" | "_self">("_blank");
  const [selectedText, setSelectedText] = useState<string>("");

  // Prevent React removeChild errors on unmount
  useEffect(() => {
    const editor = editorRef.current;
    return () => {
      if (editor) {
        while (editor.firstChild) {
          editor.removeChild(editor.firstChild);
        }
      }
    };
  }, []);

  // Sync initial or default value into contentEditable
  useEffect(() => {
    if (editorRef.current) {
      const targetVal = value !== undefined ? value : defaultValue;
      if (editorRef.current.innerHTML !== targetVal) {
        editorRef.current.innerHTML = targetVal;
        setHtmlContent(targetVal);
      }
    }
  }, [defaultValue, value]);

  // Floating selection toolbar
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (
        selection &&
        selection.toString().trim() &&
        editorRef.current?.contains(selection.anchorNode as Node | null)
      ) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(selection.toString());
        setFloatingPosition({
          x: Math.max(10, rect.left + rect.width / 2 - 150),
          y: Math.max(10, rect.top - 54),
        });
        setShowFloatingToolbar(true);
      } else {
        setShowFloatingToolbar(false);
        setSelectedText("");
      }
    };

    fetchUploadedFiles();
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const handleOnDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length === 0) return;
    if (onUploadFiles) {
      onUploadFiles(files);
    } else {
      sendFilesToServer(files);
    }
  };

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      if (onUploadFiles) {
        await onUploadFiles(files);
      } else {
        if (accountEmail) {
          try {
            await ofss.storeFiles(accountEmail, { tabId: currentTabId, files });
          } catch (e) {
            console.warn("ofss store error:", e);
          }
        }
        await sendFilesToServer(files);
      }
      event.target.value = "";
    },
    [accountEmail, currentTabId, onUploadFiles]
  );

  const cancelUpload = (id: string) => {
    setAttachments((prev) => {
      const upload = prev.find((u) => u.id === id);
      if (upload?.abort) {
        upload.abort.abort();
      }
      return prev.filter((u) => u.id !== id);
    });
  };

  const sendFilesToServer = async (
    files: any[],
    onUploaded?: (file: File, id: string, serverPath: string) => void
  ) => {
    try {
      files.forEach((file) => {
        const uniqueDir = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const id = `attachment-${uniqueDir}`;
        const abort = new AbortController();

        const newAttachment: AttachmentWithProgress = {
          file,
          progress: 0,
          uploaded: false,
          id,
          abort,
        };

        setAttachments((prev) => [...prev, newAttachment]);

        const fd = new FormData();
        fd.append("attachments", file, file.name);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${__config.APP.BASE_URL}/api/v1/attachment/upload`);
        xhr.withCredentials = true;

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = (e.loaded / e.total) * 100;
            setAttachments((prev) =>
              prev.map((u) => (u.id === id ? { ...u, progress: percent } : u))
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setAttachments((prev) =>
              prev.map((u) =>
                u.id === id ? { ...u, progress: 100, uploaded: true } : u
              )
            );
            if (onUploaded) {
              const serverPath = `${uniqueDir}/${file.name}`;
              onUploaded(file, id, serverPath);
            }
          } else {
            console.error("Upload failed with status:", xhr.status, file.name);
            setAttachments((prev) => prev.filter((u) => u.id !== id));
          }
        };

        xhr.onerror = () => {
          console.error("Upload network error:", file.name);
          setAttachments((prev) => prev.filter((u) => u.id !== id));
        };

        abort.signal.addEventListener("abort", () => xhr.abort());
        xhr.send(fd);
      });
    } catch (error) {
      console.error("sendFilesToServer error:", error);
    }
  };

  const removeAttachment = async (attachmentId: string) => {
    try {
      if (attachments.length > 0) {
        const fileObj = attachments.find((att) => att.id === attachmentId);
        if (fileObj) {
          const fileName = fileObj.file.name;
          if (onDeleteFile) {
            const success = await onDeleteFile(attachmentId, fileName);
            if (success) {
              setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
            }
            return;
          }

          const { data } = await API.uploadDelete({ id: attachmentId, index: fileName });
          if (data?.success) {
            if (accountEmail) {
              ofss.deleteFile(accountEmail, currentTabId, fileName);
            }
            setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
          }
        }
      }
    } catch (error) {
      console.error("removeAttachment error:", error);
    }
  };

  const fetchUploadedFiles = useCallback(async () => {
    if (!accountEmail) return;
    try {
      const value: File[] = await ofss.getFiles(accountEmail, currentTabId);
      if (value.length > 0) {
        setAttachments(
          value.map((file) => ({
            file,
            progress: 100,
            uploaded: true,
            id: `attachment-${Date.now()}-${Math.random()}`,
          }))
        );
      }
    } catch (e) {
      console.warn("fetchUploadedFiles error:", e);
    }
  }, [accountEmail, currentTabId, setAttachments]);

  const insertAdvancedList: EditorContextType["insertAdvancedList"] = useCallback(
    (type) => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      let html = "";

      switch (type) {
        case "alphabetList":
          html = `<ol style="list-style-type: lower-alpha; counter-reset: item;"><li style="display: block; margin-bottom: .5em; margin-left: 1em;">Item a</li><li style="display: block; margin-bottom: .5em; margin-left: 1em;">Item b</li><li style="display: block; margin-bottom: .5em; margin-left: 1em;">Item c</li></ol>`;
          break;
        case "nestedBullet":
          html = `<ul style="margin-left: 0; padding-left: 20px;"><li style="list-style-type: disc;">Main item<ul style="margin-left: 20px; padding-left: 20px;"><li style="list-style-type: circle;">Sub item</li><li style="list-style-type: circle;">Sub item</li></ul></li><li style="list-style-type: disc;">Main item</li></ul>`;
          break;
        case "nestedNumber":
          html = `<ol style="margin-left: 0; padding-left: 20px;"><li style="margin-bottom: 0.5em;">Main item<ol style="margin-left: 20px; padding-left: 20px; margin-top: 0.5em;"><li>Sub item</li><li>Sub item</li></ol></li><li style="margin-bottom: 0.5em;">Main item</li></ol>`;
          break;
        case "nestedAlphabet":
          html = `<ol style="margin-left: 0; padding-left: 20px;"><li style="margin-bottom: 0.5em;">Item 1<ol style="list-style-type: lower-alpha; margin-left: 20px; padding-left: 20px; margin-top: 0.5em;"><li>Item a</li><li>Item b</li></ol></li><li style="margin-bottom: 0.5em;">Item 2</li></ol>`;
          break;
        case "deepNested":
          html = `<ol style="margin-left: 0; padding-left: 20px;"><li style="margin-bottom: 0.5em;">Level 1<ol style="margin-left: 20px; padding-left: 20px; margin-top: 0.5em;"><li style="margin-bottom: 0.5em;">Level 2<ol style="margin-left: 20px; padding-left: 20px; margin-top: 0.5em;"><li>Level 3</li></ol></li></ol></li></ol>`;
          break;
        default:
          break;
      }

      document.execCommand("insertHTML", false, html);
      updateContent();
    },
    []
  );

  const insertImage = useCallback((src: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const img = `<img src="${src}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" alt="Inserted image" />`;
    document.execCommand("insertHTML", false, img);
    updateContent();
  }, []);

  const insertLink = useCallback(
    (url: string, text?: string, target: "_blank" | "_self" = "_blank") => {
      if (!editorRef.current) return;
      editorRef.current.focus();
      const selection = window.getSelection();
      const linkText = text || selectedText || url;

      if (selection && selectedText) {
        document.execCommand("createLink", false, url);
        const links = editorRef.current.querySelectorAll("a");
        const lastLink = links[links.length - 1] as HTMLAnchorElement | undefined;
        if (lastLink) {
          lastLink.setAttribute("target", target);
          if (target === "_blank") lastLink.setAttribute("rel", "noopener noreferrer");
        }
      } else {
        const link = `<a href="${url}" target="${target}" ${
          target === "_blank" ? 'rel="noopener noreferrer"' : ""
        }>${linkText}</a>`;
        document.execCommand("insertHTML", false, link);
      }

      updateContent();
      setShowLinkDialog(false);
      setShowFloatingToolbar(false);
    },
    [selectedText]
  );

  const handleLinkInsert = () => {
    if (linkUrl) {
      insertLink(linkUrl, selectedText, linkTarget);
      setLinkUrl("");
      setLinkTarget("_blank");
    }
  };

  const updateContent = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtmlContent(newHtml);
      onChange?.(newHtml);
    }
  };

  const formatText = useCallback((command: string, formatVal?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, formatVal);
      updateContent();
    }
  }, []);

  const getHTML = useCallback(() => editorRef.current?.innerHTML || "", []);

  const setHTML = useCallback(
    (html: string) => {
      if (editorRef.current) editorRef.current.innerHTML = html;
      setHtmlContent(html);
      onChange?.(html);
    },
    [onChange]
  );

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const items = Array.from(clipboardData.items);
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();

    const imageFiles: File[] = [];
    Array.from(clipboardData.files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      imageFiles.push(file);
    });

    items.forEach((item) => {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file && !imageFiles.some((f) => f.name === file.name && f.size === file.size)) {
          imageFiles.push(file);
        }
      }
    });

    if (imageFiles.length > 0) {
      const imgElements = new Map<string, HTMLImageElement>();
      imageFiles.forEach((file) => {
        const objectUrl = URL.createObjectURL(file);
        const img = document.createElement("img");
        img.src = objectUrl;
        img.style.maxWidth = "100%";
        img.style.borderRadius = "8px";
        img.setAttribute("alt", file.name);
        range.insertNode(img);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        imgElements.set(file.name, img);
      });

      sendFilesToServer(imageFiles, (file, _id, serverPath) => {
        const img = imgElements.get(file.name);
        if (img) {
          const hostedUrl = `${__config.APP.BASE_URL}/api/v1/attachment/preview/${serverPath}`;
          URL.revokeObjectURL(img.src);
          img.src = hostedUrl;
          updateContent();
        }
      });
      updateContent();
    }

    items.forEach((item) => {
      if (item.type === "text/plain") {
        item.getAsString((text) => {
          const sanitizedText = text.replace(/\s+/g, " ");
          range.insertNode(document.createTextNode(sanitizedText));
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        });
      }
    });
  };

  const handleInput = () => updateContent();

  return (
    <EditorContext.Provider
      value={{
        formatText,
        getHTML,
        setHTML,
        editorRef,
        insertAdvancedList,
        insertImage,
        insertLink,
        attachments,
        setAttachments,
        handleFileUpload,
        removeAttachment,
      }}
    >
      <div
        className={cn(
          "w-full relative flex flex-col flex-1 min-h-0 transition-all",
          isDragOver && "opacity-75 ring-2 ring-primary ring-offset-2 ring-offset-background",
          className
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleOnDragOver}
      >
        {isDragOver && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-card/80 backdrop-blur-xs rounded-xl border-2 border-dashed border-primary transition-all animate-fadeIn">
            <UploadCloud className="h-10 w-10 text-primary mb-2 animate-bounce" />
            <span className="text-base font-semibold text-foreground tracking-tight">
              Drop files here to attach
            </span>
          </div>
        )}

        {headerElement}

        <div className="w-full border border-border/80 rounded-xl overflow-hidden bg-card/40 shadow-xs relative flex flex-col flex-1 min-h-0 transition-all focus-within:shadow-md focus-within:border-primary/50">
          {toolbarPos === "top" && (children || <PlainTextEditorToolbar />)}

          <div
            ref={editorRef}
            contentEditable={!readOnly}
            className="w-full px-4 py-3.5 text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none focus:outline-hidden font-normal flex-1 min-h-0 text-foreground overflow-y-auto"
            style={{
              fontFamily,
              fontSize: fontSize || undefined,
              minHeight: height,
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}
            data-placeholder={placeholder}
            onInput={handleInput}
            onPaste={handlePaste}
            suppressContentEditableWarning
          />

          {/* Attachments Panel */}
          {attachments.length > 0 && (
            <AttachmentCard
              cancelUpload={cancelUpload}
              attachments={attachments}
              removeAttachment={removeAttachment}
            />
          )}

          {/* Floating selection toolbar */}
          {showFloatingToolbar && (
            <div
              className="fixed z-60 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xl p-1 flex items-center gap-0.5 animate-in fade-in zoom-in-95 duration-150"
              style={{
                left: floatingPosition.x,
                top: floatingPosition.y,
                maxWidth: 320,
              }}
            >
              <Button
                variant={typeof document !== "undefined" && document.queryCommandState("bold") ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0 rounded-lg"
                onClick={() => formatText("bold")}
              >
                <Bold className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant={typeof document !== "undefined" && document.queryCommandState("italic") ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0 rounded-lg"
                onClick={() => formatText("italic")}
              >
                <Italic className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant={typeof document !== "undefined" && document.queryCommandState("underline") ? "secondary" : "ghost"}
                size="sm"
                className="h-7 w-7 p-0 rounded-lg"
                onClick={() => formatText("underline")}
              >
                <Underline className="w-3.5 h-3.5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg">
                    <Palette className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="p-2">
                  <div className="grid grid-cols-12 gap-1">
                    {textPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className="w-4 h-4 rounded-sm border border-border hover:scale-115 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => formatText("foreColor", color)}
                      />
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-lg"
                onClick={() => setShowLinkDialog(true)}
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-lg"
                onClick={() => setShowFloatingToolbar(false)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* Link Dialog */}
          <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">Insert Hyperlink</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="url" className="text-xs font-medium">Link URL</Label>
                  <Input
                    id="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="h-9 rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Open in</Label>
                  <RadioGroup
                    value={linkTarget}
                    onValueChange={(v) => setLinkTarget(v as "_blank" | "_self")}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="flex items-center space-x-2 rounded-lg border border-border/80 p-2.5 cursor-pointer hover:bg-muted/40">
                      <RadioGroupItem id="new-window" value="_blank" />
                      <Label htmlFor="new-window" className="text-xs font-normal cursor-pointer">
                        New window
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border border-border/80 p-2.5 cursor-pointer hover:bg-muted/40">
                      <RadioGroupItem id="same-window" value="_self" />
                      <Label htmlFor="same-window" className="text-xs font-normal cursor-pointer">
                        Current window
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg h-9"
                    onClick={() => setShowLinkDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-lg h-9"
                    onClick={handleLinkInsert}
                  >
                    Insert Link
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {toolbarPos === "bottom" && (
          <div className={cn(sticky && "sticky", "bottom-0 z-10 pt-2")}>
            {children || <PlainTextEditorToolbar />}
          </div>
        )}
      </div>
      {footerElement}
    </EditorContext.Provider>
  );
};

export const useHtmlEditor = (): EditorContextType => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useHtmlEditor must be used inside <HtmlEditor>");
  return ctx;
};
