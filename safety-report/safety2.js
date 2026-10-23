/* safety2.js — 安全回報 2.0 前端(v1.13-001):以 LINE userId 為主,去公司化重寫
   由 safety-report.html 在 liff.init 完成後,依網址參數 s2 載入:
     ?s2=r&sid=XXXX   回報頁(首次先填基本資料→下一步→才出現回報按鈕)
     ?s2=l&sid=XXXX   回報名單(依店別分組,可複製、重新整理)
     ?s2=mine         我發起的清單(查看名單/分享/刪除)
     ?s2=new          發起新回報
     ?s2=share&sid=   分享 Flex(shareTargetPicker)
     ?s2=mgr          主管功能(申請、通知設定、調整主管)
     ?s2=apv&rid=     核准/拒絕主管申請(從通知 Flex 進來)
   後端:gas-safety2.gs(動作名稱 s2xxx,全部帶 liff.getAccessToken() 由 GAS 驗證身分)。
   注意:本檔以 <script type="text/babel"> 載入,輸出 window.Safety2App,避免跟 safety-report.html 內的名稱衝突。 */
(function(){
const{useState,useEffect,useCallback}=React;
const{gasCallPost}=window.MP||{};

// ───────── 多語(回報人流程有中/越;發起人與主管頁僅中文) ─────────
const TT={
  zh:{lang:'語系',role:'你的角色',teacher:'老師',counter:'櫃台',store:'店別',code:'老師編號',name:'自訂名稱',codeHint:'請輸入你的老師編號',nameHint:'請輸入你的名稱(例如:小美)',next:'下一步',saving:'儲存中…',
      survey:'安全回報',by:'發起人',end:'截止',closed:'這筆回報已截止',ok:'我平安',help:'需要協助',other:'其他',otherHint:'請說明你的狀況',send:'送出',sent:'已回報',sentAt:'回報時間',change:'修改回報',
      list:'回報名單',editInfo:'修改基本資料',loading:'載入中…',copy:'點此複製',copied:'已複製',refresh:'重新整理',dataAt:'資料時間',noOne:'尚無人回報',needHelp:'需要協助',
      tapToChange:'你已回報,可再點選修改',back:'返回',fail:'失敗',detail:'詳細'},
  vi:{lang:'Ngôn ngữ',role:'Vai trò',teacher:'KTV',counter:'Lễ tân',store:'Chi nhánh',code:'Số KTV',name:'Tên của bạn',codeHint:'Nhập số KTV của bạn',nameHint:'Nhập tên của bạn (ví dụ: Mai)',next:'Tiếp theo',saving:'Đang lưu…',
      survey:'Báo cáo an toàn',by:'Người tạo',end:'Hạn chót',closed:'Báo cáo này đã hết hạn',ok:'Tôi an toàn',help:'Cần hỗ trợ',other:'Khác',otherHint:'Hãy mô tả tình trạng của bạn',send:'Gửi',sent:'Đã báo cáo',sentAt:'Thời gian',change:'Sửa báo cáo',
      list:'Danh sách báo cáo',editInfo:'Sửa thông tin cơ bản',loading:'Đang tải…',copy:'Sao chép',copied:'Đã sao chép',refresh:'Làm mới',dataAt:'Thời gian dữ liệu',noOne:'Chưa có ai báo cáo',needHelp:'Cần hỗ trợ',
      tapToChange:'Bạn đã báo cáo, có thể sửa lại',back:'Quay lại',fail:'Thất bại',detail:'Chi tiết'}
};
const STORES=['龍山寺店','東門店','古亭店','公館店'];

// ───────── 工具 ─────────
const qs=new URLSearchParams(location.search);
const go=(q)=>{location.href=location.pathname+'?'+q;};
// ───────── 本機暫存:讀過一次就存 localStorage,切換頁面不重讀 GAS;點「🔄 重新整理」才清掉重讀 ─────────
const CACHE_TTL=12*3600e3; // 安全保險:最久 12 小時後即使沒按重新整理也會重讀
const CACHEABLE=['s2Me','s2GetSurvey','s2GetList','s2MySurveys','s2MgrInfo'];
const WRITE_CLEAR={s2Register:'*',s2CreateSurvey:['s2MySurveys'],s2DeleteSurvey:['s2MySurveys','s2GetSurvey','s2GetList'],s2RestoreSurvey:['s2MySurveys','s2GetSurvey','s2GetList'],
  s2Report:['s2GetSurvey','s2GetList'],s2MgrApply:['s2Me','s2MgrInfo'],s2MgrApprove:['s2MgrInfo','s2Me','s2MySurveys'],s2MgrSet:['s2MgrInfo'],s2MgrNotify:['s2MgrInfo','s2Me'],
  s2AdminHide:['s2MgrInfo','s2Me','s2MySurveys','s2GetList','s2GetSurvey']}; // 寫入成功後,清掉受影響的暫存
function cuid(){try{const c=liff.getContext();return(c&&c.userId)||'';}catch(_e){return '';}}
function ckey(action,params){return 's2c:'+cuid()+':'+action+':'+JSON.stringify(params||{});}
function cget(k){try{const v=JSON.parse(localStorage.getItem(k)||'null');if(v&&Date.now()-v.t<CACHE_TTL)return v.d;}catch(_e){}return null;}
function cput(k,d){try{localStorage.setItem(k,JSON.stringify({t:Date.now(),d:d}));}catch(_e){}}
function cclear(actions){
  try{const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf('s2c:')===0)ks.push(k);}
    ks.forEach(k=>{if(actions==='*'||actions.some(a=>k.indexOf(':'+a+':')>=0))localStorage.removeItem(k);});}catch(_e){}
}
async function api(action,params,force){
  const cacheable=CACHEABLE.indexOf(action)>=0;const k=cacheable?ckey(action,params):'';
  if(cacheable&&!force){const c=cget(k);if(c)return c;}
  let tok='';try{tok=liff.getAccessToken()||'';}catch(_e){}
  const r=(await gasCallPost(action,Object.assign({},params||{},{accessToken:tok}),20000))||{ok:false,error:'連不上伺服器,請稍後再試'};
  if(r.ok){ if(cacheable)cput(k,r); else if(WRITE_CLEAR[action])cclear(WRITE_CLEAR[action]); }
  return r;
}
function defaultLang(){try{return String(navigator.language||'').toLowerCase().indexOf('vi')===0?'vi':'zh';}catch(_e){return 'zh';}}
function copyText(txt){
  try{if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(txt).then(()=>true).catch(()=>fallbackCopy(txt));}catch(_e){}
  return Promise.resolve(fallbackCopy(txt));
}
function fallbackCopy(txt){
  try{const ta=document.createElement('textarea');ta.value=txt;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');document.body.removeChild(ta);return !!ok;}catch(_e){return false;}
}
const liffBase=()=>'https://liff.line.me/'+(window.__S2_LIFF_ID||'');

const RefreshBtn=()=>(<button onClick={()=>{cclear('*');location.reload();}} className="text-xs text-gray-400 border border-gray-700 rounded-full px-3 py-1">🔄 重新整理 / Làm mới</button>);
const Box=({children})=>(<div className="min-h-screen px-4 py-5"><div className="max-w-md mx-auto space-y-4"><div className="flex justify-end"><RefreshBtn/></div>{children}</div></div>);
const Card=({children,className})=>(<div className={'rounded-2xl bg-gray-900 border border-gray-800 p-4 '+(className||'')}>{children}</div>);
const Btn=({children,onClick,color,disabled,className})=>(<button disabled={disabled} onClick={onClick} className={'w-full rounded-xl py-3 font-bold text-base disabled:opacity-40 '+(color||'bg-violet-600 text-white')+' '+(className||'')}>{children}</button>);
const Chip=({on,children,onClick})=>(<button onClick={onClick} className={'px-4 py-2 rounded-full border text-sm '+(on?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-300')}>{children}</button>);
const Msg=({text})=>(<Box><Card><p className="text-center text-gray-300 whitespace-pre-line">{text}</p></Card></Box>);

function useLoad(fn,deps){ // fn(force);回傳[狀態,重新讀取(強制略過暫存)]
  const[st,setSt]=useState({loading:true,data:null});
  const run=useCallback((force)=>{setSt(s=>({loading:true,data:s.data}));fn(!!force).then(d=>setSt({loading:false,data:d}));},deps||[]);
  useEffect(()=>{run(false);},[run]);
  return[st,()=>run(true)];
}

// ───────── 基本資料(首次):角色/店別/語系/編號或名稱 → 下一步 ─────────
function RegisterForm({user,onDone,showLangFirst}){
  const[lang,setLang]=useState(user?user.lang:defaultLang());
  const[role,setRole]=useState(user?user.role:'');
  const[store,setStore]=useState(user?user.store:'');
  const[code,setCode]=useState(user?user.code:'');
  const[busy,setBusy]=useState(false);const[err,setErr]=useState('');
  const t=TT[lang];
  const ready=role&&store&&code.trim();
  const submit=async()=>{
    setBusy(true);setErr('');
    let name='';try{const p=await liff.getProfile();name=p.displayName||'';}catch(_e){}
    const r=await api('s2Register',{role,store,lang,code:code.trim(),displayName:name});
    setBusy(false);
    if(r.ok)onDone(r.user);else setErr(r.error||t.fail);
  };
  return(<Box>
    <Card>
      <p className="text-sm text-gray-400 mb-2">{TT.zh.lang} / {TT.vi.lang}</p>
      <div className="flex gap-2"><Chip on={lang==='zh'} onClick={()=>setLang('zh')}>中文</Chip><Chip on={lang==='vi'} onClick={()=>setLang('vi')}>Tiếng Việt</Chip></div>
    </Card>
    <Card className="space-y-3">
      <div><p className="text-sm text-gray-400 mb-2">{t.role}</p><div className="flex gap-2"><Chip on={role==='teacher'} onClick={()=>setRole('teacher')}>{t.teacher}</Chip><Chip on={role==='counter'} onClick={()=>setRole('counter')}>{t.counter}</Chip></div></div>
      <div><p className="text-sm text-gray-400 mb-2">{t.store}</p><div className="flex flex-wrap gap-2">{STORES.map(s=>(<Chip key={s} on={store===s} onClick={()=>setStore(s)}>{s}</Chip>))}</div></div>
      {role&&(<div><p className="text-sm text-gray-400 mb-2">{role==='teacher'?t.code:t.name}</p>
        <input value={code} onChange={e=>setCode(e.target.value)} maxLength={role==='teacher'?6:20} inputMode={role==='teacher'?'numeric':'text'} placeholder={role==='teacher'?t.codeHint:t.nameHint}
          className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-lg text-white"/></div>)}
    </Card>
    {err&&<p className="text-sm text-red-400 text-center">{err}</p>}
    <Btn disabled={!ready||busy} onClick={submit}>{busy?t.saving:t.next}</Btn>
  </Box>);
}

// 需要已登記身分的頁面共用:沒登記就先顯示基本資料表單,填完「下一步」再進入內容
function NeedUser({render}){
  const[st,reload]=useLoad((f)=>api('s2Me',{},f),[]);
  const[user,setUser]=useState(undefined);const[editing,setEditing]=useState(false);
  if(st.loading&&!st.data)return(<Msg text="載入中… / Đang tải…"/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const me=st.data;const u=user===undefined?me.user:user;
  if(!u||editing)return(<RegisterForm user={u} onDone={x=>{setUser(x);setEditing(false);}}/>);
  return render(Object.assign({},me,{user:u}),()=>setEditing(true),reload);
}

// ───────── 回報頁 ─────────
function ReportPage({sid}){
  return(<NeedUser render={(me,editInfo)=><ReportInner me={me} sid={sid} editInfo={editInfo}/>}/>);
}
function ReportInner({me,sid,editInfo}){
  const lang=me.user.lang;const t=TT[lang];
  const[st,reload]=useLoad((f)=>api('s2GetSurvey',{id:sid},f),[sid]);
  const[other,setOther]=useState('');const[busy,setBusy]=useState(false);const[err,setErr]=useState('');const[picking,setPicking]=useState(false);
  if(st.loading&&!st.data)return(<Msg text={t.loading}/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||t.fail}/>);
  const s=st.data.survey;const mine=st.data.mine;
  const send=async(status,txt)=>{
    setBusy(true);setErr('');
    const r=await api('s2Report',{id:sid,status:status,otherText:txt||''});
    setBusy(false);
    if(r.ok){setPicking(false);reload();}else setErr(r.error||t.fail);
  };
  const stLabel=x=>x==='ok'?t.ok:x==='help'?t.help:t.other;
  return(<Box>
    <Card>
      <p className="text-xs text-amber-400 font-bold">⚠️ {t.survey}</p>
      <h1 className="text-xl font-bold text-white mt-1">{s.title}</h1>
      <p className="text-sm text-gray-400 mt-2">{t.by}:{s.creatorStore} {s.creatorLabel}<br/>{t.end}:{s.endDate}</p>
    </Card>
    {s.closed&&<p className="text-center text-amber-400">{t.closed}</p>}
    {mine&&!picking&&(<Card className="text-center">
      <p className="text-lg font-bold text-emerald-400">✅ {t.sent}:{stLabel(mine.status)}{mine.status==='other'&&mine.otherText?'('+mine.otherText+')':''}</p>
      <p className="text-xs text-gray-500 mt-1">{t.sentAt} {mine.time}</p>
      {!s.closed&&<button className="text-sm text-violet-400 mt-3 underline" onClick={()=>setPicking(true)}>{t.change}</button>}
    </Card>)}
    {(!mine||picking)&&!s.closed&&(<Card className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Btn disabled={busy} color="bg-emerald-600 text-white" onClick={()=>send('ok')}>{t.ok}</Btn>
        <Btn disabled={busy} color="bg-red-600 text-white" onClick={()=>send('help')}>{t.help}</Btn>
      </div>
      <input value={other} onChange={e=>setOther(e.target.value)} maxLength={200} placeholder={t.otherHint} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/>
      <Btn disabled={busy||!other.trim()} color="bg-gray-700 text-white" onClick={()=>send('other',other.trim())}>{t.other} · {t.send}</Btn>
      {err&&<p className="text-sm text-red-400 text-center">{err}</p>}
    </Card>)}
    <Btn color="bg-gray-800 text-gray-200" onClick={()=>go('s2=l&sid='+sid)}>📋 {t.list}</Btn>
    <button className="w-full text-center text-sm text-gray-500 underline" onClick={editInfo}>{t.editInfo}</button>
  </Box>);
}

// ───────── 名單頁(依店別分組) ─────────
function ListPage({sid}){
  return(<NeedUser render={(me,editInfo)=><ListInner me={me} sid={sid}/>}/>);
}
function ListInner({me,sid}){
  const t=TT[me.user.lang];const lang0=me.user.lang;
  const[st,reload]=useLoad((f)=>api('s2GetList',{id:sid},f),[sid]);
  const[copied,setCopied]=useState('');const[open,setOpen]=useState(false);
  if(st.loading&&!st.data)return(<Msg text={t.loading}/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||t.fail}/>);
  const d=st.data;
  const doCopy=(g)=>{copyText(g.items.map(i=>i.label).join(' ')).then(ok=>{if(ok){setCopied(g.store);setTimeout(()=>setCopied(''),1800);}});};
  return(<Box>
    <Card><p className="text-xs text-amber-400 font-bold">⚠️ {t.survey}</p><h1 className="text-lg font-bold text-white mt-1">{d.survey.title}</h1></Card>
    {d.stores.map(g=>(<Card key={g.store}>
      <div className="flex items-center justify-between"><p className="font-bold text-white">{g.store}（{g.items.length}/{g.total}）</p>
        {g.items.length>0&&<button className="text-sm text-violet-400" onClick={()=>doCopy(g)}>{copied===g.store?t.copied:t.copy}</button>}</div>
      <p className="mt-2 text-base leading-8 break-all">
        {g.items.length===0?<span className="text-gray-500">{t.noOne}</span>:g.items.map((i,k)=>(<span key={k} className={'mr-3 '+(i.status==='help'?'text-red-400 font-bold':i.status==='other'?'text-amber-300':'text-gray-100')}>{i.label}{i.status==='help'?'⚠':''}</span>))}
      </p>
    </Card>))}
    {d.restricted&&<p className="text-xs text-gray-500 text-center">{lang0==='vi'?'Chỉ hiển thị chi nhánh của bạn':'僅顯示你所屬店家'}:{d.myStore}</p>}
    <Card className="flex items-center justify-between"><span className="text-xs text-gray-500">{t.dataAt}:{d.at}</span><button className="text-sm text-violet-400" onClick={reload}>{t.refresh}</button></Card>
    {d.detail&&(<div><button className="text-sm text-gray-400 underline" onClick={()=>setOpen(!open)}>{t.detail} {open?'▲':'▼'}</button>
      {open&&(<div className="mt-2 space-y-2">{d.stores.map(g=>g.items.length>0&&(<Card key={g.store}><p className="font-bold text-white text-sm mb-1">{g.store}</p>
        {g.items.map((i,k)=>(<p key={k} className="text-xs text-gray-300 leading-6">{i.label}　{i.status==='ok'?'平安':i.status==='help'?'需要協助':'其他'}{i.otherText?'：'+i.otherText:''}　<span className="text-gray-500">{String(i.time).slice(5,16)}</span></p>))}</Card>))}</div>)}</div>)}
    <Btn color="bg-gray-800 text-gray-200" onClick={()=>go('s2=r&sid='+sid)}>← {t.back}</Btn>
  </Box>);
}

// ───────── 發起人:新增 ─────────
function NewPage(){
  return(<NeedUser render={()=><NewInner/>}/>);
}
function NewInner(){
  const def=new Date(Date.now()+2*86400e3);const pad=n=>String(n).padStart(2,'0');
  const[title,setTitle]=useState('');const[end,setEnd]=useState(def.getFullYear()+'-'+pad(def.getMonth()+1)+'-'+pad(def.getDate()));
  const[busy,setBusy]=useState(false);const[err,setErr]=useState('');
  const[entryRes,setEntryRes]=useState('');
  const shareEntry=async()=>{ // 暫時功能:Rich Menu 完成後移除
    try{if(!liff.isApiAvailable('shareTargetPicker')){setEntryRes('此環境不支援分享,請在 LINE 內開啟');return;}
      const r=await liff.shareTargetPicker([{type:'flex',altText:'🚨 安全回報:發起新回報',contents:buildEntryFlex()}]);setEntryRes(r?'已分享 ✅':'已取消');}catch(e){setEntryRes('錯誤:'+String(e&&e.message||e));}
  };
  const create=async()=>{setBusy(true);setErr('');const r=await api('s2CreateSurvey',{title:title.trim(),endDate:end});setBusy(false);if(r.ok)go('s2=share&sid='+r.id+'&fresh=1');else setErr(r.error||'失敗');};
  return(<Box>
    <Card className="space-y-3"><h1 className="text-lg font-bold text-white">📝 發起新回報</h1>
      <div><p className="text-sm text-gray-400 mb-1">標題(最多40字)</p><input value={title} onChange={e=>setTitle(e.target.value)} maxLength={40} placeholder="例如:10/24 颱風 安全回報" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/></div>
      <div><p className="text-sm text-gray-400 mb-1">截止日</p><input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/></div></Card>
    {err&&<p className="text-sm text-red-400 text-center">{err}</p>}
    <Btn disabled={busy||!title.trim()||!end} onClick={create}>建立並分享</Btn>
    <Btn color="bg-gray-700 text-white" onClick={shareEntry}>分享「發起新回報」入口</Btn>
    {entryRes&&<p className="text-center text-sm text-gray-400">{entryRes}</p>}
    <Btn color="bg-gray-800 text-gray-200" onClick={()=>go('s2=mine')}>我發起的清單</Btn>
  </Box>);
}

// ───────── 發起人:我發起的清單 ─────────
function MinePage(){
  return(<NeedUser render={()=><MineInner/>}/>);
}
function MineInner(){
  const[st,reload]=useLoad((f)=>api('s2MySurveys',{},f),[]);
  const[busy,setBusy]=useState('');
  if(st.loading&&!st.data)return(<Msg text="載入中…"/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const d=st.data;
  const del=async(s)=>{if(!window.confirm('確定要刪除「'+s.title+'」嗎?(資料會保留,只是從清單隱藏)'))return;setBusy(s.id);const r=await api('s2DeleteSurvey',{id:s.id});setBusy('');if(r.ok)reload();else alert(r.error||'失敗');};
  const restore=async(s)=>{setBusy(s.id);const r=await api('s2RestoreSurvey',{id:s.id});setBusy('');if(r.ok)reload();else alert(r.error||'失敗');};
  const row=(s)=>(<Card key={s.id} className={s.hidden?'opacity-60':''}>
    <p className="font-bold text-white">{s.title}{s.hidden&&<span className="ml-2 text-xs text-red-400">已刪除</span>}{s.closed&&!s.hidden&&<span className="ml-2 text-xs text-gray-500">已截止</span>}</p>
    <p className="text-xs text-gray-400 mt-1">{s.creatorStore} {s.creatorLabel}　截止 {s.endDate}　已回報 {s.count} 人{s.help>0&&<span className="text-red-400">（需協助 {s.help}）</span>}</p>
    <div className="grid grid-cols-3 gap-2 mt-3">
      <button className="rounded-lg bg-violet-600 text-white text-sm py-2" onClick={()=>go('s2=l&sid='+s.id)}>查看名單</button>
      <button disabled={s.hidden} className="rounded-lg bg-blue-600 text-white text-sm py-2 disabled:opacity-30" onClick={()=>go('s2=share&sid='+s.id)}>分享</button>
      {s.hidden?(d.canRestore?<button disabled={busy===s.id} className="rounded-lg border border-emerald-500 text-emerald-400 text-sm py-2" onClick={()=>restore(s)}>還原</button>:<span/>)
        :(s.canDelete?<button disabled={busy===s.id} className="rounded-lg border border-red-500 text-red-400 text-sm py-2" onClick={()=>del(s)}>刪除</button>:<span/>)}
    </div></Card>);
  let body;
  if(d.groupByStore){
    const g={};d.surveys.forEach(s=>{(g[s.creatorStore||'未分店']=g[s.creatorStore||'未分店']||[]).push(s);});
    body=Object.keys(g).map(k=>(<div key={k}><p className="text-sm font-bold text-violet-300 mb-2">{k}（{g[k].length}）</p><div className="space-y-3">{g[k].map(row)}</div></div>));
  }else body=<div className="space-y-3">{d.surveys.map(row)}</div>;
  return(<Box>
    <h1 className="text-lg font-bold text-white">📋 我發起的清單</h1>
    <Btn onClick={()=>go('s2=new')}>＋ 發起新回報</Btn>
    {d.surveys.length===0&&<Card><p className="text-center text-gray-500">目前沒有項目</p></Card>}
    {body}
  </Box>);
}

// ───────── 分享 Flex ─────────
function buildFlex(s){
  const base='https://liff.line.me/'+window.__S2_LIFF_ID;
  return{type:'bubble',
    body:{type:'box',layout:'vertical',spacing:'md',paddingAll:'lg',contents:[
      {type:'text',text:'⚠️ 安全回報 / Báo cáo an toàn',weight:'bold',size:'sm',color:'#f59e0b'},
      {type:'text',text:s.title,weight:'bold',size:'lg',wrap:true,color:'#111111'},
      {type:'text',text:'發起人:'+(s.creatorStore+' '+s.creatorLabel).trim()+'\n截止:'+s.endDate,size:'sm',color:'#888888',wrap:true},
      {type:'text',text:'請點下方按鈕回報,或分享給其他同仁\nBấm nút bên dưới để báo cáo hoặc chia sẻ',size:'xs',color:'#888888',wrap:true}]},
    footer:{type:'box',layout:'vertical',spacing:'sm',paddingAll:'lg',contents:[
      {type:'button',style:'primary',color:'#dc2626',height:'sm',action:{type:'uri',label:'我要回報 / Báo cáo',uri:base+'?s2=r&sid='+s.id}},
      {type:'button',style:'secondary',height:'sm',action:{type:'uri',label:'回報名單 / Danh sách',uri:base+'?s2=l&sid='+s.id}},
      {type:'button',style:'secondary',height:'sm',action:{type:'uri',label:'分享 / Chia sẻ',uri:base+'?s2=share&sid='+s.id}}]}};
}
// 暫時功能(使用者要求,Rich Menu 完成後移除):在「發起新回報」頁分享一張「發起入口」Flex,按鈕直接開 ?s2=new
function buildEntryFlex(){
  const base='https://liff.line.me/'+window.__S2_LIFF_ID;
  return{type:'bubble',
    body:{type:'box',layout:'vertical',spacing:'md',paddingAll:'lg',contents:[
      {type:'text',text:'🚨 安全回報',weight:'bold',size:'lg',color:'#dc2626'},
      {type:'text',text:'點下方按鈕,發起新的安全回報',size:'sm',color:'#666666',wrap:true}]},
    footer:{type:'box',layout:'vertical',spacing:'sm',paddingAll:'lg',contents:[
      {type:'button',style:'primary',color:'#dc2626',height:'sm',action:{type:'uri',label:'發起新回報',uri:base+'?s2=new'}}]}};
}
function SharePage({sid,fresh}){
  return(<NeedUser render={()=><ShareInner sid={sid} fresh={fresh}/>}/>);
}
function ShareInner({sid,fresh}){
  const[st]=useLoad((f)=>api('s2GetSurvey',{id:sid},f),[sid]);
  const[res,setRes]=useState('');
  const pick=async(s)=>{
    try{
      if(!liff.isApiAvailable('shareTargetPicker')){setRes('此環境不支援分享,請在 LINE 內開啟');return;}
      const r=await liff.shareTargetPicker([{type:'flex',altText:'⚠️ 安全回報:'+s.title,contents:buildFlex(s)}]);
      setRes(r?'ok':'cancel');
    }catch(e){setRes('錯誤:'+String(e&&e.message||e));}
  };
  if(st.loading&&!st.data)return(<Msg text="載入中…"/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const s=st.data.survey;
  return(<Box>
    <Card><p className="text-xs text-amber-400 font-bold">{fresh?'✅ 已建立':'分享'}</p><h1 className="text-lg font-bold text-white mt-1">{s.title}</h1><p className="text-sm text-gray-400 mt-1">截止 {s.endDate}</p></Card>
    <Btn onClick={()=>pick(s)}>選擇好友或群組分享</Btn>
    {res==='ok'&&<p className="text-center text-emerald-400">已分享 ✅</p>}
    {res==='cancel'&&<p className="text-center text-gray-400">已取消</p>}
    {res&&res!=='ok'&&res!=='cancel'&&<p className="text-center text-red-400 text-sm">{res}</p>}
    <Btn color="bg-gray-800 text-gray-200" onClick={()=>go('s2=l&sid='+sid)}>查看名單</Btn>
    <Btn color="bg-gray-800 text-gray-200" onClick={()=>go('s2=mine')}>我發起的清單</Btn>
  </Box>);
}

// ───────── 主管功能 ─────────
function MgrPage(){
  return(<NeedUserOptional render={(me,needReg)=><MgrInner me={me} needReg={needReg}/>}/>);
}
// 主管頁:已是主管/管理者不用登記;不是主管且沒登記要先登記(申請需要店別與編號)
function NeedUserOptional({render}){
  const[st]=useLoad((f)=>api('s2Me',{},f),[]);
  const[user,setUser]=useState(undefined);
  if(st.loading&&!st.data)return(<Msg text="載入中…"/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const me=Object.assign({},st.data,{user:user===undefined?st.data.user:user});
  return render(me,()=>setUser(null));
}
function MgrInner({me,needReg}){
  const[st,reload]=useLoad((f)=>api('s2MgrInfo',{},f),[]);
  const[step,setStep]=useState(me.pending?'sent':'ask');const[busy,setBusy]=useState(false);const[err,setErr]=useState('');const[reg,setReg]=useState(false);
  if(st.loading&&!st.data)return(<Msg text="載入中…"/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const d=st.data;
  const act=async(fn)=>{setBusy(true);setErr('');const r=await fn();setBusy(false);if(r.ok)reload();else setErr(r.error||'失敗');return r;};
  if(!d.isMgr){
    if(reg||(!me.user&&step==='level'))return(<RegisterForm user={me.user} onDone={()=>{location.reload();}}/>);
    return(<Box>
      <Card className="space-y-3"><h1 className="text-lg font-bold text-white">🛡️ 主管功能</h1>
        {step==='ask'&&(<div><p className="text-gray-300">你目前尚未設定為主管，是否要送出設定申請？</p>
          <div className="grid grid-cols-2 gap-3 mt-3"><Btn onClick={()=>{if(!me.user)setReg(true);else setStep('level');}}>是</Btn><Btn color="bg-gray-700 text-white" onClick={()=>go('s2=mine')}>否</Btn></div></div>)}
        {step==='level'&&(<div><p className="text-gray-300 mb-3">請選擇你的主管職級：</p>
          <div className="space-y-2">{(me.levels||[]).map(l=>(<Btn key={l} disabled={busy} color="bg-gray-800 text-white border border-gray-600" onClick={async()=>{const r=await act(()=>api('s2MgrApply',{level:l}));if(r.ok)setStep('sent');}}>{l}</Btn>))}</div></div>)}
        {step==='sent'&&<p className="text-emerald-400">已送出申請{me.pending?'（'+me.pending.level+'）':''}，核准後會通知你。</p>}
        {err&&<p className="text-sm text-red-400">{err}</p>}
      </Card></Box>);
  }
  const setLevel=(m,lv)=>act(()=>api('s2MgrSet',{targetId:m.lineUserId,level:lv}));
  return(<Box>
    <Card><h1 className="text-lg font-bold text-white">🛡️ 主管功能</h1><p className="text-sm text-gray-400 mt-1">你的職級：{d.level}　{d.all?'（可看所有店）':'（僅限本店）'}</p></Card>
    <Card className="space-y-3">
      <div className="flex items-center justify-between"><span className="text-gray-200">🔔 接收主管申請通知</span>
        <button disabled={busy} className={'px-4 py-1 rounded-full text-sm '+(d.notify?'bg-emerald-600 text-white':'bg-gray-700 text-gray-300')} onClick={()=>act(()=>api('s2MgrNotify',{on:!d.notify}))}>{d.notify?'開':'關'}</button></div>
      {d.admin&&(<div className="flex items-center justify-between"><span className="text-gray-200">👁 已刪除項目對我也隱藏</span>
        <button disabled={busy} className={'px-4 py-1 rounded-full text-sm '+(d.hideAdmin?'bg-emerald-600 text-white':'bg-gray-700 text-gray-300')} onClick={()=>act(()=>api('s2AdminHide',{on:!d.hideAdmin}))}>{d.hideAdmin?'開':'關'}</button></div>)}
    </Card>
    {d.pending.length>0&&(<Card className="space-y-3"><p className="font-bold text-white">待審核申請</p>
      {d.pending.map(p=>(<div key={p.reqId} className="border-t border-gray-800 pt-2"><p className="text-gray-200">{p.store} {p.label}　申請：{p.level}</p>
        <div className="grid grid-cols-2 gap-2 mt-2"><Btn disabled={busy} color="bg-emerald-600 text-white" onClick={()=>act(()=>api('s2MgrApprove',{rid:p.reqId,approve:true}))}>核准</Btn><Btn disabled={busy} color="bg-gray-700 text-white" onClick={()=>act(()=>api('s2MgrApprove',{rid:p.reqId,approve:false}))}>拒絕</Btn></div></div>))}</Card>)}
    <Card className="space-y-3"><p className="font-bold text-white">主管名單（調整職級）</p>
      {d.mgrs.length===0&&<p className="text-gray-500 text-sm">目前沒有主管</p>}
      {d.mgrs.map(m=>(<div key={m.lineUserId} className="border-t border-gray-800 pt-2"><p className="text-gray-200">{m.store} {m.label}　<span className="text-violet-300">{m.level}</span></p>
        {m.canEdit&&(<div className="flex flex-wrap gap-2 mt-2">{d.levels.map(l=>(<Chip key={l} on={m.level===l} onClick={()=>m.level!==l&&setLevel(m,l)}>{l}</Chip>))}<button className="px-3 py-2 rounded-full border border-red-500 text-red-400 text-sm" onClick={()=>window.confirm('取消「'+m.label+'」的主管職？')&&setLevel(m,'')}>取消主管</button></div>)}</div>))}
    </Card>
    {err&&<p className="text-sm text-red-400 text-center">{err}</p>}
    <Btn color="bg-gray-800 text-gray-200" onClick={()=>go('s2=mine')}>我發起的清單</Btn>
  </Box>);
}

// 從通知 Flex 進來的審核頁
function ApvPage({rid}){
  const[st,reload]=useLoad((f)=>api('s2MgrInfo',{},f),[]);
  const[busy,setBusy]=useState(false);const[msg,setMsg]=useState('');
  if(st.loading&&!st.data)return(<Msg text="載入中…"/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const p=(st.data.pending||[]).find(x=>x.reqId===rid);
  if(msg)return(<Msg text={msg}/>);
  if(!p)return(<Msg text={'找不到這筆申請\n(可能已處理，或你沒有核准權限)'}/>);
  const decide=async(a)=>{setBusy(true);const r=await api('s2MgrApprove',{rid:rid,approve:a});setBusy(false);setMsg(r.ok?(a?'已核准 ✅':'已拒絕'):(r.error||'失敗'));};
  return(<Box><Card><p className="text-xs text-violet-300 font-bold">🛡️ 主管設定申請</p><h1 className="text-lg font-bold text-white mt-1">{p.store} {p.label}</h1><p className="text-gray-300 mt-1">申請職級：{p.level}</p><p className="text-xs text-gray-500 mt-1">{p.requestedAt}</p></Card>
    <div className="grid grid-cols-2 gap-3"><Btn disabled={busy} color="bg-emerald-600 text-white" onClick={()=>decide(true)}>核准</Btn><Btn disabled={busy} color="bg-gray-700 text-white" onClick={()=>decide(false)}>拒絕</Btn></div></Box>);
}

// ───────── 入口 ─────────
function Safety2App({liffId}){
  window.__S2_LIFF_ID=liffId||window.__S2_LIFF_ID||'';
  const q=new URLSearchParams(location.search);
  const p=q.get('s2')||'';const sid=q.get('sid')||'';
  if(p==='r')return sid?<ReportPage sid={sid}/>:<Msg text="缺少回報代碼"/>;
  if(p==='l')return sid?<ListPage sid={sid}/>:<Msg text="缺少回報代碼"/>;
  if(p==='new')return <NewPage/>;
  if(p==='mine')return <MinePage/>;
  if(p==='share')return sid?<SharePage sid={sid} fresh={q.get('fresh')==='1'}/>:<Msg text="缺少回報代碼"/>;
  if(p==='mgr')return <MgrPage/>;
  if(p==='apv')return <ApvPage rid={q.get('rid')||''}/>;
  return <Msg text="不支援的頁面"/>;
}
window.Safety2App=Safety2App;
})();
