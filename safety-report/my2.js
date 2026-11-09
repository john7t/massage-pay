/* my2.js — 「我的」頁面 (v1.0-016)
   由 safety-report.html 載入(在 safety2.js 之後),網址參數 my2:  ?my2=1  我的(待我處理 + 公告 + 安全回報 + 手套團購 + 預排休假 + 拒接名單)
   只讀取各模組既有的 API(n2List / s2TodaySurveys / s2MyReports / gb2List / lv2Month / b2List),不新增後端;任何一區讀取失敗只隱藏該區。 */
(function(){
const{useState,useEffect}=React;
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
  gloves:'手套團購',noGloves:'目前沒有手套團購',needGlove:'點擊登記 我有需求 >',myName:'我報名：',target:'目標 {a}/{b} 箱',unpaid:'待付款',paid:'已付款',paidAt:'已付 {t}',
  leave:'預排休假',leaveOpen:'{m} 月開放登記中，截止 {c}',leaveDraft:'{m} 月可先暫存，{o} 開放送出',leaveLate:'{m} 月已過登記期間，送出需主管審批',leaveNone:'{m} 月',
  leaveMine:'我的 {m} 月休假',early:'早班',late:'晚班',days:'天',noLeave:'尚未登記',goLeave:'去排休',leavePend:'待簽核',leaveOk:'已生效',leaveDraftN:'暫存 {n} 天未送出',
  bl:'拒接名單',blHint:'只列出「拒接老師編號」含我（{c}）的客人',noBl:'沒有含你編號的拒接客人',addBl:'＋ 新增拒接客人',
  lvName:{p:'老師個人',store:'單店拒接',all:'全店拒接'},reason:'拒接原因：',
  tNotice:'{n} 則未讀公告',tLatest:'最新：',tSafety:'尚未回報',tGlove:'手套團購：請交錢給認領人',tLeave:'預排休假',goSee:'去看',goPay:'待付款',
  pts:'勞點',ptsStd:'標準 {n} 點（{s}）',ptsMet:'達標',ptsNot:'未達標',ptsNew:'新進（前三個月不列入考核）',ptsRank:'同店{s}名次 {r} / {t}',ptsMon:'{m} 月',ptsPt:'點',ptsHist:'近幾個月',ptsBar:'我的逐月勞點（虛線＝標準 {s}；紫框＝目前選的月份）',ptsTop:'{m} 月前三名',ptsNo:'{n}號',
  loading:'載入中…',fail:'這一區暫時讀不到'},
 vi:{
  title:'Của tôi',roleT:{teacher:'Sư phụ',counter:'Quầy'},todo:'Việc cần xử lý',nothing:'Hiện không có việc cần xử lý 🎉',all:'Tất cả ›',
  notice:'Thông báo',noNotice:'Chưa có thông báo',read:'Đã đọc',
  safety:'Báo cáo an toàn',noSafety:'Không có báo cáo đang mở',cut:'Hạn',unreported:'Chưa báo',reported:'Đã báo',goReport:'Báo ngay',youReported:'Bạn báo: ',stOk:'An toàn',stHelp:'Cần hỗ trợ',
  gloves:'Mua chung găng tay',noGloves:'Hiện chưa có đơn mua chung găng tay',needGlove:'Bấm để đăng ký nhu cầu >',myName:'Tôi đăng ký: ',target:'Mục tiêu {a}/{b} thùng',unpaid:'Chờ thanh toán',paid:'Đã thanh toán',paidAt:'Đã trả {t}',
  leave:'Đăng ký nghỉ',leaveOpen:'Tháng {m} đang mở đăng ký, hạn {c}',leaveDraft:'Tháng {m} có thể lưu nháp, mở gửi từ {o}',leaveLate:'Tháng {m} đã quá hạn, gửi cần quản lý duyệt',leaveNone:'Tháng {m}',
  leaveMine:'Ngày nghỉ tháng {m} của tôi',early:'Ca sáng',late:'Ca tối',days:'ngày',noLeave:'Chưa đăng ký',goLeave:'Đăng ký',leavePend:'Chờ ký',leaveOk:'Có hiệu lực',leaveDraftN:'Nháp {n} ngày chưa gửi',
  bl:'Danh sách từ chối',blHint:'Chỉ hiện khách có mã Sư phụ của tôi ({c})',noBl:'Không có khách từ chối liên quan đến bạn',addBl:'＋ Thêm khách từ chối',
  lvName:{p:'Cá nhân',store:'Một chi nhánh',all:'Toàn hệ thống'},reason:'Lý do: ',
  tNotice:'{n} thông báo chưa đọc',tLatest:'Mới nhất: ',tSafety:'Chưa báo cáo',tGlove:'Mua chung găng tay: hãy trả tiền cho người nhận',tLeave:'Đăng ký nghỉ',goSee:'Xem',goPay:'Chờ trả tiền',
  pts:'Điểm lao động (勞點)',ptsStd:'Chuẩn {n} điểm ({s})',ptsMet:'Đạt',ptsNot:'Chưa đạt',ptsNew:'Người mới (3 tháng đầu không tính)',ptsRank:'Hạng {r} / {t} ({s})',ptsMon:'Tháng {m}',ptsPt:'điểm',ptsHist:'Các tháng gần đây',ptsBar:'Điểm theo tháng (đường đứt = chuẩn {s}; viền tím = tháng đang chọn)',ptsTop:'Top 3 tháng {m}',ptsNo:'Số {n}',
  loading:'Đang tải…',fail:'Không tải được mục này'}};

