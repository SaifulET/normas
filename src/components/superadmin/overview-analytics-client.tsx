"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterHorizontalIcon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import { getApiErrorMessage } from "@/lib/api";
import {
  getSuperadminDashboardAnalytics,
  type SuperadminAnalyticsData,
  type SuperadminAnalyticsRange,
  type SuperadminAnalyticsStat,
  type SuperadminAnalyticsSubscriber,
} from "@/lib/superadmin-analytics-api";

type RangeKey = SuperadminAnalyticsRange;
type StatCard = SuperadminAnalyticsStat;
type SubscriberRow = SuperadminAnalyticsSubscriber;
type PlanFilter = "All" | "Investor Basic" | "Investor Pro" | "Investee";
type DateOrder = "Latest" | "Oldest";

const rangeLabels: Record<RangeKey, string> = { "7d": "7D", "30d": "30D", custom: "Custom", today: "Today" };
const numberFormatter = new Intl.NumberFormat("en-US");
const compactNumberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1, notation: "compact" });

const emptyAnalyticsData: SuperadminAnalyticsData = {
  barLabels: [],
  bars: [],
  lineLabels: [],
  lines: { basic: [], investee: [], pro: [] },
  pie: [],
  pieTotal: 0,
  stats: [],
  subscribers: [],
};

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDefaultCustomRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return { end: formatDateInput(end), start: formatDateInput(start) };
}

function useSuperadminAnalytics(range: RangeKey, customStartDate: string, customEndDate: string) {
  const [data, setData] = useState<SuperadminAnalyticsData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((value) => value + 1), []);

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const response = await getSuperadminDashboardAnalytics({
          endDate: range === "custom" ? customEndDate : undefined,
          range,
          startDate: range === "custom" ? customStartDate : undefined,
        });
        if (active) setData(response.data);
      } catch (requestError) {
        if (active) setError(getApiErrorMessage(requestError, "Unable to load analytics"));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAnalytics();
    return () => {
      active = false;
    };
  }, [customEndDate, customStartDate, range, reloadToken]);

  return { data: data ?? emptyAnalyticsData, error, loading, reload };
}

function useDashboardState() {
  const defaultCustomRange = useMemo(() => getDefaultCustomRange(), []);
  const [range, setRange] = useState<RangeKey>("today");
  const [showCustom, setShowCustom] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(defaultCustomRange.start);
  const [customEndDate, setCustomEndDate] = useState(defaultCustomRange.end);
  const analytics = useSuperadminAnalytics(range, customStartDate, customEndDate);

  function handleRangeChange(nextRange: RangeKey) {
    if (nextRange === "custom") {
      setShowCustom(true);
      return;
    }
    setRange(nextRange);
  }

  function applyCustomRange() {
    setRange("custom");
    setShowCustom(false);
  }

  return {
    ...analytics,
    applyCustomRange,
    customEndDate,
    customStartDate,
    handleRangeChange,
    range,
    setCustomEndDate,
    setCustomStartDate,
    setShowCustom,
    showCustom,
  };
}

function RangeTabs({ active, onChange }: { active: RangeKey; onChange: (range: RangeKey) => void }) {
  return (
    <div className="inline-flex items-center rounded-[10px] border border-[#E3E8F2] bg-white p-1 shadow-[0_6px_20px_rgba(31,35,61,0.05)]">
      {(Object.keys(rangeLabels) as RangeKey[]).map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => onChange(range)}
          className={cx("rounded-[8px] px-4 py-2 text-[11px] font-medium transition", active === range ? "bg-[#F3F5F9] text-[#2A3156]" : "text-[#7B83A2] hover:text-[#2A3156]")}
        >
          {rangeLabels[range]}
        </button>
      ))}
    </div>
  );
}

function DashboardHeader({ activeRange, onRangeChange, subtitle, title }: { activeRange: RangeKey; onRangeChange: (range: RangeKey) => void; subtitle: string; title: string }) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-[#222752]">{title}</h1>
        <p className="mt-1 text-[13px] text-[#7E86A4]">{subtitle}</p>
      </div>
      <RangeTabs active={activeRange} onChange={onRangeChange} />
    </div>
  );
}

