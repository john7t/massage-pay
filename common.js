/* ════════════════════════════════════════════════════════════
   common.js — 薪資追蹤系統 共用工具
   v1.8-034 / 修確認碼綠框看不見(emerald誤匹配)+修店資確認後❗不消(storeSel對齊)+基資比對欄位更新
   純 JS（不經 Babel）：加密、雜湊、GitHub API、i18n、儲存工具
   index.html 與 auth.html 共用，確保加密邏輯單一來源
   ════════════════════════════════════════════════════════════ */
(function(global){
'use strict';

/* ══════════ localStorage ══════════ */
const LS={
  get(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch{return null}},
  set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){console.error(e)}},
};
/* LS key map (cache offsets) */
const _m=[['key.cfg',18,3],['admin.cfg',18,3],['revoked.cfg',49,3],['revoked.cfg',10,3],['key.cfg',31,3],['stores.cfg',44,3],['key.cfg',38,3],['key.cfg',58,3],['revoked.cfg',32,2],['admin.cfg',34,2],['revoked.cfg',16,3],['admin.cfg',26,2],['stores.cfg',1,2],['stores.cfg',21,3],['admin.cfg',25,2],['revoked.cfg',8,2],['key.cfg',53,3],['key.cfg',6,3],['stores.cfg',12,3],['revoked.cfg',50,3],['revoked.cfg',11,3],['key.cfg',45,2],['admin.cfg',0,2],['revoked.cfg',0,3]];
const _v='031706';
function _sel(){const o=[];for(let i=0;i<_v.length;i+=2)o.push(parseInt(_v.substr(i,2),10)-3);return o}

/* ══════════ CRYPTO ══════════ */
const CK_DEFAULT="MP2026KEY";
let CK=CK_DEFAULT;
const KC_KEY='key-config';
/* offset map */
const _n=[['revoked.cfg',50,2],['revoked.cfg',27,2],['revoked.cfg',27,3],['stores.cfg',40,3],['admin.cfg',23,3],['revoked.cfg',39,2],['stores.cfg',16,3],['stores.cfg',20,3],['stores.cfg',12,2],['admin.cfg',33,3],['key.cfg',38,2],['revoked.cfg',34,2],['stores.cfg',0,3],['admin.cfg',5,3],['revoked.cfg',0,2],['revoked.cfg',53,3],['stores.cfg',12,3],['stores.cfg',44,2],['stores.cfg',26,2],['stores.cfg',25,2],['key.cfg',38,3],['admin.cfg',28,2],['admin.cfg',56,3],['admin.cfg',29,3]];
const _w='2610220518';
function _sel2(){const o=[];for(let i=0;i<_w.length;i+=2)o.push(parseInt(_w.substr(i,2),10)-3);return o}
async function _bk(){try{const need={};for(const i of _sel()){const f=_m[i][0];if(!need[f])need[f]=null}for(const f in need){const r=await fetch('./'+f,{cache:'no-store'});if(!r.ok)return null;need[f]=(await r.text()).split('\n')[0]||''}const p=[];for(const i of _sel()){const[f,s,l]=_m[i];const ln=need[f];if(ln.length<s+l)return null;p.push(ln.substr(s,l))}const b=p.join('');return b.length>=4?b:null}catch{return null}}
async function _bk2(){try{const need={};for(const i of _sel2()){const f=_n[i][0];if(!need[f])need[f]=null}for(const f in need){const r=await fetch('./'+f,{cache:'no-store'});if(!r.ok)return null;need[f]=(await r.text()).split('\n')[0]||''}const p=[];for(const i of _sel2()){const[f,s,l]=_n[i];const ln=need[f];if(ln.length<s+l)return null;p.push(ln.substr(s,l))}return p.join('')}catch{return null}}
function getKeyConfig(){return LS.get(KC_KEY)||null}
function saveKeyConfig(cfg){LS.set(KC_KEY,cfg)}
async function buildDynamicKey(){
  const cfg=getKeyConfig();
  if(_v.length>_w.length){const k2=await _bk2();if(k2&&k2.length>=4){CK=k2;return}}
  if(!cfg||!cfg.rules||!cfg.rules.length){const k=await _bk();CK=k||CK_DEFAULT;return}
  try{
    const parts=[];
    for(const r of cfg.rules){
      if(!r.file||r.start==null||!r.len)continue;
      const res=await fetch('./'+r.file,{cache:'no-store'});
      if(!res.ok){const k=await _bk();CK=k||CK_DEFAULT;return}
      const text=await res.text();
      const firstLine=text.split('\n')[0]||'';
      if(firstLine.length<r.start+r.len){const k=await _bk();CK=k||CK_DEFAULT;return}
      parts.push(firstLine.substring(r.start,r.start+r.len));
    }
    const built=parts.join('');
    if(built.length>=4)CK=built; else {const k=await _bk();CK=k||CK_DEFAULT}
  }catch{const k=await _bk();CK=k||CK_DEFAULT}
}
function getCK(){return CK}
function xEnc(t){return Array.from(t).map((c,i)=>(c.charCodeAt(0)^CK.charCodeAt(i%CK.length)).toString(16).padStart(2,'0')).join('')}
function xDec(h){try{return h.match(/.{2}/g).map((x,i)=>String.fromCharCode(parseInt(x,16)^CK.charCodeAt(i%CK.length))).join('')}catch{return''}}
function fnv(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);h=h&0x7fffffff}return h}
function adminHash(code){const S="MassagePay2026!Adm";let h=fnv(S+code+S);for(let i=0;i<200;i++)h=fnv(String(h)+S+code);return h.toString(36).padStart(6,'0')}
function genAdminAct(code,uuid){const b=`ADM:${code}:${uuid}`;return['#DELTA','#ECHO','#FOXTROT'].map(s=>String(fnv(b+s)%10000).padStart(4,'0')).join('-')}
function revokeHash(code){const S="MassagePay2026!Rvk";let h=fnv(S+code+S);for(let i=0;i<200;i++)h=fnv(String(h)+S+code);return h.toString(36).padStart(6,'0')}
function approveHash(code,devId){const S="MassagePay2026!Apr";let h=fnv(S+code+':'+devId+S);for(let i=0;i<200;i++)h=fnv(String(h)+S+code);return h.toString(36).padStart(6,'0')}
function supApproveHash(code){const S="MassagePay2026!Sup";let h=fnv(S+code+S);for(let i=0;i<200;i++)h=fnv(String(h)+S+code);return h.toString(36).padStart(6,'0')}
function genSimpleAct(code){const S="MassagePay2026!SimpleAct";let h=fnv(S+code+S);for(let i=0;i<50;i++)h=fnv(String(h)+S+code);const n=h%1000000000;const s=String(n).padStart(9,'0');return s.substring(0,3)+'-'+s.substring(3,6)+'-'+s.substring(6,9)}
function encWithKey(text,key){return Array.from(text).map((c,i)=>(c.charCodeAt(0)^key.charCodeAt(i%key.length)).toString(16).padStart(2,'0')).join('')}
function decWithKey(hex,key){try{return hex.match(/.{2}/g).map((x,i)=>String.fromCharCode(parseInt(x,16)^key.charCodeAt(i%key.length))).join('')}catch{return''}}
function actKey(code,devId){return code+':'+devId+':ACT2026'}
function genActWithToken(code,devId,ghCfg){const payload=JSON.stringify({t:ghCfg.token,o:ghCfg.owner,r:ghCfg.repo});return encWithKey(payload,actKey(code,devId))}
function verifyActToken(actCode,code,devId){try{const json=decWithKey(actCode.trim(),actKey(code,devId));const d=JSON.parse(json);if(d.t&&d.o&&d.r)return{token:d.t,owner:d.o,repo:d.r};return null;}catch{return null}}
/* ── 基資/店資 申請碼 + 確認碼 ──
   申請碼:類別碼(B=基資 S=店資)+ 加密payload(老師端key)
   確認碼:類別碼(小寫 b/s)+ 短碼(payload內容hash) */
