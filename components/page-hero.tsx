import { AbstractArt } from "./abstract-art";

export function PageHero({eyebrow,title,intro}:{eyebrow:string;title:string;intro:string}){return <header className="page-hero"><div className="shell page-hero-grid"><div className="reveal"><p className="eyebrow">{eyebrow}</p><h1 className="page-title">{title}</h1><p className="lead">{intro}</p></div><AbstractArt compact/></div></header>}
