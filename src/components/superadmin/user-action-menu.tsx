"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SuperadminDotsButton } from "./shell";

const MENU_EDGE_GAP = 8;
const MENU_OFFSET = 6;
const MENU_WIDTH = 132;

function SuperadminRowActionMenu({
  showSuspend = true,
  viewHref,
}: {
  showSuspend?: boolean;
  viewHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const updateMenuPosition = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const menuHeight = showSuspend ? 94 : 47;
    const left = Math.max(MENU_EDGE_GAP, Math.min(window.innerWidth - MENU_WIDTH - MENU_EDGE_GAP, rect.right - MENU_WIDTH));
    const preferredTop = rect.bottom + MENU_OFFSET;
    const top =
      preferredTop + menuHeight > window.innerHeight - MENU_EDGE_GAP
        ? Math.max(MENU_EDGE_GAP, rect.top - menuHeight - MENU_OFFSET)
        : preferredTop;

    setMenuPosition({ left, top });
  }, [showSuspend]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (!containerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const handlePositionUpdate = () => updateMenuPosition();

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handlePositionUpdate);
    window.addEventListener("scroll", handlePositionUpdate, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handlePositionUpdate);
      window.removeEventListener("scroll", handlePositionUpdate, true);
    };
  }, [open, updateMenuPosition]);

  const menu = open && menuPosition && typeof document !== "undefined" ? createPortal(
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[132px] overflow-hidden rounded-[2px] border border-[#E7EAF1] bg-white shadow-[0_16px_32px_-18px_rgba(15,23,42,0.35)]"
      style={{ left: menuPosition.left, top: menuPosition.top }}
      role="menu"
    >
      <Link
        href={viewHref}
        onClick={() => setOpen(false)}
        className="block px-4 py-3 text-[14px] text-[#202350] transition hover:bg-[#F7F8FC]"
      >
        View
      </Link>
      {showSuspend ? (
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="block w-full border-t border-[#EEF1F6] px-4 py-3 text-left text-[14px] text-[#202350] transition hover:bg-[#F7F8FC]"
        >
          Suspend
        </button>
      ) : null}
    </div>,
    document.body,
  ) : null;

  return (
    <div ref={containerRef} className="relative">
      <SuperadminDotsButton
        onClick={() => {
          if (!open) {
            updateMenuPosition();
          }

          setOpen((current) => !current);
        }}
      />

      {menu}
    </div>
  );
}

export function SuperadminUserActionMenu({
  slug,
}: {
  slug: string;
}) {
  return <SuperadminRowActionMenu showSuspend={false} viewHref={`/superadmin/dashboard/user-management/${slug}`} />;
}

export function SuperadminPaymentActionMenu({
  slug,
}: {
  slug: string;
}) {
  return <SuperadminRowActionMenu viewHref={`/superadmin/dashboard/payment-management/${slug}`} />;
}