function SecHead({icon,title,n,onAll,t}){
  return(<div className="flex items-center justify-between"><p className="text-base font-bold text-white">{icon} {title}{n>0&&<span className="ml-2 text-xs bg-gray-700 text-gray-100 rounded-full px-2 py-0.5">{n}</span>}</p>
    {onAll&&<button onClick={onAll} className="text-xs text-violet-300">{t.all}</button>}</div>);
}
const Pill=({cls,children})=>(<span className={'shrink-0 text-xs font-bold text-white rounded-full px-3 py-1 '+cls}>{children}</span>);

// v1.0-012:使用統計橫幅——以「打開我的頁」為單位(GAS my2Open 記錄):人次=每次打開累計,人數=同一人不重複
// 所有人看橫幅;主管/管理者點開看分析(班別、24小時尖峰、當月每日/排休開放期、店別名單)。管理者/全店級看全店,其餘主管看本店
function UsageBanner({lang}){
  const vi=lang==='vi';
  const[date,setDate]=useState(todayStr());
  const[open,setOpen]=useState(false);
  const[pick,setPick]=useState(null);
  const[hMode,setHMode]=useState('day');   // day=當日 / 30=近30日累計
  const[dMode,setDMode]=useState('pv');    // pv=人次 / uv=人數
  const[st,reload]=useLoad('my2OpenStats',{date});
  useEffect(()=>{if(window.__my2Logged)return;window.__my2Logged=1;C.api('my2Open',{}).then(()=>{try{reload()}catch(_e){}});},[]);
  let d=st.data&&st.data.ok?st.data:null;
  // 後端若還是舊版(欄位不齊)就整塊不顯示,避免整頁掛掉
  if(d&&!(d.today&&typeof d.today==='object'&&d.yesterday&&typeof d.yesterday==='object'))d=null;
  if(d&&d.mgr&&!(Array.isArray(d.hoursDay)&&Array.isArray(d.hours30)&&Array.isArray(d.days)&&d.shift&&d.day&&Array.isArray(d.stores)))d={ok:true,mgr:false,today:d.today,yesterday:d.yesterday};
  if(!d)return null;
  const U=vi?'người':'人',V=vi?'lượt':'人次';
  const shift=n=>{const x=new Date(date+'T00:00:00Z');x.setUTCDate(x.getUTCDate()+n);setDate(x.toISOString().slice(0,10));setPick(null);};
  const Bars=({vals,hi,h,labelEvery,fmtL})=>{const mx=Math.max(1,...vals);return(<div>
    <div className="flex items-end gap-px" style={{height:h}}>{vals.map((v,i)=>(<div key={i} className="flex-1 flex flex-col justify-end h-full" title={v}><div className={'w-full rounded-t '+(hi(i)?'bg-amber-400':'bg-sky-600')} style={{height:v?Math.max(2,Math.round(v/mx*(h-14))):0}}></div></div>))}</div>
    <div className="flex gap-px mt-0.5">{vals.map((v,i)=>(<span key={i} className="flex-1 text-center text-[9px] text-gray-500">{i%labelEvery===0?fmtL(i):''}</span>))}</div></div>);};
  const hours=hMode==='day'?d.hoursDay:d.hours30;
  const peakH=hours.indexOf(Math.max(...hours));const hasH=Math.max(...hours)>0;
  const dayVals=d.days.map(x=>x[dMode]);
  const avg=a=>a.length?Math.round(a.reduce((p,q)=>p+q,0)/a.length*10)/10:0;
  const inW=dayVals.filter((_v,i)=>i+1>=10&&i+1<=12),outW=dayVals.filter((_v,i)=>!(i+1>=10&&i+1<=12));
  const shL={early:vi?'Ca sáng':'早班',late:vi?'Ca tối':'晚班',counter:vi?'Quầy':'櫃台',other:vi?'Chưa rõ':'未分'};
  const Tile=({k,v,u})=>(<div className="flex-1 rounded-xl bg-white/10 px-3 py-2"><p className="text-[11px] text-gray-400">{k}</p><p className="text-xl font-bold text-white">{v}<span className="text-xs font-normal text-gray-400 ml-1">{u}</span></p></div>);
  const Sec=({t,children})=>(<div className="border-t border-sky-900 pt-3 space-y-2"><p className="text-sm font-bold text-white">{t}</p>{children}</div>);
  const Seg=({v,set,opts})=>(<div className="inline-flex rounded-lg bg-white/10 p-0.5">{opts.map(([k,l])=>(<button key={k} onClick={()=>set(k)} className={'px-3 min-h-[32px] rounded-md text-xs '+(v===k?'bg-sky-600 text-white font-bold':'text-gray-300')}>{l}</button>))}</div>);
  const sel=pick&&d.stores?((d.stores.find(s=>s.store===pick.store)||{}).people||[]).find(c=>c.code===pick.code):null;
  return(<div className="rounded-2xl border border-sky-800 overflow-hidden bg-gradient-to-br from-sky-100 to-sky-50">
    <button disabled={!d.mgr} onClick={()=>setOpen(!open)} className="w-full flex items-center gap-3 px-4 py-2.5 min-h-[56px] text-left">
      <span className="text-xl">📊</span>
      <span className="flex-1 text-sm text-gray-100 leading-snug">
        <span className="block">{vi?'Hôm nay':'今日'}　<b className="text-white text-base">{d.today.pv}</b> {V}・<b className="text-white text-base">{d.today.uv}</b> {U}</span>
        <span className="block text-gray-400">{vi?'Hôm qua':'昨日'}　<b className="text-gray-200">{d.yesterday.pv}</b> {V}・<b className="text-gray-200">{d.yesterday.uv}</b> {U}</span></span>
      {d.mgr&&<span className="text-gray-400">{open?'⌄':'›'}</span>}
    </button>
    {d.mgr&&open&&(<div className="px-4 pb-4 pt-3 space-y-3 border-t border-sky-900">
      <div className="flex items-center justify-between">
        <button onClick={()=>shift(-1)} className="w-11 h-11 rounded-xl bg-white/10 text-gray-200 text-lg">‹</button>
        <div className="text-center"><div className="text-base font-bold text-white">{d.date}</div><div className="text-xs text-gray-400">{d.scopeLabel}</div></div>
        <button onClick={()=>shift(1)} disabled={date>=todayStr()} className="w-11 h-11 rounded-xl bg-white/10 text-gray-200 text-lg disabled:opacity-30">›</button>
      </div>
      <div className="flex gap-2"><Tile k={vi?'Lượt mở':'人次（累計）'} v={d.day.pv} u={V}/><Tile k={vi?'Số người (không trùng)':'人數（不重複）'} v={d.day.uv} u={U}/></div>

      <Sec t={'🕘 '+(vi?'Theo ca':'早晚班使用情形')}>
        {['early','late','counter','other'].map(k=>{const x=d.shift[k];if(k==='other'&&!x.pv)return null;const mx=Math.max(1,d.shift.early.pv,d.shift.late.pv,d.shift.counter.pv,d.shift.other.pv);return(<div key={k} className="flex items-center gap-2 text-sm"><span className="w-12 text-gray-300">{shL[k]}</span>
          <div className="flex-1 h-3 rounded bg-white/10 overflow-hidden"><div className="h-full bg-sky-500" style={{width:Math.round(x.pv/mx*100)+'%'}}></div></div>
          <span className="w-28 text-right text-gray-200 text-xs">{x.pv} {V}・{x.uv} {U}</span></div>);})}
      </Sec>

      <Sec t={'⏰ '+(vi?'Giờ cao điểm 24h':'24 小時尖峰時段')}>
        <Seg v={hMode} set={setHMode} opts={[['day',vi?'Ngày chọn':'當日'],['30',vi?'30 ngày':'近30日累計']]}/>
        <Bars vals={hours} h={80} hi={i=>hasH&&i===peakH} labelEvery={3} fmtL={i=>i}/>
        <p className="text-xs text-gray-400">{hasH?(vi?'Cao điểm: ':'尖峰：')+String(peakH).padStart(2,'0')+':00～'+String(peakH+1).padStart(2,'0')+':00（'+hours[peakH]+' '+V+'）':(vi?'Chưa có dữ liệu':'尚無資料')}</p>
      </Sec>

      <Sec t={'📅 '+d.month+(vi?' theo ngày':' 每日使用')+'（'+(vi?'ngày 10~12 mở đăng ký nghỉ':'10~12 號＝開放排休')+'）'}>
        <Seg v={dMode} set={setDMode} opts={[['pv',V],['uv',U]]}/>
        <Bars vals={dayVals} h={90} hi={i=>i+1>=10&&i+1<=12} labelEvery={5} fmtL={i=>i+1}/>
        <p className="text-xs text-gray-400">{vi?'TB ngày 10~12: ':'10~12 號平均 '}<b className="text-amber-300">{avg(inW)}</b>{vi?' · ngày khác: ':'・其他日平均 '}<b className="text-gray-200">{avg(outW)}</b> {dMode==='pv'?V:U}{avg(outW)>0?'（'+(avg(inW)>=avg(outW)?'+':'')+Math.round((avg(inW)/avg(outW)-1)*100)+'%）':''}</p>
      </Sec>

      <Sec t={'🏬 '+(vi?'Theo chi nhánh':'店別名單')}>
        {d.stores.length===0&&<p className="text-xs text-gray-500">{vi?'Không có dữ liệu':'這天沒有使用記錄'}</p>}
        {d.stores.map(s=>(<div key={s.store} className="space-y-1.5"><p className="text-sm text-gray-200"><b>{s.store}</b> {s.uv} {U}・{s.pv} {V}：</p>
          <div className="flex flex-wrap gap-1.5">{s.people.map((c,i)=>{const on=pick&&pick.store===s.store&&pick.code===c.code;return(<button key={c.code+i} onClick={()=>setPick(on?null:{store:s.store,code:c.code})} className={'min-h-[36px] px-3 rounded-lg text-sm font-mono border '+(on?'bg-sky-500/20 border-sky-400 text-sky-300':'bg-white/10 border-white/10 text-gray-200')}>{c.code}{c.n>1&&<span className="text-[10px] text-gray-400 ml-1">×{c.n}</span>}</button>);})}</div></div>))}
        {sel&&<div className="rounded-xl bg-black/25 p-3"><p className="text-xs text-gray-400 mb-1">{vi?'Mã':'編號'} {sel.code}・{sel.n} {V}</p><p className="text-sm font-mono text-gray-100 leading-relaxed">{sel.times.join('　')}</p></div>}
      </Sec>
      <button onClick={reload} className="w-full min-h-[40px] rounded-xl bg-white/10 text-xs text-gray-300">{vi?'Tải lại':'重新整理'}</button>
    </div>)}
  </div>);
}

