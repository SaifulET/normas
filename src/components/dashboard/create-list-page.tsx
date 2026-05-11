"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api";
import { createList, getList, updateList, type ListStatus } from "@/lib/list-api";
import { DashboardPageHeader } from "./page-header";
import {
  createCreatedListId,
  deleteCreatedListBanner,
  getCreatedListBannerBlob,
  getMaxActiveCreatedLists,
  getMaxCreatedLists,
  type CreatedListAdditionalDetail,
  type CreatedListBanner,
  type CreatedListItem,
  loadCreatedLists,
  persistCreatedLists,
  saveCreatedListBanner,
} from "./created-list-storage";
import { mapApiListToCreatedListItem } from "./list-mappers";

type CreateListForm = {
  active: boolean;
  additionalDetails: CreatedListAdditionalDetail[];
  banner: CreatedListBanner | null;
  country: string;
  description: string;
  fundingTarget: string;
  keyword: string;
  sector: string;
  stage: string;
  title: string;
};

const defaultForm: CreateListForm = {
  active: false,
  additionalDetails: [
    { label: "Asking Price", value: "$45,000" },
    { label: "Revenue Model", value: "Subscription" },
    { label: "Region", value: "United Kingdom" },
  ],
  banner: null,
  country: "",
  description: "",
  fundingTarget: "0.00",
  keyword: "",
  sector: "",
  stage: "",
  title: "",
};

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#667085]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 16V7" />
      <path d="m8.5 10.5 3.5-3.5 3.5 3.5" />
      <path d="M7 17.5H6a3.5 3.5 0 1 1 .7-6.9A5.5 5.5 0 0 1 17.3 9a4 4 0 1 1 .7 8H17" />
    </svg>
  );
}

