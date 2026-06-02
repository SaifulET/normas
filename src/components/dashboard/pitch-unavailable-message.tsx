import Link from "next/link";
import { DashboardIcon } from "./icons";

export function PitchUnavailableMessage({
  backHref = "/dashboard",
  message = "This pitch is currently unavailable because it has been suspended by admin.",
}: {
  backHref?: string;
  message?: string;
}) {
  return (
    <section className="min-h-[520px] rounded-[16px] bg-[#FCFCFD] px-4 py-10 text-[#243041] sm:px-6 lg:px-8">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-[#314B6B]">
        <DashboardIcon name="chevronLeft" className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="mt-24 flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F6FA] text-[#314B6B]">
          <DashboardIcon name="query" className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#1E2746]">
          Pitch unavailable
        </h1>
        <p className="mt-3 max-w-[520px] text-sm leading-6 text-[#667085]">
          {message}
        </p>
      </div>
    </section>
  );
}
