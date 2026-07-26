import type { Metadata } from "next";
import { Geist_Mono, Manrope, Poppins } from "next/font/google";
import { PageTransitionProvider } from "@/components/page-transition-provider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EARLY-N | Ethical Investment Platform",
  description:
    "Connect impact-driven investors with ethical startups seeking mission-aligned capital.",
  icons: {
    apple: "/logo.svg?v=3",
    icon: [{ url: "/logo.svg?v=3", type: "image/svg+xml" }],
    shortcut: "/logo.svg?v=3",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </body>
    </html>
  );
}
