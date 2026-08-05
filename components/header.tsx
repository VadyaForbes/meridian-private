"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { getDictionary, localeNames, locales, type Locale } from "@/lib/i18n";

const links = [["destinations","destinations"],["buying-process","process"],["investors","investors"],["about","about"],["faq","faq"],["contact","contact"]] as const;
export function Header({locale}:{locale:Locale}){
 const d=getDictionary(locale), pathname=usePathname(), [open,setOpen]=useState(false);
 const changePath=(next:Locale)=>{const parts=pathname.split("/");parts[1]=next;return parts.join("/")||`/${next}`};
 const persist=(next:Locale)=>{void fetch("/api/locale",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({locale:next}),keepalive:true})};
 return <header className={`header ${open?"menu-open":""}`}><div className="shell header-inner">
  <Link href={`/${locale}`} className="brand" onClick={()=>setOpen(false)}>MERIDIAN PRIVATE</Link>
  <nav className="nav" id="primary-nav" aria-label="Primary navigation">
   {links.map(([href,key])=><Link key={href} href={`/${locale}/${href}`} onClick={()=>setOpen(false)}>{d.nav[key]}</Link>)}
   <div className="language" aria-label={d.nav.language}>{locales.map(l=><Link key={l} href={changePath(l)} hrefLang={l} lang={l} aria-current={l===locale?"true":undefined} onClick={()=>persist(l)}>{localeNames[l].slice(0,2).toUpperCase()}</Link>)}</div>
  </nav>
  <Link className="button mobile-brief" href={`/${locale}/buyer-brief`}>{d.nav.brief}</Link>
  <button className="mobile-toggle" type="button" aria-expanded={open} aria-controls="primary-nav" aria-label={open?d.nav.close:d.nav.menu} onClick={()=>setOpen(v=>!v)}>{open?d.nav.close:d.nav.menu}</button>
 </div></header>;
}
