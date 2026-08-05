import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { getSiteUrl, localizedAlternates } from "@/lib/seo";

const pages = ["", "destinations", "destinations/usa", "destinations/uae", "destinations/spain", "destinations/portugal", "destinations/uk", "destinations/turkey", "buying-process", "investors", "about", "faq", "contact", "privacy", "terms", "buyer-brief"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return pages.flatMap((page) => locales.map((locale) => ({
    url: `${base}/${locale}${page ? `/${page}` : ""}`,
    lastModified: new Date("2026-08-05"),
    changeFrequency: page ? "monthly" as const : "weekly" as const,
    priority: page === "" ? 1 : page === "buyer-brief" ? 0.9 : 0.7,
    alternates: { languages: localizedAlternates(page) },
  })));
}
