import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://meridianprivate.com"), title: "Meridian Private", icons: { icon: "/icon.svg" }, category:"real estate advisory", creator:"Meridian Private" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html suppressHydrationWarning><body>{children}</body></html>; }
