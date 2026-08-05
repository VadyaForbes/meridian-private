import { createCipheriv,createDecipheriv,createHash,randomBytes } from "node:crypto";
import { Redis } from "@upstash/redis";
import type { LeadStore,QueuedBrief,RateLimiter } from "./types";
const queueKey="meridian:briefs:pending";
function keyFrom(raw:string){return createHash("sha256").update(raw).digest()}
export class UpstashLeadStore implements LeadStore,RateLimiter{
 private redis:Redis;private key:Buffer;
 constructor(url:string,token:string,encryptionKey:string){this.redis=new Redis({url,token});this.key=keyFrom(encryptionKey)}
 private encrypt(item:QueuedBrief){const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",this.key,iv),data=Buffer.concat([cipher.update(JSON.stringify(item)),cipher.final()]);return [iv.toString("base64url"),cipher.getAuthTag().toString("base64url"),data.toString("base64url")].join(".")}
 private decrypt(payload:string){const [i,t,d]=payload.split("."),decipher=createDecipheriv("aes-256-gcm",this.key,Buffer.from(i,"base64url"));decipher.setAuthTag(Buffer.from(t,"base64url"));return JSON.parse(Buffer.concat([decipher.update(Buffer.from(d,"base64url")),decipher.final()]).toString()) as QueuedBrief}
 async reserve(item:QueuedBrief){const lock=await this.redis.set(`meridian:idem:${item.id}`,"1",{nx:true,ex:60*60*24*7});if(lock!=="OK")return"duplicate";await this.redis.hset(queueKey,{[item.id]:this.encrypt(item)});return"created" as const}
 async update(item:QueuedBrief){await this.redis.hset(queueKey,{[item.id]:this.encrypt(item)})}
 async remove(id:string){await this.redis.hdel(queueKey,id)}
 async list(limit:number){const all=await this.redis.hgetall<Record<string,string>>(queueKey);return Object.values(all||{}).slice(0,limit).map(v=>this.decrypt(typeof v==="string"?v:JSON.stringify(v)))}
 async check(key:string,limit:number,windowSeconds:number){const hash=createHash("sha256").update(key).digest("hex");const redisKey=`meridian:rate:${hash}`;const count=await this.redis.incr(redisKey);if(count===1)await this.redis.expire(redisKey,windowSeconds);return count<=limit}
}
