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
  SuperadminReportDetailActionMenu,
  SuperadminReportsPanel,
  SuperadminSupportPanel,
} from "./report-controls";
import { PaymentDetailClient, SupportMessageDetailClient } from "./detail-interactions";
import { SuperadminPaymentActionMenu } from "./user-action-menu";
import { SuperadminSettingsGeneralClient, SuperadminSettingsPricingClient, SuperadminSettingsShell } from "./settings-general-client";
import { LegalSettingsClient } from "./legal-settings-client";
import { FaqSettingsClient } from "./faq-settings-client";
import { SuperadminAnalyticsClient, SuperadminDashboardOverviewClient } from "./overview-analytics-client";
import { SuperadminUserDetailClient } from "./admin-user-detail-client";
import { SuperadminUserManagementClient } from "./admin-users-client";
import { SuperadminReportDetailClient } from "./report-detail-client";

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

export function SettingsTabNav({
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

export function SettingsScaffold({
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

export function ContentEditor() {
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

export function DisplayCard() {
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
  return <SuperadminDashboardOverviewClient />;
}

export function SuperadminAnalyticsPage() {
  return <SuperadminAnalyticsClient />;
}

export function SuperadminUserManagementPage() {
  return (
    <div className="space-y-6">
      <SuperadminPageHeader title="User Management" subtitle="Manage personnel access credentials" />
      <SuperadminUserManagementClient />
    </div>
  );
}

export function SuperadminUserDetailPage({
  slug,
}: {
  slug: string;
}) {
  return (
    <div className="space-y-8">
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

      <SuperadminUserDetailClient userId={slug} />
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
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <SuperadminBackLink href="/superadmin/dashboard/payment-management" />
          <div>
            <h1 className="text-[20px] font-semibold tracking-[-0.04em] text-[#202350]">View Payment information</h1>
            <p className="mt-1 text-[13px] text-[#69729A]">This section will help you to view plan of the user</p>
          </div>
        </div>
        <SuperadminNotificationButton />
      </div>

      <section className="space-y-8 rounded-[26px]  px-6 py-6  sm:px-8 lg:px-10">
        <div className="grid gap-5 md:grid-cols-[52px_repeat(2,minmax(0,180px))_minmax(0,1fr)] md:items-start">
          <div className="md:row-span-2">
            <SuperadminAvatar from={user.avatarFrom} to={user.avatarTo} initials={user.initials} size={52} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Billing Date</p>
            <p className="mt-1 text-[14px] font-medium text-[#202350]">October 12, 2026</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Status</p>
            <div className="mt-2">
              <span className="rounded-full bg-[#FFF2E5] px-2 py-1 text-[10px] font-medium text-[#F08A32]">Pending</span>
            </div>
          </div>
          <div />
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Name</p>
            <p className="mt-1 text-[14px] font-medium text-[#202350]">{user.name}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Email</p>
            <p className="mt-1 text-[14px] font-medium text-[#202350]">{user.email}</p>
          </div>
        </div>

        <PaymentDetailClient payment={payment} user={user} />
      </section>
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
  if (/^[a-f\d]{24}$/i.test(slug)) {
    return <SuperadminReportDetailClient reportId={slug} />;
  }

  const reportResult = getSuperadminReport(slug);

  if (!reportResult) {
    return notFound();
  }

  const report = reportResult;

  const reportedUserResult = getSuperadminUser(report.reportedUserSlug);
  const reporters = superadminReports
    .filter((item) => item.slug === slug || item.type === report.type)
    .slice(0, 3)
    .map((item) => getSuperadminUser(item.reportBySlug))
    .filter(Boolean);

  if (!reportedUserResult) {
    return notFound();
  }

  const reportedUser = reportedUserResult;

  const resolvedReporters = reporters.slice(0, 3);
  const primaryReporter = resolvedReporters[0];
  const reportMeta = [
    ["Asking Price", "$45,000"],
    ["Condition", "Used"],
    ["Manufacturer", "Doosan"],
    ["Model", "DN Solutions Lynx 2100A"],
    ["Shipping Available", "Yes"],
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <SuperadminBackLink href="/superadmin/dashboard/reports" />
          <div>
            <h1 className="text-[20px] font-semibold tracking-[-0.04em] text-[#202350]">View Report</h1>
            <p className="mt-1 text-[13px] text-[#69729A]">This section will help you to view report of the pitch</p>
          </div>
        </div>
        <SuperadminNotificationButton />
      </div>

      <section className="space-y-8 rounded-[26px]  px-6 py-6  sm:px-8 lg:px-10">
        <div className="grid gap-5 md:grid-cols-[64px_repeat(2,minmax(0,220px))_minmax(0,1fr)] md:items-start">
          <div className="md:row-span-2">
            <SuperadminAvatar from={reportedUser.avatarFrom} to={reportedUser.avatarTo} initials={reportedUser.initials} size={64} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Date</p>
            <p className="mt-1 text-[14px] font-medium text-[#202350]">October 12, 2026</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Status</p>
            <div className="mt-2">
              <SuperadminStatusBadge status={report.status} />
            </div>
          </div>
          <div className="flex justify-start md:justify-end">
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#DDE2EC]  px-4 text-[13px] text-[#525B79]"
            >
              <span>Status</span>
              <span className="text-[10px]">▼</span>
            </button>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Name</p>
            <p className="mt-1 text-[14px] font-medium text-[#202350]">{reportedUser.name}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#8A91AB]">Email</p>
            <p className="mt-1 text-[14px] font-medium text-[#202350]">{reportedUser.email}</p>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#E6A29B] bg-[#FFF9F8] px-6 py-5">
          <h2 className="text-[16px] font-semibold text-[#231F20]">Report</h2>
          <p className="mt-3 text-[14px] leading-7 text-[#2D3142]">{report.contentText}</p>
        </div>

        <Image
          src={report.imageSrc}
          alt="Reported pitch"
          width={1360}
          height={760}
          className="h-[250px] w-full rounded-[18px] object-cover sm:h-[340px]"
        />

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between px-[107px]">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#7D86A2]">
              <span>United Kingdom</span>
              <span>•</span>
              <span>412 views</span>
            </div>
            <h2 className="mt-4 text-[30px] font-semibold tracking-[-0.04em] text-[#27324A]">CarbonLedger AI Project for windmill</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {["Series A", "Climate Tech"].map((tag) => (
                <span key={tag} className="rounded-full bg-[#D7DEE7] px-4 py-1.5 text-[12px] font-medium text-[#475066]">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#324B6B] px-5 text-[14px] font-medium text-white"
          >
            Suspend Content
          </button>
        </div>

        <div className=" px-[107px]">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-x-10 gap-y-3 text-[13px] text-[#7B84A0]">
              <div>
                <span className="text-[#95A0BA]">Funding target</span>
                <span className="ml-3 text-[24px] font-semibold tracking-[-0.03em] text-[#27324A]">£4.0M</span>
              </div>
              <div>
                <span className="text-[#95A0BA]">Report ID</span>
                <span className="ml-3 font-medium text-[#27324A]">{report.reportId}</span>
              </div>
              <div>
                <span className="text-[#95A0BA]">Report Count</span>
                <span className="ml-3 font-medium text-[#27324A]">{report.reportCount}</span>
              </div>
            </div>

            <div className="space-y-5 text-[15px] leading-8 text-[#6B748F]">
              <h3 className="text-[16px] font-semibold text-[#27324A]">Equipment Details</h3>
              <div className="space-y-5">
                <p>
                  AI Project Overview for Windmill Optimization
                  <br />
                  This project focuses on leveraging artificial intelligence to enhance the efficiency and performance of windmills. By integrating AI-driven analytics and predictive maintenance, the system aims to optimize energy output while reducing downtime and operational costs.
                </p>
                <div>
                  <p className="font-semibold text-[#27324A]">Key Components:</p>
                  <p>1. Data Collection: Sensors installed on windmills gather real-time data on wind speed, blade angle, temperature, and vibration.</p>
                  <p>2. Predictive Analytics: Machine learning models analyze the data to forecast maintenance needs, preventing unexpected failures.</p>
                  <p>3. Performance Optimization: AI algorithms adjust blade pitch and rotation speed dynamically to maximize energy capture based on current wind conditions.</p>
                  <p>4. Energy Forecasting: The system predicts energy production trends to aid in grid management and resource planning.</p>
                </div>
                <div>
                  <p className="font-semibold text-[#27324A]">Benefits:</p>
                  <p>- Increased energy efficiency and output.</p>
                  <p>- Reduced maintenance costs and downtime.</p>
                  <p>- Extended lifespan of windmill components.</p>
                  <p>- Enhanced decision-making through data-driven insights.</p>
                </div>
                <p>
                  Implementation involves collaboration between AI specialists, mechanical engineers, and energy experts to ensure seamless integration and continuous improvement. This project represents a significant step towards sustainable and smart renewable energy solutions.
                </p>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#EDF1F6] bg-[#FCFDFE] px-4 py-4">
              <p className="text-[12px] font-medium text-[#5F6786]">Additional Details</p>
              <div className="mt-4 space-y-4">
                {reportMeta.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-6 text-[13px]">
                    <span className="text-[#3F4863]">{label}</span>
                    <span className="text-right text-[#27324A]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          
        </div>
      </section>
    </div>
  );

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
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <SuperadminBackLink href="/superadmin/dashboard/support-center" />
          <div>
            <h1 className="text-[20px] font-semibold tracking-[-0.04em] text-[#202350]">View Support message</h1>
            <p className="mt-1 text-[13px] text-[#69729A]">This section will help you to view message of that client</p>
          </div>
        </div>
        <SuperadminNotificationButton />
      </div>

      <SupportMessageDetailClient thread={thread} user={user} />
    </div>
  );
}

export function SuperadminSettingsGeneralPage() {
  return <SuperadminSettingsGeneralClient />;
}

export function SuperadminSettingsMoomentCreditPage() {
  return (
    <SuperadminSettingsShell
      activeHref="/superadmin/dashboard/settings/pricing"
      title="Mooment Credit"
      subtitle="Manage Mooment credit of your app"
    >
      <div className="space-y-6">
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
      </div>
    </SuperadminSettingsShell>
  );
}

export function SuperadminSettingsPricingPage() {
  return <SuperadminSettingsPricingClient />;
}

export function SuperadminSettingsFaqPage() {
  return <FaqSettingsClient />;
}

export function SuperadminSettingsTermsPage() {
  return (
    <LegalSettingsClient
      routeHref="/superadmin/dashboard/settings/terms-conditions"
      pageTitle="Terms & Conditions"
      pageSubtitle="Set terms & conditions of your Mooment app"
      contentTitle="Terms and Conditions"
      contentType="terms-and-conditions"
      lastModified="Last modified by Admin on Oct 24, 2023"
      displayTitle="Display on landing page"
      initialSections={[
        {
          title: "1. Introduction",
          body:
            "Our platform unifies all customer communication channels: WhatsApp, Twilio (SMS), and Gmail into a single shared inbox. Teams can collaborate, assign conversations, and respond to customers without switching tools, making customer support faster, simpler, and more organized.",
        },
        {
          title: "2. Our Saas Application",
          body:
            "Our platform unifies all customer communication channels: WhatsApp, Twilio (SMS), and Gmail into a single shared inbox. Teams can collaborate, assign conversations, and respond to customers without switching tools, making customer support faster, simpler, and more organized.",
        },
        {
          title: "3. Our Vision",
          body:
            "Our platform unifies all customer communication channels: WhatsApp, Twilio (SMS), and Gmail into a single shared inbox. Teams can collaborate, assign conversations, and respond to customers without switching tools, making customer support faster, simpler, and more organized.",
        },
      ]}
    />
  );
}

export function SuperadminSettingsPrivacyPage() {
  return (
    <LegalSettingsClient
      routeHref="/superadmin/dashboard/settings/privacy-policy"
      pageTitle="Privacy & Policy"
      pageSubtitle="Set privacy & policies of your Mooment app"
      contentTitle="Privacy Policy"
      contentType="privacy-policy"
      lastModified="Last modified by Admin on Oct 24, 2023"
      displayTitle="Display on landing page"
      initialSections={[
        {
          title: "1. Data Collection",
          body:
            "We collect account, transaction, and support information needed to provide secure access to the platform, manage subscriptions, and maintain customer communications across the app.",
        },
        {
          title: "2. How We Use Information",
          body:
            "Collected information is used to operate the service, improve platform performance, personalize experiences, process pricing plans, and respond to account or compliance inquiries from users.",
        },
        {
          title: "3. User Privacy Controls",
          body:
            "Users may request updates to profile details, security settings, and stored preferences. Administrative changes made here should reflect the latest privacy promises displayed on the landing page.",
        },
      ]}
    />
  );
}
