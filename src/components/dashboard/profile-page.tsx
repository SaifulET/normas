"use client";

import { startTransition, useEffect, useId, useState } from "react";
import { apiRequest, getApiErrorMessage } from "@/lib/api";
import { KycDataReviewCard, type KycRecord } from "@/components/kyc/kyc-data-review-card";
import { useAuthStore } from "@/store";
import { DashboardIcon } from "./icons";
import { DashboardPageHeader } from "./page-header";

const PROFILE_STORAGE_KEY = "earlyn.dashboard.profile";
const PROFILE_FILES_DB_NAME = "earlyn-profile-files";
const PROFILE_FILES_STORE_NAME = "files";

type StoredVerificationFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
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

type UserDetailsResponse = {
  data?: {
    kyc?: KycDetails[];
    user?: UserDetails;
  };
  message?: string;
  success?: boolean;
};

type UserDetails = {
  createdAt?: string;
  email?: string;
  id?: string;
  mobile?: string;
  name?: string;
  phone?: string;
  profileImage?: string;
  role?: string;
  updatedAt?: string;
};

type AccountProfileForm = {
  name: string;
  phone: string;
};

type KycSectionKey = "address" | "face" | "identity" | "funds";

type KycUpdateStatus = {
  error: string;
  isSaving: boolean;
  message: string;
};

type KycDetails = {
  _id?: string;
  additionalDocuments?: Record<string, unknown>;
  addressVerification?: {
    bankStatement?: string;
    proofOfAddress?: string;
    utilityBill?: string;
  };
  applicantInfo?: Record<string, unknown>;
  beneficialOwners?: Array<Record<string, unknown>>;
  companyInformation?: Record<string, unknown>;
  createdAt?: string;
  currentStep?: number;
  declarations?: Record<string, unknown>;
  faceVerification?: {
    facePhoto?: string;
    verificationVideo?: string;
  };
  fieldReviews?: Array<Record<string, unknown>>;
  financialInformation?: Record<string, unknown>;
  investorProfile?: Record<string, unknown>;
  personalIdentity?: {
    countryOfResidence?: string;
    dateOfBirth?: string;
    fullLegalName?: string;
    identificationType?: string;
    identityDocument?: string;
    nationality?: string;
    sourceOfWealth?: string[];
    sourceOfWealthExplanation?: string;
  };
  pepSanctions?: Record<string, unknown>;
  role?: string;
  sourceOfFunds?: {
    businessDocument?: string;
    salarySlip?: string;
    taxReturns?: string;
  };
  status?: string;
  updatedAt?: string;
};

type ProfileApplicantType = "company" | "individual";

const defaultKycUpdateStatus: KycUpdateStatus = {
  error: "",
  isSaving: false,
  message: "",
};

const defaultKycUpdateStatuses: Record<KycSectionKey, KycUpdateStatus> = {
  address: defaultKycUpdateStatus,
  face: defaultKycUpdateStatus,
  funds: defaultKycUpdateStatus,
  identity: defaultKycUpdateStatus,
};

const kycFileFields: Array<{ apiKey: string; profileKey: FileFieldKey }> = [
  { apiKey: "identityDocument", profileKey: "identityDocument" },
  { apiKey: "utilityBill", profileKey: "utilityBill" },
  { apiKey: "bankStatement", profileKey: "bankStatement" },
  { apiKey: "facePhoto", profileKey: "facePhoto" },
  { apiKey: "verificationVideo", profileKey: "faceVideo" },
  { apiKey: "salarySlip", profileKey: "salarySlip" },
  { apiKey: "businessDocument", profileKey: "businessDocument" },
  { apiKey: "taxReturns", profileKey: "taxReturns" },
];

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
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.size === "number" &&
    (candidate.url === undefined || typeof candidate.url === "string")
  );
}

function getLatestKyc(items?: KycDetails[]) {
  if (!items?.length) {
    return null;
  }

  return [...items].sort((first, second) => {
    const firstTime = Date.parse(first.updatedAt ?? first.createdAt ?? "");
    const secondTime = Date.parse(second.updatedAt ?? second.createdAt ?? "");

    return (Number.isNaN(secondTime) ? 0 : secondTime) - (Number.isNaN(firstTime) ? 0 : firstTime);
  })[0];
}

function getFileNameFromUrl(url: string, fallbackName: string) {
  try {
    const pathname = new URL(url).pathname;
    const rawName = pathname.split("/").filter(Boolean).at(-1);

    return rawName ? decodeURIComponent(rawName) : fallbackName;
  } catch {
    const rawName = url.split("?")[0]?.split("/").filter(Boolean).at(-1);

    return rawName ? decodeURIComponent(rawName) : fallbackName;
  }
}

function inferFileType(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
    return `image/${extension === "jpg" ? "jpeg" : extension}`;
  }

  if (["mp4", "webm", "mov"].includes(extension)) {
    return extension === "mov" ? "video/quicktime" : `video/${extension}`;
  }

  if (extension === "pdf") {
    return "application/pdf";
  }

  return "application/octet-stream";
}

function createRemoteFile(url: string | undefined, fallbackName: string) {
  if (!url) {
    return null;
  }

  const name = getFileNameFromUrl(url, fallbackName);

  return {
    id: url,
    name,
    size: 0,
    type: inferFileType(name),
    url,
  };
}

