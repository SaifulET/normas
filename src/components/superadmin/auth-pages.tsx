"use client";

import Image from "next/image";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import { submitSuperadminLogin, submitSuperadminSignup } from "./auth-actions";

function SubmitButton({
  idleLabel,
  pendingLabel,
}: {
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

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
            <div className="relative flex h-full flex-col justify-between p-10 text-white">
              <div className="flex items-center gap-4">
                <LogoMark />
                <div>
                  <p className="text-lg font-semibold">Mooment</p>
                  <p className="text-sm text-white/66">Super Admin Console</p>
                </div>
              </div>

              <div className="max-w-[380px] pb-10">
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
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-[#20243A]">{label}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="h-11 w-full rounded-[10px] border border-[#DADDEA] bg-white px-3.5 text-sm text-[#20243A] outline-none transition placeholder:text-[#9097AB] focus:border-[#4E4A86]"
      />
    </label>
  );
}

export function SuperadminLoginPage() {
  return (
    <AuthShell>
      <AuthCard>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7D84A0]">Superadmin Auth</p>
        <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-[#1F2340]">Login</h2>
        <p className="mt-2 text-sm text-[#6F768B]">Enter your superadmin credentials to access the management console.</p>

        <form action={submitSuperadminLogin} className="mt-8 space-y-4">
          <Field label="Email Address" name="email" placeholder="admin@mooment.com" type="email" />
          <Field label="Password" name="password" placeholder="••••••••" type="password" />

          <div className="pt-2">
            <SubmitButton idleLabel="Login" pendingLabel="Logging in..." />
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

export function SuperadminSignupPage() {
  const [inviteCode, setInviteCode] = useState("");

  return (
    <AuthShell>
      <AuthCard>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#7D84A0]">Superadmin Auth</p>
        <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.04em] text-[#1F2340]">Signup</h2>
        <p className="mt-2 text-sm text-[#6F768B]">Create a separate superadmin account for platform operations.</p>

        <form action={submitSuperadminSignup} className="mt-8 space-y-4">
          <Field label="Full Name" name="name" placeholder="Tuval Ramsey" />
          <Field label="Email Address" name="email" placeholder="admin@mooment.com" type="email" />
          <Field label="Password" name="password" placeholder="••••••••" type="password" />
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-[#20243A]">Invite Code</span>
            <input
              type="text"
              name="inviteCode"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="Optional internal code"
              className="h-11 w-full rounded-[10px] border border-[#DADDEA] bg-white px-3.5 text-sm text-[#20243A] outline-none transition placeholder:text-[#9097AB] focus:border-[#4E4A86]"
            />
          </label>

          <div className="pt-2">
            <SubmitButton idleLabel="Signup" pendingLabel="Creating..." />
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
