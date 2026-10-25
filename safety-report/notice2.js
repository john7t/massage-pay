/* notice2.js — 公司公告 2.0 前端(v1.0-001)
   由 safety-report.html 載入(在 safety2.js 之後),依網址參數 n2 顯示:
     ?n2=l            公告列表(預設)        ?n2=v&nid=…   公告內容(同時記為已讀)
     ?n2=new          發布公告(主管)        ?n2=edit&nid=… 編輯公告(可管理者)
     ?n2=r&nid=…      已讀情況               ?n2=set       設定(管理者)
   人員、權限、暫存、註冊表單全部沿用安全回報 2.0(window.S2Core,由 safety2.js 匯出),與主程式、舊公告完全無關。
   後端:gas-notice2.gs.txt(n2List / n2Get / n2Save / n2Hide / n2Pin / n2Readers / n2Settings / n2SettingsSet / n2Analyze / n2AudienceCount)。 */
(function(){
const{useState,useEffect,useMemo}=React;
const C=window.S2Core;
if(!C){window.Notice2Routes=()=>React.createElement('div',{className:'p-6 text-center text-red-400'},'載入失敗:缺少 safety2.js');return;}
const{api,useLoad,Box,Card,Btn,Loading,Msg,Spinner,NeedUser,go,copyText,barOf,cclear,CACHEABLE,WRITE_CLEAR}=C;

// 暫存設定:清單可暫存(開頁快,有「重新整理」);內容/已讀情況/設定每次都讀最新(內容頁開啟時才會記已讀)
['n2List'].forEach(a=>{if(CACHEABLE.indexOf(a)<0)CACHEABLE.push(a);});
WRITE_CLEAR.n2Save=['n2List'];WRITE_CLEAR.n2Hide=['n2List'];WRITE_CLEAR.n2Pin=['n2List'];WRITE_CLEAR.n2SettingsSet=['n2List'];

const L={
  zh:{title:'公司公告',search:'搜尋標題、內容、標籤',go:'搜尋',all:'全部',unreadOnly:'只看未讀',none:'目前沒有公告',pinned:'置頂',back:'返回列表',unread:'未讀',read:'已讀',
      loading:'載入中…',fail:'失敗',tags:'標籤',date:'發布',end:'到期',lang:'中文 / Tiếng Việt',noVi:'尚無越南文版本',readers:'已讀情況'},
  vi:{title:'Thông báo công ty',search:'Tìm tiêu đề, nội dung, thẻ',go:'Tìm',all:'Tất cả',unreadOnly:'Chỉ chưa đọc',none:'Hiện chưa có thông báo',pinned:'Ghim',back:'Quay lại danh sách',unread:'Chưa đọc',read:'Đã đọc',
      loading:'Đang tải…',fail:'Thất bại',tags:'Thẻ',date:'Đăng',end:'Hết hạn',lang:'中文 / Tiếng Việt',noVi:'Chưa có bản tiếng Việt',readers:'Tình trạng đã đọc'}
};
const ROLE_LABEL={teacher:'老師',counter:'櫃台'};
const pick=(n,k,lang)=>(lang==='vi'&&n[k+'Vi'])?n[k+'Vi']:n[k];
const tagsOf=(n,lang)=>(lang==='vi'&&n.tagsVi&&n.tagsVi.length===n.tags.length)?n.tagsVi:n.tags;

// ───────── 路由 ─────────
function Notice2Routes(){
  const q=new URLSearchParams(location.search);
  const p=q.get('n2')||'l';const nid=q.get('nid')||'';
  return(<NeedUser render={(me)=>{
    if(p==='v')return nid?<ViewPage me={me} nid={nid}/>:<Msg text="缺少公告代碼"/>;
    if(p==='new')return <EditPage me={me} nid=""/>;
    if(p==='edit')return nid?<EditPage me={me} nid={nid}/>:<Msg text="缺少公告代碼"/>;
    if(p==='r')return nid?<ReadersPage me={me} nid={nid}/>:<Msg text="缺少公告代碼"/>;
    if(p==='set')return <SettingsPage/>;
    return <ListPage me={me}/>;
  }}/>);
}

// ───────── 清單 ─────────
function ListPage({me}){
  const lang=me.user&&me.user.lang==='vi'?'vi':'zh';const t=L[lang];
  const qp=new URLSearchParams(location.search);
  const q0=qp.get('q')||'';const tag0=qp.get('tag')||'';
  const[qIn,setQIn]=useState(q0);const[tag,setTag]=useState(tag0);const[onlyUnread,setOnlyUnread]=useState(false);
  const[st,reload]=useLoad('n2List',q0?{q:q0}:{});
  if(st.loading&&!st.data)return(<Loading text={t.loading}/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||t.fail}/>);
  const d=st.data;
  const search=()=>go('n2=l'+(qIn.trim()?'&q='+encodeURIComponent(qIn.trim()):''));
  let list=d.notices;
  if(tag)list=list.filter(n=>n.tags.indexOf(tag)>=0);
  if(onlyUnread)list=list.filter(n=>n.status==='published'&&!n.read&&!n.expired);
  const flag=(n)=>{const f=[];
    if(n.status==='draft')f.push(['草稿','text-amber-400']);if(n.status==='hidden')f.push(['已隱藏','text-red-400']);if(n.expired&&n.status==='published')f.push(['已過期','text-gray-500']);return f;};
  return(<Box {...barOf(st,reload,lang)}>
    <div className="flex items-center justify-between"><h1 className="text-lg font-bold text-white">📢 {t.title}{d.unread>0&&<span className="ml-2 text-xs bg-red-600 text-white rounded-full px-2 py-0.5">{d.unread}</span>}</h1>
      {d.isAdmin&&<button className="text-xs text-gray-400 border border-gray-700 rounded-full px-3 py-1" onClick={()=>go('n2=set')}>⚙ 設定</button>}</div>
    {d.canPost&&<Btn onClick={()=>go('n2=new')}>＋ 發布公告</Btn>}
    <div className="flex gap-2"><input value={qIn} onChange={e=>setQIn(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')search();}} placeholder={t.search} className="flex-1 min-w-0 rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm"/>
      <button className="rounded-xl bg-gray-700 text-white text-sm px-4" onClick={search}>{t.go}</button></div>
    {d.tags.length>0&&(<div className="flex flex-wrap gap-2">
      <button className={'px-3 py-1 rounded-full border text-xs '+(!tag?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-300')} onClick={()=>setTag('')}>{t.all}</button>
      {d.tags.map(x=>(<button key={x.tag} className={'px-3 py-1 rounded-full border text-xs '+(tag===x.tag?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-300')} onClick={()=>setTag(tag===x.tag?'':x.tag)}>#{lang==='vi'&&x.tagVi?x.tagVi:x.tag}</button>))}</div>)}
    <label className="flex items-center gap-2 text-sm text-gray-400"><input type="checkbox" checked={onlyUnread} onChange={e=>setOnlyUnread(e.target.checked)}/>{t.unreadOnly}</label>
    {q0&&<p className="text-xs text-gray-400">🔎 「{q0}」　<button className="underline" onClick={()=>go('n2=l')}>清除</button></p>}
    {list.length===0&&<Card><p className="text-center text-gray-500">{t.none}</p></Card>}
    <div className="space-y-3">{list.map(n=>(<button key={n.id} className="w-full text-left" onClick={()=>go('n2=v&nid='+n.id)}>
      <Card className={n.status!=='published'||n.expired?'opacity-70':''}>
        <p className="font-bold text-white">{n.pinned&&<span className="mr-1">📌</span>}{!n.read&&n.status==='published'&&!n.expired&&<span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 align-middle"/>}{pick(n,'title',lang)}
          {flag(n).map((f,i)=><span key={i} className={'ml-2 text-xs '+f[1]}>{f[0]}</span>)}</p>
        <p className="text-xs text-gray-400 mt-1">{n.dateLabel}{n.cat?'　'+n.cat:''}{n.creatorLabel?'　'+(n.creatorStore||'')+' '+n.creatorLabel:''}{n.stores&&n.stores.length>0&&d.canPost?'　→ '+n.stores.map(s=>s.replace('店','')).join('、'):''}{n.roles&&n.roles.length>0&&d.canPost?'（'+n.roles.map(r=>ROLE_LABEL[r]).join('、')+'）':''}</p>
        <p className="text-sm text-gray-300 mt-2 line-clamp-2">{(lang==='vi'&&n.summaryVi)?n.summaryVi:n.summary}</p>
        {n.tags.length>0&&<p className="text-xs text-violet-300 mt-2">{tagsOf(n,lang).map(x=>'#'+x).join(' ')}</p>}
      </Card></button>))}</div>
  </Box>);
}

// ───────── 分享 Flex(主管在公告頁分享到群組) ─────────
function buildNoticeFlex(n){
  const base='https://liff.line.me/'+window.__S2_LIFF_ID;
  const dateTxt=n.dateLabel?(' '+n.dateLabel):'';
  const body=[{type:'text',text:'📢 公司公告 / Thông báo',weight:'bold',size:'sm',color:'#6d4aa8'},
    {type:'text',text:n.title+dateTxt,weight:'bold',size:'lg',wrap:true,color:'#111111'}];
  if(n.summary)body.push({type:'text',text:n.summary+(n.summary.length>=60?'…':''),size:'sm',color:'#555555',wrap:true});
  if(n.tags&&n.tags.length)body.push({type:'text',text:n.tags.map(x=>'#'+x).join(' '),size:'xs',color:'#6d4aa8',wrap:true});
  return{type:'bubble',body:{type:'box',layout:'vertical',spacing:'md',paddingAll:'lg',contents:body},
    footer:{type:'box',layout:'vertical',paddingAll:'lg',contents:[{type:'button',style:'primary',color:'#6d4aa8',height:'sm',action:{type:'uri',label:'查看公告 / Xem',uri:base+'?n2=v&nid='+n.id}}]}};
}

// ───────── 內容 ─────────
function ViewPage({me,nid}){
  const defLang=me.user&&me.user.lang==='vi'?'vi':'zh';
  const[lang,setLang]=useState(defLang);const t=L[lang];
  const[st,reload]=useLoad('n2Get',{id:nid});
  const[busy,setBusy]=useState(false);const[res,setRes]=useState('');
  useEffect(()=>{if(st.data&&st.data.ok)cclear(['n2List']);},[st.data]); // 看過了:清單的已讀標記要更新
  if(st.loading&&!st.data)return(<Loading text={t.loading}/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||t.fail}/>);
  const d=st.data;const n=d.notice;
  const hasVi=!!(n.titleVi||n.bodyVi);
  const act=async(action,p)=>{setBusy(true);const r=await api(action,Object.assign({id:nid},p));setBusy(false);if(r.ok)reload();else alert(r.error||'失敗');};
  const share=async()=>{
    try{if(!liff.isApiAvailable('shareTargetPicker')){setRes('此環境不支援分享,請在 LINE 內開啟');return;}
      const r=await liff.shareTargetPicker([{type:'flex',altText:'📢 公司公告:'+n.title,contents:buildNoticeFlex(n)}]);setRes(r?'已分享 ✅':'已取消');}catch(e){setRes('錯誤:'+String(e&&e.message||e));}
  };
  return(<Box {...barOf(st,reload,lang)}>
    <button className="text-sm text-violet-300" onClick={()=>go('n2=l')}>← {t.back}</button>
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2"><h1 className="text-xl font-bold text-white">{n.pinned&&'📌 '}{pick(n,'title',lang)}</h1>
        {hasVi&&<button className="shrink-0 text-xs text-gray-300 border border-gray-700 rounded-full px-3 py-1" onClick={()=>setLang(lang==='zh'?'vi':'zh')}>{lang==='zh'?'Tiếng Việt':'中文'}</button>}</div>
      <p className="text-xs text-gray-400">{t.date} {n.createdAt.slice(0,16)}{n.endDate?'　'+t.end+' '+n.endDate:''}{n.cat?'　'+n.cat:''}{n.creatorLabel?'　'+(n.creatorStore||'')+' '+n.creatorLabel:''}</p>
      {lang==='vi'&&!n.bodyVi&&<p className="text-xs text-amber-400">{t.noVi}</p>}
      <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">{(lang==='vi'&&n.bodyVi)?n.bodyVi:n.body}</p>
      {n.tags.length>0&&<div className="flex flex-wrap gap-2">{tagsOf(n,lang).map((x,i)=>(<button key={i} className="text-xs text-violet-300 border border-violet-500/40 rounded-full px-3 py-1" onClick={()=>go('n2=l&q='+encodeURIComponent(n.tags[i]))}>#{x}</button>))}</div>}
      {d.readAt&&<p className="text-xs text-gray-500">✓ {t.read} {d.readAt.slice(5,16)}</p>}
    </Card>
    {n.status==='draft'&&<p className="text-center text-amber-400 text-sm">這是草稿,只有你看得到</p>}
    {n.status==='hidden'&&<p className="text-center text-red-400 text-sm">這則公告已隱藏</p>}
    {d.canReaders&&<Btn color="bg-gray-800 text-gray-200 border border-gray-600" onClick={()=>go('n2=r&nid='+nid)}>📊 {t.readers}</Btn>}
    {n.canManage&&d.canPost&&(<Card className="space-y-2">
      <p className="text-xs text-gray-500">管理</p>
      <div className="grid grid-cols-2 gap-2">
        <Btn color="bg-gray-700 text-white" onClick={()=>go('n2=edit&nid='+nid)}>✏️ 編輯</Btn>
        <Btn color="bg-gray-700 text-white" loading={busy} onClick={()=>act('n2Pin',{pinned:!n.pinned})}>{n.pinned?'取消置頂':'📌 置頂'}</Btn>
        <Btn color={n.status==='hidden'?'bg-emerald-700 text-white':'bg-red-700 text-white'} loading={busy} onClick={()=>{if(n.status==='hidden'||window.confirm('確定要隱藏這則公告嗎?(資料會保留,可以還原)'))act('n2Hide',{hidden:n.status!=='hidden'});}}>{n.status==='hidden'?'還原':'🙈 隱藏'}</Btn>
        {n.status==='published'&&<Btn color="bg-blue-600 text-white" onClick={share}>📤 分享到群組</Btn>}
      </div>
      {res&&<p className="text-center text-sm text-gray-400">{res}</p>}
    </Card>)}
  </Box>);
}

// ───────── 發布 / 編輯 ─────────
function EditPage({me,nid}){
  const[st]=useLoad('n2List',{});
  const[g,setG]=useState(nid?undefined:null); // 編輯時載入原內容
  const[title,setTitle]=useState('');const[body,setBody]=useState('');
  const[titleVi,setTitleVi]=useState('');const[bodyVi,setBodyVi]=useState('');
  const[tagsTxt,setTagsTxt]=useState('');const[tagsViTxt,setTagsViTxt]=useState('');const[cat,setCat]=useState('');
  const[stores,setStores]=useState([]);const[roles,setRoles]=useState([]);const[pinned,setPinned]=useState(false);const[endDate,setEndDate]=useState('');
  const[push,setPush]=useState(false);const[cnt,setCnt]=useState(null);
  const[busy,setBusy]=useState('');const[err,setErr]=useState('');const[aiMsg,setAiMsg]=useState('');
  useEffect(()=>{
    if(!nid)return;let dead=false;
    api('n2Get',{id:nid,noMark:true}).then(r=>{
      if(dead)return;
      if(!r.ok){setG(false);setErr(r.error||'失敗');return;}
      const n=r.notice;setG(n);setTitle(n.title);setBody(n.body);setTitleVi(n.titleVi);setBodyVi(n.bodyVi);
      setTagsTxt(n.tags.join(' '));setTagsViTxt(n.tagsVi.join(' '));setCat(n.cat);setStores(n.stores);setRoles(n.roles);setPinned(n.pinned);setEndDate(n.endDate);
    });return()=>{dead=true;};
  },[nid]);
  const d=st.data&&st.data.ok?st.data:null;
  const cfg=d?d.cfg:{};
  const stKey=stores.join(',');const roKey=roles.join(',');
  useEffect(()=>{
    if(!push||nid){setCnt(null);return;}let dead=false;
    api('n2AudienceCount',{stores:d&&!d.all?[d.myStore]:stores,roles:roles}).then(r=>{if(!dead)setCnt(r.ok?r.count:null);});
    return()=>{dead=true;};
  },[push,stKey,roKey]);
  if(st.loading&&!st.data)return(<Loading/>);
  if(!d)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  if(!d.canPost)return(<Msg text="只有主管可以發布公告"/>);
  if(nid&&g===undefined)return(<Loading/>);
  if(nid&&g===false)return(<Msg text={err||'找不到這則公告'}/>);
  const toggle=(arr,set,v)=>set(arr.indexOf(v)>=0?arr.filter(x=>x!==v):arr.concat([v]));
  const analyze=async()=>{
    if(!body.trim()){setErr('請先輸入公告內容');return;}
    setErr('');setAiMsg('');setBusy('ai');
    const r=await api('n2Analyze',{title:title,body:body});setBusy('');
    if(!r.ok){setErr(r.error||'分析失敗');return;}
    const x=r.result;
    if(x.tags.length){setTagsTxt(x.tags.join(' '));setTagsViTxt((x.tagsVi||[]).join(' '));}
    if(x.cat)setCat(x.cat);if(x.titleVi)setTitleVi(x.titleVi);if(x.bodyVi)setBodyVi(x.bodyVi);if(!title.trim()&&x.title)setTitle(x.title);
    setAiMsg('已產生標籤、分類與越南文,請檢查後再發布');
  };
  const save=async(status)=>{
    setErr('');
    if(!title.trim()||!body.trim()){setErr('標題與內容必填');return;}
    if(status==='published'&&!nid&&push&&cfg.push){if(!window.confirm('發布後會推播給 '+(cnt==null?'對象':cnt+' 位')+'同事,確定發布嗎?'))return;}
    setBusy(status);
    const r=await api('n2Save',{id:nid||undefined,title:title.trim(),body:body.trim(),titleVi:titleVi,bodyVi:bodyVi,tags:tagsTxt,tagsVi:tagsViTxt,cat:cat,
      stores:d.all?stores:[d.myStore],roles:roles,pinned:pinned,endDate:endDate,status:status,push:push&&!nid});
    setBusy('');
    if(!r.ok){setErr(r.error||'失敗');return;}
    go('n2=v&nid='+r.id);
  };
  const storeBox=d.all
    ?(<div><p className="text-sm text-gray-300 mb-2">對象店別 <span className="text-xs text-gray-500">(都不選＝全部店)</span></p><div className="flex flex-wrap gap-2">{d.stores.map(s=>(<button key={s} className={'px-3 py-1.5 rounded-full border text-sm '+(stores.indexOf(s)>=0?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-300')} onClick={()=>toggle(stores,setStores,s)}>{s}</button>))}</div></div>)
    :(<p className="text-sm text-gray-300">對象店別：<span className="text-white">{d.myStore}</span>（只能發給自己的店）</p>);
  return(<Box>
    <button className="text-sm text-violet-300" onClick={()=>nid?go('n2=v&nid='+nid):go('n2=l')}>← 返回</button>
    <h1 className="text-lg font-bold text-white">{nid?'✏️ 編輯公告':'＋ 發布公告'}</h1>
    <Card className="space-y-3">
      <input value={title} onChange={e=>setTitle(e.target.value)} maxLength={60} placeholder="標題(最多60字)" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/>
      <textarea value={body} onChange={e=>setBody(e.target.value)} rows={8} maxLength={3000} placeholder="公告內容(中文)" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/>
      <Btn color="bg-indigo-600 text-white" loading={busy==='ai'} onClick={analyze}>✨ AI 產生標籤、分類與越南文</Btn>
      {aiMsg&&<p className="text-xs text-emerald-400 text-center">{aiMsg}</p>}
    </Card>
    <Card className="space-y-3">
      <p className="text-sm text-gray-300">標籤 <span className="text-xs text-gray-500">(用空白或逗號分開,最多 8 個,搜尋用)</span></p>
      <input value={tagsTxt} onChange={e=>setTagsTxt(e.target.value)} placeholder="#颱風 #停業" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/>
      <p className="text-sm text-gray-300">分類</p>
      <div className="flex flex-wrap gap-2">{d.cats.map(c=>(<button key={c} className={'px-3 py-1.5 rounded-full border text-sm '+(cat===c?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-300')} onClick={()=>setCat(cat===c?'':c)}>{c}</button>))}</div>
    </Card>
    <Card className="space-y-3">
      <p className="text-sm text-gray-300">越南文版本 <span className="text-xs text-gray-500">(可手動修改;空白＝越南文使用者看中文)</span></p>
      <input value={titleVi} onChange={e=>setTitleVi(e.target.value)} placeholder="Tiêu đề" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/>
      <textarea value={bodyVi} onChange={e=>setBodyVi(e.target.value)} rows={6} placeholder="Nội dung" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/>
      <input value={tagsViTxt} onChange={e=>setTagsViTxt(e.target.value)} placeholder="Thẻ (cùng thứ tự với thẻ tiếng Trung)" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/>
    </Card>
    <Card className="space-y-3">
      {storeBox}
      <div><p className="text-sm text-gray-300 mb-2">對象角色 <span className="text-xs text-gray-500">(都不選＝老師與櫃台)</span></p>
        <div className="flex gap-2">{['teacher','counter'].map(r=>(<button key={r} className={'px-3 py-1.5 rounded-full border text-sm '+(roles.indexOf(r)>=0?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-300')} onClick={()=>toggle(roles,setRoles,r)}>{ROLE_LABEL[r]}</button>))}</div></div>
      <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={pinned} onChange={e=>setPinned(e.target.checked)}/>置頂</label>
      <div><p className="text-sm text-gray-300 mb-1">到期日 <span className="text-xs text-gray-500">(選填,到期後成員看不到)</span></p><input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"/></div>
      {!nid&&cfg.push&&(<label className="flex items-center gap-2 text-sm text-amber-300"><input type="checkbox" checked={push} onChange={e=>setPush(e.target.checked)}/>發布時推播給對象{push&&cnt!=null?'（共 '+cnt+' 人,會消耗 LINE 訊息額度）':''}</label>)}
    </Card>
    {err&&<p className="text-sm text-red-400 text-center">{err}</p>}
    <Btn loading={busy==='published'} disabled={!!busy} onClick={()=>save('published')}>{nid?'儲存':'發布'}</Btn>
    {(!nid||(g&&g.status==='draft'))&&<Btn color="bg-gray-700 text-white" loading={busy==='draft'} disabled={!!busy} onClick={()=>save('draft')}>存成草稿</Btn>}
  </Box>);
}

// ───────── 已讀情況 ─────────
function ReadersPage({me,nid}){
  const[st,reload]=useLoad('n2Readers',{id:nid});
  const[open,setOpen]=useState({});const[msg,setMsg]=useState('');
  if(st.loading&&!st.data)return(<Loading/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  const d=st.data;const n=d.notice;
  const copyUnread=async(g)=>{
    const txt='['+n.title+']尚未閱讀人員:'+g.unread.join(' ')+' ('+d.at+')';
    const ok=await copyText(txt);setMsg(ok?'已複製 '+g.store+' 未讀名單':'複製失敗');setTimeout(()=>setMsg(''),2500);
  };
  return(<Box {...barOf(st,reload,'zh')}>
    <button className="text-sm text-violet-300" onClick={()=>go('n2=v&nid='+nid)}>← 返回公告</button>
    <Card><p className="text-xs text-violet-300 font-bold">📊 已讀情況</p><h1 className="text-lg font-bold text-white mt-1">{n.title}</h1>
      <p className="text-xs text-gray-400 mt-1">{d.restricted?'僅顯示'+d.myStore:'全部店'}　資料時間 {d.at}</p></Card>
    {d.stores.length===0&&<Card><p className="text-center text-gray-500">這則公告目前沒有對象人員</p></Card>}
    {d.stores.map(g=>(<Card key={g.store} className="space-y-2">
      <button className="w-full flex items-center justify-between" onClick={()=>setOpen(o=>Object.assign({},o,{[g.store]:!o[g.store]}))}>
        <span className="font-bold text-white">{g.store}</span><span className="text-sm text-gray-300">已讀 {g.read.length}/{g.total}　{open[g.store]?'▲':'▼'}</span></button>
      <div className="h-2 rounded-full bg-gray-800 overflow-hidden"><div className="h-2 bg-emerald-500" style={{width:(g.total?Math.round(g.read.length*100/g.total):0)+'%'}}/></div>
      {open[g.store]&&(<div className="space-y-3 pt-2">
        <div><p className="text-xs text-amber-400 mb-1">未讀（{g.unread.length}）</p><p className="text-sm text-gray-200">{g.unread.length?g.unread.join('　'):'全部已讀 🎉'}</p>
          {g.unread.length>0&&<button className="mt-2 text-xs text-gray-300 border border-gray-700 rounded-full px-3 py-1" onClick={()=>copyUnread(g)}>📋 複製未讀名單</button>}</div>
        <div><p className="text-xs text-emerald-400 mb-1">已讀（{g.read.length}）</p>
          {g.read.map((x,i)=>(<p key={i} className="text-sm text-gray-300">{x.label}　<span className="text-xs text-gray-500">{x.time.slice(5,16)}</span></p>))}</div>
      </div>)}
    </Card>))}
    {msg&&<p className="text-center text-sm text-emerald-400">{msg}</p>}
  </Box>);
}

// ───────── 設定(管理者) ─────────
function SettingsPage(){
  const[st,reload]=useLoad('n2Settings',{});
  const[busy,setBusy]=useState('');const[err,setErr]=useState('');
  if(st.loading&&!st.data)return(<Loading/>);
  if(!st.data||!st.data.ok)return(<Msg text={(st.data&&st.data.error)||'失敗'}/>);
  if(!st.data.canSet)return(<Msg text="只有管理者可以修改設定"/>);
  const cfg=st.data.cfg;
  const set=async(key,val)=>{setBusy(key);setErr('');const r=await api('n2SettingsSet',{key:key,value:val});setBusy('');if(r.ok)reload();else setErr(r.error||'失敗');};
  const row=(key,label,hint)=>(<div className="flex items-start justify-between gap-3 py-2 border-t border-gray-800 first:border-0"><div><p className="text-white text-sm">{label}</p><p className="text-xs text-gray-500 mt-1">{hint}</p></div>
    <button disabled={!!busy} onClick={()=>set(key,!cfg[key])} className={'shrink-0 w-12 h-7 rounded-full flex items-center px-0.5 '+(cfg[key]?'bg-emerald-600 justify-end':'bg-gray-700 justify-start')+(busy===key?' opacity-50':'')}><span className="w-6 h-6 rounded-full bg-white"/></button></div>);
  return(<Box {...barOf(st,reload,'zh')}>
    <button className="text-sm text-violet-300" onClick={()=>go('n2=l')}>← 返回列表</button>
    <h1 className="text-lg font-bold text-white">⚙ 公告設定</h1>
    <Card>
      {row('push','發布時可推播給個人','開啟後,發布公告時可勾選「推播給對象」(LINE 一人一則,會消耗官方帳號訊息額度)。預設關閉。')}
      {row('readersOpen','一般成員可看已讀名單','開啟後,成員可看公告的已讀/未讀名單(僅限自己店)。預設關閉,只有主管看得到。')}
    </Card>
    {err&&<p className="text-sm text-red-400 text-center">{err}</p>}
  </Box>);
}

window.Notice2Routes=Notice2Routes;
})();
