"use client";

import { useState, type ReactNode } from "react";
import { apiRequest, getApiErrorMessage } from "@/lib/api";

type FieldStatus = "pending" | "approved" | "declined";
type Mode = "admin" | "user";

export type KycFieldReview = {
  path: string;
  label?: string;
  value?: unknown;
  status?: FieldStatus;
  declineReason?: string;
  reviewedAt?: string;
  updatedAt?: string;
};

export type KycRecord = {
  _id?: string;
  additionalDocuments?: Record<string, unknown>;
  addressVerification?: Record<string, unknown>;
  applicantInfo?: Record<string, unknown>;
  beneficialOwners?: Array<Record<string, unknown>>;
  companyInformation?: Record<string, unknown>;
  declarations?: Record<string, unknown>;
  faceVerification?: Record<string, unknown>;
  fieldReviews?: KycFieldReview[];
  financialInformation?: Record<string, unknown>;
  investorProfile?: Record<string, unknown>;
  personalIdentity?: Record<string, unknown>;
  pepSanctions?: Record<string, unknown>;
  sourceOfFunds?: Record<string, unknown>;
  status?: string;
};

type FieldType = "array" | "boolean" | "file" | "text";

type FieldDescriptor = {
  label: string;
  path: string;
  type?: FieldType;
  uploadKey?: string;
};

type KycDataReviewCardProps = {
  kyc: KycRecord | null | undefined;
  mode: Mode;
  onChange?: (kyc: KycRecord) => void;
};

type DraftValue = boolean | string | string[];

const sectionTabs = [
  "Application info",
  "Beneficial owners",
  "PEP & Sanctions",
  "Financial info",
  "Investor profile",
  "Extra documents",
  "Declarations",
];

const applicantFields: FieldDescriptor[] = [
  { label: "Applicant Type", path: "applicantInfo.applicantType" },
  { label: "Photo for verification", path: "faceVerification.facePhoto", type: "file", uploadKey: "facePhoto" },
  { label: "Full Legal Name / Company Name", path: "personalIdentity.fullLegalName" },
  { label: "Email Address", path: "applicantInfo.email" },
  { label: "Phone Number", path: "applicantInfo.phoneNumber" },
  { label: "Country", path: "applicantInfo.country" },
  { label: "Residential / Registered Address", path: "applicantInfo.residentialAddress" },
  { label: "ID Type", path: "applicantInfo.identificationType" },
  { label: "Identity Document", path: "personalIdentity.identityDocument", type: "file", uploadKey: "identityDocument" },
  { label: "Proof of Address", path: "addressVerification.proofOfAddress", type: "file", uploadKey: "proofOfAddress" },
  { label: "Date of Birth", path: "personalIdentity.dateOfBirth" },
  { label: "Nationality", path: "personalIdentity.nationality" },
  { label: "Source of Wealth", path: "personalIdentity.sourceOfWealth", type: "array" },
  { label: "Source of Wealth Explanation", path: "personalIdentity.sourceOfWealthExplanation" },
  { label: "Registered Company Name", path: "companyInformation.registeredCompanyName" },
  { label: "Trading Name", path: "companyInformation.tradingName" },
  { label: "Registration Number", path: "companyInformation.registrationNumber" },
  { label: "Country of Incorporation", path: "companyInformation.countryOfIncorporation" },
  { label: "Website", path: "companyInformation.website" },
  { label: "Registered Address", path: "companyInformation.registeredAddress" },
  { label: "Operating Address", path: "companyInformation.operatingAddress" },
  { label: "Certificate of Incorporation", path: "companyInformation.certificateOfIncorporation", type: "file", uploadKey: "certificateOfIncorporation" },
  { label: "Articles of Association", path: "companyInformation.articlesOfAssociation", type: "file", uploadKey: "articlesOfAssociation" },
  { label: "Register of Directors / Shareholders", path: "companyInformation.directorsShareholdersRegister", type: "file", uploadKey: "directorsShareholdersRegister" },
];

const pepFields: FieldDescriptor[] = [
  { label: "Are you a PEP?", path: "pepSanctions.isPep", type: "boolean" },
  { label: "Are you related to a PEP?", path: "pepSanctions.relatedToPep", type: "boolean" },
  { label: "Are you associated with a PEP?", path: "pepSanctions.associatedWithPep", type: "boolean" },
  { label: "PEP Details", path: "pepSanctions.pepDetails" },
  { label: "Are you or any UBO subject to sanction?", path: "pepSanctions.subjectToSanction", type: "boolean" },
  { label: "Sanction Details", path: "pepSanctions.sanctionDetails" },
];

const financialFields: FieldDescriptor[] = [
  { label: "Source of Funds", path: "financialInformation.sourceOfFunds", type: "array" },
  { label: "Explanation", path: "financialInformation.explanation" },
];

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

const sourceOfWealthOptions = ["Employment Income", "Pension", "Savings", "Sale of Assets", "Inheritance", "Other"];
const applicantTypeOptions = ["Individual", "Company / Organization"];
const countryOptions = ["Select a country", "Bangladesh", "United Kingdom", "United States", "United Arab Emirates", "Singapore", "Kenya"];
const idTypeOptions = ["Passport", "National ID", "Driving License"];
const investorClassificationOptions = ["Retail Investor", "High-Net-Worth Individual", "Sophisticated Investor", "Institutional Investor"];
const riskToleranceOptions = ["Low", "Medium", "High"];
const investmentHorizonOptions = ["Short", "Medium", "Long"];

const investorFields: FieldDescriptor[] = [
  { label: "Investor Classification", path: "investorProfile.investorClassification" },
  { label: "Expected Annual Investment Amount", path: "investorProfile.expectedAnnualInvestment" },
  { label: "Preferred Sectors", path: "investorProfile.preferredSectors" },
  { label: "Risk Tolerance", path: "investorProfile.riskTolerance" },
  { label: "Investment Horizon", path: "investorProfile.investmentHorizon" },
  { label: "Do you have an AML Policy?", path: "investorProfile.compliance.doAmlPolicy", type: "boolean" },
  { label: "Do you conduct internal KYC?", path: "investorProfile.compliance.contactInternalKyc", type: "boolean" },
  { label: "Are there ongoing legal disputes?", path: "investorProfile.compliance.ongoingLegalDispute", type: "boolean" },
  { label: "Compliance Details", path: "investorProfile.compliance.additionalDetails" },
  { label: "Bank Name", path: "investorProfile.bankDetails.bankName" },
  { label: "Account Name", path: "investorProfile.bankDetails.accountName" },
  { label: "IBAN / Account Number", path: "investorProfile.bankDetails.iban" },
  { label: "SWIFT / Sort Code", path: "investorProfile.bankDetails.swiftCode" },
  { label: "Lawful Funds Confirmation", path: "investorProfile.confirmLawfulFunds", type: "boolean" },
];

const extraDocumentFields: FieldDescriptor[] = [
  { label: "Source of Wealth Evidence", path: "additionalDocuments.sourceOfWealthEvidence", type: "file", uploadKey: "sourceOfWealthEvidence" },
  { label: "Proof of Funds", path: "additionalDocuments.proofOfFunds", type: "file", uploadKey: "proofOfFunds" },
  { label: "Corporate Structure Chart", path: "additionalDocuments.corporateStructureChart", type: "file", uploadKey: "corporateStructureChart" },
  { label: "Tax Compliance Certificate", path: "additionalDocuments.taxComplianceCertificate", type: "file", uploadKey: "taxComplianceCertificate" },
  { label: "Other Supporting Documents", path: "additionalDocuments.otherSupportingDocuments", type: "file", uploadKey: "otherSupportingDocuments" },
];

const declarationFields: FieldDescriptor[] = [
  { label: "Identity verification, AML/CTF checks, sanctions screening and ongoing monitoring acknowledgement", path: "declarations.identityAcknowledgement", type: "boolean" },
  { label: "All information provided is accurate", path: "declarations.confirmAccuracy", type: "boolean" },
  { label: "Consent to processing of data", path: "declarations.consentOngoingMonitoring", type: "boolean" },
  { label: "Authorise additional document requests", path: "declarations.authorizeAdditionalDocuments", type: "boolean" },
  { label: "Agree to governance and compliance policies", path: "declarations.governanceAgreement", type: "boolean" },
];

const declarationTextByPath: Record<string, string> = {
  "declarations.authorizeAdditionalDocuments": "I authorise requests for additional documents if required.",
  "declarations.confirmAccuracy": "I confirm all information provided is accurate.",
  "declarations.consentOngoingMonitoring": "I consent to the processing of my data.",
  "declarations.governanceAgreement": "I agree to the platform's governance and compliance policies.",
  "declarations.identityAcknowledgement":
    "I acknowledge that identity verification, AML/CTF checks, sanctions screening and ongoing monitoring may be conducted.",
};

