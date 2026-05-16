"use client";

import "quill/dist/quill.snow.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { SuperadminSettingsShell } from "./settings-general-client";
import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  createLegalContent,
  deleteLegalContent,
  getLegalContentByType,
  type LegalContentType,
  updateLegalContent,
} from "@/lib/legal-api";

type LegalSettingsClientProps = {
  contentTitle: string;
  contentType: LegalContentType;
  displayTitle: string;
  initialSections: Array<{
    body: string;
    title: string;
  }>;
  lastModified: string;
  pageSubtitle: string;
  pageTitle: string;
  routeHref: string;
};

type QuillConstructor = (typeof import("quill"))["default"];
type QuillInstance = InstanceType<QuillConstructor>;

const EMPTY_EDITOR_HTML = "<p><br></p>";

function normalizeHtml(html: string) {
  return html.replace(/\s+/g, " ").trim();
}

function parseHtmlToSections(html: string) {
  if (typeof window === "undefined") {
    return [] as Array<{ body: string; title: string }>;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  const nodes = Array.from(document.body.children);
  const sections: Array<{ body: string; title: string }> = [];

  let currentTitle = "";
  let currentBody: string[] = [];

  const flush = () => {
    if (!currentTitle && currentBody.length === 0) {
      return;
    }

    sections.push({
      body: currentBody.join(" ").trim(),
      title: currentTitle || `Section ${sections.length + 1}`,
    });
    currentTitle = "";
    currentBody = [];
  };

  for (const node of nodes) {
    const tagName = node.tagName.toLowerCase();

    if (tagName === "h1" || tagName === "h2" || tagName === "h3" || tagName === "h4") {
      flush();
      currentTitle = node.textContent?.trim() ?? "";
      continue;
    }

    const text = node.textContent?.trim();

    if (text) {
      currentBody.push(text);
    }
  }

  flush();

  return sections.length > 0
    ? sections
    : [
        {
          body: document.body.textContent?.trim() ?? "",
          title: "1. Introduction",
        },
      ];
}

export function LegalSettingsClient({
  contentTitle,
  contentType,
  displayTitle,
  lastModified,
  pageSubtitle,
  pageTitle,
  routeHref,
}: LegalSettingsClientProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillInstance | null>(null);
  const [draftHtml, setDraftHtml] = useState(EMPTY_EDITOR_HTML);
  const [publishedHtml, setPublishedHtml] = useState(EMPTY_EDITOR_HTML);
  const [isReady, setIsReady] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contentId, setContentId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const initialHtmlRef = useRef(EMPTY_EDITOR_HTML);

  function applyPublishedHtml(html: string) {
    initialHtmlRef.current = html;
    setPublishedHtml(html);
    setDraftHtml(html);

    if (quillRef.current) {
      quillRef.current.root.innerHTML = html;
    }
  }

  useEffect(() => {
    let mounted = true;

    async function setupQuill() {
      if (!editorRef.current || quillRef.current) {
        return;
      }

      const quillModule = await import("quill");
      const Quill = quillModule.default;

      if (!mounted) {
        return;
      }

      quillRef.current = new Quill(editorRef.current, {
        modules: {
          toolbar: "#superadmin-legal-toolbar",
        },
        placeholder: "Type here...",
        theme: "snow",
      });

      quillRef.current.root.innerHTML = initialHtmlRef.current;
      quillRef.current.on("text-change", () => {
        const nextHtml = quillRef.current?.root.innerHTML ?? "";
        setDraftHtml(nextHtml);
      });

      setIsReady(true);
    }

    setupQuill();

    return () => {
      mounted = false;

      if (quillRef.current) {
        quillRef.current.off("text-change");
        quillRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadLegalContent() {
      setIsLoadingContent(true);
      setLoadError(null);

      try {
        const response = await getLegalContentByType(contentType);
        const legalContent = Array.isArray(response.data) ? response.data[0] : response.data;
        const savedHtml = legalContent?.content?.trim();

        if (mounted) {
          setContentId(legalContent?._id ?? null);

          if (savedHtml) {
            applyPublishedHtml(savedHtml);
          }
        }
      } catch (error) {
        if (mounted) {
          const message = error instanceof Error ? error.message : "Unable to load saved legal content.";
          setLoadError(message);
        }
      } finally {
        if (mounted) {
          setIsLoadingContent(false);
        }
      }
    }

    loadLegalContent();

    return () => {
      mounted = false;
    };
  }, [contentType]);

  function syncEditor(html: string) {
    setDraftHtml(html);

    if (quillRef.current) {
      quillRef.current.root.innerHTML = html;
    }
  }

  async function handleSave() {
    const currentHtml = quillRef.current?.root.innerHTML ?? draftHtml;
    setIsSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      const response = contentId
        ? await updateLegalContent(contentId, {
            content: currentHtml,
            title: contentTitle,
          })
        : await createLegalContent({
            content: currentHtml,
            title: contentTitle,
            type: contentType,
          });

      setContentId(response.data._id ?? contentId);

      setPublishedHtml(currentHtml);
      setDraftHtml(currentHtml);
      setSaveMessage("Content saved successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save legal content.";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    syncEditor(publishedHtml);
    setSaveError(null);
    setSaveMessage(null);
  }

  function handleEditPublished() {
    syncEditor(publishedHtml);
  }

  async function handleDeletePublished() {
    const emptyHtml = "<p><br></p>";
    setIsDeleting(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      if (contentId) {
        await deleteLegalContent(contentId);
      }

      setContentId(null);
      setPublishedHtml(emptyHtml);
      syncEditor(emptyHtml);
      setSaveMessage("Content deleted successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete legal content.";
      setSaveError(message);
    } finally {
      setIsDeleting(false);
    }
  }

  const displaySections = useMemo(() => parseHtmlToSections(publishedHtml), [publishedHtml]);
  const hasChanges = normalizeHtml(draftHtml) !== normalizeHtml(publishedHtml);

  return (
    <SuperadminSettingsShell activeHref={routeHref} title={pageTitle} subtitle={pageSubtitle}>
      <div className="space-y-6">
        <div className="-mt-12 flex justify-end">
          <p className="text-[10px] text-[#8A91AB]">{lastModified}</p>
        </div>

        {isLoadingContent ? (
          <div className="rounded-[12px] border border-[#E2E6F0] bg-[#F8FAFC] px-4 py-3 text-[12px] text-[#7E84A3]">
            Loading saved legal content...
          </div>
        ) : null}
        {loadError ? (
          <div className="rounded-[12px] border border-[#F7D5D5] bg-[#FFF5F5] px-4 py-3 text-[12px] font-medium text-[#D92D20]">
            {loadError}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[16px] border border-[#E2E6F0] bg-white shadow-[0_10px_40px_rgba(31,35,61,0.06)]">
          <div id="superadmin-legal-toolbar" className="flex flex-wrap items-center gap-2 border-b border-[#EEF1F6] bg-[#F8FAFC] px-3 py-2 text-[#7E84A3] ">
            <select className="ql-header rounded-[6px]  bg-white px-2 py-1 text-[11px] " defaultValue="false">
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
              <option value="4">Heading 4</option>
              <option value="false">Paragraph</option>
            </select>
            <button type="button" className="ql-bold" aria-label="Bold" />
            <button type="button" className="ql-italic" aria-label="Italic" />
            <button type="button" className="ql-underline" aria-label="Underline" />
            <button type="button" className="ql-link" aria-label="Insert link" />
            <button type="button" className="ql-image" aria-label="Insert image" />
            <button type="button" className="ql-list" value="ordered" aria-label="Ordered list" />
            <button type="button" className="ql-list" value="bullet" aria-label="Bullet list" />
            <select className="ql-align" aria-label="Text alignment" />
            <button type="button" className="ql-blockquote" aria-label="Blockquote" />
          </div>

          <div className="min-h-[290px]">
            <div ref={editorRef} className="superadmin-quill-editor min-h-[290px]" />
          </div>

         
        </section>
 <div className="flex items-center justify-end border-t border-[#EEF1F6] px-4 py-3">
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-[8px] border border-[#D8DEEA] bg-white px-4 py-2 text-[12px] font-medium text-[#5F6786] transition hover:border-[#BFC8D9]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isReady || isLoadingContent || !hasChanges || isSaving}
                className="rounded-[8px] bg-[#161616] px-4 py-2 text-[12px] font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div> 
          {saveError ? (
            <p className="text-right text-[12px] font-medium text-[#D92D20]">{saveError}</p>
          ) : null}
          {saveMessage ? (
            <p className="text-right text-[12px] font-medium text-[#159953]">{saveMessage}</p>
          ) : null}
          
           <div className="mb-[24px] flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E4E9F2]" />
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">{displayTitle}</p>
            <div className="h-px flex-1 bg-[#E4E9F2]" />
          </div>

        <section className="rounded-[16px] bg-white px-5 py-5 shadow-[0_10px_40px_rgba(31,35,61,0.06)]">
        

          <div className="mb-5 flex justify-end gap-[16px] text-[#7E84A3]">
            <button
              type="button"
              onClick={handleEditPublished}
              className="inline-flex  items-center justify-center  transition hover:border-[#5E568E] hover:text-[#5E568E]"
              aria-label="Edit published content"
            >
             <HugeiconsIcon icon={PencilEdit02Icon} className="w-[24px] h-[24px]" />
            </button>
            <button
              type="button"
              onClick={handleDeletePublished}
              disabled={isDeleting || isLoadingContent}
              className="inline-flex items-center justify-center text-[#E25A5A] transition hover:bg-[#FFF5F5] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Delete published content"
            >
             <HugeiconsIcon icon={Delete02Icon} className="w-[24px] h-[24px]" />
            </button>
          </div>

          {displaySections.length > 0 && normalizeHtml(publishedHtml) !== normalizeHtml("<p><br></p>") ? (
            <div className="space-y-6">
              {displaySections.map((section, index) => (
                <div key={`${section.title}-${index}`}>
                  <h3 className="text-[18px] font-semibold text-[#16123E]">{section.title}</h3>
                  <p className="mt-3 text-[14px] leading-7 text-[#4E5574]">{section.body}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[12px] bg-[#F8FAFC] px-4 py-6 text-[14px] text-[#7E84A3]">
              No published content yet.
            </div>
          )}
        </section>

        <style jsx global>{`
          #superadmin-legal-toolbar.ql-toolbar {
            border: 0;
            font-family: inherit;
          }

          #superadmin-legal-toolbar .ql-formats {
            margin-right: 6px;
          }

          #superadmin-legal-toolbar .ql-picker.ql-header {
            width: 130px;
          }

          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-label::before {
            content: "Paragraph";
            line-height: 1;
          }

          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-label[data-value="2"]::before {
            content: "Heading 2";
          }

          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-label[data-value="3"]::before {
            content: "Heading 3";
          }

          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-label[data-value="4"]::before {
            content: "Heading 4";
          }

          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-label {
            display: flex;
            align-items: center;
            height: 28px;
            border: 1px solid #d9e1ee;
            border-radius: 8px;
            background: #ffffff;
            padding: 0 30px 0 12px;
            font-size: 12px;
            font-weight: 500;
            color: #7e84a3;
         
          }

          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-item::before {
            line-height: 1.2;
          }

          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
            content: "Heading 2";
          }

          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
            content: "Heading 3";
          }

          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
            content: "Heading 4";
          }

          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-item[data-value="false"]::before {
            content: "Paragraph";
          }

          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-label:hover,
          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-label.ql-active {
            color: #5e568e;
            border-color: #c8d2e4;
          }

          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-options {
            border: 1px solid #d9e1ee;
            border-radius: 10px;
            background: #ffffff;
            padding: 6px;
            box-shadow: 0 14px 30px rgba(31, 35, 61, 0.12);
          }

          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-item {
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 12px;
            color: #4e5574;
          }

          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-item:hover,
          #superadmin-legal-toolbar .ql-picker.ql-header .ql-picker-item.ql-selected {
            background: #f4f6fb;
            color: #23275a;
          }

          #superadmin-legal-toolbar button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 50px;
            border-radius: 8px;
          }

          #superadmin-legal-toolbar button:hover,
          #superadmin-legal-toolbar button.ql-active {
            background: #eef2f8;
            color: #23275a;
          }

          .superadmin-quill-editor .ql-editor {
            min-height: 290px;
            font-size: 14px;
            line-height: 1.8;
            color: #23275a;
            padding: 16px;
          }

          .superadmin-quill-editor .ql-editor h1,
          .superadmin-quill-editor .ql-editor h2,
          .superadmin-quill-editor .ql-editor h3,
          .superadmin-quill-editor .ql-editor h4 {
            color: #16123e;
            font-weight: 600;
            line-height: 1.333333;
            margin: 0 0 10px;
          }

          .superadmin-quill-editor .ql-editor h2 {
            font-size: 24px;
          }

          .superadmin-quill-editor .ql-editor h3 {
            font-size: 20px;
          }

          .superadmin-quill-editor .ql-editor h4 {
            font-size: 18px;
          }

          .superadmin-quill-editor .ql-editor.ql-blank::before {
            color: #b0b6c8;
            font-style: normal;
            left: 16px;
          }

          .superadmin-quill-editor .ql-container.ql-snow,
          .superadmin-quill-editor .ql-toolbar.ql-snow {
            border: 0;
          }

          #superadmin-legal-toolbar .ql-picker {
            color: #7e84a3;
          }

          #superadmin-legal-toolbar .ql-stroke {
            stroke: currentColor;
          }

          #superadmin-legal-toolbar .ql-fill {
            fill: currentColor;
          }
        `}</style>
      </div>
    </SuperadminSettingsShell>
  );
}
