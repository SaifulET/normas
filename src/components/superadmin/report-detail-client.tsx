"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AppIcon } from "@/components/home/icons";
import { CollapsibleDetailHtml } from "@/components/pitch/collapsible-detail-html";
import { getApiErrorMessage } from "@/lib/api";
import { getReport, type Report } from "@/lib/report-api";
import {
  SuperadminBackLink,
  SuperadminNotificationButton,
  SuperadminStatusBadge,
} from "./shell";

function normalizeReportStatus(status?: string) {
  if (status === "solved") {
    return "Resolved";
  }

  if (status === "dismiss") {
    return "Dismissed";
  }

  return "Pending";
}

function formatDate(value?: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatFundingTarget(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Not available";
  }

  return `\u00A3${value.toLocaleString("en-US")}`;
}

function getReporterName(report?: Report | null) {
  if (!report?.user || typeof report.user !== "object") {
    return "Unknown user";
  }

  return report.user.name?.trim() || report.user.email?.trim() || "Unknown user";
}

function getReporterEmail(report?: Report | null) {
  return report?.user && typeof report.user === "object" ? report.user.email?.trim() || "" : "";
}

function getReporterInitials(report?: Report | null) {
  return getReporterName(report)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";
}

function getPitchTitle(report?: Report | null) {
  if (!report?.list || typeof report.list !== "object") {
    return "Reported pitch";
  }

  return report.list.title?.trim() || "Reported pitch";
}

function getPitchImage(report?: Report | null) {
  return report?.list && typeof report.list === "object" ? report.list.bannerImage || "" : "";
}

function getPitchDescription(report?: Report | null) {
  if (!report?.list || typeof report.list !== "object") {
    return "";
  }

  return report.list.description?.trim() || "";
}

function getPitchDetails(report?: Report | null) {
  if (!report?.list || typeof report.list !== "object") {
    return [];
  }

  return report.list.additionalDetails ?? [];
}

function getPitchOwner(report?: Report | null) {
  if (!report?.list || typeof report.list !== "object" || !report.list.user || typeof report.list.user !== "object") {
    return "";
  }

  return report.list.user.name?.trim() || report.list.user.email?.trim() || "";
}

function getPitchCountry(report?: Report | null) {
  return report?.list && typeof report.list === "object" ? report.list.country || "Not available" : "Not available";
}

function getPitchViews(report?: Report | null) {
  return report?.list && typeof report.list === "object" ? report.list.viewCount ?? 0 : 0;
}

function getPitchStage(report?: Report | null) {
  return report?.list && typeof report.list === "object" ? report.list.stage || "Stage not specified" : "Stage not specified";
}

function getPitchSector(report?: Report | null) {
  return report?.list && typeof report.list === "object" ? report.list.sector || "Sector not specified" : "Sector not specified";
}

function getPitchFundingTarget(report?: Report | null) {
  return report?.list && typeof report.list === "object" ? formatFundingTarget(report.list.fundingTarget) : "Not available";
}

