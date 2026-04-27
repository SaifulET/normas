"use client";

import { useState } from "react";
import { DashboardIcon } from "./icons";

export function SavePitchButton() {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      className="inline-flex shrink-0 items-center justify-center px-[4px] py-[2px] text-[#ED6A06]"
      aria-label={saved ? "Pitch saved" : "Save pitch"}
      aria-pressed={saved}
      onClick={() => setSaved((current) => !current)}
    >
      <DashboardIcon name="save" className="h-7 w-5" filled={saved} />
    </button>
  );
}
