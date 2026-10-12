// 额度风险评分（估算方向）
// bots: 1–2 → 0(低), 3–5 → 1(中), 6+ → 2(高)
// browser on: +1(中)
// routine: rare +0, daily +1, hourly/高频 +2
// 合计: 0–1 低, 2–3 中, ≥4 高
export function score(bots,browser,routine){
  let s=bots>=6?2:bots>=3?1:0; s+=browser?1:0; s+={rare:0,daily:1,hourly:2}[routine]??1;
  return {s,level:s>=4?"高":s>=2?"中":"低"};
}
