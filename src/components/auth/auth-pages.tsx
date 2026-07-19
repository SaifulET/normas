"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { getApiErrorMessage } from "@/lib/api";
import { clearStoredUserSession } from "@/lib/auth-storage";
import {
  forgotPassword,
  getAuthSessionFromResponse,
  getAuthUserFromResponse,
  resendPasswordOtp,
  setNewPassword,
  signinUser,
  signupUser,
  verifyPasswordOtp,
} from "@/lib/auth-api";
import { useAuthStore } from "@/store";
import { setLoginSession } from "./actions";

const PASSWORD_RESET_EMAIL_STORAGE_KEY = "earlyn_password_reset_email";

function getStoredPasswordResetEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(PASSWORD_RESET_EMAIL_STORAGE_KEY) ?? "";
}

function setStoredPasswordResetEmail(email: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(PASSWORD_RESET_EMAIL_STORAGE_KEY, email);
}

function clearStoredPasswordResetEmail() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(PASSWORD_RESET_EMAIL_STORAGE_KEY);
}

function SecurityBadge() {
  return (
    <div className="mt-8 flex items-center justify-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.24em] text-[#667085]">
      <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-[#22C55E1A] text-[#16A34A]">
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-current" aria-hidden="true">
          <path d="M6 1.1 9.8 2.4v3.1c0 2.2-1.5 4.2-3.8 5.4C3.7 9.7 2.2 7.7 2.2 5.5V2.4L6 1.1Zm0 2.1a.6.6 0 0 0-.55.36l-.74 1.72-1.88.15a.6.6 0 0 0-.34 1.05l1.42 1.23-.43 1.83a.6.6 0 0 0 .89.65L6 9.21l1.63.99a.6.6 0 0 0 .89-.65l-.43-1.83 1.42-1.23a.6.6 0 0 0-.34-1.05l-1.88-.15-.74-1.72A.6.6 0 0 0 6 3.2Z" />
        </svg>
      </span>
      <span>Secure Encryption Active</span>
    </div>
  );
}

function SubmitButton({
  className,
  idleLabel,
  isPending,
  pendingLabel,
}: {
  className?: string;
  idleLabel: string;
  isPending?: boolean;
  pendingLabel: string;
}) {
  const { pending: formPending } = useFormStatus();
  const pending = formPending || Boolean(isPending);

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex h-[44px] w-full items-center justify-center rounded-[10px] bg-[#314864] px-4 text-sm font-medium text-white transition hover:bg-[#253850] disabled:cursor-wait disabled:opacity-80 ${className ?? ""}`}
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M1.5 9s2.7-4.5 7.5-4.5S16.5 9 16.5 9s-2.7 4.5-7.5 4.5S1.5 9 1.5 9Z" />
      <circle cx="9" cy="9" r="2.25" />
      {hidden ? <path d="M3 15 15 3" /> : null}
    </svg>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
  type = "text",
  trailing,
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: string;
  trailing?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-[#1F2937]">{label}</span>
      <span className="relative block">
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          required={required}
          className="h-[40px] w-full rounded-[8px] border border-[#D3D8E0] bg-white px-3.5 text-[14px] text-[#111827] outline-none transition placeholder:text-[#8D97A5] focus:border-[#314864]"
        />
        {trailing ? <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">{trailing}</span> : null}
      </span>
    </label>
  );
}

function PasswordField({
  label = "Password",
  name = "password",
  placeholder,
  required,
}: {
  label?: string;
  name?: string;
  placeholder: string;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-[#1F2937]">{label}</span>
      <span className="relative block">
        <input
          type={visible ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          required={required}
          className="h-[40px] w-full rounded-[8px] border border-[#D3D8E0] bg-white px-3.5 pr-11 text-[14px] text-[#111827] outline-none transition placeholder:text-[#8D97A5] focus:border-[#314864]"
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute inset-y-0 right-2 inline-flex w-8 items-center justify-center rounded-md text-[#344054] transition hover:bg-[#F3F4F6] hover:text-[#111827]"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          <EyeIcon hidden={!visible} />
        </button>
      </span>
    </label>
  );
}

function AuthImageLogo() {
  return (
    <svg
      width="68"
      height="38"
      viewBox="0 0 69 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mb-6 h-[38px] w-[68px]"
      aria-label="EARLY-N"
      role="img"
    >
      <path
        d="M45.946 22.5603C45.7188 22.9577 45.3969 23.1195 44.9301 23.1535C42.3732 23.3398 42.7506 22.6425 42.7662 20.5499L42.7756 17.1092L42.7701 9.02904C42.7688 7.58896 42.8362 6.04751 42.6772 4.65322C42.5313 3.37401 44.1045 3.53271 44.8711 3.56238C45.006 3.5676 45.3613 3.56896 45.5055 3.6663C46.6406 4.69024 47.6591 5.89055 48.7298 6.99148C48.7747 7.16184 50.2724 8.66975 50.4976 8.90985L56.5162 15.2639L58.577 17.4373C58.9043 17.7855 59.3627 18.3554 59.7384 18.6062C60.1925 18.6339 61.2759 18.6674 61.7322 18.6437C61.8683 18.8021 62.0714 19.0325 62.0956 19.2439C62.1494 19.7172 62.1121 20.2447 62.1066 20.7249L62.0998 23.1298L62.107 27.1037C62.1155 28.5475 62.3033 29.6956 61.3667 30.9155C60.7629 31.7011 59.872 32.2151 58.8899 32.3446C58.1949 32.4299 56.8554 32.3946 56.1371 32.3925L51.7879 32.3923L36.4143 32.3926L14.3582 32.3922L7.46331 32.395C6.16515 32.3967 4.88039 32.42 3.57201 32.3679C1.7938 32.2971 0.303048 30.9952 0.0273873 29.2305C-0.024429 28.8989 0.0131395 28.2534 0.0134363 27.901L0.0145815 25.4269L0.0151755 17.2353L0.0138607 9.90178L0.00779692 7.77509C0.00694886 7.53511 -0.0076374 6.87823 0.0160658 6.66475C0.0732672 6.14922 0.470708 5.31146 0.806284 4.9074C1.33556 4.27019 2.28394 3.67296 3.1219 3.59741C3.70583 3.54475 4.36685 3.56603 4.95659 3.56832L7.4905 3.57061L16.1667 3.57231L25.0728 3.57248L27.7437 3.56607C28.2468 3.5637 28.7641 3.55675 29.2673 3.57464C29.5045 3.58308 29.6898 3.73855 29.8644 3.88381C29.9739 4.14596 30.0158 4.39103 30.0149 4.67548C30.012 5.60741 30.2352 6.64029 28.9601 6.6625C28.2586 6.67471 27.5405 6.66509 26.8361 6.66208L22.9006 6.65831L10.4416 6.65924C8.2635 6.65865 6.06805 6.64563 3.88994 6.67069C3.7364 6.64457 3.327 6.76176 3.24797 6.92008C2.99889 7.41907 3.07721 8.69748 3.07763 9.20164L3.0784 12.0527C3.07891 13.1972 3.01772 15.3597 3.1244 16.454C4.46268 16.4663 5.801 16.4687 7.13931 16.4612C7.7478 16.4607 8.72484 16.4312 9.2952 16.5073C9.92047 16.9018 9.79127 17.5677 9.80518 18.2131C9.81896 18.8552 9.72724 19.1705 9.15849 19.4626C8.01226 19.3933 6.72237 19.4313 5.56155 19.42C4.94912 19.414 3.59516 19.387 3.07679 19.4899L3.08832 28.71C3.34626 29.1767 3.51761 29.2499 4.04671 29.2538L42.402 29.2411L51.3626 29.2418C52.3124 29.2423 58.2187 29.3328 58.7356 29.1292C58.8191 29.0417 58.9751 28.8735 58.9819 28.7484C59.0935 26.7371 59.012 24.7015 59.0286 22.6838C58.3154 21.8539 57.2231 20.7742 56.4479 19.9614L51.5072 14.787L47.9335 11.0302C47.5989 10.6808 46.5019 9.30696 46.0631 9.32774C45.804 9.68944 46.0902 20.8929 45.946 22.5603Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50.189 0.0177755C50.6061 -0.0727229 51.0173 0.192404 51.1079 0.609572L52.2192 5.72774C52.9302 5.57646 53.6072 5.50221 54.2495 5.49141L54.6812 2.93574C54.7522 2.51483 55.1509 2.23108 55.5718 2.30196C55.9928 2.37299 56.2766 2.7716 56.2056 3.19258L55.7993 5.59883C56.6229 5.73217 57.376 5.9831 58.0581 6.32735L61.0825 2.27754C61.3379 1.93539 61.8224 1.86493 62.1646 2.12031C62.5065 2.37572 62.577 2.86028 62.3218 3.20235L59.3647 7.16231C60.1112 7.75372 60.738 8.47183 61.2427 9.2668L63.2915 7.88789C63.6456 7.64944 64.1263 7.74276 64.3647 8.09688C64.6032 8.45103 64.5089 8.93166 64.1548 9.17012L61.9644 10.6447C62.2718 11.3666 62.4926 12.1223 62.6245 12.884L67.6274 11.7502C68.0436 11.656 68.4577 11.9162 68.5522 12.3322C68.6467 12.7486 68.3856 13.1635 67.9692 13.258L62.77 14.4367C62.791 15.9908 62.4324 17.4845 61.6733 18.6652H59.6763L48.6597 7.00508C49.3743 6.65174 50.0637 6.36528 50.7271 6.14082L49.5972 0.937697C49.5066 0.520471 49.7717 0.108386 50.189 0.0177755Z"
        fill="#FD6702"
      />
      <path
        d="M14.1256 13.797C14.8654 13.6613 16.5622 13.8582 17.2561 14.1992C18.2106 14.6683 18.0362 15.6766 18.0429 16.5566C18.0533 17.9306 17.955 19.421 18.1461 20.7835C18.2143 21.2699 18.7874 20.978 19.026 21.1011C19.1659 21.2347 19.2513 21.597 19.1349 21.7671C18.687 22.1123 17.2479 22.1892 16.6752 22.101C16.0384 22.003 15.7186 21.8766 15.3197 21.3868C14.3594 22.1195 13.959 22.1996 12.7372 22.1254C12.1269 22.0884 11.5976 21.9195 11.1837 21.4397C10.7743 20.7789 10.5832 20.0192 10.7526 19.2522C11.1342 17.5253 13.1796 17.428 14.4346 16.6922C14.9982 16.3346 15.3215 15.6673 14.9505 15.0544C14.5502 14.3929 13.5613 14.4323 12.9767 14.8008C12.3775 15.1784 12.7555 16.1273 12.6762 16.6084C12.5121 16.7294 11.7506 16.4505 11.3414 16.4449C11.2338 15.8344 11.1208 15.2325 11.5591 14.702C12.1764 13.9549 13.2336 13.9013 14.1256 13.797ZM14.0244 20.9357C14.2027 21.046 14.3235 20.9949 14.5521 20.9585C14.9498 20.6112 15.0447 20.2861 15.0731 19.7393C15.1074 19.0799 15.1123 18.2985 15.077 17.6412C15.045 17.6088 15.043 17.5952 15.0092 17.5857C14.5666 17.7525 14.088 18.0813 13.8988 18.5278C13.5901 19.2562 13.6069 20.2554 14.0244 20.9357Z"
        fill="white"
      />
      <path
        d="M33.3992 14.042C33.5726 14.3509 33.7511 14.9391 33.8728 15.2871C34.1679 16.133 34.4478 16.9909 34.748 17.8355C34.7964 17.9705 34.8438 18.1189 34.9621 18.1728C35.4956 18.0898 36.305 14.5093 36.8703 14.0765C38.3255 13.6311 37.6751 14.6934 37.3923 15.3971C36.5391 17.5191 35.6677 19.6817 34.776 21.7843C34.6458 22.1346 34.5131 22.4838 34.3778 22.8322C34.0908 23.5624 33.6672 24.4338 32.9048 24.7523C32.4515 24.9339 31.9134 24.9429 31.452 24.7677C31.1768 24.6631 30.4029 24.2191 30.5977 23.8187C30.7134 23.581 31.1797 23.2812 31.4229 23.1832C31.6857 23.0774 31.7845 23.9056 32.0813 23.9625C32.1695 23.9919 32.2403 24.0373 32.3688 23.9791C32.8789 23.7486 33.1698 22.9289 33.3763 22.4416C32.9942 21.1762 32.3858 19.7727 31.9036 18.5292C31.6047 17.7579 31.34 16.9821 31.0325 16.1992C30.7883 15.5773 30.4346 14.8216 30.2593 14.1796C30.2503 14.1465 30.283 14.1266 30.3177 14.0839C30.472 14.0044 30.6545 14.0162 30.8311 14.0118C31.6458 14.0134 32.5969 13.9942 33.3992 14.042Z"
        fill="white"
      />
      <path
        d="M28.3591 11.0926C28.6895 11.0491 29.2532 11.0674 29.6267 11.0504C29.6464 11.7812 29.6585 21.7371 29.5736 21.9381C29.3131 22.0572 28.2918 22.0107 27.9527 22.0074C27.5479 22.0081 27.1432 22.0041 26.7385 21.9953C26.6637 21.5563 26.6895 20.4099 26.6898 19.9158L26.6914 16.233V13.0019C26.6911 12.5511 26.6614 11.7038 26.713 11.3007C26.9051 11.1637 28.026 11.1216 28.3591 11.0926Z"
        fill="white"
      />
      <path
        d="M19.8237 14.0355C20.7995 14.0201 21.7623 13.8611 22.6166 13.8564C22.8831 13.9955 22.7019 14.2264 22.8386 14.5211C23.1465 14.5556 23.6773 13.7495 24.3753 13.8103C24.7428 13.8353 25.1531 13.8507 25.4559 14.1193C26.0539 14.65 25.9285 16.3116 25.512 16.8769C25.3846 17.0498 23.9237 16.9601 23.5453 16.9464C23.6082 16.5394 23.979 15.5503 23.6151 15.2662C22.9648 15.2898 22.8202 16.3566 22.7871 16.8684C22.7328 17.3507 22.7843 17.8857 22.7756 18.3773C22.7621 19.1344 22.7441 19.894 22.7285 20.651C22.7222 20.9594 22.7881 21.6991 22.6927 21.941C22.5462 22.0704 20.1893 22.0027 19.8239 21.9991L19.8237 14.0355Z"
        fill="white"
      />
      <path
        d="M22.6931 21.941C22.6695 21.8713 22.6515 21.8024 22.6519 21.7269C22.6595 20.1502 22.5259 18.5445 22.6905 16.9751C22.6905 16.9751 22.7786 16.8782 22.7876 16.8684C22.7332 17.3507 22.7848 17.8857 22.7761 18.3773C22.7625 19.1344 22.7445 19.8939 22.729 20.651C22.7226 20.9594 22.7886 21.6991 22.6931 21.941Z"
        fill="white"
      />
    </svg>
  );
}

function AuthShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1280px] items-center justify-center">
        <div className="grid w-full items-center justify-center gap-10 lg:grid-cols-[690px_448px] lg:gap-[72px]">
          <section className="relative mx-auto hidden h-[685px] w-[690px] overflow-hidden rounded-[34px] lg:block">
            <Image src="/login.jpg" alt="Modern business towers" fill priority className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(69,106,157,0.34)_0%,rgba(17,42,80,0.80)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_38%)]" />
            <div className="relative flex h-full items-center px-9 py-9 text-white">
              <div className="ml-[48px] flex max-w-[360px] flex-col items-start text-left">
                <AuthImageLogo />
                <div className="mb-8 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/12 bg-[#314864]/80 px-3 py-1.5 text-[11px] font-semibold shadow-[0_10px_24px_rgba(15,23,42,0.22)] backdrop-blur-sm">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/12">
                    <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-white" aria-hidden="true">
                      <path d="M6 1.1 9.8 2.4v3.1c0 2.2-1.5 4.2-3.8 5.4C3.7 9.7 2.2 7.7 2.2 5.5V2.4L6 1.1Zm0 2.1a.6.6 0 0 0-.55.36l-.74 1.72-1.88.15a.6.6 0 0 0-.34 1.05l1.42 1.23-.43 1.83a.6.6 0 0 0 .89.65L6 9.21l1.63.99a.6.6 0 0 0 .89-.65l-.43-1.83 1.42-1.23a.6.6 0 0 0-.34-1.05l-1.88-.15-.74-1.72A.6.6 0 0 0 6 3.2Z" />
                    </svg>
                  </span>
                  <span className="text-white">Secure</span>
                  <span className="text-[#FD6702]">Global</span>
                  <span className="text-white">Market</span>
                </div>
                <h1 className="text-[32px] font-semibold leading-[1.15] tracking-[-0.04em]">
                  Join the Next Generation of Ethical Investment
                </h1>
                <p className="mt-5 text-[15px] leading-8 text-white/88">
                  Driving sustainable growth by channeling international capital with institutional-grade ethical governance.
                </p>
              </div>
            </div>
          </section>

          <div className="mx-auto w-full max-w-[448px]">{children}</div>
        </div>
      </div>
    </main>
  );
}

function AuthCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`w-full rounded-[16px] border border-[#E7EAF0] bg-white p-[41px] shadow-[0_10px_30px_-24px_rgba(15,23,42,0.30)] ${className ?? ""}`}>
      {children}
    </section>
  );
}

