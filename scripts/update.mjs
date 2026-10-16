#!/usr/bin/env node
// Incremental ingest for usage.incidental.site.
//   npm run update                -> collect → apply → build → deploy → commit/push
//   npm run update -- collect     -> only collect into content-inbox/queue/pending.json
//   npm run update -- apply       -> only merge content-inbox/queue/translated.json into content-inbox/ingest.json
//   flags: --no-deploy --no-push --since=YYYY-MM-DD
// Never fabricates: every published item must carry the original URL + author and a 10-locale title/summary
// written from that source. Items without translations stay in pending.json until the runner translates them.
import fs from "fs";import path from "path";import {execSync} from "child_process";
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),"..");
const P=(...a)=>path.join(ROOT,...a);
const J=(f,d)=>{try{return JSON.parse(fs.readFileSync(P(f),"utf8"))}catch{return d}};
const W=(f,v)=>{fs.mkdirSync(path.dirname(P(f)),{recursive:true});fs.writeFileSync(P(f),JSON.stringify(v,null,1)+"\n")};
const args=process.argv.slice(2),flag=k=>args.includes("--"+k),opt=k=>(args.find(a=>a.startsWith("--"+k+"="))||"").split("=")[1];
const stages=args.filter(a=>!a.startsWith("--"));const ALL=!stages.length,run=s=>ALL||stages.includes(s);
const LOCALES=["zh-CN","zh-TW","en","ja","ko","ms","vi","fr","es","de"];
const TYPES=["field-case","guide","quota-report","comparison"],PRODUCTS=["openai-dots","meta-muse","grok-bot","multi"];
const CFG=J("scripts/sources.json");const EXCL=new RegExp(CFG.exclude,"i");
const log=(...a)=>console.log("[update]",...a);
const normUrl=u=>{try{const x=new URL(u);x.hash="";["utm_source","utm_medium","utm_campaign","s","t","ref"].forEach(k=>x.searchParams.delete(k));let s=(x.host.replace(/^www\.|^mobile\.|^old\./,"").replace(/^twitter\.com$/,"x.com")+x.pathname).replace(/\/$/,"").toLowerCase();const m=s.match(/^x\.com\/[^/]+\/status\/(\d+)/);if(m)return "x:"+m[1];const y=(/youtube\.com$/.test(x.host)&&x.searchParams.get("v"))||(/^youtu\.be$/.test(x.host)&&x.pathname.slice(1));return y?"yt:"+y:s}catch{return String(u)}};

