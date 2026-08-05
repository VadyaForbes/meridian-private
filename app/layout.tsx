import "./globals.css";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: "Meridian Private",
  applicationName: "Meridian Private",
  category: "business",
  creator: "Meridian Private",
  referrer: "origin-when-cross-origin",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
