"use client";

import { ChatQuestion01Icon, File01Icon, MoneyBag02Icon, SecurityCheckIcon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { getApiErrorMessage } from "@/lib/api";
import {
  getCachedSuperadminProfile,
  getSuperadminProfile,
  updateSuperadminProfile,
  type SuperadminProfile,
} from "@/lib/superadmin-profile-api";
import { SuperadminPageHeader } from "./shell";

type SettingsTab = {
  href: string;
  label: string;
};

type ProfileForm = {
  name: string;
  email: string;
  contact: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type TaxForm = {
  tax: string;
};

type PricingPlanForm = {
  annualDiscount: string;
  monthlyDiscount: string;
  price: string;
};

const tabs: SettingsTab[] = [
  { href: "/superadmin/dashboard/settings", label: "General" },
  { href: "/superadmin/dashboard/settings/pricing", label: "Pricing" },
  { href: "/superadmin/dashboard/settings/faq", label: "FAQ" },
  { href: "/superadmin/dashboard/settings/terms-conditions", label: "Terms & Conditions" },
  { href: "/superadmin/dashboard/settings/privacy-policy", label: "Privacy & Policy" },
];

const initialProfile: ProfileForm = {
  name: "",
  email: "",
  contact: "",
};

const initialPassword: PasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const initialTax: TaxForm = {
  tax: "",
};

const initialPricingPlans = {
  investee: {
    annualDiscount: "5",
    monthlyDiscount: "5",
    price: "5",
  },
  investorBasic: {
    annualDiscount: "5",
    monthlyDiscount: "5",
    price: "5",
  },
  investorPro: {
    annualDiscount: "5",
    monthlyDiscount: "5",
    price: "5",
  },
} satisfies Record<string, PricingPlanForm>;

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getInitials(name?: string) {
  return name
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "";
}

function TabIcon({ label }: { label: string }) {
  const baseClasses = "h-[24px] w-[24px] shrink-0";

  if (label === "General") {
    return (
      <HugeiconsIcon icon={UserIcon} className={baseClasses} />
    );
  }

  if (label === "Pricing") {
    return (
      <HugeiconsIcon icon={MoneyBag02Icon} className={baseClasses} />
    );
  }

  if (label === "Terms & Conditions") {
    return (
      <HugeiconsIcon icon={File01Icon} className={baseClasses} />
    );
  }

  if (label === "FAQ") {
    return (
      <HugeiconsIcon icon={ChatQuestion01Icon} className={baseClasses} />
    );
  }

  return <HugeiconsIcon icon={SecurityCheckIcon} className={baseClasses} />;
}

function ProfileFieldIcon({ type }: { type: "user" | "email" | "phone" }) {
  const classes = "h-[18px] w-[18px] text-[#5E568E]";

  if (type === "user") {
    return (
      <svg viewBox="0 0 24 24" className={classes} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="12" cy="8" r="3.25" />
        <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
      </svg>
    );
  }

  if (type === "email") {
    return (
      <svg viewBox="0 0 24 24" className={classes} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="4" y="6" width="16" height="12" rx="2.5" />
        <path d="m6.5 8.5 5.5 4 5.5-4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={classes} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M8.5 5.5c.6-.6 1.55-.6 2.15 0l1.55 1.55c.55.55.6 1.42.13 2.03l-.9 1.14a14.2 14.2 0 0 0 2.3 2.95 14.2 14.2 0 0 0 2.95 2.3l1.14-.9c.61-.47 1.48-.42 2.03.13l1.55 1.55c.6.6.6 1.55 0 2.15l-.97.97c-.76.76-1.88 1.1-2.94.87-2.22-.5-4.79-2.12-7.42-4.75s-4.25-5.2-4.75-7.42c-.23-1.06.11-2.18.87-2.94Z" />
    </svg>
  );
}

function ProfileInput({
  icon,
  inputMode,
  onChange,
  type = "text",
  value,
}: {
  icon: "user" | "email" | "phone";
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  value: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
        <ProfileFieldIcon type={icon} />
      </span>
      <input
        type={type}
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-[12px] border border-[#E1E6F0] bg-white pl-12 pr-4 text-[14px] text-[#23275A] outline-none transition focus:border-[#5E568E]"
      />
    </div>
  );
}

export function SettingsCard({
  children,
  footer,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-[18px] bg-white shadow-[0_10px_40px_rgba(31,35,61,0.06)]">
      <div className="bg-[#F4F4F4] px-5 py-5 sm:px-6">
        <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-[#23275A]">{title}</h3>
        <p className="mt-1 text-[13px] text-[#7E84A3]">{subtitle}</p>
      </div>
      <div className="px-5 py-5 sm:px-6">{children}</div>
      {footer ? <div className="px-5 pb-5 sm:px-6">{footer}</div> : null}
    </section>
  );
}

function PricingTextInput({
  onChange,
  prefix,
  suffix,
  value,
}: {
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  value: string;
}) {
  return (
    <div className="relative">
      {prefix ? <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-[#7B83A2]">{prefix}</span> : null}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cx(
          "h-8 w-full rounded-[6px] border border-[#DDE3EF] bg-white text-[12px] text-[#23275A] outline-none transition focus:border-[#5E568E]",
          prefix ? "pl-9 pr-3" : "px-3",
          suffix ? "pr-8" : "",
        )}
      />
      {suffix ? <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#7B83A2]">{suffix}</span> : null}
    </div>
  );
}

function PricingPlanCard({
  onCancel,
  onChange,
  onSave,
  plan,
  subtitle,
}: {
  onCancel: () => void;
  onChange: (next: PricingPlanForm) => void;
  onSave: () => void;
  plan: PricingPlanForm;
  subtitle: string;
}) {
  return (
    <section className="overflow-hidden rounded-[14px] bg-white shadow-[0_10px_40px_rgba(31,35,61,0.06)]">
      <div className="bg-[#E5E7EB] px-4 py-4">
        <h3 className="text-[14px] font-semibold text-[#16123E]">{subtitle}</h3>
      </div>

      <div className="space-y-4 px-4 py-4">
        <label className="block">
          <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-[#4F5676]">Price /mo</span>
          <PricingTextInput
            prefix="$"
            value={plan.price}
            onChange={(value) =>
              onChange({
                ...plan,
                price: value,
              })
            }
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-[#4F5676]">Discount Monthly</span>
            <PricingTextInput
              suffix="%"
              value={plan.monthlyDiscount}
              onChange={(value) =>
                onChange({
                  ...plan,
                  monthlyDiscount: value,
                })
              }
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.18em] text-[#4F5676]">Discount Anually</span>
            <PricingTextInput
              suffix="%"
              value={plan.annualDiscount}
              onChange={(value) =>
                onChange({
                  ...plan,
                  annualDiscount: value,
                })
              }
            />
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[6px] border border-[#D8DEEA] bg-white px-3 py-1.5 text-[10px] font-medium text-[#5F6786] transition hover:border-[#BFC8D9]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-[6px] bg-[#161616] px-3 py-1.5 text-[10px] font-medium text-white transition hover:bg-black"
          >
            Save
          </button>
        </div>
      </div>
    </section>
  );
}

function mapProfileToForm(profile?: SuperadminProfile): ProfileForm {
  return {
    name: profile?.name?.trim() || "",
    email: profile?.email?.trim() || "",
    contact: profile?.mobile?.trim() || "",
  };
}

function mapProfileToTaxForm(profile?: SuperadminProfile): TaxForm {
  const tax = typeof profile?.taxPercentage === "number" && Number.isFinite(profile.taxPercentage)
    ? String(profile.taxPercentage)
    : initialTax.tax;

  return { tax };
}

export function SuperadminSettingsShell({
  activeHref,
  children,
  subtitle,
  title,
}: {
  activeHref: string;
  children: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)] xl:items-start">
      <aside className="space-y-6">
        <h1 className="text-[32px] font-semibold leading-[40px] text-[#23275A]">Settings</h1>

        <nav className="w-full max-w-[300px]">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8A91AB]">Workspace</p>
          <div className="space-y-1.5">
            {tabs.map((tab) => {
              const active = tab.href === activeHref;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cx(
                    "flex items-center gap-3 rounded-[14px] px-4 py-3 text-[14px] font-medium leading-[16px] transition",
                    active
                      ? "bg-[#334966] text-white shadow-[0_12px_28px_rgba(51,73,102,0.28)]"
                      : "text-[#4E5574] hover:bg-white hover:text-[#23275A]",
                  )}
                >
                  <TabIcon label={tab.label} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      <div className="space-y-6 xl:pt-[58px]">
        <div>
          <h2 className="text-[24px] font-semibold leading-[32px] text-[#16123E]">{title}</h2>
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8A91AB]">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SuperadminSettingsGeneralClient({
  standalone = false,
}: {
  standalone?: boolean;
} = {}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState(initialProfile);
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarSrc, setAvatarSrc] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [taxForm, setTaxForm] = useState(initialTax);
  const [savedTaxForm, setSavedTaxForm] = useState(initialTax);
  const [taxMessage, setTaxMessage] = useState<string | null>(null);
  const [taxSaving, setTaxSaving] = useState(false);

  const [editingPassword, setEditingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState(initialPassword);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordUpdatedAt, setPasswordUpdatedAt] = useState("");

  const hasProfileChanges = useMemo(
    () =>
      profile.name !== savedProfile.name ||
      profile.email !== savedProfile.email ||
      profile.contact !== savedProfile.contact ||
      Boolean(avatarFile),
    [avatarFile, profile, savedProfile],
  );

  const hasTaxChanges = taxForm.tax !== savedTaxForm.tax;

  useEffect(() => {
    let active = true;

    const applyProfile = (profileData?: SuperadminProfile) => {
      const nextProfile = mapProfileToForm(profileData);
      const nextTaxForm = mapProfileToTaxForm(profileData);

      setProfile(nextProfile);
      setSavedProfile(nextProfile);
      setTaxForm(nextTaxForm);
      setSavedTaxForm(nextTaxForm);
      setAvatarSrc(profileData?.profileImage?.trim() || "");
    };

    const loadProfile = async () => {
      const cachedProfile = getCachedSuperadminProfile();

      if (cachedProfile && active) {
        applyProfile(cachedProfile);
        setProfileLoading(false);
      } else {
        setProfileLoading(true);
      }

      setProfileMessage(null);

      try {
        const response = await getSuperadminProfile();

        if (active) {
          applyProfile(response.data);
        }
      } catch (error) {
        if (active) {
          setProfileMessage(getApiErrorMessage(error, "Unable to load profile information."));
        }
      } finally {
        if (active) {
          setProfileLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarSrc(objectUrl);
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData();
    data.set("name", profile.name.trim());
    data.set("email", profile.email.trim());
    data.set("mobile", profile.contact.trim());

    if (avatarFile) {
      data.set("profileImage", avatarFile);
    }

    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const response = await updateSuperadminProfile(data);
      const nextProfile = mapProfileToForm(response.data);

      setProfile(nextProfile);
      setSavedProfile(nextProfile);
      setAvatarFile(null);

      if (response.data?.profileImage) {
        setAvatarSrc(response.data.profileImage);
      }

      setProfileMessage("Profile information saved.");
    } catch (error) {
      setProfileMessage(getApiErrorMessage(error, "Unable to save profile information."));
    } finally {
      setProfileSaving(false);
    }
  }

  function resetProfile() {
    setProfile(savedProfile);
    setAvatarFile(null);
    setProfileMessage("Profile changes discarded.");
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage("Fill in all password fields.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New password and confirm password do not match.");
      return;
    }

    const data = new FormData();
    data.set("currentPassword", passwordForm.currentPassword);
    data.set("newPassword", passwordForm.newPassword);

    setPasswordSaving(true);
    setPasswordMessage(null);

    try {
      await updateSuperadminProfile(data);
      setPasswordForm(initialPassword);
      setEditingPassword(false);
      setPasswordUpdatedAt("Last changed just now");
      setPasswordMessage("Password updated successfully.");
    } catch (error) {
      setPasswordMessage(getApiErrorMessage(error, "Unable to update password."));
    } finally {
      setPasswordSaving(false);
    }
  }

  function resetPasswordEditor() {
    setPasswordForm(initialPassword);
    setEditingPassword(false);
    setPasswordMessage("Password update cancelled.");
  }

  async function handleTaxSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData();
    data.set("taxPercentage", taxForm.tax);

    setTaxSaving(true);
    setTaxMessage(null);

    try {
      const response = await updateSuperadminProfile(data);
      const nextTaxForm = mapProfileToTaxForm(response.data);

      setTaxForm(nextTaxForm);
      setSavedTaxForm(nextTaxForm);
      setTaxMessage("Tax percentage saved.");
    } catch (error) {
      setTaxMessage(getApiErrorMessage(error, "Unable to save tax percentage."));
    } finally {
      setTaxSaving(false);
    }
  }

  function resetTax() {
    setTaxForm(savedTaxForm);
    setTaxMessage("Tax changes discarded.");
  }

  const content = (
      <div className="space-y-6">
          <form onSubmit={handleProfileSubmit}>
            <SettingsCard
              title="Profile Information"
              subtitle="Update your photo and personal details."
              footer={
                <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={resetProfile}
                      disabled={profileSaving || profileLoading}
                      className="rounded-[10px] border border-[#D8DEEA] bg-white px-4 py-2 text-[13px] font-medium text-[#5F6786] transition hover:border-[#BFC8D9]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-[10px] bg-[#5E568E] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#4f487c] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!hasProfileChanges || profileSaving || profileLoading}
                    >
                      {profileSaving ? "Saving..." : "Save"}
                    </button>
                </div>
              }
            >
              <div className="grid gap-5 lg:grid-cols-[84px_minmax(0,1fr)_minmax(0,1fr)]">
                <div className="relative h-[84px] w-[84px]">
                  {avatarSrc ? (
                    <Image src={avatarSrc} alt="Profile" fill className="rounded-full object-cover" sizes="84px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-[#E9ECF3] text-[24px] font-semibold text-[#5E6684]">
                      {profile.name ? getInitials(profile.name) : null}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-[#5E568E] text-white shadow-[0_10px_24px_rgba(94,86,142,0.38)]"
                    aria-label="Upload profile photo"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-[#4F5676]">Name</span>
                  <ProfileInput
                    icon="user"
                    value={profile.name}
                    onChange={(value) => setProfile((current) => ({ ...current, name: value }))}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-[#4F5676]">Email</span>
                  <ProfileInput
                    type="email"
                    icon="email"
                    value={profile.email}
                    onChange={(value) => setProfile((current) => ({ ...current, email: value }))}
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-[#4F5676]">Contact</span>
                <ProfileInput
                  icon="phone"
                  inputMode="tel"
                  value={profile.contact}
                  onChange={(value) => setProfile((current) => ({ ...current, contact: value }))}
                />
              </label>

              {profileMessage ? (
                <p className="mt-4 rounded-[8px] bg-[#F6F7FA] px-4 py-3 text-[13px] text-[#5F6786]">
                  {profileMessage}
                </p>
              ) : null}
            </SettingsCard>
          </form>

          <section className="overflow-hidden rounded-[18px] bg-white shadow-[0_10px_40px_rgba(31,35,61,0.06)]">
            <div className="bg-[#F4F4F4] px-5 py-5 sm:px-6">
              <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-[#23275A]">Password settings</h3>
              <p className="mt-1 text-[13px] text-[#7E84A3]">Keep your account secure with a strong password</p>
            </div>

            <div className="px-5 py-5 sm:px-6">
              {!editingPassword ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[14px] font-medium text-[#23275A]">Password</p>
                    {passwordUpdatedAt ? <p className="mt-1 text-[13px] text-[#7E84A3]">{passwordUpdatedAt}</p> : null}
                    {passwordMessage ? <p className="mt-2 text-[13px] text-[#5E568E]">{passwordMessage}</p> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPassword(true);
                      setPasswordMessage(null);
                    }}
                    className="rounded-[10px] border border-[#D8DEEA] bg-white px-4 py-2 text-[13px] font-medium text-[#5F6786] transition hover:border-[#BFC8D9]"
                  >
                    Update Password
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-[#4F5676]">Current Password</span>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                        }
                        className="h-12 w-full rounded-[12px] border border-[#E1E6F0] px-4 text-[14px] text-[#23275A] outline-none transition focus:border-[#5E568E]"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-[#4F5676]">New Password</span>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                        }
                        className="h-12 w-full rounded-[12px] border border-[#E1E6F0] px-4 text-[14px] text-[#23275A] outline-none transition focus:border-[#5E568E]"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-[#4F5676]">Confirm Password</span>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(event) =>
                          setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                        }
                        className="h-12 w-full rounded-[12px] border border-[#E1E6F0] px-4 text-[14px] text-[#23275A] outline-none transition focus:border-[#5E568E]"
                      />
                    </label>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[13px] text-[#727A96]">{passwordMessage ?? "Use at least 8 characters."}</p>
                    <div className="flex justify-end gap-3">
                      <button
                      type="button"
                      onClick={resetPasswordEditor}
                      disabled={passwordSaving}
                      className="rounded-[10px] border border-[#D8DEEA] bg-white px-4 py-2 text-[13px] font-medium text-[#5F6786] transition hover:border-[#BFC8D9]"
                    >
                        Cancel
                      </button>
                      <button
                      type="submit"
                      disabled={passwordSaving}
                      className="rounded-[10px] bg-[#5E568E] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#4f487c]"
                    >
                        {passwordSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </section>

          <form onSubmit={handleTaxSubmit}>
            <SettingsCard
              title="Tax percentage"
              subtitle="Update your tax settings over here"
              footer={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[13px] text-[#727A96]">{taxMessage ?? "Set the default tax applied across the platform."}</p>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={resetTax}
                      disabled={taxSaving}
                      className="rounded-[10px] border border-[#D8DEEA] bg-white px-4 py-2 text-[13px] font-medium text-[#5F6786] transition hover:border-[#BFC8D9]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-[10px] bg-[#5E568E] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#4f487c] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={!hasTaxChanges || taxSaving}
                    >
                      {taxSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              }
            >
              <label className="block">
                <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.16em] text-[#4F5676]">Tax</span>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxForm.tax}
                    onChange={(event) => setTaxForm({ tax: event.target.value })}
                    className="h-12 w-full rounded-[12px] border border-[#E1E6F0] px-4 pr-10 text-[14px] text-[#23275A] outline-none transition focus:border-[#5E568E]"
                  />
                  <span className="absolute inset-y-0 right-4 flex items-center text-[24px] leading-none text-[#7E84A3]">%</span>
                </div>
              </label>
            </SettingsCard>
          </form>
      </div>
  );

  if (standalone) {
    return (
      <div className="space-y-6">
        <SuperadminPageHeader title="Profile" subtitle="Manage your superadmin account details" />
        {content}
      </div>
    );
  }

  return (
    <SuperadminSettingsShell activeHref="/superadmin/dashboard/settings" title="General Settings" subtitle="Manage your profile">
      {content}
    </SuperadminSettingsShell>
  );
}

export function SuperadminSettingsPricingClient() {
  const [plans, setPlans] = useState(initialPricingPlans);
  const [savedPlans, setSavedPlans] = useState(initialPricingPlans);

  return (
    <SuperadminSettingsShell activeHref="/superadmin/dashboard/settings/pricing" title="Pricing" subtitle="Manage pricing of your app">
      <div className="space-y-6">
        <div className="-mt-12 flex justify-end">
          <p className="text-[10px] text-[#8A91AB]">Last modified by Admin on Oct 24, 2023</p>
        </div>

        <PricingPlanCard
          subtitle="Investor Basic"
          plan={plans.investorBasic}
          onChange={(next) => setPlans((current) => ({ ...current, investorBasic: next }))}
          onCancel={() => setPlans((current) => ({ ...current, investorBasic: savedPlans.investorBasic }))}
          onSave={() => setSavedPlans((current) => ({ ...current, investorBasic: plans.investorBasic }))}
        />

        <PricingPlanCard
          subtitle="Investor Pro"
          plan={plans.investorPro}
          onChange={(next) => setPlans((current) => ({ ...current, investorPro: next }))}
          onCancel={() => setPlans((current) => ({ ...current, investorPro: savedPlans.investorPro }))}
          onSave={() => setSavedPlans((current) => ({ ...current, investorPro: plans.investorPro }))}
        />

        <PricingPlanCard
          subtitle="Investee"
          plan={plans.investee}
          onChange={(next) => setPlans((current) => ({ ...current, investee: next }))}
          onCancel={() => setPlans((current) => ({ ...current, investee: savedPlans.investee }))}
          onSave={() => setSavedPlans((current) => ({ ...current, investee: plans.investee }))}
        />
      </div>
    </SuperadminSettingsShell>
  );
}
