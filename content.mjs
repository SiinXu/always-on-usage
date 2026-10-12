export const agents=[
{id:"grok-bot",name:"Grok Bot",vendor:"xAI",triggers:"定时 routine、邮件/Webhook、聊天唤起、Bot 间消息",browser:"内置云端浏览器 + 大量 connector（Gmail、Calendar、Notion、GitHub…）；浏览器步骤最贵",parallel:"多 Bot 并行、可派生子代理；并行数量是额度主要放大器",routine:"分钟级到每日；高频轮询最易烧额度",risk:"中-高（估算方向）",fit:"多 Bot 协作、邮件/日历分拣、带浏览器的研究与表单前置",unfit:"秒级监控、纯抓取农场、无人看管的高频浏览器循环",links:[["grokbotwiki","https://grokbotwiki.com"],["botsdots","https://botsdots.site"]]},
{id:"openai-dots",name:"OpenAI Dots",vendor:"OpenAI",triggers:"定时任务、聊天唤起、部分应用事件（估算方向）",browser:"以 connector / 工具调用为主，浏览代理按需启用",parallel:"以单代理多任务为主，并行有限（估算方向）",routine:"日级 / 周级摘要最常见",risk:"中（估算方向）",fit:"每日简报、跟进提醒、文档整理",unfit:"需要多代理分工的长链路工作流",links:[["aiformortals 对比","https://aiformortals.com"]]},
{id:"meta-muse",name:"Meta Muse",vendor:"Meta",triggers:"聊天唤起、社交/消息事件、定时提醒（估算方向）",browser:"偏向自有生态 connector，通用浏览器能力较弱（估算方向）",parallel:"单代理为主（估算方向）",routine:"日级提醒 / 内容排期",risk:"低-中（估算方向）",fit:"社交内容排期、消息生态内的轻助理",unfit:"跨 SaaS 深度自动化、需要真实浏览器登录的流程",links:[["customaise 对比","https://customaise.com"]]}];
import fs from "fs";
const raw=JSON.parse(fs.readFileSync(new URL("./content-inbox/public-cases.json",import.meta.url),"utf8"));
// out-of-bounds: crypto / self-issued tokens / trading desks -> needs_review, not published
const OOB=/meme ?coin|memecoin|crypto|defi|solana|airdrop|nft|发币|mints? its own|trading (agent|desk)|meme-desk/i;
export const typeLabel={"field-case":"做成了什么","guide":"教程","quota-report":"警告","comparison":"对比","template":"模板"};
export const productLabel={"grok-bot":"Grok Bot","multi":"多产品","openai-dots":"OpenAI Dots","meta-muse":"Meta Muse"};
const slugify=(t,i)=>(t.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60)||"item")+"-"+i;
export const fetchedAt=raw.fetched_at;
export const all=raw.items.map((it,i)=>({...it,slug:slugify(it.title,i+1),needs_review:OOB.test(it.title+" "+(it.summary||"")+" "+(it.usage_notes||""))}));
export const items=all.filter(x=>!x.needs_review&&x.source_url);
export const review=all.filter(x=>x.needs_review);
const pick=[/twelve Bots/i,/drains too fast/i,/lasts longer/i,/Fleet cost tip/i,/cache bug burning/i,/hits 100%/i];
export const featured=[...pick.map(r=>items.find(x=>x.type==="quota-report"&&r.test(x.title))).filter(Boolean),
 ...items.filter(x=>x.type==="field-case"&&x.usage_notes&&x.usage_notes!==x.summary)].slice(0,6);
export const calcRef=items.find(x=>/lasts longer/i.test(x.title))||items.find(x=>x.type==="quota-report");
// ---- v6 IA: 教程 · 模板 · 场景 · 做成了什么 (+ 警告 appendix) ----
const TJ=JSON.parse(fs.readFileSync(new URL("./content-inbox/templates.json",import.meta.url),"utf8"));
export const seed=JSON.parse(fs.readFileSync(new URL("./content-inbox/scenarios-seed.json",import.meta.url),"utf8")).scenarios;
export const templates=TJ.items.filter(t=>t.share_url&&!OOB.test(t.title+" "+t.summary)).map(t=>({title:t.title,summary:t.summary,source_url:t.share_url,copy_url:t.share_url,source_name:t.official?"x.ai 官方模板":"botsdots.site",official:!!t.official,product:"grok-bot",type:"template",usage_notes:null,author:t.creator||null,cadence:t.cadence,risk:t.risk,category:t.category,integrations:t.integrations||[],slug:"t-"+t.id})).sort((x,y)=>(y.official-x.official)||((y.cadence&&y.cadence!=="on-demand")-(x.cadence&&x.cadence!=="on-demand")));
export const scenarios=[["inbox","收件箱分拣",/inbox|e-?mail|gmail|outlook|triage|邮件/i],["report","周报 / 简报",/weekly|report|digest|brief|recap|summary|周报|简报/i],["prs","盯 PR / 仓库",/pull request|\bprs?\b|github|repo|code review|ci\b/i],["social","社媒排期",/social|tweet|\bx\b post|linkedin|newsletter|content|publish|post/i],["food","点餐 / 生活",/food|order|restaurant|grocer|meal|recipe|doordash|travel|flight/i],["calendar","日程会议",/calendar|meeting|schedule|agenda/i],["research","调研监控",/research|monitor|watch|track|competitor|news/i],["finance","财务运营",/finance|invoice|expense|budget|billing|crm|sales|lead/i],["ship","写代码上线",/code|deploy|ship|build|app|game|site|website/i]];
const tag=x=>scenarios.filter(([, ,r])=>r.test(x.title+" "+(x.summary||"")+" "+(x.category||""))).map(s=>s[0]);
items.forEach(x=>x.scen=tag(x));templates.forEach(x=>x.scen=tag(x));
export const lib=[...items.filter(x=>x.type==="guide"||x.type==="field-case"),...templates];
export const warnings=items.filter(x=>x.type==="quota-report");
export const rails={guide:items.filter(x=>x.type==="guide"),template:templates,build:items.filter(x=>x.type==="field-case"),compare:items.filter(x=>x.type==="comparison")};