function EditorButton({
  active = false,
  compact = false,
  label,
  onMouseDown,
  onClick,
}: {
  active?: boolean;
  compact?: boolean;
  label: string;
  onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      onClick={onClick}
      className={`inline-flex ${compact ? "h-6 min-w-6 px-1.5 text-[11px]" : "h-7 min-w-7 px-2 text-[12px]"} items-center justify-center rounded-[3px] border font-medium leading-none transition ${
        active
          ? "border-[#8C8F94] bg-[#E9ECEF] text-[#1D2327]"
          : "border-[#C3C4C7] bg-white text-[#50575E] hover:bg-[#F6F7F7]"
      }`}
    >
      {label}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-0.5 h-5 w-px bg-[#DCDCDE]" aria-hidden="true" />;
}

function readEditorFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function isRichTextEmpty(value: string) {
  const plainText = value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return plainText.length === 0;
}

function RichTextEditor({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [mode, setMode] = useState<"visual" | "text">("visual");
  const [advancedOpen, setAdvancedOpen] = useState(true);
  const [toolbarState, setToolbarState] = useState({
    block: "p",
    bold: false,
    italic: false,
    justifyCenter: false,
    justifyLeft: false,
    justifyRight: false,
    orderedList: false,
    quote: false,
    underline: false,
    unorderedList: false,
  });

  useEffect(() => {
    if (mode !== "visual" || !editorRef.current) {
      return;
    }

    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [mode, value]);

  const selectionInsideEditor = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    return editor.contains(range.commonAncestorContainer);
  }, []);

  const saveCurrentSelection = useCallback(() => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || !selectionInsideEditor()) {
      return;
    }

    savedRangeRef.current = selection.getRangeAt(0).cloneRange();
  }, [selectionInsideEditor]);

  const restoreSelection = () => {
    const selection = window.getSelection();

    if (!selection || !savedRangeRef.current) {
      return;
    }

    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  };

  const refreshToolbarState = useCallback(() => {
    if (mode !== "visual" || !selectionInsideEditor()) {
      return;
    }

    try {
      const blockValue = document.queryCommandValue("formatBlock");
      const normalizedBlock = typeof blockValue === "string" ? blockValue.replace(/[<>]/g, "").toLowerCase() : "p";

      setToolbarState({
        block: normalizedBlock || "p",
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyRight: document.queryCommandState("justifyRight"),
        orderedList: document.queryCommandState("insertOrderedList"),
        quote: normalizedBlock === "blockquote",
        underline: document.queryCommandState("underline"),
        unorderedList: document.queryCommandState("insertUnorderedList"),
      });
    } catch {
      // Ignore unsupported command-state reads.
    }
  }, [mode, selectionInsideEditor]);

  useEffect(() => {
    if (mode !== "visual") {
      return () => undefined;
    }

    const handleSelectionChange = () => {
      saveCurrentSelection();
      refreshToolbarState();
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [mode, refreshToolbarState, saveCurrentSelection]);

  const syncFromEditor = () => {
    if (!editorRef.current) {
      return;
    }

    onChange(editorRef.current.innerHTML);
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const handleToolbarMouseDown = (event: React.MouseEvent<HTMLButtonElement | HTMLSelectElement>) => {
    event.preventDefault();
    saveCurrentSelection();
  };

  const runCommand = (command: string, commandValue?: string) => {
    focusEditor();
    restoreSelection();
    document.execCommand(command, false, commandValue);
    syncFromEditor();
    refreshToolbarState();
    saveCurrentSelection();
  };

  const insertHtml = (html: string) => {
    focusEditor();
    restoreSelection();
    document.execCommand("insertHTML", false, html);
    syncFromEditor();
    refreshToolbarState();
    saveCurrentSelection();
  };

  const insertLink = () => {
    saveCurrentSelection();
    const url = window.prompt("Enter link URL");

    if (!url) {
      return;
    }

    runCommand("createLink", url);
  };

  const insertImageFromUrl = () => {
    saveCurrentSelection();
    const url = window.prompt("Enter image URL");

    if (!url) {
      return;
    }

    runCommand("insertImage", url);
  };

  const handleMediaFile = async (file: File) => {
    const src = await readEditorFile(file);

    if (!src) {
      return;
    }

    if (file.type.startsWith("image/")) {
      insertHtml(`<img src="${src}" alt="${file.name}" style="max-width: 100%; height: auto;" />`);
      return;
    }

    insertHtml(
      `<p><a href="${src}" download="${file.name}" style="color:#314B6B;text-decoration:underline;">${file.name}</a></p>`,
    );
  };

  return (
    <section className="overflow-hidden rounded-[8px] border border-[#D0D5DD] bg-white">
      <div className="border-b border-[#DCDCDE] bg-[#F6F7F7]">
        <div className="flex items-center justify-between gap-3 border-b border-[#DCDCDE] px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onMouseDown={handleToolbarMouseDown}
              onClick={() => mediaInputRef.current?.click()}
              className="inline-flex h-7 items-center justify-center rounded-[3px] border border-[#C3C4C7] bg-white px-3 text-[12px] font-medium text-[#50575E] transition hover:bg-[#F6F7F7]"
            >
              Add Media
            </button>
          </div>

          <div className="flex items-center gap-0">
            <button
              type="button"
              onClick={() => setMode("visual")}
              className={`inline-flex h-8 items-center justify-center border px-3 text-[12px] font-medium transition ${
                mode === "visual"
                  ? "border-[#C3C4C7] border-b-white bg-white text-[#1D2327]"
                  : "border-[#DCDCDE] bg-[#F6F7F7] text-[#646970]"
              }`}
            >
              Visual
            </button>
            <button
              type="button"
              onClick={() => setMode("text")}
              className={`-ml-px inline-flex h-8 items-center justify-center border px-3 text-[12px] font-medium transition ${
                mode === "text"
                  ? "border-[#C3C4C7] border-b-white bg-white text-[#1D2327]"
                  : "border-[#DCDCDE] bg-[#F6F7F7] text-[#646970]"
              }`}
            >
              Text
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 px-4 py-2">
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            <select
              value={toolbarState.block}
              onMouseDown={handleToolbarMouseDown}
              onChange={(event) => runCommand("formatBlock", event.target.value)}
              className="h-7 rounded-[3px] border border-[#C3C4C7] bg-white px-2 text-[12px] font-medium text-[#50575E] outline-none"
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="blockquote">Quote</option>
            </select>
            <ToolbarDivider />
            <EditorButton active={toolbarState.bold} label="B" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("bold")} />
            <EditorButton active={toolbarState.italic} label="I" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("italic")} />
            <ToolbarDivider />
            <EditorButton active={toolbarState.unorderedList} label="≣" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("insertUnorderedList")} />
            <EditorButton active={toolbarState.orderedList} label="☷" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("insertOrderedList")} />
            <ToolbarDivider />
            <EditorButton active={toolbarState.quote} label="❝" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("formatBlock", "blockquote")} />
            <ToolbarDivider />
            <EditorButton active={toolbarState.justifyLeft} label="⫷" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("justifyLeft")} />
            <EditorButton active={toolbarState.justifyCenter} label="☰" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("justifyCenter")} />
            <EditorButton active={toolbarState.justifyRight} label="⫸" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("justifyRight")} />
            <ToolbarDivider />
            <EditorButton label="🔗" onMouseDown={handleToolbarMouseDown} onClick={insertLink} />
            <EditorButton label="⛓" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("unlink")} />
            <EditorButton label="▣" onMouseDown={handleToolbarMouseDown} onClick={insertImageFromUrl} />
            <EditorButton label="▤" onMouseDown={handleToolbarMouseDown} onClick={() => setAdvancedOpen((current) => !current)} />
          </div>

          <div className="flex items-center pt-1">
            <button
              type="button"
              onMouseDown={handleToolbarMouseDown}
              onClick={() => setAdvancedOpen((current) => !current)}
              className="inline-flex h-7 w-7 items-center justify-center text-[20px] leading-none text-[#646970] transition hover:text-[#1D2327]"
              aria-label={advancedOpen ? "Hide advanced toolbar" : "Show advanced toolbar"}
            >
              ×
            </button>
          </div>
        </div>

        {advancedOpen ? (
          <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
            <EditorButton compact label="ABC" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("removeFormat")} />
            <EditorButton compact active={toolbarState.underline} label="A" onMouseDown={handleToolbarMouseDown} onClick={() => colorInputRef.current?.click()} />
            <EditorButton compact label="—" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("insertHorizontalRule")} />
            <EditorButton compact label="⌫" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("removeFormat")} />
            <EditorButton compact label="⌁" onMouseDown={handleToolbarMouseDown} onClick={() => insertHtml("&Omega;")} />
            <EditorButton compact label="⇤" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("outdent")} />
            <EditorButton compact label="⇥" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("indent")} />
            <EditorButton compact label="↶" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("undo")} />
            <EditorButton compact label="↷" onMouseDown={handleToolbarMouseDown} onClick={() => runCommand("redo")} />
            <EditorButton
              compact
              label="?"
              onMouseDown={handleToolbarMouseDown}
              onClick={() => window.alert("Use Visual mode to format content and Text mode to edit the raw HTML.")}
            />
          </div>
        ) : null}

        <input
          ref={mediaInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              void handleMediaFile(file);
            }

            event.target.value = "";
          }}
        />

        <input
          ref={colorInputRef}
          type="color"
          className="sr-only"
          onChange={(event) => runCommand("foreColor", event.target.value)}
        />
      </div>

      <div className="relative min-h-[290px] border-t border-[#DCDCDE] bg-white">
        {mode === "visual" ? (
          <>
            {isRichTextEmpty(value) ? (
              <div className="pointer-events-none absolute left-8 top-6 text-[14px] text-[#98A2B3]">
                Write the project description here
              </div>
            ) : null}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={() => {
                syncFromEditor();
                refreshToolbarState();
                saveCurrentSelection();
              }}
              onKeyUp={() => {
                refreshToolbarState();
                saveCurrentSelection();
              }}
              onMouseUp={() => {
                refreshToolbarState();
                saveCurrentSelection();
              }}
              className="relative min-h-[290px] w-full border-0 bg-transparent px-8 py-6 text-left text-[14px] leading-7 text-[#1D2327] outline-none"
              style={{ textAlign: "left" }}
            />
          </>
        ) : (
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="min-h-[290px] w-full resize-y border-0 bg-white px-8 py-6 font-mono text-left text-[13px] leading-7 text-[#1D2327] outline-none"
          />
        )}
      </div>
    </section>
  );
}

