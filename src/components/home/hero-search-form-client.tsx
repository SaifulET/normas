"use client";

import type { FormEvent } from "react";
import { AppIcon } from "./icons";
import { HeroField } from "./primitives";
import type { HeroSearchField } from "./types";

export function HeroSearchFormClient({
  actionLabel,
  fields,
}: {
  actionLabel: string;
  fields: HeroSearchField[];
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    const formData = new FormData(event.currentTarget);

    for (const [key, value] of formData.entries()) {
      const stringValue = typeof value === "string" ? value.trim() : "";

      if (stringValue) {
        params.set(key, stringValue);
      }
    }

    const query = params.toString();
    window.location.assign(query ? `/search?${query}` : "/search");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-12 grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-md bg-white shadow-xl ring-1 ring-[#2B425D]/10 md:grid-cols-[1.25fr_1fr_1fr_1fr_auto]"
    >
      {fields.map((field) => (
        <HeroField key={field.name} field={field} />
      ))}
      <button
        type="submit"
        className="flex min-h-16 items-center justify-center gap-3 bg-[#2B425D] px-8 text-base font-bold text-white transition hover:bg-[#21344b]"
      >
        <AppIcon name="search" className="h-5 w-5" />
        {actionLabel}
      </button>
    </form>
  );
}