export function SuperadminReportDetailClient({
  reportId,
}: {
  reportId: string;
}) {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const pitchImage = getPitchImage(report);
  const pitchDescription = getPitchDescription(report);
  const pitchDetails = getPitchDetails(report);

  useEffect(() => {
    let active = true;

    const loadReport = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const response = await getReport(reportId);

        if (active) {
          setReport(response.data ?? null);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(getApiErrorMessage(error, "Unable to load report."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadReport();

    return () => {
      active = false;
    };
  }, [reportId]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <SuperadminBackLink href="/superadmin/dashboard/reports" />
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.04em] text-[#202350]">View Report</h1>
            <p className="mt-1 text-[13px] text-[#69729A]">This section will help you to view report of the pitch</p>
          </div>
        </div>
        <SuperadminNotificationButton />
      </div>

      {loading ? (
        <div className="rounded-[14px] border border-[#E6E9F0] bg-white px-6 py-10 text-center text-sm text-[#69729A]">
          Loading report...
        </div>
      ) : errorMessage ? (
        <div className="rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-4 text-sm text-[#B42318]">
          {errorMessage}
        </div>
      ) : report ? (
        <section className="space-y-6 px-1 sm:px-4 lg:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="grid gap-5 sm:grid-cols-[52px_160px_160px] sm:items-center">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#314B6B] text-sm font-semibold text-white">
                {getReporterInitials(report)}
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Date</p>
                <p className="mt-1 text-[13px] font-medium text-[#202350]">{formatDate(report.createdAt)}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Status</p>
                <div className="mt-1">
                  <SuperadminStatusBadge status={normalizeReportStatus(report.status)} />
                </div>
              </div>

              <div className="hidden sm:block" />

              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Name</p>
                <p className="mt-1 text-[13px] font-medium text-[#202350]">{getReporterName(report)}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Email</p>
                <p className="mt-1 text-[13px] font-medium text-[#202350]">{getReporterEmail(report) || "No email"}</p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 self-start rounded-[10px] border border-[#DDE2EC] bg-white px-4 text-[12px] text-[#525B79]"
            >
              <span>Status</span>
              <span className="text-[9px]">v</span>
            </button>
          </div>

          <div className="rounded-[8px] border border-[#E6A29B] bg-white px-5 py-4">
            <h2 className="text-[14px] font-semibold text-[#231F20]">Report</h2>
            <p className="mt-2 text-[13px] leading-6 text-[#2D3142]">
              {report.description || "No description provided."}
            </p>
          </div>

          {pitchImage ? (
            <Image
              src={pitchImage}
              alt={getPitchTitle(report)}
              width={1360}
              height={760}
              className="h-[260px] w-full rounded-[8px] object-cover sm:h-[330px]"
            />
          ) : null}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#7D86A2]">
                <span className="inline-flex items-center gap-1">
                  <AppIcon name="mapPin" className="h-3.5 w-3.5" />
                  {getPitchCountry(report)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <AppIcon name="view" className="h-3.5 w-3.5" />
                  {getPitchViews(report)} views
                </span>
                {getPitchOwner(report) ? <span>Owner: {getPitchOwner(report)}</span> : null}
              </div>

              <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-[#27324A]">
                {getPitchTitle(report)}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#D7DEE7] px-4 py-1.5 text-[12px] font-medium text-[#475066]">
                  {getPitchStage(report)}
                </span>
                <span className="rounded-full bg-[#D7DEE7] px-4 py-1.5 text-[12px] font-medium text-[#475066]">
                  {getPitchSector(report)}
                </span>
                <span className="text-[12px] text-[#95A0BA]">Funding target</span>
                <span className="text-[20px] font-semibold tracking-[-0.03em] text-[#27324A]">
                  {getPitchFundingTarget(report)}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-[8px] bg-[#324B6B] px-4 text-[12px] font-medium text-white"
            >
              Suspend Content
            </button>
          </div>

          <div className="max-w-[920px] space-y-6">
            <div>
              <h3 className="text-[16px] font-semibold text-[#27324A]">Equipment Details</h3>
              <div className="mt-4 text-[14px] leading-7 text-[#6B748F]">
                {pitchDescription ? (
                  <CollapsibleDetailHtml html={pitchDescription} collapse />
                ) : (
                  <p>No pitch details available.</p>
                )}
              </div>
            </div>

            <div className="rounded-[8px] border border-[#EDF1F6] bg-[#FCFDFE] px-4 py-4">
              <p className="text-[12px] font-medium text-[#5F6786]">Additional Details</p>
              <div className="mt-4 space-y-4">
                {pitchDetails.length > 0 ? (
                  pitchDetails.map((detail) => (
                    <div key={`${detail.key}-${detail.value}`} className="flex items-center justify-between gap-6 text-[13px]">
                      <span className="text-[#3F4863]">{detail.key || "Detail"}</span>
                      <span className="text-right text-[#27324A]">{detail.value || "Not available"}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between gap-6 text-[13px]">
                    <span className="text-[#3F4863]">Report ID</span>
                    <span className="text-right text-[#27324A]">{report._id}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="rounded-[14px] border border-[#E6E9F0] bg-white px-6 py-10 text-center text-sm text-[#69729A]">
          Report not found.
        </div>
      )}
    </div>
  );
}
