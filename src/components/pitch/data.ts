export interface PitchSummary {
  slug: string;
  title: string;
  shortTitle: string;
  location: string;
  views: number;
  stage: string;
  sector: string;
  target: string;
  description: string;
  image: string;
}

export interface PitchDetail extends PitchSummary {
  equipmentTitle: string;
  overview: string;
  keyComponents: string[];
  benefits: string[];
  closing: string;
  additionalDetails: Array<{ label: string; value: string }>;
  relatedSlugs: string[];
}

export const pitchDetails: PitchDetail[] = [
  {
    slug: "carbonledger-ai",
    title: "CarbonLedger AI Project for windmill",
    shortTitle: "CarbonLedger AI",
    location: "United Kingdom",
    views: 412,
    stage: "Series A",
    sector: "Climate Tech",
    target: "\u00A34.0M",
    description: "AI-powered carbon accounting for SMEs at enterprise accuracy",
    image: "/howitwork.png",
    equipmentTitle: "Equipment Details",
    overview:
      "AI Project Overview for Windmill Optimization. This project focuses on leveraging artificial intelligence to enhance the efficiency and performance of windmills. By integrating AI-driven analytics and predictive maintenance, the system aims to optimize energy output while reducing downtime and operational costs.",
    keyComponents: [
      "Data Collection: Sensors installed on windmills gather real-time data on wind speed, blade angle, temperature, and vibration.",
      "Predictive Analytics: Machine learning models analyze the data to forecast maintenance needs, preventing unexpected failures.",
      "Performance Optimization: AI algorithms adjust blade pitch and rotation speed dynamically to maximize energy output based on current wind conditions.",
      "Energy Forecasting: The system predicts energy production trends to aid in grid management and resource planning.",
    ],
    benefits: [
      "Increased energy efficiency and output.",
      "Reduced maintenance costs and downtime.",
      "Extended lifespan of windmill components.",
      "Enhanced decision-making through data-driven insights.",
    ],
    closing:
      "Implementation involves collaboration between AI specialists, mechanical engineers, and energy experts to ensure seamless integration and continuous improvement. This project represents a significant step towards sustainable and smart renewable energy solutions.",
    additionalDetails: [
      { label: "Asking Price", value: "$45,000" },
      { label: "Condition", value: "Used" },
      { label: "Manufacturer", value: "Doson" },
      { label: "Model", value: "DN Solutions Lynx 2100A" },
      { label: "Shipping Available", value: "Yes" },
    ],
    relatedSlugs: ["solarroot-systems", "harvest-loop", "fairflow-pay", "mobility-mosaic"],
  },
  {
    slug: "solarroot-systems",
    title: "SolarRoot Systems Grid Financing Suite",
    shortTitle: "SolarRoot Systems",
    location: "United Kingdom",
    views: 287,
    stage: "Seed",
    sector: "Clean Energy",
    target: "\u00A32.5M",
    description: "Distributed solar infrastructure financing for industrial estates",
    image: "/howitwork.png",
    equipmentTitle: "Platform Details",
    overview:
      "SolarRoot Systems enables industrial estates to access distributed solar deployment through blended financing and real-time asset visibility.",
    keyComponents: [
      "Financing workflows for solar deployment across multi-site operators.",
      "Real-time performance tracking on all installed systems.",
      "Yield forecasting to improve long-term project planning.",
      "Investor reporting designed for cross-border clean-energy portfolios.",
    ],
    benefits: [
      "Faster access to renewable infrastructure.",
      "Clearer reporting for investors and operators.",
      "Reduced capital friction for industrial retrofits.",
    ],
    closing:
      "The product is designed to make energy-transition funding more transparent, measurable, and institution-ready.",
    additionalDetails: [
      { label: "Deployment Stage", value: "Pilot" },
      { label: "Market", value: "Industrial Solar" },
      { label: "Region", value: "United Kingdom" },
      { label: "Revenue Model", value: "Subscription + Success Fees" },
      { label: "Investor Access", value: "Open" },
    ],
    relatedSlugs: ["carbonledger-ai", "fairflow-pay", "mobility-mosaic", "carebridge-health"],
  },
  {
    slug: "harvest-loop",
    title: "Harvest Loop Climate Supply Network",
    shortTitle: "Harvest Loop",
    location: "Kenya",
    views: 199,
    stage: "Seed",
    sector: "Sustainable Agriculture",
    target: "\u00A31.8M",
    description: "Climate-smart supply tools connecting growers to fair-value buyers",
    image: "/howitwork.png",
    equipmentTitle: "Network Details",
    overview:
      "Harvest Loop equips growers and buyers with a structured, climate-smart supply network that improves traceability and pricing confidence.",
    keyComponents: [
      "Farmer onboarding and verification workflows.",
      "Demand-side matching for buyers seeking reliable supply.",
      "Climate intelligence for harvest planning and logistics.",
      "Transparency tooling for impact and purchasing teams.",
    ],
    benefits: [
      "More resilient supply chains.",
      "Better pricing clarity for producers.",
      "Improved traceability across the network.",
    ],
    closing:
      "The platform is designed to reduce waste, improve grower stability, and create stronger purchasing confidence across agriculture markets.",
    additionalDetails: [
      { label: "Primary Users", value: "Growers & Buyers" },
      { label: "Region", value: "Kenya" },
      { label: "Model", value: "B2B Marketplace" },
      { label: "Data Layer", value: "Climate + Logistics" },
      { label: "Pilot Status", value: "Live" },
    ],
    relatedSlugs: ["carbonledger-ai", "solarroot-systems", "carebridge-health", "mobility-mosaic"],
  },
  {
    slug: "carebridge-health",
    title: "CareBridge Health Diagnostics Workflow",
    shortTitle: "CareBridge Health",
    location: "United Kingdom",
    views: 354,
    stage: "Growth",
    sector: "Healthcare",
    target: "\u00A35.2M",
    description: "Accessible diagnostics workflow for underserved community clinics",
    image: "/howitwork.png",
    equipmentTitle: "Operational Details",
    overview:
      "CareBridge Health streamlines diagnostics operations for underserved clinics, reducing friction from intake to decision support.",
    keyComponents: [
      "Patient intake orchestration and screening logic.",
      "Diagnostic workflow monitoring across clinic sites.",
      "Operational dashboards for care coordination teams.",
      "Impact analytics for health-system partners.",
    ],
    benefits: [
      "Faster clinic operations.",
      "Better accessibility to diagnostics.",
      "Higher clarity for care partners and investors.",
    ],
    closing:
      "CareBridge is built for scalable clinic environments where operational precision and access equity both matter.",
    additionalDetails: [
      { label: "Clinic Network", value: "12 Active Sites" },
      { label: "Region", value: "United Kingdom" },
      { label: "Compliance", value: "Health Data Ready" },
      { label: "Primary Users", value: "Clinics" },
      { label: "Expansion", value: "In Progress" },
    ],
    relatedSlugs: ["carbonledger-ai", "fairflow-pay", "skill-spring", "homekind-developments"],
  },
  {
    slug: "skill-spring",
    title: "SkillSpring Green Workforce Platform",
    shortTitle: "SkillSpring",
    location: "Nigeria",
    views: 146,
    stage: "Pre-seed",
    sector: "EdTech",
    target: "\u00A31.1M",
    description: "Workforce upskilling platform focused on green-economy roles",
    image: "/howitwork.png",
    equipmentTitle: "Learning Details",
    overview:
      "SkillSpring prepares workers for green-economy roles with structured learning journeys tied to market demand.",
    keyComponents: [
      "Role-based course pathways.",
      "Employer-aligned skill assessments.",
      "Certification workflows for partners.",
      "Outcomes tracking for training sponsors.",
    ],
    benefits: [
      "Better workforce readiness.",
      "Clear employer alignment.",
      "Measurable upskilling outcomes.",
    ],
    closing:
      "The platform is intended to help learners transition into high-opportunity sectors while giving employers stronger hiring signals.",
    additionalDetails: [
      { label: "Audience", value: "Learners & Employers" },
      { label: "Region", value: "Nigeria" },
      { label: "Model", value: "Subscription" },
      { label: "Delivery", value: "Digital Cohorts" },
      { label: "Certification", value: "Included" },
    ],
    relatedSlugs: ["carebridge-health", "harvest-loop", "fairflow-pay", "homekind-developments"],
  },
  {
    slug: "fairflow-pay",
    title: "FairFlow Pay Ethical Transfer Rail",
    shortTitle: "FairFlow Pay",
    location: "United Kingdom",
    views: 441,
    stage: "Series A",
    sector: "FinTech",
    target: "\u00A33.1M",
    description: "Ethical fintech rails helping migrant workers access lower-cost transfers",
    image: "/howitwork.png",
    equipmentTitle: "Transaction Details",
    overview:
      "FairFlow Pay provides a more equitable financial transfer rail for workers who are underserved by traditional remittance products.",
    keyComponents: [
      "Lower-cost transfer infrastructure.",
      "Compliance-aware onboarding and verification.",
      "Cross-border treasury visibility.",
      "Partner tools for payroll and worker support.",
    ],
    benefits: [
      "Improved affordability.",
      "Stronger payment visibility.",
      "More inclusive financial access.",
    ],
    closing:
      "The product is designed to combine fairness, compliance, and usability for users moving money across borders.",
    additionalDetails: [
      { label: "Primary Use Case", value: "Cross-Border Transfers" },
      { label: "Region", value: "United Kingdom" },
      { label: "Compliance", value: "KYC Ready" },
      { label: "Model", value: "Transaction Fees" },
      { label: "Status", value: "Scaling" },
    ],
    relatedSlugs: ["carbonledger-ai", "solarroot-systems", "carebridge-health", "mobility-mosaic"],
  },
  {
    slug: "homekind-developments",
    title: "HomeKind Affordable Modular Housing",
    shortTitle: "HomeKind Developments",
    location: "South Africa",
    views: 228,
    stage: "Growth",
    sector: "Affordable Housing",
    target: "\u00A34.8M",
    description: "Affordable modular housing systems designed for fast urban deployment",
    image: "/howitwork.png",
    equipmentTitle: "Housing Details",
    overview:
      "HomeKind Developments accelerates urban housing delivery through modular systems designed for cost efficiency and speed.",
    keyComponents: [
      "Modular construction planning.",
      "Deployment coordination for urban projects.",
      "Supply-chain visibility and scheduling.",
      "Project dashboards for funding partners.",
    ],
    benefits: [
      "Faster housing deployment.",
      "Improved affordability.",
      "Clearer visibility into delivery milestones.",
    ],
    closing:
      "HomeKind is structured to serve cities and partners seeking dependable housing rollouts with stronger capital efficiency.",
    additionalDetails: [
      { label: "Market", value: "Affordable Housing" },
      { label: "Region", value: "South Africa" },
      { label: "Build Model", value: "Modular" },
      { label: "Delivery Focus", value: "Urban" },
      { label: "Pipeline", value: "Growing" },
    ],
    relatedSlugs: ["carebridge-health", "mobility-mosaic", "harvest-loop", "skill-spring"],
  },
  {
    slug: "mobility-mosaic",
    title: "Mobility Mosaic Fleet Intelligence",
    shortTitle: "Mobility Mosaic",
    location: "United Kingdom",
    views: 176,
    stage: "Seed",
    sector: "Mobility",
    target: "\u00A32.2M",
    description: "Shared electric fleet software for community-first transport networks",
    image: "/howitwork.png",
    equipmentTitle: "Fleet Details",
    overview:
      "Mobility Mosaic helps community-first transport operators manage shared electric fleets with better scheduling and operating visibility.",
    keyComponents: [
      "Fleet monitoring and dispatch controls.",
      "Charging and utilization analytics.",
      "Operator reporting for public-interest networks.",
      "Community access planning dashboards.",
    ],
    benefits: [
      "Improved fleet utilization.",
      "Better route and charging visibility.",
      "Stronger community transport planning.",
    ],
    closing:
      "The platform is built for transport models where service quality, sustainability, and operational discipline all matter.",
    additionalDetails: [
      { label: "Fleet Type", value: "Shared Electric" },
      { label: "Region", value: "United Kingdom" },
      { label: "Model", value: "SaaS" },
      { label: "Customers", value: "Operators" },
      { label: "Deployment", value: "Expanding" },
    ],
    relatedSlugs: ["carbonledger-ai", "solarroot-systems", "fairflow-pay", "homekind-developments"],
  },
];

export function getPitchBySlug(slug: string) {
  return pitchDetails.find((item) => item.slug === slug);
}

export function getRelatedPitches(slug: string) {
  const pitch = getPitchBySlug(slug);
  if (!pitch) return [];

  return pitch.relatedSlugs
    .map((relatedSlug) => getPitchBySlug(relatedSlug))
    .filter((item): item is PitchDetail => Boolean(item));
}

export function getPitchSlugs() {
  return pitchDetails.map((item) => item.slug);
}
