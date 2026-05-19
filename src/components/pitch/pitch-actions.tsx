"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import { getSavedListStatus, removeSavedList, saveList } from "@/lib/list-api";
import { useAuthStore } from "@/store";

function QueryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4.75 11.5 18.5 5.75l-5.75 13.75-1.9-5.85L4.75 11.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m10.8 13.2 7.7-7.45" strokeLinecap="round" />
    </svg>
  );
}

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
        <path d="M7.25 4.75h9.5a1.5 1.5 0 0 1 1.5 1.5v13l-6.25-3-6.25 3v-13a1.5 1.5 0 0 1 1.5-1.5Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M7.25 4.75h9.5a1.5 1.5 0 0 1 1.5 1.5v13l-6.25-3-6.25 3v-13a1.5 1.5 0 0 1 1.5-1.5Z" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M6.5 20V5.5" strokeLinecap="round" />
      <path d="M6.5 6c2.4-1.4 4.9-.2 7.1.3 1.8.4 3.2.6 4.9-.3v8c-1.7.9-3.1.7-4.9.3-2.2-.5-4.7-1.7-7.1-.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PitchActions({
  authenticated,
  listId,
  variant = "public",
}: {
  authenticated: boolean;
  listId: string;
  variant?: "dashboard" | "public";
}) {
  const userRole = useAuthStore((state) => state.user?.role);
  const [saved, setSaved] = useState(false);
  const [isCheckingSavedStatus, setIsCheckingSavedStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportText, setReportText] = useState("");

  const queryHref = authenticated ? `/dashboard/messages?listId=${encodeURIComponent(listId)}` : "/signup";
  const canSaveList = authenticated && userRole === "investor";
  const compact = variant === "dashboard";

  useEffect(() => {
    let mounted = true;

    async function loadSavedStatus() {
      if (!canSaveList) {
        setSaved(false);
        setIsCheckingSavedStatus(false);
        return;
      }

      setIsCheckingSavedStatus(true);
      setSaveMessage("");

      try {
        const response = await getSavedListStatus(listId);

        if (mounted) {
          setSaved(Boolean(response.data?.isSaved));
        }
      } catch {
        if (mounted) {
          setSaved(false);
        }
      } finally {
        if (mounted) {
          setIsCheckingSavedStatus(false);
        }
      }
    }

    loadSavedStatus();

    return () => {
      mounted = false;
    };
  }, [canSaveList, listId]);

  function closeReportModal() {
    setReportModalOpen(false);
  }

  function submitReport() {
    setReportModalOpen(false);
    setReportText("");
  }

  async function handleSaveClick() {
    if (!canSaveList) {
      setSaved(false);
      setSaveMessage("Please login as an investor first.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      if (saved) {
        await removeSavedList(listId);
        setSaved(false);
        setSaveMessage("Removed from saved lists.");
      } else {
        await saveList(listId);
        setSaved(true);
        setSaveMessage("Added to saved lists.");
      }
    } catch (error) {
      setSaveMessage(getApiErrorMessage(error, "Unable to update saved list. Please try again."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={queryHref}
            className={
              compact
                ? "inline-flex h-8 min-w-[99px] items-center justify-center gap-2 rounded-[8px] bg-[#2B425D] px-4 text-sm font-medium text-[#F9FAFB] transition hover:bg-[#243B5A]"
                : "inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-[#314B6B] px-5 text-sm font-medium text-white transition hover:bg-[#243B5A]"
            }
          >
            <QueryIcon />
            <span>Query</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSaving || isCheckingSavedStatus}
            className={
              compact
                ? `inline-flex h-8 w-8 items-center justify-center rounded-[6px] transition disabled:cursor-wait disabled:opacity-75 ${
                    saved ? "text-[#E65E02]" : "text-[#141B34] hover:bg-[#F3F4F6]"
                  }`
                : `inline-flex h-11 w-11 items-center justify-center rounded-[8px] border transition disabled:cursor-wait disabled:opacity-75 ${
                    saved
                      ? "border-[#314B6B] bg-[#314B6B] text-white"
                      : "border-[#D7DFEA] bg-white text-[#344054] hover:bg-[#F8FAFC]"
                  }`
            }
            aria-label={saved ? "Remove from saved pitches" : "Save pitch"}
            aria-pressed={saved}
          >
            <BookmarkIcon filled={saved} />
          </button>

          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className={
              compact
                ? "inline-flex h-8 w-8 items-center justify-center rounded-[6px] text-[#141B34] transition hover:bg-[#F3F4F6]"
                : "inline-flex h-11 w-11 items-center justify-center rounded-[8px] border border-[#D7DFEA] bg-white text-[#344054] transition hover:bg-[#F8FAFC]"
            }
            aria-label="Report pitch"
          >
            <FlagIcon />
          </button>
        </div>

        {saveMessage ? (
          <p className="mt-2 max-w-[250px] text-right text-xs font-medium text-[#5F6B7A] lg:ml-auto">
            {saveMessage}
          </p>
        ) : null}
      </div>

      {reportModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/20 px-4 backdrop-blur-[6px]"
          onClick={closeReportModal}
        >
          <div
            className="flex h-[416px] w-full max-w-[400px] flex-col rounded-[10px] bg-white p-5 shadow-[0_28px_60px_-24px_rgba(15,23,42,0.35)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pitch-report-title"
          >
            <h2 id="pitch-report-title" className="text-[18px] font-medium text-black">
              Write down your report
            </h2>

            <textarea
              value={reportText}
              onChange={(event) => setReportText(event.target.value.slice(0, 250))}
              maxLength={250}
              placeholder="Describe the issue (250 character limit)"
              className="mt-4 h-[236px] w-full resize-none rounded-[10px] bg-[#F3F4F6] px-4 py-3 text-sm text-[#1F2937] outline-none placeholder:text-[#8B919C]"
            />

            <div className="mt-auto flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closeReportModal}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-[10px] bg-[#F3F4F6] text-sm font-medium text-[#1F2937] transition hover:bg-[#E8EAEE]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReport}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-[10px] bg-[#314B6B] text-sm font-medium text-white transition hover:bg-[#243B5A]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
