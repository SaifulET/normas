"use client";

import { useEffect, useMemo, useState } from "react";
import type { SuperadminPaymentRecord, SuperadminSupportRecord, SuperadminUserRecord } from "./data";
import { SuperadminAvatar, SuperadminStatusBadge } from "./shell";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const PROFILE_STORAGE_KEY = "earlyn.dashboard.profile";
const PROFILE_FILES_DB_NAME = "earlyn-profile-files";
const PROFILE_FILES_STORE_NAME = "files";

type StoredVerificationFile = {
  id: string;
  name: string;
  size: number;
  type: string;
};

type ProfileDraft = {
  bankStatement: StoredVerificationFile | null;
  businessDocument: StoredVerificationFile | null;
  country: string;
  dateOfBirth: string;
  facePhoto: StoredVerificationFile | null;
  faceVideo: StoredVerificationFile | null;
  fullName: string;
  identificationType: string;
  identityDocument: StoredVerificationFile | null;
  salarySlip: StoredVerificationFile | null;
  taxReturns: StoredVerificationFile | null;
  utilityBill: StoredVerificationFile | null;
};

type FileFieldKey = {
  [K in keyof ProfileDraft]: ProfileDraft[K] extends StoredVerificationFile | null ? K : never;
}[keyof ProfileDraft];

const defaultProfileDraft: ProfileDraft = {
  bankStatement: null,
  businessDocument: null,
  country: "",
  dateOfBirth: "",
  facePhoto: null,
  faceVideo: null,
  fullName: "John Doe",
  identificationType: "Passport",
  identityDocument: null,
  salarySlip: null,
  taxReturns: null,
  utilityBill: null,
};

function isStoredVerificationFile(value: unknown): value is StoredVerificationFile {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === "string" && typeof candidate.name === "string" && typeof candidate.type === "string" && typeof candidate.size === "number";
}

function hydrateProfileDraft(raw: unknown): ProfileDraft {
  if (!raw || typeof raw !== "object") return defaultProfileDraft;
  const source = raw as Record<string, unknown>;
  return {
    bankStatement: isStoredVerificationFile(source.bankStatement) ? source.bankStatement : null,
    businessDocument: isStoredVerificationFile(source.businessDocument) ? source.businessDocument : null,
    country: typeof source.country === "string" ? source.country : "",
    dateOfBirth: typeof source.dateOfBirth === "string" ? source.dateOfBirth : "",
    facePhoto: isStoredVerificationFile(source.facePhoto) ? source.facePhoto : null,
    faceVideo: isStoredVerificationFile(source.faceVideo) ? source.faceVideo : null,
    fullName: typeof source.fullName === "string" ? source.fullName : "John Doe",
    identificationType: typeof source.identificationType === "string" ? source.identificationType : "Passport",
    identityDocument: isStoredVerificationFile(source.identityDocument) ? source.identityDocument : null,
    salarySlip: isStoredVerificationFile(source.salarySlip) ? source.salarySlip : null,
    taxReturns: isStoredVerificationFile(source.taxReturns) ? source.taxReturns : null,
    utilityBill: isStoredVerificationFile(source.utilityBill) ? source.utilityBill : null,
  };
}

function loadProfileDraft() {
  if (typeof window === "undefined") return defaultProfileDraft;
  const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!stored) return defaultProfileDraft;
  try {
    return hydrateProfileDraft(JSON.parse(stored));
  } catch {
    return defaultProfileDraft;
  }
}

function persistProfileDraft(profile: ProfileDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {}
}

type SupportStatus = SuperadminSupportRecord["status"];

