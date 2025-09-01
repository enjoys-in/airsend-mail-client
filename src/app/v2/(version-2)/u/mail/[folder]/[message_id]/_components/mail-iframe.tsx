"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

import { fixNonReadableColors, template } from "@/lib/email-utils";

import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { DynamicIframe } from "./dynamic-iframe";
import { useMailRenderSettings } from "@/store/mails/mail-render-settings";
export function MailIframe({ html }: { html: string }) {
  const {
    renderStyle,
    renderMode,
    cspViolation,
    setCspViolation,
    imagesEnabled,
    setImagesEnabled,
  } = useMailRenderSettings();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(400);

  const iframeDoc = useMemo(
    () => template(html, imagesEnabled),
    [html, imagesEnabled]
  );

  const calculateAndSetHeight = useCallback(() => {
    if (!iframeRef.current?.contentWindow?.document.body) return;

    const body = iframeRef.current.contentWindow.document.body;
    const boundingRectHeight = body.getBoundingClientRect().height;
    const scrollHeight = body.scrollHeight;

    // Use the larger of the two values to ensure all content is visible
    setHeight(Math.max(boundingRectHeight, scrollHeight));
  }, [iframeRef, setHeight]);

  useEffect(() => {
    if (!iframeRef.current) return;
    const url = URL.createObjectURL(
      new Blob([iframeDoc], { type: "text/html" })
    );
    iframeRef.current.src = url;
    const handler = async () => {
      if (iframeRef.current?.contentWindow?.document.body) {
        calculateAndSetHeight();
        fixNonReadableColors(iframeRef.current.contentWindow.document.body);
      }
      setTimeout(calculateAndSetHeight, 500);
    };
    iframeRef.current.onload = handler;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [iframeDoc, calculateAndSetHeight]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow?.document.body) {
      const body = iframeRef.current.contentWindow.document.body;
      body.style.backgroundColor =
        renderStyle === "dark" ? "rgb(10, 10, 10)" : "rgb(245, 245, 245)";
      requestAnimationFrame(() => {
        fixNonReadableColors(body);
      });
    }
  }, [renderStyle]);

  useEffect(() => {
    const ctrl = new AbortController();
    window.addEventListener(
      "message",
      (event) => {
        if (event.data.type === "csp-violation") {
          setCspViolation(true);
        }
      },
      { signal: ctrl.signal }
    );
    return () => ctrl.abort();
  }, []);
  return (
    <>
      {cspViolation && !imagesEnabled && (
        <div className="flex items-center justify-start bg-amber-500 p-2 text-sm text-amber-900">
          <p>Hidden Images</p>
          <button
            onClick={() => setImagesEnabled(!imagesEnabled)}
            className="ml-2 cursor-pointer underline"
          >
            {imagesEnabled ? "Disable Images" : "Enable Images"}
          </button>
          <button
            onClick={() => {
              toast.error(
                "Images from this sender are blocked. Please enable them in settings."
              );
            }}
            className="ml-2 cursor-pointer underline"
          >
            Allow images from this sender
          </button>
        </div>
      )}

      {renderMode === "iframe" ? (
        <iframe
          onClick={calculateAndSetHeight}
          height={height}
          ref={iframeRef}
          className={cn(
            "w-full flex-1 overflow-hidden transition-opacity duration-200"
          )}
          title="Email Content"
          // allow-scripts is safe, because the CSP will prevent scripts from running that don't have our unique nonce.
          sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-scripts"
          style={{
            width: "100%",
            overflow: "hidden",
          }}
        />
      ) : (
        <DynamicIframe
          html={html}
          className={cn(
            "w-full flex-1 overflow-hidden transition-opacity duration-200"
          )}
        />
      )}
    </>
  );
}