const REQ_CAT={basic:'B',store:'S'};
function genReqCode(cat,code,devId,fields,bound){const payload=JSON.stringify({cat,code,uuid:devId||'',fields,ts:Date.now()});const enc=xEnc(encodeURIComponent(payload));const c1=(REQ_CAT[cat]||'X');return (bound?c1:c1.toLowerCase())+enc}
function parseReqCode(reqCode){const s=(reqCode||'').trim();if(!s)return null;const c1=s[0];const up=c1.toUpperCase();const cat=up==='B'?'basic':up==='S'?'store':null;if(!cat)return null;const bound=(c1===up);return{cat,catChar:c1,bound,enc:s.slice(1)}}
function decReqCode(reqCode){const p=parseReqCode(reqCode);if(!p)return null;try{const json=decodeURIComponent(xDec(p.enc));const d=JSON.parse(json);if(d.cat&&d.fields)return{cat:d.cat,code:d.code,uuid:d.uuid||'',fields:d.fields,ts:d.ts,boundClaim:p.bound};return null}catch{return null}}
// 確認碼:類別小寫 + 6碼(由 code+cat+欄位值 算hash);老師端用相同算法驗證
function genConfirmCode(cat,code,fields){const S='MPConfirm2026';const sortedKeys=Object.keys(fields||{}).sort();const norm=sortedKeys.map(k=>k+'='+JSON.stringify(fields[k])).join('&');const base=S+code+cat+norm+S;let h=fnv(base);for(let i=0;i<30;i++)h=fnv(String(h)+S);const n=h%1000000;const up=(REQ_CAT[cat]||'X');return up+String(n).padStart(6,'0')}
function verifyConfirmCode(confirmCode,cat,code,fields){const s=(confirmCode||'').trim();if(!s)return false;const expect=genConfirmCode(cat,code,fields);return s.toUpperCase()===expect.toUpperCase()}
function confirmCodeIsBound(confirmCode){const s=(confirmCode||'').trim();if(!s)return false;return s[0]===s[0].toUpperCase()}
function genUUID(){return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16)})}
function getDeviceId(){let id=localStorage.getItem('device-uuid');if(!id){id=genUUID();localStorage.setItem('device-uuid',id)}return id}

/* ══════════ Supervisor levels ══════════ */
const SUP_LEVELS=[{id:1,zh:'實習副理',vi:'Phó QL thực tập'},{id:2,zh:'副理',vi:'Phó quản lý'},{id:3,zh:'經理',vi:'Quản lý'},{id:4,zh:'區經理',vi:'Quản lý khu vực'},{id:5,zh:'執行長',vi:'Giám đốc'}];
function supLevelName(id,lang){const lv=SUP_LEVELS.find(l=>l.id===id);return lv?(lv[lang]||lv.zh):''}
function effSupLevel(level){return level}

