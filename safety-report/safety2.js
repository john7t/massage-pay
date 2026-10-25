/* safety2.js — 安全回報 2.0 前端(v1.13-001):以 LINE userId 為主,去公司化重寫
   由 safety-report.html 在 liff.init 完成後,依網址參數 s2 載入:
     ?s2=r&sid=XXXX   回報頁(首次先填基本資料→下一步→才出現回報按鈕)
     ?s2=l&sid=XXXX   回報名單(依店別分組,可複製、重新整理)
     ?s2=mine         我發起的清單(查看名單/分享/刪除)
     ?s2=new          發起新回報(只建立,不分享;原頁不變)
     ?s2=mnew         建立新回報並分享(僅主管,從主管功能頁進入)
     ?s2=share&sid=   分享 Flex(shareTargetPicker,僅主管)
     ?s2=mgr          主管功能(申請、通知設定、調整主管)
     ?s2=my           我的安全回報記錄(我回報過的:日期、主題、內容、時間;唯讀)
     ?s2=today        (保留未用)目前未截止的回報清單,可點進去回報
     ?s2=staff        人員清單(LINE名稱、移除;僅主管)
     ?s2=apv&rid=     核准/拒絕主管申請(從通知 Flex 進來)
   後端:gas-safety2.gs(動作名稱 s2xxx,全部帶 liff.getAccessToken() 由 GAS 驗證身分)。
   注意:本檔以 <script type="text/babel"> 載入,輸出 window.Safety2App,避免跟 safety-report.html 內的名稱衝突。 */
