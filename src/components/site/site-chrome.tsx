import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import { AppIcon } from "@/components/home/icons";
import type { FooterLinkGroup, LinkItem, SocialLink } from "@/components/home/types";
import { NavbarAuthControls } from "@/components/site/auth-controls";
import { isAuthenticated, logout } from "@/lib/auth";
import { MobileNav } from "@/components/site/mobile-nav";

const headerNavFont = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

interface SiteHeaderProps {
  navItems: LinkItem[];
  primaryCta: LinkItem;
}

export async function SiteHeader({ navItems, primaryCta }: SiteHeaderProps) {
  const authenticated = await isAuthenticated();

  return (
    <header className="relative z-50 flex h-[67px] items-center justify-between rounded-full bg-[#F2F2F280] px-4 shadow-sm backdrop-blur">
      <Link href="/" aria-label="EARLY-N home" className="shrink-0">
        <Image src="/logo.svg" alt="EARLY-N" width={112} height={52} priority className="h-10 w-auto sm:h-[52px] sm:w-auto" />
      </Link>

      <nav
        className={`${headerNavFont.className} hidden items-center gap-8 text-[14px] font-semibold leading-5 tracking-[0.7px] uppercase text-[#182231] md:flex`}
      >
        {navItems.map((item) => (
          <Link key={item.label} className={item.active ? "text-[#E65E02]" : undefined} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3 text-xs font-bold">
        <NavbarAuthControls
          authenticated={authenticated}
          primaryCta={primaryCta}
          logoutAction={logout}
        />
        <MobileNav
          navItems={navItems}
          primaryCta={primaryCta}
          authenticated={authenticated}
          logoutAction={logout}
        />
      </div>
    </header>
  );
}

interface SiteFooterProps {
  linkGroups: FooterLinkGroup[];
  socialLinks: SocialLink[];
}

export function SiteFooter({ linkGroups, socialLinks }: SiteFooterProps) {
  return (
    <footer id="footer" className="bg-[#2B425D] px-4 py-12 text-white sm:px-6 lg:px-[147px]">
      <div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[3fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="EARLY-N home">
              <Image src="/footer-logo.svg" alt="EARLY-N" width={112} height={52} />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/85">
              Impact-driven investment for a better future. Connecting capital with conscience.
            </p>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-black">{group.title}</h3>
              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/85 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/40 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/80">
            {"\u00A9"} 2026 EARLY-N. Impact-driven investment for a better future.
          </p>

          <div className="flex items-center gap-5">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white transition hover:text-[#E65E02]"
                aria-label={link.name}
              >
                <AppIcon name={link.icon} className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
