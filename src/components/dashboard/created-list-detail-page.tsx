"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api";
import { deleteList, getList, updateListStatus } from "@/lib/list-api";
import { DashboardIcon } from "./icons";
import { sanitizeHtml } from "./html-utils";
import { mapApiListToCreatedListItem } from "./list-mappers";
import { loadCreatedLists, persistCreatedLists, type CreatedListItem } from "./created-list-storage";

function statusLabel(item: CreatedListItem) {
  return item.status || (item.active ? "activated" : "deactivated");
}

export function CreatedListDetailPage({ listId }: { listId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [item, setItem] = useState<CreatedListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const safeDescription = useMemo(() => sanitizeHtml(item?.description ?? ""), [item?.description]);
  const bannerUrl = item?.banner?.kind === "path" ? item.banner.src : null;
  const isSuspended = item?.status === "suspended";

  useEffect(() => {
    let active = true;

    const loadList = async () => {
      setLoading(true);

      try {
        const response = await getList(listId);

        if (!active) {
          return;
        }

        if (!response.data) {
          throw new Error(response.message ?? "List not found.");
        }

        setItem(mapApiListToCreatedListItem(response.data));
        setError("");
      } catch (loadError) {
        if (active) {
          setError(getApiErrorMessage(loadError, "Unable to load list details."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadList();

    return () => {
      active = false;
    };
  }, [listId]);

  const syncStoredList = (nextItem: CreatedListItem) => {
    const existing = loadCreatedLists();
    persistCreatedLists(existing.map((current) => (current.id === nextItem.id ? nextItem : current)));
  };

  const handleStatusUpdate = async () => {
    if (!item || isUpdatingStatus) {
      return;
    }

    setError("");
    setIsUpdatingStatus(true);

    try {
      const requestedStatus = item.active ? "deactivated" : "activated";
      const response = await updateListStatus(listId, requestedStatus);
      const nextStatus = response.status ?? response.data?.status ?? requestedStatus;
      const nextItem = {
        ...item,
        active: nextStatus === "activated",
        status: nextStatus,
      };

      setItem(nextItem);
      syncStoredList(nextItem);
    } catch (statusError) {
      setError(getApiErrorMessage(statusError, "Unable to update list status."));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!item || isDeleting) {
      return;
    }

    const confirmed = window.confirm("Delete this list? This action cannot be undone.");

    if (!confirmed) {
      return;
    }

    setError("");
    setIsDeleting(true);

    try {
      const response = await deleteList(listId);

      if (response.success === false) {
        throw new Error(response.message ?? "Unable to delete list.");
      }

      persistCreatedLists(loadCreatedLists().filter((current) => current.id !== item.id));
      router.push("/investee-dashboard/created-list");
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, "Unable to delete list."));
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-[24px] border border-[#E6EBF3] bg-white px-6 py-12 text-center text-sm text-[#667085] shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]">
        Loading pitch details...
      </section>
    );
  }

  if (!item) {
    return (
      <section className="space-y-6">
        <Link href="/investee-dashboard/created-list" className="inline-flex items-center gap-2 text-sm font-semibold text-[#314B6B]">
          <DashboardIcon name="chevronLeft" className="h-4 w-4" />
          Back to created list
        </Link>
        <div className="rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
          {error || "Unable to load list details."}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/investee-dashboard/created-list"
            className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-[#314B6B] transition hover:bg-[#EEF3FA]"
            aria-label="Back to created list"
          >
            <DashboardIcon name="chevronLeft" className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-[#1E2746]">View Pitch</h1>
            <p className="mt-1 text-xs text-[#6B7280]">Details of the business</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-[18px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
          {error}
        </div>
      ) : null}

      <article className="space-y-7">
        <div className="overflow-hidden rounded-[8px] border border-[#E6EBF3] bg-[#F3F6FA]">
          {bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bannerUrl} alt={item.title} className="h-[50vh] w-full object-fit md:h-[60vh] lg:h-[70vh]" />
          ) : (
            <div className="flex h-[240px] items-center justify-center text-sm text-[#98A2B3] sm:h-[320px]">
              No banner uploaded
            </div>
          )}
        </div>

        <div className="mx-auto max-w-[1050px] space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#667085]">
                <span className="inline-flex items-center gap-1.5">
                  <DashboardIcon name="website" className="h-3.5 w-3.5" />
                  {item.country || "Unknown location"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <DashboardIcon name="views" className="h-3.5 w-3.5" />
                  {item.viewCount ?? 0} views
                </span>
                <span>{statusLabel(item)}</span>
              </div>

              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[#1E2746]">{item.title}</h2>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#D8E0EC] px-3 py-1 text-xs font-medium text-[#314B6B]">
                  {item.stage}
                </span>
                <span className="rounded-full bg-[#EDF2F7] px-3 py-1 text-xs font-medium text-[#586274]">
                  {item.sector}
                </span>
              </div>

              <div className="mt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">
                  Funding target
                </p>
                <p className="mt-1 text-sm font-semibold text-[#243B5A]">{item.fundingTarget}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/investee-dashboard/created-list/${listId}/edit`}
                className="inline-flex h-8 items-center rounded-[6px] border border-[#D8E0EC] px-3 text-xs font-semibold text-[#314B6B] transition hover:bg-[#F7F9FC]"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => {
                  void handleDelete();
                }}
                disabled={isDeleting || isUpdatingStatus}
                className="inline-flex h-8 items-center rounded-[6px] border border-[#D8E0EC] px-3 text-xs font-semibold text-[#314B6B] transition hover:bg-[#F7F9FC] disabled:cursor-wait disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleStatusUpdate();
                }}
                disabled={isDeleting || isUpdatingStatus || isSuspended}
                className="inline-flex h-8 items-center rounded-[6px] bg-[#ED6A06] px-3 text-xs font-semibold text-white transition hover:bg-[#d35f05] disabled:cursor-wait disabled:opacity-60"
              >
                {isSuspended ? "Suspended by admin" : isUpdatingStatus ? "Updating..." : item.active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>

          {isSuspended ? (
            <p className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">
              This pitch is suspended by admin. Please correct the reported issue and inform the support center to restore it.
            </p>
          ) : null}

          <section className="space-y-4">
            <h3 className="text-base font-semibold text-[#1E2746]">Equipment Details</h3>
            <div
              className="space-y-4 text-sm leading-7 text-[#5F6B7A] [&_a]:text-[#314B6B] [&_blockquote]:border-l-4 [&_blockquote]:border-[#D8E0EC] [&_blockquote]:pl-4 [&_hr]:my-4 [&_hr]:border-[#E6EBF3] [&_img]:my-4 [&_img]:max-h-[420px] [&_img]:max-w-full [&_img]:rounded-[10px] [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: safeDescription || "<p>No description provided.</p>" }}
            />
          </section>

          <section className="overflow-hidden rounded-[8px] border border-[#E6EBF3] bg-white">
            <div className="bg-[#F8FAFC] px-4 py-3">
              <h3 className="text-xs font-semibold text-[#1E2746]">Additional Details</h3>
            </div>
            <div className="divide-y divide-[#E9EEF5]">
              {item.additionalDetails.length ? (
                item.additionalDetails.map((row) => (
                  <div key={`${row.label}-${row.value}`} className="flex items-center justify-between gap-6 px-4 py-3 text-sm">
                    <span className="text-[#586274]">{row.label}</span>
                    <span className="text-right font-medium text-[#1E2746]">{row.value}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-5 text-sm text-[#667085]">No additional details provided.</div>
              )}
            </div>
          </section>
        </div>
      </article>
    </section>
  );
}
