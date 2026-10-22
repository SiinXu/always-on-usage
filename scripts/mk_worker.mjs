// Pack dist/ (text as utf8, binaries as base64, whole map gzipped) into a single Cloudflare Worker and write a deploy snippet.
// Output: /workspace/cf_deploy_v6.js (async fn for the Cloudflare MCP `execute` tool) and /tmp/w.mjs (raw worker).
import fs from "fs";import path from "path";import zlib from "zlib";
const T={html:"text/html; charset=utf-8",css:"text/css",js:"application/javascript",json:"application/json",txt:"text/plain; charset=utf-8",png:"image/png",xml:"application/xml; charset=utf-8",svg:"image/svg+xml",webp:"image/webp",jpg:"image/jpeg"};
// v12: brotli (window 2^24) over one concatenated buffer. Shared page chrome across ~1,700 pages compresses ~4x better than gzip's 32 KB window,
// which keeps the deploy snippet well under the 4 MB budget. The worker inflates once per isolate with node:zlib and serves byte ranges (no JSON.parse of the whole site).
const IDX={},parts=[];let off=0;const walk=d=>{for(const f of fs.readdirSync(d).sort()){const p=path.join(d,f);if(fs.statSync(p).isDirectory())walk(p);else{const ty=T[f.split(".").pop()]||"application/octet-stream",b=fs.readFileSync(p);IDX["/"+path.relative("dist",p)]=[ty,off,b.length];parts.push(b);off+=b.length}}};walk("dist");
const raw=Buffer.concat(parts);
const Z=zlib.brotliCompressSync(raw,{params:{[zlib.constants.BROTLI_PARAM_QUALITY]:11,[zlib.constants.BROTLI_PARAM_LGWIN]:24,[zlib.constants.BROTLI_PARAM_SIZE_HINT]:raw.length}}).toString("base64");
export const worker=`import zlib from "node:zlib";import {Buffer} from "node:buffer";const I=${JSON.stringify(IDX)};const Z=${JSON.stringify(Z)};let R;const LC=["zh-CN","zh-TW","en","ja","ko","ms","vi","fr","es","de"];
function load(){return R||(R=zlib.brotliDecompressSync(Buffer.from(Z,"base64")))}
const H={async fetch(r){const B=load();let u;try{u=decodeURIComponent(new URL(r.url).pathname)}catch{u="/"}const L=new URL(r.url).searchParams.get("lang");for(const k of [u,u+".html",u.replace(/\\/?$/,"/")+"index.html"]){const e=I[k];if(e){let body=B.subarray(e[1],e[1]+e[2]);if(L&&LC.includes(L)&&e[0].startsWith("text/html")){const t=new TextDecoder().decode(body).replace(/(<link rel=\"canonical\" href=\")([^\"]*)\"/,(m,a,h)=>a+h+"?lang="+L+'"').replace(/(<meta property=\"og:url\" content=\")([^\"]*)\"/,(m,a,h)=>a+h+"?lang="+L+'"');body=t}return new Response(body,{headers:{"content-type":e[0],"cache-control":"public, max-age=300"}})}}return new Response("Not found",{status:404,headers:{"content-type":"text/plain; charset=utf-8"}})}}
// 2026-10-21: edge-cache rendered responses (Cache API, honours max-age=300) so a cache hit skips the per-isolate brotli inflate of the whole site bundle
export default{async fetch(r,env,ctx){if(r.method!=="GET")return H.fetch(r);const c=caches.default,k=new Request(r.url,{method:"GET"}),h=await c.match(k);if(h)return h;const res=await H.fetch(r);if(res.status===200&&ctx)ctx.waitUntil(c.put(k,res.clone()));return res}}`;
export const SCRIPT="always-on-usage",HOST="usage.incidental.site",ZONE="301123022c5b99828634c0ea906b20da";
const snippet=`async () => { const B="F"+Date.now(); const worker=${JSON.stringify(worker)};
const meta={"main_module":"worker.js","compatibility_date":"2026-09-01","compatibility_flags":["nodejs_compat"]};
const body=["--"+B,"Content-Disposition: form-data; name=\\"metadata\\"","Content-Type: application/json","",JSON.stringify(meta),"--"+B,"Content-Disposition: form-data; name=\\"worker.js\\"; filename=\\"worker.js\\"","Content-Type: application/javascript+module","",worker,"--"+B+"--"].join("\\r\\n");
const up=await cloudflare.request({method:"PUT",path:"/accounts/"+accountId+"/workers/scripts/${SCRIPT}",body,contentType:"multipart/form-data; boundary="+B,rawBody:true});
const dom=await cloudflare.request({method:"PUT",path:"/accounts/"+accountId+"/workers/domains",body:{hostname:"${HOST}",service:"${SCRIPT}",zone_id:"${ZONE}",environment:"production"}});
return {up:{s:up.success,e:up.errors},dom:{s:dom.success,e:dom.errors,r:dom.result}}; }`;
fs.writeFileSync("/workspace/cf_deploy_v6.js",snippet);fs.writeFileSync("/tmp/w.mjs",worker);
if(process.argv[1]&&process.argv[1].endsWith("mk_worker.mjs"))console.log("worker packed:",fs.statSync("/workspace/cf_deploy_v6.js").size,"bytes -> /workspace/cf_deploy_v6.js");
