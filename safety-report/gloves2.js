/* gloves2.js — 手套團購 2.0 前端(v1.0-001)
   由 safety-report.html 載入(在 safety2.js 之後),網址參數 gb2:
     ?gb2=l   團購首頁(預設)   ?gb2=h  歷史/我的紀錄   ?gb2=set  設定(主管:達標箱數、收單時限、各店推播用量)
   人員/權限共用 window.S2Core(safety2.js)。後端:gas-gloves2.gs.txt(gb2List/gb2Join/gb2ItemSet/gb2ItemDel/gb2Claim/gb2Status/gb2Paid/gb2Vendor/gb2Settings/gb2SettingsSet) */
(function(){
const{useState,useEffect}=React;
const C=window.S2Core;
if(!C){window.Gloves2Routes=()=>React.createElement('div',{className:'p-6 text-center text-red-400'},'載入失敗:缺少 safety2.js');return;}
const{api,useLoad,Box,Card,Btn,Loading,Msg,NeedUser,go,copyText,barOf}=C;

const COLORS=['白色','藍色','均可'];
const SIZES=['XS','S','M','L','XL'];
const L={
  zh:{title:'手套團購',plus:'我要 +1',need:'我有需求',noOrder:'目前沒有收單中的團購',noOrderHint:'有需求就按「我有需求」,會發起本店新團購',
      color:'顏色',size:'尺寸',boxes:'箱數',submit:'送出',save:'儲存',cancel:'取消',edit:'修改',del:'刪除',claim:'我來認領',release:'放棄認領',claimer:'認領人',none:'尚無',
      progress:'達標進度',noClaimerWarn:'已達標,還沒有認領人!',people:'訂購名單',paid:'已交錢',unpaid:'未交錢',copyVendor:'複製廠商訂購單',copied:'已複製',
      admin:'認領人專區',history:'歷史',mine:'我的紀錄',back:'返回',set:'設定',store:'店別',expired:'已超過收單時限',claimHint:'認領人負責收錢、叫貨並更新狀態(老師或主管皆可)',
      changeTo:'變更狀態',mergeCopy:'合併複製(各店截止/收錢中)',failed:'失敗',pushed:'已推播給',ppl:'人',pushBlock:'(LINE 額度不足,未推播)',confirm:'確定要變更成「{0}」嗎?'},
  vi:{title:'Mua chung găng tay',plus:'Tôi +1',need:'Tôi có nhu cầu',noOrder:'Hiện chưa có đơn đang nhận',noOrderHint:'Có nhu cầu hãy bấm "Tôi có nhu cầu" để tạo đơn mới cho chi nhánh',
      color:'Màu',size:'Size',boxes:'Số thùng',submit:'Gửi',save:'Lưu',cancel:'Hủy',edit:'Sửa',del:'Xóa',claim:'Tôi nhận phụ trách',release:'Bỏ nhận',claimer:'Người phụ trách',none:'Chưa có',
      progress:'Tiến độ',noClaimerWarn:'Đủ số lượng, chưa có người phụ trách!',people:'Danh sách đặt',paid:'Đã nộp tiền',unpaid:'Chưa nộp',copyVendor:'Sao chép đơn gửi nhà cung cấp',copied:'Đã sao chép',
      admin:'Dành cho người phụ trách',history:'Lịch sử',mine:'Của tôi',back:'Quay lại',set:'Cài đặt',store:'Chi nhánh',expired:'Đã quá hạn nhận đơn',claimHint:'Người phụ trách thu tiền, đặt hàng và cập nhật trạng thái',
      changeTo:'Đổi trạng thái',mergeCopy:'Gộp & sao chép',failed:'Thất bại',pushed:'Đã gửi thông báo cho',ppl:'người',pushBlock:'(Hết hạn mức LINE, chưa gửi)',confirm:'Đổi thành "{0}"?'}
};
const STATUS_ZH={collecting:'收單中',closed:'提前截止',paying:'收錢中',shipping:'貨運寄送中',arrived:'已到貨',ended:'已結束',cancelled:'未達叫貨數量取消'};
const STATUS_VI={collecting:'Đang nhận đơn',closed:'Chốt sớm',paying:'Đang thu tiền',shipping:'Đang vận chuyển',arrived:'Đã đến',ended:'Kết thúc',cancelled:'Hủy (chưa đủ số lượng)'};
const sLabel=(s,lang)=>(lang==='vi'?STATUS_VI:STATUS_ZH)[s]||s;
const COLOR_VI={'白色':'Trắng','藍色':'Xanh','均可':'Màu nào cũng được'};
const cLabel=(c,lang)=>lang==='vi'?(COLOR_VI[c]||c):c;
const STATUS_TONE={collecting:'text-amber-300',closed:'text-sky-300',paying:'text-orange-300',shipping:'text-violet-300',arrived:'text-emerald-300',ended:'text-gray-400',cancelled:'text-red-400'};
const MAKE_BTN=['closed','paying','shipping','arrived','ended','cancelled'];

const Chip=({on,children,onClick})=>(<button onClick={onClick} className={'px-4 py-2 rounded-full border text-sm '+(on?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-300')}>{children}</button>);

function Gloves2Routes(){
  const q=new URLSearchParams(location.search);const p=q.get('gb2')||'l';
  return(<NeedUser render={(me)=>p==='set'?<SetPage me={me}/>:<MainPage me={me} tab={p==='h'?'h':'l'}/>}/>);
}

// ───────── 下單表單(新增/修改共用)─────────
function ItemForm({t,lang,init,onSubmit,onCancel,busy,submitText}){
  const[color,setColor]=useState(init.color||'均可');const[size,setSize]=useState(init.size||'M');const[boxes,setBoxes]=useState(String(init.boxes||1));
  return(<div className="space-y-3">
    <div><p className="text-xs text-gray-400 mb-1.5">{t.color}</p><div className="flex flex-wrap gap-2">{COLORS.map(c=><Chip key={c} on={color===c} onClick={()=>setColor(c)}>{cLabel(c,lang)}</Chip>)}</div></div>
    <div><p className="text-xs text-gray-400 mb-1.5">{t.size}</p><div className="flex flex-wrap gap-2">{SIZES.map(s=><Chip key={s} on={size===s} onClick={()=>setSize(s)}>{s}</Chip>)}</div></div>
    <div><p className="text-xs text-gray-400 mb-1.5">{t.boxes}</p>
      <div className="flex items-center gap-3"><button className="w-10 h-10 rounded-full border border-gray-600 text-lg text-gray-200" onClick={()=>setBoxes(String(Math.max(1,(parseInt(boxes,10)||1)-1)))}>−</button>
        <input value={boxes} inputMode="numeric" onChange={e=>setBoxes(e.target.value.replace(/\D/g,'').slice(0,2))} className="w-16 text-center bg-gray-800 border border-gray-700 rounded-lg py-2 text-white"/>
        <button className="w-10 h-10 rounded-full border border-gray-600 text-lg text-gray-200" onClick={()=>setBoxes(String(Math.min(50,(parseInt(boxes,10)||0)+1)))}>＋</button></div></div>
    <div className="flex gap-2">{onCancel&&<Btn color="bg-gray-700 text-white" onClick={onCancel}>{t.cancel}</Btn>}<Btn loading={busy} onClick={()=>onSubmit({color,size,boxes:parseInt(boxes,10)||1})}>{submitText}</Btn></div>
  </div>);
}

// ───────── 一張訂單 ─────────
function OrderCard({o,t,lang,last,reload,showForm,setShowForm}){
  const[busy,setBusy]=useState(false);const[msg,setMsg]=useState('');const[editId,setEditId]=useState('');
  const run=async(action,params,okMsg)=>{setBusy(true);setMsg('');const r=await api(action,params);setBusy(false);
    if(!r.ok){setMsg(r.error||t.failed);return null;}
    if(okMsg!==false){const m=[];if(r.pushed)m.push(t.pushed+' '+r.pushed+' '+t.ppl);if(r.pushBlocked)m.push(t.pushBlock);if(m.length)setMsg(m.join(' '));}
    reload();return r;};
  const pct=Math.min(100,Math.round(o.boxes/o.threshold*100));
  const collecting=o.status==='collecting';
  const copyVendor=async()=>{setBusy(true);const r=await api('gb2Vendor',{orderId:o.id});setBusy(false);if(!r.ok){setMsg(r.error||t.failed);return;}const ok=await copyText(r.text);setMsg(ok?t.copied:r.text);};
  const changeStatus=(s)=>{if(!window.confirm(t.confirm.replace('{0}',sLabel(s,lang))))return;run('gb2Status',{orderId:o.id,status:s});};
  return(<Card className="space-y-3">
    <div className="flex items-start justify-between gap-2">
      <div><p className="text-xs text-gray-500">{o.store}　{o.createdAt}</p><p className={'text-lg font-bold '+(STATUS_TONE[o.status]||'text-white')}>{sLabel(o.status,lang)}</p></div>
      <div className="text-right"><p className="text-2xl font-bold text-white">{o.boxes}<span className="text-sm text-gray-400"> / {o.threshold} {t.boxes}</span></p>{o.expired&&<p className="text-xs text-red-400">{t.expired}</p>}</div>
    </div>
    <div className="h-2 rounded-full bg-gray-800 overflow-hidden"><div className={'h-full '+(o.qualified?'bg-emerald-500':'bg-violet-500')} style={{width:pct+'%'}}/></div>
    {o.attention&&<p className="text-sm text-amber-300 font-semibold">⚠ {t.noClaimerWarn}</p>}
    <div className="flex items-center justify-between gap-2 text-sm">
      <p className="text-gray-300">{t.claimer}：<span className="text-white">{o.claimer||t.none}</span></p>
      {!o.claimer&&o.status!=='ended'&&o.status!=='cancelled'&&<button disabled={busy} className="px-3 py-1.5 rounded-lg bg-violet-700 text-white text-sm" onClick={()=>run('gb2Claim',{orderId:o.id})}>{t.claim}</button>}
      {o.claimer&&o.canAdmin&&o.status!=='ended'&&o.status!=='cancelled'&&<button disabled={busy} className="px-3 py-1.5 rounded-lg border border-gray-600 text-gray-300 text-xs" onClick={()=>run('gb2Claim',{orderId:o.id,release:true})}>{t.release}</button>}
    </div>
    {!o.claimer&&<p className="text-[11px] text-gray-500">{t.claimHint}</p>}
    {o.people.length>0&&(<div className="space-y-2"><p className="text-xs text-gray-500">{t.people}（{o.peopleCount}）</p>
      {o.people.map((pp,i)=>(<div key={i} className={'rounded-xl px-3 py-2 '+(pp.mine?'bg-violet-950/40 border border-violet-700/50':'bg-gray-800/60')}>
        <div className="flex items-center justify-between gap-2"><p className="text-sm text-white">{pp.label}{pp.mine&&' ⭐'}</p>
          {o.canAdmin&&o.status!=='cancelled'?(<label className="flex items-center gap-1.5 text-xs text-gray-300"><input type="checkbox" disabled={busy} checked={pp.paid} onChange={e=>run('gb2Paid',{itemId:pp.firstItem,paid:e.target.checked})}/>{t.paid}</label>)
            :(<span className={'text-xs '+(pp.paid?'text-emerald-400':'text-gray-500')}>{pp.paid?'✓ '+t.paid:t.unpaid}</span>)}</div>
        <div className="mt-1 space-y-1">{pp.lines.map(ln=>editId===ln.id?(<ItemForm key={ln.id} t={t} lang={lang} init={ln} busy={busy} submitText={t.save} onCancel={()=>setEditId('')}
            onSubmit={async v=>{const r=await run('gb2ItemSet',Object.assign({itemId:ln.id},v),false);if(r)setEditId('');}}/>)
          :(<div key={ln.id} className="flex items-center justify-between text-sm text-gray-300"><span>{cLabel(ln.color,lang)}　{ln.size} × {ln.boxes}</span>
            {ln.mine&&collecting&&<span className="space-x-3 text-xs"><button className="text-violet-300" onClick={()=>setEditId(ln.id)}>{t.edit}</button><button className="text-red-400" onClick={()=>{if(window.confirm(t.del+'?'))run('gb2ItemDel',{itemId:ln.id},false);}}>{t.del}</button></span>}</div>))}</div>
      </div>))}</div>)}
    {collecting&&!o.expired&&(showForm?(<div className="rounded-xl border border-gray-700 p-3"><ItemForm t={t} lang={lang} init={last||{}} busy={busy} submitText={t.submit} onCancel={()=>setShowForm(false)}
        onSubmit={async v=>{const r=await run('gb2Join',Object.assign({orderId:o.id},v),false);if(r)setShowForm(false);}}/></div>)
      :<Btn onClick={()=>setShowForm(true)}>{t.plus}</Btn>)}
    {o.canAdmin&&(<div className="rounded-xl border border-amber-700/40 p-3 space-y-2">
      <p className="text-xs text-amber-300">{t.admin}</p>
      <Btn color="bg-gray-800 text-gray-100 border border-gray-600" loading={busy} onClick={copyVendor}>📋 {t.copyVendor}</Btn>
      {o.status!=='ended'&&o.status!=='cancelled'&&(<><p className="text-xs text-gray-500">{t.changeTo}</p>
        <div className="grid grid-cols-2 gap-2">{MAKE_BTN.filter(s=>s!==o.status).map(s=>(<button key={s} disabled={busy||(s!=='cancelled'&&!o.qualified)} onClick={()=>changeStatus(s)} className={'rounded-lg py-2 text-sm border disabled:opacity-30 '+(s==='cancelled'?'border-red-700 text-red-300':'border-gray-600 text-gray-200')}>{sLabel(s,lang)}</button>))}
          {o.status==='closed'&&<button disabled={busy} onClick={()=>changeStatus('collecting')} className="rounded-lg py-2 text-sm border border-amber-700 text-amber-300">{sLabel('collecting',lang)}</button>}</div></>)}
    </div>)}
    {msg&&<p className="text-center text-sm text-gray-300 whitespace-pre-wrap">{msg}</p>}
  </Card>);
}

// ───────── 首頁 / 歷史 ─────────
function MainPage({me,tab}){
  const lang=me.user.lang==='vi'?'vi':'zh';const t=L[lang];
  const[store,setStore]=useState('');
  const[st,reload]=useLoad('gb2List',store?{store:store}:{});
  const[showForm,setShowForm]=useState(false);const[need,setNeed]=useState(false);const[busy,setBusy]=useState(false);const[msg,setMsg]=useState('');
  if(st.loading&&!st.data)return(<Loading/>);
  const d=st.data;if(!d||!d.ok)return(<Msg text={(d&&d.error)||t.failed}/>);
  const mine=d.store===d.myStore;
  const mergeCopy=async()=>{setBusy(true);const r=await api('gb2Vendor',{scope:'pending'});setBusy(false);if(!r.ok){setMsg(r.error||t.failed);return;}const ok=await copyText(r.text);setMsg(ok?t.copied+'\n'+r.text:r.text);};
  return(<Box {...barOf(st,reload,lang)}>
    <div className="flex items-center justify-between"><h1 className="text-xl font-bold text-white">🧤 {t.title}</h1>
      {d.canSettings&&<button className="text-sm text-violet-300" onClick={()=>go('gb2=set')}>⚙ {t.set}</button>}</div>
    {d.stores.length>1&&(<div className="flex flex-wrap gap-2">{d.stores.map(s=><Chip key={s} on={d.store===s} onClick={()=>setStore(s)}>{s}</Chip>)}</div>)}
    <div className="flex gap-2"><Chip on={tab==='l'} onClick={()=>go('gb2=l')}>{lang==='vi'?'Đang nhận':'進行中'}</Chip><Chip on={tab==='h'} onClick={()=>go('gb2=h')}>{t.history}</Chip></div>
    {tab==='l'&&(<>
      {d.active.map(o=>(<OrderCard key={o.id} o={o} t={t} lang={lang} last={d.last} reload={reload} showForm={showForm} setShowForm={setShowForm}/>))}
      {!d.hasCollecting&&mine&&(<Card className="space-y-3"><p className="text-center text-gray-300">{t.noOrder}</p><p className="text-center text-xs text-gray-500">{t.noOrderHint}</p>
        {need?(<div className="rounded-xl border border-gray-700 p-3"><ItemForm t={t} lang={lang} init={d.last||{}} busy={busy} submitText={t.submit} onCancel={()=>setNeed(false)}
          onSubmit={async v=>{setBusy(true);const r=await api('gb2Join',v);setBusy(false);if(!r.ok){setMsg(r.error||t.failed);return;}setNeed(false);reload();}}/></div>)
          :<Btn onClick={()=>setNeed(true)}>{t.need}</Btn>}</Card>)}
      {d.isMgr&&<Btn color="bg-gray-800 text-gray-100 border border-gray-600" loading={busy} onClick={mergeCopy}>📋 {t.mergeCopy}</Btn>}
      {msg&&<p className="text-center text-sm text-gray-300 whitespace-pre-wrap">{msg}</p>}
    </>)}
    {tab==='h'&&(<>
      <Card className="space-y-2"><p className="text-sm font-semibold text-white">{t.mine}</p>
        {d.mine.length===0?<p className="text-sm text-gray-500">—</p>:d.mine.map((m,i)=>(<div key={i} className="flex justify-between text-sm text-gray-300"><span>{m.at}　{cLabel(m.color,lang)} {m.size} × {m.boxes}</span><span className="text-xs text-gray-500">{m.status}{m.paid?' ✓':''}</span></div>))}</Card>
      {d.history.map(o=>(<Card key={o.id}><div className="flex justify-between text-sm"><span className="text-gray-300">{o.createdAt.slice(0,10)}　{o.boxes} {t.boxes}</span><span className={STATUS_TONE[o.status]}>{sLabel(o.status,lang)}</span></div>
        {o.claimer&&<p className="text-xs text-gray-500 mt-1">{t.claimer}：{o.claimer}</p>}</Card>))}
    </>)}
  </Box>);
}

// ───────── 設定(主管)─────────
function SetPage({me}){
  const[st,reload]=useLoad('gb2Settings',{});
  const[th,setTh]=useState('');const[hr,setHr]=useState('');const[busy,setBusy]=useState(false);const[msg,setMsg]=useState('');
  useEffect(()=>{if(st.data&&st.data.ok&&th===''){setTh(String(st.data.cfg.threshold));setHr(String(st.data.cfg.hours));}},[st.data]);
  if(st.loading&&!st.data)return(<Loading/>);
  const d=st.data;if(!d||!d.ok)return(<Msg text={(d&&d.error)||'失敗'}/>);
  const save=async()=>{setBusy(true);const r=await api('gb2SettingsSet',{threshold:th,hours:hr});setBusy(false);setMsg(r.ok?'已儲存':(r.error||'失敗'));if(r.ok)reload();};
  return(<Box {...barOf(st,reload,'zh')}>
    <button className="text-sm text-violet-300" onClick={()=>go('gb2=l')}>← 返回</button>
    <h1 className="text-xl font-bold text-white">🧤 手套團購設定</h1>
    <Card className="space-y-3">
      <div><p className="text-xs text-gray-400 mb-1">達標箱數（每店各自累計）</p><input value={th} inputMode="numeric" onChange={e=>setTh(e.target.value.replace(/\D/g,''))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"/></div>
      <div><p className="text-xs text-gray-400 mb-1">收單時限（小時；0 = 不限）</p><input value={hr} inputMode="decimal" onChange={e=>setHr(e.target.value.replace(/[^\d.]/g,''))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"/></div>
      <Btn loading={busy} onClick={save}>儲存</Btn>{msg&&<p className="text-center text-sm text-gray-300">{msg}</p>}
    </Card>
    <Card className="space-y-2"><p className="text-sm font-semibold text-white">本月（{d.month}）手套團購推播用量</p>
      {d.usage.map(u=>(<div key={u.store} className="flex justify-between text-sm text-gray-300"><span>{u.store}</span><span>{u.msgs} 則（{u.times} 次）</span></div>))}
      <div className="flex justify-between text-sm text-white border-t border-gray-700 pt-2"><span>合計</span><span>{d.total} 則</span></div>
      <p className="text-[11px] text-gray-500">用量以本功能自己的紀錄計算（每位收到的人算 1 則），僅供參考。</p></Card>
  </Box>);
}

window.Gloves2Routes=Gloves2Routes;
})();
