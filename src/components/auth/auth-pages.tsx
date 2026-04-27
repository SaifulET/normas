"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  submitForgotPassword,
  submitLogin,
  submitResetPassword,
  submitSignup,
  submitVerifyOtp,
} from "./actions";

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
  pendingLabel,
}: {
  className?: string;
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

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

function Field({
  label,
  name,
  placeholder,
  type = "text",
  trailing,
}: {
  label: string;
  name: string;
  placeholder: string;
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
          className="h-[40px] w-full rounded-[8px] border border-[#D3D8E0] bg-white px-3.5 text-[14px] text-[#111827] outline-none transition placeholder:text-[#8D97A5] focus:border-[#314864]"
        />
        {trailing ? <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">{trailing}</span> : null}
      </span>
    </label>
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
            <div className="relative flex h-full flex-col justify-end px-9 pb-14 pt-9 text-white">
              <div className="mb-8 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/25 bg-[#FFFFFF26] px-3 py-1 text-[10px] font-medium">
                <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current" aria-hidden="true">
                  <path d="M6 1.1 9.8 2.4v3.1c0 2.2-1.5 4.2-3.8 5.4C3.7 9.7 2.2 7.7 2.2 5.5V2.4L6 1.1Zm0 2.1a.6.6 0 0 0-.55.36l-.74 1.72-1.88.15a.6.6 0 0 0-.34 1.05l1.42 1.23-.43 1.83a.6.6 0 0 0 .89.65L6 9.21l1.63.99a.6.6 0 0 0 .89-.65l-.43-1.83 1.42-1.23a.6.6 0 0 0-.34-1.05l-1.88-.15-.74-1.72A.6.6 0 0 0 6 3.2Z" />
                </svg>
                <span>Secure Global Market</span>
              </div>
              <h1 className="max-w-[360px] text-[32px] font-semibold leading-[1.15] tracking-[-0.04em]">
                Join the Next Generation of Ethical Investment
              </h1>
              <p className="mt-5 max-w-[360px] text-[15px] leading-8 text-white/88">
                Driving sustainable growth by channeling international capital with institutional-grade ethical governance.
              </p>
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

function PasswordAdornment() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4 text-[#344054]" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M1.5 9s2.7-4.5 7.5-4.5S16.5 9 16.5 9s-2.7 4.5-7.5 4.5S1.5 9 1.5 9Z" />
      <circle cx="9" cy="9" r="2.25" />
    </svg>
  );
}

export function LoginPageView() {
  return (
    <AuthShell>
      <AuthCard className="mx-auto">
        <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[#20232D]">Login</h2>
        <p className="mt-1 text-[14px] text-[#707A88]">Enter your credentials to access the secure portal.</p>

        <form action={submitLogin} className="mt-6 space-y-4">
          <Field label="Email Address" name="email" placeholder="name@institution.edu" type="email" />
          <div>
            <Field label="Password" name="password" placeholder="••••••••" type="password" />
            <div className="mt-2 text-right">
              <Link href="/forgot-password" className="text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8]">
                Forgot Password?
              </Link>
            </div>
          </div>
          <SubmitButton idleLabel="Login" pendingLabel="Logging in..." className="mt-3" />
        </form>

        <SecurityBadge />
      </AuthCard>
    </AuthShell>
  );
}

export function SignupPageView() {
  const [role, setRole] = useState<"investor" | "investee">("investee");

  return (
    <AuthShell>
      <AuthCard className="mx-auto">
        <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[#20232D]">Signup</h2>

        <div className="mt-4">
          <p className="text-[15px] font-medium text-[#1F2937]">Choose Role</p>
          <p className="mt-1 text-[13px] text-[#707A88]">Once you choose your role, you cannot change it.</p>
        </div>

        <form action={submitSignup} className="mt-4 space-y-4">
          <input type="hidden" name="role" value={role} />

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("investor")}
              className={`relative rounded-[10px] border px-4 py-3 text-center transition ${
                role === "investor" ? "border-[#D5DDE8] bg-[#F7F7F8]" : "border-[#E7EAF0] bg-[#F7F7F8]"
              }`}
            >
              <span
                className={`absolute right-3 top-3 h-3.5 w-3.5 rounded-full border ${
                  role === "investor" ? "border-[#9CA3AF] bg-white" : "border-[#9CA3AF] bg-white"
                }`}
              />
              <span className="mx-auto flex h-8 w-8 items-center justify-center text-[#222B38]">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M9 22v-5.5a3 3 0 0 1 3-3h0a3 3 0 0 1 3 3V22" />
                  <path d="M5 9.5h14v8a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17.5v-8Z" />
                  <path d="M9 9.5V7a3 3 0 1 1 6 0v2.5" />
                </svg>
              </span>
              <span className="mt-1 block text-[15px] font-semibold text-[#1F2937]">Investor</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("investee")}
              className="relative rounded-[10px] border border-[#E7EAF0] bg-[#F7F7F8] px-4 py-3 text-center transition"
            >
              <span
                className={`absolute right-3 top-3 flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                  role === "investee" ? "border-[#F97316]" : "border-[#9CA3AF]"
                }`}
              >
                {role === "investee" ? <span className="h-1.5 w-1.5 rounded-full bg-[#F97316]" /> : null}
              </span>
              <span className="mx-auto flex h-8 w-8 items-center justify-center text-[#222B38]">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="12" cy="7.5" r="3.5" />
                  <path d="M6.5 19a5.5 5.5 0 0 1 11 0" />
                </svg>
              </span>
              <span className="mt-1 block text-[15px] font-semibold text-[#1F2937]">Investee</span>
            </button>
          </div>

          <Field label="Name" name="name" placeholder="John Doe" />
          <Field label="Email Address" name="email" placeholder="name@institution.edu" type="email" />
          <Field label="Password" name="password" placeholder="••••••••" type="password" />

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

          <SubmitButton idleLabel="Signup" pendingLabel="Creating..." />
        </form>

        <SecurityBadge />
      </AuthCard>
    </AuthShell>
  );
}

export function ForgotPasswordPageView() {
  return (
    <AuthShell>
      <AuthCard className="mx-auto text-center">
        <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[#20232D]">Forget Password</h2>
        <p className="mx-auto mt-1 max-w-[220px] text-[13px] leading-5 text-[#707A88]">
          Enter your email to reset your password.
        </p>

        <form action={submitForgotPassword} className="mt-6 space-y-4 text-left">
          <Field label="Email Address" name="email" placeholder="name@institution.edu" type="email" />
          <SubmitButton idleLabel="Next" pendingLabel="Please wait..." />
        </form>

        <SecurityBadge />
      </AuthCard>
    </AuthShell>
  );
}

function OtpBox({
  inputRef,
  onChange,
  value,
}: {
  value: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onChange?: (value: string) => void;
}) {
  return (
    <input
      ref={inputRef}
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      className="h-[42px] w-[44px] rounded-[6px] border border-[#6B8AB7] bg-white text-center text-[26px] font-semibold text-[#20232D] outline-none"
    />
  );
}

export function VerifyOtpPageView() {
  const [otp, setOtp] = useState(["8", "0", "", ""]);
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

  return (
    <AuthShell>
      <AuthCard className="mx-auto flex flex-col items-center text-center">
        <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[#20232D]">Verify OTP</h2>
        <p className="mt-2 max-w-[245px] text-[13px] leading-5 text-[#707A88]">
          Please check your email, we have sent a code to contact
        </p>

        <form action={submitVerifyOtp} className="mt-5 w-full">
          <div className="flex items-center justify-center gap-3">
            {otp.map((value, index) => (
              <OtpBox
                key={index}
                inputRef={inputRefs[index]}
                value={value}
                onChange={(nextValue) => updateOtpValue(index, nextValue)}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between text-[13px] text-[#4B5563]">
            <span>Didn’t receive code?</span>
            <button type="button" className="font-medium text-[#2563EB] hover:text-[#1D4ED8]">
              Resend
            </button>
          </div>

          <SubmitButton idleLabel="Verify" pendingLabel="Verifying..." className="mt-3" />
        </form>

        <SecurityBadge />
      </AuthCard>
    </AuthShell>
  );
}

export function ResetPasswordPageView() {
  return (
    <AuthShell>
      <AuthCard className="mx-auto text-center">
        <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[#20232D]">Set New Password</h2>
        <p className="mx-auto mt-2 max-w-[250px] text-[13px] leading-5 text-[#707A88]">
          Please set a new password to of your account, to secure your account
        </p>

        <form action={submitResetPassword} className="mt-6 space-y-4 text-left">
          <Field
            label="New Password"
            name="password"
            placeholder="••••••••"
            type="password"
            trailing={<PasswordAdornment />}
          />
          <Field
            label="Confirm Password"
            name="confirmPassword"
            placeholder="••••••••"
            type="password"
            trailing={<PasswordAdornment />}
          />
          <SubmitButton idleLabel="Done" pendingLabel="Saving..." className="mt-2" />
        </form>
      </AuthCard>
    </AuthShell>
  );
}