class UsageGuard extends React.Component{ // 統計區塊出任何錯都只隱藏自己,不影響「我的」其他區
  constructor(p){super(p);this.state={e:false};}
  static getDerivedStateFromError(){return {e:true};}
  componentDidCatch(){}
  render(){return this.state.e?null:this.props.children;}
}

// v1.0-014:主櫃今日登入碼(櫃台/主管才有;每天凌晨3點換日;點一下才顯示,避免被旁人看到)
function MainCodeCard({lang}){
  const vi=lang==='vi';const[show,setShow]=useState(false);
  const[st]=useLoad('cnMyDayCode',{});
  const d=st.data&&st.data.ok?st.data:null;
  if(!d&&st.loading)return(<div className="rounded-2xl border border-emerald-800 bg-emerald-950/40 px-4 py-3 flex items-center gap-3 text-emerald-300"><C.Spinner size={22}/><span className="text-sm text-gray-300">{vi?'Đang tạo mã đăng nhập…':'產生今日登入碼中…'}</span></div>);
  if(!d||!d.code)return null;
  return(<div className="rounded-2xl border border-emerald-800 bg-emerald-950/40 px-4 py-3">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0"><p className="text-sm text-gray-200">🔑 {vi?'Mã đăng nhập quầy hôm nay':'今日主櫃登入碼'}</p><p className="text-[11px] text-gray-500">{d.store}・{vi?'Ngày làm việc':'營業日'} {d.day}</p></div>
      <button onClick={()=>setShow(!show)} className="min-h-[44px] px-4 rounded-xl bg-white/10 text-white font-mono text-xl tracking-widest" style={{fontVariantNumeric:'tabular-nums'}}>{show?d.code:'••••••'}</button>
    </div>
    {show&&d.nextCode&&<p className="text-[11px] text-gray-500 mt-1.5 text-right">{vi?'Ngày mai':'明日'}（{d.nextDay}）{d.nextCode}</p>}
  </div>);
}

