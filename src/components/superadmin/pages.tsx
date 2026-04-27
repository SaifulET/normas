import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSuperadminPayment,
  getSuperadminReport,
  getSuperadminSupportThread,
  getSuperadminUser,
  superadminPayments,
  superadminReports,
  superadminSettingsTabs,
  superadminSupportThreads,
  superadminUsers,
} from "./data";
import {
  SuperadminAvatar,
  SuperadminBackLink,
  SuperadminDocumentCard,
  SuperadminNotificationButton,
  SuperadminPageHeader,
  SuperadminSearch,
  SuperadminStatusBadge,
} from "./shell";
import {
  SuperadminSupportDetailStatusDropdown,
  SuperadminReportDetailActionMenu,
  SuperadminReportsPanel,
  SuperadminSupportPanel,
} from "./report-controls";
import { SuperadminPaymentActionMenu, SuperadminUserActionMenu } from "./user-action-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroup03Icon } from "@hugeicons/core-free-icons";

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`rounded-[14px] border border-[#E6E9F0] bg-white ${className ?? ""}`}>{children}</section>;
}

function TableCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SectionCard className="overflow-hidden">{children}</SectionCard>;
}

function TableFooter() {
  return (
    <div className="flex items-center justify-between border-t border-[#EEF1F6] px-4 py-3 text-[10px] text-[#727A96]">
      <p>Showing 1-4 of 24 members</p>
      <div className="flex items-center gap-2">
        <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-[8px] border border-[#E4E8F0] text-[#C2C8D6]">
          {"<"}
        </button>
        <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-[8px] border border-[#CFD5E3] bg-white text-[#4A5271]">
          1
        </button>
        <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-[8px] border border-[#E4E8F0] text-[#9AA1B6]">
          2
        </button>
        <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-[8px] border border-[#E4E8F0] text-[#C2C8D6]">
          {">"}
        </button>
      </div>
    </div>
  );
}

function OverviewCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <SectionCard className="p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#8A91AB]">{label}</p>
      <p className="mt-2 text-[38px] font-semibold tracking-[-0.05em] text-[#1E2242]">{value}</p>
    </SectionCard>
  );
}

function SettingsTabNav({
  activeHref,
}: {
  activeHref: string;
}) {
  return (
    <div className="w-[160px] space-y-4">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.04em] text-[#202350]">Settings</h1>
        <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Workspace</p>
      </div>

      <div className="space-y-1">
        {superadminSettingsTabs.map((tab) => {
          const active = activeHref === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center rounded-[10px] px-3 py-2.5 text-[12px] transition ${
                active ? "bg-[#4E4A86] text-white" : "text-[#4C5472] hover:bg-white"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function SettingsScaffold({
  activeHref,
  children,
  heading,
  subtitle,
  meta,
}: {
  activeHref: string;
  children: React.ReactNode;
  heading: string;
  subtitle: string;
  meta?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-8 lg:grid-cols-[160px_minmax(0,1fr)]">
        <SettingsTabNav activeHref={activeHref} />
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[28px] font-semibold tracking-[-0.04em] text-[#202350]">{heading}</h2>
              <p className="mt-1 text-[13px] text-[#69729A]">{subtitle}</p>
            </div>
            {meta ? <p className="text-[11px] text-[#8A91AB]">{meta}</p> : null}
          </div>

          <div className="mt-5 space-y-5">{children}</div>
        </div>
      </div>

      <p className="text-center text-[10px] text-[#A0A7BD]">All rights reserved to © 2026 Mooment</p>
    </div>
  );
}

function ContentEditor() {
  return (
    <SectionCard className="overflow-hidden">
      <div className="flex items-center gap-1 border-b border-[#EEF1F6] px-3 py-2 text-[#8B93AC]">
        <button type="button" className="rounded border border-[#E4E8F0] px-2 py-1 text-[10px]">
          Paragraph
        </button>
        <button type="button" className="rounded px-1.5 py-1 text-[10px] font-semibold">
          B
        </button>
        <button type="button" className="rounded px-1.5 py-1 text-[10px] italic">
          I
        </button>
        <button type="button" className="rounded px-1.5 py-1 text-[10px]">
          U
        </button>
        <button type="button" className="rounded px-1.5 py-1 text-[10px]">
          •
        </button>
      </div>
      <textarea
        defaultValue=""
        placeholder="Type here..."
        className="min-h-[196px] w-full resize-y border-0 px-4 py-4 text-sm text-[#20243A] outline-none placeholder:text-[#B0B6C8]"
      />
      <div className="flex justify-end gap-2 border-t border-[#EEF1F6] px-3 py-2">
        <button type="button" className="rounded-[8px] bg-[#F1F3F8] px-3 py-1.5 text-[11px] text-[#5E6684]">
          Cancel
        </button>
        <button type="button" className="rounded-[8px] bg-[#4E4A86] px-3 py-1.5 text-[11px] text-white">
          Save
        </button>
      </div>
    </SectionCard>
  );
}

function DisplayCard() {
  return (
    <div className="rounded-[14px] border border-[#ECEFF6] bg-white px-4 py-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-px flex-1 bg-[#ECEFF6]" />
        <p className="px-3 text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Display on landing page</p>
        <div className="h-px flex-1 bg-[#ECEFF6]" />
      </div>

      <div className="flex justify-end gap-3 text-[#8B93AC]">
        <button type="button" className="text-sm">
          Edit
        </button>
        <button type="button" className="text-sm text-[#F97316]">
          Delete
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-[#202350]">1. Introduction</h3>
          <p className="mt-2 text-[13px] leading-6 text-[#5D6584]">
            Our platform unifies all customer communication channels: WhatsApp, Twilio (SMS), and Gmail into a single shared inbox. Teams can collaborate, assign conversations, and respond to customers without switching tools, making customer support faster, simpler, and more organized.
          </p>
        </div>
        <div>
          <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-[#202350]">2. Our Saas Application</h3>
          <p className="mt-2 text-[13px] leading-6 text-[#5D6584]">
            Our platform unifies all customer communication channels: WhatsApp, Twilio (SMS), and Gmail into a single shared inbox. Teams can collaborate, assign conversations, and respond to customers without switching tools, making customer support faster, simpler, and more organized.
          </p>
        </div>
        <div>
          <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-[#202350]">3. Our Vision</h3>
          <p className="mt-2 text-[13px] leading-6 text-[#5D6584]">
            This content can be edited here and then surfaced on the landing page after approval from the admin workspace.
          </p>
        </div>
      </div>
    </div>
  );
}

export function SuperadminDashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <SuperadminPageHeader
        title="Dashboard"
        subtitle="Overview of platform activity"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <OverviewCard label="Total Users" value="24" />
        <OverviewCard label="Payments" value="$840" />
        <OverviewCard label="Pending Reports" value="02" />
        <OverviewCard label="Open Support" value="02" />
      </div>

      <SectionCard className="p-6">
        <h2 className="text-lg font-semibold text-[#202350]">Quick Summary</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[#5D6584]">
          This separate superadmin workspace gives you operational oversight of users, payments, reports, support, and policy settings without touching the investor or investee dashboards.
        </p>
      </SectionCard>
    </div>
  );
}

export function SuperadminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <SuperadminPageHeader title="Analytics" subtitle="Track platform performance trends" />

      <div className="grid gap-4 md:grid-cols-3">
        <OverviewCard label="Revenue" value="$12.5K" />
        <OverviewCard label="New Signups" value="114" />
        <OverviewCard label="Avg. Resolution" value="2.4d" />
      </div>

      <SectionCard className="p-6">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-lg font-semibold text-[#202350]">Monthly Growth</h2>
            <div className="mt-5 flex h-[220px] items-end gap-3 rounded-[12px] bg-[#F7F8FC] p-5">
              {[46, 62, 74, 59, 86, 94, 78].map((height, index) => (
                <div key={index} className="flex-1 rounded-t-[10px] bg-[#4E4A86]" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#202350]">Breakdown</h2>
            <div className="mt-5 space-y-3">
              {[
                ["Users", "48%"],
                ["Payments", "26%"],
                ["Reports", "12%"],
                ["Support", "14%"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-[12px] bg-[#F7F8FC] px-4 py-3">
                  <span className="text-sm text-[#5D6584]">{label}</span>
                  <span className="text-sm font-semibold text-[#202350]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export function SuperadminUserManagementPage() {
  return (
    <div className="space-y-6">
      <SuperadminPageHeader title="User Management" subtitle="Manage personnel access credentials" />

      <SectionCard className="flex items-center justify-between p-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Total User</p>
          <p className="mt-1 text-[18px] font-semibold text-[#202350]">24</p>
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F2ECFB] text-[#7E61B5]">
          <HugeiconsIcon icon={UserGroup03Icon} />
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <SuperadminSearch />
      </div>

      <TableCard>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_48px] gap-4 border-b border-[#EEF1F6] px-6 py-4 text-[11px] text-[#8A91AB]">
          <p>Name</p>
          <p>Account Type</p>
          <p>Joining Date</p>
          <p>Account Status</p>
          <p className="text-right">Actions</p>
        </div>

        {superadminUsers.map((user) => (
          <div
            key={user.slug}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_48px] gap-4 border-b border-[#F3F5F9] px-6 py-3 last:border-b-0"
          >
            <Link href={`/superadmin/dashboard/user-management/${user.slug}`} className="flex items-center gap-3">
              <SuperadminAvatar from={user.avatarFrom} to={user.avatarTo} initials={user.initials} size={28} />
              <div>
                <p className="text-[13px] font-medium text-[#202350]">{user.name}</p>
                <p className="text-[11px] text-[#8A91AB]">{user.email}</p>
              </div>
            </Link>
            <p className="text-[13px] text-[#34395B]">{user.accountType}</p>
            <p className="text-[13px] text-[#34395B]">{user.joiningDate}</p>
            <div>
              <SuperadminStatusBadge status={user.status} />
            </div>
            <div className="flex justify-end">
              <SuperadminUserActionMenu slug={user.slug} />
            </div>
          </div>
        ))}

        <TableFooter />
      </TableCard>
    </div>
  );
}

export function SuperadminUserDetailPage({
  slug,
}: {
  slug: string;
}) {
  const user = getSuperadminUser(slug);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <SuperadminBackLink href="/superadmin/dashboard/user-management" />
          <div>
            <h1 className="text-[22px] font-semibold tracking-[-0.04em] text-[#202350]">Detail of user</h1>
            <p className="mt-1 text-[13px] text-[#69729A]">This section will help you to view information of the user</p>
          </div>
        </div>
        <SuperadminNotificationButton />
      </div>

      <div className="pt-4">
        <div className="flex items-start gap-5">
          <SuperadminAvatar from={user.avatarFrom} to={user.avatarTo} initials={user.initials} size={78} />
          <div className="pt-1">
            <div className="flex items-center gap-2">
              <SuperadminStatusBadge status={user.status} />
              <span className="rounded-full bg-[#E5E7EB] px-2 py-1 text-[10px] font-medium text-[#4B5563]">{user.accountType} Account</span>
            </div>
            <p className="mt-2 text-[16px] font-medium text-[#202350]">{user.name}</p>
            <p className="mt-0.5 text-[12px] text-[#6D7592]">{user.username}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-x-5 gap-y-7 pt-6 md:grid-cols-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#4B5563]">Email</p>
          <div className="mt-3 border-b border-[#AEB4C3] pb-3 text-[14px] text-[#202350]">{user.email}</div>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#4B5563]">Username</p>
          <div className="mt-3 border-b border-[#AEB4C3] pb-3 text-[14px] text-[#202350]">{user.username}</div>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#4B5563]">Gender</p>
          <div className="mt-3 border-b border-[#AEB4C3] pb-3 text-[14px] text-[#202350]">{user.gender}</div>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#4B5563]">Age</p>
          <div className="mt-3 border-b border-[#AEB4C3] pb-3 text-[14px] text-[#202350]">{user.age}</div>
        </div>

        <div className="md:col-span-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#4B5563]">Address</p>
          <div className="mt-3 border-b border-[#AEB4C3] pb-3 text-[14px] text-[#202350]">{user.address}</div>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#4B5563]">Joining Date</p>
          <div className="mt-3 border-b border-[#AEB4C3] pb-3 text-[14px] text-[#202350]">{user.joiningDate}</div>
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-[0.08em] text-[#4B5563]">DELETION (30 days timeline)</p>
          <div className="mt-3 border-b border-[#AEB4C3] pb-3 text-[14px] text-[#EF4444]">{user.deletionLabel}</div>
        </div>
      </div>

      <div className="pt-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#4B5563]">Bio</p>
        <div className="mt-3 border-b border-[#AEB4C3] pb-3 text-[13px] leading-6 text-[#34395B]">{user.bio}</div>
      </div>

      {user.businessDocument ? (
        <div className="pt-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#4B5563]">Document of the business</p>
          <div className="mt-3">
            <SuperadminDocumentCard fileName={user.businessDocument} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SuperadminPaymentManagementPage() {
  return (
    <div className="space-y-6">
      <SuperadminPageHeader title="Payment Management" subtitle="Manage payment information" />

      <div className="flex justify-end">
        <SuperadminSearch />
      </div>

      <TableCard>
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_0.8fr_48px] gap-4 border-b border-[#EEF1F6] px-6 py-4 text-[11px] text-[#8A91AB]">
          <p>Name</p>
          <p>Account Type</p>
          <p>Type of Product</p>
          <p>Payment Date</p>
          <p>Amount</p>
          <p className="text-right">Actions</p>
        </div>

        {superadminPayments.map((payment) => {
          const user = getSuperadminUser(payment.userSlug);

          if (!user) {
            return null;
          }

          return (
            <div
              key={payment.slug}
              className="grid grid-cols-[1.6fr_1fr_1fr_1fr_0.8fr_48px] gap-4 border-b border-[#F3F5F9] px-6 py-3 last:border-b-0"
            >
              <Link href={`/superadmin/dashboard/payment-management/${payment.slug}`} className="flex items-center gap-3">
                <SuperadminAvatar from={user.avatarFrom} to={user.avatarTo} initials={user.initials} size={28} />
                <div>
                  <p className="text-[13px] font-medium text-[#202350]">{user.name}</p>
                  <p className="text-[11px] text-[#8A91AB]">{user.email}</p>
                </div>
              </Link>
              <p className="text-[13px] text-[#34395B]">{user.accountType}</p>
              <p className="text-[13px] text-[#34395B]">{payment.productType}</p>
              <p className="text-[13px] text-[#34395B]">{payment.paymentDate}</p>
              <p className="text-[13px] text-[#34395B]">{payment.amount}</p>
              <div className="flex justify-end">
                <SuperadminPaymentActionMenu slug={payment.slug} />
              </div>
            </div>
          );
        })}

        <TableFooter />
      </TableCard>
    </div>
  );
}

export function SuperadminPaymentDetailPage({
  slug,
}: {
  slug: string;
}) {
  const payment = getSuperadminPayment(slug);

  if (!payment) {
    notFound();
  }

  const user = getSuperadminUser(payment.userSlug);

  if (!user) {
    notFound();
  }

  return (
    <div className="pl-[25px] pt-[40px]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <SuperadminBackLink href="/superadmin/dashboard/payment-management" />
          <div>
            <h1 className="text-[20px] font-semibold tracking-[-0.04em] text-[#202350]">Detail of payment</h1>
            <p className="mt-1 text-[13px] text-[#69729A]">This section will help you to view information of the user purchased item</p>
          </div>
        </div>
        <SuperadminNotificationButton />
      </div>

      <div className="pt-[20px]">
        <div className="flex items-start gap-5">
          <SuperadminAvatar from={user.avatarFrom} to={user.avatarTo} initials={user.initials} size={78} />
          <div className="pt-2">
            <div className="flex items-center gap-2">
              <SuperadminStatusBadge status={user.status} />
              <span className="rounded-full bg-[#E5E7EB] px-3 py-1 text-[10px] font-medium text-[#4B5563]">{user.accountType} Account</span>
            </div>
            <p className="mt-3 text-[16px] font-medium leading-none text-[#202350]">{user.name}</p>
            <p className="mt-1 text-[12px] leading-none text-[#6D7592]">{user.username}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 pt-[20px] md:grid-cols-4">
        {[
          ["Mooment Credits", payment.moomentCredits],
          ["Product", payment.productAmount],
          ["Ticket", payment.ticketAmount],
          ["Total", payment.totalAmount],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-[15px] text-[#202350]">{label}</p>
            <p className="mt-1 text-[32px] font-semibold tracking-[-0.05em] text-[#1D1F2E]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SuperadminReportsPage() {
  return (
    <div className="space-y-6">
      <SuperadminPageHeader title="Report" subtitle="Manage mooment app report" />
      <SuperadminReportsPanel records={superadminReports} />
    </div>
  );
}

export function SuperadminReportDetailPage({
  slug,
}: {
  slug: string;
}) {
  const report = getSuperadminReport(slug);

  if (!report) {
    notFound();
  }

  const reportedUser = getSuperadminUser(report.reportedUserSlug);
  const reporters = superadminReports
    .filter((item) => item.slug === slug || item.type === report.type)
    .slice(0, 3)
    .map((item) => getSuperadminUser(item.reportBySlug))
    .filter(Boolean);

  if (!reportedUser) {
    notFound();
  }

  const resolvedReporters = reporters.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <SuperadminBackLink href="/superadmin/dashboard/reports" />
          <div>
            <h1 className="text-[20px] font-semibold tracking-[-0.04em] text-[#202350]">Report Details</h1>
            <p className="mt-1 text-[13px] text-[#69729A]">This page contain result of the report, so that admin can assess the whole thing.</p>
          </div>
        </div>
        <SuperadminNotificationButton />
      </div>

      <SectionCard className="overflow-visible rounded-[18px] px-10 pb-10 pt-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-x-24">
            <div className="flex items-center gap-3">
              <span className="text-[16px] tracking-[-0.18em] text-[#6B7280]">||||</span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Report ID</p>
                <p className="mt-1 text-[13px] text-[#202350]">{report.reportId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#6B7280]">Nº</span>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Report Count</p>
                <p className="mt-1 text-[13px] text-[#202350]">{report.reportCount}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 xl:items-end">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-[10px] bg-[#F1F3F8] px-4 py-2 text-sm font-medium text-[#5E6684]"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-[10px] bg-[#4E4A86] px-4 py-2 text-sm font-medium text-white"
              >
                Update
              </button>
            </div>
            <SuperadminReportDetailActionMenu />
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
          <div>
            <p className="mb-3 text-[11px] font-medium text-[#202350]">Reported Content</p>
            <div className="rounded-[14px] bg-white">
              <Image
                src={report.imageSrc}
                alt="Reported content"
                width={860}
                height={520}
                className="h-[288px] w-full rounded-[12px] object-cover"
              />
              <p className="pt-2 text-[11px] leading-5 text-[#535C79]">{report.contentText}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <SuperadminStatusBadge status={report.status} />
            </div>

            <div>
              <p className="mb-3 text-[11px] font-medium text-[#202350]">Reported User</p>
              <div className="flex items-center gap-3 rounded-[14px] bg-[#FBFCFE] px-4 py-4">
                <SuperadminAvatar
                  from={reportedUser.avatarFrom}
                  to={reportedUser.avatarTo}
                  initials={reportedUser.initials}
                  size={42}
                />
                <div>
                  <p className="text-sm font-medium text-[#202350]">{reportedUser.name}</p>
                  <p className="text-[11px] text-[#8A91AB]">{reportedUser.username}</p>
                </div>
              </div>
            </div>

            <div className="max-h-[292px] space-y-5 overflow-y-auto pr-2">
              {resolvedReporters.map((item, index) =>
                item ? (
                  <div
                    key={`${item.slug}-${index}`}
                    className="grid gap-5 border-b border-[#EEF1F6] pb-5 last:border-b-0 last:pb-0 sm:grid-cols-[0.9fr_1.1fr]"
                  >
                    <div>
                      <p className="mb-3 text-[11px] font-medium text-[#202350]">Reported By</p>
                      <div className="flex items-center gap-3">
                        <SuperadminAvatar from={item.avatarFrom} to={item.avatarTo} initials={item.initials} size={38} />
                        <div>
                          <p className="text-sm font-medium text-[#202350]">{item.name}</p>
                          <p className="text-[11px] text-[#8A91AB]">{item.username}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-[11px] font-medium text-[#202350]">Reported Reason</p>
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#6B7280]">Content Violations</p>
                      <p className="mt-1 text-[12px] text-[#535C79]">{report.reportedReason}</p>
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export function SuperadminSupportCenterPage() {
  return (
    <div className="space-y-6">
      <SuperadminPageHeader title="Support Center" subtitle="Manage customer support here" />
      <SuperadminSupportPanel records={superadminSupportThreads} />
    </div>
  );
}

export function SuperadminSupportDetailPage({
  slug,
}: {
  slug: string;
}) {
  const thread = getSuperadminSupportThread(slug);

  if (!thread) {
    notFound();
  }

  const user = getSuperadminUser(thread.userSlug);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <SuperadminBackLink href="/superadmin/dashboard/support-center" />
          <div>
            <h1 className="text-[20px] font-semibold tracking-[-0.04em] text-[#202350]">View Support message</h1>
            <p className="mt-1 text-[13px] text-[#69729A]">This section will help you to view message of that client</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-[10px] bg-[#F1F3F8] px-4 py-2 text-sm text-[#5E6684]">Cancel</button>
          <button type="button" className="rounded-[10px] bg-[#4E4A86] px-4 py-2 text-sm text-white">Update</button>
        </div>
      </div>

      <SectionCard className="p-4 mx-[32px]">
        <div className="grid gap-4 md:grid-cols-[44px_138px_138px_minmax(0,1fr)] md:items-start">
          <div className="md:row-span-2">
            <SuperadminAvatar from={user.avatarFrom} to={user.avatarTo} initials={user.initials} size={42} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Date</p>
            <p className="mt-1 text-[14px] font-medium text-[#202350]">{thread.date}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Status</p>
            <div className="mt-2">
              <SuperadminStatusBadge status={thread.status} />
            </div>
          </div>
          <div className="flex justify-start md:justify-end">
            <SuperadminSupportDetailStatusDropdown initialValue={thread.status} />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Name</p>
            <p className="mt-1 text-[14px] font-medium text-[#202350]">{user.name}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Email</p>
            <p className="mt-1 text-[14px] font-medium text-[#202350]">{user.email}</p>
          </div>
          <div />
        </div>

        <div className="mt-5 space-y-4">
          <div className="max-w-[560px] rounded-[18px] bg-[#F7F7FC] px-5 py-4">
            <p className="text-sm font-semibold text-[#202350]">This is the title of the message</p>
            <p className="mt-3 text-sm leading-7 text-[#59617F]">{thread.body}</p>
          </div>
          <div className="ml-auto max-w-[560px] rounded-[18px] bg-[#F7F7FC] px-5 py-4">
            <p className="text-sm font-semibold text-[#202350]">This is the title of the message</p>
            <p className="mt-3 text-sm leading-7 text-[#59617F]">{thread.reply}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="p-4 mx-[32px]">
        <textarea
          placeholder="Type here . . ."
          className="min-h-[140px] w-full resize-y border-0 bg-transparent text-sm text-[#202350] outline-none placeholder:text-[#AAB0C2]"
        />
        <div className="mt-3 flex justify-end">
          <button type="button" className="rounded-[10px] bg-[#4E4A86] px-5 py-2 text-sm text-white">Send</button>
        </div>
      </SectionCard>
    </div>
  );
}

export function SuperadminSettingsGeneralPage() {
  return (
    <SettingsScaffold
      activeHref="/superadmin/dashboard/settings"
      heading="General Settings"
      subtitle="Manage your profile"
    >
      <SectionCard className="p-5">
        <h3 className="text-lg font-semibold text-[#202350]">Profile Information</h3>
        <p className="mt-1 text-[13px] text-[#69729A]">Update your photo and personal details.</p>

        <div className="mt-5 grid gap-4 lg:grid-cols-[auto_1fr_1fr]">
          <div className="flex items-center gap-3">
            <SuperadminAvatar from="#F97316" to="#8B5CF6" initials="TR" size={60} />
          </div>
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[#8A91AB]">Name</span>
            <input defaultValue="John Doe" className="h-11 w-full rounded-[10px] border border-[#E2E6EF] px-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[#8A91AB]">Email</span>
            <input defaultValue="example@gmail.com" className="h-11 w-full rounded-[10px] border border-[#E2E6EF] px-3 text-sm outline-none" />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[#8A91AB]">Contact</span>
          <input defaultValue="+1 265 665 2266" className="h-11 w-full rounded-[10px] border border-[#E2E6EF] px-3 text-sm outline-none" />
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="rounded-[8px] bg-[#F1F3F8] px-3 py-1.5 text-[11px] text-[#5E6684]">Cancel</button>
          <button type="button" className="rounded-[8px] bg-[#4E4A86] px-3 py-1.5 text-[11px] text-white">Save</button>
        </div>
      </SectionCard>

      <SectionCard className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#202350]">Password settings</h3>
            <p className="mt-1 text-[13px] text-[#69729A]">Keep your account secure with a strong password</p>
          </div>
          <button type="button" className="rounded-[8px] border border-[#DDE2EC] px-3 py-2 text-[11px] text-[#5E6684]">Update Password</button>
        </div>
      </SectionCard>

      <SectionCard className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#202350]">Miscellanies settings</h3>
            <p className="mt-1 text-[13px] text-[#69729A]">Personalize your dashboard</p>
          </div>
          <label className="inline-flex items-center gap-3 text-sm text-[#202350]">
            <span>Dark Mode</span>
            <input type="checkbox" className="h-4 w-8 accent-[#4E4A86]" />
          </label>
        </div>
      </SectionCard>
    </SettingsScaffold>
  );
}

export function SuperadminSettingsMoomentCreditPage() {
  return (
    <SettingsScaffold
      activeHref="/superadmin/dashboard/settings/mooment-credit"
      heading="Mooment Credit"
      subtitle="Manage Mooment credit of your app"
      meta="Last modified by Admin on Oct 24, 2023"
    >
      {[1, 2].map((item, index) => (
        <SectionCard key={item} className="overflow-hidden">
          <div className="px-5 py-4">
            <h3 className="text-lg font-semibold text-[#202350]">Mooment Credit Package</h3>
          </div>
          <div className="grid gap-4 px-5 pb-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[#8A91AB]">Package Name</span>
              <input defaultValue="25 Mooments credit for" className="h-11 w-full rounded-[10px] border border-[#E2E6EF] px-3 text-sm outline-none" />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[#8A91AB]">Mooment Credit</span>
              <input defaultValue="25" className="h-11 w-full rounded-[10px] border border-[#E2E6EF] px-3 text-sm outline-none" />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[#8A91AB]">USD</span>
              <input defaultValue="$ 26.25" className="h-11 w-full rounded-[10px] border border-[#E2E6EF] px-3 text-sm outline-none" />
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[#8A91AB]">Commission</span>
              <input defaultValue="5" className="h-11 w-full rounded-[10px] border border-[#E2E6EF] px-3 text-sm outline-none" />
            </label>
          </div>
          <div className="flex items-center justify-between bg-black px-5 py-3">
            <button type="button" className="text-[11px] text-white">{index === 0 ? "+ Add Package" : ""}</button>
            <div className="flex gap-2">
              <button type="button" className="rounded-[8px] bg-[#EDEFF4] px-3 py-1.5 text-[11px] text-[#555E7A]">Cancel</button>
              <button type="button" className="rounded-[8px] bg-[#4E4A86] px-3 py-1.5 text-[11px] text-white">
                {index === 0 ? "Update Package" : "Add Package"}
              </button>
            </div>
          </div>
        </SectionCard>
      ))}
    </SettingsScaffold>
  );
}

export function SuperadminSettingsPricingPage() {
  return (
    <SettingsScaffold
      activeHref="/superadmin/dashboard/settings/pricing"
      heading="Pricing"
      subtitle="Manage pricing of your app"
      meta="Last modified by Admin on Oct 24, 2023"
    >
      <SectionCard className="p-5">
        <div className="grid gap-4">
          {["Tax", "Credit Card Fee", "Apple Payout Fee", "Platform Fee", "Product Percentage", "Ticket Percentage"].map((label) => (
            <label key={label} className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[#8A91AB]">{label}</span>
              <div className="relative">
                <input defaultValue="5" className="h-11 w-full rounded-[10px] border border-[#E2E6EF] px-3 pr-10 text-sm outline-none" />
                <span className="absolute inset-y-0 right-3 flex items-center text-sm text-[#7B839F]">%</span>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="rounded-[8px] bg-[#F1F3F8] px-3 py-1.5 text-[11px] text-[#5E6684]">Cancel</button>
          <button type="button" className="rounded-[8px] bg-[#4E4A86] px-3 py-1.5 text-[11px] text-white">Save</button>
        </div>
      </SectionCard>
    </SettingsScaffold>
  );
}

export function SuperadminSettingsTermsPage() {
  return (
    <SettingsScaffold
      activeHref="/superadmin/dashboard/settings/terms-conditions"
      heading="Terms & Conditions"
      subtitle="Set terms & conditions of your Mooment app"
      meta="Last modified by Admin on Oct 24, 2023"
    >
      <ContentEditor />
      <DisplayCard />
    </SettingsScaffold>
  );
}

export function SuperadminSettingsPrivacyPage() {
  return (
    <SettingsScaffold
      activeHref="/superadmin/dashboard/settings/privacy-policy"
      heading="Privacy & Policy"
      subtitle="Set privacy & policies of your Mooment app"
      meta="Last modified by Admin on Oct 24, 2023"
    >
      <ContentEditor />
      <DisplayCard />
    </SettingsScaffold>
  );
}
