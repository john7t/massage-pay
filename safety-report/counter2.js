/* counter2.js — 主櫃「老師號碼牌區」(v1.0-005,P1~P3+候位)
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

// ── 位置與項目(R1、R8) ──
const FEET=['1','2','3','4','5','6','7','8','9','10','11','12'];
const BEDS=['21','22','23','31','32','33','34','35','36','37','38','39','310','311'];
const CAM=['7','10','37','311']; // 監視器位置(R1.5)
const isFoot=p=>FEET.indexOf(p)>=0;
const MIN=60000;
// 項目:segs=依序的各段 [種類(b身/f腳/o油壓),分鐘];轉場在第一段結束。1 支=35~40 分,套餐含轉場(R2、R8.2~R8.4)
const ITEMS={
  b1:[['b',35]],f1:[['f',40]],b2:[['b',70]],f2:[['f',70]],b3:[['b',110]],f3:[['f',110]],bo2:[['o',70]],bo3:[['o',110]],
  bf2:[['b',35],['f',35]],fb2:[['f',35],['b',35]],bf3:[['b',70],['f',50]],fb3:[['f',40],['b',80]],
  bof3:[['o',70],['f',50]],fbo3:[['f',40],['o',80]]};
const ITEM_GROUPS=[['單項',['b1','f1','b2','f2','b3','f3']],['套餐(先做的在前)',['bf2','fb2','bf3','fb3']],['油壓(70 分以上,女老師)',['bo2','bo3','bof3','fbo3']]];
function itemCalc(code,extra,start){
  const segs=ITEMS[code];if(!segs)return null;
  const base=segs.reduce((a,x)=>a+x[1],0);const total=base+30*(extra||0);
  return{segs:segs,total:total,end:start+total*MIN,transfer:segs.length>1?start+segs[0][1]*MIN:0,oil:code.indexOf('o')>=0,
    first:segs[0][0]==='f'?'foot':'bed',second:segs.length>1?(segs[1][0]==='f'?'foot':'bed'):'',label:code+(extra?'+'+extra:'')};
}
// 口訣(R2.5~R2.8):依項目與開始時間重算轉場時間
function callCode(p,c){
  const t=p.redTransfer;if(!t)return null;const st=p.redStart;
  if(c==='11')return{transfer:st+60*MIN};if(c==='40')return{transfer:st+40*MIN};if(c==='80')return{transfer:st+80*MIN};
  if(c==='滿包')return{transfer:t+5*MIN};return null;
}

// ══════════ 推薦引擎(P3,R3、R4、R5.7~R5.8、R9;純函式,可獨立測試) ══════════
// 位置偏好順序(只做同分時的排序,可依現場修正):油壓優先 37~311,次選 33、34,盡量不排 22(R3.2、R3.3);其餘從監視器 37 起(R3.4)
const PREF_OIL=['37','38','39','310','311','33','34','31','32','35','36','21','23','22'];
const PREF_BED=['37','36','35','34','33','32','31','38','39','310','311','21','23','22'];
const PREF_FOOT=['7','10','8','9','11','12','1','2','3','4','5','6'];
const GROUPS=[['1','2','3','4','5','6'],['7'],['8','9'],['10','11','12'],['21','22','23'],['31','32','33'],['34','35','36'],['37','38','39','310','311']];
const adj=(a,b)=>GROUPS.some(g=>{const i=g.indexOf(a),j=g.indexOf(b);return i>=0&&j>=0&&Math.abs(i-j)===1;});
const grid10=t=>Math.ceil((t+8*3600e3)/600000)*600000-8*3600e3;
const baseCode=(it)=>{ // 依種類與時間決定代碼(套餐先後另外決定);回傳 null=不支援
  if(it.kind==='foot')return ['f1','f2','f3'][it.base-1]||null;
  if(it.kind==='body')return it.oil?(it.base===2?'bo2':it.base===3?'bo3':null):['b1','b2','b3'][it.base-1]||null;
  if(it.kind==='pkg')return it.base===3?'pkg3':it.base===2&&!it.oil?'pkg2':null;
  return null;};
function pkgCodes(it){const o=it.oil?'o':'';return it.base===3?{foot:'fb'+o+'3',body:'b'+o+'f3'}:{foot:'fb2',body:'bf2'};}
// 各位置「空出來的時間」:空位=現在;使用中=轉場時間(有預定轉場)或結束時間;預定轉入=結束時間
function posRelease(D,now){
  const M=seatMap(D);const rel={};
  FEET.concat(BEDS).forEach(x=>{
    const m=M[x];if(!m){rel[x]=now;return;}
    const p=m.p;const end=Math.max(p.redEnd||now+60*MIN,now);
    if(m.kind==='rsv')rel[x]=end;
    else rel[x]=p.redTransfer>now?p.redTransfer:(p.redTransfer>0?now:end);
  });
  return rel;
}
// 老師池:白牌=現在可派(依白牌順序);紅牌=預計結束後可派;綠牌休息中不推薦
function teacherPool(D,now){
  const pool=[];D.white.forEach((p,i)=>{if(p.state==='white')pool.push({code:p.code,gender:p.gender,nation:p.nation,ready:now,order:i,white:true});});
  D.red.forEach((p,i)=>pool.push({code:p.code,gender:p.gender,nation:p.nation,ready:Math.max(p.redEnd||now+60*MIN,now),order:1000+i,white:false}));
  return pool;
}
const tOk=(t,f)=>(!f.oil||t.gender==='F')&&(!f.gender||t.gender===f.gender)&&(!f.nation||t.nation===f.nation);
// 挑 n 位老師:先看誰最快可派(同時間依白牌順序)
function pickTeachers(pool,f,n,usedT){
  const c=pool.filter(t=>!usedT[t.code]&&tOk(t,f)).sort((a,b)=>a.ready-b.ready||a.order-b.order);
  return c.length>=n?c.slice(0,n):null;
}
// 挑 n 個同類型位置:先取最快空出的 n 個;同樣快時,優先緊靠在一起、保留其他緊靠位置(R3.5)、再依偏好順序
function pickPositions(type,n,rel,usedP,pref,minT){
  const all=(type==='foot'?FEET:BEDS).filter(x=>!usedP[x]);
  if(all.length<n)return null;
  const sorted=all.slice().sort((a,b)=>Math.max(rel[a],minT)-Math.max(rel[b],minT));
  const Tn=Math.max(Math.max(rel[sorted[n-1]],minT),minT);
  const cand=all.filter(x=>Math.max(rel[x],minT)<=Tn);
  const combos=[];const rec=(st,cur)=>{if(cur.length===n){combos.push(cur.slice());return;}for(let i=st;i<cand.length;i++){cur.push(cand[i]);rec(i+1,cur);cur.pop();}};rec(0,[]);
  let best=null,bs=Infinity;
  combos.forEach(cb=>{
    let together=0;for(let i=1;i<cb.length;i++)if(!adj(cb[i-1],cb[i])&&!adj(cb[i],cb[i-1]))together++;
    const rest=cand.filter(x=>cb.indexOf(x)<0);let pairs=0;for(let i=0;i<rest.length;i++)for(let j=i+1;j<rest.length;j++)if(adj(rest[i],rest[j]))pairs++;
    const pi=cb.reduce((a,x)=>a+(pref.indexOf(x)<0?20:pref.indexOf(x)),0);
    const sc=together*100000+(50-pairs)*1000+pi;if(sc<bs){bs=sc;best=cb;}});
  return best;
}
// 規劃一個項目(含人數):回傳 {code,start,end,transfer,people:[...],notes,rules,wait}
function planItem(D,now,pool,rel0,used,it,order,minStart,split){
  const code0=baseCode(it);if(!code0)return {err:it.oil&&it.kind==='pkg'&&it.base===2?'油壓套餐要 120 分(bof3/fbo3)':it.oil&&it.kind==='body'&&it.base===1?'油壓要 70 分鐘以上':'不支援的項目'};
  let code=code0;if(code0==='pkg3'||code0==='pkg2'){const pc=pkgCodes(it);code=order==='body'?pc.body:pc.foot;}
  const extra=it.extra||0;const calc=itemCalc(code,extra,0);
  const f={oil:it.oil||code.indexOf('o')>=0,gender:it.gender||'',nation:it.nation||''};
  const rules=['R5.7'];const notes=[];
  const rel=Object.assign({},rel0);const usedT=Object.assign({},used.t),usedP=Object.assign({},used.p);
  // 拆單(R2.10、R9.9):套餐含油壓且白牌沒有合適女老師時,先由白牌老師做腳 45 分,轉場時再換女老師做身體 75 分
  let segs=calc.segs.map(x=>x.slice());
  const whiteElig=pool.some(t=>t.white&&!usedT[t.code]&&tOk(t,f));
  const isSplit=!!split&&calc.segs.length===2&&calc.segs[0][0]==='f'&&f.oil&&!whiteElig;
  if(isSplit){segs=[['f',45],['o',75+(code.slice(-1)==='2'?-5:0)]];rules.push('R2.10','R9.9');}
  const f1=isSplit?{oil:false,gender:'',nation:it.nation||''}:f;
  const need=calc.first;
  const tchs=pickTeachers(pool,f1,it.n,usedT);if(!tchs)return {err:'沒有符合條件的老師'};
  const posType=need;
  const pos1=pickPositions(posType,it.n,rel,usedP,posType==='foot'?PREF_FOOT:(f.oil?PREF_OIL:PREF_BED),Math.max(now,minStart||0));
  if(!pos1)return {err:'沒有'+(posType==='foot'?'腳位':'床位')};
  if(f.oil&&posType==='bed'){rules.push('R3.2','R3.3');}else if(posType==='bed')rules.push('R3.4');
  if(it.n>1)rules.push('R3.5');
  let st=Math.max(now,minStart||0,...tchs.map(t=>t.ready),...pos1.map(x=>rel[x]));
  st=st<=now+60000?now:grid10(st);
  const first=segs[0][1]*MIN;const transfer=segs.length>1?st+first:0;
  const total=segs.reduce((a,x)=>a+x[1],0)+30*extra;const end=st+total*MIN;
  pos1.forEach(x=>{usedP[x]=1;rel[x]=transfer||end;});tchs.forEach(t=>{usedT[t.code]=1;});
  let people=pos1.map((x,i)=>({teacher:tchs[i].code,white:tchs[i].white,ready:tchs[i].ready,pos1:x,pos2:'',start:st,transfer:transfer,end:end}));
  // 轉場後位置、(拆單)換女老師
  if(segs.length>1){
    const t2=calc.second;const pos2=pickPositions(t2,it.n,rel,usedP,t2==='foot'?PREF_FOOT:(f.oil?PREF_OIL:PREF_BED),transfer);
    if(pos2){const late=Math.max(...pos2.map(x=>rel[x]))-transfer;pos2.forEach((x,i)=>{people[i].pos2=x;usedP[x]=1;rel[x]=end;});if(late>60000)notes.push('轉場時位置還沒空出,約需再等 '+Math.ceil(late/60000)+' 分');}
    else notes.push('轉場後沒有空'+(t2==='foot'?'腳位':'床位'));
    if(isSplit){
      const tmpUsed=Object.assign({},usedT);const t2s=pickTeachers(pool,f,it.n,tmpUsed);
      if(t2s){t2s.forEach((t,i)=>{people[i].teacher2=t.code;usedT[t.code]=1;const lateT=t.ready-transfer;if(lateT>60000)notes.push('身體由 '+t.code+' 號(女)做,約再等 '+Math.ceil(lateT/60000)+' 分才空出');});}
      else notes.push('沒有可做油壓的女老師');
      notes.unshift('拆單:腳 45 分(白牌老師)→ 轉場後身體 75 分換女老師');
    }
  }
  used.t=usedT;used.p=usedP;
  return {code:isSplit?code+'(拆)':calc.label,realCode:code,extra:extra,start:st,end:end,transfer:transfer,people:people,notes:notes,rules:rules,wait:Math.max(0,Math.round((st-now)/60000)),split:isSplit,n:it.n};
}
// 整個「排客人」:items=[{kind,base,n,extra,oil,gender,nation}];回傳方案列表
function recommend(D,now,items,opt){
  opt=opt||{};const pool=teacherPool(D,now);const rel0=posRelease(D,now);
  const M=seatMap(D);const freeF=FEET.filter(x=>!M[x]).length,freeB=BEDS.filter(x=>!M[x]).length;
  const runOnce=(orders,minStart,split)=>{const used={t:{},p:{}};const res=[];
    (opt.ahead||[]).forEach(g=>{(g||[]).forEach(x=>{planItem(D,now,pool,rel0,used,x,'foot',0,false);});}); // 前面候位的客人先占用老師與位置(R9.16)
    for(let i=0;i<items.length;i++){const r=planItem(D,now,pool,rel0,used,items[i],orders[i],minStart,split);if(r.err)return {err:'項目 '+String.fromCharCode(65+i)+':'+r.err};r.label=String.fromCharCode(65+i);res.push(r);}return {items:res};};
  const isPkg=items.map(it=>it.kind==='pkg');
  // 套餐先後(R2.11、R9.9):預設先腳;腳位很滿、床位很空改先身;兩種都試,取最快(同樣快時依預設)
  const def=isPkg.map(()=>freeF<=1&&freeB>=3?'body':'foot');
  const alt=def.map((d,i)=>isPkg[i]?(d==='foot'?'body':'foot'):d);
  const mk=(orders,minStart,label,extraRules,split)=>{const r=runOnce(orders,minStart||0,split);if(r.err)return {label:label,err:r.err};
    const starts=r.items.map(x=>x.start);return {label:label,items:r.items,start:Math.max(...starts),rules:extraRules||[],orders:orders};};
  const plans=[];
  const need=items.some(it=>it.oil||it.gender==='F');
  const splitTry=items.some(it=>it.kind==='pkg'&&it.oil);
  let a=mk(def,opt.minStart,'最快',[],splitTry);
  if(isPkg.some(Boolean)){const b=mk(alt,opt.minStart,'改先做'+(alt[isPkg.indexOf(true)]==='body'?'身體':'腳'),['R9.9'],splitTry);
    if(!a.err&&!b.err){a.alt=b;}else if(a.err&&!b.err)a=b;}
  if(a.err)return {plans:[],error:a.err};
  plans.push(a);
  if(items.length>1&&!opt.minStart){
    const together=a.start<=now+60000?now:grid10(a.start);
    const t=mk(a.orders,together,'一起開始',['R9.11','R9.12'],splitTry);
    if(!t.err){t.together=true;t.start=together;plans.unshift(t);a.label='各自最快';}
  }
  // 白牌沒有合適女老師:列出紅牌女老師等待時間(R9.6)
  let femaleWait=null;
  if(need&&!pool.some(t=>t.white&&t.gender==='F')){femaleWait=pool.filter(t=>!t.white&&t.gender==='F').sort((x,y)=>x.ready-y.ready).map(t=>({code:t.code,wait:Math.max(0,Math.round((t.ready-now)/60000))}));}
  // 客滿(R9.14):沒有任何空位
  const full=freeF+freeB===0;let soon=null;if(Object.keys(rel0).length){let bp=null;Object.keys(rel0).forEach(x=>{if(!bp||rel0[x]<rel0[bp])bp=x;});soon={pos:bp,at:rel0[bp]};}
  return {plans:plans,femaleWait:femaleWait,full:full,soon:full?soon:null,freeF:freeF,freeB:freeB};
}
window.__cnRec={recommend,itemCalc,posRelease,teacherPool,grid10,planItem};
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


// 位置佔用:{位置:{p:老師牌, kind:'cur'|'rsv'}}
function seatMap(D){const m={};D.red.forEach(p=>{if(p.redPos)m[p.redPos]={p:p,kind:'cur'};if(p.redPos2)m[p.redPos2]={p:p,kind:'rsv'};});return m;}
// 位置格:本身時間狀態(R6.4):接近(≤5 分)黃、超時紅、其餘綠
function Seat({pos,occ,now,onClick}){
  let bg='#16161d',bd='#3b3b4a',bs='solid',body=<span style={{color:'#6b7280',fontSize:12}}>空</span>;
  if(occ){const p=occ.p;
    if(occ.kind==='rsv'){bd='#a78bfa';bs='dashed';body=<React.Fragment><span style={{fontSize:16,fontWeight:800,color:'#c4b5fd'}}>{p.code}</span><span style={{fontSize:9,color:'#c4b5fd'}}>轉入{p.redTransfer?' '+hm(p.redTransfer):''}</span></React.Fragment>;}
    else{const key=p.redTransfer>0?p.redTransfer:p.redEnd;const left=key?(key-now)/60000:999;const over=p.redEnd&&now>p.redEnd;
      bg=over?'#4c1010':left<=5?'#4a3a0c':'#10331f';bd=over?'#ef4444':left<=5?'#facc15':'#22c55e';
      body=<React.Fragment><span style={{fontSize:p.code.length>2?17:20,fontWeight:800,color:p.gender==='F'?'#fda4af':'#fff',lineHeight:1}}>{p.code}</span><span style={{fontSize:10,fontWeight:700,color:'#e5e7eb'}}>{p.redItem}</span>
        {p.redTransfer>0&&<span style={{fontSize:10,color:'#fde68a'}}>轉{hm(p.redTransfer)}</span>}{p.redEnd>0&&<span style={{fontSize:10,color:over?'#fca5a5':'#bbf7d0'}}>{hm(p.redEnd)}到</span>}</React.Fragment>;}}
  return(<button onClick={onClick} style={{flex:'1 1 0',minWidth:0,minHeight:92,borderRadius:8,border:'2px '+bs+' '+bd,background:bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:1,padding:'2px 0'}}>
    <span style={{fontSize:11,color:'#9ca3af',alignSelf:'flex-start',paddingLeft:4}}>{pos}{CAM.indexOf(pos)>=0?' 📷':''}</span>{body}</button>);
}
const Grp=({children})=>(<div style={{display:'flex',gap:3,flex:'1 1 0',minWidth:0,border:'1px solid #2a2a35',borderRadius:10,padding:3}}>{children}</div>);
function SeatMap({D,now,onSeat}){
  const M=seatMap(D);const S=pos=><Seat key={pos} pos={pos} occ={M[pos]} now={now} onClick={()=>onSeat(pos)}/>;
  const free=a=>a.filter(x=>!M[x]).length;
  const Sec=({t,r,children})=>(<Card className="space-y-2"><div className="flex items-center justify-between"><p className="text-sm font-bold text-white">{t}</p><span className="text-xs text-gray-400">{r}</span></div>{children}</Card>);
  return(<React.Fragment>
    <Sec t="1F 腳位 1~6" r={'空 '+free(['1','2','3','4','5','6'])}><div style={{display:'flex',gap:3}}>{['1','2','3','4','5','6'].map(S)}</div></Sec>
    <Sec t="2F 腳位 7~12" r={'空 '+free(['7','8','9','10','11','12'])+'　📷=監視器'}><div style={{display:'flex',gap:8}}><Grp>{S('7')}</Grp><Grp>{['8','9'].map(S)}</Grp><Grp>{['10','11','12'].map(S)}</Grp></div>
      <p className="text-xs text-gray-400">2F 床位</p><div style={{display:'flex',gap:3}}>{['21','22','23'].map(S)}</div></Sec>
    <Sec t="3F 床位" r={'空 '+free(['31','32','33','34','35','36','37','38','39','310','311'])}><div style={{display:'flex',gap:8}}><Grp>{['31','32','33'].map(S)}</Grp><Grp>{['34','35','36'].map(S)}</Grp></div>
      <p className="text-xs text-gray-400">37~311(油壓優先)</p><div style={{display:'flex',gap:3}}>{['37','38','39','310','311'].map(S)}</div></Sec>
  </React.Fragment>);
}
const hmOpt=ms=>hmFull(ms);

// ── 安排客人(R9)與「排客人後的推薦」 ──
const KIND_T={foot:'腳',body:'身',pkg:'套餐'};
const MINS={foot:[[1,40],[2,70],[3,110]],body:[[1,35],[2,70],[3,110]],pkg:[[2,70],[3,120]]};
const newItem=()=>({kind:'pkg',base:3,n:1,extra:0,oil:false,gender:'',nation:''});
function ArrangeSheet({init,onDone,onClose}){
  const[items,setItems]=useState(init&&init.length?init:[newItem()]);
  const set=(i,o)=>setItems(a=>a.map((x,j)=>j===i?Object.assign({},x,o):x));
  const Chip=({on,children,onClick})=>(<button onClick={onClick} className={'rounded-xl border px-3 py-2 text-sm font-bold '+(on?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-200')}>{children}</button>);
  return(<Sheet title="安排客人" onClose={onClose}>
    <p className="text-xs text-gray-400">問客人:要做什麼、做多久、幾個人(套餐先做腳或身體由推薦決定)</p>
    {items.map((it,i)=>(<div key={i} className="rounded-xl border border-gray-700 p-3 space-y-2">
      <div className="flex items-center justify-between"><span className="text-base font-bold text-violet-200">{String.fromCharCode(65+i)}</span>{i>0&&<button onClick={()=>setItems(a=>a.filter((_,j)=>j!==i))} className="text-xs text-red-300">移除</button>}</div>
      <div className="flex gap-2">{['foot','body','pkg'].map(k=><Chip key={k} on={it.kind===k} onClick={()=>set(i,{kind:k,base:MINS[k][MINS[k].length-1][0]>3?3:(MINS[k].some(m=>m[0]===it.base)?it.base:MINS[k][0][0]),oil:k==='foot'?false:it.oil})}>{KIND_T[k]}</Chip>)}</div>
      <div className="flex gap-2 flex-wrap">{MINS[it.kind].map(m=><Chip key={m[0]} on={it.base===m[0]} onClick={()=>set(i,{base:m[0]})}>{m[1]} 分</Chip>)}</div>
      <div className="flex items-center gap-3"><span className="text-sm text-gray-300">人數</span><button onClick={()=>set(i,{n:Math.max(1,it.n-1)})} className="w-9 h-9 rounded-lg border border-gray-600 text-white">−</button><span className="text-white font-bold w-5 text-center">{it.n}</span><button onClick={()=>set(i,{n:Math.min(4,it.n+1)})} className="w-9 h-9 rounded-lg border border-gray-600 text-white">+</button>
        <span className="text-sm text-gray-300 ml-3">加時</span><button onClick={()=>set(i,{extra:Math.max(0,it.extra-1)})} className="w-9 h-9 rounded-lg border border-gray-600 text-white">−</button><span className="text-white font-bold w-5 text-center">{it.extra}</span><button onClick={()=>set(i,{extra:Math.min(6,it.extra+1)})} className="w-9 h-9 rounded-lg border border-gray-600 text-white">+</button></div>
      <div className="flex gap-2 flex-wrap">{it.kind!=='foot'&&<Chip on={it.oil} onClick={()=>set(i,{oil:!it.oil,gender:!it.oil?'F':it.gender,base:(!it.oil&&it.kind==='body'&&it.base===1)?2:it.base})}>油壓</Chip>}
        <Chip on={it.gender==='F'} onClick={()=>set(i,{gender:it.gender==='F'?'':'F'})}>指女</Chip><Chip on={it.gender==='M'} disabled={it.oil} onClick={()=>{if(!it.oil)set(i,{gender:it.gender==='M'?'':'M'});}}>指男</Chip>
        <Chip on={it.nation==='TW'} onClick={()=>set(i,{nation:it.nation==='TW'?'':'TW'})}>指台</Chip><Chip on={it.nation==='VN'} onClick={()=>set(i,{nation:it.nation==='VN'?'':'VN'})}>指越</Chip></div>
    </div>))}
    {items.length<4&&<Bt tone="gray" onClick={()=>setItems(a=>a.concat([newItem()]))}>＋項目(不同項目)</Bt>}
    <Bt onClick={()=>onDone(items)}>排客人 → 看推薦</Bt><Bt tone="gray" onClick={onClose}>取消</Bt></Sheet>);
}
const RuleTag=({r})=>(<span className="text-[10px] rounded px-1.5 py-0.5 bg-indigo-900 text-indigo-200">{r}</span>);

// ── 客滿候位(R9.16):登記手機與姓(名可略),之後的客人排在後面 ──
const itemsText=its=>(its||[]).map((x,i)=>String.fromCharCode(65+i)+' '+(baseCode(x)||'?').replace('pkg3','套餐120').replace('pkg2','套餐70')+(x.extra?'+'+x.extra:'')+(x.n>1?'×'+x.n:'')+(x.oil?' 油壓':'')+(x.gender==='F'?' 指女':x.gender==='M'?' 指男':'')+(x.nation==='TW'?' 指台':x.nation==='VN'?' 指越':'')).join('、');
function WaitSheet({req,onDone,onClose}){
  const[phone,setPhone]=useState('');const[sur,setSur]=useState('');const[giv,setGiv]=useState('');
  const ok=phone.replace(/[^0-9]/g,'').length>=8&&sur.trim();
  return(<Sheet title="登記候位" onClose={onClose}>
    <p className="text-sm text-gray-300">客滿、現場客要等:登記後排在候位順序,之後來的客人排在這一組後面。</p>
    <p className="text-sm text-violet-200">{itemsText(req)}</p>
    <input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" placeholder="手機號碼(必填)" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/>
    <div className="flex gap-2"><input value={sur} onChange={e=>setSur(e.target.value)} maxLength={4} placeholder="姓(必填)" className="w-28 rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/><input value={giv} onChange={e=>setGiv(e.target.value)} maxLength={8} placeholder="名(可略)" className="flex-1 rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/></div>
    <Bt disabled={!ok} onClick={()=>onDone({phone:phone,name:sur.trim()+giv.trim()})}>登記候位</Bt><Bt tone="gray" onClick={onClose}>取消</Bt></Sheet>);
}
// 候位清單:依登記順序;預估開始時間=前面候位的客人先占用後,這組最快何時能開始
function WaitList({D,now,onPick}){
  const W=D.waits||[];if(!W.length)return null;
  const q=Math.floor(now/30000)*30000;
  return(<Card className="space-y-2"><div className="flex items-center justify-between"><p className="text-sm font-bold text-white">⏳ 候位 {W.length} 組</p><span className="text-xs text-gray-400">依登記順序</span></div>
    {W.map((w,i)=>{let est='';try{const R=window.__cnRec.recommend(D,q,w.items,{ahead:W.slice(0,i).map(x=>x.items)});if(R.plans[0]){const st=R.plans[0].start;est=st<=q+60000?'現在可開始':'約 '+hmFull(st)+'('+Math.round((st-q)/60000)+' 分後)';}else est=R.error||'';}catch(_e){}
      return(<button key={w.id} onClick={()=>onPick(w)} className="w-full text-left rounded-xl border border-gray-700 px-3 py-2"><div className="flex items-center gap-2"><span className="text-lg font-bold text-amber-300">{i+1}</span><span className="text-white font-bold">{w.name}</span><span className="text-xs text-gray-400">…{String(w.phone).slice(-3)}</span><span className="flex-1"></span><span className="text-xs text-emerald-300">{est}</span></div><p className="text-xs text-gray-300">{itemsText(w.items)}　登記 {hmFull(w.createdAt)}</p></button>);})}
  </Card>);
}
function WaitEntrySheet({w,idx,act,onSeat,onClose}){
  return(<Sheet title={'候位 '+(idx+1)+'　'+w.name} onClose={onClose}>
    <Info k="手機" v={<a href={'tel:'+w.phone} className="text-violet-300 underline">{w.phone}</a>}/><Info k="項目" v={itemsText(w.items)}/><Info k="登記時間" v={hmFull(w.createdAt)}/>
    <Bt onClick={()=>onSeat(w)}>安排(帶入推薦)</Bt><Bt tone="red" onClick={()=>{if(confirm('取消 '+w.name+' 的候位?'))act({act:'wdone',wid:w.id,status:'cancel'});}}>取消候位</Bt><Bt tone="gray" onClick={onClose}>關閉</Bt></Sheet>);
}
// 推薦區塊(主畫面最上方)
function RecBlock({D,now,req,ahead,onClear,onEdit,adopt,onWait}){
  const[wait,setWait]=useState(0);const[pi,setPi]=useState(0);const[useAlt,setUseAlt]=useState(false);const[together,setTogether]=useState(true);
  const q5=Math.floor(now/30000)*30000; // 每 30 秒重算
  const R=window.__cnRec.recommend(D,q5,req,Object.assign({ahead:ahead||[]},wait?{minStart:q5+wait*MIN}:{}));
  if(R.error)return(<div className="rounded-2xl border border-red-500 bg-red-950 p-3 space-y-2"><p className="text-sm text-red-200 font-bold">排客人後的推薦</p><p className="text-sm text-red-200">{R.error}</p><div className="flex gap-2"><button onClick={onEdit} className="text-xs underline text-red-200">修改</button><button onClick={onClear} className="text-xs underline text-red-200">清除</button></div></div>);
  const plans=R.plans;const base=plans[Math.min(pi,plans.length-1)];const pl=(useAlt&&base.alt)?base.alt:base;
  const M=seatMap(D);const posNow=x=>!M[x];
  const ready=pl.items.every(r=>r.people.every(p=>p.white&&posNow(p.pos1)));
  const doAdopt=()=>{const ops=[];pl.items.forEach(r=>r.people.forEach(p=>{ops.push({act:'red',code:p.teacher,item:r.realCode+(r.extra?'+'+r.extra:''),pos:p.pos1,pos2:(p.pos2&&posNow(p.pos2))?p.pos2:'',start:p.start,end:p.end,transfer:p.transfer});}));adopt(ops);};
  return(<div className="rounded-2xl border border-violet-500 bg-indigo-950 p-3 space-y-3">
    <div className="flex items-center justify-between"><p className="text-base font-bold text-white">排客人後的推薦</p><span className="text-xs text-indigo-200">{req.length} 項・{req.reduce((a,x)=>a+x.n,0)} 位</span></div>
    {(ahead||[]).length>0&&<p className="text-sm font-bold text-amber-300">前面還有 {(ahead||[]).length} 組候位,以下推薦已排在他們後面(R9.16)</p>}
    {R.full&&<p className="text-sm font-bold text-red-300">客滿!最快 {R.soon.pos} 號位 {hmFull(R.soon.at)} 空出</p>}
    {!R.full&&D.white.filter(p=>p.state==='white').length===0&&<p className="text-sm font-bold text-amber-300">老師全在紅牌區(或休息中)</p>}
    {plans.length>1&&<div className="flex gap-2">{plans.map((p,i)=>(<button key={i} onClick={()=>{setPi(i);setUseAlt(false);}} className={'rounded-xl border px-3 py-1.5 text-sm font-bold '+(i===pi?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-200')}>{p.label}</button>))}</div>}
    {pl.items.map(r=>(<div key={r.label} className="rounded-xl bg-black/30 p-2 space-y-1">
      <div className="flex items-center gap-2 flex-wrap"><span className="text-violet-200 font-bold">{r.label}</span><span className="text-white font-bold text-lg" style={{fontFamily:'monospace'}}>{r.code}</span><span className="text-xs text-gray-300">{r.n} 位</span><span className={'text-xs font-bold '+(r.wait>0?'text-amber-300':'text-emerald-300')}>{r.wait>0?'稍候 '+r.wait+' 分':'現在開始'}</span>{r.rules.concat(pl.rules||[]).filter((x,i,a)=>a.indexOf(x)===i).map(x=><RuleTag key={x} r={x}/>)}</div>
      {r.people.map((p,i)=>(<p key={i} className="text-sm text-gray-100">
        <b className={p.white?'text-white':'text-amber-300'}>{p.teacher}</b>{p.teacher2?<span className="text-rose-300"> → {p.teacher2}</span>:null}{p.white?'':'(紅牌)'}　{p.pos1}{p.pos2?' → 轉場 '+p.pos2:''}　{hmFull(p.start)}{p.transfer?'　轉'+hm(p.transfer):''}　{hm(p.end)}到</p>))}
      {r.notes.map((n,i)=><p key={i} className="text-xs text-amber-200">・{n}</p>)}</div>))}
    {R.femaleWait&&R.femaleWait.length>0&&<p className="text-xs text-rose-200">白牌沒有女老師;紅牌女老師:{R.femaleWait.slice(0,4).map(x=>x.code+'(約 '+x.wait+' 分)').join('、')}　可先請客人稍候,或改非指定(R9.6)</p>}
    <div className="flex items-center gap-2 flex-wrap"><span className="text-xs text-indigo-200">稍候</span>{[0,10,20,30].map(m=><button key={m} onClick={()=>setWait(m)} className={'rounded-lg border px-3 py-1 text-sm '+(wait===m?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-200')}>{m?m+' 分':'不等'}</button>)}</div>
    {base.alt&&<button onClick={()=>setUseAlt(!useAlt)} className="text-xs rounded-lg border border-indigo-400 text-indigo-200 px-3 py-1">{useAlt?'← 回到推薦':'換成:'+base.alt.label}</button>}
    {(R.full||pl.items.some(r=>r.wait>0))&&onWait&&<button onClick={onWait} className="w-full rounded-xl border border-amber-400 text-amber-200 py-2 text-sm font-bold">客人要等 → 登記候位(手機+姓)</button>}
    {!ready&&<p className="text-xs text-gray-400">老師或位置尚未空出,空出後再按「採用」(推薦會隨時間更新)</p>}
    <div className="flex gap-2"><button disabled={!ready} onClick={doAdopt} className={'flex-1 rounded-xl py-2.5 font-bold text-white '+(ready?'bg-violet-600':'bg-gray-700 opacity-50')}>採用(開單)</button><button onClick={onEdit} className="rounded-xl border border-gray-500 text-gray-200 px-3">修改</button><button onClick={onClear} className="rounded-xl border border-gray-500 text-gray-200 px-3">清除</button></div>
  </div>);
}

// 紅牌/位置的操作面板:轉場、口訣調節、回牌
function RedPanel({p,D,now,go,onClose}){
  const[pick,setPick]=useState(false);
  const M=seatMap(D);const second=itemCalc(p.redItem.replace(/\+\d+$/,''),0,0);
  const needType=second&&second.second?(isFoot(p.redPos)?'bed':'foot'):'';
  const frees=(needType==='foot'?FEET:needType==='bed'?BEDS:FEET.concat(BEDS)).filter(x=>!M[x]);
  const pending=p.redTransfer>0;
  return(<div className="space-y-2">
    <Info k="項目" v={p.redItem||'—'}/><Info k="位置" v={p.redPos+(p.redPos2?' → '+p.redPos2:'')}/>
    <Info k="開始" v={p.redStart?hmFull(p.redStart):'—'}/>{pending&&<Info k="轉場時間" v={hmFull(p.redTransfer)}/>}<Info k="預計結束" v={p.redEnd?hmFull(p.redEnd):'—'}/>
    {pending&&(pick?(<div className="space-y-2"><p className="text-sm text-gray-300">轉到哪個位置?</p><div className="flex flex-wrap gap-2">{frees.map(x=><button key={x} onClick={()=>go('move',{pos2:x})} className="rounded-lg border border-violet-500 text-violet-200 px-3 py-2">{x}</button>)}</div><Bt tone="gray" onClick={()=>setPick(false)}>返回</Bt></div>)
      :(<React.Fragment>{p.redPos2?<Bt onClick={()=>go('move',{})}>轉場到 {p.redPos2}</Bt>:<Bt onClick={()=>setPick(true)}>轉場(選位置)</Bt>}
        <div><p className="text-xs text-gray-400 mb-1">調節口訣(客滿時)</p><div className="flex gap-2">{['11','滿包','40','80'].map(c=><button key={c} onClick={()=>{const r=callCode(p,c);if(r)go('adjust',r);}} className="flex-1 rounded-lg border border-gray-600 text-gray-100 py-2">{c}</button>)}</div></div></React.Fragment>))}
    {!pick&&<React.Fragment><Bt onClick={()=>go('back',{})}>回牌(排到白牌最後)</Bt><Bt tone="red" onClick={()=>{if(confirm(p.code+' 號下牌?'))go('off',{});}}>下牌</Bt></React.Fragment>}
  </div>);
}
// 開單(手動選位置;系統推薦待 P3,R9)
function OpenSheet({D,now,presetPos,act,onClose}){
  const[item,setItem]=useState('');const[extra,setExtra]=useState(0);const[start,setStart]=useState(now);const[endAdj,setEndAdj]=useState(0);
  const[code,setCode]=useState('');const[pos,setPos]=useState(presetPos||'');const[pos2,setPos2]=useState('');
  const c=item?itemCalc(item,extra,start):null;
  const M=seatMap(D);
  const grid=[];{const t0=Math.ceil((now+8*3600e3)/600000)*600000-8*3600e3;for(let i=0;i<=12;i++)grid.push(t0+i*600000);}
  const end=c?c.end+endAdj*MIN:0;
  const teachers=D.white.filter(p=>p.state==='white'&&(!c||!c.oil||p.gender==='F'));
  const need=c?c.first:'';const freeFor=t=>(t==='foot'?FEET:t==='bed'?BEDS:[]).filter(x=>!M[x]);
  const posOk=pos&&(!need||(need==='foot')===isFoot(pos));
  const ready=c&&code&&posOk&&!M[pos];
  useEffect(()=>{if(c&&code&&!teachers.some(p=>p.code===code))setCode('');},[item]);
  const Chip=({on,children,onClick})=>(<button onClick={onClick} className={'rounded-xl border px-3 py-2 text-base font-bold '+(on?'bg-violet-600 border-violet-600 text-white':'border-gray-600 text-gray-200')}>{children}</button>);
  return(<Sheet title="＋ 開單" onClose={onClose}>
    {ITEM_GROUPS.map(g=>(<div key={g[0]}><p className="text-xs text-gray-400 mb-1">{g[0]}</p><div className="flex flex-wrap gap-2">{g[1].map(k=><Chip key={k} on={item===k} onClick={()=>{setItem(k);setPos2('');if(pos&&((itemCalc(k,0,0).first==='foot')!==isFoot(pos)))setPos('');}}>{k}</Chip>)}</div></div>))}
    <div className="flex items-center gap-3"><span className="text-sm text-gray-300">加時(每 30 分 1 支)</span><button onClick={()=>setExtra(Math.max(0,extra-1))} className="w-9 h-9 rounded-lg border border-gray-600 text-white">−</button><span className="text-white font-bold w-6 text-center">{extra}</span><button onClick={()=>setExtra(Math.min(6,extra+1))} className="w-9 h-9 rounded-lg border border-gray-600 text-white">+</button></div>
    <div className="grid grid-cols-2 gap-2"><div><p className="text-xs text-gray-400 mb-1">開始於</p><select value={start} onChange={e=>setStart(parseInt(e.target.value,10))} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-2 py-2 text-white"><option value={now}>現在 {hmFull(now)}</option>{grid.filter(x=>x>now+60000).map(x=><option key={x} value={x}>{hmOpt(x)}</option>)}</select></div>
      <div><p className="text-xs text-gray-400 mb-1">應結束於</p><select value={endAdj} onChange={e=>setEndAdj(parseInt(e.target.value,10))} disabled={!c} className="w-full rounded-xl bg-gray-800 border border-gray-700 px-2 py-2 text-white">{[-30,-20,-10,0,10,20,30,60].map(m=><option key={m} value={m}>{c?hmFull(c.end+m*MIN)+(m?(m>0?' (+'+m+')':' ('+m+')'):' (自動)'):'—'}</option>)}</select></div></div>
    {c&&c.transfer>0&&<p className="text-sm text-amber-300">轉場 {hmFull(c.transfer)}(第一段 {c.segs[0][1]} 分)・{c.second==='foot'?'再轉腳位':'再轉床位'}</p>}
    <div><p className="text-xs text-gray-400 mb-1">老師(白牌順序{c&&c.oil?',油壓只能女老師':''})</p>
      {teachers.length===0?<p className="text-sm text-red-300">目前沒有可派的白牌老師</p>:<div className="space-y-1">{teachers.map((p,i)=>(<button key={p.code} onClick={()=>setCode(p.code)} className={'w-full text-left rounded-xl border px-3 py-2 flex items-center gap-3 '+(code===p.code?'border-violet-500 bg-violet-950':'border-gray-700')}><span className={'text-xl font-bold '+(p.gender==='F'?'text-rose-300':'text-white')}>{p.code}</span><span className="text-sm text-gray-300">白牌第 {i+1} 位・{p.gender==='F'?'女':'男'}{p.onAt?'・'+hm(p.onAt)+' 上牌':''}</span></button>))}</div>}</div>
    <div><p className="text-xs text-gray-400 mb-1">位置{need?(need==='foot'?'(腳位)':'(床位)'):''}</p><div className="flex flex-wrap gap-2">{(need?freeFor(need):FEET.concat(BEDS).filter(x=>!M[x])).map(x=><Chip key={x} on={pos===x} onClick={()=>{setPos(x);if(pos2===x)setPos2('');}}>{x}</Chip>)}</div></div>
    {c&&c.second&&<div><p className="text-xs text-gray-400 mb-1">轉場後位置(可稍後再選)</p><div className="flex flex-wrap gap-2"><Chip on={!pos2} onClick={()=>setPos2('')}>稍後選</Chip>{freeFor(c.second).filter(x=>x!==pos).map(x=><Chip key={x} on={pos2===x} onClick={()=>setPos2(x)}>{x}</Chip>)}</div></div>}
    <Bt disabled={!ready} onClick={()=>act({act:'red',code:code,item:c.label,pos:pos,pos2:pos2,start:start,end:end,transfer:c.transfer})}>{ready?'確認開單 '+c.label+'　老師 '+code+'　位置 '+pos:'請選項目、老師、位置'}</Bt>
    <Bt tone="gray" onClick={onClose}>取消</Bt></Sheet>);
}

function PlateSheet({p,D,now,act,onClose}){
  const[mode,setMode]=useState('');const[item,setItem]=useState('');const[pos,setPos]=useState('');
  const st=p.state;const off=p.offHour?(p2(p.offHour%24)+':00'):'—';const on=p.onHour?(p2(p.onHour%24)+':00'):'不固定';
  const go=(a,extra)=>act(Object.assign({act:a,code:p.code},extra||{}));
  const title=p.code+' 號'+(p.gender==='F'?' ♀':'')+({white:'　白牌',green:'　綠牌(休息)',gray:'　未上牌',red:'　做事中',off:'　下牌',leave:'　請假'}[st]||'');
  let body=null;
  const onInfo=(<React.Fragment>{p.onBy&&<Info k="上牌操作人" v={p.onBy}/>}{p.onNote&&<p className="text-sm text-amber-300">⚠ {p.onNote}</p>}</React.Fragment>);
  if(st==='white')body=mode==='red'?(<div className="space-y-2">
      <input value={item} onChange={e=>setItem(e.target.value)} placeholder="項目(選填,例 bf3)" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/>
      <input value={pos} onChange={e=>setPos(e.target.value)} placeholder="位置(選填,例 8)" className="w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"/>
      <Bt onClick={()=>go('red',{item:item,pos:pos})}>轉紅牌(開始做事)</Bt><Bt tone="gray" onClick={()=>setMode('')}>返回</Bt></div>)
    :(<div className="space-y-2"><Info k="上牌時間" v={p.onAt?hmFull(p.onAt):'—'}/>{onInfo}<Info k="預計下牌時間" v={off}/>
      <Bt onClick={()=>setMode('red')}>派工(轉紅牌)</Bt><Bt tone="green" onClick={()=>go('green')}>翻綠(休息/吃飯)</Bt><Bt tone="red" onClick={()=>{if(confirm(p.code+' 號下牌?'))go('off');}}>下牌</Bt></div>);
  else if(st==='green'){const g=greenInfo(p,now);const segs=(p.greenSegs||[]);
    body=(<div className="space-y-2">{onInfo}
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
        <Bt onClick={()=>{const early=Math.round((p.due-now)/60000);if(early>40&&!confirm(p.code+' 號應到 '+hmFull(p.due)+',現在比應到時間早 '+early+' 分鐘。\n確定要上牌嗎?(會記錄「提前上牌」與操作人)'))return;go('on');}}>上牌(已到場)</Bt><Bt tone="gray" onClick={()=>setMode('late')}>晚到</Bt><Bt tone="red" onClick={()=>{if(confirm(p.code+' 號臨時請假?'))go('leave');}}>臨時請假</Bt></div>);}
  else if(st==='red')body=(<RedPanel p={p} D={D} now={now} go={go} onClose={onClose}/>);
  else if(st==='off')body=(<div className="space-y-2"><Info k="上牌時間" v={on}/><Info k="預計下牌時間" v={off}/>
      <Bt onClick={()=>go('on')}>上牌</Bt><Bt tone="red" onClick={()=>{if(confirm(p.code+' 號臨時請假?'))go('leave');}}>請假</Bt></div>);
  else if(st==='leave')body=(<div className="space-y-2"><Info k="類別" v={p.leaveKind==='temp'?'臨時請假':'預排休假'}/>
      {p.leaveKind==='temp'&&<Bt tone="gray" onClick={()=>go('unleave')}>取消請假</Bt>}<Bt onClick={()=>go('on')}>上牌(今天有來)</Bt></div>);
  return(<Sheet title={title} onClose={onClose}>{body}</Sheet>);
}

// ── 本機暫存與背景上傳 ──
// 操作先寫進本機(立即反映在畫面),每 10 秒(及離開頁面時)用 cnBatch 背景送出,伺服器回最新牌況後,再把還沒送出的操作疊上去顯示。
const QK='cn2:queue:v1';
const lsGet=()=>{try{const a=JSON.parse(localStorage.getItem(QK)||'[]');return Array.isArray(a)?a.filter(o=>o&&o.id&&Date.now()-o.ts<6*3600e3):[];}catch(_e){return [];}};
const lsSet=q=>{try{localStorage.setItem(QK,JSON.stringify(q));}catch(_e){}};
const rid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function cloneData(S){const c=l=>(l||[]).map(x=>Object.assign({},x));return Object.assign({},S,{waits:(S.waits||[]).map(x=>Object.assign({},x)),white:c(S.white),gray:c(S.gray),red:c(S.red),off:c(S.off),leave:c(S.leave)});}
function applyOp(D,o){
  if(o.act==='wadd'){if(!D.waits.some(x=>x.id===o.id)&&o.phone&&o.name)D.waits.push({id:o.id,phone:String(o.phone).replace(/[^0-9+]/g,''),name:o.name,items:o.items||[],createdAt:o.ts});return;}
  if(o.act==='wdone'){D.waits=D.waits.filter(x=>x.id!==o.wid);return;}
  const lists=['white','gray','red','off','leave'];let p=null;
  for(const k of lists){const i=D[k].findIndex(x=>x.code===o.code);if(i>=0){p=D[k][i];D[k].splice(i,1);break;}}
  if(!p)return;
  const st=p.state,ts=o.ts;const back=()=>{D[({white:'white',green:'white',gray:'gray',red:'red',off:'off',leave:'leave'})[p.state]].push(p);};
  const maxSeq=Math.max(0,...D.white.map(x=>x.seq||0));
  const closeG=()=>{const sec=Math.max(0,Math.round((ts-p.greenStart)/1000));p.greenUsed=(p.greenUsed||0)+sec;p.greenSegs=(p.greenSegs||[]).concat([[p.greenStart,ts]]);};
  const inP=st==='white'||st==='red'||st==='green';
  if(o.act==='on'&&!inP){p.state='white';p.seq=Math.max(ts,maxSeq+1);p.onAt=ts;p.onBy=o.by||'';p.onNote=(p.due&&p.due-ts>40*MIN)?'提前'+Math.round((p.due-ts)/MIN)+'分上牌(應到 '+hmFull(p.due)+')':'';delete p.lateTo;delete p.lateKind;delete p.due;}
  else if(o.act==='back'&&st==='red'){p.state='white';p.seq=Math.max(ts,maxSeq+1);p.redPos='';p.redPos2='';p.redTransfer=0;}
  else if(o.act==='back'&&st==='green'){closeG();p.state='white';}
  else if(o.act==='red'&&st==='white'){p.state='red';p.redItem=o.item||'';p.redPos=o.pos||'';p.redPos2=o.pos2||'';p.redStart=(o.start>=ts-2*3600e3&&o.start<=ts+3*3600e3)?o.start:ts;p.redEnd=parseInt(o.end,10)||0;p.redTransfer=parseInt(o.transfer,10)||0;}
  else if(o.act==='move'&&st==='red'){const q=o.pos2||p.redPos2;if(q){p.redPos=q;p.redPos2='';p.redTransfer=0;}}
  else if(o.act==='adjust'&&st==='red'){if(o.transfer!==undefined)p.redTransfer=parseInt(o.transfer,10)||0;if(o.end!==undefined)p.redEnd=parseInt(o.end,10)||0;}
  else if(o.act==='green'&&st==='white'){p.state='green';p.greenStart=ts;}
  else if(o.act==='late'&&st==='gray'){p.lateTo=o.to;p.lateKind=(p.due&&ts>p.due)?'after':'late';}
  else if(o.act==='leave'&&!inP){p.state='leave';p.leaveKind='temp';delete p.lateTo;}
  else if(o.act==='unleave'&&st==='leave'){p.state='off';}
  else if(o.act==='off'&&(inP||st==='gray'||st==='leave')){if(st==='green')closeG();p.state='off';p.redPos='';p.redPos2='';p.redTransfer=0;}
  const k={white:'white',green:'white',gray:'gray',red:'red',off:'off',leave:'leave'}[p.state];D[k].push(p);
}
function applyAll(S,q){
  const D=cloneData(S);q.forEach(o=>applyOp(D,o));
  D.white.sort((a,b)=>(a.seq||0)-(b.seq||0)||(a.onAt||0)-(b.onAt||0));D.red.sort((a,b)=>(a.redStart||0)-(b.redStart||0));
  D.gray.sort((a,b)=>((a.lateTo||a.due)-(b.lateTo||b.due))||(a.due-b.due)||(parseInt(a.code,10)||0)-(parseInt(b.code,10)||0));
  const byCode=(a,b)=>(parseInt(a.code,10)||0)-(parseInt(b.code,10)||0);D.off.sort(byCode);D.leave.sort(byCode);
  return D;
}

// ── 主頁 ──
function CounterPage({who}){
  const[server,setServer]=useState(null);const[queue,setQueue]=useState(()=>lsGet());const[err,setErr]=useState('');const[notes,setNotes]=useState([]);
  const[open,setOpen]=useState(false);const[sel,setSel]=useState(null);const[opening,setOpening]=useState(null);const[arranging,setArranging]=useState(false);const[req,setReq]=useState(null);const[waitSheet,setWaitSheet]=useState(false);const[fromWait,setFromWait]=useState('');const[waitSel,setWaitSel]=useState(null);
  const[skew,setSkew]=useState(0);const[,setTick]=useState(0);const[syncAt,setSyncAt]=useState(0);const[syncing,setSyncing]=useState(false);
  const qR=useRef(queue);const flying=useRef(false);
  const setQ=f=>{const n=typeof f==='function'?f(qR.current):f;qR.current=n;lsSet(n);setQueue(n);};
  const now=Date.now()+skew;
  const sync=async()=>{
    if(flying.current)return;flying.current=true;setSyncing(true);
    const sent=qR.current.slice();
    try{
      const r=await api('cnBatch',{ops:JSON.stringify(sent)},true);
      if(r&&r.ok){
        const ids={};sent.forEach(o=>{ids[o.id]=1;});setQ(q=>q.filter(o=>!ids[o.id]));
        setServer(r);setSkew((r.now||Date.now())-Date.now());setSyncAt(Date.now());setErr('');
        const bad=(r.results||[]).filter(x=>!x.ok);if(bad.length)setNotes(bad.map(x=>(x.code?x.code+' 號:':'')+(x.error||'操作失敗')));
      }else setErr((r&&r.error)||'同步失敗,稍後自動重試');
    }catch(e){setErr('網路不通,操作已存在本機,稍後自動重試');}
    finally{flying.current=false;setSyncing(false);}
  };
  useEffect(()=>{sync();const t=setInterval(()=>{if(!document.hidden)sync();},10000);const t2=setInterval(()=>setTick(x=>x+1),1000);
    const vis=()=>{sync();};document.addEventListener('visibilitychange',vis);window.addEventListener('pagehide',vis);
    return()=>{clearInterval(t);clearInterval(t2);document.removeEventListener('visibilitychange',vis);window.removeEventListener('pagehide',vis);};},[]);
  const act=(o)=>{const op=Object.assign({id:rid(),ts:Date.now()+skew,by:who},o);setQ(q=>q.concat([op]));setSel(null);};
  if(!server&&!err)return(<Loading text="讀取號碼牌…"/>);
  if(!server)return(<Msg text={err+'\n(重新開啟頁面可再試)'}/>);
  const D=applyAll(server,queue);const find=code=>[].concat(D.white,D.gray,D.red,D.off,D.leave).filter(x=>x.code===code)[0]||null;
  const selP=sel?find(sel):null;
  const lateN=D.gray.filter(p=>isLate(p,now)).length;
  const click=p=>()=>setSel(p.code);
  const wtxt=D.window?hm(D.window[0])+'~'+(hm(D.window[1]+1).replace(/^0:00$/,'24:00')):'';
  return(<Box>
    <div className="flex items-center justify-between"><div><p className="text-lg font-bold text-white">🪧 主櫃・{D.store}</p><p className="text-xs text-gray-400">{hmFull(now)}:{p2(tzp(now).s)}　白 {D.white.filter(p=>p.state==='white').length}・綠 {D.white.filter(p=>p.state==='green').length}・灰 {D.gray.length}・紅 {D.red.length}</p></div>
      <div className="flex gap-2"><button onClick={()=>setArranging(true)} className="text-xs text-white bg-emerald-600 rounded-lg px-3 py-1 font-bold">安排客人</button><button onClick={()=>setOpening('')} className="text-xs text-white bg-violet-600 rounded-lg px-3 py-1 font-bold">＋開單</button><button onClick={sync} className="text-xs text-gray-300 border border-gray-600 rounded-lg px-2 py-1">{syncing?<Spinner size={12}/>:'🔄'}</button><button onClick={()=>setOpen(!open)} className="text-xs text-violet-200 border border-violet-500 rounded-lg px-3 py-1">{open?'收合 ▲':'展開 ▼'}</button></div></div>
    <p className="text-[11px] text-gray-500 -mt-2">{queue.length>0?<span className="text-amber-300">⏳ 待上傳 {queue.length} 筆(每 10 秒自動送出)</span>:<span>✓ 已同步{syncAt?' '+hmFull(syncAt)+':'+p2(tzp(syncAt).s):''}</span>}</p>
    {err&&<p className="text-sm text-red-400 text-center">{err}</p>}
    {req&&<RecBlock D={D} now={now} req={req} ahead={(fromWait?D.waits.slice(0,Math.max(0,D.waits.findIndex(x=>x.id===fromWait))):D.waits).map(x=>x.items)} onClear={()=>{setReq(null);setFromWait('');}} onEdit={()=>setArranging(true)} onWait={fromWait?null:()=>setWaitSheet(true)} adopt={ops=>{ops.forEach(o=>act(o));if(fromWait)act({act:'wdone',wid:fromWait,status:'seated'});setReq(null);setFromWait('');}}/>}
    <WaitList D={D} now={now} onPick={w=>setWaitSel(w.id)}/>
    {notes.length>0&&<div className="rounded-xl border border-amber-500 bg-amber-950 text-amber-200 px-3 py-2 text-sm space-y-1"><p className="font-bold">有操作沒有成功(可能別台櫃台已先處理),畫面已更新為最新牌況:</p>{notes.map((n,i)=><p key={i}>・{n}</p>)}<button onClick={()=>setNotes([])} className="text-xs underline">知道了</button></div>}
    {lateN>0&&<div className="rounded-xl border border-red-500 bg-red-950 text-red-300 px-3 py-2 text-sm font-bold">⚠ 未到未電 {lateN} 位:{D.gray.filter(p=>isLate(p,now)).map(p=>p.code).join('、')}</div>}
    {!open?(<React.Fragment>
      <Card className="space-y-2"><div className="flex items-center justify-between"><p className="text-sm font-bold text-white">⚪ 白牌＋灰牌</p><span className="text-xs text-gray-400">白 {D.white.length}・灰 {D.gray.length}</span></div>
        {D.white.length+D.gray.length===0?<p className="text-sm text-gray-500 py-2">目前沒有牌</p>:<Row scroll>{D.white.map(p=><Plate key={p.code} p={p} now={now} small onClick={click(p)}/>)}
          {D.white.length>0&&D.gray.length>0&&<div style={{flex:'0 0 auto',width:1,background:'#3b3b4a',margin:'0 3px'}}/>}{D.gray.map(p=><Plate key={p.code} p={p} now={now} small onClick={click(p)}/>)}</Row>}</Card>
      <Card className="space-y-2"><div className="flex items-center justify-between"><p className="text-sm font-bold text-white">🔴 紅牌</p><span className="text-xs text-gray-400">{D.red.length}</span></div>
        {D.red.length===0?<p className="text-sm text-gray-500 py-1">沒有做事中的老師</p>:<Row scroll>{D.red.map(p=><Plate key={p.code} p={p} now={now} small onClick={click(p)}/>)}</Row>}</Card>
    </React.Fragment>):(<React.Fragment>
      <Zone title="⚪ 白牌(等待派工)" count={D.white.length} hint="依序派工;綠牌=休息中,輪到時跳過">{D.white.length?<Row>{D.white.map(p=><Plate key={p.code} p={p} now={now} onClick={click(p)}/>)}</Row>:<p className="text-sm text-gray-500">沒有白牌</p>}</Zone>
      <Zone title="⬜ 灰牌(未上牌)" count={D.gray.length} hint={'目前顯示上牌時段:'+wtxt+'(依現在時間切換)'}>{D.gray.length?<Row>{D.gray.map(p=><Plate key={p.code} p={p} now={now} onClick={click(p)}/>)}</Row>:<p className="text-sm text-gray-500">這個時段沒有要上牌的老師</p>}</Zone>
      <Zone title="🔴 紅牌(做事中)" count={D.red.length}>{D.red.length?<Row>{D.red.map(p=><Plate key={p.code} p={p} now={now} onClick={click(p)}/>)}</Row>:<p className="text-sm text-gray-500">沒有紅牌</p>}</Zone>
      <Zone title="▫ 下牌" count={D.off.length}>{D.off.length?<Row>{D.off.map(p=><Plate key={p.code} p={p} now={now} onClick={click(p)}/>)}</Row>:<p className="text-sm text-gray-500">沒有</p>}</Zone>
      <Zone title="┄ 請假" count={D.leave.length}>{D.leave.length?<Row>{D.leave.map(p=><Plate key={p.code} p={p} now={now} onClick={click(p)}/>)}</Row>:<p className="text-sm text-gray-500">沒有</p>}</Zone>
    </React.Fragment>)}
    <SeatMap D={D} now={now} onSeat={pos=>{const m=seatMap(D)[pos];if(m)setSel(m.p.code);else setOpening(pos);}}/>
    {selP&&<PlateSheet key={selP.code+selP.state} p={selP} D={D} now={now} act={act} onClose={()=>setSel(null)}/>}
    {waitSheet&&req&&<WaitSheet req={req} onClose={()=>setWaitSheet(false)} onDone={v=>{act({act:'wadd',phone:v.phone,name:v.name,items:req});setWaitSheet(false);setReq(null);}}/>}
    {waitSel&&D.waits.some(x=>x.id===waitSel)&&<WaitEntrySheet w={D.waits.find(x=>x.id===waitSel)} idx={D.waits.findIndex(x=>x.id===waitSel)} act={o=>{act(o);setWaitSel(null);}} onSeat={w=>{setReq(w.items);setFromWait(w.id);setWaitSel(null);}} onClose={()=>setWaitSel(null)}/>}
    {arranging&&<ArrangeSheet init={req} onDone={its=>{setReq(its);setArranging(false);}} onClose={()=>setArranging(false)}/>}
    {opening!==null&&<OpenSheet D={D} now={now} presetPos={opening} act={o=>{act(o);setOpening(null);}} onClose={()=>setOpening(null)}/>}
  </Box>);
}
function Counter2Routes(){return(<NeedUser render={(me)=><CounterPage who={(me.user&&me.user.code)||'櫃台'}/>}/>);}
window.Counter2Routes=Counter2Routes;
})();
