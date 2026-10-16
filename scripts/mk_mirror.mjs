// GitHub Pages mirror (siinxu.github.io/always-on-usage): same build as the Worker, served under /always-on-usage/.
// Run after `node gen.mjs` (the update pipeline's build step). Writes dist-mirror/ ; CI pushes it to the gh-pages branch.
// Mirror-only differences: asset base /always-on-usage/, root-absolute links prefixed, its own Cloudflare Web Analytics token,
// subscribe source "gh-mirror", no sitemaps (canonical + hreflang point at usage.incidental.site).
import {execSync} from "node:child_process";import fs from "node:fs";import path from "node:path";
const OUT="dist-mirror",PRE="/always-on-usage";
execSync(`npx vite build --outDir ${OUT} --emptyOutDir`,{stdio:"inherit",env:{...process.env,BASE:PRE+"/"}});
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
let n=0,han=0;
for(const f of walk(OUT)){
  if(/sitemap[^/]*\.xml$/.test(f)){fs.rmSync(f);continue}
  if(!f.endsWith(".html"))continue;
  let h=fs.readFileSync(f,"utf8");
  h=h.replace(/\b(href|src)="\/(?!\/|always-on-usage\/)([^"]*)"/g,(m,a,p)=>`${a}="${PRE}/${p}"`)
     .replace('"token":"191b7170c81e433994d0da6a59bdd169"','"token":"41d8abdb6f1247c08f2412afcd5f2143"')
     .replace(/(data-ie-sub data-site="usage" data-source=")[^"]*"/g,'$1gh-mirror"');
  fs.writeFileSync(f,h);n++;
  han+=(h.replace(/<option[^>]*>[^<]*<\/option>/g,"").match(/[\u4e00-\u9fff]/g)||[]).length;
}
fs.writeFileSync(path.join(OUT,"robots.txt"),"User-agent: *\nAllow: /\n");
fs.writeFileSync(path.join(OUT,".nojekyll"),"");
for(const f of ["llms.txt","llms-full.txt"])if(!fs.existsSync(path.join(OUT,f)))throw new Error("mirror missing "+f);
console.log(`mirror: ${n} html pages -> ${OUT}/ ; Han outside the language switcher: ${han}`);
