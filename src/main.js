import {score} from "./calc.js";
import S from "./strings.json";
const LS=["zh-CN","zh-TW","en","ja","ko","ms","vi","fr","es","de"];
let LANG=LS.includes(document.documentElement.lang)?document.documentElement.lang:"en";
const pick=r=>{if(!r)return null;const i=LS.indexOf(LANG);return r[i]??r[2]??r[0]};
const fillv=(s,el)=>{const v=el.dataset.v;if(!v)return s;const o=JSON.parse(v);return s.replace(/\{(\w+)\}/g,(_,k)=>o[k])};
export const t=(zh,v)=>{const s=pick(S["@"+zh])||zh;return v?s.replace(/\{(\w+)\}/g,(_,k)=>v[k]):s};
const applyI18n=()=>{document.documentElement.lang=LANG;
 document.querySelectorAll("[data-i18n]").forEach(el=>{const s=pick(S[el.dataset.i18n]);if(s==null)return;const h=fillv(s,el);if(el.tagName==="TITLE"){document.title=h.replace(/<[^>]+>/g,"")+" | "+(pick(S[Object.keys(S).find(k=>S[k][0]==="常驻用量")])||"常驻用量");return}if(el.classList.contains("decrypt"))el.textContent=h;else el.innerHTML=h});
 for(const at of ["aria-label","content","placeholder","title"])document.querySelectorAll(`[data-i18n-${at}]`).forEach(el=>{const s=pick(S[el.getAttribute("data-i18n-"+at)]);if(s!=null)el.setAttribute(at,fillv(s,el))});
 const ZH=window.__ZH||(window.__ZH=(()=>{const e=document.getElementById("zh");try{return e?JSON.parse(e.textContent):[]}catch(_){return []}})());
 document.querySelectorAll(".lx").forEach(el=>{const z=el.dataset.zk!=null?ZH[+el.dataset.zk]:(el.dataset.zh||(el.dataset.zh=el.textContent));el.textContent=LANG.startsWith("zh")?z:el.dataset.en});
 const TL=document.getElementById("tl");if(TL){const m=TL._m||(TL._m=JSON.parse(TL.textContent));document.querySelectorAll("[data-tl]").forEach(el=>{const r=m[el.dataset.tl];if(r){const h=r[LANG]??r.en;if(h!=null)el.innerHTML=h}})}
 document.querySelectorAll("time[data-ts],time[data-d]").forEach(el=>{try{const ts=el.dataset.ts;const d=new Date(ts||el.dataset.d+"T12:00:00Z");el.textContent=ts?new Intl.DateTimeFormat(LANG,el.classList.contains("d")?{dateStyle:"medium"}:{dateStyle:"medium",timeStyle:"short"}).format(d):new Intl.DateTimeFormat(LANG,{dateStyle:"medium",timeZone:"UTC"}).format(d);if(ts)el.title=ts}catch(e){}});
 {const QN={"zh-CN":["原文为中文。","原文为日文，请打开来源链接阅读。"],"zh-TW":["原文為中文。","原文為日文，請打開來源連結閱讀。"],en:["The original post is in Chinese and is shown on the Chinese pages; open the source link to read it.","The original post is in Japanese and is shown on the Japanese page; open the source link to read it."],ja:["原文は中国語のため、中国語ページでのみ表示します。ソースリンクから読めます。","原文は日本語です。"],ko:["원문이 중국어라 중국어 페이지에서만 표시됩니다. 출처 링크에서 읽을 수 있습니다.","원문이 일본어라 일본어 페이지에서만 표시됩니다. 출처 링크에서 읽을 수 있습니다."],ms:["Siaran asal dalam bahasa Cina dan dipaparkan pada halaman bahasa Cina; buka pautan sumber untuk membacanya.","Siaran asal dalam bahasa Jepun dan dipaparkan pada halaman bahasa Jepun; buka pautan sumber untuk membacanya."],vi:["Bài gốc bằng tiếng Trung và chỉ hiển thị trên trang tiếng Trung; mở liên kết nguồn để đọc.","Bài gốc bằng tiếng Nhật và chỉ hiển thị trên trang tiếng Nhật; mở liên kết nguồn để đọc."],fr:["Le post original est en chinois et n’est affiché que sur les pages en chinois ; ouvrez le lien source pour le lire.","Le post original est en japonais et n’est affiché que sur la page en japonais ; ouvrez le lien source pour le lire."],es:["La publicación original está en chino y solo se muestra en las páginas en chino; abre el enlace de la fuente para leerla.","La publicación original está en japonés y solo se muestra en la página en japonés; abre el enlace de la fuente para leerla."],de:["Der Originalbeitrag ist auf Chinesisch und wird nur auf den chinesischen Seiten angezeigt; über den Quelllink kannst du ihn lesen.","Der Originalbeitrag ist auf Japanisch und wird nur auf der japanischen Seite angezeigt; über den Quelllink kannst du ihn lesen."]};
  document.querySelectorAll("[data-ql]").forEach(el=>{const q=el.dataset.ql,show=q==="cjk"?(LANG.startsWith("zh")||LANG==="ja"):q==="zh"?LANG.startsWith("zh"):LANG===q;if(show&&el.dataset.qk!=null&&!el._f){el.innerHTML=ZH[+el.dataset.qk]??"";el._f=1}el.hidden=!show;const n=el.nextElementSibling;if(n&&n.hasAttribute("data-ql-note")){n.hidden=show;if(n.hasAttribute("data-ql-tr")){const c=n.nextElementSibling;if(c&&c.classList.contains("ql-tr-note"))c.hidden=show}else n.textContent=(QN[LANG]||QN.en)[q==="ja"?1:0]}})}
 document.documentElement.classList.remove("i18n-wait")};
