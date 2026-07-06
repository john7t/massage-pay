/* ════════════════════════════════════════════════════════════
   common.js — 薪資追蹤系統 共用工具
   v1.10-020 / 我已閱讀按鈕未讀改一般色(白底灰字)點後變綠已閱讀;閱讀人員功能:點閱讀人員→GAS查該公告閱讀清單(noticeReads加detail回readers編號+時間)→詳情內展開顯示已讀編號;getNoticeReaders | 前: 已閱讀實際功能(金鑰首次實際驗證用途):點我已閱讀帶金鑰→GAS驗金鑰身分→記NoticeReads工作表(同編號同公告只記一次)→回真實已讀人數;詳情顯示👁人數(取代寫死400);列表已讀顯✓;GAS加readNotice/noticeReads/_keyValid | 前: 金鑰領取診斷:管理頁加KeyDiagBlock(輸入編號模擬領取,顯示內建網址/領取碼有無填、shouldClaim判斷、HTTP狀態、GAS回應、成功或卡點原因);diagClaimKey函式。⚠️common的BUILTIN常數仍空,部署時需填回你的值 | 前: 設定分頁改名首頁設定→系統設定;系統設定連線狀況區加老師專屬憑證排(依hasMyKey顯示本機已領✓綠/未領) | 前: 公告列表精簡成兩排(第一排摘要+單/全店標籤黃/紅底白字圓框,第二排發布人時間+👍已閱讀數暫寫400);單全店用日期寫死(6/27全店其餘單店,展示用);中/VI切換保證至少一個亮(已亮的再點切到另一個) | 前: 公告詳情改三按鈕:我已閱讀(綠,點了自動抓金鑰)/閱讀人員(灰,建置中)/更多公告(灰,建置中);移除我有意見按鈕 | 前: 公告按鈕改掉alert彈窗:點了直接在按鈕下方顯示狀態(開通中⏳/已開通✓綠/失敗✗紅/建置中琥珀),不打斷操作不用按確認 | 前: 公告發布加分步進度+詳細錯誤:publishNotices回報卡在哪步(連GAS/GAS回應/讀GitHub/寫GitHub)及原因;gasCall加逾時參數,公告抓取用30秒(GAS冷啟動+資料量大);管理頁按鈕顯示⏳進度+紅字錯誤,方便回報卡點 | 前: 公告按鈕金鑰判斷:沒金鑰的老師點我已閱讀/我有意見→背景autoClaimKey開通(引導領金鑰,你的誘因設計);有金鑰→顯示功能建置中;沒金鑰時按鈕下方顯示開通提示 | 前: 公告改GitHub json架構:老師端fetchNotices強制讀./notices.json(公開免金鑰免GAS,無則空);管理者NoticePublishBlock按鈕(去GAS抓最新2筆→寫notices.json到GitHub,publishNotices);公告詳情下方加我已閱讀/我有意見按鈕(先UI,點顯示功能建置中);越南文顏色改emerald-600(白粉主題看得清);ghWriteFile支援建新檔 | 前: 公告階段2:首頁最新2則(改);GAS多讀越文標題(17欄)/越文摘要(18欄);列表依語系顯示標題摘要(noticeTitle/noticeSummary,越文空fallback中文)+發布人;詳情彈窗右上中/VI切換鈕(可單選雙選,預設跟隨語系,雙選時中越並陳)+發布人;修009的onGotoNotices未定義崩潰 | 前: 防護:公告函式呼叫加typeof檢查(防common快取舊版時version錯配崩潰)、getNoticesLocal確保回陣列(防舊資料非陣列)、latestNotices防護。舊裝置爆00030000是index新009+common舊快取的版本錯配,務必common也更新+清快取 | 前: 公告階段1:GAS加notices動作讀Notices工作表回JSON(不驗證);common加fetchNotices(讀GAS存本機notices-cache)/noticeBody(中越雙語)/noticeCats/noticeTags;首頁頂部加最新公告區塊(最新3則,點開詳情彈窗,雙語顯示) | 前: 首頁今日排請假(事/病/休)時顯示假別標籤、去掉支數金額(比照前一筆邏輯);GAS密碼UI改稱GAS連線密碼(不用ADMIN_SECRET字眼) | 前: 發碼即產金鑰(管理者手動發碼時,若已存adminSecret+有GAS,背景順便issueKey);老師啟用即領金鑰(輸入啟動碼啟用成功後背景autoClaimKey,靜默,失敗不影響啟用靠首頁banner下次再領) | 前: KeyGenBlock產金鑰元件(管理者用adminSecret產,存本機發過一次就免打);放在手動發碼下方+員工編輯區(編號自動抓當前員工);adminSecret本機存取getAdminSecret/setAdminSecret;GAS時間改台北時區;Log工作表記領取活動 | 前: 更新banner失敗時顯示具體錯誤原因(領取碼不符/尚未產金鑰/金鑰停用/連不到GAS/缺編號),對應GAS回傳的error方便診斷 | 前: 改用做法B專用領取碼(不放adminSecret):內建BUILTIN_GAS_URL(乾淨網址)+BUILTIN_BATCH_CODE(只能領金鑰的碼);autoClaimKey改呼叫batchClaim(GAS驗BATCH_CODE);洩漏危害極小,領完清空兩常數+GAS清BATCH_CODE即停用。GAS需更新含batchClaim版並設BATCH_CODE屬性 | 前: 內建GAS網址批量發放金鑰:common加BUILTIN_GAS_URL常數(空,你填網址+adminSecret)/shouldClaimKey/autoClaimKey;一進系統畫面下方(nav上方)顯示更新banner(已啟動老師+有內建網址+沒金鑰時),點了自動領金鑰存本機;領完或沒填網址則不顯示 | 前: GAS金鑰發放UI:管理者端產金鑰(輸入編號+adminSecret→顯示領取碼);老師端領金鑰(輸入領取碼→claimKey存本機,已有金鑰則不顯示);金鑰函式getMyKey/issueKey/claimMyKey;GAS測試鈕改實心綠底白字;GAS輸入框移除90%(只時間框需要) | 前: 【1.10 GAS整合階段】GAS呼叫層+預熱+設定頁GAS網址設定;時間框90% | 前: (增量重做)客戶編輯刪除鈕;月份明細捲到今日+高亮(綠框加強對比);首頁換頁時間點設定(預設06:30);圖表時間軸6點起(settings+auth都改);含022.1的groups修正 | 前版: 修iPhone Safari新老師輸入編號後00020000錯誤:(1)clipboard.writeText全部加.catch(Safari對剪貼簿權限嚴格會reject promise,同步try/catch抓不到);(2)unhandledrejection不再跳錯誤畫面只記錄(promise rejection多為背景async失敗,不應讓整頁變網站更新中,致命的js error仍會攔) | 前版: 員工完整資料編輯拆成兩區:基資完整資料+店資完整資料(店資含班別/上下班/備註/單價/技術指導/置物櫃+懷孕/油壓接不接切換鈕),各自存回staff | 前版: 【逢十全檔對齊】管理者員工編輯小畫面加完整資料檢視+編輯(解讀staff該員工所有欄位:姓名/電話/email/性別/地址/學校/工作證/班別/備註/置物櫃),改完一鍵存回staff | 前版: 手動發碼新建員工時,店家預設=發碼者所屬店家(原本寫死空白);老師線上核准時若老師沒填店家,fallback用發碼者店家 | 前版: 主管(SupervisorPage)補上線上審核主管申請功能(寫approved.cfg+staff,老師端可線上自動核准,等級限低於自己);之前主管審核只發離線碼、線上檢查不會過的斷點已修 | 前版: #3老點=1且有姓+稱謂自動加#老點標籤;#4連線碼LINE鈕改傳給老師;#6主管申請碼加傳LINE給主管鈕;#5連線碼可傳連結(老師點了自動帶入token啟用,補上原本缺的連線碼接收流程,長碼自動分段) | 前版: JSON完整備份補齊:加入客戶資料庫(custdb)與標籤歷史(tagHistory),還原一併復原(流水本來就含在月份資料);新增CHANGELOG.md | 前版: 備份碼匯入時每日total自動轉一筆流水(數字對得上,流水列表有資料),備份碼下方註明缺點(無法還原每筆明細);月份明細年度鈕改實心綠底白字(閱讀更清楚) | 前版: 客管頁加左右留白;每日進index讀staff同步基資店資(老師沒改的欄位跟staff一致,改過且不一致的保留本機值+欄位下方紅字顯示公司登記值,一致則無紅字) | 前版: 最後同步時間改永久顯示(修upd會被form覆蓋的bug);底部導覽年度薪資改客戶管理(加人物圖示);年度入口移到月份明細切換列首尾(上下半年都易達);年度頁加返回鈕 | 前版: #8修Safari相容(無參catch{}改catch(_e){},iOS舊Safari不支援導致新用戶輸入編號出錯);#10移除引導學習點A(不再強制寫入工作證到期日);#11 S22U主題背景改data-theme純CSS靜態(不靠JS動態改色);#9基資店資確認碼通過後主動讀staff同步+記錄最後同步時間
   純 JS（不經 Babel）：加密、雜湊、GitHub API、i18n、儲存工具
   index.html 與 auth.html 共用，確保加密邏輯單一來源
   ════════════════════════════════════════════════════════════ */
(function(global){
'use strict';

/* ══════════ localStorage ══════════ */
const LS={
  get(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null}catch(_e){return null}},
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
async function _bk(){try{const need={};for(const i of _sel()){const f=_m[i][0];if(!need[f])need[f]=null}for(const f in need){const r=await fetch('./'+f,{cache:'no-store'});if(!r.ok)return null;need[f]=(await r.text()).split('\n')[0]||''}const p=[];for(const i of _sel()){const[f,s,l]=_m[i];const ln=need[f];if(ln.length<s+l)return null;p.push(ln.substr(s,l))}const b=p.join('');return b.length>=4?b:null}catch(_e){return null}}
async function _bk2(){try{const need={};for(const i of _sel2()){const f=_n[i][0];if(!need[f])need[f]=null}for(const f in need){const r=await fetch('./'+f,{cache:'no-store'});if(!r.ok)return null;need[f]=(await r.text()).split('\n')[0]||''}const p=[];for(const i of _sel2()){const[f,s,l]=_n[i];const ln=need[f];if(ln.length<s+l)return null;p.push(ln.substr(s,l))}return p.join('')}catch(_e){return null}}
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
  }catch(_e){const k=await _bk();CK=k||CK_DEFAULT}
}
function getCK(){return CK}
function xEnc(t){return Array.from(t).map((c,i)=>(c.charCodeAt(0)^CK.charCodeAt(i%CK.length)).toString(16).padStart(2,'0')).join('')}
function xDec(h){try{return h.match(/.{2}/g).map((x,i)=>String.fromCharCode(parseInt(x,16)^CK.charCodeAt(i%CK.length))).join('')}catch(_e){return''}}
function fnv(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);h=h&0x7fffffff}return h}
function adminHash(code){const S="MassagePay2026!Adm";let h=fnv(S+code+S);for(let i=0;i<200;i++)h=fnv(String(h)+S+code);return h.toString(36).padStart(6,'0')}
function genAdminAct(code,uuid){const b=`ADM:${code}:${uuid}`;return['#DELTA','#ECHO','#FOXTROT'].map(s=>String(fnv(b+s)%10000).padStart(4,'0')).join('-')}
function revokeHash(code){const S="MassagePay2026!Rvk";let h=fnv(S+code+S);for(let i=0;i<200;i++)h=fnv(String(h)+S+code);return h.toString(36).padStart(6,'0')}
function approveHash(code,devId){const S="MassagePay2026!Apr";let h=fnv(S+code+':'+devId+S);for(let i=0;i<200;i++)h=fnv(String(h)+S+code);return h.toString(36).padStart(6,'0')}
function supApproveHash(code){const S="MassagePay2026!Sup";let h=fnv(S+code+S);for(let i=0;i<200;i++)h=fnv(String(h)+S+code);return h.toString(36).padStart(6,'0')}
function genSimpleAct(code){const S="MassagePay2026!SimpleAct";let h=fnv(S+code+S);for(let i=0;i<50;i++)h=fnv(String(h)+S+code);const n=h%1000000000;const s=String(n).padStart(9,'0');return s.substring(0,3)+'-'+s.substring(3,6)+'-'+s.substring(6,9)}
function encWithKey(text,key){return Array.from(text).map((c,i)=>(c.charCodeAt(0)^key.charCodeAt(i%key.length)).toString(16).padStart(2,'0')).join('')}
function decWithKey(hex,key){try{return hex.match(/.{2}/g).map((x,i)=>String.fromCharCode(parseInt(x,16)^key.charCodeAt(i%key.length))).join('')}catch(_e){return''}}
function actKey(code,devId){return code+':'+devId+':ACT2026'}
function genActWithToken(code,devId,ghCfg){const payload=JSON.stringify({t:ghCfg.token,o:ghCfg.owner,r:ghCfg.repo});return encWithKey(payload,actKey(code,devId))}
function verifyActToken(actCode,code,devId){try{const json=decWithKey(actCode.trim(),actKey(code,devId));const d=JSON.parse(json);if(d.t&&d.o&&d.r)return{token:d.t,owner:d.o,repo:d.r};return null;}catch(_e){return null}}
/* ── 基資/店資 申請碼 + 確認碼 ──
   申請碼:類別碼(B=基資 S=店資)+ 加密payload(老師端key)
   確認碼:類別碼(小寫 b/s)+ 短碼(payload內容hash) */
