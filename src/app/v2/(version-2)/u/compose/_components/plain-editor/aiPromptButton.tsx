import React, { useState, useRef, useEffect } from "react";
import { Send, Wand2, Sparkles, X, Minimize2, Maximize2, CornerDownLeft } from "lucide-react";
import { useHtmlEditor } from "./htmlEditor";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AiPromptButtonProps {
  className?: string;
  onInsertText?: (text: string) => void;
}

const AiPromptButton: React.FC<AiPromptButtonProps> = ({ className, onInsertText }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [promptText]);

  // Focus textarea when prompt opens
  useEffect(() => {
    if (showPrompt && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showPrompt]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (typewriterRef.current) clearTimeout(typewriterRef.current);
    };
  }, []);

  // Handle clicks outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        // Can be enabled if click-outside should close
      }
    };

    if (showPrompt) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPrompt]);

  // Try to use editor context if available
  let editorContext: ReturnType<typeof useHtmlEditor> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    editorContext = useHtmlEditor();
  } catch {
    // Graceful fallback when used outside HtmlEditor
  }

  const handleInsertIntoEditor = () => {
    if (!responseText) return;
    if (onInsertText) {
      onInsertText(responseText);
    } else if (editorContext) {
      const currentHTML = editorContext.getHTML();
      editorContext.setHTML(
        `${currentHTML}<p>${responseText.replace(/\n/g, "<br/>")}</p>`
      );
    }
    setShowPrompt(false);
  };

  const handleSend = async () => {
    if (!promptText.trim()) return;
    setLoading(true);
    setResponseText("");

    const mockResponse = `Here's a draft response for "${promptText}":\n\nThank you for reaching out. We have reviewed your request and are actively processing it. Please let us know if you need any additional details.`;

    timerRef.current = setTimeout(() => {
      setLoading(false);
      let i = 0;
      const typeWriter = () => {
        if (i < mockResponse.length) {
          setResponseText(mockResponse.slice(0, i + 1));
          i++;
          typewriterRef.current = setTimeout(typeWriter, 15);
        }
      };
      typeWriter();
      setPromptText("");
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      setShowPrompt(false);
    }
  };

  return (
    <div className={cn("relative inline-block", className)}>
      {/* AI Trigger Button */}
      <button
        type="button"
        onClick={() => setShowPrompt((prev) => !prev)}
        className="group cursor-pointer inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs shadow-xs hover:shadow-md transition-all duration-200 active:scale-98 select-none"
      >
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-white/90 animate-pulse" />
        <span className="font-semibold tracking-tight">Ask AI</span>
        <Wand2 className="h-3.5 w-3.5 shrink-0 text-white/80 group-hover:rotate-12 transition-transform duration-200" />
      </button>

      {/* Prompt Modal */}
      {showPrompt && (
        <div
          ref={modalRef}
          className={cn(
            "absolute bottom-full mb-2.5 left-0 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-2xl transition-all duration-200 ease-out",
            isFullWidth ? "w-[480px] sm:w-[540px]" : "w-80 sm:w-96",
            isMinimized ? "h-12" : "h-96"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/70 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-violet-500" />
                Airsend AI Assistant
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullWidth(!isFullWidth)}
                className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground"
                title={isFullWidth ? "Compact" : "Expand width"}
              >
                {isFullWidth ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsFullWidth(false);
                  setIsMinimized(!isMinimized);
                }}
                className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPrompt(false)}
                className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground"
                title="Close"
              >
                <X size={13} />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div
            className={cn(
              "p-3 flex-1 flex flex-col transition-all duration-200",
              isMinimized ? "opacity-0 pointer-events-none" : "opacity-100"
            )}
          >
            {/* Response Area */}
            {(responseText || loading) ? (
              <div className="mb-3 flex-1 overflow-y-auto pr-1">
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-xs">
                      <Sparkles size={11} />
                    </div>
                    <div className="flex-1 space-y-2">
                      {loading ? (
                        <div className="flex items-center gap-1.5 py-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce" />
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce [animation-delay:300ms]" />
                          <span className="text-xs text-muted-foreground ml-1">Drafting...</span>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                            {responseText}
                          </p>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleInsertIntoEditor}
                            className="h-7 text-xs gap-1.5 rounded-lg font-medium text-primary hover:bg-primary/10 mt-1"
                          >
                            <CornerDownLeft size={12} />
                            Insert into message
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                <Wand2 className="h-8 w-8 text-violet-500/60 mb-2" />
                <p className="text-xs font-medium text-foreground">Write with AI</p>
                <p className="text-[11px] text-muted-foreground/80 max-w-[220px] mt-0.5">
                  Ask to draft, polish, shorten, or change the tone of your message.
                </p>
              </div>
            )}

            {/* Input Form */}
            <div className="relative mt-auto pt-2">
              <div className="flex items-end gap-2 p-2 rounded-xl border border-border/80 bg-muted/40 focus-within:border-primary/50 focus-within:bg-background transition-colors">
                <textarea
                  ref={textareaRef}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask AI to write or improve..."
                  className="flex-1 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden resize-none min-h-[24px] max-h-24 leading-snug"
                  rows={1}
                  maxLength={1000}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={loading || !promptText.trim()}
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-150",
                    loading || !promptText.trim()
                      ? "bg-muted text-muted-foreground/50 cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs active:scale-95"
                  )}
                >
                  <Send size={12} />
                </button>
              </div>

              <div className="flex justify-between items-center mt-1.5 px-1 text-[10px] text-muted-foreground/70">
                <span>Enter to submit • Esc to close</span>
                <span>{promptText.length}/1000</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiPromptButton;