applyI18n();
const sel=document.getElementById("lang");if(sel){sel.value=LANG;sel.addEventListener("change",()=>{LANG=sel.value;try{localStorage.lang=LANG}catch(e){}applyI18n();document.dispatchEvent(new Event("langchange"))})}
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
if(h&&!RM&&false){const txt=h.textContent,G="０１＃％＆＊＋＝？",t0=performance.now();h.setAttribute("aria-label",txt);const f=t=>{const k=(t-t0)/900;h.textContent=[...txt].map((c,i)=>c===" "||i/txt.length<k?c:G[(Math.random()*G.length)|0]).join("");if(k<1)requestAnimationFrame(f);else h.textContent=txt};requestAnimationFrame(f)}
// specimen cards: spring expand with FLIP
$$("[data-specs]").forEach(box=>{const cards=$$("[data-spec]",box);
 $$(".spec-head",box).forEach(btn=>btn.addEventListener("click",()=>{const card=btn.closest("[data-spec]"),open=!card.classList.contains("is-open");
  const first=new Map(cards.map(c=>[c,c.getBoundingClientRect()]));
  cards.forEach(c=>{c.classList.toggle("is-open",c===card&&open);$(".spec-head",c).setAttribute("aria-expanded",String(c===card&&open))});
  box.classList.toggle("has-open",open);
  if(RM)return;
  cards.forEach(c=>{const a=first.get(c),b=c.getBoundingClientRect();c.animate([{transform:`translate(${a.left-b.left}px,${a.top-b.top}px)`},{transform:"none"}],{duration:620,easing:"linear(0, .25 7%, .84 22%, 1.06 33%, 1.08 40%, 1.01 58%, .995 75%, 1)"})});
 }))});
