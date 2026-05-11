"use client";

import { startTransition, useEffect, useId, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DashboardIcon } from "@/components/dashboard/icons";
import { getApiErrorMessage } from "@/lib/api";
import { getKycIdFromResponse, submitKycFormData } from "@/lib/kyc-api";

const PROFILE_STORAGE_KEY = "earlyn.dashboard.profile";
const PROFILE_FILES_DB_NAME = "earlyn-profile-files";
const PROFILE_FILES_STORE_NAME = "files";
const KYC_ID_STORAGE_KEY = "earlyn.auth.kyc.id";
const KYC_STEP_STORAGE_KEY = "earlyn.auth.kyc.step";

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
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.type === "string" &&
    typeof candidate.size === "number"
  );
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
    // Keep the flow alive if storage is blocked.
  }
}

function loadStoredStep() {
  if (typeof window === "undefined") {
    return 1;
  }

  const rawValue = window.localStorage.getItem(KYC_STEP_STORAGE_KEY);
  const step = Number(rawValue);

  if (!Number.isInteger(step) || step < 1 || step > 4) {
    return 1;
  }

  return step;
}

function persistStoredStep(step: number) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(KYC_STEP_STORAGE_KEY, String(step));
}

function persistStoredKycId(kycId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(KYC_ID_STORAGE_KEY, kycId);
}

async function clearKycDraftCache() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PROFILE_STORAGE_KEY);
  window.localStorage.removeItem(KYC_ID_STORAGE_KEY);
  window.localStorage.removeItem(KYC_STEP_STORAGE_KEY);

  await new Promise<void>((resolve) => {
    const deleteRequest = window.indexedDB.deleteDatabase(PROFILE_FILES_DB_NAME);

    deleteRequest.onsuccess = () => resolve();
    deleteRequest.onerror = () => resolve();
    deleteRequest.onblocked = () => resolve();
  });
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
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))}KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
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

function FieldLabel({ children }: { children: ReactNode }) {
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
      className="h-[42px] w-full rounded-[6px] border border-[#D7DEE8] bg-white px-3 text-sm text-[#344054] outline-none transition placeholder:text-[#98A2B3] focus:border-[#B9C6D8]"
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
      className="h-[42px] w-full rounded-[6px] border border-[#D7DEE8] bg-white px-3 text-sm text-[#344054] outline-none transition placeholder:text-[#98A2B3] focus:border-[#B9C6D8]"
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
        className="h-[42px] w-full appearance-none rounded-[6px] border border-[#D7DEE8] bg-white px-3 pr-10 text-sm text-[#344054] outline-none transition focus:border-[#B9C6D8]"
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

function UploadGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M12 14V7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m8.75 10.75 3.25-3.25 3.25 3.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.75 16.25h8.5" strokeLinecap="round" />
    </svg>
  );
}

function UploadMetaIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.35" aria-hidden="true">
      <path d="M5 2.75h3.5l2.75 2.75v6.75a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8.5a1 1 0 0 1 1-1Z" />
      <path d="M8.5 2.75V5.5h2.75" />
    </svg>
  );
}

function FileActionButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
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
    <div className="inline-flex min-w-[244px] items-center gap-3 rounded-[8px] bg-[#F2F4F7] px-3 py-2 text-[#667085]">
      <span className="inline-flex h-4 w-4 items-center justify-center text-[#98A2B3]">
        <DocumentIcon />
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-[11px] font-semibold text-[#344054]">{file.name}</p>
        <p className="truncate text-[10px] text-[#98A2B3]">
          File type <span className="mx-1">•</span> {formatBytes(file.size)}
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

function UploadArea({
  accept,
  file,
  onCancel,
  onDownload,
  onPreview,
  onSelect,
}: {
  accept: string;
  file: StoredVerificationFile | null;
  onCancel: () => void | Promise<void>;
  onDownload: () => void | Promise<void>;
  onPreview: () => void | Promise<void>;
  onSelect: (file: File) => void | Promise<void>;
}) {
  const inputId = useId();

  return (
    <div className="rounded-[12px] border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-4 py-7">
      {file ? (
        <div className="flex justify-center">
          <FileChip file={file} onCancel={onCancel} onDownload={onDownload} onPreview={onPreview} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#EAECF0] text-[#344054]">
            <UploadGlyph />
          </span>
          <p className="mt-4 text-[14px] font-medium leading-5 text-[#344054]">Upload your document here</p>
          <label htmlFor={inputId} className="mt-1 cursor-pointer text-[12px] leading-4 text-[#667085]">
            or <span className="font-semibold text-[#F97316]">browse files</span>
          </label>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-[#98A2B3]">
            <span className="inline-flex items-center gap-1">
              <UploadMetaIcon />
              <span>PDF</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <UploadMetaIcon />
              <span>JPG/PNG</span>
            </span>
            <span>Max size: 10MB</span>
          </div>
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
      <div className="flex h-[106px] w-[106px] items-center justify-center overflow-hidden rounded-full bg-[#F2F4F7]">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Verification portrait" className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 64 64" className="h-[72px] w-[72px] text-[#101828]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="32" cy="21" r="11" />
            <path d="M14 52a18 18 0 0 1 36 0" />
          </svg>
        )}
      </div>

      <label
        htmlFor={inputId}
        className="absolute bottom-0 right-0 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#314B6B] text-white"
        aria-label="Upload profile photo"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M4.5 8.5h3l1.2-2h6.6l1.2 2h3A1.5 1.5 0 0 1 21 10v7.5A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5V10a1.5 1.5 0 0 1 1.5-1.5Z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
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
          {isVideo ? <video src={objectUrl} controls className="mx-auto max-h-[68vh] w-full rounded-[12px] bg-black" /> : null}
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

function Stepper({ step }: { step: number }) {
  const steps = [
    "Personal Identity",
    "Address Verification",
    "Face Verification",
    "Source of Funds",
  ];

  return (
    <div className="mt-7 border-t border-[#D9DEE7] pt-7">
      <div className="mx-auto max-w-[460px]">
        <div className="relative flex items-start justify-between">
          <div className="absolute left-[14px] right-[14px] top-[10px] h-[2px] bg-[#E5E7F0]" />
          <div
            className="absolute left-[14px] top-[10px] h-[2px] bg-[#F97316] transition-all"
            style={{ width: `calc((100% - 28px) * ${(step - 1) / 3})` }}
          />
          {steps.map((label, index) => {
            const current = index + 1;
            const active = current <= step;

            return (
              <div key={label} className="relative z-10 flex w-[92px] flex-col items-center text-center">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                    active ? "bg-[#F97316] text-white" : "bg-[#ECECF4] text-[#667085]"
                  }`}
                >
                  {current}
                </span>
                <span className="mt-3 text-[9px] font-medium text-[#101828]">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KycCard({
  children,
  subtitle,
  title,
}: {
  children: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-[10px] border border-[#D0D5DD] bg-white shadow-[0_10px_22px_-20px_rgba(16,24,40,0.28)]">
      <div className="border-b border-[#E4E7EC] bg-[#FBFCFD] px-4 py-4">
        <h2 className="text-[14px] font-semibold text-[#243B5A]">{title}</h2>
        <p className="mt-1 text-[11px] text-[#667085]">{subtitle}</p>
      </div>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

function NavButtons({
  isLastStep,
  isSubmitting,
  onBack,
  onContinue,
  showBack,
}: {
  isLastStep: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onContinue: () => void;
  showBack: boolean;
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-[#E4E7EC] bg-[#FBFCFD] px-4 py-3">
      {showBack ? (
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="inline-flex h-10 items-center justify-center rounded-[6px] border border-[#314B6B] px-4 text-xs font-semibold text-[#314B6B] transition hover:bg-[#F8FAFC] disabled:cursor-wait disabled:opacity-70"
        >
          Back
        </button>
      ) : null}
      <button
        type="button"
        disabled={isSubmitting}
        onClick={onContinue}
        className="inline-flex h-10 items-center justify-center rounded-[6px] bg-[#F97316] px-4 text-xs font-semibold text-white transition hover:bg-[#EA6A0A] disabled:cursor-wait disabled:opacity-80"
      >
        {isSubmitting ? (isLastStep ? "Submitting..." : "Saving...") : "Continue"}
      </button>
    </div>
  );
}

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

async function buildKycFormData(profile: ProfileDraft, currentStep: number) {
  const formData = new FormData();

  formData.append("currentStep", String(currentStep));
  formData.append("personalIdentity.fullLegalName", profile.fullName.trim());
  formData.append("personalIdentity.dateOfBirth", profile.dateOfBirth.trim());
  formData.append("personalIdentity.countryOfResidence", profile.country.trim());
  formData.append("personalIdentity.identificationType", profile.identificationType.trim().toLowerCase());

  for (const field of kycFileFields) {
    const file = profile[field.profileKey];

    if (!file) {
      continue;
    }

    const blob = await getFileBlob(file.id);

    if (blob) {
      formData.append(field.apiKey, blob, file.name);
    }
  }

  return formData;
}

export function KycVerificationPage({
  initialKycId,
  role,
}: {
  initialKycId?: string;
  role: "investee" | "investor";
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileDraft>(defaultProfileDraft);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState(1);
  const [kycId, setKycId] = useState<string | null>(initialKycId ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [facePhotoPreviewUrl, setFacePhotoPreviewUrl] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<{ file: StoredVerificationFile; objectUrl: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const initializeKycDraft = async () => {
      const isEditMode = Boolean(initialKycId);
      const nextProfile = isEditMode ? loadProfileDraft() : defaultProfileDraft;
      const nextKycId = initialKycId ?? null;
      const nextStep = isEditMode ? loadStoredStep() : 1;

      if (!isEditMode) {
        await clearKycDraftCache();
      }

      if (!active) {
        return;
      }

      persistProfileDraft(nextProfile);

      if (nextKycId) {
        persistStoredKycId(nextKycId);
      }

      startTransition(() => {
        setProfile(nextProfile);
        setKycId(nextKycId);
        setStep(nextStep);
        setLoaded(true);
      });
    };

    void initializeKycDraft();

    return () => {
      active = false;
    };
  }, [initialKycId]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    persistProfileDraft(profile);
  }, [loaded, profile]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    persistStoredStep(step);
  }, [loaded, step]);

  useEffect(() => {
    let active = true;
    let nextObjectUrl: string | null = null;

    if (!profile.facePhoto) {
      startTransition(() => {
        setFacePhotoPreviewUrl(null);
      });
      return () => undefined;
    }

    const loadPreview = async () => {
      try {
        const blob = await getFileBlob(profile.facePhoto!.id);

        if (!active || !blob) {
          if (active) {
            startTransition(() => {
              setFacePhotoPreviewUrl(null);
            });
          }
          return;
        }

        nextObjectUrl = URL.createObjectURL(blob);
        startTransition(() => {
          setFacePhotoPreviewUrl(nextObjectUrl);
        });
      } catch {
        if (active) {
          startTransition(() => {
            setFacePhotoPreviewUrl(null);
          });
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
      if (previewState) {
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
      if (current) {
        URL.revokeObjectURL(current.objectUrl);
      }

      return null;
    });
  };

  const openPreview = async (file: StoredVerificationFile) => {
    const blob = await getFileBlob(file.id);

    if (!blob) {
      return;
    }

    const objectUrl = URL.createObjectURL(blob);

    setPreviewState((current) => {
      if (current) {
        URL.revokeObjectURL(current.objectUrl);
      }

      return {
        file,
        objectUrl,
      };
    });
  };

  const downloadFile = async (file: StoredVerificationFile) => {
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

    await deleteFileBlob(existing.id);

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

  const validateStep = () => {
    if (step === 1) {
      if (!profile.fullName.trim() || !profile.dateOfBirth.trim() || !profile.country.trim() || !profile.identityDocument) {
        setError("Please complete all personal identity fields and upload your identity document.");
        return false;
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.dateOfBirth)) {
        setError("Please choose your date of birth in YYYY-MM-DD format.");
        return false;
      }
    }

    if (step === 2) {
      if (!profile.utilityBill || !profile.bankStatement) {
        setError("Please upload both your utility bill and bank statement.");
        return false;
      }
    }

    if (step === 3) {
      if (!profile.facePhoto || !profile.faceVideo) {
        setError("Please upload both your verification photo and verification video.");
        return false;
      }
    }

    if (step === 4) {
      if (!profile.salarySlip || !profile.businessDocument || !profile.taxReturns) {
        setError("Please upload all source of funds documents.");
        return false;
      }
    }

    setError("");
    return true;
  };

  const continueFlow = async () => {
    if (!validateStep()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = await buildKycFormData(profile, step);
      const response = await submitKycFormData(formData, kycId);
      const nextKycId = getKycIdFromResponse(response);

      if (nextKycId) {
        setKycId(nextKycId);
        persistStoredKycId(nextKycId);
      }

      persistProfileDraft(profile);

      if (step === 4) {
        await clearKycDraftCache();
        router.push(role === "investee" ? "/investee-dashboard" : "/dashboard");
        return;
      }

      setStep((current) => current + 1);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Unable to submit KYC details. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    setError("");
    setStep((current) => Math.max(1, current - 1));
  };

  const pageTitle = useMemo(() => "KYC Verification", []);

  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[980px]">
        <header className="mx-auto max-w-[760px]">
          <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-[#243B5A]">{pageTitle}</h1>
          <p className="mt-1 text-[13px] text-[#667085]">Complete your profile to unlock secure business opportunities.</p>
          <Stepper step={step} />
        </header>

        <div className="mx-auto mt-10 max-w-[640px]">
          {step === 1 ? (
            <KycCard
              title="Step 1: Personal Identity"
              subtitle="Please provide details exactly as they appear on your legal documents."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <FieldLabel>Full Legal Name</FieldLabel>
                  <TextInput
                    placeholder="John Doe"
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
                    options={["Select a country", "United Kingdom", "United States", "Bangladesh", "Kenya"]}
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

              <div className="mt-4">
                <FieldLabel>Identity Document Upload</FieldLabel>
                <UploadArea
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  file={profile.identityDocument}
                  onCancel={() => clearStoredFile("identityDocument")}
                  onDownload={() => (profile.identityDocument ? downloadFile(profile.identityDocument) : undefined)}
                  onPreview={() => (profile.identityDocument ? openPreview(profile.identityDocument) : undefined)}
                  onSelect={(file) => handleFileSelect("identityDocument", file)}
                />
              </div>

              <NavButtons showBack={false} isLastStep={false} isSubmitting={isSubmitting} onBack={goBack} onContinue={continueFlow} />
            </KycCard>
          ) : null}

          {step === 2 ? (
            <KycCard
              title="Step 2: Address Verification"
              subtitle="Verify your identity to keep your account secure"
            >
              <div className="space-y-4">
                <div>
                  <FieldLabel>Utility Bill Upload</FieldLabel>
                  <UploadArea
                    accept=".pdf,.jpg,.jpeg,.png"
                    file={profile.utilityBill}
                    onCancel={() => clearStoredFile("utilityBill")}
                    onDownload={() => (profile.utilityBill ? downloadFile(profile.utilityBill) : undefined)}
                    onPreview={() => (profile.utilityBill ? openPreview(profile.utilityBill) : undefined)}
                    onSelect={(file) => handleFileSelect("utilityBill", file)}
                  />
                </div>

                <div>
                  <FieldLabel>Bank Statement Upload</FieldLabel>
                  <UploadArea
                    accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx"
                    file={profile.bankStatement}
                    onCancel={() => clearStoredFile("bankStatement")}
                    onDownload={() => (profile.bankStatement ? downloadFile(profile.bankStatement) : undefined)}
                    onPreview={() => (profile.bankStatement ? openPreview(profile.bankStatement) : undefined)}
                    onSelect={(file) => handleFileSelect("bankStatement", file)}
                  />
                </div>
              </div>

              <NavButtons showBack isLastStep={false} isSubmitting={isSubmitting} onBack={goBack} onContinue={continueFlow} />
            </KycCard>
          ) : null}

          {step === 3 ? (
            <KycCard
              title="Step 3: Face Verification"
              subtitle="We use face verification to keep your account secure"
            >
              <div>
                <FieldLabel>Upload Photo for verification</FieldLabel>
                <AvatarUpload previewUrl={facePhotoPreviewUrl} onSelect={(file) => handleFileSelect("facePhoto", file)} />
              </div>

              <div className="mt-4">
                <FieldLabel>Upload Video for verification</FieldLabel>
                <UploadArea
                  accept="video/*"
                  file={profile.faceVideo}
                  onCancel={() => clearStoredFile("faceVideo")}
                  onDownload={() => (profile.faceVideo ? downloadFile(profile.faceVideo) : undefined)}
                  onPreview={() => (profile.faceVideo ? openPreview(profile.faceVideo) : undefined)}
                  onSelect={(file) => handleFileSelect("faceVideo", file)}
                />
              </div>

              <NavButtons showBack isLastStep={false} isSubmitting={isSubmitting} onBack={goBack} onContinue={continueFlow} />
            </KycCard>
          ) : null}

          {step === 4 ? (
            <KycCard
              title="Step 4: Source of Funds"
              subtitle="Please provide details exactly as they appear on your legal documents."
            >
              <div className="space-y-4">
                <div>
                  <FieldLabel>Upload Salary Slip</FieldLabel>
                  <UploadArea
                    accept=".pdf,.jpg,.jpeg,.png"
                    file={profile.salarySlip}
                    onCancel={() => clearStoredFile("salarySlip")}
                    onDownload={() => (profile.salarySlip ? downloadFile(profile.salarySlip) : undefined)}
                    onPreview={() => (profile.salarySlip ? openPreview(profile.salarySlip) : undefined)}
                    onSelect={(file) => handleFileSelect("salarySlip", file)}
                  />
                </div>

                <div>
                  <FieldLabel>Upload Business Document</FieldLabel>
                  <UploadArea
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    file={profile.businessDocument}
                    onCancel={() => clearStoredFile("businessDocument")}
                    onDownload={() => (profile.businessDocument ? downloadFile(profile.businessDocument) : undefined)}
                    onPreview={() => (profile.businessDocument ? openPreview(profile.businessDocument) : undefined)}
                    onSelect={(file) => handleFileSelect("businessDocument", file)}
                  />
                </div>

                <div>
                  <FieldLabel>Upload Tax Returns</FieldLabel>
                  <UploadArea
                    accept=".pdf,.jpg,.jpeg,.png,.csv"
                    file={profile.taxReturns}
                    onCancel={() => clearStoredFile("taxReturns")}
                    onDownload={() => (profile.taxReturns ? downloadFile(profile.taxReturns) : undefined)}
                    onPreview={() => (profile.taxReturns ? openPreview(profile.taxReturns) : undefined)}
                    onSelect={(file) => handleFileSelect("taxReturns", file)}
                  />
                </div>
              </div>

              <NavButtons showBack isLastStep isSubmitting={isSubmitting} onBack={goBack} onContinue={continueFlow} />
            </KycCard>
          ) : null}

          {error ? <p className="mt-4 text-sm text-[#B42318]">{error}</p> : null}
        </div>
      </div>

      {loaded && previewState ? (
        <PreviewDialog file={previewState.file} objectUrl={previewState.objectUrl} onClose={closePreview} />
      ) : null}
    </main>
  );
}