function AdditionalDetailsRow({
  detail,
  onChange,
  onRemove,
}: {
  detail: CreatedListAdditionalDetail;
  onChange: (value: CreatedListAdditionalDetail) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-3 border-t border-[#E4E7EC] px-4 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_140px_auto] sm:items-center">
      <input
        type="text"
        value={detail.label}
        onChange={(event) => onChange({ ...detail, label: event.target.value })}
        placeholder="Label"
        className="h-8 border-0 bg-transparent px-0 text-sm text-[#344054] outline-none placeholder:text-[#98A2B3]"
      />
      <input
        type="text"
        value={detail.value}
        onChange={(event) => onChange({ ...detail, value: event.target.value })}
        placeholder="Value"
        className="h-8 border-0 bg-transparent px-0 text-right text-sm text-[#344054] outline-none placeholder:text-[#98A2B3]"
      />
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-8 w-8 items-center justify-center text-sm font-medium text-[#667085] transition hover:text-[#1E2746]"
      >
        ×
      </button>
    </div>
  );
}

function buildFormFromItem(item: CreatedListItem): CreateListForm {
  return {
    active: item.active,
    additionalDetails: item.additionalDetails,
    banner: item.banner,
    country: item.country,
    description: item.description,
    fundingTarget: item.fundingTarget.replace(/[^\d.]/g, "") || "0.00",
    keyword: item.keyword,
    sector: item.sector,
    stage: item.stage,
    title: item.title,
  };
}

function updateStoredList(item: CreatedListItem) {
  const existing = loadCreatedLists();
  const nextItems = existing.some((current) => current.id === item.id)
    ? existing.map((current) => (current.id === item.id ? item : current))
    : [item, ...existing];

  persistCreatedLists(nextItems);
}

export function CreateListPage({ listId }: { listId?: string }) {
  const router = useRouter();
  const isEditMode = Boolean(listId);
  const [form, setForm] = useState<CreateListForm>(defaultForm);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [initialItem, setInitialItem] = useState<CreatedListItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(listId));
  const [isSaving, setIsSaving] = useState(false);

  const updateField = <K extends keyof CreateListForm>(key: K, value: CreateListForm[K]) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  useEffect(() => {
    if (!listId) {
      return;
    }

    let active = true;

    const loadEditableList = async () => {
      setLoading(true);

      try {
        const response = await getList(listId);

        if (!response.data) {
          throw new Error(response.message ?? "List not found.");
        }

        const nextItem = mapApiListToCreatedListItem(response.data);

        if (!active) {
          return;
        }

        setInitialItem(nextItem);
        setForm(buildFormFromItem(nextItem));
        setError("");
      } catch (loadError) {
        if (!active) {
          return;
        }

        const fallbackItem = loadCreatedLists().find((item) => item.id === listId) ?? null;

        if (fallbackItem) {
          setInitialItem(fallbackItem);
          setForm(buildFormFromItem(fallbackItem));
          setError("");
        } else {
          setError(getApiErrorMessage(loadError, "Unable to load list for editing."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadEditableList();

    return () => {
      active = false;
    };
  }, [listId]);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    if (bannerFile || !form.banner || form.banner.kind !== "asset") {
      return () => undefined;
    }

    const loadBannerAsset = async () => {
      try {
        const blob = await getCreatedListBannerBlob(form.banner?.kind === "asset" ? form.banner.id : "");

        if (!active || !blob) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setBannerPreviewUrl(objectUrl);
      } catch {
        if (active) {
          setBannerPreviewUrl(null);
        }
      }
    };

    void loadBannerAsset();

    return () => {
      active = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [bannerFile, form.banner]);

  const handleBannerSelect = async (file: File) => {
    setError("");

    if (!isEditMode && form.banner?.kind === "asset") {
      await deleteCreatedListBanner(form.banner);
    }

    const nextBanner = await saveCreatedListBanner(file);
    const objectUrl = URL.createObjectURL(file);

    setBannerFile(file);
    setBannerPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return objectUrl;
    });

    updateField("banner", nextBanner);
  };

  const resetForm = async () => {
    if (isEditMode && listId) {
      router.push(`/investee-dashboard/created-list/${listId}`);
      return;
    }

    if (form.banner?.kind === "asset") {
      await deleteCreatedListBanner(form.banner);
    }

    setBannerPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return null;
    });

    setForm(defaultForm);
    setBannerFile(null);
    setError("");
  };

  const handleSave = async () => {
    if (isSaving) {
      return;
    }

    const trimmedTitle = form.title.trim();
    const trimmedKeyword = form.keyword.trim();
    const trimmedDescription = form.description.trim();
    const trimmedCountry = form.country.trim();
    const trimmedStage = form.stage.trim();
    const trimmedSector = form.sector.trim();
    const trimmedFundingTarget = form.fundingTarget.trim();
    const cleanedDetails = form.additionalDetails.filter((detail) => detail.label.trim() || detail.value.trim());
    const existing = loadCreatedLists();
    const fundingTarget = Number(trimmedFundingTarget.replace(/[^\d.]/g, "") || 0);

    if (!trimmedTitle || !trimmedCountry || !trimmedStage || !trimmedSector) {
      setError("Title, country, stage, and sector are required.");
      return;
    }

    if (!Number.isFinite(fundingTarget)) {
      setError("Funding target must be a valid number.");
      return;
    }

    if (!isEditMode && existing.length >= getMaxCreatedLists()) {
      setError(`You can create up to ${getMaxCreatedLists()} lists only.`);
      return;
    }

    const active = isEditMode ? form.active : existing.filter((item) => item.active).length < getMaxActiveCreatedLists();
    const status: ListStatus = active ? "activated" : "deactivated";
    const formData = new FormData();

    if (bannerFile) {
      formData.append("bannerImage", bannerFile);
    }

    formData.append("title", trimmedTitle);
    formData.append("country", trimmedCountry);
    formData.append("stage", trimmedStage);
    formData.append("sector", trimmedSector);
    formData.append("fundingTarget", String(fundingTarget));
    formData.append("keyword", trimmedKeyword);
    formData.append("description", trimmedDescription);
    formData.append(
      "additionalDetails",
      JSON.stringify(
        cleanedDetails.map((detail) => ({
          key: detail.label.trim(),
          value: detail.value.trim(),
        })),
      ),
    );
    formData.append("status", status);

    setError("");
    setIsSaving(true);

    try {
      const response = isEditMode && listId ? await updateList(listId, formData, status) : await createList(formData);

      if (response.success === false) {
        throw new Error(response.message ?? `Unable to ${isEditMode ? "update" : "create"} list. Please try again.`);
      }
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, `Unable to ${isEditMode ? "update" : "create"} list. Please try again.`));
      setIsSaving(false);
      return;
    }

    const nextItem: CreatedListItem = {
      id: initialItem?.id ?? createCreatedListId(),
      title: trimmedTitle,
      country: trimmedCountry,
      stage: trimmedStage,
      sector: trimmedSector,
      fundingTarget: trimmedFundingTarget ? `£${trimmedFundingTarget}` : "£0.00",
      keyword: trimmedKeyword || "project listing",
      description: trimmedDescription || "Project description will appear here once added.",
      createdAt: initialItem?.createdAt ?? new Date().toISOString(),
      active,
      banner: form.banner,
      additionalDetails: cleanedDetails,
      viewCount: initialItem?.viewCount,
    };

    if (isEditMode) {
      updateStoredList(nextItem);
      router.push(`/investee-dashboard/created-list/${nextItem.id}`);
      return;
    }

    persistCreatedLists([nextItem, ...existing]);
    router.push("/investee-dashboard/created-list");
  };

  if (loading) {
    return (
      <section className="rounded-[24px] border border-[#E6EBF3] bg-white px-6 py-12 text-center text-sm text-[#667085] shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]">
        Loading list editor...
      </section>
    );
  }

  if (isEditMode && !initialItem) {
    return (
      <section className="space-y-6">
        <button
          type="button"
          onClick={() => router.push("/investee-dashboard/created-list")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#314B6B]"
        >
          Back to created list
        </button>
        <div className="rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
          {error || "Unable to load list for editing."}
        </div>
      </section>
    );
  }

  const bannerDisplayUrl = bannerPreviewUrl ?? (form.banner?.kind === "path" ? form.banner.src : null);

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title={isEditMode ? "Edit List" : "Create List"}
        subtitle={isEditMode ? "Update your pitch details and banner image" : "You can create up to 5 lists, only 3 can be active at a time"}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              void resetForm();
            }}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E4E7EC] bg-white px-4 text-sm font-medium text-[#344054] transition hover:bg-[#F8FAFC]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              void handleSave();
            }}
            disabled={isSaving}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#314B6B] px-4 text-sm font-semibold text-white transition hover:bg-[#243B5A] disabled:cursor-wait disabled:opacity-70"
          >
            {isSaving ? "Saving..." : isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </DashboardPageHeader>

      <div className="mx-auto max-w-[900px] space-y-6">
        <div className="rounded-[28px] border border-dashed border-[#CBD5E1] bg-white p-5 shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)] sm:p-8">
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  void handleBannerSelect(file);
                }

                event.target.value = "";
              }}
            />

            {bannerDisplayUrl ? (
              <div className="space-y-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bannerDisplayUrl} alt="Project banner preview" className="h-[260px] w-full rounded-[22px] object-cover" />
                <div className="flex justify-center">
                  <span className="inline-flex items-center rounded-full bg-[#F8FAFC] px-4 py-2 text-sm font-medium text-[#344054]">
                    Change banner image
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[230px] flex-col items-center justify-center text-center">
                <UploadIcon />
                <h2 className="mt-5 text-[1.85rem] font-semibold tracking-[-0.03em] text-[#1E2746]">
                  Upload banner image for the project
                </h2>
                <span className="mt-5 inline-flex items-center rounded-full bg-[#F8FAFC] px-5 py-2 text-sm font-medium text-[#344054] shadow-[0_8px_20px_-18px_rgba(16,24,40,0.35)]">
                  Upload Image
                </span>
                <p className="mt-3 text-xs text-[#667085]">JPEG, or PNG</p>
              </div>
            )}
          </label>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-[#E6EBF3] bg-white shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]">
          <div className="border-b border-[#E9EEF5] px-5 py-5 sm:px-6">
            <h2 className="text-lg font-semibold text-[#1E2746]">Fill the information</h2>
          </div>

          <div className="space-y-5 px-5 py-6 sm:px-6">
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#667085]">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Write the title"
                className="h-11 w-full rounded-[10px] border border-[#E4E7EC] bg-white px-4 text-sm text-[#344054] outline-none transition placeholder:text-[#98A2B3] focus:border-[#B9C6D8]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#667085]">Country</label>
                <select
                  value={form.country}
                  onChange={(event) => updateField("country", event.target.value)}
                  className="h-11 w-full rounded-[10px] border border-[#E4E7EC] bg-white px-4 text-sm text-[#344054] outline-none transition focus:border-[#B9C6D8]"
                >
                  <option value="">Select country</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Kenya">Kenya</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#667085]">Stage</label>
                <select
                  value={form.stage}
                  onChange={(event) => updateField("stage", event.target.value)}
                  className="h-11 w-full rounded-[10px] border border-[#E4E7EC] bg-white px-4 text-sm text-[#344054] outline-none transition focus:border-[#B9C6D8]"
                >
                  <option value="">Select stage</option>
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Growth">Growth</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#667085]">Sector</label>
              <select
                value={form.sector}
                onChange={(event) => updateField("sector", event.target.value)}
                className="h-11 w-full rounded-[10px] border border-[#E4E7EC] bg-white px-4 text-sm text-[#344054] outline-none transition focus:border-[#B9C6D8]"
              >
                <option value="">Select sector</option>
                <option value="Climate Tech">Climate Tech</option>
                <option value="Clean Energy">Clean Energy</option>
                <option value="FinTech">FinTech</option>
                <option value="Sustainable Agriculture">Sustainable Agriculture</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#667085]">Funding Target</label>
              <div className="flex h-11 items-center rounded-[10px] border border-[#E4E7EC] bg-white px-4">
                <span className="mr-3 text-xl text-[#475467]">£</span>
                <input
                  type="text"
                  value={form.fundingTarget}
                  onChange={(event) => updateField("fundingTarget", event.target.value)}
                  placeholder="0.00"
                  className="w-full border-0 bg-transparent text-sm text-[#344054] outline-none placeholder:text-[#98A2B3]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#667085]">Keyword</label>
              <input
                type="text"
                value={form.keyword}
                onChange={(event) => updateField("keyword", event.target.value)}
                placeholder="Write a keyword"
                className="h-11 w-full rounded-[10px] border border-[#E4E7EC] bg-white px-4 text-sm text-[#344054] outline-none transition placeholder:text-[#98A2B3] focus:border-[#B9C6D8]"
              />
            </div>
          </div>
        </section>

        <RichTextEditor value={form.description} onChange={(value) => updateField("description", value)} />

        <section className="overflow-hidden rounded-[12px] border border-[#E4E7EC] bg-white shadow-[0_12px_40px_-36px_rgba(30,39,70,0.45)]">
          <div className="flex items-center justify-between gap-4 border-b border-[#E9EEF5] bg-[#F8FAFC] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#1E2746]">Additional details</h2>
            <button
              type="button"
              onClick={() =>
                updateField("additionalDetails", [...form.additionalDetails, { label: "New detail", value: "" }])
              }
              className="inline-flex items-center text-sm font-medium text-[#344054] transition hover:text-[#1E2746]"
            >
              + Add info
            </button>
          </div>

          <div>
            {form.additionalDetails.map((detail, index) => (
              <AdditionalDetailsRow
                key={`${index}-${detail.label}`}
                detail={detail}
                onChange={(value) =>
                  updateField(
                    "additionalDetails",
                    form.additionalDetails.map((item, currentIndex) => (currentIndex === index ? value : item)),
                  )
                }
                onRemove={() =>
                  updateField(
                    "additionalDetails",
                    form.additionalDetails.filter((_, currentIndex) => currentIndex !== index),
                  )
                }
              />
            ))}
          </div>
        </section>

        {error ? (
          <div className="rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
            {error}
          </div>
        ) : null}
      </div>
    </section>
  );
}