// product switch -> spring rearrange
$$("[data-pick]").forEach(b=>b.addEventListener("click",()=>{const c=$$("[data-spec]")[+b.dataset.pick];const h=$(".spec-head",c);if(!c.classList.contains("is-open"))h.click();$$("[data-pick]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)))}));
// tilt
if(!RM&&matchMedia("(hover:hover)").matches)$$(".spec").forEach(el=>{el.addEventListener("pointermove",e=>{const b=el.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;el.style.transform=`perspective(900px) rotateX(${-y*5}deg) rotateY(${x*5}deg)`});el.addEventListener("pointerleave",()=>el.style.transform="")});
// marquee pause offscreen
// dial calculator
const f=$("#calc");
if(f){const knob=$(".knob",f),inp=f.elements.bots,num=$("[data-bots]",f),out=$("#out",f);
 const msg={低:"当前配置唤起次数少，可以放心常驻。",中:"注意浏览器步骤和频率，优先用 connector 和事件触发。",高:"可能几天内烧完周额度。合并 Bot、降低频率、浏览器按需开启。"};const LV=()=>({低:t("低"),中:t("中"),高:t("高")});
 const lv={低:"low",中:"med",高:"high"};
 out.innerHTML=`<span class="morph low" data-morph aria-hidden="true"></span><div class="out-txt"><p class="out-level"><span data-level>低</span><span data-rk>风险</span></p><p class="out-score"><span data-sk>得分</span> <b data-score>0</b> / 5</p><p class="out-msg" data-msg></p><ul class="out-tips" data-tips></ul></div>`;
 const run=()=>{const d=new FormData(f),b=+d.get("bots")||1,r=score(b,d.get("browser")==="on",d.get("routine"));
  const tips=[];if(b>=6)tips.push(t("Bot 数量 6 个以上：合并为一个分拣 Bot，按需派生子代理"));if(d.get("browser"))tips.push(t("浏览器：先查 connector 能否覆盖"));if(d.get("routine")==="hourly")tips.push(t("每小时：改为事件触发或每日两次"));
  $("[data-morph]",out).className="morph "+lv[r.level];$("[data-level]",out).textContent=LV()[r.level];$("[data-rk]",out).textContent=t("风险");$("[data-sk]",out).textContent=t("得分");tick($("[data-score]",out),r.s,450);$("[data-msg]",out).textContent=t(msg[r.level]);
  $("[data-tips]",out).innerHTML=tips.map(t=>`<li>${t}</li>`).join("");f.dataset.level=lv[r.level];document.querySelectorAll('.dial').forEach(d=>d.dataset.level=lv[r.level]);if(CRN++){clearTimeout(CRT);CRT=setTimeout(()=>window.ievt&&window.ievt("calc_run",{bots:b,browser:d.get("browser")==="on",routine:d.get("routine")||"",level:lv[r.level]}),1500)}};let CRN=0,CRT;
 const setB=v=>{v=Math.max(1,Math.min(20,Math.round(v)));inp.value=v;num.textContent=v;knob.setAttribute("aria-valuenow",v);knob.setAttribute("aria-valuetext",t("{n} 个 Bot",{n:v}));const prev=+num.dataset.v||v;num.dataset.v=v;tick(num,v,300);knob.style.setProperty("--rot",(-135+(v-1)/19*270)+"deg");$$(".ticks i",knob).forEach((t,i)=>{t.classList.toggle("on",i<v);t.classList.toggle("hit",i===v-1&&v!==prev)});run()};
 knob.addEventListener("keydown",e=>{const m={ArrowUp:1,ArrowRight:1,ArrowDown:-1,ArrowLeft:-1,PageUp:5,PageDown:-5}[e.key];if(e.key==="Home")setB(1);else if(e.key==="End")setB(20);else if(m)setB(+inp.value+m);else return;e.preventDefault()});
 let drag=null;knob.addEventListener("pointerdown",e=>{drag={y:e.clientY,x:e.clientX,v:+inp.value};knob.setPointerCapture(e.pointerId);knob.classList.add("drag")});
 knob.addEventListener("pointermove",e=>{if(!drag)return;setB(drag.v+((drag.y-e.clientY)+(e.clientX-drag.x))/14)});
 ["pointerup","pointercancel"].forEach(t=>knob.addEventListener(t,()=>{drag=null;knob.classList.remove("drag")}));
 $$("[data-step]",f).forEach(b=>b.addEventListener("click",()=>setB(+inp.value+ +b.dataset.step)));
 f.addEventListener("change",run);document.addEventListener("langchange",()=>setB(+inp.value));f.addEventListener("submit",e=>e.preventDefault());const CP=new URLSearchParams(location.search);if(CP.get("routine")){const r=[...f.querySelectorAll('[name="routine"]')].find(x=>x.value===CP.get("routine"));if(r)r.checked=true}if(CP.get("browser")==="on"&&f.elements.browser)f.elements.browser.checked=true;setB(+CP.get("bots")||3);}
// case search + filters (type/product chips, ?q= / ?type= in URL)
const q=$("#q");if(q){const st={type:"",product:"",scen:""},P=new URLSearchParams(location.search),PER=48,more=$("#more");let lim=PER;q.value=P.get("q")||"";
 const sync=()=>$$(".chip").forEach(c=>c.setAttribute("aria-pressed",String(st[c.dataset.f]===c.dataset.v)));
 const run=()=>{const v=q.value.trim().toLowerCase();let n=0;$$("#list li").forEach(li=>{const hit=(!v||(li.dataset.q+" "+li.textContent.toLowerCase()).includes(v))&&(!st.type||li.dataset.type===st.type)&&(!st.product||li.dataset.product===st.product)&&(!st.scen||li.dataset.scen.split(" ").includes(st.scen));li.hidden=!hit||n>=lim;n+=hit});$("#empty").hidden=n>0;const sh=$("#shown");if(sh)sh.textContent=n;if(more){more.hidden=n<=lim;const l=$("[data-left]",more);if(l)l.textContent="("+Math.min(PER,n-lim)+" / "+(n-lim)+")"}};
 if(more)more.addEventListener("click",()=>{lim+=PER;run()});document.addEventListener("langchange",()=>run());
 $$(".chip").forEach(c=>c.addEventListener("click",()=>{st[c.dataset.f]=c.dataset.v;lim=PER;sync();run();const u=new URL(location.href);for(const k of ["type","product","scen"])st[k]?u.searchParams.set(k,st[k]):u.searchParams.delete(k);history.replaceState(null,"",u)}));
 if(P.get("type"))st.type=P.get("type");if(P.get("product"))st.product=P.get("product");if(P.get("scen"))st.scen=P.get("scen");sync();q.addEventListener("input",()=>{lim=PER;run()});run()}

// copy buttons for prompt blocks
document.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",async()=>{const c=b.closest(".code").querySelector("code").textContent;try{await navigator.clipboard.writeText(c);const o=b.innerHTML;b.textContent=t("已复制");setTimeout(()=>b.innerHTML=o,1600)}catch(e){}}));
