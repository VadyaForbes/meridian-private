import type { BuyerBrief } from "@/lib/brief-schema";
import type { CrmAdapter } from "./types";

export function mapBriefToHubSpot(brief:BuyerBrief){
 const [firstname,...rest]=brief.name.split(/\s+/);
 return {email:brief.email,firstname,lastname:rest.join(" ")||undefined,phone:brief.phone,country:brief.residence,lifecyclestage:"lead",hs_lead_status:"NEW",meridian_purchase_country:brief.destination,meridian_purchase_goal:brief.goal,meridian_budget:brief.budget,meridian_purchase_timeline:brief.timeline,meridian_contact_method:brief.contact,meridian_buyer_message:brief.message,meridian_locale:brief.locale};
}
export class HubSpotAdapter implements CrmAdapter{
 constructor(private token:string){}
 async createLead(brief:BuyerBrief){const response=await fetch("https://api.hubapi.com/crm/v3/objects/contacts",{method:"POST",headers:{Authorization:`Bearer ${this.token}`,"Content-Type":"application/json"},body:JSON.stringify({properties:mapBriefToHubSpot(brief)})});if(!response.ok)throw new Error("crm_delivery_failed");const body=await response.json() as {id:string};return{externalId:body.id};}
}
