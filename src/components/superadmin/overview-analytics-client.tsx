"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FilterHorizontalIcon,
  Notification01Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";

type RangeKey = "today" | "7d" | "30d" | "custom";

type StatCard = {
  accent?: "green" | "red";
  change?: string;
  icon?: "edit";
  label: string;
  note: string;
  value: string;
};

type SubscriberRow = {
  dateJoined: string;
  id: string;
  initials: string;
  name: string;
  payment: "Paid" | "Pending" | "Failed" | "Active";
  plan: string;
};

type AnalyticsSet = {
  bars: number[];
  lines: {
    basic: number[];
    investee: number[];
    pro: number[];
  };
  pie: Array<{ color: string; label: string; value: number }>;
  stats: StatCard[];
  subscribers: SubscriberRow[];
};

type PlanFilter = "All" | "Investor Basic" | "Investor Pro" | "Investee";
type DateOrder = "Latest" | "Oldest";
type EnterpriseFilter = "All" | "Yes" | "None";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const rangeLabels: Record<RangeKey, string> = {
  "7d": "7D",
  "30d": "30D",
  custom: "Custom",
  today: "Today",
};

const dashboardData: Record<RangeKey, AnalyticsSet> = {
  today: {
    stats: [
      { label: "Investor Basic Plan", value: "$420.00", note: "vs yesterday", change: "+ 12%", accent: "red" },
      { label: "Investor Pro Plan", value: "$100.00", note: "vs yesterday", change: "+ 5%", accent: "green" },
      { label: "Investee Plan", value: "$200.00", note: "vs yesterday", change: "+ 5%", accent: "green" },
      { label: "Total Revenue", value: "$720.00", note: "Today", icon: "edit" },
    ],
    lines: {
      basic: [2200, 2450, 3320, 3190, 0, 0, 0],
      pro: [1500, 1580, 2050, 2340, 0, 0, 0],
      investee: [720, 840, 1180, 1100, 0, 0, 0],
    },
    bars: [270, 330, 330, 230, 230, 170, 170, 135, 305, 305],
    pie: [
      { label: "Investor Pro", value: 55, color: "#2F4463" },
      { label: "Investor Basic", value: 30, color: "#D8A8A8" },
      { label: "Investee Plan", value: 15, color: "#EB6A00" },
    ],
    subscribers: [
      { id: "1", initials: "NL", name: "NexLevel Solutions", plan: "Investor Basic", dateJoined: "Oct 24, 2026", payment: "Paid" },
      { id: "2", initials: "QT", name: "Quantum Tech", plan: "Investee", dateJoined: "Oct 20, 2026", payment: "Pending" },
      { id: "3", initials: "SV", name: "Sky Ventures", plan: "Investee", dateJoined: "Oct 20, 2026", payment: "Failed" },
      { id: "4", initials: "SV", name: "Sky Ventures", plan: "Investee", dateJoined: "Oct 20, 2026", payment: "Paid" },
      { id: "5", initials: "SV", name: "Sky Ventures", plan: "Investee", dateJoined: "Oct 20, 2026", payment: "Paid" },
      { id: "6", initials: "SV", name: "Sky Ventures", plan: "Investor Pro", dateJoined: "Oct 20, 2026", payment: "Active" },
      { id: "7", initials: "BF", name: "Blue Fox Labs", plan: "Investor Pro", dateJoined: "Oct 20, 2026", payment: "Pending" },
    ],
  },
  "7d": {
    stats: [
      { label: "Investor Basic Plan", value: "$2,840.00", note: "last 7 days", change: "+ 9%", accent: "green" },
      { label: "Investor Pro Plan", value: "$1,120.00", note: "last 7 days", change: "+ 7%", accent: "green" },
      { label: "Investee Plan", value: "$1,460.00", note: "last 7 days", change: "+ 4%", accent: "green" },
      { label: "Total Revenue", value: "$5,420.00", note: "Last 7 days", icon: "edit" },
    ],
    lines: {
      basic: [2100, 2980, 3120, 3450, 3380, 3520, 3660],
      pro: [1400, 1680, 2020, 1980, 2160, 2310, 2450],
      investee: [680, 1120, 980, 820, 940, 1080, 1210],
    },
    bars: [250, 290, 310, 260, 250, 220, 210, 195, 320, 340],
    pie: [
      { label: "Investor Pro", value: 49, color: "#2F4463" },
      { label: "Investor Basic", value: 34, color: "#D8A8A8" },
      { label: "Investee Plan", value: 17, color: "#EB6A00" },
    ],
    subscribers: [
      { id: "8", initials: "AR", name: "Ardent Partners", plan: "Investor Basic", dateJoined: "Oct 22, 2026", payment: "Paid" },
      { id: "9", initials: "LM", name: "Lumen Mobility", plan: "Investor Pro", dateJoined: "Oct 21, 2026", payment: "Active" },
      { id: "10", initials: "HC", name: "Helio Commerce", plan: "Investee", dateJoined: "Oct 20, 2026", payment: "Pending" },
      { id: "11", initials: "NV", name: "Nova Ventures", plan: "Investor Pro", dateJoined: "Oct 19, 2026", payment: "Paid" },
    ],
  },
  "30d": {
    stats: [
      { label: "Investor Basic Plan", value: "$11,420.00", note: "last 30 days", change: "+ 18%", accent: "green" },
      { label: "Investor Pro Plan", value: "$4,580.00", note: "last 30 days", change: "+ 10%", accent: "green" },
      { label: "Investee Plan", value: "$6,300.00", note: "last 30 days", change: "+ 8%", accent: "green" },
      { label: "Total Revenue", value: "$22,300.00", note: "Last 30 days", icon: "edit" },
    ],
    lines: {
      basic: [1800, 2400, 2900, 3100, 3250, 3600, 3900],
      pro: [1200, 1500, 1800, 1950, 2240, 2380, 2620],
      investee: [520, 840, 1180, 980, 1100, 1260, 1420],
    },
    bars: [180, 240, 290, 260, 280, 210, 240, 250, 340, 360],
    pie: [
      { label: "Investor Pro", value: 52, color: "#2F4463" },
      { label: "Investor Basic", value: 33, color: "#D8A8A8" },
      { label: "Investee Plan", value: 15, color: "#EB6A00" },
    ],
    subscribers: [
      { id: "12", initials: "AT", name: "Atlas Team", plan: "Investor Basic", dateJoined: "Oct 12, 2026", payment: "Paid" },
      { id: "13", initials: "OR", name: "Orbit Ridge", plan: "Investee", dateJoined: "Oct 11, 2026", payment: "Paid" },
      { id: "14", initials: "PN", name: "Pioneer Nest", plan: "Investor Pro", dateJoined: "Oct 10, 2026", payment: "Active" },
      { id: "15", initials: "AV", name: "Avenue Capital", plan: "Investor Basic", dateJoined: "Oct 09, 2026", payment: "Pending" },
      { id: "16", initials: "CL", name: "Cloud Lab", plan: "Investee", dateJoined: "Oct 08, 2026", payment: "Failed" },
    ],
  },
  custom: {
    stats: [
      { label: "Investor Basic Plan", value: "$3,220.00", note: "custom period", change: "+ 3%", accent: "green" },
      { label: "Investor Pro Plan", value: "$1,880.00", note: "custom period", change: "+ 2%", accent: "green" },
      { label: "Investee Plan", value: "$2,040.00", note: "custom period", change: "- 1%", accent: "red" },
      { label: "Total Revenue", value: "$7,140.00", note: "Custom", icon: "edit" },
    ],
    lines: {
      basic: [1950, 2150, 2780, 3000, 2880, 2940, 3050],
      pro: [1300, 1480, 1760, 1900, 2030, 2140, 2250],
      investee: [700, 760, 1040, 910, 850, 970, 1120],
    },
    bars: [205, 280, 300, 235, 225, 175, 185, 160, 290, 300],
    pie: [
      { label: "Investor Pro", value: 46, color: "#2F4463" },
      { label: "Investor Basic", value: 36, color: "#D8A8A8" },
      { label: "Investee Plan", value: 18, color: "#EB6A00" },
    ],
    subscribers: [
      { id: "17", initials: "EH", name: "Echo Harbor", plan: "Investor Basic", dateJoined: "Oct 18, 2026", payment: "Paid" },
      { id: "18", initials: "SN", name: "Signal Nest", plan: "Investor Pro", dateJoined: "Oct 18, 2026", payment: "Pending" },
      { id: "19", initials: "PL", name: "Pulse Loop", plan: "Investee", dateJoined: "Oct 17, 2026", payment: "Active" },
    ],
  },
};

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

function NotificationButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#E3E8F2] bg-white text-[#68718D] shadow-[0_6px_20px_rgba(31,35,61,0.05)]"
      aria-label="Notifications"
    >
      <HugeiconsIcon icon={Notification01Icon} className="h-4 w-4" />
      <span className="absolute right-[9px] top-[8px] h-[5px] w-[5px] rounded-full bg-[#FF4D4F]" />
    </button>
  );
}

function RangeTabs({ active, onChange }: { active: RangeKey; onChange: (range: RangeKey) => void }) {
  return (
    <div className="inline-flex items-center rounded-[10px] border border-[#E3E8F2] bg-white p-1 shadow-[0_6px_20px_rgba(31,35,61,0.05)]">
      {(Object.keys(rangeLabels) as RangeKey[]).map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => onChange(range)}
          className={cx(
            "rounded-[8px] px-4 py-2 text-[11px] font-medium transition",
            active === range ? "bg-[#F3F5F9] text-[#2A3156]" : "text-[#7B83A2] hover:text-[#2A3156]",
          )}
        >
          {rangeLabels[range]}
        </button>
      ))}
    </div>
  );
}

function StatSummaryCard({ card, onEdit }: { card: StatCard; onEdit: () => void }) {
  return (
    <div className="rounded-[18px] border border-[#EDF1F6] bg-white px-4 py-4 shadow-[0_8px_30px_rgba(31,35,61,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] text-[#66708D]">{card.label}</p>
        {card.change ? (
          <span
            className={cx(
              "rounded-full px-2 py-1 text-[10px] font-semibold",
              card.accent === "green" ? "bg-[#E8FFF1] text-[#29A66A]" : "bg-[#FFE8E3] text-[#F26A57]",
            )}
          >
            {card.change}
          </span>
        ) : card.icon === "edit" ? (
          <button type="button" onClick={onEdit} className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#F7F2FB] text-[#5E568E]">
            <HugeiconsIcon icon={PencilEdit02Icon} className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <p className="mt-4 text-[34px] font-semibold tracking-[-0.05em] text-[#1F2348]">{card.value}</p>
      <p className="mt-1 text-[12px] text-[#8A91AB]">{card.note}</p>
    </div>
  );
}

function paymentBadgeClass(payment: SubscriberRow["payment"]) {
  switch (payment) {
    case "Paid":
      return "bg-[#E8FFF1] text-[#29A66A]";
    case "Pending":
      return "bg-[#FFF2E5] text-[#F08A32]";
    case "Failed":
      return "bg-[#FFECEA] text-[#EF5A4C]";
    case "Active":
      return "bg-[#E8FFF1] text-[#21A35A]";
  }
}

function Modal({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
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

function ChoiceChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "rounded-full border px-4 py-2 text-[13px] transition",
        active ? "border-[#314B6B] bg-[#314B6B] text-white" : "border-[#A7B1C7] bg-white text-[#5C6484]",
      )}
    >
      {children}
    </button>
  );
}

