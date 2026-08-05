import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@/components/analytics";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getDictionary, isLocale, locales } from "@/lib/i18n";
import { getSiteUrl, pageMetadata } from "@/lib/seo";

const skipLabels = {
  en: "Skip to content",
  ru: "Перейти к содержимому",
  es: "Saltar al contenido",
  ar: "الانتقال إلى المحتوى",
} as const;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = getDictionary(locale);
  return {
    ...pageMetadata(locale, "", d.meta.title, d.meta.description),
    title: { default: d.meta.title, template: `%s | Meridian Private` },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const d = getDictionary(locale);
  const base = getSiteUrl();
  const organizationId = `${base}/#organization`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": organizationId, name: "Meridian Private", url: base, description: d.meta.description, email: d.contact.email, areaServed: "Worldwide" },
      { "@type": "WebSite", "@id": `${base}/#website`, url: base, name: "Meridian Private", inLanguage: locales, publisher: { "@id": organizationId } },
      { "@type": "Service", "@id": `${base}/${locale}/#advisory-service`, name: d.common.eyebrow, description: d.meta.description, serviceType: "International property advisory and buyer coordination", areaServed: "Worldwide", provider: { "@id": organizationId }, url: `${base}/${locale}`, inLanguage: locale },
    ],
  };
  return <div lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <a href="#main" className="skip">{skipLabels[locale]}</a>
    <Header locale={locale}/><main id="main">{children}</main><Footer locale={locale}/><Analytics/>
  </div>;
}
