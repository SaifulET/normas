import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Add01Icon,
  AiChipIcon,
  AiLockIcon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BalanceScaleIcon,
  BankIcon,
  Bookmark01Icon,
  Car01Icon,
  Cancel01Icon,
  ChartUpIcon,
  CheckmarkCircle01Icon,
  CoinsPoundIcon,
  Facebook02Icon,
  FactoryIcon,
  FlashIcon,
  GlobeIcon,
  HandHelpingIcon,
  HeartCheckIcon,
  Home01Icon,
  InstagramIcon,
  Leaf01Icon,
  MailSend01Icon,
  MapPinIcon,
  NewTwitterIcon,
  PackageIcon,
  SchoolIcon,
  Search01Icon,
  Shield01Icon,
  ShieldUserIcon,
  StarIcon,
  TiktokIcon,
  TractorIcon,
  UserGroupIcon,
  ViewIcon,
  WhatsappIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";
import type { IconName } from "./types";

const iconMap: Record<IconName, IconSvgElement> = {
  add: Add01Icon,
  aiChip: AiChipIcon,
  aiLock: AiLockIcon,
  balanceScale: BalanceScaleIcon,
  arrowDown: ArrowDown01Icon,
  arrowLeft: ArrowLeft01Icon,
  arrowRight: ArrowRight01Icon,
  bank: BankIcon,
  bookmark: Bookmark01Icon,
  car: Car01Icon,
  cancel01: Cancel01Icon,
  chartUp: ChartUpIcon,
  checkmarkCircle: CheckmarkCircle01Icon,
  coinsPound: CoinsPoundIcon,
  facebook: Facebook02Icon,
  factory: FactoryIcon,
  flash: FlashIcon,
  globe: GlobeIcon,
  handHelping: HandHelpingIcon,
  heartCheck: HeartCheckIcon,
  home: Home01Icon,
  instagram: InstagramIcon,
  leaf: Leaf01Icon,
  mailSend: MailSend01Icon,
  mapPin: MapPinIcon,
  package: PackageIcon,
  school: SchoolIcon,
  search: Search01Icon,
  shield: Shield01Icon,
  shieldUser: ShieldUserIcon,
  star: StarIcon,
  tiktok: TiktokIcon,
  tractor: TractorIcon,
  twitter: NewTwitterIcon,
  userGroup: UserGroupIcon,
  view: ViewIcon,
  whatsapp: WhatsappIcon,
  youtube: YoutubeIcon,
};

interface AppIconProps {
  name: IconName;
  className?: string;
  filled?: boolean;
}

export function AppIcon({ name, className, filled = true }: AppIconProps) {
  const opacityClass = name === "star" && !filled ? " opacity-55" : "";

  return (
    <HugeiconsIcon
      icon={iconMap[name]}
      className={`${className ?? ""}${opacityClass}`}
      size={24}
      strokeWidth={1.8}
      aria-hidden="true"
    />
  );
}
