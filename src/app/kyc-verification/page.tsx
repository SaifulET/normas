import { KycVerificationPage } from "@/components/auth/kyc-verification-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ kycId?: string; role?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const role = resolvedSearchParams.role === "investee" ? "investee" : "investor";

  return <KycVerificationPage initialKycId={resolvedSearchParams.kycId} role={role} />;
}
