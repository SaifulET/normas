"use client";

/* eslint-disable @next/next/no-img-element */

import "quill/dist/quill.snow.css";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { getAdminUsers, type AdminUserSummary } from "@/lib/admin-users-api";
import { getApiErrorMessage } from "@/lib/api";
import {
  createSuperadminNotice,
  deleteNoticeEditorImage,
  deleteSuperadminNotice,
  getSuperadminNotice,
  getSuperadminNotices,
  retryFailedNoticeEmails,
  updateSuperadminNotice,
  uploadNoticeEditorImage,
  type Notice,
  type NoticeTargetType,
} from "@/lib/notice-api";
import { SuperadminBackLink, SuperadminPageHeader } from "./shell";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type NoticeFormTargetType = Exclude<NoticeTargetType, "custom">;

const targetOptions: Array<{ label: string; value: NoticeFormTargetType }> = [
  { label: "Investors", value: "investor" },
  { label: "Investees", value: "investee" },
  { label: "All", value: "all" },
];

type QuillConstructor = (typeof import("quill"))["default"];
type QuillInstance = InstanceType<QuillConstructor>;

const emptyEditorHtml = "<p><br></p>";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseEmails(value: string) {
  return value
    .split(/[\s,;]+/)
    .map(normalizeEmail)
    .filter(Boolean);
}

function sanitizeNoticeHtml(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|iframe|object|embed|link|meta|style)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|iframe|object|embed|link|meta|style)\b[^>]*\/?>/gi, "")
    .replace(/\s(?:on[a-z]+)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi, "");
}

function stripNoticeHtml(html: string) {
  if (typeof window === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const element = document.createElement("div");
  element.innerHTML = sanitizeNoticeHtml(html);
  return element.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function extractNoticeImageKeys(html: string) {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  const element = document.createElement("div");
  element.innerHTML = sanitizeNoticeHtml(html);
  const keys = new Set<string>();

  element.querySelectorAll("img[src]").forEach((image) => {
    const src = image.getAttribute("src") ?? "";

    try {
      const url = new URL(src);
      const key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));

      if (key.startsWith("notices/")) {
        keys.add(key);
      }
    } catch {
      if (src.startsWith("notices/")) {
        keys.add(src);
      }
    }
  });

  return keys;
}

function formatDate(value?: string) {
  if (!value) {
    return "Not published";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not published";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getCreatorName(notice: Notice) {
  if (!notice.createdBy || typeof notice.createdBy === "string") {
    return "Super Admin";
  }

  return notice.createdBy.name || notice.createdBy.email || "Super Admin";
}

function getStatusClassName(status: Notice["status"]) {
  switch (status) {
    case "published":
      return "bg-[#D6F8E3] text-[#0F9F5D]";
    case "processing":
      return "bg-[#E8F1FF] text-[#2563EB]";
    case "partially_failed":
      return "bg-[#FFE9D9] text-[#F97316]";
    case "archived":
      return "bg-[#EFF1F5] text-[#667085]";
    default:
      return "bg-[#EFF1F5] text-[#667085]";
  }
}

function getTargetLabel(targetType: NoticeTargetType) {
  if (targetType === "custom") {
    return "Email only";
  }

  if (targetType === "all") {
    return "All";
  }

  return targetType === "investee" ? "Investee" : "Investor";
}

function getStatsTotal(notice: Notice) {
  const stats = notice.emailStats;
  return stats?.total ?? ((stats?.pending ?? 0) + (stats?.queued ?? 0) + (stats?.sent ?? 0) + (stats?.failed ?? 0));
}

function NoticeStats({ notice }: { notice: Notice }) {
  const stats = notice.emailStats ?? {};

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {[
        ["Queued", stats.queued ?? 0],
        ["Sent", stats.sent ?? 0],
        ["Failed", stats.failed ?? 0],
        ["Total", getStatsTotal(notice)],
      ].map(([label, value]) => (
        <div key={label} className="rounded-[8px] bg-[#F6F7FA] px-2 py-2">
          <p className="text-[14px] font-semibold text-[#202350]">{value}</p>
          <p className="mt-0.5 text-[10px] text-[#8A91AB]">{label}</p>
        </div>
      ))}
    </div>
  );
}

