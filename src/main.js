import {score} from "./calc.js";
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
// theme
$(".tt")?.addEventListener("click",()=>{const r=document.documentElement,cur=r.dataset.theme||(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"),n=cur==="dark"?"light":"dark";r.dataset.theme=n;try{localStorage.theme=n}catch(e){}});
// spotlight: pointer position drives a radial light inside the card
$$(".spot").forEach(el=>el.addEventListener("pointermove",e=>{const b=el.getBoundingClientRect();el.style.setProperty("--mx",e.clientX-b.left+"px");el.style.setProperty("--my",e.clientY-b.top+"px")}));
// magnetic
if(!RM&&matchMedia("(hover:hover)").matches)$$(".mag").forEach(el=>{el.addEventListener("pointermove",e=>{const b=el.getBoundingClientRect();el.style.translate=`${(e.clientX-b.left-b.width/2)*.18}px ${(e.clientY-b.top-b.height/2)*.25}px`});el.addEventListener("pointerleave",()=>el.style.translate="")});
// number ticker
const tick=(el,to,d=700)=>{if(RM){el.textContent=to;return}const from=+el.textContent||0,t0=performance.now();const f=t=>{const k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,3);el.textContent=Math.round(from+(to-from)*e);if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)};
$$("[data-tick]").forEach(el=>{const n=+el.dataset.tick;el.textContent=0;tick(el,n,1100)});
// decrypt headline (once, on load)
const h=$(".decrypt");
if(h&&!RM){const txt=h.textContent,G="０１＃％＆＊＋＝？",t0=performance.now();h.setAttribute("aria-label",txt);const f=t=>{const k=(t-t0)/900;h.textContent=[...txt].map((c,i)=>c===" "||i/txt.length<k?c:G[(Math.random()*G.length)|0]).join("");if(k<1)requestAnimationFrame(f);else h.textContent=txt};requestAnimationFrame(f)}
// specimen cards: spring expand with FLIP
$$("[data-specs]").forEach(box=>{const cards=$$("[data-spec]",box);
 $$(".spec-head",box).forEach(btn=>btn.addEventListener("click",()=>{const card=btn.closest("[data-spec]"),open=!card.classList.contains("is-open");
  const first=new Map(cards.map(c=>[c,c.getBoundingClientRect()]));
  cards.forEach(c=>{c.classList.toggle("is-open",c===card&&open);$(".spec-head",c).setAttribute("aria-expanded",String(c===card&&open))});
  box.classList.toggle("has-open",open);
  if(RM)return;
  cards.forEach(c=>{const a=first.get(c),b=c.getBoundingClientRect();c.animate([{transform:`translate(${a.left-b.left}px,${a.top-b.top}px)`},{transform:"none"}],{duration:620,easing:"linear(0, .25 7%, .84 22%, 1.06 33%, 1.08 40%, 1.01 58%, .995 75%, 1)"})});
 }))});
// dial calculator
const f=$("#calc");
if(f){const knob=$(".knob",f),inp=f.elements.bots,num=$("[data-bots]",f),out=$("#out",f);
 const msg={低:"当前配置唤起次数少，可以放心常驻。",中:"注意浏览器步骤和频率，优先用 connector 和事件触发。",高:"可能几天内烧完周额度。合并 Bot、降低频率、浏览器按需开启。"};
 const lv={低:"low",中:"med",高:"high"};
 out.innerHTML=`<span class="morph low" data-morph aria-hidden="true"></span><div class="out-txt"><p class="out-level"><span data-level>低</span>风险</p><p class="out-score">得分 <b data-score>0</b> / 5</p><p class="out-msg" data-msg></p><ul class="out-tips" data-tips></ul></div>`;
 const run=()=>{const d=new FormData(f),b=+d.get("bots")||1,r=score(b,d.get("browser")==="on",d.get("routine"));
  const tips=[];if(b>=6)tips.push("Bot 数 6 个以上：合并为一个分拣 Bot，按需派生子代理");if(d.get("browser"))tips.push("浏览器：先查 connector 能否覆盖");if(d.get("routine")==="hourly")tips.push("每小时：改为事件触发或每日两次");
  $("[data-morph]",out).className="morph "+lv[r.level];$("[data-level]",out).textContent=r.level;tick($("[data-score]",out),r.s,450);$("[data-msg]",out).textContent=msg[r.level];
  $("[data-tips]",out).innerHTML=tips.map(t=>`<li>${t}</li>`).join("");f.dataset.level=lv[r.level]};
 const setB=v=>{v=Math.max(1,Math.min(20,Math.round(v)));inp.value=v;num.textContent=v;knob.setAttribute("aria-valuenow",v);knob.setAttribute("aria-valuetext",v+" 个 Bot");knob.style.setProperty("--rot",(-135+(v-1)/19*270)+"deg");run()};
 knob.addEventListener("keydown",e=>{const m={ArrowUp:1,ArrowRight:1,ArrowDown:-1,ArrowLeft:-1,PageUp:5,PageDown:-5}[e.key];if(e.key==="Home")setB(1);else if(e.key==="End")setB(20);else if(m)setB(+inp.value+m);else return;e.preventDefault()});
 let drag=null;knob.addEventListener("pointerdown",e=>{drag={y:e.clientY,x:e.clientX,v:+inp.value};knob.setPointerCapture(e.pointerId)});
 knob.addEventListener("pointermove",e=>{if(!drag)return;setB(drag.v+((drag.y-e.clientY)+(e.clientX-drag.x))/14)});
 ["pointerup","pointercancel"].forEach(t=>knob.addEventListener(t,()=>drag=null));
 $$("[data-step]",f).forEach(b=>b.addEventListener("click",()=>setB(+inp.value+ +b.dataset.step)));
 f.addEventListener("change",run);f.addEventListener("submit",e=>e.preventDefault());setB(3);}
// case search + filters (type/product chips, ?q= / ?type= in URL)
const q=$("#q");if(q){const st={type:"",product:"",scen:""},P=new URLSearchParams(location.search);q.value=P.get("q")||"";
 const sync=()=>$$(".chip").forEach(c=>c.setAttribute("aria-pressed",String(st[c.dataset.f]===c.dataset.v)));
 const run=()=>{const v=q.value.trim().toLowerCase();let n=0;$$("#list li").forEach(li=>{const hit=(!v||li.dataset.q.includes(v))&&(!st.type||li.dataset.type===st.type)&&(!st.product||li.dataset.product===st.product)&&(!st.scen||li.dataset.scen.split(" ").includes(st.scen));li.hidden=!hit;n+=hit});$("#empty").hidden=n>0;$("#shown").textContent=n};
 $$(".chip").forEach(c=>c.addEventListener("click",()=>{st[c.dataset.f]=c.dataset.v;sync();run()}));
 if(P.get("type"))st.type=P.get("type");if(P.get("product"))st.product=P.get("product");if(P.get("scen"))st.scen=P.get("scen");sync();q.addEventListener("input",run);run()}
