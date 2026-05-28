"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAdminUserDetails,
  updateAdminUserAccountStatus,
  type AdminAccountStatus,
  type AdminKyc,
  type AdminPitch,
  type AdminUserDetailsData,
} from "@/lib/admin-users-api";
import { getApiErrorMessage } from "@/lib/api";
import { SuperadminAvatar, SuperadminStatusBadge } from "./shell";

type UserDetailTab = "profile" | "kyc" | "pitch" | "viewPitch";

const STATUS_OPTIONS: AdminAccountStatus[] = ["pending", "active", "inactive"];

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatDate(value?: string | null) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value?: number) {
  if (typeof value !== "number") return "N/A";
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "USD",
  }).format(value);
}

const ENCODED_HTML_TAG_PATTERN = /&lt;\/?[a-z][\s\S]*?&gt;/i;
const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*?>/i;

function decodeBasicHtmlEntities(value: string) {
  return value
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeDescriptionHtml(description?: string) {
  const trimmedDescription = description?.trim();
  if (!trimmedDescription) return "";

  return ENCODED_HTML_TAG_PATTERN.test(trimmedDescription)
    ? decodeBasicHtmlEntities(trimmedDescription)
    : trimmedDescription;
}

function sanitizeDescriptionHtml(description?: string) {
  const normalizedDescription = normalizeDescriptionHtml(description);
  if (!normalizedDescription) return "";

  const html = HTML_TAG_PATTERN.test(normalizedDescription)
    ? normalizedDescription
    : escapeHtml(normalizedDescription)
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
        .join("");

  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, "")
    .replace(/\s(?:on[a-z]+)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi, "");
}

function getDescriptionText(description?: string) {
  const normalizedDescription = normalizeDescriptionHtml(description);
  if (!normalizedDescription) return "";

  return decodeBasicHtmlEntities(normalizedDescription)
    .replace(/<\s*br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isInvestorProfile(profile?: { accountType?: string; role?: string }) {
  return (profile?.accountType || profile?.role || "").trim().toLowerCase() === "investor";
}

function getInitials(name?: string, email?: string) {
  const source = name?.trim() || email?.split("@")[0] || "User";
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getGradientSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }

  const palettes = [
    ["#5B8DEF", "#34C759"],
    ["#EF7A1A", "#7C3AED"],
    ["#0EA5E9", "#F97316"],
    ["#16A34A", "#64748B"],
    ["#DB2777", "#2563EB"],
  ] as const;

  return palettes[Math.abs(hash) % palettes.length];
}

function getFileName(url: string) {
  try {
    const parsedUrl = new URL(url);
    return decodeURIComponent(parsedUrl.pathname.split("/").filter(Boolean).pop() || "Document");
  } catch {
    return url.split("/").filter(Boolean).pop() || "Document";
  }
}

function InfoField({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#4B5563]">{label}</p>
      <div className="mt-3 border-b border-[#AEB4C3] pb-2 text-[14px] text-[#202350]">{value || "N/A"}</div>
    </div>
  );
}

function StatusSelect({
  disabled,
  onChange,
  value,
}: {
  disabled?: boolean;
  onChange: (status: AdminAccountStatus) => void;
  value?: string;
}) {
  const safeValue = STATUS_OPTIONS.includes(value as AdminAccountStatus) ? (value as AdminAccountStatus) : "pending";

  return (
    <select
      value={safeValue}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as AdminAccountStatus)}
      className="h-9 rounded-[8px] border border-[#DDE2EC] bg-white px-3 text-[12px] text-[#34395B] outline-none transition disabled:cursor-wait disabled:opacity-60"
      aria-label="Update account status"
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      ))}
    </select>
  );
}

function DocumentRow({ label, url }: { label: string; url?: string | null }) {
  return (
    <div>
      <p className="mb-3 text-[12px] text-[#27324A]">{label}</p>
      <div className="rounded-[12px] border border-dashed border-[#D8DEE8] px-4 py-5">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mx-auto flex max-w-[320px] items-center justify-between gap-4 rounded-[10px] bg-[#F2F4F8] px-4 py-3 text-[12px] text-[#475066] transition hover:bg-[#E9EDF4]"
          >
            <span className="truncate font-medium">{getFileName(url)}</span>
            <span className="shrink-0 text-[#324B6B]">View</span>
          </a>
        ) : (
          <div className="mx-auto max-w-[320px] rounded-[10px] bg-[#F2F4F8] px-4 py-3 text-center text-[12px] text-[#9AA3B7]">
            Not submitted
          </div>
        )}
      </div>
    </div>
  );
}

function KycSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#D7DEE8] bg-white">
      <div className="border-b border-[#DCE2EC] px-5 py-4">
        <h3 className="text-[14px] font-semibold text-[#223555]">{title}</h3>
      </div>
      <div className="space-y-4 px-5 py-4">{children}</div>
    </div>
  );
}

function KycDetails({ kyc }: { kyc: AdminKyc }) {
  if (!kyc) {
    return (
      <div className="rounded-[12px] border border-[#D7DEE8] bg-white px-5 py-8 text-center text-[13px] text-[#66708D]">
        This user has not submitted KYC information yet.
      </div>
    );
  }

  const identity = kyc.personalIdentity ?? {};
  const address = kyc.addressVerification ?? {};
  const face = kyc.faceVerification ?? {};
  const funds = kyc.sourceOfFunds ?? {};

  return (
    <div className="mx-auto max-w-[680px] space-y-4">
      <KycSection title="Personal Identity">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoField label="Full Legal Name" value={identity.fullLegalName} />
          <InfoField label="Date of Birth" value={formatDate(identity.dateOfBirth as string | undefined)} />
          <InfoField label="Country of Residence" value={identity.countryOfResidence} />
          <InfoField label="Identification Type" value={identity.identificationType} />
        </div>
        <DocumentRow label="Identity Document Upload" url={identity.identityDocument as string | undefined} />
      </KycSection>

      <KycSection title="Face Verification">
        <DocumentRow label="Face Photo" url={face.facePhoto} />
        <DocumentRow label="Verification Video" url={face.verificationVideo} />
      </KycSection>

      <KycSection title="Address Verification">
        <DocumentRow label="Utility Bill Upload" url={address.utilityBill} />
        <DocumentRow label="Bank Statement Upload" url={address.bankStatement} />
      </KycSection>

      <KycSection title="Source of Funds">
        <DocumentRow label="Salary Slip" url={funds.salarySlip} />
        <DocumentRow label="Business Document" url={funds.businessDocument} />
        <DocumentRow label="Tax Returns" url={funds.taxReturns} />
      </KycSection>
    </div>
  );
}

