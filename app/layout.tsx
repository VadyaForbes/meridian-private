import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://meridianprivate.com"), title: "Meridian Private", icons: { icon: "/icon.svg" } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html suppressHydrationWarning><body>{children}</body></html>; }
