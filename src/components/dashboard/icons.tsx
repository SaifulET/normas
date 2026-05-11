import { Bookmark02FreeIcons, Bookmark02Icon, Calendar03Icon, ChatIcon, CrownIcon, Logout03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { SVGProps } from "react";

type DashboardIconName =
  | "bell"
  | "calendar"
  | "chevronDown"
  | "chevronLeft"
  | "collapse"
  | "dashboard"
  | "expand"
  | "external"
  | "logout"
  | "messages"
  | "plus"
  | "profile"
  | "query"
  | "save"
  | "schedule"
  | "settings"
  | "spark"
  | "upgrade"
  | "views"
  | "website";

function iconProps(className?: string): SVGProps<SVGSVGElement> {
  return {
    className: className ?? "h-5 w-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
}

export function DashboardIcon({
  name,
  className,
  filled = false,
}: {
  name: DashboardIconName;
  className?: string;
  filled?: boolean;
}) {
  switch (name) {
    case "bell":
      return (
        <svg {...iconProps(className)}>
          <path d="M6.5 16.5h11" />
          <path d="M8 16.5V11a4 4 0 0 1 8 0v5.5" />
          <path d="M9.5 18.5a2.5 2.5 0 0 0 5 0" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...iconProps(className)}>
          <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
          <path d="M7.5 3.5v4" />
          <path d="M16.5 3.5v4" />
          <path d="M3.5 9.5h17" />
        </svg>
      );
    case "chevronDown":
      return (
        <svg {...iconProps(className)}>
          <path d="m7 10 5 5 5-5" />
        </svg>
      );
    case "chevronLeft":
      return (
        <svg {...iconProps(className)}>
          <path d="m14.5 6.5-5 5 5 5" />
        </svg>
      );
    case "collapse":
      return (
        <svg {...iconProps(className)}>
          <rect x="4.5" y="5.5" width="15" height="13" rx="2.5" />
          <path d="M10 5.5v13" />
          <path d="m14.5 9.5-3 3 3 3" />
        </svg>
      );
    case "dashboard":
      return (
        <svg {...iconProps(className)}>
          <rect x="4.5" y="4.5" width="6" height="6" rx="1.5" />
          <rect x="13.5" y="4.5" width="6" height="6" rx="1.5" />
          <rect x="4.5" y="13.5" width="6" height="6" rx="1.5" />
          <rect x="13.5" y="13.5" width="6" height="6" rx="1.5" />
        </svg>
      );
    case "expand":
      return (
        <svg {...iconProps(className)}>
          <rect x="4.5" y="5.5" width="15" height="13" rx="2.5" />
          <path d="M14 5.5v13" />
          <path d="m9.5 9.5 3 3-3 3" />
        </svg>
      );
    case "external":
      return (
        <svg {...iconProps(className)}>
          <path d="M13 5.5h5.5V11" />
          <path d="m18.5 5.5-7 7" />
          <path d="M10.5 7.5h-2a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3v-2" />
        </svg>
      );
    case "logout":
      return (
        <HugeiconsIcon icon={Logout03Icon} className={className ?? "h-5 w-5"} />
      );
    case "messages":
      return (
        <HugeiconsIcon icon={ChatIcon} className="w-[20px] h-[20px]" />
      );
    case "plus":
      return (
        <svg {...iconProps(className)}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case "profile":
      return (
        <svg {...iconProps(className)}>
          <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
        </svg>
      );
    case "query":
      return (
        <svg {...iconProps(className)}>
          <path d="M9.2 9.8a2.8 2.8 0 1 1 4.7 2.1c-.9.8-1.9 1.5-1.9 2.8" />
          <path d="M12 17.5h.01" />
          <circle cx="12" cy="12" r="8.5" />
        </svg>
      );
    case "save":
      if (filled) {
        return (
          <svg
            className={className ?? "h-5 w-5"}
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M7 4.5h10a2 2 0 0 1 2 2v13l-7-3-7 3v-13a2 2 0 0 1 2-2Z" />
          </svg>
        );
      }

      return (
       <HugeiconsIcon icon={Bookmark02Icon} className="w-[20px] h-[20px]" />
       
      );
    case "schedule":
      return (
        <HugeiconsIcon icon={Calendar03Icon} className="w-[20px] h-[20px] " />
      );
    case "settings":
      return (
        <svg {...iconProps(className)}>
          <path d="M10.5 4.5h3l.8 2.2 2.4 1.4 2.2-.6 1.5 2.6-1.5 1.7v2.8l1.5 1.7-1.5 2.6-2.2-.6-2.4 1.4-.8 2.2h-3l-.8-2.2-2.4-1.4-2.2.6-1.5-2.6 1.5-1.7v-2.8l-1.5-1.7 1.5-2.6 2.2.6 2.4-1.4Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "spark":
      return (
        <svg {...iconProps(className)}>
          <path d="m12 4 1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6Z" />
        </svg>
      );
    case "upgrade":
      return (
        <HugeiconsIcon icon={CrownIcon} className="w-[20px] h-[20px]" />
      );
    case "views":
      return (
        <svg {...iconProps(className)}>
          <path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "website":
      return (
        <svg {...iconProps(className)}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17" />
          <path d="M12 3.5c2.4 2.5 3.5 5.3 3.5 8.5S14.4 18.5 12 20.5c-2.4-2-3.5-5.3-3.5-8.5S9.6 6 12 3.5Z" />
        </svg>
      );
    default:
      return null;
  }
}
