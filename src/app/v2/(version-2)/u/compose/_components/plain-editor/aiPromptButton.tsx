import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Wand2, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';

const AiPromptButton: React.FC = () => {
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
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
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
                // Only close if user specifically clicks outside - remove auto-close behavior
                // You can uncomment the line below if you want click-outside-to-close behavior
                // setShowPrompt(false);
            }
        };

        if (showPrompt) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPrompt]);

    // Mock API call with typing effect
    const handleSend = async () => {
        if (!promptText.trim()) return;
        setLoading(true);
        setResponseText("");

        const mockResponse = `I understand you're asking about: "${promptText}". But This is feature is under developement, we are working on it.`;

        // Simulate typing effect
        timerRef.current = setTimeout(() => {
            setLoading(false);
            let i = 0;
            const typeWriter = () => {
                if (i < mockResponse.length) {
                    setResponseText(mockResponse.slice(0, i + 1));
                    i++;
                    typewriterRef.current = setTimeout(typeWriter, 20);
                }
            };
            typeWriter();
            setPromptText("");
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
        // Close modal on Escape key
        if (e.key === 'Escape') {
            setShowPrompt(false);
        }
    };

    return (
        <div className="relative w-full mx-auto ">
            {/* AI Button */}
            <div
                className="group cursor-pointer inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
                onClick={() => setShowPrompt((prev) => !prev)}
            >
                <Sparkles size={16} className="shrink-0 animate-pulse" />
                <span>Ask AI</span>
                <Wand2 size={16} className="shrink-0 group-hover:rotate-12 transition-transform duration-300" />
            </div>

            {/* Prompt Modal */}
            {showPrompt && (
                <div
                    ref={modalRef}
                    className={`absolute bottom-full mb-3 left-0 ${isFullWidth ? 'w-full' : 'w-96'
                        } ${isMinimized ? 'h-14' : 'h-96'
                        } bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl transition-all duration-300 ease-out transform scale-100 opacity-100 z-50 flex flex-col overflow-hidden`}
                    onClick={(e) => e.stopPropagation()} // Prevent event bubbling
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">AI Assistant</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsFullWidth(!isFullWidth)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title={isFullWidth ? "Normal Width" : "Full Width"}
                            >
                                {isFullWidth ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                            </button>
                            <button
                                onClick={() => {
                                    setIsFullWidth(false);
                                    setIsMinimized(!isMinimized)
                                }}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title={isMinimized ? "Expand" : "Minimize"}
                            >
                                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                            </button>
                            <button
                                onClick={() => setShowPrompt(false)}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Content - Always render but hide when minimized */}
                    <div className={`p-4 flex-1 flex flex-col transition-all duration-300 ${isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'
                        }`}>
                        {/* Response Area */}
                        {(responseText || loading) && (
                            <div className="mb-4 flex-1 overflow-y-auto">
                                <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-xl p-4 border border-violet-100 dark:border-violet-800/30 h-full">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                            <Sparkles size={12} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            {loading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-1">
                                                        <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                    </div>
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                                                    {responseText}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="relative mt-auto">
                            <div className="flex items-end gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 focus-within:border-violet-300 dark:focus-within:border-violet-600 transition-colors">
                                <textarea
                                    ref={textareaRef}
                                    value={promptText}
                                    onChange={(e) => setPromptText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask me anything..."
                                    className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm focus:outline-none resize-none min-h-[20px] max-h-32"
                                    rows={1}
                                    maxLength={1000}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !promptText.trim()}
                                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${loading || !promptText.trim()
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
                                        }`}
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Send size={14} />
                                    )}
                                </button>
                            </div>

                            {/* Character count */}
                            <div className="flex justify-between items-center mt-2 px-1">
                                <span className="text-xs text-gray-400">
                                    Press Enter to send, Shift+Enter for new line, Esc to close
                                </span>
                                <span className="text-xs text-gray-400">
                                    {promptText.length}/1000
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiPromptButton;