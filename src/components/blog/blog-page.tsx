/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import {
  createSiteNav,
  siteFooterLinkGroups,
  sitePrimaryCta,
  siteSocialLinks,
} from "@/components/site/site-data";
import { getBlog, getBlogs, type Blog } from "@/lib/blog-api";

function sanitizeBlogHtml(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|iframe|object|embed|link|meta|style)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|iframe|object|embed|link|meta|style)\b[^>]*\/?>/gi, "")
    .replace(/\s(?:on[a-z]+)\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^\s>]+)/gi, "");
}

function stripBlogHtml(html: string) {
  return sanitizeBlogHtml(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function formatBlogDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <article className="overflow-hidden rounded-[8px] border border-[#E7ECF3] bg-white shadow-[0_24px_70px_-58px_rgba(15,23,42,0.35)]">
      {blog.coverImage?.url ? (
        <img src={blog.coverImage.url} alt="" className="aspect-[16/9] w-full object-cover" />
      ) : (
        <div className="aspect-[16/9] bg-[#F3F6FA]" />
      )}
      <div className="p-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#F97316]">
          {formatBlogDate(blog.publishedAt || blog.createdAt) || "Blog"}
        </p>
        <h2 className="mt-3 line-clamp-2 text-[22px] font-bold tracking-[-0.03em] text-[#243041]">
          {blog.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-[14px] leading-7 text-[#69729A]">{stripBlogHtml(blog.description)}</p>
        <Link
          href={`/blog/${blog.slug}`}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-[8px] bg-[#314B6B] px-4 text-[13px] font-semibold text-white transition hover:bg-[#243B5A]"
        >
          Read blog
        </Link>
      </div>
    </article>
  );
}

export async function BlogListPage() {
  let blogs: Blog[] = [];

  try {
    const response = await getBlogs({ limit: 50 });
    blogs = response.data.blogs ?? [];
  } catch {
    blogs = [];
  }

  return (
    <main className="min-h-screen bg-white text-[#243041]">
      <section className="bg-white px-4 py-6 sm:px-6 lg:px-[32px]">
        <SiteHeader navItems={createSiteNav("Blog")} primaryCta={sitePrimaryCta} />
      </section>

      <section className="bg-[#0A2743] px-4 py-16 text-white sm:px-6 lg:px-[147px] lg:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">Insights</p>
        <h1 className="mt-5 text-[44px] font-extrabold leading-tight tracking-[-0.04em] sm:text-[58px]">Blog</h1>
        <p className="mt-5 max-w-2xl text-[17px] leading-8 text-white/75">
          Latest updates, guidance, and platform stories from EARLY-N.
        </p>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-[147px]">
        {blogs.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] border border-[#E7ECF3] bg-[#FBFCFE] px-6 py-14 text-center">
            <h2 className="text-[24px] font-bold text-[#243041]">No blogs published yet</h2>
            <p className="mt-3 text-[14px] text-[#69729A]">Please check back soon.</p>
          </div>
        )}
      </section>

      <SiteFooter linkGroups={siteFooterLinkGroups} socialLinks={siteSocialLinks} />
    </main>
  );
}

export async function BlogDetailPage({ slug }: { slug: string }) {
  const response = await getBlog(slug);
  const blog = response.data;

  return (
    <main className="min-h-screen bg-white text-[#243041]">
      <section className="bg-white px-4 py-6 sm:px-6 lg:px-[32px]">
        <SiteHeader navItems={createSiteNav("Blog")} primaryCta={sitePrimaryCta} />
      </section>

      <article>
        <header className="bg-[#0A2743] px-4 py-10 text-white sm:px-6 lg:px-[147px] lg:py-12">
          <div className="flex items-center justify-between gap-4">
            <Link href="/blog" className="text-[13px] font-semibold text-white/70 transition hover:text-white">
              Back to Blog
            </Link>
            <p className="text-right text-[12px] font-semibold uppercase tracking-[0.18em] text-[#F97316]">
              {formatBlogDate(blog.publishedAt || blog.createdAt) || "Blog"}
            </p>
          </div>
          <h1 className="mx-auto mt-7 max-w-4xl text-center text-[36px] font-extrabold leading-tight tracking-[-0.04em] sm:text-[54px]">
            {blog.title}
          </h1>
        </header>

        {blog.coverImage?.url ? (
          <div className="px-4 pt-8 sm:px-6 lg:px-[147px]">
            <img src={blog.coverImage.url} alt="" className="aspect-[16/8] w-full rounded-[8px] object-cover" />
          </div>
        ) : null}

        <section className="px-4 py-12 sm:px-6 lg:px-[147px]">
          <div
            className="blog-rich-content mx-auto max-w-4xl"
            dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(blog.description) }}
          />
        </section>
      </article>

      <SiteFooter linkGroups={siteFooterLinkGroups} socialLinks={siteSocialLinks} />
    </main>
  );
}
