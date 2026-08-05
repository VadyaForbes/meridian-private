import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";
export function proxy(request: NextRequest){
  if(request.nextUrl.pathname !== "/") return NextResponse.next();
  const saved=request.cookies.get("meridian-locale")?.value;
  return NextResponse.redirect(new URL(`/${saved && isLocale(saved) ? saved : "en"}`,request.url));
}
export const config={matcher:["/"]};
