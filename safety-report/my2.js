/* my2.js — 「我的」頁面 (v1.0-001)
   由 safety-report.html 載入(在 safety2.js 之後),網址參數 my2:  ?my2=1  我的(待我處理 + 公告 + 安全回報 + 手套團購 + 預排休假 + 拒接名單)
   只讀取各模組既有的 API(n2List / s2TodaySurveys / s2MyReports / gb2List / lv2Month / b2List),不新增後端;任何一區讀取失敗只隱藏該區。 */
(function(){
const{useState}=React;
const C=window.S2Core;
if(!C){window.My2Routes=()=>React.createElement('div',{className:'p-6 text-center text-red-400'},'載入失敗:缺少 safety2.js');return;}
const{useLoad,Box,Card,Loading,Msg,NeedUser,barOf,go}=C;
const p2=n=>String(n).padStart(2,'0');
const todayStr=()=>{const d=new Date(Date.now()+8*3600e3);return d.getUTCFullYear()+'-'+p2(d.getUTCMonth()+1)+'-'+p2(d.getUTCDate());};
const addMonth=(m,n)=>{const y=parseInt(m.slice(0,4),10),mo=parseInt(m.slice(5,7),10)-1+n;return (y+Math.floor(mo/12))+'-'+p2(((mo%12)+12)%12+1);};
const fmt=(s,o)=>String(s).replace(/\{(\w+)\}/g,(_m,k)=>o&&o[k]!==undefined?o[k]:'');
const md=s=>{s=String(s||'');const m=s.match(/(\d{1,2})[-\/](\d{1,2})(?:\D|$)/g);return s;};

const L={zh:{
  title:'我的',roleT:{teacher:'老師',counter:'櫃台'},todo:'待我處理',nothing:'目前沒有待處理事項 🎉',all:'全部 ›',
  notice:'公告',noNotice:'目前沒有公告',read:'已讀',
  safety:'安全回報',noSafety:'目前沒有進行中的安全回報',cut:'截止',unreported:'未回報',reported:'已回報',goReport:'去回報',youReported:'你回報：',stOk:'平安',stHelp:'需要協助',
  gloves:'手套團購',noGloves:'目前沒有進行中的團購',myName:'我報名：',target:'目標 {a}/{b} 箱',unpaid:'待付款',paid:'已付款',paidAt:'已付 {t}',
  leave:'預排休假',leaveOpen:'{m} 月開放登記中，截止 {c}',leaveDraft:'{m} 月可先暫存，{o} 開放送出',leaveLate:'{m} 月已過登記期間，送出需主管審批',leaveNone:'{m} 月',
  leaveMine:'我的 {m} 月休假',early:'早班',late:'晚班',days:'天',noLeave:'尚未登記',goLeave:'去排休',leavePend:'待簽核',leaveOk:'已生效',leaveDraftN:'暫存 {n} 天未送出',
  bl:'拒接名單',blHint:'只列出「拒接老師編號」含我（{c}）的客人',noBl:'沒有含你編號的拒接客人',addBl:'＋ 新增拒接客人',
  lvName:{p:'老師個人',store:'單店拒接',all:'全店拒接'},reason:'拒接原因：',
  tNotice:'{n} 則未讀公告',tLatest:'最新：',tSafety:'尚未回報',tGlove:'手套團購：請交錢給認領人',tLeave:'預排休假',goSee:'去看',goPay:'待付款',
  loading:'載入中…',fail:'這一區暫時讀不到'},
 vi:{
  title:'Của tôi',roleT:{teacher:'KTV',counter:'Quầy'},todo:'Việc cần xử lý',nothing:'Hiện không có việc cần xử lý 🎉',all:'Tất cả ›',
  notice:'Thông báo',noNotice:'Chưa có thông báo',read:'Đã đọc',
  safety:'Báo cáo an toàn',noSafety:'Không có báo cáo đang mở',cut:'Hạn',unreported:'Chưa báo',reported:'Đã báo',goReport:'Báo ngay',youReported:'Bạn báo: ',stOk:'An toàn',stHelp:'Cần hỗ trợ',
  gloves:'Mua chung găng tay',noGloves:'Chưa có đơn đang mở',myName:'Tôi đăng ký: ',target:'Mục tiêu {a}/{b} thùng',unpaid:'Chờ thanh toán',paid:'Đã thanh toán',paidAt:'Đã trả {t}',
  leave:'Đăng ký nghỉ',leaveOpen:'Tháng {m} đang mở đăng ký, hạn {c}',leaveDraft:'Tháng {m} có thể lưu nháp, mở gửi từ {o}',leaveLate:'Tháng {m} đã quá hạn, gửi cần quản lý duyệt',leaveNone:'Tháng {m}',
  leaveMine:'Ngày nghỉ tháng {m} của tôi',early:'Ca sáng',late:'Ca tối',days:'ngày',noLeave:'Chưa đăng ký',goLeave:'Đăng ký',leavePend:'Chờ ký',leaveOk:'Có hiệu lực',leaveDraftN:'Nháp {n} ngày chưa gửi',
  bl:'Danh sách từ chối',blHint:'Chỉ hiện khách có mã KTV của tôi ({c})',noBl:'Không có khách từ chối liên quan đến bạn',addBl:'＋ Thêm khách từ chối',
  lvName:{p:'Cá nhân',store:'Một chi nhánh',all:'Toàn hệ thống'},reason:'Lý do: ',
  tNotice:'{n} thông báo chưa đọc',tLatest:'Mới nhất: ',tSafety:'Chưa báo cáo',tGlove:'Mua chung găng tay: hãy trả tiền cho người nhận',tLeave:'Đăng ký nghỉ',goSee:'Xem',goPay:'Chờ trả tiền',
  loading:'Đang tải…',fail:'Không tải được mục này'}};

function SecHead({icon,title,n,onAll,t}){
  return(<div className="flex items-center justify-between"><p className="text-base font-bold text-white">{icon} {title}{n>0&&<span className="ml-2 text-xs bg-gray-700 text-gray-100 rounded-full px-2 py-0.5">{n}</span>}</p>
    {onAll&&<button onClick={onAll} className="text-xs text-violet-300">{t.all}</button>}</div>);
}
const Pill=({cls,children})=>(<span className={'shrink-0 text-xs font-bold text-white rounded-full px-3 py-1 '+cls}>{children}</span>);

function My2Page({me}){
  const lang=me.user&&me.user.lang==='vi'?'vi':'zh';const t=L[lang];
  const today=todayStr();const nextM=addMonth(today.slice(0,7),1);
  const[ns,nr]=useLoad('n2List',{});
  const[ss,sr]=useLoad('s2TodaySurveys',{});
  const[rs,rr]=useLoad('s2MyReports',{});
  const[gs,gr]=useLoad('gb2List',{});
  const[ls,lr]=useLoad('lv2Month',{month:nextM});
  const[bs,br]=useLoad('b2List',{});
  const reloadAll=()=>{[nr,sr,rr,gr,lr,br].forEach(f=>{try{f();}catch(_e){}});};
  const ok=x=>x&&x.data&&x.data.ok;
  const loadingAny=[ns,ss,rs,gs,ls,bs].some(x=>x.loading&&!x.data);
  const bar=barOf(ns,reloadAll,lang);
  const u=me.user||{};

  // ── 資料整理
  const notices=ok(ns)?ns.data.notices.filter(n=>n.status==='published'&&!n.expired):[];
  const unreadN=notices.filter(n=>!n.read);
  const surveys=ok(ss)?ss.data.surveys:[];
  const openUnrep=surveys.filter(x=>!x.mine);
  const gOrders=ok(gs)?gs.data.active:[];
  const gMine=gOrders.filter(o=>(o.people||[]).some(p=>p.mine));
  const gPay=gMine.filter(o=>o.status!=='collecting'&&(o.people||[]).some(p=>p.mine&&!p.paid));
  const lv=ok(ls)?ls.data:null;
  const lvMine=lv?lv.mine.filter(x=>x.status!=='cancelled'&&x.status!=='rejected'):[];
  const lvDraft=lvMine.filter(x=>x.status==='draft');
  const lvAct=lvMine.filter(x=>x.status==='approved'||x.status==='pending');
  const lvOpenTodo=lv&&lv.canLeave&&(lv.state==='open'||lv.state==='late')&&lvAct.length===0;
  const bl=ok(bs)?bs.data.approved:[];

  const todo=[];
  openUnrep.slice(0,3).forEach(x=>todo.push({k:'s'+x.id,icon:'🛡️',title:x.title,sub:t.tSafety+'・'+t.cut+' '+String(x.endDate||'').slice(5),btn:t.goReport,cls:'bg-red-600',on:()=>go('s2=r&sid='+x.id)}));
  gPay.forEach(o=>{const mine=(o.people||[]).find(p=>p.mine);todo.push({k:'g'+o.id,icon:'🧤',title:t.tGlove,sub:o.store+'・'+o.statusLabel,btn:t.goPay,cls:'bg-amber-500',on:()=>go('gb2=l')});});
  if(unreadN.length>0)todo.push({k:'n',icon:'📢',title:fmt(t.tNotice,{n:unreadN.length}),sub:t.tLatest+(lang==='vi'&&unreadN[0].titleVi?unreadN[0].titleVi:unreadN[0].title),btn:t.goSee,cls:'bg-sky-700',on:()=>go('n2=l')});
  if(lvDraft.length>0&&lv&&lv.state!=='draft')todo.push({k:'ld',icon:'🏖️',title:t.tLeave,sub:fmt(t.leaveDraftN,{n:lvDraft.length}),btn:t.goLeave,cls:'bg-violet-600',on:()=>go('lv2=l&month='+nextM)});
  else if(lvOpenTodo)todo.push({k:'lo',icon:'🏖️',title:t.tLeave,sub:fmt(t.leaveOpen,{m:parseInt(nextM.slice(5),10),c:(lv.closes||'').slice(5).replace('-','/')}),btn:t.goLeave,cls:'bg-violet-600',on:()=>go('lv2=l&month='+nextM)});

  if(loadingAny&&!ok(ns)&&!ok(ss))return(<Loading text={t.loading}/>);
  const roleName=(t.roleT[u.role]||'');
  return(<Box {...bar}>
    <div className="flex items-start justify-between"><div><h1 className="text-2xl font-bold text-white">{t.title}</h1>
      <p className="text-xs text-gray-400 mt-0.5">{u.store||''}{u.code?'　'+u.code+(lang==='vi'?'':' 號'):''}{roleName?'　'+roleName:''}</p></div></div>

    <div className="rounded-3xl border border-violet-700 p-4 space-y-2" style={{background:'linear-gradient(135deg,#2e1d5e,#1b1840)'}}>
      <SecHead icon="⚡" title={t.todo} n={todo.length} t={t}/>
      {todo.length===0&&<p className="text-sm text-gray-300 py-2">{t.nothing}</p>}
      {todo.map(x=>(<div key={x.k} className="flex items-center gap-3 border-t border-violet-800/60 pt-2">
        <span className="text-2xl w-8 text-center">{x.icon}</span>
        <div className="flex-1 min-w-0"><p className="text-sm font-bold text-white truncate">{x.title}</p><p className="text-xs text-gray-400 truncate">{x.sub}</p></div>
        <button onClick={x.on}><Pill cls={x.cls}>{x.btn}</Pill></button></div>))}
    </div>

    {ok(ns)&&<Card className="space-y-2"><SecHead icon="📢" title={t.notice} t={t} onAll={()=>go('n2=l')}/>
      {notices.length===0&&<p className="text-xs text-gray-500">{t.noNotice}</p>}
      {notices.slice(0,3).map(n=>(<button key={n.id} onClick={()=>go('n2=v&nid='+n.id)} className="w-full text-left flex items-start gap-2 border-t border-gray-800 pt-2">
        <span className={'mt-1.5 w-2 h-2 rounded-full shrink-0 '+(n.read?'bg-transparent':'bg-red-500')}></span>
        <span className="flex-1 min-w-0"><span className={'block text-sm '+(n.read?'text-gray-400':'text-white font-bold')}>{lang==='vi'&&n.titleVi?n.titleVi:n.title}</span>
          <span className="block text-[11px] text-gray-500">{n.dateLabel}{n.cat?'・'+n.cat:''}{n.read?'・'+t.read:''}</span></span></button>))}
    </Card>}

    {ok(ss)&&<Card className="space-y-2"><SecHead icon="🛡️" title={t.safety} t={t} onAll={()=>go('s2=today')}/>
      {surveys.length===0&&<p className="text-xs text-gray-500">{t.noSafety}</p>}
      {surveys.slice(0,3).map(x=>(<button key={x.id} onClick={()=>go('s2=r&sid='+x.id)} className="w-full text-left flex items-center gap-2 border-t border-gray-800 pt-2">
        <span className="flex-1 min-w-0"><span className="block text-sm text-white">{x.title}</span>
          <span className="block text-[11px] text-gray-500">{String(x.createdAt||'').slice(5,10)} {lang==='vi'?'phát':'發起'}・{t.cut} {String(x.endDate||'').slice(5)}{x.mine?'・'+t.youReported+(x.mine.status==='ok'?t.stOk:x.mine.status==='help'?t.stHelp:t.reported):''}</span></span>
        <Pill cls={x.mine?'bg-emerald-600':'bg-red-600'}>{x.mine?t.reported:t.unreported}</Pill></button>))}
      {surveys.length===0&&ok(rs)&&rs.data.reports.slice(0,2).map(r=>(<p key={r.id} className="text-sm text-gray-300 border-t border-gray-800 pt-2">{r.title}　<span className="text-xs text-gray-500">{r.date}・{t.youReported}{r.status==='ok'?t.stOk:r.status==='help'?t.stHelp:(r.otherText||t.reported)}</span></p>))}
    </Card>}

    {ok(gs)&&<Card className="space-y-2"><SecHead icon="🧤" title={t.gloves} t={t} onAll={()=>go('gb2=l')}/>
      {gOrders.length===0&&<p className="text-xs text-gray-500">{t.noGloves}</p>}
      {gOrders.slice(0,2).map(o=>{const me1=(o.people||[]).find(p=>p.mine);const pct=Math.min(100,Math.round((o.boxes||0)*100/Math.max(1,o.threshold||1)));
        return(<button key={o.id} onClick={()=>go('gb2=l')} className="w-full text-left border-t border-gray-800 pt-2 space-y-1">
          <span className="flex items-center gap-2"><span className="flex-1 text-sm text-white">{o.store}・{o.statusLabel}</span>
            {me1&&<Pill cls={me1.paid?'bg-emerald-600':o.status==='collecting'?'bg-sky-700':'bg-amber-500'}>{me1.paid?t.paid:o.status==='collecting'?o.statusLabel:t.unpaid}</Pill>}</span>
          {me1&&<span className="block text-xs text-gray-400">{t.myName}{(me1.lines||[]).filter(l=>l.mine).map(l=>l.color+' '+l.size+'×'+l.boxes).join('、')}{me1.paid&&me1.paidAt?'　'+fmt(t.paidAt,{t:me1.paidAt}):''}</span>}
          <span className="block text-[11px] text-gray-500">{fmt(t.target,{a:o.boxes||0,b:o.threshold||0})}</span>
          <span className="block h-1.5 rounded bg-gray-800"><span className="block h-1.5 rounded bg-emerald-500" style={{width:pct+'%'}}></span></span></button>);})}
    </Card>}

    {lv&&(lv.canLeave||lvAct.length>0)&&<Card className="space-y-2"><SecHead icon="🏖️" title={t.leave} t={t} onAll={()=>go('lv2=l&month='+nextM)}/>
      <p className="text-xs text-gray-400">{lv.state==='open'?fmt(t.leaveOpen,{m:parseInt(nextM.slice(5),10),c:(lv.closes||'').slice(5).replace('-','/')}):lv.state==='draft'?fmt(t.leaveDraft,{m:parseInt(nextM.slice(5),10),o:(lv.opens||'').slice(5).replace('-','/')}):lv.state==='late'?fmt(t.leaveLate,{m:parseInt(nextM.slice(5),10)}):fmt(t.leaveNone,{m:parseInt(nextM.slice(5),10)})}</p>
      <div className="border-t border-gray-800 pt-2 space-y-1"><p className="text-sm font-bold text-white">{fmt(t.leaveMine,{m:parseInt(nextM.slice(5),10)})}</p>
        {lvMine.length===0&&<p className="text-xs text-gray-500">{t.noLeave}</p>}
        {['early','late'].map(sh=>{const a=lvMine.filter(x=>x.shift===sh).sort((x,y)=>x.date<y.date?-1:1);return a.length?(<p key={sh} className="text-sm text-gray-200"><span className={'text-[11px] rounded px-1 text-white mr-1 '+(sh==='early'?'bg-amber-500':'bg-indigo-500')}>{t[sh]}</span>{a.map(x=>parseInt(x.date.slice(5,7),10)+'/'+parseInt(x.date.slice(8),10)+(x.status==='pending'?'⏳':x.status==='draft'?'✎':'')).join('、')}<span className="text-xs text-gray-500">　{a.length} {t.days}</span></p>):null;})}</div>
    </Card>}

    {ok(bs)&&<Card className="space-y-2"><SecHead icon="🚫" title={t.bl} n={bl.length} t={t} onAll={()=>go('b2=l')}/>
      {bs.data.isTeacher&&<p className="text-xs text-gray-400">{fmt(t.blHint,{c:bs.data.myCode||u.code||''})}</p>}
      {bl.length===0&&<p className="text-xs text-gray-500">{t.noBl}</p>}
      {bl.slice(0,3).map(r=>(<div key={r.reqId} className="border-t border-gray-800 pt-2 flex items-start gap-2">
        <div className="flex-1 min-w-0"><p className="text-sm text-white">{r.custName}{r.custTitle}　<span className="text-gray-300">{r.custPhone}</span>　<span className="text-gray-400">{String(r.teacherCode||'').replace(/[,，、]+/g,' ')}</span></p>
          <p className="text-xs text-gray-500">{t.reason}{r.reason||'---'}</p></div>
        <span className={'shrink-0 text-xs text-white rounded-full px-2 py-0.5 '+(r.level==='all'?'bg-red-600':r.level==='store'?'bg-orange-600':'bg-gray-600')}>{(t.lvName||{})[r.level]||''}</span></div>))}
      {bs.data.canAdd&&<button onClick={()=>go('b2=new')} className="w-full rounded-xl border border-violet-500 text-violet-300 py-2.5 text-sm">{t.addBl}</button>}
    </Card>}
  </Box>);
}
function My2Routes(){return(<NeedUser render={(me)=><My2Page me={me}/>}/>);}
window.My2Routes=My2Routes;
})();
