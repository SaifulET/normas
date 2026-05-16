"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Delete02Icon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { SuperadminSettingsShell } from "./settings-general-client";
import { createFaq, deleteFaq, getFaqs, updateFaq, type Faq } from "@/lib/faq-api";

type FaqForm = {
  answer: string;
  question: string;
};

const emptyForm: FaqForm = {
  answer: "",
  question: "",
};

function normalizeFaqs(data: Awaited<ReturnType<typeof getFaqs>>["data"]) {
  if (Array.isArray(data)) {
    return data;
  }

  return data.faqs ?? [];
}

function getFaqId(faq: Faq) {
  return faq._id ?? faq.id ?? "";
}

export function FaqSettingsClient() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [form, setForm] = useState<FaqForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const hasFormContent = useMemo(
    () => form.question.trim().length > 0 && form.answer.trim().length > 0,
    [form],
  );

  useEffect(() => {
    let mounted = true;

    getFaqs()
      .then((response) => {
        if (mounted) {
          setFaqs(normalizeFaqs(response.data));
        }
      })
      .catch((loadError) => {
        if (mounted) {
          const nextMessage = loadError instanceof Error ? loadError.message : "Unable to load FAQs.";
          setError(nextMessage);
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!hasFormContent) {
      setError("Question and answer are required.");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        answer: form.answer.trim(),
        question: form.question.trim(),
      };

      const response = editingId ? await updateFaq(editingId, payload) : await createFaq(payload);
      const savedFaq = response.data;

      if (editingId) {
        setFaqs((current) =>
          current.map((faq) => (getFaqId(faq) === editingId ? { ...faq, ...savedFaq, ...payload } : faq)),
        );
        setMessage("FAQ updated successfully.");
      } else {
        setFaqs((current) => [savedFaq, ...current]);
        setMessage("FAQ created successfully.");
      }

      setEditingId(null);
      setForm(emptyForm);
    } catch (saveError) {
      const nextMessage = saveError instanceof Error ? saveError.message : "Unable to save FAQ.";
      setError(nextMessage);
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(faq: Faq) {
    const faqId = getFaqId(faq);

    if (!faqId) {
      setError("This FAQ cannot be edited because it is missing an id.");
      return;
    }

    setEditingId(faqId);
    setForm({
      answer: faq.answer,
      question: faq.question,
    });
    setError(null);
    setMessage(null);
  }

  async function handleDelete(faq: Faq) {
    const faqId = getFaqId(faq);

    if (!faqId) {
      setError("This FAQ cannot be deleted because it is missing an id.");
      return;
    }

    setDeletingId(faqId);
    setError(null);
    setMessage(null);

    try {
      await deleteFaq(faqId);
      setFaqs((current) => current.filter((item) => getFaqId(item) !== faqId));

      if (editingId === faqId) {
        setEditingId(null);
        setForm(emptyForm);
      }

      setMessage("FAQ deleted successfully.");
    } catch (deleteError) {
      const nextMessage = deleteError instanceof Error ? deleteError.message : "Unable to delete FAQ.";
      setError(nextMessage);
    } finally {
      setDeletingId(null);
    }
  }

  function handleCancel() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setMessage(null);
  }

  return (
    <SuperadminSettingsShell
      activeHref="/superadmin/dashboard/settings/faq"
      title="FAQ"
      subtitle="Manage frequently asked questions"
    >
      <div className="space-y-6">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-[18px] bg-white shadow-[0_10px_40px_rgba(31,35,61,0.06)]"
        >
          <div className="bg-[#F4F4F4] px-5 py-5 sm:px-6">
            <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-[#23275A]">
              {editingId ? "Edit FAQ" : "Create FAQ"}
            </h3>
            <p className="mt-1 text-[13px] text-[#7E84A3]">
              Add helpful questions and answers for users.
            </p>
          </div>

          <div className="space-y-4 px-5 py-5 sm:px-6">
            <label className="block">
              <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-[#4F5676]">
                Question
              </span>
              <input
                value={form.question}
                onChange={(event) => setForm((current) => ({ ...current, question: event.target.value }))}
                placeholder="What is Norman?"
                className="h-12 w-full rounded-[12px] border border-[#E1E6F0] px-4 text-[14px] text-[#23275A] outline-none transition focus:border-[#5E568E]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-[#4F5676]">
                Answer
              </span>
              <textarea
                value={form.answer}
                onChange={(event) => setForm((current) => ({ ...current, answer: event.target.value }))}
                placeholder="Norman is a platform for managing projects and related information."
                className="min-h-[120px] w-full resize-y rounded-[12px] border border-[#E1E6F0] px-4 py-3 text-[14px] leading-6 text-[#23275A] outline-none transition focus:border-[#5E568E]"
              />
            </label>

            {error ? <p className="text-[13px] font-medium text-[#D92D20]">{error}</p> : null}
            {message ? <p className="text-[13px] font-medium text-[#159953]">{message}</p> : null}
          </div>

          <div className="flex justify-end gap-3 border-t border-[#EEF1F6] px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-[10px] border border-[#D8DEEA] bg-white px-4 py-2 text-[13px] font-medium text-[#5F6786] transition hover:border-[#BFC8D9]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasFormContent || isSaving}
              className="rounded-[10px] bg-[#161616] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : editingId ? "Update FAQ" : "Create FAQ"}
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-[18px] bg-white shadow-[0_10px_40px_rgba(31,35,61,0.06)]">
          <div className="bg-[#F4F4F4] px-5 py-5 sm:px-6">
            <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-[#23275A]">FAQ List</h3>
            <p className="mt-1 text-[13px] text-[#7E84A3]">Review, edit, or delete existing FAQ entries.</p>
          </div>

          <div className="divide-y divide-[#EEF1F6]">
            {isLoading ? (
              <div className="px-5 py-6 text-[14px] text-[#7E84A3] sm:px-6">Loading FAQs...</div>
            ) : null}

            {!isLoading && faqs.length === 0 ? (
              <div className="px-5 py-6 text-[14px] text-[#7E84A3] sm:px-6">No FAQs created yet.</div>
            ) : null}

            {faqs.map((faq) => {
              const faqId = getFaqId(faq);

              return (
                <article key={faqId || faq.question} className="px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h4 className="text-[16px] font-semibold text-[#16123E]">{faq.question}</h4>
                      <p className="mt-2 text-[14px] leading-7 text-[#4E5574]">{faq.answer}</p>
                    </div>

                    <div className="flex shrink-0 gap-3 text-[#7E84A3]">
                      <button
                        type="button"
                        onClick={() => handleEdit(faq)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] transition hover:bg-[#F4F6FB] hover:text-[#5E568E]"
                        aria-label="Edit FAQ"
                      >
                        <HugeiconsIcon icon={PencilEdit02Icon} className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(faq)}
                        disabled={deletingId === faqId}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] text-[#E25A5A] transition hover:bg-[#FFF5F5] disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Delete FAQ"
                      >
                        <HugeiconsIcon icon={Delete02Icon} className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </SuperadminSettingsShell>
  );
}
