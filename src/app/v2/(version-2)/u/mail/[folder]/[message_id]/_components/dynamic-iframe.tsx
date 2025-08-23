"use client"
import { useEffect, useRef, useState } from 'react';

import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

export interface DynamicIframeProps extends React.HTMLAttributes<HTMLIFrameElement> {
  html: string;
  className?: string;
  title?: string;
  sanitize?: boolean;
}


export function DynamicIframe({
  html,
  className,
  title = 'Email Content',
  sanitize = true,
  ...props
}: DynamicIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDoc) return;

    const processedHtml = sanitize ? DOMPurify.sanitize(html) : html;

    // Create and inject the content
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: inherit;
            line-height: 1.5;
            margin: 0;
            padding: 16p;
            overflow-wrap: break-word;
            word-wrap: break-word;
          }
          
          :root {
            color-scheme: light dark;
          }
          
          @media (prefers-color-scheme: dark) {
            body {
              color: #f5f5f5;
            }
            a {
              color: #3b82f6;
            }
            img {
              filter: brightness(.8) contrast(1.2);
            }
          }
          
          pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }
          
          img {
            max-width: 100%;
            height: auto;
          }
          
          table {
            max-width: 100%;
            overflow-x: auto;
            display: block;
          }
          
          @media (min-width: 768px) {
            table {
              display: table;
            }
          }
        </style>
      </head>
      <body>${processedHtml}</body>
      </html>
    `);
    iframeDoc.close();

    // Apply parent's text color to iframe body
    const updateStyles = () => {
      if (iframe.contentWindow) {
        const parentStyle = window.getComputedStyle(iframe.parentElement || document.body);
        const parentColor = parentStyle.color;
        const parentBg = parentStyle.backgroundColor;

        const styleElement = iframeDoc.createElement('style');
        styleElement.textContent = `
          body {
            color: ${parentColor};
            background-color: transparent;
          }
        `;
        iframeDoc.head.appendChild(styleElement);
      }
    };

    updateStyles();

    // Size adjustment
    const resizeIframe = () => {
      if (!iframe.contentWindow || !iframeDoc.body) return;

      const newHeight = iframeDoc.body.scrollHeight;
      const newWidth = iframeDoc.body.scrollWidth;

      if (newHeight !== height) {
        setHeight(newHeight);
        iframe.style.height = `${newHeight}px`;
      }

      if (newWidth !== width && newWidth > iframe.clientWidth) {
        setWidth(newWidth);
      }
    };

    // Set up resize observer to handle content changes
    const resizeObserver = new ResizeObserver(() => {
      resizeIframe();
    });

    resizeObserver.observe(iframeDoc.body);

    // Additional event listeners for images loading
    const images = iframeDoc.querySelectorAll('img');
    images.forEach((img) => {
      img.addEventListener('load', resizeIframe);
      img.addEventListener('error', (e) => {
        console.error('Image failed to load:', e);
        resizeIframe();
      });
    });

    // Handle link clicks to open in new tab
    const links = iframeDoc.querySelectorAll('a');
    links.forEach((link) => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });

    // Immediate resize and one after a short delay to catch any late-loading content
    resizeIframe();
    const timeoutId = setTimeout(resizeIframe, 100);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      images.forEach((img) => {
        img.removeEventListener('load', resizeIframe);
        img.removeEventListener('error', resizeIframe);
      });
      clearTimeout(timeoutId);
    };
  }, [html, height, width, sanitize]);

  return (
    <>
      <iframe
        ref={iframeRef}
        title={title}
        height={height}
        sandbox="allow-same-origin"
        className={cn('w-full border-0 p-4', className)}
        {...props}
      />
    </>
  );
}