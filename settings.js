// settings.js — 設定頁相關元件(從 index.html 抽離,降低 index 體積)
// v1.12-044 / 系統設定新增「登出／切換帳號」按鈕(不刪本機資料,月報表/客戶資料庫都是依編號存的,換帳號登入原本資料還在) | 前: v1.12-043 / 系統設定新增「重設自訂密碼」功能,沿用忘記密碼那套鍵盤流程,不用先驗證舊密碼直接設新的 | 前: v1.12-042 / 客戶管理:更新客戶資料時不再直接覆蓋,舊版本存進history陣列,列表每列右側加(N)標籤顯示歷史筆數,點了展開列出過去的壓力/施力部位記錄 | 前: v1.12-041 / 系統設定/公告管理頁標題列改成sticky置頂(超過一頁滾動時,標題+✕不會跟著捲走) | 前: v1.12-040 / 兩項修正:(1)保護密碼自動上鎖時間改成下拉選單(5/10/20/30/40/50/60/120分鐘),修正之前notice-liff.html誤寫入lockAutoTime:99999999污染本機設定的bug(2)系統設定/自約/客戶管理/公告/圖表/建議/違規/備份,標題統一改跟✕關閉按鈕同一排(不再是App層級通用置頂列,改由各頁面自己處理) | 前: v1.12-039 / 複製名單格式加上公告編號+摘要(方便主管/老師直接關聯是哪一則公告,不用只看到一串內部編號) | 前: v1.12-038 / 公告管理頁改版:(1)列表項目改三排式(編號・日期・圓框頭像+發文者/標題摘要/主子分類+開啟次數置右),移除列表上的分享按鈕(2)編輯頁新增「誰有看」「誰沒看」區塊各自附複製按鈕,底部按鈕改成修改/下架/分享到LINE三顆並排 | 前: v1.12-037 / 設定頁完全移除左側分頁列(改由首頁圖示導向所有子頁面,backup/manage新增首頁圖示) | 前: v1.12-036 / 設定頁分頁移除基資/店資(已改由首頁左上角彈窗處理,底層邏輯不受影響) | 前: v1.12-035 / 推播圖示改成LINE品牌綠色圓形小圖示(不再是📲emoji) | 前: v1.12-034 / 公告Flex卡片改版+列表加推播按鈕:(1)GAS的_buildNoticeFlex加入人員徽章(圓框頭像圖示+編號,標題下方)+內容後面加「編號 主分類 子分類 發布日」這行meta資訊(2)已發布公告列表每一則旁邊多一顆📲推播按鈕,不用先進編輯或新建流程,任何一則都能直接推播到自己的LINE | 前: v1.12-033 / 修正兩個bug:(1)gasPushNoticeFlexToMe忘記加進bridge匯入清單導致推播按鈕報錯找不到變數(2)發布成功後「發布公告」按鈕沒有跟著鎖住,現在會保持灰色不能重複按 | 前: v1.12-032 / 新建公告接LINE推播:發布成功後不再自動關閉視窗,改成留在頁面上顯示「推播到我的LINE」按鈕(用code查安全回報那邊收集到的LINE身分,查不到會提示先去登記)+「查誰還沒看」按鈕(沿用既有的noticeUnread動作) | 前: v1.12-031 / 首頁圖示改版+建議功能實作:(1)自約/公告/圖表/建議/違規5個分頁按鈕從TABS移除,改用首頁圖示進入(2)SuggestPage移除假資料,改接真正的GAS(submitSuggestion/listSuggestions),送出建議會真的存進Sheet,清單真的從GAS撈 | 前: v1.12-030 / 公告分類分頁改用完整8分類清單:不再從現有公告資料推導(避免有分類還沒被用過就不會出現在分頁),改讀GAS發布時一併附上的mainCats(含中越文對照),固定顯示「全部」+8個主分類共9個按鈕(3x3排列),依語系自動切換中文/越南文標籤 | 前: v1.12-029 / 首頁設定新增「保護密碼」區塊:關閉首頁密碼要求的開關+自動上鎖時間(可調整,最小5分鐘,預設60分鐘,取代原本寫死的5分鐘) | 前: v1.12-028 / 公告列表細部調整+憑證狀態整合:(1)分類分頁改3欄(原4欄文字被吃),點主分類後下方多一列子分類可再篩選(2)公告編號從第一排移到分類標籤之後(3)本機優先(還沒發布)的公告加綠底白字「本機」標籤(4)CredentialCard整合進既有「老師專屬憑證」那行,不再是獨立卡片,加憑證期限+離職日/已逾期原因顯示,展期按鈕改成到期前7天就會出現(不用等真的失效),移除卡片裡的離職按鈕(離職移到店資彈窗) | 前: v1.12-027 / 公告列表大改版:(1)標題下方加分類分頁(全部+最多6個主分類,從現有公告資料取不重複主分類,不用另外查Categories表)(2)每則公告第一排最前面加公告編號(3)加下架/上架:編輯頁下方新增按鈕,呼叫GAS toggleNoticeStatus,下架後列表仍看得到但灰字+加下架標籤,一般老師端(notices.json實際發布內容)會被過濾掉(4)editNotice核准後,GAS回傳最終欄位值(含AI產生的越南文),前端直接套用到本機列表,不用等下次發布就能看到完整結果 | 前: v1.12-025 / 重新正確加入離職+憑證展期功能(CredentialCard元件):上一版(v023)bridge匯入清單裡`buildReqLink`重複宣告(跟後面既有的申請碼系統匯入撞名),導致Babel轉譯整個檔案失敗、index.html跟著崩潰(白畫面"網站更新中")。這次改成只加缺少的識別字(gasVerifyKey/gasLeaveTeacher/gasSubmitAction/gasCheckAction/getMyKey),不重複加已存在的(buildReqLink/hasMyKey),並額外做了「解構清單重複識別字」專門檢查(TypeScript語法檢查器抓不到這種錯誤,只有真的用Babel轉譯才會抓到) | 前: v1.12-022 / 公告列表照新規格重排:第二排依序👤發布人/👁開啟次數(依主管選的人數或人次)/👍已讀人數/主子分類(受顯示開關控制)/時間(置右)。第一排文字改用主管選的標題或摘要(listText設定) | 前: v1.12-021 / 公告列表版面調整:第一排只留摘要+編輯鈕(主分類移出);第二排右側改放主/子分類(合併顯示,如"薪資・調整")+開啟次數(👁圖示+數字,取代原本的已讀人數,開啟次數是更寬鬆的被動記錄指標) | 前: 語系選項從基資分頁移到首頁設定的主題下方(語系是個人偏好,不屬於需要主管審核的基資,放首頁設定更直覺) | 前: 版次對齊(內容未變動):跟隨common.js/index.html/auth.html/notice-modal.js這次的整理點同步版號,方便日後從標題/檔頭確認全套部署是否一致 | 前: 公告分頁:移除進入公告頁後的提示文字段落(點右上新增公告...那句)。新增公告的權限限制(限主管supervisor+admin)在v034已完成(canManage判斷),此次確認沿用 | 前:hotfix:公告編輯權限判斷修正(admin查admin.cfg雜湊,不是staff.json role) | 前: 新增公告完整流程接功能(033)
// 注意:此檔為 type="text/babel",獨立作用域,需自行宣告 hooks 與 bridge
const{useState,useEffect,useCallback,useMemo}=React;
const{gasAnalyze,gasAddNotice,gasEditNotice,noticeSummary,noticeTitle,getNoticeReadCount,getNoticeShow,getNoticeListText,getNoticeCountType,getNoticeMainCats,getNoticesLocal,fetchNotices,gasVerifyKey,gasLeaveTeacher,gasSubmitAction,gasCheckAction,gasToggleNoticeStatus,gasSubmitSuggestion,gasListSuggestions,gasPushNoticeFlexToMe,getMyKey,LS,getKeyConfig,saveKeyConfig,buildDynamicKey,getCK,xEnc,xDec,fnv,adminHash,genAdminAct,revokeHash,approveHash,supApproveHash,genSimpleAct,isValidPin,lockPwdCred,gasSetInitialPwd,encWithKey,decWithKey,actKey,genActWithToken,verifyActToken,genReqCode,parseReqCode,decReqCode,identifyReqCode,buildReqLink,parseReqHash,genConnReq,parseConnReq,genSupReq,parseSupReq,genConfirmCode,verifyConfirmCode,confirmCodeIsBound,genUUID,getDeviceId,SUP_LEVELS,supLevelName,getGHConfig,saveGHConfigLocal,saveGHConfig,ghReadFile,ghWriteFile,ghAppendLine,ghRemoveLine,readStaff,writeStaff,checkApproved,writeApproval,loadStores,saveStores,loadStats,getApproved,saveApproved,addApproved,addLog,getLogs,fmtLog,fmtDate,THEMES,SKILL_KEYS,SKILL_SHORT,SKILL_PRICES,SKILL_COLORS,SK,SBG,STC,canWork,toB36,fromB36,dim,dow,bizDate,bizParts,dk,eDay,stamp,calcSal,eMon,newSlip,slipSvcLabel,SERVICES,PRESS_LEVELS,BODY_PARTS,CLIENT_REQS,custKey,loadCustDB,getCust,upsertCust,getGasUrl,setGasUrl,gasCall,hasMyKey,issueKey,claimMyKey,deleteCust,searchCustDB,recentCust,custLastSlip,slipStartTime,loadTagHistory,addTagHistory,visitStats,collectSlips,collectAllSlips,tagStats,searchSlips,bookTitleName,BOOK_TITLES,encMonth,decBackup,dataMonthRange,encRange,decRange,makePersonalBackup,parsePersonalBackup,restorePersonalBackup,TW_REGIONS,LANG_SCHOOLS,T}=window.MP;
function fmtSyncTime(iso){try{const d=new Date(iso);const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"/"+p(d.getMonth()+1)+"/"+p(d.getDate())+" "+p(d.getHours())+":"+p(d.getMinutes())}catch(_e){return ""}}

