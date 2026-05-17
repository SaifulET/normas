import { getLegalPageContent, LegalPage } from "@/components/legal/legal-page";

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    paragraphs: [
      "Welcome to EARLY-N. This Privacy Policy explains how we collect, use, protect, and manage the information shared through our platform and related services.",
      "By accessing or using EARLY-N, you agree that your information may be handled in accordance with this policy and the safeguards described throughout this document.",
    ],
  },
  {
    id: "data-collection",
    title: "Data Collection",
    paragraphs: [
      "We collect the information required to create accounts, verify identity, review startup listings, and maintain platform security. This may include profile details, company information, uploaded documents, and communication history within the product.",
      "We may also collect technical usage information such as device details, browser type, and interaction data to improve stability, fraud prevention, and product performance.",
    ],
  },
  {
    id: "how-to-buy",
    title: "How We Use Information",
    paragraphs: [
      "Your information is used to operate the platform, process verification, support investor-founder matching, protect users from misuse, and improve platform features over time.",
      "We do not use platform data outside the scope of service delivery, legal obligations, security operations, or clearly disclosed product improvements.",
    ],
  },
  {
    id: "prohibited-uses",
    title: "Data Protection",
    paragraphs: [
      "We apply layered administrative, technical, and operational safeguards to reduce unauthorized access, misuse, or disclosure of your information.",
      "While no system can guarantee absolute security, EARLY-N is structured to keep sensitive interactions controlled, monitored, and aligned with enterprise-grade handling practices.",
    ],
  },
  {
    id: "termination",
    title: "Retention",
    paragraphs: [
      "We retain information only for as long as necessary to provide services, meet legal or regulatory obligations, resolve disputes, and maintain auditability where required.",
      "When retention is no longer justified, information is deleted, anonymized, or archived according to operational and legal requirements.",
    ],
  },
  {
    id: "governing-law",
    title: "Governing Law",
    paragraphs: [
      "This Privacy Policy is interpreted in connection with the governing laws that apply to EARLY-N’s operating entity and any local regulations that may apply to platform users.",
      "If you have questions about this policy, please contact us through the EARLY-N contact page for clarification or support.",
    ],
  },
] as const;

export default async function Page() {
  const content = await getLegalPageContent("privacy-policy", {
    title: "Privacy & Policy",
    description:
      "Please read these enterprise privacy terms carefully before using the EARLY-N platform. These terms govern your access to and use of our enterprise infrastructure and services.",
    sections,
  });

  return <LegalPage content={content} />;
}