function formatApiDate(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString().slice(0, 10);
}

function formatDisplayValue(value?: string | number | null, fallback = "Not provided") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function getRecordString(source: Record<string, unknown> | null | undefined, key: string) {
  const value = source?.[key];
  return typeof value === "string" ? value : "";
}

function getKycPhone(kyc?: KycDetails | null) {
  return getRecordString(kyc?.applicantInfo, "phoneNumber");
}

function getUserPhone(user?: UserDetails | null, kyc?: KycDetails | null) {
  return user?.phone || user?.mobile || getKycPhone(kyc);
}

function normalizeApplicantType(value?: string): ProfileApplicantType {
  return value?.trim().toLowerCase() === "company" ? "company" : "individual";
}

function getApplicantType(kyc?: KycDetails | null): ProfileApplicantType {
  return normalizeApplicantType(getRecordString(kyc?.applicantInfo, "applicantType"));
}

function formatApplicantType(value: ProfileApplicantType) {
  return value === "company" ? "Company / Organisation" : "Individual";
}

function toTitleCase(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeIdentificationType(value?: string) {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "national id" || normalized === "national_id") {
    return "National ID";
  }

  if (normalized === "driving license" || normalized === "driving_license") {
    return "Driving License";
  }

  if (normalized === "passport") {
    return "Passport";
  }

  return toTitleCase(value);
}

function buildProfileFromDetails(details: UserDetailsResponse["data"] | null, fallback: ProfileDraft) {
  const latestKyc = getLatestKyc(details?.kyc);
  const personalIdentity = latestKyc?.personalIdentity;

  return {
    bankStatement:
      createRemoteFile(latestKyc?.addressVerification?.bankStatement, "bank-statement") ?? fallback.bankStatement,
    businessDocument:
      createRemoteFile(latestKyc?.sourceOfFunds?.businessDocument, "business-document") ?? fallback.businessDocument,
    country: personalIdentity?.countryOfResidence ?? fallback.country,
    dateOfBirth: formatApiDate(personalIdentity?.dateOfBirth) || fallback.dateOfBirth,
    facePhoto: createRemoteFile(latestKyc?.faceVerification?.facePhoto, "face-photo") ?? fallback.facePhoto,
    faceVideo:
      createRemoteFile(latestKyc?.faceVerification?.verificationVideo, "verification-video") ?? fallback.faceVideo,
    fullName: personalIdentity?.fullLegalName ?? details?.user?.name ?? fallback.fullName,
    identificationType: normalizeIdentificationType(personalIdentity?.identificationType) || fallback.identificationType,
    identityDocument:
      createRemoteFile(personalIdentity?.identityDocument, "identity-document") ?? fallback.identityDocument,
    salarySlip: createRemoteFile(latestKyc?.sourceOfFunds?.salarySlip, "salary-slip") ?? fallback.salarySlip,
    taxReturns: createRemoteFile(latestKyc?.sourceOfFunds?.taxReturns, "tax-returns") ?? fallback.taxReturns,
    utilityBill:
      createRemoteFile(latestKyc?.addressVerification?.utilityBill, "utility-bill") ?? fallback.utilityBill,
  };
}

function areFileRefsEqual(first: StoredVerificationFile | null, second: StoredVerificationFile | null) {
  return (first?.url ?? first?.id ?? "") === (second?.url ?? second?.id ?? "");
}

function appendChangedText(formData: FormData, key: string, nextValue: string, previousValue: string) {
  if (nextValue.trim() === previousValue.trim()) {
    return 0;
  }

  formData.append(key, nextValue.trim());
  return 1;
}

async function appendChangedFile(
  formData: FormData,
  apiKey: string,
  nextFile: StoredVerificationFile | null,
  previousFile: StoredVerificationFile | null,
) {
  if (!nextFile || areFileRefsEqual(nextFile, previousFile) || nextFile.url) {
    return 0;
  }

  const blob = await getFileBlob(nextFile.id);

  if (!blob) {
    return 0;
  }

  formData.append(apiKey, blob, nextFile.name);
  return 1;
}

async function buildChangedKycFormData(profile: ProfileDraft, savedProfile: ProfileDraft, section: KycSectionKey) {
  const formData = new FormData();
  let changedCount = 0;

  if (section === "identity") {
    changedCount += appendChangedText(
      formData,
      "personalIdentity.fullLegalName",
      profile.fullName,
      savedProfile.fullName,
    );
    changedCount += appendChangedText(
      formData,
      "personalIdentity.dateOfBirth",
      profile.dateOfBirth,
      savedProfile.dateOfBirth,
    );
    changedCount += appendChangedText(
      formData,
      "personalIdentity.countryOfResidence",
      profile.country,
      savedProfile.country,
    );
    changedCount += appendChangedText(
      formData,
      "personalIdentity.identificationType",
      profile.identificationType.toLowerCase(),
      savedProfile.identificationType.toLowerCase(),
    );
    changedCount += await appendChangedFile(
      formData,
      "identityDocument",
      profile.identityDocument,
      savedProfile.identityDocument,
    );
  }

  if (section === "face") {
    for (const field of kycFileFields.filter((item) => item.profileKey === "facePhoto" || item.profileKey === "faceVideo")) {
      changedCount += await appendChangedFile(formData, field.apiKey, profile[field.profileKey], savedProfile[field.profileKey]);
    }
  }

  if (section === "address") {
    for (const field of kycFileFields.filter((item) => item.profileKey === "utilityBill" || item.profileKey === "bankStatement")) {
      changedCount += await appendChangedFile(formData, field.apiKey, profile[field.profileKey], savedProfile[field.profileKey]);
    }
  }

  if (section === "funds") {
    for (const field of kycFileFields.filter((item) =>
      item.profileKey === "salarySlip" || item.profileKey === "businessDocument" || item.profileKey === "taxReturns"
    )) {
      changedCount += await appendChangedFile(formData, field.apiKey, profile[field.profileKey], savedProfile[field.profileKey]);
    }
  }

  return { changedCount, formData };
}

