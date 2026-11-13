/* counter2.js — 主櫃「老師號碼牌區」(v1.0-017,P1~P3+候位+訂單流水+先付/支數表/交班/結帳/日報表)
   由 safety-report.html 載入(在 safety2.js 之後),網址參數 cn2:  ?cn2=1  主櫃現況表(目前只有老師號碼牌區)
   規則見 counter-rules.md(R5.x、R6.6~R6.8);後端 gas-counter2.gs.txt(cnPlates / cnAct)。
   牌:白(等待派工)/綠(休息,可分段,累計每班 1 小時)/灰(未上牌)/紅(做事中)/下牌(實框透明)/請假(虛框)。 */
(function(){
const{useState,useEffect,useRef}=React;
const C=window.S2Core;
if(!C){window.Counter2Routes=()=>React.createElement('div',{className:'p-6 text-center text-red-400'},'載入失敗:缺少 safety2.js');return;}
const{api,Box,Loading,Msg,NeedUser,Spinner}=C;
const Card=({children,className})=>(<div className={'cn-card '+(className||'')}>{children}</div>);
const p2=n=>String(n).padStart(2,'0');
const tzp=ms=>{const d=new Date(ms+8*3600e3);return{h:d.getUTCHours(),m:d.getUTCMinutes(),s:d.getUTCSeconds()};};
const hm=ms=>{const x=tzp(ms);return x.h+':'+p2(x.m);};
const hmFull=ms=>{const x=tzp(ms);return p2(x.h)+':'+p2(x.m);};
const mmss=sec=>p2(Math.floor(sec/60))+':'+p2(sec%60);
const dur=sec=>Math.round(sec/60)+' 分';
const nextMark=(now,stepMin)=>{const st=stepMin*60000;return Math.floor((now+8*3600e3)/st)*st+st-8*3600e3;}; // 台北時間的下一個整/半點
const LIMIT=3600;
// ── 白底主題:版面用 cn-* 類別;其餘沿用的 Tailwind 深色類別,在 .cn-light 內改成淺色對應 ──
const CN_VER='v1.0-041'; // 檔案版本(顯示在主櫃標題旁,用來確認平板載入的是不是新檔)
window.__cnVer=CN_VER;
const CN_CSS=String.raw`
.cn-light{background:#f7f7f9;color:#1b1f2a;min-height:100vh;font-feature-settings:"tnum"}
.cn-wrap{max-width:448px;margin:0 auto;padding:18px 16px 40px}
.cn-hd{display:flex;justify-content:space-between;align-items:flex-end;padding:2px 0 12px;gap:8px}
.cn-hd h1{font-size:20px;font-weight:700}.cn-tm{font-size:13px;color:#5b6270;margin-top:3px;font-variant-numeric:tabular-nums;display:flex;align-items:center;gap:6px}
.cn-acts{display:flex;gap:8px}.cn-btn{height:38px;padding:0 14px;border-radius:10px;font-size:14px;font-weight:600;border:1px solid #d3d6de;color:#1b1f2a;background:#fff}
.cn-tools{display:flex;gap:8px;margin:-2px 0 10px}.cn-tools .cn-btn{flex:1;padding:0 6px}
.cn-btn.p{background:#2548d6;border-color:#2548d6;color:#fff}
.cn-sync{font-size:13px;color:#0f8a5f;font-weight:600;background:none;border:0;padding:0}.cn-sync.w{color:#b45309}
.cn-chip small{display:block;font-size:10px;color:#9aa0ad;margin-top:1px;white-space:nowrap}.cn-chips{display:flex;gap:8px;margin-bottom:12px}.cn-chip{flex:1;background:#fff;border:1px solid #e3e5eb;border-radius:10px;padding:8px 10px}
.cn-chip b{display:block;font-size:20px;line-height:1.1;font-variant-numeric:tabular-nums}.cn-chip span{font-size:12px;color:#5b6270}
.cn-alert{border-left:3px solid #dc2626;background:#fdecee;border-radius:6px;padding:8px 10px;font-size:13px;margin-bottom:12px;color:#9b1c1c}
.cn-sec{padding:14px 0;border-top:1px solid #e3e5eb}.cn-sec.f{border-top:0;padding-top:4px;margin-top:8px}
.cn-sh{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px}.cn-sh h2{font-size:13px;font-weight:600;color:#5b6270;letter-spacing:.08em}
.cn-sh em{font-style:normal;font-size:12px;color:#6b7280}.cn-link{font-size:12px;color:#2548d6;font-weight:600;background:none;border:0;padding:0}
.cn-card{background:#fff;border:1px solid #e3e5eb;border-radius:14px;padding:12px;margin-top:10px}
.cn-tabs{display:flex;gap:4px;background:#e9ebf0;border-radius:10px;padding:3px;margin-bottom:10px}
.cn-tab{flex:1;text-align:center;font-size:13px;padding:8px 0;border-radius:8px;color:#5b6270;font-weight:600;background:none;border:0}
.cn-tab.on{background:#fff;color:#1b1f2a;box-shadow:0 1px 2px rgba(0,0,0,.12)}
.cn-ord{padding:12px 0;border-top:1px solid #e3e5eb}.cn-ord:first-child{border-top:0;padding-top:2px}.cn-ord.click{cursor:pointer}
.cn-oh{display:flex;align-items:center;gap:8px}.cn-no{white-space:nowrap;font:600 12px ui-monospace,monospace;color:#5b6270;background:#e9ebf0;border-radius:6px;padding:2px 6px}
.cn-gn{font-weight:700;font-size:15px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cn-cnt{white-space:nowrap;font-size:12px;color:#1b36a8;background:#d6defa;border-radius:2px;padding:1px 7px}.cn-sp{flex:1}
.cn-m{font-size:13px;color:#3a4050;margin-top:6px;display:flex;gap:8px;font-variant-numeric:tabular-nums;align-items:baseline;flex-wrap:wrap}
.cn-m .c{font-family:ui-monospace,monospace;min-width:46px;color:#111;font-weight:700}.cn-m b{color:#111}.cn-m .tt{margin-left:auto;color:#5b6270;white-space:nowrap}
.cn-meta{font-size:12px;color:#5b6270;margin-top:6px;display:flex;justify-content:space-between;gap:8px}
.cn-st{white-space:nowrap;font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px}.cn-dot{width:8px;height:8px;border-radius:50%}
.cn-act{height:38px;padding:0 18px;border-radius:10px;font-weight:700;font-size:14px;color:#111;border:0;margin-top:10px}
.cn-money{font-weight:700;font-variant-numeric:tabular-nums}
.cn-act+.cn-act{margin-left:8px}
.cn-sk{display:inline-block;background:linear-gradient(90deg,#e9ebf0,#f4f5f8,#e9ebf0);background-size:200% 100%;animation:cnsk 1.3s linear infinite;border-radius:8px}
@keyframes cnsk{to{background-position:-200% 0}}
.cn-skrow{display:flex;gap:6px;overflow:hidden}
.cn-bk{display:flex;align-items:center;gap:8px;padding:10px 0;border-top:1px solid #e3e5eb}.cn-bk:first-of-type{border-top:0;padding-top:0}
.cn-bk .tm{font:700 15px ui-monospace,monospace;min-width:48px}.cn-bk .tc{font-weight:800;font-size:16px;min-width:34px;text-align:center;background:#fff4c2;border:1.5px solid #d99a06;border-radius:8px;padding:2px 4px}
.cn-bk .bt{height:34px;padding:0 12px;border-radius:9px;font-size:13px;font-weight:700;border:1px solid #d3d6de;background:#fff;color:#1b1f2a}
.cn-bk .bt.p{background:#2548d6;border-color:#2548d6;color:#fff}
.cn-light .text-white,.cn-light .text-gray-100{color:#1b1f2a}.cn-light .text-gray-200{color:#2f3542}.cn-light .text-gray-300{color:#3a4050}
.cn-light .text-gray-400{color:#5b6270}.cn-light .text-gray-500{color:#6b7280}.cn-light .text-gray-600{color:#9aa0ad}
.cn-light .text-violet-200,.cn-light .text-violet-300{color:#2548d6}.cn-light .text-emerald-300,.cn-light .text-emerald-400{color:#0f8a5f}
.cn-light .text-sky-300{color:#0369a1}.cn-light .text-amber-200,.cn-light .text-amber-300{color:#b45309}
.cn-light .text-red-200,.cn-light .text-red-300,.cn-light .text-red-400{color:#b91c1c}.cn-light .text-rose-200,.cn-light .text-rose-300{color:#be123c}
.cn-light .text-indigo-200{color:#4338ca}.cn-light .text-violet-100{color:#5b21b6}
.cn-light .bg-gray-900{background:#fff}.cn-light .bg-gray-800{background:#eceef2}.cn-light .bg-gray-700{background:#d9dce3}
.cn-light .bg-indigo-900{background:#e0e4ff}.cn-light .bg-violet-950{background:#f3effe}.cn-light .bg-violet-900{background:#ede9fe}.cn-light .bg-indigo-950{background:#eef0ff}
.cn-light .bg-red-950{background:#fdecee}.cn-light .bg-amber-950{background:#fff6e0}.cn-light .bg-black\/30{background:rgba(0,0,0,.04)}
.cn-light .border-gray-800{border-color:#e3e5eb}.cn-light .border-gray-700{border-color:#d3d6de}.cn-light .border-gray-600{border-color:#c2c6d0}
.cn-light .border-amber-500{border-color:#d99a06}.cn-light .border-red-500{border-color:#dc2626}
.cn-light .bg-violet-600{background:#2548d6;border-color:#2548d6}.cn-light .bg-violet-600.text-white,.cn-light .bg-emerald-600.text-white{color:#fff}
.cn-light .active\:bg-gray-800:active{background:#eceef2}
.cn-light input::placeholder{color:#9aa0ad}
/* iPad / 平板:600px 以上放寬單欄;900px 以上(iPad 橫放)左右兩欄——左:牌區+推薦+候位+位置圖+預約+支出,右:訂單(獨立一欄、頂端對齊、自己捲動)(手機/直放維持 牌區→位置圖→預約/支出→訂單) */
@media (min-width:600px){
 .cn-wrap{max-width:720px;padding:22px 24px 56px}
 .cn-hd h1{font-size:24px}.cn-tm{font-size:14px}.cn-sync{font-size:14px}
 .cn-btn{height:46px;padding:0 20px;font-size:16px;border-radius:12px}
 .cn-tools{gap:10px;margin:0 0 14px}.cn-tools .cn-btn{flex:0 0 auto;min-width:112px}
 .cn-chips{gap:10px;margin-bottom:16px}.cn-chip{padding:10px 14px;border-radius:12px}.cn-chip b{font-size:24px}.cn-chip span{font-size:13px}
 .cn-alert{font-size:15px;padding:10px 14px}
 .cn-sh h2{font-size:14px}.cn-sh em,.cn-link{font-size:14px}
 .cn-tab{font-size:15px;padding:11px 0}
 .cn-gn{font-size:17px}.cn-no{font-size:13px}.cn-cnt{font-size:13px}.cn-m{font-size:15px}.cn-meta{font-size:13px}.cn-st{font-size:13px}
 .cn-act{height:44px;font-size:15px;padding:0 22px}
 .cn-bk .tm{font-size:17px}.cn-bk .bt{height:40px;font-size:14px}
 .cn-light .fixed.inset-0>div{max-width:600px}
}
@media (min-width:900px){
 .cn-wrap{max-width:1240px;padding:22px 28px 56px}
 .cn-cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 28px;align-items:start}
 .cn-ca{grid-column:1;grid-row:1}.cn-cs{grid-column:1;grid-row:2}.cn-cb{grid-column:1;grid-row:3}.cn-co{grid-column:2;grid-row:1 / span 3;position:sticky;top:8px;max-height:calc(100vh - 16px);overflow-y:auto;-webkit-overflow-scrolling:touch}
 .cn-hd{padding-bottom:14px}
}

/* ══ iPad 一屏版面(>=700×600):固定一屏不捲動,牌區在最下方 ══ */
.tb-app{position:relative;height:100vh;height:100dvh;display:flex;flex-direction:column;gap:8px;padding:10px 12px;overflow:hidden;overscroll-behavior:none;background:#f7f7f9;color:#1b1f2a}
.tb-bar{position:relative;display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e3e5eb;border-radius:14px;padding:6px 12px;min-height:56px;flex:0 0 auto}
.tb-bar h1{font-size:18px;font-weight:700;white-space:nowrap}.tb-bar small{font-size:11px;color:#9aa0ad;font-weight:500}.tb-op{display:block;color:#2548d6!important;font-weight:700!important}.tb-op button{text-decoration:underline;font-weight:600;background:none;border:0;padding:0;color:#2548d6}
.tb-tm{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1.1}
.tb-chips{display:flex;gap:6px;flex:1;min-width:0}.tb-chips.port{flex:0 0 auto}.tb-chip{flex:1;background:#f3f4f8;border-radius:10px;padding:3px 8px;text-align:center;line-height:1.1;min-width:56px}.tb-chip b{font-size:18px;display:block}.tb-chip span{font-size:11px;color:#5b6270}.tb-chip.hot{background:#fff1d6;outline:1.5px solid #e0a41c}.tb-chip.hot b{color:#b45309}
.tb-btn{height:44px;padding:0 14px;border-radius:11px;border:1px solid #d3d6de;background:#fff;font-size:15px;font-weight:600;white-space:nowrap;color:#1b1f2a}.tb-btn.p{background:#2548d6;border-color:#2548d6;color:#fff}.tb-btn.v{border-color:#2548d6;color:#2548d6}.tb-btn.sq{width:44px;padding:0}
.tb-menu{position:absolute;right:12px;top:60px;z-index:35;background:#fff;border:1px solid #d3d6de;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.2);padding:6px;display:flex;flex-direction:column;min-width:170px}.tb-menu button{height:46px;text-align:left;padding:0 14px;font-size:15px;font-weight:600;border-radius:8px;background:none;border:0;color:#1b1f2a}.tb-menu button:active{background:#eceef2}
.tb-note{flex:0 0 auto;font-size:12px;color:#92400e;background:#fff6e0;border:1px solid #d99a06;border-radius:10px;padding:4px 10px}
.tb-main{flex:1;min-height:0;display:grid;gap:8px}.tb-main.land{grid-template-columns:1.45fr 1fr}.tb-main.port{grid-template-rows:minmax(0,.9fr) minmax(0,1.1fr)}
.tb-pn{background:#fff;border:1px solid #e3e5eb;border-radius:14px;padding:8px 10px;display:flex;flex-direction:column;min-height:0;overflow:hidden}
.tb-h{font-size:12px;color:#5b6270;font-weight:700;letter-spacing:.06em;display:flex;justify-content:space-between;margin-bottom:4px;flex:0 0 auto}.tb-h em{font-style:normal;color:#6b7280;font-weight:500}
.tb-seatwrap{display:flex;flex-direction:column;gap:5px;flex:1;min-height:0}.tb-fl{flex:1;display:flex;flex-direction:column;min-height:0}.tb-ft{display:flex;justify-content:space-between;font-size:11px;color:#6b7280;margin:2px 0}.tb-ft b{font-weight:700}
.tb-cells{flex:1;display:flex;gap:5px;min-height:0;max-height:150px}.tb-grp{display:flex;gap:3px;border:1px solid #e3e5eb;border-radius:10px;padding:3px;min-width:0}.tb-cells button{height:auto}
.tb-two{display:grid;grid-template-columns:1fr 1fr;gap:10px;flex:0 0 28%;min-height:0;overflow-y:auto;margin-top:6px}.tb-two .cn-card{margin-top:0}
.tb-tabs{display:flex;gap:3px;margin-bottom:6px;flex:0 0 auto}.tb-tabs button{flex:1;height:44px;border-radius:10px;border:1px solid #d3d6de;font-size:12px;font-weight:700;background:#fff;color:#1b1f2a;white-space:nowrap;padding:0 2px;display:flex;align-items:center;justify-content:center;gap:2px}
.tb-tabs button b{font-size:10px;background:#eceef2;border-radius:8px;padding:0 4px}.tb-tabs button.on{background:#2548d6;color:#fff;border-color:#2548d6}.tb-tabs button.on b{background:#fff;color:#2548d6}.tb-tabs button.hot b{background:#dc2626;color:#fff}.tb-tabs button.ar{border-color:#2548d6;color:#2548d6}.tb-tabs button.ar.on{color:#fff}
.tb-dot{width:8px;height:8px;border-radius:50%;background:#f59e0b;display:inline-block}
.tb-body{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch}
.tb-pl{background:#fff;border:1px solid #e3e5eb;border-radius:14px;padding:8px 10px;display:flex;flex-direction:column;gap:6px;flex:0 0 auto}
.tb-lr{display:flex;align-items:center;gap:8px}.tb-lb{width:84px;flex:0 0 auto;font-size:12px;font-weight:700;color:#5b6270;line-height:1.3}.tb-lb em{display:block;font-style:normal;font-weight:500;color:#6b7280;font-size:11px}
.tb-xb{margin-top:3px;height:28px;width:100%;border-radius:8px;border:1px solid #2548d6;color:#2548d6;font-size:12px;font-weight:800;background:#fff;display:flex;align-items:center;justify-content:center}
.tb-rwv{position:relative;flex:1;min-width:0}.tb-rw{display:flex;gap:3px;overflow-x:auto;scrollbar-width:none;padding:2px 34px 2px 2px;-webkit-overflow-scrolling:touch}.tb-rw::-webkit-scrollbar{display:none}
.tb-rwv.more:after{content:"›";position:absolute;right:0;top:0;bottom:0;width:34px;background:linear-gradient(90deg,rgba(255,255,255,0),#fff 60%);display:flex;align-items:center;justify-content:flex-end;font-size:26px;color:#2548d6;font-weight:700;padding-right:4px;pointer-events:none}
.tb-sep{flex:0 0 auto;width:1px;background:#d3d6de;margin:0 4px}
.tb-xp{position:absolute;left:12px;right:12px;bottom:12px;z-index:30;background:#fff;border:2px solid #2548d6;border-radius:16px;box-shadow:0 -10px 36px rgba(60,40,140,.22);padding:10px 14px;display:flex;flex-direction:column;gap:6px;max-height:calc(100% - 90px)}
.tb-xh{display:flex;justify-content:space-between;align-items:center;gap:10px}.tb-xh b{font-size:16px}.tb-xh span{font-size:12px;color:#6b7280;flex:1}
.tb-xg{display:grid;grid-template-columns:1.1fr 1fr .9fr;gap:12px;min-height:0;overflow-y:auto}.tb-xg h4{font-size:12px;color:#5b6270;margin:0 0 4px;display:flex;justify-content:space-between}.tb-xg h4 em{font-style:normal}
.tb-xr{display:flex;align-items:center;gap:8px;border:0;border-top:1px solid #eceef2;padding:5px 2px;font-size:13px;width:100%;text-align:left;background:none;color:#1b1f2a}.tb-xn{width:44px;height:34px;border-radius:8px;border:2px solid #aab0bd;background:#e9ebf0;font-weight:800;font-size:15px;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
.tb-xn.r{background:#fff;border-color:#dc2626}.tb-xn.gy{border-style:dashed;background:#f1f2f5;color:#9aa0ad}.tb-xn.g{opacity:.55}.tb-xm{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tb-xm small{display:block;color:#6b7280;font-size:11.5px}.tb-xt{font-size:12px;white-space:nowrap}.tb-no{font-size:12px;color:#9aa0ad}
.cn-dots{display:flex;gap:7px;justify-content:center;align-items:center}.cn-dots i{width:10px;height:10px;border-radius:5px;background:#c9ccd6}.cn-dots i.on{width:32px;background:#1b1f2a}
.tb-kp{display:grid;grid-template-columns:repeat(6,1fr);gap:4px}.tb-kp button{height:38px;border-radius:9px;border:1px solid #c2c6d0;background:#fff;font-size:18px;font-weight:800;color:#1b1f2a}.tb-kp .f{font-size:13px;background:#f3f4f8}.tb-kp .x{font-size:13px;background:#fdecee;border-color:#dc2626;color:#b91c1c}
.tb-tg{height:34px;border-radius:17px;border:1.5px solid #c2c6d0;display:flex;align-items:center;gap:6px;padding:0 12px 0 4px;font-size:13px;font-weight:700;color:#2f3542;background:#fff;white-space:nowrap}.tb-tg i{width:26px;height:26px;border-radius:50%;background:#c2c6d0;display:block}.tb-tg.on{border-color:#0f8a5f;background:#e8f7ef;color:#0f8a5f}.tb-tg.on i{background:#0f8a5f}
.tb-ph{font-size:18px;font-weight:800;letter-spacing:.12em;height:40px}.tb-sel{height:40px;min-width:84px}
.tb-arrf{display:flex;flex-direction:column;gap:6px}.tb-main.port .tb-arrf{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;align-items:start}.tb-main.port .tb-arrf>*{min-width:0}
.tb-ac1,.tb-ac2{display:flex;flex-direction:column;gap:6px;min-width:0}.tb-ac3{display:flex;flex-direction:row-reverse;gap:8px}.tb-ac3 button{flex:3}.tb-ac3 button:last-child{flex:1}.tb-main.port .tb-ac3{grid-column:1/3}
.tb-main.land .tb-kp{grid-template-columns:repeat(12,1fr);gap:3px}.tb-main.land .tb-kp button{height:34px!important;font-size:15px!important;padding:0!important}.tb-main.land .tb-kp .f,.tb-main.land .tb-kp .x{font-size:12px!important}.tb-main.land .tb-kp .kl{display:none}
.tb-main.land .tb-ac3{position:sticky;bottom:0;background:#fff;padding-top:4px}.tb-main.land .tb-arrf,.tb-main.land .tb-ac1,.tb-main.land .tb-ac2{gap:4px}
.tb-arrf button{white-space:nowrap;min-height:0}.tb-arrf .px-3.py-2,.tb-arrf .px-4.py-2{padding:3px 11px!important;font-size:13px!important}.tb-arrf .py-3{padding-top:9px!important;padding-bottom:9px!important;font-size:15px!important}
.tb-arrf .p-3{padding:7px 9px!important}.tb-arrf .space-y-2>*+*{margin-top:5px!important}.tb-arrf input,.tb-arrf select{padding:3px 10px!important;height:34px;font-size:14px}.tb-arrf .w-9.h-9{width:30px;height:30px}.tb-arrf .tb-hint{display:none}
.tb-arrf .tb-kp button{height:34px;font-size:17px}.tb-arrf .tb-ph{font-size:18px;height:36px}.tb-arrf .tb-ph::placeholder{letter-spacing:0;font-size:13px;font-weight:500}.tb-arrf .tb-sel{height:36px;min-width:80px}
/* ══ Wayfind 風格(v1.0-034):冷灰紙、藍黑色 2px 粗框、方角、深色頂欄、鈷藍=進行中、黃=重點 ══ */
.cn-light,.tb-app{background:#e3e6ec}
.tb-bar{background:#0f1424;color:#f4f5f8;border:2px solid #0f1424;border-radius:2px}
.tb-bar h1,.tb-bar .tb-tm{color:#f4f5f8}.tb-bar .tb-tm{color:#ffc94a;font-family:ui-monospace,"SF Mono",Menlo,monospace}.tb-bar small{color:#aab2c8}.tb-op,.tb-op button{color:#ffc94a!important}
.tb-bar .tb-chip{background:#222a40;border-radius:2px}.tb-bar .tb-chip b{color:#ffc94a;font-family:ui-monospace,Menlo,monospace}.tb-bar .tb-chip span{color:#aab2c8}.tb-bar .tb-chip.hot{background:#222a40;outline:2px solid #ffc94a}.tb-bar .tb-chip.hot b{color:#ff8a7e}
.tb-bar .tb-btn{background:#0f1424;color:#f4f5f8;border:2px solid #f4f5f8;border-radius:2px}.tb-bar .tb-btn.p{background:#ffc94a;border-color:#ffc94a;color:#0f1424}
.tb-pn,.tb-pl,.cn-card,.cn-chip{background:#f4f5f8;border:2px solid #0f1424;border-radius:2px;box-shadow:none}
.tb-grp{border:2px solid #8d96ab;border-radius:2px}
.tb-btn,.cn-btn,.tb-tabs button,.tb-menu,.tb-menu button,.tb-xb,.cn-tab,.cn-tabs,.tb-kp button,.cn-bk .bt{border-radius:2px}
.tb-btn,.cn-btn{border:2px solid #0f1424;background:#f4f5f8}.tb-btn.p,.cn-btn.p,.cn-bk .bt.p{background:#0f1424;border-color:#0f1424;color:#ffc94a}
.tb-tabs button{border:2px solid #0f1424;background:#f4f5f8}.tb-tabs button.on{background:#0f1424;border-color:#0f1424;color:#ffc94a}
.tb-tabs button b{background:#dfe3ea;border-radius:2px}.tb-tabs button.on b{background:#ffc94a;color:#0f1424}
.tb-menu{border:2px solid #0f1424;background:#f4f5f8;box-shadow:4px 4px 0 #0f1424}
.tb-xp{background:#f4f5f8;border:3px solid #0f1424;border-radius:2px;box-shadow:6px 6px 0 #0f1424}
.tb-xn{border-radius:2px;border:2px solid #0f1424;background:#f4f5f8}.tb-xn.r{background:#c42b1f;color:#fff}.tb-xn.gy{background:#dfe3ea;border:2px dashed #8d96ab}
.tb-xb{border:2px solid #0f1424;color:#0f1424}.tb-rwv.more:after{background:linear-gradient(90deg,rgba(244,245,248,0),#f4f5f8 60%)}
.tb-main.land .tb-ac3{background:#f4f5f8}
.cn-tabs{background:#dfe3ea}.cn-tab.on{background:#0f1424;color:#ffc94a}
.tb-lb,.tb-h{letter-spacing:.02em}
.tb-lb b,.tb-ft b{color:#0f1424}
.cn-light .bg-violet-600{background:#0f1424;border-color:#0f1424;color:#ffc94a!important}
.cn-light .text-violet-200,.cn-light .text-violet-300,.cn-light .text-violet-100{color:#1b36a8}
.cn-light .bg-gray-900{background:#f4f5f8}
.tb-dot{background:#ffc94a}
.tb-sheethost{display:none;flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch}.tb-pn.hasSheet>*:not(.tb-sheethost){display:none!important}.tb-pn.hasSheet>.tb-sheethost{display:block}
.tb-fullhost{position:absolute;left:12px;right:12px;bottom:12px;top:72px;z-index:30;background:#f4f5f8;border:3px solid #0f1424;box-shadow:6px 6px 0 #0f1424;padding:12px 16px;overflow-y:auto}.tb-fullhost:empty{display:none}.tb-fullhost .tb-sh{max-width:960px;margin:0 auto}
.tb-pn{position:relative}.tb-sheethost:has(.tb-ask)>.tb-sh:not(.tb-ask){display:block!important;opacity:.4;pointer-events:none}.tb-ask{position:absolute!important;left:0;right:0;bottom:0;background:#f4f5f8;border-top:2px solid #0f1424;padding:10px 12px 12px!important;box-shadow:0 -8px 20px rgba(15,20,36,.18);z-index:5}.tb-ask .tb-shh{display:none}.tb-ask p{font-size:16px!important;font-weight:700;white-space:pre-line;line-height:1.4}.tb-ask>*+*{margin-top:6px}.tb-sh>*+*{margin-top:8px}
.cn-ord{padding:7px 10px;border:2px solid #0f1424;margin-bottom:6px}.cn-ord:first-child{padding-top:7px;border-top:2px solid #0f1424}.cn-ord:nth-child(odd){background:#fff}.cn-ord:nth-child(even){background:#dde3f0}
.zb{border:2px solid #0f1424;background:transparent!important;padding:0!important}.zb>*{padding:5px 10px}.zb>*:nth-child(odd){background:#fff}.zb>*:nth-child(even){background:#dde3f0}.zb>p{background:#0f1424!important;color:#ffc94a!important;font-weight:800;font-size:12px}
.cn-light [data-arm]{background:#c42b1f!important;color:#fff!important;border-color:#c42b1f!important}
.tb-actbar{position:sticky;bottom:0;background:#f4f5f8;border-top:2px solid #0f1424;padding:8px 0 2px;display:flex;flex-direction:column;gap:6px;z-index:3}.tb-shh{display:flex;align-items:center;gap:10px;position:sticky;top:0;background:#f4f5f8;padding:2px 0 6px;z-index:2}.tb-shh .cn-btn{width:auto;padding:0 12px;height:38px}
`;


// ── 位置與項目(R1、R8) ──
const FEET=['1','2','3','4','5','6','7','8','9','10','11','12'];
const BEDS=['21','22','23','31','32','33','34','35','36','37','38','39','310','311'];
const TimeToggles=({tv,onTv})=>{const T=tv||{};const B=({k,t})=><button onClick={()=>onTv(Object.assign({},T,{[k]:!T[k]}))} style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:12,fontWeight:700,color:T[k]?'#2548d6':'#6b7280',background:'none',border:'none',padding:'2px 4px',whiteSpace:'nowrap'}}><i style={{width:15,height:15,borderRadius:4,border:'1.5px solid '+(T[k]?'#2548d6':'#9aa0ad'),background:T[k]?'#2548d6':'#fff',color:'#fff',fontSize:11,lineHeight:'12px',textAlign:'center',fontStyle:'normal'}}>{T[k]?'✓':''}</i>{t}</button>;return(<span style={{display:'inline-flex',gap:6,alignItems:'center'}}><B k="t" t="轉場時間"/><B k="e" t="到場時間"/><B k="r" t="剩餘時間"/></span>);};
const SeatLegend=()=>{const Sq=({bg,bd,st})=><i style={{display:'inline-block',width:14,height:11,borderRadius:3,background:bg,border:'1.5px '+(st||'solid')+' '+bd,marginRight:3,verticalAlign:'-1px'}}></i>;return(<div style={{display:'flex',flexWrap:'wrap',gap:'3px 12px',fontSize:11,color:'#4b5563',padding:'4px 2px 0'}}><span><Sq bg='#c9ecd6' bd='#0f1424'/>時間充裕</span><span><Sq bg='#ffe28a' bd='#0f1424'/>5 分內</span><span><Sq bg='#ffb4ac' bd='#0f1424'/>超時</span><span><Sq bg='#e0f2fe' bd='#0284c7'/>推薦(疊卡=後面有安排,底字=老師號)</span><span><Sq bg='#f3effe' bd='#7c3aed' st='dashed'/>預定轉入</span></div>);};
const isFoot=p=>FEET.indexOf(p)>=0;
const PL=x=>x?(isFoot(x)?'腳'+x:x+'床'):''; // 位置顯示名:腳1~腳12、21床~311床
const MIN=60000;
// 項目:segs=依序的各段 [種類(b身/f腳/o油壓),分鐘];轉場在第一段結束。1 支=35~40 分,套餐含轉場(R2、R8.2~R8.4)
const ITEMS={
  b1:[['b',35]],f1:[['f',40]],b2:[['b',70]],f2:[['f',70]],b3:[['b',110]],f3:[['f',110]],bo2:[['o',70]],bo3:[['o',110]],
  bf2:[['b',35],['f',35]],fb2:[['f',35],['b',35]],bf3:[['b',70],['f',50]],fb3:[['f',50],['b',70]],
  bof3:[['o',70],['f',50]],fbo3:[['f',50],['o',70]]};
