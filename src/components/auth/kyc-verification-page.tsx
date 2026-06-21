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

const maxBeneficialOwners = 5;

const steps = [
  "Select Role",
  "Applicant Info",
  "Beneficial Owners",
  "PEP & Sanctions",
  "Financial Info",
  "Investor Profile",
  "Extra Documents",
  "Declarations",
];

const countries = ["Select a country", "Bangladesh", "United Kingdom", "United States", "United Arab Emirates", "Singapore", "Kenya"];
const idTypes = ["Passport", "National ID", "Driving License"];
const sourceOfWealthOptions = ["Employment Income", "Pension", "Savings", "Sale of Assets", "Inheritance", "Other"];
const sourceOfFundsOptions = [
  "Employment Income",
  "Savings",
  "Investment Capital",
  "Operating Revenue",
  "Grants",
  "Sale of Assets",
  "Inheritance",
  "Other",
];

type StoredVerificationFile = {
  id: string;
  name: string;
  size: number;
  type: string;
};

type ApplicantType = "individual" | "company";
type ApplicantRole = "investor" | "investee";

type BeneficialOwnerDraft = {
  id: string;
  fullLegalName: string;
  ownershipPercentage: string;
  nationality: string;
  sourceOfWealth: string;
  sourceOfFunds: string;
  idDocument: StoredVerificationFile | null;
};

type ProfileDraft = {
  applicantRole: ApplicantRole;
  applicantType: ApplicantType;
  articlesOfAssociation: StoredVerificationFile | null;
  associatedWithPep: boolean;
  associatedWithPepDetails: string;
  authorizeAdditionalDocuments: boolean;
  bankAccountName: string;
  bankIban: string;
  bankName: string;
  bankSwiftCode: string;
  beneficialOwners: BeneficialOwnerDraft[];
  certificateOfIncorporation: StoredVerificationFile | null;
  companyName: string;
  confirmAccuracy: boolean;
  confirmLawfulFunds: boolean;
  consentOngoingMonitoring: boolean;
  contactInternalKyc: boolean;
  corporateStructureChart: StoredVerificationFile | null;
  country: string;
  countryOfIncorporation: string;
  dateOfBirth: string;
  directorsShareholdersRegister: StoredVerificationFile | null;
  doAmlPolicy: boolean;
  email: string;
  expectedAnnualInvestment: string;
  facePhoto: StoredVerificationFile | null;
  fullName: string;
  governanceAgreement: boolean;
  identificationType: string;
  identityAcknowledgement: boolean;
  identityDocument: StoredVerificationFile | null;
  isPep: boolean;
  investorClassification: string;
  investorComplianceDetails: string;
  investmentHorizon: string;
  nationality: string;
  ongoingLegalDispute: boolean;
  operatingAddress: string;
  otherSupportingDocuments: StoredVerificationFile | null;
  pepDetails: string;
  phoneNumber: string;
  preferredSectors: string;
  proofOfAddress: StoredVerificationFile | null;
  proofOfFunds: StoredVerificationFile | null;
  registeredAddress: string;
  registeredCompanyName: string;
  registrationNumber: string;
  relatedToPep: boolean;
  residentialAddress: string;
  riskTolerance: string;
  sanctionDetails: string;
  sourceOfFunds: string[];
  sourceOfFundsExplanation: string;
  sourceOfWealth: string[];
  sourceOfWealthEvidence: StoredVerificationFile | null;
  sourceOfWealthExplanation: string;
  subjectToSanction: boolean;
  taxComplianceCertificate: StoredVerificationFile | null;
  tradingName: string;
  website: string;
};

type FileFieldKey = {
  [K in keyof ProfileDraft]: ProfileDraft[K] extends StoredVerificationFile | null ? K : never;
}[keyof ProfileDraft];

type OwnerFileKey = `beneficialOwners.${number}.idDocument`;

const createOwner = (): BeneficialOwnerDraft => ({
  id: createFileId(),
  fullLegalName: "",
  ownershipPercentage: "",
  nationality: "",
  sourceOfWealth: "",
  sourceOfFunds: "",
  idDocument: null,
});

const defaultProfileDraft: ProfileDraft = {
  applicantRole: "investor",
  applicantType: "individual",
  articlesOfAssociation: null,
  associatedWithPep: false,
  associatedWithPepDetails: "",
  authorizeAdditionalDocuments: false,
  bankAccountName: "",
  bankIban: "",
  bankName: "",
  bankSwiftCode: "",
  beneficialOwners: [],
  certificateOfIncorporation: null,
  companyName: "",
  confirmAccuracy: false,
  confirmLawfulFunds: false,
  consentOngoingMonitoring: false,
  contactInternalKyc: false,
  corporateStructureChart: null,
  country: "",
  countryOfIncorporation: "",
  dateOfBirth: "",
  directorsShareholdersRegister: null,
  doAmlPolicy: false,
  email: "",
  expectedAnnualInvestment: "",
  facePhoto: null,
  fullName: "",
  governanceAgreement: false,
  identificationType: "Passport",
  identityAcknowledgement: false,
  identityDocument: null,
  isPep: false,
  investorClassification: "Retail Investor",
  investorComplianceDetails: "",
  investmentHorizon: "Medium",
  nationality: "",
  ongoingLegalDispute: false,
  operatingAddress: "",
  otherSupportingDocuments: null,
  pepDetails: "",
  phoneNumber: "",
  preferredSectors: "",
  proofOfAddress: null,
  proofOfFunds: null,
  registeredAddress: "",
  registeredCompanyName: "",
  registrationNumber: "",
  relatedToPep: false,
  residentialAddress: "",
  riskTolerance: "Medium",
  sanctionDetails: "",
  sourceOfFunds: [],
  sourceOfFundsExplanation: "",
  sourceOfWealth: [],
  sourceOfWealthEvidence: null,
  sourceOfWealthExplanation: "",
  subjectToSanction: false,
  taxComplianceCertificate: null,
  tradingName: "",
  website: "",
};

function createInitialDraft(role: ApplicantRole): ProfileDraft {
  return {
    ...defaultProfileDraft,
    applicantRole: role,
  };
}

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

function hydrateOwner(raw: unknown): BeneficialOwnerDraft | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const source = raw as Record<string, unknown>;

  return {
    id: typeof source.id === "string" ? source.id : createFileId(),
    fullLegalName: typeof source.fullLegalName === "string" ? source.fullLegalName : "",
    ownershipPercentage: typeof source.ownershipPercentage === "string" ? source.ownershipPercentage : "",
    nationality: typeof source.nationality === "string" ? source.nationality : "",
    sourceOfWealth: typeof source.sourceOfWealth === "string" ? source.sourceOfWealth : "",
    sourceOfFunds: typeof source.sourceOfFunds === "string" ? source.sourceOfFunds : "",
    idDocument: isStoredVerificationFile(source.idDocument) ? source.idDocument : null,
  };
}

