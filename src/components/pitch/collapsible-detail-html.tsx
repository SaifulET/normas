"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function sanitizeDetailHtml(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|iframe|object|embed|link|meta)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, "")
    .replace(/\s(?:on[a-z]+)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi, "");
}

export function CollapsibleDetailHtml({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [collapsedMaxHeight, setCollapsedMaxHeight] = useState<string>();
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const safeHtml = useMemo(() => sanitizeDetailHtml(html), [html]);

  useEffect(() => {
    const content = contentRef.current;

    if (!content) {
      return;
    }

    const updateOverflow = () => {
      const firstContentElement = content.firstElementChild instanceof HTMLElement ? content.firstElementChild : content;
      const computedStyle = window.getComputedStyle(firstContentElement);
      const fontSize = Number.parseFloat(computedStyle.fontSize);
      const lineHeightValue = Number.parseFloat(computedStyle.lineHeight);
      const lineHeight = Number.isFinite(lineHeightValue)
        ? lineHeightValue
        : (Number.isFinite(fontSize) ? fontSize * 1.2 : 32);
      const collapsedHeight = lineHeight * 10;

      setCollapsedMaxHeight(`${collapsedHeight}px`);
      setHasOverflow(content.scrollHeight > collapsedHeight + 1);
    };

    updateOverflow();

    const observer = new ResizeObserver(updateOverflow);
    observer.observe(content);

    return () => observer.disconnect();
  }, [safeHtml]);

  return (
    <div>
      <div
        ref={contentRef}
        style={
          expanded || !hasOverflow
            ? undefined
            : {
                maxHeight: collapsedMaxHeight,
                overflow: "hidden",
              }
        }
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />

      {hasOverflow ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-4 rounded-[4px] border border-[#BFC7D0] px-1.5 py-0.5 text-[14px] font-normal leading-[22px] text-[#6B7280]"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}

    </div>
  );
}
