/* 拒接名單 2.0(blacklist2.js)—— 由 safety-report.html 在 safety2.js 之後載入,走同一個 LIFF 端點:
     ?b2=l     拒接名單(搜尋、生效中/待核准)
     ?b2=new   新增拒接
   後端:gas-blacklist2.gs.txt(b2List / b2Add / b2Decide / b2Revoke / b2StoreBlock / b2Mode / b2ModeSet),與舊系統共用 Blacklist 工作表。
   進頁面就把名單下載到本機(有權限者),之後搜尋都在本機;每次開啟頁面同步一次,偵測到離職/無權限就清掉本機名單。
   共用元件來自 window.S2Core。 */
(function(){
const{useState,useEffect}=React;
const C=window.S2Core;
if(!C){console.error('blacklist2: S2Core missing');return;}
const{api,useLoad,Box,Card,Btn,Loading,Msg,NeedUser,go,barOf,cclear,peek,CACHEABLE,WRITE_CLEAR}=C;
const Chip=C.Chip||(({on,children,onClick})=>(<button onClick={onClick} className={'px-4 py-2 rounded-full border text-sm '+(on?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-300')}>{children}</button>));
const titleName=(v)=>{try{return (window.MP&&window.MP.bookTitleName)?window.MP.bookTitleName(v,'zh'):(v||'');}catch(_e){return v||'';}};

if(CACHEABLE.indexOf('b2List')<0)CACHEABLE.push('b2List'); // 切頁預設用本機名單;每次開頁面同步一次
['b2Add','b2Edit','b2Decide','b2Revoke','b2StoreBlock','b2Level','b2AskDetail','b2AnswerDetail'].forEach(a=>{WRITE_CLEAR[a]=['b2List'];});

// ───────── 搜尋(本機) ─────────
// 數字部分:手機開頭(09…)或末幾碼;文字部分:姓名/稱謂/原因/老師編號。順序、空白不拘:「林 870」「870 林」「0912林」都可以。
// 文字有多個字時(例如「林李」),先找包含整串的;找不到再退而求其次,包含其中任一字的也列出。
function b2Match(rows,q){
  const raw=String(q||'').trim();if(!raw)return rows;
  const d=raw.replace(/\D/g,'');const t=raw.replace(/[\d\s]/g,'').toLowerCase();
  let r=rows;
  if(d)r=r.filter(x=>{const ph=String(x.custPhone||'').replace(/\D/g,'');return ph.indexOf(d)===0||(d.length>=2&&ph.slice(-d.length)===d);});
  if(t){
    const hay=x=>(String(x.custName||'')+titleName(x.custTitle)+String(x.custTitle||'')+String(x.reason||'')+String(x.teacherCode||'')).toLowerCase();
    const full=r.filter(x=>hay(x).indexOf(t)>=0);
    if(full.length>0||t.length<2)return full;
    const chars=t.split('');
    return r.filter(x=>{const nm=(String(x.custName||'')+titleName(x.custTitle)).toLowerCase();return chars.some(c=>nm.indexOf(c)>=0);});
  }
  return r;
}

// ───────── 進頁面同步 ─────────
function clearLocalB2(){try{cclear(['b2List']);}catch(_e){}}
function b2SyncOnce(){
  if(!window.__b2SyncP)window.__b2SyncP=api('b2List',{},true).then(r=>{
    if(r&&(r.left||r.noPerm)){clearLocalB2();return{denied:true,msg:r.error};}
    return{ok:!!(r&&r.ok)};
  }).catch(()=>({ok:false}));
  return window.__b2SyncP;
}
function SyncGate({children,route}){
  const have=!!peek('b2List',{});
  const[s,setS]=useState(window.__b2Done||null);
  useEffect(()=>{let dead=false;b2SyncOnce().then(r=>{window.__b2Done=r;if(!dead)setS(r);});return()=>{dead=true;};},[]);
  if(s&&s.denied)return(<Msg text={(s.msg||'沒有權限')+'\n本機的拒接名單已清除'}/>);
  if(!s&&!have)return(<Loading text="載入拒接名單中…"/>);
  return route==='l'?<React.Fragment key={s?'synced':'init'}>{children}</React.Fragment>:children;
}

function Blacklist2Routes(){
  const q=new URLSearchParams(location.search);const p=q.get('b2')||'l';
  return(<NeedUser render={(me)=><SyncGate route={p}>{p==='set'?<SetPage/>:p==='new'?<AddPage/>:<ListPage me={me}/>}</SyncGate>}/>);
}

// 手機顯示:10碼=0912-345-678;隱藏模式(本機設定)=0912-***-***。搜尋仍用完整號碼
const MASK_KEY='b2:maskPhone';
const getMask=()=>{try{return localStorage.getItem(MASK_KEY)==='1';}catch(_e){return false;}};
const setMaskPref=(on)=>{try{localStorage.setItem(MASK_KEY,on?'1':'0');}catch(_e){}};
const fmtPhone=(ph,mask)=>{const d=String(ph||'').replace(/\D/g,'');
  if(d.length===10)return mask?d.slice(0,4)+'-***-***':d.slice(0,4)+'-'+d.slice(4,7)+'-'+d.slice(7);
  return mask?d.slice(0,4)+'-'+'*'.repeat(Math.max(d.length-4,0)):(d||String(ph||''));};
const fmtUntil=(ms)=>{const d=new Date(ms);const p=n=>String(n).padStart(2,'0');return (d.getMonth()+1)+'/'+d.getDate()+' '+p(d.getHours())+':'+p(d.getMinutes());};

// 手機輸入格式 0912-345-678（輸入時自動補 -，送出時只取數字）
const fmtPhoneIn=(v)=>{const d=String(v||'').replace(/\D/g,'').slice(0,10);return d.length>7?d.slice(0,4)+'-'+d.slice(4,7)+'-'+d.slice(7):d.length>4?d.slice(0,4)+'-'+d.slice(4):d;};
const LEVELS=[{v:'p',n:'老師個人'},{v:'store',n:'單店拒接'},{v:'all',n:'全店拒接'}];
const levelName=(v)=>(LEVELS.find(x=>x.v===(v||''))||{n:'未分級'}).n;
const LEVEL_HINT={p:'只有「拒接老師編號」內的老師，以及建檔店面的主管／櫃台看得到',store:'建檔店面的主管及櫃台看得到',all:'所有店的主管及櫃台都看得到'};
function EditForm({r,onClose,onSaved}){
  const[phone,setPhone]=useState(fmtPhoneIn(r.custPhone));const[name,setName]=useState(r.custName||'');const[title,setTitle]=useState(r.custTitle||'');
  const[reason,setReason]=useState(r.reason||'');const[svc,setSvc]=useState(r.svc||'');const[startAt,setStartAt]=useState(r.startAt||'');
  const[codes,setCodes]=useState(splitCodes(r.teacherCode));const[busy,setBusy]=useState(false);const[err,setErr]=useState('');
  const titles=(window.MP&&window.MP.BOOK_TITLES)||[];
  const save=async()=>{
    setErr('');const digits=phone.replace(/\D/g,'');
    if(!/^\d{8,12}$/.test(digits)){setErr('請輸入正確的手機號碼');return;}
    setBusy(true);const x=await api('b2Edit',{reqId:r.reqId,phone:digits,custName:name.trim(),custTitle:title,reason:reason.trim(),svc:svc.trim(),startAt:startAt.trim(),teacherCodes:codes.join(',')});setBusy(false);
    if(x&&x.ok)onSaved();else setErr((x&&x.error)||'儲存失敗');
  };
  const inp="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white";
  return(<div className="space-y-2 rounded-xl border border-violet-700 p-3">
    <p className="text-sm font-bold text-white">✏️ 編輯</p>
    <input value={phone} onChange={e=>setPhone(fmtPhoneIn(e.target.value))} inputMode="tel" placeholder="0912-345-678" className={inp}/>
    <div className="flex gap-2"><input value={name} onChange={e=>setName(e.target.value)} maxLength={30} placeholder="姓名" className={inp+" flex-1 min-w-0"}/>
      <div className="flex gap-1">{titles.filter(x=>x.v==='sir'||x.v==='ms').map(x=>(<Chip key={x.v} on={title===x.v} onClick={()=>setTitle(title===x.v?'':x.v)}>{x.zh}</Chip>))}</div></div>
    <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3} maxLength={200} placeholder="拒接原因" className={inp}/>
    <p className="text-xs text-gray-400">拒接老師編號</p>
    <CodeInput list={codes} setList={setCodes}/>
    <input value={svc} onChange={e=>setSvc(e.target.value)} placeholder="服務項目" className={inp}/>
    <input value={startAt} onChange={e=>setStartAt(e.target.value)} placeholder="事發時段" className={inp}/>
    {err&&<p className="text-xs text-red-400">{err}</p>}
    <div className="flex gap-2"><Btn loading={busy} onClick={save}>儲存</Btn><Btn color="bg-gray-700 text-white" onClick={onClose}>取消</Btn></div>
  </div>);
}

function ListPage({me}){
  const[st,reload]=useLoad('b2List',{});
  const[open,setOpen]=useState('');const mask=getMask();const[editing,setEditing]=useState('');const[grp,setGrp]=useState('none');const[pg,setPg]=useState(1);const[tab,setTab]=useState('approved');const[q,setQ]=useState('');const[busy,setBusy]=useState('');const[err,setErr]=useState('');
  if(st.loading&&!st.data)return(<Loading/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const d=st.data;
  const inbox=d.inbox||[];
  const list=tab==='inbox'?inbox:b2Match(tab==='approved'?d.approved:d.pending,q);
  const PER=5;
  // 分群:依拒接級距 / 依拒接老師（一筆有多位老師時，每位老師下各出現一次）
  let rowsG=list;
  if(tab!=='inbox'&&grp!=='none'){
    const out=[];
    if(grp==='level'){
      ['all','store','p',''].forEach(v=>list.filter(r=>(r.level||'')===v).forEach(r=>out.push({r:r,g:levelName(v)})));
    }else{
      const m={};const order=[];
      list.forEach(r=>{const cs=r.detail===false?[]:splitCodes(r.teacherCode);(cs.length?cs:['']).forEach(c=>{if(!m[c]){m[c]=[];order.push(c);}m[c].push(r);});});
      order.sort((a,b)=>(a===''?1:0)-(b===''?1:0)||(Number(a)||0)-(Number(b)||0)||(a<b?-1:a>b?1:0));
      order.forEach(c=>m[c].forEach(r=>out.push({r:r,g:c?c+' 號老師':'未指定老師'})));
    }
    rowsG=out;
  }else rowsG=list.map(r=>({r:r,g:''}));
  const pages=Math.max(1,Math.ceil(rowsG.length/PER));const cur=Math.min(pg,pages);
  const shown=rowsG.slice((cur-1)*PER,cur*PER);
  const pager=pages>1&&(<div className="flex items-center justify-center gap-3 py-2">
    <button disabled={cur<=1} onClick={()=>setPg(cur-1)} className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 text-white disabled:opacity-30">‹</button>
    <span className="text-sm text-gray-300">{cur} / {pages}</span>
    <button disabled={cur>=pages} onClick={()=>setPg(cur+1)} className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 text-white disabled:opacity-30">›</button></div>);
  const run=async(key,action,params,confirmMsg)=>{
    if(confirmMsg&&!window.confirm(confirmMsg))return;
    setBusy(key);setErr('');const r=await api(action,params);setBusy('');
    if(r&&r.ok)reload();else setErr((r&&r.error)||'操作失敗');
  };
  const card=(r)=>{const isOpen=open===r.reqId;return(<Card key={r.reqId} className="space-y-1">
    <button type="button" onClick={()=>setOpen(isOpen?'':r.reqId)} className="w-full flex items-center gap-x-2 text-left">
      <span className="text-gray-500 text-xs w-3">{isOpen?'▾':'▸'}</span>
      <span className="text-white font-bold">{(r.custName||'').charAt(0)||'？'}{r.custTitle?titleName(r.custTitle):''}</span>
      <span className="text-sm text-gray-400 flex-1">{fmtPhone(r.custPhone,mask&&!isOpen)}{r.detail!==false&&splitCodes(r.teacherCode).length>0&&<span className="text-gray-300">　{splitCodes(r.teacherCode).join(' ')}</span>}</span>
      <span className={'text-xs text-white rounded-full px-2 py-0.5 '+(r.level==='all'?'bg-red-600':r.level==='store'?'bg-orange-600':r.level==='p'?'bg-sky-700':'bg-gray-600')}>{levelName(r.level)}</span>
    </button>
    {isOpen&&<div className="space-y-1 pt-1 border-t border-gray-800">
    {r.detail!==false&&<p className="text-sm text-gray-200">姓名：{r.custName||'（姓名不詳）'}</p>}
    {r.ownerStore&&<p className="text-xs text-gray-500">建檔店面：{r.ownerStore}</p>}
    {r.detail===false?(<div className="pt-1">
      {r.reqStatus==='pending'?<p className="text-xs text-amber-300">⏳ 已向 {r.ownerStore} 提出查詢，等候同意</p>
        :<div>{r.reqStatus==='rejected'&&<p className="text-xs text-gray-400 pb-1">上次查詢被婉拒，可再次提出</p>}
          <button disabled={busy===r.reqId} onClick={()=>run(r.reqId,'b2AskDetail',{reqId:r.reqId},'向 '+r.ownerStore+' 查詢這筆的拒接原因等詳細資料？對方主管同意後才會顯示。')} className="w-full py-2 rounded-xl text-sm font-bold bg-sky-700 text-white disabled:opacity-50">向 {r.ownerStore} 查詢詳情</button></div>}
    </div>):(<p className="text-sm text-gray-200">拒接原因：{r.reason||'（舊名單，原因不可考）'}</p>)}
    {r.detail!==false&&(r.svc||r.startAt)&&<p className="text-xs text-gray-500">服務項目：{r.svc||'—'}　事發時段：{r.startAt||'—'}</p>}
    <p className="text-xs text-gray-500">{r.status==='pending'?'申請時間：'+r.createdAt+'　':''}{r.teacherCode?'拒接老師編號：'+r.teacherCode+'　':''}{r.status==='approved'?(r.addedBy?'新增者：'+r.addedBy:'同意主管：'+r.approvedBy):''}</p>
    {r.level==='all'&&r.storeBlockAt&&<p className="text-xs text-gray-400">{levelName(r.level)}時間：{r.storeBlockAt}　操作主管：{r.storeBlockBy}</p>}
    {r.manage&&r.status==='approved'&&(<div className="pt-1"><p className="text-xs text-gray-400 mb-1">拒接級距</p><div className="flex gap-2 flex-wrap">
      {LEVELS.map(x=>(<Chip key={x.v||'t'} on={(r.level||'')===x.v} onClick={()=>{if((r.level||'')===x.v)return;if((x.v==='all'||r.level==='all')&&!r.levelAll){setErr('全店拒接只有區經理以上可以設定或取消');return;}run(r.reqId,'b2Level',{reqId:r.reqId,level:x.v},'要把級距改為「'+x.n+'」嗎?'+('\n（'+LEVEL_HINT[x.v]+'）'));}}>{x.n}</Chip>))}</div></div>)}
    {r.manage&&r.detail!==false&&(editing===r.reqId?<EditForm r={r} onClose={()=>setEditing('')} onSaved={()=>{setEditing('');reload();}}/>:<button onClick={()=>setEditing(r.reqId)} className="w-full py-2 rounded-xl text-sm border border-gray-600 text-gray-200">✏️ 編輯</button>)}
    {r.manage&&r.status==='approved'&&(<div className="flex gap-2 pt-1">
      <button disabled={busy===r.reqId} onClick={()=>run(r.reqId,'b2Revoke',{reqId:r.reqId},'要撤銷這筆拒接嗎?(資料會保留,但不再出現在名單)')} className="px-4 py-2 rounded-xl text-sm border border-gray-600 text-gray-300 disabled:opacity-50">撤銷</button></div>)}
    {r.manage&&r.status==='pending'&&(<div className="flex gap-2 pt-1">
      <button disabled={busy===r.reqId} onClick={()=>run(r.reqId,'b2Decide',{reqId:r.reqId,approve:true},'同意這筆拒接申請嗎?')} className="flex-1 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white disabled:opacity-50">同意</button>
      <button disabled={busy===r.reqId} onClick={()=>run(r.reqId,'b2Decide',{reqId:r.reqId,approve:false},'確定拒絕這筆申請嗎?')} className="flex-1 py-2 rounded-xl text-sm font-bold bg-gray-700 text-gray-200 disabled:opacity-50">拒絕</button></div>)}
    </div>}
  </Card>);};
  const inboxCard=(r)=>(<Card key={r.id} className="space-y-1">
    <p className="text-white font-bold">{r.requesterStore} {r.requesterLabel} 想查詢詳情</p>
    <p className="text-sm text-gray-300">{r.custName}{r.custName?'○':''}{r.custTitle?titleName(r.custTitle):''}　{r.custPhone}</p>
    <p className="text-xs text-gray-500">申請時間：{r.createdAt}。同意後，該筆詳情會分享給 {r.requesterStore}（整店可看）。</p>
    <div className="flex gap-2 pt-1">
      <button disabled={busy===r.id} onClick={()=>run(r.id,'b2AnswerDetail',{id:r.id,approve:true},'同意分享這筆詳情給 '+r.requesterStore+'？')} className="flex-1 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white disabled:opacity-50">同意分享</button>
      <button disabled={busy===r.id} onClick={()=>run(r.id,'b2AnswerDetail',{id:r.id,approve:false},'確定婉拒嗎？')} className="flex-1 py-2 rounded-xl text-sm font-bold bg-gray-700 text-gray-200 disabled:opacity-50">婉拒</button></div>
  </Card>);
  return(<Box {...barOf(st,reload,'zh')}>
    <div className="flex items-center justify-between"><h1 className="text-lg font-bold text-white">🚫 拒接名單</h1>
      <button className="text-xs text-gray-400 border border-gray-700 rounded-full px-3 py-1" onClick={()=>go('b2=set')}>⚙ 設定</button></div>
    {d.isTeacher?<p className="text-xs text-gray-500">這裡只列出「拒接老師編號」含你（{d.myCode}）的客人。</p>:<p className="text-xs text-gray-500">各店共享名單；其他店建檔的資料預設只顯示手機、姓、稱謂，詳情需向建檔店面查詢。</p>}
    {d.directOn&&<div className="rounded-xl border border-amber-700 bg-amber-950/40 px-3 py-2 text-xs text-amber-300">⚡ 直接錄入模式開啟中（到 {fmtUntil(d.directUntil)} 自動關閉）：櫃台新增只需輸入手機。</div>}
    {d.canAdd&&<Btn onClick={()=>go('b2=new')}>＋ 新增拒接</Btn>}
    <div className="flex gap-2 flex-wrap">
      <Chip on={tab==='approved'} onClick={()=>{setTab('approved');setPg(1);}}>生效中（{d.approved.length}）</Chip>
      {(d.canAct||d.isTeacher)&&<Chip on={tab==='pending'} onClick={()=>{setTab('pending');setPg(1);}}>待核准（{d.pending.length}）</Chip>}
      {d.canAct&&<Chip on={tab==='inbox'} onClick={()=>setTab('inbox')}>詳情查詢（{inbox.length}）</Chip>}</div>
    {tab!=='inbox'&&<div className="flex gap-2 flex-wrap items-center"><span className="text-xs text-gray-500">分群</span>
      {[['none','不分群'],['level','依拒接級距'],['teacher','依拒接老師']].map(x=>(<Chip key={x[0]} on={grp===x[0]} onClick={()=>{setGrp(x[0]);setPg(1);}}>{x[1]}</Chip>))}</div>}
    {tab!=='inbox'&&<div className="relative"><input value={q} onChange={e=>{setQ(e.target.value);setPg(1);}} placeholder="手機（09開頭或末3碼）、姓名，例：林 870" className="w-full rounded-xl bg-gray-800 border border-gray-700 pl-3 pr-10 py-3 text-white"/>
      {q&&<button type="button" aria-label="清除" onClick={()=>{setQ('');setPg(1);}} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-600 text-white text-sm leading-7">×</button>}</div>}
    {q&&tab!=='inbox'&&<p className="text-xs text-gray-500">找到 {list.length} 筆</p>}
    {list.length===0&&<Card><p className="text-center text-gray-500">{q?'查無符合的資料':(tab==='approved'?'目前沒有拒接名單':tab==='inbox'?'沒有待處理的詳情查詢':'沒有待核准的申請')}</p></Card>}
    {tab==='inbox'?list.map(inboxCard):shown.map((x,i)=>(<React.Fragment key={x.r.reqId+'|'+x.g}>
      {x.g&&(i===0||shown[i-1].g!==x.g)&&<p className="text-xs font-bold text-violet-300 pt-2">▍{x.g}</p>}{card(x.r)}</React.Fragment>))}
    {tab!=='inbox'&&pager}
    {err&&<p className="text-sm text-red-400 text-center">{err}</p>}
  </Box>);
}

// ───────── 新增 ─────────
// 拒接老師編號輸入:輸入一個編號按 Enter（或逗號）就列在下面，點 × 移除
function CodeInput({list,setList,fixed,placeholder}){
  const[v,setV]=useState('');
  const add=()=>{const parts=v.split(/[\s,，、;；]+/).map(x=>x.trim()).filter(Boolean);if(!parts.length)return;
    const n=list.slice();parts.forEach(c=>{if(n.indexOf(c)<0&&c!==fixed)n.push(c);});setList(n);setV('');};
  return(<div className="space-y-2">
    <input value={v} onChange={e=>setV(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();add();}}} onBlur={add} inputMode="numeric" placeholder={placeholder||'輸入老師編號後按 Enter'} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/>
    {(fixed||list.length>0)&&<div className="flex flex-wrap gap-2">
      {fixed&&<span className="text-sm bg-violet-900 text-violet-200 rounded-full px-3 py-1">{fixed}（自己）</span>}
      {list.map(c=>(<span key={c} className="text-sm bg-gray-700 text-white rounded-full pl-3 pr-1 py-1 flex items-center gap-1">{c}<button type="button" onClick={()=>setList(list.filter(x=>x!==c))} className="w-5 h-5 rounded-full bg-gray-600 text-xs leading-5">×</button></span>))}</div>}
  </div>);
}
const splitCodes=(s)=>String(s||'').split(/[\s,，、;；]+/).map(x=>x.trim()).filter(Boolean);

function AddPage(){
  const[st,reload]=useLoad('b2List',{});
  const[phone,setPhone]=useState('');const[name,setName]=useState('');const[title,setTitle]=useState('');const[reason,setReason]=useState('');
  const[more,setMore]=useState(false);const[svc,setSvc]=useState('');const[startAt,setStartAt]=useState('');const[codes,setCodes]=useState([]);const[lvl,setLvl]=useState('store');
  const[busy,setBusy]=useState(false);const[err,setErr]=useState('');const[ok,setOk]=useState('');
  if(st.loading&&!st.data)return(<Loading/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const d=st.data;
  if(!d.canAdd)return(<Box><button className="text-sm text-violet-300" onClick={()=>go('b2=l')}>← 返回名單</button><Card><p className="text-center text-gray-300">目前沒有新增權限。<br/>（一般櫃台只有在「直接錄入模式」開啟的 24 小時內可新增）</p></Card></Box>);
  const quick=d.directOn&&!d.isTeacher;
  const submit=async()=>{
    setErr('');setOk('');
    const digits=phone.replace(/\D/g,'');
    if(!/^\d{8,12}$/.test(digits)){setErr('請輸入正確的手機號碼');return;}
    if(!quick&&!reason.trim()){setErr('請填拒接原因');return;}
    setBusy(true);
    const r=await api('b2Add',{phone:digits,custName:name.trim(),custTitle:title,reason:reason.trim(),svc:svc.trim(),startAt:startAt.trim(),teacherCodes:codes.join(','),level:lvl,level:lvl});
    setBusy(false);
    if(r&&r.ok){setOk(r.pending?'已送出 '+digits+'，等主管核准後生效':'已新增 '+digits);setCodes([]);setPhone('');setName('');setTitle('');setReason('');setSvc('');setStartAt('');reload();}
    else setErr((r&&r.error)||'新增失敗');
  };
  const titles=(window.MP&&window.MP.BOOK_TITLES)||[];
  return(<Box {...barOf(st,reload,'zh')}>
    <button className="text-sm text-violet-300" onClick={()=>go('b2=l')}>← 返回名單</button>
    <div className="flex items-center justify-between"><h1 className="text-lg font-bold text-white">＋ 新增拒接</h1>
      <button className="text-xs text-gray-400 border border-gray-700 rounded-full px-3 py-1" onClick={()=>go('b2=set')}>⚙ 設定</button></div>
    {d.isTeacher&&<div className="rounded-xl border border-amber-700 bg-amber-950/40 px-3 py-2 text-xs text-amber-300">送出後會通知你們店的主管，核准後才會生效。你只看得到「拒接老師編號」含你（{d.myCode}）的名單。</div>}
    {quick&&<div className="rounded-xl border border-amber-700 bg-amber-950/40 px-3 py-2 text-xs text-amber-300">⚡ 直接錄入模式：只要輸入手機就能存檔（到 {fmtUntil(d.directUntil)} 自動關閉）。</div>}
    <Card className="space-y-3">
      <div><p className="text-sm text-gray-300 mb-1">手機號碼 <span className="text-red-400">*</span></p>
        <input value={phone} onChange={e=>setPhone(fmtPhoneIn(e.target.value))} inputMode="tel" placeholder="0912-345-678" onKeyDown={e=>{if(e.key==='Enter')submit();}} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-lg text-white"/></div>
      {(!quick||more)&&(<div className="space-y-3">
        <div className="flex gap-2"><input value={name} onChange={e=>setName(e.target.value)} maxLength={30} placeholder="姓名（選填）" className="flex-1 min-w-0 rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/>
          <div className="flex gap-1">{titles.filter(x=>x.v==='sir'||x.v==='ms').map(x=>(<Chip key={x.v} on={title===x.v} onClick={()=>setTitle(title===x.v?'':x.v)}>{x.zh}</Chip>))}</div></div>
        <div><p className="text-sm text-gray-300 mb-1">拒接原因{!quick&&<span className="text-red-400"> *</span>}</p>
          <textarea value={reason} onChange={e=>setReason(e.target.value)} rows={3} maxLength={200} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/></div>
        <div><p className="text-sm text-gray-300 mb-1">拒接老師編號（選填）</p>
          <CodeInput list={codes} setList={setCodes} fixed={d.isTeacher?d.myCode:''} placeholder="輸入編號按 Enter，填了的老師才看得到這筆"/></div>
        {!d.isTeacher&&<div><p className="text-sm text-gray-300 mb-1">拒接級距</p><div className="flex gap-2 flex-wrap">
          {LEVELS.filter(x=>x.v!=='all'||d.seeAll).map(x=>(<Chip key={x.v} on={lvl===x.v} onClick={()=>setLvl(x.v)}>{x.n}</Chip>))}</div>
          <p className="text-xs text-gray-500 mt-1">{LEVEL_HINT[lvl]}</p></div>}
        <input value={svc} onChange={e=>setSvc(e.target.value)} placeholder="服務項目（選填）" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/>
        <input value={startAt} onChange={e=>setStartAt(e.target.value)} placeholder="事發時段（選填）例:2026-10-24 20:00" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/>
      </div>)}
      {quick&&!more&&<button className="text-xs text-gray-400 underline" onClick={()=>setMore(true)}>要補充姓名／原因？</button>}
      <Btn loading={busy} onClick={submit}>存檔</Btn>
    </Card>
    {ok&&<p className="text-center text-sm text-emerald-400">✅ {ok}</p>}
    {err&&<p className="text-center text-sm text-red-400">{err}</p>}
  </Box>);
}

// ───────── 拒接名單設定頁(b2=set):顯示偏好(人人)+ 直接錄入模式(主管/組長/管理者) ─────────
function MaskBlock(){
  const[on,setOn]=useState(getMask());
  return(<Card className="space-y-2">
    <p className="text-white text-sm font-bold">👁 名單顯示</p>
    <p className="text-xs text-gray-500">開啟後，名單列表只顯示手機前 4 碼（例：0912-***-*** 林先生），點開該筆才看得到完整號碼。搜尋不受影響（0912林、09123 都搜得到）。只影響這支手機。</p>
    <label className="flex items-center gap-2 text-sm text-gray-200"><input type="checkbox" checked={on} onChange={e=>{setMaskPref(e.target.checked);setOn(e.target.checked);}}/>列表只顯示手機前 4 碼</label>
  </Card>);
}
function SetPage(){
  return(<Box lang="zh">
    <div className="flex items-center justify-between"><h1 className="text-lg font-bold text-white">⚙ 拒接名單設定</h1>
      <button className="text-xs text-gray-400 border border-gray-700 rounded-full px-3 py-1" onClick={()=>go('b2=l')}>← 回名單</button></div>
    <MaskBlock/>
    <B2SettingsBlock/>
  </Box>);
}

// ───────── 設定頁區塊:直接錄入模式(主管/櫃台組長/管理者可見) ─────────
function B2SettingsBlock(){
  const[m,setM]=useState(null);const[busy,setBusy]=useState(false);const[err,setErr]=useState('');
  const load=async()=>{const r=await api('b2Mode',{});setM(r);};
  useEffect(()=>{load();},[]);
  if(!m||!m.ok||!m.canAct)return null;
  const toggle=async()=>{
    const on=!m.directOn;
    if(on&&!window.confirm('開啟後 24 小時內，櫃台人員新增拒接名單只需輸入手機即可存檔（用來批次錄入舊名單）。確定開啟嗎？'))return;
    setBusy(true);setErr('');const r=await api('b2ModeSet',{on:on});setBusy(false);
    if(r&&r.ok)load();else setErr((r&&r.error)||'失敗');
  };
  return(<Card className="space-y-2">
    <p className="text-white text-sm font-bold">🚫 拒接名單：直接錄入模式</p>
    <p className="text-xs text-gray-500">開啟後 24 小時內，櫃台人員新增拒接名單時只要輸入手機就能存檔（姓名、原因不可考的舊名單可用）。時間到自動關閉。</p>
    {m.directOn&&<p className="text-xs text-amber-300">開啟中，到 {fmtUntil(m.directUntil)} 自動關閉</p>}
    <div className="flex gap-2">
      <Btn color={m.directOn?'bg-gray-700 text-white':'bg-amber-600 text-white'} loading={busy} onClick={toggle}>{m.directOn?'立即關閉':'開啟 24 小時'}</Btn>
      <Btn color="bg-gray-800 text-gray-200 border border-gray-600" onClick={()=>go('b2=new')}>前往新增</Btn></div>
    {err&&<p className="text-xs text-red-400">{err}</p>}
  </Card>);
}

window.Blacklist2Routes=Blacklist2Routes;
window.B2SettingsBlock=B2SettingsBlock;window.B2MaskBlock=MaskBlock;
window.__b2Match=b2Match; // 測試用
})();