function readString(source: Record<string, unknown>, key: keyof ProfileDraft, fallback = "") {
  return typeof source[key] === "string" ? source[key] : fallback;
}

function readBoolean(source: Record<string, unknown>, key: keyof ProfileDraft) {
  return typeof source[key] === "boolean" ? source[key] : false;
}

function readStringArray(source: Record<string, unknown>, key: keyof ProfileDraft) {
  return Array.isArray(source[key]) ? source[key].filter((item): item is string => typeof item === "string") : [];
}

function hydrateProfileDraft(raw: unknown, fallbackRole: ApplicantRole): ProfileDraft {
  if (!raw || typeof raw !== "object") {
    return createInitialDraft(fallbackRole);
  }

  const source = raw as Record<string, unknown>;
  const fallback = createInitialDraft(fallbackRole);
  const hydratedOwners = Array.isArray(source.beneficialOwners)
    ? source.beneficialOwners.map(hydrateOwner).filter((owner): owner is BeneficialOwnerDraft => Boolean(owner))
    : [];

  return {
    ...fallback,
    applicantRole: source.applicantRole === "investee" ? "investee" : source.applicantRole === "investor" ? "investor" : fallbackRole,
    applicantType: source.applicantType === "company" ? "company" : "individual",
    articlesOfAssociation: isStoredVerificationFile(source.articlesOfAssociation) ? source.articlesOfAssociation : null,
    associatedWithPep: readBoolean(source, "associatedWithPep"),
    associatedWithPepDetails: readString(source, "associatedWithPepDetails"),
    authorizeAdditionalDocuments: readBoolean(source, "authorizeAdditionalDocuments"),
    bankAccountName: readString(source, "bankAccountName"),
    bankIban: readString(source, "bankIban"),
    bankName: readString(source, "bankName"),
    bankSwiftCode: readString(source, "bankSwiftCode"),
    beneficialOwners: hydratedOwners.slice(0, maxBeneficialOwners),
    certificateOfIncorporation: isStoredVerificationFile(source.certificateOfIncorporation) ? source.certificateOfIncorporation : null,
    companyName: readString(source, "companyName"),
    confirmAccuracy: readBoolean(source, "confirmAccuracy"),
    confirmLawfulFunds: readBoolean(source, "confirmLawfulFunds"),
    consentOngoingMonitoring: readBoolean(source, "consentOngoingMonitoring"),
    contactInternalKyc: readBoolean(source, "contactInternalKyc"),
    corporateStructureChart: isStoredVerificationFile(source.corporateStructureChart) ? source.corporateStructureChart : null,
    country: readString(source, "country"),
    countryOfIncorporation: readString(source, "countryOfIncorporation"),
    dateOfBirth: readString(source, "dateOfBirth"),
    directorsShareholdersRegister: isStoredVerificationFile(source.directorsShareholdersRegister)
      ? source.directorsShareholdersRegister
      : null,
    doAmlPolicy: readBoolean(source, "doAmlPolicy"),
    email: readString(source, "email"),
    expectedAnnualInvestment: readString(source, "expectedAnnualInvestment"),
    facePhoto: isStoredVerificationFile(source.facePhoto) ? source.facePhoto : null,
    fullName: readString(source, "fullName"),
    governanceAgreement: readBoolean(source, "governanceAgreement"),
    identificationType: readString(source, "identificationType", fallback.identificationType),
    identityAcknowledgement: readBoolean(source, "identityAcknowledgement"),
    identityDocument: isStoredVerificationFile(source.identityDocument) ? source.identityDocument : null,
    isPep: readBoolean(source, "isPep"),
    investorClassification: readString(source, "investorClassification", fallback.investorClassification),
    investorComplianceDetails: readString(source, "investorComplianceDetails"),
    investmentHorizon: readString(source, "investmentHorizon", fallback.investmentHorizon),
    nationality: readString(source, "nationality"),
    ongoingLegalDispute: readBoolean(source, "ongoingLegalDispute"),
    operatingAddress: readString(source, "operatingAddress"),
    otherSupportingDocuments: isStoredVerificationFile(source.otherSupportingDocuments) ? source.otherSupportingDocuments : null,
    pepDetails: readString(source, "pepDetails"),
    phoneNumber: readString(source, "phoneNumber"),
    preferredSectors: readString(source, "preferredSectors"),
    proofOfAddress: isStoredVerificationFile(source.proofOfAddress) ? source.proofOfAddress : null,
    proofOfFunds: isStoredVerificationFile(source.proofOfFunds) ? source.proofOfFunds : null,
    registeredAddress: readString(source, "registeredAddress"),
    registeredCompanyName: readString(source, "registeredCompanyName"),
    registrationNumber: readString(source, "registrationNumber"),
    relatedToPep: readBoolean(source, "relatedToPep"),
    residentialAddress: readString(source, "residentialAddress"),
    riskTolerance: readString(source, "riskTolerance", fallback.riskTolerance),
    sanctionDetails: readString(source, "sanctionDetails"),
    sourceOfFunds: readStringArray(source, "sourceOfFunds"),
    sourceOfFundsExplanation: readString(source, "sourceOfFundsExplanation"),
    sourceOfWealth: readStringArray(source, "sourceOfWealth"),
    sourceOfWealthEvidence: isStoredVerificationFile(source.sourceOfWealthEvidence) ? source.sourceOfWealthEvidence : null,
    sourceOfWealthExplanation: readString(source, "sourceOfWealthExplanation"),
    subjectToSanction: readBoolean(source, "subjectToSanction"),
    taxComplianceCertificate: isStoredVerificationFile(source.taxComplianceCertificate) ? source.taxComplianceCertificate : null,
    tradingName: readString(source, "tradingName"),
    website: readString(source, "website"),
  };
}

