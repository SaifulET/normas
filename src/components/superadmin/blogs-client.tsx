"use client";

/* eslint-disable @next/next/no-img-element */

import "quill/dist/quill.snow.css";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { getApiErrorMessage } from "@/lib/api";
import {
  createSuperadminBlog,
  deleteBlogEditorImage,
  deleteSuperadminBlog,
  getSuperadminBlogs,
  updateSuperadminBlog,
  uploadBlogEditorImage,
  type Blog,
  type BlogStatus,
} from "@/lib/blog-api";
import { SuperadminPageHeader } from "./shell";

type QuillConstructor = (typeof import("quill"))["default"];
type QuillInstance = InstanceType<QuillConstructor>;

const emptyEditorHtml = "<p><br></p>";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function sanitizeBlogHtml(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|iframe|object|embed|link|meta|style)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|iframe|object|embed|link|meta|style)\b[^>]*\/?>/gi, "")
    .replace(/\s(?:on[a-z]+)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi, "");
}

function stripBlogHtml(html: string) {
  if (typeof window === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const element = document.createElement("div");
  element.innerHTML = sanitizeBlogHtml(html);
  return element.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function extractBlogImageKeys(html: string) {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  const element = document.createElement("div");
  element.innerHTML = sanitizeBlogHtml(html);
  const keys = new Set<string>();

  element.querySelectorAll("img[src]").forEach((image) => {
    const src = image.getAttribute("src") ?? "";

    try {
      const url = new URL(src);
      const key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));

      if (key.startsWith("blogs/")) {
        keys.add(key);
      }
    } catch {
      if (src.startsWith("blogs/")) {
        keys.add(src);
      }
    }
  });

  return keys;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not published";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not published"
    : new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function BlogRichTextEditor({
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
                    const response = await uploadBlogEditorImage(file);
                    const range = quillRef.current.getSelection(true);
                    const index = range?.index ?? quillRef.current.getLength();
                    quillRef.current.insertEmbed(index, "image", response.data.url, "user");
                    quillRef.current.setSelection(index + 1, 0);
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
        placeholder: "Write and design the blog body...",
        theme: "snow",
      });

      quill.root.innerHTML = initialHtmlRef.current || emptyEditorHtml;
      previousKeysRef.current = extractBlogImageKeys(quill.root.innerHTML);
      quill.on("text-change", () => {
        const nextHtml = quill.root.innerHTML;
        const nextKeys = extractBlogImageKeys(nextHtml);
        const removedUploadedKeys = [...previousKeysRef.current].filter(
          (key) => uploadedKeysRef.current.has(key) && !nextKeys.has(key),
        );

        previousKeysRef.current = nextKeys;
        removedUploadedKeys.forEach((key) => {
          uploadedKeysRef.current.delete(key);
          void deleteBlogEditorImage(key);
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
      previousKeysRef.current = extractBlogImageKeys(nextHtml);
      onChange(nextHtml);
    }
  }, [initialHtml, onChange]);

  return (
    <section className="overflow-hidden rounded-[12px] border border-[#DDE2EC] bg-white">
      <div id={toolbarId} className="blog-quill-toolbar flex flex-wrap items-center gap-2 border-b border-[#EEF1F6] bg-[#F8FAFC] px-3 py-2 text-[#69729A]">
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
          Uploading image...
        </div>
      ) : null}

      <div ref={editorRef} className="blog-quill-editor min-h-[280px]" />

      <style jsx global>{`
        .blog-quill-toolbar.ql-toolbar {
          border: 0;
          font-family: inherit;
        }

        .blog-quill-toolbar button {
          align-items: center;
          border-radius: 7px;
          display: inline-flex;
          height: 30px;
          justify-content: center;
          width: 30px;
        }

        .blog-quill-toolbar .ql-picker {
          align-items: center;
          color: #69729a;
          display: inline-flex;
          height: 30px;
        }

        .blog-quill-toolbar .ql-picker.ql-header {
          width: 126px;
        }

        .blog-quill-toolbar .ql-picker.ql-size {
          width: 104px;
        }

        .blog-quill-toolbar .ql-picker-label {
          align-items: center;
          border: 1px solid #dde2ec;
          border-radius: 7px;
          display: flex;
          height: 30px;
          padding-left: 10px;
          padding-right: 26px;
        }

        .blog-quill-toolbar button:hover,
        .blog-quill-toolbar button.ql-active {
          background: #eef2f8;
          color: #202350;
        }

        .blog-quill-editor .ql-container.ql-snow {
          border: 0;
        }

        .blog-quill-editor .ql-editor {
          color: #202350;
          font-size: 14px;
          line-height: 1.8;
          min-height: 280px;
          padding: 18px;
        }

        .blog-quill-editor .ql-editor img {
          border-radius: 10px;
          margin: 12px 0;
          max-width: 100%;
        }
      `}</style>
    </section>
  );
}

