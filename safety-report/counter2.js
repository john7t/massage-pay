/* counter2.js — 主櫃「老師號碼牌區」(v1.0-001,P1)
   由 safety-report.html 載入(在 safety2.js 之後),網址參數 cn2:  ?cn2=1  主櫃現況表(目前只有老師號碼牌區)
   規則見 counter-rules.md(R5.x、R6.6~R6.8);後端 gas-counter2.gs.txt(cnPlates / cnAct)。
   牌:白(等待派工)/綠(休息,可分段,累計每班 1 小時)/灰(未上牌)/紅(做事中)/下牌(實框透明)/請假(虛框)。 */
(function(){
const{useState,useEffect,useRef}=React;
const C=window.S2Core;
if(!C){window.Counter2Routes=()=>React.createElement('div',{className:'p-6 text-center text-red-400'},'載入失敗:缺少 safety2.js');return;}
const{api,Box,Card,Loading,Msg,NeedUser,Spinner}=C;
const p2=n=>String(n).padStart(2,'0');
const tzp=ms=>{const d=new Date(ms+8*3600e3);return{h:d.getUTCHours(),m:d.getUTCMinutes(),s:d.getUTCSeconds()};};
const hm=ms=>{const x=tzp(ms);return x.h+':'+p2(x.m);};
const hmFull=ms=>{const x=tzp(ms);return p2(x.h)+':'+p2(x.m);};
const mmss=sec=>p2(Math.floor(sec/60))+':'+p2(sec%60);
const dur=sec=>Math.round(sec/60)+' 分';
const nextMark=(now,stepMin)=>{const st=stepMin*60000;return Math.floor((now+8*3600e3)/st)*st+st-8*3600e3;}; // 台北時間的下一個整/半點
const LIMIT=3600;
// 翻綠狀態:回傳 {left 剩餘秒, over 是否超時, overAt 到時時間(ms), used 累計秒}
function greenInfo(p,now){
  const cur=p.state==='green'?Math.max(0,Math.round((now-p.greenStart)/1000)):0;
  const used=(p.greenUsed||0)+cur;const left=LIMIT-used;
  return{left:left,over:p.state==='green'&&left<=0,overAt:p.greenStart+((LIMIT-(p.greenUsed||0))*1000),used:used,cur:cur};
}
const isLate=(p,now)=>p.state==='gray'&&p.due<=now&&!(p.lateTo&&p.lateTo>now); // 過上牌時間(或晚到時間)仍未到 → 未到未電(R5.10)

// ── 號碼牌 ──
function Plate({p,now,small,onClick}){
  const st=p.state;let cls,sub=null,subCls='';
  const fem=p.gender==='F';
  const w=small?46:62,h=small?46:76,cs=small?34:38;
  const base={width:w,height:h,minWidth:w,borderRadius:12,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,flex:'0 0 auto',fontWeight:700,border:'2px solid',cursor:'pointer',padding:0};
  const circ={width:cs,height:cs,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:p.code.length>2?(small?15:17):(small?18:19),fontWeight:800,lineHeight:1};
  let st1={...base},c1={...circ};
  if(st==='white'){st1={...st1,background:'#f3f4f6',borderColor:'#fff',color:'#111'};c1={...c1,background:'#d1d5db',border:'2px solid #6b7280',color:fem?'#dc2626':'#111'};}
  else if(st==='green'){const g=greenInfo(p,now);
    st1={...st1,background:'#15803d',borderColor:g.over?'#ef4444':'#4ade80',color:'#fff',boxShadow:g.over?'0 0 0 3px #ef4444':'none'};c1={...c1,background:'#dcfce7',border:'2px solid #14532d',color:'#14532d'};
    if(g.over){sub='翻綠超時'+hm(g.overAt);subCls='#fecaca';}else if(g.left<=60){sub=mmss(g.left);subCls='#fde68a';}else{sub='翻'+hm(p.greenStart);subCls='#dcfce7';}}
  else if(st==='gray'){const late=isLate(p,now);
    st1={...st1,background:'#4b5563',borderColor:'#6b7280',color:'#e5e7eb',boxShadow:late?'0 0 0 2px #fca5a5':'none'};c1={...c1,background:'#374151',border:'2px solid #9ca3af',color:'#e5e7eb'};
    if(late){sub='未到未電';subCls='#f87171';}
    if(p.lateTo&&p.lateTo>now){sub=(p.lateKind==='after'?'未到晚到':'晚到')+hm(p.lateTo);subCls='#fde68a';}
    else if(p.lateTo&&late){sub=(p.lateKind==='after'?'未到晚到':'晚到')+hm(p.lateTo)+' 未到';subCls='#f87171';}}
  else if(st==='red'){st1={...st1,background:'#b91c1c',borderColor:'#ef4444',color:'#fff'};c1={...c1,background:'#fff',border:'2px solid #fecaca',color:fem?'#be123c':'#7f1d1d'};
    sub=(p.redItem||'')+(p.redStart?' '+hm(p.redStart)+(p.redEnd?'→'+hm(p.redEnd):''):'');subCls='#fee2e2';}
  else if(st==='off'){st1={...st1,background:'transparent',borderColor:'#9ca3af',color:'#e5e7eb'};c1={...c1,color:'#e5e7eb',border:'2px solid #6b7280'};}
  else if(st==='leave'){st1={...st1,background:'transparent',borderColor:'#9ca3af',borderStyle:'dashed',color:'#9ca3af'};c1={...c1,color:'#9ca3af',border:'2px dashed #6b7280'};if(!small){sub=p.leaveKind==='temp'?'臨時請假':'請假';subCls='#9ca3af';}}
  if(small)sub=(st==='gray'||st==='green'||st==='red'||st==='leave')?null:sub;
  const subSize=sub&&sub.length>6?9:10;
  return(<button onClick={onClick} style={st1}><span style={c1}>{p.code}</span>{!small&&sub?<span style={{fontSize:subSize,fontWeight:700,lineHeight:1.05,color:subCls,textAlign:'center',maxWidth:w-4}}>{sub}</span>:null}</button>);
}
const Row=({children,scroll})=>(<div style={scroll?{display:'flex',gap:5,overflowX:'auto',paddingBottom:4,WebkitOverflowScrolling:'touch'}:{display:'flex',flexWrap:'wrap',gap:6}}>{children}</div>);
const Zone=({title,count,children,hint})=>(<Card className="space-y-2"><div className="flex items-center justify-between"><p className="text-sm font-bold text-white">{title}</p><span className="text-xs text-gray-400">{count}</span></div>{children}{hint&&<p className="text-[11px] text-gray-500">{hint}</p>}</Card>);

// ── 彈窗 ──
function Sheet({title,onClose,children}){
  return(<div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" style={{background:'rgba(0,0,0,.6)'}} onClick={onClose}>
    <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-gray-900 border border-gray-700 p-4 space-y-3" onClick={e=>e.stopPropagation()} style={{maxHeight:'85vh',overflowY:'auto'}}>
      <div className="flex items-center justify-between"><p className="text-lg font-bold text-white">{title}</p><button onClick={onClose} className="text-gray-400 text-xl px-2">✕</button></div>{children}</div></div>);
}
const Bt=({children,onClick,tone,disabled})=>(<button disabled={disabled} onClick={onClick} className={'w-full rounded-xl py-3 text-base font-bold '+(tone==='red'?'border border-red-500 text-red-400':tone==='gray'?'border border-gray-600 text-gray-200':tone==='green'?'bg-emerald-600 text-white':'bg-violet-600 text-white')+(disabled?' opacity-40':'')}>{children}</button>);
const Info=({k,v})=>(<div className="flex justify-between text-sm"><span className="text-gray-400">{k}</span><span className="text-gray-100">{v}</span></div>);

function PlateSheet({p,now,act,onClose}){
  const[mode,setMode]=useState('');const[item,setItem]=useState('');const[pos,setPos]=useState('');
  const st=p.state;const off=p.offHour?(p2(p.offHour%24)+':00'):'—';const on=p.onHour?(p2(p.onHour%24)+':00'):'不固定';
  const go=(a,extra)=>act(Object.assign({act:a,code:p.code},extra||{}));
  const title=p.code+' 號'+(p.gender==='F'?' ♀':'')+({white:'　白牌',green:'　綠牌(休息)',gray:'　未上牌',red:'　做事中',off:'　下牌',leave:'　請假'}[st]||'');
  let body=null;
  if(st==='white')body=mode==='red'?(<div className="space-y-2">
      <input value={item} onChange={e=>setItem(e.target.value)} placeholder="項目(選填,例 bf3)" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/>
      <input value={pos} onChange={e=>setPos(e.target.value)} placeholder="位置(選填,例 8)" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/>
      <Bt onClick={()=>go('red',{item:item,pos:pos})}>轉紅牌(開始做事)</Bt><Bt tone="gray" onClick={()=>setMode('')}>返回</Bt></div>)
    :(<div className="space-y-2"><Info k="上牌時間" v={p.onAt?hmFull(p.onAt):'—'}/><Info k="預計下牌時間" v={off}/>
      <Bt onClick={()=>setMode('red')}>派工(轉紅牌)</Bt><Bt tone="green" onClick={()=>go('green')}>翻綠(休息/吃飯)</Bt><Bt tone="red" onClick={()=>{if(confirm(p.code+' 號下牌?'))go('off');}}>下牌</Bt></div>);
  else if(st==='green'){const g=greenInfo(p,now);const segs=(p.greenSegs||[]);
    body=(<div className="space-y-2">
      <table className="w-full text-sm"><thead><tr className="text-gray-400 text-xs"><th className="text-left font-normal py-1">段</th><th className="text-left font-normal">起</th><th className="text-left font-normal">迄</th><th className="text-left font-normal">耗時</th></tr></thead><tbody>
        {segs.map((s,i)=>(<tr key={i} className="border-t border-gray-800 text-gray-100"><td className="py-1">{i+1}</td><td>{hmFull(s[0])}</td><td>{hmFull(s[1])}</td><td>{dur(Math.round((s[1]-s[0])/1000))}</td></tr>))}
        <tr className="border-t border-gray-800 text-gray-100"><td className="py-1">{segs.length+1}</td><td>{hmFull(p.greenStart)}</td><td>進行中</td><td>{dur(g.cur)}</td></tr></tbody></table>
      <p className={'text-sm font-bold '+(g.over?'text-red-400':'text-emerald-400')}>累計 {dur(g.used)}／{LIMIT/60} 分　{g.over?'已於 '+hmFull(g.overAt)+' 到時,超時 '+dur(-g.left):'剩 '+dur(g.left)}</p>
      <Bt onClick={()=>go('back')}>回牌(翻回白牌)</Bt><Bt tone="red" onClick={()=>{if(confirm(p.code+' 號下牌?'))go('off');}}>下牌</Bt></div>);}
  else if(st==='gray'){const late=isLate(p,now);const base=Math.max(now,p.due);
    const opts=[['+30 分',base+30*60000],['+1 小時',base+3600e3],['+2 小時',base+7200e3],['下個半點 '+hm(nextMark(now,30)),nextMark(now,30)],['下個整點 '+hm(nextMark(now,60)),nextMark(now,60)]];
    body=mode==='late'?(<div className="space-y-2"><p className="text-sm text-gray-300">晚到到幾點?(預設 +30 分)</p>
        {opts.map((o,i)=>(<Bt key={i} tone={i===0?'':'gray'} onClick={()=>go('late',{to:o[1]})}>{o[0]}　→ {hm(o[1])}</Bt>))}<Bt tone="gray" onClick={()=>setMode('')}>返回</Bt></div>)
      :(<div className="space-y-2"><Info k="上牌時間" v={hmFull(p.due)}/><Info k="預計下牌時間" v={off}/>
        {late&&<p className="text-sm font-bold text-red-400">已過上牌時間,未到未電</p>}
        {p.lateTo&&<p className="text-sm text-amber-300">{p.lateKind==='after'?'未到晚到':'晚到'} {hmFull(p.lateTo)}</p>}
        <Bt onClick={()=>go('on')}>上牌(已到場)</Bt><Bt tone="gray" onClick={()=>setMode('late')}>晚到</Bt><Bt tone="red" onClick={()=>{if(confirm(p.code+' 號臨時請假?'))go('leave');}}>臨時請假</Bt></div>);}
  else if(st==='red')body=(<div className="space-y-2"><Info k="項目" v={p.redItem||'—'}/><Info k="位置" v={p.redPos||'—'}/><Info k="開始→結束" v={(p.redStart?hmFull(p.redStart):'—')+(p.redEnd?' → '+hmFull(p.redEnd):'')}/>
      <Bt onClick={()=>go('back')}>回牌(排到白牌最後)</Bt><Bt tone="red" onClick={()=>{if(confirm(p.code+' 號下牌?'))go('off');}}>下牌</Bt></div>);
  else if(st==='off')body=(<div className="space-y-2"><Info k="上牌時間" v={on}/><Info k="預計下牌時間" v={off}/>
      <Bt onClick={()=>go('on')}>上牌</Bt><Bt tone="red" onClick={()=>{if(confirm(p.code+' 號臨時請假?'))go('leave');}}>請假</Bt></div>);
  else if(st==='leave')body=(<div className="space-y-2"><Info k="類別" v={p.leaveKind==='temp'?'臨時請假':'預排休假'}/>
      {p.leaveKind==='temp'&&<Bt tone="gray" onClick={()=>go('unleave')}>取消請假</Bt>}<Bt onClick={()=>go('on')}>上牌(今天有來)</Bt></div>);
  return(<Sheet title={title} onClose={onClose}>{body}</Sheet>);
}

// ── 主頁 ──
function CounterPage(){
  const[data,setData]=useState(null);const[err,setErr]=useState('');const[busy,setBusy]=useState(false);
  const[open,setOpen]=useState(false);const[sel,setSel]=useState(null);
  const[skew,setSkew]=useState(0);const[tick,setTick]=useState(0);const busyR=useRef(false);
  const now=Date.now()+skew;
  const apply=r=>{setData(r);setSkew((r.now||Date.now())-Date.now());};
  const load=async(bg)=>{
    if(busyR.current)return;
    const r=await api('cnPlates',{},true);
    if(busyR.current)return;
    if(r&&r.ok){apply(r);setErr('');}else if(!bg||!data)setErr((r&&r.error)||'讀取失敗');
  };
  useEffect(()=>{load(false);const t=setInterval(()=>{if(!document.hidden)load(true);},15000);const t2=setInterval(()=>setTick(x=>x+1),1000);
    const vis=()=>{if(!document.hidden)load(true);};document.addEventListener('visibilitychange',vis);
    return()=>{clearInterval(t);clearInterval(t2);document.removeEventListener('visibilitychange',vis);};},[]);
  const act=async(o)=>{
    if(busyR.current)return;busyR.current=true;setBusy(true);setErr('');
    try{const r=await api('cnAct',o);
      if(r&&r.ok){apply(r);setSel(null);}else{setErr((r&&r.error)||'操作失敗');if(r&&r.plates)apply(r.plates);setSel(null);}}
    finally{busyR.current=false;setBusy(false);}
  };
  if(!data&&!err)return(<Loading text="讀取號碼牌…"/>);
  if(!data)return(<Msg text={err}/>);
  const D=data;const find=code=>[].concat(D.white,D.gray,D.red,D.off,D.leave).filter(x=>x.code===code)[0]||null;
  const selP=sel?find(sel):null;
  const lateN=D.gray.filter(p=>isLate(p,now)).length;
  const click=p=>()=>setSel(p.code);
  return(<Box>
    <div className="flex items-center justify-between"><div><p className="text-lg font-bold text-white">🪧 主櫃・{D.store}</p><p className="text-xs text-gray-400">{hmFull(now)}:{p2(tzp(now).s)}　白 {D.white.filter(p=>p.state==='white').length}・綠 {D.white.filter(p=>p.state==='green').length}・灰 {D.gray.length}・紅 {D.red.length}</p></div>
      <div className="flex gap-2"><button onClick={()=>load(false)} className="text-xs text-gray-300 border border-gray-600 rounded-lg px-2 py-1">🔄</button><button onClick={()=>setOpen(!open)} className="text-xs text-violet-200 border border-violet-500 rounded-lg px-3 py-1">{open?'收合 ▲':'展開 ▼'}</button></div></div>
    {err&&<p className="text-sm text-red-400 text-center">{err}</p>}
    {lateN>0&&<div className="rounded-xl border border-red-500 bg-red-950 text-red-300 px-3 py-2 text-sm font-bold">⚠ 未到未電 {lateN} 位:{D.gray.filter(p=>isLate(p,now)).map(p=>p.code).join('、')}</div>}
    {!open?(<React.Fragment>
      <Card className="space-y-2"><div className="flex items-center justify-between"><p className="text-sm font-bold text-white">⚪ 白牌＋灰牌</p><span className="text-xs text-gray-400">白 {D.white.length}・灰 {D.gray.length}</span></div>
        {D.white.length+D.gray.length===0?<p className="text-sm text-gray-500 py-2">目前沒有牌</p>:<Row scroll>{D.white.map(p=><Plate key={p.code} p={p} now={now} small onClick={click(p)}/>)}
          {D.white.length>0&&D.gray.length>0&&<div style={{flex:'0 0 auto',width:1,background:'#3b3b4a',margin:'0 3px'}}/>}{D.gray.map(p=><Plate key={p.code} p={p} now={now} small onClick={click(p)}/>)}</Row>}</Card>
      <Card className="space-y-2"><div className="flex items-center justify-between"><p className="text-sm font-bold text-white">🔴 紅牌</p><span className="text-xs text-gray-400">{D.red.length}</span></div>
        {D.red.length===0?<p className="text-sm text-gray-500 py-1">沒有做事中的老師</p>:<Row scroll>{D.red.map(p=><Plate key={p.code} p={p} now={now} small onClick={click(p)}/>)}</Row>}</Card>
    </React.Fragment>):(<React.Fragment>
      <Zone title="⚪ 白牌(等待派工)" count={D.white.length} hint="依序派工;綠牌=休息中,輪到時跳過">{D.white.length?<Row>{D.white.map(p=><Plate key={p.code} p={p} now={now} onClick={click(p)}/>)}</Row>:<p className="text-sm text-gray-500">沒有白牌</p>}</Zone>
      <Zone title="⬜ 灰牌(未上牌)" count={D.gray.length} hint={'目前顯示上牌時段:'+(D.window?hm(D.window[0])+'~'+(hm(D.window[1]+1).replace(/^0:00$/,'24:00')):'')+'(依現在時間切換)'}>{D.gray.length?<Row>{D.gray.map(p=><Plate key={p.code} p={p} now={now} onClick={click(p)}/>)}</Row>:<p className="text-sm text-gray-500">這個時段沒有要上牌的老師</p>}</Zone>
      <Zone title="🔴 紅牌(做事中)" count={D.red.length}>{D.red.length?<Row>{D.red.map(p=><Plate key={p.code} p={p} now={now} onClick={click(p)}/>)}</Row>:<p className="text-sm text-gray-500">沒有紅牌</p>}</Zone>
      <Zone title="▫ 下牌" count={D.off.length}>{D.off.length?<Row>{D.off.map(p=><Plate key={p.code} p={p} now={now} onClick={click(p)}/>)}</Row>:<p className="text-sm text-gray-500">沒有</p>}</Zone>
      <Zone title="┄ 請假" count={D.leave.length}>{D.leave.length?<Row>{D.leave.map(p=><Plate key={p.code} p={p} now={now} onClick={click(p)}/>)}</Row>:<p className="text-sm text-gray-500">沒有</p>}</Zone>
    </React.Fragment>)}
    {selP&&<PlateSheet key={selP.code+selP.state} p={selP} now={now} act={act} onClose={()=>setSel(null)}/>}
    {busy&&<div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:'rgba(0,0,0,.55)'}}><div className="flex flex-col items-center gap-3 text-violet-200"><Spinner size={40}/><p className="text-sm">處理中…</p></div></div>}
  </Box>);
}
function Counter2Routes(){return(<NeedUser render={()=><CounterPage/>}/>);}
window.Counter2Routes=Counter2Routes;
})();