const ITEM_GROUPS=[['單項',['b1','f1','b2','f2','b3','f3']],['套餐(先做的在前)',['bf2','fb2','bf3','fb3']],['油壓(70 分以上,女老師)',['bo2','bo3','bof3','fbo3']]];
function itemCalc(code,extra,start){
  const segs=ITEMS[code];if(!segs)return null;
  const base=segs.reduce((a,x)=>a+x[1],0);const total=base+30*(extra||0);
  return{segs:segs,total:total,end:start+total*MIN,transfer:segs.length>1?start+segs[0][1]*MIN:0,oil:code.indexOf('o')>=0,
    first:segs[0][0]==='f'?'foot':'bed',second:segs.length>1?(segs[1][0]==='f'?'foot':'bed'):'',label:code+(extra?'+'+extra:'')};
}
// 口訣(R2.5~R2.8):依項目與開始時間重算轉場時間
function callCode(p,c){
  const t=p.redTransfer;if(!t)return null;const st=p.redStart;
  if(c==='11')return{transfer:st+60*MIN};if(c==='40')return{transfer:st+40*MIN};if(c==='80')return{transfer:st+80*MIN};
  if(c==='滿包')return{transfer:t+5*MIN};return null;
}

// ══════════ 推薦引擎(P3,R3、R4、R5.7~R5.8、R9;純函式,可獨立測試) ══════════
// 位置偏好順序(只做同分時的排序,可依現場修正):油壓優先 37~311,次選 33、34,盡量不排 22(R3.2、R3.3);其餘從監視器 37 起(R3.4)
const PREF_OIL=['37','38','39','310','311','33','34','31','32','35','36','21','23','22'];
const PREF_BED=['37','36','35','34','33','32','31','38','39','310','311','21','23','22'];
const PREF_FOOT=['7','10','8','9','11','12','1','2','3','4','5','6'];
const GROUPS=[['1','2','3','4','5','6'],['7'],['8','9'],['10','11','12'],['21','22','23'],['31','32','33'],['34','35','36'],['37','38','39','310','311']];
const BED1=['21','23','22','36','37','39','38','35','34','310','311','33','32','31']; // 單人:2F 優先 21→23→22;3F 先 36,再 37/39,最後才插 35;31~33 留給 3 人
const BED2=['21','22','23','34','35','38','39','37','310','311','36','33','32','31']; // 雙人:2F 21-22/22-23,否則 3F 34-35、38-39
const BED3=['31','32','33','34','35','36','37','38','39','310','311','21','22','23']; // 3 人同進場:優先 31~33
const bedPref=n=>n===1?BED1:n===2?BED2:n>=3?BED3:PREF_BED;
const adj=(a,b)=>(a==='33'&&b==='34')||(a==='34'&&b==='33')||GROUPS.some(g=>{const i=g.indexOf(a),j=g.indexOf(b);return i>=0&&j>=0&&Math.abs(i-j)===1;});
const grid10=t=>Math.ceil((t+8*3600e3)/600000)*600000-8*3600e3;
const baseCode=(it)=>{ // 依種類與時間決定代碼(套餐先後另外決定);回傳 null=不支援
  if(it.kind==='foot')return ['f1','f2','f3'][it.base-1]||null;
  if(it.kind==='body')return it.oil?(it.base===2?'bo2':it.base===3?'bo3':null):['b1','b2','b3'][it.base-1]||null;
  if(it.kind==='pkg')return it.base===3?'pkg3':it.base===2&&!it.oil?'pkg2':null;
  return null;};
function pkgCodes(it){const o=it.oil?'o':'';return it.base===3?{foot:'fb'+o+'3',body:'b'+o+'f3'}:{foot:'fb2',body:'bf2'};}
// 各位置「空出來的時間」:空位=現在;使用中=轉場時間(有預定轉場)或結束時間;預定轉入=結束時間
function posRelease(D,now){
  const M=seatMap(D);const rel={};
  FEET.concat(BEDS).forEach(x=>{
    const m=M[x];if(!m){rel[x]=now;return;}
    const p=m.p;const end=Math.max(p.redEnd||now+60*MIN,now);
    if(m.kind==='rsv')rel[x]=end;
    else rel[x]=p.redTransfer>now?p.redTransfer:(p.redTransfer>0?now:end);
    if(rel[x]<=now&&p.redEnd&&p.redEnd<=now)rel[x]=now+30000; // 該結束而未結束的位置不算空位(R9.18):有真正空位時一律先排空位
  });
  return rel;
}
// 老師池:白牌=現在可派(依白牌順序);紅牌=預計結束後可派;綠牌休息中不推薦
function teacherPool(D,now){
  const pool=[];const bks=c=>(D.bookings||[]).filter(b=>b.code===c&&b.at>now-20*MIN).map(b=>b.at).sort((a,b)=>a-b);
  D.white.forEach((p,i)=>{if(p.state==='white')pool.push({code:p.code,gender:p.gender,nation:p.nation,ready:now,order:i,white:true,bks:bks(p.code),zhunOff:zhunOn(p,now)?p.offHour:0});});
  D.red.forEach((p,i)=>pool.push({code:p.code,gender:p.gender,nation:p.nation,ready:Math.max(p.redEnd||now+60*MIN,now),order:1000+i,white:false,bks:bks(p.code),zhunOff:zhunOn(p,now)?p.offHour:0}));
  return pool;
}
// 准下(R5.28):老師喊准下後,只能接「下牌時間前做得完」的客人;沒喊准下則下牌時間前都能接(2:59 也接)
function offAbs(offHour,ref){const d0=Math.floor((ref+8*3600e3)/86400e3)*86400e3-8*3600e3;for(let k=-1;k<=2;k++){const c=d0+k*86400e3+offHour*3600e3;if(c>ref)return c;}return Infinity;}
const zhunOn=(p,now)=>!!(p&&p.zhun>0&&now-p.zhun<10*3600e3&&p.offHour>0);
const zOk=(t,f)=>f.nozhun||!t.zhunOff||!f.total||Math.max(f.ms||0,t.ready)+f.total*MIN<=offAbs(t.zhunOff,Math.max(f.ms||0,t.ready));
const tOk=(t,f)=>(!f.oil||t.gender==='F')&&(!f.gender||t.gender===f.gender)&&(!f.nation||t.nation===f.nation)&&(!f.teacher||t.code===f.teacher);
// 勞點限制(R5.11):老師在 start 之後 2 小時內有勞點預約時,可接的最長分鐘:不足 40 分=0(只能等勞點)、不足 70 分=40、不足 120 分=70、其餘不限
function bkCap(t,start){const b=(t.bks||[]).find(x=>x>start-5*MIN);if(b===undefined)return Infinity;const av=(b-start)/MIN;return av>=120?Infinity:av>=70?70:av>=40?40:0;}
const bkOk=(t,f)=>f.nobk||!f.total||f.total<=bkCap(t,Math.max(f.ms||0,t.ready));
// 挑 n 位老師:先看誰最快可派(同時間依白牌順序)
function pickTeachers(pool,f,n,usedT){
  const c=pool.filter(t=>!usedT[t.code]&&tOk(t,f)&&bkOk(t,f)&&zOk(t,f)).sort((a,b)=>a.ready-b.ready||a.order-b.order);
  return c.length>=n?c.slice(0,n):null;
}
// 挑 n 個同類型位置:先取最快空出的 n 個;同樣快時,優先緊靠在一起、保留其他緊靠位置(R3.5)、再依偏好順序
function pickPositions(type,n,rel,usedP,pref,minT,grp){
  const all=(type==='foot'?FEET:BEDS).filter(x=>!usedP[x]);
  const no22=pref===PREF_OIL&&type==='bed'&&all.filter(x=>x!=='22'&&rel[x]<=minT).length>=n; // 油壓不排 22 床,除非客滿(沒有其他空床)(R3.3)
  grp=grp||{};const near=grp.near||[],more=grp.more||0;
  if(all.length<n)return null;
  const sorted=all.slice().sort((a,b)=>Math.max(rel[a],minT)-Math.max(rel[b],minT));
  const Tn=Math.max(Math.max(rel[sorted[n-1]],minT),minT);
  const cand=all.filter(x=>Math.max(rel[x],minT)<=Tn);
  const combos=[];const rec=(st,cur)=>{if(cur.length===n){combos.push(cur.slice());return;}for(let i=st;i<cand.length;i++){cur.push(cand[i]);rec(i+1,cur);cur.pop();}};rec(0,[]);
  let best=null,bs=Infinity;
  combos.forEach(cb=>{
    let together=0;for(let i=1;i<cb.length;i++)if(!adj(cb[i-1],cb[i])&&!adj(cb[i],cb[i-1]))together++;
    const rest=cand.filter(x=>cb.indexOf(x)<0);let pairs=0;for(let i=0;i<rest.length;i++)for(let j=i+1;j<rest.length;j++)if(adj(rest[i],rest[j]))pairs++;
    const pi=cb.reduce((a,x)=>a+(pref.indexOf(x)<0?20:pref.indexOf(x)),0);
    const pw=(type==='bed'&&n>=2&&pref!==PREF_OIL)?0:1000; // 非油壓的雙人/三人床位:依床位偏好順序(2F、34-35、31~33),不為保留他人緊靠位置而讓步
    let gp=0; // 同行客人(不同項目)盡量緊靠、同樓層(R9.8):已有同行客人的位置→要緊靠它;後面還有同行客人→不要挑旁邊沒空位的落單位置(例:腳 7)
    if(near.length){if(!cb.some(x=>near.some(y=>adj(x,y)||adj(y,x))))gp=200000;}
    else if(more>0){if(!cand.some(x=>cb.indexOf(x)<0&&cb.some(y=>adj(x,y)||adj(y,x))))gp=150000;}
    // 4 人以上同行:能 2+2 就 2+2,避免「3 人坐一起、剩 1 人落單」(沒有其他選擇——例如客滿——才分開)
    let orph=0;if(n>=4){cb.forEach(x=>{if(!cb.some(y=>y!==x&&(adj(x,y)||adj(y,x))))orph++;});}
    const sc=together*100000+orph*130000+gp+(no22&&cb.indexOf('22')>=0?300000:0)+(50-pairs)*pw+pi;if(sc<bs){bs=sc;best=cb;}});
  return best;
}
// 規劃一個項目(含人數):回傳 {code,start,end,transfer,people:[...],notes,rules,wait}
function planItem(D,now,pool,rel0,used,it,order,minStart,split){
  const code0=baseCode(it);if(!code0)return {err:it.oil&&it.kind==='pkg'&&it.base===2?'油壓套餐要 120 分(bof3/fbo3)':it.oil&&it.kind==='body'&&it.base===1?'油壓要 70 分鐘以上':'不支援的項目'};
  let code=code0;if(code0==='pkg3'||code0==='pkg2'){const pc=pkgCodes(it);code=order==='body'?pc.body:pc.foot;}
  const extra=it.extra||0;const calc=itemCalc(code,extra,0);
  const f={oil:it.oil||code.indexOf('o')>=0,gender:it.gender||'',nation:it.nation||'',teacher:String(it.teacher||'').trim(),total:calc.total,ms:Math.max(now,minStart||0)};
  if(f.teacher&&it.n>1)return {err:'指定老師時一次只能排 1 位(請分開排)'};
  const rules=['R5.7'];const notes=[];
  const rel=Object.assign({},rel0);const usedT=Object.assign({},used.t),usedP=Object.assign({},used.p);
  // 拆單(R2.10、R9.9):套餐含油壓且白牌沒有合適女老師時,先由白牌老師做腳 45 分,轉場時再換女老師做身體 75 分
  let segs=calc.segs.map(x=>x.slice());
  const whiteElig=pool.some(t=>t.white&&!usedT[t.code]&&tOk(t,f));
  const isSplit=!!split&&calc.segs.length===2&&calc.segs[0][0]==='f'&&f.oil&&!whiteElig;
  if(isSplit){segs=[['f',45],['o',75+(code.slice(-1)==='2'?-5:0)]];rules.push('R2.10','R9.9');}
  const f1=isSplit?{oil:false,gender:'',nation:it.nation||'',teacher:f.teacher,total:45,ms:f.ms}:f;
  const need=calc.first;
  const tchs=pickTeachers(pool,f1,it.n,usedT);
  if(!tchs){
    if(f.teacher){const t=pool.find(x=>x.code===f.teacher);
      if(!t){const inL=k=>(D[k]||[]).some(x=>x.code===f.teacher);return {err:'指定老師 '+f.teacher+' 號:'+(inL('white')?'休息中(綠牌)':inL('gray')?'還沒上牌':inL('off')?'已下牌':inL('leave')?'請假':'今天沒有這位老師')};}
      if(usedT[f.teacher])return {err:'指定老師 '+f.teacher+' 號已排給前面的客人'};
      if(!tOk(t,f))return {err:'指定老師 '+f.teacher+' 號不符合條件(油壓限女老師/指男指女/國籍)'};
      if(!zOk(t,f))return {err:'指定老師 '+f.teacher+' 號已喊准下,'+hmFull(offAbs(t.zhunOff,Math.max(f.ms,t.ready)))+' 前要做完,來不及做這個項目(R5.28)'};
      const b=(t.bks||[]).find(x=>x>Math.max(f.ms,t.ready)-5*MIN);return {err:'指定老師 '+f.teacher+' 號 '+(b?hmFull(b)+' 有勞點預約,':'')+'時間不夠做這個項目(R5.11:不足 2 小時只能接 70/40,不足 70 只能接 40,不足 40 要等勞點)'};}
    const nb=pickTeachers(pool,Object.assign({},f1,{nobk:true}),it.n,usedT);
    const nz=pickTeachers(pool,Object.assign({},f1,{nobk:true,nozhun:true}),it.n,usedT);
    return {err:nb?'老師近 2 小時內有勞點預約,時間不夠做這個項目(R5.11)':nz?'符合條件的老師已喊准下,下牌前來不及做完這個項目(R5.28)':'沒有符合條件的老師'};}
  const posType=need;
  const pos1=pickPositions(posType,it.n,rel,usedP,posType==='foot'?PREF_FOOT:(f.oil?PREF_OIL:bedPref(it.n)),Math.max(now,minStart||0),{near:(used.grp&&used.grp[posType])||[],more:used.more||0});
  if(!pos1)return {err:'沒有'+(posType==='foot'?'腳位':'床位')};
  if(f.oil&&posType==='bed'){rules.push('R3.2','R3.3');}else if(posType==='bed')rules.push('R3.4');
  if(it.n>1)rules.push('R3.5');
  let st=Math.max(now,minStart||0,...tchs.map(t=>t.ready),...pos1.map(x=>rel[x]));
  st=st<=now+60000?now:grid10(st);
  const first=segs[0][1]*MIN;const transfer=segs.length>1?st+first:0;
  const total=segs.reduce((a,x)=>a+x[1],0)+30*extra;const end=st+total*MIN;
  pos1.forEach(x=>{usedP[x]=1;rel[x]=transfer||end;});tchs.forEach(t=>{usedT[t.code]=1;});
  let people=pos1.map((x,i)=>({teacher:tchs[i].code,white:tchs[i].white,ready:tchs[i].ready,pos1:x,pos2:'',start:st,transfer:transfer,end:end}));
  // 轉場後位置、(拆單)換女老師
  if(segs.length>1){
    const t2=calc.second;const pos2=pickPositions(t2,it.n,rel,usedP,t2==='foot'?PREF_FOOT:(f.oil?PREF_OIL:bedPref(it.n)),transfer,{near:(used.grp&&used.grp[t2])||[],more:used.more||0});
    if(pos2){const late=Math.max(...pos2.map(x=>rel[x]))-transfer;pos2.forEach((x,i)=>{people[i].pos2=x;usedP[x]=1;rel[x]=end;});if(late>60000)notes.push('轉場時位置還沒空出,約需再等 '+Math.ceil(late/60000)+' 分');}
    else notes.push('轉場後沒有空'+(t2==='foot'?'腳位':'床位'));
    if(isSplit){
      const tmpUsed=Object.assign({},usedT);const t2s=pickTeachers(pool,f,it.n,tmpUsed);
      if(t2s){t2s.forEach((t,i)=>{people[i].teacher2=t.code;usedT[t.code]=1;const lateT=t.ready-transfer;if(lateT>60000)notes.push('身體由 '+t.code+' 號(女)做,約再等 '+Math.ceil(lateT/60000)+' 分才空出');});}
      else notes.push('沒有可做油壓的女老師');
      notes.unshift('拆單:腳 45 分(白牌老師)→ 轉場後身體 75 分換女老師');
    }
  }
  used.t=usedT;used.p=usedP;if(!used.grp)used.grp={foot:[],bed:[]};used.grp[posType]=used.grp[posType].concat(pos1);people.forEach(x=>{if(x.pos2)used.grp[calc.second]=used.grp[calc.second].concat([x.pos2]);});
  return {code:isSplit?code+'(拆)':calc.label,realCode:code,extra:extra,start:st,end:end,transfer:transfer,people:people,notes:notes,rules:rules,wait:Math.max(0,Math.round((st-now)/60000)),split:isSplit,n:it.n};
}
// 整個「排客人」:items=[{kind,base,n,extra,oil,gender,nation}];回傳方案列表
function recommend(D,now,items,opt){
  opt=opt||{};if(opt.bid)D=Object.assign({},D,{bookings:(D.bookings||[]).filter(b=>b.id!==opt.bid)}); // 客人是來赴這筆勞點的:不算這筆
  const pool=teacherPool(D,now);const rel0=posRelease(D,now);
  const M=seatMap(D);const freeF=FEET.filter(x=>!M[x]).length,freeB=BEDS.filter(x=>!M[x]).length;
  const runOnce=(orders,minStart,split)=>{const used={t:{},p:{}};const res=[];
    // 前面候位的客人(R9.16、R5.29):指定老師(老點)才占該老師號碼;沒指定的只壓白牌張數,不壓號碼——壓最後面的白牌,前面的白牌現場客可先出
    const ah=[];(opt.ahead||[]).forEach(g=>{(g||[]).forEach(x=>ah.push(x));});
    ah.filter(x=>x&&x.teacher).forEach(x=>{planItem(D,now,pool,rel0,used,x,'foot',0,false);});
    const resN=ah.filter(x=>x&&!x.teacher).reduce((a,x)=>a+(x.n||1),0);
    if(resN>0)pool.filter(t=>t.white&&!used.t[t.code]).sort((a,b)=>b.order-a.order).slice(0,resN).forEach(t=>{used.t[t.code]=1;});
    used.grp={foot:[],bed:[]};
    for(let i=0;i<items.length;i++){used.more=items.slice(i+1).reduce((a,x)=>a+(x.n||1),0);const r=planItem(D,now,pool,rel0,used,items[i],orders[i],minStart,split);if(r.err)return {err:'項目 '+String.fromCharCode(65+i)+':'+r.err};r.label=String.fromCharCode(65+i);res.push(r);}return {items:res};};
  const isPkg=items.map(it=>it.kind==='pkg');
  // 套餐先後(R2.11、R9.9):預設先腳;腳位很滿、床位很空改先身;兩種都試,取最快(同樣快時依預設)
  const def=isPkg.map(()=>freeF<=1&&freeB>=3?'body':'foot');
  const alt=def.map((d,i)=>isPkg[i]?(d==='foot'?'body':'foot'):d);
  const mk=(orders,minStart,label,extraRules,split)=>{const r=runOnce(orders,minStart||0,split);if(r.err)return {label:label,err:r.err};
    const starts=r.items.map(x=>x.start);return {label:label,items:r.items,start:Math.max(...starts),rules:extraRules||[],orders:orders};};
  const plans=[];
  const need=items.some(it=>it.oil||it.gender==='F');
  const splitTry=items.some(it=>it.kind==='pkg'&&it.oil);
  let a=mk(def,opt.minStart,'最快',[],splitTry);
  if(isPkg.some(Boolean)){const b=mk(alt,opt.minStart,'改先做'+(alt[isPkg.indexOf(true)]==='body'?'身體':'腳'),['R9.9'],splitTry);
    if(!a.err&&!b.err){a.alt=b;}else if(a.err&&!b.err)a=b;}
  if(a.err)return {plans:[],error:a.err};
  plans.push(a);
  if(items.length>1&&!opt.minStart){
    const together=a.start<=now+60000?now:grid10(a.start);
    const t=mk(a.orders,together,'一起開始',['R9.11','R9.12'],splitTry);
    if(!t.err){t.together=true;t.start=together;plans.unshift(t);a.label='各自最快';
      if(isPkg.some(Boolean)){const tb=mk(alt,together,'改先做'+(alt[isPkg.indexOf(true)]==='body'?'身體':'腳'),['R9.9','R9.11','R9.12'],splitTry);if(!tb.err){tb.together=true;tb.start=together;t.alt=tb;}}} // 「一起開始」也提供改先做身體/腳(R9.9)
  }
  // 白牌沒有合適女老師:列出紅牌女老師等待時間(R9.6)
  let femaleWait=null;
  if(need&&!pool.some(t=>t.white&&t.gender==='F')){femaleWait=pool.filter(t=>!t.white&&t.gender==='F').sort((x,y)=>x.ready-y.ready).map(t=>({code:t.code,wait:Math.max(0,Math.round((t.ready-now)/60000))}));}
  // 客滿(R9.14):沒有任何空位
  const full=freeF+freeB===0;let soon=null;if(Object.keys(rel0).length){let bp=null;Object.keys(rel0).forEach(x=>{if(!bp||rel0[x]<rel0[bp])bp=x;});soon={pos:bp,at:rel0[bp]};}
  return {plans:plans,femaleWait:femaleWait,full:full,soon:full?soon:null,freeF:freeF,freeB:freeB};
}
window.__cnRec={zhunOn,offAbs,bkConflict,recommend,itemCalc,posRelease,teacherPool,grid10,planItem};
// 翻綠狀態:回傳 {left 剩餘秒, over 是否超時, overAt 到時時間(ms), used 累計秒}
function greenInfo(p,now){
  const cur=p.state==='green'?Math.max(0,Math.round((now-p.greenStart)/1000)):0;
  const used=(p.greenUsed||0)+cur;
  if(p.mgr)return{left:Infinity,over:false,overAt:0,used:used,cur:cur,noLimit:true}; // 主管職翻綠不限時
  const left=LIMIT-used;
  return{left:left,over:p.state==='green'&&left<=0,overAt:p.greenStart+((LIMIT-(p.greenUsed||0))*1000),used:used,cur:cur};
}
const isLate=(p,now)=>p.state==='gray'&&p.due<=now&&!(p.lateTo&&p.lateTo>now); // 過上牌時間(或晚到時間)仍未到 → 未到未電(R5.10)

// ── 號碼牌 ──
function Plate({p,now,small,mini,hl,onClick}){
  const st=p.state;const fem=p.gender==='F';const w=mini?36:small?50:64,h=mini?42:small?60:72;
  let bg='#f4f5f8',bd='#0f1424',bs='solid',col=fem?'#be123c':'#111',sub='',subCol='#5b6270',ring='none';
  if(st==='white'){sub=p.onAt?hm(p.onAt):'';if(p.bk){bg='#fff4c2';bd='#d99a06';sub=hm(p.bk.at)+' 勞點';subCol='#92400e';}}
  else if(st==='green'){const g=greenInfo(p,now);bg='#c9ecd6';bd=g.over?'#c42b1f':'#0f1424';col='#0b6b46';subCol='#0b6b46';ring=g.over?'0 0 0 2px #fca5a5':'none';
    if(g.over){sub='超時'+hm(g.overAt);subCol='#b91c1c';}else if(!g.noLimit&&g.left<=60){sub=mmss(g.left);subCol='#b45309';}else{sub='翻'+hm(p.greenStart);}}
  else if(st==='gray'){const late=isLate(p,now);bg='#eceef2';bd='#a9aeba';bs='dashed';col=fem?'#be123c':'#5b6270';sub=p.due?hm(p.due):'';subCol='#6b7280';
    if(late){sub='未到未電';subCol='#b91c1c';bd='#dc2626';ring='0 0 0 2px #fecaca';}
    if(p.lateTo&&p.lateTo>now){sub=(p.lateKind==='after'?'未到晚到':'晚到')+hm(p.lateTo);subCol='#b45309';}
    else if(p.lateTo&&late){sub=(p.lateKind==='after'?'未到晚到':'晚到')+hm(p.lateTo)+' 未到';subCol='#b91c1c';}}
  else if(st==='red'){bg='#ffb4ac';bd='#0f1424';col=fem?'#9f1239':'#8f1d1d';subCol='#b91c1c';sub=(p.redItem||'')+(p.redEnd?' '+hm(p.redEnd):'');}
  else if(st==='off'){bg='transparent';bd='#a9aeba';col='#6b7280';}
  else if(st==='leave'){bg='transparent';bd='#a9aeba';bs='dashed';col='#9aa0ad';sub=p.leaveKind==='temp'?'臨時請假':'請假';subCol='#9aa0ad';}
  if((st==='white'||st==='red')&&zhunOn(p,now)){sub='准下'+(sub?' '+sub:'');subCol='#b45309';}
  const sw=st==='red'&&!mini?w+10:w;if(hl)ring='0 0 0 3px #0284c7';
  if(mini)return(<button onClick={onClick} title={p.code+(sub?' '+sub:'')} style={{width:sw,minWidth:sw,height:h,flex:'0 0 auto',borderRadius:2,border:'2px '+bs+' '+bd,background:bg,boxShadow:ring,display:'flex',alignItems:'center',justifyContent:'center',padding:0,cursor:'pointer'}}><span style={{fontSize:p.code.length>2?14:17,fontWeight:800,color:col,letterSpacing:'-.02em',fontVariantNumeric:'tabular-nums'}}>{p.code}</span></button>);
  return(<button onClick={onClick} style={{width:sw,minWidth:sw,height:h,flex:'0 0 auto',borderRadius:2,border:'2px '+bs+' '+bd,background:bg,boxShadow:ring,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,padding:0,cursor:'pointer'}}>
    <span style={{fontSize:p.code.length>2?17:19,fontWeight:800,lineHeight:1,color:col,fontVariantNumeric:'tabular-nums'}}>{p.code}</span>
    {sub?<span style={{fontSize:sub.length>6?9:10,fontWeight:600,lineHeight:1.05,color:subCol,textAlign:'center',maxWidth:sw-4}}>{sub}</span>:null}</button>);
}
const Row=({children,scroll})=>(<div style={scroll?{display:'flex',gap:5,overflowX:'auto',paddingBottom:4,WebkitOverflowScrolling:'touch'}:{display:'flex',flexWrap:'wrap',gap:6}}>{children}</div>);
const CSec=({title,right,children,first})=>(<div className={'cn-sec'+(first?' f':'')}><div className="cn-sh"><h2>{title}</h2><em>{right}</em></div>{children}</div>);
const Zone=({title,count,children,hint})=>(<CSec title={title} right={count}>{children}{hint&&<p className="text-[11px] text-gray-500 mt-2">{hint}</p>}</CSec>);

