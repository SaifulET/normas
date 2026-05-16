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
      subtitle="Set privacy & policies of your website"
    >
      <div className="space-y-8">
        <div className="-mt-12 flex justify-end">
          <p className="text-[10px] text-[#8A91AB]">Last modified by Admin on Oct 24, 2023</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-5">
            <label className="block">
              <span className="mb-3 block text-[13px] font-semibold text-[#16123E]">
                Question
              </span>
              <input
                value={form.question}
                onChange={(event) => setForm((current) => ({ ...current, question: event.target.value }))}
                placeholder="Type here..."
                className="h-[68px] w-full rounded-[12px] border border-[#E1E6F0] bg-white px-5 text-[14px] text-[#23275A] outline-none transition placeholder:text-[#B8C0D2] focus:border-[#5E568E]"
              />
            </label>

            <label className="block">
              <span className="mb-3 block text-[13px] font-semibold text-[#16123E]">
                Answer
              </span>
              <textarea
                value={form.answer}
                onChange={(event) => setForm((current) => ({ ...current, answer: event.target.value }))}
                placeholder="Type here..."
                className="min-h-[150px] w-full resize-y rounded-[12px] border border-[#E1E6F0] bg-white px-5 py-4 text-[14px] leading-6 text-[#23275A] outline-none transition placeholder:text-[#B8C0D2] focus:border-[#5E568E]"
              />
            </label>

            {error ? <p className="text-[13px] font-medium text-[#D92D20]">{error}</p> : null}
            {message ? <p className="text-[13px] font-medium text-[#159953]">{message}</p> : null}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-[6px] border border-[#C9D0DE] bg-white px-4 py-2 text-[12px] font-medium text-[#5F6786] transition hover:border-[#AEB8CA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasFormContent || isSaving}
              className="rounded-[6px] bg-[#161616] px-4 py-2 text-[12px] font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>

        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-[#E4E9F2]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A91AB]">
              Display on landing page
            </p>
            <div className="h-px flex-1 bg-[#E4E9F2]" />
          </div>

          {isLoading ? (
            <div className="rounded-[12px] bg-white px-5 py-6 text-[14px] text-[#7E84A3] shadow-[0_10px_40px_rgba(31,35,61,0.06)]">
              Loading FAQs...
            </div>
          ) : null}

          {!isLoading && faqs.length === 0 ? (
            <div className="rounded-[12px] bg-white px-5 py-6 text-[14px] text-[#7E84A3] shadow-[0_10px_40px_rgba(31,35,61,0.06)]">
              No FAQs created yet.
            </div>
          ) : null}

          {faqs.map((faq) => {
            const faqId = getFaqId(faq);

            return (
              <article
                key={faqId || faq.question}
                className="rounded-[12px] bg-white px-5 py-5 shadow-[0_10px_40px_rgba(31,35,61,0.06)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-[18px] font-semibold text-[#16123E]">{faq.question}</h4>
                    <p className="mt-4 text-[13px] font-medium leading-6 text-[#4E5574]">{faq.answer}</p>
                  </div>

                  <div className="flex shrink-0 gap-3 text-[#7E84A3]">
                    <button
                      type="button"
                      onClick={() => handleEdit(faq)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] transition hover:bg-[#F4F6FB] hover:text-[#5E568E]"
                      aria-label="Edit FAQ"
                    >
                      <HugeiconsIcon icon={PencilEdit02Icon} className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(faq)}
                      disabled={deletingId === faqId}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] text-[#E25A5A] transition hover:bg-[#FFF5F5] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Delete FAQ"
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </SuperadminSettingsShell>
  );
}