function FilterModal({
  dateOrder,
  enterprise,
  onApply,
  onClose,
  onDateOrderChange,
  onEnterpriseChange,
  onPaymentChange,
  onPlanChange,
  payment,
  plan,
}: {
  dateOrder: DateOrder;
  enterprise: EnterpriseFilter;
  onApply: () => void;
  onClose: () => void;
  onDateOrderChange: (value: DateOrder) => void;
  onEnterpriseChange: (value: EnterpriseFilter) => void;
  onPaymentChange: (value: SubscriberRow["payment"]) => void;
  onPlanChange: (value: PlanFilter) => void;
  payment: SubscriberRow["payment"] | "All";
  plan: PlanFilter;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/78 p-4">
      <div className="w-full max-w-[520px] rounded-[24px] bg-white px-7 py-8 shadow-[0_24px_80px_rgba(31,35,61,0.22)]">
        <h3 className="text-[22px] font-semibold text-[#202452]">Select base on your choice</h3>
        <div className="mt-7 space-y-7">
          <div>
            <p className="mb-3 text-[12px] uppercase tracking-[0.18em] text-[#6E7591]">Status</p>
            <div className="flex flex-wrap gap-3">
              {(["Pending", "Paid", "Failed"] as const).map((option) => (
                <ChoiceChip key={option} active={payment === option} onClick={() => onPaymentChange(option)}>
                  {option}
                </ChoiceChip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-[12px] uppercase tracking-[0.18em] text-[#6E7591]">Plan</p>
            <div className="flex flex-wrap gap-3">
              {(["Investor Basic", "Investor Pro", "Investee"] as const).map((option) => (
                <ChoiceChip key={option} active={plan === option} onClick={() => onPlanChange(option)}>
                  {option}
                </ChoiceChip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-[12px] uppercase tracking-[0.18em] text-[#6E7591]">Enterprise Request</p>
            <div className="flex flex-wrap gap-3">
              {(["Yes", "None"] as const).map((option) => (
                <ChoiceChip key={option} active={enterprise === option} onClick={() => onEnterpriseChange(option)}>
                  {option}
                </ChoiceChip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-[12px] uppercase tracking-[0.18em] text-[#6E7591]">Date</p>
            <div className="flex flex-wrap gap-3">
              {(["Latest", "Oldest"] as const).map((option) => (
                <ChoiceChip key={option} active={dateOrder === option} onClick={() => onDateOrderChange(option)}>
                  {option}
                </ChoiceChip>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="rounded-[16px] bg-[#F1F1F5] px-6 py-3 text-[18px] text-[#5D6483]">
            Cancel
          </button>
          <button type="button" onClick={onApply} className="rounded-[16px] bg-[#314B6B] px-6 py-3 text-[18px] text-white">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomRangeModal({
  endDate,
  onApply,
  onClose,
  onEndDateChange,
  onStartDateChange,
  startDate,
}: {
  endDate: string;
  onApply: () => void;
  onClose: () => void;
  onEndDateChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  startDate: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/78 p-4">
      <div className="w-full max-w-[590px] rounded-[24px] bg-white px-7 py-8 shadow-[0_24px_80px_rgba(31,35,61,0.22)]">
        <h3 className="text-[22px] font-semibold text-[#202452]">Select Custom Period</h3>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-[12px] uppercase tracking-[0.18em] text-[#6E7591]">Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(event) => onStartDateChange(event.target.value)}
              className="h-14 w-full rounded-[16px] border border-[#9DA6BF] px-4 text-[16px] text-[#505874] outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[12px] uppercase tracking-[0.18em] text-[#6E7591]">End Date</span>
            <input
              type="date"
              value={endDate}
              onChange={(event) => onEndDateChange(event.target.value)}
              className="h-14 w-full rounded-[16px] border border-[#9DA6BF] px-4 text-[16px] text-[#505874] outline-none"
            />
          </label>
        </div>
        <div className="mt-7 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="rounded-[16px] bg-[#F1F1F5] px-6 py-3 text-[18px] text-[#5D6483]">
            Cancel
          </button>
          <button type="button" onClick={onApply} className="rounded-[16px] bg-[#314B6B] px-6 py-3 text-[18px] text-white">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardHeader({
  activeRange,
  onNotification,
  onRangeChange,
  subtitle,
  title,
}: {
  activeRange: RangeKey;
  onNotification: () => void;
  onRangeChange: (range: RangeKey) => void;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.03em] text-[#222752]">{title}</h1>
        <p className="mt-1 text-[13px] text-[#7E86A4]">{subtitle}</p>
      </div>
      <div className="flex flex-col items-start gap-4 lg:items-end">
        <NotificationButton onClick={onNotification} />
        <RangeTabs active={activeRange} onChange={onRangeChange} />
      </div>
    </div>
  );
}

function LineChart({ data }: { data: AnalyticsSet["lines"] }) {
  const maxY = 4000;
  const chartLeft = 28;
  const chartRight = 952;
  const chartWidth = chartRight - chartLeft;
  const pointGap = chartWidth / (weekdayLabels.length - 1);
  const points = (values: number[]) =>
    values
      .map((value, index) => {
        const x = chartLeft + index * pointGap;
        const y = 185 - (value / maxY) * 150;
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <div className="rounded-[18px] border border-[#EDF1F6] bg-white p-4 shadow-[0_8px_30px_rgba(31,35,61,0.04)]">
      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-[#222752]">Revenue Metrics</h3>
          <p className="text-[12px] text-[#7E86A4]">Comparison across packages</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#6D7694]">
          {[
            ["Investor Basic", "#2F4463"],
            ["Investor Pro", "#D2A3A3"],
            ["Investee Plan", "#EB6A00"],
          ].map(([label, color]) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox="0 0 980 220" className="h-[280px] w-full">
        {[0, 1, 2, 3, 4].map((row) => {
          const y = 30 + row * 38;
          const label = `${4 - row}k`;
          return (
            <g key={row}>
              <line x1="24" y1={y} x2="952" y2={y} stroke="#E9EEF5" strokeDasharray={row === 4 ? "0" : "4 4"} />
              <text x="8" y={y + 4} fontSize="10" fill="#B0B7CC">
                {label === "0k" ? "0" : label}
              </text>
            </g>
          );
        })}
        <polyline fill="none" stroke="#2F4463" strokeWidth="3" points={points(data.basic)} />
        <polyline fill="none" stroke="#D2A3A3" strokeWidth="3" points={points(data.pro)} />
        <polyline fill="none" stroke="#EB6A00" strokeWidth="3" points={points(data.investee)} />
        {data.basic.slice(0, 4).map((value, index) => {
          const x = chartLeft + index * pointGap;
          const y = 185 - (value / maxY) * 150;
          return (
            <g key={index}>
              <circle cx={x} cy={y} r="5" fill="#fff" stroke="#2F4463" strokeWidth="3" />
              {index === 2 ? (
                <>
                  <rect x={x - 32} y={y - 24} width="64" height="20" rx="8" fill="#2F4463" />
                  <text x={x} y={y - 10} textAnchor="middle" fontSize="9" fill="#fff">
                    2,430 mores
                  </text>
                </>
              ) : null}
            </g>
          );
        })}
        {weekdayLabels.map((label, index) => (
          <text key={label} x={chartLeft - 2 + index * pointGap} y="214" fontSize="10" fill="#A7AFC5">
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function DonutChart({ items }: { items: AnalyticsSet["pie"] }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const segments = items.map((item, index) => {
    const previousTotal = items.slice(0, index).reduce((sum, current) => sum + current.value, 0);
    return {
      ...item,
      dash: (item.value / 100) * circumference,
      offset: (previousTotal / 100) * circumference,
    };
  });

  return (
    <div className="rounded-[18px] border border-[#EDF1F6] bg-white p-4 shadow-[0_8px_30px_rgba(31,35,61,0.04)]">
      <h3 className="text-[16px] font-semibold text-[#222752]">Package Distribution</h3>
      <div className="mt-6 flex flex-col items-center">
        <div className="relative h-[170px] w-[170px]">
          <svg viewBox="0 0 170 170" className="h-full w-full -rotate-90">
            <circle cx="85" cy="85" r={radius} fill="none" stroke="#EFF3F8" strokeWidth="14" />
            {segments.map((item) => {
              return (
                <circle
                  key={item.label}
                  cx="85"
                  cy="85"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="14"
                  strokeDasharray={`${item.dash} ${circumference - item.dash}`}
                  strokeDashoffset={-item.offset}
                  strokeLinecap="butt"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="text-[34px] font-semibold tracking-[-0.05em] text-[#1F2348]">12.4k</p>
            <p className="text-[11px] text-[#98A1BA]">Total</p>
          </div>
        </div>
        <div className="mt-4 w-full space-y-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-start gap-2 text-[12px] text-[#6D7694]">
              <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <div>
                <p className="font-medium text-[#39405D]">{item.label}</p>
                <p className="text-[10px] text-[#A1A9C0]">{item.value}% (5.8)</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarChart({ values }: { values: number[] }) {
  const chartLeft = 40;
  const chartRight = 1080;
  const chartWidth = chartRight - chartLeft;
  const barGap = chartWidth / values.length;
  const barWidth = 12;

  return (
    <div className="rounded-[18px] border border-[#EDF1F6] bg-white p-4 shadow-[0_8px_30px_rgba(31,35,61,0.04)]">
      <h3 className="text-[16px] font-semibold text-[#222752]">User Metrics</h3>
      <svg viewBox="0 0 1120 220" className="mt-4 h-[220px] w-full">
        {[0, 1, 2, 3, 4].map((row) => {
          const y = 24 + row * 36;
          return (
            <g key={row}>
              <line x1="24" y1={y} x2="1080" y2={y} stroke="#E9EEF5" strokeDasharray="4 4" />
              <text x="10" y={y + 4} fontSize="10" fill="#B0B7CC">
                {400 - row * 100}
              </text>
            </g>
          );
        })}
        {values.map((value, index) => {
          const x = chartLeft + index * barGap + (barGap - barWidth) / 2;
          const height = (value / 400) * 120;
          return (
            <g key={index}>
              <rect x={x} y={168 - height} width={barWidth} height={height} rx="2" fill="#7387A3" />
              <text x={x - 4} y="202" fontSize="10" fill="#A7AFC5">
                {monthLabels[index]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function SuperadminDashboardOverviewClient() {
  const [range, setRange] = useState<RangeKey>("today");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [actionRowId, setActionRowId] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<SubscriberRow["payment"] | "All">("All");
  const [viewAll, setViewAll] = useState(false);
  const [paymentOverrides, setPaymentOverrides] = useState<Record<string, SubscriberRow["payment"]>>({});
  const [planFilter, setPlanFilter] = useState<PlanFilter>("All");
  const [enterpriseFilter, setEnterpriseFilter] = useState<EnterpriseFilter>("All");
  const [dateOrder, setDateOrder] = useState<DateOrder>("Latest");
  const [customStartDate, setCustomStartDate] = useState("2025-10-24");
  const [customEndDate, setCustomEndDate] = useState("2025-11-24");

  const data = dashboardData[range];
  const rows = data.subscribers.map((row) => ({
    ...row,
    payment: paymentOverrides[row.id] ?? row.payment,
  }));
  const filteredRows = rows
    .filter((row) => paymentFilter === "All" || row.payment === paymentFilter)
    .filter((row) => planFilter === "All" || row.plan === planFilter)
    .sort((left, right) => {
      if (dateOrder === "Latest") return right.dateJoined.localeCompare(left.dateJoined);
      return left.dateJoined.localeCompare(right.dateJoined);
    });
  const visibleRows = viewAll ? filteredRows : filteredRows.slice(0, 7);

  function suspendRow(rowId: string) {
    setPaymentOverrides((current) => ({ ...current, [rowId]: "Pending" }));
    setActionRowId(null);
  }

  function handleRangeChange(nextRange: RangeKey) {
    if (nextRange === "custom") {
      setShowCustom(true);
      return;
    }
    setRange(nextRange);
    setPaymentFilter("All");
    setViewAll(false);
    setActionRowId(null);
    setPaymentOverrides({});
  }

  function applyCustomRange() {
    setRange("custom");
    setShowCustom(false);
    setActionRowId(null);
  }

  return (
    <div className="space-y-5">
      <DashboardHeader
        title="Dashboard Overview"
        subtitle="Here's what's happened recently"
        activeRange={range}
        onRangeChange={handleRangeChange}
        onNotification={() => setShowNotifications((value) => !value)}
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {data.stats.map((card) => (
          <StatSummaryCard key={card.label} card={card} onEdit={() => setShowRevenueModal(true)} />
        ))}
      </div>

      <div className="overflow-hidden rounded-[18px] border border-[#EDF1F6] bg-white shadow-[0_8px_30px_rgba(31,35,61,0.04)]">
        <div className="flex flex-col gap-4 border-b border-[#EEF2F7] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-[18px] font-semibold text-[#222752]">Recent Subscriber Onboarding</h3>
            <p className="mt-1 text-[12px] text-[#8A91AB]">Real-time company buying plansa</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilter((value) => !value)}
              className="inline-flex items-center gap-2 rounded-[8px] border border-[#DDE3EE] px-3 py-2 text-[12px] text-[#5B6484]"
            >
              <HugeiconsIcon icon={FilterHorizontalIcon} className="h-4 w-4" />
              Filter
            </button>
            <button type="button" onClick={() => setViewAll((value) => !value)} className="text-[13px] font-medium text-[#5E568E]">
              {viewAll ? "Show Less" : "View All"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[1.7fr_1.3fr_1.3fr_1fr_56px] gap-4 bg-[#FAFBFD] px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-[#A0A8BE]">
          <p>Name</p>
          <p>Plan</p>
          <p>Date Joined</p>
          <p>Payment</p>
          <p className="text-right">Actions</p>
        </div>

        {visibleRows.map((row) => (
          <div key={row.id} className="relative grid grid-cols-[1.7fr_1.3fr_1.3fr_1fr_56px] gap-4 border-t border-[#F1F4F8] px-4 py-4 text-[13px] text-[#46506D]">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#F1F4F8] text-[10px] font-semibold text-[#25304F]">
                {row.initials}
              </span>
              <span>{row.name}</span>
            </div>
            <p>{row.plan}</p>
            <p>{row.dateJoined}</p>
            <div>
              <span className={cx("rounded-full px-2 py-1 text-[10px] font-semibold", paymentBadgeClass(row.payment))}>{row.payment}</span>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={() => setActionRowId((current) => (current === row.id ? null : row.id))} className="rounded-full p-2 text-[#98A1BA]">
                <span className="block h-1 w-1 rounded-full bg-current shadow-[0_5px_0_currentColor,0_-5px_0_currentColor]" />
              </button>
              {actionRowId === row.id ? (
                <div className="absolute right-4 top-12 z-20 w-[110px] rounded-[10px] border border-[#E6EAF2] bg-white p-2 shadow-[0_18px_40px_rgba(31,35,61,0.14)]">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentFilter(row.payment);
                      setActionRowId(null);
                    }}
                    className="block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[#46506D] hover:bg-[#F5F7FB]"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => suspendRow(row.id)}
                    className="block w-full rounded-[8px] px-3 py-2 text-left text-[12px] text-[#46506D] hover:bg-[#F5F7FB]"
                  >
                    Suspend
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {showNotifications ? (
        <Modal title="Notifications" onClose={() => setShowNotifications(false)}>
          <div className="space-y-3 text-[13px] text-[#5F6786]">
            <p>2 new subscriber payments were recorded in the selected period.</p>
            <p>1 onboarding entry needs review before approval.</p>
          </div>
        </Modal>
      ) : null}

      {showFilter ? (
        <FilterModal
          payment={paymentFilter}
          plan={planFilter}
          enterprise={enterpriseFilter}
          dateOrder={dateOrder}
          onPaymentChange={setPaymentFilter}
          onPlanChange={setPlanFilter}
          onEnterpriseChange={setEnterpriseFilter}
          onDateOrderChange={setDateOrder}
          onApply={() => setShowFilter(false)}
          onClose={() => setShowFilter(false)}
        />
      ) : null}

      {showCustom ? (
        <CustomRangeModal
          startDate={customStartDate}
          endDate={customEndDate}
          onStartDateChange={setCustomStartDate}
          onEndDateChange={setCustomEndDate}
          onApply={applyCustomRange}
          onClose={() => setShowCustom(false)}
        />
      ) : null}

      {showRevenueModal ? (
        <Modal title="Revenue Details" onClose={() => setShowRevenueModal(false)}>
          <div className="space-y-3 text-[13px] text-[#5F6786]">
            <p>The total revenue card reflects the currently selected range: {rangeLabels[range]}.</p>
            <p>Use the range selector to compare short and long-term subscription performance.</p>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export function SuperadminAnalyticsClient() {
  const [range, setRange] = useState<RangeKey>("today");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("2025-10-24");
  const [customEndDate, setCustomEndDate] = useState("2025-11-24");
  const data = dashboardData[range];

  function handleRangeChange(nextRange: RangeKey) {
    if (nextRange === "custom") {
      setShowCustom(true);
      return;
    }

    setRange(nextRange);
  }

  return (
    <div className="space-y-5">
      <DashboardHeader
        title="Analytics Overview"
        subtitle="Here's what's happened recently"
        activeRange={range}
        onRangeChange={handleRangeChange}
        onNotification={() => setShowNotifications((value) => !value)}
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {data.stats.map((card) => (
          <StatSummaryCard key={card.label} card={card} onEdit={() => setShowRevenueModal(true)} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_240px]">
        <LineChart data={data.lines} />
        <DonutChart items={data.pie} />
      </div>

      <BarChart values={data.bars} />

      {showNotifications ? (
        <Modal title="Notifications" onClose={() => setShowNotifications(false)}>
          <div className="space-y-3 text-[13px] text-[#5F6786]">
            <p>Revenue metrics have been refreshed for the selected range.</p>
            <p>Package distribution changed after new subscriber purchases today.</p>
          </div>
        </Modal>
      ) : null}

      {showRevenueModal ? (
        <Modal title="Revenue Insight" onClose={() => setShowRevenueModal(false)}>
          <div className="space-y-3 text-[13px] text-[#5F6786]">
            <p>Total revenue is currently {data.stats[3]?.value} for the selected period.</p>
            <p>Investor Basic remains the strongest contributor across the compared packages.</p>
          </div>
        </Modal>
      ) : null}

      {showCustom ? (
        <CustomRangeModal
          startDate={customStartDate}
          endDate={customEndDate}
          onStartDateChange={setCustomStartDate}
          onEndDateChange={setCustomEndDate}
          onApply={() => {
            setRange("custom");
            setShowCustom(false);
          }}
          onClose={() => setShowCustom(false)}
        />
      ) : null}
    </div>
  );
}
