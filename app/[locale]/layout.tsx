import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@/components/analytics";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getDictionary, isLocale, locales } from "@/lib/i18n";

export function generateStaticParams(){return locales.map(locale=>({locale}));}
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{const {locale}=await params;if(!isLocale(locale))return{};const d=getDictionary(locale),base=process.env.NEXT_PUBLIC_SITE_URL||"https://meridianprivate.com";return{title:{default:d.meta.title,template:`%s | Meridian Private`},description:d.meta.description,alternates:{canonical:`${base}/${locale}`,languages:Object.fromEntries(locales.map(l=>[l,`${base}/${l}`]))},openGraph:{title:d.meta.title,description:d.meta.description,url:`${base}/${locale}`,siteName:"Meridian Private",locale,images:[{url:"/opengraph-image",width:1200,height:630}],type:"website"}}}
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <div lang={locale} dir={locale==="ar"?"rtl":"ltr"}><a href="#main" className="skip">Skip to content</a><Header locale={locale}/><main id="main">{children}</main><Footer locale={locale}/><Analytics/></div>}
