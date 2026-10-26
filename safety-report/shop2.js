/* shop2.js — 價目表 / 早鳥夜貓 頁面(v1.0-001)
   由 safety-report.html 載入,網址參數 sp:
     ?sp=price&st=longshan   價目表        ?sp=early&st=longshan   早鳥夜貓專案
   st=店代號(longshan/dongmen/guting/gongguan),決定館名、顏色、電話、地圖;沒帶 st 用龍山寺店。
   內容預設內建(四店目前相同);也可放 shopinfo.json(同資料夾)覆蓋 {price:{sections:[...]},early:{...}},改價格不用改程式。
   給 Rich Menu「價目表」「早鳥夜貓」按鈕用,公開資訊,不需要權限。 */
(function(){
const{useState,useEffect}=React;
const STORES={
  longshan:{name:'龍山寺店',bm:'雲心閣',bs:'養生會館',tel:'0223380193',telShow:'02-2338-0193',addr:'台北市西園路一段218號',note:'龍山寺捷運站1號出口對面',map:'https://maps.app.goo.gl/mco4AX52NrL7HaP9A?g_st=ic',c0:'#b6b2e6',c1:'#6b4ca0'},
  dongmen:{name:'東門店',bm:'映禪',bs:'養生館',tel:'0233226176',telShow:'02-3322-6176',addr:'106臺北市大安區信義路二段176號',note:'東門捷運站5號出口',map:'https://maps.app.goo.gl/pVDzhGJsT2UAJjrH6?g_st=ic',c0:'#bee8e4',c1:'#2e868c'},
  guting:{name:'古亭店',bm:'禪云心',bs:'養生會館',tel:'0223567017',telShow:'02-2356-7017',addr:'100臺北市中正區和平西路一段19號',note:'古亭捷運站7號出口走到和平西路右轉',map:'https://maps.app.goo.gl/8HkE2QFALZDY2vfj8?g_st=ic',c0:'#f5d7b9',c1:'#b06a34'},
  gongguan:{name:'公館店',bm:'雲禪居',bs:'養生會館',tel:'0223620393',telShow:'02-2362-0393',addr:'100臺北市中正區汀州路三段199號',note:'公館捷運站4號出口往52巷走',map:'https://maps.app.goo.gl/J6UjtaBCbUdpPyCm7?g_st=ic',c0:'#cde8c3',c1:'#3c9650'}
};
// 四店目前相同的內容。item:{n 名稱,en 英文,min 分鐘(可省),sale 特價,orig 原價(可省),note 備註(可省),best 主打(可省)}
const DEFAULT_INFO={
  price:{sections:[
    {title:'最划算套餐',items:[
      {n:'腳底+身體按摩（含轉場時間）',en:'Foot massage and body massage',min:120,sale:1299,orig:1600,note:'含精油泡腳及肩頸按摩',best:true},
      {n:'腳底+身體按摩（含轉場時間）',en:'Foot massage and body massage',min:70,sale:850,orig:1100,note:'含精油泡腳及肩頸按摩'},
      {n:'腳底按摩',en:'Foot massage',min:40,sale:500,orig:600,note:'含精油泡腳及肩頸按摩'},
      {n:'腳底按摩',en:'Foot massage',min:70,sale:850,orig:1100,note:'含精油泡腳及肩頸按摩'},
      {n:'身體按摩',en:'Body massage',min:35,sale:500,orig:600},
      {n:'身體按摩',en:'Body massage',min:70,sale:850,orig:1100},
      {n:'修指甲／修腳皮（每項）',en:'Nail cosmetology / Foot cuticle scrape',sale:500}]},
    {title:'加節表',items:[
      {n:'腳底+身體按摩（含轉場時間）',en:'Foot massage and body massage',min:120,sale:1299,orig:1600,best:true},
      {n:'腳底按摩',en:'Foot massage',min:110,sale:1299,orig:1600},
      {n:'身體按摩',en:'Body massage',min:110,sale:1299,orig:1600},
      {n:'加節',en:'massage',min:30,sale:500},
      {n:'加節',en:'massage',min:60,sale:850}]}
  ]},
  early:{title:'早鳥夜貓專案',when:'平日凌晨 12:00 ~ 中午 12:00',item:'腳底+身體按摩 120 分鐘',price:1099,
    notes:['此活動以實際進場時間為主','本活動不與其他活動合併使用','腳底與身體限定同一位師傅','{brand}保留活動修改、暫停及終止之權利']}
};
const money=(n)=>'NT$ '+Number(n).toLocaleString('en-US');
function Header({S,title,sub}){
  return(<div style={{background:'linear-gradient(90deg,'+S.c0+','+S.c1+')'}} className="rounded-2xl px-5 py-6 text-center">
    <p className="text-white text-3xl font-extrabold tracking-wide" style={{textShadow:'0 2px 6px rgba(0,0,0,.25)'}}>{S.bm}<span className="text-base font-bold ml-2">{S.bs}</span></p>
    <p className="text-white text-xl font-bold mt-2">{title}</p>
    {sub&&<p className="text-white/90 text-sm mt-1">{sub}</p>}</div>);
}
function Contact({S}){
  return(<div className="rounded-2xl bg-gray-900 border border-gray-800 p-4 space-y-3">
    <p className="text-white font-bold">{S.name}　預約專線 {S.telShow}</p>
    <p className="text-sm text-gray-400">{S.addr}（{S.note}）</p>
    <div className="grid grid-cols-2 gap-3">
      <a href={'tel:'+S.tel} className="rounded-xl py-3 text-center font-bold text-white" style={{background:S.c1}}>📞 電話預約</a>
      <a href={S.map} className="rounded-xl py-3 text-center font-bold text-white bg-gray-700">📍 地圖導航</a></div></div>);
}
function Item({it,S}){
  return(<div className="py-3 border-t border-gray-800 first:border-t-0">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-white font-bold">{it.n}{it.min?<span className="ml-1">{it.min} 分鐘</span>:null}{it.best&&<span className="ml-2 text-xs rounded-full px-2 py-0.5 text-white align-middle" style={{background:S.c1}}>優惠</span>}</p>
        {it.en&&<p className="text-xs text-gray-500">{it.en}</p>}
        {it.note&&<p className="text-xs text-gray-400 mt-1">{it.note}</p>}</div>
      <div className="text-right shrink-0">
        <p className="font-extrabold text-lg" style={{color:S.c1===('#b06a34')?'#e0894a':'#f0b36a'}}>{it.orig?'特價 ':''}{money(it.sale)}</p>
        {it.orig&&<p className="text-xs text-gray-500 line-through">原價 {money(it.orig)}</p>}</div></div></div>);
}
function PricePage({S,info}){
  return(<div className="space-y-4">
    <Header S={S} title="價目表" sub="Price list"/>
    {info.price.sections.map((sec,i)=>(<div key={i} className="rounded-2xl bg-gray-900 border border-gray-800 p-4">
      <p className="inline-block rounded-full px-4 py-1 text-white font-bold mb-2" style={{background:S.c1}}>{sec.title}</p>
      {sec.items.map((it,j)=><Item key={j} it={it} S={S}/>)}</div>))}
    <a href={'?sp=early&st='+S.key} className="block rounded-2xl py-3 text-center font-bold text-white bg-gray-800 border border-gray-700">🌅 早鳥夜貓專案</a>
    <Contact S={S}/>
  </div>);
}
function EarlyPage({S,info}){
  const e=info.early;
  return(<div className="space-y-4">
    <Header S={S} title={'🐦 '+e.title+' 🐱'} sub={e.when}/>
    <div className="rounded-2xl p-6 text-center" style={{background:'linear-gradient(135deg,#2b4a7c,#5b2a86)'}}>
      <p className="text-white text-lg font-bold">{e.item}</p>
      <p className="text-5xl font-extrabold mt-3" style={{color:'#ffd35c',textShadow:'0 2px 8px rgba(0,0,0,.4)'}}>{Number(e.price).toLocaleString('en-US')}<span className="text-2xl ml-1">NT</span></p>
      <p className="text-white/80 text-sm mt-2">{e.when}</p></div>
    <div className="rounded-2xl bg-gray-900 border border-gray-800 p-4 space-y-1">
      <p className="text-white font-bold mb-1">※ 活動注意事項</p>
      {e.notes.map((n,i)=>(<p key={i} className="text-sm text-gray-300">◎ {String(n).replace('{brand}',S.bm)}</p>))}</div>
    <a href={'?sp=price&st='+S.key} className="block rounded-2xl py-3 text-center font-bold text-white bg-gray-800 border border-gray-700">💰 價目表</a>
    <Contact S={S}/>
  </div>);
}
function ShopRoutes(){
  const q=new URLSearchParams(location.search);
  const S=Object.assign({key:STORES[q.get('st')]?q.get('st'):'longshan'},STORES[q.get('st')]||STORES.longshan);
  const[info,setInfo]=useState(DEFAULT_INFO);
  useEffect(()=>{let dead=false;
    if(typeof fetch!=='function')return;
    fetch('./shopinfo.json?t='+Date.now()).then(r=>r.ok?r.json():null).then(j=>{if(!dead&&j&&(j.price||j.early))setInfo({price:j.price||DEFAULT_INFO.price,early:j.early||DEFAULT_INFO.early});}).catch(()=>{});
    return()=>{dead=true;};},[]);
  const which=q.get('sp')==='early'?'early':'price';
  return(<div className="min-h-screen px-4 py-5"><div className="max-w-md mx-auto">
    {which==='early'?<EarlyPage S={S} info={info}/>:<PricePage S={S} info={info}/>}</div></div>);
}
window.ShopRoutes=ShopRoutes;
})();
