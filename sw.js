/* 薪資追蹤 Service Worker (v1)
   目的:讓主程式能離線開啟、並加快開啟速度(函式庫與程式檔存在手機,不用每次重新下載)。
   不處理:POST、GAS(script.google.com)等其他網域的請求,一律直接走網路,不快取。
   策略:
   - 外部函式庫(cdnjs / tailwind / LIFF SDK):快取優先;超過 7 天在背景悄悄更新一次。
   - 本站帶 ?v= 版本號的程式檔(common.js?v=… 等):快取優先(版本號一變網址就變,等於重新抓)。
   - 本站其他檔(index.html、json、圖片…):網路優先,4 秒內沒回應或離線才用快取,確保更新上線後馬上看到。
   改這支檔案的邏輯時,請把 VER 的數字加 1,舊快取會自動清掉。 */
const VER='mp-sw-v1';
const LIBS=/^https:\/\/(cdnjs\.cloudflare\.com|cdn\.tailwindcss\.com|static\.line-scdn\.net)\//;
const LIB_MAX_AGE=7*24*3600e3;
const NET_TIMEOUT=4000;

self.addEventListener('install',()=>{self.skipWaiting();});
self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const ks=await caches.keys();
    await Promise.all(ks.filter(k=>k!==VER).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

async function putStamped(cache,key,res){
  try{
    const buf=await res.clone().arrayBuffer();
    const h=new Headers(res.headers);h.set('x-sw-time',String(Date.now()));
    await cache.put(key,new Response(buf,{status:res.status,statusText:res.statusText,headers:h}));
  }catch(_e){}
}
async function fetchLib(url){ // 用 cors 抓,避免快取到「不透明回應」(會佔用很大的配額);失敗再退回一般請求
  try{const r=await fetch(url,{mode:'cors',credentials:'omit'});if(r&&r.ok)return r;}catch(_e){}
  return null;
}
async function libStrategy(req){
  const cache=await caches.open(VER);
  const hit=await cache.match(req.url);
  if(hit){
    const t=parseInt(hit.headers.get('x-sw-time')||'0',10)||0;
    if(Date.now()-t>LIB_MAX_AGE){fetchLib(req.url).then(r=>{if(r)putStamped(cache,req.url,r);});}
    return hit;
  }
  const r=await fetchLib(req.url);
  if(r){putStamped(cache,req.url,r);return r;}
  return fetch(req); // 抓不到又沒快取:交給瀏覽器原本的流程(離線時會失敗)
}
async function cacheFirst(req){
  const cache=await caches.open(VER);
  const hit=await cache.match(req);
  if(hit)return hit;
  const r=await fetch(req);
  if(r&&r.ok){
    await cache.put(req,r.clone());
    try{ // 同一支檔案的舊版本快取清掉,避免越積越多
      const u=new URL(req.url);const ks=await cache.keys();
      await Promise.all(ks.filter(k=>{const x=new URL(k.url);return x.pathname===u.pathname&&x.search!==u.search;}).map(k=>cache.delete(k)));
    }catch(_e){}
  }
  return r;
}
async function networkFirst(req){
  const cache=await caches.open(VER);
  try{
    const r=await Promise.race([fetch(req),new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),NET_TIMEOUT))]);
    if(r&&r.ok)cache.put(req,r.clone());
    return r;
  }catch(_e){
    const hit=await cache.match(req,{ignoreSearch:false})||await cache.match(req,{ignoreSearch:true});
    if(hit)return hit;
    return fetch(req); // 沒快取:再試一次(沒逾時限制)
  }
}
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  let url;try{url=new URL(req.url);}catch(_e){return;}
  if(LIBS.test(req.url)){e.respondWith(libStrategy(req));return;}
  if(url.origin!==self.location.origin)return; // GAS 等其他網域:不碰
  if(/[?&]v=/.test(url.search)&&/\.(js|css)$/.test(url.pathname)){e.respondWith(cacheFirst(req));return;}
  e.respondWith(networkFirst(req));
});