// ── 彈窗 ──
// ── 主櫃規則:讀 counter-rules-data.js(由 counter-rules.md 產生),可搜尋、依主規則收合 ──
function RulesSheet({onClose}){
  const R=window.CN_RULES||null;const[q,setQ]=useState('');const[openId,setOpenId]=useState('');
  const kw=q.trim().toLowerCase();
  const secs=R?R.secs.map(sc=>({sc:sc,rows:kw?sc.rows.filter(r=>(r[0]+' '+r[1]+' '+r[2]).toLowerCase().indexOf(kw)>=0):sc.rows})).filter(x=>x.rows.length>0):[];
  const tone=st=>/待確認/.test(st)&&!/已確認/.test(st)?{background:'#fff6e0',color:'#92400e',borderColor:'#f0c36a'}:{background:'#e8f7ef',color:'#0f6b49',borderColor:'#9bd9bb'};
  const host=CNP.full;const ttl=(<span>📖 主櫃規則{R&&R.ver?<small style={{fontSize:11,fontWeight:500,color:'#9aa0ad',marginLeft:8}}>v{R.ver}　{R.upd||''}</small>:null}</span>);
  useEffect(()=>{if(!host)return;const pn=host.parentNode;if(pn)pn.classList.add('hasSheet');return()=>{if(pn)pn.classList.remove('hasSheet');};},[host]);
  const body=(<React.Fragment>
      {!R&&<p className="text-sm text-gray-500">規則資料還沒載入(counter-rules-data.js)</p>}
      {R&&<React.Fragment>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="搜尋規則(編號、關鍵字,例如 R6.4、轉場、口訣)" className="w-full rounded-xl border border-gray-700 bg-gray-900 px-3 py-3 text-base" style={{minHeight:44}}/>
        <div style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch'}} className="space-y-2">
          {secs.length===0&&<p className="text-sm text-gray-500 py-4 text-center">沒有符合的規則</p>}
          {secs.map(({sc,rows})=>{const isOpen=kw?true:openId===sc.id;return(<div key={sc.id} style={{border:'1px solid #e3e5eb',borderRadius:12,background:'#fff'}}>
            <button onClick={()=>setOpenId(isOpen&&!kw?'':sc.id)} className="w-full flex items-center justify-between px-3 text-left" style={{minHeight:48}}>
              <span className="text-base font-bold text-white"><span style={{color:'#2548d6'}}>{sc.id}</span>　{sc.title}</span><span className="text-xs text-gray-400">{rows.length} 條　{isOpen?'▲':'▼'}</span></button>
            {isOpen&&<div className="px-3 pb-3 space-y-2">{sc.note&&<p className="text-xs text-gray-400">{sc.note}</p>}
              {rows.map(r=>(<div key={r[0]} style={{borderTop:'1px solid #eceef2',paddingTop:8}}>
                <div className="flex items-start justify-between gap-2"><p className="text-sm font-bold text-white"><span style={{color:'#2548d6'}}>{r[0]}</span>　{r[1]}</p><span style={Object.assign({fontSize:10,border:'1px solid',borderRadius:6,padding:'1px 6px',whiteSpace:'nowrap'},tone(r[3]))}>{r[3]}</span></div>
                <p className="text-sm text-gray-300 mt-1" style={{lineHeight:1.55}}>{r[2]}</p></div>))}</div>}
          </div>);})}
        </div>
        <p className="text-[11px] text-gray-500">系統的推薦與提醒會標出依據的規則編號;出問題時請回報編號與畫面。</p>
      </React.Fragment>}
  </React.Fragment>);
  if(host)return ReactDOM.createPortal(<div className="tb-sh"><div className="tb-shh"><button onClick={onClose} className="cn-btn">‹ 返回</button><p className="text-lg font-bold text-white">{ttl}</p></div>{body}</div>,host);
  return(<div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" style={{background:'rgba(20,22,30,.45)'}} onClick={onClose}>
    <div className="w-full rounded-t-2xl sm:rounded-2xl bg-gray-900 border border-gray-700 p-4 space-y-3" onClick={e=>e.stopPropagation()} style={{maxWidth:720,height:'88vh',display:'flex',flexDirection:'column'}}>
      <div className="flex items-center justify-between"><p className="text-lg font-bold text-white">{ttl}</p><button onClick={onClose} className="text-gray-400 text-xl px-2" aria-label="關閉">✕</button></div>
      {body}
    </div></div>);
}
const CNP={el:null,full:null,map:null,n:0};
const SheetWhere=React.createContext('');
const CNQ={fire:null};
function cnAsk(msg,fn){if(CNQ.fire)CNQ.fire({msg:msg,fn:fn});else if(confirm(msg))fn();}
function Sheet({title,onClose,children,cls,where:wp}){
  const where=wp||React.useContext(SheetWhere);const host=where==='full'?CNP.full:where==='map'?CNP.map:CNP.el;
  useEffect(()=>{if(!host)return;CNP.n++;const pn=host.parentNode;if(pn)pn.classList.add('hasSheet');return()=>{CNP.n--;if(CNP.n<=0){CNP.n=0;if(pn)pn.classList.remove('hasSheet');}};},[host]);
  if(host)return ReactDOM.createPortal(<div className={"tb-sh"+(cls?" "+cls:"")}><div className="tb-shh"><button onClick={onClose} className="cn-btn">‹ 返回</button><p className="text-lg font-bold text-white">{title}</p></div>{children}</div>,host);
  return(<div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" style={{background:'rgba(20,22,30,.45)'}} onClick={onClose}>
    <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-gray-900 border border-gray-700 p-4 space-y-3" onClick={e=>e.stopPropagation()} style={{maxHeight:'85vh',overflowY:'auto'}}>
      <div className="flex items-center justify-between"><p className="text-lg font-bold text-white">{title}</p><button onClick={onClose} className="text-gray-400 text-xl px-2">✕</button></div>{children}</div></div>);
}
const Bt=({children,onClick,tone,disabled,st})=>(<button disabled={disabled} onClick={onClick} style={st||undefined} data-arm={st?'1':undefined} className={'w-full rounded-xl py-3 text-base font-bold '+(tone==='red'?'border border-red-500 text-red-400':tone==='gray'?'border border-gray-600 text-gray-200':tone==='green'?'bg-emerald-600 text-white':'bg-violet-600 text-white')+(disabled?' opacity-40':'')}>{children}</button>);
function useArm(onYes){const[a,setA]=useState(false);const t0=useRef(0);const el=useRef(null);
  useEffect(()=>{if(!a)return;const h=e=>{if(el.current&&!el.current.contains(e.target))setA(false);};document.addEventListener('pointerdown',h,true);const tm=setTimeout(()=>setA(false),4000);return()=>{document.removeEventListener('pointerdown',h,true);clearTimeout(tm);};},[a]);
  const click=e=>{if(e&&e.stopPropagation)e.stopPropagation();if(!a){t0.current=Date.now();setA(true);return;}if(Date.now()-t0.current<600)return;setA(false);onYes();};
  return [a,click,el];}
const ARM={background:'#c42b1f',color:'#fff',borderColor:'#c42b1f'};
function CBt({onYes,tone,children,disabled}){const[a,click,el]=useArm(onYes);return(<span ref={el} style={{display:'block'}}><Bt tone={tone} disabled={disabled} onClick={click} st={a?ARM:null}>{a?'確定此操作?':children}</Bt></span>);}
function CBtn({onYes,className,style,children}){const[a,click,el]=useArm(onYes);return(<button ref={el} data-arm={a?'1':undefined} className={className} style={Object.assign({},style||{},a?ARM:{})} onClick={click}>{a?'確定此操作?':children}</button>);}
const Info=({k,v})=>(<div className="flex justify-between text-sm"><span className="text-gray-400">{k}</span><span className="text-gray-100">{v}</span></div>);



// ── 價目(依 shop2.js 價目表)與付款試算 ──
const PRICE_BASE={f1:500,f2:850,f3:1299,b1:500,b2:850,b3:1299,bf2:850,fb2:850,bf3:1299,fb3:1299};
// 套餐 120 分(bf3/fb3):依「開單時間」平日(週一~五)00:00~12:00 為早鳥夜貓 1099,其餘 1299;加節 30 分 500、60 分 850。油壓等價目未訂 → null(收銀時手動填)
function priceOf(item,ts){const m=/^([a-z0-9]+)(?:\+(\d+))?$/.exec(String(item||''));if(!m)return null;let b=PRICE_BASE[m[1]];if(b==null)return null;
  if(m[1]==='bf3'||m[1]==='fb3'){const d=new Date(ts+8*3600e3);const dow=d.getUTCDay(),h=d.getUTCHours();if(dow>=1&&dow<=5&&h<12)b=1099;}
  const n=parseInt(m[2],10)||0;return b+850*Math.floor(n/2)+500*(n%2);}
function payCalc(total,method,t400,t200){const tk=method==='ticket';const a=tk?Math.max(0,Math.min(50,parseInt(t400,10)||0)):0,b=tk?Math.max(0,Math.min(50,parseInt(t200,10)||0)):0;const tv=a*400+b*200;
  return{method:tk?'ticket':'cash',t400:a,t200:b,total:total,cash:Math.max(0,total-tv),over:Math.max(0,tv-total)};}
