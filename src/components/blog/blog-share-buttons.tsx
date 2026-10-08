"use client";

import { useState } from "react";

function getShareUrl(slug: string) {
  if (typeof window === "undefined") {
    return `/blog/${slug}`;
  }

  return `${window.location.origin}/blog/${slug}`;
}

export function BlogShareButtons({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleNativeShare() {
    const shareUrl = getShareUrl(slug);

    if (navigator.share) {
      await navigator.share({
        title,
        url: shareUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function handleCopy() {
    const shareUrl = getShareUrl(slug);
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function openSocialShare(provider: "facebook" | "linkedin" | "whatsapp" | "x") {
    const shareUrl = getShareUrl(slug);
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    };

    window.open(urls[provider], "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 pt-8 sm:px-6 lg:px-0">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => void handleNativeShare()}
          className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#F97316] px-4 text-[13px] font-semibold text-white transition hover:bg-[#e36810]"
        >
          Share
        </button>
        <button
          type="button"
          onClick={() => openSocialShare("facebook")}
          className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#DDE2EC] bg-white px-4 text-[13px] font-semibold text-[#314B6B] transition hover:bg-[#F6F7FA]"
        >
          Facebook
        </button>
        <button
          type="button"
          onClick={() => openSocialShare("x")}
          className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#DDE2EC] bg-white px-4 text-[13px] font-semibold text-[#314B6B] transition hover:bg-[#F6F7FA]"
        >
          X
        </button>
        <button
          type="button"
          onClick={() => openSocialShare("linkedin")}
          className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#DDE2EC] bg-white px-4 text-[13px] font-semibold text-[#314B6B] transition hover:bg-[#F6F7FA]"
        >
          LinkedIn
        </button>
        <button
          type="button"
          onClick={() => openSocialShare("whatsapp")}
          className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#DDE2EC] bg-white px-4 text-[13px] font-semibold text-[#314B6B] transition hover:bg-[#F6F7FA]"
        >
          WhatsApp
        </button>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#DDE2EC] bg-white px-4 text-[13px] font-semibold text-[#314B6B] transition hover:bg-[#F6F7FA]"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