const declarationFieldGroups = [
  [declarationFields[0]],
  declarationFields.slice(1),
];

const statusClassName: Record<FieldStatus, string> = {
  approved: "bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]",
  declined: "bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]",
  pending: "bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]",
};

function getPathValue(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current === null || typeof current === "undefined") return undefined;
    if (typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, source);
}

function isPresent(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "boolean") return true;
  return value !== null && typeof value !== "undefined" && String(value).trim() !== "";
}

function formatValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (!isPresent(value)) return "";
  return String(value);
}

function getFileName(url: string) {
  try {
    const parsedUrl = new URL(url);
    return decodeURIComponent(parsedUrl.pathname.split("/").filter(Boolean).pop() || "File name");
  } catch {
    return decodeURIComponent(url.split("?")[0].split("/").filter(Boolean).pop() || "File name");
  }
}

function sanitizeUploadFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, "-");
}

function isSameUploadedFile(previousValue: unknown, file: File) {
  if (typeof previousValue !== "string" || !previousValue) {
    return false;
  }

  const uploadedName = sanitizeUploadFileName(getFileName(previousValue));
  const selectedName = sanitizeUploadFileName(file.name);

  return uploadedName === selectedName || uploadedName.endsWith(`-${selectedName}`);
}

function normalizeComparableValue(field: FieldDescriptor, value: unknown) {
  if (field.type === "array") {
    const items = Array.isArray(value)
      ? value
      : String(value ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

    return JSON.stringify(items.map((item) => String(item).trim()).filter(Boolean));
  }

  if (field.type === "boolean") {
    return Boolean(value);
  }

  return String(value ?? "").trim();
}

function isSameFieldValue(field: FieldDescriptor, previousValue: unknown, nextValue: unknown) {
  return normalizeComparableValue(field, previousValue) === normalizeComparableValue(field, nextValue);
}

function getStringArrayValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function getCombinedStatus(reviews: Array<{ status: FieldStatus; value: unknown }>) {
  const presentReviews = reviews.filter((review) => isPresent(review.value));

  if (!presentReviews.length) {
    return null;
  }

  if (presentReviews.some((review) => review.status === "declined")) {
    return "declined";
  }

  if (presentReviews.some((review) => review.status === "pending")) {
    return "pending";
  }

  return "approved";
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

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 15V5" />
      <path d="m8 9 4-4 4 4" />
      <path d="M4.5 16.5v1.75A1.75 1.75 0 0 0 6.25 20h11.5a1.75 1.75 0 0 0 1.75-1.75V16.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M4.5 7h15" />
      <path d="M9.5 7V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V7" />
      <path d="M7 7.5 8 20h8l1-12.5" />
      <path d="M10.5 11v5" />
      <path d="M13.5 11v5" />
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
  onClick?: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        void onClick?.();
      }}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#667085] transition hover:bg-white hover:text-[#243B5A]"
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function getFieldReview(kyc: KycRecord, field: FieldDescriptor) {
  const review = kyc.fieldReviews?.find((item) => item.path === field.path);
  const pathValue = getPathValue(kyc, field.path);
  const value = isPresent(pathValue) ? pathValue : review?.value;

  return {
    declineReason: review?.declineReason || "",
    status: (review?.status || (isPresent(value) ? "pending" : "pending")) as FieldStatus,
    value,
  };
}

function buildBeneficialOwnerFields(kyc: KycRecord): FieldDescriptor[] {
  const owners = Array.isArray(kyc.beneficialOwners) ? kyc.beneficialOwners : [];

  return owners.flatMap((_, index) => [
    { label: `Owner ${index + 1} Full Legal Name`, path: `beneficialOwners.${index}.fullLegalName` },
    { label: `Owner ${index + 1} Ownership Percentage`, path: `beneficialOwners.${index}.ownershipPercentage` },
    { label: `Owner ${index + 1} Nationality`, path: `beneficialOwners.${index}.nationality` },
    { label: `Owner ${index + 1} Source of Wealth`, path: `beneficialOwners.${index}.sourceOfWealth` },
    { label: `Owner ${index + 1} Source of Funds`, path: `beneficialOwners.${index}.sourceOfFunds` },
    {
      label: `Owner ${index + 1} ID Upload`,
      path: `beneficialOwners.${index}.idDocument`,
      type: "file",
      uploadKey: `beneficialOwnerIdDocument${index}`,
    },
  ]);
}

function getSectionFields(tab: string, kyc: KycRecord): FieldDescriptor[] {
  if (tab === "Application info") return applicantFields;
  if (tab === "Beneficial owners") return buildBeneficialOwnerFields(kyc);
  if (tab === "PEP & Sanctions") return pepFields;
  if (tab === "Financial info") return financialFields;
  if (tab === "Investor profile") return investorFields;
  if (tab === "Extra documents") return extraDocumentFields;
  return declarationFields;
}

function getVisibleSectionFields(tab: string, kyc: KycRecord, mode: Mode) {
  const fields = getSectionFields(tab, kyc);

  if (tab !== "Extra documents" || mode === "user") {
    return fields;
  }

  return fields.filter((field) => isPresent(getFieldReview(kyc, field).value));
}