const payTxt=p=>!p?'':(p.method==='ticket'?'票券 '+[p.t400?'400×'+p.t400:'',p.t200?'200×'+p.t200:''].filter(Boolean).join('＋')+(p.cash?'＋現金 '+p.cash:'')+(p.over?'(超收 '+p.over+')':''):'現金');
// ── 訂單流水:同一組客人(同一次安排,gid 相同)合併成 1 筆;帶位中 / 服務中(已打單) / 已完成·待買單 / 已完成(已買單);不顯示金額 ──
function groupOrders(O){
  const M={};O.forEach(x=>{const k=x.gid||x.id;(M[k]=M[k]||{key:k,list:[]}).list.push(x);});
  return Object.keys(M).map(k=>{const g=M[k];const L=g.list;const h=L[0];
    g.st=L.some(x=>x.status==='seating')?'seating':L.some(x=>x.status==='serving')?'serving':L.some(x=>x.status==='wait_pay')?'wait_pay':'done';
    g.start=Math.min.apply(null,L.map(x=>x.start||0));g.createdAt=Math.min.apply(null,L.map(x=>x.createdAt||0));
    g.doneAt=Math.max.apply(null,L.map(x=>x.doneAt||0));g.paidAt=Math.max.apply(null,L.map(x=>x.paidAt||0));g.ordAt=Math.max.apply(null,L.map(x=>x.ordAt||0));
    g.ordBy=(L.find(x=>x.ordBy)||{}).ordBy||'';g.paidBy=(L.find(x=>x.paidBy)||{}).paidBy||'';g.openBy=h.openBy;
    g.guest=guestTxt(h);g.gnm=gDisp(h);g.sub=h.src||'';g.no=(L.find(x=>x.no)||{}).no||'';
    const pi=(L.find(x=>x.payInfo)||{}).payInfo;try{g.pay=pi?JSON.parse(pi):null;}catch(_e){g.pay=null;}
    const pr=L.map(x=>priceOf(x.item,x.createdAt));g.due=pr.every(x=>x!==null)?pr.reduce((a,b)=>a+b,0):null;g.paid=L.reduce((a,x)=>a+(x.price||0),0);g.start0=Math.min.apply(null,L.map(x=>x.start0||x.createdAt||0));g.prepaid=L.some(x=>x.prepaid);g.canPre=L.some(x=>(x.status==='seating'||x.status==='serving')&&!x.prepaid);return g;});
}
function OrderLog({D,onOpen,onPay,onPre,act,forced}){
  const A=groupOrders(D.orders||[]);const[tab,setTab]=useState('');
  const sg=A.filter(x=>x.st==='seating').sort((a,b)=>a.start-b.start);const sv=A.filter(x=>x.st==='serving').sort((a,b)=>a.start-b.start);
  const wp=A.filter(x=>x.st==='wait_pay').sort((a,b)=>a.doneAt-b.doneAt);
  const dn=A.filter(x=>x.st==='done').sort((a,b)=>b.paidAt-a.paidAt).slice(0,30);
  const TABS=[['seating','帶位',sg],['serving','服務中',sv],['wait_pay','待買單',wp],['done','已完成',dn]];
  const cur=forced||tab||(sg.length?'seating':wp.length&&!sv.length?'wait_pay':'serving'); // 預設:有待打單先看待打單,其次服務中
  const list=(TABS.find(x=>x[0]===cur)||TABS[1])[2];
  const nm=g=>g.list.length>1?'這組客人('+g.list.length+' 位)':'老師 '+g.list[0].code+'('+g.list[0].item+')';
  const ST={seating:['帶位中','#0284c7','#0369a1'],serving:['服務中','#0f8a5f','#0f8a5f'],wait_pay:['待買單','#d99a06','#b45309'],done:['已完成','#9aa0ad','#5b6270']};
  const Mem=({o})=>(<div className="cn-m"><span className="c">{o.item}</span><span>老師 <b>{o.code}</b></span><span>位置 {PL(o.pos0)}{o.pos&&o.pos!==o.pos0?' → '+PL(o.pos):''}</span>
    <span className="tt">{o.status==='wait_pay'?'完成 '+hmFull(o.doneAt):o.status==='seating'?hmFull(o.createdAt)+' 開單':hmFull(o.start)+(o.end?' – '+hmFull(o.end):'')}{o.status==='serving'&&o.transfer>0?'　轉'+hm(o.transfer):''}</span></div>);
  const Ord=({g})=>{const st=ST[g.st];const clickable=g.st==='serving';
    return(<div className="cn-ord click" onClick={()=>onOpen(g.key)}>
      <div className="cn-oh"><span className="cn-no">{g.no||'…'}</span><span className="cn-gn">{g.gnm||'客人未登記'}</span>{g.list.length>1?<span className="cn-cnt">{g.list.length} 位</span>:null}<span className="cn-sp"></span>
        {g.st==='wait_pay'&&g.due!==null?<span className="cn-money">應收 {g.due}</span>:g.st==='done'?<span className="cn-money">{g.pay?g.pay.total:g.paid}</span>:<span className="cn-st" style={{color:st[2]}}><i className="cn-dot" style={{background:st[1]}}></i>{st[0]}</span>}</div>
      {g.list.map(o=><Mem key={o.id} o={o}/>)}
      <div className="cn-meta"><span></span><span style={{color:'#2548d6',fontWeight:600}}>{g.st==='seating'?'打單 · 先付 ›':g.st==='serving'?'回牌 · 轉場 · 加時 · 先付 ›':g.st==='wait_pay'?'買單 ›':'明細 ›'}</span></div>
      {g.prepaid&&g.st!=='done'&&<div className="cn-meta"><span style={{color:'#0f8a5f',fontWeight:700}}>✔ 已先付 {g.pay?g.pay.total:g.paid}{g.pay?' · '+payTxt(g.pay):''}</span></div>}
    </div>);};
  if(forced)return(<div>{list.length===0?<p className="text-sm text-gray-500 py-2">沒有</p>:list.map(g=><Ord key={g.key} g={g}/>)}</div>);
  return(<CSec title="訂單" right="一組客人算一筆"><div className="cn-tabs">{TABS.map(t=>(<button key={t[0]} className={'cn-tab'+(cur===t[0]?' on':'')} onClick={()=>setTab(t[0])}>{t[1]}{t[0]!=='done'||t[2].length?' '+t[2].length:''}</button>))}</div>
    {list.length===0?<p className="text-sm text-gray-500 py-2">沒有</p>:list.map(g=><Ord key={g.key} g={g}/>)}</CSec>);
}
// 買單:每位老師的金額(依價目與開單時間自動帶入,可改;價目未訂的要手填)、付款方式 現金/票券(400、200 可混用,不足補現金)
function PaySheet({g,onDone,onClose,pre}){
  const mem=pre?g.list.filter(o=>(o.status==='seating'||o.status==='serving')&&!o.prepaid):g.list.filter(o=>o.status==='wait_pay');
  const[pr,setPr]=useState(()=>{const m={};mem.forEach(o=>{const v=priceOf(o.item,o.createdAt);m[o.id]=v===null?'':String(v);});return m;});
  const[method,setMethod]=useState('cash');const[t4,setT4]=useState(0);const[t2,setT2]=useState(0);
  const okAll=mem.every(o=>pr[o.id]!==''&&Number(pr[o.id])>=0);const total=mem.reduce((a,o)=>a+(Number(pr[o.id])||0),0);
  const pc=payCalc(total,method,t4,t2);
  const Step=({v,set,max})=>(<span className="inline-flex items-center gap-2"><button onClick={()=>set(Math.max(0,v-1))} className="w-9 h-9 rounded-lg border border-gray-600 text-white">−</button><span className="text-white font-bold w-6 text-center">{v}</span><button onClick={()=>set(Math.min(max,v+1))} className="w-9 h-9 rounded-lg border border-gray-600 text-white">+</button></span>);
  const Ch=({on,children,onClick})=>(<button onClick={onClick} className={'flex-1 rounded-xl border px-3 py-2 text-base font-bold '+(on?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-200')}>{children}</button>);
  return(<Sheet title={(pre?'先付 #':'買單 #')+(g.no||'…')} onClose={onClose}>
    <p className="text-sm text-violet-200">{g.guest||'客人未登記'}{mem.length>1?'　'+mem.length+' 位':''}</p>
    {mem.map(o=>(<div key={o.id} className="flex items-center gap-2"><span className="text-sm text-gray-200 flex-1">老師 <b>{o.code}</b>　{o.item}{priceOf(o.item,o.createdAt)===null?<span className="text-amber-300 text-xs">　(價目未訂,請手填)</span>:null}</span>
      <input value={pr[o.id]} onChange={e=>setPr(Object.assign({},pr,{[o.id]:e.target.value.replace(/[^0-9]/g,'')}))} inputMode="numeric" placeholder="金額" className="w-24 rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white text-right"/></div>))}
    <div className="flex gap-2"><Ch on={method==='cash'} onClick={()=>setMethod('cash')}>現金</Ch><Ch on={method==='ticket'} onClick={()=>setMethod('ticket')}>票券</Ch></div>
    {method==='ticket'&&<div className="space-y-2"><div className="flex items-center justify-between"><span className="text-sm text-gray-300">400 元票券</span><Step v={t4} set={setT4} max={20}/></div><div className="flex items-center justify-between"><span className="text-sm text-gray-300">200 元票券</span><Step v={t2} set={setT2} max={20}/></div></div>}
    <div className="rounded-xl bg-black/30 p-3 space-y-1"><Info k="應收" v={total}/>{method==='ticket'&&<Info k="票券抵" v={t4*400+t2*200}/>}<Info k={method==='ticket'?'補現金':'收現金'} v={pc.cash}/>
      {pc.over>0&&<p className="text-sm text-amber-300">票券超出應收 {pc.over} 元(票券不找零,請確認)</p>}</div>
    <Bt disabled={!okAll||mem.length===0} onClick={()=>onDone({prices:JSON.stringify(pr),method:method,t400:t4,t200:t2})}>{okAll?(pre?'確認先付':'確認買單'):'請填寫每位老師的金額'}</Bt><Bt tone="gray" onClick={onClose}>取消</Bt></Sheet>);
}
// 服務中的訂單:回牌 / 轉場 / 加時(每位老師各自操作)
function OrderSheet({g,D,act,onClose,now,onPay,onPre}){
  const[pick,setPick]=useState('');const M=seatMap(D);
  const mem=g.list;
  const go=(a,o)=>act(Object.assign({act:a},o));
  return(<Sheet title={'訂單 #'+(g.no||'…')} onClose={onClose}>
    <p className="text-sm text-violet-200">{g.guest||'客人未登記'}{mem.length>1?'　'+mem.length+' 位':''}</p>
    <div className="zb"><Info k="開單時間" v={hmFull(g.createdAt)+(g.openBy?'　'+g.openBy:'')}/><Info k="帶位時間" v={g.start0>0?hmFull(g.start0):'—'}/><Info k="打單時間" v={g.ordAt>0?hmFull(g.ordAt)+(g.ordBy?'　'+g.ordBy:''):'尚未打單'}/>
      {mem.map(o=>(<div key={o.id} className="zb"><p>老師 {o.code}　{o.item}</p><Info k="轉場時間" v={o.movedAt>0?hmFull(o.movedAt):(o.transfer>0?'預定 '+hmFull(o.transfer):'—')}/><Info k="回牌時間" v={o.doneAt>0?hmFull(o.doneAt)+(o.doneBy?'　'+o.doneBy:''):'—'}/></div>))}
      {g.paidAt>0&&<Info k="買單時間" v={hmFull(g.paidAt)+(g.paidBy?'　'+g.paidBy:'')+(g.prepaid?'(先付)':'')+(g.pay?'　'+payTxt(g.pay):'')}/>}</div>
    {mem.map(o=>{const p=D.red.find(x=>x.code===o.code&&x.redItem===o.item);
      if(o.status!=='serving'||!p)return(<div key={o.id} className="rounded-xl border border-gray-800 p-3"><p className="text-sm text-gray-300">老師 <b>{o.code}</b>　{o.item}　{o.status==='wait_pay'?'已完成 '+hmFull(o.doneAt):'—'}</p></div>);
      const second=itemCalc(p.redItem.replace(/\+\d+$/,''),0,0);const needType=second&&second.second?(isFoot(p.redPos)?'bed':'foot'):'';
      const frees=(needType==='foot'?FEET:needType==='bed'?BEDS:FEET.concat(BEDS)).filter(x=>!M[x]||(M[x].p===p&&M[x].kind==='rsv')).sort((a,b)=>(b===p.redPos2)-(a===p.redPos2));const canMove=p.redTransfer>0;
      return(<div key={o.id} className="rounded-xl border border-gray-700 p-3 space-y-2">
        <p className="text-sm text-gray-100">老師 <b className="text-white">{o.code}</b>　<b style={{fontFamily:'monospace'}}>{p.redItem}</b>　位置 {PL(p.redPos)}{p.redPos2?' → '+PL(p.redPos2):''}</p>
        <p className="text-xs text-gray-400">{hmFull(p.redStart)}{p.redTransfer>0?'　轉場 '+hmFull(p.redTransfer)+'(剩 '+cdTxt(p.redTransfer-now).replace('剩','')+')':''}　結束 {p.redEnd?hmFull(p.redEnd):'—'}</p>
        {pick==='ext:'+o.code?(<div className="space-y-2"><p className="text-sm text-gray-300">加時多久?</p><div className="flex gap-2">{[1,2,3,4].map(k=><button key={k} onClick={()=>{go('extend',{code:o.code,n:k});setPick('');}} className="flex-1 rounded-xl border border-emerald-500 text-emerald-300 py-3 font-bold">{k*30} 分</button>)}</div><Bt tone="gray" onClick={()=>setPick('')}>返回</Bt></div>):pick===o.code?(<div className="space-y-2"><p className="text-sm text-gray-300">轉到哪個位置?</p><div className="flex flex-wrap gap-2">{frees.map(x=><button key={x} onClick={()=>{go('move',{code:o.code,pos2:x});setPick('');}} className={'rounded-lg border px-3 py-2 '+(x===p.redPos2?'border-violet-400 bg-violet-600 text-white font-bold':'border-violet-500 text-violet-200')}>{PL(x)}{x===p.redPos2?'(建議)':''}</button>)}{frees.length===0&&<span className="text-xs text-gray-400">目前沒有空位可立即轉</span>}</div>{soonSeats(p,M,needType).length>0&&<div className="space-y-1"><p className="text-xs text-gray-400">預定(目前有人,轉場前會空出;先預定、時間到再按轉場)</p><div className="flex flex-wrap gap-2">{soonSeats(p,M,needType).map(x=><button key={x} onClick={()=>{go('replan',{code:o.code,pos2:x});setPick('');}} className="rounded-lg border-2 border-dashed border-violet-500 px-3 py-2 text-violet-200">{PL(x)}<SoonLbl M={M} x={x} p={p} now={now}/></button>)}</div></div>}<Bt tone="gray" onClick={()=>setPick('')}>返回</Bt></div>)
        :(<div className="flex gap-2">
          <CBtn onYes={()=>go('back',{code:o.code})} className="flex-1 rounded-xl border border-red-500 text-red-300 py-2 font-bold">回牌</CBtn>
          <button disabled={!canMove} onClick={()=>setPick(o.code)} className={'flex-1 rounded-xl py-2 font-bold '+(canMove?'bg-violet-600 text-white':'border border-gray-700 text-gray-600')}>{canMove?(p.redPos2?'轉場→'+PL(p.redPos2)+' ›':'轉場'):'無轉場'}</button>
          <button onClick={()=>setPick('ext:'+o.code)} className="flex-1 rounded-xl border border-emerald-500 text-emerald-300 py-2 font-bold">加時</button></div>)}
      </div>);})}
    {(g.st==='seating'||g.st==='wait_pay'||(g.canPre&&(g.st==='seating'||g.st==='serving')))&&<div className="tb-actbar">
      {g.st==='seating'&&<CBt onYes={()=>{act({act:'dadan',wid:g.key});onClose();}}>打單</CBt>}
      {g.st==='wait_pay'&&<Bt onClick={()=>{onClose();onPay(g.key);}}>買單</Bt>}
      {g.canPre&&(g.st==='seating'||g.st==='serving')&&<Bt tone="green" onClick={()=>{onClose();onPre(g.key);}}>先付</Bt>}</div>}</Sheet>);
}
// 位置佔用:{位置:{p:老師牌, kind:'cur'|'rsv'}}
function seatMap(D){const m={};D.red.forEach(p=>{if(p.redPos)m[p.redPos]={p:p,kind:'cur'};});D.red.forEach(p=>{if(p.redPos2){const o=m[p.redPos2];if(o&&o.kind==='cur'&&o.p!==p)o.nx=p;else m[p.redPos2]={p:p,kind:'rsv'};}});return m;}
const CN_TOL=5*60000;
function SoonLbl({M,x,p,now}){const q=M[x].p;const rel=q.redTransfer>0?q.redTransfer:q.redEnd;const over=rel>p.redTransfer;return(<span className="block text-[10px]">{q.code}號 {hm(rel)}{q.redTransfer>0?'轉':'結束'}<br/><b>{cdTxt(rel-now)}</b>{over&&<span style={{color:'#b45309'}}>　需調節(差{Math.ceil((rel-p.redTransfer)/60000)}分)</span>}</span>);}
function soonSeats(p,M,needType){const tr=p.redTransfer>0?p.redTransfer:0;if(!tr)return [];return (needType==='foot'?FEET:needType==='bed'?BEDS:FEET.concat(BEDS)).filter(x=>{const o=M[x];if(!o||o.kind!=='cur'||o.p===p||o.nx)return false;const rel=o.p.redTransfer>0?o.p.redTransfer:o.p.redEnd;return rel>0&&rel<=tr+CN_TOL;});}
// 位置格:本身時間狀態(R6.4):接近(≤5 分)黃、超時紅、其餘綠
const cdTxt=ms=>{const o=ms<0,a=Math.floor(Math.abs(ms)/1000),h=Math.floor(a/3600),m=Math.floor(a%3600/60),sc=a%60,pd=n=>(n<10?'0':'')+n;return (o?'超 ':'剩')+(h>0?h+':'+pd(m):pd(m))+':'+pd(sc);};
function Seat({pos,occ,now,onClick,h,hl,tv}){
  const stackCur=!!(occ&&occ.kind==='cur'&&(occ.nx||hl));
  let bg='#f4f5f8',bd='#8d96ab',bs='solid',body=<span style={{color:'#9aa0ad',fontSize:12}}>空</span>;
  if(hl&&!occ){bd='#0284c7';bs='solid';bg='#e0f2fe';body=<React.Fragment><span style={{fontSize:18,fontWeight:800,color:'#111',lineHeight:1}}>{hl.t}</span><span style={{fontSize:10,fontWeight:800,color:'#0369a1'}}>{hl.k===2?'轉場':'推薦'}</span></React.Fragment>;} // 推薦=藍色實線框(紫色虛線留給預定轉場「轉入」)
  if(occ){const p=occ.p;const fem=p.gender==='F';
    if(occ.kind==='rsv'){bd='#7c3aed';bs='dashed';bg='#f3effe';body=<React.Fragment><span style={{fontSize:16,fontWeight:800,color:'#6d28d9'}}>{p.code}</span><span style={{fontSize:9,color:'#6d28d9'}}>轉入{p.redTransfer?' '+hm(p.redTransfer):''}</span></React.Fragment>;}
    else{const key=p.redTransfer>0?p.redTransfer:p.redEnd;const left=key?(key-now)/60000:999;const over=p.redEnd&&now>p.redEnd;
      const T=tv||{t:true,e:true,r:false};let tShow=T.t&&p.redTransfer>0,rShow=T.r&&key>0,eShow=T.e&&p.redEnd>0;if(stackCur){const w=rShow?'r':tShow?'t':eShow?'e':(key>0?'r':'');rShow=w==='r';tShow=w==='t';eShow=w==='e';}else if(tShow&&rShow&&eShow)eShow=false; // 最多 2 排:轉場+剩餘+到場 三排同時有時不顯示「到」
      bg=over?'#ffb4ac':left<=5?'#ffe28a':'#c9ecd6';bd='#0f1424';
      body=<React.Fragment><span style={{fontSize:p.code.length>2?17:20,fontWeight:800,color:fem?'#be123c':'#111',lineHeight:1}}>{p.code}</span><span style={{fontSize:10,fontWeight:700,color:'#3a4050'}}>{p.redItem}</span>
        {tShow&&<span style={{fontSize:10,color:'#92400e'}}>{hm(p.redTransfer)}轉</span>}{rShow&&<span style={{fontSize:10,fontWeight:700,color:key===p.redTransfer?'#92400e':(over?'#b91c1c':'#0b6b46')}}>{cdTxt(key-now)}</span>}{eShow&&<span style={{fontSize:10,color:over?'#b91c1c':'#0b6b46'}}>到{hm(p.redEnd)}</span>}</React.Fragment>;}}
  const stk=(hl&&occ)?{c:'#0284c7',bg:'#e0f2fe',tx:'#0369a1',t:hl.t}:(occ&&occ.kind==='cur'&&occ.nx?{c:'#7c3aed',bg:'#f3effe',tx:'#6d28d9',t:occ.nx.code}:null); // 推薦要排到這格,但這格現在還有人(例:21 床還在做):疊兩張卡片——前面是目前的客人,後面藍色那張=推薦的後續安排,底部小字=老師號
  const lab=<span style={{fontSize:11,color:'#6b7280',alignSelf:'flex-start',paddingLeft:4}}>{PL(pos)}</span>;
  if(!stk)return(<button onClick={onClick} style={{flex:'1 1 0',minWidth:0,minHeight:h===undefined?92:h,borderRadius:2,border:'1.5px '+bs+' '+bd,background:bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1,padding:'2px 0'}}>{lab}{body}</button>);
  return(<div style={{flex:'1 1 0',minWidth:0,minHeight:h===undefined?100:h,position:'relative'}}>
    <div style={{position:'absolute',left:8,right:0,top:8,bottom:0,borderRadius:2,border:'2px solid '+stk.c,background:stk.bg,display:'flex',alignItems:'flex-end',justifyContent:'center',paddingBottom:1,fontSize:10,fontWeight:800,color:stk.tx}}>{stk.t}</div>
    <button onClick={onClick} style={{position:'absolute',left:0,right:8,top:0,bottom:14,borderRadius:2,border:'1.5px '+bs+' '+bd,background:bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1,padding:'2px 0',overflow:'hidden'}}>{lab}{body}</button></div>);
}
const Grp=({children})=>(<div style={{display:'flex',gap:3,flex:'1 1 0',minWidth:0,border:'1px solid #e3e5eb',borderRadius:10,padding:3}}>{children}</div>);
function SeatMap({D,now,onSeat,tv,onTv}){
  const M=seatMap(D);const S=pos=><Seat key={pos} pos={pos} occ={M[pos]} now={now} tv={tv} onClick={()=>onSeat(pos)}/>;
  const free=a=>a.filter(x=>!M[x]).length;
  const Sec=({t,r,children})=>(<Card className="space-y-2"><div className="flex items-center justify-between"><p className="text-sm font-bold text-white">{t}</p><span className="text-xs text-gray-400">{r}</span></div>{children}</Card>);
  return(<React.Fragment>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><SeatLegend/>{onTv&&<TimeToggles tv={tv} onTv={onTv}/>}</div>
    <Sec t="1F 腳位 1~6" r={'空 '+free(['1','2','3','4','5','6'])}><div style={{display:'flex',gap:3}}>{['1','2','3','4','5','6'].map(S)}</div></Sec>
    <Sec t="2F 腳位 7~12" r={'空 '+free(['7','8','9','10','11','12'])+''}><div style={{display:'flex',gap:3}}>{['7','8','9','10','11','12'].map(S)}</div>
      <p className="text-xs text-gray-400">2F 床位</p><div style={{display:'flex',gap:3}}>{['21','22','23'].map(S)}</div></Sec>
    <Sec t="3F 床位" r={'空 '+free(['31','32','33','34','35','36','37','38','39','310','311'])}><div style={{display:'flex',gap:8}}><Grp>{['31','32','33'].map(S)}</Grp><Grp>{['34','35','36'].map(S)}</Grp></div>
      <p className="text-xs text-gray-400">37~311(油壓優先)</p><div style={{display:'flex',gap:3}}>{['37','38','39','310','311'].map(S)}</div></Sec>
  </React.Fragment>);
}
const hmOpt=ms=>hmFull(ms);

// ── 安排客人(R9)與「排客人後的推薦」 ──
const KIND_T={foot:'腳',body:'身',pkg:'套餐'};
const MINS={foot:[[1,40],[2,70],[3,110]],body:[[1,35],[2,70],[3,110]],pkg:[[2,70],[3,120]]};
const TITLES=['先生','小姐'],SRCS=['現場','電話','自約'];
const NATS=['日','港','韓','美','越','泰']; // 外國客人國籍(R9.17)
const G0=()=>({title:'',src:'',phone:'',sur:'',giv:'',anon:false,fnat:''});
const gDigits=g=>String(g.phone||'').replace(/[^0-9]/g,'');
const guestOk=g=>g.anon?g.src==='現場':!!(g.title&&g.src)&&(!gDigits(g)||(gDigits(g).length>=8&&gDigits(g).length<=15&&!!String(g.sur||'').trim()));
// 姓名欄只留姓;國籍以「姓~日」記在 gname(不必改 GAS 欄位);不留個資=gname「現場客」
const gFields=g=>g.anon?{title:g.title||'',src:'現場',phone:'',sur:'',giv:'',gname:'現場客'+(g.fnat?'~'+g.fnat:'')}:{title:g.title,src:g.src,phone:gDigits(g).length>=8?gDigits(g):'',sur:String(g.sur||'').trim(),giv:'',gname:String(g.sur||'').trim()+(g.fnat?'~'+g.fnat:'')};
// 客人顯示:姓+稱謂+(國籍)+手機末 3 碼,例「陳先生 673」「現場客・先生(日)」(R9.17)
const gDisp=o=>{const gn=String((o&&o.gname)||'');const i=gn.indexOf('~');const nm=i>=0?gn.slice(0,i):gn;const nat=i>=0?gn.slice(i+1):'';const t=(o&&o.title)||'';const ph=o&&o.phone?String(o.phone).slice(-3):'';
  return(nm==='現場客'?nm+(t?'・'+t:''):nm+t)+(nat?'('+nat+')':'')+(ph?' '+ph:'');};
// 客人:客源、稱謂必選(不留個資只需客源=現場,稱謂可不選);手機可輸入全碼或末 3 碼查客人檔,無符合就新建檔(需填姓);平板另有數字鍵(R9.17)
const Keypad=({onKey})=>(<div className="tb-kp">{['0','1','2','3','4','5','6','7','8','9'].map(k=><button key={k} onClick={()=>onKey(k)}>{k}</button>)}<button className="f" onClick={()=>onKey('del')}>⌫<span className="kl"> 刪除</span></button><button className="x" onClick={()=>onKey('clr')}>清除</button></div>);
function GuestPick({g,setG,pad,slim}){
  const[res,setRes]=useState([]);const[qs,setQs]=useState('');const d=gDigits(g);const anon=!!g.anon;
  useEffect(()=>{if(d.length<3){setRes([]);setQs('');return;}let dead=false;setRes(gcSearch(d));setQs('loading');
    const t=setTimeout(async()=>{try{const r=await api('cnGuest',{q:d},true);if(dead)return;if(r&&r.ok){gcMerge((r.list||[]).map(x=>Object.assign({lastAt:Date.now()},x)));gcSave();setRes(gcSearch(d));setQs('ok');}else setQs('err');}catch(_e){if(!dead)setQs('err');}},350);
    return()=>{dead=true;clearTimeout(t);};},[d]);
  const B=({on,children,onClick})=>(<button onClick={onClick} className={'rounded-xl border px-4 py-2 text-base font-bold '+(on?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-200')}>{children}</button>);
  const full=d.length>=8;const list=res;
  const pick=m=>setG(Object.assign({},g,{phone:m.phone,sur:m.sur,giv:'',title:m.title||g.title,src:g.src||m.src||''}));
  const IN="rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white";
  const setP=v=>setG(Object.assign({},g,{phone:v},v.replace(/[^0-9]/g,'')!==d?{sur:'',giv:''}:{}));
  const key=k=>setP(k==='del'?d.slice(0,-1):k==='clr'?'':(d+k).slice(0,15));
  const setSrc=t=>setG(Object.assign({},g,{src:g.src===t?'':t},t!=='現場'||g.src==='現場'?{anon:false}:{}));
  return(<div className="rounded-xl border border-gray-700 p-3 space-y-2 tb-gp">{!slim&&<p className="text-xs text-gray-400">客人(客源必選{anon?'':'、稱謂必選'})</p>}
    {!slim&&<div className="flex gap-2 items-center flex-wrap"><span className="text-sm text-gray-300 w-12">客源</span>{SRCS.map(t=><B key={t} on={g.src===t} onClick={()=>setSrc(t)}>{t}</B>)}
      {g.src==='現場'&&<button onClick={()=>setG(Object.assign({},g,{anon:!anon,phone:'',sur:'',giv:''}))} className={'tb-tg'+(anon?' on':'')}><i></i>不留個資</button>}</div>}
    {!slim&&<div className="flex gap-2 items-center flex-wrap"><span className="text-sm text-gray-300 w-12">外國人</span>{NATS.map(n=><B key={n} on={g.fnat===n} onClick={()=>setG(Object.assign({},g,{fnat:g.fnat===n?'':n}))}>{n}</B>)}</div>}
    {anon?(<React.Fragment><div className="flex gap-2 items-center flex-wrap"><span className="text-sm text-gray-300 w-12">性別</span>{TITLES.map(t=><B key={t} on={g.title===t} onClick={()=>setG(Object.assign({},g,{title:g.title===t?'':t}))}>{t==='先生'?'先生(男)':'小姐(女)'}</B>)}<span className="text-xs text-gray-500">可不選</span></div>
      <p className="text-xs text-emerald-300 rounded-lg px-2 py-1" style={{background:'#e8f7ef'}}>現場客不留個資:不需手機與姓,單上顯示「現場客{g.title?'・'+g.title:''}{g.fnat?'('+g.fnat+')':''}」,不會寫入客人資料。</p></React.Fragment>)
    :(<React.Fragment>
    {pad&&<Keypad onKey={key}/>}
    <div className="flex gap-2 items-center"><input value={g.phone||''} onChange={e=>setP(e.target.value)} inputMode={pad?'none':'tel'} readOnly={!!pad} placeholder="客人手機(末 3 碼可查;可略)" className={'flex-1 min-w-0 '+IN+(pad?' tb-ph':'')}/>
      {full&&<input value={g.sur||''} onChange={e=>setG(Object.assign({},g,{sur:e.target.value}))} maxLength={4} placeholder="姓" className={'w-20 '+IN}/>}
      <select value={g.title||''} onChange={e=>setG(Object.assign({},g,{title:e.target.value}))} className={IN+' tb-sel'}><option value="">稱謂</option>{TITLES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
    {d.length>=3&&qs==='loading'&&list.length===0&&<p className="text-xs text-gray-400">查詢中…</p>}
    {d.length>=3&&qs==='err'&&list.length===0&&<p className="text-xs text-amber-300">網路不通且本機沒有符合的客人,可直接輸入完整手機與姓,視為新建檔</p>}
    {list.length>0&&<div className="space-y-1"><p className="text-xs text-gray-400">搜尋結果(點選帶入姓、稱謂)</p>{list.slice(0,pad?3:20).map(m=>{const on=m.phone===d&&m.sur===String(g.sur||'').trim();return(<button key={m.phone+m.sur} onClick={()=>pick(m)} className={'w-full text-left rounded-xl border px-3 py-2 text-sm '+(on?'border-violet-500 bg-violet-950 text-white':'border-gray-700 text-gray-200')}><b>{gDisp({gname:m.sur,title:m.title,phone:m.phone})}</b>{m.src?<span className="text-xs text-gray-400">　{m.src}</span>:null}</button>);})}</div>}
    {(qs==='ok')&&list.length===0&&d.length>=3&&(full?<p className="text-xs text-emerald-300">查無此客人,將新建檔(請填姓)</p>:<p className="text-xs text-amber-300">查無符合;新客人請輸入完整手機號碼</p>)}
    {d.length>=3&&!full&&<p className="text-xs text-gray-500">手機不足 8 碼:請點選符合的客人,或輸入完整號碼</p>}
    </React.Fragment>)}
  </div>);
}
// 勞點預約衝突檢查:老師目前服務(含帶位中)做到預約時間之後、或與他其他預約的服務時間重疊,都不能預約;回傳原因文字,沒有衝突回傳 ''
const itemDur=(it,at)=>{const c0=it&&baseCode(it);const code=c0==='pkg3'||c0==='pkg2'?pkgCodes(it).foot:c0;const c=code&&itemCalc(code,(it&&it.extra)||0,at||0);return c?c.total*MIN:70*MIN;};
function bkConflict(D,code,at,it,exceptId){
  if(!code||!(at>0))return '';const dur=itemDur(it,at);
  const p=(D.red||[]).find(x=>x.code===code);
  if(p&&p.redEnd>at)return code+' 號目前服務到 '+hmFull(p.redEnd)+','+hmFull(at)+' 還沒做完';
  const o=(D.bookings||[]).find(b=>b.code===code&&b.id!==exceptId&&b.at<at+dur&&at<b.at+itemDur(b.it,b.at));
  if(o)return code+' 號 '+hmFull(o.at)+' 已有勞點預約,時間重疊';
  return '';
}
const guestTxt=o=>[gDisp(o),o.src].filter(Boolean).join('・');
const newItem=()=>({kind:'pkg',base:3,n:1,extra:0,oil:false,gender:'',nation:'',teacher:''});
function ArrangeSheet({init,ginit,D,now,onDone,onBook,onClose,inline,pad}){
  const[items,setItems]=useState(init&&init.length?init:[newItem()]);const[g,setG]=useState(ginit||G0());
  const today=bday(now);const[date,setDate]=useState(today);const[tm,setTm]=useState('');const[dayT,setDayT]=useState(null);
  useEffect(()=>{if(date===today){setDayT(null);return;}let dead=false;setDayT('loading');
    api('cnDay',{date:date},true).then(r=>{if(!dead)setDayT(r&&r.ok?r.teachers:'err');}).catch(()=>{if(!dead)setDayT('err');});return()=>{dead=true;};},[date]);
  const known=[].concat(D.white,D.gray,D.red,D.off,D.leave).map(p=>({code:p.code,gender:p.gender,onHour:p.onHour||0,offHour:p.offHour||0})).sort((a,b)=>(parseInt(a.code,10)||0)-(parseInt(b.code,10)||0));
  const dayList=Array.isArray(dayT)?dayT:known; // 查不到當天資料(離線)時,用本機已知的老師名單
  const t0=items[0]&&String(items[0].teacher||'').trim();
  const tBk=t0?(D.bookings||[]).filter(b=>b.code===t0&&bday(b.at)===date):[];
  const base3=Date.parse(date+'T03:00:00+08:00'); // 營業日從 03:00 起,到隔天 02:30 的每 30 分
  const slotMs=x=>{const mm=(parseInt(x.slice(0,2),10)*60+parseInt(x.slice(3),10)-180+1440)%1440;return base3+mm*60000;};
  const tInfo=t0?dayList.find(t=>t.code===t0):null;
  const inShift=x=>{if(!tInfo||!tInfo.onHour||!tInfo.offHour)return true;const h=parseInt(x.slice(0,2),10)+parseInt(x.slice(3),10)/60,on=tInfo.onHour,off=tInfo.offHour;return on<off?(h>=on&&h<off):(h>=on||h<off);}; // 只能約表定上牌~下牌時段
  const slots=Array.from({length:48},(_,k)=>{const m=(180+k*30)%1440;return p2(Math.floor(m/60))+':'+(m%60?'30':'00');}).filter(x=>inShift(x)&&slotMs(x)>now);
  useEffect(()=>{if(slots.length&&slots.indexOf(tm)<0)setTm(slots[0]);else if(!slots.length&&tm)setTm('');},[t0,date,slots.join()]);
  const atMs=tm?slotMs(tm):0;
  const cflt=t0?bkConflict(D,t0,atMs,items[0]):'';
  const bkOk=!!t0&&guestOk(g)&&gDigits(g).length>=8&&!!String(g.sur||'').trim()&&atMs>now&&!cflt;
  const days=[0,1,2].map(i=>bday(now+i*86400e3));
  const set=(i,o)=>setItems(a=>a.map((x,j)=>j===i?Object.assign({},x,o):x));
  const Chip=({on,children,onClick})=>(<button onClick={onClick} className={'rounded-xl border px-3 py-2 text-sm font-bold '+(on?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-200')}>{children}</button>);
  const wrap=ch=>inline?(<div className="tb-arrf">{ch}</div>):(<Sheet title="安排客人" onClose={onClose}>{ch}</Sheet>);
  const G=(c,ch)=>inline?<div className={c}>{ch}</div>:<React.Fragment>{ch}</React.Fragment>;
  return wrap(<React.Fragment>
    {G('tb-ac1',<React.Fragment>
    <div className="flex gap-2 items-center flex-wrap"><span className="text-sm text-gray-300">日期</span>{days.map((d,i)=>(<button key={d} onClick={()=>setDate(d)} className={'rounded-xl border px-3 py-2 text-sm font-bold '+(date===d?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-200')}>{['今天','明天','後天'][i]}</button>))}
      <input type="date" value={date} min={today} onChange={e=>{if(e.target.value&&e.target.value>=today)setDate(e.target.value);}} className="rounded-xl bg-gray-800 border border-gray-700 px-2 py-2 text-white text-sm"/></div>
    {date!==today&&<p className="text-xs text-amber-300">非今天:不排位置,只能替指定老師建立「勞點預約」(下方選老師與時間)</p>}
    <GuestPick g={g} setG={setG} pad={pad}/>
    </React.Fragment>)}
    {G('tb-ac2',<React.Fragment>
    <p className="text-xs text-gray-400 tb-hint">問客人:要做什麼、做多久、幾個人(套餐先做腳或身體由推薦決定)</p>
    {items.map((it,i)=>(<div key={i} className="rounded-xl border border-gray-700 p-3 space-y-2">
      {(!inline||items.length>1)&&<div className="flex items-center justify-between"><span className="text-base font-bold text-violet-200">{String.fromCharCode(65+i)}</span>{i>0&&<button onClick={()=>setItems(a=>a.filter((_,j)=>j!==i))} className="text-xs text-red-300">移除</button>}</div>}
      <div className="flex gap-2">{['foot','body','pkg'].map(k=><Chip key={k} on={it.kind===k} onClick={()=>set(i,{kind:k,base:MINS[k][MINS[k].length-1][0]>3?3:(MINS[k].some(m=>m[0]===it.base)?it.base:MINS[k][0][0]),oil:k==='foot'?false:it.oil})}>{KIND_T[k]}</Chip>)}</div>
      <div className="flex gap-2 flex-wrap">{MINS[it.kind].map(m=><Chip key={m[0]} on={it.base===m[0]} onClick={()=>set(i,{base:m[0]})}>{m[1]} 分</Chip>)}</div>
      <div className="flex items-center gap-3"><span className="text-sm text-gray-300 whitespace-nowrap">人數</span><button onClick={()=>set(i,{n:Math.max(1,it.n-1)})} className="w-9 h-9 rounded-lg border border-gray-600 text-white">−</button><span className="text-white font-bold w-5 text-center">{it.n}</span><button onClick={()=>set(i,{n:Math.min(4,it.n+1)})} className="w-9 h-9 rounded-lg border border-gray-600 text-white">+</button>
        <span className="text-sm text-gray-300 ml-3 whitespace-nowrap">加時</span><button onClick={()=>set(i,{extra:Math.max(0,it.extra-1)})} className="w-9 h-9 rounded-lg border border-gray-600 text-white">−</button><span className="text-white font-bold w-5 text-center">{it.extra}</span><button onClick={()=>set(i,{extra:Math.min(6,it.extra+1)})} className="w-9 h-9 rounded-lg border border-gray-600 text-white">+</button></div>
      <div className="flex gap-2 flex-wrap">{it.kind!=='foot'&&<Chip on={it.oil} onClick={()=>set(i,{oil:!it.oil,gender:!it.oil?'F':it.gender,base:(!it.oil&&it.kind==='body'&&it.base===1)?2:it.base})}>油壓</Chip>}
        <Chip on={it.gender==='F'} onClick={()=>set(i,{gender:it.gender==='F'?'':'F'})}>指女</Chip><Chip on={it.gender==='M'} disabled={it.oil} onClick={()=>{if(!it.oil)set(i,{gender:it.gender==='M'?'':'M'});}}>指男</Chip>
        <Chip on={it.nation==='TW'} onClick={()=>set(i,{nation:it.nation==='TW'?'':'TW'})}>指台</Chip><Chip on={it.nation==='VN'} onClick={()=>set(i,{nation:it.nation==='VN'?'':'VN'})}>指越</Chip></div>
      <input value={it.teacher||''} onChange={e=>set(i,{teacher:e.target.value.replace(/[^0-9a-zA-Z]/g,'').slice(0,4),n:e.target.value?1:it.n})} placeholder="指定老師號碼(勞點,可略)" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm"/>
      {i===0&&date!==today&&dayT==='loading'&&<p className="text-xs text-gray-400">讀取當天老師…</p>}
      {i===0&&date!==today&&dayList.length>0&&<div className="flex flex-wrap gap-1.5">{dayList.map(t=>(<button key={t.code} onClick={()=>set(0,{teacher:t.code,n:1})} className={'rounded-lg border px-2.5 py-1 text-sm font-bold '+(String(it.teacher||'')===t.code?'bg-violet-600 border-violet-600 text-white':'border-gray-600 '+(t.gender==='F'?'text-rose-300':'text-gray-200'))}>{t.code}</button>))}</div>}
      {i===0&&date!==today&&dayT==='err'&&<p className="text-xs text-amber-300">讀不到當天排班,以下為本機已知的老師(不保證當天有上班)</p>}
      {i===0&&t0&&(tBk.length>0?<p className="text-xs text-amber-300">⚠ {t0} 號 {date===today?'今天':date.slice(5)}已有勞點預約:{tBk.map(b=>hmFull(b.at)+' '+((b.sur||'')+(b.giv||'')+(b.title||'')||'客人')).join('、')}</p>:<p className="text-xs text-gray-400">{t0} 號 {date===today?'今天':date.slice(5)}目前沒有勞點預約</p>)}
    </div>))}
    {items.length<4&&<Bt tone="gray" onClick={()=>setItems(a=>a.concat([newItem()]))}>＋項目(不同項目)</Bt>}
    {t0&&<div className="rounded-xl border border-amber-500 p-3 space-y-2"><p className="text-sm font-bold text-amber-300">勞點預約 {t0} 號</p>
      <div className="flex items-center gap-2"><span className="text-sm text-gray-300">時間</span>{tInfo&&tInfo.onHour&&tInfo.offHour&&<span className="text-xs text-gray-400">表定 {p2(tInfo.onHour%24)}:00~{p2(tInfo.offHour%24)}:00</span>}<select value={tm} onChange={e=>setTm(e.target.value)} className="flex-1 rounded-xl bg-gray-800 border border-gray-700 px-2 py-2 text-white">{slots.map(x=>{const bad=bkConflict(D,t0,slotMs(x),items[0]);return <option key={x} value={x}>{x}{bad?'(老師忙)':''}</option>;})}</select></div>
      {cflt&&<p className="text-xs text-red-300">⚠ {cflt}</p>}
      <Bt tone="green" disabled={!bkOk} onClick={()=>onBook(Object.assign({},items[0],{n:1}),g,atMs)}>{bkOk?'建立勞點預約 '+dkey(atMs).slice(5)+' '+tm:(!tm?'此老師沒有可預約的時段(表定 '+(tInfo&&tInfo.onHour?p2(tInfo.onHour%24)+':00~'+p2(tInfo.offHour%24)+':00':'—')+')':atMs<=now?'預約時間已過':cflt?'此時間老師無法接':'預約需要完整手機、姓、稱謂與客源')}</Bt></div>}
    </React.Fragment>)}
    {G('tb-ac3',<React.Fragment>
    {date===today?<Bt disabled={!guestOk(g)} onClick={()=>onDone(items,g)}>{guestOk(g)?'排客人 → 看推薦':(g.src&&(g.title||g.anon)?'手機需完整號碼並填姓':'請先選客源與稱謂(或選不留個資)')}</Bt>:null}<Bt tone="gray" onClick={onClose}>取消</Bt></React.Fragment>)}</React.Fragment>);
}
const RuleTag=({r})=>(<span className="text-[10px] rounded px-1.5 py-0.5 bg-indigo-900 text-indigo-200">{r}</span>);

// ── 勞點預約清單(R5.11、R5.17):今天與之後 14 天 ──
const itemLabel=x=>String((x&&x.item)||'?').replace('pkg3','套餐120').replace('pkg2','套餐70');
function BookList({D,now,onArrive,onCancel}){
  const today=bday(now);const B=(D.bookings||[]).filter(b=>bday(b.at)===today).sort((a,b)=>a.at-b.at);if(!B.length)return null;
  return(<CSec title="今天預約(勞點)" right={B.length+' 筆'}>{B.map(b=>{const late=b.at<now-10*MIN;const isT=bday(b.at)===today;
    return(<div key={b.id} className="cn-bk"><div style={{minWidth:52}}><div className="tm" style={{color:late?'#b91c1c':'#1b1f2a'}}>{hmFull(b.at)}</div><div style={{fontSize:11,color:'#6b7280'}}>{isT?(late?'已過 '+Math.round((now-b.at)/MIN)+' 分':'今天'):b.at?dkey(b.at).slice(5):''}</div></div>
      <span className="tc">{b.code}</span>
      <div style={{flex:1,minWidth:0}}><div style={{fontSize:14,fontWeight:700,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{gDisp({gname:b.sur||'',title:b.title,phone:b.phone})||'客人'}</div><div style={{fontSize:12,color:'#5b6270'}}>{itemLabel(b)}{b.src?' · '+b.src:''}{b.phone?' · …'+String(b.phone).slice(-3):''}</div></div>
      {isT&&<button className="bt p" onClick={()=>onArrive(b)}>到場</button>}<CBtn className="bt" onYes={()=>onCancel(b)}>取消</CBtn></div>);})}</CSec>);
}
// ── 客滿候位(R9.16):登記手機與姓(名可略),之後的客人排在後面 ──
const itemsText=its=>(its||[]).map((x,i)=>String.fromCharCode(65+i)+' '+(baseCode(x)||'?').replace('pkg3','套餐120').replace('pkg2','套餐70')+(x.extra?'+'+x.extra:'')+(x.n>1?'×'+x.n:'')+(x.oil?' 油壓':'')+(x.gender==='F'?' 指女':x.gender==='M'?' 指男':'')+(x.teacher?' 指'+x.teacher+'號':'')+(x.nation==='TW'?' 指台':x.nation==='VN'?' 指越':'')).join('、');
function WaitSheet({req,guest,onDone,onClose}){
  const gg=guest||G0();const[phone,setPhone]=useState(gDigits(gg));const[sur,setSur]=useState(gg.sur||'');const[giv,setGiv]=useState(gg.giv||'');
  const ok=phone.replace(/[^0-9]/g,'').length>=8&&sur.trim();
  return(<Sheet title="登記候位" onClose={onClose}>
    <p className="text-sm text-gray-300">客滿、現場客要等:登記後排在候位順序,之後來的客人排在這一組後面。</p>
    <p className="text-sm text-violet-200">{itemsText(req)}</p>
    <input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" placeholder="手機號碼(必填)" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/>
    <div className="flex gap-2"><input value={sur} onChange={e=>setSur(e.target.value)} maxLength={4} placeholder="姓(必填)" className="w-28 rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/><input value={giv} onChange={e=>setGiv(e.target.value)} maxLength={8} placeholder="名(可略)" className="flex-1 rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/></div>
    <Bt disabled={!ok} onClick={()=>onDone({phone:phone,name:sur.trim()+giv.trim(),sur:sur.trim(),giv:giv.trim()})}>登記候位</Bt><Bt tone="gray" onClick={onClose}>取消</Bt></Sheet>);
}
// 候位清單:依登記順序;預估開始時間=前面候位的客人先占用後,這組最快何時能開始
function WaitList({D,now,onPick}){
  const W=D.waits||[];if(!W.length)return null;
  const q=Math.floor(now/30000)*30000;
  return(<Card className="space-y-2"><div className="flex items-center justify-between"><p className="text-sm font-bold text-white">⏳ 候位 {W.length} 組</p><span className="text-xs text-gray-400">依登記順序</span></div>
    {W.map((w,i)=>{let est='';try{const R=window.__cnRec.recommend(D,q,w.items,{ahead:W.slice(0,i).map(x=>x.items)});if(R.plans[0]){const st=R.plans[0].start;est=st<=q+60000?'現在可開始':'約 '+hmFull(st)+'('+Math.round((st-q)/60000)+' 分後)';}else est=R.error||'';}catch(_e){}
      return(<button key={w.id} onClick={()=>onPick(w)} className="w-full text-left rounded-xl border border-gray-700 px-3 py-2"><div className="flex items-center gap-2"><span className="text-lg font-bold text-amber-300">{i+1}</span><span className="text-white font-bold">{gDisp({gname:w.sur||w.name,title:w.title,phone:w.phone})}</span>{w.src&&<span className="text-[10px] rounded px-1.5 py-0.5 bg-gray-700 text-gray-200">{w.src}</span>}<span className="flex-1"></span><span className="text-xs text-emerald-300">{est}</span></div><p className="text-xs text-gray-300">{itemsText(w.items)}　登記 {hmFull(w.createdAt)}</p></button>);})}
  </Card>);
}
function WaitEntrySheet({w,idx,act,onSeat,onClose}){
  return(<Sheet title={'候位 '+(idx+1)+'　'+w.name} onClose={onClose}>
    <Info k="稱謂" v={(w.title||'—')}/><Info k="客源" v={w.src||'—'}/><Info k="手機" v={<a href={'tel:'+w.phone} className="text-violet-300 underline">{w.phone}</a>}/><Info k="項目" v={itemsText(w.items)}/><Info k="登記時間" v={hmFull(w.createdAt)}/>
    <Bt onClick={()=>onSeat(w)}>安排(帶入推薦)</Bt><CBt tone="red" onYes={()=>act({act:'wdone',wid:w.id,status:'cancel'})}>取消候位</CBt><Bt tone="gray" onClick={onClose}>關閉</Bt></Sheet>);
}
// 推薦區塊(主畫面最上方)
function RecBlock({D,now,req,bid,ahead,onClear,onEdit,adopt,onReserve,guest,pad,onShow}){
  const[pg,setPg]=useState(1);const[gx,setGx]=useState(null);const[wait,setWait0]=useState(0);const setWait=m=>{setWait0(m);setPg(1);};const[pi,setPi]=useState(0);const[useAlt,setUseAlt]=useState(false);const[together,setTogether]=useState(true);
  const q5=Math.floor(now/30000)*30000; // 每 30 秒重算
  const R=window.__cnRec.recommend(D,q5,req,Object.assign({ahead:ahead||[],bid:bid||''},wait?{minStart:q5+wait*MIN}:{}));
  const _bs=R.error?null:R.plans[Math.min(pi,R.plans.length-1)];const _pl=_bs?((useAlt&&_bs.alt)?_bs.alt:_bs):null;
  const _non=!!onReserve&&!!_pl&&(R.full||_pl.items.some(r=>r.wait>0));
  const hlKey=JSON.stringify(_pl&&!_non?[].concat(...(_pl.items.map(r=>r.people.map(q=>({t:q.teacher,p1:q.pos1,p2:q.pos2}))))):[]);
  useEffect(()=>{if(onShow)onShow(JSON.parse(hlKey));},[hlKey]); // 把目前選的方案位置回報給位置圖標示
  if(R.error)return(<div className="rounded-2xl border border-red-500 bg-red-950 p-3 space-y-2"><p className="text-sm text-red-200 font-bold">排客人後的推薦</p><p className="text-sm text-red-200">{R.error}</p><div className="flex gap-2"><button onClick={onEdit} className="text-xs underline text-red-200">修改</button><button onClick={onClear} className="text-xs underline text-red-200">清除</button></div></div>);
  const plans=R.plans;const base=plans[Math.min(pi,plans.length-1)];const pl=(useAlt&&base.alt)?base.alt:base;
  const nonImm=!!onReserve&&(R.full||pl.items.some(r=>r.wait>0)); // 非立即=預約壓白牌(不指定號碼),改登記候位(R5.29)
  const nW=pl.items.reduce((a,r)=>a+r.n,0);const gg0=guest||G0();
  const hasG=!gg0.anon&&gDigits(gg0).length>=8&&!!String(gg0.sur||'').trim();
  const rsv=g=>{onReserve({phone:gDigits(g),name:String(g.sur||'').trim(),sur:String(g.sur||'').trim(),title:g.title||'',src:g.src||''});};
  const gxOk=gx&&gDigits(gx).length>=8&&gDigits(gx).length<=15&&!!String(gx.sur||'').trim();
  const Dots=({n})=><div className="cn-dots">{[1,2].map(i=><i key={i} className={i===n?'on':''}></i>)}</div>;
  const M=seatMap(D);const posNow=x=>!M[x];
  const ready=pl.items.every(r=>r.people.every(p=>p.white&&posNow(p.pos1)));
  const doAdopt=(pre)=>{const ops=[];pl.items.forEach(r=>r.people.forEach(p=>{ops.push({act:'red',code:p.teacher,item:r.realCode+(r.extra?'+'+r.extra:''),pos:p.pos1,pos2:(p.pos2&&posNow(p.pos2))?p.pos2:'',start:p.start,end:p.end,transfer:p.transfer});}));adopt(ops,pre);};
  if(nonImm&&pg===2&&gx)return(<div className="rounded-2xl border border-violet-500 bg-indigo-950 p-3 space-y-3">
    <div className="flex items-center justify-between"><p className="text-base font-bold text-white">補聯絡資料</p><span className="text-xs text-indigo-200">{req.length} 項・{nW} 位</span></div>
    <p className="text-sm font-bold text-amber-300">稍候 10 分鐘以上:預約壓 {nW} 張白牌,要留手機+姓</p>
    <GuestPick g={gx} setG={setGx} pad={pad} slim/>
    <Dots n={2}/>
    <div className="flex gap-2"><button onClick={()=>setPg(1)} className="rounded-xl border border-gray-500 text-gray-200 px-4 py-2.5 font-bold">← 上一步</button><button disabled={!gxOk} onClick={()=>rsv(gx)} className={'flex-1 rounded-xl py-2.5 font-bold text-white '+(gxOk?'bg-violet-600':'bg-gray-700 opacity-50')}>確認 · 預約壓牌</button></div>
  </div>);
  return(<div className="rounded-2xl border border-violet-500 bg-indigo-950 p-3 space-y-3">
    <div className="flex items-center justify-between"><p className="text-base font-bold text-white">排客人後的推薦</p><span className="text-xs text-indigo-200">{req.length} 項・{req.reduce((a,x)=>a+x.n,0)} 位</span></div>
    {(ahead||[]).length>0&&<p className="text-sm font-bold text-amber-300">前面候位 {(ahead||[]).length} 組,已先壓 {(ahead||[]).reduce((a,g)=>a+(g||[]).reduce((b,x)=>b+(x.n||1),0),0)} 張白牌(不指定號碼,R5.29)</p>}
    {R.full&&<p className="text-sm font-bold text-red-300">客滿!最快 {PL(R.soon.pos)} {hmFull(R.soon.at)} 空出</p>}
    {!R.full&&D.white.filter(p=>p.state==='white').length===0&&<p className="text-sm font-bold text-amber-300">老師全在紅牌區(或休息中)</p>}
    {plans.length>1&&<div className="flex gap-2">{plans.map((p,i)=>(<button key={i} onClick={()=>{setPi(i);setUseAlt(false);}} className={'rounded-xl border px-3 py-1.5 text-sm font-bold '+(i===pi?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-200')}>{p.label}</button>))}</div>}
    {pl.items.map(r=>(<div key={r.label} className="rounded-xl bg-black/30 p-2 space-y-1">
      <div className="flex items-center gap-2 flex-wrap"><span className="text-violet-200 font-bold">{r.label}</span><span className="text-white font-bold text-lg" style={{fontFamily:'monospace'}}>{r.code}</span><span className="text-xs text-gray-300">{r.n} 位</span><span className={'text-xs font-bold '+(r.wait>0?'text-amber-300':'text-emerald-300')}>{r.wait>0?'稍候 '+r.wait+' 分':'現在開始'}</span>{r.rules.concat(pl.rules||[]).filter((x,i,a)=>a.indexOf(x)===i).map(x=><RuleTag key={x} r={x}/>)}</div>
      {nonImm?<p className="text-sm font-bold" style={{color:'#4c1d95'}}>壓 {r.n} 張白牌　<span className="text-xs font-normal text-gray-300">不指定號碼,到時依出牌順序派</span></p>:r.people.map((p,i)=>(<p key={i} className="text-sm text-gray-100">
        <b className={p.white?'text-white':'text-amber-300'}>{p.teacher}</b>{p.teacher2?<span className="text-rose-300"> → {p.teacher2}</span>:null}{p.white?'':'(紅牌)'}　{PL(p.pos1)}{p.pos2?' → 轉場 '+PL(p.pos2):''}　{hmFull(p.start)}{p.transfer?'　轉'+hm(p.transfer):''}　{hm(p.end)}到</p>))}
      {!nonImm&&r.notes.map((n,i)=><p key={i} className="text-xs text-amber-200">・{n}</p>)}</div>))}
    {R.femaleWait&&R.femaleWait.length>0&&<p className="text-xs text-rose-200">白牌沒有女老師;紅牌女老師:{R.femaleWait.slice(0,4).map(x=>x.code+'(約 '+x.wait+' 分)').join('、')}　可先請客人稍候,或改非指定(R9.6)</p>}
    <div className="flex items-center gap-2 flex-wrap"><span className="text-xs text-indigo-200">稍候</span>{[0,10,20,30].map(m=><button key={m} onClick={()=>setWait(m)} className={'rounded-lg border px-3 py-1 text-sm '+(wait===m?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-200')}>{m?m+' 分':'不等'}</button>)}</div>
    {base.alt&&<button onClick={()=>setUseAlt(!useAlt)} className="text-xs rounded-lg border border-indigo-400 text-indigo-200 px-3 py-1">{useAlt?'← 回到推薦':'換成:'+base.alt.label}</button>}
    {nonImm&&!hasG&&<Dots n={1}/>}
    {!nonImm&&!ready&&<p className="text-xs text-gray-400">老師或位置尚未空出,空出後再按「採用」(推薦會隨時間更新)</p>}
    {nonImm?<div className="flex gap-2"><button onClick={()=>{if(hasG)rsv(gg0);else{setGx(Object.assign({},G0(),gg0,{anon:false,src:gg0.src||'現場',phone:'',sur:'',giv:''}));setPg(2);}}} className="flex-1 rounded-xl py-2.5 font-bold text-white bg-violet-600">{hasG?'預約壓牌(登記候位)':'下一步:補聯絡資料 →'}</button><button onClick={onEdit} className="rounded-xl border border-gray-500 text-gray-200 px-3">修改</button><button onClick={onClear} className="rounded-xl border border-gray-500 text-gray-200 px-3">清除</button></div>
    :<div className="flex gap-2"><button disabled={!ready} onClick={()=>doAdopt(false)} className={'flex-1 rounded-xl py-2.5 font-bold text-white '+(ready?'bg-violet-600':'bg-gray-700 opacity-50')}>採用(開單)</button><button disabled={!ready} onClick={()=>doAdopt(true)} className={'rounded-xl px-3 font-bold text-white '+(ready?'bg-emerald-600':'bg-gray-700 opacity-50')}>先付</button><button onClick={onEdit} className="rounded-xl border border-gray-500 text-gray-200 px-3">修改</button><button onClick={onClear} className="rounded-xl border border-gray-500 text-gray-200 px-3">清除</button></div>}
  </div>);
}

// 紅牌/位置的操作面板:轉場、口訣調節、回牌
function RedPanel({p,D,now,go,onClose}){
  const[pick,setPick]=useState(false);
  const M=seatMap(D);const second=itemCalc(p.redItem.replace(/\+\d+$/,''),0,0);
  const needType=second&&second.second?(isFoot(p.redPos)?'bed':'foot'):'';
  const frees=(needType==='foot'?FEET:needType==='bed'?BEDS:FEET.concat(BEDS)).filter(x=>!M[x]||(M[x].p===p&&M[x].kind==='rsv')).sort((a,b)=>(b===p.redPos2)-(a===p.redPos2));
  const pending=p.redTransfer>0;
  return(<div className="space-y-2">
    <Info k="項目" v={p.redItem||'—'}/><Info k="位置" v={PL(p.redPos)+(p.redPos2?' → '+PL(p.redPos2):'')}/>
    <Info k="開始" v={p.redStart?hmFull(p.redStart):'—'}/>{pending&&<Info k="轉場時間" v={hmFull(p.redTransfer)}/>}{pending&&<Info k="轉場剩餘" v={cdTxt(p.redTransfer-now)}/>}<Info k="預計結束" v={p.redEnd?hmFull(p.redEnd):'—'}/>
    {pending&&(pick?(<div className="space-y-2"><p className="text-sm text-gray-300">轉到哪個位置?</p><div className="flex flex-wrap gap-2">{frees.map(x=><button key={x} onClick={()=>go('move',{pos2:x})} className={'rounded-lg border px-3 py-2 '+(x===p.redPos2?'border-violet-400 bg-violet-600 text-white font-bold':'border-violet-500 text-violet-200')}>{PL(x)}{x===p.redPos2?'(建議)':''}</button>)}{frees.length===0&&<span className="text-xs text-gray-400">目前沒有空位可立即轉</span>}</div>{soonSeats(p,M,needType).length>0&&<div className="space-y-1"><p className="text-xs text-gray-400">預定(目前有人,轉場前會空出;先預定、時間到再按轉場)</p><div className="flex flex-wrap gap-2">{soonSeats(p,M,needType).map(x=><button key={x} onClick={()=>{go('replan',{pos2:x});setPick(false);}} className="rounded-lg border-2 border-dashed border-violet-500 px-3 py-2 text-violet-200">{PL(x)}<SoonLbl M={M} x={x} p={p} now={now}/></button>)}</div></div>}<Bt tone="gray" onClick={()=>setPick(false)}>返回</Bt></div>)
      :(<React.Fragment><Bt onClick={()=>setPick(true)}>{p.redPos2?'轉場(建議 '+PL(p.redPos2)+',可改選)':'轉場(選位置)'}</Bt>
        <div><p className="text-xs text-gray-400 mb-1">調節口訣(客滿時)</p><div className="flex gap-2">{['11','滿包','40','80'].map(c=><button key={c} onClick={()=>{const r=callCode(p,c);if(r)go('adjust',r);}} className="flex-1 rounded-lg border border-gray-600 text-gray-100 py-2">{c}</button>)}</div></div></React.Fragment>))}
    {!pick&&<React.Fragment><Bt onClick={()=>go('back',{})}>回牌(排到白牌最後)</Bt><ZhunBt p={p} now={now} go={go}/><CBt tone="red" onYes={()=>go('off',{})}>下牌</CBt></React.Fragment>}
  </div>);
}
// 開單(手動選位置;系統推薦待 P3,R9)
function OpenSheet({D,now,presetPos,act,onClose}){
  const[item,setItem]=useState('');const[extra,setExtra]=useState(0);const[start,setStart]=useState(now);const[endAdj,setEndAdj]=useState(0);
  const[code,setCode]=useState('');const[pos,setPos]=useState(presetPos||'');const[pos2,setPos2]=useState('');const[g,setG]=useState(G0());
  const c=item?itemCalc(item,extra,start):null;
  const M=seatMap(D);
  const grid=[];{const t0=Math.ceil((now+8*3600e3)/600000)*600000-8*3600e3;for(let i=0;i<=12;i++)grid.push(t0+i*600000);}
  const end=c?c.end+endAdj*MIN:0;
  const teachers=D.white.filter(p=>p.state==='white'&&(!c||!c.oil||p.gender==='F'));
  const need=c?c.first:'';const freeFor=t=>(t==='foot'?FEET:t==='bed'?BEDS:[]).filter(x=>!M[x]);
  const posOk=pos&&(!need||(need==='foot')===isFoot(pos));
  const ready=c&&code&&posOk&&!M[pos]&&guestOk(g);
  useEffect(()=>{if(c&&code&&!teachers.some(p=>p.code===code))setCode('');},[item]);
  const Chip=({on,children,onClick})=>(<button onClick={onClick} className={'rounded-xl border px-3 py-2 text-base font-bold '+(on?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-200')}>{children}</button>);
  return(<Sheet title="＋ 開單" onClose={onClose}>
    <GuestPick g={g} setG={setG}/>
    {ITEM_GROUPS.map(g=>(<div key={g[0]}><p className="text-xs text-gray-400 mb-1">{g[0]}</p><div className="flex flex-wrap gap-2">{g[1].map(k=><Chip key={k} on={item===k} onClick={()=>{setItem(k);setPos2('');if(pos&&((itemCalc(k,0,0).first==='foot')!==isFoot(pos)))setPos('');}}>{k}</Chip>)}</div></div>))}
    <div className="flex items-center gap-3"><span className="text-sm text-gray-300">加時(每 30 分 1 支)</span><button onClick={()=>setExtra(Math.max(0,extra-1))} className="w-9 h-9 rounded-lg border border-gray-600 text-white">−</button><span className="text-white font-bold w-6 text-center">{extra}</span><button onClick={()=>setExtra(Math.min(6,extra+1))} className="w-9 h-9 rounded-lg border border-gray-600 text-white">+</button></div>
    <div className="grid grid-cols-2 gap-2"><div><p className="text-xs text-gray-400 mb-1">開始於</p><select value={start} onChange={e=>setStart(parseInt(e.target.value,10))} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-2 py-2 text-white"><option value={now}>現在 {hmFull(now)}</option>{grid.filter(x=>x>now+60000).map(x=><option key={x} value={x}>{hmOpt(x)}</option>)}</select></div>
      <div><p className="text-xs text-gray-400 mb-1">應結束於</p><select value={endAdj} onChange={e=>setEndAdj(parseInt(e.target.value,10))} disabled={!c} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-2 py-2 text-white">{[-30,-20,-10,0,10,20,30,60].map(m=><option key={m} value={m}>{c?hmFull(c.end+m*MIN)+(m?(m>0?' (+'+m+')':' ('+m+')'):' (自動)'):'—'}</option>)}</select></div></div>
    {c&&c.transfer>0&&<p className="text-sm text-amber-300">轉場 {hmFull(c.transfer)}(第一段 {c.segs[0][1]} 分)・{c.second==='foot'?'再轉腳位':'再轉床位'}</p>}
    <div><p className="text-xs text-gray-400 mb-1">老師(白牌順序{c&&c.oil?',油壓只能女老師':''})</p>
      {teachers.length===0?<p className="text-sm text-red-300">目前沒有可派的白牌老師</p>:<div className="space-y-1">{teachers.map((p,i)=>(<button key={p.code} onClick={()=>setCode(p.code)} className={'w-full text-left rounded-xl border px-3 py-2 flex items-center gap-3 '+(code===p.code?'border-violet-500 bg-violet-950':'border-gray-700')}><span className={'text-xl font-bold '+(p.gender==='F'?'text-rose-300':'text-white')}>{p.code}</span><span className="text-sm text-gray-300">白牌第 {i+1} 位・{p.gender==='F'?'女':'男'}{p.onAt?'・'+hm(p.onAt)+' 上牌':''}</span></button>))}</div>}</div>
    <div><p className="text-xs text-gray-400 mb-1">位置{need?(need==='foot'?'(腳位)':'(床位)'):''}</p><div className="flex flex-wrap gap-2">{(need?freeFor(need):FEET.concat(BEDS).filter(x=>!M[x])).map(x=><Chip key={x} on={pos===x} onClick={()=>{setPos(x);if(pos2===x)setPos2('');}}>{PL(x)}</Chip>)}</div></div>
    {c&&c.second&&<div><p className="text-xs text-gray-400 mb-1">轉場後位置(可稍後再選)</p><div className="flex flex-wrap gap-2"><Chip on={!pos2} onClick={()=>setPos2('')}>稍後選</Chip>{freeFor(c.second).filter(x=>x!==pos).map(x=><Chip key={x} on={pos2===x} onClick={()=>setPos2(x)}>{PL(x)}</Chip>)}</div></div>}
    <Bt disabled={!ready} onClick={()=>act(Object.assign({act:'red',code:code,item:c.label,pos:pos,pos2:pos2,start:start,end:end,transfer:c.transfer},gFields(g)))}>{ready?'確認開單 '+c.label+'　老師 '+code+'　位置 '+pos:'請選稱謂、客源、項目、老師、位置'}</Bt>
    <Bt disabled={!ready} tone="green" onClick={()=>act(Object.assign({act:'red',code:code,item:c.label,pos:pos,pos2:pos2,start:start,end:end,transfer:c.transfer},gFields(g),{gid:rid()}),true)}>先付(開單後立刻收款)</Bt>
    <Bt tone="gray" onClick={onClose}>取消</Bt></Sheet>);
}

function ZhunBt({p,now,go}){const on=zhunOn(p,now);
  return(<div className="space-y-1">{on&&<p className="text-sm text-amber-300">已喊准下:只能接 {p.offHour%24===0?'24:00':p2(p.offHour%24)+':00'} 前做得完的客人</p>}
    {p.offHour>0?<Bt tone="gray" onClick={()=>{{const dz=()=>go('zhun',{on:on?'0':'1'});if(on)dz();else cnAsk(p.code+' 號喊准下?\n之後只接下牌時間('+p2(p.offHour%24)+':00)前做得完的客人',dz);}}}>{on?'取消准下':'准下(老師要下班)'}</Bt>:<p className="text-xs text-gray-500">此老師沒有設定下牌時間,無法使用准下</p>}</div>);}
function PlateSheet({p,D,now,act,onClose}){
  const[mode,setMode]=useState('');const[item,setItem]=useState('');const[pos,setPos]=useState('');
  const st=p.state;const off=p.offHour?(p2(p.offHour%24)+':00'):'—';const on=p.onHour?(p2(p.onHour%24)+':00'):'不固定';
  const go=(a,extra)=>act(Object.assign({act:a,code:p.code},extra||{}));
  const title=p.code+' 號'+(p.gender==='F'?' ♀':'')+({white:'　白牌',green:'　綠牌(休息)',gray:'　未上牌',red:'　做事中',off:'　下牌',leave:'　請假'}[st]||'');
  let body=null;
  const onInfo=(<React.Fragment>{p.onBy&&<Info k="上牌操作人" v={p.onBy}/>}{p.onNote&&<p className="text-sm text-amber-300">⚠ {p.onNote}</p>}</React.Fragment>);
  if(st==='white')body=mode==='red'?(<div className="space-y-2">
      <input value={item} onChange={e=>setItem(e.target.value)} placeholder="項目(選填,例 bf3)" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/>
      <input value={pos} onChange={e=>setPos(e.target.value)} placeholder="位置(選填,例 8)" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/>
      <Bt onClick={()=>go('red',{item:item,pos:pos})}>轉紅牌(開始做事)</Bt><Bt tone="gray" onClick={()=>setMode('')}>返回</Bt></div>)
    :(<div className="space-y-2"><Info k="上牌時間" v={p.onAt?hmFull(p.onAt):'—'}/>{onInfo}{p.bk&&<p className="text-sm font-bold text-amber-300">勞點預約 {hmFull(p.bk.at)}　{((p.bk.sur||'')+(p.bk.giv||'')+(p.bk.title||''))||'客人'}　{itemLabel(p.bk)}</p>}<Info k="預計下牌時間" v={off}/>
      <Bt onClick={()=>setMode('red')}>派工(轉紅牌)</Bt><Bt tone="green" onClick={()=>go('green')}>翻綠(休息/吃飯)</Bt><ZhunBt p={p} now={now} go={go}/><CBt tone="red" onYes={()=>go('off')}>下牌</CBt></div>);
  else if(st==='green'){const g=greenInfo(p,now);const segs=(p.greenSegs||[]);
    body=(<div className="space-y-2">{onInfo}
      <table className="w-full text-sm"><thead><tr className="text-gray-400 text-xs"><th className="text-left font-normal py-1">段</th><th className="text-left font-normal">起</th><th className="text-left font-normal">迄</th><th className="text-left font-normal">耗時</th></tr></thead><tbody>
        {segs.map((s,i)=>(<tr key={i} className="border-t border-gray-800 text-gray-100"><td className="py-1">{i+1}</td><td>{hmFull(s[0])}</td><td>{hmFull(s[1])}</td><td>{dur(Math.round((s[1]-s[0])/1000))}</td></tr>))}
        <tr className="border-t border-gray-800 text-gray-100"><td className="py-1">{segs.length+1}</td><td>{hmFull(p.greenStart)}</td><td>進行中</td><td>{dur(g.cur)}</td></tr></tbody></table>
      {g.noLimit?<p className="text-sm font-bold text-emerald-400">累計 {dur(g.used)}　主管職翻綠不限時</p>:<p className={'text-sm font-bold '+(g.over?'text-red-400':'text-emerald-400')}>累計 {dur(g.used)}／{LIMIT/60} 分　{g.over?'已於 '+hmFull(g.overAt)+' 到時,超時 '+dur(-g.left):'剩 '+dur(g.left)}</p>}
      <Bt onClick={()=>go('back')}>回牌(翻回白牌)</Bt><CBt tone="red" onYes={()=>go('off')}>下牌</CBt></div>);}
  else if(st==='gray'){const late=isLate(p,now);const base=Math.max(now,p.due);
    const opts=[['+30 分',base+30*60000],['+1 小時',base+3600e3],['+2 小時',base+7200e3],['下個半點 '+hm(nextMark(now,30)),nextMark(now,30)],['下個整點 '+hm(nextMark(now,60)),nextMark(now,60)]];
    body=mode==='late'?(<div className="space-y-2"><p className="text-sm text-gray-300">晚到到幾點?(預設 +30 分)</p>
        {opts.map((o,i)=>(<Bt key={i} tone={i===0?'':'gray'} onClick={()=>go('late',{to:o[1]})}>{o[0]}　→ {hm(o[1])}</Bt>))}<Bt tone="gray" onClick={()=>setMode('')}>返回</Bt></div>)
      :(<div className="space-y-2"><Info k="上牌時間" v={hmFull(p.due)}/><Info k="預計下牌時間" v={off}/>
        {late&&<p className="text-sm font-bold text-red-400">已過上牌時間,未到未電</p>}
        {p.lateTo&&<p className="text-sm text-amber-300">{p.lateKind==='after'?'未到晚到':'晚到'} {hmFull(p.lateTo)}</p>}
        <Bt onClick={()=>{const early=Math.round((p.due-now)/60000);if(early>40){cnAsk(p.code+' 號應到 '+hmFull(p.due)+',現在比應到時間早 '+early+' 分鐘。\n確定要上牌嗎?(會記錄「提前上牌」與操作人)',()=>go('on'));return;}go('on');}}>上牌(已到場)</Bt><Bt tone="gray" onClick={()=>setMode('late')}>晚到</Bt><CBt tone="red" onYes={()=>go('leave')}>臨時請假</CBt></div>);}
  else if(st==='red')body=(<RedPanel p={p} D={D} now={now} go={go} onClose={onClose}/>);
  else if(st==='off')body=(<div className="space-y-2"><Info k="上牌時間" v={on}/><Info k="預計下牌時間" v={off}/>
      <Bt onClick={()=>go('on')}>上牌</Bt><CBt tone="red" onYes={()=>go('leave')}>請假</CBt></div>);
  else if(st==='leave')body=(<div className="space-y-2"><Info k="類別" v={p.leaveKind==='temp'?'臨時請假':'預排休假'}/>
      {p.leaveKind==='temp'&&<Bt tone="gray" onClick={()=>go('unleave')}>取消請假</Bt>}<Bt onClick={()=>go('on')}>上牌(今天有來)</Bt></div>);
  return(<Sheet title={title} onClose={onClose}>{body}</Sheet>);
}

// ── 本機暫存與背景上傳 ──
// 操作先寫進本機(立即反映在畫面),每 10 秒(及離開頁面時)用 cnBatch 背景送出,伺服器回最新牌況後,再把還沒送出的操作疊上去顯示。
const QK='cn2:queue:v1';
const lsGet=()=>{try{const a=JSON.parse(localStorage.getItem(QK)||'[]');return Array.isArray(a)?a.filter(o=>o&&o.id&&Date.now()-o.ts<72*3600e3):[];}catch(_e){return [];}};
const lsSet=q=>{try{localStorage.setItem(QK,JSON.stringify(q));}catch(_e){}};
// ── 本機暫存:先出框架、先用本機資料,背景更新;客人檔(手機)也下載到本機 ──
const KK='mp:kiosk:v1',KOP='mp:kiosk:op',KOPS='mp:kiosk:ops',DK='cn2:day:v1',SK='cn2:srv:v1',GK='cn2:guests:v1',WK='cn2:who:v1';
const lsJ=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(_e){return d;}};
const lsW=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(_e){}};
let GC=null;
const gcLoad=()=>{if(!GC){GC=lsJ(GK,{at:0,syncAt:0,list:[]});if(!GC||!Array.isArray(GC.list))GC={at:0,syncAt:0,list:[]};}return GC;};
const gcSave=()=>lsW(GK,GC);
const gcKey=g=>g.phone+'|'+g.sur;
function gcMerge(list){const c=gcLoad();const m={};c.list.forEach(x=>{m[gcKey(x)]=x;});
  (list||[]).forEach(x=>{if(!x||!x.phone||!x.sur)return;const o=m[gcKey(x)];if(!o||(x.lastAt||0)>=(o.lastAt||0))m[gcKey(x)]=Object.assign({},o||{},{phone:x.phone,sur:x.sur,giv:x.giv||'',title:x.title||(o&&o.title)||'',src:x.src||(o&&o.src)||'',lastAt:x.lastAt||Date.now()});});
  c.list=Object.keys(m).map(k=>m[k]);}
// 手機全碼或末 3 碼以上(數字)查本機客人檔,最近使用在前,最多 8 筆
function gcSearch(q){const d=String(q||'').replace(/[^0-9]/g,'');if(d.length<3)return [];
  return gcLoad().list.filter(x=>x.phone.length>=d.length&&x.phone.slice(-d.length)===d).sort((a,b)=>(b.lastAt||0)-(a.lastAt||0)).slice(0,8);}
async function gcSync(force){const c=gcLoad();if(!force&&Date.now()-(c.syncAt||0)<5*60000)return;
  try{const r=await api('cnGuests',{since:c.at||0},true);if(r&&r.ok){gcMerge(r.list||[]);c.at=r.now||Date.now();c.syncAt=Date.now();gcSave();}}catch(_e){}}
const dkey=ms=>new Date(ms+8*3600e3).toISOString().slice(0,10);
const bday=ms=>dkey(ms-3*3600e3); // 營業日:03:00~隔天 02:59 算同一天(凌晨 3 點結帳)
const rid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function cloneLedger(L){L=L||{};return {shifts:(L.shifts||[]).map(x=>Object.assign({},x)),exps:(L.exps||[]).map(x=>Object.assign({},x)),prevPetty:L.prevPetty||0};}
function cloneData(S){const c=l=>(l||[]).map(x=>Object.assign({},x));return Object.assign({},S,{bookings:(S.bookings||[]).map(x=>Object.assign({},x)),orders:(S.orders||[]).map(x=>Object.assign({},x)),waits:(S.waits||[]).map(x=>Object.assign({},x)),ledger:cloneLedger(S.ledger),white:c(S.white),gray:c(S.gray),red:c(S.red),off:c(S.off),leave:c(S.leave)});}
function applyOp(D,o){
  if(o.act==='exp_add'){const a=Math.round(Number(o.amount));if(a>0&&!D.ledger.exps.some(x=>x.id===o.id))D.ledger.exps.push({id:o.id,at:o.ts,by:o.by||'',amount:a,note:String(o.note||'').slice(0,40),bday:bday(o.ts)});return;}
  if(o.act==='exp_del'){D.ledger.exps=D.ledger.exps.filter(x=>x.id!==o.eid);return;}
  if(o.act==='shift'){if(!D.ledger.shifts.some(x=>x.id===o.id))D.ledger.shifts.push({id:o.id,kind:o.kind==='close'?'close':'shift',at:o.ts,by:o.by||'',bday:bday(o.ts),since:Number(o.since)||0,petty:Number(o.petty)||0,cash:Number(o.cash)||0,expense:Number(o.expense)||0,expNote:String(o.expNote||'').slice(0,60),expected:Number(o.expected)||0,actual:(o.actual===''||o.actual==null)?null:Number(o.actual),unpaid:Number(o.unpaid)||0});return;}
  if(o.act==='wadd'){if(!D.waits.some(x=>x.id===o.id)&&o.phone&&o.name)D.waits.push({id:o.id,phone:String(o.phone).replace(/[^0-9+]/g,''),name:o.name,sur:o.sur||'',title:o.title||'',src:o.src||'',items:o.items||[],createdAt:o.ts});return;}
  if(o.act==='bk_add'){if(!D.bookings.some(x=>x.id===o.id)&&o.code&&o.at){let it=null;try{it=typeof o.it==='string'?JSON.parse(o.it):o.it;}catch(_e){}D.bookings.push({id:o.id,code:o.code,at:o.at,it:it,item:o.item||'',title:o.title||'',sur:o.sur||'',giv:o.giv||'',phone:o.phone||'',src:o.src||'',createdBy:o.by||''});D.bookings.sort((a,b)=>a.at-b.at);}return;}
  if(o.act==='bk_cancel'){D.bookings=D.bookings.filter(x=>x.id!==o.wid);return;}
  if(o.act==='wdone'){D.waits=D.waits.filter(x=>x.id!==o.wid);return;}
  if(o.act==='dadan'){D.orders.forEach(od=>{if((od.id===o.wid||od.gid===o.wid)&&od.status==='seating'){ // 以打單時間為服務開始,轉場/結束時間平移
      const sh=o.ts-(od.start||o.ts);const mv=v=>v>0?v+sh:v;const pl=D.red.find(x=>x.code===od.code);
      od.status='serving';od.ordAt=o.ts;od.ordBy=o.by||'';od.start=o.ts;od.end=mv(od.end);od.transfer=mv(od.transfer);
      if(pl){pl.redStart=o.ts;pl.redEnd=mv(pl.redEnd);pl.redTransfer=mv(pl.redTransfer);}}});return;}
  if(o.act==='pay'){let pm={};try{pm=JSON.parse(o.prices||'{}')||{};}catch(_e){}let first=true;
    D.orders.forEach(od=>{if((od.id===o.wid||od.gid===o.wid)&&od.status==='wait_pay'){od.status='done';od.paidAt=o.ts;od.paidBy=o.by||'';od.price=Math.round(Number(pm[od.id])||0);if(first){first=false;od.payInfo=JSON.stringify(payCalc(Object.keys(pm).filter(k=>D.orders.some(z=>z.id===k)).reduce((a,k)=>a+Math.round(Number(pm[k])||0),0),o.method,o.t400,o.t200));}}});return;}
  if(o.act==='prepay'){let pm={};try{pm=JSON.parse(o.prices||'{}')||{};}catch(_e){}let first=true;
    D.orders.forEach(od=>{if((od.id===o.wid||od.gid===o.wid)&&(od.status==='seating'||od.status==='serving')&&!od.prepaid){od.prepaid='1';od.paidAt=o.ts;od.paidBy=o.by||'';od.price=Math.round(Number(pm[od.id])||0);if(first){first=false;od.payInfo=JSON.stringify(payCalc(Object.keys(pm).filter(k=>D.orders.some(z=>z.id===k)).reduce((a,k)=>a+Math.round(Number(pm[k])||0),0),o.method,o.t400,o.t200));}}});return;}
  if(o.act==='extend'){const pl=D.red.find(x=>x.code===o.code);if(pl&&pl.redEnd){const n=Math.max(1,Math.min(4,parseInt(o.n,10)||1));const m=/^(.*?)(?:\+(\d+))?$/.exec(pl.redItem||'');pl.redEnd+=n*30*MIN;pl.redItem=m[1]+'+'+((parseInt(m[2],10)||0)+n);const od=D.orders.find(x=>x.code===o.code&&(x.status==='serving'||x.status==='seating'));if(od){od.end=pl.redEnd;od.item=pl.redItem;}}return;}
  const serving=c=>D.orders.find(x=>x.code===c&&(x.status==='serving'||x.status==='seating'));const finish=c=>{const od=serving(c);if(od){od.status=od.prepaid?'done':'wait_pay';od.doneAt=o.ts;od.doneBy=o.by||'';}}; // 已先付的做完直接已完成
  const lists=['white','gray','red','off','leave'];let p=null;
  for(const k of lists){const i=D[k].findIndex(x=>x.code===o.code);if(i>=0){p=D[k][i];D[k].splice(i,1);break;}}
  if(!p)return;
  const st=p.state,ts=o.ts;const back=()=>{D[({white:'white',green:'white',gray:'gray',red:'red',off:'off',leave:'leave'})[p.state]].push(p);};
  const maxSeq=Math.max(0,...D.white.map(x=>x.seq||0));
  const closeG=()=>{const sec=Math.max(0,Math.round((ts-p.greenStart)/1000));p.greenUsed=(p.greenUsed||0)+sec;p.greenSegs=(p.greenSegs||[]).concat([[p.greenStart,ts]]);};
  const inP=st==='white'||st==='red'||st==='green';
  if(o.act==='on'&&!inP){p.state='white';p.seq=Math.max(ts,maxSeq+1);p.onAt=ts;p.onBy=o.by||'';p.onNote=(p.due&&p.due-ts>40*MIN)?'提前'+Math.round((p.due-ts)/MIN)+'分上牌(應到 '+hmFull(p.due)+')':'';delete p.lateTo;delete p.lateKind;delete p.due;}
  else if(o.act==='back'&&st==='red'){finish(p.code);p.state='white';p.seq=Math.max(ts,maxSeq+1);p.redPos='';p.redPos2='';p.redTransfer=0;}
  else if(o.act==='back'&&st==='green'){closeG();p.state='white';}
  else if(o.act==='red'&&st==='white'){if(o.bid)D.bookings=D.bookings.filter(x=>x.id!==o.bid);p.state='red';p.redItem=o.item||'';p.redPos=o.pos||'';p.redPos2=o.pos2||'';p.redStart=(o.start>=ts-2*3600e3&&o.start<=ts+3*3600e3)?o.start:ts;p.redEnd=parseInt(o.end,10)||0;p.redTransfer=parseInt(o.transfer,10)||0;D.orders.push({id:o.id,code:p.code,item:p.redItem,pos0:p.redPos,pos:p.redPos,start:p.redStart,start0:p.redStart,end:p.redEnd,transfer:p.redTransfer,createdAt:o.ts,status:'seating',doneAt:0,paidAt:0,openBy:o.by||'',paidBy:'',title:o.title||'',src:o.src||'',gname:o.gname||'',phone:o.phone||'',gid:o.gid||o.id,ordAt:0,ordBy:''});}
  else if(o.act==='move'&&st==='red'){const q=o.pos2||p.redPos2;if(q){p.redPos=q;p.redPos2='';p.redTransfer=0;const od=serving(p.code);if(od){od.pos=q;od.transfer=0;od.movedAt=o.ts;}}}
  else if(o.act==='adjust'&&st==='red'){if(o.transfer!==undefined)p.redTransfer=parseInt(o.transfer,10)||0;if(o.end!==undefined)p.redEnd=parseInt(o.end,10)||0;const od=serving(p.code);if(od){od.transfer=p.redTransfer;od.end=p.redEnd;}}
  else if(o.act==='green'&&st==='white'){p.state='green';p.greenStart=ts;}
  else if(o.act==='late'&&st==='gray'){p.lateTo=o.to;p.lateKind=(p.due&&ts>p.due)?'after':'late';}
  else if(o.act==='leave'&&!inP){p.state='leave';p.leaveKind='temp';delete p.lateTo;}
  else if(o.act==='unleave'&&st==='leave'){p.state='off';}
  else if(o.act==='zhun'&&inP){p.zhun=o.on==='1'?ts:0;}
  else if(o.act==='off'&&(inP||st==='gray'||st==='leave')){if(st==='green')closeG();if(st==='red')finish(p.code);p.state='off';p.redPos='';p.redPos2='';p.redTransfer=0;p.zhun=0;}
  const k={white:'white',green:'white',gray:'gray',red:'red',off:'off',leave:'leave'}[p.state];D[k].push(p);
}
function applyAll(S,q){
  const D=cloneData(S);q.forEach(o=>applyOp(D,o));
  D.white.sort((a,b)=>(a.seq||0)-(b.seq||0)||(a.onAt||0)-(b.onAt||0));D.red.sort((a,b)=>(a.redStart||0)-(b.redStart||0));
  D.gray.sort((a,b)=>((a.lateTo||a.due)-(b.lateTo||b.due))||(a.due-b.due)||(parseInt(a.code,10)||0)-(parseInt(b.code,10)||0));
  const byCode=(a,b)=>(parseInt(a.code,10)||0)-(parseInt(b.code,10)||0);D.off.sort(byCode);D.leave.sort(byCode);
  return D;
}

// ── 支數表 / 日報表 / 交班 / 結帳 ──
// 支數:代碼數字=支數,加時 +n 再加 n 支(R8.2、R8.5);只算已完成做事的(待買單、已完成),服務中與帶位中不算
const itemCnt=item=>{const m=/^[a-z]+(\d+)(?:\+(\d+))?$/.exec(String(item||''));return m?(parseInt(m[1],10)||0)+(parseInt(m[2],10)||0):0;};
function cntTable(orders){const M={};(orders||[]).forEach(o=>{if(o.status!=='wait_pay'&&o.status!=='done')return;const r=M[o.code]=M[o.code]||{code:o.code,cnt:0,n:0,items:[]};r.cnt+=itemCnt(o.item);r.n++;r.items.push(o.item);});
  return Object.keys(M).map(k=>M[k]).sort((a,b)=>(parseInt(a.code,10)||0)-(parseInt(b.code,10)||0));}
// ── 本機計算:交班/結帳/支出/支數/今日日報全部用本機資料算(離線可用),操作進離線佇列,有網路再補送 ──
const lgDayStart=day=>Date.parse(day+'T03:00:00+08:00');
function lgPaid(orders,from,to){const out={cash:0,ticket:0,t400:0,t200:0,total:0,n:0};
  (orders||[]).forEach(x=>{if(!x.payInfo)return;const t=x.paidAt||0;if(!(t>from&&t<=to))return;let i=null;try{i=JSON.parse(x.payInfo);}catch(_e){}if(!i)return;
    out.cash+=Number(i.cash)||0;out.t400+=Number(i.t400)||0;out.t200+=Number(i.t200)||0;out.total+=Number(i.total)||0;out.n++;});
  out.ticket=out.t400*400+out.t200*200;return out;}
function lgUnpaid(orders){const g={};(orders||[]).forEach(x=>{if((x.status==='seating'||x.status==='serving'||x.status==='wait_pay')&&!x.prepaid)g[x.gid||x.id]=1;});return Object.keys(g).length;}
function lgInfo(L,orders,now,kind){
  const day=bday(now),ds=lgDayStart(day);L=L||{};
  const recs=(L.shifts||[]).filter(r=>r.bday===day).sort((a,b)=>a.at-b.at);const last=recs[recs.length-1]||null;
  const lastSh=recs.filter(r=>r.kind==='shift').slice(-1)[0]||null;
  const since=kind==='close'?ds-1:(last?last.at:ds-1);
  const expDay=recs.filter(r=>r.kind==='shift').reduce((a,r)=>a+(Number(r.expense)||0),0);
  const expBlock=(L.exps||[]).filter(e=>bday(e.at)===day&&e.at>(lastSh?lastSh.at:ds-1)).reduce((a,e)=>a+e.amount,0);
  return {ok:true,bday:day,kind:kind,since:since,now:now,paid:lgPaid(orders,since,now),petty:last?(Number(last.petty)||0):(L.prevPetty||0),expenseBefore:kind==='close'?expDay:0,expBlock:expBlock,unpaid:lgUnpaid(orders),closed:recs.some(r=>r.kind==='close'),records:recs};}
function lgReport(L,orders,now){
  const day=bday(now),ds=lgDayStart(day);L=L||{};
  const os=(orders||[]).filter(x=>x.status!=='void'&&bday(x.createdAt||0)===day).sort((a,b)=>a.createdAt-b.createdAt);
  const recs=(L.shifts||[]).filter(r=>r.bday===day).sort((a,b)=>a.at-b.at);
  const lastSh=recs.filter(r=>r.kind==='shift').slice(-1)[0]||null;
  const exps=(L.exps||[]).filter(e=>bday(e.at)===day).sort((a,b)=>a.at-b.at).map(e=>Object.assign({},e,{canDel:e.at>(lastSh?lastSh.at:ds-1)}));
  return {ok:true,local:true,date:day,today:day,orders:os,paid:lgPaid(orders,ds-1,ds+24*3600e3-1),records:recs,exps:exps,closed:recs.some(r=>r.kind==='close')};}
function useRpt(date){const[R,setR]=useState(null);const[err,setErr]=useState('');const[n,setN]=useState(0);
  useEffect(()=>{if(date==='__skip__')return;let dead=false;setR(null);setErr('');const ck='cn2:rpt:'+date;
    api('cnReport',date?{date:date}:{}).then(r=>{if(dead)return;if(r&&r.ok){setR(r);lsW(ck,r);}else{const c=lsJ(ck,null);if(c)setR(Object.assign({},c,{cached:true}));else setErr((r&&r.error)||'讀取失敗');}}).catch(()=>{if(dead)return;const c=lsJ(ck,null);if(c)setR(Object.assign({},c,{cached:true}));else setErr('離線中,這一天沒有存過本機資料');});return()=>{dead=true;};},[date,n]);
  return[R,err,()=>setN(n+1)];}
function CntTable({orders}){const T=cntTable(orders);const sum=T.reduce((a,x)=>a+x.cnt,0);
  return(<div className="space-y-1">{T.length===0?<p className="text-sm text-gray-500">還沒有完成做事的老師</p>:T.map(x=>(<div key={x.code} className="flex items-center gap-3 rounded-xl border border-gray-800 px-3 py-2"><b className="text-white text-lg w-14">{x.code}</b><span className="text-xs text-gray-400 flex-1">{x.items.join('、')}</span><span className="text-xs text-gray-400">{x.n} 單</span><b className="text-violet-300 text-lg w-14 text-right">{x.cnt} 支</b></div>))}
    <div className="flex justify-between text-sm pt-1"><span className="text-gray-400">合計 {T.length} 位老師</span><b className="text-white">{sum} 支</b></div></div>);}
function CountSheet({onClose,local}){const R=local(),err='',reload=()=>{};
  return(<Sheet title="支數表(現在)" onClose={onClose}><p className="text-xs text-gray-400">只算已完成做事的老師(待買單、已完成),服務中、帶位中不算。營業日 {R?R.date:'…'}</p>
    {R&&<CntTable orders={R.orders}/>}<Bt tone="gray" onClick={onClose}>關閉</Bt></Sheet>);}
function ReportSheet({onClose,local}){const[date,setDate]=useState('');const[tab,setTab]=useState('log');const lc=local();const isT=!date||date===lc.date;const[R2,err]=useRpt(isT?'__skip__':date);const R=isT?lc:R2;
  const G=R?groupOrders(R.orders).sort((a,b)=>a.createdAt-b.createdAt):[];const pd=R?R.paid:null;
  const Tb=({k,children})=>(<button onClick={()=>setTab(k)} className={'flex-1 py-2 text-sm font-bold rounded-lg '+(tab===k?'bg-violet-600 text-white':'text-gray-300 border border-gray-700')}>{children}</button>);
  const KN={shift:'交班',close:'結帳'};
  return(<Sheet title="日報表" onClose={onClose}>
    <div className="flex items-center gap-2"><input type="date" value={date||(R?R.date:'')} max={R?R.today:undefined} onChange={e=>setDate(e.target.value)} className="flex-1 rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/>{R&&<span className={'text-xs font-bold '+(R.closed?'text-emerald-400':'text-amber-300')}>{R.closed?'已結帳':'未結帳'}</span>}</div>
    <p className="text-[11px] text-gray-500">營業日 03:00 ~ 隔天 02:59。{isT?'今天的資料來自這台本機(離線也能看)。':(R&&R.cached?'離線中:顯示上次載入的資料。':'其他天需要連線讀取。')}</p>
    {err&&<p className="text-sm text-red-400">{err}</p>}{!R&&!err&&<p className="text-sm text-gray-500">讀取中…</p>}
    {R&&<React.Fragment>
      <div className="rounded-xl bg-black/30 p-3 space-y-1"><Info k="訂單" v={G.length+' 組'}/><Info k="收款合計" v={pd.total}/><Info k="現金" v={pd.cash}/><Info k="票券抵用" v={pd.ticket+(pd.t400||pd.t200?'(400×'+pd.t400+'、200×'+pd.t200+')':'')}/></div>
      <div className="flex gap-2"><Tb k="log">訂單流水</Tb><Tb k="cnt">支數表</Tb><Tb k="sh">交班結帳</Tb></div>
      {tab==='log'&&(G.length===0?<p className="text-sm text-gray-500">這天沒有訂單</p>:G.map(g=>(<div key={g.key} className="rounded-xl border border-gray-800 p-2 space-y-0.5"><div className="flex items-center gap-2 text-sm"><b className="text-violet-300">{g.no||'…'}</b><span className="text-gray-100 flex-1">{g.gnm||'客人未登記'}</span><span className="text-xs text-gray-400">{hmFull(g.createdAt)}</span><b className="text-white">{g.st==='done'?(g.pay?g.pay.total:g.paid):(g.prepaid?(g.pay?g.pay.total:g.paid):'未付')}</b></div>
        <p className="text-xs text-gray-300">{g.list.map(o=>o.code+'號 '+o.item+(o.status==='wait_pay'?'(待買單)':o.status==='seating'?'(帶位中)':o.status==='serving'?'(服務中)':'')).join('、')}</p>
        <p className="text-[11px] text-gray-500">{g.pay?payTxt(g.pay):''}{g.prepaid?' · 先付':''}{g.paidBy?' · '+g.paidBy:''}</p></div>)))}
      {tab==='cnt'&&<CntTable orders={R.orders}/>}
      {tab==='sh'&&(R.exps&&R.exps.length>0)&&<div className="rounded-xl border border-gray-800 p-2 space-y-0.5"><p className="text-sm font-bold text-white">支出登記 {R.exps.reduce((a,e)=>a+e.amount,0)}</p>{R.exps.map(e=><p key={e.id} className="text-xs text-gray-300">{hmFull(e.at)}　{e.amount}　{e.note||'—'}　{e.by}</p>)}</div>}
      {tab==='sh'&&(R.records.length===0?<p className="text-sm text-gray-500">這天沒有交班或結帳紀錄</p>:R.records.map(r=>(<div key={r.id} className="rounded-xl border border-gray-800 p-2 space-y-0.5"><div className="flex justify-between text-sm"><b className="text-white">{KN[r.kind]} {hmFull(r.at)}　{r.by}</b><b className="text-violet-300">應結 {r.expected}</b></div>
        <p className="text-xs text-gray-400">零用金 {r.petty} ＋ 現金 {r.cash} − 支出 {r.expense}{r.expNote?'('+r.expNote+')':''}{r.actual!==null?' · 實點 '+r.actual+'(差 '+(r.actual-r.expected)+')':''}</p></div>)))}
    </React.Fragment>}
    <Bt tone="gray" onClick={onClose}>關閉</Bt></Sheet>);}
// 支出費用(單獨一個區塊):登記今天(營業日)每一筆支出;交班/結帳的「應結現金」自動扣掉,日報表可看
function ExpBlock({L,now,act}){
  const[amt,setAmt]=useState('');const[note,setNote]=useState('');
  const day=bday(now),ds=lgDayStart(day);L=L||{};
  const lastSh=(L.shifts||[]).filter(r=>r.bday===day&&r.kind==='shift').sort((a,b)=>a.at-b.at).slice(-1)[0];const closed=(L.shifts||[]).some(r=>r.bday===day&&r.kind==='close');
  const list=(L.exps||[]).filter(e=>bday(e.at)===day).sort((a,b)=>a.at-b.at);const total=list.reduce((a,e)=>a+e.amount,0);
  const n=parseInt(String(amt).replace(/\D/g,''),10)||0;
  const add=()=>{if(n<=0||closed)return;act({act:'exp_add',amount:n,note:note});setAmt('');setNote('');};
  const del=e=>{if(!confirm('刪除這筆支出 '+e.amount+(e.note?'('+e.note+')':'')+'?'))return;act({act:'exp_del',eid:e.id});};
  return(<CSec title="支出費用" right={'今日 '+total}>
    {closed?<p className="text-sm text-amber-300">本日已結帳,不能再記支出。</p>:<div className="flex items-center gap-2"><input value={amt} inputMode="numeric" onChange={e=>setAmt(e.target.value.replace(/\D/g,'').slice(0,7))} placeholder="金額" style={{width:'30%'}} className="rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/><input value={note} maxLength={40} onChange={e=>setNote(e.target.value)} placeholder="說明(例:買衛生紙)" className="flex-1 min-w-0 rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/><button onClick={add} disabled={n<=0} className="cn-btn p" style={{opacity:n>0?1:.45,flex:'0 0 auto'}}>記一筆</button></div>}
    {list.length===0&&<p className="text-sm text-gray-500 py-1">今天還沒有支出</p>}
    {list.map(e=>(<div key={e.id} className="flex items-center gap-2 text-sm py-1 border-t border-gray-800"><span className="text-gray-400 w-12">{hmFull(e.at)}</span><b className="text-white w-16">{e.amount}</b><span className="flex-1 min-w-0 text-gray-300 truncate">{e.note||'—'}</span><span className="text-xs text-gray-500">{e.by}</span>{!closed&&e.at>(lastSh?lastSh.at:ds-1)&&<button onClick={()=>del(e)} className="text-xs text-red-400 underline">刪</button>}</div>))}
  </CSec>);
}
function ShiftSheet({kind,getInfo,onSubmit,onClose}){
  const close=kind==='close';const I=getInfo(kind);const[err,setErr]=useState('');const[petty,setPetty]=useState(()=>String(getInfo(kind).petty||0));const[exp,setExp]=useState('');const[note,setNote]=useState('');const[actual,setActual]=useState('');const[step,setStep]=useState(0);const[done,setDone]=useState(null);
  const num=v=>Math.max(0,parseInt(String(v).replace(/\D/g,''),10)||0);
  const cash=I.paid.cash;const expAll=num(exp)+I.expenseBefore+(I.expBlock||0);const expected=num(petty)+cash-expAll;
  const F=({l,v,set,ph})=>(<div className="flex items-center gap-2"><span className="text-sm text-gray-300 flex-1">{l}</span><input value={v} onChange={e=>set(e.target.value.replace(/[^0-9]/g,''))} inputMode="numeric" placeholder={ph||'0'} className="w-28 rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white text-right"/></div>);
  const submit=()=>{const J=getInfo(kind);if(J.closed){setErr('本日已結帳');return;}if(close&&J.unpaid>0){setErr('未付有 '+J.unpaid+' 筆,請先完成付款再結帳');setStep(0);return;}
    const ex=num(exp)+J.expenseBefore+(J.expBlock||0);const exd=num(petty)+J.paid.cash-ex;
    const op={act:'shift',kind:kind,petty:num(petty),cash:J.paid.cash,expense:ex,expNote:note,expected:exd,actual:actual===''?'':num(actual),since:J.since,unpaid:J.unpaid};
    onSubmit(op);setDone({expected:exd,petty:num(petty),cash:J.paid.cash,expense:ex,actual:actual===''?null:num(actual)});};
  const title=close?'結帳':'交班';
  if(done)return(<Sheet title={title+'完成'} onClose={onClose}><div className="rounded-xl bg-black/30 p-3 space-y-1"><Info k="應結現金" v={done.expected}/><Info k="零用金" v={done.petty}/><Info k="現金收款" v={done.cash}/><Info k="支出" v={done.expense}/>{done.actual!==null&&<Info k="實點現金" v={done.actual+'(差 '+(done.actual-done.expected)+')'}/>}</div>{close&&<p className="text-sm text-gray-300">本日已結帳。凌晨 3 點後自動進入下一個營業日。</p>}<p className="text-xs text-gray-500">已記在這台本機,有網路時自動上傳。</p><Bt onClick={onClose}>完成</Bt></Sheet>);
  return(<Sheet title={title+'　'+I.bday} onClose={onClose}>
    {err&&<p className="text-sm text-red-400">{err}</p>}
    {I.closed&&<p className="text-base text-amber-300 font-bold">本日已結帳</p>}
    {!I.closed&&(<React.Fragment>
      {close&&I.unpaid>0&&<p className="text-base text-red-300 font-bold">未付有 {I.unpaid} 筆,請先完成付款再結帳</p>}
      <p className="text-xs text-gray-400">{close?'全日':'本班(自上次交班 '+(I.since>0&&I.records.length?hmFull(I.since):'營業日開始')+' 起)'}現金收款 {I.paid.n} 筆</p>
      {step===0&&(<React.Fragment>
        <div className="space-y-2"><F l="零用金" v={petty} set={setPetty}/><F l={close?'今天再補的支出':'支出'} v={exp} set={setExp}/><div className="flex items-center gap-2"><span className="text-sm text-gray-300 w-20">支出說明</span><input value={note} maxLength={40} onChange={e=>setNote(e.target.value)} placeholder="例:買衛生紙" className="flex-1 rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/></div><F l="實點現金(選填)" v={actual} set={setActual} ph="不填"/></div>
        <div className="rounded-xl bg-black/30 p-3 space-y-1"><Info k="零用金" v={num(petty)}/><Info k={close?'全日現金收款':'本班現金收款'} v={cash}/>{I.paid.ticket>0&&<Info k="票券抵用(不算現金)" v={I.paid.ticket}/>}<Info k={'支出'+(I.expBlock?'(含登記 '+I.expBlock+')':'')} v={'− '+expAll}/><div className="flex justify-between text-base pt-1 border-t border-gray-700"><span className="text-gray-200 font-bold">應結現金</span><b className="text-violet-300 text-xl">{expected}</b></div>{actual!==''&&<p className={'text-sm '+(num(actual)===expected?'text-emerald-300':'text-amber-300')}>實點 {num(actual)}　差 {num(actual)-expected}</p>}</div>
        {close?<Bt disabled={I.unpaid>0} onClick={()=>setStep(1)}>下一步:確認收支</Bt>:<Bt onClick={submit}>確認交班</Bt>}</React.Fragment>)}
      {step===1&&(<React.Fragment><p className="text-lg text-amber-300 font-bold">請確認收支是否正確</p><div className="rounded-xl bg-black/30 p-3 space-y-1"><Info k="零用金" v={num(petty)}/><Info k="全日現金收款" v={cash}/><Info k="支出合計" v={expAll}/><Info k="應結現金" v={expected}/>{actual!==''&&<Info k="實點現金" v={num(actual)}/>}</div>
        <Bt onClick={submit}>收支正確,確認結帳</Bt><Bt tone="gray" onClick={()=>setStep(0)}>回去修改</Bt></React.Fragment>)}
    </React.Fragment>)}
    <Bt tone="gray" onClick={onClose}>關閉</Bt></Sheet>);}
// ── 主頁 ──
// ══════════ iPad 一屏版面(R6.30:固定一屏、牌區在最下方、安排分頁) ══════════
function useTablet(){
  const q='(min-width:700px) and (min-height:600px)';
  const get=()=>{try{return window.matchMedia(q).matches;}catch(_e){return false;}};
  const[m,setM]=useState(get);const[land,setLand]=useState(()=>window.innerWidth>window.innerHeight);
  useEffect(()=>{const f=()=>{setM(get());setLand(window.innerWidth>window.innerHeight);};window.addEventListener('resize',f);window.addEventListener('orientationchange',f);return()=>{window.removeEventListener('resize',f);window.removeEventListener('orientationchange',f);};},[]);
  return{tab:m,land:land};
}
function HRow({children}){
  const r=useRef(null);const[of,setOf]=useState(false);const[end,setEnd]=useState(false);
  const chk=()=>{const e=r.current;if(!e)return;setOf(e.scrollWidth>e.clientWidth+2);setEnd(e.scrollLeft+e.clientWidth>=e.scrollWidth-4);};
  useEffect(chk);
  return(<div className={'tb-rwv'+(of&&!end?' more':'')}><div className="tb-rw" ref={r} onScroll={chk}>{children}</div></div>);
}
function PlatesBar({D,now,hl,onPick,open,onToggle,lateN}){
  const mp=p=><Plate key={p.code} p={p} now={now} mini hl={hl&&hl[p.code]} onClick={()=>onPick(p.code)}/>;
  const late=D.gray.filter(p=>isLate(p,now)).map(p=>p.code);
  return(<div className="tb-pl">
    <div className="tb-lr"><div className="tb-lb"><b>白 {D.white.length}</b> + 灰 {D.gray.length}{late.length>0&&<em style={{color:'#b91c1c'}}>⚠ 未到未電 {late.length} 人</em>}<button className="tb-xb" onClick={onToggle}>{open?'收合 ▼':'展開 ▲'}</button></div>
      <HRow>{D.white.map(mp)}{D.white.length>0&&D.gray.some(p=>!isLate(p,now))&&<div className="tb-sep"></div>}{D.gray.filter(p=>!isLate(p,now)).map(mp)}</HRow></div>
    <div className="tb-lr"><div className="tb-lb" style={{color:'#b91c1c'}}><b>紅牌 {D.red.length}</b><em>做事中</em></div><HRow>{D.red.map(mp)}</HRow></div></div>);
}
function PlatesDetail({D,now,onPick,onClose}){
  const row=(p,cls,mid,right,rc)=>(<button key={p.code} onClick={()=>onPick(p.code)} className="tb-xr"><span className={'tb-xn '+cls}>{p.code}</span><span className="tb-xm">{mid}</span><span className="tb-xt" style={{color:rc||'#5b6270'}}>{right}</span></button>);
  const sx=p=>p.gender==='F'?'女':p.gender==='M'?'男':'';
  const wh=D.white.map((p,i)=>row(p,p.state==='green'?'g':'',<React.Fragment>{sx(p)}{p.state==='green'?' · 休息中':''}<small>{p.bk?'勞點 '+hm(p.bk.at):(p.onAt?'上牌 '+hm(p.onAt):'')}</small></React.Fragment>,'第 '+(i+1)+' 順位'));
  const rd=D.red.map(p=>row(p,'r',<React.Fragment>{p.redItem||''} · {PL(p.redPos)}{p.redPos2?' → '+PL(p.redPos2):''}<small>{sx(p)}{p.redTransfer>0?' 轉'+hm(p.redTransfer):''}</small></React.Fragment>,p.redEnd?hm(p.redEnd)+' 到':''));
  const gr=D.gray.map(p=>{const late=isLate(p,now);return row(p,'gy',<React.Fragment>{p.due?'應到 '+hm(p.due):'未排時間'}<small>{sx(p)}</small></React.Fragment>,late?'未到未電':'',late?'#b91c1c':'');});
  const of=D.off.map(p=>row(p,'gy','下牌','')),lv=D.leave.map(p=>row(p,'gy',p.leaveKind==='temp'?'臨時請假':'請假',''));
  return(<div className="tb-xp"><div className="tb-xh"><b>牌區詳細</b><span>白 {D.white.length} · 灰 {D.gray.length} · 紅 {D.red.length} · 下牌 {D.off.length} · 請假 {D.leave.length}</span><button className="tb-xb" style={{width:90,margin:0}} onClick={onClose}>收合 ▼</button></div>
    <div className="tb-xg"><div><h4>白牌 待派工(依順序)<em>{D.white.length}</em></h4>{wh.length?wh:<p className="tb-no">沒有</p>}</div>
      <div><h4>紅牌 做事中<em>{D.red.length}</em></h4>{rd.length?rd:<p className="tb-no">沒有</p>}</div>
      <div><h4>灰牌 未上牌<em>{D.gray.length}</em></h4>{gr.length?gr:<p className="tb-no">沒有</p>}<h4 style={{marginTop:8}}>下牌 · 請假<em>{D.off.length} · {D.leave.length}</em></h4>{of}{lv}{of.length+lv.length===0&&<p className="tb-no">沒有</p>}</div></div></div>);
}
function SeatMapT({D,now,onSeat,hl,tv}){
  const M=seatMap(D);const S=pos=><Seat key={pos} pos={pos} occ={M[pos]} now={now} h={0} hl={hl&&hl[pos]} tv={tv} onClick={()=>onSeat(pos)}/>;
  const free=a=>a.filter(x=>!M[x]).length;const G=({a})=>(<div className="tb-grp" style={{flex:a.length}}>{a.map(S)}</div>);
  const F1=['1','2','3','4','5','6'],F2=['7','8','9','10','11','12'],B2=['21','22','23'],B3a=['31','32','33'],B3b=['34','35','36'],B3c=['37','38','39','310','311'];
  const Fl=({t,r,children})=>(<div className="tb-fl"><div className="tb-ft"><b>{t}</b><span>{r}</span></div><div className="tb-cells">{children}</div></div>);
  return(<div className="tb-seatwrap">
    <Fl t="1F 腳位" r={'空 '+free(F1)}><G a={F1}/></Fl>
    <Fl t="2F 腳位 + 床" r={'空 '+free(F2.concat(B2))+''}><G a={F2}/><G a={B2}/></Fl>
    <Fl t="3F 床" r={'空 '+free(B3a.concat(B3b,B3c))}><G a={B3a}/><G a={B3b}/><G a={B3c}/></Fl></div>);
}
function CounterPage({who,kiosk,onSwitch,swLabel}){
  const c0=useRef(null);if(c0.current===null){const c=lsJ(SK,null);c0.current=(c&&c.srv&&c.at)?c:{};}
  const[server,setServer]=useState(c0.current.srv||null);const[fresh,setFresh]=useState(false);const[bid,setBid]=useState('');const[queue,setQueue]=useState(()=>lsGet());const[err,setErr]=useState('');const[notes,setNotes]=useState([]);
  const[open,setOpen]=useState(false);const[sel,setSel]=useState(null);const[ask,setAsk]=useState(null);useEffect(()=>{CNQ.fire=setAsk;return()=>{CNQ.fire=null;};},[]);const[opening,setOpening]=useState(null);const[arranging,setArranging]=useState(false);const[req,setReq]=useState(null);const[waitSheet,setWaitSheet]=useState(false);const[fromWait,setFromWait]=useState('');const[waitSel,setWaitSel]=useState(null);const[guest,setGuest]=useState(G0());const[ordSel,setOrdSel]=useState('');const[paySel,setPaySel]=useState('');const[preGid,setPreGid]=useState('');const[tool,setTool]=useState(()=>/[?&]unlock=1/.test(location.search)?'set':'');const[toolN,setToolN]=useState(0);
  const TB=useTablet();const[arrMode,setArrMode]=useState('');const[recHl,setRecHl]=useState(null);const[tv,setTv0]=useState(()=>{try{const o=JSON.parse(localStorage.getItem('cn2:tv')||'null');if(o&&typeof o==='object')return{t:!!o.t,e:!!o.e,r:!!o.r};}catch(e){}return{t:true,e:true,r:false};});const setTv=v=>{setTv0(v);try{localStorage.setItem('cn2:tv',JSON.stringify(v));}catch(e){}};const[tabSel,setTabSel]=useState('');const[plOpen,setPlOpen]=useState(false);const[more,setMore]=useState(false);
  useEffect(()=>{if(TB.tab&&req)setTabSel('arr');},[!!req]);
  useEffect(()=>{if(!TB.tab)return;const b=document.body,h=document.documentElement;const o=b.style.overflow,o2=h.style.overscrollBehavior;b.style.overflow='hidden';h.style.overscrollBehavior='none';return()=>{b.style.overflow=o;h.style.overscrollBehavior=o2;};},[TB.tab]);
  const[skew,setSkew]=useState(c0.current.skew||0);const[,setTick]=useState(0);const[syncAt,setSyncAt]=useState(0);const[syncing,setSyncing]=useState(false);
  const qR=useRef(queue);const flying=useRef(false);const dayRefH=useRef(null);if(dayRefH.current===null){const d=lsJ(DK,null);dayRefH.current={orders:(d&&d.orders)||{}};}const aoRef=useRef({});
  useEffect(()=>{if(!server)return;const m={};Object.keys(aoRef.current).forEach(k=>{const x=aoRef.current[k];if(Date.now()-(x.createdAt||0)<3*86400e3)m[k]=x;});dayRefH.current.orders=m;lsW(DK,{orders:m});},[server,queue]);
  const setQ=f=>{const n=typeof f==='function'?f(qR.current):f;qR.current=n;lsSet(n);setQueue(n);};
  const now=Date.now()+skew;
  const sync=async()=>{
    if(flying.current)return;flying.current=true;setSyncing(true);
    const sent=qR.current.slice(0,50);let more=false;
    try{
      const r=await api('cnBatch',{ops:JSON.stringify(sent)},true);
      if(r&&r.ok){
        const ids={};sent.forEach(o=>{ids[o.id]=1;});setQ(q=>q.filter(o=>!ids[o.id]));more=qR.current.length>0&&sent.length>=50;
        setServer(r);const sk=(r.now||Date.now())-Date.now();setSkew(sk);setSyncAt(Date.now());setErr('');setFresh(true);
        try{const c=Object.assign({},r);delete c.results;lsW(SK,{srv:c,skew:sk,at:Date.now()});}catch(_e){}
        if(r.opList)lsW(KOPS,r.opList);
        gcSync();
        const bad=(r.results||[]).filter(x=>!x.ok);if(bad.length)setNotes(bad.map(x=>(x.code?x.code+' 號:':'')+(x.error||'操作失敗')));
      }else setErr((r&&r.error)||'同步失敗,稍後自動重試');
    }catch(e){setErr('網路不通,操作已存在本機,稍後自動重試');}
    finally{flying.current=false;setSyncing(false);if(more)setTimeout(sync,50);}
  };
  useEffect(()=>{sync();const t=setInterval(()=>{if(!document.hidden)sync();},10000);const t2=setInterval(()=>setTick(x=>x+1),1000);
    const vis=()=>{sync();};document.addEventListener('visibilitychange',vis);window.addEventListener('pagehide',vis);
    return()=>{clearInterval(t);clearInterval(t2);document.removeEventListener('visibilitychange',vis);window.removeEventListener('pagehide',vis);};},[]);
  const doReset=async()=>{if(!confirm('還原牌況(測試用)?\n\n・已到上牌時間的老師直接上白牌\n・已過下牌時間的下牌\n・所有位置清空,進行中的訂單作廢\n・本機尚未上傳的操作會丟掉\n\n確定要還原嗎?'))return;
    try{const r=await api('cnReset',{});if(r&&r.ok){setQ([]);setServer(r);setNotes([]);setSel(null);setOrdSel('');setPaySel('');setPreGid('');setErr('');setFresh(true);alert('已還原:上牌 '+r.reset.on+' 位、下牌 '+r.reset.off+' 位、作廢訂單 '+r.reset.voided+' 筆');}else alert((r&&r.error)||'還原失敗');}catch(_e){alert('網路不通,無法還原');}};
  const act=(o)=>{const op=Object.assign({id:rid(),ts:Date.now()+skew,by:who},o);setQ(q=>q.concat([op]));setSel(null);
    if(op.phone&&op.sur&&String(op.phone).length>=8){gcMerge([{phone:String(op.phone).replace(/[^0-9]/g,''),sur:op.sur,giv:op.giv||'',title:op.title,src:op.src,lastAt:Date.now()}]);gcSave();}};
  if(!server){return(<div className="cn-light"><style>{CN_CSS}</style><div className="cn-wrap">
    <div className="cn-hd"><div><h1>主櫃</h1><div className="cn-tm"><span>{hmFull(Date.now())}</span><span className={'cn-sync'+(err?' w':'')}>{err?'● 連線失敗':'● 載入中…'}</span></div></div>
      <div className="cn-acts"><button disabled className="cn-btn" style={{opacity:.45}}>安排客人</button><button disabled className="cn-btn p" style={{opacity:.45}}>＋開單</button></div></div>
    <div className="cn-chips">{['待派工','服務中','已買單','已完成'].map(t=>(<div key={t} className="cn-chip"><b><i className="cn-sk" style={{width:22,height:20,display:'block'}}></i></b><span>{t}</span></div>))}</div>
    {err&&<div className="cn-alert" style={{borderColor:'#d99a06',background:'#fff6e0',color:'#92400e'}}>{err}　<button onClick={sync} style={{fontWeight:700,textDecoration:'underline'}}>重試</button></div>}
    <CSec first title="待派工" right=""><div className="cn-skrow">{[0,1,2,3,4,5].map(i=><i key={i} className="cn-sk" style={{width:50,height:60,borderRadius:10,flex:'0 0 auto'}}></i>)}</div></CSec>
    <CSec title="做事中" right=""><div className="cn-skrow">{[0,1,2].map(i=><i key={i} className="cn-sk" style={{width:60,height:60,borderRadius:10,flex:'0 0 auto'}}></i>)}</div></CSec>
    <CSec title="訂單" right=""><i className="cn-sk" style={{width:'100%',height:36,display:'block',marginBottom:12}}></i><i className="cn-sk" style={{width:'100%',height:90,display:'block'}}></i></CSec></div></div>);}
  const D=applyAll(server,queue);const find=code=>[].concat(D.white,D.gray,D.red,D.off,D.leave).filter(x=>x.code===code)[0]||null;
  D.white.forEach(p=>{if(p.state==='white'){const b=(D.bookings||[]).filter(x=>x.code===p.code&&x.at>=now-20*MIN&&x.at<=now+120*MIN).sort((a,c)=>a.at-c.at)[0];if(b)p.bk=b;}});
  const dayRef=dayRefH;
  const allOrders=(()=>{const m=dayRef.current.orders||{};const o={};const ids={};D.orders.forEach(x=>{ids[x.id]=1;});Object.keys(m).forEach(k=>{const x=m[k];const fin=x.status==='done'||x.status==='void';if(fin||ids[k])o[k]=x;});D.orders.forEach(x=>{o[x.id]=x;});return o;})();
  const AO=Object.keys(allOrders).map(k=>allOrders[k]);aoRef.current=allOrders;
  const getInfo=kind=>lgInfo(D.ledger,AO,now,kind);const getRpt=()=>lgReport(D.ledger,AO,now);
  const selP=sel?find(sel):null;
  const lateN=D.gray.filter(p=>isLate(p,now)).length;
  const click=p=>()=>setSel(p.code);
  const wtxt=D.window?hm(D.window[0])+'~'+(hm(D.window[1]+1).replace(/^0:00$/,'24:00')):'';
  const cnt=k=>D.white.filter(p=>p.state===k).length;
  const doClose=()=>{const bad={};(D.orders||[]).forEach(o=>{if((o.status==='seating'||o.status==='serving'||o.status==='wait_pay')&&!o.prepaid)bad[o.gid||o.id]=1;});const n=Object.keys(bad).length;if(n>0){setToolN(n);setTool('unpaid');}else setTool('close');};
  const overlays=(<React.Fragment>
    {ordSel&&(()=>{const g=groupOrders(D.orders||[]).find(x=>x.key===ordSel);return g?<OrderSheet g={g} D={D} now={now} onPay={setPaySel} onPre={setPreGid} act={o=>{act(o);}} onClose={()=>setOrdSel('')}/>:null;})()}
    {paySel&&(()=>{const g=groupOrders(D.orders||[]).find(x=>x.key===paySel);return g&&g.st==='wait_pay'?<PaySheet g={g} onClose={()=>setPaySel('')} onDone={v=>{act(Object.assign({act:'pay',wid:g.key},v));setPaySel('');}}/>:null;})()}
    {preGid&&(()=>{const g=groupOrders(D.orders||[]).find(x=>x.key===preGid);return g&&g.canPre?<PaySheet pre g={g} onClose={()=>setPreGid('')} onDone={v=>{act(Object.assign({act:'prepay',wid:g.key},v));setPreGid('');}}/>:null;})()}
    {tool==='rules'&&<SheetWhere.Provider value="full"><RulesSheet onClose={()=>setTool('')}/></SheetWhere.Provider>}
    {tool==='exp'&&<Sheet title="支出" onClose={()=>setTool('')}><ExpBlock L={D.ledger} now={now} act={act}/><Bt tone="gray" onClick={()=>setTool('')}>關閉</Bt></Sheet>}
    {tool==='set'&&<SettingsSheet who={who} onClose={()=>setTool('')}/>}
    {tool==='cnt'&&<SheetWhere.Provider value="full"><CountSheet local={getRpt} onClose={()=>setTool('')}/></SheetWhere.Provider>}
    {tool==='rep'&&<SheetWhere.Provider value="full"><ReportSheet local={getRpt} onClose={()=>setTool('')}/></SheetWhere.Provider>}
    {(tool==='shift'||tool==='close')&&<SheetWhere.Provider value="map"><ShiftSheet kind={tool} getInfo={getInfo} onSubmit={act} onClose={()=>{if(tool==='close')sync();setTool('');}}/></SheetWhere.Provider>}
    {tool==='unpaid'&&<Sheet where="map" title="還不能結帳" onClose={()=>setTool('')}><p className="text-base text-red-300 font-bold">未付有 {toolN} 筆,請先完成付款再結帳</p><p className="text-sm text-gray-400">帶位中、服務中、待買單的訂單都要先付款(先付也算)。</p><Bt onClick={()=>setTool('')}>知道了</Bt></Sheet>}
    {selP&&<PlateSheet key={selP.code+selP.state} p={selP} D={D} now={now} act={act} onClose={()=>setSel(null)}/>}
    {waitSheet&&req&&<WaitSheet req={req} guest={guest} onClose={()=>setWaitSheet(false)} onDone={v=>{act({act:'wadd',phone:v.phone,name:v.name,sur:v.sur,giv:v.giv,title:guest.title,src:guest.src,items:req});setWaitSheet(false);setReq(null);setGuest(G0());}}/>}
    {waitSel&&D.waits.some(x=>x.id===waitSel)&&<WaitEntrySheet w={D.waits.find(x=>x.id===waitSel)} idx={D.waits.findIndex(x=>x.id===waitSel)} act={o=>{act(o);setWaitSel(null);}} onSeat={w=>{setReq(w.items);setGuest({title:w.title||'',src:w.src||'',phone:w.phone||'',sur:w.sur||w.name||'',giv:w.sur?String(w.name||'').slice(w.sur.length):''});setFromWait(w.id);setWaitSel(null);}} onClose={()=>setWaitSel(null)}/>}
    {arranging&&<ArrangeSheet init={req} ginit={guest} D={D} now={now} onDone={(its,g)=>{setReq(its);setGuest(g);setArranging(false);}} onBook={(it,g,at)=>{act(Object.assign({act:'bk_add',code:String(it.teacher),at:at,it:JSON.stringify(it),item:(baseCode(it)||'')+(it.extra?'+'+it.extra:'')},gFields(g)));setArranging(false);setReq(null);setBid('');setGuest(G0());}} onClose={()=>setArranging(false)}/>}
    {opening!==null&&<OpenSheet D={D} now={now} presetPos={opening} act={(o,pre)=>{act(o);setOpening(null);if(pre)setPreGid(o.gid);}} onClose={()=>setOpening(null)}/>}
    {ask&&<Sheet title="請確認" cls="tb-ask" onClose={()=>setAsk(null)}><p className="text-base text-gray-100" style={{whiteSpace:'pre-line'}}>{ask.msg}</p><Bt onClick={()=>{const f=ask.fn;setAsk(null);f();}}>確定</Bt><Bt tone="gray" onClick={()=>setAsk(null)}>取消</Bt></Sheet>}
  </React.Fragment>);
  if(TB.tab){
    const GA=groupOrders(D.orders||[]);const gN=f=>GA.filter(f).length;
    const sg=gN(x=>x.st==='seating'),sv=gN(x=>x.st==='serving'),wp=gN(x=>x.st==='wait_pay'),dn=gN(x=>x.st==='done');
    const aheadArr=(fromWait?D.waits.slice(0,Math.max(0,D.waits.findIndex(x=>x.id===fromWait))):D.waits).map(x=>x.items);
    const arrActive=arrMode==='form'||!!req;const bkN=(D.bookings||[]).filter(b=>bday(b.at)===bday(now)).length;
    const hlS={},hlT={};
    if(req&&arrMode!=='form'){try{let list=recHl;if(!list){const R=window.__cnRec.recommend(D,Math.floor(now/30000)*30000,req,{ahead:aheadArr,bid:bid});const pl=R&&R.plans&&R.plans[0];list=pl?[].concat(...pl.items.map(r=>r.people.map(q=>({t:q.teacher,p1:q.pos1,p2:q.pos2})))):[];} // 位置圖/牌列的推薦標示跟著推薦區目前選的方案(換先做身體、一起開始…)
      list.forEach(q=>{if(q.p1)hlS[q.p1]={t:q.t,k:1};if(q.p2)hlS[q.p2]={t:q.t,k:2};hlT[q.t]=1;});}catch(_e){}}
    // 預約、候位一律放進分頁(帶位之前),座位圖拉高(舊 iPad Air 2 螢幕較矮)
    const tabs=[];if(arrActive)tabs.push(['arr','安排',0]);tabs.push(['book','預約',bkN],['wait','候位',D.waits.length]);tabs.push(['seating','帶位',sg],['serving','服務',sv],['wait_pay','待買單',wp],['done','完成',dn]);
    const dflt=sg?'seating':(wp&&!sv?'wait_pay':'serving');
    const cur=tabs.some(t=>t[0]===tabSel)?tabSel:(arrActive?'arr':dflt);
    const bookArrive=b=>{setReq([Object.assign(newItem(),b.it||{},{n:1,teacher:b.code})]);setGuest({title:b.title||'',src:b.src||'',phone:b.phone||'',sur:b.sur||'',giv:b.giv||''});setBid(b.id);setFromWait('');};
    const lists=(<React.Fragment><WaitList D={D} now={now} onPick={w=>setWaitSel(w.id)}/><BookList D={D} now={now} onCancel={b=>act({act:'bk_cancel',wid:b.id})} onArrive={bookArrive}/></React.Fragment>);
    const clearArr=()=>{setRecHl(null);setReq(null);setFromWait('');setBid('');setGuest(G0());setArrMode('');};
    const chipsEl=(<div className={'tb-chips'+(TB.land?'':' port')}><div className="tb-chip"><b>{cnt('white')}</b><span>待派工</span></div><div className="tb-chip"><b style={{color:'#b91c1c'}}>{D.red.length}</b><span>服務中</span></div><div className={'tb-chip'+(wp>0?' hot':'')}><b>{wp}</b><span>待買單</span></div><div className="tb-chip"><b>{wp+dn}</b><span>已完成</span></div></div>);
    const menuItem=(t,fn,st)=>(<button key={t} style={st} onClick={()=>{setMore(false);fn();}}>{t}</button>);
    return(<div className="cn-light"><style>{CN_CSS}</style><div className="tb-app" onClick={()=>{if(more)setMore(false);}}>
      <div className="tb-bar"><div><h1>主櫃 · {D.store} <small>{CN_VER}</small></h1>{kiosk&&<small className="tb-op">操作人 {who} <button onClick={onSwitch}>{swLabel||'換人'}</button></small>}</div>
        <div><div className="tb-tm">{hmFull(now)}</div><button onClick={sync} className={'cn-sync'+(queue.length>0?' w':'')}>{syncing?<Spinner size={12}/>:'●'} {queue.length>0?'待上傳 '+queue.length+' 筆':fresh?'已同步':(c0.current.at?'本機資料 · 更新中':'載入中')}</button></div>
        {TB.land&&chipsEl}<div style={{flex:1}}></div>
        <button onClick={()=>{if(onSwitch)onSwitch();else location.href=location.pathname;}} className="tb-btn">回首頁</button><button onClick={()=>setTool('shift')} className="tb-btn">交班</button>
        <button onClick={()=>{setArrMode('form');setTabSel('arr');}} className="tb-btn">安排客人</button><button onClick={()=>setOpening('')} className="tb-btn p">開單</button>
        <button onClick={e=>{e.stopPropagation();setMore(!more);}} className="tb-btn sq" aria-label="選單"><svg width="20" height="16" viewBox="0 0 20 16"><path d="M1 2h18M1 8h18M1 14h18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" fill="none"/></svg></button>
        {more&&<div className="tb-menu" onClick={e=>e.stopPropagation()}>{menuItem('📖 規則',()=>setTool('rules'))}{menuItem('支數表',()=>setTool('cnt'))}{menuItem('日報表',()=>setTool('rep'))}{menuItem('支出',()=>setTool('exp'))}{menuItem('結帳',doClose,{color:'#b45309'})}{menuItem('設定',()=>setTool('set'))}{(who&&D.canReset!==false)&&menuItem('還原',doReset,{color:'#b91c1c'})}</div>}</div>
      {!TB.land&&chipsEl}
      {(err||notes.length>0)&&<div className="tb-note">{err&&<span>{err}　</span>}{notes.length>0&&<span>有操作沒有成功:{notes.join(';')}　<button onClick={()=>setNotes([])} style={{textDecoration:'underline'}}>知道了</button></span>}</div>}
      <div className={'tb-main '+(TB.land?'land':'port')}>
        <div className={'tb-pn tb-map'+(TB.land?'':' port')}><div className="tb-h"><span>位置圖</span><TimeToggles tv={tv} onTv={setTv}/></div><SeatMapT D={D} now={now} hl={hlS} tv={tv} onSeat={pos=>{const m=seatMap(D)[pos];if(m)setSel(m.p.code);else setOpening(pos);}}/><SeatLegend/><div className="tb-sheethost" ref={e=>{CNP.map=e;}}></div></div>
        <div className="tb-pn"><div className="tb-tabs">{tabs.map(t=>(<button key={t[0]} className={(cur===t[0]?'on ':'')+(t[0]==='arr'?'ar':'')+(t[0]==='wait_pay'&&t[2]>0?' hot':'')} onClick={()=>setTabSel(t[0])}>{t[1]}{t[0]==='arr'?<i className="tb-dot"></i>:<b>{t[2]}</b>}</button>))}</div>
          <div className="tb-body">
            {arrActive&&<div style={{display:cur==='arr'?'block':'none'}}>
              {(arrMode==='form'||!req)?<ArrangeSheet key="af" inline pad init={req} ginit={guest} D={D} now={now} onDone={(its,g)=>{setReq(its);setGuest(g);setArrMode('');}} onBook={(it,g,at)=>{act(Object.assign({act:'bk_add',code:String(it.teacher),at:at,it:JSON.stringify(it),item:(baseCode(it)||'')+(it.extra?'+'+it.extra:'')},gFields(g)));clearArr();}} onClose={()=>setArrMode('')}/>
              :<RecBlock D={D} now={now} req={req} bid={bid} ahead={aheadArr} onShow={setRecHl} onClear={clearArr} onEdit={()=>setArrMode('form')} guest={guest} pad onReserve={fromWait?null:v=>{act({act:'wadd',phone:v.phone,name:v.name,sur:v.sur,giv:'',title:v.title,src:v.src,items:req});clearArr();}} adopt={(ops,pre)=>{const gid=rid();if(pre)setPreGid(gid);ops.forEach((o,i)=>act(Object.assign({},o,gFields(guest),{gid:gid},i===0&&bid?{bid:bid}:{})));setBid('');if(fromWait)act({act:'wdone',wid:fromWait,status:'seated'});clearArr();}}/>}</div>}
            {cur==='book'&&(bkN===0?<p className="text-sm text-gray-500 py-2">今天沒有勞點預約</p>:<BookList D={D} now={now} onCancel={b=>act({act:'bk_cancel',wid:b.id})} onArrive={bookArrive}/>)}
            {cur==='wait'&&(D.waits.length===0?<p className="text-sm text-gray-500 py-2">沒有候位</p>:<WaitList D={D} now={now} onPick={w=>setWaitSel(w.id)}/>)}
            {['seating','serving','wait_pay','done'].indexOf(cur)>=0&&<OrderLog D={D} act={act} forced={cur} onOpen={setOrdSel} onPay={setPaySel} onPre={setPreGid}/>}
          </div><div className="tb-sheethost" ref={e=>{CNP.el=e;}}></div></div></div>
      <PlatesBar D={D} now={now} hl={hlT} onPick={c=>setSel(c)} open={plOpen} onToggle={()=>setPlOpen(!plOpen)}/>
      {plOpen&&<PlatesDetail D={D} now={now} onPick={c=>setSel(c)} onClose={()=>setPlOpen(false)}/>}
      <div className="tb-fullhost" ref={e=>{CNP.full=e;}}></div>
      {overlays}
    </div></div>);
  }
  return(<div className="cn-light"><style>{CN_CSS}</style><div className="cn-wrap">
    <div className="cn-hd"><div><h1>主櫃 · {D.store} <small style={{fontSize:11,fontWeight:500,color:'#9aa0ad'}}>{CN_VER}</small>{kiosk&&<small style={{fontSize:12,fontWeight:700,color:'#2548d6',marginLeft:8}}>操作人 {who} <button onClick={onSwitch} style={{textDecoration:'underline',fontWeight:600}}>{swLabel||'換人'}</button></small>}</h1><div className="cn-tm"><span>{hmFull(now)}:{p2(tzp(now).s)}</span><button onClick={sync} className={'cn-sync'+(queue.length>0?' w':'')}>{syncing?<Spinner size={12}/>:'●'} {queue.length>0?'待上傳 '+queue.length+' 筆':fresh?'已同步'+(syncAt?' '+hmFull(syncAt):''):(c0.current.at?'本機資料 '+hmFull(c0.current.at)+' · 更新中':'載入中')}</button></div></div>
      <div className="cn-acts"><button onClick={()=>setArranging(true)} className="cn-btn">安排客人</button><button onClick={()=>setOpening('')} className="cn-btn p">＋開單</button></div></div>
    <div className="cn-tools"><button onClick={()=>setTool('rules')} className="cn-btn" style={{borderColor:'#2548d6',color:'#2548d6'}}>📖 規則</button><button onClick={()=>setTool('cnt')} className="cn-btn">支數表</button><button onClick={()=>setTool('rep')} className="cn-btn">日報表</button><button onClick={()=>setTool('shift')} className="cn-btn">交班</button><button onClick={()=>setTool('set')} className="cn-btn">設定</button><button onClick={()=>{const bad={};(D.orders||[]).forEach(o=>{if((o.status==='seating'||o.status==='serving'||o.status==='wait_pay')&&!o.prepaid)bad[o.gid||o.id]=1;});const n=Object.keys(bad).length;if(n>0){setToolN(n);setTool('unpaid');}else setTool('close');}} className="cn-btn" style={{borderColor:'#b45309',color:'#b45309'}}>結帳</button>{(who&&D.canReset!==false)&&<button onClick={doReset} className="cn-btn" style={{borderColor:'#b91c1c',color:'#b91c1c'}}>還原</button>}</div>
    {(()=>{const GA=groupOrders(D.orders||[]);const gN=f=>GA.filter(f).length;const sg=gN(x=>x.st==='seating'),sv=gN(x=>x.st==='serving'),wp=gN(x=>x.st==='wait_pay'),dn=gN(x=>x.st==='done');
      return(<div className="cn-chips"><div className="cn-chip"><b>{cnt('white')}</b><span>待派工</span><small>白牌老師{sg>0?' · 帶位中 '+sg+' 組':''}</small></div><div className="cn-chip"><b style={{color:'#b91c1c'}}>{D.red.length}</b><span>服務中</span><small>老師 · {sv} 組</small></div><div className="cn-chip"><b style={{color:'#0f8a5f'}}>{dn}</b><span>已買單</span><small>組</small></div><div className="cn-chip"><b style={{color:'#6b7280'}}>{wp+dn}</b><span>已完成</span><small>做完 · 待買單 {wp} 組</small></div></div>);})()}
    <div className="cn-cols"><div className="cn-ca">
    {err&&<p className="text-sm text-red-400 text-center">{err}</p>}
    {lateN>0&&<div className="cn-alert"><b>未到未電 {lateN} 位</b></div>}
    {req&&<RecBlock D={D} now={now} req={req} bid={bid} ahead={(fromWait?D.waits.slice(0,Math.max(0,D.waits.findIndex(x=>x.id===fromWait))):D.waits).map(x=>x.items)} onClear={()=>{setReq(null);setFromWait('');setBid('');setGuest(G0());}} onEdit={()=>setArranging(true)} guest={guest} onReserve={fromWait?null:v=>{act({act:'wadd',phone:v.phone,name:v.name,sur:v.sur,giv:'',title:v.title,src:v.src,items:req});setReq(null);setFromWait('');setBid('');setGuest(G0());}} adopt={(ops,pre)=>{const gid=rid();if(pre)setPreGid(gid);ops.forEach((o,i)=>act(Object.assign({},o,gFields(guest),{gid:gid},i===0&&bid?{bid:bid}:{})));setBid('');if(fromWait)act({act:'wdone',wid:fromWait,status:'seated'});setReq(null);setFromWait('');setGuest(G0());}}/>}
    <WaitList D={D} now={now} onPick={w=>setWaitSel(w.id)}/>
    {notes.length>0&&<div className="rounded-xl border border-amber-500 bg-amber-950 text-amber-200 px-3 py-2 text-sm space-y-1"><p className="font-bold">有操作沒有成功(可能別台櫃台已先處理),畫面已更新為最新牌況:</p>{notes.map((n,i)=><p key={i}>・{n}</p>)}<button onClick={()=>setNotes([])} className="text-xs underline">知道了</button></div>}
    <CSec first title={open?'全部牌況':'待派工'} right={<React.Fragment><span>白 {D.white.filter(p=>p.state==='white').length} · 綠 {cnt('green')} · 灰 {D.gray.length}　</span><button className="cn-link" onClick={()=>setOpen(!open)}>{open?'收合 ‹':'展開 ›'}</button></React.Fragment>}>
      {!open&&(D.white.length+D.gray.length===0?<p className="text-sm text-gray-500 py-2">目前沒有牌</p>:<Row scroll>{D.white.map(p=><Plate key={p.code} p={p} now={now} small onClick={click(p)}/>)}
        {D.white.length>0&&D.gray.length>0&&<div style={{flex:'0 0 auto',width:1,background:'#d3d6de',margin:'0 3px'}}/>}{D.gray.filter(p=>open||!isLate(p,now)).map(p=><Plate key={p.code} p={p} now={now} small onClick={click(p)}/>)}</Row>)}</CSec>
    {!open?(<CSec title="做事中" right={D.red.length}>{D.red.length===0?<p className="text-sm text-gray-500 py-1">沒有做事中的老師</p>:<Row scroll>{D.red.map(p=><Plate key={p.code} p={p} now={now} small onClick={click(p)}/>)}</Row>}</CSec>)
    :(<React.Fragment>
      <Zone title="白牌(等待派工)" count={D.white.length} hint="依序派工;綠牌=休息中,輪到時跳過">{D.white.length?<Row>{D.white.map(p=><Plate key={p.code} p={p} now={now} onClick={click(p)}/>)}</Row>:<p className="text-sm text-gray-500">沒有白牌</p>}</Zone>
      <Zone title="灰牌(未上牌)" count={D.gray.length} hint={'目前顯示上牌時段:'+wtxt+'(依現在時間切換)'}>{D.gray.length?<Row>{D.gray.map(p=><Plate key={p.code} p={p} now={now} onClick={click(p)}/>)}</Row>:<p className="text-sm text-gray-500">這個時段沒有要上牌的老師</p>}</Zone>
      <Zone title="紅牌(做事中)" count={D.red.length}>{D.red.length?<Row>{D.red.map(p=><Plate key={p.code} p={p} now={now} onClick={click(p)}/>)}</Row>:<p className="text-sm text-gray-500">沒有紅牌</p>}</Zone>
      <Zone title="下牌" count={D.off.length}>{D.off.length?<Row>{D.off.map(p=><Plate key={p.code} p={p} now={now} onClick={click(p)}/>)}</Row>:<p className="text-sm text-gray-500">沒有</p>}</Zone>
      <Zone title="請假" count={D.leave.length}>{D.leave.length?<Row>{D.leave.map(p=><Plate key={p.code} p={p} now={now} onClick={click(p)}/>)}</Row>:<p className="text-sm text-gray-500">沒有</p>}</Zone>
    </React.Fragment>)}
    </div><div className="cn-cs">
    <SeatMap D={D} now={now} tv={tv} onTv={setTv} onSeat={pos=>{const m=seatMap(D)[pos];if(m)setSel(m.p.code);else setOpening(pos);}}/>
    </div><div className="cn-cb">
    <BookList D={D} now={now} onCancel={b=>act({act:'bk_cancel',wid:b.id})} onArrive={b=>{setReq([Object.assign(newItem(),b.it||{},{n:1,teacher:b.code})]);setGuest({title:b.title||'',src:b.src||'',phone:b.phone||'',sur:b.sur||'',giv:b.giv||''});setBid(b.id);setFromWait('');}}/>
    <ExpBlock L={D.ledger} now={now} act={act}/>
    </div><div className="cn-co">
    <OrderLog D={D} act={act} onOpen={setOrdSel} onPay={setPaySel} onPre={setPreGid}/>
    </div></div>
    {overlays}
  </div></div>);
}
// ── 公務機:個人碼 / 鎖定 / 解除 / 輸入個人碼畫面 ──
async function sha256hex(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return Array.prototype.map.call(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');}
const kioskUrl=()=>location.pathname+'?cn2=1';
function SettingsSheet({who,onClose}){
  const k=window.__kiosk&&window.__kiosk.get();const[code,setCode]=useState('');const[msg,setMsg]=useState('');const[busy,setBusy]=useState(false);
  let li=false;try{li=!!(liff.isLoggedIn&&liff.isLoggedIn()&&liff.getAccessToken());}catch(_e){}
  const six=/^\d{6}$/.test(code);
  const run=async(fn)=>{setBusy(true);setMsg('');try{await fn();}catch(_e){setMsg('網路不通或需要登入,請再試一次');}finally{setBusy(false);}};
  const[my,setMy]=useState(null);
  const showMy=()=>run(async()=>{const r=await api('cnMyDayCode',{});if(r&&r.ok)setMy(r);else setMsg((r&&r.error)||'失敗');});
  const lock=()=>run(async()=>{if(!confirm('把這台設成公務機並鎖定?\n\n鎖定後這台不論開哪個網址都只會進主櫃,要輸入今日登入碼才能操作;解除需要 LINE 登入+你的今日登入碼。'))return;
    const r=await api('cnKioskLock',{});if(r&&r.ok){lsW(KK,{on:1,token:r.token,store:r.store,at:Date.now(),by:r.by});lsW(KOPS,r.opList||[]);try{localStorage.removeItem(KOP);}catch(_e){}location.replace(kioskUrl());}else setMsg((r&&r.error)||'失敗');});
  const unlock=()=>run(async()=>{const r=await api('cnKioskUnlock',{code:code,kioskToken:k.token});if(r&&r.ok){try{localStorage.removeItem(KK);localStorage.removeItem(KOP);}catch(_e){}location.replace(kioskUrl());}else setMsg((r&&r.error)||'失敗');});
  const loginForUnlock=()=>run(async()=>{try{await liff.init({liffId:window.__S2_LIFF_ID});}catch(_e){}liff.login({redirectUri:location.origin+location.pathname+'?cn2=1&unlock=1'});});
  const CI=<input value={code} inputMode="numeric" maxLength={6} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="今日登入碼 6 位數字" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white text-center text-xl tracking-widest"/>;
  return(<Sheet title="設定" onClose={onClose}>
    {msg&&<p className="text-sm text-amber-300">{msg}</p>}
    {!k&&(<React.Fragment>
      <div className="space-y-2"><p className="text-base text-white font-bold">我的今日登入碼</p><p className="text-xs text-gray-400">每天(凌晨 3 點換日)自動更換,公務機上用來辨識操作人。要用 LINE 登入才能查看;也可以在「我的」頁看。</p>
        {my?(<div className="rounded-xl bg-gray-800 p-3 text-center"><p className="text-xs text-gray-400">{my.store}・營業日 {my.day}</p><p className="text-3xl font-bold text-white tracking-widest" style={{fontVariantNumeric:'tabular-nums'}}>{my.code}</p>{my.nextCode&&<p className="text-xs text-gray-500 mt-1">明日（{my.nextDay}）{my.nextCode}</p>}</div>):(busy?(<div className="rounded-xl bg-gray-800 py-5 flex flex-col items-center gap-2 text-sky-300"><Spinner size={32}/><p className="text-sm text-gray-400">產生登入碼中…</p></div>):(<Bt disabled={busy} onClick={showMy}>查看我的今日登入碼</Bt>))}</div>
      <div className="space-y-2 pt-2 border-t border-gray-800"><p className="text-base text-white font-bold">這台是公務機</p><p className="text-xs text-gray-400">經理以上可鎖定(要用 LINE 登入)。鎖定後這台不論開 safety-report 底下哪個網址,都只會進主櫃。</p><Bt disabled={busy} onClick={lock}>鎖定這台</Bt></div>
    </React.Fragment>)}
    {k&&(<div className="space-y-2"><p className="text-base text-emerald-300 font-bold">這台已鎖定為公務機</p><p className="text-xs text-gray-400">解除需要:LINE 登入 + 你自己的今日登入碼(經理以上)。</p>
      {li?(<React.Fragment>{CI}<Bt disabled={!six||busy} onClick={unlock}>解除鎖定</Bt></React.Fragment>):(<Bt disabled={busy} onClick={loginForUnlock}>用 LINE 登入以解除</Bt>)}</div>)}
    <Bt tone="gray" onClick={onClose}>關閉</Bt></Sheet>);
}
function KioskCodeScreen({onOk}){
  const[code,setCode]=useState('');const[msg,setMsg]=useState('');const[fails,setFails]=useState(0);const[until,setUntil]=useState(0);
  const pull=()=>{api('cnKioskOps',{}).then(r=>{if(r&&r.ok&&r.opList)lsW(KOPS,r.opList);}).catch(()=>{});}; // 登入畫面沒有同步迴圈:進來先抓最新清單,輸錯再抓一次
  useEffect(()=>{pull();},[]);
  const press=async d=>{if(Date.now()<until){setMsg('輸錯太多次,請稍等一下');return;}const c=(code+d).slice(0,6);setCode(c);setMsg('');if(c.length<6)return;
    const ops=lsJ(KOPS,[]);const bizDay=ms=>new Date(ms+5*3600e3).toISOString().slice(0,10); // 台北時間 -3 小時換營業日 = UTC+8-3
    let hit=null;for(const d of [bizDay(Date.now()),bizDay(Date.now()-86400e3)]){let h='';try{h=await sha256hex('mp-cn-d1|'+d+'|'+c);}catch(_e){}hit=ops.find(x=>x.h===h&&x.d===d);if(hit)break;}
    if(hit){try{localStorage.setItem(KOP,hit.n);}catch(_e){}onOk(hit.n);}
    else{const f=fails+1;setFails(f);setCode('');setMsg(ops.some(x=>x.d)?'登入碼不正確':'尚未同步登入碼,請連網後再試');pull();if(f>=5){setUntil(Date.now()+60000);setFails(0);setMsg('輸錯 5 次,請 1 分鐘後再試');}}};
  return(<div className="cn-light"><style>{CN_CSS}</style><div className="cn-wrap" style={{maxWidth:420,paddingTop:60,textAlign:'center'}}>
    <h1 style={{fontSize:22,fontWeight:800}}>主櫃(公務機)</h1><p className="text-sm text-gray-500" style={{margin:'6px 0 18px'}}>請輸入今日登入碼</p>
    <div style={{fontSize:30,letterSpacing:10,height:44}}>{'●'.repeat(code.length)}{'○'.repeat(6-code.length)}</div><p className="text-sm text-red-400" style={{height:22}}>{msg}</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:10}}>{['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d,i)=>d===''?<span key={i}></span>:<button key={i} onClick={()=>d==='⌫'?setCode(code.slice(0,-1)):press(d)} className="cn-btn" style={{height:64,fontSize:24}}>{d}</button>)}</div></div></div>);
}
function KioskGate(){
  const[op,setOp]=useState(()=>{try{return localStorage.getItem(KOP)||'';}catch(_e){return '';}});
  if(!op)return <KioskCodeScreen onOk={setOp}/>;
  return <CounterPage who={op} kiosk onSwitch={()=>{try{localStorage.removeItem(KOP);}catch(_e){}setOp('');}}/>;
}
// 先用本機記得的操作人直接開頁(框架與本機資料立刻出來),背景再確認身分;沒有記錄(第一次)才走登入流程
function CachedWho({w0}){
  const[who,setWho]=useState(w0);
  useEffect(()=>{let dead=false;api('s2Me',{}).then(r=>{if(dead||!r||!r.ok)return;const c=(r.user&&r.user.code)||'';if(c){lsW(WK,{code:c});setWho(c);}}).catch(()=>{});return()=>{dead=true;};},[]);
  return <CounterPage who={who}/>;
}
// ── 主櫃首頁(非公務機):輸入登入碼入口;手機版另有「以本機帳號登入」 ──
function CodeLoginScreen({onOk,onBack}){
  const[code,setCode]=useState('');const[msg,setMsg]=useState('');const[busy,setBusy]=useState(false);
  const press=async d=>{if(busy)return;const c=(code+d).slice(0,6);setCode(c);setMsg('');if(c.length<6)return;
    setBusy(true);let r=null;try{r=await api('cnCodeLogin',{code:c});}catch(_e){}setBusy(false);setCode('');
    if(r&&r.ok){window.__cnSess.set({session:r.session,exp:r.exp,name:r.name,store:r.store});onOk({name:r.name});}
    else setMsg((r&&r.error)||'連不上伺服器,請確認網路後再試');};
  return(<div className="cn-light"><style>{CN_CSS}</style><div className="cn-wrap" style={{maxWidth:420,paddingTop:50,textAlign:'center'}}>
    <h1 style={{fontSize:22,fontWeight:800}}>輸入登入碼</h1><p className="text-sm text-gray-500" style={{margin:'6px 0 18px'}}>請輸入今日登入碼（到「我的」頁查看）</p>
    <div style={{fontSize:30,letterSpacing:10,height:44}}>{busy?<Spinner size={30}/>:<React.Fragment>{'●'.repeat(code.length)}{'○'.repeat(6-code.length)}</React.Fragment>}</div><p className="text-sm text-red-400" style={{minHeight:22}}>{msg}</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:10}}>{['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d,i)=>d===''?<span key={i}></span>:<button key={i} disabled={busy} onClick={()=>d==='⌫'?setCode(code.slice(0,-1)):press(d)} className="cn-btn" style={{height:64,fontSize:24}}>{d}</button>)}</div>
    <button onClick={onBack} className="text-sm text-gray-500" style={{marginTop:22,textDecoration:'underline'}}>返回</button></div></div>);
}
function CounterHome({onCode,onLocal,localCode,isPhone}){
  const[now,setNow]=useState(Date.now());useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t);},[]);
  return(<div className="cn-light"><style>{CN_CSS}</style><div className="cn-wrap" style={{maxWidth:420,paddingTop:70,textAlign:'center'}}>
    <h1 style={{fontSize:22,fontWeight:800}}>主櫃 · {CN_HOME_STORE}</h1>
    <div style={{fontSize:44,fontWeight:800,margin:'14px 0 30px',fontVariantNumeric:'tabular-nums'}}>{hmFull(now)}</div>
    <button onClick={onCode} className="cn-btn p" style={{width:'100%',height:56,fontSize:18}}>輸入登入碼</button>
    {isPhone&&<button onClick={onLocal} className="cn-btn" style={{width:'100%',height:56,fontSize:16,marginTop:12}}>{localCode?'以本機帳號（'+localCode+'）登入':'以 LINE 帳號登入'}</button>}
    <p className="text-xs text-gray-500" style={{marginTop:18}}>{CN_VER}</p></div></div>);
}
const CN_HOME_STORE='龍山寺店';
function Counter2Routes(){
  if(window.__kiosk&&window.__kiosk.get())return <KioskGate/>; // 公務機鎖定:用登入碼辨識操作人,不用 LINE 登入
  const[sess,setSess]=useState(()=>window.__cnSess.get());
  const[mode,setMode]=useState('home'); // home | code | local
  if(sess)return <CounterPage who={sess.name} kiosk swLabel="登出" onSwitch={()=>{window.__cnSess.clear();setSess(null);setMode('home');}}/>;
  if(mode==='code')return <CodeLoginScreen onOk={()=>setSess(window.__cnSess.get())} onBack={()=>setMode('home')}/>;
  const w0=lsJ(WK,null);
  if(mode==='local'){
    if(w0&&w0.code)return <CachedWho w0={w0.code}/>;
    return(<NeedUser render={(me)=>{const code=(me.user&&me.user.code)||'櫃台';lsW(WK,{code:code});return <CounterPage who={code}/>;}}/>);
  }
  const isPhone=/iPhone|iPod|Android.*Mobile/i.test(navigator.userAgent||'')||Math.min(screen.width,screen.height)<600;
  return <CounterHome onCode={()=>setMode('code')} onLocal={()=>setMode('local')} localCode={w0&&w0.code} isPhone={isPhone}/>;
}
window.Counter2Routes=Counter2Routes;
})();
