import { LegalPage } from "@/components/legal/legal-page";

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    paragraphs: [
      "Welcome to EARLY-N. By accessing or using our platform, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, you must not access or use our services.",
      "These terms constitute a legally binding agreement between you and EARLY-N and govern how our platform, workflows, and investor-founder interactions may be used.",
    ],
  },
  {
    id: "account-terms",
    title: "Account Terms",
    paragraphs: [
      "You are responsible for maintaining the accuracy of your account information and for ensuring that your use of the platform complies with applicable laws, verification requirements, and internal platform rules.",
      "You are also responsible for activity conducted through your account and for safeguarding access credentials, uploaded materials, and internal communications.",
    ],
  },
  {
    id: "how-to-buy",
    title: "How to Buy?",
    paragraphs: [
      "Investors may browse approved listings, review pitch materials, and engage founders through the tools made available on the platform. Any deal progression remains subject to independent review, due diligence, and formal closing procedures.",
      "EARLY-N facilitates structured introductions and secure communication, but final investment decisions remain the responsibility of the parties involved.",
    ],
  },
  {
    id: "prohibited-uses",
    title: "Prohibited Uses",
    paragraphs: [
      "You may not use the platform to misrepresent identity, upload misleading information, circumvent verification controls, harvest personal data, or interfere with the secure operation of EARLY-N.",
      "Any misuse of platform systems, communications, or restricted materials may result in suspension, removal, or further legal action where appropriate.",
    ],
  },
  {
    id: "termination",
    title: "Termination",
    paragraphs: [
      "We may suspend or terminate access where we believe an account presents security concerns, regulatory risk, misrepresentation, abuse of access, or repeated non-compliance with our operating rules.",
      "Termination does not remove obligations that reasonably survive account closure, including payment, confidentiality, audit, or compliance-related duties.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing Law",
    paragraphs: [
      "These Terms and Conditions are governed by the laws applicable to the EARLY-N operating entity, together with any mandatory regulations that apply in the relevant jurisdiction.",
      "Any disputes relating to these terms, unless otherwise required by law, will be handled in accordance with the dispute procedures and governing legal framework described by EARLY-N.",
    ],
  },
] as const;

export default function Page() {
  return (
    <LegalPage
      title="Terms and Conditions"
      description="Please read these enterprise service terms carefully before using the EARLY-N platform. These terms govern your access to and use of our enterprise infrastructure and services."
      sections={[...sections]}
    />
  );
}
