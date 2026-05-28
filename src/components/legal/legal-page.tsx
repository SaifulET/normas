import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import {
  createSiteNav,
  siteFooterLinkGroups,
  sitePrimaryCta,
  siteSocialLinks,
} from "@/components/site/site-data";
import { API_BASE_URL } from "@/lib/api-config";
import type { LegalContent, LegalContentByTypeResponse, LegalContentType } from "@/lib/legal-api";

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: readonly string[];
}

export interface LegalPageFallback {
  description: string;
  sections: readonly LegalSection[];
  title: string;
}

interface LegalPageContent {
  bodyHtml: string;
  description: string;
  lastUpdatedLabel: string;
  navSections: Array<{
    id: string;
    title: string;
  }>;
  title: string;
}

interface LegalPageProps {
  content: LegalPageContent;
}

function decodeHtmlEntities(value: string) {
  const entities: Record<string, string> = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => entities[name.toLowerCase()] ?? match);
}

function stripTags(value: string) {
  return decodeHtmlEntities(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function sanitizeHtml(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, "")
    .replace(/\s(?:on[a-z]+|style|class|id)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(?:"\s*(?:javascript|data):[^"]*"|'\s*(?:javascript|data):[^']*'|(?:javascript|data):[^\s>]+)/gi, "");
}

function slugify(value: string, fallback: string) {
  const slug = stripTags(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function uniqueSlug(slug: string, seen: Map<string, number>) {
  const count = seen.get(slug) ?? 0;
  seen.set(slug, count + 1);
  return count === 0 ? slug : `${slug}-${count + 1}`;
}

function fallbackToHtml(fallback: LegalPageFallback) {
  const sectionsHtml = fallback.sections
    .map(
      (section) => `
        <h2>${section.title}</h2>
        ${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}
      `,
    )
    .join("");

  return `<h1>${fallback.title}</h1><p>${fallback.description}</p>${sectionsHtml}`;
}

function getFirstTagText(html: string, tagName: string) {
  const match = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i").exec(html);
  return match ? stripTags(match[1]) : "";
}

function removeFirstTag(html: string, tagName: string) {
  return html.replace(new RegExp(`<${tagName}\\b[^>]*>[\\s\\S]*?<\\/${tagName}>`, "i"), "");
}

function getIntroDescription(html: string) {
  const firstSectionIndex = html.search(/<h[2-6]\b/i);
  const introHtml = firstSectionIndex >= 0 ? html.slice(0, firstSectionIndex) : html;
  const withoutHeading = removeFirstTag(introHtml, "h1");
  const paragraphs = Array.from(withoutHeading.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi))
    .map((match) => stripTags(match[1]))
    .filter(Boolean);

  return paragraphs.join(" ");
}

function prepareLegalContent(rawContent: LegalContent | null | undefined, fallback: LegalPageFallback): LegalPageContent {
  const sourceHtml = rawContent?.content?.trim() || fallbackToHtml(fallback);
  const sanitizedHtml = sanitizeHtml(sourceHtml);
  const title = rawContent?.title?.trim() || getFirstTagText(sanitizedHtml, "h1") || fallback.title;
  const description = getIntroDescription(sanitizedHtml) || fallback.description;
  const firstSectionIndex = sanitizedHtml.search(/<h[2-6]\b/i);
  const bodySource =
    firstSectionIndex >= 0 ? sanitizedHtml.slice(firstSectionIndex) : removeFirstTag(sanitizedHtml, "h1");
  const seen = new Map<string, number>();
  const navSections: LegalPageContent["navSections"] = [];

  const bodyHtml = bodySource.replace(/<h([2-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi, (match, level: string, innerHtml: string) => {
    const titleText = stripTags(innerHtml);
    const id = uniqueSlug(slugify(titleText, `section-${navSections.length + 1}`), seen);

    navSections.push({
      id,
      title: titleText || `Section ${navSections.length + 1}`,
    });

    return `<h${level} id="${id}">${innerHtml}</h${level}>`;
  });

  return {
    bodyHtml,
    description,
    lastUpdatedLabel: formatLastUpdated(rawContent),
    navSections,
    title,
  };
}

function formatLastUpdated(content: LegalContent | null | undefined) {
  const value = content?.lastModifiedAt ?? content?.updatedAt ?? content?.createdAt;

  if (!value) {
    return "Last updated: Oct 2023";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Last updated: Oct 2023";
  }

  return `Last updated: ${new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)}`;
}

async function fetchLegalContent(type: LegalContentType) {
  try {
    const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
    const response = await fetch(`${baseUrl}legal-contents/type/${type}`, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as LegalContentByTypeResponse;
    return Array.isArray(payload.data) ? payload.data[0] ?? null : payload.data;
  } catch {
    return null;
  }
}

export async function getLegalPageContent(type: LegalContentType, fallback: LegalPageFallback) {
  const content = await fetchLegalContent(type);
  return prepareLegalContent(content, fallback);
}

export function LegalPage({ content }: LegalPageProps) {
  const hasNavItems = content.navSections.length > 0;

  return (
    <main className="min-h-screen bg-white text-[#243041]">
      <section className="bg-white px-4 py-6 sm:px-6 lg:px-[32px]">
        <SiteHeader navItems={createSiteNav()} primaryCta={sitePrimaryCta} />
      </section>

      <section className="bg-white px-4 pb-20 pt-8 sm:px-6 sm:pb-24 lg:px-[76px] lg:pt-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)] lg:items-start">
          <aside className="min-w-0 lg:sticky lg:top-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5B6F8C]">
              Legal Documentation
            </p>
            <p className="mt-2 text-xs text-[#9AA3AF]">{content.lastUpdatedLabel}</p>

            {hasNavItems ? (
              <nav className="mt-5 flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
                {content.navSections.map((section, index) => (
                  <Link
                    key={section.id}
                    href={`#${section.id}`}
                    className={`block min-w-[190px] rounded-[8px] px-4 py-3 text-sm transition lg:min-w-0 ${
                      index === 0
                        ? "bg-[#F3F5F8] font-medium text-[#243041]"
                        : "text-[#5F6B7A] hover:bg-[#F8FAFC] hover:text-[#243041]"
                    }`}
                  >
                    {section.title}
                  </Link>
                ))}
              </nav>
            ) : null}
          </aside>

          <article className="min-w-0 rounded-[8px] border border-[#E7ECF3] bg-white px-5 py-7 shadow-[0_24px_60px_-54px_rgba(15,23,42,0.24)] sm:px-8 sm:py-9 lg:px-12 lg:py-12">
            <header className="border-b border-[#E7ECF3] pb-8">
              <h1 className="text-[30px] font-semibold leading-[1.25] text-[#1F2937] sm:text-[36px] lg:text-[40px]">
                {content.title}
              </h1>
              <p className="mt-4 max-w-4xl text-[16px] leading-8 text-[#4B5563] sm:text-[18px]">
                {content.description}
              </p>
            </header>

            <div className="legal-rich-content mt-9" dangerouslySetInnerHTML={{ __html: content.bodyHtml }} />
          </article>
        </div>
      </section>

      <SiteFooter linkGroups={siteFooterLinkGroups} socialLinks={siteSocialLinks} />

      <style>{`
        .legal-rich-content {
          color: #5f6b7a;
          font-size: 16px;
          line-height: 1.85;
        }

        .legal-rich-content > * + * {
          margin-top: 16px;
        }

        .legal-rich-content h2,
        .legal-rich-content h3,
        .legal-rich-content h4,
        .legal-rich-content h5,
        .legal-rich-content h6 {
          color: #1f2937;
          font-weight: 600;
          line-height: 1.45;
          scroll-margin-top: 96px;
        }

        .legal-rich-content h2 {
          font-size: 20px;
          margin-top: 40px;
        }

        .legal-rich-content h3 {
          font-size: 18px;
          margin-top: 32px;
        }

        .legal-rich-content h4,
        .legal-rich-content h5,
        .legal-rich-content h6 {
          font-size: 16px;
          margin-top: 28px;
        }

        .legal-rich-content h2:first-child,
        .legal-rich-content h3:first-child,
        .legal-rich-content h4:first-child {
          margin-top: 0;
        }

        .legal-rich-content p {
          color: #5f6b7a;
        }

        .legal-rich-content ul,
        .legal-rich-content ol {
          padding-left: 1.35rem;
        }

        .legal-rich-content ul {
          list-style: disc;
        }

        .legal-rich-content ol {
          list-style: decimal;
        }

        .legal-rich-content a {
          color: #243041;
          font-weight: 500;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .legal-rich-content blockquote {
          border-left: 3px solid #d8deea;
          color: #4b5563;
          padding-left: 16px;
        }

        @media (min-width: 640px) {
          .legal-rich-content {
            font-size: 17px;
            line-height: 1.9;
          }

          .legal-rich-content h2 {
            font-size: 22px;
          }
        }
      `}</style>
    </main>
  );
}
