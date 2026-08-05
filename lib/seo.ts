import type { Metadata } from "next";
import { locales, type Locale } from "./i18n";

export const siteName = "Meridian Private";
export const defaultSiteUrl = "https://meridianprivate.com";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || defaultSiteUrl).replace(/\/$/, "");
}

export function localizedAlternates(path = "") {
  const base = getSiteUrl();
  const suffix = path ? `/${path}` : "";
  return {
    ...Object.fromEntries(locales.map((locale) => [locale, `${base}/${locale}${suffix}`])),
    "x-default": `${base}/en${suffix}`,
  };
}

const openGraphLocales: Record<Locale, string> = {
  en: "en_US",
  ru: "ru_RU",
  es: "es_ES",
  ar: "ar_AE",
};

export function pageMetadata(locale: Locale, path: string, title: string, description: string): Metadata {
  const base = getSiteUrl();
  const suffix = path ? `/${path}` : "";
  const canonical = `${base}/${locale}${suffix}`;
  return {
    title,
    description,
    alternates: { canonical, languages: localizedAlternates(path) },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      locale: openGraphLocales[locale],
      alternateLocale: locales.filter((item) => item !== locale).map((item) => openGraphLocales[item]),
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${siteName} — International Property Advisory` }],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}