function NoticeEmailSummary({ notice }: { notice: Notice }) {
  const stats = notice.emailStats ?? {};

  return (
    <div className="flex flex-wrap gap-2 text-[11px] text-[#69729A]">
      <span>Queued {stats.queued ?? 0}</span>
      <span>Sent {stats.sent ?? 0}</span>
      <span>Failed {stats.failed ?? 0}</span>
      <span>Total {getStatsTotal(notice)}</span>
    </div>
  );
}

function NoticeRichTextEditor({
  initialHtml = emptyEditorHtml,
  onChange,
  toolbarId,
}: {
  initialHtml?: string;
  onChange: (html: string) => void;
  toolbarId: string;
}) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillInstance | null>(null);
  const uploadedKeysRef = useRef(new Set<string>());
  const previousKeysRef = useRef(new Set<string>());
  const initialHtmlRef = useRef(initialHtml || emptyEditorHtml);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function setupQuill() {
      if (!editorRef.current || quillRef.current) {
        return;
      }

      const quillModule = await import("quill");
      const Quill = quillModule.default;

      if (!mounted || !editorRef.current) {
        return;
      }

      const quill = new Quill(editorRef.current, {
        modules: {
          toolbar: {
            container: `#${toolbarId}`,
            handlers: {
              image: () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = async () => {
                  const file = input.files?.[0];

                  if (!file || !quillRef.current) {
                    return;
                  }

                  setUploadingImage(true);

                  try {
                    const response = await uploadNoticeEditorImage(file);
                    const range = quillRef.current.getSelection(true);
                    quillRef.current.insertEmbed(range?.index ?? quillRef.current.getLength(), "image", response.data.url, "user");
                    quillRef.current.setSelection((range?.index ?? quillRef.current.getLength()) + 1, 0);
                    uploadedKeysRef.current.add(response.data.key);
                    previousKeysRef.current.add(response.data.key);
                  } catch (error) {
                    window.alert(getApiErrorMessage(error, "Unable to upload image."));
                  } finally {
                    setUploadingImage(false);
                  }
                };
                input.click();
              },
            },
          },
        },
        placeholder: "Write the notice body...",
        theme: "snow",
      });

      quill.root.innerHTML = initialHtmlRef.current || emptyEditorHtml;
      previousKeysRef.current = extractNoticeImageKeys(quill.root.innerHTML);
      quill.on("text-change", () => {
        const nextHtml = quill.root.innerHTML;
        const nextKeys = extractNoticeImageKeys(nextHtml);
        const removedUploadedKeys = [...previousKeysRef.current].filter(
          (key) => uploadedKeysRef.current.has(key) && !nextKeys.has(key),
        );

        previousKeysRef.current = nextKeys;
        removedUploadedKeys.forEach((key) => {
          uploadedKeysRef.current.delete(key);
          void deleteNoticeEditorImage(key);
        });
        onChange(nextHtml);
      });

      quillRef.current = quill;
      onChange(quill.root.innerHTML);
    }

    void setupQuill();

    return () => {
      mounted = false;

      if (quillRef.current) {
        quillRef.current.off("text-change");
        quillRef.current = null;
      }
    };
  }, [onChange, toolbarId]);

  useEffect(() => {
    if (!quillRef.current) {
      initialHtmlRef.current = initialHtml || emptyEditorHtml;
      return;
    }

    const nextHtml = initialHtml || emptyEditorHtml;

    if (quillRef.current.root.innerHTML !== nextHtml) {
      quillRef.current.root.innerHTML = nextHtml;
      previousKeysRef.current = extractNoticeImageKeys(nextHtml);
      onChange(nextHtml);
    }
  }, [initialHtml, onChange]);

  return (
    <section className="overflow-hidden rounded-[12px] border border-[#DDE2EC] bg-white">
      <div id={toolbarId} className="notice-quill-toolbar flex flex-wrap items-center gap-2 border-b border-[#EEF1F6] bg-[#F8FAFC] px-3 py-2 text-[#69729A]">
        <select className="ql-header rounded-[6px] bg-white px-2 py-1 text-[11px]" defaultValue="">
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
          <option value="">Paragraph</option>
        </select>
        <select className="ql-size" defaultValue="">
          <option value="small">Small</option>
          <option value="">Normal</option>
          <option value="large">Large</option>
          <option value="huge">Huge</option>
        </select>
        <button type="button" className="ql-bold" aria-label="Bold" />
        <button type="button" className="ql-italic" aria-label="Italic" />
        <button type="button" className="ql-underline" aria-label="Underline" />
        <select className="ql-color" aria-label="Text color" />
        <button type="button" className="ql-link" aria-label="Insert link" />
        <button type="button" className="ql-image" aria-label="Upload image" />
        <button type="button" className="ql-list" value="ordered" aria-label="Ordered list" />
        <button type="button" className="ql-list" value="bullet" aria-label="Bullet list" />
        <button type="button" className="ql-indent" value="-1" aria-label="Decrease indent" />
        <button type="button" className="ql-indent" value="+1" aria-label="Increase indent" />
        <select className="ql-align" aria-label="Text alignment" />
        <button type="button" className="ql-blockquote" aria-label="Blockquote" />
        <button type="button" className="ql-clean" aria-label="Clear formatting" />
      </div>

      {uploadingImage ? (
        <div className="border-b border-[#EEF1F6] bg-[#F8FAFC] px-4 py-2 text-[12px] font-medium text-[#5E568E]">
          Uploading image to S3...
        </div>
      ) : null}

      <div ref={editorRef} className="notice-quill-editor min-h-[260px]" />

      <style jsx global>{`
        .notice-quill-toolbar.ql-toolbar {
          border: 0;
          font-family: inherit;
        }

        .notice-quill-toolbar button {
          align-items: center;
          border-radius: 7px;
          display: inline-flex;
          height: 30px;
          justify-content: center;
          width: 30px;
        }

        .notice-quill-toolbar .ql-picker {
          align-items: center;
          display: inline-flex;
          height: 30px;
          color: #69729a;
        }

        .notice-quill-toolbar .ql-picker.ql-header {
          width: 126px;
        }

        .notice-quill-toolbar .ql-picker.ql-size {
          width: 104px;
        }

        .notice-quill-toolbar .ql-picker-label {
          align-items: center;
          border: 1px solid #dde2ec;
          border-radius: 7px;
          display: flex;
          height: 30px;
          padding-left: 10px;
          padding-right: 26px;
        }

        .notice-quill-toolbar .ql-picker-options {
          border-color: #dde2ec;
          border-radius: 8px;
          box-shadow: 0 14px 30px rgba(31, 35, 61, 0.12);
          padding: 6px;
        }

        .notice-quill-toolbar button:hover,
        .notice-quill-toolbar button.ql-active {
          background: #eef2f8;
          color: #202350;
        }

        .notice-quill-editor .ql-container.ql-snow {
          border: 0;
        }

        .notice-quill-editor .ql-editor {
          min-height: 260px;
          padding: 18px;
          color: #202350;
          font-size: 14px;
          line-height: 1.8;
        }

        .notice-quill-editor .ql-editor img {
          max-width: 100%;
          border-radius: 10px;
          margin: 12px 0;
        }

        .notice-rich-content {
          color: #4e5574;
          font-size: 14px;
          line-height: 1.8;
        }

        .notice-rich-content h1,
        .notice-rich-content h2,
        .notice-rich-content h3 {
          color: #202350;
          font-weight: 700;
          line-height: 1.25;
          margin: 18px 0 10px;
        }

        .notice-rich-content h1 {
          font-size: 30px;
        }

        .notice-rich-content h2 {
          font-size: 24px;
        }

        .notice-rich-content h3 {
          font-size: 20px;
        }

        .notice-rich-content p,
        .notice-rich-content ul,
        .notice-rich-content ol,
        .notice-rich-content blockquote {
          margin: 12px 0;
        }

        .notice-rich-content ul,
        .notice-rich-content ol {
          padding-left: 24px;
        }

        .notice-rich-content a {
          color: #314b6b;
          font-weight: 600;
          text-decoration: underline;
        }

        .notice-rich-content img {
          max-width: 100%;
          border-radius: 12px;
          margin: 16px 0;
        }
      `}</style>
    </section>
  );
}

