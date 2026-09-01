import { VerificationPage } from "@/components/certification/verification-page";

export default async function VerifyCredentialPage({ params }: { params: Promise<{ credentialId: string }> }) {
  const { credentialId } = await params;
  return <VerificationPage credentialId={credentialId} />;
}
