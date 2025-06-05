import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { TextShimmer } from "../ui/text-shimmer";

export const StreamingText = ({ text }: { text: string }) => {
    const [displayText, setDisplayText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
  
    useEffect(() => {
      let currentIndex = 0;
      setIsComplete(false);
      setIsThinking(true);
  
      const thinkingTimeout = setTimeout(() => {
        setIsThinking(false);
        setDisplayText('');
  
        const interval = setInterval(() => {
          if (currentIndex < text.length) {
            const nextChar = text[currentIndex];
            setDisplayText((prev) => prev + nextChar);
            currentIndex++;
          } else {
            setIsComplete(true);
            clearInterval(interval);
          }
        }, 20);
  
        return () => clearInterval(interval);
      }, 1000);
  
      return () => {
        clearTimeout(thinkingTimeout);
      };
    }, [text]);
  
    return (
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'bg-gradient-to-r from-neutral-500 via-neutral-300 to-neutral-500 bg-[length:200%_100%] bg-clip-text text-sm leading-relaxed text-transparent',
            isComplete ? 'animate-shine-slow' : '',
          )}
        >
          {isThinking ? (
            <TextShimmer duration={1}>Thinking...</TextShimmer>
          ) : (
            <span>{displayText}</span>
          )}
          {!isComplete && !isThinking && (
            <span className="animate-blink bg-primary ml-0.5 inline-block h-4 w-0.5"></span>
          )}
        </div>
      </div>
    );
  };
  