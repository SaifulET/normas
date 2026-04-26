import { dashboardProfileSections, dashboardProfileStats, dashboardUser } from "./data";
import { DashboardPageHeader } from "./page-header";

export function ProfilePage() {
  return (
    <section className="space-y-6">
      <DashboardPageHeader title="Profile" subtitle="Review your investor identity and focus areas" />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <article className="rounded-[30px] border border-[#E6EBF3] bg-white p-6 shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#243B5A] text-2xl font-semibold text-white">
              {dashboardUser.initials}
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#1E2746]">
                {dashboardUser.name}
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">{dashboardUser.email}</p>
              <p className="mt-2 inline-flex rounded-full bg-[#EDF2F7] px-3 py-1 text-xs font-medium text-[#314B6B]">
                {dashboardUser.role}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {dashboardProfileStats.map((item) => (
              <div key={item.label} className="rounded-[22px] bg-[#F8FAFC] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-[#1E2746]">{item.value}</p>
              </div>
            ))}
          </div>
        </article>

        <div className="space-y-6">
          {dashboardProfileSections.map((section) => (
            <article
              key={section.title}
              className="rounded-[30px] border border-[#E6EBF3] bg-white p-6 shadow-[0_28px_80px_-60px_rgba(30,39,70,0.45)]"
            >
              <h3 className="text-xl font-semibold text-[#1E2746]">{section.title}</h3>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {section.items.map((item) => (
                  <div key={item.label} className="rounded-[22px] bg-[#F8FAFC] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#98A2B3]">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-[#475467]">{item.value}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
