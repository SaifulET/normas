"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
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
import { setSuperadminLoginSession } from "./auth-actions";

const SUPERADMIN_PASSWORD_RESET_EMAIL_STORAGE_KEY = "earlyn_superadmin_password_reset_email";

function getStoredSuperadminPasswordResetEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(SUPERADMIN_PASSWORD_RESET_EMAIL_STORAGE_KEY) ?? "";
}

function setStoredSuperadminPasswordResetEmail(email: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(SUPERADMIN_PASSWORD_RESET_EMAIL_STORAGE_KEY, email);
}

function clearStoredSuperadminPasswordResetEmail() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(SUPERADMIN_PASSWORD_RESET_EMAIL_STORAGE_KEY);
}

function SubmitButton({
  idleLabel,
  isPending,
  pendingLabel,
}: {
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
      className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-[#4E4A86] px-4 text-sm font-medium text-white transition hover:bg-[#3F3B73] disabled:cursor-wait disabled:opacity-80"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

function LogoMark() {
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/12 text-white">
      <svg viewBox="0 0 28 28" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="4" y="4" width="8" height="8" rx="2" />
        <rect x="16" y="4" width="8" height="8" rx="2" />
        <rect x="4" y="16" width="8" height="8" rx="2" />
        <rect x="16" y="16" width="8" height="8" rx="2" />
      </svg>
    </span>
  );
}

function AuthShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#F4F5F9] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1320px] items-center justify-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[580px_440px] lg:gap-[72px]">
          <section className="relative hidden h-[680px] overflow-hidden rounded-[32px] bg-[#101015] lg:block">
            <Image src="/login.jpg" alt="Superadmin access" fill priority className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,34,0.20)_0%,rgba(12,12,20,0.86)_100%)]" />
            <div className="relative flex h-full items-center p-10 text-white">
              <div className="ml-[48px] flex max-w-[380px] flex-col items-start text-left">
                <LogoMark />
                <div className="mt-5">
                  <p className="text-lg font-semibold">Mooment</p>
                  <p className="text-sm text-white/66">Super Admin Console</p>
                </div>

                <div className="mt-10">
                  <div className="mb-6 inline-flex rounded-full border border-white/14 bg-white/10 px-3 py-1 text-[11px] font-medium">
                    Protected Workspace
                  </div>
                  <h1 className="text-[42px] font-semibold leading-[1.05] tracking-[-0.04em]">
                    Manage platform operations from one secure panel
                  </h1>
                  <p className="mt-5 text-[15px] leading-7 text-white/78">
                    Monitor users, payments, reports, support, and configuration settings without affecting your investor or investee workspaces.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="mx-auto w-full max-w-[440px]">{children}</div>
        </div>
      </div>
    </main>
  );
}

function AuthCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-[#E4E7F0] bg-white p-8 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.28)]">
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-[#20243A]">{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="h-11 w-full rounded-[10px] border border-[#DADDEA] bg-white px-3.5 text-sm text-[#20243A] outline-none transition placeholder:text-[#9097AB] focus:border-[#4E4A86]"
      />
    </label>
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
      <span className="mb-2 block text-[13px] font-medium text-[#20243A]">{label}</span>
      <span className="relative block">
        <input
          type={visible ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          required={required}
          className="h-11 w-full rounded-[10px] border border-[#DADDEA] bg-white px-3.5 pr-11 text-sm text-[#20243A] outline-none transition placeholder:text-[#9097AB] focus:border-[#4E4A86]"
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute inset-y-0 right-2 inline-flex w-8 items-center justify-center rounded-md text-[#4D5572] transition hover:bg-[#F4F5F9] hover:text-[#20243A]"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          <EyeIcon hidden={!visible} />
        </button>
      </span>
    </label>
  );
}

export function SuperadminLoginPage() {
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

      if (authSession.user.role !== "superadmin") {
        throw new Error("This account does not have superadmin access.");
      }

      await clearStoredUserSession();
      setAuth({
        refreshToken: authSession.refreshToken,
        token: authSession.token,
        user: authSession.user,
      });

      await setSuperadminLoginSession();
      router.push("/superadmin/dashboard/user-management");
      router.refresh();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to login. Please check your credentials."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7D84A0]">Superadmin Auth</p>
        <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-[#1F2340]">Login</h2>
        <p className="mt-2 text-sm text-[#6F768B]">Enter your superadmin credentials to access the management console.</p>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          <Field label="Email Address" name="email" placeholder="admin@mooment.com" required type="email" />
          <PasswordField placeholder="••••••••" required />

          <div className="text-right">
            <Link href="/superadmin/auth/forgot-password" className="text-[11px] font-medium text-[#4E4A86] hover:text-[#3F3B73]">
              Forgot Password?
            </Link>
          </div>

          <div className="pt-2">
            {errorMessage ? <p className="mb-3 text-sm font-medium text-red-600">{errorMessage}</p> : null}
            <SubmitButton idleLabel="Login" isPending={isSubmitting} pendingLabel="Logging in..." />
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-[#6F768B]">
          Need an account?{" "}
          <Link href="/superadmin/auth/signup" className="font-semibold text-[#4E4A86]">
            Signup
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}

function SuperadminOtpBox({
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
      className="h-11 w-12 rounded-[8px] border border-[#8F8AC3] bg-white text-center text-[26px] font-semibold text-[#1F2340] outline-none transition focus:border-[#4E4A86]"
    />
  );
}

export function SuperadminForgotPasswordPage() {
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
      setStoredSuperadminPasswordResetEmail(email);
      router.push("/superadmin/auth/verify-otp");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to send OTP. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7D84A0]">Superadmin Auth</p>
        <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-[#1F2340]">Forget Password</h2>
        <p className="mt-2 text-sm text-[#6F768B]">Enter your superadmin email to receive a password reset OTP.</p>

        <form onSubmit={handleForgotPassword} className="mt-8 space-y-4">
          <Field label="Email Address" name="email" placeholder="admin@mooment.com" required type="email" />
          <div className="pt-2">
            {errorMessage ? <p className="mb-3 text-sm font-medium text-red-600">{errorMessage}</p> : null}
            <SubmitButton idleLabel="Next" isPending={isSubmitting} pendingLabel="Please wait..." />
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-[#6F768B]">
          Remembered it?{" "}
          <Link href="/superadmin/auth/login" className="font-semibold text-[#4E4A86]">
            Login
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}

export function SuperadminVerifyOtpPage() {
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
      const resetEmail = getStoredSuperadminPasswordResetEmail();
      const code = otp.join("");

      if (!resetEmail) {
        throw new Error("Please request a password reset OTP first.");
      }

      if (!/^\d{4}$/.test(code)) {
        throw new Error("Enter the 4 digit OTP from your email.");
      }

      await verifyPasswordOtp({ email: resetEmail, otp: code });
      setStoredSuperadminPasswordResetEmail(resetEmail);
      router.push("/superadmin/auth/reset-password");
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
      const resetEmail = getStoredSuperadminPasswordResetEmail();

      if (!resetEmail) {
        throw new Error("Please enter your email on the forgot password page first.");
      }

      await resendPasswordOtp({ email: resetEmail });
      setStoredSuperadminPasswordResetEmail(resetEmail);
      setSuccessMessage("A new OTP has been sent to your email.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to resend OTP. Please try again."));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7D84A0]">Superadmin Auth</p>
        <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-[#1F2340]">Verify OTP</h2>
        <p className="mt-2 text-sm text-[#6F768B]">Enter the 4 digit code sent to your email.</p>

        <form onSubmit={handleVerifyOtp} className="mt-8">
          <div className="flex items-center justify-center gap-3">
            {otp.map((value, index) => (
              <SuperadminOtpBox
                key={index}
                inputRef={inputRefs[index]}
                value={value}
                onChange={(nextValue) => updateOtpValue(index, nextValue)}
                onPaste={pasteOtpValue}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-[13px] text-[#4D5572]">
            <span>Didn&apos;t receive code?</span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isResending}
              className="font-medium text-[#4E4A86] hover:text-[#3F3B73] disabled:cursor-wait disabled:opacity-70"
            >
              {isResending ? "Sending..." : "Resend"}
            </button>
          </div>

          <div className="pt-4">
            {successMessage ? <p className="mb-3 text-sm font-medium text-green-700">{successMessage}</p> : null}
            {errorMessage ? <p className="mb-3 text-sm font-medium text-red-600">{errorMessage}</p> : null}
            <SubmitButton idleLabel="Verify" isPending={isSubmitting} pendingLabel="Verifying..." />
          </div>
        </form>
      </AuthCard>
    </AuthShell>
  );
}

export function SuperadminResetPasswordPage() {
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
      const resetEmail = getStoredSuperadminPasswordResetEmail();

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
      clearStoredSuperadminPasswordResetEmail();
      router.push("/superadmin/auth/login");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to update password. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7D84A0]">Superadmin Auth</p>
        <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-[#1F2340]">Set New Password</h2>
        <p className="mt-2 text-sm text-[#6F768B]">Choose a new password for your superadmin account.</p>

        <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
          <PasswordField label="New Password" name="password" placeholder="New password" required />
          <PasswordField label="Confirm Password" name="confirmPassword" placeholder="Confirm password" required />
          <div className="pt-2">
            {errorMessage ? <p className="mb-3 text-sm font-medium text-red-600">{errorMessage}</p> : null}
            <SubmitButton idleLabel="Done" isPending={isSubmitting} pendingLabel="Saving..." />
          </div>
        </form>
      </AuthCard>
    </AuthShell>
  );
}

export function SuperadminSignupPage() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const response = await signupUser({
        email,
        name: String(formData.get("name") ?? ""),
        password,
        role: "superadmin",
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
        throw new Error("Account created, but we could not start your session. Please sign in.");
      }

      setAuth({
        refreshToken: authSession.refreshToken,
        token: authSession.token,
        user: authSession.user,
      });

      await setSuperadminLoginSession();
      router.push("/superadmin/dashboard/user-management");
      router.refresh();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Unable to create your account. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7D84A0]">Superadmin Auth</p>
        <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-[#1F2340]">Signup</h2>
        <p className="mt-2 text-sm text-[#6F768B]">Create a separate superadmin account for platform operations.</p>

        <form onSubmit={handleSignup} className="mt-8 space-y-4">
          <Field label="Full Name" name="name" placeholder="Tuval Ramsey" required />
          <Field label="Email Address" name="email" placeholder="admin@mooment.com" required type="email" />
          <PasswordField placeholder="••••••••" required />
          <div className="pt-2 space-y-3">
            {errorMessage ? <p className="mb-3 text-sm font-medium text-red-600">{errorMessage}</p> : null}
            <SubmitButton idleLabel="Signup" isPending={isSubmitting} pendingLabel="Creating..." />
            <Link
              href="/superadmin/auth/login"
              className="inline-flex h-[44px] w-full items-center justify-center rounded-[10px] border border-[#B8C0CC] bg-white px-4 text-sm font-medium text-[#4E4A86] transition hover:bg-[#F8FAFC]"
            >
              Sign In
            </Link>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-[#6F768B]">
          Already have an account?{" "}
          <Link href="/superadmin/auth/login" className="font-semibold text-[#4E4A86]">
            Login
          </Link>
        </p>
      </AuthCard>
    </AuthShell>
  );
}
