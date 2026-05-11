"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { clearStoredUserSession } from "@/lib/auth-storage";
import { useAuthStore } from "@/store";

export function LogoutButton({
  children,
  className,
  redirectHref,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  redirectHref: string;
  title?: string;
}) {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await apiRequest({
        method: "POST",
        url: "auth/logout",
      });
    } catch {
      // A failed remote logout should not keep this browser signed in.
    } finally {
      await fetch("/api/auth/logout", {
        method: "POST",
      }).catch(() => undefined);

      clearAuth();
      await clearStoredUserSession();
      router.push(redirectHref);
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      disabled={isLoggingOut}
      onClick={handleLogout}
      className={className}
      title={title}
    >
      {children}
    </button>
  );
}