(function(){
const{useState,useEffect,useCallback,useRef}=React;
const{gasCallPost}=window.MP||{};

// ───────── 多語(回報人流程有中/越;發起人與主管頁僅中文) ─────────
const TT={
  zh:{lang:'語系',role:'你的角色',teacher:'老師',counter:'櫃台',store:'店別',code:'老師編號',shift:'班別',early:'早班',late:'晚班',shiftHint:'在 06~15 時上班皆為早班',name:'自訂名稱',codeHint:'請輸入你的老師編號',nameHint:'請輸入你的名稱(例如:小美)',next:'下一步',saving:'儲存中…',
      survey:'安全回報',by:'發起人',end:'截止',closed:'這筆回報已截止',ok:'我平安',help:'需要協助',other:'其他',otherHint:'請說明你的狀況',send:'送出',sent:'已回報',sentAt:'回報時間',change:'修改回報',
      list:'回報名單',editInfo:'修改基本資料',loading:'載入中…',copy:'點此複製',copied:'已複製',refresh:'重新整理',dataAt:'資料時間',noOne:'尚無人回報',needHelp:'需要協助',
      tapToChange:'你已回報,可再點選修改',back:'返回',fail:'失敗',detail:'詳細'},
  vi:{lang:'Ngôn ngữ',role:'Vai trò',teacher:'KTV',counter:'Lễ tân',store:'Chi nhánh',code:'Số KTV',shift:'Ca làm',early:'Ca sáng',late:'Ca tối',shiftHint:'Làm việc trong khoảng 06~15 giờ đều là ca sáng',name:'Tên của bạn',codeHint:'Nhập số KTV của bạn',nameHint:'Nhập tên của bạn (ví dụ: Mai)',next:'Tiếp theo',saving:'Đang lưu…',
      survey:'Báo cáo an toàn',by:'Người tạo',end:'Hạn chót',closed:'Báo cáo này đã hết hạn',ok:'Tôi an toàn',help:'Cần hỗ trợ',other:'Khác',otherHint:'Hãy mô tả tình trạng của bạn',send:'Gửi',sent:'Đã báo cáo',sentAt:'Thời gian',change:'Sửa báo cáo',
      list:'Danh sách báo cáo',editInfo:'Sửa thông tin cơ bản',loading:'Đang tải…',copy:'Sao chép',copied:'Đã sao chép',refresh:'Làm mới',dataAt:'Thời gian dữ liệu',noOne:'Chưa có ai báo cáo',needHelp:'Cần hỗ trợ',
      tapToChange:'Bạn đã báo cáo, có thể sửa lại',back:'Quay lại',fail:'Thất bại',detail:'Chi tiết'}
};
const STORES=['龍山寺店','東門店','古亭店','公館店'];

// ───────── 工具 ─────────
const qs=new URLSearchParams(location.search);
// 頁面切換:不重新開啟整個網頁(省掉 Babel 編譯與 LIFF 初始化),只換網址參數並通知 Safety2App 重畫
window.__s2nonce=window.__s2nonce||0;
function go(q){
  try{history.pushState(null,'',location.pathname+'?'+q);}catch(_e){location.href=location.pathname+'?'+q;return;}
  try{window.scrollTo(0,0);}catch(_e){}
  window.dispatchEvent(new Event('s2nav'));
}
// ───────── 本機暫存:讀過一次就存 localStorage,切換頁面不重讀 GAS;點「🔄 重新整理」才清掉重讀 ─────────
const CACHE_TTL=12*3600e3; // 安全保險:最久 12 小時後即使沒按重新整理也會重讀
const CACHEABLE=['s2Me','s2GetSurvey','s2GetList','s2MySurveys','s2MgrInfo','s2TodaySurveys','s2MyReports'];
const WRITE_CLEAR={s2Register:'*',s2CreateSurvey:['s2MySurveys','s2TodaySurveys'],s2DeleteSurvey:['s2MySurveys','s2GetSurvey','s2GetList','s2TodaySurveys','s2MyReports'],s2RestoreSurvey:['s2MySurveys','s2GetSurvey','s2GetList'],
  s2Report:['s2GetSurvey','s2GetList','s2TodaySurveys','s2MyReports'],s2MgrApply:['s2Me','s2MgrInfo'],s2MgrApprove:['s2MgrInfo','s2Me','s2MySurveys'],s2MgrSet:['s2MgrInfo'],s2MgrNotify:['s2MgrInfo','s2Me'],
  s2StaffSetLeft:['s2GetList'],s2WebAdminSet:['s2MgrInfo','s2Me'],s2OpenSet:['s2MgrInfo','s2GetList','s2GetSurvey'],
  s2AdminHide:['s2MgrInfo','s2Me','s2MySurveys','s2GetList','s2GetSurvey']}; // 寫入成功後,清掉受影響的暫存
function cuid(){try{const c=liff.getContext();return(c&&c.userId)||'';}catch(_e){return '';}}
function ckey(action,params){return 's2c:'+cuid()+':'+action+':'+JSON.stringify(params||{});}
function cget(k){try{const v=JSON.parse(localStorage.getItem(k)||'null');if(v&&Date.now()-v.t<CACHE_TTL)return Object.assign({},v.d,{_at:v.t});}catch(_e){}return null;} // _at=這份資料當初讀取的時間
function cput(k,d){try{localStorage.setItem(k,JSON.stringify({t:Date.now(),d:d}));}catch(_e){}}
function cclear(actions){
  try{const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf('s2c:')===0)ks.push(k);}
    ks.forEach(k=>{if(actions==='*'||actions.some(a=>k.indexOf(':'+a+':')>=0))localStorage.removeItem(k);});}catch(_e){}
}
function peek(action,params){ // 同步取暫存(沒有就 null),讓有暫存的頁面第一次畫就直接有內容,不閃「載入中」
  if(CACHEABLE.indexOf(action)<0)return null;
  return cget(ckey(action,params));
}
async function api(action,params,force){
  const cacheable=CACHEABLE.indexOf(action)>=0;const k=cacheable?ckey(action,params):'';
  if(cacheable&&!force){const c=cget(k);if(c)return c;}
  let tok='';try{tok=liff.getAccessToken()||'';}catch(_e){}
  const r=(await gasCallPost(action,Object.assign({},params||{},{accessToken:tok}),20000))||{ok:false,error:'連不上伺服器,請稍後再試'};
  if(r.ok){ r._at=Date.now(); if(cacheable)cput(k,r); else if(WRITE_CLEAR[action])cclear(WRITE_CLEAR[action]); }
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

// 資料時間(讓人看得出是舊資料)與重新整理:按了要等回應是使用者的選擇,等待時舊資料照常顯示、按鈕出現旋轉圖示
function fmtAt(at,lang){
  if(!at)return '';
  const d=new Date(at);const p=n=>String(n).padStart(2,'0');
  const ts=p(d.getMonth()+1)+'/'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());
  const m=Math.floor((Date.now()-at)/60000);const vi=lang==='vi';
  const rel=m<1?(vi?'vừa xong':'剛剛'):m<60?(m+(vi?' phút trước':' 分鐘前')):m<1440?(Math.floor(m/60)+(vi?' giờ trước':' 小時前')):(Math.floor(m/1440)+(vi?' ngày trước':' 天前'));
  return (vi?'Dữ liệu lúc ':'資料時間 ')+ts+'（'+rel+'）';
}
const RefreshBar=({at,lang,onRefresh,refreshing,err})=>(<div>
  <div className="flex items-center justify-between gap-2">
    <span className="text-xs text-gray-500">{fmtAt(at,lang)}</span>
    <button disabled={refreshing} onClick={()=>{if(onRefresh)onRefresh();else{cclear('*');window.__s2nonce++;window.dispatchEvent(new Event('s2nav'));}}} className="shrink-0 text-xs text-gray-300 border border-gray-700 rounded-full px-3 py-1 disabled:opacity-60">
      {refreshing?(<span><Spinner size={12}/> {lang==='vi'?'Đang cập nhật…':'更新中…'}</span>):(lang==='vi'?'🔄 Làm mới':'🔄 重新整理')}</button></div>
  {err&&<p className="text-xs text-red-400 text-right mt-1">{err}</p>}
</div>);
const Box=({children,at,lang,onRefresh,refreshing,err})=>(<div className="min-h-screen px-4 py-5"><div className="max-w-md mx-auto space-y-4"><RefreshBar at={at} lang={lang} onRefresh={onRefresh} refreshing={refreshing} err={err}/>{children}</div></div>);
const barOf=(st,reload,lang)=>({at:st.data&&st.data._at,lang:lang,onRefresh:()=>{reload();},refreshing:!!(st.loading&&st.data),err:st.err});
const Card=({children,className})=>(<div className={'rounded-2xl bg-gray-900 border border-gray-800 p-4 '+(className||'')}>{children}</div>);
const Spinner=({size})=>(<svg className="animate-spin inline-block align-[-2px]" width={size||18} height={size||18} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity=".25"/><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>);
const Loading=({text})=>(<Box><div className="flex flex-col items-center justify-center gap-3 pt-24 text-violet-300"><Spinner size={40}/><p className="text-sm text-gray-400">{text||'載入中…'}</p></div></Box>);
const Btn=({children,onClick,color,disabled,className,loading})=>(<button disabled={disabled||loading} onClick={onClick} className={'w-full rounded-xl py-3 font-bold text-base disabled:opacity-40 '+(color||'bg-violet-600 text-white')+' '+(className||'')}>{loading&&<span className="mr-2"><Spinner/></span>}{children}</button>);
const Chip=({on,children,onClick})=>(<button onClick={onClick} className={'px-4 py-2 rounded-full border text-sm '+(on?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-300')}>{children}</button>);
const Msg=({text})=>(<Box><Card><p className="text-center text-gray-300 whitespace-pre-line">{text}</p></Card></Box>);

function useLoad(action,params){ // 回傳[狀態,重新讀取(強制略過暫存)];有暫存時第一次畫就直接有資料;重新整理失敗時保留舊資料並標示 err
  const pk=JSON.stringify(params||{});
  const[st,setSt]=useState(()=>{const c=peek(action,params);return c?{loading:false,data:c,err:''}:{loading:true,data:null,err:''};});
  const run=useCallback((force)=>{
    if(!force){const c=peek(action,params);if(c){setSt({loading:false,data:c,err:''});return;}}
    setSt(s=>({loading:true,data:s.data,err:''}));
    api(action,params,!!force).then(d=>setSt(s=>(d&&d.ok)?{loading:false,data:d,err:''}:(s.data&&s.data.ok)?{loading:false,data:s.data,err:'更新失敗,畫面上仍是舊資料'}:{loading:false,data:d,err:''}));
  },[action,pk]);
  useEffect(()=>{run(false);},[run]);
  return[st,()=>run(true)];
}

// ───────── 基本資料(首次):角色/店別/語系/編號或名稱 → 下一步 ─────────
function RegisterForm({user,onDone,showLangFirst}){
  const[lang,setLang]=useState(user?user.lang:defaultLang());
  const[role,setRole]=useState(user?user.role:'');
  const[store,setStore]=useState(user?user.store:'');
  const[code,setCode]=useState(user?user.code:'');
  const[shift,setShift]=useState(user&&user.shift?user.shift:'');
  const[busy,setBusy]=useState(false);const[err,setErr]=useState('');
  const t=TT[lang];
  const ready=role&&store&&code.trim()&&(role!=='teacher'||shift);
  const submit=async()=>{
    setBusy(true);setErr('');
    let name='';try{const p=await liff.getProfile();name=p.displayName||'';}catch(_e){}
    const r=await api('s2Register',{role,store,lang,code:code.trim(),displayName:name,shift:role==='teacher'?shift:''});
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
      {role==='teacher'&&(<div><p className="text-sm text-gray-400 mb-2">{t.shift}</p><div className="flex gap-2"><Chip on={shift==='early'} onClick={()=>setShift('early')}>{t.early}</Chip><Chip on={shift==='late'} onClick={()=>setShift('late')}>{t.late}</Chip></div>
        <p className="text-xs text-gray-500 mt-2">{t.shiftHint}</p></div>)}
    </Card>
    {err&&<p className="text-sm text-red-400 text-center">{err}</p>}
    <Btn disabled={!ready} loading={busy} onClick={submit}>{busy?t.saving:t.next}</Btn>
  </Box>);
}

// 需要已登記身分的頁面共用:沒登記就先顯示基本資料表單,填完「下一步」再進入內容
function NeedUser({render}){
  const[st,reload]=useLoad('s2Me',{});
  const[user,setUser]=useState(undefined);const[editing,setEditing]=useState(false);
  if(st.loading&&!st.data)return(<Loading text="載入中… / Đang tải…"/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const me=st.data;const u=user===undefined?me.user:user;
  if(!u||editing)return(<RegisterForm user={u} onDone={x=>{setUser(x);setEditing(false);}}/>);
  return render(Object.assign({},me,{user:u}),()=>setEditing(true),reload);
}

TT.zh.recOk='你回報安全已記錄';TT.zh.recHelp='你回報需要協助已記錄,主管會盡快處理';TT.zh.recOther='你的回報已記錄';TT.zh.recording='記錄中…';
TT.vi.recOk='Đã ghi nhận bạn an toàn';TT.vi.recHelp='Đã ghi nhận bạn cần hỗ trợ, quản lý sẽ xử lý sớm';TT.vi.recOther='Đã ghi nhận báo cáo của bạn';TT.vi.recording='Đang ghi nhận…';
// ───────── 回報頁 ─────────
function ReportPage({sid}){
  // 開頁只打一次 GAS(s2Open = s2Me + s2GetSurvey),結果寫進暫存,後面的 NeedUser / ReportInner 直接吃暫存;兩份都已有暫存就不打
  const need=()=>!(peek('s2Me',{})&&peek('s2GetSurvey',{id:sid}));
  const[ready,setReady]=useState(()=>!need());
  useEffect(()=>{
    if(ready)return;let dead=false;
    api('s2Open',{id:sid}).then(r=>{
      if(r&&r.ok){
        if(r.me&&r.me.ok){r.me._at=Date.now();cput(ckey('s2Me',{}),r.me);}
        if(r.sv&&r.sv.ok){r.sv._at=Date.now();cput(ckey('s2GetSurvey',{id:sid}),r.sv);}
      }
      if(!dead)setReady(true); // 失敗也往下走:後面各自會再讀一次並顯示錯誤
    });
    return()=>{dead=true;};
  },[sid]);
  if(!ready)return(<Loading/>);
  return(<NeedUser render={(me,editInfo)=><ReportInner me={me} sid={sid} editInfo={editInfo}/>}/>);
}
function ReportInner({me,sid,editInfo}){
  const lang=me.user.lang;const t=TT[lang];
  const[st,reload]=useLoad('s2GetSurvey',{id:sid});
  const[other,setOther]=useState('');const[busy,setBusy]=useState(false);const[err,setErr]=useState('');const[picking,setPicking]=useState(new URLSearchParams(location.search).get('act')==='edit');
  // Flex 樣式2:按鈕帶 act=ok(直接記錄平安)/act=other(只顯示文字輸入)。未註冊者先註冊,註冊完 ReportInner 才掛載,才會自動送出
  const act=new URLSearchParams(location.search).get('act')||'';
  const clearAct=()=>{try{history.replaceState(null,'',location.pathname+'?s2=r&sid='+sid);}catch(_e){}};
  const autoRef=useRef(false);const[auto,setAuto]=useState((act==='ok'||act==='help')?'wait':'');const[rec,setRec]=useState('');
  useEffect(()=>{
    if((act!=='ok'&&act!=='help')||autoRef.current)return;
    const d=st.data;if(!d||!d.ok)return;
    if(me.user&&me.user.left){autoRef.current=true;setAuto('');return;}
    autoRef.current=true;
    if(d.survey.closed||(d.mine&&d.mine.status===act)){setAuto('');clearAct();return;} // 已回報且狀態相同就不重送;狀態不同(例如先平安、又按需要幫忙)則更新
    api('s2Report',{id:sid,status:act,otherText:''}).then(r=>{if(r.ok){setRec(act);reload();}else setErr(r.error||t.fail);setAuto('');clearAct();});
  },[st.data]);
  if(me.user&&me.user.left)return(<Msg text={lang==='vi'?'Bạn đã được đặt là nghỉ việc, không thể báo cáo. Vui lòng liên hệ quản lý.':'你已被設為離職，無法回報。如有疑問請洽主管。'}/>);
  if(st.loading&&!st.data)return(<Loading text={t.loading}/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||t.fail}/>);
  const s=st.data.survey;const mine=st.data.mine;
  const send=async(status,txt)=>{
    setBusy(true);setErr('');
    const r=await api('s2Report',{id:sid,status:status,otherText:txt||''});
    setBusy(false);
    if(r.ok){setPicking(false);setRec(status);clearAct();reload();}else setErr(r.error||t.fail);
  };
  const stLabel=x=>x==='ok'?t.ok:x==='help'?t.help:t.other;
  if(auto==='wait')return(<Loading text={t.recording}/>);
  return(<Box {...barOf(st,reload,lang)}>
    <Card>
      <p className="text-xs text-amber-400 font-bold">⚠️ {t.survey}</p>
      <h1 className="text-xl font-bold text-white mt-1">{s.title}{s.dateLabel?' '+s.dateLabel:''}</h1>
      <p className="text-sm text-gray-400 mt-2">{(s.creatorStore||s.creatorLabel)?<span>{t.by}:{s.creatorStore} {s.creatorLabel}<br/></span>:null}{t.end}:{s.endDate}</p>
    </Card>
    {s.closed&&<p className="text-center text-amber-400">{t.closed}</p>}
    {rec&&!picking&&(<Card className="text-center">
      <p className="text-lg font-bold text-emerald-400">✅ {rec==='ok'?t.recOk:rec==='help'?t.recHelp:t.recOther}</p>
      {!s.closed&&<button className="text-sm text-violet-400 mt-3 underline" onClick={()=>setPicking(true)}>{t.change}</button>}
    </Card>)}
    {mine&&!rec&&!picking&&(<Card className="text-center">
      <p className="text-lg font-bold text-emerald-400">✅ {t.sent}:{stLabel(mine.status)}{mine.status==='other'&&mine.otherText?'('+mine.otherText+')':''}</p>
      <p className="text-xs text-gray-500 mt-1">{t.sentAt} {mine.time}</p>
      {!s.closed&&<button className="text-sm text-violet-400 mt-3 underline" onClick={()=>setPicking(true)}>{t.change}</button>}
    </Card>)}
    {(!mine||picking)&&!rec&&!s.closed&&(<Card className="space-y-3">
      {act!=='other'&&<div className="grid grid-cols-2 gap-3">
        <Btn loading={busy} color="bg-emerald-600 text-white" onClick={()=>send('ok')}>{t.ok}</Btn>
        <Btn loading={busy} color="bg-red-600 text-white" onClick={()=>send('help')}>{t.help}</Btn>
      </div>}
      <input value={other} onChange={e=>setOther(e.target.value)} maxLength={200} placeholder={t.otherHint} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/>
      <Btn disabled={busy||!other.trim()} color="bg-gray-700 text-white" onClick={()=>send('other',other.trim())}>{t.other} · {t.send}</Btn>
      {err&&<p className="text-sm text-red-400 text-center">{err}</p>}
    </Card>)}
    <Btn color="bg-gray-800 text-gray-200" onClick={()=>go('s2=l&sid='+sid)}>📋 {t.list}</Btn>
    <button className="w-full text-center text-sm text-gray-500 underline" onClick={editInfo}>{t.editInfo}</button>
  </Box>);
}

// 分享機制總開關:Flex 一旦傳出去無法收回,使用者要求先停止「建立新回報後分享」的整套機制(隱藏不刪,要恢復改成 true)。
// false 時:建立後不導向分享頁、清單不顯示「分享」、分享頁顯示暫停訊息。
// 分享只開放給主管,入口都在主管功能頁(?s2=mgr):建立並分享(?s2=mnew)、分享既有回報(?s2=mine&pick=1)、分享回報教學。送出的 Flex 一律不含分享按鈕。
const SHOW_ENTRY_SHARE=false; // 「發起新回報」頁的「分享『發起新回報』入口」按鈕(暫時功能):使用者要求先移除(隱藏不刪,要恢復改成 true)
const SHOW_WEBADMIN_BTN=false; // 人員管理的「設為網頁管理者」按鈕:使用者要求先移除(隱藏不刪,後端 s2WebAdminSet 保留;要恢復改成 true)
const SHOW_REMIND_SHARE=false; // 未回報名單下方的「分享提醒」按鈕:使用者要求先移除(隱藏不刪,要恢復改成 true)
// 詳細列表:篩選(狀態)與排序(時間/編號/狀態)
function detailRows(items,sortBy,asc,flt){
  const rows=items.filter(i=>flt==='all'||i.status===flt);
  const rank={help:0,other:1,ok:2};
  rows.sort((a,b)=>{
    let c=0;
    if(sortBy==='time')c=String(a.time).localeCompare(String(b.time));
    else if(sortBy==='code'){const x=parseFloat(a.label),y=parseFloat(b.label);c=(isNaN(x)||isNaN(y))?String(a.label).localeCompare(String(b.label)):x-y;}
    else c=(rank[a.status]-rank[b.status])||(String(b.time).localeCompare(String(a.time)));
    return asc?c:-c;
  });
  return rows;
}
// ───────── 名單頁(依店別分組) ─────────
function ListPage({sid}){
  return(<NeedUser render={(me,editInfo)=><ListInner me={me} sid={sid}/>}/>);
}
// 未回報人員複製文字:[標題]尚未回報人員：30 139 161 (2026/10/23 13:30)
function missingText(title,codes){
  const n=new Date();const p=x=>String(x).padStart(2,'0');
  return String(title||'')+'尚未回報人員：'+(codes||[]).join(' ')+' ('+n.getFullYear()+'/'+p(n.getMonth()+1)+'/'+p(n.getDate())+' '+p(n.getHours())+':'+p(n.getMinutes())+')';
}
const SEGS=[['te','老師 早班','早班','Ca sáng'],['tl','老師 晚班','晚班','Ca tối'],['tn','老師 未填班別','未填班別','Chưa chọn ca'],['c','櫃台','櫃台','Lễ tân']];
function ListInner({me,sid}){
  const t=TT[me.user.lang];const lang0=me.user.lang;
  const[st,reload]=useLoad('s2GetList',{id:sid});
  const[copied,setCopied]=useState('');const[open,setOpen]=useState(false);const[sortBy,setSortBy]=useState('time');const[asc,setAsc]=useState(false);const[flt,setFlt]=useState('all');
  if(st.loading&&!st.data)return(<Loading text={t.loading}/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||t.fail}/>);
  const d=st.data;
  const doCopy=(g)=>{copyText(g.items.map(i=>i.label).join(' ')).then(ok=>{if(ok){setCopied(g.store);setTimeout(()=>setCopied(''),1800);}});};
  return(<Box {...barOf(st,reload,lang0)}>
    <Card><p className="text-xs text-amber-400 font-bold">⚠️ {t.survey}</p><h1 className="text-lg font-bold text-white mt-1">{d.survey.title}</h1></Card>
    {d.stores.map(g=>(<Card key={g.store}>
      <div className="flex items-center justify-between"><p className="font-bold text-white">{g.store}（{g.items.length}/{g.total}）</p>
        {g.items.length>0&&<button className="text-sm text-violet-400" onClick={()=>doCopy(g)}>{copied===g.store?t.copied:t.copy}</button>}</div>
      {g.items.length===0&&<p className="mt-2 text-gray-500">{t.noOne}</p>}
      {g.segTotals&&(()=>{
        const vi=lang0==='vi';const tk=['te','tl','tn'];
        const tTot=tk.reduce((a,k)=>a+g.segTotals[k],0);const tRep=g.items.filter(i=>tk.indexOf(i.seg)>=0).length;
        const line=(sg,indent)=>{if(!g.segTotals[sg[0]])return null;const its=g.items.filter(i=>i.seg===sg[0]);
          return(<p key={sg[0]} className={'text-base leading-8 break-all '+(indent?'pl-4':'')}><span className="text-sm text-gray-400">{vi?sg[3]:sg[2]}（{its.length}/{g.segTotals[sg[0]]}）：</span>
            {its.map((i,k)=>(<span key={k} className={'mr-3 '+(i.status==='help'?'text-red-400 font-bold':i.status==='other'?'text-amber-300':'text-gray-100')}>{i.label}{i.status==='help'?'⚠':''}</span>))}</p>);};
        return(<div className="mt-2">
          {tTot>0&&<p className="text-sm font-bold text-white">{vi?'KTV':'老師'}（{tRep}/{tTot}）</p>}
          {SEGS.filter(sg=>sg[0]!=='c').map(sg=>line(sg,true))}{line(SEGS[3],false)}</div>);
      })()}
    </Card>))}
    {d.restricted&&<p className="text-xs text-gray-500 text-center">{lang0==='vi'?'Chỉ hiển thị chi nhánh của bạn':'僅顯示你所屬店家'}:{d.myStore}</p>}
    {d.showMissing&&(<Card className="space-y-3"><p className="font-bold text-white">未回報名單<span className="ml-2 text-xs font-normal text-gray-500">(已登記但尚未回報)</span></p>
      {d.stores.map(g=>(<div key={g.store}><div className="flex items-center justify-between"><p className="text-sm text-gray-200">{g.store}（{(g.missing||[]).length}）</p>
        {(g.missing||[]).length>0&&<button className="text-sm text-violet-400" onClick={()=>copyText(missingText(d.survey&&d.survey.title,g.missing)).then(ok=>{if(ok){setCopied('m:'+g.store);setTimeout(()=>setCopied(''),1800);}})}>{copied==='m:'+g.store?t.copied:t.copy}</button>}</div>
        <p className="mt-1 text-base leading-8 break-all text-gray-100">{(g.missing||[]).length===0?<span className="text-emerald-400 text-sm">都已回報 ✅</span>:(g.missing||[]).map((x,k)=>(<span key={k} className="mr-3">{x}</span>))}</p></div>))}
      {SHOW_REMIND_SHARE&&<Btn color="bg-blue-600 text-white" onClick={()=>go('s2=share&sid='+sid)}>分享提醒(可再單獨傳給沒回報的人)</Btn>}</Card>)}
    {d.detail&&(<div><button className="text-sm text-gray-400 underline" onClick={()=>setOpen(!open)}>{t.detail} {open?'▲':'▼'}</button>
      {open&&(<div className="mt-2 space-y-2">
        <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-gray-500">排序</span>
          {[['time','時間'],['code','編號'],['status','狀態']].map(x=>(<Chip key={x[0]} on={sortBy===x[0]} onClick={()=>{if(sortBy===x[0])setAsc(!asc);else{setSortBy(x[0]);setAsc(x[0]!=='time');}}}>{x[1]}{sortBy===x[0]?(asc?' ↑':' ↓'):''}</Chip>))}</div>
        <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-gray-500">篩選</span>
          {[['all','全部'],['ok','平安'],['help','需要協助'],['other','其他']].map(x=>(<Chip key={x[0]} on={flt===x[0]} onClick={()=>setFlt(x[0])}>{x[1]}</Chip>))}</div>
        {d.stores.map(g=>{const rows=detailRows(g.items,sortBy,asc,flt);return rows.length>0&&(<Card key={g.store}><p className="font-bold text-white text-sm mb-1">{g.store}（{rows.length}）</p>
          {rows.map((i,k)=>(<p key={k} className="text-xs leading-6 text-gray-300"><span className={i.status==='help'?'text-red-400 font-bold':i.status==='other'?'text-amber-300':'text-gray-100'}>{i.label}　{i.status==='ok'?'平安':i.status==='help'?'需要協助':'其他'}</span>{i.otherText?'：'+i.otherText:''}　<span className="text-gray-500">{String(i.time).slice(5,16)}</span></p>))}</Card>);})}
        {d.stores.every(g=>detailRows(g.items,sortBy,asc,flt).length===0)&&<p className="text-sm text-gray-500 text-center">沒有符合的項目</p>}
      </div>)}</div>)}
    <Btn color="bg-gray-800 text-gray-200" onClick={()=>go('s2=r&sid='+sid)}>← {t.back}</Btn>
  </Box>);
}

// ───────── 發起人:新增 ─────────
function NewPage({share}){
  // 目前限主管才能發起(舊 Flex 還在群組流傳);後端 s2CreateSurvey 也擋,放寬時改 GAS 屬性 S2_CREATE_MGR_ONLY=0
  const inner=()=>(share?<NeedUser render={()=><NewInner share={true}/>}/>:<NeedUser render={()=><NewInner/>}/>);
  return(<NeedUserOptional render={(me)=>me.canCreate===false
    ?<NoCreate/>
    :(share?<MgrGate render={inner}/>:inner())}/>);
}
function NoCreate(){
  return(<Box><Card className="space-y-3"><h1 className="text-lg font-bold text-white">📝 發起新回報</h1>
    <p className="text-amber-300 font-bold">目前限制主管才能發起新回報</p>
    <p className="text-sm text-gray-400">如需發起，請洽主管。若你剛通過主管申請，請按下方重新整理。</p></Card>
    <Btn color="bg-gray-800 text-white border border-gray-600" onClick={()=>{cclear('*');window.__s2nonce++;window.dispatchEvent(new Event('s2nav'));}}>🔄 重新整理</Btn>
    <Btn color="bg-gray-800 text-gray-200" onClick={()=>go('s2=mine')}>我發起的清單</Btn></Box>);
}
// 只有主管/管理者能進的頁面(分享相關)
function MgrGate({render}){
  const[st]=useLoad('s2MgrInfo',{});
  if(st.loading&&!st.data)return(<Loading/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  if(!st.data.isMgr)return(<Msg text="此功能僅限主管使用(請由「主管功能」申請)"/>);
  return render();
}
// 標題輸入歷史(只存在本機,最多 8 筆,新的排前面)
const HIST_KEY='s2:titleHist';
function loadTitleHist(){try{const v=JSON.parse(localStorage.getItem(HIST_KEY)||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string').slice(0,8):[];}catch(_e){return [];}}
function saveTitleHist(t){try{const v=[t].concat(loadTitleHist().filter(x=>x!==t)).slice(0,8);localStorage.setItem(HIST_KEY,JSON.stringify(v));}catch(_e){}}
function clearTitleHist(){try{localStorage.removeItem(HIST_KEY);}catch(_e){}}
function NewInner({share}){
  const def=new Date(); // 每日回報:日期固定為今天,不可改
  const pad=n=>String(n).padStart(2,'0');
  const[title,setTitle]=useState('');const[end]=useState(def.getFullYear()+'-'+pad(def.getMonth()+1)+'-'+pad(def.getDate()));
  const[busy,setBusy]=useState(false);const[err,setErr]=useState('');
  const[entryRes,setEntryRes]=useState('');const[hist,setHist]=useState(loadTitleHist());
  const shareEntry=async()=>{ // 暫時功能:Rich Menu 完成後移除
    try{if(!liff.isApiAvailable('shareTargetPicker')){setEntryRes('此環境不支援分享,請在 LINE 內開啟');return;}
      const r=await liff.shareTargetPicker([{type:'flex',altText:'🚨 安全回報:天災、緊急事件時,一鍵回報平安',contents:buildEntryFlex()}]);setEntryRes(r?'已分享 ✅':'已取消');}catch(e){setEntryRes('錯誤:'+String(e&&e.message||e));}
  };
  const create=async()=>{setBusy(true);setErr('');const r=await api('s2CreateSurvey',{title:title.trim(),endDate:end});setBusy(false);if(r.ok){saveTitleHist(title.trim());}if(r.ok)go(share?'s2=share&sid='+r.id+'&fresh=1':'s2=mine');else setErr(r.error||'失敗');};
  return(<Box>
    <Card className="space-y-3"><h1 className="text-lg font-bold text-white">{share?'📤 建立新回報並分享':'📝 發起新回報'}</h1>
      <div><p className="text-sm text-gray-400 mb-1">標題(最多40字)</p><input value={title} onChange={e=>setTitle(e.target.value)} maxLength={40} placeholder="例如:10/24 颱風 安全回報" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/>
        {hist.length>0&&(<div className="mt-2"><div className="flex items-center justify-between"><span className="text-xs text-gray-500">曾輸入過(點一下帶入)</span><button className="text-xs text-gray-500 underline" onClick={()=>{clearTitleHist();setHist([]);}}>清除</button></div>
          <div className="flex flex-wrap gap-2 mt-1">{hist.map(h=>(<button key={h} onClick={()=>setTitle(h)} className="px-3 py-1 rounded-full border border-gray-600 text-xs text-gray-300">{h}</button>))}</div></div>)}</div>
      <div><p className="text-sm text-gray-400 mb-1">日期（今日，不可更改）</p><p className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-gray-200">{end}</p></div>
      <p className="text-xs text-gray-500">備註：本回報頁為每日回報，故只能設一天到期。</p></Card>
    {err&&<p className="text-sm text-red-400 text-center">{err}</p>}
    <Btn disabled={!title.trim()||!end} loading={busy} onClick={create}>{share?'建立並分享':'建立'}</Btn>
    {SHOW_ENTRY_SHARE&&<Btn color="bg-gray-700 text-white" onClick={shareEntry}>分享「發起新回報」入口</Btn>}
    {SHOW_ENTRY_SHARE&&entryRes&&<p className="text-center text-sm text-gray-400">{entryRes}</p>}
    <Btn color="bg-gray-800 text-gray-200" onClick={()=>go('s2=mine')}>我發起的清單</Btn>
  </Box>);
}

// ───────── 發起人:我發起的清單 ─────────
function MinePage(){
  return(<NeedUser render={()=><MineInner/>}/>);
}
function MineInner(){
  const pick=new URLSearchParams(location.search).get('pick')==='1'; // 從主管功能頁「分享既有回報」進來才顯示分享按鈕(分享頁本身也限主管)
  const[st,reload]=useLoad('s2MySurveys',{});
  const[busy,setBusy]=useState('');
  if(st.loading&&!st.data)return(<Loading/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const d=st.data;
  const del=async(s)=>{if(!window.confirm('確定要刪除「'+s.title+'」嗎?(資料會保留,只是從清單隱藏)'))return;setBusy(s.id);const r=await api('s2DeleteSurvey',{id:s.id});if(r.ok){reload();setTimeout(()=>setBusy(''),5000);}else{setBusy('');alert(r.error||'失敗');}}; // 點了立刻變灰＋轉圈,成功後保持到清單更新(最久5秒)
  const restore=async(s)=>{setBusy(s.id);const r=await api('s2RestoreSurvey',{id:s.id});if(r.ok){reload();setTimeout(()=>setBusy(''),5000);}else{setBusy('');alert(r.error||'失敗');}};
  const row=(s)=>(<Card key={s.id} className={s.hidden?'opacity-60':''}>
    <p className="font-bold text-white">{s.title}{s.hidden&&<span className="ml-2 text-xs text-red-400">已刪除</span>}{s.closed&&!s.hidden&&<span className="ml-2 text-xs text-gray-500">已截止</span>}</p>
    <p className="text-xs text-gray-400 mt-1">{s.creatorStore} {s.creatorLabel}　截止 {s.endDate}　已回報 {s.count} 人{s.help>0&&<span className="text-red-400">（需協助 {s.help}）</span>}</p>
    <div className={'grid gap-2 mt-3 '+(pick?'grid-cols-3':'grid-cols-2')}>
      <button className="rounded-lg bg-violet-600 text-white text-sm py-2" onClick={()=>go('s2=l&sid='+s.id)}>查看名單</button>
      {pick&&<button disabled={s.hidden} className="rounded-lg bg-blue-600 text-white text-sm py-2 disabled:opacity-30" onClick={()=>go('s2=share&sid='+s.id)}>分享</button>}
      {s.hidden?(d.canRestore?<button disabled={!!busy} className={'rounded-lg border text-sm py-2 '+(busy===s.id?'border-gray-600 text-gray-500 opacity-60':'border-emerald-500 text-emerald-400 disabled:opacity-40')} onClick={()=>restore(s)}>{busy===s.id?<Spinner size={16}/>:'還原'}</button>:<span/>)
        :(s.canDelete?<button disabled={!!busy} className={'rounded-lg border text-sm py-2 '+(busy===s.id?'border-gray-600 text-gray-500 opacity-60':'border-red-500 text-red-400 disabled:opacity-40')} onClick={()=>del(s)}>{busy===s.id?<Spinner size={16}/>:'刪除'}</button>:<span/>)}
    </div></Card>);
  let body;
  if(d.groupByStore){
    const g={};d.surveys.forEach(s=>{(g[s.creatorStore||'未分店']=g[s.creatorStore||'未分店']||[]).push(s);});
    body=Object.keys(g).map(k=>(<div key={k}><p className="text-sm font-bold text-violet-300 mb-2">{k}（{g[k].length}）</p><div className="space-y-3">{g[k].map(row)}</div></div>));
  }else body=<div className="space-y-3">{d.surveys.map(row)}</div>;
  return(<Box {...barOf(st,reload,'zh')}>
    <h1 className="text-lg font-bold text-white">📋 我發起的清單</h1>
    <Btn onClick={()=>go('s2=new')}>＋ 發起新回報</Btn>
    {d.surveys.length===0&&<Card><p className="text-center text-gray-500">目前沒有項目</p></Card>}
    {body}
  </Box>);
}

// ───────── 分享 Flex ─────────
function buildFlex(s,style){
  const base='https://liff.line.me/'+window.__S2_LIFF_ID;
  return{type:'bubble',
    body:{type:'box',layout:'vertical',spacing:'md',paddingAll:'lg',contents:[
      {type:'text',text:'⚠️ 安全回報 / Báo cáo an toàn',weight:'bold',size:'sm',color:'#f59e0b'},
      {type:'text',text:s.title+(s.dateLabel?' '+s.dateLabel:''),weight:'bold',size:'lg',wrap:true,color:'#111111'},
      {type:'text',text:'截止:'+s.endDate,size:'sm',color:'#888888',wrap:true}, // 發起人姓名/店別不放進 Flex(一般成員不可見)
      {type:'text',text:style===2?'請直接點下方按鈕回報\nBấm nút bên dưới để báo cáo':'請點下方按鈕回報\nBấm nút bên dưới để báo cáo',size:'xs',color:'#888888',wrap:true}]},
    footer:{type:'box',layout:'vertical',spacing:'sm',paddingAll:'lg',contents:(style===2?[
      // 樣式2:shareTargetPicker 送出的訊息只允許 URI 動作(LINE 規定,不能 postback),所以按鈕直接開 LIFF 並帶 act,開啟後自動記錄
      // 4 顆按鈕各佔一列,中越雙語:我很安全(ok,自動記錄)、需要幫忙(help,自動記錄)、其他(自行輸入)、修改回報(開頁直接進修改畫面)
      {type:'button',style:'primary',color:'#16a34a',height:'sm',action:{type:'uri',label:'✅ 我很安全 / Tôi an toàn',uri:base+'?s2=r&sid='+s.id+'&act=ok'}},
      {type:'button',style:'primary',color:'#dc2626',height:'sm',action:{type:'uri',label:'🆘 需要幫忙 / Cần hỗ trợ',uri:base+'?s2=r&sid='+s.id+'&act=help'}},
      {type:'button',style:'secondary',height:'sm',action:{type:'uri',label:'✍️ 其他（自行輸入）/ Khác',uri:base+'?s2=r&sid='+s.id+'&act=other'}},
      {type:'button',style:'secondary',height:'sm',action:{type:'uri',label:'修改回報 / Sửa báo cáo',uri:base+'?s2=r&sid='+s.id+'&act=edit'}}]:[
      {type:'button',style:'primary',color:'#dc2626',height:'sm',action:{type:'uri',label:'我要回報 / Báo cáo',uri:base+'?s2=r&sid='+s.id}}]).concat([
      {type:'button',style:'secondary',height:'sm',action:{type:'uri',label:'回報名單 / Danh sách',uri:base+'?s2=l&sid='+s.id}}])}};
}
// 暫時功能(使用者要求,Rich Menu 完成後移除):在「發起新回報」頁分享一張「發起入口」Flex,按鈕直接開 ?s2=new
function buildEntryFlex(){
  const base='https://liff.line.me/'+window.__S2_LIFF_ID;
  const pts=['不用再人工統計誰還沒回報。系統自動依店別列出已回報名單與人數。',
    '以 LINE 帳號回報,一個帳號一筆,降低代簽、冒名的狀況。',
    '發起後可分享到公司其他群組,各店都能一起回報;也能再單獨分享給遲遲沒回報的人,提醒他們補上。',
    '回報狀態分「平安、需要協助、其他」,需要協助的編號會標紅,可以優先處理。',
    '第一次回報填一次基本資料,之後點一下就完成。'];
  const rows=pts.map((t,i)=>({type:'box',layout:'horizontal',spacing:'sm',contents:[
    {type:'text',text:String(i+1)+'.',size:'sm',color:'#dc2626',weight:'bold',flex:0},
    {type:'text',text:t,size:'sm',color:'#333333',wrap:true,flex:1}]}));
  return{type:'bubble',
    body:{type:'box',layout:'vertical',spacing:'md',paddingAll:'lg',contents:[
      {type:'text',text:'🚨 安全回報',weight:'bold',size:'xl',color:'#dc2626'},
      {type:'text',text:'天災、緊急事件時,一鍵回報平安',size:'sm',color:'#666666',wrap:true},
      {type:'separator',margin:'md'},
      {type:'box',layout:'vertical',spacing:'sm',margin:'md',contents:rows}]},
    footer:{type:'box',layout:'vertical',spacing:'sm',paddingAll:'lg',contents:[
      {type:'button',style:'primary',color:'#dc2626',height:'sm',action:{type:'uri',label:'發起新回報',uri:base+'?s2=new'}}]}};
}
// ───────── 回報教學 Flex(2頁,主管功能頁分享;沒有任何按鈕) ─────────
// 「大群公告專用」字卡(回報教學第2頁、老師不要在大群回文 共用)
function noBigGroupBubble(title){
  const line=(t)=>({type:'text',text:t,weight:'bold',size:'3xl',color:'#b34700',align:'center',wrap:true});
  return{type:'bubble',size:'giga',
    header:{type:'box',layout:'vertical',backgroundColor:'#e65100',paddingAll:'lg',contents:[{type:'text',text:title,color:'#ffffff',weight:'bold',size:'3xl',wrap:true}]},
    body:{type:'box',layout:'vertical',justifyContent:'center',spacing:'md',paddingAll:'xl',contents:[line('店內大群為'),line('主管公佈訊息專用'),line('主管公佈訊息專用'),line('主管公佈訊息專用')]},
    footer:{type:'box',layout:'vertical',paddingAll:'lg',contents:[{type:'text',text:'說3次代表很重要　謝謝大家配合 🙏',color:'#888888',size:'md',align:'center'}]}};
}
function buildNoReplyFlex(){return noBigGroupBubble('老師不要在大群回文');}
function buildTutorialFlex(){
  const step=(n,txt,extra,color)=>({type:'box',layout:'horizontal',spacing:'md',contents:[
    {type:'box',layout:'vertical',width:'32px',height:'32px',cornerRadius:'16px',backgroundColor:color||'#1e88e5',justifyContent:'center',alignItems:'center',flex:0,contents:[{type:'text',text:String(n),color:'#ffffff',weight:'bold',size:'md',align:'center'}]},
    {type:'box',layout:'vertical',spacing:'sm',flex:1,contents:[{type:'text',text:txt,wrap:true,size:'xl',color:'#222222'}].concat(extra||[])}]});
  const fakeBtn={type:'box',layout:'vertical',backgroundColor:'#06c755',cornerRadius:'8px',paddingAll:'md',contents:[{type:'text',text:'我要回報',color:'#ffffff',weight:'bold',size:'xl',align:'center'}]};
  const p1={type:'bubble',size:'giga',
    header:{type:'box',layout:'vertical',backgroundColor:'#1e88e5',paddingAll:'lg',contents:[{type:'text',text:'如何做 安全回報（教學）',color:'#ffffff',weight:'bold',size:'xxl',wrap:true}]},
    body:{type:'box',layout:'vertical',spacing:'xl',paddingAll:'lg',contents:[
      step(1,'點訊息下方的',[fakeBtn]),
      step(2,'第一次使用：選擇身分（老師／櫃台）、店別、語系，按「下一步」'),
      step(3,'點選「平安」、「需要協助」或「其他」即完成')]},
    footer:{type:'box',layout:'vertical',paddingAll:'lg',contents:[{type:'text',text:'只需設定一次，之後會自動記住你',color:'#888888',size:'md',wrap:true}]}};
  const p2=noBigGroupBubble('不會操作請找主管詢問');
  return{type:'carousel',contents:[p1,p2]};
}
function buildMgrInviteFlex(){
  const base='https://liff.line.me/'+window.__S2_LIFF_ID;
  // 版型沿用「發起入口」卡(buildEntryFlex,已停用不刪),按鈕改開主管功能頁;文字加上「發起與分享只能在主管頁進行」
  const pts=['不用再人工統計誰還沒回報。系統自動依店別列出已回報名單與人數。',
    '以 LINE 帳號回報,一個帳號一筆,降低代簽、冒名的狀況。',
    '回報狀態分「平安、需要協助、其他」,需要協助的編號會標紅,可以優先處理。',
    '第一次回報填一次基本資料,之後點一下就完成。',
    '目前「發起新回報」以及「分享回報」,只能在主管功能頁進行。',
    '主管、組長、副理請點下方按鈕,申請設定主管職級,即可發起、分享安全回報並查看本店人員。'];
  const rows=pts.map((t,i)=>({type:'box',layout:'horizontal',spacing:'sm',contents:[
    {type:'text',text:String(i+1)+'.',size:'sm',color:'#6d4aa8',weight:'bold',flex:0},
    {type:'text',text:t,size:'sm',color:'#333333',wrap:true,flex:1,weight:i===4?'bold':'regular'}]}));
  return{type:'bubble',
    body:{type:'box',layout:'vertical',spacing:'md',paddingAll:'lg',contents:[
      {type:'text',text:'🚨 安全回報',weight:'bold',size:'xl',color:'#dc2626'},
      {type:'text',text:'天災、緊急事件時,一鍵回報平安',size:'sm',color:'#666666',wrap:true},
      {type:'separator',margin:'md'},
      {type:'box',layout:'vertical',spacing:'sm',margin:'md',contents:rows}]},
    footer:{type:'box',layout:'vertical',spacing:'sm',paddingAll:'lg',contents:[
      {type:'button',style:'primary',color:'#6d4aa8',height:'sm',action:{type:'uri',label:'開啟主管功能',uri:base+'?s2=mgr'}}]}};
}
function ShareFlexBtn({label,altText,build}){
  const[res,setRes]=useState('');
  const go2=async()=>{
    try{if(!liff.isApiAvailable('shareTargetPicker')){setRes('此環境不支援分享,請在 LINE 內開啟');return;}
      const r=await liff.shareTargetPicker([{type:'flex',altText:altText,contents:build()}]);setRes(r?'已分享 ✅':'已取消');}catch(e){setRes('錯誤:'+String(e&&e.message||e));}
  };
  return(<div><Btn color="bg-gray-800 text-white border border-gray-600" onClick={go2}>{label}</Btn>{res&&<p className="text-center text-sm text-gray-400 mt-1">{res}</p>}</div>);
}
// 人員管理:本店(區經理以上看全部店)所有已登記人員,可設/取消離職(離職者不計入名單分母、未回報名單,也不能再回報)
function StaffList(){
  const[st,reload]=useLoad('s2StaffList',{});
  const[busy,setBusy]=useState('');const[err,setErr]=useState('');
  if(st.loading&&!st.data)return(<Loading/>);
  if(!st.data||!st.data.ok)return(<p className="text-sm text-red-400">{(st.data&&st.data.error)||'失敗'}</p>);
  const d=st.data;
  const toggle=async(m)=>{
    if(!m.left&&!window.confirm('將「'+m.store+' '+m.code+'」移除？\n(資料保留，不再計入名單與分母，之後可恢復)'))return;
    setBusy(m.id);setErr('');const r=await api('s2StaffSetLeft',{targetId:m.id,left:!m.left});setBusy('');if(r.ok)reload();else setErr(r.error||'失敗');
  };
  const webToggle=async(m)=>{
    if(!window.confirm((m.web?'取消':'設定')+'「'+m.store+' '+m.code+'」（LINE：'+(m.name||'未取得')+'）為網頁管理者？'+(m.web?'':'\n網頁管理者權限等同管理者。')))return;
    setBusy(m.id);setErr('');const r=await api('s2WebAdminSet',{targetId:m.id,on:!m.web});setBusy('');if(r.ok)reload();else setErr(r.error||'失敗');
  };
  const groups=(d.stores||[]).map(sn=>({store:sn,items:d.staff.filter(x=>x.store===sn)})).filter(g=>g.items.length>0);
  return(<div className="space-y-3">
    {groups.length===0&&<p className="text-sm text-gray-500">目前沒有人員</p>}
    {groups.map(g=>(<div key={g.store}><p className="text-sm text-gray-300">{g.store}（在職 {g.items.filter(x=>!x.left).length}／共 {g.items.length}）</p>
      <div className="mt-1 divide-y divide-gray-800">{g.items.map(m=>(<div key={m.id} className="flex items-center justify-between py-2">
        <div className="min-w-0"><p className={m.left?'text-gray-500 line-through':'text-gray-100'}>{m.code}{m.role==='counter'?'（櫃台）':''}{m.shift==='early'?'（早班）':m.shift==='late'?'（晚班）':''}{m.left?'　已移除':''}{m.web&&<span className="ml-2 text-xs text-violet-300 no-underline">網頁管理者</span>}</p>
          <p className="text-xs text-gray-400 break-all">LINE：{m.name||'（未取得）'}</p></div>
        <div className="flex flex-col gap-1 items-end flex-none ml-2">
          <button disabled={busy===m.id} className={'px-3 py-1 rounded-full text-sm '+(m.left?'bg-emerald-700 text-white':'bg-gray-700 text-gray-200')} onClick={()=>toggle(m)}>{m.left?'恢復':'移除'}</button>
          {SHOW_WEBADMIN_BTN&&d.realAdmin&&!m.left&&<button disabled={busy===m.id} className={'px-3 py-1 rounded-full text-xs border '+(m.web?'border-red-500 text-red-400':'border-violet-500 text-violet-300')} onClick={()=>webToggle(m)}>{m.web?'取消網頁管理者':'設為網頁管理者'}</button>}</div></div>))}</div></div>))}
    {err&&<p className="text-sm text-red-400">{err}</p>}
  </div>);
}
function StaffCard(){
  const[open,setOpen]=useState(false);
  return(<Card className="space-y-3"><button className="w-full flex items-center justify-between text-left" onClick={()=>setOpen(!open)}><span className="font-bold text-white">👥 人員管理（移除）</span><span className="text-gray-400">{open?'▲':'▼'}</span></button>
    {open&&<StaffList/>}</Card>);
}

function SharePage({sid,fresh}){
  return(<MgrGate render={()=><NeedUser render={()=><ShareInner sid={sid} fresh={fresh}/>}/>}/>);
}
function ShareInner({sid,fresh}){
  const[st]=useLoad('s2GetSurvey',{id:sid});
  const[res,setRes]=useState('');
  const pick=async(s,style)=>{
    try{
      if(!liff.isApiAvailable('shareTargetPicker')){setRes('此環境不支援分享,請在 LINE 內開啟');return;}
      const r=await liff.shareTargetPicker([{type:'flex',altText:'⚠️ 安全回報:'+s.title+(s.dateLabel?' '+s.dateLabel:''),contents:buildFlex(s,style)}]);
      setRes(r?'ok':'cancel');
    }catch(e){setRes('錯誤:'+String(e&&e.message||e));}
  };
  if(st.loading&&!st.data)return(<Loading/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const s=st.data.survey;
  return(<Box>
    <Card><p className="text-xs text-amber-400 font-bold">{fresh?'✅ 已建立':'分享'}</p><h1 className="text-lg font-bold text-white mt-1">{s.title}</h1><p className="text-sm text-gray-400 mt-1">截止 {s.endDate}</p></Card>
    <Btn onClick={()=>pick(s,2)}>分享（樣式2：群組內直接按「我平安／其他」）</Btn>
    <Btn color="bg-gray-700 text-white" onClick={()=>pick(s,1)}>分享（樣式1：「我要回報」進頁面再選）</Btn>
    {res==='ok'&&<p className="text-center text-emerald-400">已分享 ✅</p>}
    {res==='cancel'&&<p className="text-center text-gray-400">已取消</p>}
    {res&&res!=='ok'&&res!=='cancel'&&<p className="text-center text-red-400 text-sm">{res}</p>}
    <Btn color="bg-gray-800 text-gray-200" onClick={()=>go('s2=l&sid='+sid)}>查看名單</Btn>
    <Btn color="bg-gray-800 text-gray-200" onClick={()=>go('s2=mine')}>我發起的清單</Btn>
  </Box>);
}

// ───────── 我的回報(一般成員):列出目前未截止的回報,點進去就能回報 ─────────
const TD={zh:{title:'我的回報',none:'目前沒有需要回報的項目',end:'截止',done:'已回報',todo:'尚未回報',go:'前往回報',change:'修改回報',list:'回報名單',ok:'平安',help:'需要協助',other:'其他',loading:'載入中…'},
  vi:{title:'Báo cáo của tôi',none:'Hiện không có mục cần báo cáo',end:'Hạn chót',done:'Đã báo cáo',todo:'Chưa báo cáo',go:'Báo cáo ngay',change:'Sửa báo cáo',list:'Danh sách',ok:'An toàn',help:'Cần hỗ trợ',other:'Khác',loading:'Đang tải…'}};
function TodayPage(){
  return(<NeedUser render={(me)=><TodayInner me={me}/>}/>);
}
function TodayInner({me}){
  const lang=(me.user&&me.user.lang)||'zh';const t=TD[lang]||TD.zh;
  const[st,reload]=useLoad('s2TodaySurveys',{});
  if(me.user&&me.user.left)return(<Msg text={lang==='vi'?'Bạn đã được đặt là nghỉ việc, không thể báo cáo.':'你已被設為離職，無法回報。如有疑問請洽主管。'}/>);
  if(st.loading&&!st.data)return(<Loading text={t.loading}/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const d=st.data;
  return(<Box {...barOf(st,reload,lang)}>
    <h1 className="text-lg font-bold text-white">🙋 {t.title}</h1>
    {d.surveys.length===0&&<Card><p className="text-center text-gray-500">{t.none}</p></Card>}
    {d.surveys.map(x=>(<Card key={x.id} className="space-y-2">
      <p className="font-bold text-white">{x.title}</p>
      <p className="text-xs text-gray-400">{t.end} {x.endDate}</p>
      <p className={'text-sm '+(x.mine?(x.mine.status==='help'?'text-red-400':x.mine.status==='other'?'text-amber-400':'text-emerald-400'):'text-gray-400')}>{x.mine?(t.done+'：'+(x.mine.status==='ok'?t.ok:x.mine.status==='help'?t.help:t.other)):t.todo}</p>
      <div className="grid grid-cols-2 gap-2">
        <Btn onClick={()=>go('s2=r&sid='+x.id)}>{x.mine?t.change:t.go}</Btn>
        <Btn color="bg-gray-800 text-gray-200" onClick={()=>go('s2=l&sid='+x.id)}>{t.list}</Btn></div></Card>))}
  </Box>);
}
// ───────── 我的安全回報記錄(唯讀):日期、主題、回報內容、回報時間;已刪除/隱藏的不顯示 ─────────
const TM={zh:{title:'我的安全回報記錄',none:'目前沒有回報記錄',ok:'平安',help:'需要協助',other:'其他',time:'回報時間',loading:'載入中…'},
  vi:{title:'Lịch sử báo cáo an toàn của tôi',none:'Chưa có lịch sử báo cáo',ok:'An toàn',help:'Cần hỗ trợ',other:'Khác',time:'Thời gian báo cáo',loading:'Đang tải…'}};
function MyReportsPage(){
  return(<NeedUser render={(me)=><MyReportsInner me={me}/>}/>);
}
function MyReportsInner({me}){
  const lang=(me.user&&me.user.lang)||'zh';const t=TM[lang]||TM.zh;
  const[st,reload]=useLoad('s2MyReports',{});
  if(st.loading&&!st.data)return(<Loading text={t.loading}/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const d=st.data;
  return(<Box {...barOf(st,reload,lang)}>
    <h1 className="text-lg font-bold text-white">🗒️ {t.title}</h1>
    {d.reports.length===0&&<Card><p className="text-center text-gray-500">{t.none}</p></Card>}
    {d.reports.map((x,k)=>(<Card key={x.id+'|'+k} className="space-y-1">
      <p className="text-xs text-gray-400">{x.date}</p>
      <p className="font-bold text-white">{x.title}</p>
      <p className={x.status==='help'?'text-red-400 font-bold':x.status==='other'?'text-amber-400':'text-emerald-400'}>{x.status==='ok'?t.ok:x.status==='help'?t.help:t.other+(x.otherText?'：'+x.otherText:'')}</p>
      <p className="text-xs text-gray-500">{t.time}　{x.time}</p></Card>))}
  </Box>);
}
// ───────── 人員清單(僅主管):LINE 名稱、移除 ─────────
function StaffPage(){
  return(<MgrGate render={()=><Box><Card className="space-y-3"><h1 className="text-lg font-bold text-white">👥 人員清單</h1><StaffList/></Card></Box>}/>);
}

// ───────── 主管功能 ─────────
function MgrPage(){
  return(<NeedUserOptional render={(me,needReg)=><MgrInner me={me} needReg={needReg}/>}/>);
}
// 主管頁:已是主管/管理者不用登記;不是主管且沒登記要先登記(申請需要店別與編號)
function NeedUserOptional({render}){
  const[st]=useLoad('s2Me',{});
  const[user,setUser]=useState(undefined);
  if(st.loading&&!st.data)return(<Loading/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const me=Object.assign({},st.data,{user:user===undefined?st.data.user:user});
  return render(me,()=>setUser(null));
}
function MgrInner({me,needReg}){
  const[st,reload]=useLoad('s2MgrInfo',{});
  useEffect(()=>{ // 從公告介紹卡過來申請主管:批准後(回到這頁、已是主管)自動跳到發新公告頁
    if(!(st.data&&st.data.ok&&st.data.isMgr))return;
    try{const v=JSON.parse(localStorage.getItem('n2:afterMgr')||'null');
      if(v){localStorage.removeItem('n2:afterMgr');if(Date.now()-v.t<7*86400e3&&v.to){cclear(['n2List']);window.__n2SyncP=null;window.__n2Done=null;go(v.to);}}}catch(_e){}
  },[st.data]);
  const LP='s2-mgr-pending';
  const lpGet=()=>{try{const v=JSON.parse(localStorage.getItem(LP)||'null');if(v&&Date.now()-v.t<3*86400e3)return v;}catch(_e){}return null;};
  const[step,setStep]=useState((me.pending||lpGet())?'sent':'ask');const[busy,setBusy]=useState(false);const[err,setErr]=useState('');const[reg,setReg]=useState(false);
  if(st.loading&&!st.data)return(<Loading/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const d=st.data;
  const act=async(fn)=>{setBusy(true);setErr('');const r=await fn();setBusy(false);if(r.ok)reload();else setErr(r.error||'失敗');return r;};
  if(d.isMgr){try{localStorage.removeItem(LP);}catch(_e){}}
  if(!d.isMgr){
    if(reg||(!me.user&&step==='level'))return(<RegisterForm user={me.user} onDone={()=>{cclear('*');window.__s2nonce++;window.dispatchEvent(new Event('s2nav'));}}/>);
    return(<Box>
      <Card className="space-y-3"><h1 className="text-lg font-bold text-white">🛡️ 主管功能</h1>
        {step==='ask'&&(<div><p className="text-gray-300">你目前尚未設定為主管，是否要送出設定申請？</p>
          <div className="grid grid-cols-2 gap-3 mt-3"><Btn onClick={()=>{if(!me.user)setReg(true);else setStep('level');}}>是</Btn><Btn color="bg-gray-700 text-white" onClick={()=>go('s2=mine')}>否</Btn></div></div>)}
        {step==='level'&&(<div><p className="text-gray-300 mb-3">請選擇你的主管職級：</p>
          <div className="space-y-2">{(me.levels||[]).map(l=>(<Btn key={l} disabled={busy} color="bg-gray-800 text-white border border-gray-600" onClick={async()=>{const r=await act(()=>api('s2MgrApply',{level:l}));if(r.ok){try{localStorage.setItem(LP,JSON.stringify({t:Date.now(),level:l}));}catch(_e){}setStep('sent');}}}>{l}</Btn>))}</div></div>)}
        {step==='sent'&&(<div className="space-y-2"><p className="text-emerald-400">已送出申請{(me.pending||lpGet())?'（'+(me.pending||lpGet()).level+'）':''}，核准後會通知你。</p><button className="text-xs text-gray-400 underline" onClick={()=>{try{localStorage.removeItem(LP);}catch(_e){}setStep('level');}}>重新申請其他職級</button></div>)}
        {err&&<p className="text-sm text-red-400">{err}</p>}
      </Card></Box>);
  }
  const setLevel=(m,lv)=>act(()=>api('s2MgrSet',{targetId:m.lineUserId,level:lv}));
  return(<Box {...barOf(st,()=>{cclear(['s2Me']);reload();},'zh')}>
    <Card><h1 className="text-lg font-bold text-white">🛡️ 主管功能</h1><p className="text-sm text-gray-400 mt-1">你的職級：{d.level}　{d.all?'（可看所有店）':'（僅限本店）'}</p></Card>
    <Card className="space-y-3"><p className="font-bold text-white">📤 分享（僅主管）</p>
      <Btn onClick={()=>go('s2=mnew')}>＋ 建立新回報並分享</Btn>
      <Btn color="bg-gray-800 text-white border border-gray-600" onClick={()=>go('s2=mine&pick=1')}>目前的安全回報調查（查看名單／分享）</Btn>
      <Btn color="bg-gray-800 text-white border border-gray-600" onClick={()=>go('n2=l')}>📢 公司公告（發布／已讀情況）</Btn>
      <ShareFlexBtn label="📖 分享「回報教學」給好友" altText="如何做安全回報(教學)" build={buildTutorialFlex}/>
      <ShareFlexBtn label="🚫 分享「老師不要在大群回文」字卡" altText="老師不要在大群回文" build={buildNoReplyFlex}/>
      <ShareFlexBtn label="🛡️ 分享「主管功能」邀請" altText="主管功能" build={buildMgrInviteFlex}/>
      <p className="text-xs text-gray-500">Flex 傳到群組後無法收回，請確認標題與對象再分享。</p></Card>
    <StaffCard/>
    {d.canSetOpen&&(<Card className="space-y-3"><p className="font-bold text-white">👁 公開給成員（僅限本店）</p>
      {[['detail','詳細頁（回報時間、說明）',d.detailOpen],['missing','未回報名單',d.missingOpen]].map(x=>(<div key={x[0]} className="flex items-center justify-between"><span className="text-gray-200">{x[1]}</span>
        <button disabled={busy} className={'px-4 py-1 rounded-full text-sm '+(x[2]?'bg-emerald-600 text-white':'bg-gray-700 text-gray-300')} onClick={()=>act(()=>api('s2OpenSet',{which:x[0],on:!x[2]}))}>{x[2]?'公開':'僅主管'}</button></div>))}
      <p className="text-xs text-gray-500">「僅主管」＝只有發起人、本店主管、區經理以上與管理者能看。</p></Card>)}
    <Card className="space-y-3">
      {d.level!=='櫃台組長'&&(<div className="flex items-center justify-between"><span className="text-gray-200">🔔 接收主管申請通知</span>
        <button disabled={busy} className={'px-4 py-1 rounded-full text-sm '+(d.notify?'bg-emerald-600 text-white':'bg-gray-700 text-gray-300')} onClick={()=>act(()=>api('s2MgrNotify',{on:!d.notify}))}>{d.notify?'開':'關'}</button></div>)}
      {d.admin&&(<div className="flex items-center justify-between"><span className="text-gray-200">👁 已刪除項目對我也隱藏</span>
        <button disabled={busy} className={'px-4 py-1 rounded-full text-sm '+(d.hideAdmin?'bg-emerald-600 text-white':'bg-gray-700 text-gray-300')} onClick={()=>act(()=>api('s2AdminHide',{on:!d.hideAdmin}))}>{d.hideAdmin?'開':'關'}</button></div>)}
    </Card>
    {d.pending.length>0&&(<Card className="space-y-3"><p className="font-bold text-white">待審核申請</p>
      {d.pending.map(p=>(<div key={p.reqId} className="border-t border-gray-800 pt-2"><p className="text-gray-200">{p.store} {p.label}　申請：{p.level}</p>
        <div className="grid grid-cols-2 gap-2 mt-2"><Btn disabled={busy} color="bg-emerald-600 text-white" onClick={()=>act(()=>api('s2MgrApprove',{rid:p.reqId,approve:true}))}>核准</Btn><Btn disabled={busy} color="bg-gray-700 text-white" onClick={()=>act(()=>api('s2MgrApprove',{rid:p.reqId,approve:false}))}>拒絕</Btn></div></div>))}</Card>)}
    <Card className="space-y-3"><p className="font-bold text-white">主管名單（調整職級）</p>
      <p className="text-xs text-gray-500">只能調整「職級比自己低」的人；同級或更高職級僅供查看。</p>
      {d.mgrs.length===0&&<p className="text-gray-500 text-sm">目前沒有主管</p>}
      {d.mgrs.map(m=>(<div key={m.lineUserId} className="border-t border-gray-800 pt-2"><p className="text-gray-200">{m.store} {m.label}　<span className="text-violet-300">{m.level}</span></p>
        {m.canEdit&&(<div className="flex flex-wrap gap-2 mt-2">{d.levels.filter(l=>(d.settable||[]).indexOf(l)>=0).map(l=>(<Chip key={l} on={m.level===l} onClick={()=>m.level!==l&&setLevel(m,l)}>{l}</Chip>))}<button className="px-3 py-2 rounded-full border border-red-500 text-red-400 text-sm" onClick={()=>window.confirm('取消「'+m.label+'」的主管職？')&&setLevel(m,'')}>取消主管</button></div>)}</div>))}
    </Card>
    {err&&<p className="text-sm text-red-400 text-center">{err}</p>}
    <Btn color="bg-gray-800 text-gray-200" onClick={()=>go('s2=mine')}>我發起的清單</Btn>
  </Box>);
}

// 從通知 Flex 進來的審核頁
function ApvPage({rid}){
  const[st,reload]=useLoad('s2MgrInfo',{});
  const[busy,setBusy]=useState(false);const[msg,setMsg]=useState('');
  if(st.loading&&!st.data)return(<Loading/>);
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
  const[,setN]=useState(0);
  useEffect(()=>{const h=()=>setN(n=>n+1);window.addEventListener('s2nav',h);window.addEventListener('popstate',h);return()=>{window.removeEventListener('s2nav',h);window.removeEventListener('popstate',h);};},[]);
  return(<React.Fragment key={location.search+'|'+window.__s2nonce}><Safety2Routes/></React.Fragment>);
}
function Safety2Routes(){
  const q=new URLSearchParams(location.search);
  if(q.has('n2')&&window.Notice2Routes){const N2=window.Notice2Routes;return <N2/>;} // 公司公告 2.0(notice2.js):人員/權限/暫存都共用這支,頁面獨立
  const p=q.get('s2')||'';const sid=q.get('sid')||'';
  if(p==='r')return sid?<ReportPage sid={sid}/>:<Msg text="缺少回報代碼"/>;
  if(p==='l')return sid?<ListPage sid={sid}/>:<Msg text="缺少回報代碼"/>;
  if(p==='new')return <NewPage/>;
  if(p==='mnew')return <NewPage share={true}/>;
  if(p==='mine')return <MinePage/>;
  if(p==='share')return sid?<SharePage sid={sid} fresh={q.get('fresh')==='1'}/>:<Msg text="缺少回報代碼"/>;
  if(p==='mgr')return <MgrPage/>;
  if(p==='today')return <TodayPage/>;
  if(p==='my')return <MyReportsPage/>;
  if(p==='staff')return <StaffPage/>;
  if(p==='apv')return <ApvPage rid={q.get('rid')||''}/>;
  return <Msg text="不支援的頁面"/>;
}
// 匯出給 notice2.js(公司公告)共用:API、暫存、版面元件、人員註冊流程
window.S2Core={Chip,api,useLoad,Box,Card,Btn,Loading,Msg,Spinner,NeedUser,go,copyText,barOf,cclear,cput,ckey,peek,CACHEABLE,WRITE_CLEAR,STORES};
window.Safety2App=Safety2App;
})();
