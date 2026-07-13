"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import {
  getSuperadminReviewList,
  getSuperadminReviewLists,
  updateListStatus,
  type ListStatusAction,
  type ReviewListItemResponse,
} from "@/lib/list-api";
import { sanitizeHtml } from "@/components/dashboard/html-utils";
import { SuperadminBackLink, SuperadminPageHeader, SuperadminStatusBadge } from "./shell";

function formatDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatCurrency(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "N/A";
  return new Intl.NumberFormat("en", { currency: "GBP", maximumFractionDigits: 0, style: "currency" }).format(value);
}

function stripHtml(value?: string) {
  return (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function approvalLabel(value?: string) {
  switch (value) {
    case "pending_create":
      return "Pending create";
    case "pending_update":
      return "Pending update";
    case "approved":
      return "Approved";
    case "rejected_create":
      return "Rejected create";
    case "rejected_update":
      return "Rejected update";
    default:
      return value || "Unknown";
  }
}

function aiTone(item?: ReviewListItemResponse) {
  if (!item?.aiReview) return "bg-[#EFF1F5] text-[#667085]";
  if (item.aiReview.isRelevant && item.aiReview.decision === "approved") return "bg-[#D6F8E3] text-[#0F7A46]";
  if (item.aiReview.isRelevant) return "bg-[#FFF7D6] text-[#9A6700]";
  return "bg-[#FEE2E2] text-[#B42318]";
}

export function SuperadminListsClient() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState<ReviewListItemResponse[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadLists() {
      setLoading(true);
      setError("");

      try {
        const response = await getSuperadminReviewLists({
          limit: 100,
          search: query || undefined,
          status: status || undefined,
        });

        if (!active) return;
        setLists(response.data?.lists ?? []);
        setPendingCount(response.data?.pendingCount ?? 0);
      } catch (caughtError) {
        if (active) setError(getApiErrorMessage(caughtError, "Unable to load lists"));
      } finally {
        if (active) setLoading(false);
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadLists();
    }, 150);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [query, status]);

  return (
    <section className="space-y-6">
      <SuperadminPageHeader
        title="Lists"
        subtitle="Review created and edited pitch lists before they appear on the website."
        actionArea={<span className="rounded-full bg-[#FFF1D6] px-3 py-1.5 text-xs font-semibold text-[#9A4B00]">{pendingCount} pending</span>}
      />

      <div className="flex flex-col gap-3 rounded-[8px] border border-[#DDE3EE] bg-white p-4 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, keyword, or description"
          className="h-10 min-w-0 flex-1 rounded-[6px] border border-[#DDE3EE] px-3 text-sm outline-none focus:border-[#314B6B]"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 rounded-[6px] border border-[#DDE3EE] bg-white px-3 text-sm text-[#344054] outline-none focus:border-[#314B6B]"
        >
          <option value="">All status</option>
          <option value="pending">Pending</option>
          <option value="activated">Activated</option>
          <option value="deactivated">Deactivated</option>
          <option value="suspended">Suspended</option>
          <option value="under_review">Under review</option>
        </select>
      </div>

      {error ? <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">{error}</div> : null}

      <div className="overflow-hidden rounded-[8px] border border-[#DDE3EE] bg-white">
        <div className="overflow-x-auto">
          <div className="grid min-w-[800px] grid-cols-[1.4fr_0.75fr_0.75fr_0.75fr_0.45fr] gap-4 border-b border-[#E7ECF3] bg-[#F8FAFC] px-4 py-3 text-xs font-semibold text-[#667085]">
            <span>List</span>
            <span>Status</span>
            <span>Approval</span>
            <span>AI review</span>
            <span className="text-right">Action</span>
          </div>

          {loading ? (
            <div className="px-4 py-10 text-center text-sm text-[#667085]">Loading lists...</div>
          ) : lists.length ? (
            lists.map((list) => (
              <div key={list._id} className="grid min-w-[800px] grid-cols-[1.4fr_0.75fr_0.75fr_0.75fr_0.45fr] gap-4 border-b border-[#EEF2F7] px-4 py-4 text-sm last:border-b-0">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#202350]">{list.title || "Untitled list"}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-[#7B8499]">{stripHtml(list.description) || list.keyword || "No description"}</p>
                  <p className="mt-1 text-[11px] text-[#98A2B3]">{formatDate(list.updatedAt || list.createdAt)}</p>
                </div>
                <div><SuperadminStatusBadge status={list.status || "unknown"} /></div>
                <div className="text-xs text-[#5F6B7A]">{approvalLabel(list.approvalStatus)}</div>
                <div>
                  <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${aiTone(list)}`}>
                    {list.aiReview?.label || "Not checked"}
                  </span>
                </div>
                <div className="text-right">
                  <Link href={`/superadmin/dashboard/lists/${list._id}`} className="text-xs font-semibold text-[#314B6B] hover:underline">
                    Review
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-10 text-center text-sm text-[#667085]">No lists found.</div>
          )}
        </div>
      </div>
    </section>
  );
}

export function SuperadminListDetailClient({ listId }: { listId: string }) {
  const [error, setError] = useState("");
  const [list, setList] = useState<ReviewListItemResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"updated" | "previous">("updated");
  const [savingStatus, setSavingStatus] = useState<ListStatusAction | "">("");
  const hasComparableVersion = Boolean(list?.publishedContent && ["pending_update", "rejected_update"].includes(list.approvalStatus || ""));
  const mainContent = viewMode === "previous" && list?.publishedContent ? list.publishedContent : list;
  const comparisonContent = viewMode === "previous" ? list : list?.publishedContent;
  const safeDescription = useMemo(() => sanitizeHtml(mainContent?.description ?? ""), [mainContent?.description]);
  const safeComparisonDescription = useMemo(
    () => sanitizeHtml(comparisonContent?.description ?? ""),
    [comparisonContent?.description],
  );
  const aiReasons = list?.aiReview?.reasons ?? [];

  useEffect(() => {
    let active = true;

    async function loadList() {
      setLoading(true);
      setError("");

      try {
        const response = await getSuperadminReviewList(listId);
        if (active) {
          setList(response.data ?? null);
          setViewMode("updated");
        }
      } catch (caughtError) {
        if (active) setError(getApiErrorMessage(caughtError, "Unable to load list"));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadList();

    return () => {
      active = false;
    };
  }, [listId]);

  async function handleStatus(status: ListStatusAction) {
    if (savingStatus) return;

    setSavingStatus(status);
    setError("");

    try {
      const response = await updateListStatus(listId, status);
      const refreshed = await getSuperadminReviewList(response.data?._id ?? listId);
      setList(refreshed.data ?? null);
      setViewMode("updated");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to update list status"));
    } finally {
      setSavingStatus("");
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-[#667085]">Loading list review...</div>;
  }

  if (!list) {
    return (
      <section className="space-y-4">
        <SuperadminBackLink href="/superadmin/dashboard/lists" />
        <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">{error || "List not found."}</div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <SuperadminPageHeader
        title="List Review"
        subtitle="Review the submitted pitch content, AI relevance signal, and publication status."
        actionArea={<SuperadminBackLink href="/superadmin/dashboard/lists" />}
      />

      {error ? <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B42318]">{error}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="overflow-hidden rounded-[8px] border border-[#DDE3EE] bg-white">
          {mainContent?.bannerImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mainContent.bannerImage} alt={mainContent.title || "List banner"} className="h-[50vh] w-full object-fit sm:h-[50vh] md:h-[60vh] lg:h-[70vh]" />
          ) : (
            <div className="flex h-[50vh] items-center justify-center bg-[#F3F6FA] text-sm text-[#98A2B3] sm:h-[50vh] md:h-[60vh] lg:h-[70vh]">No banner uploaded</div>
          )}

          <div className="space-y-5 p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {hasComparableVersion ? (
                <span className="rounded-full bg-[#314B6B] px-2 py-1 font-semibold text-white">
                  {viewMode === "previous" ? "Previous public version" : "Updated submission"}
                </span>
              ) : null}
              <SuperadminStatusBadge status={list.status || "unknown"} />
              <span className="rounded-full bg-[#EEF2F7] px-2 py-1 text-[#667085]">{approvalLabel(list.approvalStatus)}</span>
              <span className="rounded-full bg-[#EEF2F7] px-2 py-1 text-[#667085]">{mainContent?.stage || "No stage"}</span>
              <span className="rounded-full bg-[#EEF2F7] px-2 py-1 text-[#667085]">{mainContent?.sector || "No sector"}</span>
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-[#202350]">{mainContent?.title || "Untitled list"}</h1>
              <p className="mt-2 text-sm text-[#667085]">{mainContent?.country || "No country"} · {formatCurrency(mainContent?.fundingTarget)} · {list.viewCount ?? 0} views</p>
            </div>

            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-[#202350]">Pitch Details</h2>
              <div
                className="space-y-4 text-sm leading-7 text-[#5F6B7A] [&_a]:text-[#314B6B] [&_blockquote]:border-l-4 [&_blockquote]:border-[#D8E0EC] [&_blockquote]:pl-4 [&_img]:my-4 [&_img]:max-h-[420px] [&_img]:max-w-full [&_img]:rounded-[8px] [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: safeDescription || "<p>No description submitted.</p>" }}
              />
            </section>

            {mainContent?.additionalDetails?.length ? (
              <section className="rounded-[8px] border border-[#E7ECF3]">
                {mainContent.additionalDetails.map((detail, index) => (
                  <div key={`${detail.key ?? "detail"}-${index}`} className="flex justify-between gap-4 border-b border-[#EEF2F7] px-4 py-3 text-sm last:border-b-0">
                    <span className="text-[#667085]">{detail.key || "Detail"}</span>
                    <span className="text-right font-medium text-[#202350]">{detail.value || "N/A"}</span>
                  </div>
                ))}
              </section>
            ) : null}
          </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-[8px] border border-[#DDE3EE] bg-white p-4">
            <p className="text-sm font-semibold text-[#202350]">AI relevance check</p>
            <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${aiTone(list)}`}>
              {list.aiReview?.label || "Not checked"}
            </span>
            <p className="mt-3 text-sm leading-6 text-[#667085]">{list.aiReview?.summary || "No AI review available."}</p>
            {aiReasons.length ? (
              <ul className="mt-3 space-y-2 text-xs leading-5 text-[#7B8499]">
                {aiReasons.map((reason) => <li key={reason}>- {reason}</li>)}
              </ul>
            ) : null}
          </div>

          {list.publishedContent && list.approvalStatus === "pending_update" ? (
            <div className="rounded-[8px] border border-[#F7C98B] bg-[#FFF7ED] p-4 text-sm leading-6 text-[#9A4B00]">
              This is an edited version. The older approved content stays public until you activate this update.
            </div>
          ) : null}

          {hasComparableVersion && comparisonContent ? (
            <div className="rounded-[8px] border border-[#DDE3EE] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[#202350]">
                  {viewMode === "previous" ? "Updated submission" : "Previous public version"}
                </p>
                <button
                  type="button"
                  onClick={() => setViewMode((current) => (current === "previous" ? "updated" : "previous"))}
                  className="rounded-[6px] border border-[#DDE3EE] px-2.5 py-1 text-[11px] font-semibold text-[#314B6B] hover:bg-[#F8FAFC]"
                >
                  {viewMode === "previous" ? "View updated" : "View previous"}
                </button>
              </div>
              <p className="mt-3 text-sm font-semibold text-[#314B6B]">{comparisonContent.title || "Untitled list"}</p>
              <p className="mt-1 text-xs text-[#7B8499]">
                {comparisonContent.country || "No country"} · {comparisonContent.stage || "No stage"} · {comparisonContent.sector || "No sector"}
              </p>
              <div
                className="mt-3 space-y-3 text-xs leading-5 text-[#667085] [&_a]:text-[#314B6B]"
                dangerouslySetInnerHTML={{ __html: safeComparisonDescription || "<p>No description.</p>" }}
              />
            </div>
          ) : null}

          <div className="rounded-[8px] border border-[#DDE3EE] bg-white p-4">
            <p className="text-sm font-semibold text-[#202350]">Decision</p>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                onClick={() => void handleStatus("activated")}
                disabled={Boolean(savingStatus)}
                className="h-10 rounded-[6px] bg-[#0F9F5D] px-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
              >
                {savingStatus === "activated" ? "Approving..." : "Approve and activate"}
              </button>
              <button
                type="button"
                onClick={() => void handleStatus("rejected")}
                disabled={Boolean(savingStatus)}
                className="h-10 rounded-[6px] border border-[#DDE3EE] px-3 text-sm font-semibold text-[#314B6B] disabled:cursor-wait disabled:opacity-60"
              >
                {savingStatus === "rejected" ? "Saving..." : "Do not publish"}
              </button>
              <button
                type="button"
                onClick={() => void handleStatus("suspended")}
                disabled={Boolean(savingStatus)}
                className="h-10 rounded-[6px] border border-[#FECACA] px-3 text-sm font-semibold text-[#B42318] disabled:cursor-wait disabled:opacity-60"
              >
                {savingStatus === "suspended" ? "Suspending..." : "Suspend"}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

