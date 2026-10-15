// Pack dist/ (text as utf8, binaries as base64, whole map gzipped) into a single Cloudflare Worker and write a deploy snippet.
// Output: /workspace/cf_deploy_v6.js (async fn for the Cloudflare MCP `execute` tool) and /tmp/w.mjs (raw worker).
import fs from "fs";import path from "path";import zlib from "zlib";
const T={html:"text/html; charset=utf-8",css:"text/css",js:"application/javascript",json:"application/json",txt:"text/plain; charset=utf-8",png:"image/png",svg:"image/svg+xml",webp:"image/webp",jpg:"image/jpeg"};
const F={};const walk=d=>{for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory())walk(p);else{const ty=T[f.split(".").pop()]||"application/octet-stream",tx=/^text|javascript|json|svg/.test(ty);F["/"+path.relative("dist",p)]=[ty,fs.readFileSync(p).toString(tx?"utf8":"base64"),tx?1:0]}}};walk("dist");
const Z=zlib.gzipSync(JSON.stringify(F),{level:9}).toString("base64");
export const worker=`const Z=${JSON.stringify(Z)};let F;async function load(){if(F)return F;const x=atob(Z),u=new Uint8Array(x.length);for(let i=0;i<x.length;i++)u[i]=x.charCodeAt(i);F=await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"))).json();return F}
function b(s){const x=atob(s),u=new Uint8Array(x.length);for(let i=0;i<x.length;i++)u[i]=x.charCodeAt(i);return u}
export default{async fetch(r){const F=await load();let u=decodeURIComponent(new URL(r.url).pathname);for(const k of [u,u+".html",u.replace(/\\/?$/,"/")+"index.html"]){if(F[k])return new Response(F[k][2]?F[k][1]:b(F[k][1]),{headers:{"content-type":F[k][0],"cache-control":"public, max-age=300"}})}return new Response("Not found",{status:404,headers:{"content-type":"text/plain; charset=utf-8"}})}}`;
export const SCRIPT="always-on-usage",HOST="usage.incidental.site",ZONE="301123022c5b99828634c0ea906b20da";
const snippet=`async () => { const B="F"+Date.now(); const worker=${JSON.stringify(worker)};
const meta={"main_module":"worker.js","compatibility_date":"2026-01-01"};
const body=["--"+B,"Content-Disposition: form-data; name=\\"metadata\\"","Content-Type: application/json","",JSON.stringify(meta),"--"+B,"Content-Disposition: form-data; name=\\"worker.js\\"; filename=\\"worker.js\\"","Content-Type: application/javascript+module","",worker,"--"+B+"--"].join("\\r\\n");
const up=await cloudflare.request({method:"PUT",path:"/accounts/"+accountId+"/workers/scripts/${SCRIPT}",body,contentType:"multipart/form-data; boundary="+B,rawBody:true});
const dom=await cloudflare.request({method:"PUT",path:"/accounts/"+accountId+"/workers/domains",body:{hostname:"${HOST}",service:"${SCRIPT}",zone_id:"${ZONE}",environment:"production"}});
return {up:{s:up.success,e:up.errors},dom:{s:dom.success,e:dom.errors,r:dom.result}}; }`;
fs.writeFileSync("/workspace/cf_deploy_v6.js",snippet);fs.writeFileSync("/tmp/w.mjs",worker);
if(process.argv[1]&&process.argv[1].endsWith("mk_worker.mjs"))console.log("worker packed:",fs.statSync("/workspace/cf_deploy_v6.js").size,"bytes -> /workspace/cf_deploy_v6.js");
