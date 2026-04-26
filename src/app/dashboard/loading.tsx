export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="h-10 w-64 animate-pulse rounded-2xl bg-[#E5EAF2]" />
          <div className="h-4 w-80 animate-pulse rounded-full bg-[#EEF2F7]" />
        </div>
        <div className="h-11 w-11 animate-pulse rounded-2xl bg-[#E5EAF2]" />
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-[24px] border border-[#E6EBF3] bg-white p-4">
            <div className="h-40 animate-pulse rounded-[18px] bg-[#E5EAF2]" />
            <div className="mt-4 h-6 w-40 animate-pulse rounded-full bg-[#E5EAF2]" />
            <div className="mt-3 h-4 w-24 animate-pulse rounded-full bg-[#EEF2F7]" />
            <div className="mt-4 h-16 animate-pulse rounded-[18px] bg-[#F3F6FA]" />
          </div>
        ))}
      </div>
    </div>
  );
}
