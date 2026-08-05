import { z } from "zod";
import { locales } from "./i18n";

const clean=(max:number)=>z.string().trim().min(1).max(max);
export const buyerBriefSchema=z.object({
 submissionId:z.string().uuid(), locale:z.enum(locales), name:clean(120), email:z.string().trim().email().max(254).transform(v=>v.toLowerCase()), phone:clean(50), residence:clean(100), destination:clean(120), goal:z.enum(["home","investment","relocation","other"]), budget:clean(100), timeline:z.enum(["0-3","3-6","6-12","12+","exploring"]), contact:z.enum(["email","phone","whatsapp"]), message:z.string().trim().max(3000), consent:z.literal(true), website:z.string().max(200).optional().default("")
}).strict();
export type BuyerBrief=z.infer<typeof buyerBriefSchema>;
export const publicFields=["name","email","phone","residence","destination","goal","budget","timeline","contact","message","consent"] as const;