export function LoginPageView() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await signinUser({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      const authSession = getAuthSessionFromResponse(response);

      if (!authSession) {
        throw new Error("Login succeeded, but the server did not return a session. Please try again.");
      }

      if (authSession.user.role === "superadmin") {
        throw new Error("Please use the superadmin login page for this account.");
      }

      await clearStoredUserSession();
      setAuth({
        refreshToken: authSession.refreshToken,
        token: authSession.token,
        user: authSession.user,
      });

      await setLoginSession();
      router.push(authSession.user.role === "investee" ? "/investee-dashboard" : "/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to login. Please check your credentials."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard className="mx-auto">
        <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[#20232D]">Login</h2>
        <p className="mt-1 text-[14px] text-[#707A88]">Enter your credentials to access the secure portal.</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <Field label="Email Address" name="email" placeholder="name@institution.edu" required type="email" />
          <div>
            <PasswordField placeholder="••••••••" required />
            <div className="mt-2 text-right">
              <Link href="/forgot-password" className="text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8]">
                Forgot Password?
              </Link>
            </div>
          </div>
          {errorMessage ? <p className="text-sm font-medium text-red-600">{errorMessage}</p> : null}
          <SubmitButton idleLabel="Login" isPending={isSubmitting} pendingLabel="Logging in..." className="mt-3" />
        </form>

        <p className="mt-6 text-center text-sm text-[#6F768B]">
          Need an account?{" "}
          <Link href="/signup" className="font-semibold text-[#314864]">
            Signup
          </Link>
        </p>

        <SecurityBadge />
      </AuthCard>
    </AuthShell>
  );
}

export function SignupPageView() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [role, setRole] = useState<"investor" | "investee">("investee");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const nextRole = formData.get("role") === "investor" ? "investor" : "investee";
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const response = await signupUser({
        email,
        name: String(formData.get("name") ?? ""),
        password,
        role: nextRole,
      });
      let authSession = getAuthSessionFromResponse(response);
      const signupAuthUser = getAuthUserFromResponse(response);

      await clearStoredUserSession();

      if (!authSession) {
        const signinResponse = await signinUser({ email, password });
        authSession = getAuthSessionFromResponse(signinResponse, signupAuthUser);
      }

      if (!authSession) {
        clearAuth();
        throw new Error("Account created, but we could not start your session. Please sign in to continue KYC.");
      }

      setAuth({
        refreshToken: authSession.refreshToken,
        token: authSession.token,
        user: authSession.user,
      });

      await setLoginSession();
      router.push(`/kyc-verification?role=${nextRole}`);
      router.refresh();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to create your account. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard className="mx-auto">
        <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[#20232D]">Signup</h2>

        <div className="mt-4">
          <p className="text-[15px] font-medium text-[#1F2937]">Choose Role</p>
          <p className="mt-1 text-[13px] text-[#707A88]">Once you choose your role, you cannot change it.</p>
        </div>

        <form onSubmit={handleSignup} className="mt-4 space-y-4">
          <fieldset>
            <legend className="sr-only">Choose role</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="block cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="investor"
                  checked={role === "investor"}
                  onChange={() => setRole("investor")}
                  className="sr-only peer"
                />
                <span
                  className={`relative block rounded-[10px] border bg-[#F7F7F8] px-4 py-3 text-center transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#F97316] ${
                    role === "investor" ? "border-[#F97316] bg-[#FFF7ED]" : "border-[#E7EAF0]"
                  }`}
                >
                  <span
                    className={`absolute right-3 top-3 flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                      role === "investor" ? "border-[#F97316]" : "border-[#9CA3AF]"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full bg-[#F97316] transition ${
                        role === "investor" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </span>
                  <span className="mx-auto flex h-8 w-8 items-center justify-center text-[#222B38]">
                    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M9 22v-5.5a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3V22" />
                      <path d="M5 9.5h14v8a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17.5v-8Z" />
                      <path d="M9 9.5V7a3 3 0 1 1 6 0v2.5" />
                    </svg>
                  </span>
                  <span className="mt-1 block text-[15px] font-semibold text-[#1F2937]">Investor</span>
                </span>
              </label>

              <label className="block cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="investee"
                  checked={role === "investee"}
                  onChange={() => setRole("investee")}
                  className="sr-only peer"
                />
                <span
                  className={`relative block rounded-[10px] border bg-[#F7F7F8] px-4 py-3 text-center transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#F97316] ${
                    role === "investee" ? "border-[#F97316] bg-[#FFF7ED]" : "border-[#E7EAF0]"
                  }`}
                >
                  <span
                    className={`absolute right-3 top-3 flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                      role === "investee" ? "border-[#F97316]" : "border-[#9CA3AF]"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full bg-[#F97316] transition ${
                        role === "investee" ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </span>
                  <span className="mx-auto flex h-8 w-8 items-center justify-center text-[#222B38]">
                    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <circle cx="12" cy="7.5" r="3.5" />
                      <path d="M6.5 19a5.5 5.5 0 0 1 11 0" />
                    </svg>
                  </span>
                  <span className="mt-1 block text-[15px] font-semibold text-[#1F2937]">Investee</span>
                </span>
              </label>
            </div>
          </fieldset>

          <Field label="Name" name="name" placeholder="John Doe" required />
          <Field label="Email Address" name="email" placeholder="name@institution.edu" required type="email" />
          <PasswordField placeholder="••••••••" required />

          <label className="flex items-start gap-2.5 pt-0.5 text-[10px] leading-4 text-[#4B5563]">
            <input type="checkbox" required className="mt-0.5 h-3.5 w-3.5 rounded border border-[#B8C0CC]" />
            <span>
              I accept the{" "}
              <Link href="/terms-and-conditions" className="font-semibold text-[#111827] underline decoration-[#111827] underline-offset-2">
                Terms of Service
              </Link>{" "}
              and acknowledge the{" "}
              <Link href="/privacy-policy" className="font-semibold text-[#111827] underline decoration-[#111827] underline-offset-2">
                Privacy Policy
              </Link>{" "}
              regarding my vital data profile.
            </span>
          </label>

          {errorMessage ? <p className="text-sm font-medium text-red-600">{errorMessage}</p> : null}
          <SubmitButton idleLabel="Signup" isPending={isSubmitting} pendingLabel="Creating..." />
        </form>

        <SecurityBadge />
      </AuthCard>
    </AuthShell>
  );
}

export function ForgotPasswordPageView() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();

    try {
      if (!email) {
        throw new Error("Email is required");
      }

      await forgotPassword({ email });
      setStoredPasswordResetEmail(email);
      router.push("/verify-otp");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to send OTP. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard className="mx-auto text-center">
        <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[#20232D]">Forget Password</h2>
        <p className="mx-auto mt-1 max-w-[220px] text-[13px] leading-5 text-[#707A88]">
          Enter your email to reset your password.
        </p>

        <form onSubmit={handleForgotPassword} className="mt-6 space-y-4 text-left">
          <Field label="Email Address" name="email" placeholder="name@institution.edu" required type="email" />
          {errorMessage ? <p className="text-sm font-medium text-red-600">{errorMessage}</p> : null}
          <SubmitButton idleLabel="Next" isPending={isSubmitting} pendingLabel="Please wait..." />
        </form>

        <SecurityBadge />
      </AuthCard>
    </AuthShell>
  );
}

function OtpBox({
  inputRef,
  onChange,
  onPaste,
  value,
}: {
  value: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onChange?: (value: string) => void;
  onPaste?: (value: string) => void;
}) {
  return (
    <input
      ref={inputRef}
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      onPaste={(event) => {
        event.preventDefault();
        onPaste?.(event.clipboardData.getData("text"));
      }}
      className="h-[42px] w-[44px] rounded-[6px] border border-[#6B8AB7] bg-white text-center text-[26px] font-semibold text-[#20232D] outline-none"
    />
  );
}

export function VerifyOtpPageView() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const updateOtpValue = (index: number, rawValue: string) => {
    const nextCharacter = rawValue.slice(-1);
    const nextValue = /^[0-9]$/.test(nextCharacter) ? nextCharacter : "";

    setOtp((current) => current.map((item, currentIndex) => (currentIndex === index ? nextValue : item)));

    if (nextValue && index < inputRefs.length - 1) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const pasteOtpValue = (rawValue: string) => {
    const nextOtp = rawValue.replace(/\D/g, "").slice(0, 4).split("");

    if (!nextOtp.length) {
      return;
    }

    setOtp((current) => current.map((item, index) => nextOtp[index] ?? item));
    inputRefs[Math.min(nextOtp.length, inputRefs.length) - 1]?.current?.focus();
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const resetEmail = getStoredPasswordResetEmail();
      const code = otp.join("");

      if (!resetEmail) {
        throw new Error("Please request a password reset OTP first.");
      }

      if (!/^\d{4}$/.test(code)) {
        throw new Error("Enter the 4 digit OTP from your email.");
      }

      await verifyPasswordOtp({ email: resetEmail, otp: code });
      setStoredPasswordResetEmail(resetEmail);
      router.push("/reset-password");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to verify OTP. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsResending(true);

    try {
      const resetEmail = getStoredPasswordResetEmail();

      if (!resetEmail) {
        throw new Error("Please enter your email on the forgot password page first.");
      }

      await resendPasswordOtp({ email: resetEmail });
      setStoredPasswordResetEmail(resetEmail);
      setSuccessMessage("A new OTP has been sent to your email.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to resend OTP. Please try again."));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard className="mx-auto flex flex-col items-center text-center">
        <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[#20232D]">Verify OTP</h2>
        <p className="mt-2 max-w-[245px] text-[13px] leading-5 text-[#707A88]">
          Please check your email, we have sent a code to your inbox.
        </p>

        <form onSubmit={handleVerifyOtp} className="mt-5 w-full">
          <div className="flex items-center justify-center gap-3">
            {otp.map((value, index) => (
              <OtpBox
                key={index}
                inputRef={inputRefs[index]}
                value={value}
                onChange={(nextValue) => updateOtpValue(index, nextValue)}
                onPaste={pasteOtpValue}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-[13px] text-[#4B5563]">
            <span>Didn’t receive code?</span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending}
              className="font-medium text-[#2563EB] hover:text-[#1D4ED8] disabled:cursor-wait disabled:opacity-70"
            >
              {isResending ? "Sending..." : "Resend"}
            </button>
          </div>

          {successMessage ? <p className="mt-3 text-sm font-medium text-green-700">{successMessage}</p> : null}
          {errorMessage ? <p className="mt-3 text-sm font-medium text-red-600">{errorMessage}</p> : null}
          <SubmitButton idleLabel="Verify" isPending={isSubmitting} pendingLabel="Verifying..." className="mt-3" />
        </form>

        <SecurityBadge />
      </AuthCard>
    </AuthShell>
  );
}

export function ResetPasswordPageView() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    try {
      const resetEmail = getStoredPasswordResetEmail();

      if (!resetEmail) {
        throw new Error("Please verify your OTP before setting a new password.");
      }

      if (!password) {
        throw new Error("Password is required");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      await setNewPassword({ email: resetEmail, password });
      clearStoredPasswordResetEmail();
      router.push("/login");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to update password. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard className="mx-auto text-center">
        <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[#20232D]">Set New Password</h2>
        <p className="mx-auto mt-2 max-w-[250px] text-[13px] leading-5 text-[#707A88]">
          Please set a new password to secure your account.
        </p>

        <form onSubmit={handleResetPassword} className="mt-6 space-y-4 text-left">
          <PasswordField label="New Password" name="password" placeholder="••••••••" />
          <PasswordField label="Confirm Password" name="confirmPassword" placeholder="••••••••" />
          {errorMessage ? <p className="text-sm font-medium text-red-600">{errorMessage}</p> : null}
          <SubmitButton idleLabel="Done" isPending={isSubmitting} pendingLabel="Saving..." className="mt-2" />
        </form>
      </AuthCard>
    </AuthShell>
  );
}
