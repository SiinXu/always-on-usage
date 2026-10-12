// 额度风险评分（估算方向）
// bots: 1–2 → 0(低), 3–5 → 1(中), 6+ → 2(高)
// browser on: +1(中)
// routine: rare +0, daily +1, hourly/高频 +2
// 合计: 0–1 低, 2–3 中, ≥4 高
export function score(bots,browser,routine){
  let s=bots>=6?2:bots>=3?1:0; s+=browser?1:0; s+={rare:0,daily:1,hourly:2}[routine]??1;
  return {s,level:s>=4?"高":s>=2?"中":"低"};
}
const msg={低:"低风险：当前配置唤起次数少，可放心常驻。",中:"中风险：注意浏览器步骤和频率，优先用 connector 和事件触发。",高:"高风险：可能几天内烧完周额度。合并 Bot、降低频率、浏览器按需开启。"};
const f=document.getElementById("calc");
if(f){const run=e=>{e&&e.preventDefault();const d=new FormData(f);const r=score(+d.get("bots")||1,d.get("browser")==="on",d.get("routine"));
const tips=[];if(+d.get("bots")>=6)tips.push("Bot 数 ≥6：合并为分拣 Bot + 按需子代理");if(d.get("browser"))tips.push("浏览器：先查 connector 能否覆盖");if(d.get("routine")==="hourly")tips.push("每小时：改为事件触发或每日两次");
document.getElementById("out").innerHTML=`<span class="risk big ${{低:"low",中:"med",高:"high"}[r.level]}">${r.level}</span><p>${msg[r.level]}<small>得分 ${r.s}/5 · 估算方向</small></p>${tips.length?`<ul>${tips.map(t=>`<li>${t}</li>`).join("")}</ul>`:""}`;};
f.addEventListener("submit",run);f.addEventListener("change",run);run();}
