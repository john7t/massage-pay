// wg-test.js v0.1(測試版)——Scriptile 小工具 +1/+2/+3 的網頁端:綁定、自動/手動合併、查詢並下載
// 流程:小工具 → GAS(WgEvents 暫存表,只追加)→ 這裡 wgList 取回未合併 → 合併進本機月資料 → wgMark 標記已合併
// 掛載方式:settings.js 設定頁 <window.WgPanel code/>;依賴 window.MP(common.js)
const{useState:wgUseState,useEffect:wgUseEffect}=React;
const WG_LIFF_ID='2010673151-QNFLrsH0';
const WG_KEY='wg-dev',WG_SEEN='wg-merged-eids';
function wgDev(){try{return JSON.parse(localStorage.getItem(WG_KEY)||'null')}catch(_e){return null}}
function wgSeen(){try{return JSON.parse(localStorage.getItem(WG_SEEN)||'[]')}catch(_e){return[]}}
async function wgCall(action,dev,extra){
  const M=window.MP;
  return await M.gasCallPost(action,Object.assign({uid:dev.uid,token:dev.token},extra||{}),20000);
}
// 把事件合併進本機月資料,回傳實際加入的支數
function wgApply(code,events){
  const M=window.MP,seen=new Set(wgSeen()),touched={};let units=0,n=0;
  events.forEach(ev=>{
    if(seen.has(ev.eid))return;
    const p=M.bizParts(new Date(ev.ts)),key=M.dk(code,p.y,p.m);
    if(!touched[key])touched[key]=M.LS.get(key)||M.eMon();
    const mon=touched[key];if(!mon.days)mon.days={};
    const day=mon.days[p.d]||M.eDay();
    day.total=(day.total||0)+ev.n;mon.days[p.d]=day;
    units+=ev.n;n++;seen.add(ev.eid);
  });
  Object.keys(touched).forEach(k=>M.LS.set(k,touched[k]));
  try{localStorage.setItem(WG_SEEN,JSON.stringify(Array.from(seen).slice(-1000)))}catch(_e){}
  return{units,n};
}
function wgDownload(name,text,type){
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:type||'application/json'}));
  a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
}
async function wgMerge(code,dev){
  const r=await wgCall('wgList',dev,{});
  if(!r||!r.ok)return{ok:false,error:(r&&r.error)||'GAS 無回應'};
  const a=wgApply(code,r.events);
  if(r.events.length){const m=await wgCall('wgMark',dev,{eids:r.events.map(e=>e.eid).join(',')});if(!m||!m.ok)return{ok:false,error:'已合併但標記失敗(下次會自動略過重複)',units:a.units,n:a.n}}
  return{ok:true,units:a.units,n:a.n};
}
function WgPanel({code}){
  const[dev,setDev]=wgUseState(wgDev);const[msg,setMsg]=wgUseState('');const[busy,setBusy]=wgUseState(false);const[open,setOpen]=wgUseState(false);
  wgUseEffect(()=>{if(!dev)return;let alive=true;
    wgMerge(code,dev).then(r=>{if(alive&&r.ok&&r.n)setMsg('已自動合併小工具紀錄 '+r.n+' 筆(+'+r.units+' 支)')}).catch(()=>{});
    return()=>{alive=false}},[]);
  const run=async(fn)=>{setBusy(true);setMsg('');try{await fn()}catch(e){setMsg('失敗:'+(e&&e.message||e))}setBusy(false)};
  const bind=()=>run(async()=>{
    await liff.init({liffId:WG_LIFF_ID});
    if(!liff.isLoggedIn()){liff.login({redirectUri:location.href});return}
    const idt=liff.getIDToken();if(!idt)throw new Error('取不到 ID Token(LIFF 要開 openid scope)');
    const r=await window.MP.gasCallPost('wgBind',{idToken:idt},20000);
    if(!r||!r.ok)throw new Error((r&&r.error)||window.__gasErr||'綁定失敗');
    const d={uid:r.uid,token:r.token};localStorage.setItem(WG_KEY,JSON.stringify(d));setDev(d);
    setMsg('綁定完成。把下面的 uid / token 貼進 Scriptile 腳本(舊 token 已失效)');
  });
  const sync=()=>run(async()=>{const r=await wgMerge(code,dev);setMsg(r.ok?(r.n?('已合併 '+r.n+' 筆(+'+r.units+' 支)'):'沒有新的小工具紀錄'):r.error)});
  const dl=()=>run(async()=>{
    const r=await wgCall('wgList',dev,{all:1});
    if(!r||!r.ok)throw new Error((r&&r.error)||'GAS 無回應');
    const ev=r.events.sort((a,b)=>a.ts-b.ts),un=ev.filter(e=>!e.merged);
    const sum=x=>x.reduce((s,e)=>s+e.n,0);
    setMsg('雲端共 '+ev.length+' 筆(+'+sum(ev)+' 支),其中未合併 '+un.length+' 筆(+'+sum(un)+' 支),已下載');
    const d=new Date().toISOString().slice(0,10);
    wgDownload('widget-events-'+d+'.json',JSON.stringify({uid:dev.uid,exportedAt:Date.now(),events:ev},null,1));
  });
  const cp=(s)=>{try{navigator.clipboard.writeText(s);setMsg('已複製')}catch(_e){setMsg('請手動長按複製')}};
  const b='px-3 py-2 rounded-lg text-[13px] font-semibold border border-white/20 text-gray-100 active:bg-white/10 disabled:opacity-40';
  return(<div className="mt-6 px-1">
    <button onClick={()=>setOpen(!open)} className="text-[13px] font-semibold tracking-wider text-gray-400">小工具同步(測試){open?' ▲':' ▼'}</button>
    {open&&<div className="mt-2 p-3 rounded-lg border border-white/[0.12] text-[13px] text-gray-200 space-y-2">
      <div className="flex flex-wrap gap-2">
        <button className={b} disabled={busy} onClick={bind}>{dev?'重新綁定(換 token)':'綁定小工具'}</button>
        <button className={b} disabled={busy||!dev} onClick={sync}>同步合併</button>
        <button className={b} disabled={busy||!dev} onClick={dl}>查詢並下載</button>
      </div>
      {dev&&<div className="text-[12px] text-gray-400 break-all">uid:{dev.uid}<button className="ml-2 underline" onClick={()=>cp(dev.uid)}>複製</button><br/>token:{dev.token.slice(0,8)}…<button className="ml-2 underline" onClick={()=>cp(dev.token)}>複製</button></div>}
      {msg&&<p className="text-[12px] text-yellow-300">{msg}</p>}
    </div>}
  </div>);
}
window.WgPanel=WgPanel;