function loadProfileDraft(fallbackRole: ApplicantRole): ProfileDraft {
  if (typeof window === "undefined") {
    return createInitialDraft(fallbackRole);
  }

  const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);

  if (!stored) {
    return createInitialDraft(fallbackRole);
  }

  try {
    return hydrateProfileDraft(JSON.parse(stored), fallbackRole);
  } catch {
    return createInitialDraft(fallbackRole);
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

  if (!Number.isInteger(step) || step < 1 || step > steps.length) {
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
  return <label className="mb-2 block text-[11px] font-medium text-[#101828]">{children}</label>;
}

function TextInput({
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  onChange: (value: string) => void;
  placeholder: string;
  type?: "date" | "email" | "number" | "tel" | "text" | "url";
  value: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-[6px] border border-[#D7DEE8] bg-white px-3 text-[12px] text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10"
    />
  );
}

function TextArea({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-[76px] w-full resize-none rounded-[6px] border border-[#D7DEE8] bg-white px-3 py-2 text-[12px] text-[#101828] outline-none transition placeholder:text-[#98A2B3] focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10"
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
        className="h-9 w-full appearance-none rounded-[6px] border border-[#D7DEE8] bg-white px-3 pr-9 text-[12px] text-[#101828] outline-none transition focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#667085]">
        <DashboardIcon name="chevronDown" className="h-3.5 w-3.5" />
      </span>
    </div>
  );
}

function UploadGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M12 14V7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m8.75 10.75 3.25-3.25 3.25 3.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.75 16.25h8.5" strokeLinecap="round" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M8 4.75h5.5L18.25 9.5V18a2 2 0 0 1-2 2H8A2 2 0 0 1 6 18V6.75a2 2 0 0 1 2-2Z" />
      <path d="M13.5 4.75V9.5h4.75" />
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

function IconButton({ children, label, onClick }: { children: ReactNode; label: string; onClick: () => void | Promise<void> }) {
  return (
    <button
      type="button"
      onClick={() => {
        void onClick();
      }}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#667085] transition hover:bg-white hover:text-[#101828]"
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
    <div className="inline-flex w-full max-w-[320px] items-center gap-3 rounded-[8px] bg-[#F2F4F7] px-3 py-2 text-[#667085]">
      <span className="inline-flex h-5 w-5 items-center justify-center text-[#98A2B3]">
        <DocumentIcon />
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-[11px] font-semibold text-[#344054]">{file.name}</p>
        <p className="truncate text-[10px] text-[#98A2B3]">File type - {formatBytes(file.size)}</p>
      </div>
      <div className="flex items-center gap-1">
        <IconButton label="Download file" onClick={onDownload}>
          <DownloadIcon />
        </IconButton>
        <IconButton label="Preview file" onClick={onPreview}>
          <EyeIcon />
        </IconButton>
        <IconButton label="Remove file" onClick={onCancel}>
          <CloseIcon />
        </IconButton>
      </div>
    </div>
  );
}

function UploadArea({
  accept,
  file,
  label,
  onCancel,
  onDownload,
  onPreview,
  onSelect,
  wide = false,
}: {
  accept: string;
  file: StoredVerificationFile | null;
  label: string;
  onCancel: () => void | Promise<void>;
  onDownload: () => void | Promise<void>;
  onPreview: () => void | Promise<void>;
  onSelect: (file: File) => void | Promise<void>;
  wide?: boolean;
}) {
  const inputId = useId();

  return (
    <div className={`rounded-[8px] border border-dashed border-[#D0D5DD] bg-[#FCFCFD] px-4 ${wide ? "py-9" : "py-6"}`}>
      {file ? (
        <div className="flex justify-center">
          <FileChip file={file} onCancel={onCancel} onDownload={onDownload} onPreview={onPreview} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EAECF0] text-[#344054]">
            <UploadGlyph />
          </span>
          <p className="mt-3 text-[11px] font-medium leading-4 text-[#344054]">{label}</p>
          <label htmlFor={inputId} className="mt-1 cursor-pointer text-[10px] leading-4 text-[#667085]">
            or <span className="font-semibold text-[#F97316]">browse files</span>
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
      <div className="flex h-[112px] w-[112px] items-center justify-center overflow-hidden rounded-full bg-[#F2F4F7]">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Verification portrait" className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 64 64" className="h-[76px] w-[76px] text-[#101828]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/50 p-4" onClick={onClose}>
      <div className="w-full max-w-4xl overflow-hidden rounded-[12px] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 border-b border-[#E4E7EC] px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#243B5A]">{file.name}</p>
            <p className="mt-1 text-xs text-[#98A2B3]">{formatBytes(file.size)}</p>
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
            <img src={objectUrl} alt={file.name} className="mx-auto max-h-[68vh] rounded-[10px] object-contain" />
          ) : null}
          {isVideo ? <video src={objectUrl} controls className="mx-auto max-h-[68vh] w-full rounded-[10px]" /> : null}
          {isPdf ? <iframe title={file.name} src={objectUrl} className="h-[68vh] w-full rounded-[10px] bg-white" /> : null}
          {!isImage && !isVideo && !isPdf ? (
            <div className="rounded-[10px] bg-white p-6 text-sm text-[#667085]">
              Preview is not available for this file type. Please download it to review.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="border-y border-[#E4E7EC] bg-[#FBFCFD] px-5 py-5 sm:px-8">
      <div className="relative mx-auto max-w-[900px] overflow-x-auto pb-1">
        <div className="relative flex min-w-[760px] items-start justify-between">
          <div className="absolute left-[20px] right-[20px] top-[12px] h-[2px] bg-[#E5E7F0]" />
          <div
            className="absolute left-[20px] top-[12px] h-[2px] bg-[#F97316] transition-all"
            style={{ width: `calc((100% - 40px) * ${(step - 1) / (steps.length - 1)})` }}
          />
          {steps.map((label, index) => {
            const current = index + 1;
            const active = current <= step;

            return (
              <div key={label} className="relative z-10 flex w-[86px] flex-col items-center text-center">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                    active ? "bg-[#F97316] text-white" : "bg-[#ECECF4] text-[#667085]"
                  }`}
                >
                  {current === 1 && active ? (
                    <span className="h-2.5 w-2.5 rounded-full border-2 border-white" />
                  ) : (
                    current
                  )}
                </span>
                <span className="mt-2 text-[9px] font-medium leading-3 text-[#101828]">{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-[15px] font-semibold text-[#243B5A]">{children}</h3>;
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="rounded-[8px] bg-[#FAFAFB] p-4">{children}</div>;
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-[12px] leading-5 text-[#101828]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-3.5 w-3.5 rounded border-[#D0D5DD] accent-[#93C5FD]"
      />
      <span>{label}</span>
    </label>
  );
}

function CheckboxGrid({
  selected,
  options,
  onChange,
}: {
  selected: string[];
  options: string[];
  onChange: (nextSelected: string[]) => void;
}) {
  return (
    <div className="grid gap-x-8 gap-y-2 sm:grid-cols-3">
      {options.map((option) => (
        <CheckboxRow
          key={option}
          checked={selected.includes(option)}
          label={option}
          onChange={(checked) => {
            onChange(checked ? [...selected, option] : selected.filter((item) => item !== option));
          }}
        />
      ))}
    </div>
  );
}

function RadioChoice({
  checked,
  label,
  name,
  onChange,
}: {
  checked: boolean;
  label: string;
  name: string;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-medium text-[#101828]">
      <input type="radio" name={name} checked={checked} onChange={onChange} className="h-3.5 w-3.5 accent-[#F97316]" />
      <span>{label}</span>
    </label>
  );
}

function KycShell({
  children,
  subtitle,
  title,
}: {
  children: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-[8px] bg-white shadow-[0_8px_28px_rgba(16,24,40,0.14)]">
      <header className="px-6 py-5 text-center sm:px-8">
        <h1 className="text-[24px] font-semibold text-[#243B5A]">{title}</h1>
        <p className="mt-1 text-[12px] text-[#667085]">{subtitle}</p>
      </header>
      {children}
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
    <div className="flex items-center justify-between gap-3 border-t border-[#E4E7EC] bg-[#FBFCFD] px-6 py-4 sm:px-8">
      {showBack ? (
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="inline-flex h-9 min-w-[74px] items-center justify-center rounded-[6px] border border-[#D7DEE8] bg-white px-4 text-[12px] font-medium text-[#344054] transition hover:bg-[#F8FAFC] disabled:cursor-wait disabled:opacity-70"
        >
          Back
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        disabled={isSubmitting}
        onClick={onContinue}
        className="inline-flex h-9 min-w-[92px] items-center justify-center rounded-[6px] bg-[#F97316] px-5 text-[12px] font-semibold text-white transition hover:bg-[#EA6A0A] disabled:cursor-wait disabled:opacity-80"
      >
        {isSubmitting ? (isLastStep ? "Submitting..." : "Saving...") : "Continue"}
      </button>
    </div>
  );
}

const kycFileFields: Array<{ apiKey: string; profileKey: FileFieldKey }> = [
  { apiKey: "facePhoto", profileKey: "facePhoto" },
  { apiKey: "identityDocument", profileKey: "identityDocument" },
  { apiKey: "proofOfAddress", profileKey: "proofOfAddress" },
  { apiKey: "certificateOfIncorporation", profileKey: "certificateOfIncorporation" },
  { apiKey: "articlesOfAssociation", profileKey: "articlesOfAssociation" },
  { apiKey: "directorsShareholdersRegister", profileKey: "directorsShareholdersRegister" },
  { apiKey: "sourceOfWealthEvidence", profileKey: "sourceOfWealthEvidence" },
  { apiKey: "proofOfFunds", profileKey: "proofOfFunds" },
  { apiKey: "corporateStructureChart", profileKey: "corporateStructureChart" },
  { apiKey: "taxComplianceCertificate", profileKey: "taxComplianceCertificate" },
  { apiKey: "otherSupportingDocuments", profileKey: "otherSupportingDocuments" },
];

function appendText(formData: FormData, key: string, value: string | boolean | number) {
  formData.append(key, String(value));
}

async function appendStoredFile(formData: FormData, apiKey: string, file: StoredVerificationFile | null) {
  if (!file) {
    return;
  }

  const blob = await getFileBlob(file.id);

  if (blob) {
    formData.append(apiKey, blob, file.name);
  }
}

function omitOwnerDocument(owner: BeneficialOwnerDraft) {
  return {
    fullLegalName: owner.fullLegalName,
    ownershipPercentage: owner.ownershipPercentage,
    nationality: owner.nationality,
    sourceOfWealth: owner.sourceOfWealth,
    sourceOfFunds: owner.sourceOfFunds,
  };
}

async function buildKycFormData(profile: ProfileDraft, currentStep: number) {
  const formData = new FormData();

  appendText(formData, "currentStep", currentStep);
  appendText(formData, "applicantRole", profile.applicantRole);
  appendText(formData, "applicantInfo.applicantType", profile.applicantType);
  appendText(formData, "applicantInfo.email", profile.email.trim());
  appendText(formData, "applicantInfo.phoneNumber", profile.phoneNumber.trim());
  appendText(formData, "applicantInfo.country", profile.country.trim());
  appendText(formData, "applicantInfo.residentialAddress", profile.residentialAddress.trim());
  appendText(formData, "applicantInfo.identificationType", profile.identificationType.trim());
  appendText(formData, "personalIdentity.fullLegalName", (profile.fullName || profile.companyName).trim());
  appendText(formData, "personalIdentity.dateOfBirth", profile.dateOfBirth.trim());
  appendText(formData, "personalIdentity.countryOfResidence", profile.country.trim());
  appendText(formData, "personalIdentity.identificationType", profile.identificationType.trim().toLowerCase());
  appendText(formData, "personalIdentity.nationality", profile.nationality.trim());
  appendText(formData, "personalIdentity.sourceOfWealth", JSON.stringify(profile.sourceOfWealth));
  appendText(formData, "personalIdentity.sourceOfWealthExplanation", profile.sourceOfWealthExplanation.trim());
  appendText(formData, "companyInformation.companyName", profile.companyName.trim());
  appendText(formData, "companyInformation.registeredCompanyName", profile.registeredCompanyName.trim());
  appendText(formData, "companyInformation.tradingName", profile.tradingName.trim());
  appendText(formData, "companyInformation.registrationNumber", profile.registrationNumber.trim());
  appendText(formData, "companyInformation.countryOfIncorporation", profile.countryOfIncorporation.trim());
  appendText(formData, "companyInformation.website", profile.website.trim());
  appendText(formData, "companyInformation.registeredAddress", profile.registeredAddress.trim());
  appendText(formData, "companyInformation.operatingAddress", profile.operatingAddress.trim());
  appendText(formData, "beneficialOwners", JSON.stringify(profile.beneficialOwners.map(omitOwnerDocument)));
  appendText(formData, "pepSanctions.isPep", profile.isPep);
  appendText(formData, "pepSanctions.relatedToPep", profile.relatedToPep);
  appendText(formData, "pepSanctions.associatedWithPep", profile.associatedWithPep);
  appendText(formData, "pepSanctions.pepDetails", profile.pepDetails.trim());
  appendText(formData, "pepSanctions.associatedWithPepDetails", profile.associatedWithPepDetails.trim());
  appendText(formData, "pepSanctions.subjectToSanction", profile.subjectToSanction);
  appendText(formData, "pepSanctions.sanctionDetails", profile.sanctionDetails.trim());
  appendText(formData, "financialInformation.sourceOfFunds", JSON.stringify(profile.sourceOfFunds));
  appendText(formData, "financialInformation.explanation", profile.sourceOfFundsExplanation.trim());
  appendText(formData, "investorProfile.investorClassification", profile.investorClassification.trim());
  appendText(formData, "investorProfile.expectedAnnualInvestment", profile.expectedAnnualInvestment.trim());
  appendText(formData, "investorProfile.preferredSectors", profile.preferredSectors.trim());
  appendText(formData, "investorProfile.riskTolerance", profile.riskTolerance.trim());
  appendText(formData, "investorProfile.investmentHorizon", profile.investmentHorizon.trim());
  appendText(formData, "investorProfile.compliance.doAmlPolicy", profile.doAmlPolicy);
  appendText(formData, "investorProfile.compliance.contactInternalKyc", profile.contactInternalKyc);
  appendText(formData, "investorProfile.compliance.ongoingLegalDispute", profile.ongoingLegalDispute);
  appendText(formData, "investorProfile.compliance.additionalDetails", profile.investorComplianceDetails.trim());
  appendText(formData, "investorProfile.bankDetails.bankName", profile.bankName.trim());
  appendText(formData, "investorProfile.bankDetails.accountName", profile.bankAccountName.trim());
  appendText(formData, "investorProfile.bankDetails.iban", profile.bankIban.trim());
  appendText(formData, "investorProfile.bankDetails.swiftCode", profile.bankSwiftCode.trim());
  appendText(formData, "investorProfile.confirmLawfulFunds", profile.confirmLawfulFunds);
  appendText(formData, "declarations.identityAcknowledgement", profile.identityAcknowledgement);
  appendText(formData, "declarations.confirmAccuracy", profile.confirmAccuracy);
  appendText(formData, "declarations.consentOngoingMonitoring", profile.consentOngoingMonitoring);
  appendText(formData, "declarations.authorizeAdditionalDocuments", profile.authorizeAdditionalDocuments);
  appendText(formData, "declarations.governanceAgreement", profile.governanceAgreement);

  for (const field of kycFileFields) {
    await appendStoredFile(formData, field.apiKey, profile[field.profileKey]);
  }

  await Promise.all(
    profile.beneficialOwners.map((owner, index) =>
      appendStoredFile(formData, `beneficialOwnerIdDocument${index}`, owner.idDocument)
    )
  );

  return formData;
}

export function KycVerificationPage({
  initialKycId,
  role,
}: {
  initialKycId?: string;
  role: ApplicantRole;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileDraft>(() => createInitialDraft(role));
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
      const nextProfile = isEditMode ? loadProfileDraft(role) : createInitialDraft(role);
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
  }, [initialKycId, role]);

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

  const updateOwner = (index: number, patch: Partial<BeneficialOwnerDraft>) => {
    setProfile((current) => ({
      ...current,
      beneficialOwners: current.beneficialOwners.map((owner, ownerIndex) =>
        ownerIndex === index ? { ...owner, ...patch } : owner
      ),
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

  const clearStoredFile = async (key: FileFieldKey | OwnerFileKey) => {
    if (key.startsWith("beneficialOwners.")) {
      const index = Number(key.split(".")[1]);
      const existing = profile.beneficialOwners[index]?.idDocument;

      if (!existing) {
        return;
      }

      await deleteFileBlob(existing.id);

      if (previewState?.file.id === existing.id) {
        closePreview();
      }

      updateOwner(index, { idDocument: null });
      return;
    }

    const profileKey = key as FileFieldKey;
    const existing = profile[profileKey];

    if (!existing) {
      return;
    }

    await deleteFileBlob(existing.id);

    if (previewState?.file.id === existing.id) {
      closePreview();
    }

    updateField(profileKey, null as ProfileDraft[typeof profileKey]);
  };

  const handleFileSelect = async (key: FileFieldKey | OwnerFileKey, file: File) => {
    if (key.startsWith("beneficialOwners.")) {
      const index = Number(key.split(".")[1]);
      const previous = profile.beneficialOwners[index]?.idDocument;

      if (previous) {
        await deleteFileBlob(previous.id);
      }

      const id = createFileId();
      await saveFileBlob(id, file);
      updateOwner(index, {
        idDocument: {
          id,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
        },
      });
      return;
    }

    const profileKey = key as FileFieldKey;
    const previous = profile[profileKey];

    if (previous) {
      await deleteFileBlob(previous.id);
    }

    const id = createFileId();
    await saveFileBlob(id, file);

    updateField(profileKey, {
      id,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
    } as ProfileDraft[typeof profileKey]);
  };

  const fileProps = (key: FileFieldKey, label: string, accept = ".pdf,.jpg,.jpeg,.png") => ({
    accept,
    file: profile[key],
    label,
    onCancel: () => clearStoredFile(key),
    onDownload: () => (profile[key] ? downloadFile(profile[key]) : undefined),
    onPreview: () => (profile[key] ? openPreview(profile[key]) : undefined),
    onSelect: (file: File) => handleFileSelect(key, file),
  });

  const ownerFileProps = (index: number) => ({
    accept: ".pdf,.jpg,.jpeg,.png",
    file: profile.beneficialOwners[index]?.idDocument ?? null,
    label: "ID Upload",
    onCancel: () => clearStoredFile(`beneficialOwners.${index}.idDocument`),
    onDownload: () => {
      const file = profile.beneficialOwners[index]?.idDocument;
      return file ? downloadFile(file) : undefined;
    },
    onPreview: () => {
      const file = profile.beneficialOwners[index]?.idDocument;
      return file ? openPreview(file) : undefined;
    },
    onSelect: (file: File) => handleFileSelect(`beneficialOwners.${index}.idDocument`, file),
  });

  const validateStep = () => {
    if (step === 1 && !profile.applicantRole) {
      setError("Please select your role.");
      return false;
    }

    if (step === 2) {
      const commonMissing =
        !profile.email.trim() ||
        !profile.phoneNumber.trim() ||
        !profile.country.trim() ||
        !profile.residentialAddress.trim() ||
        !profile.facePhoto ||
        !profile.identityDocument ||
        !profile.proofOfAddress;

      if (commonMissing) {
        setError("Please complete the common applicant information and upload the required documents.");
        return false;
      }

      if (!/^\S+@\S+\.\S+$/.test(profile.email.trim())) {
        setError("Please enter a valid email address.");
        return false;
      }

      if (profile.applicantType === "individual") {
        if (!profile.fullName.trim() || !profile.dateOfBirth.trim() || !profile.nationality.trim() || profile.sourceOfWealth.length === 0) {
          setError("Please complete all personal information fields.");
          return false;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.dateOfBirth)) {
          setError("Please choose your date of birth in YYYY-MM-DD format.");
          return false;
        }
      }

      if (profile.applicantType === "company") {
        if (
          !profile.companyName.trim() ||
          !profile.registeredCompanyName.trim() ||
          !profile.registrationNumber.trim() ||
          !profile.countryOfIncorporation.trim() ||
          !profile.registeredAddress.trim() ||
          !profile.operatingAddress.trim() ||
          !profile.certificateOfIncorporation ||
          !profile.articlesOfAssociation ||
          !profile.directorsShareholdersRegister
        ) {
          setError("Please complete the company information and upload all company documents.");
          return false;
        }
      }
    }

    if (step === 3) {
      const incompleteOwner = profile.beneficialOwners.some(
        (owner) =>
          !owner.fullLegalName.trim() ||
          !owner.ownershipPercentage.trim() ||
          !owner.nationality.trim() ||
          !owner.sourceOfWealth.trim() ||
          !owner.sourceOfFunds.trim() ||
          !owner.idDocument
      );

      if (incompleteOwner) {
        setError("Please complete every beneficial owner card or remove the incomplete owner.");
        return false;
      }
    }

    if (step === 4) {
      if ((profile.isPep || profile.relatedToPep || profile.associatedWithPep) && !profile.pepDetails.trim()) {
        setError("Please provide additional PEP details.");
        return false;
      }

      if (profile.subjectToSanction && !profile.sanctionDetails.trim()) {
        setError("Please provide sanction details.");
        return false;
      }
    }

    if (step === 5) {
      if (profile.sourceOfFunds.length === 0 || !profile.sourceOfFundsExplanation.trim()) {
        setError("Please select at least one source of funds and provide an explanation.");
        return false;
      }
    }

    if (step === 6) {
      if (
        !profile.investorClassification.trim() ||
        !profile.expectedAnnualInvestment.trim() ||
        !profile.preferredSectors.trim() ||
        !profile.bankName.trim() ||
        !profile.bankAccountName.trim() ||
        !profile.bankIban.trim() ||
        !profile.bankSwiftCode.trim() ||
        !profile.confirmLawfulFunds
      ) {
        setError("Please complete the investor profile, bank details, and lawful funds confirmation.");
        return false;
      }
    }

    if (step === 8) {
      if (
        !profile.identityAcknowledgement ||
        !profile.confirmAccuracy ||
        !profile.consentOngoingMonitoring ||
        !profile.authorizeAdditionalDocuments ||
        !profile.governanceAgreement
      ) {
        setError("Please confirm all declarations before submitting.");
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

      if (step === steps.length) {
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
  const isPepChecked = profile.isPep || profile.relatedToPep || profile.associatedWithPep;

  return (
    <main className="min-h-screen bg-[#F2F4F7] px-3 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[980px]">
        <KycShell title={pageTitle} subtitle="Complete your profile to unlock secure business opportunities.">
          <Stepper step={step} />

          <div className="px-6 py-7 sm:px-8">
            {step === 1 ? (
              <div className="space-y-5">
                <SectionTitle>Step 1: Select Role</SectionTitle>
                <p className="text-[12px] text-[#667085]">Confirm the role you selected during signup.</p>
                <Panel>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(["investor", "investee"] as const).map((nextRole) => (
                      <button
                        key={nextRole}
                        type="button"
                        onClick={() => updateField("applicantRole", nextRole)}
                        className={`rounded-[8px] border px-4 py-4 text-left transition ${
                          profile.applicantRole === nextRole
                            ? "border-[#F97316] bg-[#FFF7ED] text-[#101828]"
                            : "border-[#E4E7EC] bg-white text-[#344054] hover:border-[#F97316]/60"
                        }`}
                      >
                        <span className="text-[13px] font-semibold capitalize">{nextRole}</span>
                        <span className="mt-1 block text-[11px] text-[#667085]">
                          {nextRole === "investor" ? "Invest in vetted opportunities." : "Raise capital for your company."}
                        </span>
                      </button>
                    ))}
                  </div>
                </Panel>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-7">
                <div>
                  <SectionTitle>Step 2: Applicant Information</SectionTitle>
                  <p className="mt-1 text-[12px] text-[#667085]">Please provide your details exactly as they appear on your legal documents.</p>
                </div>

                <div>
                  <FieldLabel>Applicant Type</FieldLabel>
                  <div className="flex flex-wrap gap-5">
                    <RadioChoice
                      name="applicantType"
                      checked={profile.applicantType === "individual"}
                      label="Individual"
                      onChange={() => updateField("applicantType", "individual")}
                    />
                    <RadioChoice
                      name="applicantType"
                      checked={profile.applicantType === "company"}
                      label="Company / Organisation"
                      onChange={() => updateField("applicantType", "company")}
                    />
                  </div>
                </div>

                <div className="border-t border-[#E4E7EC] pt-5">
                  <SectionTitle>Common Information</SectionTitle>
                  <div className="mt-4">
                    <FieldLabel>Upload Photo for verification</FieldLabel>
                    <AvatarUpload previewUrl={facePhotoPreviewUrl} onSelect={(file) => handleFileSelect("facePhoto", file)} />
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel>{profile.applicantType === "company" ? "Company Name" : "Full Legal Name"}</FieldLabel>
                      <TextInput
                        placeholder="Enter name"
                        value={profile.applicantType === "company" ? profile.companyName : profile.fullName}
                        onChange={(value) =>
                          profile.applicantType === "company" ? updateField("companyName", value) : updateField("fullName", value)
                        }
                      />
                    </div>
                    <div>
                      <FieldLabel>Email Address</FieldLabel>
                      <TextInput type="email" placeholder="e.g. name@example.com" value={profile.email} onChange={(value) => updateField("email", value)} />
                    </div>
                    <div>
                      <FieldLabel>Phone Number</FieldLabel>
                      <TextInput type="tel" placeholder="e.g. +1 (555) 000-0000" value={profile.phoneNumber} onChange={(value) => updateField("phoneNumber", value)} />
                    </div>
                    <div>
                      <FieldLabel>Country</FieldLabel>
                      <SelectInput value={profile.country || countries[0]} options={countries} onChange={(value) => updateField("country", value === countries[0] ? "" : value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <FieldLabel>Residential / Registered Address</FieldLabel>
                      <TextArea placeholder="Full address" value={profile.residentialAddress} onChange={(value) => updateField("residentialAddress", value)} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E4E7EC] pt-5">
                  <SectionTitle>Identity Verification</SectionTitle>
                  <div className="mt-4">
                    <FieldLabel>ID Type</FieldLabel>
                    <SelectInput value={profile.identificationType} options={idTypes} onChange={(value) => updateField("identificationType", value)} />
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <UploadArea {...fileProps("identityDocument", "Upload Identity Document")} />
                    <UploadArea {...fileProps("proofOfAddress", "Upload Proof of Address")} />
                  </div>
                </div>

                {profile.applicantType === "individual" ? (
                  <div className="border-t border-[#E4E7EC] pt-5">
                    <SectionTitle>Personal Information</SectionTitle>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel>Date of Birth</FieldLabel>
                        <TextInput type="date" placeholder="mm/dd/yyyy" value={profile.dateOfBirth} onChange={(value) => updateField("dateOfBirth", value)} />
                      </div>
                      <div>
                        <FieldLabel>Nationality</FieldLabel>
                        <TextInput placeholder="e.g. American" value={profile.nationality} onChange={(value) => updateField("nationality", value)} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <FieldLabel>Source of Wealth</FieldLabel>
                      <CheckboxGrid
                        options={sourceOfWealthOptions}
                        selected={profile.sourceOfWealth}
                        onChange={(nextSelected) => updateField("sourceOfWealth", nextSelected)}
                      />
                    </div>
                    <div className="mt-4">
                      <FieldLabel>Source of Wealth Explanation</FieldLabel>
                      <TextArea
                        placeholder="Provide additional details..."
                        value={profile.sourceOfWealthExplanation}
                        onChange={(value) => updateField("sourceOfWealthExplanation", value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-[#E4E7EC] pt-5">
                    <SectionTitle>Company Information</SectionTitle>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel>Registered Company Name</FieldLabel>
                        <TextInput placeholder="Enter name" value={profile.registeredCompanyName} onChange={(value) => updateField("registeredCompanyName", value)} />
                      </div>
                      <div>
                        <FieldLabel>Trading Name (optional)</FieldLabel>
                        <TextInput placeholder="Enter name" value={profile.tradingName} onChange={(value) => updateField("tradingName", value)} />
                      </div>
                      <div>
                        <FieldLabel>Registration Number</FieldLabel>
                        <TextInput placeholder="Registration number" value={profile.registrationNumber} onChange={(value) => updateField("registrationNumber", value)} />
                      </div>
                      <div>
                        <FieldLabel>Country of Incorporation</FieldLabel>
                        <TextInput placeholder="Country" value={profile.countryOfIncorporation} onChange={(value) => updateField("countryOfIncorporation", value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <FieldLabel>Website</FieldLabel>
                        <TextInput type="url" placeholder="https://" value={profile.website} onChange={(value) => updateField("website", value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <FieldLabel>Registered Address</FieldLabel>
                        <TextArea placeholder="Full address" value={profile.registeredAddress} onChange={(value) => updateField("registeredAddress", value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <FieldLabel>Operating Address</FieldLabel>
                        <TextArea placeholder="Full address" value={profile.operatingAddress} onChange={(value) => updateField("operatingAddress", value)} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <FieldLabel>Company Documents</FieldLabel>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <UploadArea {...fileProps("certificateOfIncorporation", "Certificate of Incorporation")} />
                        <UploadArea {...fileProps("articlesOfAssociation", "Articles of Association")} />
                        <UploadArea {...fileProps("directorsShareholdersRegister", "Register of Directors / Shareholders")} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-5">
                <div>
                  <SectionTitle>Step 3: Beneficial Owners</SectionTitle>
                  <p className="mt-1 text-[12px] text-[#667085]">Add Ultimate Beneficial Owners (UBOs).</p>
                </div>

                {profile.beneficialOwners.map((owner, index) => (
                  <Panel key={owner.id}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-[12px] font-semibold text-[#101828]">Owner {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setProfile((current) => ({
                            ...current,
                            beneficialOwners: current.beneficialOwners.filter((_, ownerIndex) => ownerIndex !== index),
                          }));
                        }}
                        className="text-[11px] font-semibold text-[#D92D20]"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel>Full Legal Name</FieldLabel>
                        <TextInput placeholder="Enter name" value={owner.fullLegalName} onChange={(value) => updateOwner(index, { fullLegalName: value })} />
                      </div>
                      <div>
                        <FieldLabel>Ownership Percentage (%)</FieldLabel>
                        <TextInput placeholder="e.g. 0.0%" value={owner.ownershipPercentage} onChange={(value) => updateOwner(index, { ownershipPercentage: value })} />
                      </div>
                      <div>
                        <FieldLabel>Nationality</FieldLabel>
                        <TextInput placeholder="e.g. Bangladeshi" value={owner.nationality} onChange={(value) => updateOwner(index, { nationality: value })} />
                      </div>
                      <div>
                        <FieldLabel>Source of Wealth</FieldLabel>
                        <TextInput placeholder="e.g. from XYZ company" value={owner.sourceOfWealth} onChange={(value) => updateOwner(index, { sourceOfWealth: value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <FieldLabel>Source of Funds</FieldLabel>
                        <TextInput placeholder="e.g. from XYZ company" value={owner.sourceOfFunds} onChange={(value) => updateOwner(index, { sourceOfFunds: value })} />
                      </div>
                      <div className="sm:col-span-2">
                        <UploadArea {...ownerFileProps(index)} wide />
                      </div>
                    </div>
                  </Panel>
                ))}

                <button
                  type="button"
                  disabled={profile.beneficialOwners.length >= maxBeneficialOwners}
                  onClick={() => {
                    setProfile((current) => ({
                      ...current,
                      beneficialOwners: [...current.beneficialOwners, createOwner()],
                    }));
                  }}
                  className="inline-flex h-9 items-center rounded-[6px] border border-[#D7DEE8] bg-white px-3 text-[12px] font-medium text-[#344054] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  + Add Owner
                </button>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-7">
                <div>
                  <SectionTitle>Step 4: PEP & Sanctions</SectionTitle>
                  <p className="mt-1 text-[12px] text-[#667085]">Declare if you or any associated parties are politically exposed or subject to sanctions.</p>
                </div>
                <div>
                  <FieldLabel>Politically Exposed Person (PEP)</FieldLabel>
                  <Panel>
                    <div className="space-y-2">
                      <CheckboxRow checked={profile.isPep} label="Are you a PEP?" onChange={(checked) => updateField("isPep", checked)} />
                      <CheckboxRow checked={profile.relatedToPep} label="Are you related to a PEP?" onChange={(checked) => updateField("relatedToPep", checked)} />
                      <CheckboxRow checked={profile.associatedWithPep} label="Are you associated with a PEP?" onChange={(checked) => updateField("associatedWithPep", checked)} />
                    </div>
                    {isPepChecked ? (
                      <div className="mt-4 border-t border-[#E4E7EC] pt-4">
                        <FieldLabel>Additional Details</FieldLabel>
                        <TextArea placeholder="Please provide details about the PEP status..." value={profile.pepDetails} onChange={(value) => updateField("pepDetails", value)} />
                      </div>
                    ) : null}
                  </Panel>
                </div>
                <div>
                  <FieldLabel>Sanctions</FieldLabel>
                  <Panel>
                    <CheckboxRow
                      checked={profile.subjectToSanction}
                      label="Are you or any UBO subject to sanction?"
                      onChange={(checked) => updateField("subjectToSanction", checked)}
                    />
                    {profile.subjectToSanction ? (
                      <div className="mt-4 border-t border-[#E4E7EC] pt-4">
                        <FieldLabel>Additional Details</FieldLabel>
                        <TextArea placeholder="Please provide details about the sanction status..." value={profile.sanctionDetails} onChange={(value) => updateField("sanctionDetails", value)} />
                      </div>
                    ) : null}
                  </Panel>
                </div>
              </div>
            ) : null}

            {step === 5 ? (
              <div className="space-y-5">
                <div>
                  <SectionTitle>Step 5: Financial Information</SectionTitle>
                  <p className="mt-1 text-[12px] text-[#667085]">Please provide information about your source of funds.</p>
                </div>
                <Panel>
                  <FieldLabel>Source of Funds</FieldLabel>
                  <CheckboxGrid options={sourceOfFundsOptions} selected={profile.sourceOfFunds} onChange={(nextSelected) => updateField("sourceOfFunds", nextSelected)} />
                  <div className="mt-4 border-t border-[#E4E7EC] pt-4">
                    <FieldLabel>Explanation</FieldLabel>
                    <TextArea
                      placeholder="Provide a brief explanation of your source of funds..."
                      value={profile.sourceOfFundsExplanation}
                      onChange={(value) => updateField("sourceOfFundsExplanation", value)}
                    />
                  </div>
                </Panel>
              </div>
            ) : null}

            {step === 6 ? (
              <div className="space-y-6">
                <div>
                  <SectionTitle>Step 6: Investor Section</SectionTitle>
                  <p className="mt-1 text-[12px] text-[#667085]">Provide details about your investment profile and preferences.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Investor Classification</FieldLabel>
                    <SelectInput
                      value={profile.investorClassification}
                      options={["Retail Investor", "High-Net-Worth Individual", "Sophisticated Investor", "Institutional Investor"]}
                      onChange={(value) => updateField("investorClassification", value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Expected Annual Investment Amount</FieldLabel>
                    <TextInput placeholder="$0.00" value={profile.expectedAnnualInvestment} onChange={(value) => updateField("expectedAnnualInvestment", value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>Preferred Sectors</FieldLabel>
                    <TextInput placeholder="e.g. Technology, Real Estate, Healthcare" value={profile.preferredSectors} onChange={(value) => updateField("preferredSectors", value)} />
                  </div>
                  <div>
                    <FieldLabel>Risk Tolerance</FieldLabel>
                    <SelectInput value={profile.riskTolerance} options={["Low", "Medium", "High"]} onChange={(value) => updateField("riskTolerance", value)} />
                  </div>
                  <div>
                    <FieldLabel>Investment Horizon</FieldLabel>
                    <SelectInput value={profile.investmentHorizon} options={["Short", "Medium", "Long"]} onChange={(value) => updateField("investmentHorizon", value)} />
                  </div>
                </div>

                <Panel>
                  <FieldLabel>Compliance</FieldLabel>
                  <div className="space-y-2">
                    <CheckboxRow checked={profile.doAmlPolicy} label="Do you have an AML Policy?" onChange={(checked) => updateField("doAmlPolicy", checked)} />
                    <CheckboxRow checked={profile.contactInternalKyc} label="Do you conduct internal KYC?" onChange={(checked) => updateField("contactInternalKyc", checked)} />
                    <CheckboxRow checked={profile.ongoingLegalDispute} label="Are there ongoing legal disputes?" onChange={(checked) => updateField("ongoingLegalDispute", checked)} />
                  </div>
                  <div className="mt-4 border-t border-[#E4E7EC] pt-4">
                    <FieldLabel>Additional Details</FieldLabel>
                    <TextArea
                      placeholder="Please provide details about your compliance status..."
                      value={profile.investorComplianceDetails}
                      onChange={(value) => updateField("investorComplianceDetails", value)}
                    />
                  </div>
                </Panel>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Bank Name</FieldLabel>
                    <TextInput placeholder="e.g. Standard Chartered Bank" value={profile.bankName} onChange={(value) => updateField("bankName", value)} />
                  </div>
                  <div>
                    <FieldLabel>Account Name</FieldLabel>
                    <TextInput placeholder="Account name" value={profile.bankAccountName} onChange={(value) => updateField("bankAccountName", value)} />
                  </div>
                  <div>
                    <FieldLabel>IBAN / Account Number</FieldLabel>
                    <TextInput placeholder="e.g. GB29 NWBK 6016 1234 5678 98" value={profile.bankIban} onChange={(value) => updateField("bankIban", value)} />
                  </div>
                  <div>
                    <FieldLabel>SWIFT/Sort Code</FieldLabel>
                    <TextInput placeholder="e.g. BARCGB22XXX" value={profile.bankSwiftCode} onChange={(value) => updateField("bankSwiftCode", value)} />
                  </div>
                </div>
                <CheckboxRow
                  checked={profile.confirmLawfulFunds}
                  label="I confirm that all invested funds originate from lawful sources"
                  onChange={(checked) => updateField("confirmLawfulFunds", checked)}
                />
              </div>
            ) : null}

            {step === 7 ? (
              <div className="space-y-5">
                <div>
                  <SectionTitle>Step 7: Additional Documents</SectionTitle>
                  <p className="mt-1 text-[12px] text-[#667085]">Upload any supporting documents (Optional).</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <UploadArea {...fileProps("sourceOfWealthEvidence", "Source of Wealth Evidence")} wide />
                  <UploadArea {...fileProps("proofOfFunds", "Proof of Funds")} wide />
                  <UploadArea {...fileProps("corporateStructureChart", "Corporate Structure Chart")} wide />
                  <UploadArea {...fileProps("taxComplianceCertificate", "Tax Compliance Certificate")} wide />
                  <div className="sm:col-span-2">
                    <UploadArea {...fileProps("otherSupportingDocuments", "Other Supporting Documents")} wide />
                  </div>
                </div>
              </div>
            ) : null}

            {step === 8 ? (
              <div className="space-y-5">
                <div>
                  <SectionTitle>Step 8: Declarations</SectionTitle>
                  <p className="mt-1 text-[12px] text-[#667085]">Please review and agree to the following terms.</p>
                </div>
                <Panel>
                  <FieldLabel>AML & Compliance</FieldLabel>
                  <CheckboxRow
                    checked={profile.identityAcknowledgement}
                    label="I acknowledge that identity verification, AML/CTF checks, sanctions screening and ongoing monitoring may be conducted."
                    onChange={(checked) => updateField("identityAcknowledgement", checked)}
                  />
                </Panel>
                <Panel>
                  <FieldLabel>AML & Compliance</FieldLabel>
                  <div className="space-y-2">
                    <CheckboxRow checked={profile.confirmAccuracy} label="I confirm all information provided is accurate." onChange={(checked) => updateField("confirmAccuracy", checked)} />
                    <CheckboxRow
                      checked={profile.consentOngoingMonitoring}
                      label="I consent to the processing of my data."
                      onChange={(checked) => updateField("consentOngoingMonitoring", checked)}
                    />
                    <CheckboxRow
                      checked={profile.authorizeAdditionalDocuments}
                      label="I authorise requests for additional documents if required."
                      onChange={(checked) => updateField("authorizeAdditionalDocuments", checked)}
                    />
                    <CheckboxRow
                      checked={profile.governanceAgreement}
                      label="I agree to the platform's governance and compliance policies."
                      onChange={(checked) => updateField("governanceAgreement", checked)}
                    />
                  </div>
                </Panel>
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded-[8px] border border-[#FDA29B] bg-[#FFFBFA] px-3 py-2 text-[12px] font-medium text-[#B42318]">
                {error}
              </div>
            ) : null}
          </div>

          <NavButtons
            showBack={step > 1}
            isLastStep={step === steps.length}
            isSubmitting={isSubmitting}
            onBack={goBack}
            onContinue={continueFlow}
          />
        </KycShell>
      </div>

      {loaded && previewState ? <PreviewDialog file={previewState.file} objectUrl={previewState.objectUrl} onClose={closePreview} /> : null}
    </main>
  );
}