function My2Page({me}){
  const lang=me.user&&me.user.lang==='vi'?'vi':'zh';const t=L[lang];
  const today=todayStr();const nextM=addMonth(today.slice(0,7),1);
  const[ns,nr]=useLoad('n2List',{});
  const[ss,sr]=useLoad('s2TodaySurveys',{});
  const[rs,rr]=useLoad('s2MyReports',{});
  const[gs,gr]=useLoad('gb2List',{});
  const[ls,lr]=useLoad('lv2Month',{month:nextM});
  const curM=today.slice(0,7);const[cs,cr]=useLoad('lv2Month',{month:curM}); // 本月的排休也顯示在「我的」
  const[bs,br]=useLoad('b2List',{});
  const[pallV,setPallV]=useState(false);const[pm,setPm]=useState('');const[py,setPy]=useState(0); // 勞點:所選月份(空=最新)/年份
  const[ps,pr]=useLoad('s2PtsMine',{month:pm}); // 我的勞點
  const reloadAll=()=>{[nr,sr,rr,gr,lr,cr,br,pr].forEach(f=>{try{f();}catch(_e){}});};
  const ok=x=>x&&x.data&&x.data.ok;
  const loadingAny=[ns,ss,rs,gs,ls,bs].some(x=>x.loading&&!x.data);
  const bar=barOf(ns,reloadAll,lang);
  const u=me.user||{};
  // v1.0-011:進入頁面時捲到最上面(資料載入完內容變長後再補一次,避免停在下方)
  useEffect(()=>{try{if(history.scrollRestoration)history.scrollRestoration='manual'}catch(_e){}const z=()=>{try{window.scrollTo(0,0);document.documentElement.scrollTop=0;document.body.scrollTop=0}catch(_e){}};z();const a=setTimeout(z,150),b=setTimeout(z,600);return()=>{clearTimeout(a);clearTimeout(b)}},[]);

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
  const lvCur=ok(cs)?cs.data.mine.filter(x=>x.status!=='cancelled'&&x.status!=='rejected'):[];
  // 某月的「我的休假」區塊:標題可點,進該月的預排休頁
  const leaveBlock=(m,list,isCur)=>(<div key={m} className="border-t border-gray-800 pt-2 space-y-1">
    <button onClick={()=>go('lv2=l&month='+curM)} className="w-full flex items-center justify-between text-left"><span className="text-sm font-bold text-white">{fmt(t.leaveMine,{m:parseInt(m.slice(5),10)})}</span><span className="text-xs text-violet-300">{lang==='vi'?'Xem ›':'查看 ›'}</span></button>
    {list.length===0&&<p className="text-xs text-gray-500">{t.noLeave}</p>}
    {['early','late'].map(sh=>{const a=list.filter(x=>x.shift===sh).sort((x,y)=>x.date<y.date?-1:1);return a.length?(<p key={sh} className="text-sm text-gray-200"><span className={'text-[11px] rounded px-1 text-white mr-1 '+(sh==='early'?'bg-amber-500':'bg-indigo-500')}>{t[sh]}</span>{a.map(x=>parseInt(x.date.slice(5,7),10)+'/'+parseInt(x.date.slice(8),10)+(x.status==='pending'?'⏳':x.status==='draft'?'✎':'')).join('、')}<span className="text-xs text-gray-500">　{a.length} {t.days}</span></p>):null;})}</div>);
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

    <UsageGuard><UsageBanner lang={lang}/></UsageGuard>
    <UsageGuard><MainCodeCard lang={lang}/></UsageGuard>

    <div className="rounded-3xl border border-violet-700 p-4 space-y-2 bg-gradient-to-br from-violet-100 to-violet-50">
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
      {gOrders.length===0&&<button onClick={()=>go('gb2=l')} className="w-full text-left text-sm text-violet-300 font-bold border-t border-gray-800 pt-2">{t.needGlove}</button>}
      {gOrders.slice(0,2).map(o=>{const me1=(o.people||[]).find(p=>p.mine);const pct=Math.min(100,Math.round((o.boxes||0)*100/Math.max(1,o.threshold||1)));
        return(<button key={o.id} onClick={()=>go('gb2=l')} className="w-full text-left border-t border-gray-800 pt-2 space-y-1">
          <span className="flex items-center gap-2"><span className="flex-1 text-sm text-white">{o.store}・{o.statusLabel}</span>
            {me1&&<Pill cls={me1.paid?'bg-emerald-600':o.status==='collecting'?'bg-sky-700':'bg-amber-500'}>{me1.paid?t.paid:o.status==='collecting'?o.statusLabel:t.unpaid}</Pill>}</span>
          {me1&&<span className="block text-xs text-gray-400">{t.myName}{(me1.lines||[]).filter(l=>l.mine).map(l=>l.color+' '+l.size+'×'+l.boxes).join('、')}{me1.paid&&me1.paidAt?'　'+fmt(t.paidAt,{t:me1.paidAt}):''}</span>}
          <span className="block text-[11px] text-gray-500">{fmt(t.target,{a:o.boxes||0,b:o.threshold||0})}</span>
          <span className="block h-1.5 rounded bg-gray-800"><span className="block h-1.5 rounded bg-emerald-500" style={{width:pct+'%'}}></span></span></button>);})}
    </Card>}

    {lv&&(lv.canLeave||lvAct.length>0||lvCur.length>0)&&<Card className="space-y-2"><SecHead icon="🏖️" title={t.leave} t={t} onAll={()=>go('lv2=l&month='+curM)}/>
      <p className="text-xs text-gray-400">{lv.state==='open'?fmt(t.leaveOpen,{m:parseInt(nextM.slice(5),10),c:(lv.closes||'').slice(5).replace('-','/')}):lv.state==='draft'?fmt(t.leaveDraft,{m:parseInt(nextM.slice(5),10),o:(lv.opens||'').slice(5).replace('-','/')}):lv.state==='late'?fmt(t.leaveLate,{m:parseInt(nextM.slice(5),10)}):fmt(t.leaveNone,{m:parseInt(nextM.slice(5),10)})}</p>
      {lvCur.length>0&&leaveBlock(curM,lvCur,true)}
      {leaveBlock(nextM,lvMine,false)}
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
    {ok(ps)&&ps.data.has&&(()=>{const P=ps.data;const switching=!!(ps.loading&&pm&&P.month!==pm);const shT=P.shift==='late'?(lang==='vi'?'Ca tối':'晚班'):(lang==='vi'?'Ca sáng':'早班');
      const Y=py||parseInt(String(P.month).slice(0,4),10);const ym=(mo)=>Y+'-'+p2(mo);
      const smap={};(P.series||[]).forEach(x=>{smap[x.m]=x.p;});
      const inRange=(m)=>m>=P.earliest&&m<=P.latest;
      const vals=[];for(let mo=1;mo<=12;mo++){const v=smap[ym(mo)];if(v!==undefined)vals.push(v);}
      const mx=Math.max(P.std||0,...vals,1);
      return(<Card className="space-y-2"><SecHead icon="🏅" title={t.pts} t={t}/>
        <div className="flex items-center justify-center gap-4"><button onClick={()=>setPy(Y-1)} className="w-8 h-8 rounded-lg border border-gray-600 text-gray-300">‹</button><span className="text-sm font-bold text-white">{Y}{lang==='vi'?'':' 年'}</span><button onClick={()=>setPy(Y+1)} className="w-8 h-8 rounded-lg border border-gray-600 text-gray-300">›</button></div>
        <div className="grid grid-cols-6 gap-1.5">{Array.from({length:12}).map((_,i)=>{const mo=i+1,m=ym(mo),v=smap[m],sel=m===(pm||P.month),ok1=v!==undefined&&P.std>0&&v>=P.std,bad=v!==undefined&&P.std>0&&v<P.std,can=inRange(m);
          return(<button key={m} disabled={!can} onClick={()=>{setPm(m);setPallV(true);}} className={'rounded-lg border py-1 text-center '+(sel?'bg-violet-600 border-violet-600 text-white':can?(ok1?'border-emerald-800 text-gray-200':'border-gray-700 text-gray-200'):'border-gray-800 text-gray-600 opacity-40')}>
            <span className="block text-[13px]">{mo}{lang==='vi'?'':'月'}</span><span className={'block text-[10px] '+(sel?'text-violet-100':bad?'text-red-400':ok1?'text-emerald-400':'text-gray-500')}>{v===undefined?'—':v}</span></button>);})}</div>
        {switching&&<div className="flex items-center justify-center gap-2 text-violet-300 text-sm py-1"><C.Spinner size={18}/>{lang==='vi'?'Đang tải…':'讀取 '+parseInt(String(pm).slice(5),10)+' 月資料中…'}</div>}
        <div className={'border-t border-gray-800 pt-2 flex items-end gap-3 '+(switching?'opacity-40':'')}><span className="text-4xl font-bold text-white">{P.points===null?'—':P.points}</span><span className="text-sm text-gray-400 pb-1">{fmt(t.ptsMon,{m:parseInt(String(P.month).slice(5),10)})}・{t.ptsPt}</span>
          <span className="flex-1"></span>
          {P.points===null?null:P.newbie?<Pill cls="bg-gray-600">{t.ptsNew}</Pill>:P.met===null?null:<Pill cls={P.met?'bg-emerald-600':'bg-red-600'}>{P.met?t.ptsMet:t.ptsNot}</Pill>}</div>
        {P.std>0&&<p className="text-xs text-gray-400">{fmt(t.ptsStd,{n:P.std,s:shT})}{P.rank>0?'　'+fmt(t.ptsRank,{s:shT,r:P.rank,t:P.total}):''}</p>}
        {P.top&&(P.top.early.length>0||P.top.late.length>0)&&<div className="border-t border-gray-800 pt-2 space-y-1.5"><p className="text-xs text-gray-400">{fmt(t.ptsTop,{m:parseInt(String(P.month).slice(5),10)})}</p>
          {['early','late'].map(sh=>P.top[sh].length>0&&(<div key={sh} className="flex items-start gap-2"><span className="shrink-0 text-xs text-gray-400 w-10 pt-0.5">{sh==='late'?(lang==='vi'?'Ca tối':'晚班'):(lang==='vi'?'Ca sáng':'早班')}</span>
            <div className="flex flex-wrap gap-1.5">{P.top[sh].map(x=>(<span key={sh+x.c} className={'text-xs rounded-lg px-2 py-1 border '+(x.me?'border-violet-400 text-violet-200 font-bold':'border-gray-700 text-gray-300')}>{x.r}.{lang==='vi'?fmt(t.ptsNo,{n:x.c}):x.c+'號'} {x.p}{t.ptsPt==='điểm'?'':'點'}</span>))}</div></div>))}</div>}
        {vals.length>0&&<div className="border-t border-gray-800 pt-2"><p className="text-[11px] text-gray-500">{fmt(t.ptsBar,{s:P.std})}</p>
          <div className="relative flex items-end gap-1.5 border-b border-gray-700 mt-4" style={{height:84}}>
            {P.std>0&&<div className="absolute left-0 right-0" style={{bottom:Math.round(P.std/mx*84)+'px',borderTop:'1px dashed #f59e0b'}}><span className="absolute right-0 text-[9px] text-amber-400" style={{top:-13}}>{P.std}</span></div>}
            {Array.from({length:12}).map((_,i)=>{const m=ym(i+1),v=smap[m];return(<div key={m} className="flex-1 relative" style={{height:v===undefined?0:Math.max(2,Math.round(v/mx*84)),background:v===undefined?'transparent':(P.std>0&&v<P.std?'#ef4444':'#10b981'),borderRadius:'4px 4px 0 0',outline:m===P.month&&v!==undefined?'2px solid #a78bfa':'none'}}>{v!==undefined&&<span className="absolute left-0 right-0 text-center text-[9px] text-gray-300" style={{top:-13}}>{v}</span>}</div>);})}</div>
          <div className="flex gap-1.5 mt-0.5">{Array.from({length:12}).map((_,i)=>(<span key={i} className="flex-1 text-center text-[9px] text-gray-500">{i+1}</span>))}</div></div>}
        {window.S2Core.PtsAll&&<div><button onClick={()=>setPallV(!pallV)} className="w-full rounded-xl border border-gray-600 text-gray-200 py-2 text-sm">{pallV?'收起全店名單':'📋 查看 '+parseInt(String(P.month).slice(5),10)+' 月全店勞點'}</button>{pallV&&<window.S2Core.PtsAll month={P.month}/>}</div>}
      </Card>);})()}
  </Box>);
}
function My2Routes(){return(<NeedUser render={(me)=><My2Page me={me}/>}/>);}
window.My2Routes=My2Routes;
})();
