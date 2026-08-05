"use client";
import Script from "next/script";
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[])=>void } }
export function Analytics(){const id=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;if(!id)return null;return <><Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive"/><Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});`}</Script></>}
export function track(name:string,params?:Record<string,string>){if(typeof window!=="undefined")window.gtag?.("event",name,params||{});}