function PitchCard({
  onView,
  pitch,
}: {
  onView: () => void;
  pitch: AdminPitch;
}) {
  const descriptionText = getDescriptionText(pitch.description) || "No description submitted.";

  return (
    <div className="overflow-hidden rounded-[10px] border border-[#DCE2EC] bg-white shadow-[0_8px_24px_rgba(31,35,61,0.05)]">
      <div
        className="h-[128px] bg-cover bg-center bg-[linear-gradient(180deg,#38B6FF_0%,#F2B93B_100%)]"
        style={pitch.bannerImage ? { backgroundImage: `url("${pitch.bannerImage}")` } : undefined}
      />
      <div className="space-y-3 p-3">
        <div className="flex gap-2 text-[9px]">
          {pitch.stage ? <span className="rounded-full bg-[#5D6B86] px-2 py-1 text-white">{pitch.stage}</span> : null}
          {pitch.sector ? <span className="rounded-full bg-[#EAF0F6] px-2 py-1 text-[#4B5563]">{pitch.sector}</span> : null}
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[16px] font-semibold text-[#27324A]">{pitch.title || "Untitled pitch"}</p>
            <p className="mt-1 text-[11px] text-[#8A91AB]">{pitch.country || "N/A"}</p>
          </div>
          <p className="text-[11px] text-[#8A91AB]">{pitch.viewCount ?? 0} views</p>
        </div>
        <p className="line-clamp-2 min-h-10 text-[12px] leading-5 text-[#66708D]">{descriptionText}</p>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.16em] text-[#8A91AB]">Funding Target</p>
            <p className="mt-1 text-[20px] font-semibold tracking-[-0.04em] text-[#27324A]">{formatCurrency(pitch.fundingTarget)}</p>
          </div>
          <button type="button" onClick={onView} className="rounded-[6px] bg-[#EF7A1A] px-3 py-1.5 text-[12px] font-medium text-white">
            View Pitch
          </button>
        </div>
      </div>
    </div>
  );
}

function PitchDetails({
  onBack,
  pitch,
}: {
  onBack: () => void;
  pitch: AdminPitch;
}) {
  const safeDescriptionHtml = useMemo(() => sanitizeDescriptionHtml(pitch.description), [pitch.description]);

  return (
    <div className="space-y-6">
      <div
        className="h-[160px] rounded-[10px] bg-cover bg-center bg-[linear-gradient(180deg,#1EA0F2_0%,#F0C14B_100%)] sm:h-[240px]"
        style={pitch.bannerImage ? { backgroundImage: `url("${pitch.bannerImage}")` } : undefined}
      />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#7D86A2]">
            <span>{pitch.country || "N/A"}</span>
            <span>/</span>
            <span>{pitch.viewCount ?? 0} views</span>
            <span>/</span>
            <span>{pitch.status || "N/A"}</span>
          </div>
          <h3 className="mt-3 text-[18px] font-semibold text-[#27324A] sm:text-[22px]">{pitch.title || "Untitled pitch"}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {pitch.stage ? <span className="rounded-full bg-[#E5E9F0] px-3 py-1 text-[11px] text-[#4B5563]">{pitch.stage}</span> : null}
            {pitch.sector ? <span className="rounded-full bg-[#E5E9F0] px-3 py-1 text-[11px] text-[#4B5563]">{pitch.sector}</span> : null}
          </div>
        </div>
        <button type="button" onClick={onBack} className="rounded-[8px] border border-[#8EA0BB] px-4 py-2 text-[12px] text-[#324B6B]">
          Back to Pitches
        </button>
      </div>
      <div className="text-[13px] text-[#7B84A0]">
        <span>Funding target</span>
        <span className="ml-3 text-[22px] font-semibold text-[#27324A]">{formatCurrency(pitch.fundingTarget)}</span>
      </div>
      <div className="space-y-5 text-[14px] leading-7 text-[#6B748F]">
        <h4 className="text-[16px] font-semibold text-[#27324A]">Pitch Details</h4>
        <div
          className="space-y-3 text-[14px] leading-7 text-[#6B748F] [&_a]:font-medium [&_a]:text-[#314B6B] [&_blockquote]:border-l-4 [&_blockquote]:border-[#D8E0EC] [&_blockquote]:pl-4 [&_h1]:text-[20px] [&_h1]:font-semibold [&_h1]:text-[#27324A] [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:text-[#27324A] [&_h3]:text-[16px] [&_h3]:font-semibold [&_h3]:text-[#27324A] [&_hr]:my-4 [&_hr]:border-[#E6EBF3] [&_img]:my-4 [&_img]:max-h-[420px] [&_img]:max-w-full [&_img]:rounded-[10px] [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-[#27324A] [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: safeDescriptionHtml || "<p>No description submitted.</p>" }}
        />
      </div>
      {pitch.additionalDetails?.length ? (
        <div className="rounded-[12px] border border-[#EDF1F6] bg-[#FBFCFE] px-4 py-3">
          <p className="text-[12px] font-medium text-[#5F6786]">Additional Details</p>
          <div className="mt-3 space-y-3 text-[12px] text-[#27324A]">
            {pitch.additionalDetails.map((detail, index) => (
              <div key={`${detail.key ?? "detail"}-${index}`} className="flex items-center justify-between gap-4">
                <span>{detail.key || "Detail"}</span>
                <span className="text-right">{detail.value || "N/A"}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SuperadminUserDetailClient({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<UserDetailTab>("profile");
  const [details, setDetails] = useState<AdminUserDetailsData | null>(null);
  const [selectedPitchId, setSelectedPitchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      setLoading(true);
      setError("");

      try {
        const response = await getAdminUserDetails(userId);
        if (!active) return;
        if (isInvestorProfile(response.data.profile)) {
          setActiveTab((currentTab) => currentTab === "pitch" || currentTab === "viewPitch" ? "profile" : currentTab);
          setSelectedPitchId(null);
        }
        setDetails(response.data);
      } catch (caughtError) {
        if (!active) return;
        setError(getApiErrorMessage(caughtError, "Unable to fetch user details"));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDetails();

    return () => {
      active = false;
    };
  }, [userId]);

  const profile = details?.profile;
  const pitches = useMemo(() => details?.pitches ?? details?.features ?? [], [details]);
  const selectedPitch = pitches.find((pitch) => pitch._id === selectedPitchId) ?? pitches[0];
  const isInvestor = isInvestorProfile(profile);

  async function handleStatusChange(status: AdminAccountStatus) {
    if (!profile || profile.accountStatus === status) return;

    const previousDetails = details;
    setUpdatingStatus(true);
    setDetails((current) => current ? { ...current, profile: { ...current.profile, accountStatus: status } } : current);

    try {
      const response = await updateAdminUserAccountStatus(profile.id, status);
      setDetails((current) => current ? { ...current, profile: { ...current.profile, ...response.data } } : current);
    } catch (caughtError) {
      setDetails(previousDetails);
      setError(getApiErrorMessage(caughtError, "Unable to update account status"));
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return <div className="pl-[52px] text-[13px] text-[#69729A]">Loading user details...</div>;
  }

  if (error && !details) {
    return (
      <div className="ml-[52px] rounded-[10px] border border-[#F4C7C7] bg-[#FFF5F5] px-4 py-3 text-[13px] text-[#B42318]">
        {error}
      </div>
    );
  }

  if (!profile || !details) {
    return <div className="pl-[52px] text-[13px] text-[#69729A]">User details are unavailable.</div>;
  }

  const [avatarFrom, avatarTo] = getGradientSeed(profile.id || profile.email || profile.name || "user");
  const profileRows = [
    ["Country", profile.country],
    ["Email", profile.gmail || profile.email],
    ["Mobile", profile.mobile],
    ["Account Type", profile.accountType || profile.role],
    ["Joining Date", formatDate(profile.joiningDate || profile.createdAt)],
    ["Age", profile.age],
    ["Tax Percentage", typeof profile.taxPercentage === "number" ? `${profile.taxPercentage}%` : undefined],
    ["Updated At", formatDate(profile.updatedAt)],
  ] as const;
  const tabs: Array<[Exclude<UserDetailTab, "viewPitch">, string]> = [
    ["profile", "Profile"],
    ["kyc", "KYC"],
    ...(!isInvestor ? ([["pitch", "Pitch"]] as Array<[Exclude<UserDetailTab, "viewPitch">, string]>) : []),
  ];

  return (
    <>
      <section className="space-y-6 pl-[52px]">
        {error ? (
          <div className="rounded-[10px] border border-[#F4C7C7] bg-[#FFF5F5] px-4 py-3 text-[13px] text-[#B42318]">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <SuperadminAvatar
              from={avatarFrom}
              to={avatarTo}
              initials={getInitials(profile.name, profile.email)}
              src={profile.profileImage || undefined}
              size={64}
            />
            <div className="pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <SuperadminStatusBadge status={profile.accountStatus || "pending"} />
                <span className="rounded-full bg-[#E5E7EB] px-2 py-1 text-[10px] font-medium capitalize text-[#4B5563]">
                  {profile.accountType || profile.role || "N/A"}
                </span>
              </div>
              <p className="mt-2 text-[22px] font-medium text-[#202350]">{profile.name || "Unnamed user"}</p>
              <p className="mt-1 text-[12px] text-[#8A91AB]">{profile.gmail || profile.email || "No email"}</p>
            </div>
          </div>

          <StatusSelect value={profile.accountStatus} disabled={updatingStatus} onChange={(status) => void handleStatusChange(status)} />
        </div>

        <div className="border-b border-[#DCE2EC]">
          <div className="flex items-center gap-8 text-[13px] text-[#202350]">
            {tabs.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id as UserDetailTab)}
                className={cx(
                  "border-b-2 pb-2 transition",
                  activeTab === id ? "border-[#324B6B] font-medium text-[#202350]" : "border-transparent text-[#5E6684]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "profile" ? (
          <div className="space-y-5">
            <div className="grid gap-x-4 gap-y-8 md:grid-cols-2">
              {profileRows.map(([label, value]) => (
                <InfoField key={label} label={label} value={value} />
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "kyc" ? <KycDetails kyc={details.kyc} /> : null}

        {!isInvestor && activeTab === "pitch" ? (
          pitches.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {pitches.map((pitch) => (
                <PitchCard
                  key={pitch._id}
                  pitch={pitch}
                  onView={() => {
                    setSelectedPitchId(pitch._id);
                    setActiveTab("viewPitch");
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[12px] border border-[#D7DEE8] bg-white px-5 py-8 text-center text-[13px] text-[#66708D]">
              This user has not created any pitches or features yet.
            </div>
          )
        ) : null}

        {!isInvestor && activeTab === "viewPitch" && selectedPitch ? (
          <PitchDetails pitch={selectedPitch} onBack={() => setActiveTab("pitch")} />
        ) : null}
      </section>
    </>
  );
}