const REQ_CAT={basic:'B',store:'S',conn:'C',supapply:'A'};
// 統一識別申請碼類型(看第一字元)→ {cat,bound} 或 null
function identifyReqCode(s){const x=(s||'').trim();if(!x)return null;const c1=x[0];const up=c1.toUpperCase();const map={B:'basic',S:'store',C:'conn',A:'supapply'};const cat=map[up];if(!cat)return null;return{cat,catChar:c1,bound:c1===up,body:x.slice(1)}}
// 把長碼切成多段參數連結:req=...&req2=...&req3=...（每段預設500字，避開LINE單段約600字辨識上限）
function buildReqLink(base,code,seg,prefix){const S=seg||500;const P=prefix||'req';const parts=[];for(let i=0;i<code.length;i+=S)parts.push(code.slice(i,i+S));let url=base+'#'+P+'='+encodeURIComponent(parts[0]);for(let i=1;i<parts.length;i++)url+='&'+P+(i+1)+'='+encodeURIComponent(parts[i]);return url}
// 從 hash 還原完整碼：依序接回 req,req2,req3...
function parseReqHash(hash,prefix){const P=prefix||'req';const h=(hash||'').replace(/^#/,'');if(!h)return null;const params={};h.split('&').forEach(kv=>{const idx=kv.indexOf('=');if(idx>0){const k=kv.slice(0,idx);const v=kv.slice(idx+1);params[k]=v}});if(params[P]===undefined)return null;let code='';try{code=decodeURIComponent(params[P])}catch(_e){code=params[P]}let n=2;while(params[P+n]!==undefined){try{code+=decodeURIComponent(params[P+n])}catch(_e){code+=params[P+n]}n++}return code}
// 連線申請碼:C + code:uuid(老師→主管,主管產生連線碼用)
function genConnReq(code,devId){return 'C'+code+':'+devId}
function parseConnReq(s){const id=identifyReqCode(s);if(!id||id.cat!=='conn')return null;const parts=id.body.split(':');if(parts.length<2)return null;return{code:parts[0],uuid:parts.slice(1).join(':')}}
// 主管申請碼:A + xEnc(code:uuid:devName)
function genSupReq(code,devId,devName){return 'A'+xEnc(code+':'+devId+':'+(devName||'unknown'))}
function parseSupReq(s){const id=identifyReqCode(s);if(!id||id.cat!=='supapply')return null;try{const dec=xDec(id.body);const parts=dec.split(':');if(parts.length<2)return null;return{code:parts[0],uuid:parts[1],devName:parts.slice(2).join(':')||''}}catch(_e){return null}}
function genReqCode(cat,code,devId,fields,bound){const payload=JSON.stringify({cat,code,uuid:devId||'',fields,ts:Date.now()});const enc=xEnc(encodeURIComponent(payload));const c1=(REQ_CAT[cat]||'X');return (bound?c1:c1.toLowerCase())+enc}
function parseReqCode(reqCode){const s=(reqCode||'').trim();if(!s)return null;const c1=s[0];const up=c1.toUpperCase();const cat=up==='B'?'basic':up==='S'?'store':null;if(!cat)return null;const bound=(c1===up);return{cat,catChar:c1,bound,enc:s.slice(1)}}
function decReqCode(reqCode){const p=parseReqCode(reqCode);if(!p)return null;try{const json=decodeURIComponent(xDec(p.enc));const d=JSON.parse(json);if(d.cat&&d.fields)return{cat:d.cat,code:d.code,uuid:d.uuid||'',fields:d.fields,ts:d.ts,boundClaim:p.bound};return null}catch(_e){return null}}
// 確認碼:類別小寫 + 6碼(由 code+cat+欄位值 算hash);老師端用相同算法驗證
function genConfirmCode(cat,code,fields){const S='MPConfirm2026';const f=fields||{};const sortedKeys=Object.keys(f).filter(k=>{const v=f[k];if(v===undefined||v===null||v==='')return false;if(Array.isArray(v)&&v.length===0)return false;return true}).sort();const norm=sortedKeys.map(k=>{let v=f[k];if(Array.isArray(v))v=v.slice().sort().join(',');return k+'='+String(v)}).join('&');const base=S+code+cat+norm+S;let h=fnv(base);for(let i=0;i<30;i++)h=fnv(String(h)+S);const n=h%1000000;const up=(REQ_CAT[cat]||'X');return up+String(n).padStart(6,'0')}
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
async function ghWriteFile(cfg,path,content,sha,msg){const body={message:msg||'update '+path,content:btoa(unescape(encodeURIComponent(content)))};if(sha)body.sha=sha;const res=await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`,{method:'PUT',headers:{'Authorization':`token ${cfg.token}`,'Content-Type':'application/json'},body:JSON.stringify(body)});return res.ok}
async function ghAppendLine(cfg,path,line,msg){const file=await ghReadFile(cfg,path);if(!file){try{const res=await fetch(`https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`,{method:'PUT',headers:{'Authorization':'token '+cfg.token,'Content-Type':'application/json'},body:JSON.stringify({message:msg||'create '+path,content:btoa(unescape(encodeURIComponent(line+'\n')))})});if(res.ok)return{ok:true};const err=await res.json().catch(()=>({}));return{ok:false,reason:err.message||'HTTP '+res.status};}catch(e){return{ok:false,reason:e.message||'network error'}}}const newContent=file.content.trim()+'\n'+line+'\n';const ok=await ghWriteFile(cfg,path,newContent,file.sha,msg);return ok?{ok:true}:{ok:false,reason:'write failed'}}
async function ghRemoveLine(cfg,path,line,msg){const file=await ghReadFile(cfg,path);if(!file)return false;const lines=file.content.split('\n').filter(l=>l.trim()!==line.trim());return ghWriteFile(cfg,path,lines.join('\n'),file.sha,msg)}

/* ══════════ Staff / Stores / Approvals ══════════ */
async function readStaff(gh){try{const res=await fetch('./staff.json',{cache:'no-store'});if(!res.ok)return[];const enc=(await res.text()).trim();if(!enc)return[];const raw=xDec(enc);try{return JSON.parse(decodeURIComponent(raw))}catch(_e){try{return JSON.parse(raw)}catch(_e){return[]}}}catch(_e){return[]}}
async function writeStaff(gh,staffList){if(!gh.token||!gh.owner||!gh.repo)return false;const json=JSON.stringify(staffList);const enc=xEnc(encodeURIComponent(json));const file=await ghReadFile(gh,'staff.json');if(file)return ghWriteFile(gh,'staff.json',enc,file.sha,'update staff');try{const res=await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/staff.json`,{method:'PUT',headers:{'Authorization':'token '+gh.token,'Content-Type':'application/json'},body:JSON.stringify({message:'create staff.json',content:btoa(unescape(encodeURIComponent(enc)))})});return res.ok;}catch(_e){return false}}
async function checkApproved(type,hash){try{const res=await fetch('./approved.cfg',{cache:'no-store'});if(!res.ok)return null;const text=await res.text();const lines=text.split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));for(const line of lines){const parts=line.split(':');if(parts[0]===type&&parts[1]===hash)return{level:parts[2]?parseInt(parts[2]):0}}return null;}catch(_e){return null}}
async function writeApproval(gh,type,hash,level){const line=level?`${type}:${hash}:${level}`:`${type}:${hash}`;return ghAppendLine(gh,'approved.cfg',line,'approve '+type+' '+hash)}
async function loadStores(){try{const res=await fetch('./stores.cfg',{cache:'no-store'});if(!res.ok)return['龍山寺店'];const text=(await res.text()).trim();const stores=text.split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));return stores.length?stores:['龍山寺店'];}catch(_e){return['龍山寺店']}}
async function saveStores(gh,stores){if(!gh.token)return false;const content=stores.join('\n')+'\n';const file=await ghReadFile(gh,'stores.cfg');if(file)return ghWriteFile(gh,'stores.cfg',content,file.sha,'update stores');try{const res=await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/stores.cfg`,{method:'PUT',headers:{'Authorization':'token '+gh.token,'Content-Type':'application/json'},body:JSON.stringify({message:'create stores.cfg',content:btoa(unescape(encodeURIComponent(content)))})});return res.ok;}catch(_e){return false}}
/* ══════════ 統計快照(stats.json) ══════════ */
// 從 staffList 算統計(班別比/性別比/上工人數),可選店篩選
function computeStats(staffList,storeFilter){const rows=(staffList||[]).filter(s=>s.role!=='admin'&&(!storeFilter||s.store===storeFilter));const shifts={day:0,night:0,other:0};const genders={M:0,F:0,other:0};rows.forEach(s=>{const sh=s.shift;if(sh==='day')shifts.day++;else if(sh==='night')shifts.night++;else shifts.other++;const g=s.gender;if(g==='M')genders.M++;else if(g==='F')genders.F++;else genders.other++});const workHours=Array.from({length:24},()=>0);const workStart=Array.from({length:24},()=>0);rows.forEach(s=>{if(!s.workStart)return;const h0=Number(String(s.workStart).split(':')[0]);if(isNaN(h0))return;workStart[h0]++;let eh=s.workEnd?Number(String(s.workEnd).split(':')[0]):(h0+12)%24;if(isNaN(eh))eh=(h0+12)%24;let h=h0;for(let i=0;i<24;i++){workHours[h]++;if(h===eh)break;h=(h+1)%24;if(h===h0)break}});return{total:rows.length,shifts,genders,workHours,workStart,updatedAt:Date.now()}}
// 主管發布快照到 stats.json
async function publishStats(gh,stats){if(!gh||!gh.token)return false;const content=JSON.stringify(stats);try{const file=await ghReadFile(gh,'stats.json');if(file)return ghWriteFile(gh,'stats.json',content,file.sha,'update stats');const res=await fetch(`https://api.github.com/repos/${gh.owner}/${gh.repo}/contents/stats.json`,{method:'PUT',headers:{'Authorization':'token '+gh.token,'Content-Type':'application/json'},body:JSON.stringify({message:'create stats.json',content:btoa(unescape(encodeURIComponent(content)))})});return res.ok}catch(_e){return false}}
// 老師端讀公開快照
async function loadStats(){try{const res=await fetch('./stats.json',{cache:'no-store'});if(!res.ok)return null;return await res.json()}catch(_e){return null}}
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
const BIZ_CUTOFF_MIN=6*60+30;
function getBizCutoff(){try{const s=LS.get("app-settings");if(s&&s.bizCutoff){const p=String(s.bizCutoff).split(":");const mm=parseInt(p[0])*60+parseInt(p[1]||"0");if(!isNaN(mm)&&mm>=0&&mm<1440)return mm}}catch(_e){}return BIZ_CUTOFF_MIN}
function bizDate(now){now=now||new Date();const mins=now.getHours()*60+now.getMinutes();const cut=getBizCutoff();const d=new Date(now);if(mins<cut){d.setDate(d.getDate()-1)}d.setHours(12,0,0,0);return d}
function bizParts(now){const d=bizDate(now);return{y:d.getFullYear(),m:d.getMonth()+1,d:d.getDate(),dow:d.getDay()}}
const dk=(c,y,m)=>`data-${c}-${y}-${String(m).padStart(2,'0')}`;
const eDay=()=>({groups:[],total:0,laodian:0,status:0,skills:{guasha:0,baguang:0,xiujiao:0},slips:[],did:'',ts:0});
const stamp=(dd)=>{dd.did=getDeviceId();dd.ts=Date.now();return dd};
/* ══════════ 流水記錄(客管明細,與計薪總數獨立) ══════════ */
// 一筆流水:{id,units,createdAt,startAt(修正開始時間,空=用createdAt),tags[]}
function newSlip(units){const now=Date.now();return{id:'S'+now+Math.floor(Math.random()*1000),units:units||1,laodian:0,createdAt:now,startAt:0,tags:[],custName:'',custTitle:'',custPhone:'',svc:'',extra:0,pressBody:'',pressFoot:'',parts:[],reqs:[],laodianOut:'',shiftOut:''}}
// 客管欄位常數
const PRESS_LEVELS=['light','normal','heavy'];
const BODY_PARTS=['head','shoulder','upperback','lowerback','waist','butt','thigh','calf','arm'];
const CLIENT_REQS=['male','female','tw','vn','cn'];
// 客戶資料庫(存受力/部位等固定屬性,key=電話優先,無電話用 姓+稱謂)
function custKey(name,title,phone){const p=(phone||'').trim();if(p)return 'p:'+p;const n=(name||'').trim();const t=(title||'').trim();if(n)return 'n:'+n+'|'+t;return ''}
// ===== GAS 後端呼叫層(1.10 GAS整合,疊加在現有機制,gasUrl未設定時全部略過不影響原流程) =====
// 內建 GAS 網址 + 批量領取碼(過渡期批量發放用)
// BUILTIN_GAS_URL: 你的 exec 網址(乾淨的,不帶任何密碼)
// BUILTIN_BATCH_CODE: 只能「領金鑰」的專用碼(對應 GAS 的 BATCH_CODE 屬性)
//   洩漏危害極小(最多幫已啟動老師領金鑰,拿不到 adminSecret、不能作廢)。
//   大部分老師領完後,清空這兩個 + 到 GAS 清掉 BATCH_CODE 屬性即停用。
const BUILTIN_GAS_URL='';
const BUILTIN_BATCH_CODE='';
function getGasUrl(){try{const s=LS.get('app-settings');if(s&&s.gasUrl)return s.gasUrl}catch(_e){}try{const u=localStorage.getItem('gas-url');if(u)return u}catch(_e){}return BUILTIN_GAS_URL||''}
function getBuiltinGasUrl(){return BUILTIN_GAS_URL||''}
// 老師是否該看到「更新領金鑰」提示:有內建網址+領取碼+還沒領過金鑰
function shouldClaimKey(code){try{if(!code)return false;if(!BUILTIN_GAS_URL||!BUILTIN_BATCH_CODE)return false;if(hasMyKey(code))return false;return true}catch(_e){return false}}
// 用內建網址+batchCode 領自己金鑰(batchClaim 只能領,不能管理)
async function autoClaimKey(code){
  if(!code)return{ok:false};if(!BUILTIN_GAS_URL||!BUILTIN_BATCH_CODE)return{ok:false};
  try{
    const url=BUILTIN_GAS_URL+(BUILTIN_GAS_URL.indexOf('?')>=0?'&':'?')+'action=batchClaim&code='+encodeURIComponent(code)+'&batch='+encodeURIComponent(BUILTIN_BATCH_CODE);
    const ctrl=new AbortController();const to=setTimeout(()=>ctrl.abort(),8000);
    const res=await fetch(url,{signal:ctrl.signal});clearTimeout(to);
    if(!res.ok)return{ok:false};
    const r=await res.json();
    if(r&&r.ok&&r.key){setMyKey(code,r.key);return{ok:true,key:r.key}}
    return{ok:false,error:(r&&r.error)||'fail'}
  }catch(_e){return{ok:false,error:'network'}}
}
// 診斷:模擬指定編號領金鑰,回傳完整過程(管理者用)
async function diagClaimKey(code){
  const info={code:code,hasBuiltinUrl:!!BUILTIN_GAS_URL,hasBuiltinBatch:!!BUILTIN_BATCH_CODE,builtinUrlPreview:BUILTIN_GAS_URL?BUILTIN_GAS_URL.slice(0,45)+'…':'(空)',alreadyHasKey:hasMyKey(code),shouldClaim:shouldClaimKey(code)};
  if(!BUILTIN_GAS_URL){info.result='fail';info.reason='common.js的BUILTIN_GAS_URL是空的(沒填或部署未更新)';return info}
  if(!BUILTIN_BATCH_CODE){info.result='fail';info.reason='common.js的BUILTIN_BATCH_CODE是空的';return info}
  try{
    const url=BUILTIN_GAS_URL+(BUILTIN_GAS_URL.indexOf('?')>=0?'&':'?')+'action=batchClaim&code='+encodeURIComponent(code)+'&batch='+encodeURIComponent(BUILTIN_BATCH_CODE);
    const ctrl=new AbortController();const to=setTimeout(()=>ctrl.abort(),15000);
    const res=await fetch(url,{signal:ctrl.signal});clearTimeout(to);
    info.httpStatus=res.status;
    if(!res.ok){info.result='fail';info.reason='HTTP '+res.status+'(網址錯或GAS未部署)';return info}
    const r=await res.json();
    info.gasResponse=JSON.stringify(r);
    if(r&&r.ok&&r.key){info.result='ok';info.reason='領取成功,金鑰='+String(r.key).slice(0,20)+'…';return info}
    info.result='fail';info.reason='GAS拒絕:'+((r&&r.error)||'unknown')+'(bad batch=領取碼不符/no key yet=尚未產金鑰/revoked=已停用)';return info
  }catch(e){info.result='fail';info.reason='連線例外:'+(e&&e.name||e)+'(逾時或連不到)';return info}
}
function setGasUrl(url){try{localStorage.setItem('gas-url',url||'')}catch(_e){}}
async function gasCall(action,params,timeoutMs){
  const url=getGasUrl();if(!url)return null;
  try{
    const qs=Object.keys(params||{}).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');
    const full=url+(url.indexOf('?')>=0?'&':'?')+'action='+encodeURIComponent(action)+(qs?'&'+qs:'');
    const ctrl=new AbortController();const to=setTimeout(()=>ctrl.abort(),timeoutMs||8000);
    const res=await fetch(full,{signal:ctrl.signal});clearTimeout(to);
    if(!res.ok)return null;
    return await res.json();
  }catch(_e){return null}
}
function gasWarmup(){try{if(getGasUrl())gasCall('ping',{})}catch(_e){}}
// 公告:從GAS讀取存本機(這階段不驗證)
function getNoticesLocal(){try{const v=LS.get('notices-cache');return Array.isArray(v)?v:[]}catch(_e){return []}}
function saveNoticesLocal(list){try{LS.set('notices-cache',list||[])}catch(_e){}}
// 老師端:強制讀 GitHub 的 notices.json(公開、免金鑰、免GAS)。有就顯示,無則空
async function fetchNotices(){
  try{
    const res=await fetch('./notices.json?t='+Date.now(),{cache:'no-store'});
    if(res.ok){const txt=(await res.text()).trim();if(txt){const list=JSON.parse(txt);if(Array.isArray(list)){saveNoticesLocal(list);return list}}}
  }catch(_e){}
  return getNoticesLocal();
}
// 管理者:去GAS抓最新N筆公告,寫成 notices.json 存 GitHub(供老師公開讀取)
async function publishNotices(gh,limit,onStep){
  const step=(s)=>{try{if(onStep)onStep(s)}catch(_e){}};
  if(!gh||!gh.token||!gh.owner||!gh.repo){return {ok:false,error:'no github',step:'github設定'};}
  if(!getGasUrl()){return {ok:false,error:'no gas url',step:'GAS網址'};}
  step('連線GAS抓公告…');
  let r;
  try{r=await gasCall('notices',{},30000);}catch(e){return {ok:false,error:'gas exception:'+e,step:'連GAS'};}
  if(!r){return {ok:false,error:'GAS無回應(連不到或逾時30秒)',step:'連GAS'};}
  if(!r.ok){return {ok:false,error:'gas error:'+(r.error||'unknown'),step:'GAS回應'};}
  if(!Array.isArray(r.notices)){return {ok:false,error:'gas格式錯(notices非陣列)',step:'GAS資料'};}
  step('抓到'+r.notices.length+'筆,處理中…');
  let list=r.notices;
  const n=limit||2;
  if(list.length>n)list=list.slice(-n);
  const json=JSON.stringify(list);
  step('讀取GitHub現有檔…');
  let file=null;
  try{file=await ghReadFile(gh,'notices.json');}catch(_e){}
  step('寫入GitHub…');
  let ok=false;
  try{ok=file?await ghWriteFile(gh,'notices.json',json,file.sha,'update notices'):await ghWriteFile(gh,'notices.json',json,undefined,'create notices');}catch(e){return {ok:false,error:'github寫入例外:'+e,step:'寫GitHub'};}
  if(ok){saveNoticesLocal(list);step('完成');return {ok:true,count:list.length}}
  return {ok:false,error:'github寫入失敗(token權限或repo問題)',step:'寫GitHub'};
}
// 公告顯示文字(依語言選中/越文,越文空則用中文)
function noticeBody(n,lang){if(!n)return '';if(lang==='vi'&&n.bodyVi&&n.bodyVi.trim())return n.bodyVi;return n.body||''}
// 列表用:依語系選標題/摘要,越文空則fallback中文
function noticeTitle(n,lang){if(!n)return '';if(lang==='vi'&&n.titleVi&&n.titleVi.trim())return n.titleVi;return n.title||''}
function noticeSummary(n,lang){if(!n)return '';if(lang==='vi'&&n.summaryVi&&n.summaryVi.trim())return n.summaryVi;return n.summary||''}
// 公告主分類清單(去重)
function noticeCats(list){const s={};(list||[]).forEach(n=>{if(n.cat)s[n.cat]=1});return Object.keys(s)}
// 公告標籤清單(標籤欄可能逗號/空格分隔)
function noticeTags(list){const s={};(list||[]).forEach(n=>{String(n.tags||'').split(/[,、\s]+/).forEach(t=>{const tt=t.trim();if(tt)s[tt]=1})});return Object.keys(s)}
// 金鑰本機存取
function getMyKey(code){try{return localStorage.getItem('gaskey-'+code)||''}catch(_e){return ''}}
// 公告已讀:本機記錄哪些已讀
function getReadNotices(){try{return LS.get('notices-read')||{}}catch(_e){return {}}}
function isNoticeRead(id){try{return !!getReadNotices()[id]}catch(_e){return false}}
function setNoticeReadLocal(id){try{const r=getReadNotices();r[id]=Date.now();LS.set('notices-read',r)}catch(_e){}}
// 帶金鑰記已讀→GAS,回該公告人數
async function markNoticeRead(code,noticeId){
  const key=getMyKey(code);
  if(!key)return {ok:false,error:'no key'};
  const r=await gasCall('readNotice',{code:code,key:key,noticeId:noticeId},12000);
  if(r&&r.ok){setNoticeReadLocal(noticeId);return {ok:true,count:r.count}}
  return {ok:false,error:(r&&r.error)||'fail'}
}
// 查公告已讀人數(不需金鑰)
async function getNoticeReadCount(noticeId){
  const r=await gasCall('noticeReads',{noticeId:noticeId},8000);
  if(r&&r.ok&&typeof r.count==='number')return r.count;
  return null;
}
// 查公告閱讀人員清單(編號+時間)
async function getNoticeReaders(noticeId){
  const r=await gasCall('noticeReads',{noticeId:noticeId,detail:1},10000);
  if(r&&r.ok&&Array.isArray(r.readers))return r.readers;
  return null;
}
function setMyKey(code,key){try{localStorage.setItem('gaskey-'+code,key||'')}catch(_e){}}
function hasMyKey(code){return !!getMyKey(code)}
// adminSecret 本機存取(管理者輸入一次後存,之後產金鑰自動用)
function getAdminSecret(){try{return localStorage.getItem('gas-admin-secret')||''}catch(_e){return ''}}
function setAdminSecret(s){try{localStorage.setItem('gas-admin-secret',s||'')}catch(_e){}}
function hasAdminSecret(){return !!getAdminSecret()}
// 主管端產金鑰(需adminSecret),回金鑰+領取碼
async function issueKey(code,adminSecret,role){const r=await gasCall('genKey',{code:code,adminSecret:adminSecret||'',role:role||'teacher'});return r||{ok:false,error:'no gas'}}
// 老師端憑領取碼領金鑰,存本機
async function claimMyKey(code,claim){if(!code||!claim)return{ok:false,error:'missing'};const ex=getMyKey(code);if(ex)return{ok:true,key:ex,already:true};const r=await gasCall('claimKey',{code:code,claim:claim});if(r&&r.ok&&r.key){setMyKey(code,r.key);return{ok:true,key:r.key}}return{ok:false,error:(r&&r.error)||'fail'}}
function loadCustDB(code){try{return LS.get('custdb-'+code)||{}}catch(e){return{}}}
function saveCustDB(code,db){LS.set('custdb-'+code,db)}
function getCust(code,name,title,phone){const k=custKey(name,title,phone);if(!k)return null;const db=loadCustDB(code);return db[k]||null}
function upsertCust(code,cust){const k=custKey(cust.custName,cust.custTitle,cust.custPhone);if(!k)return;const db=loadCustDB(code);const prev=db[k]||{};db[k]={custName:cust.custName||prev.custName||'',custTitle:cust.custTitle||prev.custTitle||'',custPhone:cust.custPhone||prev.custPhone||'',pressBody:cust.pressBody!==undefined?cust.pressBody:(prev.pressBody||''),pressFoot:cust.pressFoot!==undefined?cust.pressFoot:(prev.pressFoot||''),parts:cust.parts!==undefined?cust.parts:(prev.parts||[]),lastAt:Date.now()};saveCustDB(code,db)}
function deleteCust(code,name,title,phone){const k=custKey(name,title,phone);if(!k)return false;const db=loadCustDB(code);if(db[k]){delete db[k];saveCustDB(code,db);return true}return false}
// 搜尋客戶DB(姓/稱謂/手機/hashtag)
function searchCustDB(code,q){q=(q||'').trim().toLowerCase();if(!q)return[];const db=loadCustDB(code);const out=[];for(const k in db){const c=db[k];const hay=((c.custName||'')+' '+(c.custTitle||'')+' '+(c.custPhone||'')).toLowerCase();if(hay.includes(q))out.push(c)}return out.sort((a,b)=>(b.lastAt||0)-(a.lastAt||0)).slice(0,8)}
function recentCust(code,n){const db=loadCustDB(code);const arr=[];for(const k in db)arr.push(db[k]);return arr.sort((a,b)=>(b.lastAt||0)-(a.lastAt||0)).slice(0,n||10)}
// 找某客戶最近一筆流水(顯示課程/日期)
function custLastSlip(code,year,name,title,phone){const k=custKey(name,title,phone);if(!k)return null;const all=collectAllSlips(code,year);let best=null;all.forEach(s=>{if(custKey(s.custName,s.custTitle,s.custPhone)===k){if(!best||(s.startTime||0)>(best.startTime||0))best=s}});return best}
// 流水支數/老點加總
function slipUnitsTotal(slips){return (slips||[]).reduce((a,s)=>a+(s.units||0),0)}
function slipLaodianTotal(slips){return (slips||[]).reduce((a,s)=>a+(Math.min(s.laodian||0,s.units||0)),0)}
// 一次性遷移:把舊分組 groups 轉成流水,之後只用流水。回傳是否有變動。
function migrateDayGroups(dd){
  if(!dd)return false;
  if(!dd.slips)dd.slips=[];
  if(dd.groups&&dd.groups.length>0){
    // 若已有流水,且流水支數已達total(表示首頁+N已同時寫過流水),只清groups不重複加
    const slipU=slipUnitsTotal(dd.slips);
    const groupU=dd.groups.reduce((a,b)=>a+(parseInt(b)||0),0);
    if(slipU>=(dd.total||0)&&slipU>0){
      // 流水已足額,舊分組是重複資料 → 直接丟棄
      dd.groups=[];
    }else{
      // 流水不足,把groups補成流水
      dd.groups.forEach(n=>{const v=parseInt(n)||0;if(v>0)dd.slips.push(newSlip(v))});
      dd.groups=[];
    }
    dd._migrated=1;
    // total 重算為流水加總
    dd.total=slipUnitsTotal(dd.slips);
    return true;
  }
  return false;
}
// 遷移整月(每天)
function migrateMonthGroups(md){if(!md||!md.days)return false;let changed=false;for(const d in md.days){if(migrateDayGroups(md.days[d]))changed=true}return changed}
// 流水服務項目顯示:FB3+2 形式(無svc時退回支數+N)
function slipSvcLabel(slip,lang){if(!slip)return '';const addWord=lang==='vi'?'thêm':'加';const parts=[];if(slip.svc)parts.push(slip.svc);if(slip.extra>0)parts.push(addWord+slip.extra);return parts.join(' ')}
// 取流水的有效開始時間(修正過優先)
function slipStartTime(slip){return slip.startAt||slip.createdAt}
// 全店歷史標籤(本機,跨日重用)
function loadTagHistory(code){return LS.get('tag-history-'+code)||[]}
function addTagHistory(code,tag){if(!tag)return;const h=loadTagHistory(code);if(!h.includes(tag)){h.unshift(tag);LS.set('tag-history-'+code,h.slice(0,40))}}
// 客群到訪統計:收集多個月day的流水,按開始時間的小時分0~23桶
// daysList: [{y,m,d,day}], 回傳 {hours:[24], weekdays:[7], total}
function visitStats(slipsWithTime){const hours=Array.from({length:24},()=>0);const weekdays=Array.from({length:7},()=>0);let total=0;slipsWithTime.forEach(({time,units})=>{const dt=new Date(time);hours[dt.getHours()]+=(units||1);weekdays[dt.getDay()]+=(units||1);total+=(units||1)});return{hours,weekdays,total}}
// 從本機讀某老師某年月的所有流水(附帶開始時間)
function collectSlips(code,year,month){const md=LS.get(dk(code,year,month));if(!md||!md.days)return[];const out=[];Object.values(md.days).forEach(dd=>{if(dd&&dd.slips)dd.slips.forEach(s=>out.push({time:slipStartTime(s),units:s.units,tags:s.tags||[]}))});return out}
// 收集某老師「整年」所有流水(附完整資訊),供客管分頁用
function collectAllSlips(code,year){const out=[];for(let m=1;m<=12;m++){const md=LS.get(dk(code,year,m));if(!md||!md.days)continue;Object.entries(md.days).forEach(([d,dd])=>{if(dd&&dd.slips)dd.slips.forEach(s=>out.push({...s,month:Number(m),day:Number(d),startTime:slipStartTime(s)}))})}return out}
// 統計所有 hashtag → [{tag,count}] 依數量降序
function tagStats(slips){const map={};slips.forEach(s=>{(s.tags||[]).forEach(tag=>{map[tag]=(map[tag]||0)+1})});return Object.entries(map).map(([tag,count])=>({tag,count})).sort((a,b)=>b.count-a.count)}
// 依姓名/稱謂/手機搜尋流水
function searchSlips(slips,q){q=(q||'').trim().toLowerCase();if(!q)return[];return slips.filter(s=>{const name=(s.custName||'').toLowerCase();const phone=(s.custPhone||'').toLowerCase();const title=(s.custTitle||'').toLowerCase();return name.includes(q)||phone.includes(q)||title.includes(q)})}
const calcSal=(day,unitPrice,enabledSkills)=>{let sal=day.total*unitPrice;const sk=day.skills||{};SKILL_KEYS.forEach((k,i)=>{if(enabledSkills?.[k])sal+=(sk[k]||0)*SKILL_PRICES[i]});return sal};
const eMon=()=>{const d={};for(let i=1;i<=31;i++)d[i]=eDay();return{days:d}};
// 找某老師某年有資料的頭尾月份 → {first,last} 或 null
function dataMonthRange(code,year){let first=null,last=null;for(let m=1;m<=12;m++){const d=LS.get(dk(code,year,m));if(d&&d.days&&Object.keys(d.days).length>0){if(first===null)first=m;last=m}}return first?{first,last}:null}
// 匯出有資料月份範圍的備份碼(多月,用換行串接)
function encRange(code,year){const r=dataMonthRange(code,year);if(!r)return'';const lines=[];for(let m=r.first;m<=r.last;m++){const d=LS.get(dk(code,year,m));if(d)lines.push(encMonth(code,year,m,d))}return lines.join('\n')}
// 解析多月備份碼(逐行 decBackup)→ [{code,year,month,data}]
function decRange(str){const out=[];(str||'').split(/[\n;]+/).map(s=>s.trim()).filter(Boolean).forEach(line=>{const p=decBackup(line);if(p)out.push(p)});return out}
function encMonth(code,y,m,data){let u="",l="",s="",sg="",sb="",sx="";for(let d=1;d<=31;d++){const day=d<=dim(y,m)&&data.days[d]?data.days[d]:eDay();const sk=day.skills||{};u+=toB36(day.total);l+=toB36(day.laodian);s+=day.status.toString();sg+=toB36(sk.guasha||0);sb+=toB36(sk.baguang||0);sx+=toB36(sk.xiujiao||0)}const hasSkills=sg.replace(/0/g,'')||sb.replace(/0/g,'')||sx.replace(/0/g,'');return`${code}-${y}-${String(m).padStart(2,'0')}:${u}:${l}:${s}${hasSkills?`:${sg}:${sb}:${sx}`:''}`}
// ===== 個人完整備份(加密 JSON 檔)=====
function exportPersonalData(code,year){
  const out={settings:LS.get('app-settings')||null,theme:localStorage.getItem('app-theme')||'pink',months:{}};
  for(let m=1;m<=12;m++){const d=LS.get(dk(code,year,m));if(d)out.months[m]=d}
  const bd=LS.get('booking-'+code);if(bd)out.booking=bd;
  const cdb=LS.get('custdb-'+code);if(cdb)out.custdb=cdb;
  const th=LS.get('tag-history-'+code);if(th)out.tagHistory=th;
  return out;
}
function makePersonalBackup(code,year){
  const data=exportPersonalData(code,year);
  const json=JSON.stringify(data);
  const checksum=fnv(json).toString(16);
  const payload=xEnc(encodeURIComponent(json));
  return{_app:'massage-pay',_type:'personal-backup',_ver:1,_code:code,_year:year,_exportAt:Date.now(),_checksum:checksum,payload};
}
function parsePersonalBackup(obj){
  try{
    if(!obj||obj._app!=='massage-pay'||obj._type!=='personal-backup')return{ok:false,reason:'notBackup'};
    if(!obj.payload)return{ok:false,reason:'broken'};
    const json=decodeURIComponent(xDec(obj.payload));
    if(!json)return{ok:false,reason:'broken'};
    if(obj._checksum&&fnv(json).toString(16)!==obj._checksum)return{ok:false,reason:'modified'};
    const data=JSON.parse(json);
    return{ok:true,code:obj._code,year:obj._year,data};
  }catch(e){return{ok:false,reason:'broken'}}
}
function restorePersonalBackup(parsed){
  const {code,year,data}=parsed;let okN=0,failN=0;
  try{if(data.settings){LS.set('app-settings',data.settings);okN++}}catch(_e){failN++}
  try{if(data.theme){localStorage.setItem('app-theme',data.theme);okN++}}catch(_e){failN++}
  if(data.months){Object.entries(data.months).forEach(([m,d])=>{try{LS.set(dk(code,year,Number(m)),d);okN++}catch(_e){failN++}})}
  try{if(data.booking){LS.set('booking-'+code,data.booking);okN++}}catch(_e){failN++}
  try{if(data.custdb){LS.set('custdb-'+code,data.custdb);okN++}}catch(_e){failN++}
  try{if(data.tagHistory){LS.set('tag-history-'+code,data.tagHistory);okN++}}catch(_e){failN++}
  return{okN,failN};
}
function decBackup(str){try{const c=str.replace(/^#/,'').trim();const parts=c.split(':');const hd=parts[0],units=parts[1],laodian=parts[2],status=parts[3];const sg=parts[4]||'',sb=parts[5]||'',sx=parts[6]||'';const p=hd.split('-');const m=parseInt(p.pop());const y=parseInt(p.pop());const code=p.join('-');if(!y||!m||m<1||m>12||!code)return null;const data=eMon();const dm=dim(y,m);for(let d=1;d<=dm;d++){const tot=fromB36(units?.[d-1]||'0');const lao=fromB36(laodian?.[d-1]||'0');const st=parseInt(status?.[d-1]||'0')||0;const slips=[];if(tot>0){const sp=newSlip(tot);sp.laodian=Math.min(lao,tot);sp.fromBackup=1;slips.push(sp)}data.days[d]={groups:[],total:tot,laodian:lao,status:st,slips:slips,skills:{guasha:fromB36(sg?.[d-1]||'0'),baguang:fromB36(sb?.[d-1]||'0'),xiujiao:fromB36(sx?.[d-1]||'0')}}}return{code,year:y,month:m,data}}catch(_e){return null}}

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
const SERVICES=[{code:'F1',base:1,min:40},{code:'B1',base:1,min:35},{code:'F2',base:2,min:70},{code:'B2',base:2,min:70},{code:'FB2',base:2,min:70},{code:'F3',base:3,min:110},{code:'B3',base:3,min:110},{code:'FB3',base:3,min:120}];
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
function dayOffStatus(code,ts){try{const d=new Date(ts);const y=d.getFullYear(),m=d.getMonth()+1,day=d.getDate();const md=LS.get(dk(code,y,m));if(!md||!md.days||!md.days[day])return 0;const st=md.days[day].status||0;/* SK=[normal,sick,late,rest,personal,early]；休假類:1病假,3休假,4事假 */return[1,3,4].includes(st)?st:0}catch(_e){return 0}}
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
zh:{settings:"設定",yearly:"年度",monthly:"月份明細",custManage:"客戶管理",home:"首頁",unitPrice:"每支單價",teacherCode:"老師代碼",language:"語系",year:"年份",save:"儲存",saved:"已儲存 ✓",units:"支數",salary:"薪水",laodian:"老點",subtotal:"小計",prevPeriod:"上期",nextPeriod:"下期",monthTotal:"月合計",total:"合計",sick:"病假",late:"遲到",rest:"休假",normal:"正常",personal:"事假",early:"早退",dn:["日","一","二","三","四","五","六"],months:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],addGroup:"新增客組",directMode:"直接輸入",groupMode:"分組輸入",status:"狀態",done:"完成",cancel:"取消",exportUrl:"匯出備份碼",importUrl:"匯入備份碼",importOk:"匯入成功！",importFail:"格式錯誤",copyDone:"已複製",enterUrl:"貼上備份碼...",noData:"無資料",totalUnits:"總支數",groupLabel:"組",backup:"月薪資備份碼",fullBackup:"完整備份檔（JSON）",fullBackupDesc:"匯出包含基資、店資、流水、客管與全年薪資的完整加密檔案。換手機前請匯出並妥善保存（可傳給自己或存雲端）。",jsonExport:"⬇ 匯出完整備份檔",jsonImport:"⬆ 匯入備份檔（會覆蓋現有資料）",jsonExportDone:"已匯出，請妥善保存檔案",jsonExportFail:"匯出失敗，請重試",jsonImportDone:"匯入成功，即將重新載入…",jsonConfirmOverwrite:"匯入將覆蓋本機現有的所有資料，確定要繼續嗎？",jsonNotBackup:"這不是本系統的備份檔，請選擇正確的檔案",jsonBroken:"檔案不完整或已損毀，請重新匯出一次",jsonModified:"備份檔已被修改，無法匯入",jsonOtherPerson:"這是其他編號的備份檔",exportRangeCode:"匯出薪資備份碼",rangeHint:"備份範圍",jsonAndCodeDone:"已匯出備份檔，並產生薪資備份碼於下方。請兩者都妥善保存：備份檔含完整資料，備份碼可在備份檔遺失時救回薪資支數。",p1:"上半月 (1-15日)",p2:"下半月 (16日-月底)",yesterday:"昨日",lastRecord:"上一筆",todayDone:"今日已完成",startAdd:"開始新增本日的支數？",continueAdd:"繼續新增本日的支數？",addLaodian:"新增老點？",other:"其他",welcome:"歡迎使用薪資追蹤系統",enterCode:"請輸入老師編號",confirm:"確定",showQR:"請將 QR Code 提供給主管索取啟動碼",enterActivation:"輸入啟動碼",activationHint:"貼上管理者提供的啟動碼",activationFail:"啟動碼錯誤，請重新確認",copyToLine:"點此複製，傳 LINE 給管理者",adminWelcome:"管理員身分確認，自動啟動中...",admin:"管理",adminTitle:"管理頁面",genActivation:"產生啟動碼",pasteEncrypted:"貼上加密字串",resultCode:"啟動碼",adminFail:"無管理權限",encryptTool:"加密/解密工具",encryptLabel:"加密",decryptLabel:"解密",inputText:"輸入文字",deviceId:"裝置 ID",adminCheck:"檢查",adminEnter:"進入",adminApply:"申請主管",adminPending:"審核中",adminActivate:"啟動",adminApplyDesc:"申請主管權限",deviceName:"設備名稱（選填）",adminAppCode:"申請碼",adminAppCopy:"點此複製，傳 LINE 給管理者",adminActInput:"輸入管理啟動碼",adminActFail:"啟動碼錯誤",supervisor:"主管頁面",supervisorTitle:"主管頁面",supervisorApprove:"主管申請審核",supervisorApproveHint:"貼上申請碼",supervisorInfo:"申請人資訊",revoke:"取消主管權限",revokeHint:"請將此碼新增到 GitHub revoked.cfg",revokeCode:"撤銷碼",revokeInput:"輸入撤銷碼",revokeSuccess:"主管權限已取消",revokeFail:"撤銷碼錯誤",actionLog:"操作記錄",logGenUser:"生成{0}號啟動碼",logGenSup:"生成{0}號主管啟動碼({1})",logRevoke:"取消{0}號主管權限({1})",supervisorList:"主管名單",logTeacherActivate:"{0}號老師啟用主管權限({1})",revokeToAdmin:"請將此碼傳給管理者新增到 revoked.cfg",revokedList:"已撤銷",expired:"權限已過期",ok:"確認",ghConfig:"GitHub 設定",ghOwner:"帳號",ghRepo:"Repo 名稱",ghToken:"Personal Access Token",ghSave:"儲存",ghSaved:"已儲存 ✓",ghTest:"測試連線",ghOk:"連線成功 ✓",ghFail:"連線失敗",ghWriting:"寫入中...",ghWriteOk:"已寫入 GitHub ✓",ghWriteFail:"寫入失敗",ghAuto:"自動寫入 GitHub",ghEdit:"編輯",ghLocked:"設定已鎖定，按編輯可修改",keyConfig:"密鑰設定",keyFile:"檔案",keyStart:"起始位置",keyLen:"取幾字",keyTest:"測試密鑰",keyResult:"組合結果",keyMatch:"與現行密鑰一致 ✓",keyMismatch:"⚠️ 與現行密鑰不同",keySave:"儲存密鑰設定",keySaved:"密鑰設定已儲存 ✓",keyAddRule:"新增規則",keyDelRule:"刪除",keyFileOk:"{0} 存在",keyFileFail:"{0} 不存在",keyLenOk:"{0} 第1行 {1} 字 ≥ 需要 {2} 字",keyLenFail:"{0} 第1行僅 {1} 字，需至少 {2} 字",keyBuilt:"組合密鑰：{0} 字元",keyAdminOk:"admin.cfg 共 {0} 筆，全部符合",keyAdminPartial:"admin.cfg {0}/{1} 筆符合",keyAdminNone:"admin.cfg {0} 筆皆不符合",keyMigrate:"轉換為新密鑰",keyMigrating:"轉換中...",keyMigrateOk:"已轉換並寫入 GitHub ✓",keyMigrateFail:"轉換失敗",adminList:"管理者名單",adminAdd:"新增管理者",adminDel:"刪除",adminDelConfirm:"確定刪除此管理者？",adminDelLast:"至少需保留一位管理者",adminDelOk:"已從 GitHub 刪除 ✓",adminDelFail:"刪除失敗",adminAddHint:"請將此雜湊碼新增到 GitHub admin.cfg",adminCfg:"目前 admin.cfg",adminLocal:"本機新增",onlineApprove:"線上核准",approveTeacher:"核准老師",approveSupervisor:"核准主管",approveName:"姓名",approveLang:"語系",approveLevel:"主管等級",approveBtn:"核准",approving:"核准中...",approveOk:"已核准 ✓",approveFail:"核准失敗",approveMsg:"你的帳號已可使用了，再看看有沒有使用上的問題 😊",approveCopied:"已複製回覆訊息 ✓",waitApproval:"等待審核中",waitHint:"請將上方申請碼傳給管理者，核准後重開 App 即可使用",checkApproval:"重新檢查",checking:"檢查中...",approved:"已核准！",staffList:"員工名單",staffEmpty:"尚無員工資料",staffRole:"角色",staffStatus:"狀態",staffActive:"在職",staffRevoked:"已停用",logApproveTeacher:"核准老師 {0}({1})",logApproveSupervisor:"核准主管 {0}({1}) {2}",store:"所在店面",storeManage:"店面管理",storeAdd:"新增店面",storeDel:"刪除",storeEmpty:"尚無店面",storeSaved:"已儲存 ✓",teacherActivation:"老師啟動碼",supActivation:"主管啟動碼",sortByStore:"按店面",sortByCode:"按編號",sortByRole:"按職務",theme:"背景主題",themePink:"粉紅",themeBlack:"黑色",themeWhite:"白色",bizCutoffLabel:"首頁換頁時間點",teacherCert:"老師專屬憑證",keyDiagTitle:"金鑰領取診斷",keyDiagPh:"輸入編號(如998)",keyDiagBtn:"測試領取",keyDiagHint:"輸入老師編號模擬領取，看成功或卡在哪。",certGot:"本機已領",certNone:"未領",gasSettingTitle:"GAS 後端網址",keyGenTitle:"產金鑰（管理者）",keyUpdateFound:"發現有新的更新檔，請點更新",latestNotices:"最新公告",oneStore:"單店公告",allStore:"全店公告",noticeRead:"我已閱讀",noticeReadDone:"已閱讀",noticeReadOk:"已記錄閱讀，感謝！",noticeReadMark:"已讀",noticeReadCount:"人已閱讀",noReaders:"尚無人閱讀",loading:"載入中…",noticeReaders:"閱讀人員",noticeMore:"更多公告",noticeFeedback:"我有意見（匿名）",noticeFeatureWip:"功能建置中，敬請期待",noticeKeyGot:"已為你開通！互動功能即將開放",noticeKeyFail:"開通失敗，請稍後再試或聯繫主管",noticeKeyHint:"點上方按鈕即可開通互動功能",noticeKeyClaiming:"開通中…",noticePubTitle:"公告更新",noticePubBtn:"從GAS抓最新2筆存GitHub",noticePubbing:"更新中…",noticePubOk:"已更新公告",noticePubFail:"更新失敗",noticePubHint:"按此把GAS最新2筆公告發布到GitHub，所有老師即可看到。",viewAll:"看全部",keyErrBatch:"領取碼不符或GAS未設定BATCH_CODE",keyErrNoKey:"管理者尚未幫你的編號產金鑰",keyErrRevoked:"金鑰已被停用",keyErrNetwork:"連不到GAS(網路或網址問題)",keyErrMissing:"缺編號或領取碼",keyUpdating:"更新中…",keyUpdateOk:"更新完成 ✓",keyUpdateFail:"更新失敗，請稍後再試",keyAdminSecPh:"GAS連線密碼",keyGenCodePh:"要產金鑰的老師編號",keyGenBtn:"產生金鑰",keyGenDone:"金鑰已產生",keyGenExisted:"金鑰已存在（沿用）",keyClaimCode:"領取碼（交給該老師）",keyClaimHint:"老師在自己手機的設定頁輸入此領取碼即可領金鑰。",keyClaimTitle:"領取金鑰",keyClaimPh:"輸入主管給的領取碼",keyClaimBtn:"領取金鑰",keyClaimOk:"領取成功",keyClaimFail:"領取失敗",keyClaimTeacherHint:"向主管索取領取碼後輸入，一次性領取，領到後存在本機。",gasSettingHint:"貼上 Google Apps Script 部署網址（管理者用）。設定後系統寫入將透過 GAS，Token 不再需要放前端。",gasTestBtn:"測試連線",gasTesting:"測試中…",gasTestOk:"連線成功",gasTestFail:"連線失敗",bizCutoffHint:"因應公司凌晨3點結帳，所以不一定是晚上12點就換成次日，可配合自己的習慣進行設定首頁換日的時間點。白班可以設定你下班時間，晚班可以設定3點，3點後做的都算次日，所以3點後系統自動換日，方便你記錄。（目前預設是早上6點半）",themeGray:"灰色",resetAll:"一鍵還原初始設定",resetAllConfirm:"確定還原？將清除所有員工與主管資料（保留管理員122、Token、記錄）",resetAllOk:"已還原初始設定 ✓",resetSup:"一鍵移除所有主管權限",resetSupConfirm:"確定移除所有主管權限？",resetSupOk:"已移除所有主管權限 ✓",resetApp:"重置申請",removeToken:"移除（轉離線）",removeSup:"取消主管權限",removeConfirm:"確定移除 {0}？",connection:"連線作業",connApply:"申請認證",connCode:"連線碼",connInput:"貼上連線碼",connOk:"連線成功 ✓",connFail:"連線碼錯誤",connExpired:"你的連線認證已逾期，請重新申請",connStatus:"連線狀態",connOnline:"已連線 ☁️",connOffline:"離線 📥",editStaff:"人員編輯",editStore:"所在店面",editDel:"刪除此員工",editDelConfirm:"確定刪除 {0}？",editDevices:"連線設備",editRevokeConn:"取消連線",editNoDevices:"無連線設備",genConn:"產生連線碼",genConnHint:"貼上老師的 編號:uuid",needConnFirst:"請先完成連線設定才能申請主管",skills:"老師技能",guasha:"刮痧",baguang:"拔罐",xiujiao:"修腳皮",gs:"刮",bg:"拔",xj:"修",clearAll:"一鍵清除",notice1:"⚠️ 資料只存在本機，不會上傳雲端。",notice2:"LINE 與手機內建瀏覽器的暫存是分開的，啟動碼會不同，請固定使用同一個瀏覽器。",notice3:"資料跟著手機走，換手機前請先到設定頁匯出備份。",authRedirectHint:"點擊後將前往管理頁面，完成後可按返回回到記薪資畫面。",manualGen:"手動發碼",manualGenBtn:"發碼",syncedStaff:"已寫入名單",syncFailStaff:"名單寫入失敗",manualGenHint:"直接輸入老師編號產生啟動碼（離線可用，不寫入雲端名單）",booking:"我的預約",bookingNew:"新增自約",bookingList:"自約清單",bookingEmpty:"目前沒有自約",custSearch:"搜尋客戶（手機/姓/稱謂）",custNew:"新客戶",custName:"姓名",custPhone:"手機",custTitle:"稱謂",custParts:"重點部位",custNote:"備註",custEval:"本次評價",bookDate:"預約日期",bookTime:"預約時間",bookSave:"儲存自約",bookCancel:"取消",bookDelete:"刪除自約",bookDeleteConfirm:"確定刪除這筆自約？",bookDeleteConfirm2:"確定刪除",selectCustomer:"選擇客戶",orNewCustomer:"或新增客戶",noMatch:"查無符合客戶",lastServed:"上次服務",bookStatus:"狀態",bookConfirmed:"已確認",bookDone:"已完成",bookNoShow:"未到",pickCustomerFirst:"請先選擇或新增客戶",needActivate:"請先在記薪資頁完成啟用",backToMain:"回記薪資",svcLabel:"服務項目",addHour:"加鐘",party:"同行人數",workStart:"上工時間",workEnd:"下工時間",workEndNeed:"已填上工，請一併填下工時間",gender:"性別",genderM:"男",genderF:"女",crossNightHint:"晚班跨夜：下工時間早於上工時間時，系統自動視為隔天（例如 17:00 上工、05:00 下工）。",email:"電子郵件",pregClient:"懷孕客人",oilLabel:"油壓",accept:"接",reject:"不接",techMentor:"技術指導老師",techMentorPlaceholder:"填寫技術指導老師號碼",lockerNo:"4樓置物櫃編號",teacherCode:"老師編號",teacherCodePlaceholder:"請輸入老師編號 ex:122",submitActivation:"送出啟動帳號",mustReadFirst:"需先閱讀以下說明",readConfirm:"我已閱讀以下說明",sendViaLine:"傳 LINE 給主管",sendLineToTeacher:"傳 LINE 給老師（碼）",sendLineLinkToTeacher:"傳連結給老師",sendLineToSup:"傳 LINE 給主管",lineConfirmPrefix:"資料已更新，確認碼如下，請於系統內輸入：",reqLinkTitle:"收到一個申請碼",reqLinkDesc:"系統偵測到申請碼。若您具有主管或管理權限，請先完成下方身分驗證，驗證後將自動帶入處理；若您是一般老師，則無需處理此碼。",lineActivatePrefix:"請協助 {code} 號老師帳號啟動",lineConnPrefix:"連線啟動碼如下，請複製使用：",lineActDonePrefix:"您的啟動碼如下，請於系統內輸入完成啟動：",lineReqPrefix:"基資／店資更新申請碼，請主管協助確認：",lineConnReqPrefix:"連線申請碼（請主管協助產生連線碼）：",reqMissing:"請完成必填欄位",addUnitTitle:"新增支數（每筆記為一位客人）",oldGroupData:"舊分組資料",slipUnits:"支數",editMoreInMonthly:"更多明細可到月份明細編輯",pressBody:"身體受力",pressFoot:"腳受力",pressLight:"輕",pressNormal:"普通",pressHeavy:"重",strengthParts:"加強部位",partHead:"頭",partShoulder:"肩膀",partUpperback:"上背",partLowerback:"下背",partWaist:"腰",partButt:"屁股",partThigh:"大腿",partCalf:"小腿",partArm:"手臂",clientReq:"客人要求",reqMale:"指男",reqFemale:"指女",reqTw:"指台",reqVn:"指越",reqCn:"指中",laodianOut:"老點出牌",shiftOut:"輪班出牌",teacherNoPlaceholder:"老師編號",custSearchHint:"搜尋客戶（姓/稱謂/手機/#標籤）",custMatch:"找到客戶",custNewHint:"查無此客戶，將建立新客戶",custNoRecent:"尚無客戶記錄",custEditTitle:"客戶資料編輯",custDelBtn:"刪除此客戶",custDelConfirm:"再按一次確認刪除（不影響流水紀錄）",rangeCodeNote:"此備份碼可快速救回每日支數與老點總數，缺點是無法還原每筆流水的明細（服務項目、客人、受力部位等），還原後每天會合併成一筆。需要完整明細請改用「完整備份檔（JSON）」。",
tabBasic:"基資",tabStore:"店資",tabBook2:"自約",tabCust:"客管",tabNotice:"公告",tabSuggest:"建議",tabManage:"管理",
secBasic:"基本資料",secStore:"在店資訊",nameZh:"中文姓名",nameVi:"越南姓名",address:"通訊地址",school:"就讀學校",major:"科系",permitDate:"工作證核發日期",permitOrg:"核發單位",optional:"選填",
storeName:"店名",shift:"班別",shiftDay:"早班",shiftNight:"晚班",workNote:"特別上下工備註",
skPregnant:"特殊客人（懷孕）",skOil:"油壓",
custMgmt:"客戶管理",noticeCenter:"公司宣達事項",suggestBox:"提供建議",manageCenter:"管理中心",underConstruction:"施工中",
confirmWithSup:"與主管確認",permitNo:"許可文號",permitExpiry:"到期日",permitOrgOpt:"核發單位",orgWDA:"勞動部勞動力發展署",orgNIA:"內政部移民署",orgOther:"其他",permitExpiringSoon:"工作證即將到期",phone2:"手機",city:"縣市",district:"區/鄉鎮市",addrDetail:"地址",selectCity:"選擇縣市",selectDist:"選擇區",myBookingNote:"「我的自約」非店家正式預約資料，僅供老師方便記錄使用。",partyMember:"同行第",assignTeacher:"指定老師",noAssign:"不指定",svcNote:"服務備註",calView:"日曆式",eventView:"事件序",totalPeople:"共",peopleUnit:"人",alsoAssign:"另指定",assignMode:"指定方式",noAssignTeacher:"不指定老師",assignTeacherMode:"指定老師",assignByCode:"指定編號",assignByCond:"指定條件",assignMale:"指男",assignFemale:"指女",assignTW:"指台",assignVN:"指越",assignOil:"油壓",confirmWithCounter:"跟櫃台確認",confirmWithAssigned:"跟指定老師確認",editBtn:"編輯",saveChange:"儲存變更",logConfirmCounter:"與櫃台確認該時段",logConfirmAssigned:"與指定老師{0}確認",logEditChange:"編輯：{0}",foreignSection:"外籍員工",permitNoLabel:"工作證許可文號",langSchool:"目前就讀語言學校",schoolType:"目前就讀",schoolTypeLang:"語言學校",schoolTypeUni:"大學",schoolTypeMaster:"研究所",schoolTypePhd:"博士班",selectLangSchool:"選擇語言學校",closeThis:"關閉此頁",confirmedAssignedToast:"已與{0}老師確認",confirmedCounterToast:"已與櫃台確認",statusUnconfirmed:"未確認",statusConfirmed:"已確認",statusAssignedConfirmed:"已跟指定老師確認",statusReconfirm:"自約變更，請重新確認",statusTeacherProgress:"已與老師確認 ({0}/{1})",confirmedTeacherToast:"已與老師確認 ({0}/{1})",hidePast:"隱藏已過期",workTimeEdit:"上下工時間",workStartH:"上工",workEndH:"下工",saveWorkTime:"儲存工時",internSup:"實習副理",confirmSuccess:"已確認，資料已更新",confirmFail:"確認碼錯誤或不符",scanReqEntry:"刷申請碼",reqBasic:"基資申請",reqStore:"店資申請",agreeWrite:"同意並寫入",disagree:"不同意",writeOk:"已寫入，確認碼：",giveConfirmCode:"請將確認碼給老師",logReqWritten:"寫入{0}申請：{1}",uuidBound:"已綁定裝置",uuidNew:"新裝置(將綁定)",workChartTitle:"上工人數統計",workChartOnline:"在線人數",workChartStart:"上工分布",workChartOnlineDesc:"各時段在線老師人數",workChartStartDesc:"各時間點上工的老師人數",allStores:"全部店家",tabChart:"圖表",chartShiftRatio:"班別比",chartGenderRatio:"性別比",chartAnalysis1:"分析1",chartAnalysis2:"分析2",chartWorkStart:"上工人數",chartOnline:"在線人數",chartWorkStartDesc:"各時間點上工的老師人數",chartOnlineDesc:"各時段在線老師人數（含跨夜）",peopleUnit2:"人",chartDayShift:"早班",chartNightShift:"晚班",chartMale:"男",chartFemale:"女",chartOther:"其他",chartUpdatedAt:"資料更新",chartNoData:"尚無統計資料，請待主管發布",chartSupOnly:"需主管權限",chartPublished:"已發布給成員",statTotal:"總人數",chartUpdate:"更新",slipList:"流水紀錄",slipAuto:"自動",slipStartTime:"開始時間",slipDelete:"刪除此筆",slipTags:"客管標籤（選填）",slipTagsPlaceholder:"空格分隔，按 Enter 或 + 加入",slipTagHistory:"歷史標籤：",slipTagAdd:"加入",custTagStats:"標籤統計",custSearchBtn:"客戶管理",custNoTags:"尚無標籤，請在每日流水裡記錄",custSearchPlaceholder:"搜尋姓名 / 稱謂 / 手機",myBooking2:"我的自約",
tabHome2:"首設",tabBackup:"備份",homeSettings:"系統設定",backupCenter:"備份",
curStore:"目前服務店家",applyChange:"申請更改",genBasicCode:"產生基資申請碼",genStoreCode:"產生店資申請碼",basicApplyCode:"基資申請碼",storeApplyCode:"店資申請碼",confirmCode2:"確認碼",copyBtn:"複製",lastSyncAt:"最後同步時間",fullStaffData:"完整資料",fullBasicData:"基資完整資料",fullStoreData:"店資完整資料",saveToStaff:"存回 staff",saved:"已存回",saveFailStaff:"存檔失敗",staffValueHint:"公司登記",
syncStoreBooking:"同步店家預約資訊",syncBtn:"同步",pasteBtn:"貼上",noFuncYet:"（尚無功能）",tabViolation:"違規",violationTitle:"違規記錄",noViolation:"你目前尚未有違規記錄",violationCode:"違規確認碼",dutyTitle:"值日生記錄",noDuty:"目前無值日生記錄",prevConfirmed:"前次確認值",needConfirm:"請完成資料填寫後，向主管進行確認",serviceStatus:"本服務 本機／連線狀況",
privacyTitle:"資料儲存說明",privacyBody:"本系統所有個人資料與薪資記錄，皆僅儲存於您的裝置本機，不會上傳至任何雲端伺服器，店家與管理者均無法讀取。",browserNote:"LINE 與手機內建瀏覽器的暫存空間各自獨立，若切換不同瀏覽器開啟，系統將要求重新輸入啟動碼。建議您固定使用同一個瀏覽器，以確保資料連續。",
backupReminder:"預約與所有資料均儲存於本機，更換手機後資料將無法復原。更換手機前，請先至「備份」頁匯出備份碼妥善保存。",
basicUpdateCode:"基資更新碼",storeUpdateCode:"店資更新碼",basicConfirmCode:"基資確認碼",storeConfirmCode:"店資確認碼",conflictWarn:"與 {0} {1} 衝突",dayOffWarn:"當天已排{0}",units:"支",partyUnit:"人",noWorkEnd:"尚未設定下工時間",bookEdit:"編輯",bookConfirmDesk:"與櫃台確定",bookConfirmed2:"已與櫃台確認",bookEditWarn:"變更時間後請再與櫃台確認",bookLogTitle:"異動記錄",logCreate:"新增本次自約",logConfirm:"與櫃台確認該時段",logChange:"自約變動",logConflict:"系統偵測到時段衝突仍建立",custEditTitle:"編輯客戶",custSave:"儲存",bookSaveEdit:"儲存變更",timeChanged:"時間 {0} → {1}",svcChanged:"服務 {0} → {1}"},
vi:{settings:"Cài đặt",yearly:"Năm",monthly:"Chi tiết",custManage:"Khách hàng",home:"Trang chủ",unitPrice:"Đơn giá",teacherCode:"Mã NV",language:"Ngôn ngữ",year:"Năm",save:"Lưu",saved:"Đã lưu ✓",units:"SL",salary:"Lương",laodian:"KH quen",subtotal:"Tổng",prevPeriod:"Kỳ trước",nextPeriod:"Kỳ sau",monthTotal:"Tổng tháng",total:"Tổng cộng",sick:"Nghỉ bệnh",late:"Đi trễ",rest:"Nghỉ phép",normal:"BT",personal:"Nghỉ việc riêng",early:"Về sớm",dn:["CN","T2","T3","T4","T5","T6","T7"],months:["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"],addGroup:"Thêm khách",directMode:"Nhập trực tiếp",groupMode:"Nhập theo nhóm",status:"Trạng thái",done:"Xong",cancel:"Hủy",exportUrl:"Xuất mã",importUrl:"Nhập mã",importOk:"Thành công!",importFail:"Sai định dạng",copyDone:"Đã chép",enterUrl:"Dán mã...",noData:"Không có",totalUnits:"Tổng SL",groupLabel:"Nhóm",backup:"Mã sao lưu lương tháng",fullBackup:"Tệp sao lưu đầy đủ (JSON)",fullBackupDesc:"Xuất tệp mã hóa đầy đủ gồm thông tin cơ bản, cửa hàng, lịch sử, khách hàng và lương cả năm. Trước khi đổi điện thoại hãy xuất và lưu giữ cẩn thận.",jsonExport:"⬇ Xuất tệp sao lưu",jsonImport:"⬆ Nhập tệp (sẽ ghi đè dữ liệu)",jsonExportDone:"Đã xuất, hãy lưu giữ tệp cẩn thận",jsonExportFail:"Xuất thất bại, thử lại",jsonImportDone:"Nhập thành công, đang tải lại…",jsonConfirmOverwrite:"Nhập sẽ ghi đè toàn bộ dữ liệu hiện có, tiếp tục?",jsonNotBackup:"Đây không phải tệp sao lưu của hệ thống",jsonBroken:"Tệp không đầy đủ hoặc hỏng, hãy xuất lại",jsonModified:"Tệp sao lưu đã bị sửa, không thể nhập",jsonOtherPerson:"Đây là tệp của mã khác",exportRangeCode:"Xuất mã sao lưu lương",rangeHint:"Phạm vi",jsonAndCodeDone:"Đã xuất tệp và tạo mã sao lưu bên dưới. Hãy lưu cả hai: tệp chứa dữ liệu đầy đủ, mã giúp khôi phục số lượng lương nếu mất tệp.",p1:"Nửa đầu (1-15)",p2:"Nửa sau (16-cuối)",yesterday:"Hôm qua",lastRecord:"Lần trước",todayDone:"Hôm nay đã xong",startAdd:"Thêm SL hôm nay?",continueAdd:"Tiếp tục thêm?",addLaodian:"Thêm KH quen?",other:"Khác",welcome:"Chào mừng",enterCode:"Nhập mã nhân viên",confirm:"Xác nhận",showQR:"Đưa mã QR cho quản lý để nhận mã kích hoạt",enterActivation:"Nhập mã kích hoạt",activationHint:"Dán mã kích hoạt từ quản lý",activationFail:"Sai mã kích hoạt",copyToLine:"Nhấn để sao chép, gửi LINE cho quản lý",adminWelcome:"Xác nhận quản lý, tự động kích hoạt...",admin:"Quản lý",adminTitle:"Trang quản lý",genActivation:"Tạo mã kích hoạt",pasteEncrypted:"Dán chuỗi mã hóa",resultCode:"Mã kích hoạt",adminFail:"Không có quyền",encryptTool:"Mã hóa/Giải mã",encryptLabel:"Mã hóa",decryptLabel:"Giải mã",inputText:"Nhập văn bản",deviceId:"Mã thiết bị",adminCheck:"Kiểm tra",adminEnter:"Vào",adminApply:"Đăng ký quản lý",adminPending:"Đang xét duyệt",adminActivate:"Kích hoạt",adminApplyDesc:"Đăng ký quyền quản lý",deviceName:"Tên thiết bị (tùy chọn)",adminAppCode:"Mã đăng ký",adminAppCopy:"Nhấn để sao chép, gửi LINE cho quản lý",adminActInput:"Nhập mã kích hoạt quản lý",adminActFail:"Sai mã kích hoạt",adminFail:"Không có quyền",supervisor:"Trang quản lý",supervisorTitle:"Trang quản lý",supervisorApprove:"Duyệt đăng ký quản lý",supervisorApproveHint:"Dán mã đăng ký",supervisorInfo:"Thông tin người đăng ký",revoke:"Hủy quyền quản lý",revokeHint:"Thêm mã này vào GitHub revoked.cfg",revokeCode:"Mã hủy",revokeInput:"Nhập mã hủy",revokeSuccess:"Đã hủy quyền quản lý",revokeFail:"Sai mã hủy",actionLog:"Nhật ký",logGenUser:"Tạo mã kích hoạt #{0}",logGenSup:"Tạo mã quản lý #{0}({1})",logRevoke:"Hủy quyền #{0}({1})",supervisorList:"Danh sách quản lý",logTeacherActivate:"NV #{0} kích hoạt quyền quản lý({1})",revokeToAdmin:"Gửi mã này cho quản trị viên để thêm vào revoked.cfg",revokedList:"Đã hủy",expired:"Quyền đã hết hạn",ok:"OK",ghConfig:"Cài đặt GitHub",ghOwner:"Tài khoản",ghRepo:"Tên Repo",ghToken:"Personal Access Token",ghSave:"Lưu",ghSaved:"Đã lưu ✓",ghTest:"Thử kết nối",ghOk:"Kết nối OK ✓",ghFail:"Kết nối thất bại",ghWriting:"Đang ghi...",ghWriteOk:"Đã ghi GitHub ✓",ghWriteFail:"Ghi thất bại",ghAuto:"Tự động ghi GitHub",ghEdit:"Sửa",ghLocked:"Đã khóa, nhấn Sửa để chỉnh",keyConfig:"Cài đặt khóa",keyFile:"Tệp",keyStart:"Vị trí",keyLen:"Số ký tự",keyTest:"Thử khóa",keyResult:"Kết quả",keyMatch:"Khớp khóa hiện tại ✓",keyMismatch:"⚠️ Khác khóa hiện tại",keySave:"Lưu cài đặt khóa",keySaved:"Đã lưu ✓",keyAddRule:"Thêm quy tắc",keyDelRule:"Xóa",keyFileOk:"{0} tồn tại",keyFileFail:"{0} không tồn tại",keyLenOk:"{0} dòng 1: {1} ký tự ≥ cần {2}",keyLenFail:"{0} dòng 1: chỉ {1} ký tự, cần ≥ {2}",keyBuilt:"Khóa: {0} ký tự",keyAdminOk:"admin.cfg {0} mục, tất cả khớp",keyAdminPartial:"admin.cfg {0}/{1} khớp",keyAdminNone:"admin.cfg {0} mục không khớp",keyMigrate:"Chuyển sang khóa mới",keyMigrating:"Đang chuyển...",keyMigrateOk:"Đã chuyển và ghi GitHub ✓",keyMigrateFail:"Chuyển thất bại",adminList:"Danh sách quản lý",adminAdd:"Thêm quản lý",adminDel:"Xóa",adminDelConfirm:"Xác nhận xóa quản lý?",adminDelLast:"Cần giữ ít nhất một quản lý",adminDelOk:"Đã xóa khỏi GitHub ✓",adminDelFail:"Xóa thất bại",adminAddHint:"Thêm mã hash này vào GitHub admin.cfg",adminCfg:"admin.cfg hiện tại",adminLocal:"Thêm cục bộ",onlineApprove:"Duyệt online",approveTeacher:"Duyệt NV",approveSupervisor:"Duyệt quản lý",approveName:"Họ tên",approveLang:"Ngôn ngữ",approveLevel:"Cấp bậc",approveBtn:"Duyệt",approving:"Đang duyệt...",approveOk:"Đã duyệt ✓",approveFail:"Duyệt thất bại",approveMsg:"Tài khoản của bạn đã sẵn sàng, hãy thử và cho mình biết nếu có vấn đề gì nhé 😊",approveCopied:"Đã copy tin nhắn ✓",waitApproval:"Đang chờ duyệt",waitHint:"Gửi mã trên cho quản lý, mở lại app sau khi được duyệt",checkApproval:"Kiểm tra lại",checking:"Đang kiểm tra...",approved:"Đã duyệt!",staffList:"Danh sách NV",staffEmpty:"Chưa có dữ liệu",staffRole:"Vai trò",staffStatus:"Trạng thái",staffActive:"Đang làm",staffRevoked:"Đã nghỉ",logApproveTeacher:"Duyệt NV {0}({1})",logApproveSupervisor:"Duyệt QL {0}({1}) {2}",store:"Chi nhánh",storeManage:"Quản lý CN",storeAdd:"Thêm CN",storeDel:"Xóa",storeEmpty:"Chưa có CN",storeSaved:"Đã lưu ✓",teacherActivation:"Mã kích hoạt NV",supActivation:"Mã kích hoạt QL",sortByStore:"Theo CN",sortByCode:"Theo mã",sortByRole:"Theo chức vụ",theme:"Giao diện",themePink:"Hồng",themeBlack:"Đen",themeWhite:"Trắng",bizCutoffLabel:"Giờ chuyển ngày",teacherCert:"Chứng chỉ riêng GV",keyDiagTitle:"Chẩn đoán nhận khóa",keyDiagPh:"Nhập mã",keyDiagBtn:"Kiểm tra",keyDiagHint:"Nhập mã GV để mô phỏng nhận khóa.",certGot:"Đã nhận",certNone:"Chưa nhận",gasSettingTitle:"Địa chỉ GAS",keyGenTitle:"Tạo khóa (QL)",keyUpdateFound:"Có bản cập nhật mới, bấm để cập nhật",latestNotices:"Thông báo mới",oneStore:"TB một cửa hàng",allStore:"TB toàn hệ thống",noticeRead:"Tôi đã đọc",noticeReadDone:"Đã đọc",noticeReadOk:"Đã ghi nhận, cảm ơn!",noticeReadMark:"Đã đọc",noticeReadCount:"người đã đọc",noReaders:"Chưa có ai đọc",loading:"Đang tải…",noticeReaders:"Người đã đọc",noticeMore:"Thêm thông báo",noticeFeedback:"Tôi có ý kiến (ẩn danh)",noticeFeatureWip:"Tính năng đang xây dựng",noticeKeyGot:"Đã kích hoạt cho bạn! Tính năng sắp mở",noticeKeyFail:"Kích hoạt thất bại, thử lại sau",noticeKeyHint:"Bấm nút trên để kích hoạt tính năng tương tác",noticeKeyClaiming:"Đang kích hoạt…",noticePubTitle:"Cập nhật thông báo",noticePubBtn:"Lấy 2 tin mới nhất từ GAS lưu GitHub",noticePubbing:"Đang cập nhật…",noticePubOk:"Đã cập nhật",noticePubFail:"Thất bại",noticePubHint:"Bấm để đăng thông báo lên GitHub cho mọi người xem.",viewAll:"Xem tất cả",keyErrBatch:"Mã không đúng hoặc GAS chưa đặt BATCH_CODE",keyErrNoKey:"Quản lý chưa tạo khóa cho mã của bạn",keyErrRevoked:"Khóa đã bị vô hiệu",keyErrNetwork:"Không kết nối được GAS",keyErrMissing:"Thiếu mã",keyUpdating:"Đang cập nhật…",keyUpdateOk:"Hoàn tất ✓",keyUpdateFail:"Thất bại, thử lại sau",keyAdminSecPh:"Mật khẩu GAS",keyGenCodePh:"Mã GV cần tạo khóa",keyGenBtn:"Tạo khóa",keyGenDone:"Đã tạo khóa",keyGenExisted:"Khóa đã có (dùng lại)",keyClaimCode:"Mã nhận (đưa cho GV)",keyClaimHint:"GV nhập mã này ở trang cài đặt để nhận khóa.",keyClaimTitle:"Nhận khóa",keyClaimPh:"Nhập mã nhận",keyClaimBtn:"Nhận khóa",keyClaimOk:"Thành công",keyClaimFail:"Thất bại",keyClaimTeacherHint:"Xin mã nhận từ quản lý rồi nhập.",gasSettingHint:"Dán link Google Apps Script (dành cho quản lý).",gasTestBtn:"Kiểm tra kết nối",gasTesting:"Đang kiểm tra…",gasTestOk:"Kết nối OK",gasTestFail:"Kết nối thất bại",bizCutoffHint:"Công ty chốt sổ lúc 3 giờ sáng, nên có thể chỉnh giờ chuyển ngày của trang chủ theo thói quen của bạn. Ca ngày đặt giờ tan làm, ca đêm có thể đặt 3 giờ; sau 3 giờ tính là ngày hôm sau, tiện ghi chép. Mặc định hiện tại là 6 giờ 30, ca đêm tan làm muộn nhất là 6 giờ.",themeGray:"Xám",resetAll:"Khôi phục mặc định",resetAllConfirm:"Xác nhận? Sẽ xóa tất cả NV và QL (giữ admin 122, Token, log)",resetAllOk:"Đã khôi phục ✓",resetSup:"Xóa tất cả quyền QL",resetSupConfirm:"Xác nhận xóa tất cả quyền QL?",resetSupOk:"Đã xóa ✓",resetApp:"Đặt lại đơn",removeToken:"Xóa (offline)",removeSup:"Hủy quyền QL",removeConfirm:"Xác nhận xóa {0}?",connection:"Kết nối",connApply:"Yêu cầu xác thực",connCode:"Mã kết nối",connInput:"Dán mã kết nối",connOk:"Kết nối OK ✓",connFail:"Sai mã kết nối",connExpired:"Xác thực đã hết hạn, vui lòng yêu cầu lại",connStatus:"Trạng thái",connOnline:"Online ☁️",connOffline:"Offline 📥",editStaff:"Chỉnh sửa NV",editStore:"Chi nhánh",editDel:"Xóa NV",editDelConfirm:"Xác nhận xóa {0}?",editDevices:"Thiết bị",editRevokeConn:"Ngắt kết nối",editNoDevices:"Không có thiết bị",genConn:"Tạo mã kết nối",genConnHint:"Dán mã:uuid của NV",needConnFirst:"Cần kết nối trước khi yêu cầu quyền QL",skills:"Kỹ năng",guasha:"Cạo gió",baguang:"Giác hơi",xiujiao:"Sửa da chân",gs:"C",bg:"G",xj:"S",clearAll:"Xóa tất cả",notice1:"⚠️ Dữ liệu chỉ lưu trên máy, không tải lên đám mây.",notice2:"Trình duyệt LINE và trình duyệt mặc định lưu riêng, mã kích hoạt sẽ khác nhau. Hãy dùng cùng một trình duyệt.",notice3:"Dữ liệu gắn với điện thoại. Trước khi đổi máy, hãy xuất sao lưu trong Cài đặt.",authRedirectHint:"Nhấn để vào trang quản lý, xong có thể bấm quay lại màn hình ghi lương.",manualGen:"Tạo mã thủ công",manualGenHint:"Nhập mã nhân viên để tạo mã kích hoạt (dùng offline, không ghi vào danh sách đám mây)",booking:"Lịch hẹn",bookingNew:"Thêm lịch hẹn",bookingList:"Danh sách hẹn",bookingEmpty:"Chưa có lịch hẹn",custSearch:"Tìm khách (SĐT/tên/xưng hô)",custNew:"Khách mới",custName:"Tên",custPhone:"SĐT",custTitle:"Xưng hô",custParts:"Vùng trọng điểm",custNote:"Ghi chú",custEval:"Đánh giá",bookDate:"Ngày hẹn",bookTime:"Giờ hẹn",bookSave:"Lưu lịch hẹn",bookCancel:"Hủy",bookDelete:"Xóa lịch hẹn",bookDeleteConfirm:"Xác nhận xóa lịch hẹn này?",bookDeleteConfirm2:"Xác nhận xóa",selectCustomer:"Chọn khách",orNewCustomer:"Hoặc thêm khách",noMatch:"Không tìm thấy khách",lastServed:"Lần phục vụ trước",bookStatus:"Trạng thái",bookConfirmed:"Đã xác nhận",bookDone:"Hoàn thành",bookNoShow:"Không đến",pickCustomerFirst:"Vui lòng chọn hoặc thêm khách",needActivate:"Vui lòng kích hoạt ở trang ghi lương trước",backToMain:"Về ghi lương",svcLabel:"Dịch vụ",addHour:"Thêm giờ",party:"Số người đi cùng",workStart:"Giờ vào làm",workEnd:"Giờ tan làm",workEndNeed:"Đã điền giờ vào, vui lòng điền giờ tan",gender:"Giới tính",genderM:"Nam",genderF:"Nữ",crossNightHint:"Ca đêm qua ngày: khi giờ tan sớm hơn giờ vào, hệ thống tự tính sang ngày hôm sau.",email:"Email",pregClient:"Khách mang thai",oilLabel:"Dầu nóng",accept:"Nhận",reject:"Không nhận",techMentor:"GV hướng dẫn",techMentorPlaceholder:"Nhập số GV hướng dẫn",lockerNo:"Số tủ đồ tầng 4",teacherCode:"Mã giáo viên",teacherCodePlaceholder:"Nhập mã GV vd:122",submitActivation:"Gửi kích hoạt tài khoản",mustReadFirst:"Vui lòng đọc hướng dẫn bên dưới",readConfirm:"Tôi đã đọc hướng dẫn bên dưới",sendViaLine:"Gửi LINE cho QL",sendLineToTeacher:"Gửi LINE cho GV (mã)",sendLineLinkToTeacher:"Gửi liên kết cho GV",sendLineToSup:"Gửi LINE cho QL",lineConfirmPrefix:"Dữ liệu đã cập nhật, mã xác nhận như sau:",reqLinkTitle:"Đã nhận một mã yêu cầu",reqLinkDesc:"Hệ thống phát hiện mã yêu cầu. Nếu bạn có quyền quản lý, hãy xác minh danh tính bên dưới; nếu là giáo viên thường, không cần xử lý mã này.",lineActivatePrefix:"Vui lòng kích hoạt tài khoản GV số {code}",lineConnPrefix:"Mã kết nối như sau, vui lòng sao chép sử dụng:",lineActDonePrefix:"Mã kích hoạt của bạn như sau, nhập vào hệ thống để hoàn tất:",lineReqPrefix:"Mã cập nhật thông tin, vui lòng QL xác nhận:",lineConnReqPrefix:"Mã xin kết nối (nhờ QL tạo mã kết nối):",reqMissing:"Vui lòng điền đủ mục bắt buộc",addUnitTitle:"Thêm SL (mỗi lần = 1 khách)",oldGroupData:"Dữ liệu nhóm cũ",slipUnits:"SL",editMoreInMonthly:"Chi tiết thêm sửa ở Chi tiết tháng",pressBody:"Lực thân",pressFoot:"Lực chân",pressLight:"Nhẹ",pressNormal:"Vừa",pressHeavy:"Mạnh",strengthParts:"Vùng cần tăng cường",partHead:"Đầu",partShoulder:"Vai",partUpperback:"Lưng trên",partLowerback:"Lưng dưới",partWaist:"Eo",partButt:"Mông",partThigh:"Đùi",partCalf:"Bắp chân",partArm:"Cánh tay",clientReq:"Yêu cầu khách",reqMale:"Chỉ định nam",reqFemale:"Chỉ định nữ",reqTw:"Chỉ định Đài",reqVn:"Chỉ định Việt",reqCn:"Chỉ định Hoa",laodianOut:"KH quen ra bài",shiftOut:"Xoay ca ra bài",teacherNoPlaceholder:"Mã GV",custSearchHint:"Tìm khách (tên/xưng hô/SĐT/#tag)",custMatch:"Tìm thấy khách",custNewHint:"Không tìm thấy, sẽ tạo khách mới",custNoRecent:"Chưa có khách hàng",custEditTitle:"Sửa thông tin khách",custDelBtn:"Xóa khách này",custDelConfirm:"Bấm lần nữa để xóa",rangeCodeNote:"Mã này khôi phục nhanh tổng số chi và khách quen mỗi ngày, nhược điểm là không khôi phục được chi tiết từng lượt (dịch vụ, khách, vùng lực…), mỗi ngày sẽ gộp thành một dòng. Cần chi tiết đầy đủ hãy dùng「Tệp sao lưu đầy đủ (JSON)」.",
tabBasic:"Hồ sơ",tabStore:"Cửa hàng",tabBook2:"Lịch hẹn",tabCust:"Khách",tabNotice:"Thông báo",tabSuggest:"Góp ý",tabManage:"Quản lý",
secBasic:"Thông tin cơ bản",secStore:"Thông tin cửa hàng",nameZh:"Tên tiếng Trung",nameVi:"Tên tiếng Việt",address:"Địa chỉ",school:"Trường học",major:"Ngành học",permitDate:"Ngày cấp giấy phép LĐ",permitOrg:"Đơn vị cấp",optional:"Tùy chọn",
storeName:"Tên cửa hàng",shift:"Ca làm",shiftDay:"Ca sáng",shiftNight:"Ca đêm",workNote:"Ghi chú giờ làm đặc biệt",
skPregnant:"Khách đặc biệt (mang thai)",skOil:"Massage dầu",
custMgmt:"Quản lý khách",noticeCenter:"Thông báo công ty",suggestBox:"Góp ý",manageCenter:"Trung tâm quản lý",underConstruction:"Đang xây dựng",
confirmWithSup:"Xác nhận với quản lý",permitNo:"Số giấy phép",permitExpiry:"Ngày hết hạn",permitOrgOpt:"Đơn vị cấp",orgWDA:"Cục Phát triển Lực lượng LĐ",orgNIA:"Cục Di trú",orgOther:"Khác",permitExpiringSoon:"Giấy phép sắp hết hạn",phone2:"Điện thoại",city:"Tỉnh/Thành",district:"Quận/Huyện",addrDetail:"Địa chỉ",selectCity:"Chọn tỉnh/thành",selectDist:"Chọn quận",myBookingNote:"Lịch hẹn của tôi không phải dữ liệu đặt chỗ chính thức, chỉ để giáo viên ghi chú.",partyMember:"Người đi cùng thứ ",assignTeacher:"Chỉ định GV",noAssign:"Không chỉ định",svcNote:"Ghi chú dịch vụ",calView:"Lịch",eventView:"Sự kiện",totalPeople:"Tổng ",peopleUnit:" người",alsoAssign:"chỉ định thêm",assignMode:"Cách chỉ định",noAssignTeacher:"Không chỉ định GV",assignTeacherMode:"Chỉ định GV",assignByCode:"Theo mã số",assignByCond:"Theo điều kiện",assignMale:"GV nam",assignFemale:"GV nữ",assignTW:"GV Đài",assignVN:"GV Việt",assignOil:"Massage dầu",confirmWithCounter:"Xác nhận với quầy",confirmWithAssigned:"Xác nhận với GV",editBtn:"Sửa",saveChange:"Lưu thay đổi",logConfirmCounter:"Đã xác nhận giờ với quầy",logConfirmAssigned:"Đã xác nhận với GV {0}",logEditChange:"Sửa: {0}",foreignSection:"Nhân viên nước ngoài",permitNoLabel:"Số giấy phép làm việc",langSchool:"Trường ngôn ngữ đang học",schoolType:"Đang học",schoolTypeLang:"Trường ngôn ngữ",schoolTypeUni:"Đại học",schoolTypeMaster:"Thạc sĩ",schoolTypePhd:"Tiến sĩ",selectLangSchool:"Chọn trường",closeThis:"Đóng trang",confirmedAssignedToast:"Đã xác nhận với GV {0}",confirmedCounterToast:"Đã xác nhận với quầy",statusUnconfirmed:"Chưa xác nhận",statusConfirmed:"Đã xác nhận",statusAssignedConfirmed:"Đã xác nhận với GV chỉ định",statusReconfirm:"Lịch hẹn đã đổi, xác nhận lại",statusTeacherProgress:"Đã xác nhận GV ({0}/{1})",confirmedTeacherToast:"Đã xác nhận GV ({0}/{1})",hidePast:"Ẩn đã qua",workTimeEdit:"Giờ làm việc",workStartH:"Vào ca",workEndH:"Tan ca",saveWorkTime:"Lưu giờ",internSup:"Phó QL thực tập",confirmSuccess:"Đã xác nhận, dữ liệu cập nhật",confirmFail:"Mã xác nhận sai",scanReqEntry:"Quét mã yêu cầu",reqBasic:"YC hồ sơ",reqStore:"YC cửa hàng",agreeWrite:"Đồng ý & ghi",disagree:"Không đồng ý",writeOk:"Đã ghi, mã XN: ",giveConfirmCode:"Đưa mã XN cho GV",logReqWritten:"Đã ghi YC {0}: {1}",uuidBound:"Đã gắn thiết bị",uuidNew:"Thiết bị mới",workChartTitle:"Thống kê giờ làm",workChartOnline:"Đang làm",workChartStart:"Giờ vào ca",workChartOnlineDesc:"Số GV đang làm theo giờ",workChartStartDesc:"Số GV vào ca theo giờ",allStores:"Tất cả CH",tabChart:"Biểu đồ",chartShiftRatio:"Tỷ lệ ca",chartGenderRatio:"Tỷ lệ giới",chartAnalysis1:"Phân tích 1",chartAnalysis2:"Phân tích 2",chartWorkStart:"Số vào ca",chartOnline:"Đang làm",chartWorkStartDesc:"Số GV vào ca theo giờ",chartOnlineDesc:"Số GV đang làm theo giờ (gồm qua đêm)",peopleUnit2:"người",chartDayShift:"Ca sáng",chartNightShift:"Ca tối",chartMale:"Nam",chartFemale:"Nữ",chartOther:"Khác",chartUpdatedAt:"Cập nhật",chartNoData:"Chưa có dữ liệu, chờ QL công bố",chartSupOnly:"Cần quyền QL",chartPublished:"Đã công bố",statTotal:"Tổng số",chartUpdate:"Cập nhật",slipList:"Lịch sử",slipAuto:"Tự động",slipStartTime:"Giờ bắt đầu",slipDelete:"Xóa mục này",slipTags:"Nhãn KH (tùy chọn)",slipTagsPlaceholder:"Cách bằng dấu cách, Enter hoặc +",slipTagHistory:"Nhãn cũ:",slipTagAdd:"Thêm",custTagStats:"Thống kê nhãn",custSearchBtn:"Quản lý khách",custNoTags:"Chưa có nhãn, hãy ghi ở lịch sử mỗi ngày",custSearchPlaceholder:"Tìm tên / xưng hô / SĐT",myBooking2:"Lịch hẹn của tôi",
tabHome2:"Trang chính",tabBackup:"Sao lưu",homeSettings:"Cài đặt hệ thống",backupCenter:"Sao lưu",
curStore:"Cửa hàng hiện tại",applyChange:"Xin đổi",genBasicCode:"Tạo mã hồ sơ",genStoreCode:"Tạo mã cửa hàng",basicApplyCode:"Mã hồ sơ",storeApplyCode:"Mã cửa hàng",confirmCode2:"Mã xác nhận",copyBtn:"Sao chép",lastSyncAt:"Đồng bộ lần cuối",fullStaffData:"Dữ liệu đầy đủ",fullBasicData:"Hồ sơ cơ bản",fullStoreData:"Hồ sơ cửa hàng",saveToStaff:"Lưu vào staff",saved:"Đã lưu",saveFailStaff:"Lưu thất bại",staffValueHint:"Công ty ghi",
syncStoreBooking:"Đồng bộ lịch hẹn cửa hàng",syncBtn:"Đồng bộ",pasteBtn:"Dán",noFuncYet:"(Chưa có chức năng)",tabViolation:"Vi phạm",violationTitle:"Hồ sơ vi phạm",noViolation:"Bạn chưa có ghi nhận vi phạm",violationCode:"Mã xác nhận vi phạm",dutyTitle:"Trực nhật",noDuty:"Chưa có ghi nhận trực nhật",prevConfirmed:"Giá trị xác nhận trước",needConfirm:"Vui lòng hoàn tất thông tin rồi xác nhận với quản lý",serviceStatus:"Trạng thái máy/kết nối",
privacyTitle:"Lưu trữ dữ liệu",privacyBody:"Mọi thông tin cá nhân và bảng lương chỉ lưu trên thiết bị của bạn, không tải lên máy chủ, cửa hàng và quản lý đều không đọc được.",browserNote:"Bộ nhớ tạm của LINE và trình duyệt điện thoại là riêng biệt. Nếu mở bằng trình duyệt khác, hệ thống sẽ yêu cầu nhập lại mã kích hoạt. Nên dùng cố định một trình duyệt.",
backupReminder:"Lịch hẹn và mọi dữ liệu chỉ lưu trên máy. Khi đổi điện thoại dữ liệu sẽ mất. Trước khi đổi máy, hãy vào trang Sao lưu để xuất mã sao lưu.",
basicUpdateCode:"Mã cập nhật hồ sơ",storeUpdateCode:"Mã cập nhật cửa hàng",basicConfirmCode:"Mã xác nhận hồ sơ",storeConfirmCode:"Mã xác nhận cửa hàng",conflictWarn:"Trùng với {0} {1}",dayOffWarn:"Hôm đó đã nghỉ {0}",units:"suất",partyUnit:"người",noWorkEnd:"Chưa đặt giờ tan làm",bookEdit:"Sửa",bookConfirmDesk:"Xác nhận quầy",bookConfirmed2:"Đã xác nhận với quầy",bookEditWarn:"Sau khi đổi giờ hãy xác nhận lại với quầy",bookLogTitle:"Lịch sử thay đổi",logCreate:"Tạo lịch hẹn",logConfirm:"Xác nhận với quầy",logChange:"Thay đổi lịch hẹn",logConflict:"Hệ thống phát hiện trùng giờ vẫn tạo",custEditTitle:"Sửa khách",custSave:"Lưu",bookSaveEdit:"Lưu thay đổi",timeChanged:"Giờ {0} → {1}",svcChanged:"DV {0} → {1}"}};

/* ══════════ Export to global (window.MP) ══════════ */
global.MP={
  LS,
  // crypto
  getKeyConfig,saveKeyConfig,buildDynamicKey,getCK,xEnc,xDec,fnv,
  adminHash,genAdminAct,revokeHash,approveHash,supApproveHash,genSimpleAct,
  encWithKey,decWithKey,actKey,genActWithToken,verifyActToken,genUUID,getDeviceId,
  genReqCode,parseReqCode,decReqCode,genConfirmCode,verifyConfirmCode,confirmCodeIsBound,REQ_CAT,identifyReqCode,buildReqLink,parseReqHash,genConnReq,parseConnReq,genSupReq,parseSupReq,
  // sup levels
  SUP_LEVELS,supLevelName,effSupLevel,
  // github
  getGHConfig,saveGHConfigLocal,saveGHConfig,ghReadFile,ghWriteFile,ghAppendLine,ghRemoveLine,
  // staff/stores/approval
  readStaff,writeStaff,checkApproved,writeApproval,loadStores,saveStores,computeStats,publishStats,loadStats,
  getApproved,saveApproved,addApproved,
  // logs
  addLog,getLogs,fmtLog,fmtDate,
  // theme
  THEMES,
  // data helpers
  SKILL_KEYS,SKILL_SHORT,SKILL_PRICES,SKILL_COLORS,SK,SBG,STC,canWork,
  toB36,fromB36,dim,dow,bizDate,bizParts,BIZ_CUTOFF_MIN,getBizCutoff,dk,eDay,stamp,calcSal,eMon,encMonth,decBackup,dataMonthRange,encRange,decRange,makePersonalBackup,parsePersonalBackup,restorePersonalBackup,
  newSlip,slipUnitsTotal,slipLaodianTotal,PRESS_LEVELS,BODY_PARTS,CLIENT_REQS,custKey,loadCustDB,saveCustDB,getCust,getGasUrl,setGasUrl,getBuiltinGasUrl,shouldClaimKey,autoClaimKey,diagClaimKey,gasCall,gasWarmup,getNoticesLocal,saveNoticesLocal,fetchNotices,publishNotices,noticeBody,noticeTitle,noticeSummary,noticeCats,noticeTags,getMyKey,setMyKey,hasMyKey,isNoticeRead,markNoticeRead,getNoticeReadCount,getNoticeReaders,getAdminSecret,setAdminSecret,hasAdminSecret,issueKey,claimMyKey,upsertCust,deleteCust,searchCustDB,recentCust,custLastSlip,migrateDayGroups,migrateMonthGroups,slipSvcLabel,slipStartTime,loadTagHistory,addTagHistory,visitStats,collectSlips,collectAllSlips,tagStats,searchSlips,
  getCustomers,saveCustomers,getBookings,saveBookings,uid,upsertCustomer,normPhone,searchCustomers,addBooking,updateBooking,deleteBooking,confirmBooking,BOOK_TITLES,bookTitleName,
  SERVICES,svcByCode,bookUnits,bookMinutes,bookLabel,bookRange,findConflicts,dayOffStatus,bookLog,skName,
  TW_REGIONS,LANG_SCHOOLS,
  // i18n
  T
};

})(window);
