"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SuperadminDotsButton } from "./shell";

function SuperadminRowActionMenu({
  viewHref,
}: {
  viewHref: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <SuperadminDotsButton onClick={() => setOpen((current) => !current)} />

      {open ? (
        <div
          className="absolute right-0 top-9 z-20 min-w-[132px] overflow-hidden rounded-[2px] border border-[#E7EAF1] bg-white shadow-[0_16px_32px_-18px_rgba(15,23,42,0.35)]"
          role="menu"
        >
          <Link
            href={viewHref}
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-[14px] text-[#202350] transition hover:bg-[#F7F8FC]"
          >
            View
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="block w-full border-t border-[#EEF1F6] px-4 py-3 text-left text-[14px] text-[#202350] transition hover:bg-[#F7F8FC]"
          >
            Suspend
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function SuperadminUserActionMenu({
  slug,
}: {
  slug: string;
}) {
  return <SuperadminRowActionMenu viewHref={`/superadmin/dashboard/user-management/${slug}`} />;
}

export function SuperadminPaymentActionMenu({
  slug,
}: {
  slug: string;
}) {
  return <SuperadminRowActionMenu viewHref={`/superadmin/dashboard/payment-management/${slug}`} />;
}