// ---- everything already known (published or decided) ----
function knownKeys(){
  const k=new Set();const add=u=>u&&k.add(normUrl(u));
  J("content-inbox/public-cases.json",{items:[]}).items.forEach(x=>{add(x.source_url);add(x.copy_url)});
  J("content-inbox/x-cases.json",[]).forEach?.(x=>{add(x.post_url);x.post_id&&k.add("x:"+x.post_id)});
  const xc=J("content-inbox/x-cases.json",{});(xc.items||[]).forEach(x=>{add(x.post_url);x.post_id&&k.add("x:"+x.post_id)});
  J("content-inbox/ingest.json",{items:[]}).items.forEach(x=>{add(x.url);k.add(x.id)});
  J("content-inbox/queue/rejected.json",[]).forEach(x=>{add(x.url||x);x.id&&k.add(x.id)});
  return k;
}
const productOf=t=>{for(const [p,c] of Object.entries(CFG.products))if(new RegExp(c.match,"i").test(t))return p;return null};
const BUA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const get=async(u,type="json",ua)=>{const r=await fetch(u,{headers:{"user-agent":ua||"always-on-usage-ingest/1.0 (+https://usage.incidental.site/)","accept-language":"en"},signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error(r.status+" "+u);const ct=r.headers.get("content-type")||"";if(type==="json"&&!/json/.test(ct))throw new Error("not json ("+ct+") "+u);return type==="json"?r.json():r.text()};

async function collect(){
  const since=opt("since")?Date.parse(opt("since")):Date.parse(J("content-inbox/ingest.json",{}).last_ingest||"2026-09-01")-3*864e5;
  const known=knownKeys();const pending=J("content-inbox/queue/pending.json",{items:[]});
  pending.items.forEach(x=>known.add(normUrl(x.url)));
  const found=[];const stat={};const push=(x,src)=>{const key=normUrl(x.url);if(known.has(key)||known.has(x.id))return;if(EXCL.test(x.text||"")){stat[src+":excluded"]=(stat[src+":excluded"]||0)+1;return}
    known.add(key);found.push({...x,found_at:new Date().toISOString()});stat[src]=(stat[src]||0)+1};
  // 1) Hacker News (Algolia) — headless, public
  for(const [prod,c] of Object.entries(CFG.products))for(const q of c.hn){
    try{const d=await get(`https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}&tags=story&numericFilters=created_at_i>${Math.floor(since/1000)}&hitsPerPage=50`);
      for(const h of d.hits){const text=(h.title||"")+"\n"+(h.story_text||"");const p=productOf(text+" "+(h.url||""));if(p!==prod)continue;
        push({id:"hn:"+h.objectID,url:h.url||`https://news.ycombinator.com/item?id=${h.objectID}`,discussion:`https://news.ycombinator.com/item?id=${h.objectID}`,source:"hn",source_name:"Hacker News",author:h.author,date:h.created_at.slice(0,10),likes:h.points,product:p,text:text.trim().slice(0,2000),media:[]},"hn")}
    }catch(e){log("hn skip:",e.message)}}
  // 2) Reddit .json — best effort (often 403 from datacenter IPs)
  for(const [prod,c] of Object.entries(CFG.products))for(const q of c.reddit){
    try{const d=await get(`https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=new&limit=50`);
      for(const {data:r} of d.data.children){if(r.created_utc*1000<since)continue;const text=r.title+"\n"+(r.selftext||"");if(productOf(text)!==prod)continue;
        push({id:"reddit:"+r.id,url:"https://www.reddit.com"+r.permalink,source:"reddit",source_name:"Reddit r/"+r.subreddit,author:r.author,date:new Date(r.created_utc*1000).toISOString().slice(0,10),likes:r.score,product:prod,text:text.slice(0,2000),media:[]},"reddit")}
    }catch(e){log("reddit skip (best effort):",e.message);break}}
  // 2b) Reddit RSS — fallback when .json is blocked; also best effort (datacenter IPs are often refused)
  for(const [prod,c] of Object.entries(CFG.products))for(const q of c.reddit){
    try{const xml=await get(`https://www.reddit.com/search.rss?q=${encodeURIComponent(q)}&sort=new&limit=50`,"text");
      for(const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)){const e=m[1],g=t=>(e.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`))||[])[1]||"";
        const link=(e.match(/<link href="([^"]+)"/)||[])[1];const date=new Date(g("updated"));if(!link||date<since)continue;
        const text=(g("title")+"\n"+g("content").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/<[^>]+>/g," ").replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n)).replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,"&")).replace(/\s+/g," ").trim();if(productOf(text)!==prod)continue;
        push({id:"reddit:"+normUrl(link),url:link,source:"reddit",source_name:"Reddit",author:(g("name").match(/\/u\/(\S+)/)||[])[1]||g("name").trim(),date:date.toISOString().slice(0,10),likes:null,product:prod,text:text.slice(0,2000),media:[]},"reddit-rss")}
    }catch(e){log("reddit rss skip (best effort):",e.message);break}}
  // 2c) YouTube — public search page (ytInitialData), newest first, then the watch page for the full description + upload date
  const ytVid=async v=>{const h=await get(`https://www.youtube.com/watch?v=${v}&hl=en`,"text",BUA);const d=(h.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/)||[])[1];
    return {desc:d?JSON.parse('"'+d+'"'):"",date:(h.match(/"uploadDate":"(\d{4}-\d\d-\d\d)/)||h.match(/"publishDate":"(\d{4}-\d\d-\d\d)/)||[])[1]||null,views:+((h.match(/"viewCount":"(\d+)"/)||[])[1]||0)||null}};
  for(const [prod,c] of Object.entries(CFG.products))for(const q of c.youtube||[]){
    try{const h=await get(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=CAI%253D&hl=en`,"text",BUA);
      const ids=[...new Set([...h.matchAll(/"videoRenderer":\{"videoId":"([\w-]{11})"/g)].map(m=>m[1]))].slice(0,20);
      for(const v of ids){if(known.has("yt:"+v))continue;
        const seg=h.slice(h.indexOf(`"videoRenderer":{"videoId":"${v}"`)).slice(0,12000);const title=(seg.match(/"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/)||[])[1];
        const ch=(seg.match(/"ownerText":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/)||[])[1];if(!title||!ch)continue;
        const w=await ytVid(v).catch(()=>null);if(!w||!w.date||Date.parse(w.date)<since)continue;const t=JSON.parse('"'+title+'"'),text=t+"\n"+w.desc;
        if(productOf(text)!==prod)continue;
        push({id:"yt:"+v,url:`https://www.youtube.com/watch?v=${v}`,source:"youtube",source_name:"YouTube",author:JSON.parse('"'+ch+'"'),date:w.date,likes:null,views:w.views,product:prod,text:text.slice(0,3000),media:[`https://i.ytimg.com/vi/${v}/hqdefault.jpg`]},"youtube")}
    }catch(e){log("youtube skip:",q,e.message)}}
  // 2d) GitHub search API (unauthenticated: 10 req/min — keep the query list short); repos + issues/discussions-in-issues
  const ghd=new Date(since).toISOString().slice(0,10);
  for(const [prod,c] of Object.entries(CFG.products))for(const q of c.github||[]){
    for(const kind of ["repositories","issues"]){
      try{const d=await get(`https://api.github.com/search/${kind}?q=${encodeURIComponent(q+(kind==="repositories"?` pushed:>${ghd}`:` created:>${ghd}`))}&sort=updated&per_page=30`);
        for(const r of d.items||[]){const text=kind==="repositories"?`${r.full_name}\n${r.description||""}\n${(r.topics||[]).join(" ")}`:`${r.title}\n${(r.body||"").slice(0,1800)}`;
          if(productOf(text+" "+(r.html_url||""))!==prod)continue;
          push({id:"gh:"+normUrl(r.html_url),url:r.html_url,source:"github",source_name:"GitHub",author:(r.owner||r.user||{}).login,date:(r.created_at||"").slice(0,10),likes:kind==="repositories"?r.stargazers_count:(r.reactions?.total_count??null),product:prod,text:text.trim(),media:[]},"github-"+kind)}
      }catch(e){log("github skip:",kind,q,e.message)}
      await new Promise(r=>setTimeout(r,6500))}}
  // 2e) Medium tag feeds (article pages 403 from datacenter IPs; feeds carry the full post HTML)
  for(const tag of CFG.medium_tags||[]){
    try{const xml=await get(`https://medium.com/feed/tag/${tag}`,"text");
      for(const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)){const g=t=>(m[1].match(new RegExp(`<${t}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${t}>`))||[])[1]||"";
        const link=g("link").trim().split("?")[0],date=new Date(g("pubDate"));if(!link||date<since)continue;const body=g("content:encoded").replace(/<[^>]+>/g," ").replace(/\s+/g," ");const text=g("title").trim()+"\n"+body.slice(0,3000);
        const p=productOf(text);if(!p)continue;push({id:"medium:"+normUrl(link),url:link,source:"medium",source_name:"Medium",author:g("dc:creator").trim(),date:date.toISOString().slice(0,10),likes:null,product:p,text,media:[...g("content:encoded").matchAll(/<img[^>]+src="([^"]+)"/g)].map(x=>x[1]).filter(u=>!/stat\?event|_\/stat/.test(u)).slice(0,2)},"medium")}
    }catch(e){log("medium skip:",tag,e.message)}}
  // 2f) dev.to public API by tag (newest), filtered by product match
  for(const tag of CFG.devto_tags||[]){
    try{const d=await get(`https://dev.to/api/articles/latest?tag=${tag}&per_page=100`);
      for(const a of d){if(Date.parse(a.published_at)<since)continue;const text=a.title+"\n"+(a.description||"")+"\n"+(a.tag_list||[]).join(" ");const p=productOf(text);if(!p)continue;
        push({id:"devto:"+a.id,url:a.url,source:"devto",source_name:"DEV Community",author:a.user?.username,date:a.published_at.slice(0,10),likes:a.public_reactions_count??null,product:p,text,media:a.cover_image?[a.cover_image]:[]},"devto")}
    }catch(e){log("devto skip:",tag,e.message)}}
  // 3) Official RSS
  for(const f of CFG.rss){
    try{const xml=await get(f.url,"text");for(const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)){const g=t=>(m[1].match(new RegExp(`<${t}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${t}>`))||[])[1]||"";
      const title=g("title").trim(),link=g("link").trim(),date=new Date(g("pubDate")||Date.now());if(date<since)continue;const text=title+"\n"+g("description").replace(/<[^>]+>/g," ").slice(0,1500);const p=productOf(text);if(!p)continue;
      push({id:"rss:"+normUrl(link),url:link,source:"rss",source_name:f.name,author:f.name,date:date.toISOString().slice(0,10),likes:null,product:p,text,media:[]},"rss")}
    }catch(e){log("rss skip:",f.name,e.message)}}
  // 4) X — the runner drops raw x MCP responses (search_posts_all / get_posts_by_ids) into content-inbox/inbox/x/*.json
  const XD=P("content-inbox/inbox/x");fs.mkdirSync(path.join(XD,"done"),{recursive:true});
  for(const f of fs.readdirSync(XD).filter(f=>f.endsWith(".json"))){
    let d;try{d=JSON.parse(fs.readFileSync(path.join(XD,f),"utf8"))}catch(e){log("x file unreadable:",f);continue}
    const users=Object.fromEntries((d.includes?.users||[]).map(u=>[u.id,u.username]));const media=Object.fromEntries((d.includes?.media||[]).map(m=>[m.media_key,m.url||m.preview_image_url]));
    for(const t of (Array.isArray(d)?d:d.data||[])){const author=t.author||users[t.author_id];if(!author)continue;const text=t.note_tweet?.text||t.text||"";
      if(/^RT @/.test(text)||t.referenced_tweets?.some(r=>r.type==="retweeted"))continue;const p=productOf(text);if(!p)continue;
      push({id:"x:"+t.id,url:`https://x.com/${author}/status/${t.id}`,source:"x",source_name:"X",author,date:(t.created_at||t.date||"").slice(0,10),likes:t.public_metrics?.like_count??t.likes??null,product:p,text,
        media:(t.attachments?.media_keys||[]).map(k=>media[k]).filter(Boolean).concat(t.media||[])},"x")}
    fs.renameSync(path.join(XD,f),path.join(XD,"done",f));
  }
  pending.items.push(...found);pending.updated=new Date().toISOString();W("content-inbox/queue/pending.json",pending);
  log("collect:",JSON.stringify(stat),"→",found.length,"new,",pending.items.length,"pending total");
  if(pending.items.length)log("NEXT (agent/LLM step): for each pending item worth publishing, write title+summary in 10 locales to content-inbox/queue/translated.json (see UPDATE.md); put rejects in content-inbox/queue/rejected.json");
}

function validate(x){const e=[];
  if(!x.id||!x.url||!/^https:\/\//.test(x.url))e.push("id/url");if(!x.author)e.push("author");if(!PRODUCTS.includes(x.product))e.push("product");if(!TYPES.includes(x.type))e.push("type");
  for(const l of LOCALES){const t=x.tr?.[l];if(!t||!t.title?.trim()||!t.summary?.trim())e.push("tr."+l)}
  if(x.source==="x"&&!/^https:\/\/x\.com\/[^/]+\/status\/\d+$/.test(x.url))e.push("x url");
  if(EXCL.test(JSON.stringify(x.tr?.en||{})+" "+(x.text||"")))e.push("excluded topic");return e}

function apply(){
  const tq=J("content-inbox/queue/translated.json",{items:[]});const ing=J("content-inbox/ingest.json",{last_ingest:null,items:[]});
  const pending=J("content-inbox/queue/pending.json",{items:[]});const known=knownKeys();const pend=Object.fromEntries(pending.items.map(x=>[x.id,x]));
  const ok=[],bad=[];const now=new Date().toISOString();
  for(const x of tq.items){const e=validate(x);if(known.has(x.id)||known.has(normUrl(x.url))){log("dup, skipped:",x.id);continue}
    if(e.length){bad.push({...x,errors:e});continue}
    const p=pend[x.id]||{};ok.push({...p,...x,text:x.text||p.text||null,media:x.media?.length?x.media:(p.media||[]),added_at:now,found_at:undefined,discussion:x.discussion||p.discussion});known.add(x.id)}
  if(ok.length){ing.items.push(...ok);ing.last_ingest=now}
  W("content-inbox/ingest.json",ing);W("content-inbox/queue/translated.json",{items:bad});
  const done=new Set(ok.map(x=>x.id));pending.items=pending.items.filter(x=>!done.has(x.id));W("content-inbox/queue/pending.json",pending);
  const by={};ok.forEach(x=>{const k=x.product+"/"+x.source;by[k]=(by[k]||0)+1});
  log("apply:",ok.length,"published",JSON.stringify(by),bad.length?`, ${bad.length} invalid kept in translated.json: `+bad.map(b=>b.id+"["+b.errors.join(",")+"]").join(" "):"");
  return ok.length;
}

const sh=(c,o={})=>{log("$",c);return execSync(c,{cwd:ROOT,stdio:"inherit",...o})};
async function deploy(){
  sh("node scripts/mk_worker.mjs");
  const {CLOUDFLARE_API_TOKEN:tok,CLOUDFLARE_ACCOUNT_ID:acc}=process.env;
  if(!tok||!acc){log("AGENT STEP: no CLOUDFLARE_API_TOKEN/CLOUDFLARE_ACCOUNT_ID in env. Call the Cloudflare MCP tool `execute` with {\"code\":\"$file:/workspace/cf_deploy_v6.js\"}, then re-run with `-- verify commit`.");return false}
  const worker=fs.readFileSync("/tmp/w.mjs","utf8");const fd=new FormData();
  fd.append("metadata",new Blob([JSON.stringify({main_module:"worker.js",compatibility_date:"2026-09-01",compatibility_flags:["nodejs_compat"]})],{type:"application/json"}));
  fd.append("worker.js",new Blob([worker],{type:"application/javascript+module"}),"worker.js");
  const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${acc}/workers/scripts/always-on-usage`,{method:"PUT",headers:{authorization:"Bearer "+tok},body:fd}).then(r=>r.json());
  log("deploy:",r.success?"ok":JSON.stringify(r.errors));return r.success;
}
async function verify(){const ing=J("content-inbox/ingest.json",{});for(let i=0;i<6;i++){try{const h=await get("https://usage.incidental.site/?v="+Date.now(),"text");
  if(!ing.last_ingest||h.includes(ing.last_ingest)){log("verify: live page shows last_ingest",ing.last_ingest);return true}}catch(e){}await new Promise(r=>setTimeout(r,10000))}log("verify: live page does not show",ing.last_ingest,"yet");return false}
function commit(){const ing=J("content-inbox/ingest.json",{items:[]});
  sh("git add -A");try{execSync("git diff --cached --quiet",{cwd:ROOT});log("nothing to commit");return}catch{}
  sh(`git -c user.name=SiinXu -c user.email=sinxu.xsy@gmail.com commit -q -m "ingest: ${ing.items.length} items, last_ingest ${ing.last_ingest}"`);
  if(!flag("no-push")){try{sh("git pull -q --rebase origin HEAD")}catch(e){log("pull --rebase failed:",e.message)}sh("git push -q origin HEAD")}}

if(run("collect"))await collect();
if(run("apply"))apply();
if(run("extract"))try{sh("python3 scripts/extract_sources.py")}catch(e){log("extract skip:",e.message)}
if(run("build"))sh("node gen.mjs && npx vite build",{env:{...process.env,BASE:"/"}});
let deployed=false;if(run("deploy")&&!flag("no-deploy"))deployed=await deploy();
if(run("verify")&&(deployed||stages.includes("verify")))await verify();
if(run("commit"))commit();
