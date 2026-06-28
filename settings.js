// settings.js — 設定頁相關元件(從 index.html 抽離,降低 index 體積)
// 注意:此檔為 type="text/babel",獨立作用域,需自行宣告 hooks 與 bridge
const{useState,useEffect,useCallback,useMemo}=React;
const{LS,getKeyConfig,saveKeyConfig,buildDynamicKey,getCK,xEnc,xDec,fnv,adminHash,genAdminAct,revokeHash,approveHash,supApproveHash,genSimpleAct,encWithKey,decWithKey,actKey,genActWithToken,verifyActToken,genReqCode,parseReqCode,decReqCode,genConfirmCode,verifyConfirmCode,confirmCodeIsBound,genUUID,getDeviceId,SUP_LEVELS,supLevelName,getGHConfig,saveGHConfigLocal,saveGHConfig,ghReadFile,ghWriteFile,ghAppendLine,ghRemoveLine,readStaff,writeStaff,checkApproved,writeApproval,loadStores,saveStores,loadStats,getApproved,saveApproved,addApproved,addLog,getLogs,fmtLog,fmtDate,THEMES,SKILL_KEYS,SKILL_SHORT,SKILL_PRICES,SKILL_COLORS,SK,SBG,STC,canWork,toB36,fromB36,dim,dow,bizDate,bizParts,dk,eDay,stamp,calcSal,eMon,newSlip,slipSvcLabel,SERVICES,slipStartTime,loadTagHistory,addTagHistory,visitStats,collectSlips,collectAllSlips,tagStats,searchSlips,bookTitleName,BOOK_TITLES,encMonth,decBackup,dataMonthRange,encRange,decRange,makePersonalBackup,parsePersonalBackup,restorePersonalBackup,TW_REGIONS,LANG_SCHOOLS,T}=window.MP;

