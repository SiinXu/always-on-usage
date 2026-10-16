// SEO + GEO + analytics head injection for every generated page (v13).
// Locale variants are the same document with ?lang=<code>; the inline detector honours it, the worker rewrites canonical/og:url for it.
export const BASE="https://usage.incidental.site";
export const LC=["zh-CN","zh-TW","en","ja","ko","ms","vi","fr","es","de"];
export const BRAND="Always-on Usage";
const CF_TOKEN="191b7170c81e433994d0da6a59bdd169";
const esc=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);
const strip=s=>String(s??"").replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/\s+/g," ").trim();
export const urlOf=f=>BASE+"/"+f.replace(/(^|\/)index\.html$/,"$1");
export const PAGES=[];// [url, lastmod]
const ORG={"@type":"Organization","@id":"https://incidental.site/#org","name":"Incidental AI","url":"https://incidental.site/"};
const SITE={"@type":"WebSite","@id":BASE+"/#site","name":BRAND,"url":BASE+"/","inLanguage":LC,"publisher":{"@id":"https://incidental.site/#org"},
  "potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":BASE+"/cases/?q={search_term_string}"},"query-input":"required name=search_term_string"}};
const crumbs=list=>({"@type":"BreadcrumbList","itemListElement":list.map(([n,u],i)=>({"@type":"ListItem","position":i+1,"name":n,"item":u}))});
const SEC={"cases/":"Builds to copy","stories/":"X stories","topics/":"Topics","digest/":"Weekly digest"};
/** meta: {kind:"article"|"app"|"faq"|..., graph:[extra JSON-LD nodes], date, lastmod} */
export function seo(f,html,meta={}){
  const url=urlOf(f);
  const title=strip((html.match(/<title[^>]*>([\s\S]*?)<\/title>/)||[])[1]||BRAND);
  const desc=strip((html.match(/<meta name="description" content="([^"]*)"/)||[])[1]||"");
  const isHome=f==="index.html";
  const sec=Object.keys(SEC).find(k=>f.startsWith(k));
  const h1=strip((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)||[])[1]||title.replace(/ \| .*$/,""));
  const bc=[[BRAND,BASE+"/"]];
  if(sec){bc.push([SEC[sec],BASE+"/"+sec]);if(!f.endsWith("index.html"))bc.push([h1,url])}else if(!isHome)bc.push([h1,url]);
  const g=[ORG];
  if(isHome)g.push(SITE);else g.push(crumbs(bc));
  if(meta.graph)g.push(...meta.graph.map(n=>typeof n==="function"?n({url,title,desc,h1}):n));
  const ld=JSON.stringify({"@context":"https://schema.org","@graph":g}).replace(/</g,"\\u003c");
  const og=meta.kind==="article"?"article":"website";
  const alt=LC.map(l=>`<link rel="alternate" hreflang="${l}" href="${url}?lang=${l}">`).join("")+`<link rel="alternate" hreflang="x-default" href="${url}">`;
  const head=`<link rel="canonical" href="${url}">${alt}`+
   `<meta property="og:type" content="${og}"><meta property="og:site_name" content="${esc(BRAND)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${BASE}/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(BRAND)}"><meta property="og:locale" content="zh_CN">${["zh_TW","en_US","ja_JP","ko_KR","ms_MY","vi_VN","fr_FR","es_ES","de_DE"].map(l=>`<meta property="og:locale:alternate" content="${l}">`).join("")}`+
   `<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${BASE}/og.png">`+
   `<script type="application/ld+json">${ld}</script>`+
   `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${CF_TOKEN}"}'></script><script defer src="https://stats.incidental.site/events.js" data-site="usage"></script><script defer src="https://stats.incidental.site/subscribe.js"></script>`;
  PAGES.push([url,meta.lastmod||""]);
  return html.replace(/<link rel="alternate" hreflang="x-default" href="[^"]*">/,"").replace("</head>",head+"</head>");
}
export function sitemaps(today){
  const files={};
  for(const l of LC){files[`sitemap-${l}.xml`]=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PAGES.map(([u,m])=>`<url><loc>${u}?lang=${l}</loc><lastmod>${(m||today).slice(0,10)}</lastmod></url>`).join("\n")}\n</urlset>\n`}
  files["sitemap-default.xml"]=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PAGES.map(([u,m])=>`<url><loc>${u}</loc><lastmod>${(m||today).slice(0,10)}</lastmod></url>`).join("\n")}\n</urlset>\n`;
  files["sitemap.xml"]=`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(files).filter(k=>k!=="sitemap.xml").map(k=>`<sitemap><loc>${BASE}/${k}</loc><lastmod>${today}</lastmod></sitemap>`).join("\n")}\n</sitemapindex>\n`;
  return files;
}
export const ROBOTS=`User-agent: *
Allow: /

# AI / generative search crawlers are welcome
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /

Sitemap: ${BASE}/sitemap.xml
`;