function SupportStatusSelect({
  value,
  onChange,
}: {
  value: SupportStatus;
  onChange: (value: SupportStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const options: SupportStatus[] = ["Pending", "Solved", "Dismissed"];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#DDE2EC] bg-white px-4 text-[13px] text-[#525B79]"
      >
        <span>{value}</span>
        <span className="text-[10px]">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-20 min-w-[132px] overflow-hidden rounded-[10px] border border-[#E6EAF2] bg-white shadow-[0_18px_40px_rgba(31,35,61,0.12)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="block w-full px-4 py-3 text-left text-[13px] text-[#27324A] hover:bg-[#F6F8FB]"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SupportMessageDetailClient({
  thread,
  user,
}: {
  thread: SuperadminSupportRecord;
  user: SuperadminUserRecord;
}) {
  const [status, setStatus] = useState<SupportStatus>(thread.status);
  const [draft, setDraft] = useState("");
  const [reply, setReply] = useState(thread.reply);
  const [toast, setToast] = useState("");

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function sendReply() {
    const next = draft.trim();
    if (!next) {
      showToast("Write a message first.");
      return;
    }

    setReply(next);
    setDraft("");
    if (status === "Pending") {
      setStatus("Solved");
    }
    showToast("Reply sent.");
  }

  return (
    <section className="space-y-8 rounded-[26px] border border-[#E8ECF3]  px-6 py-6 shadow-[0_18px_50px_rgba(27,39,74,0.04)] sm:px-8 lg:px-10">
      <div className="grid gap-5 md:grid-cols-[44px_repeat(2,minmax(0,180px))_minmax(0,1fr)] md:items-start">
        <div className="md:row-span-2">
          <SuperadminAvatar from={user.avatarFrom} to={user.avatarTo} initials={user.initials} size={44} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Date</p>
          <p className="mt-1 text-[14px] font-medium text-[#202350]">{thread.date}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Status</p>
          <div className="mt-2">
            <SuperadminStatusBadge status={status} />
          </div>
        </div>
        <div className="flex justify-start md:justify-end">
          <SupportStatusSelect value={status} onChange={setStatus} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Name</p>
          <p className="mt-1 text-[14px] font-medium text-[#202350]">{user.name}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Email</p>
          <p className="mt-1 text-[14px] font-medium text-[#202350]">{user.email}</p>
        </div>
      </div>

      <div className="grid min-h-[420px] gap-8">
        <div className="flex justify-start">
          <div className="max-w-[290px] rounded-[24px] rounded-tl-[8px] border border-[#9CA5BB] bg-white px-4 py-3 text-[#27324A]">
            <p className="text-[16px] font-semibold">This is the Subject</p>
            <p className="mt-2 text-[14px] leading-7">{thread.body}</p>
            <div className="mt-3 flex items-center justify-between text-[10px] text-[#8A91AB]">
              <span>8:30 AM</span>
              <span>✓✓</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="max-w-[320px] rounded-[24px] rounded-br-[8px] bg-[#E7EAEE] px-4 py-3 text-[#27324A]">
            <p className="text-[14px] leading-7">{reply}</p>
            <div className="mt-3 flex items-center justify-between text-[10px] text-[#8A91AB]">
              <span>8:30 AM</span>
              <span>✓✓</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[907px] rounded-[14px] border border-[#C9D1DF] bg-white p-3 shadow-[0_8px_20px_rgba(31,35,61,0.03)]">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type here..."
          className="min-h-[96px] w-full resize-none border-0 bg-transparent text-[14px] text-[#27324A] outline-none placeholder:text-[#A1A9BE]"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-[#8A91AB]">{toast || " "}</span>
          <button
            type="button"
            onClick={sendReply}
            className="inline-flex h-9 items-center justify-center rounded-[8px] bg-[#324B6B] px-4 text-[13px] font-medium text-white"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}

type InvoiceRow = {
  amount: string;
  date: string;
  id: string;
  status: "Paid" | "Pending";
};

export function PaymentDetailClient({
  payment,
  user,
}: {
  payment: SuperadminPaymentRecord;
  user: SuperadminUserRecord;
}) {
  const [planActive, setPlanActive] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);
  const [downloads, setDownloads] = useState<string[]>([]);

  const rows = useMemo<InvoiceRow[]>(
    () => [
      { date: "Sep 12, 2026", id: "INV-2023-009", amount: "$49.00", status: "Paid" },
      { date: "Aug 12, 2026", id: "INV-2023-008", amount: "$49.00", status: "Paid" },
      { date: "Jul 12, 2026", id: "INV-2023-007", amount: "$49.00", status: "Paid" },
    ],
    [],
  );

  function downloadInvoice(row: InvoiceRow) {
    const content = `Invoice ${row.id}\nDate: ${row.date}\nAmount: ${row.amount}\nStatus: ${row.status}\nCustomer: ${user.name}\n`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${row.id}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setDownloads((current) => [...current, row.id]);
  }

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_186px]">
        <div className="rounded-[22px] border border-[#EDF1F6] bg-white p-5 shadow-[0_12px_35px_rgba(31,35,61,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex h-9 items-center rounded-[8px] border border-[#DCE4F0] px-2 text-[13px] font-semibold text-[#324B6B]">
                EarlyN
              </div>
              <p className="mt-5 text-[24px] font-semibold tracking-[-0.03em] text-[#27324A]">Investee Plan</p>
              <p className="mt-1 text-[32px] font-semibold tracking-[-0.05em] text-[#27324A]">
                $49
                <span className="ml-1 text-[13px] font-medium text-[#8A91AB]">/month</span>
              </p>
              <p className="mt-3 text-[13px] text-[#7D86A2]">
                Your next billing date is <span className="text-[#5177D9]">October 12, 2026</span>
              </p>
            </div>
            <span className={cx("rounded-full px-3 py-1 text-[10px] font-medium", planActive ? "bg-[#E8FFF1] text-[#21A35A]" : "bg-[#FFECEA] text-[#EF5A4C]")}>
              {planActive ? "Active" : "Suspended"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPlanActive(false)}
            disabled={!planActive}
            className={cx(
              "mt-6 inline-flex h-9 items-center justify-center rounded-[8px] px-4 text-[13px] font-medium",
              planActive ? "bg-[#FFE8E3] text-[#F26A57]" : "cursor-not-allowed bg-[#F3F5F9] text-[#A0A8BE]",
            )}
          >
            {planActive ? "Suspend Plan" : "Plan Suspended"}
          </button>
        </div>

        <div className="rounded-[18px] bg-[#324B6B] p-4 text-white shadow-[0_12px_35px_rgba(31,35,61,0.12)]">
          <p className="text-[11px] uppercase tracking-[0.16em] text-white/65">Upcoming Invoice</p>
          <p className="mt-3 text-[40px] font-semibold tracking-[-0.05em]">$49.00</p>
          <p className="mt-1 text-[11px] text-white/65">Due on Oct 12, 2026</p>
          <div className="mt-5 border-t border-white/15 pt-4 text-[12px] text-white/75">
            <div className="flex items-center justify-between">
              <span>Investee Plan</span>
              <span>$49.00</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Taxes (0%)</span>
              <span>$0.00</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowInvoice(true)}
            className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-[12px] bg-white text-[13px] font-medium text-[#27324A]"
          >
            Preview Invoice
          </button>
        </div>
      </section>

      <section className="rounded-[22px] border border-[#EDF1F6] bg-white shadow-[0_12px_35px_rgba(31,35,61,0.04)]">
        <div className="flex items-center gap-2 border-b border-[#EEF2F7] px-5 py-4">
          <span className="text-[#27324A]">◌</span>
          <h3 className="text-[18px] font-semibold text-[#27324A]">Billing History</h3>
        </div>
        <div className="grid grid-cols-[1.2fr_1.2fr_1.1fr_1fr_70px] gap-4 bg-[#FAFBFD] px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-[#A0A8BE]">
          <p>Date</p>
          <p>Invoice ID</p>
          <p>Amount</p>
          <p>Status</p>
          <p className="text-right">Action</p>
        </div>
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1.2fr_1.2fr_1.1fr_1fr_70px] gap-4 border-t border-[#F1F4F8] px-5 py-4 text-[13px] text-[#475066]">
            <p>{row.date}</p>
            <p>{row.id}</p>
            <p>{row.amount}</p>
            <div>
              <span className="rounded-full bg-[#E8FFF1] px-2 py-1 text-[10px] font-medium text-[#21A35A]">{row.status}</span>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => downloadInvoice(row)} className="text-[16px] text-[#324B6B]">
                ↓
              </button>
            </div>
          </div>
        ))}
        <div className="px-5 pb-4 pt-2 text-[11px] text-[#8A91AB]">
          {downloads.length ? `Downloaded: ${downloads[downloads.length - 1]}` : "Download any invoice from the action column."}
        </div>
      </section>

      {showInvoice ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/35 p-4">
          <div className="w-full max-w-md rounded-[22px] bg-white p-6 shadow-[0_24px_80px_rgba(31,35,61,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-semibold text-[#27324A]">Invoice Preview</h3>
                <p className="mt-1 text-[12px] text-[#8A91AB]">Upcoming invoice for {user.name}</p>
              </div>
              <button type="button" onClick={() => setShowInvoice(false)} className="text-[12px] text-[#8A91AB]">
                Close
              </button>
            </div>
            <div className="mt-5 rounded-[16px] border border-[#EDF1F6] bg-[#FBFCFE] p-4 text-[13px] text-[#475066]">
              <div className="flex items-center justify-between">
                <span>Plan</span>
                <span>Investee Plan</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>Amount</span>
                <span>{payment.amount}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>Billing date</span>
                <span>{payment.paymentDate}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#E9EDF4] pt-3 font-medium text-[#27324A]">
                <span>Total due</span>
                <span>$49.00</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

type UserDetailTab = "profile" | "kyc" | "pitch" | "viewPitch";

function KycFileRow({
  approved,
  label,
  onPreview,
}: {
  approved: boolean;
  label: string;
  onPreview: () => void;
}) {
  return (
    <div>
      <p className="mb-3 text-[12px] text-[#27324A]">{label}</p>
      <div className="rounded-[12px] border border-dashed border-[#D8DEE8] p-4">
        <div className="mx-auto flex max-w-[300px] items-center justify-between rounded-[10px] bg-[#F2F4F8] px-4 py-3 text-[12px] text-[#475066]">
          <div>
            <p className="font-medium">File name</p>
            <p className="text-[10px] text-[#9AA3B7]">File type • 245KB</p>
          </div>
          <div className="flex items-center gap-4 text-[#7E86A3]">
            <span>{approved ? "✓" : "↓"}</span>
            <button type="button" onClick={onPreview} className="text-[12px]">
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserDetailTabsClient({
  user,
}: {
  user: SuperadminUserRecord;
}) {
  const [activeTab, setActiveTab] = useState<UserDetailTab>("profile");
  const [kycStatus, setKycStatus] = useState<Record<string, "approved" | "declined" | "pending">>({
    address: "pending",
    face: "pending",
    funds: "pending",
    identity: "pending",
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");

  const pitchCards = Array.from({ length: 4 }, (_, index) => ({ id: index + 1 }));

  function setSectionStatus(section: keyof typeof kycStatus, status: "approved" | "declined") {
    setKycStatus((current) => ({ ...current, [section]: status }));
  }

  function openPreview(title: string) {
    setPreviewTitle(title);
    setPreviewOpen(true);
  }

  const badgeLabel = user.accountType === "Business" ? "Investor Pro Plan" : "Investor Pro Plan";
  const profileRows = [
    ["Country", "United Kingdom"],
    ["Email", user.email],
    ["Joining Date", user.joiningDate],
    ["Age", user.age],
  ] as const;

  return (
    <>
      <section className="space-y-6 pl-[52px]">
        <div className="flex items-start gap-4">
          <SuperadminAvatar from={user.avatarFrom} to={user.avatarTo} initials={user.initials} size={64} />
          <div className="pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <SuperadminStatusBadge status={user.status} />
              <span className="rounded-full bg-[#E5E7EB] px-2 py-1 text-[10px] font-medium text-[#4B5563]">{badgeLabel}</span>
            </div>
            <p className="mt-2 text-[22px] font-medium text-[#202350]">{user.name}</p>
          </div>
        </div>

        <div className="border-b border-[#DCE2EC]">
          <div className="flex items-center gap-8 text-[13px] text-[#202350]">
            {[
              ["profile", "Profile"],
              ["kyc", "KYC"],
              ["pitch", "Pitch"],
            ].map(([id, label]) => (
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
          <div className="grid gap-x-4 gap-y-8 md:grid-cols-2">
            {profileRows.map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#4B5563]">{label}</p>
                <div className="mt-3 border-b border-[#AEB4C3] pb-2 text-[14px] text-[#202350]">{value}</div>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "kyc" ? (
          <div className="mx-auto max-w-[620px] space-y-4">
            <div className="overflow-hidden rounded-[12px] border border-[#D7DEE8] bg-white">
              <div className="border-b border-[#DCE2EC] px-5 py-4">
                <h3 className="text-[14px] font-semibold text-[#223555]">Personal Identity</h3>
              </div>
              <div className="space-y-4 px-5 py-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-[11px] text-[#27324A]">Full Legal Name</span>
                    <input value={user.name} readOnly className="h-11 w-full rounded-[6px] border border-[#DCE2EC] px-3 text-[13px] outline-none" />
                  </label>
                  <label>
                    <span className="mb-2 block text-[11px] text-[#27324A]">Date of Birth</span>
                    <input value="mm/dd/yyyy" readOnly className="h-11 w-full rounded-[6px] border border-[#DCE2EC] px-3 text-[13px] outline-none" />
                  </label>
                  <label>
                    <span className="mb-2 block text-[11px] text-[#27324A]">Country of Residence</span>
                    <input value="United Kingdom" readOnly className="h-11 w-full rounded-[6px] border border-[#DCE2EC] px-3 text-[13px] outline-none" />
                  </label>
                  <label>
                    <span className="mb-2 block text-[11px] text-[#27324A]">Identification Type</span>
                    <input value="Passport" readOnly className="h-11 w-full rounded-[6px] border border-[#DCE2EC] px-3 text-[13px] outline-none" />
                  </label>
                </div>
                <KycFileRow approved={kycStatus.identity === "approved"} label="Identity Document Upload" onPreview={() => openPreview("Identity Document")} />
              </div>
              <div className="flex justify-end gap-3 border-t border-[#DCE2EC] px-5 py-4">
                <button type="button" onClick={() => setSectionStatus("identity", "declined")} className="rounded-[8px] border border-[#8EA0BB] px-4 py-2 text-[12px] text-[#324B6B]">
                  Decline
                </button>
                <button type="button" onClick={() => setSectionStatus("identity", "approved")} className="rounded-[8px] bg-[#324B6B] px-4 py-2 text-[12px] text-white">
                  Approve
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-[12px] border border-[#D7DEE8] bg-white">
              <div className="border-b border-[#DCE2EC] px-5 py-4">
                <h3 className="text-[14px] font-semibold text-[#223555]">Face Verification</h3>
              </div>
              <div className="space-y-4 px-5 py-4">
                <div>
                  <p className="mb-3 text-[12px] text-[#27324A]">Upload Photo for verification</p>
                  <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full bg-[#F4F5F8] text-[40px] text-[#27324A]">◯</div>
                </div>
                <KycFileRow approved={kycStatus.face === "approved"} label="Upload Video for verification" onPreview={() => openPreview("Face Verification Video")} />
              </div>
              <div className="flex justify-end gap-3 border-t border-[#DCE2EC] px-5 py-4">
                <button type="button" onClick={() => setSectionStatus("face", "declined")} className="rounded-[8px] border border-[#8EA0BB] px-4 py-2 text-[12px] text-[#324B6B]">
                  Decline
                </button>
                <button type="button" onClick={() => setSectionStatus("face", "approved")} className="rounded-[8px] bg-[#324B6B] px-4 py-2 text-[12px] text-white">
                  Approve
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-[12px] border border-[#D7DEE8] bg-white">
              <div className="border-b border-[#DCE2EC] px-5 py-4">
                <h3 className="text-[14px] font-semibold text-[#223555]">Address Verification</h3>
              </div>
              <div className="space-y-4 px-5 py-4">
                <KycFileRow approved={kycStatus.address === "approved"} label="Utility Bill Upload" onPreview={() => openPreview("Utility Bill")} />
                <KycFileRow approved={kycStatus.address === "approved"} label="Bank Statement Upload" onPreview={() => openPreview("Bank Statement")} />
              </div>
              <div className="flex justify-end gap-3 border-t border-[#DCE2EC] px-5 py-4">
                <button type="button" onClick={() => setSectionStatus("address", "declined")} className="rounded-[8px] border border-[#8EA0BB] px-4 py-2 text-[12px] text-[#324B6B]">
                  Decline
                </button>
                <button type="button" onClick={() => setSectionStatus("address", "approved")} className="rounded-[8px] bg-[#324B6B] px-4 py-2 text-[12px] text-white">
                  Approve
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-[12px] border border-[#D7DEE8] bg-white">
              <div className="border-b border-[#DCE2EC] px-5 py-4">
                <h3 className="text-[14px] font-semibold text-[#223555]">Source of Funds</h3>
              </div>
              <div className="space-y-4 px-5 py-4">
                <KycFileRow approved={kycStatus.funds === "approved"} label="Upload Salary Slip" onPreview={() => openPreview("Salary Slip")} />
                <KycFileRow approved={kycStatus.funds === "approved"} label="Upload Business Document" onPreview={() => openPreview("Business Document")} />
                <KycFileRow approved={kycStatus.funds === "approved"} label="Upload Tax Returns" onPreview={() => openPreview("Tax Returns")} />
              </div>
              <div className="flex justify-end gap-3 border-t border-[#DCE2EC] px-5 py-4">
                <button type="button" onClick={() => setSectionStatus("funds", "declined")} className="rounded-[8px] border border-[#8EA0BB] px-4 py-2 text-[12px] text-[#324B6B]">
                  Decline
                </button>
                <button type="button" onClick={() => setSectionStatus("funds", "approved")} className="rounded-[8px] bg-[#324B6B] px-4 py-2 text-[12px] text-white">
                  Approve
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === "pitch" ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pitchCards.map((card) => (
              <div key={card.id} className="overflow-hidden rounded-[10px] border border-[#DCE2EC] bg-white shadow-[0_8px_24px_rgba(31,35,61,0.05)]">
                <div className="h-[128px] bg-[linear-gradient(180deg,#38B6FF_0%,#F2B93B_100%)]" />
                <div className="space-y-3 p-3">
                  <div className="flex gap-2 text-[9px]">
                    <span className="rounded-full bg-[#5D6B86] px-2 py-1 text-white">Series A</span>
                    <span className="rounded-full bg-[#EAF0F6] px-2 py-1 text-[#4B5563]">Climate Tech</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[16px] font-semibold text-[#27324A]">CarbonLedger AI</p>
                      <p className="mt-1 text-[11px] text-[#8A91AB]">United Kingdom</p>
                    </div>
                    <p className="text-[11px] text-[#8A91AB]">412 views</p>
                  </div>
                  <p className="text-[12px] leading-5 text-[#66708D]">AI-powered carbon accounting for SMEs at enterprise accuracy</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.16em] text-[#8A91AB]">Funding Target</p>
                      <p className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-[#27324A]">$4.0M</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("viewPitch")}
                      className="rounded-[6px] bg-[#EF7A1A] px-3 py-1.5 text-[12px] font-medium text-white"
                    >
                      View Pitch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {activeTab === "viewPitch" ? (
          <div className="space-y-6">
            <div className="h-[160px] rounded-[10px] bg-[linear-gradient(180deg,#1EA0F2_0%,#F0C14B_100%)] sm:h-[240px]" />
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#7D86A2]">
                  <span>United Kingdom</span>
                  <span>/</span>
                  <span>412 views</span>
                  <span>/</span>
                  <span>Active</span>
                </div>
                <h3 className="mt-3 text-[18px] font-semibold text-[#27324A] sm:text-[22px]">CarbonLedger AI Project for windmill</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#E5E9F0] px-3 py-1 text-[11px] text-[#4B5563]">Series A</span>
                  <span className="rounded-full bg-[#E5E9F0] px-3 py-1 text-[11px] text-[#4B5563]">Climate Tech</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setActiveTab("pitch")} className="rounded-[8px] border border-[#8EA0BB] px-4 py-2 text-[12px] text-[#324B6B]">
                  Decline
                </button>
                <button type="button" onClick={() => setActiveTab("pitch")} className="rounded-[8px] bg-[#EF7A1A] px-4 py-2 text-[12px] text-white">
                  Approve
                </button>
              </div>
            </div>

            <div className="text-[13px] text-[#7B84A0]">
              <span>Funding target</span>
                  <span className="ml-3 text-[22px] font-semibold text-[#27324A]">$4.0M</span>
            </div>

            <div className="space-y-5 text-[14px] leading-7 text-[#6B748F]">
              <h4 className="text-[16px] font-semibold text-[#27324A]">Equipment Details</h4>
              <p>
                AI Project Overview for Windmill Optimization
                <br />
                This project focuses on leveraging artificial intelligence to enhance the efficiency and performance of windmills. By integrating AI-driven analytics and predictive maintenance, the system aims to optimize energy output while reducing downtime and operational costs.
              </p>
              <div>
                <p className="font-semibold text-[#27324A]">Key Components:</p>
                <p>1. Data Collection: Sensors installed on windmills gather real-time data on wind speed, blade angle, temperature, and vibration.</p>
                <p>2. Predictive Analytics: Machine learning models analyze the data to forecast maintenance needs, preventing unexpected failures.</p>
                <p>3. Performance Optimization: AI algorithms adjust blade pitch and rotation speed dynamically to maximize energy capture based on current wind conditions.</p>
                <p>4. Energy Forecasting: The system predicts energy production trends to aid in grid management and resource planning.</p>
              </div>
              <div>
                <p className="font-semibold text-[#27324A]">Benefits:</p>
                <p>- Increased energy efficiency and output.</p>
                <p>- Reduced maintenance costs and downtime.</p>
                <p>- Extended lifespan of windmill components.</p>
                <p>- Enhanced decision-making through data-driven insights.</p>
              </div>
              <p>
                Implementation involves collaboration between AI specialists, mechanical engineers, and energy experts to ensure seamless integration and continuous improvement. This project represents a significant step towards sustainable and smart renewable energy solutions.
              </p>
            </div>

            <div className="rounded-[12px] border border-[#EDF1F6] bg-[#FBFCFE] px-4 py-3">
              <p className="text-[12px] font-medium text-[#5F6786]">Additional Details</p>
              <div className="mt-3 space-y-3 text-[12px] text-[#27324A]">
                <div className="flex items-center justify-between"><span>Asking Price</span><span>$45,000</span></div>
                <div className="flex items-center justify-between"><span>Condition</span><span>Used</span></div>
                <div className="flex items-center justify-between"><span>Manufacturer</span><span>Doosan</span></div>
                <div className="flex items-center justify-between"><span>Model</span><span>DN Solutions Lynx 2100A</span></div>
                <div className="flex items-center justify-between"><span>Shipping Available</span><span>Yes</span></div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {previewOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/35 p-4">
          <div className="w-full max-w-md rounded-[22px] bg-white p-6 shadow-[0_24px_80px_rgba(31,35,61,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[20px] font-semibold text-[#27324A]">{previewTitle}</h3>
                <p className="mt-1 text-[12px] text-[#8A91AB]">Document preview for {user.name}</p>
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="text-[12px] text-[#8A91AB]">
                Close
              </button>
            </div>
            <div className="mt-5 flex h-[220px] items-center justify-center rounded-[16px] border border-dashed border-[#D8DEE8] bg-[#F8FAFC] text-[14px] text-[#66708D]">
              Preview unavailable in demo mode
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