function mergeSavedProfileSection(savedProfile: ProfileDraft, profile: ProfileDraft, section: KycSectionKey) {
  if (section === "identity") {
    return {
      ...savedProfile,
      country: profile.country,
      dateOfBirth: profile.dateOfBirth,
      fullName: profile.fullName,
      identificationType: profile.identificationType,
      identityDocument: profile.identityDocument,
    };
  }

  if (section === "face") {
    return {
      ...savedProfile,
      facePhoto: profile.facePhoto,
      faceVideo: profile.faceVideo,
    };
  }

  if (section === "address") {
    return {
      ...savedProfile,
      bankStatement: profile.bankStatement,
      utilityBill: profile.utilityBill,
    };
  }

  return {
    ...savedProfile,
    businessDocument: profile.businessDocument,
    salarySlip: profile.salarySlip,
    taxReturns: profile.taxReturns,
  };
}

function hydrateProfileDraft(raw: unknown): ProfileDraft {
  if (!raw || typeof raw !== "object") {
    return defaultProfileDraft;
  }

  const source = raw as Record<string, unknown>;

  return {
    bankStatement: isStoredVerificationFile(source.bankStatement) ? source.bankStatement : null,
    businessDocument: isStoredVerificationFile(source.businessDocument) ? source.businessDocument : null,
    country: typeof source.country === "string" ? source.country : defaultProfileDraft.country,
    dateOfBirth: typeof source.dateOfBirth === "string" ? source.dateOfBirth : defaultProfileDraft.dateOfBirth,
    facePhoto: isStoredVerificationFile(source.facePhoto) ? source.facePhoto : null,
    faceVideo: isStoredVerificationFile(source.faceVideo) ? source.faceVideo : null,
    fullName: typeof source.fullName === "string" ? source.fullName : defaultProfileDraft.fullName,
    identificationType:
      typeof source.identificationType === "string"
        ? source.identificationType
        : defaultProfileDraft.identificationType,
    identityDocument: isStoredVerificationFile(source.identityDocument) ? source.identityDocument : null,
    salarySlip: isStoredVerificationFile(source.salarySlip) ? source.salarySlip : null,
    taxReturns: isStoredVerificationFile(source.taxReturns) ? source.taxReturns : null,
    utilityBill: isStoredVerificationFile(source.utilityBill) ? source.utilityBill : null,
  };
}

function loadProfileDraft(): ProfileDraft {
  if (typeof window === "undefined") {
    return defaultProfileDraft;
  }

  const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);

  if (!stored) {
    return defaultProfileDraft;
  }

  try {
    return hydrateProfileDraft(JSON.parse(stored));
  } catch {
    return defaultProfileDraft;
  }
}

function persistProfileDraft(profile: ProfileDraft) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // File metadata is small, but this keeps the UI alive if storage is blocked.
  }
}

function createFileId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

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
    const store = transaction.objectStore(PROFILE_FILES_STORE_NAME);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    store.put(file, id);
  });
}

async function getFileBlob(id: string) {
  const db = await openProfileFilesDb();

  return new Promise<Blob | null>((resolve, reject) => {
    const transaction = db.transaction(PROFILE_FILES_STORE_NAME, "readonly");
    const store = transaction.objectStore(PROFILE_FILES_STORE_NAME);
    const request = store.get(id);

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
    const store = transaction.objectStore(PROFILE_FILES_STORE_NAME);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    store.delete(id);
  });
}

