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
import {
  backgroundColors,
  PlainTextEditorToolbar,
  textColors,
} from "./toolbar";
import AttachmentCard from "./attachmentCard";
import { ofss } from "@/db/ofs";
import { useAppSelector } from "@/store/hooks";
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
  placeholder?: string;
  fontFamily?: string;
  height?: string | number;
  footerElement?: React.ReactNode;
  headerElement?: React.ReactNode;
  toolbarPoistion?: "top" | "bottom";
  sticky?: boolean;
  onChange?: (html: string) => void;
}

export const HtmlEditor: React.FC<HtmlEditorProps> = ({
  children,
  defaultValue = "<p>Write your content here...</p>",
  placeholder = "Type or paste content here...",
  fontFamily = "Inter, sans-serif",
  height = "400px",
  footerElement,
  headerElement,
  toolbarPoistion = "top",
  sticky = false,
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlContent, setHtmlContent] = useState<string>(defaultValue);
  const currAccount = useAppSelector(state => state.accounts.currAccount)
  const [showFloatingToolbar, setShowFloatingToolbar] =
    useState<boolean>(false);
  const [toolbarPosition, setToolbarPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [showLinkDialog, setShowLinkDialog] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [linkTarget, setLinkTarget] = useState<"_blank" | "_self">("_blank");
  const [selectedText, setSelectedText] = useState<string>("");
  const [attachments, setAttachments] = useState<AttachmentWithProgress[]>([]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = defaultValue;
    }
    setHtmlContent(defaultValue);
  }, [defaultValue]);

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
        setToolbarPosition({
          x: Math.max(10, rect.left + rect.width / 2 - 150),
          y: Math.max(10, rect.top - 60),
        });
        setShowFloatingToolbar(true);
      } else {
        setShowFloatingToolbar(false);
        setSelectedText("");
      }
    };
    fetchUploadedFiles()
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      await ofss.storeFiles(currAccount!.email, files);
      files.forEach((file) => {
        const attachment: AttachmentWithProgress = {
          file,
          progress: 0,
          uploaded: false,
          id: `attachment-${Date.now()}-${Math.random()}`,
        };

        setAttachments((prev) => [...prev, attachment]);

        // Simulate upload progress
        const interval = window.setInterval(() => {
          setAttachments((prev) =>
            prev.map((att) => {
              if (att.id === attachment.id) {
                const newProgress = Math.min(
                  att.progress + Math.random() * 30,
                  100
                );
                return {
                  ...att,
                  progress: newProgress,
                  uploaded: newProgress >= 100,
                };
              }
              return att;
            })
          );
        }, 200);

        window.setTimeout(() => {
          window.clearInterval(interval);
          setAttachments((prev) =>
            prev.map((att) =>
              att.id === attachment.id
                ? { ...att, progress: 100, uploaded: true }
                : att
            )
          );
        }, 2000);
      });

      // Reset input value to allow re-uploading the same file if needed
      event.target.value = "";
    },
    []
  );

  const removeAttachment = useCallback((attachmentId: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
    if (attachments) {
      ofss.deleteFile(currAccount!.email, attachments.filter(att => att.id === attachmentId)[0].file.name)
    }


  }, []);
  const fetchUploadedFiles = React.useCallback(async () => {
    if (!currAccount?.email) return;
    const value: File[] = await ofss.getFiles(currAccount!.email);

    if (value.length > 0) setAttachments(value.map(file => ({ file, progress: 100, uploaded: true, id: `attachment-${Date.now()}-${Math.random()}` })));
  }, [])
  const insertAdvancedList: EditorContextType["insertAdvancedList"] =
    useCallback((type) => {
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
    }, []);

  const insertImage = useCallback((src: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const img = `<img src="${src}" style="max-width: 100%; height: auto; margin: 10px 0;" alt="Inserted image" />`;
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
        const lastLink = links[links.length - 1] as
          | HTMLAnchorElement
          | undefined;
        if (lastLink) {
          lastLink.setAttribute("target", target);
          if (target === "_blank")
            lastLink.setAttribute("rel", "noopener noreferrer");
        }
      } else {
        const link = `<a href="${url}" target="${target}" ${target === "_blank" ? 'rel="noopener noreferrer"' : ""
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

  const formatText = useCallback((command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
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
    // First, handle images from clipboardData.files
    Array.from(clipboardData.files).forEach(file => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = evt => {
        const img = document.createElement("img");
        img.src = evt.target?.result as string;
        img.style.maxWidth = "100%"; // wrap properly
        range.insertNode(img);

        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      };
      reader.readAsDataURL(file);
    });
    items.forEach(item => {

      if (item.type === "text/plain") {
        // Handle text
        item.getAsString(text => {
          const sanitizedText = text.replace(/\s+/g, " ");
          range.insertNode(document.createTextNode(sanitizedText));

          // Move cursor after inserted text
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
      {headerElement && headerElement}
      <div className="w-full border rounded-lg overflow-hidden bg-transparent relative">
        {toolbarPoistion === "top" && (children || <PlainTextEditorToolbar />)}

        <div
          ref={editorRef}
          contentEditable
          className="w-full p-4 text-sm leading-relaxed break-words whitespace-pre-wrap prose prose-sm max-w-none focus:outline-none font-normal "
          style={{
            fontFamily,
            minHeight: height,
            maxHeight: "500px",
            overflowY: "auto",
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
            attachments={attachments}
            removeAttachment={removeAttachment}
          />
        )}

        {/* Floating Toolbar */}
        {showFloatingToolbar && (
          <div
            className="fixed z-50 bg-background border rounded-lg shadow-lg p-2 flex items-center gap-1"
            style={{
              left: toolbarPosition.x,
              top: toolbarPosition.y,
              maxWidth: 300,
            }}
          >
            <Button
              variant={
                document.queryCommandState("bold") ? "secondary" : "ghost"
              }
              size="sm"
              onClick={() => formatText("bold")}
            >
              <Bold className="w-4 h-4" />
            </Button>

            <Button
              variant={
                document.queryCommandState("italic") ? "secondary" : "ghost"
              }
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Palette className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <div className="p-2">
                  <div className="grid grid-cols-12 gap-1 mb-2">
                    {textPalette.map((color) => (
                      <button
                        key={color}
                        className="w-5 h-5 rounded border"
                        style={{ backgroundColor: color }}
                        onClick={() => formatText("foreColor", color)}
                      />
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLinkDialog(true)}
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFloatingToolbar(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Link Dialog */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Open in</Label>
                <RadioGroup
                  value={linkTarget}
                  onValueChange={(v) => setLinkTarget(v as "_blank" | "_self")}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="new-window" value="_blank" />
                    <Label htmlFor="new-window">New window</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="same-window" value="_self" />
                    <Label htmlFor="same-window">Same window</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowLinkDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleLinkInsert}>Insert Link</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {toolbarPoistion === "bottom" && (
        <div className={`${sticky && "sticky"} top-0 bottom-10 z-10 shadow-md`}>
          {children || <PlainTextEditorToolbar />}
        </div>
      )}

      {footerElement && footerElement}
    </EditorContext.Provider>
  );
};

export const useHtmlEditor = (): EditorContextType => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useHtmlEditor must be used inside <HtmlEditor>");
  return ctx;
};