/* ══════════ GitHub API ══════════ */
const GH_KEY='github-config';
function getGHConfig(){return LS.get(GH_KEY)||{}}
function saveGHConfigLocal(cfg){LS.set(GH_KEY,cfg)}
async function saveGHConfig(cfg){LS.set(GH_KEY,cfg)}
async function ghReadFile(cfg,path){const res=await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`,{headers:{'Authorization':`token ${cfg.token}`,'Accept':'application/vnd.github.v3+json'}});if(!res.ok)return null;const data=await res.json();return{content:atob(data.content.replace(/\n/g,'')),sha:data.sha}}
async function ghWriteFile(cfg,path,content,sha,msg){const res=await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`,{method:'PUT',headers:{'Authorization':`token ${cfg.token}`,'Content-Type':'application/json'},body:JSON.stringify({message:msg||'update '+path,content:btoa(unescape(encodeURIComponent(content))),sha})});return res.ok}
async function ghAppendLine(cfg,path,line,msg){const file=await ghReadFile(cfg,path);if(!file){try{const res=await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`,{method:'PUT',headers:{'Authorization':'token '+cfg.token,'Content-Type':'application/json'},body:JSON.stringify({message:msg||'create '+path,content:btoa(unescape(encodeURIComponent(line+'\n')))})});if(res.ok)return{ok:true};const err=await res.json().catch(()=>({}));return{ok:false,reason:err.message||'HTTP '+res.status};}catch(e){return{ok:false,reason:e.message||'network error'}}}const newContent=file.content.trim()+'\n'+line+'\n';const ok=await ghWriteFile(cfg,path,newContent,file.sha,msg);return ok?{ok:true}:{ok:false,reason:'write failed'}}
async function ghRemoveLine(cfg,path,line,msg){const file=await ghReadFile(cfg,path);if(!file)return false;const lines=file.content.split('\n').filter(l=>l.trim()!==line.trim());return ghWriteFile(cfg,path,lines.join('\n'),file.sha,msg)}

/* ══════════ Staff / Stores / Approvals ══════════ */
async function readStaff(gh){try{const res=await fetch('./staff.json',{cache:'no-store'});if(!res.ok)return[];const enc=(await res.text()).trim();if(!enc)return[];const raw=xDec(enc);try{return JSON.parse(decodeURIComponent(raw))}catch{try{return JSON.parse(raw)}catch{return[]}}}catch{return[]}}
async function writeStaff(gh,staffList){if(!gh.token||!gh.owner||!gh.repo)return false;const json=JSON.stringify(staffList);const enc=xEnc(encodeURIComponent(json));const file=await ghReadFile(gh,'staff.json');if(file)return ghWriteFile(gh,'staff.json',enc,file.sha,'update staff');try{const res=await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/staff.json`,{method:'PUT',headers:{'Authorization':'token '+gh.token,'Content-Type':'application/json'},body:JSON.stringify({message:'create staff.json',content:btoa(unescape(encodeURIComponent(enc)))})});return res.ok;}catch{return false}}
async function checkApproved(type,hash){try{const res=await fetch('./approved.cfg',{cache:'no-store'});if(!res.ok)return null;const text=await res.text();const lines=text.split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));for(const line of lines){const parts=line.split(':');if(parts[0]===type&&parts[1]===hash)return{level:parts[2]?parseInt(parts[2]):0}}return null;}catch{return null}}
async function writeApproval(gh,type,hash,level){const line=level?`${type}:${hash}:${level}`:`${type}:${hash}`;return ghAppendLine(gh,'approved.cfg',line,'approve '+type+' '+hash)}
async function loadStores(){try{const res=await fetch('./stores.cfg',{cache:'no-store'});if(!res.ok)return['龍山寺店'];const text=(await res.text()).trim();const stores=text.split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));return stores.length?stores:['龍山寺店'];}catch{return['龍山寺店']}}
async function saveStores(gh,stores){if(!gh.token)return false;const content=stores.join('\n')+'\n';const file=await ghReadFile(gh,'stores.cfg');if(file)return ghWriteFile(gh,'stores.cfg',content,file.sha,'update stores');try{const res=await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/stores.cfg`,{method:'PUT',headers:{'Authorization':'token '+gh.token,'Content-Type':'application/json'},body:JSON.stringify({message:'create stores.cfg',content:btoa(unescape(encodeURIComponent(content)))})});return res.ok;}catch{return false}}
function getApproved(){return LS.get('approved-supervisors')||[]}
function saveApproved(list){LS.set('approved-supervisors',list)}
function addApproved(code,devName){const list=getApproved();list.push({code,devName,ts:Date.now(),revoked:false});saveApproved(list)}

/* ══════════ Logs ══════════ */
function addLog(msg,level='admin'){const logs=LS.get('admin-log')||[];const s=LS.get('app-settings');const operator=s?.code||'';logs.push({ts:Date.now(),msg,level:level||'admin',op:operator});if(logs.length>200)logs.splice(0,logs.length-200);LS.set('admin-log',logs)}
function getLogs(filterLevel){const logs=(LS.get('admin-log')||[]).reverse();if(!filterLevel)return logs;if(filterLevel==='teacher')return logs.filter(l=>l.level==='teacher');if(filterLevel==='supervisor')return logs.filter(l=>l.level==='teacher'||l.level==='supervisor');return logs}
function fmtLog(s,args){return args.reduce((r,a,i)=>r.replace(`{${i}}`,a),s)}
function fmtDate(ts){const d=new Date(ts);return`${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}

/* ══════════ Theme ══════════ */
const THEMES={pink:'#fce4f6',black:'#030712',white:'#f9fafb',gray:'#1f2937'};

/* ══════════ Data helpers (salary tracking) ══════════ */
const SKILL_KEYS=['guasha','baguang','xiujiao'];
const SKILL_SHORT=['gs','bg','xj'];
const SKILL_PRICES=[250,250,300];
const SKILL_COLORS=['text-cyan-400','text-violet-400','text-pink-400'];
const SK=["normal","sick","late","rest","personal","early"];
const SBG=["","bg-red-500/20","bg-yellow-500/20","bg-blue-500/20","bg-purple-500/20","bg-orange-500/20"];
const STC=["","text-red-300","text-yellow-300","text-blue-300","text-purple-300","text-orange-300"];
const canWork=[true,false,true,false,false,true];
const toB36=n=>Math.min(Math.max(Math.round(n),0),35).toString(36);
const fromB36=c=>parseInt(c,36)||0;
const dim=(y,m)=>new Date(y,m,0).getDate();
const dow=(y,m,d)=>new Date(y,m-1,d).getDay();
/* ── 營業日：分界 6:30。凌晨 0:00–6:29 算前一天 ──
   傳入可選的 Date（預設現在），回傳調整後的 Date 物件 */
const BIZ_CUTOFF_MIN=6*60+30; // 06:30 = 390 分
function bizDate(now){now=now||new Date();const mins=now.getHours()*60+now.getMinutes();const d=new Date(now);if(mins<BIZ_CUTOFF_MIN){d.setDate(d.getDate()-1)}d.setHours(12,0,0,0);return d}
function bizParts(now){const d=bizDate(now);return{y:d.getFullYear(),m:d.getMonth()+1,d:d.getDate(),dow:d.getDay()}}
const dk=(c,y,m)=>`data-${c}-${y}-${String(m).padStart(2,'0')}`;
const eDay=()=>({groups:[],total:0,laodian:0,status:0,skills:{guasha:0,baguang:0,xiujiao:0},did:'',ts:0});
const stamp=(dd)=>{dd.did=getDeviceId();dd.ts=Date.now();return dd};
const calcSal=(day,unitPrice,enabledSkills)=>{let sal=day.total*unitPrice;const sk=day.skills||{};SKILL_KEYS.forEach((k,i)=>{if(enabledSkills?.[k])sal+=(sk[k]||0)*SKILL_PRICES[i]});return sal};
const eMon=()=>{const d={};for(let i=1;i<=31;i++)d[i]=eDay();return{days:d}};
function encMonth(code,y,m,data){let u="",l="",s="",sg="",sb="",sx="";for(let d=1;d<=31;d++){const day=d<=dim(y,m)&&data.days[d]?data.days[d]:eDay();const sk=day.skills||{};u+=toB36(day.total);l+=toB36(day.laodian);s+=day.status.toString();sg+=toB36(sk.guasha||0);sb+=toB36(sk.baguang||0);sx+=toB36(sk.xiujiao||0)}const hasSkills=sg.replace(/0/g,'')||sb.replace(/0/g,'')||sx.replace(/0/g,'');return`${code}-${y}-${String(m).padStart(2,'0')}:${u}:${l}:${s}${hasSkills?`:${sg}:${sb}:${sx}`:''}`}
function decBackup(str){try{const c=str.replace(/^#/,'').trim();const parts=c.split(':');const hd=parts[0],units=parts[1],laodian=parts[2],status=parts[3];const sg=parts[4]||'',sb=parts[5]||'',sx=parts[6]||'';const p=hd.split('-');const m=parseInt(p.pop());const y=parseInt(p.pop());const code=p.join('-');if(!y||!m||m<1||m>12||!code)return null;const data=eMon();const dm=dim(y,m);for(let d=1;d<=dm;d++)data.days[d]={groups:[],total:fromB36(units?.[d-1]||'0'),laodian:fromB36(laodian?.[d-1]||'0'),status:parseInt(status?.[d-1]||'0')||0,skills:{guasha:fromB36(sg?.[d-1]||'0'),baguang:fromB36(sb?.[d-1]||'0'),xiujiao:fromB36(sx?.[d-1]||'0')}};return{code,year:y,month:m,data}}catch{return null}}

/* ══════════ 客戶 / 自約（本機，按老師代碼分 key） ══════════ */
const CUST_KEY=c=>`customers-${c}`;
const BOOK_KEY=c=>`bookings-${c}`;
function getCustomers(code){return LS.get(CUST_KEY(code))||[]}
function saveCustomers(code,list){LS.set(CUST_KEY(code),list)}
function getBookings(code){return LS.get(BOOK_KEY(code))||[]}
function saveBookings(code,list){LS.set(BOOK_KEY(code),list)}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function upsertCustomer(code,cust){const list=getCustomers(code);const i=cust.id?list.findIndex(x=>x.id===cust.id):-1;const now=Date.now();if(i>=0){list[i]={...list[i],...cust,updatedAt:now}}else{cust.id=uid();cust.createdAt=now;cust.updatedAt=now;list.push(cust)}saveCustomers(code,list);return cust.id}
function normPhone(s){return(s||'').replace(/\D/g,'')}
/* 搜尋本機客戶：手機(部分相符)、姓/名(含)、稱謂(精準) */
function searchCustomers(code,q){const list=getCustomers(code);const raw=(q||'').trim();if(!raw)return list.slice().sort((a,b)=>(b.lastServedAt||b.updatedAt||0)-(a.lastServedAt||a.updatedAt||0));const digits=normPhone(raw);const low=raw.toLowerCase();return list.filter(c=>{const phoneHit=digits.length>=2&&normPhone(c.phone).includes(digits);const nameHit=(c.name||'').toLowerCase().includes(low);const titleHit=(c.title||'').toLowerCase()===low;return phoneHit||nameHit||titleHit}).sort((a,b)=>(b.lastServedAt||b.updatedAt||0)-(a.lastServedAt||a.updatedAt||0))}
function addBooking(code,bk){const list=getBookings(code);bk.id=uid();bk.createdAt=Date.now();bk.confirmed=false;if(!bk.logs)bk.logs=[];bk.logs.push({ts:Date.now(),type:'create',msg:'新增本次自約'});list.push(bk);saveBookings(code,list);if(bk.customerId){const cs=getCustomers(code);const ci=cs.findIndex(x=>x.id===bk.customerId);if(ci>=0){cs[ci].lastServedAt=bk.datetime||Date.now();saveCustomers(code,cs)}}return bk.id}
function updateBooking(code,id,patch,logEntry){const list=getBookings(code);const i=list.findIndex(b=>b.id===id);if(i<0)return false;const merged={...list[i],...patch};if(logEntry){if(!merged.logs)merged.logs=[];merged.logs.push({ts:Date.now(),...logEntry})}list[i]=merged;saveBookings(code,list);return true}
function confirmBooking(code,id){return updateBooking(code,id,{confirmed:true,needReconfirm:false},{type:'confirm',msg:'與櫃台確認該時段'})}
function deleteBooking(code,id){saveBookings(code,getBookings(code).filter(b=>b.id!==id))}
const BOOK_TITLES=[{v:'sir',zh:'先生',vi:'Anh'},{v:'ms',zh:'小姐',vi:'Cô'},{v:'couple',zh:'情侶',vi:'Cặp đôi'},{v:'group',zh:'團客',vi:'Nhóm'}];
function bookTitleName(v,lang){const o=BOOK_TITLES.find(x=>x.v===v);return o?(o[lang]||o.zh):(v||'')}
/* 服務項目：code=顯示, base=基礎支數, min=時長(分) */
const SERVICES=[{code:'F2',base:2,min:70},{code:'B2',base:2,min:70},{code:'FB2',base:2,min:70},{code:'F3',base:3,min:110},{code:'B3',base:3,min:110},{code:'FB3',base:3,min:120}];
function svcByCode(code){return SERVICES.find(s=>s.code===code)||SERVICES[5]}
/* 加鐘 extra：每 +1 = +30分 +1支 */
function bookUnits(svcCode,extra){const s=svcByCode(svcCode);return s.base+(extra||0)}
function bookMinutes(svcCode,extra){const s=svcByCode(svcCode);return s.min+(extra||0)*30}
function bookLabel(svcCode,extra){return svcCode+((extra||0)>0?'+'+extra:'')}
/* 自約的起訖（毫秒） */
function bookRange(bk){const start=bk.datetime||0;const end=start+bookMinutes(bk.svc,bk.extra)*60000;return[start,end]}
/* 衝突偵測：回傳與 bk 時間重疊的其他自約陣列（排除自己 id） */
function findConflicts(code,bk,selfId){const[s1,e1]=bookRange(bk);if(!s1)return[];return getBookings(code).filter(o=>o.id!==selfId).filter(o=>{const[s2,e2]=bookRange(o);return s1<e2&&s2<e1})}
/* 排休檢查：讀薪資 month data 的 status；2=病假? 依現有 SK 索引 sick/rest/personal 視為排休 */
function dayOffStatus(code,ts){try{const d=new Date(ts);const y=d.getFullYear(),m=d.getMonth()+1,day=d.getDate();const md=LS.get(dk(code,y,m));if(!md||!md.days||!md.days[day])return 0;const st=md.days[day].status||0;/* SK=[normal,sick,late,rest,personal,early]；休假類:1病假,3休假,4事假 */return[1,3,4].includes(st)?st:0}catch{return 0}}
/* 自約 log */
function bookLog(bk,msg){if(!bk.logs)bk.logs=[];bk.logs.push({ts:Date.now(),msg});return bk}
const SK_NAMES={1:{zh:'病假',vi:'Nghỉ bệnh'},3:{zh:'休假',vi:'Nghỉ phép'},4:{zh:'事假',vi:'Nghỉ việc riêng'}};
function skName(st,lang){const o=SK_NAMES[st];return o?(o[lang]||o.zh):''}

/* ══════════ i18n ══════════ */
// 台灣縣市/鄉鎮區:北北宜桃提供完整鄉鎮,其餘僅縣市(區自填)
const LANG_SCHOOLS=["國立臺灣師範大學","淡江大學","國立政治大學","中國文化大學","國立臺灣大學","中原大學","輔仁大學"];
const TW_REGIONS={
  "臺北市":["中正區","大同區","中山區","松山區","大安區","萬華區","信義區","士林區","北投區","內湖區","南港區","文山區"],
  "新北市":["板橋區","三重區","中和區","永和區","新莊區","新店區","樹林區","鶯歌區","三峽區","淡水區","汐止區","瑞芳區","土城區","蘆洲區","五股區","泰山區","林口區","深坑區","石碇區","坪林區","三芝區","石門區","八里區","平溪區","雙溪區","貢寮區","金山區","萬里區","烏來區"],
  "桃園市":["桃園區","中壢區","平鎮區","八德區","楊梅區","蘆竹區","大溪區","龜山區","龍潭區","大園區","觀音區","新屋區","復興區"],
  "宜蘭縣":["宜蘭市","羅東鎮","蘇澳鎮","頭城鎮","礁溪鄉","壯圍鄉","員山鄉","冬山鄉","五結鄉","三星鄉","大同鄉","南澳鄉"],
  "基隆市":[],"新竹市":[],"新竹縣":[],"苗栗縣":[],"臺中市":[],"彰化縣":[],"南投縣":[],"雲林縣":[],"嘉義市":[],"嘉義縣":[],"臺南市":[],"高雄市":[],"屏東縣":[],"花蓮縣":[],"臺東縣":[],"澎湖縣":[],"金門縣":[],"連江縣":[]
};

const T={
zh:{settings:"設定",yearly:"年度薪資",monthly:"月份明細",home:"首頁",unitPrice:"每支單價",teacherCode:"老師代碼",language:"語系",year:"年份",save:"儲存",saved:"已儲存 ✓",units:"支數",salary:"薪水",laodian:"老點",subtotal:"小計",prevPeriod:"上期",nextPeriod:"下期",monthTotal:"月合計",total:"合計",sick:"病假",late:"遲到",rest:"休假",normal:"正常",personal:"事假",early:"早退",dn:["日","一","二","三","四","五","六"],months:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],addGroup:"新增客組",directMode:"直接輸入",groupMode:"分組輸入",status:"狀態",done:"完成",cancel:"取消",exportUrl:"匯出備份碼",importUrl:"匯入備份碼",importOk:"匯入成功！",importFail:"格式錯誤",copyDone:"已複製",enterUrl:"貼上備份碼...",noData:"無資料",totalUnits:"總支數",groupLabel:"組",backup:"備份",p1:"上半月 (1-15日)",p2:"下半月 (16日-月底)",yesterday:"昨日",lastRecord:"上一筆",todayDone:"今日已完成",startAdd:"開始新增本日的支數？",continueAdd:"繼續新增本日的支數？",addLaodian:"新增老點？",other:"其他",welcome:"歡迎使用薪資追蹤系統",enterCode:"請輸入老師編號",confirm:"確定",showQR:"請將 QR Code 提供給管理員索取啟動碼",enterActivation:"輸入啟動碼",activationHint:"貼上管理者提供的啟動碼",activationFail:"啟動碼錯誤，請重新確認",copyToLine:"點此複製，傳 LINE 給管理者",adminWelcome:"管理員身分確認，自動啟動中...",admin:"管理",adminTitle:"管理頁面",genActivation:"產生啟動碼",pasteEncrypted:"貼上加密字串",resultCode:"啟動碼",adminFail:"無管理權限",encryptTool:"加密/解密工具",encryptLabel:"加密",decryptLabel:"解密",inputText:"輸入文字",deviceId:"裝置 ID",adminCheck:"檢查",adminEnter:"進入",adminApply:"申請主管",adminPending:"審核中",adminActivate:"啟動",adminApplyDesc:"申請主管權限",deviceName:"設備名稱（選填）",adminAppCode:"申請碼",adminAppCopy:"點此複製，傳 LINE 給管理者",adminActInput:"輸入管理啟動碼",adminActFail:"啟動碼錯誤",supervisor:"主管頁面",supervisorTitle:"主管",supervisorApprove:"主管申請審核",supervisorApproveHint:"貼上申請碼",supervisorInfo:"申請人資訊",revoke:"取消主管權限",revokeHint:"請將此碼新增到 GitHub revoked.cfg",revokeCode:"撤銷碼",revokeInput:"輸入撤銷碼",revokeSuccess:"主管權限已取消",revokeFail:"撤銷碼錯誤",actionLog:"操作記錄",logGenUser:"生成{0}號啟動碼",logGenSup:"生成{0}號主管啟動碼({1})",logRevoke:"取消{0}號主管權限({1})",supervisorList:"主管名單",logTeacherActivate:"{0}號老師啟用主管權限({1})",revokeToAdmin:"請將此碼傳給管理者新增到 revoked.cfg",revokedList:"已撤銷",expired:"權限已過期",ok:"確認",ghConfig:"GitHub 設定",ghOwner:"帳號",ghRepo:"Repo 名稱",ghToken:"Personal Access Token",ghSave:"儲存",ghSaved:"已儲存 ✓",ghTest:"測試連線",ghOk:"連線成功 ✓",ghFail:"連線失敗",ghWriting:"寫入中...",ghWriteOk:"已寫入 GitHub ✓",ghWriteFail:"寫入失敗",ghAuto:"自動寫入 GitHub",ghEdit:"編輯",ghLocked:"設定已鎖定，按編輯可修改",keyConfig:"密鑰設定",keyFile:"檔案",keyStart:"起始位置",keyLen:"取幾字",keyTest:"測試密鑰",keyResult:"組合結果",keyMatch:"與現行密鑰一致 ✓",keyMismatch:"⚠️ 與現行密鑰不同",keySave:"儲存密鑰設定",keySaved:"密鑰設定已儲存 ✓",keyAddRule:"新增規則",keyDelRule:"刪除",keyFileOk:"{0} 存在",keyFileFail:"{0} 不存在",keyLenOk:"{0} 第1行 {1} 字 ≥ 需要 {2} 字",keyLenFail:"{0} 第1行僅 {1} 字，需至少 {2} 字",keyBuilt:"組合密鑰：{0} 字元",keyAdminOk:"admin.cfg 共 {0} 筆，全部符合",keyAdminPartial:"admin.cfg {0}/{1} 筆符合",keyAdminNone:"admin.cfg {0} 筆皆不符合",keyMigrate:"轉換為新密鑰",keyMigrating:"轉換中...",keyMigrateOk:"已轉換並寫入 GitHub ✓",keyMigrateFail:"轉換失敗",adminList:"管理者名單",adminAdd:"新增管理者",adminDel:"刪除",adminDelConfirm:"確定刪除此管理者？",adminDelLast:"至少需保留一位管理者",adminDelOk:"已從 GitHub 刪除 ✓",adminDelFail:"刪除失敗",adminAddHint:"請將此雜湊碼新增到 GitHub admin.cfg",adminCfg:"目前 admin.cfg",adminLocal:"本機新增",onlineApprove:"線上核准",approveTeacher:"核准老師",approveSupervisor:"核准主管",approveName:"姓名",approveLang:"語系",approveLevel:"主管等級",approveBtn:"核准",approving:"核准中...",approveOk:"已核准 ✓",approveFail:"核准失敗",approveMsg:"你的帳號已可使用了，再看看有沒有使用上的問題 😊",approveCopied:"已複製回覆訊息 ✓",waitApproval:"等待審核中",waitHint:"請將上方申請碼傳給管理者，核准後重開 App 即可使用",checkApproval:"重新檢查",checking:"檢查中...",approved:"已核准！",staffList:"員工名單",staffEmpty:"尚無員工資料",staffRole:"角色",staffStatus:"狀態",staffActive:"在職",staffRevoked:"已停用",logApproveTeacher:"核准老師 {0}({1})",logApproveSupervisor:"核准主管 {0}({1}) {2}",store:"所在店面",storeManage:"店面管理",storeAdd:"新增店面",storeDel:"刪除",storeEmpty:"尚無店面",storeSaved:"已儲存 ✓",teacherActivation:"老師啟動碼",supActivation:"主管啟動碼",sortByStore:"按店面",sortByCode:"按編號",sortByRole:"按職務",theme:"背景主題",themePink:"粉紅",themeBlack:"黑色",themeWhite:"白色",themeGray:"灰色",resetAll:"一鍵還原初始設定",resetAllConfirm:"確定還原？將清除所有員工與主管資料（保留管理員122、Token、記錄）",resetAllOk:"已還原初始設定 ✓",resetSup:"一鍵移除所有主管權限",resetSupConfirm:"確定移除所有主管權限？",resetSupOk:"已移除所有主管權限 ✓",resetApp:"重置申請",removeToken:"移除（轉離線）",removeSup:"取消主管權限",removeConfirm:"確定移除 {0}？",connection:"連線作業",connApply:"申請認證",connCode:"連線碼",connInput:"貼上連線碼",connOk:"連線成功 ✓",connFail:"連線碼錯誤",connExpired:"你的連線認證已逾期，請重新申請",connStatus:"連線狀態",connOnline:"已連線 ☁️",connOffline:"離線 📥",editStaff:"人員編輯",editStore:"所在店面",editDel:"刪除此員工",editDelConfirm:"確定刪除 {0}？",editDevices:"連線設備",editRevokeConn:"取消連線",editNoDevices:"無連線設備",genConn:"產生連線碼",genConnHint:"貼上老師的 編號:uuid",needConnFirst:"請先完成連線設定才能申請主管",skills:"老師技能",guasha:"刮痧",baguang:"拔罐",xiujiao:"修腳皮",gs:"刮",bg:"拔",xj:"修",clearAll:"一鍵清除",notice1:"⚠️ 資料只存在本機，不會上傳雲端。",notice2:"LINE 與手機內建瀏覽器的暫存是分開的，啟動碼會不同，請固定使用同一個瀏覽器。",notice3:"資料跟著手機走，換手機前請先到設定頁匯出備份。",authRedirectHint:"點擊後將前往管理頁面，完成後可按返回回到記薪資畫面。",manualGen:"手動發碼",manualGenBtn:"發碼",syncedStaff:"已寫入名單",syncFailStaff:"名單寫入失敗",manualGenHint:"直接輸入老師編號產生啟動碼（離線可用，不寫入雲端名單）",booking:"我的預約",bookingNew:"新增自約",bookingList:"自約清單",bookingEmpty:"目前沒有自約",custSearch:"搜尋客戶（手機/姓/稱謂）",custNew:"新客戶",custName:"姓名",custPhone:"手機",custTitle:"稱謂",custParts:"重點部位",custNote:"備註",custEval:"本次評價",bookDate:"預約日期",bookTime:"預約時間",bookSave:"儲存自約",bookCancel:"取消",bookDelete:"刪除自約",bookDeleteConfirm:"確定刪除這筆自約？",bookDeleteConfirm2:"確定刪除",selectCustomer:"選擇客戶",orNewCustomer:"或新增客戶",noMatch:"查無符合客戶",lastServed:"上次服務",bookStatus:"狀態",bookConfirmed:"已確認",bookDone:"已完成",bookNoShow:"未到",pickCustomerFirst:"請先選擇或新增客戶",needActivate:"請先在記薪資頁完成啟用",backToMain:"回記薪資",svcLabel:"服務項目",addHour:"加鐘",party:"同行人數",workStart:"上工時間",workEnd:"下工時間",workEndNeed:"已填上工，請一併填下工時間",gender:"性別",genderM:"男",genderF:"女",crossNightHint:"晚班跨夜：下工時間早於上工時間時，系統自動視為隔天（例如 17:00 上工、05:00 下工）。",
tabBasic:"基資",tabStore:"店資",tabBook2:"自約",tabCust:"客管",tabNotice:"公告",tabSuggest:"建議",tabManage:"管理",
secBasic:"基本資料",secStore:"在店資訊",nameZh:"中文姓名",nameVi:"越南姓名",address:"通訊地址",school:"就讀學校",major:"科系",permitDate:"工作證核發日期",permitOrg:"核發單位",optional:"選填",
storeName:"店名",shift:"班別",shiftDay:"早班",shiftNight:"晚班",workNote:"特別上下工備註",
skPregnant:"特殊客人（懷孕）",skOil:"油壓",
custMgmt:"客戶管理",noticeCenter:"公司宣達事項",suggestBox:"提供建議",manageCenter:"管理中心",underConstruction:"施工中",
confirmWithSup:"與主管確認",permitNo:"許可文號",permitExpiry:"到期日",permitOrgOpt:"核發單位",orgWDA:"勞動部勞動力發展署",orgNIA:"內政部移民署",orgOther:"其他",permitExpiringSoon:"工作證即將到期",phone2:"手機",city:"縣市",district:"區/鄉鎮市",addrDetail:"地址",selectCity:"選擇縣市",selectDist:"選擇區",myBookingNote:"「我的自約」非店家正式預約資料，僅供老師方便記錄使用。",partyMember:"同行第",assignTeacher:"指定老師",noAssign:"不指定",svcNote:"服務備註",calView:"日曆式",eventView:"事件序",totalPeople:"共",peopleUnit:"人",alsoAssign:"另指定",assignMode:"指定方式",noAssignTeacher:"不指定老師",assignTeacherMode:"指定老師",assignByCode:"指定編號",assignByCond:"指定條件",assignMale:"指男",assignFemale:"指女",assignTW:"指台",assignVN:"指越",assignOil:"油壓",confirmWithCounter:"跟櫃台確認",confirmWithAssigned:"跟指定老師確認",editBtn:"編輯",saveChange:"儲存變更",logConfirmCounter:"與櫃台確認該時段",logConfirmAssigned:"與指定老師{0}確認",logEditChange:"編輯：{0}",foreignSection:"外籍員工",permitNoLabel:"工作證許可文號",langSchool:"目前就讀語言學校",schoolType:"目前就讀",schoolTypeLang:"語言學校",schoolTypeUni:"大學",schoolTypeMaster:"研究所",schoolTypePhd:"博士班",selectLangSchool:"選擇語言學校",closeThis:"關閉此頁",confirmedAssignedToast:"已與{0}老師確認",confirmedCounterToast:"已與櫃台確認",statusUnconfirmed:"未確認",statusConfirmed:"已確認",statusAssignedConfirmed:"已跟指定老師確認",statusReconfirm:"自約變更，請重新確認",statusTeacherProgress:"已與老師確認 ({0}/{1})",confirmedTeacherToast:"已與老師確認 ({0}/{1})",hidePast:"隱藏已過期",workTimeEdit:"上下工時間",workStartH:"上工",workEndH:"下工",saveWorkTime:"儲存工時",internSup:"實習副理",confirmSuccess:"已確認，資料已更新",confirmFail:"確認碼錯誤或不符",scanReqEntry:"刷申請碼",reqBasic:"基資申請",reqStore:"店資申請",agreeWrite:"同意並寫入",disagree:"不同意",writeOk:"已寫入，確認碼：",giveConfirmCode:"請將確認碼給老師",logReqWritten:"寫入{0}申請：{1}",uuidBound:"已綁定裝置",uuidNew:"新裝置(將綁定)",myBooking2:"我的自約",
tabHome2:"首設",tabBackup:"備份",homeSettings:"首頁設定",backupCenter:"備份",
curStore:"目前服務店家",applyChange:"申請更改",genBasicCode:"產生基資申請碼",genStoreCode:"產生店資申請碼",basicApplyCode:"基資申請碼",storeApplyCode:"店資申請碼",confirmCode2:"確認碼",copyBtn:"複製",
syncStoreBooking:"同步店家預約資訊",syncBtn:"同步",pasteBtn:"貼上",noFuncYet:"（尚無功能）",tabViolation:"違規",violationTitle:"違規記錄",noViolation:"你目前尚未有違規記錄",violationCode:"違規確認碼",dutyTitle:"值日生記錄",noDuty:"目前無值日生記錄",prevConfirmed:"前次確認值",needConfirm:"請完成資料填寫後，向主管進行確認",serviceStatus:"本服務 本機／連線狀況",
privacyTitle:"資料儲存說明",privacyBody:"本系統所有個人資料與薪資記錄，皆僅儲存於您的裝置本機，不會上傳至任何雲端伺服器，店家與管理者均無法讀取。",
backupReminder:"預約與所有資料均儲存於本機，更換手機後資料將無法復原。更換手機前，請先至「備份」頁匯出備份碼妥善保存。",
basicUpdateCode:"基資更新碼",storeUpdateCode:"店資更新碼",basicConfirmCode:"基資確認碼",storeConfirmCode:"店資確認碼",conflictWarn:"與 {0} {1} 衝突",dayOffWarn:"當天已排{0}",units:"支",partyUnit:"人",noWorkEnd:"尚未設定下工時間",bookEdit:"編輯",bookConfirmDesk:"與櫃台確定",bookConfirmed2:"已與櫃台確認",bookEditWarn:"變更時間後請再與櫃台確認",bookLogTitle:"異動記錄",logCreate:"新增本次自約",logConfirm:"與櫃台確認該時段",logChange:"自約變動",logConflict:"系統偵測到時段衝突仍建立",custEditTitle:"編輯客戶",custSave:"儲存",bookSaveEdit:"儲存變更",timeChanged:"時間 {0} → {1}",svcChanged:"服務 {0} → {1}"},
vi:{settings:"Cài đặt",yearly:"Lương năm",monthly:"Chi tiết",home:"Trang chủ",unitPrice:"Đơn giá",teacherCode:"Mã NV",language:"Ngôn ngữ",year:"Năm",save:"Lưu",saved:"Đã lưu ✓",units:"SL",salary:"Lương",laodian:"KH quen",subtotal:"Tổng",prevPeriod:"Kỳ trước",nextPeriod:"Kỳ sau",monthTotal:"Tổng tháng",total:"Tổng cộng",sick:"Nghỉ bệnh",late:"Đi trễ",rest:"Nghỉ phép",normal:"BT",personal:"Nghỉ việc riêng",early:"Về sớm",dn:["CN","T2","T3","T4","T5","T6","T7"],months:["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"],addGroup:"Thêm khách",directMode:"Nhập trực tiếp",groupMode:"Nhập theo nhóm",status:"Trạng thái",done:"Xong",cancel:"Hủy",exportUrl:"Xuất mã",importUrl:"Nhập mã",importOk:"Thành công!",importFail:"Sai định dạng",copyDone:"Đã chép",enterUrl:"Dán mã...",noData:"Không có",totalUnits:"Tổng SL",groupLabel:"Nhóm",backup:"Sao lưu",p1:"Nửa đầu (1-15)",p2:"Nửa sau (16-cuối)",yesterday:"Hôm qua",lastRecord:"Lần trước",todayDone:"Hôm nay đã xong",startAdd:"Thêm SL hôm nay?",continueAdd:"Tiếp tục thêm?",addLaodian:"Thêm KH quen?",other:"Khác",welcome:"Chào mừng",enterCode:"Nhập mã nhân viên",confirm:"Xác nhận",showQR:"Đưa mã QR cho quản lý để nhận mã kích hoạt",enterActivation:"Nhập mã kích hoạt",activationHint:"Dán mã kích hoạt từ quản lý",activationFail:"Sai mã kích hoạt",copyToLine:"Nhấn để sao chép, gửi LINE cho quản lý",adminWelcome:"Xác nhận quản lý, tự động kích hoạt...",admin:"Quản lý",adminTitle:"Trang quản lý",genActivation:"Tạo mã kích hoạt",pasteEncrypted:"Dán chuỗi mã hóa",resultCode:"Mã kích hoạt",adminFail:"Không có quyền",encryptTool:"Mã hóa/Giải mã",encryptLabel:"Mã hóa",decryptLabel:"Giải mã",inputText:"Nhập văn bản",deviceId:"Mã thiết bị",adminCheck:"Kiểm tra",adminEnter:"Vào",adminApply:"Đăng ký quản lý",adminPending:"Đang xét duyệt",adminActivate:"Kích hoạt",adminApplyDesc:"Đăng ký quyền quản lý",deviceName:"Tên thiết bị (tùy chọn)",adminAppCode:"Mã đăng ký",adminAppCopy:"Nhấn để sao chép, gửi LINE cho quản lý",adminActInput:"Nhập mã kích hoạt quản lý",adminActFail:"Sai mã kích hoạt",adminFail:"Không có quyền",supervisor:"Trang quản lý",supervisorTitle:"Quản lý",supervisorApprove:"Duyệt đăng ký quản lý",supervisorApproveHint:"Dán mã đăng ký",supervisorInfo:"Thông tin người đăng ký",revoke:"Hủy quyền quản lý",revokeHint:"Thêm mã này vào GitHub revoked.cfg",revokeCode:"Mã hủy",revokeInput:"Nhập mã hủy",revokeSuccess:"Đã hủy quyền quản lý",revokeFail:"Sai mã hủy",actionLog:"Nhật ký",logGenUser:"Tạo mã kích hoạt #{0}",logGenSup:"Tạo mã quản lý #{0}({1})",logRevoke:"Hủy quyền #{0}({1})",supervisorList:"Danh sách quản lý",logTeacherActivate:"NV #{0} kích hoạt quyền quản lý({1})",revokeToAdmin:"Gửi mã này cho quản trị viên để thêm vào revoked.cfg",revokedList:"Đã hủy",expired:"Quyền đã hết hạn",ok:"OK",ghConfig:"Cài đặt GitHub",ghOwner:"Tài khoản",ghRepo:"Tên Repo",ghToken:"Personal Access Token",ghSave:"Lưu",ghSaved:"Đã lưu ✓",ghTest:"Thử kết nối",ghOk:"Kết nối OK ✓",ghFail:"Kết nối thất bại",ghWriting:"Đang ghi...",ghWriteOk:"Đã ghi GitHub ✓",ghWriteFail:"Ghi thất bại",ghAuto:"Tự động ghi GitHub",ghEdit:"Sửa",ghLocked:"Đã khóa, nhấn Sửa để chỉnh",keyConfig:"Cài đặt khóa",keyFile:"Tệp",keyStart:"Vị trí",keyLen:"Số ký tự",keyTest:"Thử khóa",keyResult:"Kết quả",keyMatch:"Khớp khóa hiện tại ✓",keyMismatch:"⚠️ Khác khóa hiện tại",keySave:"Lưu cài đặt khóa",keySaved:"Đã lưu ✓",keyAddRule:"Thêm quy tắc",keyDelRule:"Xóa",keyFileOk:"{0} tồn tại",keyFileFail:"{0} không tồn tại",keyLenOk:"{0} dòng 1: {1} ký tự ≥ cần {2}",keyLenFail:"{0} dòng 1: chỉ {1} ký tự, cần ≥ {2}",keyBuilt:"Khóa: {0} ký tự",keyAdminOk:"admin.cfg {0} mục, tất cả khớp",keyAdminPartial:"admin.cfg {0}/{1} khớp",keyAdminNone:"admin.cfg {0} mục không khớp",keyMigrate:"Chuyển sang khóa mới",keyMigrating:"Đang chuyển...",keyMigrateOk:"Đã chuyển và ghi GitHub ✓",keyMigrateFail:"Chuyển thất bại",adminList:"Danh sách quản lý",adminAdd:"Thêm quản lý",adminDel:"Xóa",adminDelConfirm:"Xác nhận xóa quản lý?",adminDelLast:"Cần giữ ít nhất một quản lý",adminDelOk:"Đã xóa khỏi GitHub ✓",adminDelFail:"Xóa thất bại",adminAddHint:"Thêm mã hash này vào GitHub admin.cfg",adminCfg:"admin.cfg hiện tại",adminLocal:"Thêm cục bộ",onlineApprove:"Duyệt online",approveTeacher:"Duyệt NV",approveSupervisor:"Duyệt quản lý",approveName:"Họ tên",approveLang:"Ngôn ngữ",approveLevel:"Cấp bậc",approveBtn:"Duyệt",approving:"Đang duyệt...",approveOk:"Đã duyệt ✓",approveFail:"Duyệt thất bại",approveMsg:"Tài khoản của bạn đã sẵn sàng, hãy thử và cho mình biết nếu có vấn đề gì nhé 😊",approveCopied:"Đã copy tin nhắn ✓",waitApproval:"Đang chờ duyệt",waitHint:"Gửi mã trên cho quản lý, mở lại app sau khi được duyệt",checkApproval:"Kiểm tra lại",checking:"Đang kiểm tra...",approved:"Đã duyệt!",staffList:"Danh sách NV",staffEmpty:"Chưa có dữ liệu",staffRole:"Vai trò",staffStatus:"Trạng thái",staffActive:"Đang làm",staffRevoked:"Đã nghỉ",logApproveTeacher:"Duyệt NV {0}({1})",logApproveSupervisor:"Duyệt QL {0}({1}) {2}",store:"Chi nhánh",storeManage:"Quản lý CN",storeAdd:"Thêm CN",storeDel:"Xóa",storeEmpty:"Chưa có CN",storeSaved:"Đã lưu ✓",teacherActivation:"Mã kích hoạt NV",supActivation:"Mã kích hoạt QL",sortByStore:"Theo CN",sortByCode:"Theo mã",sortByRole:"Theo chức vụ",theme:"Giao diện",themePink:"Hồng",themeBlack:"Đen",themeWhite:"Trắng",themeGray:"Xám",resetAll:"Khôi phục mặc định",resetAllConfirm:"Xác nhận? Sẽ xóa tất cả NV và QL (giữ admin 122, Token, log)",resetAllOk:"Đã khôi phục ✓",resetSup:"Xóa tất cả quyền QL",resetSupConfirm:"Xác nhận xóa tất cả quyền QL?",resetSupOk:"Đã xóa ✓",resetApp:"Đặt lại đơn",removeToken:"Xóa (offline)",removeSup:"Hủy quyền QL",removeConfirm:"Xác nhận xóa {0}?",connection:"Kết nối",connApply:"Yêu cầu xác thực",connCode:"Mã kết nối",connInput:"Dán mã kết nối",connOk:"Kết nối OK ✓",connFail:"Sai mã kết nối",connExpired:"Xác thực đã hết hạn, vui lòng yêu cầu lại",connStatus:"Trạng thái",connOnline:"Online ☁️",connOffline:"Offline 📥",editStaff:"Chỉnh sửa NV",editStore:"Chi nhánh",editDel:"Xóa NV",editDelConfirm:"Xác nhận xóa {0}?",editDevices:"Thiết bị",editRevokeConn:"Ngắt kết nối",editNoDevices:"Không có thiết bị",genConn:"Tạo mã kết nối",genConnHint:"Dán mã:uuid của NV",needConnFirst:"Cần kết nối trước khi yêu cầu quyền QL",skills:"Kỹ năng",guasha:"Cạo gió",baguang:"Giác hơi",xiujiao:"Sửa da chân",gs:"C",bg:"G",xj:"S",clearAll:"Xóa tất cả",notice1:"⚠️ Dữ liệu chỉ lưu trên máy, không tải lên đám mây.",notice2:"Trình duyệt LINE và trình duyệt mặc định lưu riêng, mã kích hoạt sẽ khác nhau. Hãy dùng cùng một trình duyệt.",notice3:"Dữ liệu gắn với điện thoại. Trước khi đổi máy, hãy xuất sao lưu trong Cài đặt.",authRedirectHint:"Nhấn để vào trang quản lý, xong có thể bấm quay lại màn hình ghi lương.",manualGen:"Tạo mã thủ công",manualGenHint:"Nhập mã nhân viên để tạo mã kích hoạt (dùng offline, không ghi vào danh sách đám mây)",booking:"Lịch hẹn",bookingNew:"Thêm lịch hẹn",bookingList:"Danh sách hẹn",bookingEmpty:"Chưa có lịch hẹn",custSearch:"Tìm khách (SĐT/tên/xưng hô)",custNew:"Khách mới",custName:"Tên",custPhone:"SĐT",custTitle:"Xưng hô",custParts:"Vùng trọng điểm",custNote:"Ghi chú",custEval:"Đánh giá",bookDate:"Ngày hẹn",bookTime:"Giờ hẹn",bookSave:"Lưu lịch hẹn",bookCancel:"Hủy",bookDelete:"Xóa lịch hẹn",bookDeleteConfirm:"Xác nhận xóa lịch hẹn này?",bookDeleteConfirm2:"Xác nhận xóa",selectCustomer:"Chọn khách",orNewCustomer:"Hoặc thêm khách",noMatch:"Không tìm thấy khách",lastServed:"Lần phục vụ trước",bookStatus:"Trạng thái",bookConfirmed:"Đã xác nhận",bookDone:"Hoàn thành",bookNoShow:"Không đến",pickCustomerFirst:"Vui lòng chọn hoặc thêm khách",needActivate:"Vui lòng kích hoạt ở trang ghi lương trước",backToMain:"Về ghi lương",svcLabel:"Dịch vụ",addHour:"Thêm giờ",party:"Số người đi cùng",workStart:"Giờ vào làm",workEnd:"Giờ tan làm",workEndNeed:"Đã điền giờ vào, vui lòng điền giờ tan",gender:"Giới tính",genderM:"Nam",genderF:"Nữ",crossNightHint:"Ca đêm qua ngày: khi giờ tan sớm hơn giờ vào, hệ thống tự tính sang ngày hôm sau.",
tabBasic:"Hồ sơ",tabStore:"Cửa hàng",tabBook2:"Lịch hẹn",tabCust:"Khách",tabNotice:"Thông báo",tabSuggest:"Góp ý",tabManage:"Quản lý",
secBasic:"Thông tin cơ bản",secStore:"Thông tin cửa hàng",nameZh:"Tên tiếng Trung",nameVi:"Tên tiếng Việt",address:"Địa chỉ",school:"Trường học",major:"Ngành học",permitDate:"Ngày cấp giấy phép LĐ",permitOrg:"Đơn vị cấp",optional:"Tùy chọn",
storeName:"Tên cửa hàng",shift:"Ca làm",shiftDay:"Ca sáng",shiftNight:"Ca đêm",workNote:"Ghi chú giờ làm đặc biệt",
skPregnant:"Khách đặc biệt (mang thai)",skOil:"Massage dầu",
custMgmt:"Quản lý khách",noticeCenter:"Thông báo công ty",suggestBox:"Góp ý",manageCenter:"Trung tâm quản lý",underConstruction:"Đang xây dựng",
confirmWithSup:"Xác nhận với quản lý",permitNo:"Số giấy phép",permitExpiry:"Ngày hết hạn",permitOrgOpt:"Đơn vị cấp",orgWDA:"Cục Phát triển Lực lượng LĐ",orgNIA:"Cục Di trú",orgOther:"Khác",permitExpiringSoon:"Giấy phép sắp hết hạn",phone2:"Điện thoại",city:"Tỉnh/Thành",district:"Quận/Huyện",addrDetail:"Địa chỉ",selectCity:"Chọn tỉnh/thành",selectDist:"Chọn quận",myBookingNote:"Lịch hẹn của tôi không phải dữ liệu đặt chỗ chính thức, chỉ để giáo viên ghi chú.",partyMember:"Người đi cùng thứ ",assignTeacher:"Chỉ định GV",noAssign:"Không chỉ định",svcNote:"Ghi chú dịch vụ",calView:"Lịch",eventView:"Sự kiện",totalPeople:"Tổng ",peopleUnit:" người",alsoAssign:"chỉ định thêm",assignMode:"Cách chỉ định",noAssignTeacher:"Không chỉ định GV",assignTeacherMode:"Chỉ định GV",assignByCode:"Theo mã số",assignByCond:"Theo điều kiện",assignMale:"GV nam",assignFemale:"GV nữ",assignTW:"GV Đài",assignVN:"GV Việt",assignOil:"Massage dầu",confirmWithCounter:"Xác nhận với quầy",confirmWithAssigned:"Xác nhận với GV",editBtn:"Sửa",saveChange:"Lưu thay đổi",logConfirmCounter:"Đã xác nhận giờ với quầy",logConfirmAssigned:"Đã xác nhận với GV {0}",logEditChange:"Sửa: {0}",foreignSection:"Nhân viên nước ngoài",permitNoLabel:"Số giấy phép làm việc",langSchool:"Trường ngôn ngữ đang học",schoolType:"Đang học",schoolTypeLang:"Trường ngôn ngữ",schoolTypeUni:"Đại học",schoolTypeMaster:"Thạc sĩ",schoolTypePhd:"Tiến sĩ",selectLangSchool:"Chọn trường",closeThis:"Đóng trang",confirmedAssignedToast:"Đã xác nhận với GV {0}",confirmedCounterToast:"Đã xác nhận với quầy",statusUnconfirmed:"Chưa xác nhận",statusConfirmed:"Đã xác nhận",statusAssignedConfirmed:"Đã xác nhận với GV chỉ định",statusReconfirm:"Lịch hẹn đã đổi, xác nhận lại",statusTeacherProgress:"Đã xác nhận GV ({0}/{1})",confirmedTeacherToast:"Đã xác nhận GV ({0}/{1})",hidePast:"Ẩn đã qua",workTimeEdit:"Giờ làm việc",workStartH:"Vào ca",workEndH:"Tan ca",saveWorkTime:"Lưu giờ",internSup:"Phó QL thực tập",confirmSuccess:"Đã xác nhận, dữ liệu cập nhật",confirmFail:"Mã xác nhận sai",scanReqEntry:"Quét mã yêu cầu",reqBasic:"YC hồ sơ",reqStore:"YC cửa hàng",agreeWrite:"Đồng ý & ghi",disagree:"Không đồng ý",writeOk:"Đã ghi, mã XN: ",giveConfirmCode:"Đưa mã XN cho GV",logReqWritten:"Đã ghi YC {0}: {1}",uuidBound:"Đã gắn thiết bị",uuidNew:"Thiết bị mới",myBooking2:"Lịch hẹn của tôi",
tabHome2:"Trang chính",tabBackup:"Sao lưu",homeSettings:"Cài đặt trang chính",backupCenter:"Sao lưu",
curStore:"Cửa hàng hiện tại",applyChange:"Xin đổi",genBasicCode:"Tạo mã hồ sơ",genStoreCode:"Tạo mã cửa hàng",basicApplyCode:"Mã hồ sơ",storeApplyCode:"Mã cửa hàng",confirmCode2:"Mã xác nhận",copyBtn:"Sao chép",
syncStoreBooking:"Đồng bộ lịch hẹn cửa hàng",syncBtn:"Đồng bộ",pasteBtn:"Dán",noFuncYet:"(Chưa có chức năng)",tabViolation:"Vi phạm",violationTitle:"Hồ sơ vi phạm",noViolation:"Bạn chưa có ghi nhận vi phạm",violationCode:"Mã xác nhận vi phạm",dutyTitle:"Trực nhật",noDuty:"Chưa có ghi nhận trực nhật",prevConfirmed:"Giá trị xác nhận trước",needConfirm:"Vui lòng hoàn tất thông tin rồi xác nhận với quản lý",serviceStatus:"Trạng thái máy/kết nối",
privacyTitle:"Lưu trữ dữ liệu",privacyBody:"Mọi thông tin cá nhân và bảng lương chỉ lưu trên thiết bị của bạn, không tải lên máy chủ, cửa hàng và quản lý đều không đọc được.",
backupReminder:"Lịch hẹn và mọi dữ liệu chỉ lưu trên máy. Khi đổi điện thoại dữ liệu sẽ mất. Trước khi đổi máy, hãy vào trang Sao lưu để xuất mã sao lưu.",
basicUpdateCode:"Mã cập nhật hồ sơ",storeUpdateCode:"Mã cập nhật cửa hàng",basicConfirmCode:"Mã xác nhận hồ sơ",storeConfirmCode:"Mã xác nhận cửa hàng",conflictWarn:"Trùng với {0} {1}",dayOffWarn:"Hôm đó đã nghỉ {0}",units:"suất",partyUnit:"người",noWorkEnd:"Chưa đặt giờ tan làm",bookEdit:"Sửa",bookConfirmDesk:"Xác nhận quầy",bookConfirmed2:"Đã xác nhận với quầy",bookEditWarn:"Sau khi đổi giờ hãy xác nhận lại với quầy",bookLogTitle:"Lịch sử thay đổi",logCreate:"Tạo lịch hẹn",logConfirm:"Xác nhận với quầy",logChange:"Thay đổi lịch hẹn",logConflict:"Hệ thống phát hiện trùng giờ vẫn tạo",custEditTitle:"Sửa khách",custSave:"Lưu",bookSaveEdit:"Lưu thay đổi",timeChanged:"Giờ {0} → {1}",svcChanged:"DV {0} → {1}"}};

/* ══════════ Export to global (window.MP) ══════════ */
global.MP={
  LS,
  // crypto
  getKeyConfig,saveKeyConfig,buildDynamicKey,getCK,xEnc,xDec,fnv,
  adminHash,genAdminAct,revokeHash,approveHash,supApproveHash,genSimpleAct,
  encWithKey,decWithKey,actKey,genActWithToken,verifyActToken,genUUID,getDeviceId,
  genReqCode,parseReqCode,decReqCode,genConfirmCode,verifyConfirmCode,confirmCodeIsBound,REQ_CAT,
  // sup levels
  SUP_LEVELS,supLevelName,effSupLevel,
  // github
  getGHConfig,saveGHConfigLocal,saveGHConfig,ghReadFile,ghWriteFile,ghAppendLine,ghRemoveLine,
  // staff/stores/approval
  readStaff,writeStaff,checkApproved,writeApproval,loadStores,saveStores,
  getApproved,saveApproved,addApproved,
  // logs
  addLog,getLogs,fmtLog,fmtDate,
  // theme
  THEMES,
  // data helpers
  SKILL_KEYS,SKILL_SHORT,SKILL_PRICES,SKILL_COLORS,SK,SBG,STC,canWork,
  toB36,fromB36,dim,dow,bizDate,bizParts,BIZ_CUTOFF_MIN,dk,eDay,stamp,calcSal,eMon,encMonth,decBackup,
  getCustomers,saveCustomers,getBookings,saveBookings,uid,upsertCustomer,normPhone,searchCustomers,addBooking,updateBooking,deleteBooking,confirmBooking,BOOK_TITLES,bookTitleName,
  SERVICES,svcByCode,bookUnits,bookMinutes,bookLabel,bookRange,findConflicts,dayOffStatus,bookLog,skName,
  TW_REGIONS,LANG_SCHOOLS,
  // i18n
  T
};

})(window);
