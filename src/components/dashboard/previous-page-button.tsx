"use client";

import { usePathname, useRouter } from "next/navigation";
import { AppIcon } from "@/components/home/icons";

export function PreviousPageButton() {
  const pathname = usePathname();
  const router = useRouter();
  const fallbackHref = pathname.startsWith("/investee-dashboard")
    ? "/investee-dashboard/created-list"
    : "/dashboard/save-list";

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[4px] bg-white text-[#141B34] transition hover:bg-[#F3F4F6]"
      aria-label="Back to previous page"
    >
      <AppIcon name="arrowLeft" className="h-6 w-6" />
    </button>
  );
}
