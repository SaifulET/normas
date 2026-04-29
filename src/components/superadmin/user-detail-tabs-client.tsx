"use client";

import { useEffect, useState } from "react";
import type { SuperadminUserRecord } from "./data";
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

type UserDetailTab = "profile" | "kyc" | "pitch" | "viewPitch";
type ReviewDocument = StoredVerificationFile & { url: string };

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

const reviewFallbackDocuments: Record<FileFieldKey, ReviewDocument> = {
  bankStatement: {
    id: "review-bank-statement",
    name: "bank-statement.png",
    size: 245 * 1024,
    type: "image/png",
    url: "/middlepart2.png",
  },
  businessDocument: {
    id: "review-business-document",
    name: "business-ownership-document.png",
    size: 288 * 1024,
    type: "image/png",
    url: "/middlepartimg3.png",
  },
  facePhoto: {
    id: "review-face-photo",
    name: "face-verification-photo.jpg",
    size: 188 * 1024,
    type: "image/jpeg",
    url: "/kycHeroTop2nd.jpg",
  },
  faceVideo: {
    id: "review-face-video",
    name: "face-verification-video.jpg",
    size: 577 * 1024,
    type: "image/jpeg",
    url: "/kycHeroBottom1st.jpg",
  },
  identityDocument: {
    id: "review-identity-document",
    name: "passport-copy.jpg",
    size: 245 * 1024,
    type: "image/jpeg",
    url: "/kycHeroTop1st.jpg",
  },
  salarySlip: {
    id: "review-salary-slip",
    name: "recent-salary-slip.png",
    size: 226 * 1024,
    type: "image/png",
    url: "/middlepartimg4.png",
  },
  taxReturns: {
    id: "review-tax-return",
    name: "recent-tax-return.png",
    size: 264 * 1024,
    type: "image/png",
    url: "/kycHeroBottom3rd.png",
  },
  utilityBill: {
    id: "review-utility-bill",
    name: "utility-bill.png",
    size: 231 * 1024,
    type: "image/png",
    url: "/middlepartimg1.png",
  },
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
    country: typeof source.country === "string" ? source.country : defaultProfileDraft.country,
    dateOfBirth: typeof source.dateOfBirth === "string" ? source.dateOfBirth : defaultProfileDraft.dateOfBirth,
    facePhoto: isStoredVerificationFile(source.facePhoto) ? source.facePhoto : null,
    faceVideo: isStoredVerificationFile(source.faceVideo) ? source.faceVideo : null,
    fullName: typeof source.fullName === "string" ? source.fullName : defaultProfileDraft.fullName,
    identificationType: typeof source.identificationType === "string" ? source.identificationType : defaultProfileDraft.identificationType,
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

function createFileId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `file-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function openProfileFilesDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(PROFILE_FILES_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PROFILE_FILES_STORE_NAME)) {
        db.createObjectStore(PROFILE_FILES_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveFileBlob(id: string, file: File) {
  const db = await openProfileFilesDb();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(PROFILE_FILES_STORE_NAME, "readwrite");
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
    transaction.objectStore(PROFILE_FILES_STORE_NAME).put(file, id);
  });
}

async function getFileBlob(id: string) {
  const db = await openProfileFilesDb();
  return new Promise<Blob | null>((resolve, reject) => {
    const transaction = db.transaction(PROFILE_FILES_STORE_NAME, "readonly");
    const request = transaction.objectStore(PROFILE_FILES_STORE_NAME).get(id);
    request.onsuccess = () => {
      db.close();
      resolve(request.result instanceof Blob ? request.result : null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

async function deleteFileBlob(id: string) {
  const db = await openProfileFilesDb();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(PROFILE_FILES_STORE_NAME, "readwrite");
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
    transaction.objectStore(PROFILE_FILES_STORE_NAME).delete(id);
  });
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))}KB`;
  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
}

function getFileTypeLabel(file: StoredVerificationFile) {
  const parts = file.name.split(".");
  const extension = parts.length > 1 ? parts[parts.length - 1] : "";
  if (extension) return extension.toUpperCase();
  if (file.type.includes("/")) return file.type.split("/")[1].toUpperCase();
  return "FILE";
}

function FilePreviewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M1.167 7s2.121-3.5 5.833-3.5S12.833 7 12.833 7 10.712 10.5 7 10.5 1.167 7 1.167 7Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="7" r="1.75" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function FileDownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.333v6.125" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="m4.958 6.417 2.042 2.041 2.042-2.041" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.917 10.792h8.166" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function FileTypeIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" aria-hidden="true">
      <path
        d="M4.75 1.75h4.992L13.25 5.26v9.24a1.5 1.5 0 0 1-1.5 1.5h-7.5a1.5 1.5 0 0 1-1.5-1.5v-11a1.75 1.75 0 0 1 1.75-1.75Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M9.5 1.75V5.5h3.75" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M5.167 10.083h5.666M5.167 12.417h3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function DecisionDeclineIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 3l6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function DecisionApproveIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="m2.5 6.25 2.1 2.1 4.9-5.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FacePlaceholderIcon() {
  return (
    <svg width="66" height="66" viewBox="0 0 66 66" fill="none" aria-hidden="true">
      <circle cx="33" cy="23.5" r="11.5" stroke="#2E3A59" strokeWidth="2.4" />
      <path
        d="M18.5 51.5c0-8.009 6.491-14.5 14.5-14.5s14.5 6.491 14.5 14.5"
        stroke="#2E3A59"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function KycFileRow({
  approved,
  file,
  label,
  onClear,
  onDownload,
  onPreview,
  onReplace,
}: {
  approved: boolean;
  file: StoredVerificationFile | null;
  label: string;
  onClear: () => void;
  onDownload: () => void;
  onPreview: () => void;
  onReplace: (file: File) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-[12px] text-[#27324A]">{label}</p>
      <div className="rounded-[12px] border border-dashed border-[#D8DEE8] p-4">
        {file ? (
          <div className="mx-auto flex max-w-[320px] items-center justify-between rounded-[10px] bg-[#F2F4F8] px-4 py-3 text-[12px] text-[#475066]">
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-[10px] text-[#9AA3B7]">
                {getFileTypeLabel(file)} • {formatBytes(file.size)}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[#7E86A3]">
              <button type="button" onClick={onDownload} className="text-[12px]">↓</button>
              <button type="button" onClick={onPreview} className="text-[12px]">View</button>
              <button type="button" onClick={onClear} className="text-[12px]">×</button>
              <span>{approved ? "✓" : "…"}</span>
            </div>
          </div>
        ) : (
          <label className="mx-auto flex max-w-[320px] cursor-pointer items-center justify-center rounded-[10px] bg-[#F2F4F8] px-4 py-4 text-[12px] text-[#66708D]">
            <input
              type="file"
              className="hidden"
              onChange={(event) => {
                const nextFile = event.target.files?.[0];
                if (nextFile) onReplace(nextFile);
                event.currentTarget.value = "";
              }}
            />
            Upload file
          </label>
        )}
      </div>
    </div>
  );
}

function KycReviewFileRow({
  file,
  label,
  onDownload,
  onPreview,
}: {
  file: StoredVerificationFile | null;
  label: string;
  onDownload: () => void;
  onPreview: () => void;
}) {
  const hasFile = Boolean(file);
  const fileName = file?.name || "File name";
  const fileMeta = file ? `${getFileTypeLabel(file)} / ${formatBytes(file.size)}` : "File type / 245KB";

  return (
    <div>
      <p className="mb-3 text-[12px] text-[#27324A]">{label}</p>
      <div className="rounded-[12px] border border-dashed border-[#D8DEE8] px-4 py-5">
        <div className="mx-auto flex max-w-[278px] items-center justify-between gap-4 rounded-[10px] bg-[#F2F4F8] px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center text-[#A8B1C4]">
              <FileTypeIcon />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-[#27324A]">{fileName}</p>
              <p className="mt-0.5 text-[10px] text-[#9AA3B7]">{fileMeta}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={onDownload}
              disabled={!hasFile}
              className={cx("transition", hasFile ? "text-[#7E86A3] hover:text-[#324B6B]" : "cursor-not-allowed text-[#C6CDDB]")}
              aria-label="Download file"
            >
              <FileDownloadIcon />
            </button>
            <button
              type="button"
              onClick={onPreview}
              disabled={!hasFile}
              className={cx("transition", hasFile ? "text-[#7E86A3] hover:text-[#324B6B]" : "cursor-not-allowed text-[#C6CDDB]")}
              aria-label="Preview file"
            >
              <FilePreviewIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KycDecisionButtons({
  onApprove,
  onDecline,
}: {
  onApprove: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-[#DCE2EC] px-5 py-4">
      <button
        type="button"
        onClick={onDecline}
        className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#8EA0BB] px-4 text-[12px] font-medium text-[#324B6B]"
      >
        <DecisionDeclineIcon />
        <span>Decline</span>
      </button>
      <button
        type="button"
        onClick={onApprove}
        className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#324B6B] px-4 text-[12px] font-medium text-white"
      >
        <DecisionApproveIcon />
        <span>Approve</span>
      </button>
    </div>
  );
}

function KycStatusNote({
  label,
  status,
}: {
  label: string;
  status: "approved" | "declined" | "pending";
}) {
  if (status === "pending") return null;

  return (
    <p className={cx("px-2 text-[12px] font-medium", status === "approved" ? "text-[#0F9D58]" : "text-[#D14343]")}>
      {status === "approved" ? `${label} approved successfully.` : `${label} declined.`}
    </p>
  );
}

export function UserDetailTabsClient({ user }: { user: SuperadminUserRecord }) {
  const [activeTab, setActiveTab] = useState<UserDetailTab>("profile");
  const [profile, setProfile] = useState<ProfileDraft>(defaultProfileDraft);
  const [kycToast, setKycToast] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [kycStatus, setKycStatus] = useState<Record<string, "approved" | "declined" | "pending">>({
    address: "pending",
    face: "pending",
    funds: "pending",
    identity: "pending",
  });

  useEffect(() => {
    setProfile(loadProfileDraft());
  }, []);

  useEffect(() => {
    persistProfileDraft(profile);
  }, [profile]);

  const pitchCards = Array.from({ length: 4 }, (_, index) => ({ id: index + 1 }));
  const badgeLabel = "Investor Pro Plan";
  const profileRows = [
    ["Country", profile.country || "United Kingdom"],
    ["Email", user.email],
    ["Joining Date", user.joiningDate],
    ["Age", user.age],
  ] as const;
  const identityDocument = profile.identityDocument ?? reviewFallbackDocuments.identityDocument;
  const faceVideo = profile.faceVideo ?? reviewFallbackDocuments.faceVideo;
  const utilityBill = profile.utilityBill ?? reviewFallbackDocuments.utilityBill;
  const bankStatement = profile.bankStatement ?? reviewFallbackDocuments.bankStatement;
  const salarySlip = profile.salarySlip ?? reviewFallbackDocuments.salarySlip;
  const businessDocument = profile.businessDocument ?? reviewFallbackDocuments.businessDocument;
  const taxReturns = profile.taxReturns ?? reviewFallbackDocuments.taxReturns;

  function showKycToast(message: string) {
    setKycToast(message);
    window.setTimeout(() => setKycToast(""), 2200);
  }

  function updateField<Key extends keyof ProfileDraft>(field: Key, value: ProfileDraft[Key]) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function setSectionStatus(section: keyof typeof kycStatus, status: "approved" | "declined") {
    setKycStatus((current) => ({ ...current, [section]: status }));
    showKycToast(`${section} ${status}.`);
  }

  function openPreview(title: string) {
    setPreviewTitle(title);
    setPreviewOpen(true);
  }

  async function replaceStoredFile(field: FileFieldKey, file: File) {
    const id = createFileId();
    await saveFileBlob(id, file);
    const currentFile = profile[field];
    if (currentFile) {
      await deleteFileBlob(currentFile.id).catch(() => undefined);
    }
    updateField(field, { id, name: file.name, size: file.size, type: file.type } as ProfileDraft[typeof field]);
    showKycToast(`${file.name} uploaded.`);
  }

  async function clearStoredFile(field: FileFieldKey) {
    const currentFile = profile[field];
    if (currentFile) {
      await deleteFileBlob(currentFile.id).catch(() => undefined);
    }
    updateField(field, null as ProfileDraft[typeof field]);
    showKycToast("File removed.");
  }

  async function previewStoredFile(field: FileFieldKey, title: string, fallback?: ReviewDocument) {
    const storedFile = profile[field];
    if (!storedFile && fallback) {
      window.open(fallback.url, "_blank", "noopener,noreferrer");
      openPreview(title);
      return;
    }

    if (!storedFile) return;

    const blob = await getFileBlob(storedFile.id).catch(() => null);
    if (!blob) {
      if (fallback) {
        window.open(fallback.url, "_blank", "noopener,noreferrer");
        openPreview(title);
        return;
      }
      showKycToast("Preview unavailable.");
      return;
    }

    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    openPreview(title);
  }

  async function downloadStoredFile(field: FileFieldKey, fallback?: ReviewDocument) {
    const storedFile = profile[field];
    if (!storedFile && fallback) {
      const anchor = document.createElement("a");
      anchor.href = fallback.url;
      anchor.download = fallback.name;
      anchor.click();
      showKycToast(`${fallback.name} downloaded.`);
      return;
    }

    if (!storedFile) return;

    const blob = await getFileBlob(storedFile.id).catch(() => null);
    if (!blob) {
      if (fallback) {
        const anchor = document.createElement("a");
        anchor.href = fallback.url;
        anchor.download = fallback.name;
        anchor.click();
        showKycToast(`${fallback.name} downloaded.`);
        return;
      }
      showKycToast("Download unavailable.");
      return;
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = storedFile.name;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    showKycToast(`${storedFile.name} downloaded.`);
  }

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
            <div className="space-y-2">
              <div className="overflow-hidden rounded-[12px] border border-[#D7DEE8] bg-white">
                <div className="border-b border-[#DCE2EC] px-5 py-4">
                  <h3 className="text-[14px] font-semibold text-[#223555]">Personal Identity</h3>
                </div>
                <div className="space-y-4 px-5 py-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label>
                      <span className="mb-2 block text-[11px] text-[#27324A]">Full Legal Name</span>
                      <input value={profile.fullName} readOnly className="h-11 w-full cursor-default rounded-[6px] border border-[#DCE2EC] px-3 text-[13px] text-[#27324A] outline-none" />
                    </label>
                    <label>
                      <span className="mb-2 block text-[11px] text-[#27324A]">Date of Birth</span>
                      <input value={profile.dateOfBirth} readOnly placeholder="mm/dd/yyyy" className="h-11 w-full cursor-default rounded-[6px] border border-[#DCE2EC] px-3 text-[13px] text-[#27324A] outline-none placeholder:text-[#9AA3B7]" />
                    </label>
                    <label>
                      <span className="mb-2 block text-[11px] text-[#27324A]">Country of Residence</span>
                      <input value={profile.country} readOnly placeholder="Select a country" className="h-11 w-full cursor-default rounded-[6px] border border-[#DCE2EC] px-3 text-[13px] text-[#27324A] outline-none placeholder:text-[#9AA3B7]" />
                    </label>
                    <label>
                      <span className="mb-2 block text-[11px] text-[#27324A]">Identification Type</span>
                      <input value={profile.identificationType} readOnly className="h-11 w-full cursor-default rounded-[6px] border border-[#DCE2EC] px-3 text-[13px] text-[#27324A] outline-none" />
                    </label>
                  </div>
                  <KycReviewFileRow
                    file={identityDocument}
                    label="Identity Document Upload"
                    onDownload={() => void downloadStoredFile("identityDocument", reviewFallbackDocuments.identityDocument)}
                    onPreview={() => void previewStoredFile("identityDocument", "Identity Document", reviewFallbackDocuments.identityDocument)}
                  />
                </div>
                <KycDecisionButtons onApprove={() => setSectionStatus("identity", "approved")} onDecline={() => setSectionStatus("identity", "declined")} />
              </div>
              <KycStatusNote label="Personal identity" status={kycStatus.identity} />
            </div>

            <div className="space-y-2">
              <div className="overflow-hidden rounded-[12px] border border-[#D7DEE8] bg-white">
                <div className="border-b border-[#DCE2EC] px-5 py-4">
                  <h3 className="text-[14px] font-semibold text-[#223555]">Face Verification</h3>
                </div>
                <div className="space-y-4 px-5 py-4">
                  <div>
                    <p className="mb-3 text-[12px] text-[#27324A]">Upload Photo for verification</p>
                    <div className="flex h-[118px] w-[118px] items-center justify-center rounded-full bg-[#F4F5F8]">
                      <FacePlaceholderIcon />
                    </div>
                  </div>
                  <KycReviewFileRow
                    file={faceVideo}
                    label="Upload Video for verification"
                    onDownload={() => void downloadStoredFile("faceVideo", reviewFallbackDocuments.faceVideo)}
                    onPreview={() => void previewStoredFile("faceVideo", "Face Verification Video", reviewFallbackDocuments.faceVideo)}
                  />
                </div>
                <KycDecisionButtons onApprove={() => setSectionStatus("face", "approved")} onDecline={() => setSectionStatus("face", "declined")} />
              </div>
              <KycStatusNote label="Face verification" status={kycStatus.face} />
            </div>

            <div className="space-y-2">
              <div className="overflow-hidden rounded-[12px] border border-[#D7DEE8] bg-white">
                <div className="border-b border-[#DCE2EC] px-5 py-4">
                  <h3 className="text-[14px] font-semibold text-[#223555]">Address Verification</h3>
                </div>
                <div className="space-y-4 px-5 py-4">
                  <KycReviewFileRow
                    file={utilityBill}
                    label="Utility Bill Upload"
                    onDownload={() => void downloadStoredFile("utilityBill", reviewFallbackDocuments.utilityBill)}
                    onPreview={() => void previewStoredFile("utilityBill", "Utility Bill", reviewFallbackDocuments.utilityBill)}
                  />
                  <KycReviewFileRow
                    file={bankStatement}
                    label="Bank Statement Upload"
                    onDownload={() => void downloadStoredFile("bankStatement", reviewFallbackDocuments.bankStatement)}
                    onPreview={() => void previewStoredFile("bankStatement", "Bank Statement", reviewFallbackDocuments.bankStatement)}
                  />
                </div>
                <KycDecisionButtons onApprove={() => setSectionStatus("address", "approved")} onDecline={() => setSectionStatus("address", "declined")} />
              </div>
              <KycStatusNote label="Address verification" status={kycStatus.address} />
            </div>

            <div className="space-y-2">
              <div className="overflow-hidden rounded-[12px] border border-[#D7DEE8] bg-white">
                <div className="border-b border-[#DCE2EC] px-5 py-4">
                  <h3 className="text-[14px] font-semibold text-[#223555]">Source of Funds</h3>
                </div>
                <div className="space-y-4 px-5 py-4">
                  <KycReviewFileRow
                    file={salarySlip}
                    label="Upload Salary Slip"
                    onDownload={() => void downloadStoredFile("salarySlip", reviewFallbackDocuments.salarySlip)}
                    onPreview={() => void previewStoredFile("salarySlip", "Salary Slip", reviewFallbackDocuments.salarySlip)}
                  />
                  <KycReviewFileRow
                    file={businessDocument}
                    label="Upload Business Document"
                    onDownload={() => void downloadStoredFile("businessDocument", reviewFallbackDocuments.businessDocument)}
                    onPreview={() => void previewStoredFile("businessDocument", "Business Document", reviewFallbackDocuments.businessDocument)}
                  />
                  <KycReviewFileRow
                    file={taxReturns}
                    label="Upload Tax Returns"
                    onDownload={() => void downloadStoredFile("taxReturns", reviewFallbackDocuments.taxReturns)}
                    onPreview={() => void previewStoredFile("taxReturns", "Tax Returns", reviewFallbackDocuments.taxReturns)}
                  />
                </div>
                <KycDecisionButtons onApprove={() => setSectionStatus("funds", "approved")} onDecline={() => setSectionStatus("funds", "declined")} />
              </div>
              <KycStatusNote label="Source of funds" status={kycStatus.funds} />
            </div>

            <p className="text-center text-[12px] text-[#66708D]">{kycToast || " "}</p>
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
                      <p className="mt-1 text-[22px] font-semibold tracking-[-0.04em] text-[#27324A]">£4.0M</p>
                    </div>
                    <button type="button" onClick={() => setActiveTab("viewPitch")} className="rounded-[6px] bg-[#EF7A1A] px-3 py-1.5 text-[12px] font-medium text-white">View Pitch</button>
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
                <button type="button" onClick={() => setActiveTab("pitch")} className="rounded-[8px] border border-[#8EA0BB] px-4 py-2 text-[12px] text-[#324B6B]">Decline</button>
                <button type="button" onClick={() => setActiveTab("pitch")} className="rounded-[8px] bg-[#EF7A1A] px-4 py-2 text-[12px] text-white">Approve</button>
              </div>
            </div>
            <div className="text-[13px] text-[#7B84A0]">
              <span>Funding target</span>
              <span className="ml-3 text-[22px] font-semibold text-[#27324A]">£4.0M</span>
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
              <button type="button" onClick={() => setPreviewOpen(false)} className="text-[12px] text-[#8A91AB]">Close</button>
            </div>
            <div className="mt-5 flex h-[220px] items-center justify-center rounded-[16px] border border-dashed border-[#D8DEE8] bg-[#F8FAFC] text-[14px] text-[#66708D]">
              Preview opened in a new tab
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