function NoticeForm({
  onCreated,
}: {
  onCreated: (notice: Notice) => void;
}) {
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState(emptyEditorHtml);
  const [recipientInput, setRecipientInput] = useState("");
  const [recipientSearchResults, setRecipientSearchResults] = useState<AdminUserSummary[]>([]);
  const [recipientSearchLoading, setRecipientSearchLoading] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [targetType, setTargetType] = useState<NoticeFormTargetType | "">("investor");
  const [title, setTitle] = useState("");

  useEffect(() => {
    const query = recipientInput.trim();

    if (query.length < 2 || query.includes("@")) {
      return;
    }

    let active = true;
    const timeout = window.setTimeout(() => {
      setRecipientSearchLoading(true);
      getAdminUsers({ limit: 8, search: query })
        .then((response) => {
          if (!active) {
            return;
          }

          const selected = new Set(selectedEmails);
          setRecipientSearchResults(
            (response.data.users ?? []).filter((user) => user.email && !selected.has(normalizeEmail(user.email))),
          );
        })
        .catch(() => {
          if (active) {
            setRecipientSearchResults([]);
          }
        })
        .finally(() => {
          if (active) {
            setRecipientSearchLoading(false);
          }
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [recipientInput, selectedEmails]);

  function addRecipientEmails(values: string[]) {
    const nextEmails = values.map(normalizeEmail).filter(Boolean);
    const invalidEmail = nextEmails.find((email) => !emailPattern.test(email));

    if (invalidEmail) {
      setErrorMessage(`Invalid recipient email: ${invalidEmail}`);
      return false;
    }

    setErrorMessage("");
    setSelectedEmails((current) => [...new Set([...current, ...nextEmails])]);
    setTargetType("");
    setRecipientInput("");
    setRecipientSearchResults([]);
    return true;
  }

  function removeRecipientEmail(email: string) {
    setSelectedEmails((current) => current.filter((item) => item !== email));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!title.trim() || !stripNoticeHtml(message)) {
      setErrorMessage("Title and message are required.");
      return;
    }

    if (recipientInput.trim() && !addRecipientEmails(parseEmails(recipientInput))) {
      return;
    }

    const customRecipientEmails = recipientInput.trim()
      ? [...new Set([...selectedEmails, ...parseEmails(recipientInput)])]
      : selectedEmails;

    const resolvedTargetType: NoticeTargetType = targetType || "custom";

    if (resolvedTargetType === "custom" && customRecipientEmails.length === 0) {
      setErrorMessage("Select an audience or add at least one email recipient.");
      return;
    }

    setSaving(true);

    try {
      const response = await createSuperadminNotice({
        customRecipientEmails,
        message: message.trim(),
        targetType: resolvedTargetType,
        title: title.trim(),
      });

      onCreated(response.data);
      setTitle("");
      setMessage(emptyEditorHtml);
      setTargetType("investor");
      setSelectedEmails([]);
      setRecipientInput("");
      setRecipientSearchResults([]);
      setSuccessMessage("Notice accepted and recipients are being processed.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to create notice."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[12px] border border-[#E2E5EE] bg-white p-5 shadow-[0_14px_45px_-34px_rgba(31,35,61,0.35)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-[#202350]">Create notice</h2>
          <p className="mt-1 text-[12px] text-[#69729A]">Publish an announcement to selected dashboard users.</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#161616] px-5 text-[12px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Publishing..." : "Publish notice"}
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-end">
        <label className="block">
          <span className="mb-2 block text-[12px] font-semibold text-[#202350]">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value.slice(0, 180))}
            placeholder="Write a notice title"
            className="h-11 w-full rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[13px] text-[#202350] outline-none focus:border-[#5E568E]"
          />
        </label>

        <div>
          <span className="mb-2 block text-[12px] font-semibold text-[#202350]">Audience</span>
          <div className="grid grid-cols-3 rounded-[8px] bg-[#F2F4F8] p-1">
            {targetOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTargetType((current) => (current === option.value ? "" : option.value))}
                className={cx(
                  "rounded-[6px] px-3 py-2 text-[12px] font-semibold transition",
                  targetType === option.value ? "bg-white text-[#202350] shadow-sm" : "text-[#7E86A3]",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <span className="mb-2 block text-[12px] font-semibold text-[#202350]">Additional email recipients</span>
        <div className="relative">
          <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-[8px] border border-[#DDE2EC] bg-white px-3 py-2 focus-within:border-[#5E568E]">
            {selectedEmails.map((email) => (
              <span key={email} className="inline-flex items-center gap-2 rounded-full bg-[#EEF2F8] px-3 py-1 text-[12px] font-medium text-[#202350]">
                {email}
                <button
                  type="button"
                  onClick={() => removeRecipientEmail(email)}
                  className="text-[#69729A] transition hover:text-[#202350]"
                  aria-label={`Remove ${email}`}
                >
                  x
                </button>
              </span>
            ))}
            <input
              value={recipientInput}
              onChange={(event) => {
                const nextValue = event.target.value;
                setRecipientInput(nextValue);

                if (parseEmails(nextValue).some((email) => emailPattern.test(email))) {
                  setTargetType("");
                }
              }}
              onBlur={() => {
                if (recipientInput.trim()) {
                  addRecipientEmails(parseEmails(recipientInput));
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === "," || event.key === ";") {
                  event.preventDefault();
                  addRecipientEmails(parseEmails(recipientInput));
                }

                if (event.key === "Backspace" && !recipientInput && selectedEmails.length > 0) {
                  removeRecipientEmail(selectedEmails[selectedEmails.length - 1]);
                }
              }}
              placeholder={selectedEmails.length ? "Add another email or search user" : "Type an email, paste emails, or search users"}
              className="h-7 min-w-[220px] flex-1 bg-transparent text-[13px] text-[#202350] outline-none placeholder:text-[#9AA1B6]"
            />
          </div>

          {(recipientSearchResults.length > 0 || recipientSearchLoading) && recipientInput.trim().length >= 2 && !recipientInput.includes("@") ? (
            <div className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-[8px] border border-[#DDE2EC] bg-white p-2 shadow-[0_18px_45px_rgba(31,35,61,0.16)]">
              {recipientSearchLoading ? (
                <p className="px-3 py-2 text-[12px] text-[#69729A]">Searching users...</p>
              ) : (
                recipientSearchResults.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      if (user.email) {
                        addRecipientEmails([user.email]);
                      }
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-[7px] px-3 py-2 text-left transition hover:bg-[#F6F7FA]"
                  >
                    <span>
                      <span className="block text-[12px] font-semibold text-[#202350]">{user.name || user.email}</span>
                      <span className="block text-[11px] text-[#69729A]">{user.email}</span>
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9AA1B6]">{user.role}</span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
        <p className="mt-2 text-[11px] text-[#69729A]">
          Adding an email clears the audience. Select an audience again to send both.
        </p>
      </div>

      <div>
        <span className="mb-2 block text-[12px] font-semibold text-[#202350]">Message</span>
        <NoticeRichTextEditor
          initialHtml={message}
          onChange={setMessage}
          toolbarId="notice-create-toolbar"
        />
      </div>

      {errorMessage ? <p className="text-[12px] font-medium text-[#D92D20]">{errorMessage}</p> : null}
      {successMessage ? <p className="text-[12px] font-medium text-[#159953]">{successMessage}</p> : null}
    </form>
  );
}

export function SuperadminNoticesClient() {
  const router = useRouter();
  const [actionMessage, setActionMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [workingNoticeId, setWorkingNoticeId] = useState("");

  useEffect(() => {
    let active = true;

    async function loadNotices() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getSuperadminNotices({ limit: 50 });

        if (active) {
          setNotices(response.data.notices ?? []);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, "Unable to load notices."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadNotices();

    return () => {
      active = false;
    };
  }, []);

  async function handleDelete(noticeId: string) {
    const confirmed = window.confirm("Delete this notice? This will remove related notice images from AWS S3.");

    if (!confirmed) {
      return;
    }

    setWorkingNoticeId(noticeId);
    setActionMessage("");
    setErrorMessage("");

    try {
      await deleteSuperadminNotice(noticeId);
      setNotices((items) => items.filter((notice) => notice._id !== noticeId));
      setActionMessage("Notice deleted successfully.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to delete notice."));
    } finally {
      setWorkingNoticeId("");
    }
  }

  async function handleRetry(noticeId: string) {
    setWorkingNoticeId(noticeId);
    setActionMessage("");
    setErrorMessage("");

    try {
      const response = await retryFailedNoticeEmails(noticeId);
      setNotices((items) =>
        items.map((notice) =>
          notice._id === noticeId
            ? { ...notice, emailStats: response.data.emailStats ?? notice.emailStats }
            : notice,
        ),
      );
      setActionMessage(`${response.data.queued ?? 0} failed email jobs queued for retry.`);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to retry failed emails."));
    } finally {
      setWorkingNoticeId("");
    }
  }

  return (
    <section className="space-y-6">
      <SuperadminPageHeader title="Notices" subtitle="Create and manage platform announcements." />

      {errorMessage ? (
        <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B42318]">
          {errorMessage}
        </div>
      ) : null}
      {actionMessage ? (
        <div className="rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-[13px] text-[#15803D]">
          {actionMessage}
        </div>
      ) : null}

      <NoticeForm onCreated={(notice) => setNotices((items) => [notice, ...items])} />

      <section className="overflow-hidden rounded-[12px] border border-[#E2E5EE] bg-white shadow-[0_14px_45px_-34px_rgba(31,35,61,0.35)]">
        <div className="flex items-center justify-between gap-4 border-b border-[#EDF0F5] px-5 py-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[#202350]">All notices</h2>
            <p className="mt-1 text-[12px] text-[#69729A]">Click a row to open details. Use actions to edit or delete.</p>
          </div>
          <span className="rounded-full bg-[#F3F6FA] px-3 py-1 text-[12px] font-semibold text-[#69729A]">
            {notices.length} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1060px] w-full text-left">
            <thead className="bg-[#FBFCFE] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
              <tr>
                <th className="px-5 py-4">Notice</th>
                <th className="px-5 py-4">Audience</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Published</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F6] text-[12px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#69729A]">Loading notices...</td>
                </tr>
              ) : notices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#69729A]">No notices created yet.</td>
                </tr>
              ) : (
                notices.map((notice) => (
                  <tr
                    key={notice._id}
                    onClick={() => router.push(`/superadmin/dashboard/notices/${notice._id}`)}
                    className="cursor-pointer transition hover:bg-[#F8FAFC]"
                  >
                    <td className="max-w-[420px] px-5 py-4">
                      <p className="line-clamp-1 text-[13px] font-semibold text-[#202350]">{notice.title}</p>
                      <p className="mt-1 line-clamp-1 text-[12px] text-[#69729A]">{stripNoticeHtml(notice.message)}</p>
                      <p className="mt-1 text-[10px] text-[#9AA1B6]">By {getCreatorName(notice)}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-[#525B79]">{getTargetLabel(notice.targetType)}</td>
                    <td className="px-5 py-4">
                      <span className={cx("inline-flex rounded-full px-2 py-1 text-[10px] font-medium", getStatusClassName(notice.status))}>
                        {notice.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <NoticeEmailSummary notice={notice} />
                    </td>
                    <td className="px-5 py-4 text-[#69729A]">{formatDate(notice.publishedAt || notice.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/superadmin/dashboard/notices/${notice._id}?edit=1`}
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-[6px] border border-[#DDE2EC] px-3 py-2 text-[11px] font-semibold text-[#525B79] transition hover:bg-[#F6F7FA]"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleRetry(notice._id);
                          }}
                          disabled={workingNoticeId === notice._id || (notice.emailStats?.failed ?? 0) === 0}
                          className="rounded-[6px] border border-[#DDE2EC] px-3 py-2 text-[11px] font-semibold text-[#525B79] transition hover:bg-[#F6F7FA] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          Retry
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDelete(notice._id);
                          }}
                          disabled={workingNoticeId === notice._id}
                          className="rounded-[6px] border border-[#F3C9C9] px-3 py-2 text-[11px] font-semibold text-[#C24141] transition hover:bg-[#FFF5F5] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

export function SuperadminNoticeDetailClient({ noticeId }: { noticeId: string }) {
  const searchParams = useSearchParams();
  const [editing, setEditing] = useState(() => searchParams.get("edit") === "1");
  const [editMessage, setEditMessage] = useState(emptyEditorHtml);
  const [editTitle, setEditTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadNotice() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getSuperadminNotice(noticeId);

        if (active) {
          setNotice(response.data);
          setEditTitle(response.data.title);
          setEditMessage(response.data.message || emptyEditorHtml);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, "Unable to load this notice."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadNotice();

    return () => {
      active = false;
    };
  }, [noticeId]);

  async function handleSaveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!notice) {
      return;
    }

    if (!editTitle.trim() || !stripNoticeHtml(editMessage)) {
      setErrorMessage("Title and message are required.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await updateSuperadminNotice(notice._id, {
        message: editMessage,
        title: editTitle.trim(),
      });

      setNotice(response.data);
      setEditTitle(response.data.title);
      setEditMessage(response.data.message || emptyEditorHtml);
      setEditing(false);
      setSuccessMessage("Notice updated successfully.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to update notice."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-[12px] bg-white px-5 py-10 text-center text-[13px] text-[#69729A]">Loading notice...</div>;
  }

  if (errorMessage || !notice) {
    return (
      <section className="space-y-5">
        <SuperadminBackLink href="/superadmin/dashboard/notices" />
        <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B42318]">
          {errorMessage || "Notice not found."}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start gap-4">
        <SuperadminBackLink href="/superadmin/dashboard/notices" />
        <SuperadminPageHeader
          title={notice.title}
          subtitle={`${getTargetLabel(notice.targetType)} notice published ${formatDate(notice.publishedAt || notice.createdAt)}`}
          actionArea={
            <button
              type="button"
              onClick={() => setEditing((current) => !current)}
              className="inline-flex h-9 items-center justify-center rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[12px] font-semibold text-[#525B79] transition hover:bg-[#F6F7FA]"
            >
              {editing ? "View" : "Edit"}
            </button>
          }
        />
      </div>

      {successMessage ? (
        <div className="rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-[13px] text-[#15803D]">
          {successMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B42318]">
          {errorMessage}
        </div>
      ) : null}

      {editing ? (
        <form onSubmit={handleSaveEdit} className="space-y-5 rounded-[12px] border border-[#E2E5EE] bg-white p-5">
          <label className="block">
            <span className="mb-2 block text-[12px] font-semibold text-[#202350]">Title</span>
            <input
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value.slice(0, 180))}
              className="h-11 w-full rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[13px] text-[#202350] outline-none focus:border-[#5E568E]"
            />
          </label>

          <div>
            <span className="mb-2 block text-[12px] font-semibold text-[#202350]">Message</span>
            <NoticeRichTextEditor
              initialHtml={editMessage}
              onChange={setEditMessage}
              toolbarId="notice-edit-toolbar"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setEditTitle(notice.title);
                setEditMessage(notice.message || emptyEditorHtml);
                setEditing(false);
              }}
              className="rounded-[8px] border border-[#DDE2EC] bg-white px-4 py-2 text-[12px] font-semibold text-[#525B79] transition hover:bg-[#F6F7FA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-[8px] bg-[#161616] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      ) : null}

      <div className={cx("grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]", editing && "hidden")}>
        <article className="overflow-hidden rounded-[12px] border border-[#E2E5EE] bg-white">
          {notice.image?.url ? (
            <img src={notice.image.url} alt="" className="aspect-[16/9] w-full object-cover" />
          ) : null}
          <div className="space-y-4 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cx("inline-flex rounded-full px-2 py-1 text-[10px] font-medium", getStatusClassName(notice.status))}>
                {notice.status.replace("_", " ")}
              </span>
              <span className="inline-flex rounded-full bg-[#F3F6FA] px-2 py-1 text-[10px] font-medium text-[#525B79]">
                {getTargetLabel(notice.targetType)}
              </span>
            </div>
            <div
              className="notice-rich-content"
              dangerouslySetInnerHTML={{ __html: sanitizeNoticeHtml(notice.message) }}
            />
          </div>
        </article>

        <aside className="space-y-5">
          <div className="rounded-[12px] border border-[#E2E5EE] bg-white p-5">
            <h2 className="text-[14px] font-semibold text-[#202350]">Email delivery</h2>
            <div className="mt-4">
              <NoticeStats notice={notice} />
            </div>
          </div>

          <div className="rounded-[12px] border border-[#E2E5EE] bg-white p-5">
            <h2 className="text-[14px] font-semibold text-[#202350]">Recent failures</h2>
            <div className="mt-4 space-y-3">
              {(notice.failedEmails ?? []).length === 0 ? (
                <p className="text-[12px] text-[#69729A]">No failed email deliveries.</p>
              ) : (
                notice.failedEmails?.map((failure) => (
                  <div key={failure._id || failure.recipientEmail} className="rounded-[8px] bg-[#FFF7F7] px-3 py-3">
                    <p className="text-[12px] font-semibold text-[#9F1D1D]">{failure.recipientEmail}</p>
                    <p className="mt-1 text-[11px] leading-5 text-[#B42318]">{failure.lastError || "Delivery failed"}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