function formatBytes(size: number) {
  if (size <= 0) {
    return "Uploaded";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileTypeLabel(file: StoredVerificationFile) {
  const nameParts = file.name.split(".");
  const extension = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  if (extension) {
    return extension.toUpperCase();
  }

  if (file.type.includes("/")) {
    return file.type.split("/")[1].toUpperCase();
  }

  return "FILE";
}

function triggerBlobDownload(file: StoredVerificationFile, blob: Blob) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = file.name;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
}

function triggerRemoteDownload(file: StoredVerificationFile) {
  if (!file.url) {
    return;
  }

  const link = document.createElement("a");

  link.href = file.url;
  link.download = file.name;
  link.rel = "noopener noreferrer";
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-[12px] font-medium text-[#344054]">{children}</label>;
}

function TextInput({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-[6px] border border-[#D7DEE8] bg-white px-3 text-sm text-[#344054] outline-none transition placeholder:text-[#98A2B3] focus:border-[#B9C6D8]"
    />
  );
}

function DateInput({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-[6px] border border-[#D7DEE8] bg-white px-3 text-sm text-[#344054] outline-none transition placeholder:text-[#98A2B3] focus:border-[#B9C6D8]"
    />
  );
}

function SelectInput({
  onChange,
  options,
  value,
}: {
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-[6px] border border-[#D7DEE8] bg-white px-3 pr-10 text-sm text-[#344054] outline-none transition focus:border-[#B9C6D8]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#667085]">
        <DashboardIcon name="chevronDown" className="h-4 w-4" />
      </span>
    </div>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M8 4.75h5.5L18.25 9.5V18a2 2 0 0 1-2 2H8A2 2 0 0 1 6 18V6.75a2 2 0 0 1 2-2Z" />
      <path d="M13.5 4.75V9.5h4.75" />
      <path d="M9.5 13h5" />
      <path d="M9.5 16h3.5" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M12 5v9" />
      <path d="m8.5 11.5 3.5 3.5 3.5-3.5" />
      <path d="M6 18.5h12" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M2.75 12s3.4-5 9.25-5 9.25 5 9.25 5-3.4 5-9.25 5-9.25-5-9.25-5Z" />
      <circle cx="12" cy="12" r="2.25" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="m8 8 8 8" />
      <path d="m16 8-8 8" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4.5 8.5h3l1.2-2h6.6l1.2 2h3A1.5 1.5 0 0 1 21 10v7.5A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5V10a1.5 1.5 0 0 1 1.5-1.5Z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function FileActionButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        void onClick();
      }}
      className="inline-flex h-4 w-4 items-center justify-center text-[#667085] transition hover:text-[#344054]"
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function FileChip({
  file,
  onCancel,
  onDownload,
  onPreview,
}: {
  file: StoredVerificationFile;
  onCancel: () => void | Promise<void>;
  onDownload: () => void | Promise<void>;
  onPreview: () => void | Promise<void>;
}) {
  return (
    <div className="inline-flex min-w-[228px] items-center gap-3 rounded-[8px] bg-[#F2F4F7] px-3 py-2 text-[#667085] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <span className="inline-flex h-4 w-4 items-center justify-center text-[#98A2B3]">
        <DocumentIcon />
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-[11px] font-semibold text-[#344054]">{file.name}</p>
        <p className="truncate text-[10px] text-[#98A2B3]">
          {getFileTypeLabel(file)} - {formatBytes(file.size)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <FileActionButton label="Download file" onClick={onDownload}>
          <DownloadIcon />
        </FileActionButton>
        <FileActionButton label="Preview file" onClick={onPreview}>
          <EyeIcon />
        </FileActionButton>
        <FileActionButton label="Remove file" onClick={onCancel}>
          <CloseIcon />
        </FileActionButton>
      </div>
    </div>
  );
}

function UploadField({
  accept,
  file,
  label,
  onCancel,
  onDownload,
  onPreview,
  onSelect,
}: {
  accept?: string;
  file: StoredVerificationFile | null;
  label: string;
  onCancel: () => void | Promise<void>;
  onDownload: () => void | Promise<void>;
  onPreview: () => void | Promise<void>;
  onSelect: (file: File) => void | Promise<void>;
}) {
  const inputId = useId();

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="rounded-[10px] border border-dashed border-[#D5DDE8] bg-white px-3 py-4 sm:px-4">
        {file ? (
          <div className="flex justify-center">
            <FileChip file={file} onCancel={onCancel} onDownload={onDownload} onPreview={onPreview} />
          </div>
        ) : (
          <div className="flex justify-center">
            <label
              htmlFor={inputId}
              className="inline-flex cursor-pointer items-center rounded-[8px] border border-[#D7DEE8] bg-[#F8FAFC] px-4 py-2 text-xs font-medium text-[#344054] transition hover:bg-[#F2F4F7]"
            >
              Select file
            </label>
          </div>
        )}

        <input
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => {
            const nextFile = event.target.files?.[0];

            if (nextFile) {
              void onSelect(nextFile);
            }

            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

function AvatarUpload({
  previewUrl,
  onSelect,
}: {
  previewUrl: string | null;
  onSelect: (file: File) => void | Promise<void>;
}) {
  const inputId = useId();

  return (
    <div className="relative inline-block">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#F2F4F7]">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Verification portrait" className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 64 64" className="h-16 w-16 text-[#101828]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="32" cy="21" r="11" />
            <path d="M14 52a18 18 0 0 1 36 0" />
          </svg>
        )}
      </div>

      <label
        htmlFor={inputId}
        className="absolute bottom-1 right-0 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#314B6B] text-white shadow-[0_4px_12px_rgba(49,75,107,0.28)]"
        aria-label="Upload profile photo"
        title="Upload profile photo"
      >
        <CameraIcon />
      </label>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const nextFile = event.target.files?.[0];

          if (nextFile) {
            void onSelect(nextFile);
          }

          event.target.value = "";
        }}
      />
    </div>
  );
}

function UpdateButton({ isSaving, onClick }: { isSaving?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={isSaving}
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center rounded-[6px] bg-[#F97316] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#EA6A0A] disabled:cursor-wait disabled:opacity-70"
    >
      {isSaving ? "Updating..." : "Update"}
    </button>
  );
}

function PreviewDialog({
  file,
  objectUrl,
  onClose,
}: {
  file: StoredVerificationFile;
  objectUrl: string;
  onClose: () => void;
}) {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isPdf = file.type === "application/pdf";
  const isText = file.type.startsWith("text/");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-4xl overflow-hidden rounded-[16px] bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[#E4E7EC] px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#243B5A]">{file.name}</p>
            <p className="mt-1 text-xs text-[#98A2B3]">
              {getFileTypeLabel(file)} - {formatBytes(file.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-[8px] bg-[#243B5A] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#1E3250]"
          >
            Close
          </button>
        </div>

        <div className="max-h-[75vh] overflow-auto bg-[#F8FAFC] p-4">
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={objectUrl} alt={file.name} className="mx-auto max-h-[68vh] rounded-[12px] object-contain" />
          ) : null}

          {isVideo ? (
            <video src={objectUrl} controls className="mx-auto max-h-[68vh] w-full rounded-[12px] bg-black" />
          ) : null}

          {isPdf ? <iframe src={objectUrl} title={file.name} className="h-[68vh] w-full rounded-[12px] bg-white" /> : null}

          {isText ? <iframe src={objectUrl} title={file.name} className="h-[68vh] w-full rounded-[12px] bg-white" /> : null}

          {!isImage && !isVideo && !isPdf && !isText ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-[12px] border border-dashed border-[#D5DDE8] bg-white p-6 text-center text-sm text-[#667085]">
              This file type cannot be previewed here, but it can still be downloaded.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function VerificationCard({
  children,
  error,
  isSaving,
  message,
  onUpdate,
  title,
}: {
  children: React.ReactNode;
  error?: string;
  isSaving?: boolean;
  message?: string;
  onUpdate: () => void;
  title: string;
}) {
  return (
    <article className="overflow-hidden rounded-[8px] border border-[#D0D5DD] bg-white shadow-[0_8px_24px_-18px_rgba(16,24,40,0.18)]">
      <div className="border-b border-[#DDE3EA] bg-[#FBFCFD] px-4 py-4">
        <h2 className="text-[14px] font-semibold text-[#243B5A]">{title}</h2>
      </div>
      <div className="space-y-5 px-4 py-4 sm:px-5 sm:py-5">{children}</div>
      <div className="flex flex-col gap-3 border-t border-[#DDE3EA] bg-[#FBFCFD] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        {(message || error) ? (
          <p className={`text-sm font-medium ${error ? "text-red-600" : "text-[#16A34A]"}`}>
            {error || message}
          </p>
        ) : (
          <span className="text-sm text-[#98A2B3]"> </span>
        )}
        <UpdateButton isSaving={isSaving} onClick={onUpdate} />
      </div>
    </article>
  );
}

function ProfileSummary({
  error,
  form,
  isLoading,
  isSaving,
  kyc,
  message,
  onChange,
  onUpdate,
  user,
}: {
  error: string;
  form: AccountProfileForm;
  isLoading: boolean;
  isSaving: boolean;
  kyc: KycDetails | null;
  message: string;
  onChange: (field: keyof AccountProfileForm, value: string) => void;
  onUpdate: () => void;
  user?: UserDetails;
}) {
  const status = kyc?.status ?? "not submitted";
  const applicantType = getApplicantType(kyc);

  return (
    <article className="rounded-[8px] border border-[#D0D5DD] bg-white p-4 shadow-[0_8px_24px_-18px_rgba(16,24,40,0.18)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#667085]">Account</p>
          <div className="mt-2 max-w-[360px]">
            <TextInput
              placeholder={isLoading ? "Loading profile..." : "Your name"}
              value={form.name}
              onChange={(value) => onChange("name", value)}
            />
          </div>
          <p className="mt-1 truncate text-sm text-[#667085]">{formatDisplayValue(user?.email)}</p>
        </div>

        <span className="inline-flex w-fit rounded-full bg-[#FFF4ED] px-3 py-1 text-xs font-semibold capitalize text-[#F97316]">
          KYC {status}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <div className="rounded-[8px] bg-[#F8FAFC] px-3 py-3">
          <p className="text-[11px] font-medium text-[#98A2B3]">Role</p>
          <p className="mt-1 text-sm font-semibold capitalize text-[#344054]">{formatDisplayValue(user?.role)}</p>
        </div>
        <div className="rounded-[8px] bg-[#F8FAFC] px-3 py-3">
          <p className="text-[11px] font-medium text-[#98A2B3]">Business Type</p>
          <p className="mt-1 text-sm font-semibold text-[#344054]">{formatApplicantType(applicantType)}</p>
        </div>
        <div className="rounded-[8px] bg-[#F8FAFC] px-3 py-3">
          <p className="text-[11px] font-medium text-[#98A2B3]">Phone</p>
          <input
            type="text"
            value={form.phone}
            onChange={(event) => onChange("phone", event.target.value)}
            placeholder="Your phone number"
            className="mt-1 h-8 w-full rounded-[6px] border border-[#D7DEE8] bg-white px-2 text-sm font-semibold text-[#344054] outline-none transition placeholder:text-[#98A2B3] focus:border-[#B9C6D8]"
          />
        </div>
        <div className="rounded-[8px] bg-[#F8FAFC] px-3 py-3">
          <p className="text-[11px] font-medium text-[#98A2B3]">KYC Step</p>
          <p className="mt-1 text-sm font-semibold text-[#344054]">
            {kyc?.currentStep ? `${kyc.currentStep}/4 complete` : "Not started"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-[#E4E7EC] pt-4 sm:flex-row sm:items-center sm:justify-between">
        {(message || error) ? (
          <p className={`text-sm font-medium ${error ? "text-red-600" : "text-[#16A34A]"}`}>
            {error || message}
          </p>
        ) : (
          <span className="text-sm text-[#98A2B3]"> </span>
        )}

        <button
          type="button"
          disabled={isSaving}
          onClick={onUpdate}
          className="inline-flex h-10 items-center justify-center rounded-[6px] bg-[#F97316] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#EA6A0A] disabled:cursor-wait disabled:opacity-70"
        >
          {isSaving ? "Updating..." : "Update"}
        </button>
      </div>
    </article>
  );
}

export function ProfilePage() {
  const authUser = useAuthStore((state) => state.user);
  const setAuthUser = useAuthStore((state) => state.setUser);
  const [profile, setProfile] = useState<ProfileDraft>(defaultProfileDraft);
  const [savedProfile, setSavedProfile] = useState<ProfileDraft>(defaultProfileDraft);
  const [profileDetails, setProfileDetails] = useState<UserDetailsResponse["data"] | null>(null);
  const [accountForm, setAccountForm] = useState<AccountProfileForm>({ name: "", phone: "" });
  const [accountUpdateError, setAccountUpdateError] = useState("");
  const [accountUpdateMessage, setAccountUpdateMessage] = useState("");
  const [isAccountUpdating, setIsAccountUpdating] = useState(false);
  const [kycUpdateStatuses, setKycUpdateStatuses] = useState<Record<KycSectionKey, KycUpdateStatus>>(
    defaultKycUpdateStatuses,
  );
  const [profileError, setProfileError] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [facePhotoPreviewUrl, setFacePhotoPreviewUrl] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<{ file: StoredVerificationFile; objectUrl: string } | null>(null);

  useEffect(() => {
    let active = true;

    const initializeProfile = async () => {
      const localProfile = loadProfileDraft();
      persistProfileDraft(localProfile);

      startTransition(() => {
        setProfile(localProfile);
        setSavedProfile(localProfile);
        setLoaded(true);
        setIsProfileLoading(true);
      });

      try {
        const response = await apiRequest<UserDetailsResponse>({
          method: "GET",
          url: "kyc/user/details",
        });

        if (!active) {
          return;
        }

        const nextDetails = response.data ?? null;
        const nextProfile = buildProfileFromDetails(nextDetails, localProfile);

        persistProfileDraft(nextProfile);
        startTransition(() => {
          setProfile(nextProfile);
          setSavedProfile(nextProfile);
          setProfileDetails(nextDetails);
          setAccountForm({
            name: nextDetails?.user?.name ?? "",
            phone: getUserPhone(nextDetails?.user, getLatestKyc(nextDetails?.kyc)),
          });
          setProfileError("");
        });
      } catch (error) {
        if (active) {
          setProfileError(getApiErrorMessage(error, "Unable to load profile details."));
        }
      } finally {
        if (active) {
          setIsProfileLoading(false);
        }
      }
    };

    void initializeProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    persistProfileDraft(profile);
  }, [loaded, profile]);

  useEffect(() => {
    let active = true;
    let nextObjectUrl: string | null = null;

    if (!profile.facePhoto) {
      startTransition(() => {
        setFacePhotoPreviewUrl(null);
      });
      return () => undefined;
    }

    if (profile.facePhoto.url) {
      startTransition(() => {
        setFacePhotoPreviewUrl(profile.facePhoto?.url ?? null);
      });
      return () => undefined;
    }

    const loadPreview = async () => {
      try {
        const blob = await getFileBlob(profile.facePhoto!.id);

        if (!active || !blob) {
          if (active) {
            setFacePhotoPreviewUrl(null);
          }
          return;
        }

        nextObjectUrl = URL.createObjectURL(blob);
        setFacePhotoPreviewUrl(nextObjectUrl);
      } catch {
        if (active) {
          setFacePhotoPreviewUrl(null);
        }
      }
    };

    void loadPreview();

    return () => {
      active = false;

      if (nextObjectUrl) {
        URL.revokeObjectURL(nextObjectUrl);
      }
    };
  }, [profile.facePhoto]);

  useEffect(() => {
    return () => {
      if (previewState?.objectUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewState.objectUrl);
      }
    };
  }, [previewState]);

  const updateField = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => {
    setProfile((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const closePreview = () => {
    setPreviewState((current) => {
      if (current?.objectUrl.startsWith("blob:")) {
        URL.revokeObjectURL(current.objectUrl);
      }

      return null;
    });
  };

  const openPreview = async (file: StoredVerificationFile) => {
    if (file.url) {
      const remoteUrl = file.url;

      setPreviewState((current) => {
        if (current?.objectUrl.startsWith("blob:")) {
          URL.revokeObjectURL(current.objectUrl);
        }

        return {
          file,
          objectUrl: remoteUrl,
        };
      });
      return;
    }

    const blob = await getFileBlob(file.id);

    if (!blob) {
      return;
    }

    const objectUrl = URL.createObjectURL(blob);

    setPreviewState((current) => {
      if (current?.objectUrl.startsWith("blob:")) {
        URL.revokeObjectURL(current.objectUrl);
      }

      return {
        file,
        objectUrl,
      };
    });
  };

  const downloadFile = async (file: StoredVerificationFile) => {
    if (file.url) {
      triggerRemoteDownload(file);
      return;
    }

    const blob = await getFileBlob(file.id);

    if (!blob) {
      return;
    }

    triggerBlobDownload(file, blob);
  };

  const clearStoredFile = async (key: FileFieldKey) => {
    const existing = profile[key];

    if (!existing) {
      return;
    }

    if (!existing.url) {
      await deleteFileBlob(existing.id);
    }

    if (previewState?.file.id === existing.id) {
      closePreview();
    }

    updateField(key, null as ProfileDraft[typeof key]);
  };

  const handleFileSelect = async (key: FileFieldKey, file: File) => {
    const previous = profile[key];

    if (previous) {
      await deleteFileBlob(previous.id);
    }

    const id = createFileId();
    await saveFileBlob(id, file);

    updateField(key, {
      id,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    } as ProfileDraft[typeof key]);
  };

  const setKycUpdateStatus = (section: KycSectionKey, status: Partial<KycUpdateStatus>) => {
    setKycUpdateStatuses((current) => ({
      ...current,
      [section]: {
        ...current[section],
        ...status,
      },
    }));
  };

  const updateKycSection = async (section: KycSectionKey) => {
    const kycId = latestKyc?._id;

    if (!kycId) {
      setKycUpdateStatus(section, {
        error: "KYC record was not found. Please complete KYC first.",
        message: "",
      });
      return;
    }

    setKycUpdateStatus(section, {
      error: "",
      isSaving: true,
      message: "",
    });

    try {
      const { changedCount, formData } = await buildChangedKycFormData(profile, savedProfile, section);

      if (changedCount === 0) {
        setKycUpdateStatus(section, {
          error: "",
          isSaving: false,
          message: "No changes to update.",
        });
        return;
      }

      await apiRequest({
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        method: "PATCH",
        url: `kyc/${kycId}`,
      });

      setSavedProfile((current) => mergeSavedProfileSection(current, profile, section));
      persistProfileDraft(profile);
      setKycUpdateStatus(section, {
        error: "",
        isSaving: false,
        message: "KYC details updated.",
      });
    } catch (error) {
      setKycUpdateStatus(section, {
        error: getApiErrorMessage(error, "Unable to update KYC details."),
        isSaving: false,
        message: "",
      });
    }
  };

  const updateAccountForm = (field: keyof AccountProfileForm, value: string) => {
    setAccountForm((current) => ({
      ...current,
      [field]: value,
    }));
    setAccountUpdateMessage("");
    setAccountUpdateError("");
  };

  const updateAccountProfile = async () => {
    const name = accountForm.name.trim();
    const phone = accountForm.phone.trim();

    setIsAccountUpdating(true);
    setAccountUpdateError("");
    setAccountUpdateMessage("");

    try {
      await apiRequest({
        data: {
          name,
          phone,
        },
        method: "PATCH",
        url: "auth/profile",
      });

      setProfileDetails((current) => ({
        ...current,
        user: {
          ...current?.user,
          name,
          phone,
          mobile: phone,
        },
      }));
      setAuthUser(authUser ? { ...authUser, name } : { name });
      setAccountForm({ name, phone });
      setAccountUpdateMessage("Profile info updated.");
    } catch (error) {
      setAccountUpdateError(getApiErrorMessage(error, "Unable to update profile info."));
    } finally {
      setIsAccountUpdating(false);
    }
  };

  const latestKyc = getLatestKyc(profileDetails?.kyc);

  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Profile" subtitle="Edit your profile section here" />

      <div className=" space-y-6">
        <ProfileSummary
          error={accountUpdateError}
          form={accountForm}
          isLoading={isProfileLoading}
          isSaving={isAccountUpdating}
          kyc={latestKyc}
          message={accountUpdateMessage}
          onChange={updateAccountForm}
          onUpdate={updateAccountProfile}
          user={profileDetails?.user}
        />

        {profileError ? (
          <div className="rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {profileError}
          </div>
        ) : null}

        <KycDataReviewCard
          kyc={latestKyc as KycRecord | null}
          mode="user"
          onChange={(kyc) => {
            setProfileDetails((current) => {
              if (!current) return current;

              const existingKycs = current.kyc ?? [];
              const nextKycs = existingKycs.some((item) => item._id === kyc._id)
                ? existingKycs.map((item) => (item._id === kyc._id ? (kyc as KycDetails) : item))
                : [kyc as KycDetails, ...existingKycs];

              return {
                ...current,
                kyc: nextKycs,
              };
            });
          }}
        />

        <div className="hidden">
        <VerificationCard
          title="Personal Identity"
          error={kycUpdateStatuses.identity.error}
          isSaving={kycUpdateStatuses.identity.isSaving}
          message={kycUpdateStatuses.identity.message}
          onUpdate={() => {
            void updateKycSection("identity");
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Full Legal Name</FieldLabel>
              <TextInput
                placeholder="Full legal name"
                value={profile.fullName}
                onChange={(value) => updateField("fullName", value)}
              />
            </div>
            <div>
              <FieldLabel>Date of Birth</FieldLabel>
              <DateInput
                value={profile.dateOfBirth}
                onChange={(value) => updateField("dateOfBirth", value)}
              />
            </div>
            <div>
              <FieldLabel>Country of Residence</FieldLabel>
              <SelectInput
                value={profile.country || "Select a country"}
                options={["Select a country", "United Kingdom", "United States", "Bangladesh"]}
                onChange={(value) => updateField("country", value === "Select a country" ? "" : value)}
              />
            </div>
            <div>
              <FieldLabel>Identification Type</FieldLabel>
              <SelectInput
                value={profile.identificationType}
                options={["Passport", "National ID", "Driving License"]}
                onChange={(value) => updateField("identificationType", value)}
              />
            </div>
          </div>

          <UploadField
            label="Identity Document Upload"
            file={profile.identityDocument}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onCancel={() => clearStoredFile("identityDocument")}
            onDownload={() => (profile.identityDocument ? downloadFile(profile.identityDocument) : undefined)}
            onPreview={() => (profile.identityDocument ? openPreview(profile.identityDocument) : undefined)}
            onSelect={(file) => handleFileSelect("identityDocument", file)}
          />
        </VerificationCard>

        <VerificationCard
          title="Face Verification"
          error={kycUpdateStatuses.face.error}
          isSaving={kycUpdateStatuses.face.isSaving}
          message={kycUpdateStatuses.face.message}
          onUpdate={() => {
            void updateKycSection("face");
          }}
        >
          <div>
            <FieldLabel>Upload Photo for verification</FieldLabel>
            <AvatarUpload previewUrl={facePhotoPreviewUrl} onSelect={(file) => handleFileSelect("facePhoto", file)} />
          </div>

          <UploadField
            label="Upload Video for verification"
            file={profile.faceVideo}
            accept="video/*"
            onCancel={() => clearStoredFile("faceVideo")}
            onDownload={() => (profile.faceVideo ? downloadFile(profile.faceVideo) : undefined)}
            onPreview={() => (profile.faceVideo ? openPreview(profile.faceVideo) : undefined)}
            onSelect={(file) => handleFileSelect("faceVideo", file)}
          />
        </VerificationCard>

        <VerificationCard
          title="Address Verification"
          error={kycUpdateStatuses.address.error}
          isSaving={kycUpdateStatuses.address.isSaving}
          message={kycUpdateStatuses.address.message}
          onUpdate={() => {
            void updateKycSection("address");
          }}
        >
          <UploadField
            label="Utility Bill Upload"
            file={profile.utilityBill}
            accept=".pdf,.jpg,.jpeg,.png"
            onCancel={() => clearStoredFile("utilityBill")}
            onDownload={() => (profile.utilityBill ? downloadFile(profile.utilityBill) : undefined)}
            onPreview={() => (profile.utilityBill ? openPreview(profile.utilityBill) : undefined)}
            onSelect={(file) => handleFileSelect("utilityBill", file)}
          />

          <UploadField
            label="Bank Statement Upload"
            file={profile.bankStatement}
            accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx"
            onCancel={() => clearStoredFile("bankStatement")}
            onDownload={() => (profile.bankStatement ? downloadFile(profile.bankStatement) : undefined)}
            onPreview={() => (profile.bankStatement ? openPreview(profile.bankStatement) : undefined)}
            onSelect={(file) => handleFileSelect("bankStatement", file)}
          />
        </VerificationCard>

        <VerificationCard
          title="Source of Funds"
          error={kycUpdateStatuses.funds.error}
          isSaving={kycUpdateStatuses.funds.isSaving}
          message={kycUpdateStatuses.funds.message}
          onUpdate={() => {
            void updateKycSection("funds");
          }}
        >
          <UploadField
            label="Upload Salary Slip"
            file={profile.salarySlip}
            accept=".pdf,.jpg,.jpeg,.png"
            onCancel={() => clearStoredFile("salarySlip")}
            onDownload={() => (profile.salarySlip ? downloadFile(profile.salarySlip) : undefined)}
            onPreview={() => (profile.salarySlip ? openPreview(profile.salarySlip) : undefined)}
            onSelect={(file) => handleFileSelect("salarySlip", file)}
          />

          <UploadField
            label="Upload Business Document"
            file={profile.businessDocument}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onCancel={() => clearStoredFile("businessDocument")}
            onDownload={() => (profile.businessDocument ? downloadFile(profile.businessDocument) : undefined)}
            onPreview={() => (profile.businessDocument ? openPreview(profile.businessDocument) : undefined)}
            onSelect={(file) => handleFileSelect("businessDocument", file)}
          />

          <UploadField
            label="Upload Tax Returns"
            file={profile.taxReturns}
            accept=".pdf,.jpg,.jpeg,.png,.csv"
            onCancel={() => clearStoredFile("taxReturns")}
            onDownload={() => (profile.taxReturns ? downloadFile(profile.taxReturns) : undefined)}
            onPreview={() => (profile.taxReturns ? openPreview(profile.taxReturns) : undefined)}
            onSelect={(file) => handleFileSelect("taxReturns", file)}
          />
        </VerificationCard>
        </div>
      </div>

      {loaded && previewState ? (
        <PreviewDialog file={previewState.file} objectUrl={previewState.objectUrl} onClose={closePreview} />
      ) : null}
    </section>
  );
}
