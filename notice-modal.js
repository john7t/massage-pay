/* notice-modal.js v1.12-022 — 共用公告詳情彈窗元件(index與公告頁共用)
   用法:<NoticeDetailModal notice={n} settings={settings} t={t} onClose={()=>...} onMore={()=>...}/>
   依賴 window.MP 的:noticeBody,hasMyKey,markNoticeRead,autoClaimKey,isNoticeRead,getNoticeReadCount,getNoticeReaders,getNoticeShow,isValidPin,lockPwdCred,gasSetInitialPwd,gasVerifyKey,getMyKey,LS
   v1.12-019:密碼關卡通過後,再背景驗證金鑰是否有效(離職時金鑰會被設過期/停用)。金鑰失效→即使密碼對也擋內容,顯示「憑證已失效」;沒有金鑰或網路失敗時不擋(容錯優先,避免誤傷正常老師) */
(function(){
  const {useState,useEffect}=React;
  const MP=window.MP||{};
  const UNLOCK_KEY_PREFIX='notice-pwd-unlock-';
  function getUnlockTs(code){try{return parseInt(localStorage.getItem(UNLOCK_KEY_PREFIX+code)||'0',10)||0}catch(_e){return 0}}
  function setUnlockTs(code){try{localStorage.setItem(UNLOCK_KEY_PREFIX+code,String(Date.now()))}catch(_e){}}
  // 憑證有效性一天只查一次(不用每次開公告都打GAS),同一天內直接用快取結果
  function getCachedKeyCheck(code){
    try{
      const today=new Date().toISOString().slice(0,10);
      if(localStorage.getItem('key-check-date-'+code)===today)return localStorage.getItem('key-check-result-'+code);
    }catch(_e){}
    return null;
  }
  function setCachedKeyCheck(code,result){
    try{const today=new Date().toISOString().slice(0,10);localStorage.setItem('key-check-date-'+code,today);localStorage.setItem('key-check-result-'+code,result);}catch(_e){}
  }
  function NoticeDetailModal({notice,settings,t,onClose,onMore}){
    const code=settings&&settings.code;
    const vi=settings&&settings.lang==='vi';
    const getFreshSettings=()=>{try{return(MP.LS&&MP.LS.get('app-settings'))||settings||{}}catch(_e){return settings||{}}};
    const initGate=()=>{
      if(!code)return 'none';
      const fs=getFreshSettings();
      if(!fs.lockPwd)return 'setup';
      if(Date.now()-getUnlockTs(code)>5*60*1000)return 'locked';
      return 'none';
    };
    const[gate,setGate]=useState(initGate);
    const[keyCheck,setKeyCheck]=useState(null); // null/checking/ok/invalid
    const[setupPwd,setSetupPwd]=useState('');const[setupPwd2,setSetupPwd2]=useState('');const[setupErr,setSetupErr]=useState('');const[setupBusy,setSetupBusy]=useState(false);
    const[unlockInput,setUnlockInput]=useState('');const[unlockErr,setUnlockErr]=useState('');
    const[nvLang,setNvLang]=useState({zh:!vi,vi:!!vi});
    const[act,setAct]=useState('');
    const[readCount,setReadCount]=useState(()=>{try{return MP.getNoticeReadCount?MP.getNoticeReadCount(notice.id):null}catch(_e){return null}});
    const[readers,setReaders]=useState(null);
    // 密碼關卡通過後,背景驗證金鑰是否還有效(離職員工密碼還能用,但金鑰會被設過期,藉此擋公司資料)
    useEffect(()=>{
      if(gate!=='none'){return}
      if(!code||!MP.hasMyKey||!MP.hasMyKey(code)||!MP.gasVerifyKey){setKeyCheck('ok');return}
      const cached=getCachedKeyCheck(code);
      if(cached){setKeyCheck(cached);return}
      setKeyCheck('checking');
      (async()=>{
        try{
          const key=MP.getMyKey?MP.getMyKey(code):'';
          const r=await MP.gasVerifyKey(code,key);
          const result=(r&&r.ok&&r.valid)?'ok':'invalid';
          setKeyCheck(result);setCachedKeyCheck(code,result);
        }catch(_e){setKeyCheck('ok')} // 網路失敗容錯:不擋,避免離線時完全看不到公告
      })();
    },[gate]);
    // 內容真的顯示出來(通過密碼+金鑰兩關)才記開啟,延遲一下再觸發(不跟畫面顯示搶資源,反正老師要花時間讀,晚一點點記無所謂)
    useEffect(()=>{
      if(gate!=='none'||keyCheck!=='ok')return;
      if(!code||!notice||!notice.id||!MP.gasLogNoticeOpen)return;
      const tm=setTimeout(()=>{try{MP.gasLogNoticeOpen(notice.id,code)}catch(_e){}},1500);
      return()=>clearTimeout(tm);
    },[gate,keyCheck]);
    const doSetup=async()=>{
      if(!MP.isValidPin||!MP.isValidPin(setupPwd)){setSetupErr(t.lockPwdInvalid);return}
      if(setupPwd!==setupPwd2){setSetupErr(t.lockPwdMismatch);return}
      setSetupErr('');setSetupBusy(true);
      const updated=Object.assign({},getFreshSettings(),{lockPwd:setupPwd});
      try{if(MP.LS)MP.LS.set('app-settings',updated)}catch(_e){}
      setUnlockTs(code);
      setSetupBusy(false);setGate('none');
      // 背景同步一份到GAS(換機密碼登入用),已有密碼GAS會拒絕,不影響本機已設定成功
      try{if(MP.gasSetInitialPwd&&MP.lockPwdCred){const cred=MP.lockPwdCred(code,setupPwd);MP.gasSetInitialPwd(code,cred)}}catch(_e){}
    };
    const doUnlock=()=>{
      const fs=getFreshSettings();
      if(unlockInput===fs.lockPwd){setUnlockTs(code);setUnlockErr('');setGate('none')}
      else{setUnlockErr(t.noticePwdWrong||'密碼錯誤')}
    };
    if(gate==='setup'){
      return(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}><div className="bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl" onClick={e=>e.stopPropagation()}>
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between"><h3 className="text-base font-bold text-gray-100">{t.noticePwdSetupTitle||'設定4位數密碼'}</h3><button onClick={onClose} className="text-gray-500 text-sm">✕</button></div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-300 leading-relaxed">{t.noticePwdSetupBody}</p>
          <div className="grid grid-cols-2 gap-2"><input value={setupPwd} onChange={e=>{setSetupPwd(e.target.value.replace(/\D/g,'').slice(0,4));setSetupErr('')}} inputMode="numeric" maxLength={4} type="password" placeholder="••••" className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-3.5 text-xl text-center text-gray-100 tracking-[0.5em] focus:outline-none focus:border-amber-500"/><input value={setupPwd2} onChange={e=>{setSetupPwd2(e.target.value.replace(/\D/g,'').slice(0,4));setSetupErr('')}} inputMode="numeric" maxLength={4} type="password" placeholder={t.lockPwdConfirm} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-3.5 text-xl text-center text-gray-100 tracking-[0.5em] focus:outline-none focus:border-amber-500"/></div>
          {setupErr&&<p className="text-xs text-red-400 text-center">{setupErr}</p>}
          <button onClick={doSetup} disabled={setupBusy||setupPwd.length!==4||setupPwd2.length!==4} className={`w-full py-3.5 rounded-xl font-bold transition-all ${!setupBusy&&setupPwd.length===4&&setupPwd2.length===4?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-600 cursor-not-allowed'}`}>{t.noticePwdSetupBtn||'設定密碼'}</button>
        </div>
      </div></div>);
    }
    if(gate==='locked'){
      return(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}><div className="bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl" onClick={e=>e.stopPropagation()}>
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between"><h3 className="text-base font-bold text-gray-100">{t.noticePwdLockedTitle||'請輸入密碼'}</h3><button onClick={onClose} className="text-gray-500 text-sm">✕</button></div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-300 text-center">{t.noticePwdLockedBody}</p>
          <input value={unlockInput} onChange={e=>{setUnlockInput(e.target.value.replace(/\D/g,'').slice(0,4));setUnlockErr('')}} inputMode="numeric" maxLength={4} type="password" placeholder="••••" className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-3.5 text-xl text-center text-gray-100 tracking-[0.5em] focus:outline-none focus:border-amber-500"/>
          {unlockErr&&<p className="text-xs text-red-400 text-center">{unlockErr}</p>}
          <button onClick={doUnlock} disabled={unlockInput.length!==4} className={`w-full py-3.5 rounded-xl font-bold transition-all ${unlockInput.length===4?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-600 cursor-not-allowed'}`}>{t.noticePwdUnlockBtn||'解鎖'}</button>
        </div>
      </div></div>);
    }
    if(keyCheck==='invalid'){
      return(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}><div className="bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl" onClick={e=>e.stopPropagation()}>
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between"><h3 className="text-base font-bold text-gray-100">{t.keyInvalidMsg||'憑證已失效'}</h3><button onClick={onClose} className="text-gray-500 text-sm">✕</button></div>
        <div className="p-4"><p className="text-sm text-gray-400 text-center">{t.keyExpiredMsg}</p></div>
      </div></div>);
    }
    // keyCheck為null/checking/ok時都直接顯示內容(樂觀渲染,不等GAS回應),只有真的查到invalid才會在上面被攔截重新render擋掉
    const show=(MP.getNoticeShow?MP.getNoticeShow():{cat:false,subcat:false,tags:false});
    const nb=(n,lang)=>MP.noticeBody?MP.noticeBody(n,lang):(n&&n.body||'');
    const handleAction=async()=>{
      if(MP.hasMyKey&&MP.hasMyKey(code)){
        setAct('...');
        try{const r=await MP.markNoticeRead(code,notice.id);if(r&&r.ok){setAct('read');if(typeof r.count==='number')setReadCount(r.count)}else{setAct('fail')}}catch(_e){setAct('fail')}
        setTimeout(()=>setAct(''),4000);return;
      }
      setAct('...');
      try{const r=await MP.autoClaimKey(code);setAct(r&&r.ok?'ok':'fail')}catch(_e){setAct('fail')}
      setTimeout(()=>setAct(''),4000);
    };
    const showReaders=async()=>{setReaders('loading');const r=await MP.getNoticeReaders(notice.id);setReaders(Array.isArray(r)?r:[])};
    const isRead=MP.isNoticeRead&&MP.isNoticeRead(notice.id);
    return(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}><div className="bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
      <div className="p-4 border-b border-white/[0.06] flex items-start justify-between gap-2 sticky top-0 bg-gray-900"><div className="flex-1"><div className="flex items-center gap-2 mb-1">{show.cat&&<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">{notice.cat}</span>}{show.subcat&&notice.subcat&&<span className="text-[10px] text-gray-500">{notice.subcat}</span>}<span className="text-[10px] text-gray-600">{notice.date}</span></div><h3 className="text-base font-bold text-gray-100">{notice.title}</h3>{notice.author&&<p className="text-[11px] text-gray-500 mt-1">👤 {notice.author}</p>}</div><div className="flex items-center gap-1 flex-shrink-0"><button onClick={()=>setNvLang(p=>{const nz=!p.zh;if(!nz&&!p.vi)return{zh:false,vi:true};return{...p,zh:nz}})} className={`text-xs px-2 py-1 rounded-lg font-semibold ${nvLang.zh?'bg-amber-500 text-white':'bg-white/[0.08] text-gray-500'}`}>中</button><button onClick={()=>setNvLang(p=>{const nv=!p.vi;if(!nv&&!p.zh)return{zh:true,vi:false};return{...p,vi:nv}})} className={`text-xs px-2 py-1 rounded-lg font-semibold ${nvLang.vi?'bg-emerald-500 text-white':'bg-white/[0.08] text-gray-500'}`}>VI</button><button onClick={onClose} className="text-gray-500 text-sm ml-1">✕</button></div></div>
      <div className="p-4">{nvLang.zh&&<p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{notice.body||''}</p>}{nvLang.zh&&nvLang.vi&&(notice.bodyVi||'').trim()&&<div className="my-3 border-t border-white/[0.06]"/>}{nvLang.vi&&((notice.bodyVi||'').trim()?<p className="text-sm text-emerald-600 whitespace-pre-wrap leading-relaxed">{notice.bodyVi}</p>:(!nvLang.zh&&<p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{notice.body||''}</p>))}
      <div className="flex items-center gap-3 mt-3">{typeof notice.openCount==='number'&&<span className="text-[11px] text-gray-500">👁 {notice.openCount}</span>}{readCount!==null&&<span className="text-[11px] text-gray-500">👍 {readCount} {t.noticeReadCount||'人已閱讀'}</span>}</div>
      <div className="flex gap-2 mt-4 pt-3 border-t border-white/[0.06]"><button onClick={handleAction} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold ${isRead?'bg-emerald-600 text-white active:bg-emerald-700':'bg-white/[0.08] text-gray-300 active:bg-white/[0.12]'}`}>{isRead?('👍 '+(t.noticeReadDone||'已閱讀')):(t.noticeRead||'我已閱讀')}</button><button onClick={showReaders} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-gray-400 text-xs font-semibold active:bg-white/[0.12]">{t.noticeReaders||'閱讀人員'}</button><button onClick={()=>{if(onMore)onMore()}} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-gray-400 text-xs font-semibold active:bg-white/[0.12]">{t.noticeMore||'更多公告'}</button></div>
      {readers!==null&&<div className="mt-3 bg-white/[0.03] rounded-lg p-3"><div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-gray-400">{t.noticeReaders||'閱讀人員'}{readers!=='loading'&&' ('+readers.length+')'}</span><button onClick={()=>setReaders(null)} className="text-[11px] text-gray-500">✕</button></div>{readers==='loading'?<p className="text-[11px] text-gray-500">{t.loading||'載入中…'}</p>:readers.length===0?<p className="text-[11px] text-gray-500">{t.noReaders||'尚無人閱讀'}</p>:<div className="flex flex-wrap gap-1.5">{readers.map((rd,i)=>(<span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-300">{rd.code}</span>))}</div>}</div>}
      {act==='...'?<p className="text-[11px] text-sky-400 text-center mt-2">⏳ {t.noticeKeyClaiming||'開通中…'}</p>:act==='ok'?<p className="text-[11px] text-emerald-500 text-center mt-2 font-semibold">✓ {t.noticeKeyGot||'已為你開通！互動功能即將開放'}</p>:act==='read'?<p className="text-[11px] text-emerald-500 text-center mt-2 font-semibold">✓ {t.noticeReadOk||'已記錄閱讀，感謝！'}</p>:act==='fail'?<p className="text-[11px] text-red-500 text-center mt-2 font-semibold">✗ {t.noticeKeyFail||'開通失敗，請稍後再試或聯繫主管'}</p>:(MP.hasMyKey&&!MP.hasMyKey(code)&&<p className="text-[10px] text-gray-500 text-center mt-2">{t.noticeKeyHint||'點上方按鈕即可開通互動功能'}</p>)}
      {show.tags&&notice.tags&&<div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/[0.06]">{String(notice.tags).split(/[,、\s]+/).filter(Boolean).map((tg,i)=>(<span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400">#{tg}</span>))}</div>}</div>
    </div></div>);
  }
  window.NoticeDetailModal=NoticeDetailModal;
})();