export function SuperadminBlogsClient() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [description, setDescription] = useState(emptyEditorHtml);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<BlogStatus>("published");
  const [successMessage, setSuccessMessage] = useState("");
  const [title, setTitle] = useState("");
  const handleDescriptionChange = useCallback((html: string) => setDescription(html), []);

  useEffect(() => {
    let active = true;

    async function loadBlogs() {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getSuperadminBlogs({ limit: 100 });

        if (active) {
          setBlogs(response.data.blogs ?? []);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, "Unable to load blogs."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadBlogs();

    return () => {
      active = false;
    };
  }, []);

  function resetForm() {
    setCoverImage(null);
    setDescription(emptyEditorHtml);
    setEditingBlog(null);
    setStatus("published");
    setTitle("");
  }

  function startEditing(blog: Blog) {
    setEditingBlog(blog);
    setTitle(blog.title);
    setDescription(blog.description || emptyEditorHtml);
    setStatus(blog.status);
    setCoverImage(null);
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!title.trim() || !stripBlogHtml(description)) {
      setErrorMessage("Title and description are required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        coverImage,
        description,
        status,
        title: title.trim(),
      };
      const response = editingBlog
        ? await updateSuperadminBlog(editingBlog._id, payload)
        : await createSuperadminBlog(payload);

      setBlogs((current) => {
        if (editingBlog) {
          return current.map((blog) => (blog._id === response.data._id ? response.data : blog));
        }

        return [response.data, ...current];
      });
      resetForm();
      setSuccessMessage(editingBlog ? "Blog updated successfully." : "Blog created successfully.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to save blog."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(blogId: string) {
    const confirmed = window.confirm("Delete this blog? This will remove related blog images from AWS S3.");

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteSuperadminBlog(blogId);
      setBlogs((current) => current.filter((blog) => blog._id !== blogId));
      if (editingBlog?._id === blogId) {
        resetForm();
      }
      setSuccessMessage("Blog deleted successfully.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to delete blog."));
    }
  }

  return (
    <section className="space-y-6">
      <SuperadminPageHeader title="Blogs" subtitle="Create and manage public website blog posts." />

      {errorMessage ? (
        <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[13px] text-[#B42318]">
          {errorMessage}
        </div>
      ) : null}
      {successMessage ? (
        <div className="rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-[13px] text-[#15803D]">
          {successMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-[12px] border border-[#E2E5EE] bg-white p-5 shadow-[0_14px_45px_-34px_rgba(31,35,61,0.35)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-[#202350]">{editingBlog ? "Edit blog" : "Create blog"}</h2>
            <p className="mt-1 text-[12px] text-[#69729A]">Images uploaded inside the editor are stored through the backend.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {editingBlog ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#DDE2EC] bg-white px-4 text-[12px] font-semibold text-[#525B79] transition hover:bg-[#F6F7FA]"
              >
                Cancel
              </button>
            ) : null}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#161616] px-5 text-[12px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : editingBlog ? "Save blog" : "Publish blog"}
            </button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <label className="block">
            <span className="mb-2 block text-[12px] font-semibold text-[#202350]">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value.slice(0, 180))}
              placeholder="Write a blog title"
              className="h-11 w-full rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[13px] text-[#202350] outline-none focus:border-[#5E568E]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[12px] font-semibold text-[#202350]">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as BlogStatus)}
              className="h-11 w-full rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[13px] text-[#202350] outline-none focus:border-[#5E568E]"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-[12px] font-semibold text-[#202350]">Cover image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setCoverImage(event.target.files?.[0] ?? null)}
            className="block w-full rounded-[8px] border border-[#DDE2EC] bg-white px-3 py-2 text-[13px] text-[#525B79]"
          />
          {editingBlog?.coverImage?.url && !coverImage ? (
            <img src={editingBlog.coverImage.url} alt="" className="mt-3 h-24 w-40 rounded-[8px] object-cover" />
          ) : null}
        </label>

        <div>
          <span className="mb-2 block text-[12px] font-semibold text-[#202350]">Description</span>
          <BlogRichTextEditor
            initialHtml={description}
            onChange={handleDescriptionChange}
            toolbarId="blog-editor-toolbar"
          />
        </div>
      </form>

      <section className="overflow-hidden rounded-[12px] border border-[#E2E5EE] bg-white shadow-[0_14px_45px_-34px_rgba(31,35,61,0.35)]">
        <div className="flex items-center justify-between gap-4 border-b border-[#EDF0F5] px-5 py-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[#202350]">All blogs</h2>
            <p className="mt-1 text-[12px] text-[#69729A]">Drafts stay hidden from the public Blog tab.</p>
          </div>
          <span className="rounded-full bg-[#F3F6FA] px-3 py-1 text-[12px] font-semibold text-[#69729A]">
            {blogs.length} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[860px] w-full text-left">
            <thead className="bg-[#FBFCFE] text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
              <tr>
                <th className="px-5 py-4">Blog</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Published</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F6] text-[12px]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-[#69729A]">Loading blogs...</td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-[#69729A]">No blogs created yet.</td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id} className="transition hover:bg-[#F8FAFC]">
                    <td className="max-w-[520px] px-5 py-4">
                      <div className="flex items-center gap-3">
                        {blog.coverImage?.url ? (
                          <img src={blog.coverImage.url} alt="" className="h-12 w-16 rounded-[8px] object-cover" />
                        ) : (
                          <span className="h-12 w-16 rounded-[8px] bg-[#F3F6FA]" />
                        )}
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-[13px] font-semibold text-[#202350]">{blog.title}</p>
                          <p className="mt-1 line-clamp-1 text-[12px] text-[#69729A]">{stripBlogHtml(blog.description)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cx(
                          "inline-flex rounded-full px-2 py-1 text-[10px] font-medium",
                          blog.status === "published" ? "bg-[#D6F8E3] text-[#0F9F5D]" : "bg-[#EFF1F5] text-[#667085]",
                        )}
                      >
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#69729A]">{formatDate(blog.publishedAt || blog.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(blog)}
                          className="rounded-[6px] border border-[#DDE2EC] px-3 py-2 text-[11px] font-semibold text-[#525B79] transition hover:bg-[#F6F7FA]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(blog._id)}
                          className="rounded-[6px] border border-[#F3C9C9] px-3 py-2 text-[11px] font-semibold text-[#C24141] transition hover:bg-[#FFF5F5]"
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
