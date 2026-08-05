import { NextRequest,NextResponse } from "next/server";import { buyerBriefSchema,publicFields } from "@/lib/brief-schema";import { getIntegrations } from "@/lib/integrations/env";import { acceptBrief } from "@/lib/integrations/service";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 let body:unknown;try{body=await request.json()}catch{return NextResponse.json({code:"invalid",fields:[]},{status:400})}
 const parsed=buyerBriefSchema.safeParse(body);if(!parsed.success){const fields=[...new Set(parsed.error.issues.map(i=>i.path[0]).filter((x):x is typeof publicFields[number]=>publicFields.includes(x as typeof publicFields[number])))];return NextResponse.json({code:"invalid",fields},{status:400})}
 if(parsed.data.website)return NextResponse.json({code:"accepted"},{status:202});
 try{const deps=getIntegrations();const forwarded=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";const allowed=await deps.store.check(`${forwarded}:${parsed.data.email}`,5,60*15);if(!allowed)return NextResponse.json({code:"temporary"},{status:429,headers:{"Retry-After":"900"}});const result=await acceptBrief(parsed.data,deps);return NextResponse.json({code:result.duplicate?"duplicate":"accepted",queued:!result.complete},{status:result.duplicate?200:202});}catch{return NextResponse.json({code:"temporary"},{status:503,headers:{"Retry-After":"60"}})}
}
