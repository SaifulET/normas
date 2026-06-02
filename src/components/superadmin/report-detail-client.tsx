"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

function getPitchTitle(report?: Report | null) {
  if (!report?.list || typeof report.list !== "object") {
    return "Reported pitch";
  }

  return report.list.title?.trim() || "Reported pitch";
}

function getPitchImage(report?: Report | null) {
  return report?.list && typeof report.list === "object" ? report.list.bannerImage || "" : "";
}

function getPitchMeta(report?: Report | null) {
  if (!report?.list || typeof report.list !== "object") {
    return [];
  }

  return [
    ["Country", report.list.country || "Not available"],
    ["Stage", report.list.stage || "Not available"],
    ["Sector", report.list.sector || "Not available"],
    ["Funding target", typeof report.list.fundingTarget === "number" ? String(report.list.fundingTarget) : "Not available"],
  ] as const;
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
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <SuperadminBackLink href="/superadmin/dashboard/reports" />
          <div>
            <h1 className="text-[20px] font-semibold tracking-[-0.04em] text-[#202350]">View Report</h1>
            <p className="mt-1 text-[13px] text-[#69729A]">This section will help you to view report of the pitch</p>
          </div>
        </div>
        <SuperadminNotificationButton />
      </div>

      <section className="space-y-6 rounded-[26px] px-6 py-6 sm:px-8 lg:px-10">
        {loading ? (
          <div className="rounded-[14px] border border-[#E6E9F0] bg-white px-6 py-10 text-center text-sm text-[#69729A]">
            Loading report...
          </div>
        ) : errorMessage ? (
          <div className="rounded-[14px] border border-[#FECACA] bg-[#FEF2F2] px-6 py-4 text-sm text-[#B42318]">
            {errorMessage}
          </div>
        ) : report ? (
          <>
            <div className="grid gap-5 rounded-[14px] border border-[#E6E9F0] bg-white px-5 py-5 md:grid-cols-[1fr_1fr_1fr]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Reported by</p>
                <p className="mt-1 text-[14px] font-medium text-[#202350]">{getReporterName(report)}</p>
                <p className="mt-1 text-[12px] text-[#8A91AB]">{getReporterEmail(report) || "No email"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Date</p>
                <p className="mt-1 text-[14px] font-medium text-[#202350]">{formatDate(report.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Status</p>
                <div className="mt-2">
                  <SuperadminStatusBadge status={normalizeReportStatus(report.status)} />
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#E6A29B] bg-[#FFF9F8] px-6 py-5">
              <h2 className="text-[16px] font-semibold text-[#231F20]">Report</h2>
              <p className="mt-3 text-[14px] leading-7 text-[#2D3142]">{report.description || "No description provided."}</p>
            </div>

            {pitchImage ? (
              <Image
                src={pitchImage}
                alt={getPitchTitle(report)}
                width={1360}
                height={760}
                className="h-[250px] w-full rounded-[18px] object-cover sm:h-[340px]"
              />
            ) : null}

            <div className="space-y-5 rounded-[16px] border border-[#EDF1F6] bg-[#FCFDFE] px-5 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Reported pitch</p>
                <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#27324A]">{getPitchTitle(report)}</h2>
              </div>

              <div className="grid gap-4 text-[13px] sm:grid-cols-2 lg:grid-cols-4">
                {getPitchMeta(report).map(([label, value]) => (
                  <div key={label}>
                    <p className="text-[#95A0BA]">{label}</p>
                    <p className="mt-1 font-medium text-[#27324A]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-[14px] border border-[#E6E9F0] bg-white px-6 py-10 text-center text-sm text-[#69729A]">
            Report not found.
          </div>
        )}
      </section>
    </div>
  );
}
