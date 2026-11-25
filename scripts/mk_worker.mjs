// Pack dist/ (text as utf8, binaries as base64, whole map gzipped) into a single Cloudflare Worker and write a deploy snippet.
// Output: /workspace/cf_deploy_v6.js (async fn for the Cloudflare MCP `execute` tool) and /tmp/w.mjs (raw worker).
import fs from "fs";import path from "path";import zlib from "zlib";import crypto from "crypto";
const T={html:"text/html; charset=utf-8",css:"text/css",js:"application/javascript",json:"application/json",txt:"text/plain; charset=utf-8",png:"image/png",xml:"application/xml; charset=utf-8",svg:"image/svg+xml",webp:"image/webp",jpg:"image/jpeg"};
// v12: brotli (window 2^24) over one concatenated buffer. Shared page chrome across ~1,700 pages compresses ~4x better than gzip's 32 KB window,
// which keeps the deploy snippet well under the 4 MB budget. The worker inflates once per isolate with node:zlib and serves byte ranges (no JSON.parse of the whole site).
const IDX={},parts=[];let off=0;const walk=d=>{for(const f of fs.readdirSync(d).sort()){const p=path.join(d,f);if(fs.statSync(p).isDirectory())walk(p);else{const ty=T[f.split(".").pop()]||"application/octet-stream",b=fs.readFileSync(p);IDX["/"+path.relative("dist",p)]=[ty,off,b.length,crypto.createHash("sha256").update(b).digest("hex").slice(0,12)];parts.push(b);off+=b.length}}};walk("dist");
const raw=Buffer.concat(parts);
const Z=zlib.brotliCompressSync(raw,{params:{[zlib.constants.BROTLI_PARAM_QUALITY]:11,[zlib.constants.BROTLI_PARAM_LGWIN]:24,[zlib.constants.BROTLI_PARAM_SIZE_HINT]:raw.length}}).toString("base64");
export const worker=`import zlib from "node:zlib";import {Buffer} from "node:buffer";const I=${JSON.stringify(IDX)};const Z=${JSON.stringify(Z)};let R;const LC=["zh-CN","zh-TW","en","ja","ko","ms","vi","fr","es","de"];
function load(){return R||(R=zlib.brotliDecompressSync(Buffer.from(Z,"base64")))}
const H={async fetch(r){const B=load();let u;try{u=decodeURIComponent(new URL(r.url).pathname)}catch{u="/"}const L=new URL(r.url).searchParams.get("lang");for(const k of [u,u+".html",u.replace(/\\/?$/,"/")+"index.html"]){const e=I[k];if(e){let body=B.subarray(e[1],e[1]+e[2]);return new Response(body,{headers:{"content-type":e[0],"cache-control":"public, max-age=300"}})}}return new Response("Not found",{status:404,headers:{"content-type":"text/plain; charset=utf-8"}})}}
// 2026-10-28 perf: the Worker output is a pure function of (BUILD, path, ?lang), so the edge copy is keyed by BUILD (a new deploy = new keys, no purge needed)
// and kept 24 h (was 5 min: nearly every 5-minute uptime probe and most crawler hits were a cold miss = per-isolate brotli inflate of the whole site bundle).
// Query strings other than ?lang= (utm_*, cache busters) no longer fragment the cache. Browser TTL unchanged (300 s); content-hashed /assets/ are immutable.
// 2026-11-10 (daily-fix 11-09): the key is now the served file's own content hash (I[k][3], sha256/12) instead of a per-deploy BUILD stamp.
// update.yml redeploys every 6 h (6 uploads on 11-09 UTC) and each upload used to orphan every cached page, so the next visit in each colo paid the
// ~1 s CPU inflate of the ~97 MB bundle again. Unchanged pages now keep their edge copy across deploys; a changed file gets a new key at once.
// KV bumps only when the Worker's own transform logic changes. Response bytes and headers are unchanged.
const KV="k2";
// 2026-11-14 (daily-fix 11-14): directory URLs without a trailing slash (e.g. /stories) used to serve the same
// index.html as /stories/ with HTTP 200, splitting traffic and SEO. 301 to the slashed form (query string kept)
// before the cache lookup, matching the canonical/og:url already on the page.
function slashRedirect(r){const url=new URL(r.url);let u;try{u=decodeURIComponent(url.pathname)}catch{u="/"}if(u.length>1&&!u.endsWith("/")&&!/\\.[A-Za-z0-9]+$/.test(u)&&I[u.replace(/\\/?$/,"/")+"index.html"]&&!I[u]&&!I[u+".html"])return Response.redirect(url.origin+u+"/"+url.search,301);return null}
function ent(r){let u;try{u=decodeURIComponent(new URL(r.url).pathname)}catch{u="/"}for(const k of [u,u+".html",u.replace(/\\/?$/,"/")+"index.html"]){const e=I[k];if(e)return e}return null}
function ck(r,e){const u=new URL(r.url);return new Request(u.origin+u.pathname+"?__c="+KV+"."+e[3],{method:"GET"})}
// 2026-11-24: ?lang= only rewrites two tags in <head>. Do it on the way out so all locales share one edge copy
// (previously each lang was a separate 8 MB cache entry, and the worker decoded the whole HTML).
function rewriteLang(body,L,ctype){if(!L||!LC.includes(L)||!String(ctype||"").startsWith("text/html"))return body;const u8=body instanceof Uint8Array?body:new Uint8Array(body);const n=Math.min(u8.length,16384);const head=new TextDecoder().decode(u8.subarray(0,n));const cut=head.lastIndexOf(">");if(cut<0)return u8;const prefix=head.slice(0,cut+1);const next=prefix.replace(/(<link rel="canonical" href=")([^"]*)"/,(m,a,h)=>a+h+"?lang="+L+'"').replace(/(<meta property="og:url" content=")([^"]*)"/,(m,a,h)=>a+h+"?lang="+L+'"');if(next===prefix)return u8;const preB=Buffer.from(prefix),nextB=Buffer.from(next);return Buffer.concat([nextB,Buffer.from(u8.subarray(preB.length))])}
// 2026-11-17 (daily-fix 11-07/11-16 proposal, approved by Siin): HTML gets max-age=3600 + stale-while-revalidate=86400 (was 300).
// The edge copy stays keyed by each file's content hash, so a publish that changes a page gets a new key at once ("purge on publish").
function out(res,tag,path){const h=new Headers(res.headers);if(res.status===200)h.set("cache-control",path.startsWith("/assets/")?"public, max-age=31536000, immutable":(h.get("content-type")||"").startsWith("text/html")?"public, max-age=3600, stale-while-revalidate=86400":"public, max-age=300");h.set("x-uh-cache",tag);return new Response(res.body,{status:res.status,headers:h})}
export default{async fetch(r,env,ctx){
const redir=slashRedirect(r);if(redir)return redir;
if(r.method!=="GET"&&r.method!=="HEAD")return H.fetch(r);
const e=ent(r);if(!e)return out(await H.fetch(r),"MISS",new URL(r.url).pathname);
const path=new URL(r.url).pathname,c=caches.default,k=ck(r,e),hit=await c.match(k);
const L=new URL(r.url).searchParams.get("lang");
const apply=async (res,tag)=>{if(res.status!==200||!L||!LC.includes(L))return out(res,tag,path);const body=rewriteLang(new Uint8Array(await res.arrayBuffer()),L,res.headers.get("content-type"));return out(new Response(body,{status:200,headers:res.headers}),tag,path)};
if(hit)return apply(hit,"HIT");
const res=await H.fetch(r);
if(res.status===200&&ctx){const sh=new Headers(res.headers);sh.set("cache-control","public, max-age=86400");ctx.waitUntil(c.put(k,new Response(res.clone().body,{status:200,headers:sh})))}
return apply(res,"MISS")}}
`;
export const SCRIPT="always-on-usage",HOST="usage.incidental.site",ZONE="301123022c5b99828634c0ea906b20da";
const snippet=`async () => { const B="F"+Date.now(); const worker=${JSON.stringify(worker)};
const meta={"main_module":"worker.js","compatibility_date":"2026-09-01","compatibility_flags":["nodejs_compat"]};
const body=["--"+B,"Content-Disposition: form-data; name=\\"metadata\\"","Content-Type: application/json","",JSON.stringify(meta),"--"+B,"Content-Disposition: form-data; name=\\"worker.js\\"; filename=\\"worker.js\\"","Content-Type: application/javascript+module","",worker,"--"+B+"--"].join("\\r\\n");
const up=await cloudflare.request({method:"PUT",path:"/accounts/"+accountId+"/workers/scripts/${SCRIPT}",body,contentType:"multipart/form-data; boundary="+B,rawBody:true});
const dom=await cloudflare.request({method:"PUT",path:"/accounts/"+accountId+"/workers/domains",body:{hostname:"${HOST}",service:"${SCRIPT}",zone_id:"${ZONE}",environment:"production"}});
return {up:{s:up.success,e:up.errors},dom:{s:dom.success,e:dom.errors,r:dom.result}}; }`;
fs.writeFileSync("/workspace/cf_deploy_v6.js",snippet);fs.writeFileSync("/tmp/w.mjs",worker);
if(process.argv[1]&&process.argv[1].endsWith("mk_worker.mjs"))console.log("worker packed:",fs.statSync("/workspace/cf_deploy_v6.js").size,"bytes -> /workspace/cf_deploy_v6.js");
