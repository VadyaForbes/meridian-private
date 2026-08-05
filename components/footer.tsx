import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n";

const footerNavigationLabels: Record<Locale, string> = { en: "Footer navigation", ru: "Навигация в подвале", es: "Navegación del pie", ar: "التنقل في التذييل" };

export function Footer({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  return <footer className="footer"><div className="shell">
    <div className="footer-kicker" aria-label="Meridian Private"><span>MERIDIAN</span><i>PRIVATE</i></div>
    <div className="footer-top"><div><p className="eyebrow">{d.common.eyebrow}</p><p className="footer-statement">{d.footer.line}</p></div>
      <nav className="footer-nav" aria-label={footerNavigationLabels[locale]}><Link href={`/${locale}/destinations`}>{d.nav.destinations}</Link><Link href={`/${locale}/buying-process`}>{d.nav.process}</Link><Link href={`/${locale}/about`}>{d.nav.about}</Link><Link href={`/${locale}/contact`}>{d.nav.contact}</Link><Link href={`/${locale}/privacy`}>{d.footer.privacy}</Link><Link href={`/${locale}/terms`}>{d.footer.terms}</Link></nav>
    </div>
    <p className="footer-disclosure">{d.common.disclosure}</p>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Meridian Private. {d.footer.rights}</span><span>{d.footer.line}</span></div>
  </div></footer>;
}
