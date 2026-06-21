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

function getVisibleSectionFields(tab: string, kyc: KycRecord) {
  const fields = getSectionFields(tab, kyc);

  if (tab !== "Extra documents") {
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

export function KycDataReviewCard({ kyc, mode, onChange }: KycDataReviewCardProps) {
  const [activeTab, setActiveTab] = useState(sectionTabs[0]);
  const [optimisticKyc, setOptimisticKyc] = useState<KycRecord | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, string | boolean>>({});
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
  const fields = getVisibleSectionFields(activeTab, currentKyc);
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

  async function updateField(field: FieldDescriptor, file?: File) {
    const nextValue = draftValues[field.path];
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
      const value = field.type === "array" && typeof nextValue === "string"
        ? JSON.stringify(nextValue.split(",").map((item) => item.trim()).filter(Boolean))
        : nextValue;
      formData.append(field.path, String(value ?? ""));
    }

    if (field.type === "file" && file && field.uploadKey) {
      formData.append(field.uploadKey, file, file.name);
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
      setKyc(response.data);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to update KYC field."));
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

      <section className="w-full overflow-hidden rounded-[8px] border border-[#D7DEE8] bg-white shadow-[0_8px_28px_rgba(16,24,40,0.08)]">
        <header className="border-b border-[#E4E7EC] px-6 py-6 text-center">
          <h2 className="text-[22px] font-semibold text-[#243B5A]">KYC Verification</h2>
          <p className="mt-1 text-[11px] text-[#667085]">Complete your profile to unlock secure business opportunities.</p>
        </header>

        <div className="space-y-5 px-6 py-5">
          <h3 className="text-[15px] font-semibold text-[#243B5A]">{activeTab}</h3>
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

              return (
                <div key={field.path} className={isFile || field.label.length > 42 ? "sm:col-span-2" : undefined}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="text-[11px] font-medium text-[#101828]">{field.label}</label>
                    {!isBoolean ? <StatusPill status={review.status} /> : null}
                  </div>

                  {isFile ? (
                    <div className="rounded-[8px] border border-dashed border-[#D0D5DD] bg-[#FCFCFD] p-3">
                      {typeof review.value === "string" && review.value ? (
                        <FileChip canDelete={mode === "user"} url={review.value} onDelete={() => clearField(field)} />
                      ) : (
                        <p className="rounded-[8px] bg-[#F2F4F7] px-3 py-2 text-[11px] text-[#98A2B3]">Not submitted</p>
                      )}
                      {mode === "user" ? (
                        <input
                          type="file"
                          className="mt-3 block w-full text-[11px] text-[#667085] file:mr-3 file:rounded-[6px] file:border-0 file:bg-[#F97316] file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:text-white"
                          disabled={isSaving}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void updateField(field, file);
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
                          checked={Boolean(draftValues[field.path] ?? review.value)}
                          onChange={(event) => setDraftValues((current) => ({ ...current, [field.path]: event.target.checked }))}
                          className="h-3.5 w-3.5 accent-[#F97316]"
                        />
                        Yes
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

                  {review.status === "declined" && review.declineReason ? (
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

                  {mode === "user" && !isFile ? (
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        disabled={isSaving || !Object.prototype.hasOwnProperty.call(draftValues, field.path)}
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

          {error ? <p className="rounded-[6px] border border-[#FDA29B] bg-[#FFFBFA] px-3 py-2 text-[12px] text-[#B42318]">{error}</p> : null}
        </div>
      </section>
    </div>
  );
}