function ChartPage({t,settings}){
  const[sub,setSub]=useState('shift');
  const[stats,setStats]=useState(undefined); // undefined=載入中, null=無資料
  const[pickHour,setPickHour]=useState(null);
  const isSup=(()=>{const gh=getGHConfig();return !!(gh&&gh.token)})();
  useEffect(()=>{let alive=true;loadStats().then(s=>{if(alive)setStats(s)});return()=>{alive=false}},[]);
  const SUBS=[['shift',t.chartShiftRatio],['gender',t.chartGenderRatio],['a1',t.chartWorkStart],['a2',t.chartOnline]];
  // 時段順序:早上7點 → 隔天早上6點(跨夜連續)
  const HOURS=Array.from({length:24},(_,i)=>(i+7)%24);
  // 橫向長條圖:arr=24長度人數陣列,點長條設pickHour
  const hbar=(arr,desc)=>{const max=Math.max(1,...arr);const totalP=arr.reduce((a,b)=>a+b,0);if(totalP===0)return<p className="text-sm text-gray-500 text-center py-8">{t.chartNoData}</p>;return(<div className="space-y-2"><p className="text-xs text-gray-500">{desc}</p><div className="space-y-1">{HOURS.map(h=>{const v=arr[h]||0;const on=pickHour===h;return(<div key={h} onClick={()=>setPickHour(on?null:h)} className="flex items-center gap-2 active:opacity-70"><span className={`text-[10px] tabular-nums w-7 text-right ${on?'text-amber-300 font-bold':'text-gray-500'}`}>{String(h).padStart(2,'0')}</span><div className="flex-1 h-4 bg-white/[0.03] rounded-sm overflow-hidden"><div className="h-full rounded-sm transition-all" style={{width:(v/max*100)+'%',background:on?'#fbbf24':'#D97706'}}></div></div><span className={`text-[10px] tabular-nums w-5 ${on?'text-amber-300 font-bold':'text-gray-500'}`}>{v||''}</span></div>)})}</div></div>)};
  // 圓餅圖(SVG)
  const pie=(data,colors)=>{const total=data.reduce((s,d)=>s+d.v,0);if(total===0)return<p className="text-sm text-gray-500 text-center py-8">{t.chartNoData}</p>;let acc=0;const R=70,CX=90,CY=90;const segs=data.filter(d=>d.v>0).map((d,i)=>{const frac=d.v/total;const a0=acc*2*Math.PI-Math.PI/2;acc+=frac;const a1=acc*2*Math.PI-Math.PI/2;const x0=CX+R*Math.cos(a0),y0=CY+R*Math.sin(a0);const x1=CX+R*Math.cos(a1),y1=CY+R*Math.sin(a1);const large=frac>0.5?1:0;return{path:`M ${CX} ${CY} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`,color:colors[i%colors.length],label:d.label,v:d.v,pct:Math.round(frac*100)}});return(<div className="flex flex-col items-center gap-3"><svg viewBox="0 0 180 180" className="w-44 h-44">{segs.map((s,i)=><path key={i} d={s.path} fill={s.color}/>)}</svg><div className="flex flex-wrap justify-center gap-3">{segs.map((s,i)=>(<div key={i} className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{background:s.color}}></span><span className="text-xs text-gray-300">{s.label} {s.v}（{s.pct}%）</span></div>))}</div></div>)};
  return(<div className="fi space-y-4">
    <h2 className="text-lg font-bold text-gray-100">{t.tabChart}</h2>
    <div className="flex gap-1 bg-white/[0.03] rounded-lg p-1 overflow-x-auto">{SUBS.map(([id,label])=>(<button key={id} onClick={()=>{setSub(id);setPickHour(null)}} className={`flex-1 whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-semibold ${sub===id?'bg-amber-600 text-white':'text-gray-500'}`}>{label}</button>))}</div>
    {stats===undefined&&<p className="text-sm text-gray-500 text-center py-8">...</p>}
    {stats===null&&<p className="text-sm text-gray-500 text-center py-8">{t.chartNoData}</p>}
    {stats&&(<div className="space-y-3">
      {sub==='shift'&&pie([{label:t.chartDayShift,v:stats.shifts.day||0},{label:t.chartNightShift,v:stats.shifts.night||0},{label:t.chartOther,v:stats.shifts.other||0}],['#D97706','#7C3AED','#9CA3AF'])}
      {sub==='gender'&&pie([{label:t.chartMale,v:stats.genders.M||0},{label:t.chartFemale,v:stats.genders.F||0},{label:t.chartOther,v:stats.genders.other||0}],['#2563EB','#EC4899','#9CA3AF'])}
      {sub==='a1'&&(<div>{hbar(stats.workStart||[],t.chartWorkStartDesc)}{pickHour!==null&&<div className="mt-3 bg-amber-600/10 border border-amber-500/25 rounded-xl px-3 py-2 fi"><span className="text-sm text-amber-300">{String(pickHour).padStart(2,'0')}:00 — {(stats.workStart||[])[pickHour]||0} {t.peopleUnit2}</span></div>}</div>)}
      {sub==='a2'&&(<div>{hbar(stats.workHours||[],t.chartOnlineDesc)}{pickHour!==null&&<div className="mt-3 bg-amber-600/10 border border-amber-500/25 rounded-xl px-3 py-2 fi"><span className="text-sm text-amber-300">{String(pickHour).padStart(2,'0')}:00 — {(stats.workHours||[])[pickHour]||0} {t.peopleUnit2}</span></div>}</div>)}
      <p className="text-[11px] text-gray-500 text-center">{t.statTotal} {stats.total} · {t.chartUpdatedAt}：{new Date(stats.updatedAt).toLocaleString('zh-TW',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
    </div>)}
  </div>);
}

function BackupSection({settings,t}){
  const[input,setInput]=useState('');const[result,setResult]=useState(null);const[expCode,setExpCode]=useState('');const[expRange,setExpRange]=useState(null);
  const[jsonMsg,setJsonMsg]=useState(null);const[pendingImport,setPendingImport]=useState(null);const fileRef=React.useRef(null);
  const doExport=()=>{const range=dataMonthRange(settings.code,settings.year);if(!range){setExpCode('');setResult(t.noData);setTimeout(()=>setResult(null),2000);return}const code=encRange(settings.code,settings.year);setExpCode(code);setExpRange(range)};
  const doCopy=async()=>{try{await navigator.clipboard.writeText(expCode)}catch{};setResult(t.copyDone);setTimeout(()=>setResult(null),2000)};
  const doImport=()=>{const list=decRange(input);if(list.length){list.forEach(p=>LS.set(dk(p.code,p.year,p.month),p.data));const ms=list.map(p=>p.month);setResult(`${t.importOk} → ${list[0].code} ${list[0].year} (${Math.min(...ms)}~${Math.max(...ms)}月)`);setInput('')}else{setResult(t.importFail)};setTimeout(()=>setResult(null),3000)};
  // JSON 完整備份匯出
  const doJsonExport=()=>{try{const obj=makePersonalBackup(settings.code,settings.year);const blob=new Blob([JSON.stringify(obj)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`massage-${settings.code}-${settings.year}-backup.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);doExport();setJsonMsg({ok:true,text:t.jsonAndCodeDone})}catch(e){setJsonMsg({ok:false,text:t.jsonExportFail})}setTimeout(()=>setJsonMsg(null),5000)};
  // JSON 匯入
  const doJsonImport=(e)=>{const file=e.target.files&&e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{let obj;try{obj=JSON.parse(reader.result)}catch{setJsonMsg({ok:false,text:t.jsonBroken});setTimeout(()=>setJsonMsg(null),4000);return}const parsed=parsePersonalBackup(obj);if(!parsed.ok){const map={notBackup:t.jsonNotBackup,broken:t.jsonBroken,modified:t.jsonModified};setJsonMsg({ok:false,text:map[parsed.reason]||t.jsonBroken});setTimeout(()=>setJsonMsg(null),4000);return}if(parsed.code!==settings.code){setJsonMsg({ok:false,text:t.jsonOtherPerson+'（'+parsed.code+'）'});setTimeout(()=>setJsonMsg(null),4000);return}setPendingImport(parsed)};reader.readAsText(file);e.target.value=''};
  const confirmImport=()=>{if(!pendingImport)return;restorePersonalBackup(pendingImport);setPendingImport(null);setJsonMsg({ok:true,text:t.jsonImportDone});setTimeout(()=>{location.reload()},1200)};
  return(<div className="space-y-3 pt-4 border-t border-white/[0.06]"><h3 className="text-sm font-semibold text-amber-400">{t.backup}</h3><button onClick={doExport} className="w-full py-2.5 bg-amber-600 rounded-xl text-white text-sm font-semibold">{t.exportRangeCode}</button>{expCode&&(<div className="space-y-1"><p className="text-[11px] text-gray-500">{t.rangeHint}：{settings.year} {expRange?expRange.first+'~'+expRange.last+'月':''}</p><div className="relative"><div className="bg-white/[0.04] rounded-xl p-3 text-[10px] text-gray-500 break-all font-mono select-all">{expCode}</div><button onClick={doCopy} className="absolute top-2 right-2 px-2 py-1 bg-white/10 rounded text-xs text-gray-300">📋</button></div></div>)}<textarea value={input} onChange={e=>setInput(e.target.value)} rows={2} placeholder={t.enterUrl} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500 resize-none"/><button onClick={doImport} disabled={!input.trim()} className={`w-full py-3 rounded-xl font-bold text-white ${input.trim()?'bg-amber-600':'bg-white/[0.06] text-gray-600 cursor-not-allowed'}`}>{t.importUrl}</button>{result&&<div className={`p-2.5 rounded-xl text-sm text-center fi ${result.includes(t.importFail)||result===t.noData?'bg-red-500/15 text-red-300':'bg-emerald-500/15 text-emerald-300'}`}>{result}</div>}
    <div className="pt-4 mt-2 border-t border-white/[0.06] space-y-2"><h3 className="text-sm font-semibold text-amber-400">{t.fullBackup}</h3><p className="text-[11px] text-gray-500 leading-relaxed">{t.fullBackupDesc}</p><button onClick={doJsonExport} className="w-full py-3 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700">{t.jsonExport}</button><button onClick={()=>fileRef.current&&fileRef.current.click()} className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-gray-200 text-sm font-bold active:bg-white/[0.1]">{t.jsonImport}</button><input ref={fileRef} type="file" accept="application/json,.json" onChange={doJsonImport} className="hidden"/>{pendingImport&&<div className="bg-amber-600/10 border border-amber-500/30 rounded-xl p-3 space-y-2 fi"><p className="text-[13px] text-amber-200">{t.jsonConfirmOverwrite}</p><div className="grid grid-cols-2 gap-2"><button onClick={()=>setPendingImport(null)} className="py-2 rounded-lg bg-white/[0.06] text-gray-300 text-sm">{t.cancel||'取消'}</button><button onClick={confirmImport} className="py-2 rounded-lg bg-amber-600 text-white text-sm font-bold">{t.confirm}</button></div></div>}{jsonMsg&&<div className={`p-2.5 rounded-xl text-sm text-center fi ${jsonMsg.ok?'bg-emerald-500/15 text-emerald-300':'bg-red-500/15 text-red-300'}`}>{jsonMsg.text}</div>}</div>
  </div>)}

/* ══════════ Settings ══════════ */
/* ══════════ Settings (slim — admin/supervisor 移至 auth.html) ══════════ */
// 客管分頁(老師端:流水hashtag統計 + 姓名/手機搜流水,不碰自約客)
function CustomerPage({t,settings}){
  const[mode,setMode]=useState('tags'); // tags=標籤統計, search=客戶搜尋
  const[openTag,setOpenTag]=useState(null);
  const[q,setQ]=useState('');
  const year=settings.year||new Date().getFullYear();
  const allSlips=useMemo(()=>collectAllSlips(settings.code,year),[settings.code,year]);
  const tags=useMemo(()=>tagStats(allSlips),[allSlips]);
  const fmtDT=(s)=>`${s.month}/${s.day} ${String(new Date(s.startTime).getHours()).padStart(2,'0')}:${String(new Date(s.startTime).getMinutes()).padStart(2,'0')}`;
  const tagSlips=openTag?allSlips.filter(s=>(s.tags||[]).includes(openTag)):[];
  const found=mode==='search'?searchSlips(allSlips,q):[];
  const slipRow=(s)=>(<div key={s.id} className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/[0.05] rounded-lg"><span className="text-sm font-bold text-amber-300 min-w-[3rem]">{slipSvcLabel(s)}</span><span className="text-xs text-gray-400 tabular-nums w-20">{fmtDT(s)}</span><div className="flex-1 min-w-0"><span className="text-xs text-gray-300">{s.custName||''}{s.custTitle?' '+bookTitleName(s.custTitle,t===T.zh?'zh':'vi'):''}</span>{s.tags&&s.tags.length>0&&<span className="text-[10px] text-gray-500 ml-1">{s.tags.map(x=>'#'+x).join(' ')}</span>}</div>{s.custPhone&&<span className="text-[10px] text-gray-500">{s.custPhone}</span>}</div>);
  return(<div className="fi space-y-3">
    <h2 className="text-lg font-bold text-gray-100">{t.custMgmt}</h2>
    <div className="flex gap-1 bg-white/[0.03] rounded-lg p-1">
      <button onClick={()=>setMode('tags')} className={`flex-1 py-1.5 rounded-md text-xs font-semibold ${mode==='tags'?'bg-amber-600 text-white':'text-gray-500'}`}>{t.custTagStats}</button>
      <button onClick={()=>setMode('search')} className={`flex-1 py-1.5 rounded-md text-xs font-semibold ${mode==='search'?'bg-amber-600 text-white':'text-gray-500'}`}>{t.custSearchBtn}</button>
    </div>
    {mode==='tags'&&(<div className="space-y-2">
      {tags.length===0&&<p className="text-sm text-gray-500 text-center py-8">{t.custNoTags}</p>}
      {tags.length>0&&<div className="flex flex-wrap gap-1.5">{tags.map(({tag,count})=>(<button key={tag} onClick={()=>setOpenTag(openTag===tag?null:tag)} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${openTag===tag?'bg-amber-600 text-white':'bg-white/[0.05] text-gray-300'}`}>#{tag}<span className="text-[10px] opacity-70">({count})</span></button>))}</div>}
      {openTag&&<div className="space-y-1.5 pt-2"><p className="text-xs text-gray-500">#{openTag}（{tagSlips.length}）</p>{tagSlips.map(slipRow)}</div>}
    </div>)}
    {mode==='search'&&(<div className="space-y-2">
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.custSearchPlaceholder} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/>
      {q&&found.length===0&&<p className="text-sm text-gray-500 text-center py-6">{t.noMatch}</p>}
      <div className="space-y-1.5">{found.map(slipRow)}</div>
    </div>)}
  </div>);
}
// 圖表分頁(老師端:讀stats.json快照顯示班別比/性別比)
function SettingsPage({settings,onUpdate,t,theme,setTheme}){
  const[form,setForm]=useState({...settings});
  const[saved,setSaved]=useState(false);
  const[subTab,setSubTab]=useState('home');const[navLock,setNavLock]=useState(false);
  const devId=getDeviceId();
  const[connMode,setConnMode]=useState(null);
  const[connInput,setConnInput]=useState('');
  const[connStatus,setConnStatus]=useState('');
  const[stores,setStores]=useState([]);
  const[basicCode,setBasicCode]=useState('');
  const[storeCode,setStoreCode]=useState('');
  const lang=t===T.zh?'zh':'vi';
  useEffect(()=>{loadStores().then(setStores)},[]);
  const upd=(patch)=>{const ns={...form,...patch};setForm(ns);onUpdate(ns)};
  const[goAuthChecking,setGoAuthChecking]=useState(false);
  const goAuth=async()=>{
    if(goAuthChecking)return;setGoAuthChecking(true);
    let hasPerm=false;
    try{const sup=LS.get('supervisor-'+settings.code);if(sup&&sup.status==='approved')hasPerm=true}catch{}
    if(!hasPerm){try{const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),4000);const res=await fetch('./admin.cfg',{cache:'no-store',signal:ctrl.signal});clearTimeout(timer);if(res.ok){const text=(await res.text()).trim();const lines=text.split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));const myHash=adminHash(settings.code);hasPerm=lines.some(l=>{const parts=l.split(':');const h=parts.length>=2?parts[parts.length-1]:parts[0];return h===myHash})}}catch{}}
    location.href='./auth.html#lang='+(settings.lang||'zh')+(hasPerm?'&auto=1':'');
  };
  const TABS=[['home',t.tabHome2],['basic',t.tabBasic],['store',t.tabStore],['book',t.tabBook2],['cust',t.tabCust],['notice',t.tabNotice],['chart',t.tabChart],['suggest',t.tabSuggest],['backup',t.tabBackup],['violation',t.tabViolation],['manage',t.tabManage]];
  const fld=(label,key,opt)=>(<div><label className="text-xs text-gray-400 mb-1 block">{label}{opt&&<span className="text-[10px] text-gray-600 ml-1">({t.optional})</span>}</label><input value={form[key]||''} onChange={e=>upd({[key]:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/></div>);
  const Construction=()=>(<div className="flex flex-col items-center justify-center py-20 text-center"><svg className="w-12 h-12 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg><p className="text-sm text-gray-500">{t.underConstruction}</p></div>);
  // 產生申請碼:把欄位加密,標記變動
  const isBound=()=>{try{return localStorage.getItem('uuid-bound-'+settings.code)==='1'}catch{return false}};
  const[reqErr,setReqErr]=useState('');
  // 必填檢核:* 欄位
  const checkRequired=(cat,fields)=>{const miss=[];if(cat==='basic'){if(!fields.gender)miss.push(t.gender);if(!fields.addrCity)miss.push(t.city);if(!fields.addrDist)miss.push(t.district);}else if(cat==='store'){if(!fields.shift)miss.push(t.shift);if(!fields.workStart)miss.push(t.workStart);if(!fields.workEnd)miss.push(t.workEnd);if(!fields.preg)miss.push(t.pregClient);if(!fields.oil)miss.push(t.oilLabel)}return miss};
  const genCode=(cat,fields,setter)=>{const miss=checkRequired(cat,fields);if(miss.length){setReqErr(t.reqMissing+'：'+miss.join('、'));setter('');setTimeout(()=>setReqErr(''),4000);return}setReqErr('');try{const enc=genReqCode(cat,settings.code,devId,fields,isBound());setter(enc)}catch(e){setter('')}};
  // 貼確認碼:驗證通過→更新本機快照(清未確認)+若確認碼大寫設已綁定
  const[confirmInput,setConfirmInput]=useState('');
  const[confirmMsg,setConfirmMsg]=useState('');
  const applyConfirm=(cat,fields,snapKey)=>{const ok=verifyConfirmCode(confirmInput,cat,settings.code,fields);if(ok){const snap={...fields};if(cat==='store'){snap.storeSel=form.storeSel||'';}const ns={...settings,...form,[snapKey]:snap};onUpdate(ns);if(confirmCodeIsBound(confirmInput)){try{localStorage.setItem('uuid-bound-'+settings.code,'1')}catch{}}setConfirmMsg('ok');setConfirmInput('');setTimeout(()=>setConfirmMsg(''),3000)}else{setConfirmMsg('fail');setTimeout(()=>setConfirmMsg(''),3000)}};
  const onWorkStartChange=(hh)=>{let patch={workStart:hh};if(hh!==''){const h=Number(hh);const eh=(h+12)%24;patch.workEnd=String(eh).padStart(2,'0')+':00';}upd(patch)};
  // 上工預設現在小時(僅未設過時)
  useEffect(()=>{if(!form.workStart&&!settings.workStart){const nowH=new Date().getHours();const eh=(nowH+12)%24;upd({workStart:String(nowH).padStart(2,'0')+':00',workEnd:String(eh).padStart(2,'0')+':00'})}},[]);
  // 前次主管確認值快照(只有確認過才有,新老師沒有→不顯示紅字)
  const confirmedP=settings.confirmedProfile||null;
  const confirmedS=settings.confirmedStore||null;
  // 是否為主管(有連線能力):主管改了直接存,不需確認流程,不亮❗
  const isSupervisor=useMemo(()=>{const gh=getGHConfig();return!!(gh&&gh.token)},[]);
  // 基資/店資是否有未確認變動(主管除外)
  const profileFields=['gender','nameZh','nameVi','phone','email','addrCity','addrDist','addrDetail','school','major','schoolType','permitNo','permitDate','permitExpiry','permitOrg'];
  const storeFields=['storeSel','shift','workStart','workEnd','workNote','unitPrice','preg','oil','techMentor','lockerNo'];
  const hasChg=(snapshot,fields,src)=>{if(isSupervisor)return false;if(!snapshot)return fields.some(k=>{const v=src[k];return v!==undefined&&v!==''&&v!==null});return fields.some(k=>(snapshot[k]||'')!==((src[k]!==undefined?src[k]:'')||''))};
  const basicChanged=hasChg(confirmedP,profileFields,form);
  const storeChanged=hasChg(confirmedS,storeFields,form);
  const anyChanged=basicChanged||storeChanged;
  // 工作證到期提醒:到期前30天內或已過期
  const permitExpiring=(()=>{if(!form.permitExpiry)return false;const exp=new Date(form.permitExpiry);const now=new Date();const days=(exp-now)/86400000;return days<=30})();
  const prevHint=(snapshot,key,curVal)=>{if(!snapshot||!(key in snapshot))return null;const prev=snapshot[key];if((prev||'')===(curVal||''))return null;return<p className="text-[11px] text-red-400 mt-1">{t.prevConfirmed}：{prev||'—'}</p>};
  const fldP=(label,key,opt,snapshot)=>(<div><label className="text-xs text-gray-400 mb-1 block">{label}{opt&&<span className="text-[10px] text-gray-600 ml-1">({t.optional})</span>}</label><input value={form[key]||''} onChange={e=>upd({[key]:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/>{prevHint(snapshot,key,form[key])}</div>);
  return(
    <div className="flex h-full fi">
      <div className="flex-shrink-0 w-12 border-r border-white/[0.06] py-3 space-y-0.5 overflow-y-auto no-sb">
        {TABS.map(([id,label])=>{
          const showAlert=(id==='basic'&&(basicChanged||permitExpiring))||(id==='store'&&storeChanged);
          const noticeCount=id==='notice'?(0):0; // 公告未讀數框架,現為0不顯示
          return(
          <button key={id} disabled={navLock&&id==='manage'} onClick={()=>{if(id==='manage'){if(navLock)return;setSubTab('manage');setNavLock(true);setTimeout(()=>{location.href='./auth.html#lang='+(settings.lang||'zh')},150);return}setSubTab(id)}} className={`relative w-full px-0.5 py-2.5 text-[11px] font-semibold text-center leading-tight ${subTab===id?'text-amber-400 border-r-2 border-amber-400 bg-amber-600/5':'text-gray-500'} ${navLock&&id==='manage'?'opacity-50':''}`}>
            {id==='manage'&&navLock?'...':label}
            {showAlert&&<span className="absolute -top-0.5 right-0 text-red-500 text-[9px] leading-none">❗</span>}
            {noticeCount>0&&<span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">{noticeCount}</span>}
          </button>);
        })}
      </div>
      <div className="flex-1 w-full overflow-y-auto p-4 pb-8 space-y-5 min-w-0">
      {subTab==='home'&&(<div className="space-y-5 fi">
        <h2 className="text-lg font-bold text-gray-100">{t.homeSettings}</h2>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.year}</label>
          <div className="flex items-center gap-3"><button onClick={()=>upd({year:form.year-1})} className="w-12 h-12 rounded-xl bg-white/[0.04] text-gray-300 text-2xl active:bg-white/[0.08]">−</button><span className="text-2xl font-bold text-gray-100 flex-1 text-center tabular-nums">{form.year}</span><button onClick={()=>upd({year:form.year+1})} className="w-12 h-12 rounded-xl bg-white/[0.04] text-gray-300 text-2xl active:bg-white/[0.08]">+</button></div>
        </div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.theme}</label>
          <div className="grid grid-cols-4 gap-2">{[['pink',t.themePink,'#fce4f6'],['black',t.themeBlack,'#030712'],['gray',t.themeGray,'#1f2937'],['white',t.themeWhite,'#f9fafb']].map(([k,l,c])=>(<button key={k} onClick={()=>setTheme(k)} className={`py-2.5 rounded-xl text-xs font-semibold border-2 ${theme===k?'border-amber-500':'border-transparent'}`} style={{backgroundColor:c,color:k==='black'||k==='gray'?'#ccc':'#333'}}>{l}</button>))}</div>
        </div>
        {(()=>{const ghLocal=getGHConfig();const hasConn=!!(ghLocal&&ghLocal.token);return(
          <div className="space-y-2"><label className="text-xs text-gray-400 mb-1 block">{t.serviceStatus}</label>
            <div className="bg-white/[0.04] rounded-xl px-4 py-3 flex items-center justify-between"><span className="text-sm text-gray-400">{t.connection}</span><span className="text-sm">{hasConn?t.connOnline:t.connOffline}</span></div>
            {!hasConn&&!connMode&&(<button onClick={()=>setConnMode('apply')} className="w-full py-2.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 text-sm font-semibold active:bg-amber-600/30">{t.connApply}</button>)}
            {connMode==='apply'&&(<div className="space-y-3 fi">
              <div className="flex justify-center"><div className="bg-white p-2.5 rounded-xl"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(settings.code+':'+devId)}`} alt="QR" className="w-40 h-40"/></div></div>
              <p className="text-[10px] text-gray-600 text-center font-mono select-all break-all">{settings.code}:{devId}</p><button onClick={()=>{location.href='https://line.me/R/share?text='+encodeURIComponent(t.lineConnReqPrefix+'\n'+settings.code+':'+devId)}} className="w-full py-2.5 rounded-xl text-white text-sm font-bold bg-[#06C755] active:bg-[#05b34c]">{t.sendViaLine}</button>
              <div><label className="text-xs text-gray-500 mb-1 block">{t.connCode}</label><textarea value={connInput} onChange={e=>setConnInput(e.target.value)} rows={2} placeholder={t.connInput} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500 resize-none"/></div>
              <div className="flex gap-2"><button onClick={()=>{setConnMode(null);setConnInput('');setConnStatus('')}} className="flex-1 py-2.5 bg-white/[0.04] rounded-xl text-gray-500 text-sm">{t.cancel}</button><button onClick={()=>{const ghCfg=verifyActToken(connInput.trim(),settings.code,devId);if(ghCfg){saveGHConfigLocal(ghCfg);setConnStatus(t.connOk);setConnMode(null);setConnInput('')}else{setConnStatus(t.connFail)}}} className="flex-1 py-2.5 bg-amber-600 rounded-xl text-white text-sm font-bold">{t.confirm}</button></div>
              {connStatus&&<p className={`text-xs text-center ${connStatus.includes('✓')?'text-emerald-400':'text-red-400'}`}>{connStatus}</p>}
            </div>)}
          </div>
        )})()}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 space-y-2">
          <p className="text-sm text-gray-300 font-semibold">{t.privacyTitle}</p>
          <p className="text-[13px] text-gray-400 leading-relaxed">{t.privacyBody}</p>
          <p className="text-[13px] text-gray-400 leading-relaxed">{t.browserNote}</p>
          <p className="text-[13px] text-gray-400 leading-relaxed">{t.myBookingNote}</p>
          <p className="text-[13px] text-red-400 leading-relaxed">{t.backupReminder}</p>
        </div>
      </div>)}

      {subTab==='basic'&&(<div className="space-y-4 fi">
        <h2 className="text-lg font-bold text-gray-100">{t.secBasic}</h2>
        {basicChanged&&<div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"><p className="text-xs text-red-400">❗ {t.needConfirm}</p></div>}
        {permitExpiring&&<div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"><p className="text-xs text-red-400">❗ {t.permitExpiringSoon}{form.permitExpiry?'：'+form.permitExpiry:''}</p></div>}
        <div><label className="text-xs text-gray-400 mb-1 block">{t.teacherCode}</label><div className="bg-white/[0.04] rounded-xl px-3 py-2.5 text-base text-gray-300 font-mono">{settings.code}</div></div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.gender}<span className="text-red-400 ml-0.5">*</span></label>
          <div className="grid grid-cols-2 gap-2">{[['M',t.genderM],['F',t.genderF]].map(([g,l])=>(<button key={g} onClick={()=>upd({gender:g})} className={`py-2.5 rounded-xl text-sm font-semibold ${form.gender===g?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{l}</button>))}</div>
        </div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.language}</label>
          <div className="grid grid-cols-2 gap-2">{[['zh','中文'],['vi','Tiếng Việt']].map(([c,l])=>(<button key={c} onClick={()=>upd({lang:c})} className={`py-2.5 rounded-xl text-sm font-semibold ${form.lang===c?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{l}</button>))}</div>
        </div>
        {fldP(t.nameZh,'nameZh',false,confirmedP)}
        {fldP(t.nameVi,'nameVi',false,confirmedP)}
        <div><label className="text-xs text-gray-400 mb-1 block">{t.phone2}</label><input value={form.phone||''} onChange={e=>{let v=e.target.value.split('').filter(ch=>ch>='0'&&ch<='9').join('').slice(0,10);if(v.length>7)v=v.slice(0,4)+'-'+v.slice(4,7)+'-'+v.slice(7);else if(v.length>4)v=v.slice(0,4)+'-'+v.slice(4);upd({phone:v})}} inputMode="tel" placeholder="09xx-xxx-xxx" className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/>{prevHint(confirmedP,'phone',form.phone)}</div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.email}</label><input value={form.email||''} onChange={e=>upd({email:e.target.value})} inputMode="email" placeholder="example@mail.com" className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/>{prevHint(confirmedP,'email',form.email)}</div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.address}</label>
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-[10px] text-gray-400 mb-0.5 block">{t.city}<span className="text-red-400">*</span></span><select value={form.addrCity||''} onChange={e=>upd({addrCity:e.target.value,addrDist:''})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-amber-500"><option value="">{t.selectCity}</option>{Object.keys(TW_REGIONS).map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div><span className="text-[10px] text-gray-400 mb-0.5 block">{t.district}<span className="text-red-400">*</span></span>{form.addrCity&&TW_REGIONS[form.addrCity]&&TW_REGIONS[form.addrCity].length>0?(<select value={form.addrDist||''} onChange={e=>upd({addrDist:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-amber-500"><option value="">{t.selectDist}</option>{TW_REGIONS[form.addrCity].map(d=><option key={d} value={d}>{d}</option>)}</select>):(<input value={form.addrDist||''} onChange={e=>upd({addrDist:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-amber-500"/>)}</div>
          </div>
          <div className="mt-2"><span className="text-[10px] text-gray-500 mb-0.5 block">{t.addrDetail}</span><input value={form.addrDetail||''} onChange={e=>upd({addrDetail:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/></div>
        </div>
        {/* 外籍員工區 */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 space-y-3">
          <p className="text-xs text-amber-400 font-semibold">{t.foreignSection}</p>
          {fldP(t.permitNoLabel,'permitNo',false,confirmedP)}
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[11px] text-gray-400 mb-1 block">{t.permitDate}</label><div className="flex gap-1"><input type="date" value={form.permitDate||''} onChange={e=>upd({permitDate:e.target.value})} className="flex-1 min-w-0 bg-white/[0.06] border border-white/[0.08] rounded-xl px-1 py-2 text-[10px] text-gray-100 focus:outline-none focus:border-amber-500" style={{colorScheme:'dark'}}/>{form.permitDate&&<button onClick={()=>upd({permitDate:''})} className="w-7 flex-shrink-0 rounded-lg bg-white/[0.06] text-gray-500 text-xs active:bg-red-500/20">✕</button>}</div></div>
            <div><label className="text-[11px] text-gray-400 mb-1 block">{t.permitExpiry}</label><div className="flex gap-1"><input type="date" value={form.permitExpiry||''} onChange={e=>upd({permitExpiry:e.target.value})} className="flex-1 min-w-0 bg-white/[0.06] border border-white/[0.08] rounded-xl px-1 py-2 text-[10px] text-gray-100 focus:outline-none focus:border-amber-500" style={{colorScheme:'dark'}}/>{form.permitExpiry&&<button onClick={()=>upd({permitExpiry:''})} className="w-7 flex-shrink-0 rounded-lg bg-white/[0.06] text-gray-500 text-xs active:bg-red-500/20">✕</button>}</div></div>
          </div>
          {prevHint(confirmedP,'permitDate',form.permitDate)}
          <div><label className="text-xs text-gray-400 mb-1 block">{t.permitOrgOpt}</label><select value={form.permitOrg||''} onChange={e=>upd({permitOrg:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"><option value="">—</option><option value={t.orgWDA}>{t.orgWDA}</option><option value={t.orgNIA}>{t.orgNIA}</option><option value={t.orgOther}>{t.orgOther}</option></select>{prevHint(confirmedP,'permitOrg',form.permitOrg)}</div>
          <div><label className="text-xs text-gray-400 mb-1 block">{t.schoolType}</label><select value={form.schoolType||'uni'} onChange={e=>upd({schoolType:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"><option value="lang">{t.schoolTypeLang}</option><option value="uni">{t.schoolTypeUni}</option><option value="master">{t.schoolTypeMaster}</option><option value="phd">{t.schoolTypePhd}</option></select></div>
          <div className="grid grid-cols-2 gap-2"><div>{fldP(t.school,'school',false,confirmedP)}</div><div>{fldP(t.major,'major',false,confirmedP)}</div></div>
        </div>
        <div className="pt-2 space-y-2">
          <button onClick={()=>genCode('basic',{nameZh:form.nameZh,nameVi:form.nameVi,phone:form.phone,email:form.email,addrCity:form.addrCity,addrDist:form.addrDist,addrDetail:form.addrDetail,school:form.school,major:form.major,schoolType:form.schoolType,permitNo:form.permitNo,permitDate:form.permitDate,permitExpiry:form.permitExpiry,permitOrg:form.permitOrg,gender:form.gender},setBasicCode)} className="w-full py-3 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700">{t.basicUpdateCode}</button>
          {reqErr&&<p className="text-xs text-red-400 text-center fi">{reqErr}</p>}
          {basicCode&&(<div className="space-y-2 fi">
            <div className="flex justify-center"><div className="bg-white p-2.5 rounded-xl"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(basicCode)}`} alt="QR" className="w-44 h-44"/></div></div>
            <div className="grid grid-cols-2 gap-2"><button onClick={()=>{navigator.clipboard.writeText(basicCode).catch(()=>{})}} className="py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 text-sm font-medium">{t.copyBtn}</button><button onClick={()=>{location.href='https://line.me/R/share?text='+encodeURIComponent(t.lineReqPrefix+'\n'+basicCode)}} className="py-2.5 rounded-xl text-white text-sm font-bold bg-[#06C755] active:bg-[#05b34c]">{t.sendViaLine}</button></div>
            <div><label className="text-xs text-gray-500 mb-1 block">{t.basicConfirmCode}</label><input value={confirmInput} onChange={e=>setConfirmInput(e.target.value)} placeholder={t.basicConfirmCode} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500"/></div>
            <button onClick={()=>applyConfirm('basic',{nameZh:form.nameZh,nameVi:form.nameVi,phone:form.phone,email:form.email,addrCity:form.addrCity,addrDist:form.addrDist,addrDetail:form.addrDetail,school:form.school,major:form.major,schoolType:form.schoolType,permitNo:form.permitNo,permitDate:form.permitDate,permitExpiry:form.permitExpiry,permitOrg:form.permitOrg,gender:form.gender},'confirmedProfile')} className="w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700">{t.confirm}</button>
            {confirmMsg==='ok'&&<p className="text-xs text-center text-emerald-400 fi">✓ {t.confirmSuccess}</p>}
            {confirmMsg==='fail'&&<p className="text-xs text-center text-red-400 fi">{t.confirmFail}</p>}
          </div>)}
        </div>
      </div>)}

      {subTab==='store'&&(<div className="space-y-4 fi">
        <h2 className="text-lg font-bold text-gray-100">{t.secStore}</h2>
        {storeChanged&&<div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"><p className="text-xs text-red-400">❗ {t.needConfirm}</p></div>}
        <div><label className="text-xs text-gray-400 mb-1 block">{t.teacherCode}</label><div className="bg-white/[0.04] rounded-xl px-3 py-2.5 text-base text-gray-300 font-mono">{settings.code}</div></div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.curStore}</label>
          <select value={form.storeSel||settings.store||''} onChange={e=>upd({storeSel:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"><option value="">—</option>{stores.map(s=><option key={s} value={s}>{s}</option>)}</select>
          {form.storeSel&&form.storeSel!==settings.store&&<p className="text-xs text-red-400 mt-1">{t.applyChange}：{form.storeSel}</p>}
        </div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.shift}<span className="text-red-400 ml-0.5">*</span></label>
          <div className="grid grid-cols-2 gap-2">{[['day',t.shiftDay],['night',t.shiftNight]].map(([s,l])=>(<button key={s} onClick={()=>upd({shift:s})} className={`py-2.5 rounded-xl text-sm font-semibold ${form.shift===s?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{l}</button>))}</div>
        </div>
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2"><label className="text-xs text-gray-400 mb-1 block">{t.workStart}<span className="text-red-400 ml-0.5">*</span></label><select value={form.workStart?String(Number(form.workStart.split(':')[0])):''} onChange={e=>onWorkStartChange(e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-1 py-2.5 text-sm text-center text-gray-100 focus:outline-none focus:border-amber-500"><option value="">--</option>{Array.from({length:24},(_,i)=><option key={i} value={i}>{String(i).padStart(2,'0')}:00</option>)}</select></div>
          <div className="col-span-2 col-start-4"><label className="text-xs text-gray-400 mb-1 block">{t.workEnd}<span className="text-red-400 ml-0.5">*</span></label><select value={form.workEnd?String(Number(form.workEnd.split(':')[0])):''} onChange={e=>upd({workEnd:e.target.value===''?'':String(Number(e.target.value)).padStart(2,'0')+':00'})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-1 py-2.5 text-sm text-center text-gray-100 focus:outline-none focus:border-amber-500"><option value="">--</option>{Array.from({length:24},(_,i)=><option key={i} value={i}>{String(i).padStart(2,'0')}:00</option>)}</select></div>
        </div>
        {confirmedS&&((confirmedS.workStart||'')!==(form.workStart||'')||(confirmedS.workEnd||'')!==(form.workEnd||''))&&<p className="text-[11px] text-red-400">{t.prevConfirmed}：{confirmedS.workStart||'—'} ~ {confirmedS.workEnd||'—'}</p>}
        <div><label className="text-xs text-gray-400 mb-1 block">{t.workNote}<span className="text-[10px] text-gray-600 ml-1">({t.optional})</span></label><textarea value={form.workNote||''} onChange={e=>upd({workNote:e.target.value})} rows={2} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 resize-none"/>{prevHint(confirmedS,'workNote',form.workNote)}</div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.unitPrice}</label>
          <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input type="number" inputMode="numeric" value={form.unitPrice} onChange={e=>upd({unitPrice:parseInt(e.target.value)||0})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-8 pr-3 py-3 text-base text-gray-100 focus:outline-none focus:border-amber-500"/></div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-2 block">{t.skills}</label>
          <div className="space-y-2">{SKILL_KEYS.map((k,i)=>({k,label:t[k],price:SKILL_PRICES[i]})).map(({k,label,price})=>{const checked=form.skills?.[k]||false;return(<button key={k} onClick={()=>upd({skills:{...(form.skills||{}),[k]:!checked}})} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${checked?'bg-white/[0.06] border border-amber-500/30':'bg-white/[0.02] border border-white/[0.06]'}`}><div className={`w-5 h-5 rounded flex items-center justify-center text-xs ${checked?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-700'}`}>{checked?'✓':''}</div><span className={`text-sm ${checked?'text-gray-200':'text-gray-500'}`}>{label}</span>{price!=null&&<span className="text-xs text-gray-600 ml-auto">${price}</span>}</button>)})}</div>
        </div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.pregClient}<span className="text-red-400 ml-0.5">*</span></label><div className="grid grid-cols-2 gap-2">{[['yes',t.accept],['no',t.reject]].map(([v,l])=>(<button key={v} onClick={()=>upd({preg:v})} className={`py-2.5 rounded-xl text-sm font-semibold ${form.preg===v?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{l}</button>))}</div></div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.oilLabel}<span className="text-red-400 ml-0.5">*</span></label><div className="grid grid-cols-2 gap-2">{[['yes',t.accept],['no',t.reject]].map(([v,l])=>(<button key={v} onClick={()=>upd({oil:v})} className={`py-2.5 rounded-xl text-sm font-semibold ${form.oil===v?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{l}</button>))}</div></div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.techMentor}</label><input value={form.techMentor||''} onChange={e=>upd({techMentor:e.target.value})} placeholder={t.techMentorPlaceholder} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/>{prevHint(confirmedS,'techMentor',form.techMentor)}</div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.lockerNo}</label><select value={form.lockerNo||''} onChange={e=>upd({lockerNo:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500"><option value="">--</option>{Array.from({length:100},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}{t===T.zh?'號':''}</option>)}</select>{prevHint(confirmedS,'lockerNo',form.lockerNo)}</div>
        <div className="pt-2 space-y-2">
          <button onClick={()=>genCode('store',{store:form.storeSel||settings.store,shift:form.shift,workStart:form.workStart,workEnd:form.workEnd,workNote:form.workNote,unitPrice:form.unitPrice,skills:form.skills,preg:form.preg,oil:form.oil,techMentor:form.techMentor,lockerNo:form.lockerNo},setStoreCode)} className="w-full py-3 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700">{t.storeUpdateCode}</button>
          {reqErr&&<p className="text-xs text-red-400 text-center fi">{reqErr}</p>}
          {storeCode&&(<div className="space-y-2 fi">
            <div className="flex justify-center"><div className="bg-white p-2.5 rounded-xl"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(storeCode)}`} alt="QR" className="w-44 h-44"/></div></div>
            <div className="grid grid-cols-2 gap-2"><button onClick={()=>{navigator.clipboard.writeText(storeCode).catch(()=>{})}} className="py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 text-sm font-medium">{t.copyBtn}</button><button onClick={()=>{location.href='https://line.me/R/share?text='+encodeURIComponent(t.lineReqPrefix+'\n'+storeCode)}} className="py-2.5 rounded-xl text-white text-sm font-bold bg-[#06C755] active:bg-[#05b34c]">{t.sendViaLine}</button></div>
            <div><label className="text-xs text-gray-500 mb-1 block">{t.storeConfirmCode}</label><input value={confirmInput} onChange={e=>setConfirmInput(e.target.value)} placeholder={t.storeConfirmCode} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500"/></div>
            <button onClick={()=>applyConfirm('store',{store:form.storeSel||settings.store,shift:form.shift,workStart:form.workStart,workEnd:form.workEnd,workNote:form.workNote,unitPrice:form.unitPrice,skills:form.skills,preg:form.preg,oil:form.oil,techMentor:form.techMentor,lockerNo:form.lockerNo},'confirmedStore')} className="w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700">{t.confirm}</button>
            {confirmMsg==='ok'&&<p className="text-xs text-center text-emerald-400 fi">✓ {t.confirmSuccess}</p>}
            {confirmMsg==='fail'&&<p className="text-xs text-center text-red-400 fi">{t.confirmFail}</p>}
          </div>)}
        </div>
      </div>)}

      {subTab==='book'&&(<div className="space-y-4 fi">
        <h2 className="text-lg font-bold text-gray-100">{t.myBooking2}</h2>
        <button onClick={()=>{location.href='./booking.html'}} className="w-full py-3.5 rounded-xl bg-amber-600/15 border border-amber-500/25 text-amber-400 text-sm font-semibold active:bg-amber-600/25 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          {t.booking}
        </button>
        {/* 同步店家預約資訊框架(尚無功能) */}
        <div className="pt-4 border-t border-white/[0.06] space-y-2">
          <p className="text-sm text-gray-400 font-medium">{t.syncStoreBooking}</p>
          <textarea rows={2} placeholder={t.connInput} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500 resize-none"/>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-sm flex items-center justify-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l-4-4m4 4l4-4"/></svg></button>
            <button className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-sm">{t.pasteBtn}</button>
          </div>
          <button disabled className="w-full py-2.5 rounded-xl bg-white/[0.03] text-gray-600 text-sm font-medium cursor-not-allowed">{t.syncBtn}{t.noFuncYet}</button>
        </div>
      </div>)}

      {subTab==='cust'&&<CustomerPage t={t} settings={settings}/>}
      {subTab==='notice'&&(<div className="fi"><h2 className="text-lg font-bold text-gray-100 mb-2">{t.noticeCenter}</h2><Construction/></div>)}
      {subTab==='chart'&&<ChartPage t={t} settings={settings}/>}
      {subTab==='suggest'&&(<div className="fi"><h2 className="text-lg font-bold text-gray-100 mb-2">{t.suggestBox}</h2><Construction/></div>)}

      {subTab==='backup'&&(<div className="space-y-4 fi">
        <h2 className="text-lg font-bold text-gray-100">{t.backupCenter}</h2>
        <BackupSection settings={settings} t={t}/>
      </div>)}

      {subTab==='violation'&&(<div className="space-y-6 fi">
        <div>
          <h2 className="text-lg font-bold text-gray-100 mb-3">{t.violationTitle}</h2>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-6 text-center"><p className="text-sm text-gray-500">{t.noViolation}</p></div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-400 font-medium">{t.violationCode}</p>
          <textarea rows={2} placeholder={t.connInput} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500 resize-none"/>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-sm flex items-center justify-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l-4-4m4 4l4-4"/></svg></button>
            <button className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-sm">{t.pasteBtn}</button>
          </div>
          <button className="w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700">{t.confirm}</button>
        </div>
        <div className="pt-4 border-t border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-100 mb-3">{t.dutyTitle}</h2>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-6 text-center"><p className="text-sm text-gray-500">{t.noDuty}</p></div>
        </div>
      </div>)}

      {subTab==='manage'&&(<div className="space-y-5 fi">
        <h2 className="text-lg font-bold text-gray-100">{t.manageCenter}</h2>
        {(()=>{const ghLocal=getGHConfig();const hasConn=!!(ghLocal&&ghLocal.token);return(
          <div className="space-y-3">
            <div className="flex items-center justify-between"><p className="text-sm text-gray-500 font-medium">{t.connection}</p><span className="text-xs">{hasConn?t.connOnline:t.connOffline}</span></div>
            {!hasConn&&!connMode&&(<button onClick={()=>setConnMode('apply')} className="w-full py-3 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 text-sm font-semibold active:bg-amber-600/30">{t.connApply}</button>)}
            {connMode==='apply'&&(<div className="space-y-3 fi">
              <div className="flex justify-center"><div className="bg-white p-2.5 rounded-xl"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(settings.code+':'+devId)}`} alt="QR" className="w-40 h-40"/></div></div>
              <p className="text-[10px] text-gray-600 text-center font-mono select-all break-all">{settings.code}:{devId}</p><button onClick={()=>{location.href='https://line.me/R/share?text='+encodeURIComponent(t.lineConnReqPrefix+'\n'+settings.code+':'+devId)}} className="w-full py-2.5 rounded-xl text-white text-sm font-bold bg-[#06C755] active:bg-[#05b34c]">{t.sendViaLine}</button>
              <div><label className="text-xs text-gray-500 mb-1 block">{t.connCode}</label><textarea value={connInput} onChange={e=>setConnInput(e.target.value)} rows={2} placeholder={t.connInput} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500 resize-none"/></div>
              <div className="flex gap-2"><button onClick={()=>{setConnMode(null);setConnInput('');setConnStatus('')}} className="flex-1 py-2.5 bg-white/[0.04] rounded-xl text-gray-500 text-sm">{t.cancel}</button><button onClick={()=>{const ghCfg=verifyActToken(connInput.trim(),settings.code,devId);if(ghCfg){saveGHConfigLocal(ghCfg);setConnStatus(t.connOk);setConnMode(null);setConnInput('')}else{setConnStatus(t.connFail)}}} className="flex-1 py-2.5 bg-amber-600 rounded-xl text-white text-sm font-bold">{t.confirm}</button></div>
              {connStatus&&<p className={`text-xs text-center ${connStatus.includes('✓')?'text-emerald-400':'text-red-400'}`}>{connStatus}</p>}
            </div>)}
          </div>
        )})()}
        <div className="pt-4 border-t border-white/[0.06] space-y-2">
          <button onClick={goAuth} disabled={goAuthChecking} className="w-full py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 text-sm font-semibold active:bg-white/[0.08] flex items-center justify-center gap-2 disabled:opacity-60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            {goAuthChecking?t.checking||'檢查中…':t.admin+' / '+t.supervisor}
          </button>
        </div>
        <div className="text-[10px] text-gray-700 font-mono break-all">{t.deviceId}: {devId}</div>
      </div>)}
      </div>
    </div>
  );
}

/* ══════════ Icons ══════════ */
const IC={
  home:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/></svg>,
  monthly:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  yearly:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  settings:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
};

/* ══════════ App ══════════ */

// 掛到全域供 index.html 的 App 取用
window.__V=Object.assign(window.__V||{},{ChartPage,CustomerPage,BackupSection,SettingsPage});
