import type { BuyerBrief } from "@/lib/brief-schema";
export interface CrmAdapter { createLead(brief:BuyerBrief):Promise<{externalId:string}> }
export interface EmailAdapter { notifyOwner(brief:BuyerBrief):Promise<void>; confirmBuyer(brief:BuyerBrief):Promise<void> }
export type DeliveryState={crm:boolean;ownerEmail:boolean;buyerEmail:boolean};
export type QueuedBrief={id:string;brief:BuyerBrief;state:DeliveryState;createdAt:string;attempts:number};
export interface LeadStore { reserve(item:QueuedBrief):Promise<"created"|"duplicate">; update(item:QueuedBrief):Promise<void>; remove(id:string):Promise<void>; list(limit:number):Promise<QueuedBrief[]> }
export interface RateLimiter { check(key:string,limit:number,windowSeconds:number):Promise<boolean> }
