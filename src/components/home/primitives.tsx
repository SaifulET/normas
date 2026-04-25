import type { ReactNode } from "react";
import { AppIcon } from "./icons";
import type { FaqItem, FooterLinkGroup, HeroSearchField, StepItem } from "./types";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  accentTitle?: string;
  description?: string;
  align?: "left" | "center";
  titleClassName?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  accentTitle,
  description,
  align = "center",
  titleClassName,
}: SectionHeadingProps) {
  const alignmentClass = align === "center" ? "text-center" : "text-left";
  const descriptionClass =
    align === "center" ? "mx-auto" : "";

  return (
    <div className={alignmentClass}>
      {eyebrow ? (
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#E65E02]">{eyebrow}</p>
      ) : null}
      <h2
        className={`mt-4 text-4xl font-black leading-tight tracking-normal text-[#182231] sm:text-5xl ${titleClassName ?? ""}`}
      >
        {title}
        {accentTitle ? <span className="block text-[#E65E02]">{accentTitle}</span> : null}
      </h2>
      {description ? (
        <p className={`mt-4 w-[442px] text-base leading-7 text-[#182231]/60 ${descriptionClass}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function HeroField({ field }: { field: HeroSearchField }) {
  if (field.type === "text") {
    return (
      <label className="flex min-h-16 flex-col justify-center border-b border-[#2B425D]/10 px-5 text-left md:border-b-0 md:border-r">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#182231]/60">
          {field.label}
        </span>
        <input
          name={field.name}
          className="mt-1 w-full bg-transparent text-sm text-[#182231] outline-none placeholder:text-[#182231]/40"
          placeholder={field.placeholder}
        />
      </label>
    );
  }

  return (
    <label className="relative flex min-h-16 flex-col justify-center border-b border-[#2B425D]/10 px-5 text-left md:border-b-0 md:border-r">
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#182231]/60">
        {field.label}
      </span>
      <select
        name={field.name}
        defaultValue={field.defaultValue}
        className="mt-1 w-full appearance-none bg-transparent pr-7 text-sm text-[#182231] outline-none"
      >
        {!field.options.includes(field.defaultValue) ? <option>{field.defaultValue}</option> : null}
        {field.options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <AppIcon
        name="arrowDown"
        className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#2B425D]"
      />
    </label>
  );
}

export function StepCards({
  items,
  highlightedIndex,
  highlightedClassName,
  defaultClassName,
  highlightedLabelClassName,
  defaultLabelClassName,
  highlightedTextClassName,
  defaultTextClassName,
}: {
  items: StepItem[];
  highlightedIndex: number;
  highlightedClassName: string;
  defaultClassName: string;
  highlightedLabelClassName: string;
  defaultLabelClassName: string;
  highlightedTextClassName: string;
  defaultTextClassName: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item, index) => {
        const isHighlighted = index === highlightedIndex;

        return (
          <article
            key={item.title}
            className={`rounded-md p-5 ring-1 ${isHighlighted ? highlightedClassName : defaultClassName}`}
          >
            <p
              className={`text-[10px] font-black ${
                isHighlighted ? highlightedLabelClassName : defaultLabelClassName
              }`}
            >
              {item.label}
            </p>
            <h3 className="mt-3 text-base font-black">{item.title}</h3>
            <p
              className={`mt-1 text-xs leading-5 ${
                isHighlighted ? highlightedTextClassName : defaultTextClassName
              }`}
            >
              {item.text}
            </p>
          </article>
        );
      })}
    </div>
  );
}

export function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="mt-2 flex gap-1 text-[#E7A018]">
      {Array.from({ length: 5 }, (_, index) => (
        <AppIcon key={index} name="star" className="h-3.5 w-3.5" filled={index < rating} />
      ))}
    </div>
  );
}

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="mt-12 divide-y divide-[#2B425D]/10">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-left text-xl font-semibold text-[#2B425D] marker:hidden sm:text-2xl">
            {item.question}
            <AppIcon name="add" className="h-5 w-5 shrink-0 transition group-open:rotate-45" />
          </summary>
          <p className="max-w-3xl pb-7 text-sm leading-7 text-[#182231]/60">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function FooterLinkColumns({ groups }: { groups: FooterLinkGroup[] }) {
  return (
    <>
      {groups.map((group) => (
        <div key={group.title}>
          <h3 className="text-sm font-black">{group.title}</h3>
          <ul className="mt-5 space-y-3">
            {group.links.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-sm text-white/85 transition hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

export function SectionShell({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return <section className={className}>{children}</section>;
}
