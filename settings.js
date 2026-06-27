// settings.js — 設定頁相關元件(從 index.html 抽離,降低 index 體積)
// 注意:此檔為 type="text/babel",獨立作用域,需自行宣告 hooks 與 bridge
const{useState,useEffect,useCallback,useMemo}=React;
const{loadStats,T,getGHConfig,collectAllSlips,tagStats,searchSlips,bookTitleName,BOOK_TITLES,slipSvcLabel}=window.MP;

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

// 掛到全域供 index.html 的 App 取用
window.__V=Object.assign(window.__V||{},{ChartPage});