function ChartPage({t,settings,onClose}){
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
    <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-gray-100">{t.tabChart}</h2><button onClick={()=>onClose&&onClose()} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-400 active:bg-white/[0.12]">✕</button></div>
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

function BackupSection({settings,t}){
  const[input,setInput]=useState('');const[result,setResult]=useState(null);const[expCode,setExpCode]=useState('');const[expRange,setExpRange]=useState(null);
  const[jsonMsg,setJsonMsg]=useState(null);const[pendingImport,setPendingImport]=useState(null);const fileRef=React.useRef(null);
  const doExport=()=>{const range=dataMonthRange(settings.code,settings.year);if(!range){setExpCode('');setResult(t.noData);setTimeout(()=>setResult(null),2000);return}const code=encRange(settings.code,settings.year);setExpCode(code);setExpRange(range)};
  const doCopy=async()=>{try{await navigator.clipboard.writeText(expCode).catch(()=>{})}catch(_e){};setResult(t.copyDone);setTimeout(()=>setResult(null),2000)};
  const doImport=()=>{const list=decRange(input);if(list.length){list.forEach(p=>LS.set(dk(p.code,p.year,p.month),p.data));const ms=list.map(p=>p.month);setResult(`${t.importOk} → ${list[0].code} ${list[0].year} (${Math.min(...ms)}~${Math.max(...ms)}月)`);setInput('')}else{setResult(t.importFail)};setTimeout(()=>setResult(null),3000)};
  // JSON 完整備份匯出
  const doJsonExport=()=>{try{const obj=makePersonalBackup(settings.code,settings.year);const blob=new Blob([JSON.stringify(obj)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`massage-${settings.code}-${settings.year}-backup.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);doExport();setJsonMsg({ok:true,text:t.jsonAndCodeDone})}catch(e){setJsonMsg({ok:false,text:t.jsonExportFail})}setTimeout(()=>setJsonMsg(null),5000)};
  // JSON 匯入
  const doJsonImport=(e)=>{const file=e.target.files&&e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{let obj;try{obj=JSON.parse(reader.result)}catch(_e){setJsonMsg({ok:false,text:t.jsonBroken});setTimeout(()=>setJsonMsg(null),4000);return}const parsed=parsePersonalBackup(obj);if(!parsed.ok){const map={notBackup:t.jsonNotBackup,broken:t.jsonBroken,modified:t.jsonModified};setJsonMsg({ok:false,text:map[parsed.reason]||t.jsonBroken});setTimeout(()=>setJsonMsg(null),4000);return}if(parsed.code!==settings.code){setJsonMsg({ok:false,text:t.jsonOtherPerson+'（'+parsed.code+'）'});setTimeout(()=>setJsonMsg(null),4000);return}setPendingImport(parsed)};reader.readAsText(file);e.target.value=''};
  const confirmImport=()=>{if(!pendingImport)return;restorePersonalBackup(pendingImport);setPendingImport(null);setJsonMsg({ok:true,text:t.jsonImportDone});setTimeout(()=>{location.reload()},1200)};
  return(<div className="space-y-3 pt-4 border-t border-white/[0.06]"><h3 className="text-sm font-semibold text-amber-400">{t.backup}</h3><button onClick={doExport} className="w-full py-2.5 bg-amber-600 rounded-xl text-white text-sm font-semibold">{t.exportRangeCode}</button>{expCode&&(<div className="space-y-1"><p className="text-[11px] text-gray-500">{t.rangeHint}：{settings.year} {expRange?expRange.first+'~'+expRange.last+'月':''}</p><div className="relative"><div className="bg-white/[0.04] rounded-xl p-3 text-[10px] text-gray-500 break-all font-mono select-all">{expCode}</div><button onClick={doCopy} className="absolute top-2 right-2 px-2 py-1 bg-white/10 rounded text-xs text-gray-300">📋</button></div></div>)}<textarea value={input} onChange={e=>setInput(e.target.value)} rows={2} placeholder={t.enterUrl} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500 resize-none"/><button onClick={doImport} disabled={!input.trim()} className={`w-full py-3 rounded-xl font-bold text-white ${input.trim()?'bg-amber-600':'bg-white/[0.06] text-gray-600 cursor-not-allowed'}`}>{t.importUrl}</button><p className="text-[11px] text-gray-500 leading-relaxed">{t.rangeCodeNote}</p>{result&&<div className={`p-2.5 rounded-xl text-sm text-center fi ${result.includes(t.importFail)||result===t.noData?'bg-red-500/15 text-red-300':'bg-emerald-500/15 text-emerald-300'}`}>{result}</div>}
    <div className="pt-4 mt-2 border-t border-white/[0.06] space-y-2"><h3 className="text-sm font-semibold text-amber-400">{t.fullBackup}</h3><p className="text-[11px] text-gray-500 leading-relaxed">{t.fullBackupDesc}</p><button onClick={doJsonExport} className="w-full py-3 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700">{t.jsonExport}</button><button onClick={()=>fileRef.current&&fileRef.current.click()} className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-gray-200 text-sm font-bold active:bg-white/[0.1]">{t.jsonImport}</button><input ref={fileRef} type="file" accept="application/json,.json" onChange={doJsonImport} className="hidden"/>{pendingImport&&<div className="bg-amber-600/10 border border-amber-500/30 rounded-xl p-3 space-y-2 fi"><p className="text-[13px] text-amber-200">{t.jsonConfirmOverwrite}</p><div className="grid grid-cols-2 gap-2"><button onClick={()=>setPendingImport(null)} className="py-2 rounded-lg bg-white/[0.06] text-gray-300 text-sm">{t.cancel||'取消'}</button><button onClick={confirmImport} className="py-2 rounded-lg bg-amber-600 text-white text-sm font-bold">{t.confirm}</button></div></div>}{jsonMsg&&<div className={`p-2.5 rounded-xl text-sm text-center fi ${jsonMsg.ok?'bg-emerald-500/15 text-emerald-300':'bg-red-500/15 text-red-300'}`}>{jsonMsg.text}</div>}</div>
  </div>)}

/* ══════════ Settings ══════════ */
/* ══════════ Settings (slim — admin/supervisor 移至 auth.html) ══════════ */
// 客管分頁(老師端:流水hashtag統計 + 姓名/手機搜流水,不碰自約客)
function CustomerPage({t,settings,onClose}){
  const[mode,setMode]=useState('search'); // 預設客戶管理(搜尋)
  const[openTag,setOpenTag]=useState(null);
  const[openHistory,setOpenHistory]=useState(null); // 目前展開歷史記錄的客戶key
  const[q,setQ]=useState('');
  const[editCust,setEditCust]=useState(null);const[delConfirm,setDelConfirm]=useState(false);
  const year=settings.year||new Date().getFullYear();
  const custList=useMemo(()=>{return (q||'').trim()?searchCustDB(settings.code,q):recentCust(settings.code,10)},[q,settings.code,mode,editCust]);
  const saveCust=()=>{if(!editCust)return;upsertCust(settings.code,editCust);setEditCust(null)};
  const allSlips=useMemo(()=>collectAllSlips(settings.code,year),[settings.code,year]);
  const tags=useMemo(()=>tagStats(allSlips),[allSlips]);
  const fmtDT=(s)=>`${s.month}/${s.day} ${String(new Date(s.startTime).getHours()).padStart(2,'0')}:${String(new Date(s.startTime).getMinutes()).padStart(2,'0')}`;
  const tagSlips=openTag?allSlips.filter(s=>(s.tags||[]).includes(openTag)):[];
  const found=mode==='search'?searchSlips(allSlips,q):[];
  const slipRow=(s)=>(<div key={s.id} className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/[0.05] rounded-lg"><span className="text-sm font-bold text-amber-300 min-w-[3rem]">{slipSvcLabel(s,t===T.zh?"zh":"vi")}</span><span className="text-xs text-gray-400 tabular-nums w-20">{fmtDT(s)}</span><div className="flex-1 min-w-0"><span className="text-xs text-gray-300">{s.custName||''}{s.custTitle?' '+bookTitleName(s.custTitle,t===T.zh?'zh':'vi'):''}</span>{s.tags&&s.tags.length>0&&<span className="text-[10px] text-gray-500 ml-1">{s.tags.map(x=>'#'+x).join(' ')}</span>}</div>{s.custPhone&&<span className="text-[10px] text-gray-500">{s.custPhone}</span>}</div>);
  return(<div className="fi space-y-3 max-w-lg mx-auto px-4 py-2">
    <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-gray-100">{t.custMgmt}</h2><button onClick={()=>onClose&&onClose()} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-400 active:bg-white/[0.12]">✕</button></div>
    <div className="flex gap-1 bg-white/[0.03] rounded-lg p-1">
      <button onClick={()=>setMode('search')} className={`flex-1 py-1.5 rounded-md text-xs font-semibold ${mode==='search'?'bg-amber-600 text-white':'text-gray-500'}`}>{t.custSearchBtn}</button>
      <button onClick={()=>setMode('tags')} className={`flex-1 py-1.5 rounded-md text-xs font-semibold ${mode==='tags'?'bg-amber-600 text-white':'text-gray-500'}`}>{t.custTagStats}</button>
    </div>
    {mode==='tags'&&(<div className="space-y-2">
      {tags.length===0&&<p className="text-sm text-gray-500 text-center py-8">{t.custNoTags}</p>}
      {tags.length>0&&<div className="flex flex-wrap gap-1.5">{tags.map(({tag,count})=>(<button key={tag} onClick={()=>setOpenTag(openTag===tag?null:tag)} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${openTag===tag?'bg-amber-600 text-white':'bg-white/[0.05] text-gray-300'}`}>#{tag}<span className="text-[10px] opacity-70">({count})</span></button>))}</div>}
      {openTag&&<div className="space-y-1.5 pt-2"><p className="text-xs text-gray-500">#{openTag}（{tagSlips.length}）</p>{tagSlips.map(slipRow)}</div>}
    </div>)}
    {mode==='search'&&(<div className="space-y-2">
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder={t.custSearchPlaceholder} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/>
      {custList.length===0&&<p className="text-sm text-gray-500 text-center py-6">{(q||'').trim()?t.noMatch:t.custNoRecent}</p>}
      <div className="space-y-1.5">{custList.map((c,i)=>{const last=custLastSlip(settings.code,year,c.custName,c.custTitle,c.custPhone);const key=c.custPhone?('p:'+c.custPhone):('n:'+(c.custName||'')+'|'+(c.custTitle||''));const hist=c.history||[];const histOpen=openHistory===key;return(<div key={i}>
        <div className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-lg">
          <div onClick={()=>setEditCust({custName:c.custName||'',custTitle:c.custTitle||'',custPhone:c.custPhone||'',pressBody:c.pressBody||'',pressFoot:c.pressFoot||'',parts:c.parts||[]})} className="flex items-center gap-2 flex-1 min-w-0 active:opacity-70"><span className="text-sm text-gray-200">{c.custName||''}</span>{c.custTitle&&<span className="text-xs text-gray-400">{bookTitleName(c.custTitle,t===T.zh?'zh':'vi')}</span>}{c.custPhone&&<span className="text-xs text-gray-500">{c.custPhone}</span>}{last&&last.svc&&<span className="text-xs font-bold text-amber-300">{slipSvcLabel(last,t===T.zh?"zh":"vi")}</span>}{last&&<span className="text-[11px] text-gray-500 tabular-nums ml-auto whitespace-nowrap">{last.month}/{last.day} {String(new Date(last.startTime).getHours()).padStart(2,'0')}:{String(new Date(last.startTime).getMinutes()).padStart(2,'0')}</span>}</div>
          {hist.length>0&&<button onClick={()=>setOpenHistory(histOpen?null:key)} className={`text-[11px] px-2 py-1 rounded-full font-semibold flex-shrink-0 ${histOpen?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-400'}`}>({hist.length})</button>}
        </div>
        {histOpen&&(<div className="mt-1.5 ml-2 pl-3 border-l-2 border-white/[0.08] space-y-1.5 fi">{hist.slice().reverse().map((h,hi)=>(
          <div key={hi} className="bg-white/[0.02] rounded-lg px-2.5 py-2 text-[11px] text-gray-400">
            <p className="text-gray-500">{h.lastAt?new Date(h.lastAt).toLocaleString('zh-TW',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'—'}</p>
            {(h.pressBody||h.pressFoot)&&<p>{t.pressBody}：{h.pressBody?t['press'+h.pressBody.charAt(0).toUpperCase()+h.pressBody.slice(1)]:'—'}　{t.pressFoot}：{h.pressFoot?t['press'+h.pressFoot.charAt(0).toUpperCase()+h.pressFoot.slice(1)]:'—'}</p>}
            {h.parts&&h.parts.length>0&&<p>{t.strengthParts}：{h.parts.map(p=>t['part'+p.charAt(0).toUpperCase()+p.slice(1)]).join('、')}</p>}
          </div>
        ))}</div>)}
      </div>)})}</div>
    </div>)}
    {editCust&&(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={()=>setEditCust(null)}><div className="su bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}><div className="p-4 border-b border-white/[0.06] flex items-center justify-between"><h3 className="text-lg font-bold text-gray-100">{t.custEditTitle}</h3><button onClick={()=>setEditCust(null)} className="text-gray-500 text-sm">✕</button></div><div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-2"><input value={editCust.custName} onChange={e=>setEditCust({...editCust,custName:e.target.value})} placeholder={t.custName} className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/><select value={editCust.custTitle} onChange={e=>setEditCust({...editCust,custTitle:e.target.value})} className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500"><option value="">{t.custTitle}</option>{BOOK_TITLES.map(o=><option key={o.v} value={o.v}>{o[t===T.zh?'zh':'vi']}</option>)}</select></div>
      <input value={editCust.custPhone} onChange={e=>setEditCust({...editCust,custPhone:e.target.value})} inputMode="numeric" placeholder={t.custPhone} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/>
      <div className="grid grid-cols-2 gap-2"><div><label className="text-[10px] text-gray-600 block mb-0.5">{t.pressBody}</label><div className="flex gap-1">{PRESS_LEVELS.map(pl=>(<button key={pl} onClick={()=>setEditCust({...editCust,pressBody:editCust.pressBody===pl?'':pl})} className={`flex-1 py-1 rounded text-[11px] ${editCust.pressBody===pl?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{t['press'+pl.charAt(0).toUpperCase()+pl.slice(1)]}</button>))}</div></div><div><label className="text-[10px] text-gray-600 block mb-0.5">{t.pressFoot}</label><div className="flex gap-1">{PRESS_LEVELS.map(pl=>(<button key={pl} onClick={()=>setEditCust({...editCust,pressFoot:editCust.pressFoot===pl?'':pl})} className={`flex-1 py-1 rounded text-[11px] ${editCust.pressFoot===pl?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{t['press'+pl.charAt(0).toUpperCase()+pl.slice(1)]}</button>))}</div></div></div>
      <div><label className="text-[10px] text-gray-600 block mb-0.5">{t.strengthParts}</label><div className="flex flex-wrap gap-1">{BODY_PARTS.map(bp=>(<button key={bp} onClick={()=>{const arr=editCust.parts||[];setEditCust({...editCust,parts:arr.includes(bp)?arr.filter(x=>x!==bp):[...arr,bp]})}} className={`px-2 py-1 rounded text-[11px] ${(editCust.parts||[]).includes(bp)?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{t['part'+bp.charAt(0).toUpperCase()+bp.slice(1)]}</button>))}</div></div>
      <button onClick={saveCust} className="w-full py-3 rounded-xl bg-amber-600 text-white font-bold">{t.save}</button><button onClick={()=>{if(delConfirm){deleteCust(settings.code,editCust.custName,editCust.custTitle,editCust.custPhone);setEditCust(null);setDelConfirm(false)}else{setDelConfirm(true);setTimeout(()=>setDelConfirm(false),3000)}}} className={`w-full py-2.5 mt-2 rounded-xl text-sm font-semibold ${delConfirm?"bg-red-600 text-white":"bg-red-500/10 text-red-400"}`}>{delConfirm?(t.custDelConfirm||"再按一次確認刪除"):(t.custDelBtn||"刪除此客戶")}</button>
    </div></div></div>)}
  </div>);
}
// 圖表分頁(老師端:讀stats.json快照顯示班別比/性別比)
function SuggestPage({t,settings,onClose}){
  const[showAdd,setShowAdd]=React.useState(false);
  const[title,setTitle]=React.useState('');
  const[body,setBody]=React.useState('');
  const[anon,setAnon]=React.useState(false);
  const[status,setStatus]=React.useState('');
  const[busy,setBusy]=React.useState(false);
  const[list,setList]=React.useState(undefined);
  const load=()=>{gasListSuggestions().then(r=>{if(r&&r.ok)setList(r.list||[]);else setList([])}).catch(()=>setList([]))};
  React.useEffect(()=>{load()},[]);
  const closeAdd=()=>{setShowAdd(false);setTitle('');setBody('');setAnon(false);setStatus('')};
  const submit=async()=>{
    if(!title.trim()||!body.trim())return;
    setBusy(true);setStatus('');
    try{
      const r=await gasSubmitSuggestion(title.trim(),body.trim(),settings.code||'',anon);
      if(r&&r.ok){closeAdd();load()}else{setStatus('err')}
    }catch(_e){setStatus('err')}
    setBusy(false);
  };
  return(<div className="fi">
    <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold text-gray-100">{t.suggestBox||'建議'}</h2><div className="flex items-center gap-2"><button onClick={()=>setShowAdd(true)} className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold active:bg-amber-700">+ {t.suggestAdd||'新建議'}</button><button onClick={()=>onClose&&onClose()} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-400 active:bg-white/[0.12]">✕</button></div></div>
    {list===undefined?<p className="text-xs text-gray-600 text-center py-6">{t.loading||'載入中…'}</p>:list.length===0?<p className="text-xs text-gray-600 text-center py-6">{t.suggestEmpty||'目前沒有建議'}</p>:(
    <div className="space-y-2">{list.map(s=>(<div key={s.id} className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5"><div className="flex items-center justify-between gap-2"><p className="text-sm text-gray-200 font-medium truncate flex-1">{s.title}</p><span className="text-[10px] text-gray-500 flex-shrink-0">{s.anon?(t.suggestAnon||'發布人：隱藏'):('發布人：'+s.author)}</span></div><div className="flex items-center justify-between gap-2 mt-1"><p className="text-[11px] text-gray-500 truncate flex-1">{s.body}</p><span className="text-[10px] text-gray-600 flex-shrink-0">{s.time}</span></div></div>))}</div>
    )}
    {showAdd&&(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={closeAdd}><div className="bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-gray-900"><h3 className="text-base font-bold text-gray-100">{t.suggestAdd||'新建議'}</h3><button onClick={closeAdd} className="text-gray-500 text-sm">✕</button></div>
      <div className="p-4 space-y-4">
        <div><label className="text-xs text-gray-400 mb-1 block">{t.suggestTitle||'標題'}</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder={t.suggestTitlePh||'一句話說明你的建議'} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500" style={{boxSizing:'border-box'}}/></div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.suggestContent||'內容'}</label><textarea value={body} onChange={e=>setBody(e.target.value)} rows={5} placeholder={t.suggestContentPh||'詳細說明你的想法…'} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 resize-none" style={{boxSizing:'border-box'}}/></div>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={anon} onChange={e=>setAnon(e.target.checked)} className="w-4 h-4 rounded accent-amber-500"/><span className="text-sm text-gray-300">{t.suggestAnonOpt||'匿名發布（不顯示我的編號）'}</span></label>
        {status==='err'&&<p className="text-[11px] text-red-400 text-center">{t.suggestSubmitFail||'送出失敗，請再試一次'}</p>}
        <button onClick={submit} disabled={busy||!title.trim()||!body.trim()} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold active:bg-emerald-700 disabled:opacity-50">{busy?'…':(t.suggestSubmit||'送出建議')}</button>
      </div>
    </div></div>)}
  </div>);
}
function NoticeManagePage({t,settings,onClose}){
  const[showAdd,setShowAdd]=React.useState(false);
  const[content,setContent]=React.useState('');
  const[aiResult,setAiResult]=React.useState(null);
  const[aiStatus,setAiStatus]=React.useState('');
  const[list,setList]=React.useState(()=>{try{return getNoticesLocal()}catch(_e){return []}});
  const[noticeView,setNoticeView]=React.useState(null);
  const[canManage,setCanManage]=React.useState(false); // 主管/管理者才能新增+編輯公告
  const[editing,setEditing]=React.useState(null); // 正在編輯的公告(原始資料)
  const[editForm,setEditForm]=React.useState(null); // {cat,subcat,title,summary,body,tags}
  const[editStatus,setEditStatus]=React.useState('');
  const openNotice=(n)=>{try{if(getNoticeReadCount)getNoticeReadCount(n.id)}catch(_e){}setNoticeView(n)};
  React.useEffect(()=>{fetchNotices().then(l=>{if(Array.isArray(l))setList(l)}).catch(()=>{})},[]);
  React.useEffect(()=>{let alive=true;(async()=>{
    const code=(settings&&settings.code)||'';
    if(!code)return;
    // 先查staff.json role(主管的權威判斷方式)
    try{
      const staff=await readStaff();
      const me=(staff||[]).find(s=>String(s.code)===String(code));
      if(me&&(me.role==='supervisor'||me.role==='admin')){if(alive)setCanManage(true);return;}
    }catch(_e){}
    // 管理者不一定寫進staff.json role,權威判斷方式是admin.cfg雜湊比對(比照auth.html tryCheck邏輯)
    try{
      const res=await fetch('./admin.cfg',{cache:'no-store'});
      if(res.ok){
        const text=(await res.text()).trim();
        const lines=text.split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));
        const myHash=adminHash(code);
        const match=lines.some(l=>{const parts=l.split(':');const h=parts.length>=2?parts[parts.length-1]:parts[0];return h===myHash});
        if(match&&alive)setCanManage(true);
      }
    }catch(_e){}
  })();return()=>{alive=false}},[settings&&settings.code]);
  const closeAdd=()=>{setShowAdd(false);setContent('');setAiResult(null);setAiStatus('')};
  const myCode=(()=>{try{return (settings&&settings.code)||''}catch(_e){return ''}})();
  const[editAiFilled,setEditAiFilled]=React.useState([]);
  const openEdit=(n,ev)=>{try{if(ev)ev.stopPropagation()}catch(_e){}setEditing(n);setEditForm({cat:n.cat||'',subcat:n.subcat||'',title:n.title||'',summary:n.summary||'',body:n.body||'',tags:n.tags||''});setEditStatus('');setEditAiFilled([]);setReadInfo(null);setUnreadInfo(null);setEditPushMsg('')};
  const closeEdit=()=>{setEditing(null);setEditForm(null);setEditStatus('');setEditAiFilled([])};
  const updEdit=(k,v)=>setEditForm(p=>Object.assign({},p,{[k]:v}));
  const FIELD_ZH={cat:'主分類',subcat:'子分類',title:'標題',summary:'摘要',tags:'標籤'};
  const submitEdit=async()=>{
    if(!editing||!editForm)return;
    setEditStatus('saving');setEditAiFilled([]);
    try{
      const r=await gasEditNotice({id:editing.id,cat:editForm.cat,subcat:editForm.subcat,title:editForm.title,summary:editForm.summary,body:editForm.body,tags:editForm.tags,code:myCode});
      if(r&&r.ok){
        setEditAiFilled(Array.isArray(r.aiFilled)?r.aiFilled:[]);
        // 本機列表直接套用GAS回傳的最終欄位(含AI補的中文欄位+AI翻的越南文),不用等下次publishNotices就能馬上看到完整結果
        const merged=r.fields||editForm;
        setList(prev=>prev.map(x=>x.id===editing.id?Object.assign({},x,merged):x));
        setLocalOverrides(prev=>Object.assign({},prev,{[editing.id]:true}));
        setEditStatus(r.viOk===false?'savedNoVi':'saved');
        setTimeout(()=>closeEdit(),4500);
      }else{setEditStatus('失敗：'+((r&&r.error)||'?'));}
    }catch(e){setEditStatus('錯誤：'+e);}
  };
  const runAI=async()=>{
    if(!content.trim()){setAiStatus('請先輸入公告內容');return;}
    setAiStatus('processing');setAiResult(null);
    try{
      const r=await gasAnalyze(content,myCode,'新增公告');
      if(r&&r.ok){setAiResult(Object.assign({body:content},r.result));setAiStatus('');}
      else{setAiStatus('AI 失敗：'+((r&&r.error)||'?'));}
    }catch(e){setAiStatus('錯誤：'+e);}
  };
  const publish=async()=>{
    if(!aiResult){setAiStatus('請先產生 AI 結果');return;}
    setAiStatus('publishing');
    try{
      const r=await gasAddNotice({cat:aiResult.cat,subcat:aiResult.subcat,title:aiResult.title,summary:aiResult.summary,body:aiResult.body||content,bodyVi:aiResult.bodyVi,tags:aiResult.tags,titleVi:aiResult.titleVi,summaryVi:aiResult.summaryVi,author:myCode,code:myCode});
      if(r&&r.ok){setAiStatus('done:'+r.id);} // 不再自動關閉,留在頁面上讓主管可以推播到LINE+查誰還沒看
      else{setAiStatus('發布失敗：'+((r&&r.error)||'?'));}
    }catch(e){setAiStatus('錯誤：'+e);}
  };
  const[pushBusy,setPushBusy]=React.useState(false);const[pushMsg,setPushMsg]=React.useState('');
  const doPushNotice=async(noticeId)=>{
    setPushBusy(true);setPushMsg('');
    try{
      const r=await gasPushNoticeFlexToMe(noticeId,myCode);
      if(r&&r.ok)setPushMsg('✓ 已推播到你的LINE');
      else if(r&&r.needBind)setPushMsg('尚未綁定LINE帳號，請先到安全回報頁面登記一次');
      else setPushMsg('推播失敗：'+((r&&r.error)||'?'));
    }catch(e){setPushMsg('推播失敗：'+e)}
    setPushBusy(false);
  };
  const[readInfo,setReadInfo]=React.useState(null);const[readBusy,setReadBusy]=React.useState(false);
  const checkRead=async(noticeId)=>{
    setReadBusy(true);
    try{const r=await gasCall('noticeReads',{noticeId,detail:true},10000);if(r&&r.ok)setReadInfo(r)}catch(_e){}
    setReadBusy(false);
  };
  const copyText=async(text)=>{try{await navigator.clipboard.writeText(text);return true}catch(_e){try{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();document.execCommand('copy');document.body.removeChild(ta);return true}catch(_e2){return false}}};
  const[copyMsg,setCopyMsg]=React.useState('');
  const doCopy=async(text,label)=>{const ok=await copyText(text);setCopyMsg(ok?(label+'已複製'):'複製失敗');setTimeout(()=>setCopyMsg(''),2000)};
  const[editPushBusy,setEditPushBusy]=React.useState(false);const[editPushMsg,setEditPushMsg]=React.useState('');
  const doPushEdit=async()=>{
    if(!editing)return;
    setEditPushBusy(true);
    try{
      const r=await gasPushNoticeFlexToMe(editing.id,myCode);
      setEditPushMsg(r&&r.ok?'✓ 已推播':(r&&r.needBind?'尚未綁定LINE':'推播失敗'));
    }catch(_e){setEditPushMsg('推播失敗')}
    setEditPushBusy(false);
    setTimeout(()=>setEditPushMsg(''),2500);
  };
  const[unreadInfo,setUnreadInfo]=React.useState(null);const[unreadBusy,setUnreadBusy]=React.useState(false);
  const checkUnread=async(noticeId)=>{
    setUnreadBusy(true);
    try{const r=await gasCall('noticeUnread',{noticeId},10000);if(r&&r.ok)setUnreadInfo(r)}catch(_e){}
    setUnreadBusy(false);
  };
  const upd=(k,v)=>setAiResult(p=>Object.assign({},p,{[k]:v}));
  const[catTab,setCatTab]=React.useState('all');
  const[subTabSel,setSubTabSel]=React.useState('all');
  const[localOverrides,setLocalOverrides]=React.useState({}); // {id:true} 這則公告是不是套用了本機優先(還沒發布)的內容
  const mainCatsAll=React.useMemo(()=>{
    try{const v=getNoticeMainCats();if(v&&v.length)return v}catch(_e){}
    // 防呆:還沒按過「公告更新」重新發布、或Categories工作表還沒設定好時,mainCats會是空的。
    // 這種情況先退回舊做法(從目前公告資料裡抓出現過的分類),不然畫面會只剩「全部」一個按鈕看起來像壞掉。
    const s=[];const seen={};list.forEach(n=>{if(n.cat&&!seen[n.cat]){seen[n.cat]=1;s.push({zh:n.cat,vi:''})}});
    return s;
  },[list]);
  const catLabel=(zh)=>{const found=mainCatsAll.find(c=>c.zh===zh);return (settings.lang==='vi'&&found&&found.vi)?found.vi:zh};
  const subCatsPresent=React.useMemo(()=>{if(catTab==='all')return[];const s=[];const seen={};list.forEach(n=>{if(n.cat===catTab&&n.subcat&&!seen[n.subcat]){seen[n.subcat]=1;s.push(n.subcat)}});return s},[list,catTab]);
  const[toggleBusy,setToggleBusy]=React.useState(false);
  const toggleStatus=async()=>{
    if(!editing)return;
    setToggleBusy(true);
    try{
      const r=await gasToggleNoticeStatus(editing.id,myCode);
      if(r&&r.ok){
        setList(prev=>prev.map(x=>x.id===editing.id?Object.assign({},x,{status:r.status}):x));
        setEditing(prev=>prev?Object.assign({},prev,{status:r.status}):prev);
      }
    }catch(_e){}
    setToggleBusy(false);
  };
  return(<div className="fi">
    <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-gray-950 flex items-center justify-between mb-3"><h2 className="text-lg font-bold text-gray-100">{t.noticeCenter||'公告'}</h2><div className="flex items-center gap-2">{canManage&&<button onClick={()=>setShowAdd(true)} className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold active:bg-amber-700">+ {t.noticeAdd||'新增公告'}</button>}<button onClick={()=>onClose&&onClose()} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-400 active:bg-white/[0.12]">✕</button></div></div>
    <div className="grid grid-cols-3 gap-1.5 mb-2">{[['all',t.catTabAll||'全部'],...mainCatsAll.map(c=>[c.zh,catLabel(c.zh)])].map(([k,l])=>(<button key={k} onClick={()=>{setCatTab(k);setSubTabSel('all')}} className={`py-2 rounded-lg text-[11px] font-semibold truncate px-1 ${catTab===k?'bg-amber-600 text-white':'bg-white/[0.05] text-gray-400'}`}>{l}</button>))}</div>
    {catTab!=='all'&&subCatsPresent.length>0&&(<div className="flex flex-wrap gap-1.5 mb-3">{[['all',t.catTabAll||'全部'],...subCatsPresent.map(c=>[c,c])].map(([k,l])=>(<button key={k} onClick={()=>setSubTabSel(k)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${subTabSel===k?'bg-amber-500/20 text-amber-400 border border-amber-500/30':'bg-white/[0.04] text-gray-500 border border-transparent'}`}>{l}</button>))}</div>)}
    <div className="space-y-2 mt-3">{list.length===0?<p className="text-xs text-gray-600 text-center py-6">{t.noticeEmpty||'目前沒有公告'}</p>:list.filter(n=>(catTab==='all'||n.cat===catTab)&&(subTabSel==='all'||n.subcat===subTabSel)).slice().reverse().map(n=>{
      const listText=(typeof getNoticeListText==='function'?getNoticeListText():'summary');
      const showFlags=(typeof getNoticeShow==='function'?getNoticeShow():{cat:false,subcat:false});
      const countType=(typeof getNoticeCountType==='function'?getNoticeCountType():'people');
      const displayText=listText==='title'?(noticeTitle?noticeTitle(n,settings.lang):n.title):((noticeSummary?noticeSummary(n,settings.lang):n.summary)||n.title);
      const openN=countType==='visits'?(typeof n.openVisits==='number'?n.openVisits:0):(typeof n.openCount==='number'?n.openCount:0);
      const isOff=n.status==='off';
      const isLocal=!!localOverrides[n.id];
      return(<div key={n.id} onClick={()=>openNotice(n)} className={`bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5 active:bg-white/[0.06] cursor-pointer ${isOff?'opacity-50':''}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-[10px] text-gray-600 font-mono flex-shrink-0">{n.id}</span>
            <span className="text-[10px] text-gray-600 flex-shrink-0">・{n.date}</span>
            <span className="w-4 h-4 rounded-full bg-amber-600/30 flex items-center justify-center flex-shrink-0"><span className="text-[8px]">👤</span></span>
            <span className="text-[10px] text-gray-500 truncate">{n.author||''}</span>
          </div>
          {canManage&&<button onClick={(ev)=>openEdit(n,ev)} className="text-[11px] px-1.5 py-0.5 rounded-full bg-white/[0.08] text-gray-300 active:bg-white/[0.15] flex-shrink-0">✏️</button>}
        </div>
        <p className={`text-sm font-medium truncate mt-1 ${isOff?'text-gray-500':'text-gray-200'}`}>{displayText}</p>
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {(showFlags.cat&&n.cat)&&<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 flex-shrink-0">{n.cat}{(showFlags.subcat&&n.subcat)?'・'+n.subcat:''}</span>}
            {isOff&&<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-gray-500 flex-shrink-0">{t.noticeOffBtn||'下架'}</span>}
            {isLocal&&<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-600 text-white flex-shrink-0">{t.noticeLocalBadge||'本機'}</span>}
          </div>
          <span className="text-[10px] text-gray-500 flex-shrink-0">👁 {openN}</span>
        </div>
      </div>);
    })}</div>
    {noticeView&&window.NoticeDetailModal&&(()=>{const NDM=window.NoticeDetailModal;return <NDM notice={noticeView} settings={settings} t={t} onClose={()=>setNoticeView(null)} onMore={()=>setNoticeView(null)}/>;})()}
    {editing&&editForm&&(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={closeEdit}><div className="bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-gray-900"><h3 className="text-base font-bold text-gray-100">{t.noticeEdit||'編輯公告'} #{editing.id}</h3><button onClick={closeEdit} className="text-gray-500 text-sm">✕</button></div>
      <div className="p-4 space-y-3">
        <p className="text-sm text-red-500 font-semibold leading-relaxed">只需改中文,存檔後系統會在背景自動更新越南文翻譯;哪個欄位留空,AI 會依內文自動幫你補上。</p>
        <p className="text-sm text-red-500 font-semibold leading-relaxed">目前頁面是靜態的,每天晚上12點才會重新生成、計算已閱讀人數,所以你在重新整理後看到的還會是舊的,這是正常的。</p>
        <p className="text-sm text-red-500 font-semibold leading-relaxed">AI 翻譯及處理摘要等,每天免費是有額度的,請不要過度使用,造成額外費用。</p>
        <div className="grid grid-cols-2 gap-2"><div><label className="text-[10px] text-gray-500">主分類{!editForm.cat&&<span className="text-amber-500">（留空→AI自動判斷）</span>}</label><div className="relative"><input value={editForm.cat} onChange={e=>updEdit('cat',e.target.value)} className="w-full bg-white/[0.06] rounded-lg pl-2 pr-6 py-1.5 text-xs text-gray-100" style={{boxSizing:'border-box'}}/>{editForm.cat&&<button type="button" onClick={()=>updEdit('cat','')} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 active:text-red-400 text-xs px-1">✕</button>}</div></div><div><label className="text-[10px] text-gray-500">子分類{!editForm.subcat&&<span className="text-amber-500">（留空→AI自動判斷）</span>}</label><div className="relative"><input value={editForm.subcat} onChange={e=>updEdit('subcat',e.target.value)} className="w-full bg-white/[0.06] rounded-lg pl-2 pr-6 py-1.5 text-xs text-gray-100" style={{boxSizing:'border-box'}}/>{editForm.subcat&&<button type="button" onClick={()=>updEdit('subcat','')} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 active:text-red-400 text-xs px-1">✕</button>}</div></div></div>
        <div><label className="text-[10px] text-gray-500">標題{!editForm.title&&<span className="text-amber-500">（留空→AI自動生成）</span>}</label><div className="relative"><input value={editForm.title} onChange={e=>updEdit('title',e.target.value)} className="w-full bg-white/[0.06] rounded-lg pl-2 pr-6 py-1.5 text-xs text-gray-100" style={{boxSizing:'border-box'}}/>{editForm.title&&<button type="button" onClick={()=>updEdit('title','')} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 active:text-red-400 text-xs px-1">✕</button>}</div></div>
        <div><label className="text-[10px] text-gray-500">摘要{!editForm.summary&&<span className="text-amber-500">（留空→AI自動生成）</span>}</label><div className="relative"><input value={editForm.summary} onChange={e=>updEdit('summary',e.target.value)} className="w-full bg-white/[0.06] rounded-lg pl-2 pr-6 py-1.5 text-xs text-gray-100" style={{boxSizing:'border-box'}}/>{editForm.summary&&<button type="button" onClick={()=>updEdit('summary','')} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 active:text-red-400 text-xs px-1">✕</button>}</div></div>
        <div><label className="text-[10px] text-gray-500">內文</label><textarea value={editForm.body} onChange={e=>updEdit('body',e.target.value)} rows={5} className="w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-gray-100 resize-none" style={{boxSizing:'border-box'}}/></div>
        <div><label className="text-[10px] text-gray-500">標籤{!editForm.tags&&<span className="text-amber-500">（留空→AI自動生成）</span>}</label><div className="relative"><input value={editForm.tags} onChange={e=>updEdit('tags',e.target.value)} className="w-full bg-white/[0.06] rounded-lg pl-2 pr-6 py-1.5 text-xs text-gray-100" style={{boxSizing:'border-box'}}/>{editForm.tags&&<button type="button" onClick={()=>updEdit('tags','')} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 active:text-red-400 text-xs px-1">✕</button>}</div></div>
        {editStatus==='saving'&&<p className="text-[11px] text-amber-500 text-center">存檔中…（背景AI處理，免費空間較慢）</p>}
        {editStatus==='saved'&&<p className="text-[11px] text-emerald-500 text-center font-semibold">✓ 已存檔，越南文已同步更新{editAiFilled.length>0?('，AI 已自動補上：'+editAiFilled.map(k=>FIELD_ZH[k]||k).join('、')):''}。公告頁是快取，需等下次更新才會顯示，當下沒變是正常的。</p>}
        {editStatus==='savedNoVi'&&<p className="text-[11px] text-amber-500 text-center font-semibold">✓ 中文已存檔{editAiFilled.length===0?'':'（部分欄位待AI補，'}，AI 處理暫時失敗待補（不影響已填的中文內容）。</p>}
        {editStatus&&editStatus!=='saving'&&editStatus!=='saved'&&editStatus!=='savedNoVi'&&<p className="text-[11px] text-red-400 text-center">{editStatus}</p>}
        <div className="pt-2 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold text-gray-400">誰有看</p><div className="flex gap-1.5"><button onClick={()=>checkRead(editing.id)} disabled={readBusy} className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-400 disabled:opacity-50">{readBusy?'查詢中…':'查詢'}</button>{readInfo&&readInfo.readers&&readInfo.readers.length>0&&<button onClick={()=>doCopy('公告編號：'+editing.id+'\n公告摘要：'+(editing.summary||editing.title||'')+'\n已閱讀（'+readInfo.readers.length+'人）：'+readInfo.readers.map(r=>r.code).join('、'),'已閱讀名單')} className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-400">複製</button>}</div></div>
          {readInfo&&(readInfo.readers?<div className="bg-white/[0.03] rounded-lg p-2.5"><p className="text-[11px] text-gray-500 mb-1">共{readInfo.readers.length}人</p><div className="flex flex-wrap gap-1">{readInfo.readers.map(r=>(<span key={r.code} className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">{r.code}</span>))}</div></div>:null)}
          <div className="flex items-center justify-between"><p className="text-xs font-semibold text-gray-400">誰沒看</p><div className="flex gap-1.5"><button onClick={()=>checkUnread(editing.id)} disabled={unreadBusy} className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-400 disabled:opacity-50">{unreadBusy?'查詢中…':'查詢'}</button>{unreadInfo&&unreadInfo.total>0&&<button onClick={()=>doCopy('公告編號：'+editing.id+'\n公告摘要：'+(editing.summary||editing.title||'')+'\n未閱讀（'+unreadInfo.total+'人）：\n'+['day','night','other'].map(k=>unreadInfo[k]&&unreadInfo[k].length?(k==='day'?'早班：':k==='night'?'晚班：':'未選班別：')+unreadInfo[k].join('、'):'').filter(Boolean).join('\n'),'未閱讀名單')} className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-400">複製</button>}</div></div>
          {unreadInfo&&(<div className="bg-white/[0.03] rounded-lg p-2.5 space-y-1"><p className="text-[11px] text-gray-500">未讀共{unreadInfo.total}人</p>{unreadInfo.day.length>0&&<p className="text-[11px] text-gray-400">早班：{unreadInfo.day.join('、')}</p>}{unreadInfo.night.length>0&&<p className="text-[11px] text-gray-400">晚班：{unreadInfo.night.join('、')}</p>}{unreadInfo.other.length>0&&<p className="text-[11px] text-gray-400">未選班別：{unreadInfo.other.join('、')}</p>}</div>)}
          {copyMsg&&<p className="text-[11px] text-center text-emerald-400">{copyMsg}</p>}
        </div>
        <div className="pt-2 border-t border-white/[0.06] grid grid-cols-3 gap-2">
          <button onClick={submitEdit} disabled={editStatus==='saving'} className="py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold active:bg-emerald-700 disabled:opacity-50">{editStatus==='saving'?'…':(t.noticeSaveBtn||'修改')}</button>
          <button onClick={toggleStatus} disabled={toggleBusy} className={`py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 ${editing.status==='off'?'bg-emerald-600/20 text-emerald-400':'bg-red-600/20 text-red-400'}`}>{toggleBusy?'…':(editing.status==='off'?(t.noticeOnBtn||'上架'):(t.noticeOffBtn||'下架'))}</button>
          <button onClick={doPushEdit} disabled={editPushBusy} className="py-2.5 rounded-xl bg-[#06C755] text-white text-xs font-semibold active:opacity-80 disabled:opacity-50 flex items-center justify-center gap-1">{editPushBusy?'…':<svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.5 2 2 5.6 2 10c0 3.9 3.6 7.2 8.4 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1.1 1 .6 1.1-.5 6.2-3.7 8.5-6.3C22.1 12.6 22 11.3 22 10c0-4.4-4.5-8-10-8z"/></svg>}分享
          </button>
        </div>
        {editPushMsg&&<p className="text-[11px] text-center text-gray-400">{editPushMsg}</p>}
      </div>
    </div></div>)}
    {showAdd&&(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={closeAdd}><div className="bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-gray-900"><h3 className="text-base font-bold text-gray-100">{t.noticeAdd||'新增公告'}</h3><button onClick={closeAdd} className="text-gray-500 text-sm">✕</button></div>
      <div className="p-4 space-y-4">
        <div><label className="text-xs text-gray-400 mb-1 block">{t.noticeContentLabel||'公告內容（中文）'}</label><textarea value={content} onChange={e=>setContent(e.target.value)} rows={6} placeholder={t.noticeContentPh||'直接貼上或輸入公告內容，其他交給 AI…'} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 resize-none" style={{boxSizing:'border-box'}}/></div>
        <button onClick={runAI} disabled={aiStatus==='processing'||aiStatus==='publishing'} className="w-full py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold active:bg-sky-700 disabled:opacity-50">{aiStatus==='processing'?'AI 處理中…（免費空間較慢）':('✨ '+(t.noticeAIGen||'AI 產生'))}</button>
        {aiStatus&&aiStatus!=='processing'&&aiStatus!=='publishing'&&!aiStatus.startsWith('done:')&&<p className="text-[11px] text-amber-500 text-center">{aiStatus}</p>}
        {aiResult&&(<div className="space-y-2 bg-white/[0.03] rounded-xl p-3">
          <p className="text-[11px] text-gray-500">{t.noticeAIPreview||'AI 產生結果（可修改後發布）'}</p>
          <div className="grid grid-cols-2 gap-2"><div><label className="text-[10px] text-gray-500">主分類</label><input value={aiResult.cat||''} onChange={e=>upd('cat',e.target.value)} className="w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-gray-100" style={{boxSizing:'border-box'}}/></div><div><label className="text-[10px] text-gray-500">子分類</label><input value={aiResult.subcat||''} onChange={e=>upd('subcat',e.target.value)} className="w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-gray-100" style={{boxSizing:'border-box'}}/></div></div>
          <div><label className="text-[10px] text-gray-500">標題</label><input value={aiResult.title||''} onChange={e=>upd('title',e.target.value)} className="w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-gray-100" style={{boxSizing:'border-box'}}/></div>
          <div><label className="text-[10px] text-gray-500">摘要</label><input value={aiResult.summary||''} onChange={e=>upd('summary',e.target.value)} className="w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-gray-100" style={{boxSizing:'border-box'}}/></div>
          <div><label className="text-[10px] text-gray-500">標籤</label><input value={aiResult.tags||''} onChange={e=>upd('tags',e.target.value)} className="w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-gray-100" style={{boxSizing:'border-box'}}/></div>
          <div><label className="text-[10px] text-emerald-600">越南文標題</label><input value={aiResult.titleVi||''} onChange={e=>upd('titleVi',e.target.value)} className="w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-emerald-500" style={{boxSizing:'border-box'}}/></div>
          <div><label className="text-[10px] text-emerald-600">越南文內容</label><textarea value={aiResult.bodyVi||''} onChange={e=>upd('bodyVi',e.target.value)} rows={3} className="w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-emerald-500 resize-none" style={{boxSizing:'border-box'}}/></div>
        </div>)}
        {aiStatus&&aiStatus.startsWith('done:')&&(<div className="space-y-2">
          <p className="text-[11px] text-emerald-500 text-center font-semibold">✓ 已發布（{aiStatus.slice(5)}號）。公告頁是快取，需等下次更新才會顯示，當下沒變是正常的。</p>
          <button onClick={()=>doPushNotice(aiStatus.slice(5))} disabled={pushBusy} className="w-full py-2.5 rounded-xl bg-[#06C755] text-white text-sm font-semibold active:bg-[#05a648] disabled:opacity-50">{pushBusy?'推播中…':'📲 推播到我的LINE'}</button>
          {pushMsg&&<p className="text-[11px] text-center text-gray-400">{pushMsg}</p>}
          <button onClick={()=>checkUnread(aiStatus.slice(5))} disabled={unreadBusy} className="w-full py-2 rounded-xl bg-white/[0.06] text-gray-400 text-xs font-semibold disabled:opacity-50">{unreadBusy?'查詢中…':'查誰還沒看'}</button>
          {unreadInfo&&(<div className="bg-white/[0.03] rounded-lg p-2.5 space-y-1"><p className="text-[11px] text-gray-500">未讀共{unreadInfo.total}人</p>{unreadInfo.day.length>0&&<p className="text-[11px] text-gray-400">早班：{unreadInfo.day.join('、')}</p>}{unreadInfo.night.length>0&&<p className="text-[11px] text-gray-400">晚班：{unreadInfo.night.join('、')}</p>}{unreadInfo.other.length>0&&<p className="text-[11px] text-gray-400">其他：{unreadInfo.other.join('、')}</p>}</div>)}
          <button onClick={closeAdd} className="w-full py-2 rounded-xl bg-white/[0.04] text-gray-500 text-xs">關閉</button>
        </div>)}
        <div className="pt-2 border-t border-white/[0.06]"><button onClick={publish} disabled={!aiResult||aiStatus==='publishing'||(aiStatus&&aiStatus.startsWith('done:'))} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold active:bg-emerald-700 disabled:opacity-50">{aiStatus==='publishing'?'發布中…':(aiStatus&&aiStatus.startsWith('done:'))?'✓ 已發布':(t.noticePublishBtn||'發布公告')}</button></div>
      </div>
    </div></div>)}
  </div>);
}
function CredentialCard({t,settings}){
  const code=settings&&settings.code;
  const[status,setStatus]=React.useState(null); // null/checking/ok/invalid
  const[expiresAt,setExpiresAt]=React.useState('');
  const[reason,setReason]=React.useState(''); // 'left'/'expired'/''
  const[daysLeft,setDaysLeft]=React.useState(null);
  const[showRenew,setShowRenew]=React.useState(false);
  const[devId]=React.useState(()=>getDeviceId());
  const[ticketSeq,setTicketSeq]=React.useState('');const[ticketStatus,setTicketStatus]=React.useState('');const[cooldown,setCooldown]=React.useState(0);const[busy,setBusy]=React.useState(false);const[err,setErr]=React.useState('');
  const doCheck=React.useCallback(()=>{
    if(!code||!hasMyKey(code)){setStatus('ok');return}
    setStatus('checking');
    (async()=>{
      try{
        const key=getMyKey(code);
        const r=await gasVerifyKey(code,key);
        setStatus((r&&r.ok&&r.valid)?'ok':'invalid');
        setExpiresAt((r&&r.expiresAt)||'');
        setReason((r&&r.reason)||'');
        if(r&&r.expiresAt){
          const d=Math.ceil((new Date(r.expiresAt.replace(/\//g,'-')).getTime()-Date.now())/86400000);
          setDaysLeft(d);
        }else{setDaysLeft(null)}
      }catch(_e){setStatus('ok')}
    })();
  },[code]);
  React.useEffect(()=>{doCheck()},[doCheck]);
  React.useEffect(()=>{if(cooldown<=0)return;const tm=setTimeout(()=>setCooldown(c=>c>0?c-1:0),1000);return()=>clearTimeout(tm)},[cooldown]);
  const submitRenew=async()=>{
    setBusy(true);setErr('');
    try{
      const r=await gasSubmitAction('E',code,{devId});
      setBusy(false);
      if(r&&r.ok){setTicketSeq(r.seq);setTicketStatus('')}else{setErr((r&&r.error)||'送出失敗')}
    }catch(e){setBusy(false);setErr(String(e))}
  };
  const checkRenew=async()=>{
    if(cooldown>0||ticketStatus==='checking')return;
    setTicketStatus('checking');
    try{
      const r=await gasCheckAction(ticketSeq);
      if(r&&r.ok){
        if(r.status==='approved'){
          setTicketStatus('approved');
          try{const today=new Date().toISOString().slice(0,10);localStorage.setItem('key-check-date-'+code,today);localStorage.setItem('key-check-result-'+code,'ok')}catch(_e){}
          setTimeout(()=>{setShowRenew(false);setTicketSeq('');setTicketStatus('');doCheck()},1500);
        }else{setTicketStatus('pending');setCooldown(60)}
      }else{setTicketStatus('error');setCooldown(60)}
    }catch(_e){setTicketStatus('error');setCooldown(60)}
  };
  const showRenewBtn=status==='invalid'||(typeof daysLeft==='number'&&daysLeft<=7&&daysLeft>=0);
  return(<>
    <div className="bg-white/[0.04] rounded-xl px-4 py-3">
      <div className="flex items-center justify-between"><span className="text-sm text-gray-400">{t.teacherCert||'老師專屬憑證'}</span><span className={`text-sm font-semibold ${status==='invalid'?'text-red-400':'text-emerald-400'}`}>{status==='checking'?'…':status==='invalid'?(t.credentialInvalid||'無效'):('✓ '+(t.certGot||'本機已領'))}</span></div>
      {expiresAt&&<div className="flex items-center justify-between mt-1"><span className="text-xs text-gray-500">{t.credentialExpiryLabel||'憑證期限'}</span><span className="text-xs text-gray-400">{expiresAt}{reason==='left'?('（'+(t.leftDateLabel||'離職日')+'）'):reason==='expired'?('（'+(t.expiredLabel||'已逾期')+'）'):''}</span></div>}
    </div>
    {showRenewBtn&&<button onClick={()=>setShowRenew(true)} className="w-full py-2.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 text-sm font-semibold active:bg-amber-600/30">{t.renewModalTitle||'憑證展期'}</button>}
    {showRenew&&(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={()=>setShowRenew(false)}><div className="bg-gray-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl" onClick={e=>e.stopPropagation()}>
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between"><h3 className="text-base font-bold text-gray-100">{t.renewModalTitle}</h3><button onClick={()=>setShowRenew(false)} className="text-gray-500 text-sm">✕</button></div>
      <div className="p-4 space-y-4">
        {!ticketSeq?(<>
          <p className="text-sm text-gray-400">{t.renewModalBody}</p>
          {err&&<p className="text-xs text-red-400 text-center">{err}</p>}
          <button onClick={submitRenew} disabled={busy} className="w-full py-3 rounded-xl bg-amber-600 text-white font-bold disabled:opacity-50">{busy?'…':t.submitActivation}</button>
        </>):(<>
          <div className="bg-white/[0.03] rounded-xl p-4 text-center"><p className="text-[11px] text-gray-500 mb-1">{t.ticketInfoTeacher}</p><p className="text-2xl font-bold text-gray-100 mb-3">{code}</p><p className="text-[11px] text-gray-500 mb-1">{t.ticketCode}</p><p className="text-base font-semibold text-amber-400 font-mono tracking-widest select-all">{ticketSeq}</p></div>
          <button onClick={()=>{const base=location.origin+location.pathname.replace(/index\.html$/,'')+'auth.html';const link=buildReqLink(base,ticketSeq);const isVi=ticketSeq&&ticketSeq[1]==='2';const zhMsg=(T.zh.lineTicketRenewPrefix||'').replace('{code}',code);const viMsg=(T.vi.lineTicketRenewPrefix||'').replace('{code}',code);const msg=zhMsg+(isVi?'\n'+viMsg:'')+'\n'+link;location.href='https://line.me/R/share?text='+encodeURIComponent(msg)}} className="w-full px-3 py-4 rounded-xl text-base font-bold bg-[#06C755] text-white active:bg-[#05b34c]">{t.ticketSend}</button>
          <button onClick={checkRenew} disabled={cooldown>0||ticketStatus==='checking'} className={`w-full py-3.5 rounded-xl font-bold transition-all ${cooldown>0||ticketStatus==='checking'?'bg-white/[0.06] text-gray-600 cursor-not-allowed':'bg-amber-600 text-white'}`}>{ticketStatus==='checking'?t.ticketChecking:cooldown>0?fmtLog(t.ticketWaitCountdown,[String(cooldown)]):t.ticketCheckBtn}</button>
          {ticketStatus==='pending'&&<p className="text-xs text-gray-500 text-center">{t.ticketPending}</p>}
          {ticketStatus==='approved'&&<p className="text-xs text-emerald-400 text-center font-semibold">{t.ticketApproved}</p>}
          {ticketStatus==='error'&&<p className="text-xs text-red-400 text-center">{t.pwdLoginFail}</p>}
        </>)}
      </div>
    </div></div>)}
  </>);
}
function SettingsPage({settings,onUpdate,t,theme,setTheme,onClose,onLogout}){
  const[form,setForm]=useState({...settings});const[gasTest,setGasTest]=useState('');const[keyAdminSec,setKeyAdminSec]=useState('');const[keyGenCode,setKeyGenCode]=useState('');const[keyGenResult,setKeyGenResult]=useState(null);const[claimInput,setClaimInput]=useState('');const[claimMsg,setClaimMsg]=useState('');
  const[saved,setSaved]=useState(false);
  const[subTab,setSubTab]=useState('home');
  useEffect(()=>{try{const s=sessionStorage.getItem('__settingsSub');if(s){setSubTab(s);sessionStorage.removeItem('__settingsSub')}}catch(e){}},[]);
  const devId=getDeviceId();
  const[connMode,setConnMode]=useState(null);
  const[connInput,setConnInput]=useState('');
  const[connStatus,setConnStatus]=useState('');
  const[stores,setStores]=useState([]);
  const[logoutConfirm,setLogoutConfirm]=useState(false);
  // 重設密碼(沿用忘記密碼那套邏輯:雙欄同時顯示可互相比對,不用先驗證舊密碼)
  const[pwdResetOpen,setPwdResetOpen]=useState(false);
  const[newPwd1,setNewPwd1]=useState('');const[newPwd2,setNewPwd2]=useState('');
  const[pwdActiveField,setPwdActiveField]=useState('');
  const[pwdResetBusy,setPwdResetBusy]=useState(false);const[pwdResetMsg,setPwdResetMsg]=useState('');
  const newPwdOk=isValidPin(newPwd1);
  const doResetPwd=async()=>{
    if(!newPwdOk||newPwd1!==newPwd2)return;
    setPwdResetBusy(true);setPwdResetMsg('');
    try{
      const r=await gasSetInitialPwd(settings.code,lockPwdCred(settings.code,newPwd1));
      if(r&&r.ok){onUpdate({...settings,lockPwd:newPwd1});setPwdResetMsg('✓ 密碼已更新');setNewPwd1('');setNewPwd2('');setPwdActiveField('');setTimeout(()=>{setPwdResetOpen(false);setPwdResetMsg('')},1200)}
      else{setPwdResetMsg((r&&r.error)||'更新失敗')}
    }catch(e){setPwdResetMsg(String(e))}
    setPwdResetBusy(false);
  };
  const[basicCode,setBasicCode]=useState('');
  const[storeCode,setStoreCode]=useState('');
  const lang=t===T.zh?'zh':'vi';
  useEffect(()=>{loadStores().then(setStores)},[]);
  const upd=(patch)=>{const ns={...form,...patch};setForm(ns);onUpdate({...ns,lastSyncBasic:settings.lastSyncBasic,lastSyncStore:settings.lastSyncStore})};
  const[goAuthChecking,setGoAuthChecking]=useState(false);
  const goAuth=async()=>{
    if(goAuthChecking)return;setGoAuthChecking(true);
    let hasPerm=false;
    try{const sup=LS.get('supervisor-'+settings.code);if(sup&&sup.status==='approved')hasPerm=true}catch(_e){}
    if(!hasPerm){try{const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),4000);const res=await fetch('./admin.cfg',{cache:'no-store',signal:ctrl.signal});clearTimeout(timer);if(res.ok){const text=(await res.text()).trim();const lines=text.split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));const myHash=adminHash(settings.code);hasPerm=lines.some(l=>{const parts=l.split(':');const h=parts.length>=2?parts[parts.length-1]:parts[0];return h===myHash})}}catch(_e){}}
    location.href='./auth.html#lang='+(settings.lang||'zh')+(hasPerm?'&auto=1':'');
  };
  const fld=(label,key,opt)=>(<div><label className="text-xs text-gray-400 mb-1 block">{label}{opt&&<span className="text-[10px] text-gray-600 ml-1">({t.optional})</span>}</label><input value={form[key]||''} onChange={e=>upd({[key]:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/></div>);
  const Construction=()=>(<div className="flex flex-col items-center justify-center py-20 text-center"><svg className="w-12 h-12 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/></svg><p className="text-sm text-gray-500">{t.underConstruction}</p></div>);
  // 產生申請碼:把欄位加密,標記變動
  const isBound=()=>{try{return localStorage.getItem('uuid-bound-'+settings.code)==='1'}catch(_e){return false}};
  const[reqErr,setReqErr]=useState('');
  // 必填檢核:* 欄位
  const checkRequired=(cat,fields)=>{const miss=[];if(cat==='basic'){if(!fields.gender)miss.push(t.gender);if(!fields.addrCity)miss.push(t.city);if(!fields.addrDist)miss.push(t.district);}else if(cat==='store'){if(!fields.shift)miss.push(t.shift);if(!fields.workStart)miss.push(t.workStart);if(!fields.workEnd)miss.push(t.workEnd);if(!fields.preg)miss.push(t.pregClient);if(!fields.oil)miss.push(t.oilLabel)}return miss};
  const genCode=(cat,fields,setter)=>{const miss=checkRequired(cat,fields);if(miss.length){setReqErr(t.reqMissing+'：'+miss.join('、'));setter('');setTimeout(()=>setReqErr(''),4000);return}setReqErr('');try{const enc=genReqCode(cat,settings.code,devId,fields,isBound());setter(enc)}catch(e){setter('')}};
  // 貼確認碼:驗證通過→更新本機快照(清未確認)+若確認碼大寫設已綁定
  const[confirmInput,setConfirmInput]=useState('');
  const[confirmMsg,setConfirmMsg]=useState('');
  const applyConfirm=async(cat,fields,snapKey)=>{const ok=verifyConfirmCode(confirmInput,cat,settings.code,fields);if(ok){const snap={...fields};if(cat==='store'){snap.storeSel=form.storeSel||'';}const nowIso=new Date().toISOString();const syncKey=cat==='store'?'lastSyncStore':'lastSyncBasic';let ns={...settings,...form,[snapKey]:snap,[syncKey]:nowIso};
    // #9:確認碼通過後,主動讀 staff.json 找自己編號,把雲端有的欄位寫回本機(以雲端為準)
    try{const staff=await readStaff({});if(Array.isArray(staff)&&staff.length){const me=staff.find(s=>String(s.code)===String(settings.code));if(me){const merge={};['nameZh','nameVi','phone','email','storeSel','shift','permitNo','permitExpiry','permitDate','permitOrg'].forEach(k=>{if(me[k]!==undefined&&me[k]!==''&&me[k]!==null)merge[k]=me[k]});ns={...ns,...merge}}}}catch(_e){}
    onUpdate(ns);setForm(f=>({...f,lastSyncBasic:ns.lastSyncBasic,lastSyncStore:ns.lastSyncStore}));if(confirmCodeIsBound(confirmInput)){try{localStorage.setItem('uuid-bound-'+settings.code,'1')}catch(_e){}}setConfirmMsg('ok');setConfirmInput('');setTimeout(()=>setConfirmMsg(''),3000)}else{setConfirmMsg('fail');setTimeout(()=>setConfirmMsg(''),3000)}};
  const onWorkStartChange=(hh)=>{let patch={workStart:hh};if(hh!==''){const h=Number(hh);const eh=(h+12)%24;patch.workEnd=String(eh).padStart(2,'0')+':00';}upd(patch)};
  // 上工預設現在小時(僅未設過時)
  useEffect(()=>{if(!form.workStart&&!settings.workStart){const nowH=new Date().getHours();const eh=(nowH+12)%24;upd({workStart:String(nowH).padStart(2,'0')+':00',workEnd:String(eh).padStart(2,'0')+':00'})}},[]);
  // 前次主管確認值快照(只有確認過才有,新老師沒有→不顯示紅字)
  const confirmedP=settings.confirmedProfile||null;
  const confirmedS=settings.confirmedStore||null;
  // 是否為主管(有連線能力):主管改了直接存,不需確認流程,不亮❗
  const isSupervisor=useMemo(()=>{const gh=getGHConfig();return!!(gh&&gh.token)},[]);
  // 基資/店資是否有未確認變動(主管除外)
  const profileFields=['gender','nameZh','nameVi','phone','email','addrCity','addrDist','addrDetail','school','major','schoolType','permitNo','permitDate','permitExpiry','permitOrg'];
  const storeFields=['storeSel','shift','workStart','workEnd','workNote','unitPrice','preg','oil','techMentor','lockerNo'];
  const hasChg=(snapshot,fields,src)=>{if(isSupervisor)return false;if(!snapshot)return fields.some(k=>{const v=src[k];return v!==undefined&&v!==''&&v!==null});return fields.some(k=>(snapshot[k]||'')!==((src[k]!==undefined?src[k]:'')||''))};
  const basicChanged=hasChg(confirmedP,profileFields,form);
  const storeChanged=hasChg(confirmedS,storeFields,form);
  const anyChanged=basicChanged||storeChanged;
  // 工作證到期提醒:到期前30天內或已過期
  const permitExpiring=(()=>{if(!form.permitExpiry)return false;const exp=new Date(form.permitExpiry);const now=new Date();const days=(exp-now)/86400000;return days<=30})();
  const prevHint=(snapshot,key,curVal)=>{
    // 優先比對 staff 現值(公司登記),不一致顯示紅字
    const sv=settings.staffValues&&settings.staffValues[key];
    if(sv!==undefined&&sv!==null&&sv!==''){
      if(String(sv)!==String(curVal||''))return<p className="text-[11px] text-red-400 mt-1">{t.staffValueHint}：{String(sv)}</p>;
      return null;
    }
    // 無 staff 值時,退回比對上次確認快照
    if(!snapshot||!(key in snapshot))return null;const prev=snapshot[key];if((prev||'')===(curVal||''))return null;return<p className="text-[11px] text-red-400 mt-1">{t.prevConfirmed}：{prev||'—'}</p>};
  const fldP=(label,key,opt,snapshot)=>(<div><label className="text-xs text-gray-400 mb-1 block">{label}{opt&&<span className="text-[10px] text-gray-600 ml-1">({t.optional})</span>}</label><input value={form[key]||''} onChange={e=>upd({[key]:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/>{prevHint(snapshot,key,form[key])}</div>);
  return(
    <div className="flex h-full fi">
      <div className="flex-1 w-full overflow-y-auto p-4 pb-8 space-y-5 min-w-0">
      {subTab==='home'&&(<div className="space-y-5 fi">
        <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-gray-950 flex items-center justify-between"><h2 className="text-lg font-bold text-gray-100">{t.homeSettings}</h2><button onClick={()=>onClose&&onClose()} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-400 active:bg-white/[0.12]">✕</button></div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.year}</label>
          <div className="flex items-center gap-3"><button onClick={()=>upd({year:form.year-1})} className="w-12 h-12 rounded-xl bg-white/[0.04] text-gray-300 text-2xl active:bg-white/[0.08]">−</button><span className="text-2xl font-bold text-gray-100 flex-1 text-center tabular-nums">{form.year}</span><button onClick={()=>upd({year:form.year+1})} className="w-12 h-12 rounded-xl bg-white/[0.04] text-gray-300 text-2xl active:bg-white/[0.08]">+</button></div>
        </div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.theme}</label>
          <div className="grid grid-cols-4 gap-2">{[['pink',t.themePink,'#fce4f6'],['black',t.themeBlack,'#030712'],['gray',t.themeGray,'#1f2937'],['white',t.themeWhite,'#f9fafb']].map(([k,l,c])=>(<button key={k} onClick={()=>setTheme(k)} className={`py-2.5 rounded-xl text-xs font-semibold border-2 ${theme===k?'border-amber-500':'border-transparent'}`} style={{backgroundColor:c,color:k==='black'||k==='gray'?'#ccc':'#333'}}>{l}</button>))}</div>
        </div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.language}</label>
          <div className="grid grid-cols-2 gap-2">{[['zh','中文'],['vi','Tiếng Việt']].map(([c,l])=>(<button key={c} onClick={()=>upd({lang:c})} className={`py-2.5 rounded-xl text-sm font-semibold ${form.lang===c?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{l}</button>))}</div>
        </div>
        <div className="space-y-2"><label className="text-xs text-gray-400 mb-1 block">{t.lockPwdSectionTitle}</label>
          <label className="flex items-center gap-2 bg-white/[0.04] rounded-xl px-4 py-3 cursor-pointer"><input type="checkbox" checked={!!form.disableHomePwd} onChange={e=>upd({disableHomePwd:e.target.checked})} className="w-4 h-4 rounded accent-amber-500"/><span className="text-sm text-gray-300">{t.disableHomePwdLabel}</span></label>
          <div className="bg-white/[0.04] rounded-xl px-4 py-3"><label className="text-xs text-gray-500 block mb-1.5">{t.lockAutoTimeLabel}</label><div className="flex items-center gap-2"><select value={[5,10,20,30,40,50,60,120].includes(form.lockAutoTime)?form.lockAutoTime:60} onChange={e=>upd({lockAutoTime:parseInt(e.target.value,10)})} className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500">{[5,10,20,30,40,50,60,120].map(v=>(<option key={v} value={v}>{v}</option>))}</select><span className="text-xs text-gray-500">{t.lockAutoTimeHint}</span></div></div>
          {!pwdResetOpen?(
            <button onClick={()=>setPwdResetOpen(true)} className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 text-sm font-semibold">重設自訂密碼</button>
          ):(
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 space-y-3 fi">
              <div className="space-y-1.5"><p className="text-xs text-gray-400 text-center">設定新密碼（不可4碼相同或連續遞增/遞減）</p>
                <PinDotsClickable length={newPwd1.length} total={4} active={pwdActiveField==='p1'} onClick={()=>setPwdActiveField(f=>f==='p1'?'':'p1')} onClear={()=>setNewPwd1('')}/>
                {pwdActiveField==='p1'&&<PinKeypadCompact onDigit={d=>{if(newPwd1.length>=4)return;setNewPwd1(newPwd1+d)}} onBackspace={()=>setNewPwd1(v=>v.slice(0,-1))}/>}
              </div>
              <div className="space-y-1.5"><p className="text-xs text-gray-400 text-center">再輸入一次確認</p>
                <PinDotsClickable length={newPwd2.length} total={4} active={pwdActiveField==='p2'} onClick={()=>setPwdActiveField(f=>f==='p2'?'':'p2')} onClear={()=>setNewPwd2('')}/>
                {pwdActiveField==='p2'&&<PinKeypadCompact onDigit={d=>{if(newPwd2.length>=4)return;setNewPwd2(newPwd2+d)}} onBackspace={()=>setNewPwd2(v=>v.slice(0,-1))}/>}
              </div>
              {newPwd1.length===4&&!newPwdOk&&<p className="text-xs text-red-400 text-center">密碼不可4碼相同或連續遞增/遞減</p>}
              {newPwd2.length===4&&newPwd1!==newPwd2&&<p className="text-xs text-red-400 text-center">兩次輸入不一致</p>}
              {pwdResetMsg&&<p className="text-xs text-center text-emerald-400">{pwdResetMsg}</p>}
              <div className="flex gap-2">
                <button onClick={()=>{setPwdResetOpen(false);setNewPwd1('');setNewPwd2('');setPwdActiveField('');setPwdResetMsg('')}} className="flex-1 py-2.5 rounded-xl bg-white/[0.04] text-gray-400 text-sm">取消</button>
                <button onClick={doResetPwd} disabled={pwdResetBusy||!newPwdOk||newPwd1!==newPwd2} className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold disabled:opacity-50 disabled:bg-white/[0.06] disabled:text-gray-600">{pwdResetBusy?'處理中…':'確認更新'}</button>
              </div>
            </div>
          )}
        </div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.bizCutoffLabel}</label><input type="time" value={form.bizCutoff||'06:30'} onChange={e=>upd({bizCutoff:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500" style={{boxSizing:'border-box',maxWidth:'90%',minWidth:0}}/><p className="text-[11px] text-gray-500 mt-1">{t.bizCutoffHint}</p></div>
        {(()=>{const ghLocal=getGHConfig();const hasConn=!!(ghLocal&&ghLocal.token);return(
          <div className="space-y-2"><label className="text-xs text-gray-400 mb-1 block">{t.serviceStatus}</label>
            <div className="bg-white/[0.04] rounded-xl px-4 py-3 flex items-center justify-between"><span className="text-sm text-gray-400">{t.connection}</span><span className="text-sm">{hasConn?t.connOnline:t.connOffline}</span></div>
            <CredentialCard t={t} settings={settings}/>
            {!hasConn&&!connMode&&(<button onClick={()=>setConnMode('apply')} className="w-full py-2.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 text-sm font-semibold active:bg-amber-600/30">{t.connApply}</button>)}
            {connMode==='apply'&&(<div className="space-y-3 fi">
              <div className="flex justify-center"><div className="bg-white p-2.5 rounded-xl"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(settings.code+':'+devId)}`} alt="QR" className="w-40 h-40"/></div></div>
              <p className="text-[10px] text-gray-600 text-center font-mono select-all break-all">{settings.code}:{devId}</p><button onClick={()=>{const link=buildReqLink(location.origin+location.pathname.replace(/index\.html$/,'')+'auth.html',genConnReq(settings.code,devId));location.href='https://line.me/R/share?text='+encodeURIComponent(t.lineConnReqPrefix+'\n'+link)}} className="w-full py-2.5 rounded-xl text-white text-sm font-bold bg-[#06C755] active:bg-[#05b34c]">{t.sendViaLine}</button>
              <div><label className="text-xs text-gray-500 mb-1 block">{t.connCode}</label><textarea value={connInput} onChange={e=>setConnInput(e.target.value)} rows={2} placeholder={t.connInput} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500 resize-none"/></div>
              <div className="flex gap-2"><button onClick={()=>{setConnMode(null);setConnInput('');setConnStatus('')}} className="flex-1 py-2.5 bg-white/[0.04] rounded-xl text-gray-500 text-sm">{t.cancel}</button><button onClick={()=>{const ghCfg=verifyActToken(connInput.trim(),settings.code,devId);if(ghCfg){saveGHConfigLocal(ghCfg);setConnStatus(t.connOk);setConnMode(null);setConnInput('')}else{setConnStatus(t.connFail)}}} className="flex-1 py-2.5 bg-amber-600 rounded-xl text-white text-sm font-bold">{t.confirm}</button></div>
              {connStatus&&<p className={`text-xs text-center ${connStatus.includes('✓')?'text-emerald-400':'text-red-400'}`}>{connStatus}</p>}
            </div>)}
          </div>
        )})()}
        {(()=>{const gh=getGHConfig();if(!(gh&&gh.token))return null;return(<div className="space-y-2 bg-white/[0.02] border border-emerald-500/20 rounded-xl p-3"><label className="text-xs text-emerald-400 font-semibold mb-1 block">{t.gasSettingTitle}</label><input value={form.gasUrl||''} onChange={e=>upd({gasUrl:e.target.value})} placeholder="https://script.google.com/.../exec" className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-emerald-500"/><button onClick={async()=>{if(form.gasUrl)setGasUrl(form.gasUrl);setGasTest('...');try{const r=await gasCall('ping',{});setGasTest(r&&r.ok?'ok':'fail')}catch(_e){setGasTest('fail')}setTimeout(()=>setGasTest(''),3000)}} className="w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold active:bg-emerald-700">{gasTest==='...'?t.gasTesting:gasTest==='ok'?'✓ '+t.gasTestOk:gasTest==='fail'?'✗ '+t.gasTestFail:t.gasTestBtn}</button><p className="text-[11px] text-gray-500">{t.gasSettingHint}</p></div>)})()}
        {(()=>{const gh=getGHConfig();if(!(gh&&gh.token)||!getGasUrl())return null;return(<div className="space-y-2 bg-white/[0.02] border border-emerald-500/20 rounded-xl p-3"><label className="text-xs text-emerald-400 font-semibold block">{t.keyGenTitle}</label><input value={keyAdminSec} onChange={e=>setKeyAdminSec(e.target.value)} type="password" placeholder={t.keyAdminSecPh} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-emerald-500"/><input value={keyGenCode} onChange={e=>setKeyGenCode(e.target.value)} placeholder={t.keyGenCodePh} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-emerald-500"/><button onClick={async()=>{if(!keyGenCode.trim()||!keyAdminSec.trim())return;setKeyGenResult({loading:true});const r=await issueKey(keyGenCode.trim(),keyAdminSec.trim());setKeyGenResult(r)}} className="w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold active:bg-emerald-700">{keyGenResult&&keyGenResult.loading?t.gasTesting:t.keyGenBtn}</button>{keyGenResult&&!keyGenResult.loading&&(keyGenResult.ok?(<div className="bg-emerald-500/10 rounded-lg p-2.5 space-y-1"><p className="text-[11px] text-gray-400">{t.keyClaimCode}：</p><p className="text-sm text-emerald-400 font-mono font-bold break-all select-all">{keyGenResult.claim}</p><p className="text-[10px] text-gray-500">{t.keyClaimHint}</p></div>):(<p className="text-[11px] text-red-400">✗ {keyGenResult.error||t.gasTestFail}</p>))}</div>)})()}
        {settings.code&&getGasUrl()&&!hasMyKey(settings.code)&&(<div className="space-y-2 bg-white/[0.02] border border-amber-500/20 rounded-xl p-3"><label className="text-xs text-amber-400 font-semibold block">{t.keyClaimTitle}</label><input value={claimInput} onChange={e=>setClaimInput(e.target.value.toUpperCase())} placeholder={t.keyClaimPh} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono text-center focus:outline-none focus:border-amber-500"/><button onClick={async()=>{if(!claimInput.trim())return;setClaimMsg('...');const r=await claimMyKey(settings.code,claimInput.trim());setClaimMsg(r.ok?'ok':'fail');if(r.ok)setTimeout(()=>setClaimMsg(''),2000)}} className="w-full py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold active:bg-amber-700">{claimMsg==='...'?t.gasTesting:claimMsg==='ok'?'✓ '+t.keyClaimOk:claimMsg==='fail'?'✗ '+t.keyClaimFail:t.keyClaimBtn}</button><p className="text-[11px] text-gray-500">{t.keyClaimTeacherHint}</p></div>)}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 space-y-2">
          <p className="text-sm text-gray-300 font-semibold">{t.privacyTitle}</p>
          <p className="text-[13px] text-gray-400 leading-relaxed">{t.privacyBody}</p>
          <p className="text-[13px] text-gray-400 leading-relaxed">{t.browserNote}</p>
          <p className="text-[13px] text-gray-400 leading-relaxed">{t.myBookingNote}</p>
          <p className="text-[13px] text-red-400 leading-relaxed">{t.backupReminder}</p>
        </div>
        {onLogout&&(()=>{
          return(<div className="pt-2 border-t border-white/[0.06]">
            <button onClick={()=>{if(logoutConfirm){onLogout()}else{setLogoutConfirm(true);setTimeout(()=>setLogoutConfirm(false),3000)}}} className="w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-sm font-semibold">{logoutConfirm?'再按一次確認登出／切換帳號':'登出／切換帳號'}</button>
            <p className="text-[10px] text-gray-600 text-center mt-1.5">只會登出目前帳號，本機資料（月報表、客戶資料）不會被刪除，換回同一個編號登入資料還在</p>
          </div>);
        })()}
      </div>)}

      {subTab==='basic'&&(<div className="space-y-4 fi">
        <h2 className="text-lg font-bold text-gray-100">{t.secBasic}</h2>
        {basicChanged&&<div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"><p className="text-xs text-red-400">❗ {t.needConfirm}</p></div>}
        {permitExpiring&&<div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"><p className="text-xs text-red-400">❗ {t.permitExpiringSoon}{form.permitExpiry?'：'+form.permitExpiry:''}</p></div>}
        <div><label className="text-xs text-gray-400 mb-1 block">{t.teacherCode}</label><div className="bg-white/[0.04] rounded-xl px-3 py-2.5 text-base text-gray-300 font-mono">{settings.code}</div></div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.gender}<span className="text-red-400 ml-0.5">*</span></label>
          <div className="grid grid-cols-2 gap-2">{[['M',t.genderM],['F',t.genderF]].map(([g,l])=>(<button key={g} onClick={()=>upd({gender:g})} className={`py-2.5 rounded-xl text-sm font-semibold ${form.gender===g?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{l}</button>))}</div>
        </div>
        {fldP(t.nameZh,'nameZh',false,confirmedP)}
        {fldP(t.nameVi,'nameVi',false,confirmedP)}
        <div><label className="text-xs text-gray-400 mb-1 block">{t.phone2}</label><input value={form.phone||''} onChange={e=>{let v=e.target.value.split('').filter(ch=>ch>='0'&&ch<='9').join('').slice(0,10);if(v.length>7)v=v.slice(0,4)+'-'+v.slice(4,7)+'-'+v.slice(7);else if(v.length>4)v=v.slice(0,4)+'-'+v.slice(4);upd({phone:v})}} inputMode="tel" placeholder="09xx-xxx-xxx" className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/>{prevHint(confirmedP,'phone',form.phone)}</div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.email}</label><input value={form.email||''} onChange={e=>upd({email:e.target.value})} inputMode="email" placeholder="example@mail.com" className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/>{prevHint(confirmedP,'email',form.email)}</div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.address}</label>
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-[10px] text-gray-400 mb-0.5 block">{t.city}<span className="text-red-400">*</span></span><select value={form.addrCity||''} onChange={e=>upd({addrCity:e.target.value,addrDist:''})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-amber-500"><option value="">{t.selectCity}</option>{Object.keys(TW_REGIONS).map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div><span className="text-[10px] text-gray-400 mb-0.5 block">{t.district}<span className="text-red-400">*</span></span>{form.addrCity&&TW_REGIONS[form.addrCity]&&TW_REGIONS[form.addrCity].length>0?(<select value={form.addrDist||''} onChange={e=>upd({addrDist:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-amber-500"><option value="">{t.selectDist}</option>{TW_REGIONS[form.addrCity].map(d=><option key={d} value={d}>{d}</option>)}</select>):(<input value={form.addrDist||''} onChange={e=>upd({addrDist:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-amber-500"/>)}</div>
          </div>
          <div className="mt-2"><span className="text-[10px] text-gray-500 mb-0.5 block">{t.addrDetail}</span><input value={form.addrDetail||''} onChange={e=>upd({addrDetail:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/></div>
        </div>
        {/* 外籍員工區 */}
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 space-y-3">
          <p className="text-xs text-amber-400 font-semibold">{t.foreignSection}</p>
          {fldP(t.permitNoLabel,'permitNo',false,confirmedP)}
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[11px] text-gray-400 mb-1 block">{t.permitDate}</label><div className="flex gap-1"><input type="date" value={form.permitDate||''} onChange={e=>upd({permitDate:e.target.value})} className="flex-1 min-w-0 bg-white/[0.06] border border-white/[0.08] rounded-xl px-1 py-2 text-[10px] text-gray-100 focus:outline-none focus:border-amber-500" style={{colorScheme:'dark'}}/>{form.permitDate&&<button onClick={()=>upd({permitDate:''})} className="w-7 flex-shrink-0 rounded-lg bg-white/[0.06] text-gray-500 text-xs active:bg-red-500/20">✕</button>}</div></div>
            <div><label className="text-[11px] text-gray-400 mb-1 block">{t.permitExpiry}</label><div className="flex gap-1"><input type="date" value={form.permitExpiry||''} onChange={e=>upd({permitExpiry:e.target.value})} className="flex-1 min-w-0 bg-white/[0.06] border border-white/[0.08] rounded-xl px-1 py-2 text-[10px] text-gray-100 focus:outline-none focus:border-amber-500" style={{colorScheme:'dark'}}/>{form.permitExpiry&&<button onClick={()=>upd({permitExpiry:''})} className="w-7 flex-shrink-0 rounded-lg bg-white/[0.06] text-gray-500 text-xs active:bg-red-500/20">✕</button>}</div></div>
          </div>
          {prevHint(confirmedP,'permitDate',form.permitDate)}
          <div><label className="text-xs text-gray-400 mb-1 block">{t.permitOrgOpt}</label><select value={form.permitOrg||''} onChange={e=>upd({permitOrg:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"><option value="">—</option><option value={t.orgWDA}>{t.orgWDA}</option><option value={t.orgNIA}>{t.orgNIA}</option><option value={t.orgOther}>{t.orgOther}</option></select>{prevHint(confirmedP,'permitOrg',form.permitOrg)}</div>
          <div><label className="text-xs text-gray-400 mb-1 block">{t.schoolType}</label><select value={form.schoolType||'uni'} onChange={e=>upd({schoolType:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"><option value="lang">{t.schoolTypeLang}</option><option value="uni">{t.schoolTypeUni}</option><option value="master">{t.schoolTypeMaster}</option><option value="phd">{t.schoolTypePhd}</option></select></div>
          <div className="grid grid-cols-2 gap-2"><div>{fldP(t.school,'school',false,confirmedP)}</div><div>{fldP(t.major,'major',false,confirmedP)}</div></div>
        </div>
        <div className="pt-2 space-y-2">
          <button onClick={()=>genCode('basic',{nameZh:form.nameZh,nameVi:form.nameVi,phone:form.phone,email:form.email,addrCity:form.addrCity,addrDist:form.addrDist,addrDetail:form.addrDetail,school:form.school,major:form.major,schoolType:form.schoolType,permitNo:form.permitNo,permitDate:form.permitDate,permitExpiry:form.permitExpiry,permitOrg:form.permitOrg,gender:form.gender},setBasicCode)} className="w-full py-3 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700">{t.basicUpdateCode}</button>
          {reqErr&&<p className="text-xs text-red-400 text-center fi">{reqErr}</p>}
          {basicCode&&(<div className="space-y-2 fi">
            <div className="flex justify-center"><div className="bg-white p-2.5 rounded-xl"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(basicCode)}`} alt="QR" className="w-44 h-44"/></div></div>
            <div className="grid grid-cols-2 gap-2"><button onClick={()=>{navigator.clipboard.writeText(basicCode).catch(()=>{})}} className="py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 text-sm font-medium">{t.copyBtn}</button><button onClick={()=>{const link=buildReqLink(location.origin+location.pathname.replace(/index\.html$/,'')+'auth.html',basicCode);location.href='https://line.me/R/share?text='+encodeURIComponent(t.lineReqPrefix+'\n'+link)}} className="py-2.5 rounded-xl text-white text-sm font-bold bg-[#06C755] active:bg-[#05b34c]">{t.sendViaLine}</button></div>
            <div><label className="text-xs text-gray-500 mb-1 block">{t.basicConfirmCode}</label><input value={confirmInput} onChange={e=>setConfirmInput(e.target.value)} placeholder={t.basicConfirmCode} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500"/></div>
            <button onClick={()=>applyConfirm('basic',{nameZh:form.nameZh,nameVi:form.nameVi,phone:form.phone,email:form.email,addrCity:form.addrCity,addrDist:form.addrDist,addrDetail:form.addrDetail,school:form.school,major:form.major,schoolType:form.schoolType,permitNo:form.permitNo,permitDate:form.permitDate,permitExpiry:form.permitExpiry,permitOrg:form.permitOrg,gender:form.gender},'confirmedProfile')} className="w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700">{t.confirm}</button>
            {settings.lastSyncBasic&&<p className="text-[11px] text-gray-500 mt-1.5 text-center">{t.lastSyncAt}：{fmtSyncTime(settings.lastSyncBasic)}</p>}
            {confirmMsg==='ok'&&<p className="text-xs text-center text-emerald-400 fi">✓ {t.confirmSuccess}</p>}
            {confirmMsg==='fail'&&<p className="text-xs text-center text-red-400 fi">{t.confirmFail}</p>}
          </div>)}
        </div>
      </div>)}

      {subTab==='store'&&(<div className="space-y-4 fi">
        <h2 className="text-lg font-bold text-gray-100">{t.secStore}</h2>
        {storeChanged&&<div className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"><p className="text-xs text-red-400">❗ {t.needConfirm}</p></div>}
        <div><label className="text-xs text-gray-400 mb-1 block">{t.teacherCode}</label><div className="bg-white/[0.04] rounded-xl px-3 py-2.5 text-base text-gray-300 font-mono">{settings.code}</div></div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.curStore}</label>
          <select value={form.storeSel||settings.store||''} onChange={e=>upd({storeSel:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"><option value="">—</option>{stores.map(s=><option key={s} value={s}>{s}</option>)}</select>
          {form.storeSel&&form.storeSel!==settings.store&&<p className="text-xs text-red-400 mt-1">{t.applyChange}：{form.storeSel}</p>}
        </div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.shift}<span className="text-red-400 ml-0.5">*</span></label>
          <div className="grid grid-cols-2 gap-2">{[['day',t.shiftDay],['night',t.shiftNight]].map(([s,l])=>(<button key={s} onClick={()=>upd({shift:s})} className={`py-2.5 rounded-xl text-sm font-semibold ${form.shift===s?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{l}</button>))}</div>
        </div>
        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-2"><label className="text-xs text-gray-400 mb-1 block">{t.workStart}<span className="text-red-400 ml-0.5">*</span></label><select value={form.workStart?String(Number(form.workStart.split(':')[0])):''} onChange={e=>onWorkStartChange(e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-1 py-2.5 text-sm text-center text-gray-100 focus:outline-none focus:border-amber-500"><option value="">--</option>{Array.from({length:24},(_,i)=><option key={i} value={i}>{String(i).padStart(2,'0')}:00</option>)}</select></div>
          <div className="col-span-2 col-start-4"><label className="text-xs text-gray-400 mb-1 block">{t.workEnd}<span className="text-red-400 ml-0.5">*</span></label><select value={form.workEnd?String(Number(form.workEnd.split(':')[0])):''} onChange={e=>upd({workEnd:e.target.value===''?'':String(Number(e.target.value)).padStart(2,'0')+':00'})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-1 py-2.5 text-sm text-center text-gray-100 focus:outline-none focus:border-amber-500"><option value="">--</option>{Array.from({length:24},(_,i)=><option key={i} value={i}>{String(i).padStart(2,'0')}:00</option>)}</select></div>
        </div>
        {confirmedS&&((confirmedS.workStart||'')!==(form.workStart||'')||(confirmedS.workEnd||'')!==(form.workEnd||''))&&<p className="text-[11px] text-red-400">{t.prevConfirmed}：{confirmedS.workStart||'—'} ~ {confirmedS.workEnd||'—'}</p>}
        <div><label className="text-xs text-gray-400 mb-1 block">{t.workNote}<span className="text-[10px] text-gray-600 ml-1">({t.optional})</span></label><textarea value={form.workNote||''} onChange={e=>upd({workNote:e.target.value})} rows={2} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 resize-none"/>{prevHint(confirmedS,'workNote',form.workNote)}</div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.unitPrice}</label>
          <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input type="number" inputMode="numeric" value={form.unitPrice} onChange={e=>upd({unitPrice:parseInt(e.target.value)||0})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-8 pr-3 py-3 text-base text-gray-100 focus:outline-none focus:border-amber-500"/></div>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-2 block">{t.skills}</label>
          <div className="space-y-2">{SKILL_KEYS.map((k,i)=>({k,label:t[k],price:SKILL_PRICES[i]})).map(({k,label,price})=>{const checked=form.skills?.[k]||false;return(<button key={k} onClick={()=>upd({skills:{...(form.skills||{}),[k]:!checked}})} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${checked?'bg-white/[0.06] border border-amber-500/30':'bg-white/[0.02] border border-white/[0.06]'}`}><div className={`w-5 h-5 rounded flex items-center justify-center text-xs ${checked?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-700'}`}>{checked?'✓':''}</div><span className={`text-sm ${checked?'text-gray-200':'text-gray-500'}`}>{label}</span>{price!=null&&<span className="text-xs text-gray-600 ml-auto">${price}</span>}</button>)})}</div>
        </div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.pregClient}<span className="text-red-400 ml-0.5">*</span></label><div className="grid grid-cols-2 gap-2">{[['yes',t.accept],['no',t.reject]].map(([v,l])=>(<button key={v} onClick={()=>upd({preg:v})} className={`py-2.5 rounded-xl text-sm font-semibold ${form.preg===v?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{l}</button>))}</div></div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.oilLabel}<span className="text-red-400 ml-0.5">*</span></label><div className="grid grid-cols-2 gap-2">{[['yes',t.accept],['no',t.reject]].map(([v,l])=>(<button key={v} onClick={()=>upd({oil:v})} className={`py-2.5 rounded-xl text-sm font-semibold ${form.oil===v?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{l}</button>))}</div></div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.techMentor}</label><input value={form.techMentor||''} onChange={e=>upd({techMentor:e.target.value})} placeholder={t.techMentorPlaceholder} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/>{prevHint(confirmedS,'techMentor',form.techMentor)}</div>
        <div><label className="text-xs text-gray-400 mb-1 block">{t.lockerNo}</label><select value={form.lockerNo||''} onChange={e=>upd({lockerNo:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500"><option value="">--</option>{Array.from({length:100},(_,i)=>i+1).map(n=><option key={n} value={n}>{n}{t===T.zh?'號':''}</option>)}</select>{prevHint(confirmedS,'lockerNo',form.lockerNo)}</div>
        <div className="pt-2 space-y-2">
          <button onClick={()=>genCode('store',{store:form.storeSel||settings.store,shift:form.shift,workStart:form.workStart,workEnd:form.workEnd,workNote:form.workNote,unitPrice:form.unitPrice,skills:form.skills,preg:form.preg,oil:form.oil,techMentor:form.techMentor,lockerNo:form.lockerNo},setStoreCode)} className="w-full py-3 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700">{t.storeUpdateCode}</button>
          {reqErr&&<p className="text-xs text-red-400 text-center fi">{reqErr}</p>}
          {storeCode&&(<div className="space-y-2 fi">
            <div className="flex justify-center"><div className="bg-white p-2.5 rounded-xl"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(storeCode)}`} alt="QR" className="w-44 h-44"/></div></div>
            <div className="grid grid-cols-2 gap-2"><button onClick={()=>{navigator.clipboard.writeText(storeCode).catch(()=>{})}} className="py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 text-sm font-medium">{t.copyBtn}</button><button onClick={()=>{const link=buildReqLink(location.origin+location.pathname.replace(/index\.html$/,'')+'auth.html',storeCode);location.href='https://line.me/R/share?text='+encodeURIComponent(t.lineReqPrefix+'\n'+link)}} className="py-2.5 rounded-xl text-white text-sm font-bold bg-[#06C755] active:bg-[#05b34c]">{t.sendViaLine}</button></div>
            <div><label className="text-xs text-gray-500 mb-1 block">{t.storeConfirmCode}</label><input value={confirmInput} onChange={e=>setConfirmInput(e.target.value)} placeholder={t.storeConfirmCode} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500"/></div>
            <button onClick={()=>applyConfirm('store',{store:form.storeSel||settings.store,shift:form.shift,workStart:form.workStart,workEnd:form.workEnd,workNote:form.workNote,unitPrice:form.unitPrice,skills:form.skills,preg:form.preg,oil:form.oil,techMentor:form.techMentor,lockerNo:form.lockerNo},'confirmedStore')} className="w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700">{t.confirm}</button>
            {settings.lastSyncStore&&<p className="text-[11px] text-gray-500 mt-1.5 text-center">{t.lastSyncAt}：{fmtSyncTime(settings.lastSyncStore)}</p>}
            {confirmMsg==='ok'&&<p className="text-xs text-center text-emerald-400 fi">✓ {t.confirmSuccess}</p>}
            {confirmMsg==='fail'&&<p className="text-xs text-center text-red-400 fi">{t.confirmFail}</p>}
          </div>)}
        </div>
      </div>)}

      {subTab==='book'&&(<div className="space-y-4 fi">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-gray-100">{t.myBooking2}</h2><button onClick={()=>onClose&&onClose()} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-400 active:bg-white/[0.12]">✕</button></div>
        <button onClick={()=>{location.href='./booking.html'}} className="w-full py-3.5 rounded-xl bg-amber-600/15 border border-amber-500/25 text-amber-400 text-sm font-semibold active:bg-amber-600/25 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          {t.booking}
        </button>
        {/* 同步店家預約資訊框架(尚無功能) */}
        <div className="pt-4 border-t border-white/[0.06] space-y-2">
          <p className="text-sm text-gray-400 font-medium">{t.syncStoreBooking}</p>
          <textarea rows={2} placeholder={t.connInput} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500 resize-none"/>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-sm flex items-center justify-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l-4-4m4 4l4-4"/></svg></button>
            <button className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-sm">{t.pasteBtn}</button>
          </div>
          <button disabled className="w-full py-2.5 rounded-xl bg-white/[0.03] text-gray-600 text-sm font-medium cursor-not-allowed">{t.syncBtn}{t.noFuncYet}</button>
        </div>
      </div>)}

      {subTab==='cust'&&<CustomerPage t={t} settings={settings} onClose={onClose}/>}
      {subTab==='notice'&&<NoticeManagePage t={t} settings={settings} onClose={onClose}/>}
      {subTab==='chart'&&<ChartPage t={t} settings={settings} onClose={onClose}/>}
      {subTab==='suggest'&&<SuggestPage t={t} settings={settings} onClose={onClose}/>}

      {subTab==='backup'&&(<div className="space-y-4 fi">
        <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-gray-100">{t.backupCenter}</h2><button onClick={()=>onClose&&onClose()} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-400 active:bg-white/[0.12]">✕</button></div>
        <BackupSection settings={settings} t={t}/>
      </div>)}

      {subTab==='violation'&&(<div className="space-y-6 fi">
        <div>
          <div className="flex items-center justify-between mb-3"><h2 className="text-lg font-bold text-gray-100">{t.violationTitle}</h2><button onClick={()=>onClose&&onClose()} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-400 active:bg-white/[0.12]">✕</button></div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-6 text-center"><p className="text-sm text-gray-500">{t.noViolation}</p></div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-400 font-medium">{t.violationCode}</p>
          <textarea rows={2} placeholder={t.connInput} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500 resize-none"/>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-sm flex items-center justify-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l-4-4m4 4l4-4"/></svg></button>
            <button className="flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-sm">{t.pasteBtn}</button>
          </div>
          <button className="w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700">{t.confirm}</button>
        </div>
        <div className="pt-4 border-t border-white/[0.06]">
          <h2 className="text-lg font-bold text-gray-100 mb-3">{t.dutyTitle}</h2>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-6 text-center"><p className="text-sm text-gray-500">{t.noDuty}</p></div>
        </div>
      </div>)}

      {subTab==='manage'&&(<div className="space-y-5 fi">
        <h2 className="text-lg font-bold text-gray-100">{t.manageCenter}</h2>
        {(()=>{const ghLocal=getGHConfig();const hasConn=!!(ghLocal&&ghLocal.token);return(
          <div className="space-y-3">
            <div className="flex items-center justify-between"><p className="text-sm text-gray-500 font-medium">{t.connection}</p><span className="text-xs">{hasConn?t.connOnline:t.connOffline}</span></div>
            {!hasConn&&!connMode&&(<button onClick={()=>setConnMode('apply')} className="w-full py-3 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 text-sm font-semibold active:bg-amber-600/30">{t.connApply}</button>)}
            {connMode==='apply'&&(<div className="space-y-3 fi">
              <div className="flex justify-center"><div className="bg-white p-2.5 rounded-xl"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(settings.code+':'+devId)}`} alt="QR" className="w-40 h-40"/></div></div>
              <p className="text-[10px] text-gray-600 text-center font-mono select-all break-all">{settings.code}:{devId}</p><button onClick={()=>{const link=buildReqLink(location.origin+location.pathname.replace(/index\.html$/,'')+'auth.html',genConnReq(settings.code,devId));location.href='https://line.me/R/share?text='+encodeURIComponent(t.lineConnReqPrefix+'\n'+link)}} className="w-full py-2.5 rounded-xl text-white text-sm font-bold bg-[#06C755] active:bg-[#05b34c]">{t.sendViaLine}</button>
              <div><label className="text-xs text-gray-500 mb-1 block">{t.connCode}</label><textarea value={connInput} onChange={e=>setConnInput(e.target.value)} rows={2} placeholder={t.connInput} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500 resize-none"/></div>
              <div className="flex gap-2"><button onClick={()=>{setConnMode(null);setConnInput('');setConnStatus('')}} className="flex-1 py-2.5 bg-white/[0.04] rounded-xl text-gray-500 text-sm">{t.cancel}</button><button onClick={()=>{const ghCfg=verifyActToken(connInput.trim(),settings.code,devId);if(ghCfg){saveGHConfigLocal(ghCfg);setConnStatus(t.connOk);setConnMode(null);setConnInput('')}else{setConnStatus(t.connFail)}}} className="flex-1 py-2.5 bg-amber-600 rounded-xl text-white text-sm font-bold">{t.confirm}</button></div>
              {connStatus&&<p className={`text-xs text-center ${connStatus.includes('✓')?'text-emerald-400':'text-red-400'}`}>{connStatus}</p>}
            </div>)}
          </div>
        )})()}
        <div className="pt-4 border-t border-white/[0.06] space-y-2">
          <button onClick={goAuth} disabled={goAuthChecking} className="w-full py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 text-sm font-semibold active:bg-white/[0.08] flex items-center justify-center gap-2 disabled:opacity-60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
            {goAuthChecking?t.checking||'檢查中…':t.admin+' / '+t.supervisor}
          </button>
        </div>
        <div className="text-[10px] text-gray-700 font-mono break-all">{t.deviceId}: {devId}</div>
      </div>)}
      </div>
    </div>
  );
}

/* ══════════ Icons ══════════ */
const IC={
  home:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/></svg>,
  monthly:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  yearly:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  settings:<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
};

/* ══════════ App ══════════ */

// 掛到全域供 index.html 的 App 取用
window.__V=Object.assign(window.__V||{},{ChartPage,CustomerPage,BackupSection,SettingsPage});