function StatusPill({ status }: { status: FieldStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${statusClassName[status]}`}>
      {status}
    </span>
  );
}

function FileChip({
  canDelete,
  onDelete,
  url,
}: {
  canDelete?: boolean;
  onDelete?: () => void | Promise<void>;
  url: string;
}) {
  const fileName = getFileName(url);

  return (
    <div className="flex min-h-10 items-center gap-3 rounded-[8px] bg-[#F2F4F7] px-3 py-2 text-[11px] text-[#667085] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-[#98A2B3]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <path d="M8 4.75h5.5L18.25 9.5V18a2 2 0 0 1-2 2H8A2 2 0 0 1 6 18V6.75a2 2 0 0 1 2-2Z" />
          <path d="M13.5 4.75V9.5h4.75" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[#344054]">{fileName}</p>
        <p className="text-[10px] text-[#98A2B3]">Uploaded document</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <a
          href={url}
          download={fileName}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#667085] transition hover:bg-white hover:text-[#243B5A]"
          aria-label="Download file"
          title="Download file"
        >
          <DownloadIcon />
        </a>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#667085] transition hover:bg-white hover:text-[#243B5A]"
          aria-label="View file"
          title="View file"
        >
          <EyeIcon />
        </a>
        {canDelete ? (
          <FileActionButton label="Remove file" onClick={onDelete}>
            <TrashIcon />
          </FileActionButton>
        ) : null}
      </div>
    </div>
  );
}

function SelectedFilePreview({ file }: { file: File }) {
  const sizeLabel = file.size < 1024 * 1024
    ? `${Math.max(1, Math.round(file.size / 1024))} KB`
    : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="flex min-h-10 items-center gap-3 rounded-[8px] border border-[#FED7AA] bg-[#FFF7ED] px-3 py-2 text-[11px] text-[#9A3412]">
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-[#F97316]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <path d="M8 4.75h5.5L18.25 9.5V18a2 2 0 0 1-2 2H8A2 2 0 0 1 6 18V6.75a2 2 0 0 1 2-2Z" />
          <path d="M13.5 4.75V9.5h4.75" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[#7C2D12]">{file.name}</p>
        <p className="text-[10px] text-[#C2410C]">Selected locally - {sizeLabel}</p>
      </div>
    </div>
  );
}

export function KycDataReviewCard({ kyc, mode, onChange }: KycDataReviewCardProps) {
  const [activeTab, setActiveTab] = useState(sectionTabs[0]);
  const [optimisticKyc, setOptimisticKyc] = useState<KycRecord | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, DraftValue>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | undefined>>({});
  const [savingPath, setSavingPath] = useState("");
  const [error, setError] = useState("");

  const visibleKyc = optimisticKyc?._id && optimisticKyc._id === kyc?._id ? optimisticKyc : kyc;

  if (!visibleKyc?._id) {
    return (
      <div className="rounded-[8px] border border-[#D7DEE8] bg-white px-5 py-8 text-center text-[13px] text-[#667085]">
        This user has not submitted KYC information yet.
      </div>
    );
  }

  const currentKyc = visibleKyc;
  const kycId = currentKyc._id;
  const fields = getVisibleSectionFields(activeTab, currentKyc, mode);
  const hasOwners = activeTab !== "Beneficial owners" || fields.length > 0;
  const hasExtraDocuments = activeTab !== "Extra documents" || fields.length > 0;

  const setKyc = (nextKyc: KycRecord) => {
    setOptimisticKyc(nextKyc);
    onChange?.(nextKyc);
  };

  async function reviewField(path: string, status: Exclude<FieldStatus, "pending">) {
    const declineReason = status === "declined" ? window.prompt("Decline reason/comment", "") || "" : "";

    setSavingPath(`${path}:${status}`);
    setError("");

    try {
      const response = await apiRequest<{ data: KycRecord }>({
        data: { path, status, declineReason },
        method: "PATCH",
        url: `kyc/${kycId}/fields/review`,
      });

      setKyc(response.data);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to review KYC field."));
    } finally {
      setSavingPath("");
    }
  }

  async function updateField(field: FieldDescriptor, options: { file?: File; value?: DraftValue } = {}) {
    const nextValue = Object.prototype.hasOwnProperty.call(options, "value") ? options.value : draftValues[field.path];
    const currentReview = getFieldReview(currentKyc, field);

    if (field.type === "file") {
      if (!options.file || isSameUploadedFile(currentReview.value, options.file)) {
        setSelectedFiles((current) => {
          if (!current[field.path]) {
            return current;
          }

          const next = { ...current };
          delete next[field.path];
          return next;
        });
        setError("");
        return true;
      }
    } else if (isSameFieldValue(field, currentReview.value, nextValue)) {
      setDraftValues((current) => {
        if (!Object.prototype.hasOwnProperty.call(current, field.path)) {
          return current;
        }

        const next = { ...current };
        delete next[field.path];
        return next;
      });
      setError("");
      return true;
    }

    const formData = new FormData();

    if (field.path.startsWith("beneficialOwners.")) {
      const owners = [...(currentKyc.beneficialOwners ?? [])].map((owner) => ({ ...owner }));
      const [, rawIndex, ownerField] = field.path.split(".");
      const index = Number(rawIndex);

      if (!owners[index]) {
        owners[index] = {};
      }

      if (field.type !== "file") {
        owners[index][ownerField] = nextValue;
      }

      formData.append(
        "beneficialOwners",
        JSON.stringify(owners.map((owner) => {
          const ownerFields = { ...owner };
          delete ownerFields.idDocument;
          return ownerFields;
        }))
      );
    } else if (field.type !== "file") {
      const value = field.type === "array"
        ? JSON.stringify(getStringArrayValue(nextValue))
        : nextValue;
      formData.append(field.path, String(value ?? ""));
    }

    if (field.type === "file" && options.file && field.uploadKey) {
      formData.append(field.uploadKey, options.file, options.file.name);
    }

    setSavingPath(field.path);
    setError("");

    try {
      const response = await apiRequest<{ data: KycRecord }>({
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
        method: "PATCH",
        url: `kyc/${kycId}`,
      });

      setDraftValues((current) => {
        const next = { ...current };
        delete next[field.path];
        return next;
      });
      setSelectedFiles((current) => {
        if (!current[field.path]) {
          return current;
        }

        const next = { ...current };
        delete next[field.path];
        return next;
      });
      setKyc(response.data);
      return true;
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to update KYC field."));
      return false;
    } finally {
      setSavingPath("");
    }
  }

  async function clearField(field: FieldDescriptor) {
    const formData = new FormData();

    if (field.path.startsWith("beneficialOwners.")) {
      const owners = [...(currentKyc.beneficialOwners ?? [])].map((owner) => ({ ...owner }));
      const [, rawIndex, ownerField] = field.path.split(".");
      const index = Number(rawIndex);

      if (!owners[index]) {
        owners[index] = {};
      }

      owners[index][ownerField] = "";
      formData.append("beneficialOwners", JSON.stringify(owners));
    } else {
      formData.append(field.path, "");
    }

    setSavingPath(field.path);
    setError("");
    setSelectedFiles((current) => {
      if (!current[field.path]) {
        return current;
      }

      const next = { ...current };
      delete next[field.path];
      return next;
    });

    try {
      const response = await apiRequest<{ data: KycRecord }>({
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
        method: "PATCH",
        url: `kyc/${kycId}`,
      });

      setKyc(response.data);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to remove KYC file."));
    } finally {
      setSavingPath("");
    }
  }

  function getSectionStatus(sectionFields: FieldDescriptor[]) {
    return getCombinedStatus(
      sectionFields
        .filter((field) => field.type !== "boolean")
        .map((field) => getFieldReview(currentKyc, field)),
    );
  }

  function getSectionReviewableFields(sectionFields: FieldDescriptor[]) {
    return sectionFields.filter((field) => field.type !== "boolean" && isPresent(getFieldReview(currentKyc, field).value));
  }

  function hasSectionChange(sectionFields: FieldDescriptor[]) {
    return sectionFields.some((field) => {
      if (field.type === "file") {
        return false;
      }

      return (
        Object.prototype.hasOwnProperty.call(draftValues, field.path) &&
        !isSameFieldValue(field, getFieldReview(currentKyc, field).value, draftValues[field.path])
      );
    });
  }

  async function updateSectionFields(sectionKey: string, sectionFields: FieldDescriptor[], fallbackMessage: string) {
    const changedFields = sectionFields.filter((field) => {
      if (field.type === "file" || !Object.prototype.hasOwnProperty.call(draftValues, field.path)) {
        return false;
      }

      return !isSameFieldValue(field, getFieldReview(currentKyc, field).value, draftValues[field.path]);
    });

    if (!changedFields.length) {
      setDraftValues((current) => {
        const next = { ...current };
        for (const field of sectionFields) {
          delete next[field.path];
        }
        return next;
      });
      setError("");
      return true;
    }

    const formData = new FormData();
    const ownerUpdates = new Map<number, Record<string, unknown>>();

    for (const field of changedFields) {
      const nextValue = draftValues[field.path];

      if (field.path.startsWith("beneficialOwners.")) {
        const [, rawIndex, ownerField] = field.path.split(".");
        const index = Number(rawIndex);
        ownerUpdates.set(index, {
          ...(ownerUpdates.get(index) ?? {}),
          [ownerField]: nextValue,
        });
      } else {
        const value = field.type === "array" ? JSON.stringify(getStringArrayValue(nextValue)) : nextValue;
        formData.append(field.path, String(value ?? ""));
      }
    }

    if (ownerUpdates.size) {
      const owners = [...(currentKyc.beneficialOwners ?? [])].map((owner) => ({ ...owner }));
      for (const [index, update] of ownerUpdates) {
        owners[index] = {
          ...(owners[index] ?? {}),
          ...update,
        };
      }
      formData.append(
        "beneficialOwners",
        JSON.stringify(
          owners.map((owner) => {
            const ownerFields = { ...owner };
            delete ownerFields.idDocument;
            return ownerFields;
          }),
        ),
      );
    }

    setSavingPath(sectionKey);
    setError("");

    try {
      const response = await apiRequest<{ data: KycRecord }>({
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
        method: "PATCH",
        url: `kyc/${kycId}`,
      });

      setDraftValues((current) => {
        const next = { ...current };
        for (const field of sectionFields) {
          delete next[field.path];
        }
        return next;
      });
      setKyc(response.data);
      return true;
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, fallbackMessage));
      return false;
    } finally {
      setSavingPath("");
    }
  }

  async function reviewSectionFields(sectionKey: string, sectionFields: FieldDescriptor[], status: Exclude<FieldStatus, "pending">, fallbackMessage: string) {
    const declineReason = status === "declined" ? window.prompt("Decline reason/comment", "") || "" : "";
    const reviewableFields = getSectionReviewableFields(sectionFields);

    if (!reviewableFields.length) {
      return;
    }

    setSavingPath(`${sectionKey}:${status}`);
    setError("");

    try {
      let nextKyc: KycRecord | null = null;

      for (const field of reviewableFields) {
        const response = await apiRequest<{ data: KycRecord }>({
          data: { path: field.path, status, declineReason },
          method: "PATCH",
          url: `kyc/${kycId}/fields/review`,
        });
        nextKyc = response.data;
      }

      if (nextKyc) {
        setKyc(nextKyc);
      }
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, fallbackMessage));
    } finally {
      setSavingPath("");
    }
  }

  function renderSectionFooter(sectionKey: string, sectionFields: FieldDescriptor[], onUpdate: () => void, onReview?: (status: Exclude<FieldStatus, "pending">) => void) {
    const sectionStatus = getSectionStatus(sectionFields);
    const hasReviewableValue = getSectionReviewableFields(sectionFields).length > 0;
    const isSavingSection = savingPath === sectionKey || savingPath.startsWith(`${sectionKey}:`);
    const changed = hasSectionChange(sectionFields);

    return (
      <div className="-mx-4 -mb-4 sm:-mx-6 sm:-mb-5 flex w-[calc(100%+32px)] sm:w-[calc(100%+48px)] flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#C3C6CE] bg-[#F5F5F5] px-4 py-4 sm:px-6 sm:py-6">
        <div>{sectionStatus ? <StatusPill status={sectionStatus} /> : null}</div>
        <div className="flex flex-wrap gap-3">
          {mode === "admin" && hasReviewableValue && onReview ? (
            <>
              {sectionStatus !== "declined" ? (
                <button
                  type="button"
                  disabled={isSavingSection}
                  onClick={() => onReview("declined")}
                  className="rounded-[8px] border border-[#D4D4D8] px-6 py-2.5 text-[14px] font-semibold text-[#3F3F46] disabled:cursor-wait disabled:opacity-60"
                >
                  Decline
                </button>
              ) : null}
              {sectionStatus !== "approved" ? (
                <button
                  type="button"
                  disabled={isSavingSection}
                  onClick={() => onReview("approved")}
                  className="rounded-[8px] bg-[#E65E02] px-6 py-2.5 text-[14px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:cursor-wait disabled:opacity-60"
                >
                  Approve
                </button>
              ) : null}
            </>
          ) : null}
          {mode === "user" ? (
            <button
              type="button"
              disabled={isSavingSection || !changed}
              onClick={onUpdate}
              className="rounded-[8px] bg-[#E65E02] px-6 py-2.5 text-[14px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingSection ? "Updating..." : "Update"}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  function renderTextControl(field: FieldDescriptor, placeholder = "Not provided", options?: string[]) {
    const review = getFieldReview(currentKyc, field);
    const value = String(draftValues[field.path] ?? review.value ?? "");
    const disabled = mode !== "user" || savingPath === field.path || savingPath.startsWith(`${field.path}:`);

    return (
      <div>
        <label className="mb-2 block text-[12px] font-medium text-[#101828]">{field.label}</label>
        {mode === "user" ? (
          options ? (
            <select
              value={value || options[0] || ""}
              disabled={disabled}
              onChange={(event) => setDraftValues((current) => ({ ...current, [field.path]: event.target.value }))}
              className="h-11 w-full rounded-[6px] border border-[#D4D4D8] bg-white px-3 text-[13px] text-[#101828] outline-none focus:border-[#E65E02] focus:ring-2 focus:ring-[#E65E02]/10 disabled:cursor-wait disabled:opacity-70"
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={value}
              disabled={disabled}
              onChange={(event) => setDraftValues((current) => ({ ...current, [field.path]: event.target.value }))}
              placeholder={placeholder}
              className="h-11 w-full rounded-[6px] border border-[#D4D4D8] bg-white px-3 text-[13px] text-[#101828] outline-none placeholder:text-[#A1A1AA] focus:border-[#E65E02] focus:ring-2 focus:ring-[#E65E02]/10 disabled:cursor-wait disabled:opacity-70"
            />
          )
        ) : (
          <div className="flex min-h-11 items-center rounded-[6px] border border-[#D4D4D8] bg-white px-3 text-[13px] text-[#101828]">
            {formatValue(review.value) || "Not provided"}
          </div>
        )}
      </div>
    );
  }

  function renderReadOnlyTextControl(field: FieldDescriptor, placeholder = "Not provided") {
    const review = getFieldReview(currentKyc, field);
    const value = String(review.value ?? "");

    return (
      <div>
        <label className="mb-2 block text-[12px] font-medium text-[#101828]">{field.label}</label>
        <div className="flex min-h-11 w-full items-center rounded-[6px] border border-[#D4D4D8] bg-[#F9FAFB] px-3 text-[13px] text-[#667085]">
          {value || placeholder}
        </div>
      </div>
    );
  }

  function renderTextareaControl(field: FieldDescriptor, placeholder = "Not provided") {
    const review = getFieldReview(currentKyc, field);
    const value = String(draftValues[field.path] ?? review.value ?? "");
    const disabled = mode !== "user" || savingPath === field.path || savingPath.startsWith(`${field.path}:`);

    return (
      <div>
        <label className="mb-2 block text-[12px] font-medium text-[#101828]">{field.label}</label>
        {mode === "user" ? (
          <textarea
            value={value}
            disabled={disabled}
            onChange={(event) => setDraftValues((current) => ({ ...current, [field.path]: event.target.value }))}
            placeholder={placeholder}
            className="min-h-[78px] w-full resize-none rounded-[6px] border border-[#D4D4D8] bg-white px-4 py-3 text-[13px] text-[#101828] outline-none placeholder:text-[#A1A1AA] focus:border-[#E65E02] focus:ring-2 focus:ring-[#E65E02]/10 disabled:cursor-wait disabled:opacity-70"
          />
        ) : (
          <div className="min-h-[78px] rounded-[6px] border border-[#D4D4D8] bg-white px-4 py-3 text-[13px] text-[#101828]">
            {formatValue(review.value) || "Not provided"}
          </div>
        )}
      </div>
    );
  }

  function renderBooleanControl(field: FieldDescriptor, label?: string) {
    const review = getFieldReview(currentKyc, field);
    const draftBooleanValue = draftValues[field.path];
    const checked = typeof draftBooleanValue === "boolean" ? draftBooleanValue : Boolean(review.value);
    const isSaving = savingPath === field.path || savingPath.startsWith(`${field.path}:`);

    return (
      <label className="flex items-center gap-3 text-[13px] font-medium leading-5 text-[#3F3F46]">
        <input
          type="checkbox"
          checked={checked}
          disabled={mode !== "user" || isSaving}
          onChange={(event) => {
            if (mode !== "user") {
              return;
            }

            const nextChecked = event.target.checked;
            setDraftValues((current) => ({ ...current, [field.path]: nextChecked }));
            void (async () => {
              const didSave = await updateField(field, { value: nextChecked });

              if (!didSave) {
                setDraftValues((current) => {
                  const next = { ...current };
                  delete next[field.path];
                  return next;
                });
              }
            })();
          }}
          className="h-[16px] w-[16px] shrink-0 accent-[#9CC9F5] disabled:cursor-default"
        />
        {isSaving ? "Saving..." : label ?? field.label}
      </label>
    );
  }

  function renderArrayCheckboxes(field: FieldDescriptor, options: string[]) {
    const review = getFieldReview(currentKyc, field);
    const selected = getStringArrayValue(draftValues[field.path] ?? review.value);

    return (
      <div className="grid gap-x-20 gap-y-3 sm:grid-cols-2">
        {options.map((option) => {
          const checked = selected.includes(option);

          return (
            <label key={option} className="flex items-center gap-3 text-[12px] font-medium leading-5 text-[#3F3F46]">
              <input
                type="checkbox"
                checked={checked}
                disabled={mode !== "user"}
                onChange={(event) => {
                  if (mode !== "user") {
                    return;
                  }

                  const nextSelected = event.target.checked ? [...selected, option] : selected.filter((item) => item !== option);
                  setDraftValues((current) => ({ ...current, [field.path]: nextSelected }));
                }}
                className="h-[14px] w-[14px] shrink-0 accent-[#9CC9F5] disabled:cursor-default"
              />
              {option}
            </label>
          );
        })}
      </div>
    );
  }

  function renderCompactFileField(field: FieldDescriptor) {
    const review = getFieldReview(currentKyc, field);
    const hasValue = isPresent(review.value);
    const selectedFile = selectedFiles[field.path];
    const isSaving = savingPath === field.path || savingPath.startsWith(`${field.path}:`);
    const selectedFileMatchesExisting = selectedFile ? isSameUploadedFile(review.value, selectedFile) : false;

    return (
      <div className="rounded-[10px] border-2 border-dashed border-[#D4D4D8] bg-[#FAFAFA] p-5">
        {hasValue && typeof review.value === "string" ? <FileChip canDelete={mode === "user"} url={review.value} onDelete={() => clearField(field)} /> : null}
        {!hasValue ? <p className="rounded-[8px] bg-[#F2F4F7] px-3 py-2 text-[11px] text-[#98A2B3]">{field.label}</p> : null}
        {selectedFile ? (
          <div className="mt-3 space-y-3">
            <SelectedFilePreview file={selectedFile} />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setSelectedFiles((current) => {
                    const next = { ...current };
                    delete next[field.path];
                    return next;
                  });
                }}
                className="rounded-[6px] border border-[#D4D4D8] px-3 py-1.5 text-[12px] font-semibold text-[#3F3F46] disabled:cursor-wait disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving || selectedFileMatchesExisting}
                onClick={() => void updateField(field, { file: selectedFile })}
                className="rounded-[6px] bg-[#E65E02] px-3 py-1.5 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Uploading..." : selectedFileMatchesExisting ? "Already uploaded" : "Upload"}
              </button>
            </div>
          </div>
        ) : null}
        {mode === "user" ? (
          <input
            type="file"
            accept="image/*,video/*,.pdf,application/pdf"
            className="mt-3 block w-full text-[11px] text-[#667085] file:mr-3 file:rounded-[6px] file:border-0 file:bg-[#243B5A] file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-white"
            disabled={isSaving}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setSelectedFiles((current) => ({ ...current, [field.path]: file }));
              }
              event.target.value = "";
            }}
          />
        ) : null}
      </div>
    );
  }

  function renderApplicantInfoTab() {
    const sectionKey = "applicantInfo";
    const applicantTypeField = applicantFields[0];
    const facePhotoField = applicantFields[1];
    const fullNameField = applicantFields[2];
    const emailField = applicantFields[3];
    const phoneField = applicantFields[4];
    const countryField = applicantFields[5];
    const addressField = applicantFields[6];
    const idTypeField = applicantFields[7];
    const identityDocumentField = applicantFields[8];
    const proofOfAddressField = applicantFields[9];
    const dateOfBirthField = applicantFields[10];
    const nationalityField = applicantFields[11];
    const sourceOfWealthField = applicantFields[12];
    const sourceOfWealthExplanationField = applicantFields[13];
    const companyFields = applicantFields.slice(14, 21);
    const companyFileFields = applicantFields.slice(21);
    const editableFields = applicantFields.filter((field) => field.type !== "file" && field.path !== emailField.path);
    const applicantType = String(draftValues[applicantTypeField.path] ?? getFieldReview(currentKyc, applicantTypeField).value ?? "Individual");
    const isCompany = applicantType.toLowerCase().includes("company");

    return (
      <div className="mx-auto flex w-full max-w-[830px] flex-col items-start gap-8 py-8">
        <div className="flex w-full flex-col items-start gap-2">
          <h3 className="flex min-h-7 w-full items-center text-[20px] font-semibold leading-7 text-[#17324E]">Applicant Information</h3>
        </div>

        <div className="w-full space-y-7">
          <div>
            <p className="mb-3 text-[12px] font-semibold text-[#101828]">Applicant Type</p>
            <div className="flex flex-wrap gap-6">
              {applicantTypeOptions.map((option) => (
                <label key={option} className="flex items-center gap-2 text-[12px] font-medium text-[#101828]">
                  <input
                    type="radio"
                    checked={applicantType === option}
                    disabled={mode !== "user"}
                    onChange={() => setDraftValues((current) => ({ ...current, [applicantTypeField.path]: option }))}
                    className="h-[14px] w-[14px] accent-[#9CC9F5]"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-[#E4E4E7] pt-5">
            <h4 className="mb-5 text-[14px] font-semibold text-[#17324E]">Common Information</h4>
            <div className="mb-5">
              <p className="mb-2 text-[12px] font-medium text-[#101828]">Photo for verification</p>
              {renderCompactFileField(facePhotoField)}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {renderTextControl(fullNameField, "Enter name")}
              {renderReadOnlyTextControl(emailField, "e.g name@example.com")}
              {renderTextControl(phoneField, "+1 (555) 000-0000")}
              {renderTextControl(countryField, "Select a country", countryOptions)}
              <div className="sm:col-span-2">{renderTextareaControl(addressField, "Full address")}</div>
            </div>
          </div>

          <div className="border-t border-[#E4E4E7] pt-5">
            <h4 className="mb-5 text-[14px] font-semibold text-[#17324E]">Identity Verification</h4>
            <div className="mb-5">{renderTextControl(idTypeField, "ID type", idTypeOptions)}</div>
            <div className="grid gap-5 sm:grid-cols-2">
              {renderCompactFileField(identityDocumentField)}
              {renderCompactFileField(proofOfAddressField)}
            </div>
          </div>

          <div className="border-t border-[#E4E4E7] pt-5">
            <h4 className="mb-5 text-[14px] font-semibold text-[#17324E]">Personal Information</h4>
            <div className="grid gap-5 sm:grid-cols-2">
              {renderTextControl(dateOfBirthField, "mm/dd/yyyy")}
              {renderTextControl(nationalityField, "e.g American")}
            </div>
            <div className="mt-5">
              <p className="mb-3 text-[12px] font-medium text-[#101828]">Source of Wealth</p>
              {renderArrayCheckboxes(sourceOfWealthField, sourceOfWealthOptions)}
            </div>
            <div className="mt-5">{renderTextareaControl(sourceOfWealthExplanationField, "Provide additional details...")}</div>
          </div>

          {isCompany ? (
            <div className="border-t border-[#E4E4E7] pt-5">
              <h4 className="mb-5 text-[14px] font-semibold text-[#17324E]">Company Information</h4>
              <div className="grid gap-5 sm:grid-cols-2">
                {companyFields.map((field) => (
                  <div key={field.path} className={field.path.endsWith("registeredAddress") || field.path.endsWith("operatingAddress") ? "sm:col-span-2" : undefined}>
                    {field.path.endsWith("registeredAddress") || field.path.endsWith("operatingAddress")
                      ? renderTextareaControl(field, "Full address")
                      : renderTextControl(field)}
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {companyFileFields.map((field) => (
                  <div key={field.path}>{renderCompactFileField(field)}</div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {renderSectionFooter(
          sectionKey,
          editableFields,
          () => void updateSectionFields(sectionKey, editableFields, "Unable to update applicant information."),
          (status) => void reviewSectionFields(sectionKey, editableFields, status, "Unable to review applicant information."),
        )}
      </div>
    );
  }

  function renderBeneficialOwnersTab() {
    const sectionKey = "beneficialOwners";
    const owners = currentKyc.beneficialOwners ?? [];
    const ownerFields = buildBeneficialOwnerFields(currentKyc);
    const editableFields = ownerFields.filter((field) => field.type !== "file");

    return (
      <div className="mx-auto flex w-full max-w-[830px] flex-col items-start gap-8 py-8">
        <div className="flex w-full flex-col items-start gap-2">
          <h3 className="flex min-h-7 w-full items-center text-[20px] font-semibold leading-7 text-[#17324E]">Beneficial Owners</h3>
          <p className="flex min-h-5 w-full items-center text-[14px] font-normal leading-5 text-[#71717B]">Ultimate Beneficial Owners (UBOs).</p>
        </div>

        {!owners.length ? <p className="text-[13px] text-[#71717B]">No beneficial owners were submitted.</p> : null}
        <div className="w-full space-y-6">
          {owners.map((_, index) => {
            const fieldsForOwner = ownerFields.filter((field) => field.path.startsWith(`beneficialOwners.${index}.`));
            const idField = fieldsForOwner.find((field) => field.type === "file");

            return (
              <div key={index} className="rounded-[12px] bg-[#FAFAFA] p-5">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-[13px] font-semibold text-[#101828]">Owner {index + 1}</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  {fieldsForOwner.filter((field) => field.type !== "file").map((field) => (
                    <div key={field.path} className={field.path.endsWith("sourceOfFunds") ? "sm:col-span-2" : undefined}>
                      {renderTextControl(field, field.path.endsWith("ownershipPercentage") ? "e.g. 0.6%" : "e.g. from XYZ company")}
                    </div>
                  ))}
                </div>
                {idField ? <div className="mt-5">{renderCompactFileField(idField)}</div> : null}
              </div>
            );
          })}
        </div>

        {renderSectionFooter(
          sectionKey,
          editableFields,
          () => void updateSectionFields(sectionKey, editableFields, "Unable to update beneficial owners."),
          (status) => void reviewSectionFields(sectionKey, editableFields, status, "Unable to review beneficial owners."),
        )}
      </div>
    );
  }

  function renderPepSanctionsTab() {
    const sectionKey = "pepSanctions";
    const editableFields = pepFields;

    return (
      <div className="mx-auto flex w-full max-w-[830px] flex-col items-start gap-8 py-8">
        <div className="flex w-full flex-col items-start gap-2">
          <h3 className="flex min-h-7 w-full items-center text-[20px] font-semibold leading-7 text-[#17324E]">PEP &amp; Sanctions</h3>
          <p className="flex min-h-5 w-full items-center text-[14px] font-normal leading-5 text-[#71717B]">Declare if you or any associated parties are politically exposed or subject to sanctions</p>
        </div>

        <div className="w-full space-y-8">
          <div>
            <p className="mb-4 text-[14px] font-semibold leading-5 text-[#17324E]">Politically Exposed Person (PEP)</p>
            <div className="rounded-[12px] bg-[#FAFAFA] p-5">
              <div className="space-y-3">
                {pepFields.slice(0, 3).map((field) => (
                  <div key={field.path}>{renderBooleanControl(field)}</div>
                ))}
              </div>
              <div className="mt-5 border-t border-[#E4E4E7] pt-5">
                {renderTextareaControl(pepFields[3], "Please provide details about the PEP status...")}
              </div>
            </div>
          </div>
          <div>
            <p className="mb-4 text-[14px] font-semibold leading-5 text-[#17324E]">Sanctions</p>
            <div className="rounded-[12px] bg-[#FAFAFA] p-5">
              {renderBooleanControl(pepFields[4])}
              <div className="mt-5 border-t border-[#E4E4E7] pt-5">
                {renderTextareaControl(pepFields[5], "Please provide details about the sanction status...")}
              </div>
            </div>
          </div>
        </div>

        {renderSectionFooter(
          sectionKey,
          editableFields,
          () => void updateSectionFields(sectionKey, editableFields, "Unable to update PEP and sanctions."),
          (status) => void reviewSectionFields(sectionKey, editableFields, status, "Unable to review PEP and sanctions."),
        )}
      </div>
    );
  }

  function renderInvestorProfileTab() {
    const sectionKey = "investorProfile";
    const editableFields = investorFields.filter((field) => field.path !== "investorProfile.confirmLawfulFunds");

    return (
      <div className="mx-auto flex w-full max-w-[830px] flex-col items-start gap-8 py-8">
        <div className="flex w-full flex-col items-start gap-2">
          <h3 className="flex min-h-7 w-full items-center text-[20px] font-semibold leading-7 text-[#17324E]">Investor Section</h3>
          <p className="flex min-h-5 w-full items-center text-[14px] font-normal leading-5 text-[#71717B]">Provide details about your investment profile and preferences</p>
        </div>

        <div className="grid w-full gap-5 sm:grid-cols-2">
          {renderTextControl(investorFields[0], "Retail Investor", investorClassificationOptions)}
          {renderTextControl(investorFields[1], "$0.00")}
          <div className="sm:col-span-2">{renderTextControl(investorFields[2], "e.g. Technology, Real Estate, Healthcare")}</div>
          {renderTextControl(investorFields[3], "Medium", riskToleranceOptions)}
          {renderTextControl(investorFields[4], "Medium", investmentHorizonOptions)}
        </div>

        <div className="w-full rounded-[12px] bg-[#FAFAFA] p-5">
          <p className="mb-4 text-[14px] font-semibold leading-5 text-[#17324E]">Compliance</p>
          <div className="space-y-3">
            {investorFields.slice(5, 8).map((field) => (
              <div key={field.path}>{renderBooleanControl(field)}</div>
            ))}
          </div>
          <div className="mt-5 border-t border-[#E4E4E7] pt-5">
            {renderTextareaControl(investorFields[8], "Please provide details about your compliance status...")}
          </div>
        </div>

        <div className="grid w-full gap-5 sm:grid-cols-2">
          {renderTextControl(investorFields[9], "e.g. Standard Chartered Bank")}
          {renderTextControl(investorFields[10], "Account name")}
          {renderTextControl(investorFields[11], "e.g. GB29 NWBK 6016 1234 5678 98")}
          {renderTextControl(investorFields[12], "e.g. BARCGB22XXX")}
        </div>
        <div className="w-full">{renderBooleanControl(investorFields[13], "I confirm that all invested funds originate from lawful sources")}</div>

        {renderSectionFooter(
          sectionKey,
          editableFields,
          () => void updateSectionFields(sectionKey, editableFields, "Unable to update investor profile."),
          (status) => void reviewSectionFields(sectionKey, editableFields, status, "Unable to review investor profile."),
        )}
      </div>
    );
  }

  async function updateFinancialInfo() {
    const sourceField = financialFields[0];
    const explanationField = financialFields[1];
    const sourceReview = getFieldReview(currentKyc, sourceField);
    const explanationReview = getFieldReview(currentKyc, explanationField);
    const nextSources = getStringArrayValue(draftValues[sourceField.path] ?? sourceReview.value);
    const nextExplanation = String(draftValues[explanationField.path] ?? explanationReview.value ?? "").trim();
    const sourceChanged = !isSameFieldValue(sourceField, sourceReview.value, nextSources);
    const explanationChanged = !isSameFieldValue(explanationField, explanationReview.value, nextExplanation);

    if (!sourceChanged && !explanationChanged) {
      setDraftValues((current) => {
        const next = { ...current };
        delete next[sourceField.path];
        delete next[explanationField.path];
        return next;
      });
      setError("");
      return true;
    }

    const formData = new FormData();

    if (sourceChanged) {
      formData.append(sourceField.path, JSON.stringify(nextSources));
    }

    if (explanationChanged) {
      formData.append(explanationField.path, nextExplanation);
    }

    setSavingPath("financialInformation");
    setError("");

    try {
      const response = await apiRequest<{ data: KycRecord }>({
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
        method: "PATCH",
        url: `kyc/${kycId}`,
      });

      setDraftValues((current) => {
        const next = { ...current };
        delete next[sourceField.path];
        delete next[explanationField.path];
        return next;
      });
      setKyc(response.data);
      return true;
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to update financial information."));
      return false;
    } finally {
      setSavingPath("");
    }
  }

  async function reviewFinancialInfo(status: Exclude<FieldStatus, "pending">) {
    const declineReason = status === "declined" ? window.prompt("Decline reason/comment", "") || "" : "";
    const reviewableFields = financialFields.filter((field) => isPresent(getFieldReview(currentKyc, field).value));

    if (!reviewableFields.length) {
      return;
    }

    setSavingPath(`financialInformation:${status}`);
    setError("");

    try {
      let nextKyc: KycRecord | null = null;

      for (const field of reviewableFields) {
        const response = await apiRequest<{ data: KycRecord }>({
          data: { path: field.path, status, declineReason },
          method: "PATCH",
          url: `kyc/${kycId}/fields/review`,
        });
        nextKyc = response.data;
      }

      if (nextKyc) {
        setKyc(nextKyc);
      }
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to review financial information."));
    } finally {
      setSavingPath("");
    }
  }

  function renderFinancialInfoTab() {
    const sourceField = financialFields[0];
    const explanationField = financialFields[1];
    const sourceReview = getFieldReview(currentKyc, sourceField);
    const explanationReview = getFieldReview(currentKyc, explanationField);
    const selectedSources = getStringArrayValue(draftValues[sourceField.path] ?? sourceReview.value);
    const explanation = String(draftValues[explanationField.path] ?? explanationReview.value ?? "");
    const sourceChanged = Object.prototype.hasOwnProperty.call(draftValues, sourceField.path) && !isSameFieldValue(sourceField, sourceReview.value, selectedSources);
    const explanationChanged = Object.prototype.hasOwnProperty.call(draftValues, explanationField.path) && !isSameFieldValue(explanationField, explanationReview.value, explanation);
    const hasFinancialChange = sourceChanged || explanationChanged;
    const combinedStatus = getCombinedStatus([sourceReview, explanationReview]);
    const isSavingFinancial = savingPath === "financialInformation" || savingPath.startsWith("financialInformation:");
    const hasFinancialValue = isPresent(sourceReview.value) || isPresent(explanationReview.value);

    return (
      <div className="mx-auto flex w-full max-w-[830px] flex-col items-start gap-8 py-8">
        <div className="flex w-full items-start justify-between gap-4">
          <div className="flex flex-col items-start gap-2">
            <h3 className="flex min-h-7 items-center text-[20px] font-semibold leading-7 text-[#17324E]">Financial Information</h3>
            <p className="flex min-h-5 items-center text-[14px] font-normal leading-5 text-[#71717B]">Please provide information about your source of funds</p>
          </div>
          {combinedStatus ? <StatusPill status={combinedStatus} /> : null}
        </div>

        <div className="w-full">
          <p className="mb-4 text-[14px] font-semibold leading-5 text-[#17324E]">Politically Exposed Person (PEP)</p>
          <div className="rounded-[12px] bg-[#FAFAFA] p-5">
            <p className="mb-4 text-[12px] font-semibold text-[#101828]">Source of Funds</p>
            <div className="grid gap-x-20 gap-y-3 sm:grid-cols-2">
              {sourceOfFundsOptions.map((option) => {
                const checked = selectedSources.includes(option);

                return (
                  <label key={option} className="flex items-center gap-3 text-[12px] font-medium leading-5 text-[#3F3F46]">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={mode !== "user" || isSavingFinancial}
                      onChange={(event) => {
                        if (mode !== "user") {
                          return;
                        }

                        const nextSources = event.target.checked
                          ? [...selectedSources, option]
                          : selectedSources.filter((item) => item !== option);
                        setDraftValues((current) => ({ ...current, [sourceField.path]: nextSources }));
                      }}
                      className="h-[14px] w-[14px] shrink-0 accent-[#9CC9F5] disabled:cursor-default"
                    />
                    {option}
                  </label>
                );
              })}
            </div>

            <div className="mt-5 border-t border-[#E4E4E7] pt-5">
              <label className="mb-2 block text-[12px] font-medium text-[#344054]">Explanation</label>
              {mode === "user" ? (
                <textarea
                  value={explanation}
                  disabled={isSavingFinancial}
                  onChange={(event) => setDraftValues((current) => ({ ...current, [explanationField.path]: event.target.value }))}
                  placeholder="Provide a brief explanation of your source of funds..."
                  className="min-h-[78px] w-full resize-none rounded-[6px] border border-[#D4D4D8] bg-white px-4 py-3 text-[13px] text-[#101828] outline-none placeholder:text-[#A1A1AA] focus:border-[#E65E02] focus:ring-2 focus:ring-[#E65E02]/10 disabled:cursor-wait disabled:opacity-70"
                />
              ) : (
                <div className="min-h-[78px] rounded-[6px] border border-[#D4D4D8] bg-white px-4 py-3 text-[13px] text-[#101828]">
                  {explanation || "Not provided"}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="-mx-4 -mb-4 sm:-mx-6 sm:-mb-5 flex w-[calc(100%+32px)] sm:w-[calc(100%+48px)] flex-col sm:flex-row sm:justify-end gap-3 border-t border-[#C3C6CE] bg-[#F5F5F5] px-4 py-4 sm:px-6 sm:py-6">
          {mode === "admin" && hasFinancialValue ? (
            <>
              {combinedStatus !== "declined" ? (
                <button
                  type="button"
                  disabled={isSavingFinancial}
                  onClick={() => void reviewFinancialInfo("declined")}
                  className="rounded-[8px] border border-[#D4D4D8] px-6 py-2.5 text-[14px] font-semibold text-[#3F3F46] disabled:cursor-wait disabled:opacity-60"
                >
                  Decline
                </button>
              ) : null}
              {combinedStatus !== "approved" ? (
                <button
                  type="button"
                  disabled={isSavingFinancial}
                  onClick={() => void reviewFinancialInfo("approved")}
                  className="rounded-[8px] bg-[#E65E02] px-6 py-2.5 text-[14px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:cursor-wait disabled:opacity-60"
                >
                  Approve
                </button>
              ) : null}
            </>
          ) : null}
          {mode === "user" ? (
            <button
              type="button"
              disabled={isSavingFinancial || !hasFinancialChange}
              onClick={() => void updateFinancialInfo()}
              className="rounded-[8px] bg-[#E65E02] px-6 py-2.5 text-[14px] font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSavingFinancial ? "Updating..." : "Update"}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  function renderDeclarationCheckbox(field: FieldDescriptor) {
    const review = getFieldReview(currentKyc, field);
    const draftBooleanValue = draftValues[field.path];
    const checked = typeof draftBooleanValue === "boolean" ? draftBooleanValue : Boolean(review.value);
    const isSaving = savingPath === field.path || savingPath.startsWith(`${field.path}:`);
    const label = declarationTextByPath[field.path] ?? field.label;

    return (
      <label key={field.path} className="flex w-full items-center gap-3 text-[14px] font-medium leading-5 text-[#3F3F46]">
        <input
          type="checkbox"
          checked={checked}
          disabled={mode !== "user" || isSaving}
          onChange={(event) => {
            if (mode !== "user") {
              return;
            }

            const nextChecked = event.target.checked;
            setDraftValues((current) => ({ ...current, [field.path]: nextChecked }));
            void (async () => {
              const didSave = await updateField(field, { value: nextChecked });

              if (!didSave) {
                setDraftValues((current) => {
                  const next = { ...current };
                  delete next[field.path];
                  return next;
                });
              }
            })();
          }}
          className="h-[16px] w-[16px] shrink-0 accent-[#9CC9F5] disabled:cursor-default"
        />
        <span className="flex min-h-5 flex-1 items-center">{isSaving ? "Saving..." : label}</span>
      </label>
    );
  }

  function renderDeclarationsTab() {
    return (
      <div className="mx-auto flex w-full max-w-[830px] flex-col items-start gap-8 py-8">
        <div className="flex w-full flex-col items-start gap-2">
          <h3 className="flex min-h-7 w-full items-center text-[20px] font-semibold leading-7 text-[#17324E]">Step 8: Declarations</h3>
          <p className="flex min-h-5 w-full items-center text-[14px] font-normal leading-5 text-[#71717B]">Please review and agree to the following terms</p>
        </div>

        <div className="flex w-full flex-col items-start gap-8">
          {declarationFieldGroups.map((group, index) => (
            <div key={index} className="flex w-full flex-col items-start gap-6 rounded-[12px] bg-[#FAFAFA] p-5">
              <p className="flex min-h-6 w-full items-center text-[16px] font-medium leading-6 text-[#17324E]">AML &amp; Compliance</p>
              <div className="flex w-full flex-col items-start gap-3">
                {group.map((field) => renderDeclarationCheckbox(field))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderExtraDocumentField(field: FieldDescriptor, index: number) {
    const review = getFieldReview(currentKyc, field);
    const hasValue = isPresent(review.value);
    const selectedFile = selectedFiles[field.path];
    const isSaving = savingPath === field.path || savingPath.startsWith(`${field.path}:`);
    const selectedFileMatchesExisting = selectedFile ? isSameUploadedFile(review.value, selectedFile) : false;
    const inputId = `extra-document-${index}-${field.uploadKey ?? field.path.replace(/\W/g, "-")}`;
    const isWide = index === extraDocumentFields.length - 1;

    return (
      <div key={field.path} className={isWide ? "md:col-span-2" : undefined}>
        <div className="relative flex min-h-[148px] w-full flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[#D4D4D8] bg-[#FAFAFA] p-6 text-center">
          <label
            htmlFor={mode === "user" && !isSaving ? inputId : undefined}
            className={`flex w-full flex-col items-center ${mode === "user" && !isSaving ? "cursor-pointer" : "cursor-default"}`}
          >
            <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#E4E4E7] text-[#141B34]">
              <UploadIcon />
            </span>
            <span className="text-[14px] font-medium leading-5 text-[#52525C]">{field.label}</span>
            {mode === "user" ? (
              <span className="mt-1 text-[12px] font-normal leading-4 text-[#71717B]">
                or <span className="text-[#E65E02]">browse files</span>
              </span>
            ) : null}
          </label>

          {hasValue && typeof review.value === "string" ? (
            <div className="mt-3 w-full max-w-[360px] space-y-2">
              <div className="flex items-center justify-center gap-2">
                <StatusPill status={review.status} />
                {mode === "user" ? (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void clearField(field)}
                    className="text-[11px] font-semibold text-[#B42318] disabled:cursor-wait disabled:opacity-60"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <FileChip canDelete={false} url={review.value} />
            </div>
          ) : null}

          {selectedFile ? (
            <div className="mt-3 w-full max-w-[360px] space-y-3">
              <SelectedFilePreview file={selectedFile} />
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setSelectedFiles((current) => {
                      const next = { ...current };
                      delete next[field.path];
                      return next;
                    });
                  }}
                  className="rounded-[6px] border border-[#D4D4D8] px-3 py-1.5 text-[12px] font-semibold text-[#3F3F46] disabled:cursor-wait disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving || selectedFileMatchesExisting}
                  onClick={() => void updateField(field, { file: selectedFile })}
                  className="rounded-[6px] bg-[#E65E02] px-3 py-1.5 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Uploading..." : selectedFileMatchesExisting ? "Already uploaded" : "Upload"}
                </button>
              </div>
            </div>
          ) : null}

          {mode === "user" ? (
            <input
              id={inputId}
              type="file"
              accept="image/*,video/*,.pdf,application/pdf"
              className="sr-only"
              disabled={isSaving}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setSelectedFiles((current) => ({ ...current, [field.path]: file }));
                }
                event.target.value = "";
              }}
            />
          ) : null}
        </div>
      </div>
    );
  }

  function renderExtraDocumentsTab() {
    return (
      <div className="flex w-full max-w-[830px] flex-col items-start gap-8 py-8">
        <div className="flex w-full flex-col items-start gap-2">
          <h3 className="flex min-h-7 w-full items-center text-[20px] font-semibold leading-7 text-[#17324E]">Additional Documents</h3>
          <p className="flex min-h-5 w-full items-center text-[14px] font-normal leading-5 text-[#71717B]">Upload any supporting documents (Optional)</p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          {extraDocumentFields.map((field, index) => renderExtraDocumentField(field, index))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-center gap-2">
        {sectionTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
              activeTab === tab
                ? "border-[#243B5A] bg-[#243B5A] text-white"
                : "border-[#243B5A] bg-white text-[#243B5A] hover:bg-[#F8FAFC]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="mx-auto w-full max-w-[896px] overflow-hidden rounded-[8px] border border-[#D7DEE8] bg-white shadow-[0_8px_28px_rgba(16,24,40,0.08)]">
        <header className="border-b border-[#E4E7EC] px-4 py-4 sm:px-6 sm:py-6 text-center">
          <h2 className="text-[20px] sm:text-[22px] font-semibold text-[#243B5A]">KYC Verification</h2>
          <p className="mt-1 text-[11px] text-[#667085]">Complete your profile to unlock secure business opportunities.</p>
        </header>

        <div className="space-y-5 px-4 py-4 sm:px-6 sm:py-5">
          {activeTab === "Declarations" ? (
            renderDeclarationsTab()
          ) : activeTab === "Extra documents" ? (
            renderExtraDocumentsTab()
          ) : activeTab === "Financial info" ? (
            renderFinancialInfoTab()
          ) : activeTab === "Investor profile" ? (
            renderInvestorProfileTab()
          ) : activeTab === "PEP & Sanctions" ? (
            renderPepSanctionsTab()
          ) : activeTab === "Beneficial owners" ? (
            renderBeneficialOwnersTab()
          ) : activeTab === "Application info" ? (
            renderApplicantInfoTab()
          ) : (
            <>
              <h3 className="text-[15px] font-semibold text-[#243B5A]">{activeTab}</h3>
              {activeTab === "Extra documents" && mode === "user" ? (
                <p className="text-[12px] text-[#667085]">
                  Add supporting documents here. Uploaded files are sent to superadmin for approval.
                </p>
              ) : null}
              {!hasOwners ? <p className="text-[12px] text-[#667085]">No beneficial owners were submitted.</p> : null}
              {!hasExtraDocuments ? <p className="text-[12px] text-[#667085]">No extra documents were submitted.</p> : null}

              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map((field) => {
              const review = getFieldReview(currentKyc, field);
              const rawValue = draftValues[field.path] ?? formatValue(review.value);
              const isFile = field.type === "file";
              const isBoolean = field.type === "boolean";
              const isSaving = savingPath === field.path || savingPath.startsWith(`${field.path}:`);
              const hasValue = isPresent(review.value);
              const selectedFile = selectedFiles[field.path];
              const draftBooleanValue = draftValues[field.path];
              const checkboxChecked = typeof draftBooleanValue === "boolean" ? draftBooleanValue : Boolean(review.value);
              const hasDraftValue = Object.prototype.hasOwnProperty.call(draftValues, field.path);
              const hasFieldChange = hasDraftValue && !isSameFieldValue(field, review.value, draftValues[field.path]);
              const selectedFileMatchesExisting = selectedFile ? isSameUploadedFile(review.value, selectedFile) : false;

              return (
                <div key={field.path} className={isFile || field.label.length > 42 ? "sm:col-span-2" : undefined}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="text-[11px] font-medium text-[#101828]">{field.label}</label>
                    {!isBoolean && hasValue ? <StatusPill status={review.status} /> : null}
                  </div>

                  {isFile ? (
                    <div className="rounded-[8px] border border-dashed border-[#D0D5DD] bg-[#FCFCFD] p-3">
                      {typeof review.value === "string" && review.value ? (
                        <FileChip canDelete={mode === "user"} url={review.value} onDelete={() => clearField(field)} />
                      ) : (
                        <p className="rounded-[8px] bg-[#F2F4F7] px-3 py-2 text-[11px] text-[#98A2B3]">Not submitted</p>
                      )}
                      {selectedFile ? (
                        <div className="mt-3 space-y-3">
                          <SelectedFilePreview file={selectedFile} />
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => {
                                setSelectedFiles((current) => {
                                  const next = { ...current };
                                  delete next[field.path];
                                  return next;
                                });
                              }}
                              className="rounded-[5px] border border-[#D0D5DD] px-3 py-1.5 text-[10px] font-semibold text-[#344054] disabled:cursor-wait disabled:opacity-60"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={isSaving || selectedFileMatchesExisting}
                              onClick={() => void updateField(field, { file: selectedFile })}
                              className="rounded-[5px] bg-[#F97316] px-3 py-1.5 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isSaving ? "Uploading..." : selectedFileMatchesExisting ? "Already uploaded" : "Upload"}
                            </button>
                          </div>
                        </div>
                      ) : null}
                      {mode === "user" ? (
                        <input
                          type="file"
                          accept="image/*,video/*,.pdf,application/pdf"
                          className="mt-3 block w-full text-[11px] text-[#667085] file:mr-3 file:rounded-[6px] file:border-0 file:bg-[#243B5A] file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-white"
                          disabled={isSaving}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              setSelectedFiles((current) => ({ ...current, [field.path]: file }));
                            }
                            event.target.value = "";
                          }}
                        />
                      ) : null}
                    </div>
                  ) : field.type === "boolean" ? (
                    mode === "user" ? (
                      <label className="flex h-9 items-center gap-2 rounded-[6px] border border-[#D7DEE8] px-3 text-[12px] text-[#101828]">
                        <input
                          type="checkbox"
                          checked={checkboxChecked}
                          disabled={isSaving}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setDraftValues((current) => ({ ...current, [field.path]: checked }));
                            void (async () => {
                              const didSave = await updateField(field, { value: checked });

                              if (!didSave) {
                                setDraftValues((current) => {
                                  const next = { ...current };
                                  delete next[field.path];
                                  return next;
                                });
                              }
                            })();
                          }}
                          className="h-3.5 w-3.5 accent-[#F97316]"
                        />
                        {isSaving ? "Saving..." : checkboxChecked ? "Enabled" : "Disabled"}
                      </label>
                    ) : (
                      <div className="h-9 rounded-[6px] border border-[#D7DEE8] px-3 py-2 text-[12px] text-[#101828]">
                        {formatValue(review.value) || "Not provided"}
                      </div>
                    )
                  ) : mode === "user" ? (
                    <input
                      type="text"
                      value={String(rawValue)}
                      onChange={(event) => setDraftValues((current) => ({ ...current, [field.path]: event.target.value }))}
                      placeholder="Not provided"
                      className="h-9 w-full rounded-[6px] border border-[#D7DEE8] px-3 text-[12px] text-[#101828] outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10"
                    />
                  ) : (
                    <div className="min-h-9 rounded-[6px] border border-[#D7DEE8] px-3 py-2 text-[12px] text-[#101828]">
                      {formatValue(review.value) || "Not provided"}
                    </div>
                  )}

                  {!isBoolean && hasValue && review.status === "declined" && review.declineReason ? (
                    <p className="mt-1 text-[11px] text-[#B42318]">{review.declineReason}</p>
                  ) : null}

                  {mode === "admin" && hasValue && !isBoolean ? (
                    <div className="mt-2 flex justify-end gap-2">
                      {review.status !== "declined" ? (
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => void reviewField(field.path, "declined")}
                          className="rounded-[5px] border border-[#D0D5DD] px-2.5 py-1 text-[10px] font-semibold text-[#344054] disabled:cursor-wait disabled:opacity-60"
                        >
                          Decline
                        </button>
                      ) : null}
                      {review.status !== "approved" ? (
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => void reviewField(field.path, "approved")}
                          className="rounded-[5px] bg-[#243B5A] px-2.5 py-1 text-[10px] font-semibold text-white disabled:cursor-wait disabled:opacity-60"
                        >
                          Approve
                        </button>
                      ) : null}
                    </div>
                  ) : null}

                  {mode === "user" && !isFile && !isBoolean ? (
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        disabled={isSaving || !hasFieldChange}
                        onClick={() => void updateField(field)}
                        className="rounded-[5px] bg-[#F97316] px-3 py-1.5 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSaving ? "Updating..." : "Update"}
                      </button>
                    </div>
                  ) : null}
                </div>
              );
                })}
              </div>
            </>
          )}

          {error ? <p className="rounded-[6px] border border-[#FDA29B] bg-[#FFFBFA] px-3 py-2 text-[12px] text-[#B42318]">{error}</p> : null}
        </div>
      </section>
    </div>
  );
}