function StatSummaryCard({ card, onEdit }: { card: StatCard; onEdit: () => void }) {
  return (
    <div className="rounded-[18px] border border-[#EDF1F6] bg-white px-4 py-4 shadow-[0_8px_30px_rgba(31,35,61,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] text-[#66708D]">{card.label}</p>
        {card.change ? (
          <span className={cx("rounded-full px-2 py-1 text-[10px] font-semibold", card.accent === "green" ? "bg-[#E8FFF1] text-[#29A66A]" : "bg-[#FFE8E3] text-[#F26A57]")}>{card.change}</span>
        ) : card.icon === "edit" ? (
          <button type="button" onClick={onEdit} className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#F7F2FB] text-[#5E568E]">
            <HugeiconsIcon icon={PencilEdit02Icon} className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <p className="mt-4 text-[34px] font-semibold text-[#1F2348]">{card.value}</p>
      <p className="mt-1 text-[12px] text-[#8A91AB]">{card.note}</p>
    </div>
  );
}

function StatusPanel({ actionLabel, message, onAction }: { actionLabel?: string; message: string; onAction?: () => void }) {
  return (
    <div className="rounded-[18px] border border-[#EDF1F6] bg-white px-5 py-8 text-center shadow-[0_8px_30px_rgba(31,35,61,0.04)]">
      <p className="text-[13px] text-[#66708D]">{message}</p>
      {actionLabel && onAction ? <button type="button" onClick={onAction} className="mt-4 rounded-[10px] bg-[#314B6B] px-4 py-2 text-[12px] font-medium text-white">{actionLabel}</button> : null}
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return <div className="px-4 py-10 text-center text-[13px] text-[#8A91AB]">{message}</div>;
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/35 p-4">
      <div className="w-full max-w-md rounded-[20px] bg-white p-5 shadow-[0_24px_80px_rgba(31,35,61,0.22)]">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[18px] font-semibold text-[#1F2348]">{title}</h3>
          <button type="button" onClick={onClose} className="text-[12px] text-[#8A91AB]">Close</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function ChoiceChip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cx("rounded-full border px-4 py-2 text-[13px] transition", active ? "border-[#314B6B] bg-[#314B6B] text-white" : "border-[#A7B1C7] bg-white text-[#5C6484]")}>{children}</button>
  );
}

function FilterModal({ dateOrder, onApply, onClose, onDateOrderChange, onPaymentChange, onPlanChange, payment, plan }: { dateOrder: DateOrder; onApply: () => void; onClose: () => void; onDateOrderChange: (value: DateOrder) => void; onPaymentChange: (value: SubscriberRow["payment"] | "All") => void; onPlanChange: (value: PlanFilter) => void; payment: SubscriberRow["payment"] | "All"; plan: PlanFilter }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/78 p-4">
      <div className="w-full max-w-[520px] rounded-[24px] bg-white px-7 py-8 shadow-[0_24px_80px_rgba(31,35,61,0.22)]">
        <h3 className="text-[22px] font-semibold text-[#202452]">Filter subscribers</h3>
        <div className="mt-7 space-y-7">
          <div>
            <p className="mb-3 text-[12px] uppercase tracking-[0.18em] text-[#6E7591]">Status</p>
            <div className="flex flex-wrap gap-3">{(["All", "Pending", "Paid", "Failed", "Active"] as const).map((option) => <ChoiceChip key={option} active={payment === option} onClick={() => onPaymentChange(option)}>{option}</ChoiceChip>)}</div>
          </div>
          <div>
            <p className="mb-3 text-[12px] uppercase tracking-[0.18em] text-[#6E7591]">Plan</p>
            <div className="flex flex-wrap gap-3">{(["All", "Investor Basic", "Investor Pro", "Investee"] as const).map((option) => <ChoiceChip key={option} active={plan === option} onClick={() => onPlanChange(option)}>{option}</ChoiceChip>)}</div>
          </div>
          <div>
            <p className="mb-3 text-[12px] uppercase tracking-[0.18em] text-[#6E7591]">Date</p>
            <div className="flex flex-wrap gap-3">{(["Latest", "Oldest"] as const).map((option) => <ChoiceChip key={option} active={dateOrder === option} onClick={() => onDateOrderChange(option)}>{option}</ChoiceChip>)}</div>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="rounded-[16px] bg-[#F1F1F5] px-6 py-3 text-[18px] text-[#5D6483]">Cancel</button>
          <button type="button" onClick={onApply} className="rounded-[16px] bg-[#314B6B] px-6 py-3 text-[18px] text-white">Done</button>
        </div>
      </div>
    </div>
  );
}

function CustomRangeModal({ endDate, onApply, onClose, onEndDateChange, onStartDateChange, startDate }: { endDate: string; onApply: () => void; onClose: () => void; onEndDateChange: (value: string) => void; onStartDateChange: (value: string) => void; startDate: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/78 p-4">
      <div className="w-full max-w-[590px] rounded-[24px] bg-white px-7 py-8 shadow-[0_24px_80px_rgba(31,35,61,0.22)]">
        <h3 className="text-[22px] font-semibold text-[#202452]">Select Custom Period</h3>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <label className="block"><span className="mb-2 block text-[12px] uppercase tracking-[0.18em] text-[#6E7591]">Start Date</span><input type="date" value={startDate} onChange={(event) => onStartDateChange(event.target.value)} className="h-14 w-full rounded-[16px] border border-[#9DA6BF] px-4 text-[16px] text-[#505874] outline-none" /></label>
          <label className="block"><span className="mb-2 block text-[12px] uppercase tracking-[0.18em] text-[#6E7591]">End Date</span><input type="date" value={endDate} onChange={(event) => onEndDateChange(event.target.value)} className="h-14 w-full rounded-[16px] border border-[#9DA6BF] px-4 text-[16px] text-[#505874] outline-none" /></label>
        </div>
        <div className="mt-7 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="rounded-[16px] bg-[#F1F1F5] px-6 py-3 text-[18px] text-[#5D6483]">Cancel</button>
          <button type="button" onClick={onApply} className="rounded-[16px] bg-[#314B6B] px-6 py-3 text-[18px] text-white">Apply Filters</button>
        </div>
      </div>
    </div>
  );
}

function paymentBadgeClass(payment: SubscriberRow["payment"]) {
  if (payment === "Pending") return "bg-[#FFF2E5] text-[#F08A32]";
  if (payment === "Failed") return "bg-[#FFECEA] text-[#EF5A4C]";
  return "bg-[#E8FFF1] text-[#29A66A]";
}

function chartMax(values: number[]) {
  const max = Math.max(...values, 0);
  if (max <= 0) return 1;
  if (max <= 10) return 10;
  if (max <= 100) return Math.ceil(max / 25) * 25;
  if (max <= 1000) return Math.ceil(max / 100) * 100;
  return Math.ceil(max / 1000) * 1000;
}

function axisLabel(value: number) {
  return value >= 1000 ? `${numberFormatter.format(value / 1000)}k` : numberFormatter.format(Math.round(value));
}

function LineChart({ data, labels }: { data: SuperadminAnalyticsData["lines"]; labels: string[] }) {
  const maxY = chartMax([...data.basic, ...data.pro, ...data.investee]);
  const chartLeft = 28;
  const chartRight = 952;
  const pointGap = labels.length > 1 ? (chartRight - chartLeft) / (labels.length - 1) : chartRight - chartLeft;
  const points = (values: number[]) => values.map((value, index) => `${chartLeft + index * pointGap},${185 - (value / maxY) * 150}`).join(" ");

  return (
    <div className="rounded-[18px] border border-[#EDF1F6] bg-white p-4 shadow-[0_8px_30px_rgba(31,35,61,0.04)]">
      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div><h3 className="text-[16px] font-semibold text-[#222752]">Revenue Metrics</h3><p className="text-[12px] text-[#7E86A4]">Comparison across packages</p></div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#6D7694]">{[["Investor Basic", "#2F4463"], ["Investor Pro", "#D2A3A3"], ["Investee Plan", "#EB6A00"]].map(([label, color]) => <span key={label} className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{label}</span>)}</div>
      </div>
      {labels.length ? (
        <svg viewBox="0 0 980 220" className="h-[280px] w-full">
          {[0, 1, 2, 3, 4].map((row) => { const y = 30 + row * 38; const value = maxY - (maxY / 4) * row; return <g key={row}><line x1="24" y1={y} x2="952" y2={y} stroke="#E9EEF5" strokeDasharray={row === 4 ? "0" : "4 4"} /><text x="4" y={y + 4} fontSize="10" fill="#B0B7CC">{axisLabel(value)}</text></g>; })}
          <polyline fill="none" stroke="#2F4463" strokeWidth="3" points={points(data.basic)} />
          <polyline fill="none" stroke="#D2A3A3" strokeWidth="3" points={points(data.pro)} />
          <polyline fill="none" stroke="#EB6A00" strokeWidth="3" points={points(data.investee)} />
          {data.basic.map((value, index) => <circle key={index} cx={chartLeft + index * pointGap} cy={185 - (value / maxY) * 150} r="4" fill="#fff" stroke="#2F4463" strokeWidth="2" />)}
          {labels.map((label, index) => <text key={`${label}-${index}`} x={chartLeft - 2 + index * pointGap} y="214" fontSize="10" fill="#A7AFC5">{label}</text>)}
        </svg>
      ) : <EmptyPanel message="No revenue activity is available for this period." />}
    </div>
  );
}

function DonutChart({ items, total }: { items: SuperadminAnalyticsData["pie"]; total: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const segments = items.map((item, index) => ({ ...item, dash: (item.value / 100) * circumference, offset: (items.slice(0, index).reduce((sum, current) => sum + current.value, 0) / 100) * circumference }));

  return (
    <div className="rounded-[18px] border border-[#EDF1F6] bg-white p-4 shadow-[0_8px_30px_rgba(31,35,61,0.04)]">
      <h3 className="text-[16px] font-semibold text-[#222752]">Package Distribution</h3>
      <div className="mt-6 flex flex-col items-center">
        <div className="relative h-[170px] w-[170px]">
          <svg viewBox="0 0 170 170" className="h-full w-full -rotate-90"><circle cx="85" cy="85" r={radius} fill="none" stroke="#EFF3F8" strokeWidth="14" />{segments.map((item) => <circle key={item.label} cx="85" cy="85" r={radius} fill="none" stroke={item.color} strokeWidth="14" strokeDasharray={`${item.dash} ${circumference - item.dash}`} strokeDashoffset={-item.offset} strokeLinecap="butt" />)}</svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center"><p className="text-[34px] font-semibold text-[#1F2348]">{compactNumberFormatter.format(total)}</p><p className="text-[11px] text-[#98A1BA]">Total</p></div>
        </div>
        <div className="mt-4 w-full space-y-3">{items.map((item) => <div key={item.label} className="flex items-start gap-2 text-[12px] text-[#6D7694]"><span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} /><div><p className="font-medium text-[#39405D]">{item.label}</p><p className="text-[10px] text-[#A1A9C0]">{item.value}% ({numberFormatter.format(item.count)})</p></div></div>)}</div>
      </div>
    </div>
  );
}

function BarChart({ labels, values }: { labels: string[]; values: number[] }) {
  const maxY = chartMax(values);
  const chartLeft = 40;
  const chartRight = 1080;
  const barGap = values.length ? (chartRight - chartLeft) / values.length : chartRight - chartLeft;
  const barWidth = 12;

  return (
    <div className="rounded-[18px] border border-[#EDF1F6] bg-white p-4 shadow-[0_8px_30px_rgba(31,35,61,0.04)]">
      <h3 className="text-[16px] font-semibold text-[#222752]">User Metrics</h3>
      {values.length ? <svg viewBox="0 0 1120 220" className="mt-4 h-[220px] w-full">
        {[0, 1, 2, 3, 4].map((row) => { const y = 24 + row * 36; const value = maxY - (maxY / 4) * row; return <g key={row}><line x1="24" y1={y} x2="1080" y2={y} stroke="#E9EEF5" strokeDasharray="4 4" /><text x="8" y={y + 4} fontSize="10" fill="#B0B7CC">{axisLabel(value)}</text></g>; })}
        {values.map((value, index) => { const x = chartLeft + index * barGap + (barGap - barWidth) / 2; const height = (value / maxY) * 120; return <g key={index}><rect x={x} y={168 - height} width={barWidth} height={height} rx="2" fill="#7387A3" /><text x={x - 4} y="202" fontSize="10" fill="#A7AFC5">{labels[index] ?? ""}</text></g>; })}
      </svg> : <EmptyPanel message="No user signups are available yet." />}
    </div>
  );
}

function StatsGrid({ data, onEdit }: { data: SuperadminAnalyticsData; onEdit: () => void }) {
  if (!data.stats.length) return null;
  return <div className="grid gap-4 xl:grid-cols-4">{data.stats.map((card) => <StatSummaryCard key={card.label} card={card} onEdit={onEdit} />)}</div>;
}

function SharedCustomModal({ state }: { state: ReturnType<typeof useDashboardState> }) {
  if (!state.showCustom) return null;
  return <CustomRangeModal startDate={state.customStartDate} endDate={state.customEndDate} onStartDateChange={state.setCustomStartDate} onEndDateChange={state.setCustomEndDate} onApply={state.applyCustomRange} onClose={() => state.setShowCustom(false)} />;
}

export function SuperadminDashboardOverviewClient() {
  const state = useDashboardState();
  const [showFilter, setShowFilter] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [actionRowId, setActionRowId] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<SubscriberRow["payment"] | "All">("All");
  const [viewAll, setViewAll] = useState(false);
  const [planFilter, setPlanFilter] = useState<PlanFilter>("All");
  const [dateOrder, setDateOrder] = useState<DateOrder>("Latest");
  const filteredRows = state.data.subscribers.filter((row) => paymentFilter === "All" || row.payment === paymentFilter).filter((row) => planFilter === "All" || row.plan === planFilter).sort((left, right) => {
    const leftDate = new Date(left.joinedAt || left.dateJoined).getTime() || 0;
    const rightDate = new Date(right.joinedAt || right.dateJoined).getTime() || 0;
    return dateOrder === "Latest" ? rightDate - leftDate : leftDate - rightDate;
  });
  const visibleRows = viewAll ? filteredRows : filteredRows.slice(0, 7);

  return (
    <div className="space-y-5">
      <DashboardHeader title="Dashboard Overview" subtitle="Here's what's happened recently" activeRange={state.range} onRangeChange={state.handleRangeChange} />
      {state.error ? <StatusPanel message={state.error} actionLabel="Retry" onAction={state.reload} /> : null}
      {state.loading && !state.data.stats.length ? <StatusPanel message="Loading live analytics..." /> : null}
      <StatsGrid data={state.data} onEdit={() => setShowRevenueModal(true)} />
      <div className="overflow-hidden rounded-[18px] border border-[#EDF1F6] bg-white shadow-[0_8px_30px_rgba(31,35,61,0.04)]">
        <div className="flex flex-col gap-4 border-b border-[#EEF2F7] px-4 py-4 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="text-[18px] font-semibold text-[#222752]">Recent Subscriber Onboarding</h3><p className="mt-1 text-[12px] text-[#8A91AB]">Real-time company plan purchases</p></div><div className="flex items-center gap-3"><button type="button" onClick={() => setShowFilter((value) => !value)} className="inline-flex items-center gap-2 rounded-[8px] border border-[#DDE3EE] px-3 py-2 text-[12px] text-[#5B6484]"><HugeiconsIcon icon={FilterHorizontalIcon} className="h-4 w-4" />Filter</button><button type="button" onClick={() => setViewAll((value) => !value)} className="text-[13px] font-medium text-[#5E568E]">{viewAll ? "Show Less" : "View All"}</button></div></div>
        <div className="grid grid-cols-[1.7fr_1.3fr_1.3fr_1fr_56px] gap-4 bg-[#FAFBFD] px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-[#A0A8BE]"><p>Name</p><p>Plan</p><p>Date Joined</p><p>Payment</p><p className="text-right">Actions</p></div>
        {visibleRows.length ? visibleRows.map((row) => <div key={row.id} className="relative grid grid-cols-[1.7fr_1.3fr_1.3fr_1fr_56px] gap-4 border-t border-[#F1F4F8] px-4 py-4 text-[13px] text-[#46506D]"><div className="flex items-center gap-3"><span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#F1F4F8] text-[10px] font-semibold text-[#25304F]">{row.initials}</span><span>{row.name}</span></div><p>{row.plan}</p><p>{row.dateJoined}</p><div><span className={cx("rounded-full px-2 py-1 text-[10px] font-semibold", paymentBadgeClass(row.payment))}>{row.payment}</span></div><div className="flex justify-end"><button type="button" onClick={() => setActionRowId((current) => (current === row.id ? null : row.id))} className="rounded-full p-2 text-[#98A1BA]"><span className="block h-1 w-1 rounded-full bg-current shadow-[0_5px_0_currentColor,0_-5px_0_currentColor]" /></button>{actionRowId === row.id ? <div className="absolute right-4 top-12 z-20 w-[110px] rounded-[10px] border border-[#E6EAF2] bg-white p-2 shadow-[0_18px_40px_rgba(31,35,61,0.14)]"><button type="button" onClick={() => { setPaymentFilter(row.payment); setActionRowId(null); }} className="block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[#46506D] hover:bg-[#F5F7FB]">View</button></div> : null}</div></div>) : <div className="border-t border-[#F1F4F8]"><EmptyPanel message={state.loading ? "Loading subscribers..." : "No subscriber purchases found for this period."} /></div>}
      </div>
      {showFilter ? <FilterModal payment={paymentFilter} plan={planFilter} dateOrder={dateOrder} onPaymentChange={setPaymentFilter} onPlanChange={setPlanFilter} onDateOrderChange={setDateOrder} onApply={() => setShowFilter(false)} onClose={() => setShowFilter(false)} /> : null}
      <SharedCustomModal state={state} />
      {showRevenueModal ? <Modal title="Revenue Details" onClose={() => setShowRevenueModal(false)}><div className="space-y-3 text-[13px] text-[#5F6786]"><p>The total revenue card reflects paid subscription invoices for {rangeLabels[state.range]}.</p><p>Revenue changes compare against the previous period of the same length.</p></div></Modal> : null}
    </div>
  );
}

export function SuperadminAnalyticsClient() {
  const state = useDashboardState();
  const [showRevenueModal, setShowRevenueModal] = useState(false);

  return (
    <div className="space-y-5">
      <DashboardHeader title="Analytics Overview" subtitle="Here's what's happened recently" activeRange={state.range} onRangeChange={state.handleRangeChange} />
      {state.error ? <StatusPanel message={state.error} actionLabel="Retry" onAction={state.reload} /> : null}
      {state.loading && !state.data.stats.length ? <StatusPanel message="Loading live analytics..." /> : null}
      <StatsGrid data={state.data} onEdit={() => setShowRevenueModal(true)} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_240px]"><LineChart data={state.data.lines} labels={state.data.lineLabels} /><DonutChart items={state.data.pie} total={state.data.pieTotal} /></div>
      <BarChart values={state.data.bars} labels={state.data.barLabels} />
      {showRevenueModal ? <Modal title="Revenue Insight" onClose={() => setShowRevenueModal(false)}><div className="space-y-3 text-[13px] text-[#5F6786]"><p>Total revenue is currently {state.data.stats[3]?.value ?? "$0.00"} for the selected period.</p><p>Plan totals are calculated from paid subscription invoices returned by the backend.</p></div></Modal> : null}
      <SharedCustomModal state={state} />
    </div>
  );
}
