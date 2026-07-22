// app-core.js — 主程式核心元件(登入驗證/首頁/月報表/彈窗),從index.html拆分出來
// 跟settings.js一樣用 <script type="text/babel" src="..."> 載入,共用同一個全域作用域
const{LS,getKeyConfig,saveKeyConfig,buildDynamicKey,getCK,xEnc,xDec,fnv,adminHash,genAdminAct,revokeHash,approveHash,supApproveHash,genSimpleAct,isValidPin,lockPwdCred,encWithKey,decWithKey,actKey,genActWithToken,verifyActToken,gasCall,gasCallPost,gasSubmitAction,gasCheckAction,gasUpdatePwd,gasLoginPwd,gasSyncProfile,gasCheckCode,gasSetInitialPwd,gasVerifyKey,gasLeaveTeacher,gasLogDailyCheck,gasCreateGroupBuy,gasListGroupBuys,gasJoinGroupBuy,gasMyGroupBuyOrders,gasDeclineGroupBuy,gasLogGroupBuyOpen,gasGroupBuyDetail,gasCloseGroupBuy,gasSubmitDisasterReport,gasListDisasterSurveys,gasMyDisasterReports,getMyKey,setMyKey,genReqCode,parseReqCode,decReqCode,parseReqHash,buildReqLink,sendTicketFlex,genConfirmCode,verifyConfirmCode,confirmCodeIsBound,genUUID,getDeviceId,SUP_LEVELS,supLevelName,getGHConfig,saveGHConfigLocal,saveGHConfig,ghReadFile,ghWriteFile,ghAppendLine,ghRemoveLine,readStaff,writeStaff,checkApproved,writeApproval,loadStores,saveStores,loadStats,getApproved,saveApproved,addApproved,addLog,getLogs,fmtLog,fmtDate,THEMES,SKILL_KEYS,SKILL_SHORT,SKILL_PRICES,SKILL_COLORS,SK,SBG,STC,canWork,toB36,fromB36,dim,dow,bizDate,bizParts,dk,eDay,stamp,calcSal,eMon,newSlip,gasWarmup,getNoticesLocal,fetchNotices,getNoticeHomeCount,getNoticeShow,noticeBody,noticeTitle,noticeSummary,getGasUrl,shouldClaimKey,hasMyKey,isNoticeRead,markNoticeRead,getNoticeReadCount,getNoticeReaders,autoClaimKey,slipUnitsTotal,slipLaodianTotal,PRESS_LEVELS,BODY_PARTS,CLIENT_REQS,custKey,loadCustDB,getCust,upsertCust,searchCustDB,migrateDayGroups,migrateMonthGroups,slipSvcLabel,SERVICES,slipStartTime,loadTagHistory,addTagHistory,visitStats,collectSlips,collectAllSlips,tagStats,searchSlips,bookTitleName,BOOK_TITLES,encMonth,decBackup,TW_REGIONS,LANG_SCHOOLS,T}=window.MP;
const{useState,useEffect,useCallback,useMemo}=React;
g

function NoticeBox({t,agreed,setAgreed}){return(<div className="mt-6 space-y-2"><button onClick={()=>setAgreed(!agreed)} className="flex items-center gap-2 w-full text-left"><span className={`w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0 ${agreed?'bg-amber-600 text-white':'bg-white/[0.06] border border-white/[0.12] text-transparent'}`}>✓</span><span className="text-[13px] text-gray-300 font-semibold">{t.readConfirm}</span></button><div className="space-y-1.5 text-[11px] text-gray-500 leading-relaxed pl-7"><p>{t.privacyBody}</p><p>{t.browserNote}</p><p>{t.myBookingNote}</p><p className="text-red-400/80">{t.backupReminder}</p></div></div>)}

/* ══════════ StaffListSection ══════════ */
function _pad2(n){return String(n).padStart(2,'0')}
function nextHalfHour(){const now=new Date();let h=now.getHours(),m=now.getMinutes();if(m===0)return _pad2(h)+':00';if(m<=30)return _pad2(h)+':30';return _pad2((h+1)%24)+':00'}
function addHalfHourTime(hhmm,hours){const p=(hhmm||'00:00').split(':');const h=parseInt(p[0],10)||0,m=parseInt(p[1],10)||0;let total=(h*60+m+hours*60)%1440;if(total<0)total+=1440;return _pad2(Math.floor(total/60))+':'+_pad2(total%60)}
const TIME_OPTS=(()=>{const a=[];for(let h=0;h<24;h++){a.push(_pad2(h)+':00');a.push(_pad2(h)+':30')}return a})();
// 新老師啟動流程中途(送出票證後、核准前)的本機暫存,重新整理要停在原本畫面,不要重新申請
const ONBOARD_PENDING_KEY='onboard-pending-v1';
function loadPending(){try{return JSON.parse(localStorage.getItem(ONBOARD_PENDING_KEY)||'null')}catch(_e){return null}}
function savePending(obj){try{localStorage.setItem(ONBOARD_PENDING_KEY,JSON.stringify(obj))}catch(_e){}}
function clearPending(){try{localStorage.removeItem(ONBOARD_PENDING_KEY)}catch(_e){}}

function Onboarding({onComplete}){
  const[pending]=useState(()=>loadPending());
  const pendActive=pending&&(pending.mode==='newTicket'||pending.mode==='forgotTicket');
  const[mode,setMode]=useState(()=>pendActive?pending.mode:'choice');
  const[lang,setLang]=useState(()=>(pending&&pending.lang)||'zh');const[code,setCode]=useState(()=>(pending&&pending.code)||'');const[err,setErr]=useState('');const[checking,setChecking]=useState(false);const[devId]=useState(()=>getDeviceId());const[stores,setStores]=useState(['龍山寺店']);const[store,setStore]=useState(()=>(pending&&pending.store)||'龍山寺店');const[agreed,setAgreed]=useState(false);const[agreeErr,setAgreeErr]=useState(false);
  const[codeCheck,setCodeCheck]=useState(null); // null/checking/new/exists/error — 新老師啟動頁的編號檢查閘門
  const[gender,setGender]=useState(()=>(pending&&pending.gender)||'');const[shift,setShift]=useState(()=>(pending&&pending.shift)||'');
  const[workStart,setWorkStart]=useState(()=>(pending&&pending.workStart)||nextHalfHour());const[workEnd,setWorkEnd]=useState(()=>(pending&&pending.workEnd)||addHalfHourTime(nextHalfHour(),12));const[workEndTouched,setWorkEndTouched]=useState(false);
  const[pwd,setPwd]=useState(()=>(pending&&pending.pwd)||'');const[pwd2,setPwd2]=useState('');const[fieldErr,setFieldErr]=useState('');
  const[loginPwdInput,setLoginPwdInput]=useState('');
  const[forgotPwd,setForgotPwd]=useState(()=>(pending&&pending.forgotPwd)||'');const[forgotPwd2,setForgotPwd2]=useState('');
  const[activeField,setActiveField]=useState(''); // 目前哪個PIN欄位被點開(鍵盤要顯示在哪個欄位下方),空字串=都沒開
  const[ticketSeq,setTicketSeq]=useState(()=>(pending&&pending.ticketSeq)||'');const[ticketStatus,setTicketStatus]=useState('');const[cooldown,setCooldown]=useState(0);
  const t=T[lang];
  useEffect(()=>{loadStores().then(s=>{setStores(s);if(!pending)setStore(s[0]||'龍山寺店')})},[]);
  useEffect(()=>{if(cooldown<=0)return;const tm=setTimeout(()=>setCooldown(c=>c>0?c-1:0),1000);return()=>clearTimeout(tm)},[cooldown]);
  const onWorkStartChange=(v)=>{setWorkStart(v);if(!workEndTouched)setWorkEnd(addHalfHourTime(v,12))};
  const onWorkEndChange=(v)=>{setWorkEnd(v);setWorkEndTouched(true)};
  const baseSettings=(extra)=>Object.assign({code,unitPrice:250,lang,store,year:bizParts().y,deviceId:devId,gender,workStart,workEnd,shift,lockPwd:pwd},extra||{});
  const doActivate=(settings)=>{clearPending();LS.set('app-settings',settings);LS.set(`activated-${code}`,{deviceId:devId,ts:Date.now()});try{if(shouldClaimKey(code)){autoClaimKey(code)}}catch(_e){}onComplete(settings)};
  const pinOk=isValidPin(pwd);
  const canSubmitNew=codeCheck==='new'&&code.trim()&&gender&&shift&&workStart&&workEnd&&pinOk&&pwd===pwd2&&agreed;

  const toggleField=(f)=>setActiveField(a=>a===f?'':f);
  const goChoice=()=>{clearPending();setMode('choice');setErr('');setFieldErr('');setChecking(false);setTicketStatus('');setCooldown(0);setPwd('');setPwd2('');setForgotPwd('');setForgotPwd2('');setLoginPwdInput('');setActiveField('')};

  const onCodeChange=(v)=>{setCode(v.replace(/[^a-zA-Z0-9]/g,''));setCodeCheck(null)};
  const codeDigit=(d)=>{if(code.length>=3)return;onCodeChange(code+d)};
  const codeBackspace=()=>{onCodeChange(code.slice(0,-1))};
  const codeClear=()=>onCodeChange('');
  // 新老師啟動密碼:點哪個欄位(pwd/pwd2)就對哪個欄位輸入,兩欄同時顯示方便前後比對,不會卡住回不去
  const pwdDigit=(d)=>{if(pwd.length>=4)return;setPwd(pwd+d);setFieldErr('')};
  const pwdBackspace=()=>setPwd(v=>v.slice(0,-1));
  const pwdClear=()=>setPwd('');
  const pwd2Digit=(d)=>{if(pwd2.length>=4)return;setPwd2(pwd2+d);setFieldErr('')};
  const pwd2Backspace=()=>setPwd2(v=>v.slice(0,-1));
  const pwd2Clear=()=>setPwd2('');
  const forgotPwdDigit=(d)=>{if(forgotPwd.length>=4)return;setForgotPwd(forgotPwd+d);setFieldErr('')};
  const forgotPwdBackspace=()=>setForgotPwd(v=>v.slice(0,-1));
  const forgotPwdClear=()=>setForgotPwd('');
  const forgotPwd2Digit=(d)=>{if(forgotPwd2.length>=4)return;setForgotPwd2(forgotPwd2+d);setFieldErr('')};
  const forgotPwd2Backspace=()=>setForgotPwd2(v=>v.slice(0,-1));
  const forgotPwd2Clear=()=>setForgotPwd2('');
  const loginPwdDigit=(d)=>{if(loginPwdInput.length>=4)return;setLoginPwdInput(loginPwdInput+d)};
  const loginPwdBackspace=()=>setLoginPwdInput(v=>v.slice(0,-1));
  const loginPwdClear=()=>setLoginPwdInput('');
  const doCheckCode=async()=>{
    if(!code.trim())return;
    setCodeCheck('checking');setErr('');
    try{
      const r=await gasCheckCode(code.trim());
      if(r&&r.ok){
        if(r.exists){setCodeCheck('exists');setMode('login');setLoginPwdInput('')}
        else{setCodeCheck('new')}
      }else{setCodeCheck('error');setErr((r&&r.error)||t.codeCheckFail)}
    }catch(e){setCodeCheck('error');setErr(t.codeCheckFail)}
  };

  const submitNew=async()=>{
    if(!canSubmitNew){if(!agreed)setAgreeErr(true);return}
    setAgreeErr(false);setFieldErr('');setChecking(true);
    // 快速通道:本來就是管理者/已核准過的編號,免走票證審核,但要記得把資料同步進Staff(不然性別/班別/上下班/語系不會進staff)
    const syncAndActivate=async()=>{
      try{await gasSyncProfile(code,{store,lang,gender,workStart,workEnd,shift,lockPwdEnc:lockPwdCred(code,pwd)})}catch(_e){}
      doActivate(baseSettings());
    };
    try{const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),5000);const res=await fetch('./admin.cfg',{cache:'no-store',signal:ctrl.signal});clearTimeout(timer);if(res.ok){const text=(await res.text()).trim();const lines=text.split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));const myHash=adminHash(code);const match=lines.some(l=>{const parts=l.split(':');const h=parts.length>=2?parts[parts.length-1]:parts[0];return h===myHash});if(match){await syncAndActivate();return}}}catch(_e){}
    try{const result=await checkApproved('t',approveHash(code,devId));if(result){await syncAndActivate();return}}catch(_e){}
    // 送出N票證(行為代碼+流水),不夾帶資料本身,資料另外走GAS存staff
    try{
      const payload={store,lang,gender,workStart,workEnd,shift,devId,lockPwdEnc:lockPwdCred(code,pwd)};
      const r=await gasSubmitAction('N',code,payload);
      setChecking(false);
      if(r&&r.ok){
        setTicketSeq(r.seq);setMode('newTicket');setTicketStatus('');setCooldown(0);
        savePending({mode:'newTicket',ticketSeq:r.seq,code,lang,store,gender,shift,workStart,workEnd,pwd});
      }else{setErr((r&&r.error)||'送出失敗,請檢查網路')}
    }catch(e){setChecking(false);setErr(String(e))}
  };

  const checkTicket=async(onApproved)=>{
    if(cooldown>0||ticketStatus==='checking')return;
    setTicketStatus('checking');
    try{
      const r=await gasCheckAction(ticketSeq);
      if(r&&r.ok){
        if(r.status==='approved'){
          setTicketStatus('approved');
          if(r.key){try{setMyKey(code,r.key)}catch(_e){}} // 主管核准時順便產的金鑰,這裡一起領走存本機
          onApproved&&onApproved();
        }
        else{setTicketStatus('pending');setCooldown(60)}
      }else{setTicketStatus('error');setCooldown(60)}
    }catch(_e){setTicketStatus('error');setCooldown(60)}
  };

  const doLogin=async()=>{
    if(!code.trim()||!/^\d{4}$/.test(loginPwdInput)){setErr(t.pwdLoginFail);return}
    setChecking(true);setErr('');
    try{
      const cred=lockPwdCred(code,loginPwdInput);
      const r=await gasLoginPwd(code,cred);
      setChecking(false);
      if(r&&r.ok){doActivate({code,unitPrice:r.unitPrice||250,lang:r.lang||lang,store:r.store||store,year:bizParts().y,deviceId:devId,gender:r.gender||'',workStart:r.workStart||'',workEnd:r.workEnd||'',shift:r.shift||'',lockPwd:loginPwdInput})}
      else if(r&&r.reason==='left'){setMode('reinstateAsk')}
      else{setErr((r&&r.error)?(t.pwdLoginFail+'（'+r.error+'）'):t.pwdLoginFail)}
    }catch(e){setChecking(false);setErr(t.pwdLoginFail+'（'+e+'）')}
  };

  const forgotPinOk=isValidPin(forgotPwd);
  const canSubmitForgot=code.trim()&&forgotPinOk&&forgotPwd===forgotPwd2;
  const[loginNotice,setLoginNotice]=useState('');
  const submitForgot=async()=>{
    if(!canSubmitForgot)return;
    setFieldErr('');setChecking(true);setErr('');
    try{
      // 先檢查帳號是不是離職停用中,是的話不能走忘記密碼,要改走復職申請
      const chk=await gasCheckCode(code);
      if(chk&&chk.ok&&chk.status==='left'){setChecking(false);setMode('reinstateAsk');return}
      const payload={devId,lang,lockPwdEnc:lockPwdCred(code,forgotPwd)};
      const r=await gasSubmitAction('F',code,payload);
      setChecking(false);
      if(r&&r.ok){
        setTicketSeq(r.seq);setMode('forgotTicket');setTicketStatus('');setCooldown(0);
        savePending({mode:'forgotTicket',ticketSeq:r.seq,code,lang,store,gender,shift,workStart,workEnd,forgotPwd});
      }else{setErr((r&&r.error)||'送出失敗')}
    }catch(e){setChecking(false);setErr(String(e))}
  };
  const onForgotApproved=async()=>{
    try{
      const cred=lockPwdCred(code,forgotPwd);
      const r=await gasLoginPwd(code,cred);
      if(r&&r.ok){doActivate({code,unitPrice:r.unitPrice||250,lang:r.lang||lang,store:r.store||store,year:bizParts().y,deviceId:devId,gender:r.gender||'',workStart:r.workStart||'',workEnd:r.workEnd||'',shift:r.shift||'',lockPwd:forgotPwd})}
      else if(r&&r.reason==='left'){setMode('reinstateAsk')}
      else{setErr((r&&r.error)?(t.pwdLoginFail+'（'+r.error+'）'):t.pwdLoginFail)}
    }catch(e){setErr(t.pwdLoginFail+'（'+e+'）')}
  };
  const submitReinstate=async()=>{
    setChecking(true);setErr('');
    try{
      const r=await gasSubmitAction('R',code,{devId});
      setChecking(false);
      if(r&&r.ok){
        setTicketSeq(r.seq);setMode('reinstateTicket');setTicketStatus('');setCooldown(0);
        savePending({mode:'reinstateTicket',ticketSeq:r.seq,code,lang,store,gender,shift,workStart,workEnd});
      }else{setErr((r&&r.error)||'送出失敗')}
    }catch(e){setChecking(false);setErr(String(e))}
  };
  const onReinstateApproved=()=>{
    clearPending();setLoginNotice(t.reinstateApprovedMsg);setMode('login');setErr('');setFieldErr('');
  };

  const ticketBlock=(prefixKey,titleKey,onApproved)=>(
    <div className="space-y-4">
      <div className="bg-white/[0.03] rounded-xl p-4 text-center">
        <p className="text-xs text-amber-400 font-semibold mb-3">{t[titleKey]}</p>
        <p className="text-[11px] text-gray-500 mb-1">{t.ticketInfoTeacher}</p>
        <p className="text-2xl font-bold text-gray-100 mb-3">{code}</p>
        <p className="text-[11px] text-gray-500 mb-1">{t.ticketCode}</p>
        <p className="text-base font-semibold text-amber-400 font-mono tracking-widest select-all">{ticketSeq}</p>
      </div>
      <button onClick={()=>{const base=location.origin+location.pathname.replace(/index\.html$/,'')+'auth.html';const link=buildReqLink(base,ticketSeq);const zhMsg=(T.zh[prefixKey]||'').replace('{code}',code);const isVi=ticketSeq&&ticketSeq[1]==='2';const viMsg=isVi?(T.vi[prefixKey]||'').replace('{code}',code):'';sendTicketFlex('🔑 審核通知',zhMsg,link,viMsg)}} className="w-full px-3 py-4 rounded-xl text-base font-bold bg-[#06C755] text-white active:bg-[#05b34c]">{t.ticketSend}</button>
      <div className="space-y-2">
        <button onClick={()=>checkTicket(onApproved)} disabled={cooldown>0||ticketStatus==='checking'} className={`w-full py-3.5 rounded-xl font-bold transition-all ${cooldown>0||ticketStatus==='checking'?'bg-white/[0.06] text-gray-600 cursor-not-allowed':'bg-amber-600 text-white'}`}>{ticketStatus==='checking'?t.ticketChecking:cooldown>0?fmtLog(t.ticketWaitCountdown,[String(cooldown)]):t.ticketCheckBtn}</button>
        {ticketStatus==='pending'&&<p className="text-xs text-gray-500 text-center">{t.ticketPending}</p>}
        {ticketStatus==='error'&&<p className="text-xs text-red-400 text-center">{t.pwdLoginFail}</p>}
        {err&&<p className="text-xs text-red-400 text-center">{err}</p>}
      </div>
      <button onClick={goChoice} className="w-full py-2.5 rounded-xl bg-white/[0.05] text-gray-400 text-sm font-semibold">{t.backToChoice}</button>
    </div>
  );

  return(<div className="min-h-screen flex items-center justify-center p-6 bg-gray-950"><div className="w-full max-w-sm fi">
    <div className="text-center mb-6"><div className="w-16 h-16 bg-amber-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/></svg></div><h1 className="text-xl font-bold text-gray-100 mb-1">{t.welcome}</h1></div>

    {mode==='choice'&&(<div className="space-y-3">
      <div><label className="text-sm text-gray-400 mb-1.5 block">{t.language}</label><div className="grid grid-cols-2 gap-2">{[['zh','中文'],['vi','Tiếng Việt']].map(([c,l])=>(<button key={c} onClick={()=>setLang(c)} className={`py-3 rounded-xl text-sm font-semibold transition-all ${lang===c?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{l}</button>))}</div></div>
      <button onClick={()=>{setMode('new');setCodeCheck(null)}} className="w-full py-4 rounded-xl font-bold text-lg bg-amber-600 text-white mt-2">{t.flowNew}</button>
      <button onClick={()=>{setMode('login');setErr('');setCodeCheck(null)}} className="w-full py-4 rounded-xl font-bold text-lg bg-white/[0.06] text-gray-200">{t.flowLogin}</button>
    </div>)}

    {mode==='new'&&(()=>{const locked=codeCheck!=='new';return(<div className="space-y-5">
    <div className="space-y-2"><label className="text-sm text-gray-400 block text-center">{t.teacherCode}</label>
      <PinDotsClickable length={code.length} total={3} digits={code} active={activeField==='code'} onClick={()=>toggleField('code')} onClear={codeClear}/>
      {activeField==='code'&&<PinKeypadCompact onDigit={codeDigit} onBackspace={codeBackspace}/>}
      <button onClick={doCheckCode} disabled={!code.trim()||codeCheck==='checking'||codeCheck==='new'} className={`w-full py-3 rounded-xl text-sm font-bold ${codeCheck==='new'?'bg-emerald-600 text-white':code.trim()?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-600'}`}>{codeCheck==='checking'?t.checkingCode:codeCheck==='new'?'✓':t.checkCodeBtn}</button>
      {codeCheck==='new'&&<p className="text-xs text-emerald-500 mt-1.5 text-center">{t.codeAvailHint}</p>}
      {codeCheck==='error'&&<p className="text-xs text-red-400 mt-1.5 text-center">{err}</p>}
    </div>
    <fieldset disabled={locked} className={locked?'opacity-40 space-y-5 pointer-events-none':'space-y-5'}>
    <div><label className="text-sm text-gray-400 mb-1.5 block">{t.store}</label><select value={store} onChange={e=>setStore(e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3.5 text-lg text-gray-100 focus:outline-none focus:border-amber-500 appearance-none">{stores.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
    <div><label className="text-sm text-gray-400 mb-1.5 block">{t.gender}</label><div className="grid grid-cols-2 gap-2">{[['M',t.genderM],['F',t.genderF]].map(([g,l])=>(<button key={g} onClick={()=>setGender(g)} className={`py-3 rounded-xl text-sm font-semibold transition-all ${gender===g?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{l}</button>))}</div></div>
    <div><label className="text-sm text-gray-400 mb-1.5 block">{t.shiftLabel}</label><div className="grid grid-cols-2 gap-2">{[['day',t.shiftDay],['night',t.shiftNight]].map(([sv,l])=>(<button key={sv} onClick={()=>setShift(sv)} className={`py-3 rounded-xl text-sm font-semibold transition-all ${shift===sv?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{l}</button>))}</div></div>
    <div className="grid grid-cols-2 gap-2"><div><label className="text-sm text-gray-400 mb-1.5 block">{t.workStart}</label><select value={workStart} onChange={e=>onWorkStartChange(e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-3.5 text-base text-center text-gray-100 focus:outline-none focus:border-amber-500 appearance-none">{TIME_OPTS.map(o=><option key={o} value={o}>{o}</option>)}</select></div><div><label className="text-sm text-gray-400 mb-1.5 block">{t.workEnd}</label><select value={workEnd} onChange={e=>onWorkEndChange(e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-3.5 text-base text-center text-gray-100 focus:outline-none focus:border-amber-500 appearance-none">{TIME_OPTS.map(o=><option key={o} value={o}>{o}</option>)}</select></div></div>
    <div className="space-y-3"><label className="text-sm text-gray-400 mb-1.5 block text-center">{t.lockPwdTitle}</label>
      <div className="space-y-1.5"><p className="text-[11px] text-gray-600 text-center">{t.lockPwdHint}</p>
        <PinDotsClickable length={pwd.length} total={4} active={activeField==='pwd1'} onClick={()=>toggleField('pwd1')} onClear={pwdClear}/>
        {activeField==='pwd1'&&<PinKeypadCompact onDigit={pwdDigit} onBackspace={pwdBackspace}/>}
      </div>
      <div className="space-y-1.5"><p className="text-[11px] text-gray-600 text-center">{t.lockPwdConfirm}</p>
        <PinDotsClickable length={pwd2.length} total={4} active={activeField==='pwd2'} onClick={()=>toggleField('pwd2')} onClear={pwd2Clear}/>
        {activeField==='pwd2'&&<PinKeypadCompact onDigit={pwd2Digit} onBackspace={pwd2Backspace}/>}
      </div>
      {pwd.length===4&&!pinOk&&<p className="text-xs text-red-400 text-center">{t.lockPwdInvalid}</p>}
      {pwd2.length===4&&pwd!==pwd2&&<p className="text-xs text-red-400 text-center">{t.lockPwdMismatch}</p>}
    </div>
    <NoticeBox t={t} agreed={agreed} setAgreed={v=>{setAgreed(v);if(v)setAgreeErr(false)}}/>
    </fieldset>
    <button onClick={submitNew} disabled={!canSubmitNew||checking} className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${canSubmitNew&&!checking?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-600 cursor-not-allowed'}`}>{checking?t.adminWelcome:t.submitActivation}</button>
    {agreeErr&&<p className="text-xs text-red-400 text-center -mt-3">{t.mustReadFirst}</p>}
    {fieldErr&&<p className="text-xs text-red-400 text-center -mt-3">{fieldErr}</p>}
    {err&&codeCheck!=='error'&&<p className="text-red-400 text-sm text-center fi">{err}</p>}
    <button onClick={goChoice} className="w-full py-2.5 rounded-xl bg-white/[0.05] text-gray-400 text-sm font-semibold">{t.backToChoice}</button>
    </div>)})()}

    {mode==='newTicket'&&ticketBlock('lineTicketNewPrefix','ticketPendingNewTitle',()=>doActivate(baseSettings()))}

    {mode==='login'&&(<div className="space-y-4">
      <p className="text-sm text-amber-400 text-center font-medium">{codeCheck==='exists'?t.codeExistsHint:t.pwdLoginHint}</p>
      {loginNotice&&<p className="text-sm text-emerald-500 text-center font-semibold">✓ {loginNotice}</p>}
      <div className="space-y-2"><label className="text-sm text-gray-400 block text-center">{t.teacherCode}</label><PinDotsClickable length={code.length} total={3} digits={code} active={activeField==='code'} onClick={()=>toggleField('code')} onClear={()=>{codeClear();setLoginNotice('')}}/>{activeField==='code'&&<PinKeypadCompact onDigit={codeDigit} onBackspace={()=>{codeBackspace();setLoginNotice('')}}/>}</div>
      <div className="space-y-2"><label className="text-sm text-gray-400 block text-center">{t.pwdInputPh}</label><PinDotsClickable length={loginPwdInput.length} total={4} active={activeField==='loginPwd'} onClick={()=>toggleField('loginPwd')} onClear={loginPwdClear}/>{activeField==='loginPwd'&&<PinKeypadCompact onDigit={loginPwdDigit} onBackspace={loginPwdBackspace}/>}</div>
      {err&&<p className="text-red-400 text-sm text-center fi">{err}</p>}
      <button onClick={doLogin} disabled={checking||!code.trim()||loginPwdInput.length!==4} className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${!checking&&code.trim()&&loginPwdInput.length===4?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-600 cursor-not-allowed'}`}>{checking?t.adminWelcome:t.pwdLoginBtn}</button>
      <button onClick={()=>{setMode('forgot');setErr('');setFieldErr('')}} className="w-full text-center text-xs text-gray-500 underline">{t.forgotPwdLink}</button>
      <button onClick={goChoice} className="w-full py-2.5 rounded-xl bg-white/[0.05] text-gray-400 text-sm font-semibold">{t.backToChoice}</button>
    </div>)}

    {mode==='forgot'&&(<div className="space-y-4">
      <p className="text-sm text-amber-400 text-center font-medium">{t.forgotPwdHint}</p>
      <div className="space-y-2"><label className="text-sm text-gray-400 block text-center">{t.teacherCode}</label><PinDotsClickable length={code.length} total={3} digits={code} active={activeField==='code'} onClick={()=>toggleField('code')} onClear={codeClear}/>{activeField==='code'&&<PinKeypadCompact onDigit={codeDigit} onBackspace={codeBackspace}/>}</div>
      <div className="space-y-3"><label className="text-sm text-gray-400 mb-1.5 block text-center">{t.newPwdTitle}</label>
        <div className="space-y-1.5"><p className="text-[11px] text-gray-600 text-center">{t.newPwdHint}</p>
          <PinDotsClickable length={forgotPwd.length} total={4} active={activeField==='forgotPwd1'} onClick={()=>toggleField('forgotPwd1')} onClear={forgotPwdClear}/>
          {activeField==='forgotPwd1'&&<PinKeypadCompact onDigit={forgotPwdDigit} onBackspace={forgotPwdBackspace}/>}
        </div>
        <div className="space-y-1.5"><p className="text-[11px] text-gray-600 text-center">{t.lockPwdConfirm}</p>
          <PinDotsClickable length={forgotPwd2.length} total={4} active={activeField==='forgotPwd2'} onClick={()=>toggleField('forgotPwd2')} onClear={forgotPwd2Clear}/>
          {activeField==='forgotPwd2'&&<PinKeypadCompact onDigit={forgotPwd2Digit} onBackspace={forgotPwd2Backspace}/>}
        </div>
        {forgotPwd.length===4&&!forgotPinOk&&<p className="text-xs text-red-400 text-center">{t.lockPwdInvalid}</p>}
        {forgotPwd2.length===4&&forgotPwd!==forgotPwd2&&<p className="text-xs text-red-400 text-center">{t.lockPwdMismatch}</p>}
      </div>
      {err&&<p className="text-red-400 text-sm text-center fi">{err}</p>}
      <button onClick={submitForgot} disabled={checking||!canSubmitForgot} className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${!checking&&canSubmitForgot?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-600 cursor-not-allowed'}`}>{checking?t.adminWelcome:t.submitActivation}</button>
      <button onClick={goChoice} className="w-full py-2.5 rounded-xl bg-white/[0.05] text-gray-400 text-sm font-semibold">{t.backToChoice}</button>
    </div>)}

    {mode==='forgotTicket'&&ticketBlock('lineTicketForgotPrefix','ticketPendingForgotTitle',onForgotApproved)}

    {mode==='reinstateAsk'&&(<div className="space-y-4">
      <p className="text-sm text-amber-400 text-center font-medium">{t.accountLeftMsg}</p>
      <p className="text-xs text-gray-500 text-center">{t.reinstateHint}</p>
      {err&&<p className="text-red-400 text-sm text-center fi">{err}</p>}
      <button onClick={submitReinstate} disabled={checking} className="w-full py-4 rounded-xl font-bold text-lg bg-amber-600 text-white disabled:opacity-50">{checking?t.adminWelcome:t.reinstateBtn}</button>
      <button onClick={goChoice} className="w-full py-2.5 rounded-xl bg-white/[0.05] text-gray-400 text-sm font-semibold">{t.backToChoice}</button>
    </div>)}

    {mode==='reinstateTicket'&&ticketBlock('lineTicketReinstatePrefix','ticketTypeR',onReinstateApproved)}
  </div></div>)}


/* ══════════ Home Page ══════════ */
function infoFieldLabel(key,t){
  const m={nameZh:t.nameZh,nameVi:t.nameVi,gender:t.gender,gloveSize:t.gloveSize||'手套尺寸',phone:t.custPhone||'電話',email:t.email,
    addrCity:'縣市',addrDist:'鄉鎮區',addrDetail:'詳細地址',school:t.school,major:t.major,
    permitNo:t.permitNo,permitDate:t.permitDate,permitExpiry:'工作證到期日',permitOrg:t.permitOrgOpt||'核發單位',
    storeSel:t.store,shift:t.shiftLabel||'班別',workStart:t.workStart,workEnd:t.workEnd,workNote:t.workNote,techMentor:t.techMentor,lockerNo:t.lockerNo,
    unitPrice:t.unitPrice,preg:t.pregClient,oil:t.oilLabel,skills:t.skills};
  return m[key]||key;
}
// 縣市選項:常見的4個(桃園/新北/臺北/宜蘭,店內大部分員工所在地)排前面,其餘照TW_REGIONS完整列出
const CITY_PRIORITY=['桃園市','新北市','臺北市','宜蘭縣'];
const CITY_OPTIONS=[...CITY_PRIORITY,...Object.keys(TW_REGIONS).filter(c=>!CITY_PRIORITY.includes(c))];
const BASIC_FIELD_KEYS=['nameZh','gender','gloveSize','phone','email','addrCity','addrDist','addrDetail','nameVi','permitNo','permitDate','permitExpiry','permitOrg','school','major'];
const BASIC_FIELD_LAYOUT=['nameZh','gender','gloveSize','phone','email','addrCity','addrDist','addrDetail','__divider_foreign__','nameVi','permitNo','permitDate','permitExpiry','permitOrg','school','major'];
const STORE_FIELD_KEYS=['storeSel','shift','workStart','workEnd','workNote','unitPrice','skills','preg','oil','techMentor','lockerNo'];
// 跟App元件settingsAlert(❗提醒)比對用的完整欄位清單一致,核准後要用這份存confirmedProfile/confirmedStore快照
const PF_ALERT_FIELDS=['gender','nameZh','nameVi','phone','email','addrCity','addrDist','addrDetail','school','major','schoolType','permitNo','permitDate','permitExpiry','permitOrg'];
const SF_ALERT_FIELDS=['storeSel','shift','workStart','workEnd','workNote','unitPrice','skills','preg','oil','techMentor','lockerNo'];
// 基資/店資的密碼解鎖時間戳跟公告共用同一組key,解鎖一次兩邊都算(同屬"公司/個人資料保護"這件事)
const INFO_UNLOCK_KEY_PREFIX='notice-pwd-unlock-';
function getInfoUnlockTs(code){try{return parseInt(localStorage.getItem(INFO_UNLOCK_KEY_PREFIX+code)||'0',10)||0}catch(_e){return 0}}
function setInfoUnlockTs(code){try{localStorage.setItem(INFO_UNLOCK_KEY_PREFIX+code,String(Date.now()))}catch(_e){}}
// 憑證有效性一天只查一次,跟notice-modal.js共用同一組localStorage key(互通,不會各查各的)
function getCachedKeyCheck(code){try{const today=new Date().toISOString().slice(0,10);if(localStorage.getItem('key-check-date-'+code)===today)return localStorage.getItem('key-check-result-'+code)}catch(_e){}return null}
function setCachedKeyCheck(code,result){try{const today=new Date().toISOString().slice(0,10);localStorage.setItem('key-check-date-'+code,today);localStorage.setItem('key-check-result-'+code,result)}catch(_e){}}

function PinDots({length,total}){
  const n=total||4;
  return(<div className="flex gap-3 justify-center">{Array.from({length:n}).map((_,i)=>(<div key={i} className={`w-4 h-4 rounded-full border-2 ${length>i?'bg-amber-500 border-amber-500':'border-white/[0.2]'}`}></div>))}</div>);
}
function PinKeypad({onDigit,onBackspace}){
  return(<div className="grid grid-cols-3 gap-4 justify-items-center">{['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k,i)=>k===''?<div key={i}/>:(
    <button key={i} onClick={()=>k==='⌫'?onBackspace():onDigit(k)} className="pinGateBtn w-16 h-16 rounded-full text-xl font-semibold active:opacity-80">{k}</button>
  ))}</div>);
}
// 新啟動/登入/忘記密碼專用:單排鍵盤,搭配下方PinDotsClickable做「點哪個欄位才彈出鍵盤」的設計
function PinKeypadCompact({onDigit,onBackspace}){
  const BtnCls="w-9 h-11 rounded-lg pinGateBtn text-base font-semibold active:opacity-80 flex items-center justify-center flex-shrink-0";
  return(<div className="grid grid-cols-3 gap-1.5 justify-items-center max-w-[168px] mx-auto">
    {['1','2','3','4','5','6','7','8','9'].map(k=>(<button key={k} onClick={()=>onDigit(k)} className={BtnCls}>{k}</button>))}
    <div/>
    <button onClick={()=>onDigit('0')} className={BtnCls}>0</button>
    <button onClick={onBackspace} className={BtnCls+" text-gray-400"}>⌫</button>
  </div>);
}
// 可點擊的PIN圓點列:點了切換這個欄位是不是目前作用中(鍵盤要不要顯示在這欄下方),右側有清除鈕
function PinDotsClickable({length,total,digits,active,onClick,onClear}){
  const n=total||4;
  return(<div className="flex items-center justify-center gap-2">
    <button onClick={onClick} className={`flex gap-2.5 p-1.5 rounded-xl ${active?'bg-white/[0.06] ring-1 ring-amber-500/40':''}`}>
      {Array.from({length:n}).map((_,i)=>{
        const filled=length>i;const ch=digits&&digits[i];
        return(<div key={i} className={`flex items-center justify-center rounded-full border-2 ${ch?'w-8 h-8 text-base font-bold':'w-4 h-4'} ${filled?'bg-amber-500 border-amber-500 text-white':'border-white/[0.2]'}`}>{ch||''}</div>);
      })}
    </button>
    {length>0&&<button onClick={onClear} className="w-6 h-6 rounded-full bg-white/[0.06] text-gray-500 text-xs flex items-center justify-center flex-shrink-0">✕</button>}
  </div>);
}

// 忘記密碼:鎖屏畫面點了跳出來,直接設新密碼,不用先驗證舊密碼
function ForgotPwdModal({settings,onClose,onSuccess}){
  const[pwd1,setPwd1]=useState('');const[pwd2,setPwd2]=useState('');
  const[activeField,setActiveField]=useState('');
  const[busy,setBusy]=useState(false);const[msg,setMsg]=useState('');
  const pwdOk=isValidPin(pwd1);
  const doReset=async()=>{
    if(!pwdOk||pwd1!==pwd2)return;
    setBusy(true);setMsg('');
    try{
      const r=await gasSetInitialPwd(settings.code,lockPwdCred(settings.code,pwd1));
      if(r&&r.ok){onSuccess(pwd1);setMsg('✓ 密碼已更新')}
      else{setMsg((r&&r.error)||'更新失敗')}
    }catch(e){setMsg(String(e))}
    setBusy(false);
  };
  return(<div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-gray-900 border border-white/[0.08] rounded-2xl p-5 w-full max-w-xs space-y-3" onClick={e=>e.stopPropagation()}>
      <p className="text-sm font-bold text-gray-100 text-center">忘記密碼</p>
      <div className="space-y-1.5"><p className="text-xs text-gray-400 text-center">設定新密碼（不可4碼相同或連續遞增/遞減）</p>
        <PinDotsClickable length={pwd1.length} total={4} active={activeField==='p1'} onClick={()=>setActiveField(f=>f==='p1'?'':'p1')} onClear={()=>setPwd1('')}/>
        {activeField==='p1'&&<PinKeypadCompact onDigit={d=>{if(pwd1.length>=4)return;setPwd1(pwd1+d)}} onBackspace={()=>setPwd1(v=>v.slice(0,-1))}/>}
      </div>
      <div className="space-y-1.5"><p className="text-xs text-gray-400 text-center">再輸入一次確認</p>
        <PinDotsClickable length={pwd2.length} total={4} active={activeField==='p2'} onClick={()=>setActiveField(f=>f==='p2'?'':'p2')} onClear={()=>setPwd2('')}/>
        {activeField==='p2'&&<PinKeypadCompact onDigit={d=>{if(pwd2.length>=4)return;setPwd2(pwd2+d)}} onBackspace={()=>setPwd2(v=>v.slice(0,-1))}/>}
      </div>
      {pwd1.length===4&&!pwdOk&&<p className="text-xs text-red-400 text-center">密碼不可4碼相同或連續遞增/遞減</p>}
      {pwd2.length===4&&pwd1!==pwd2&&<p className="text-xs text-red-400 text-center">兩次輸入不一致</p>}
      {msg&&<p className={`text-xs text-center ${msg.startsWith('✓')?'text-emerald-400':'text-red-400'}`}>{msg}</p>}
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-gray-400 text-sm">關閉</button>
        <button onClick={doReset} disabled={busy||!pwdOk||pwd1!==pwd2} className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold disabled:opacity-50 disabled:bg-white/[0.06] disabled:text-gray-600">{busy?'處理中…':'確認更新'}</button>
      </div>
    </div>
  </div>);
}

function InfoEditModal({type,settings,t,onClose,onUpdateSettings}){
  const code=settings.code;
  const actionCode=type==='basic'?'B':'S';
  const fieldKeys=type==='basic'?BASIC_FIELD_KEYS:STORE_FIELD_KEYS;
  const layoutKeys=type==='basic'?BASIC_FIELD_LAYOUT:STORE_FIELD_KEYS;
  const titleText=type==='basic'?(t.secBasic||'基本資料'):(t.secStore||'店家資訊');
  const pendingKey='info-pending-'+type+'-'+code;
  const loadPendingT=()=>{try{return JSON.parse(localStorage.getItem(pendingKey)||'null')}catch(_e){return null}};
  const savePendingT=(o)=>{try{localStorage.setItem(pendingKey,JSON.stringify(o))}catch(_e){}};
  const clearPendingT=()=>{try{localStorage.removeItem(pendingKey)}catch(_e){}};
  const[pending]=useState(()=>loadPendingT());
  const[stores,setStores]=useState(['龍山寺店']);
  useEffect(()=>{if(type==='store')loadStores().then(s=>setStores(s))},[]);

  const initGate=()=>{
    if(!code)return 'none';
    if(!settings.lockPwd)return 'checking'; // 本機沒有,要先問GAS這個編號是不是已經在別的裝置設過密碼
    if(Date.now()-getInfoUnlockTs(code)>(settings.lockAutoTime||60)*60*1000)return 'locked';
    return 'none';
  };
  const[gate,setGate]=useState(initGate);
  const[verifyMode,setVerifyMode]=useState(false); // true=本機沒有密碼但伺服器已有,要用既有密碼驗證(不是重新設定)
  useEffect(()=>{
    if(gate!=='checking')return;
    (async()=>{
      try{
        const r=await gasCheckCode(code);
        setVerifyMode(!!(r&&r.ok&&r.hasLockPwd));
        setGate(r&&r.ok&&r.hasLockPwd?'locked':'setup');
      }catch(_e){setGate('setup')}
    })();
  },[gate]);
  const[keyCheck,setKeyCheck]=useState(null); // null/checking/ok/invalid
  const[setupStep,setSetupStep]=useState(1); // 1=第一次輸入 2=再輸入一次確認
  const[setupPwd,setSetupPwd]=useState('');const[setupPwd1,setSetupPwd1]=useState('');const[setupErr,setSetupErr]=useState('');const[setupBusy,setSetupBusy]=useState(false);
  const[unlockInput,setUnlockInput]=useState('');const[unlockErr,setUnlockErr]=useState('');const[unlockShake,setUnlockShake]=useState(false);
  const[showForgotPwd,setShowForgotPwd]=useState(false);
  const[unlockBusy,setUnlockBusy]=useState(false);

  const[mode,setMode]=useState(()=>pending?'ticket':'view'); // view/edit/ticket
  const initForm=()=>{const f={};fieldKeys.forEach(k=>{if(k==='skills'){f[k]=settings[k]||{};return}f[k]=settings[k]!=null?String(settings[k]):(k==='gloveSize'?'M':'')});return f};
  const[form,setForm]=useState(initForm);
  const[ticketSeq,setTicketSeq]=useState(()=>pending?pending.seq:'');
  const[changedList,setChangedList]=useState(()=>pending?pending.changed:[]);
  const[ticketStatus,setTicketStatus]=useState('');const[cooldown,setCooldown]=useState(0);
  const[err,setErr]=useState('');const[busy,setBusy]=useState(false);
  const[rejectReason,setRejectReason]=useState('');
  const[showLeave,setShowLeave]=useState(false);const[leaveBusy,setLeaveBusy]=useState(false);const[leaveDone,setLeaveDone]=useState(false);const[leaveErr,setLeaveErr]=useState('');
  const doLeave=async()=>{
    setLeaveBusy(true);setLeaveErr('');
    try{const r=await gasLeaveTeacher(code,code);if(r&&r.ok){setLeaveDone(true)}else{setLeaveErr((r&&r.error)||t.leaveFail)}}catch(e){setLeaveErr(t.leaveFail)}
    setLeaveBusy(false);
  };
  useEffect(()=>{if(cooldown<=0)return;const tm=setTimeout(()=>setCooldown(c=>c>0?c-1:0),1000);return()=>clearTimeout(tm)},[cooldown]);
  // 密碼關卡通過後,背景驗證金鑰是否還有效(離職員工密碼還能用,但金鑰會被設過期)
  // 店資:金鑰失效直接擋內容(比照公告,屬公司資料)。基資:仍可檢視(算自己的資料),只擋送出變更
  useEffect(()=>{
    if(gate!=='none'){return}
    if(!code||!hasMyKey(code)){setKeyCheck('ok');return}
    const cached=getCachedKeyCheck(code);
    if(cached){setKeyCheck(cached);return}
    setKeyCheck('checking');
    (async()=>{
      try{
        const key=getMyKey(code);
        const r=await gasVerifyKey(code,key);
        const result=(r&&r.ok&&r.valid)?'ok':'invalid';
        setKeyCheck(result);setCachedKeyCheck(code,result);
      }catch(_e){setKeyCheck('ok')} // 網路失敗容錯:不擋
    })();
  },[gate]);

  const finishSetup=async(pwd)=>{
    setSetupErr('');setSetupBusy(true);
    const updated=Object.assign({},settings,{lockPwd:pwd});
    try{LS.set('app-settings',updated)}catch(_e){}
    if(onUpdateSettings)onUpdateSettings(updated);
    setInfoUnlockTs(code);
    setSetupBusy(false);setGate('none');
    try{const cred=lockPwdCred(code,pwd);gasSetInitialPwd(code,cred)}catch(_e){}
  };
  const pressSetupDigit=(d)=>{
    const next=(setupPwd+d).slice(0,4);
    setSetupPwd(next);
    if(next.length===4){
      if(setupStep===1){
        if(!isValidPin(next)){setSetupErr(t.lockPwdInvalid);setSetupPwd('');return}
        setSetupPwd1(next);setSetupStep(2);setSetupPwd('');setSetupErr('');
      }else{
        if(next!==setupPwd1){setSetupErr(t.lockPwdMismatch);setSetupStep(1);setSetupPwd('');setSetupPwd1('');return}
        finishSetup(next);
      }
    }
  };
  const pressUnlockDigit=(d)=>{
    const next=(unlockInput+d).slice(0,4);
    setUnlockInput(next);
    if(next.length===4){
      if(verifyMode){
        setUnlockBusy(true);
        (async()=>{
          try{
            const cred=lockPwdCred(code,next);
            const r=await gasLoginPwd(code,cred);
            if(r&&r.ok){
              const updated=Object.assign({},settings,{lockPwd:next});
              try{LS.set('app-settings',updated)}catch(_e){}
              if(onUpdateSettings)onUpdateSettings(updated);
              setInfoUnlockTs(code);setUnlockErr('');setUnlockBusy(false);setGate('none');
            }else{
              setUnlockBusy(false);setUnlockErr((r&&r.error)||t.noticePwdWrong||'密碼錯誤');setUnlockShake(true);setTimeout(()=>{setUnlockShake(false);setUnlockInput('')},500);
            }
          }catch(e){setUnlockBusy(false);setUnlockErr(String(e));setUnlockShake(true);setTimeout(()=>{setUnlockShake(false);setUnlockInput('')},500)}
        })();
        return;
      }
      if(next===settings.lockPwd){setInfoUnlockTs(code);setUnlockErr('');setGate('none')}
      else{setUnlockErr(t.noticePwdWrong||'密碼錯誤');setUnlockShake(true);setTimeout(()=>{setUnlockShake(false);setUnlockInput('')},500)}
    }
  };

  const startEdit=()=>{setForm(initForm());setMode('edit')};
  const cancelEdit=()=>{setForm(initForm());setMode('view')};
  const backToEditAfterReject=()=>{clearPendingT();const f=initForm();changedList.forEach(c=>{f[c.key]=c.val});setForm(f);setMode('edit');setTicketStatus('');setRejectReason('')};
  const submitEdit=async()=>{
    if(keyCheck==='invalid'){setErr(t.keyInvalidEditMsg);return}
    const changed={};const changedDisp=[];
    fieldKeys.forEach(k=>{
      if(k==='skills'){
        const ov=JSON.stringify(settings.skills||{});const nv=form.skills||{};
        if(ov!==JSON.stringify(nv)){changed[k]=nv;changedDisp.push({key:k,label:infoFieldLabel(k,t),val:SKILL_KEYS.filter(s=>nv[s]).map(s=>t[s]||s).join('、')||'—'})}
        return;
      }
      const ov=String(settings[k]!=null?settings[k]:'');const nv=String(form[k]!=null?form[k]:'').trim();
      if(ov!==nv){changed[k]=nv;changedDisp.push({key:k,label:infoFieldLabel(k,t),val:nv})}
    });
    if(Object.keys(changed).length===0){setMode('view');return}
    setBusy(true);setErr('');
    try{
      const r=await gasSubmitAction(actionCode,code,changed);
      setBusy(false);
      if(r&&r.ok){
        setTicketSeq(r.seq);setChangedList(changedDisp);setMode('ticket');setTicketStatus('');setCooldown(0);
        savePendingT({seq:r.seq,changed:changedDisp});
      }else{setErr((r&&r.error)||'送出失敗')}
    }catch(e){setBusy(false);setErr(String(e))}
  };
  const checkTicket=async()=>{
    if(cooldown>0||ticketStatus==='checking')return;
    setTicketStatus('checking');
    try{
      const r=await gasCheckAction(ticketSeq);
      if(r&&r.ok){
        if(r.status==='approved'){
          setTicketStatus('approved');
          let payload={};try{payload=JSON.parse(r.payload||'{}')}catch(_e){}
          const updated=Object.assign({},settings,payload);
          // 同步更新confirmedProfile/confirmedStore快照,不然底部設定頁的❗提醒邏輯(比對這兩個欄位)會抓不到"已確認",永遠亮著關不掉
          const snap={};(type==='basic'?PF_ALERT_FIELDS:SF_ALERT_FIELDS).forEach(fk=>{snap[fk]=updated[fk]!==undefined?updated[fk]:''});
          if(type==='basic')updated.confirmedProfile=snap;else updated.confirmedStore=snap;
          try{LS.set('app-settings',updated)}catch(_e){}
          if(onUpdateSettings)onUpdateSettings(updated);
          clearPendingT();
          setTimeout(()=>{if(onClose)onClose()},1200);
        }else if(r.status==='rejected'){
          let rp={};try{rp=JSON.parse(r.payload||'{}')}catch(_e){}
          setTicketStatus('rejected');setRejectReason(rp.rejectReason||'');
        }else{setTicketStatus('pending');setCooldown(60)}
      }else{setTicketStatus('error');setCooldown(60)}
    }catch(_e){setTicketStatus('error');setCooldown(60)}
  };

  if(gate==='checking'){
    return(<div className="pinGateBackdrop fixed inset-0 z-50 flex flex-col items-center justify-center gap-4">
      <span className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/>
      <p className="pinGateBody text-xs">確認中…</p>
    </div>);
  }
  if(gate==='setup'){
    return(<div className="pinGateBackdrop fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 p-6" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="flex flex-col items-center gap-6">
        <p className="pinGateTitle text-base font-bold text-center">{setupStep===1?(t.noticePwdSetupTitle||'設定4位數密碼'):(t.lockPwdConfirm||'再輸入一次確認')}</p>
        {setupStep===1&&<p className="pinGateBody text-xs text-center max-w-xs -mt-3">{type==='basic'?t.infoPwdSetupBasicBody:t.infoPwdSetupStoreBody}</p>}
        <PinDots length={setupPwd.length}/>
        {setupErr&&<p className="text-xs text-red-400 text-center">{setupErr}</p>}
        <PinKeypad onDigit={pressSetupDigit} onBackspace={()=>setSetupPwd(v=>v.slice(0,-1))}/>
        <button onClick={onClose} className="pinGateBody text-xs">✕ 取消</button>
      </div>
    </div>);
  }
  if(gate==='locked'){
    return(<div className="pinGateBackdrop fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 p-6" onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} className="flex flex-col items-center gap-6">
        <p className="pinGateTitle text-base font-bold text-center">{t.noticePwdLockedTitle||'請輸入密碼'}</p>
        <p className="pinGateBody text-xs text-center max-w-xs -mt-3">{verifyMode?'請輸入你原本設定的密碼':(type==='basic'?t.infoPwdLockedBasicBody:t.infoPwdLockedStoreBody)}</p>
        <div className={unlockShake?'text-red-500':''}><PinDots length={unlockInput.length}/></div>
        {unlockBusy&&<span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/>}
        {unlockErr&&<p className="text-xs text-red-400 text-center">{unlockErr}</p>}
        <PinKeypad onDigit={pressUnlockDigit} onBackspace={()=>setUnlockInput(v=>v.slice(0,-1))}/>
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="pinGateBody text-xs">✕ 取消</button>
          <button onClick={()=>setShowForgotPwd(true)} className="pinGateBody text-xs underline">忘記密碼</button>
        </div>
      </div>
      {showForgotPwd&&<ForgotPwdModal settings={settings} onClose={()=>setShowForgotPwd(false)} onSuccess={(newPwd)=>{
        const updated={...settings,lockPwd:newPwd};
        if(onUpdateSettings)onUpdateSettings(updated);
        try{LS.set('app-settings',updated)}catch(_e){}
        setTimeout(()=>{setShowForgotPwd(false);setGate('none')},1000);
      }}/>}
    </div>);
  }

  if(type==='store'&&keyCheck==='invalid'){
    return(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}><div className="bg-gray-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl" onClick={e=>e.stopPropagation()}>
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between"><h3 className="text-base font-bold text-gray-100">{t.keyInvalidMsg||'憑證已失效'}</h3><button onClick={onClose} className="text-gray-500 text-sm">✕</button></div>
      <div className="p-4"><p className="text-sm text-gray-400 text-center">{t.keyExpiredMsg}</p></div>
    </div></div>);
  }

  if(mode==='ticket'){
    return(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}><div className="bg-gray-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-gray-900"><h3 className="text-base font-bold text-gray-100">{type==='basic'?t.ticketTypeB:t.ticketTypeS}</h3><button onClick={onClose} className="text-gray-500 text-sm">✕</button></div>
      <div className="p-4 space-y-4">
        <div className="bg-white/[0.03] rounded-xl p-4 text-center"><p className="text-[11px] text-gray-500 mb-1">{t.ticketInfoTeacher}</p><p className="text-2xl font-bold text-gray-100 mb-3">{code}</p><p className="text-[11px] text-gray-500 mb-1">{t.ticketCode}</p><p className="text-base font-semibold text-amber-400 font-mono tracking-widest select-all">{ticketSeq}</p></div>
        <button onClick={()=>{const base=location.origin+location.pathname.replace(/index\.html$/,'')+'auth.html';const link=buildReqLink(base,ticketSeq);const prefixKey=type==='basic'?'lineTicketBasicPrefix':'lineTicketStorePrefix';const zhMsg=(T.zh[prefixKey]||'').replace('{code}',code);const isVi=ticketSeq&&ticketSeq[1]==='2';const viMsg=isVi?(T.vi[prefixKey]||'').replace('{code}',code):'';sendTicketFlex('📝 審核通知',zhMsg,link,viMsg)}} className="w-full px-3 py-4 rounded-xl text-base font-bold bg-[#06C755] text-white active:bg-[#05b34c]">{t.ticketSend}</button>
        <button onClick={checkTicket} disabled={cooldown>0||ticketStatus==='checking'} className={`w-full py-3.5 rounded-xl font-bold transition-all ${cooldown>0||ticketStatus==='checking'?'bg-white/[0.06] text-gray-600 cursor-not-allowed':'bg-amber-600 text-white'}`}>{ticketStatus==='checking'?t.ticketChecking:cooldown>0?fmtLog(t.ticketWaitCountdown,[String(cooldown)]):t.ticketCheckBtn}</button>
        {ticketStatus==='pending'&&<p className="text-xs text-gray-500 text-center">{t.ticketPending}</p>}
        {ticketStatus==='approved'&&<p className="text-xs text-emerald-400 text-center font-semibold">{t.ticketApproved}</p>}
        {ticketStatus==='error'&&<p className="text-xs text-red-400 text-center">{t.pwdLoginFail}</p>}
        {ticketStatus==='rejected'&&(<div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 space-y-2"><p className="text-xs text-red-400 font-semibold text-center">{t.ticketRejected}</p>{rejectReason&&<p className="text-xs text-gray-400 text-center">{t.ticketRejectedReason}：{rejectReason}</p>}<button onClick={backToEditAfterReject} className="w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold">{t.reeditBtn}</button></div>)}
        <div className="pt-3 border-t border-white/[0.06]"><p className="text-xs text-gray-500 mb-2">{t.infoChangedTitle}</p><div className="space-y-1.5">{changedList.map(c=>(<div key={c.key} className="flex justify-between gap-3 text-sm"><span className="text-gray-500">{c.label}</span><span className="text-gray-200 text-right">{c.val}</span></div>))}</div></div>
      </div>
    </div></div>);
  }

  const isEdit=mode==='edit';
  return(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}><div className="bg-gray-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
    <div className="p-4 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-gray-900"><h3 className="text-base font-bold text-gray-100">{titleText}</h3><button onClick={onClose} className="text-gray-500 text-sm">✕</button></div>
    {type==='basic'&&keyCheck==='invalid'&&<div className="mx-4 mt-3 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"><p className="text-xs text-red-400 text-center">{t.keyInvalidEditMsg}</p></div>}
    <div className="p-4 space-y-3">
      {layoutKeys.map(k=>{
        if(k==='__divider_foreign__'){
          return <div key={k} className="flex items-center gap-3 py-1"><div className="flex-1 h-px bg-white/[0.08]"></div><span className="text-xs text-gray-500">外籍員工</span><div className="flex-1 h-px bg-white/[0.08]"></div></div>;
        }
        const label=infoFieldLabel(k,t);
        if(!isEdit){
          let v=settings[k]||'';
          if(k==='skills'){const sk=settings.skills||{};v=SKILL_KEYS.filter(s=>sk[s]).map(s=>t[s]||s).join('、')}
          else if(k==='preg'||k==='oil'){v=settings[k]==='yes'?(t.accept||'接'):settings[k]==='no'?(t.reject||'不接'):''}
          return <div key={k} className="flex justify-between items-start gap-3"><span className="text-xs text-gray-500 flex-shrink-0">{label}</span><span className="text-sm text-gray-200 text-right">{v||'—'}</span></div>;
        }
        if(k==='gender'){
          return(<div key={k}><label className="text-xs text-gray-500 block mb-1">{label}</label><div className="grid grid-cols-2 gap-2">{[['M',t.genderM],['F',t.genderF]].map(([g,l])=>(<button key={g} onClick={()=>setForm(f=>({...f,gender:g}))} className={`py-2 rounded-lg text-sm font-semibold ${form.gender===g?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-400'}`}>{l}</button>))}</div></div>);
        }
        if(k==='gloveSize'){
          return(<div key={k}><label className="text-xs text-gray-500 block mb-1">{label}</label><div className="grid grid-cols-5 gap-1.5">{['XS','S','M','L','XL'].map(g=>(<button key={g} onClick={()=>setForm(f=>({...f,gloveSize:g}))} className={`py-2 rounded-lg text-xs font-semibold ${form.gloveSize===g?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-400'}`}>{g}</button>))}</div></div>);
        }
        if(k==='preg'||k==='oil'){
          return(<div key={k}><label className="text-xs text-gray-500 block mb-1">{label}</label><div className="grid grid-cols-2 gap-2">{[['yes',t.accept||'接'],['no',t.reject||'不接']].map(([v,l])=>(<button key={v} onClick={()=>setForm(f=>({...f,[k]:v}))} className={`py-2 rounded-lg text-sm font-semibold ${form[k]===v?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-400'}`}>{l}</button>))}</div></div>);
        }
        if(k==='skills'){
          const skillsObj=form.skills||{};
          return(<div key={k}><label className="text-xs text-gray-500 block mb-1">{label}</label><div className="grid grid-cols-3 gap-2">{SKILL_KEYS.map((sk,i)=>(<button key={sk} onClick={()=>setForm(f=>({...f,skills:{...(f.skills||{}),[sk]:!(f.skills||{})[sk]}}))} className={`py-2 rounded-lg text-xs font-semibold ${skillsObj[sk]?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-400'}`}>{t[sk]||sk}</button>))}</div></div>);
        }
        if(k==='unitPrice'){
          return(<div key={k}><label className="text-xs text-gray-500 block mb-1">{label}</label><input value={form.unitPrice} onChange={e=>setForm(f=>({...f,unitPrice:e.target.value.replace(/\D/g,'')}))} inputMode="numeric" className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/></div>);
        }
        if(k==='shift'){
          return(<div key={k}><label className="text-xs text-gray-500 block mb-1">{label}</label><div className="grid grid-cols-2 gap-2">{[['day',t.shiftDay],['night',t.shiftNight]].map(([sv,l])=>(<button key={sv} onClick={()=>setForm(f=>({...f,shift:sv}))} className={`py-2 rounded-lg text-sm font-semibold ${form.shift===sv?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-400'}`}>{l}</button>))}</div></div>);
        }
        if(k==='workStart'||k==='workEnd'){
          return(<div key={k}><label className="text-xs text-gray-500 block mb-1">{label}</label><select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-2 text-sm text-gray-200 focus:outline-none appearance-none">{TIME_OPTS.map(o=><option key={o} value={o}>{o}</option>)}</select></div>);
        }
        if(k==='storeSel'){
          return(<div key={k}><label className="text-xs text-gray-500 block mb-1">{label}</label><select value={form.storeSel} onChange={e=>setForm(f=>({...f,storeSel:e.target.value}))} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-2 text-sm text-gray-200 focus:outline-none appearance-none"><option value="">-</option>{stores.map(s=><option key={s} value={s}>{s}</option>)}</select></div>);
        }
        if(k==='addrCity'){
          return(<div key={k}><label className="text-xs text-gray-500 block mb-1">{label}</label><select value={form.addrCity} onChange={e=>setForm(f=>({...f,addrCity:e.target.value,addrDist:''}))} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-2 text-sm text-gray-200 focus:outline-none appearance-none"><option value="">-</option>{CITY_OPTIONS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>);
        }
        if(k==='addrDist'){
          const opts=TW_REGIONS[form.addrCity]||[];
          return(<div key={k}><label className="text-xs text-gray-500 block mb-1">{label}</label><select value={form.addrDist} onChange={e=>setForm(f=>({...f,addrDist:e.target.value}))} disabled={!form.addrCity} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-2 text-sm text-gray-200 focus:outline-none appearance-none disabled:opacity-40"><option value="">-</option>{opts.map(d=><option key={d} value={d}>{d}</option>)}</select></div>);
        }
        if(k==='permitDate'||k==='permitExpiry'){
          return(<div key={k}><label className="text-xs text-gray-500 block mb-1">{label}</label><input type="date" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/></div>);
        }
        return(<div key={k}><label className="text-xs text-gray-500 block mb-1">{label}</label><input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/></div>);
      })}
      {err&&<p className="text-xs text-red-400 text-center">{err}</p>}
      <div className="pt-2 flex gap-2">
        {!isEdit?(<>
          {type==='store'&&<button onClick={()=>{setShowLeave(true);setLeaveDone(false);setLeaveErr('')}} className="px-4 py-3 rounded-xl bg-white/[0.06] text-gray-400 text-sm font-semibold">{t.leaveBtn}</button>}
          <button onClick={startEdit} className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-bold">{t.infoEditBtn}</button>
        </>):(<>
          <button onClick={cancelEdit} className="flex-1 py-3 rounded-xl bg-white/[0.06] text-gray-400 font-semibold">{t.infoCancelBtn}</button>
          <button onClick={submitEdit} disabled={busy} className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2">{busy&&<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}{busy?'':t.infoSubmitBtn}</button>
        </>)}
      </div>
      {showLeave&&(<div className="fixed inset-0 z-[60] bg-black/80 flex items-end sm:items-center justify-center" onClick={()=>!leaveBusy&&setShowLeave(false)}><div className="bg-gray-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl" onClick={e=>e.stopPropagation()}>
        <div className="p-4 border-b border-white/[0.06]"><h3 className="text-base font-bold text-gray-100">{t.leaveConfirmTitle}</h3></div>
        <div className="p-4 space-y-3">
          {!leaveDone?(<>
            <p className="text-sm text-gray-400">{t.leaveConfirmMsg}</p>
            {leaveErr&&<p className="text-xs text-red-400 text-center">{leaveErr}</p>}
            <div className="flex gap-2"><button onClick={()=>setShowLeave(false)} disabled={leaveBusy} className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-gray-400 font-semibold">{t.infoCancelBtn}</button><button onClick={doLeave} disabled={leaveBusy} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold disabled:opacity-50">{leaveBusy?'…':t.leaveConfirmBtn}</button></div>
          </>):(<p className="text-sm text-emerald-500 text-center font-semibold">✓ {t.leaveOk}</p>)}
        </div>
      </div></div>)}
    </div>
  </div></div>);
}

function fmtCountdown(deadline){
  if(!deadline)return '-';
  const diff=new Date(deadline).getTime()-Date.now();
  if(diff<=0)return '已截止';
  const days=Math.floor(diff/86400000);
  const hours=Math.floor((diff%86400000)/3600000);
  const mins=Math.floor((diff%3600000)/60000);
  if(days>0)return days+'天'+hours+'時';
  if(hours>0)return hours+'時'+mins+'分';
  return mins+'分';
}
const Spinner=({size})=>(<svg className="animate-spin" width={size||14} height={size||14} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>);
function GroupBuyModal({t,settings,onClose}){
  const code=settings.code;
  const[tab,setTab]=useState('list'); // list/mine/created
  const[list,setList]=useState(null);
  const[mine,setMine]=useState(null);
  const[busy,setBusy]=useState('');
  const[regBuy,setRegBuy]=useState(null); // 正在填寫登記表單(尺寸/數量)的團購
  const[regSize,setRegSize]=useState(settings.gloveSize||'M');const[regQty,setRegQty]=useState('1');
  const[showCreate,setShowCreate]=useState(false);
  const[newItem,setNewItem]=useState('glove');const[newCustomItem,setNewCustomItem]=useState('');
  const[newAmount,setNewAmount]=useState('');const[newDeadline,setNewDeadline]=useState('');const[newScope,setNewScope]=useState('');
  const[createBusy,setCreateBusy]=useState(false);const[createErr,setCreateErr]=useState('');
  const[detailBuy,setDetailBuy]=useState(null);const[detail,setDetail]=useState(null);
  const[listErr,setListErr]=useState('');
  const[showEnded,setShowEnded]=useState(false);
  const loadList=()=>{gasListGroupBuys().then(r=>{if(r&&r.ok){setList(r.list||[]);setListErr('');(r.list||[]).filter(g=>g.status==='open').forEach(g=>{try{gasLogGroupBuyOpen(g.id,code)}catch(_e){}})}else{setList([]);setListErr((r&&r.error)||'讀取失敗')}}).catch(e=>{setList([]);setListErr(String(e))})};
  const loadMine=()=>{gasMyGroupBuyOrders(code).then(r=>{if(r&&r.ok)setMine(r.list||[]);else setMine([])}).catch(()=>setMine([]))};
  useEffect(()=>{loadList();loadMine()},[]);
  const joinedIds=useMemo(()=>new Set((mine||[]).filter(o=>o.response!=='decline').map(o=>o.buyId)),[mine]);
  const declinedIds=useMemo(()=>new Set((mine||[]).filter(o=>o.response==='decline').map(o=>o.buyId)),[mine]);
  const startRegister=(g)=>{setRegBuy(g);setRegSize(settings.gloveSize||'M');setRegQty('1')};
  const confirmRegister=async()=>{
    if(!regBuy)return;
    setBusy(regBuy.id);
    try{await gasJoinGroupBuy(regBuy.id,code,regBuy.item==='glove'?regSize:'',parseInt(regQty,10)||1);}catch(_e){}
    setBusy('');setRegBuy(null);loadList();loadMine();
  };
  const doDecline=async(g)=>{
    setBusy(g.id);
    try{await gasDeclineGroupBuy(g.id,code);}catch(_e){}
    setBusy('');loadList();loadMine();
  };
  const doCreate=async()=>{
    const item=newItem==='custom'?newCustomItem.trim():'glove';
    if(newItem==='custom'&&!item){setCreateErr(t.groupBuyCustomItemPh);return}
    if(!newAmount.trim()){setCreateErr(t.groupBuyAmountLabel);return}
    setCreateErr('');setCreateBusy(true);
    try{
      const r=await gasCreateGroupBuy(code,'',item,newAmount,newDeadline,newScope);
      if(r&&r.ok){setShowCreate(false);setNewCustomItem('');setNewAmount('');setNewDeadline('');loadList()}
      else{setCreateErr((r&&r.error)||'送出失敗')}
    }catch(e){setCreateErr(String(e))}
    setCreateBusy(false);
  };
  const openDetail=(g)=>{setDetailBuy(g);setDetail(null);gasGroupBuyDetail(g.id).then(r=>{if(r&&r.ok)setDetail(r)})};
  const[statusBusy,setStatusBusy]=useState('');
  const toggleOrderStatus=async(field)=>{
    if(!detailBuy||statusBusy)return;
    setStatusBusy(field);
    try{await gasSetGroupBuyOrderStatus(detailBuy.id,code,field)}catch(_e){}
    setStatusBusy('');
    gasGroupBuyDetail(detailBuy.id).then(r=>{if(r&&r.ok)setDetail(r)});
  };
  const doClose=async(g)=>{
    setBusy(g.id);
    try{await gasCloseGroupBuy(g.id,code);}catch(_e){}
    setBusy('');setDetailBuy(null);loadList();
  };
  const isCreator=detailBuy&&detailBuy.creator===code;
  const created=useMemo(()=>(list||[]).filter(g=>g.creator===code),[list,code]);
  return(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}><div className="bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
    <div className="p-4 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-gray-900"><h3 className="text-base font-bold text-gray-100">{t.groupBuyTitle}</h3><div className="flex items-center gap-2">{!detailBuy&&<button onClick={()=>setShowCreate(v=>!v)} className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-600 text-white font-semibold">+ {t.groupBuyCreateBtn}</button>}<button onClick={onClose} className="text-gray-500 text-sm">✕</button></div></div>

    {detailBuy?(<div className="p-4 space-y-3">
      <button onClick={()=>setDetailBuy(null)} className="text-xs text-gray-500">← {t.backToChoice||'返回'}</button>
      <p className="text-sm text-gray-200 font-medium">{detailBuy.title}（由{detailBuy.creator}發起）</p>
      <p className="text-xs text-gray-500">{t.groupBuyAmountLabel}：{detailBuy.amount}｜{fmtCountdown(detailBuy.deadline)}{detailBuy.status!=='open'?'・'+t.groupBuyClosedTag:''}</p>
      {detail===null?<p className="text-xs text-gray-600 text-center py-4">{t.loading||'載入中…'}</p>:(<>
        {isCreator?(<>
          <p className="text-sm text-amber-400 font-semibold">{fmtLog(t.groupBuyCreatedCount,[String(detail.joined.length)])}</p>
          {detailBuy.item==='glove'?(()=>{
            const bySize={};detail.joined.forEach(o=>{const s=o.size||'-';if(!bySize[s])bySize[s]=[];bySize[s].push(o.code)});
            return Object.keys(bySize).sort().map(s=>(<p key={s} className="text-xs text-gray-400">{fmtLog(t.groupBuySizeGroup,[s,String(bySize[s].length),bySize[s].join('、')])}</p>));
          })():(<div className="flex flex-wrap gap-1.5">{detail.joined.map((o,i)=>(<span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-300">{o.code}{o.qty>1?'×'+o.qty:''}</span>))}</div>)}
          <div><p className="text-xs text-gray-500 mb-1.5 mt-2">{t.groupBuyViewDeclined}（{detail.declined.length}）</p><div className="flex flex-wrap gap-1.5">{detail.declined.map((o,i)=>(<span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-500">{o.code}</span>))}</div></div>
          <div><p className="text-xs text-gray-500 mb-1.5">{t.groupBuyViewOpens}（{detail.opens.length}）</p><div className="flex flex-wrap gap-1.5">{detail.opens.map((o,i)=>(<span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-500">{o.code}</span>))}</div></div>
          {detailBuy.status==='open'&&<button onClick={()=>doClose(detailBuy)} disabled={busy===detailBuy.id} className="w-full py-2.5 rounded-xl bg-red-600/20 text-red-400 text-sm font-semibold disabled:opacity-50">{busy===detailBuy.id?'…':t.groupBuyCloseBtn}</button>}
        </>):(<>
          <div><p className="text-xs text-gray-500 mb-1.5">{t.groupBuyViewJoined}（{detail.joined.length}）</p><div className="flex flex-wrap gap-1.5">{detail.joined.map((o,i)=>(<span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-300">{o.code}{o.size?'('+o.size+')':''}</span>))}</div></div>
          {(()=>{const mine=detail.joined.find(o=>o.code===code);if(!mine)return null;return(<div className="flex gap-2 pt-2 border-t border-white/[0.06]">
            <button onClick={()=>toggleOrderStatus('paid')} disabled={statusBusy==='paid'} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 ${mine.paid?'bg-emerald-600/20 text-emerald-400':'bg-white/[0.06] text-gray-400'}`}>{statusBusy==='paid'&&<Spinner size={11}/>}{mine.paid?'✓ ':''}{t.groupBuyPaidBtn||'已交錢'}</button>
            <button onClick={()=>toggleOrderStatus('arrived')} disabled={statusBusy==='arrived'} className={`flex-1 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 ${mine.arrived?'bg-emerald-600/20 text-emerald-400':'bg-white/[0.06] text-gray-400'}`}>{statusBusy==='arrived'&&<Spinner size={11}/>}{mine.arrived?'✓ ':''}{t.groupBuyArrivedBtn||'已到貨'}</button>
          </div>);})()}
        </>)}
      </>)}
    </div>):(<>
    <div className="flex gap-2 p-3 pb-0"><button onClick={()=>setTab('list')} className={`flex-1 py-2 rounded-lg text-xs font-semibold ${tab==='list'?'bg-amber-600 text-white':'bg-white/[0.05] text-gray-400'}`}>{t.groupBuyTabList}</button><button onClick={()=>setTab('mine')} className={`flex-1 py-2 rounded-lg text-xs font-semibold ${tab==='mine'?'bg-amber-600 text-white':'bg-white/[0.05] text-gray-400'}`}>{t.groupBuyTabMine}</button><button onClick={()=>setTab('created')} className={`flex-1 py-2 rounded-lg text-xs font-semibold ${tab==='created'?'bg-amber-600 text-white':'bg-white/[0.05] text-gray-400'}`}>{t.groupBuyTabCreated}</button></div>
    <div className="p-4 space-y-3">
      {tab==='list'&&(<>
        {showCreate&&(<div className="bg-white/[0.03] rounded-xl p-3 space-y-2.5">
          <div><label className="text-xs text-gray-500 block mb-1">{t.groupBuyItemLabel}</label><div className="grid grid-cols-2 gap-2"><button onClick={()=>setNewItem('glove')} className={`py-2 rounded-lg text-sm font-semibold ${newItem==='glove'?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-400'}`}>{t.groupBuyItemGlove}</button><button onClick={()=>setNewItem('custom')} className={`py-2 rounded-lg text-sm font-semibold ${newItem==='custom'?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-400'}`}>{t.groupBuyItemCustom}</button></div></div>
          {newItem==='custom'&&<input value={newCustomItem} onChange={e=>setNewCustomItem(e.target.value)} placeholder={t.groupBuyCustomItemPh} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-100"/>}
          <div><label className="text-xs text-gray-500 block mb-1">{t.groupBuyAmountLabel}</label><input value={newAmount} onChange={e=>setNewAmount(e.target.value.replace(/[^\d]/g,''))} inputMode="numeric" placeholder={t.groupBuyAmountPh} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-100"/></div>
          <div><label className="text-xs text-gray-500 block mb-1">{t.groupBuyDeadlineLabel}</label><input type="datetime-local" value={newDeadline} onChange={e=>setNewDeadline(e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-100"/><p className="text-[10px] text-gray-600 mt-1">{t.groupBuyDeadline24hHint}</p></div>
          <div><label className="text-xs text-gray-500 block mb-1">{t.groupBuyScopeLabel}</label><div className="grid grid-cols-2 gap-2"><button onClick={()=>setNewScope('store')} className={`py-2 rounded-lg text-xs font-semibold ${newScope==='store'?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-400'}`}>{t.groupBuyScopeStore}</button><button onClick={()=>setNewScope('all')} className={`py-2 rounded-lg text-xs font-semibold ${newScope==='all'?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-400'}`}>{t.groupBuyScopeAll}</button></div></div>
          {createErr&&<p className="text-xs text-red-400 text-center">{createErr}</p>}
          <button onClick={doCreate} disabled={createBusy} className="w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold disabled:opacity-50">{createBusy?'…':t.groupBuyCreateBtn}</button>
        </div>)}
        {listErr&&<p className="text-xs text-red-400 text-center">{listErr}</p>}
        {list===null?<p className="text-xs text-gray-600 text-center py-4">{t.loading||'載入中…'}</p>:(<>
        {list.filter(g=>g.status==='open').length===0?<p className="text-xs text-gray-600 text-center py-4">{t.groupBuyEmpty}</p>:list.filter(g=>g.status==='open').map(g=>(
          <div key={g.id} className="bg-white/[0.03] rounded-xl p-3 space-y-2">
            <div onClick={()=>openDetail(g)} className="flex items-center justify-between gap-2 cursor-pointer"><p className="text-sm text-gray-200 font-medium flex items-center gap-1.5"><span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-mono flex-shrink-0">{g.id}</span>{g.title}（由{g.creator}發起）</p><span className="text-xs text-amber-400 font-semibold flex-shrink-0">{fmtCountdown(g.deadline)}</span></div>
            <p className="text-[11px] text-gray-500">{t.groupBuyAmountLabel}：{g.amount}｜{g.orderCount}{t.groupBuyOrderCount}{g.declineCount?('｜'+t.groupBuyDeclineCountLabel+'：'+g.declineCount+'人'):''}</p>
            {regBuy&&regBuy.id===g.id?(<div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 space-y-2">
              {g.item==='glove'&&<div><label className="text-[11px] text-gray-500 block mb-1">{t.gloveSize}</label><div className="grid grid-cols-5 gap-1">{['XS','S','M','L','XL'].map(sz=>(<button key={sz} onClick={()=>setRegSize(sz)} className={`py-1.5 rounded text-[11px] font-semibold ${regSize===sz?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-400'}`}>{sz}</button>))}</div></div>}
              <div><label className="text-[11px] text-gray-500 block mb-1">{t.groupBuyQtyLabel}</label><input value={regQty} onChange={e=>setRegQty(e.target.value.replace(/[^\d]/g,'')||'1')} inputMode="numeric" className="w-20 bg-white/[0.06] border border-white/[0.08] rounded px-2 py-1.5 text-sm text-gray-100 text-center"/></div>
              <div className="flex gap-2"><button onClick={()=>setRegBuy(null)} className="flex-1 py-2 rounded-lg bg-white/[0.06] text-gray-400 text-xs font-semibold">{t.infoCancelBtn}</button><button onClick={confirmRegister} disabled={busy===g.id} className="flex-1 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5">{busy===g.id&&<Spinner size={11}/>}{t.groupBuyConfirmBtn}</button></div>
            </div>):(
              <div className="flex gap-2"><button onClick={()=>startRegister(g)} disabled={busy===g.id||joinedIds.has(g.id)||declinedIds.has(g.id)} className={`flex-1 py-2 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 ${joinedIds.has(g.id)?'bg-white/[0.06] text-gray-500':'bg-amber-600 text-white'}`}>{busy===g.id&&<Spinner size={11}/>}{joinedIds.has(g.id)?(t.groupBuyJoinOk||'已登記'):t.groupBuyJoinBtn}</button><button onClick={()=>doDecline(g)} disabled={busy===g.id||joinedIds.has(g.id)||declinedIds.has(g.id)} className={`flex-1 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 ${declinedIds.has(g.id)?'bg-white/[0.03] text-gray-600':'bg-white/[0.06] text-gray-400'}`}>{busy===g.id&&<Spinner size={11}/>}{declinedIds.has(g.id)?(t.groupBuyDeclinedOk||'已標記不需要'):t.groupBuyDeclineBtn}</button></div>
            )}
          </div>
        ))}
        {(()=>{const ended=list.filter(g=>g.status!=='open');return ended.length>0&&(<div className="pt-2 border-t border-white/[0.06]">
          <button onClick={()=>setShowEnded(v=>!v)} className="text-xs text-gray-500 flex items-center gap-1">{t.groupBuyEndedTitle||'已結束'}（{ended.length}）{showEnded?'▲':'▼'}</button>
          {showEnded&&ended.map(g=>(<div key={g.id} onClick={()=>openDetail(g)} className="bg-white/[0.02] rounded-lg px-3 py-2 mt-2 cursor-pointer"><p className="text-xs text-gray-500 flex items-center gap-1.5"><span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-gray-500 font-mono flex-shrink-0">{g.id}</span>{g.title}（由{g.creator}發起）</p></div>))}
        </div>);})()}
        </>)}
      </>)}
      {tab==='mine'&&(mine===null?<p className="text-xs text-gray-600 text-center py-4">{t.loading||'載入中…'}</p>:(mine.filter(o=>o.response!=='decline').length===0)?<p className="text-xs text-gray-600 text-center py-4">{t.groupBuyMineEmpty}</p>:mine.filter(o=>o.response!=='decline').map((o,i)=>(
        <div key={i} onClick={()=>openDetail({id:o.buyId,title:o.title,creator:o.creator,amount:o.amount,item:o.size?'glove':'',deadline:o.deadline,status:o.status})} className="bg-white/[0.03] rounded-xl p-3 flex items-center justify-between cursor-pointer active:bg-white/[0.05]"><p className="text-sm text-gray-200">{o.title}（{o.creator}發起）</p><span className="text-xs text-amber-400 font-semibold flex-shrink-0">{o.size?(t.gloveSize+' '+o.size+' '):''}{t.groupBuyQtyLabel}{o.qty}{o.amount?('　'+t.groupBuyAmountLabel+o.amount):''}</span></div>
      )))}
      {tab==='created'&&(created.length===0?<p className="text-xs text-gray-600 text-center py-4">{t.groupBuyMineCreatedEmpty}</p>:(<>
        {created.map(g=>{const amt=parseFloat(g.amount)||0;const sub=amt*(g.orderCount||0);return(
          <div key={g.id} onClick={()=>openDetail(g)} className="bg-white/[0.03] rounded-xl p-3 flex items-center justify-between cursor-pointer"><p className="text-sm text-gray-200">{g.title}</p><div className="text-right flex-shrink-0"><p className="text-xs text-gray-500">{fmtLog(t.groupBuyCreatedCount,[String(g.orderCount)])}</p>{sub>0&&<p className="text-xs text-amber-400 font-semibold">{g.orderCount}×{amt}＝{sub.toLocaleString()}</p>}</div></div>
        );})}
        {(()=>{const total=created.reduce((s,g)=>s+(parseFloat(g.amount)||0)*(g.orderCount||0),0);return total>0&&(<div className="flex items-center justify-between pt-2 border-t border-white/[0.08]"><span className="text-sm text-gray-400 font-semibold">{t.groupBuySubtotalLabel||'小計'}</span><span className="text-base text-amber-400 font-bold">{total.toLocaleString()}</span></div>);})()}
      </>))}
    </div>
    </>)}
  </div></div>);
}
function DisasterReportModal({t,settings,onClose,onSaved}){
  const code=settings.code;
  const today=new Date().toISOString().slice(0,10);
  const[survey,setSurvey]=useState(undefined); // undefined=查詢中,null=沒有進行中的
  const[statuses,setStatuses]=useState([]);
  const[otherText,setOtherText]=useState('');
  const[city,setCity]=useState(settings.addrCity||'');const[dist,setDist]=useState(settings.addrDist||'');
  const[busy,setBusy]=useState(false);const[err,setErr]=useState('');
  const[myReports,setMyReports]=useState(null);
  const[showForm,setShowForm]=useState(false); // true=顯示填寫表單,false=顯示回報記錄(有回報過時預設這個)
  const needAddr=!city||!dist;
  const statusLabel=(k)=>({safe:t.drSafe,cantLeave:t.drCantLeave,vehicleDamaged:t.drVehicleDamaged,sick:t.drSick}[k]||k);
  const fmtReportLine=(r)=>{
    const parts=(r.type?r.type.split(','):[]).map(statusLabel).filter(Boolean);
    if(r.otherText)parts.push(r.otherText);
    let dt=r.date;
    if(r.time){try{const d=new Date(r.time);dt=r.date+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}catch(_e){}}
    return dt+' '+parts.join('、');
  };
  const toggleStatus=(s)=>setStatuses(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s]);
  const loadMine=(surveyId)=>gasMyDisasterReports(surveyId,code).then(mr=>{if(mr&&mr.ok){setMyReports(mr.list||[]);setShowForm(!(mr.list&&mr.list.some(r=>r.date===today)))}}).catch(()=>{});
  useEffect(()=>{
    gasListDisasterSurveys().then(r=>{
      if(r&&r.ok&&Array.isArray(r.list)){
        const active=r.list.find(s=>!s.endDate);
        setSurvey(active||null);
        if(active)loadMine(active.id);else setShowForm(true);
      }else{setSurvey(null);setShowForm(true)}
    }).catch(()=>{setSurvey(null);setShowForm(true)});
  },[]);
  const submit=async()=>{
    if(needAddr||(statuses.length===0&&!otherText.trim())||!survey)return;
    setBusy(true);setErr('');
    try{
      const r=await gasSubmitDisasterReport({surveyId:survey.id,code,date:today,type:statuses.join(','),otherText,city,dist});
      if(r&&r.ok){
        if(onSaved)onSaved({addrCity:city,addrDist:dist});
        setStatuses([]);setOtherText('');
        loadMine(survey.id);
      }else{setErr((r&&r.error)||t.drSubmitFail)}
    }catch(e){setErr(t.drSubmitFail)}
    setBusy(false);
  };
  const todayReports=(myReports||[]).filter(r=>r.date===today);
  const isSupervisor=(()=>{try{const s=LS.get('supervisor-'+code);return !!(s&&s.status==='approved')}catch(_e){return false}})();
  const[showQuery,setShowQuery]=useState(false);
  const[queryDate,setQueryDate]=useState('');
  const[queryResult,setQueryResult]=useState(null);
  const dayOptions=useMemo(()=>{
    if(!survey||!survey.startDate)return[];
    const start=new Date(survey.startDate+'T00:00:00');const now=new Date();now.setHours(0,0,0,0);
    const days=Math.floor((now-start)/86400000)+1;
    const opts=[];
    for(let n=1;n<=Math.max(1,days);n++){
      const d=new Date(start.getTime()+(n-1)*86400000);
      const p=x=>String(x).padStart(2,'0');
      opts.push({n:n,date:d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())});
    }
    return opts;
  },[survey]);
  const doQuery=async(date)=>{
    setQueryDate(date);setQueryResult(null);
    if(!date||!survey)return;
    const r=await gasDisasterDayStatus(survey.id,date);
    if(r&&r.ok)setQueryResult(r);
  };
  return(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}><div className="bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
    <div className="p-4 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-gray-900"><h3 className="text-base font-bold text-gray-100">{showForm?(survey?survey.name:t.drTitle):t.drReportRecordTitle}</h3><button onClick={onClose} className="text-gray-500 text-sm">✕</button></div>
    {survey===undefined?<p className="p-8 text-xs text-gray-600 text-center">{t.loading||'載入中…'}</p>:!survey?(
      <p className="p-8 text-sm text-gray-500 text-center">{t.drNoActiveSurvey}</p>
    ):!showForm?(<div className="p-4 space-y-4">
      {survey.message&&<p className="text-xs text-gray-400 bg-white/[0.03] rounded-lg p-2.5">{survey.message}</p>}
      <div className="space-y-2">
        <p className="text-xs text-gray-500">{t.drTodayReported}</p>
        {todayReports.map((r,i)=>(<p key={i} className="text-sm text-emerald-500 font-semibold">{fmtReportLine(r)}</p>))}
      </div>
      {myReports&&myReports.length>todayReports.length&&(<div className="space-y-2 pt-2 border-t border-white/[0.06]"><p className="text-xs text-gray-500">{t.drMyReportsTitle}</p>{myReports.filter(r=>r.date!==today).map((r,i)=>(<p key={i} className="text-xs text-gray-400">{fmtReportLine(r)}</p>))}</div>)}
      <button onClick={()=>setShowForm(true)} className="w-full py-3 rounded-xl bg-white/[0.06] text-amber-400 text-sm font-semibold">+ {t.drAddMoreBtn}</button>
    </div>):(
    <div className="p-4 space-y-4">
      {myReports&&myReports.length>0&&<button onClick={()=>setShowForm(false)} className="text-xs text-gray-500">← {t.drReportRecordTitle}</button>}
      <div className="flex justify-between text-sm"><span className="text-gray-500">{t.drDateLabel}</span><span className="text-gray-300">{today}</span></div>
      {needAddr&&(<div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-2"><p className="text-xs text-amber-400">{t.drNeedAddrHint}</p><div className="grid grid-cols-2 gap-2"><select value={city} onChange={e=>{setCity(e.target.value);setDist('')}} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-2 text-sm text-gray-200"><option value="">-</option>{CITY_OPTIONS.map(c=><option key={c} value={c}>{c}</option>)}</select><select value={dist} onChange={e=>setDist(e.target.value)} disabled={!city} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-2 text-sm text-gray-200 disabled:opacity-40"><option value="">-</option>{(TW_REGIONS[city]||[]).map(d=><option key={d} value={d}>{d}</option>)}</select></div></div>)}
      <div><label className="text-xs text-gray-500 block mb-1.5">{t.drStatusLabel}</label><div className="grid grid-cols-2 gap-2">{[['safe',t.drSafe],['cantLeave',t.drCantLeave],['vehicleDamaged',t.drVehicleDamaged],['sick',t.drSick]].map(([k,l])=>(<button key={k} onClick={()=>toggleStatus(k)} className={`py-2.5 rounded-xl text-sm font-semibold ${statuses.includes(k)?'bg-amber-600 text-white':'bg-white/[0.06] text-gray-400'}`}>{l}</button>))}</div>
        <div className="mt-2"><label className="text-[11px] text-gray-500 block mb-1">{t.drOtherLabel}</label><input value={otherText} onChange={e=>setOtherText(e.target.value)} placeholder={t.drOtherPh} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-100"/></div>
      </div>
      {err&&<p className="text-xs text-red-400 text-center">{err}</p>}
      <button onClick={submit} disabled={busy||needAddr||(statuses.length===0&&!otherText.trim())} className="w-full py-3 rounded-xl bg-red-600 text-white font-bold disabled:opacity-50">{busy?'…':t.drSubmitBtn}</button>
    </div>)}
    {survey&&isSupervisor&&(<div className="p-4 pt-0 space-y-2 border-t border-white/[0.06] mt-2">
      <button onClick={()=>setShowQuery(v=>!v)} className="w-full py-2.5 rounded-xl bg-white/[0.05] text-gray-400 text-sm font-semibold">{t.drQueryReportsBtn}</button>
      {showQuery&&(<div className="space-y-2">
        <select onChange={e=>doQuery(e.target.value)} defaultValue="" className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-gray-200"><option value="" disabled>{t.drSelectDayPh}</option>{dayOptions.map(o=>(<option key={o.n} value={o.date}>{'day'+o.n+': '+o.date}</option>))}</select>
        {queryResult&&(<div className="space-y-1.5"><p className="text-xs text-gray-500">{t.drDidReport}：{queryResult.did.length}｜{t.drNotReport}：{queryResult.notDid.length}</p>{queryResult.did.map(c=>{
          const rp=queryResult.reported[c];const parts=(rp.type?rp.type.split(','):[]).map(statusLabel).filter(Boolean);if(rp.otherText)parts.push(rp.otherText);
          let tm='';try{const d=new Date(rp.time);tm=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0');}catch(_e){}
          return(<div key={c} className="flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2"><span className="text-sm text-gray-200">{c} {parts.join('、')}</span><span className="text-xs text-gray-500 flex-shrink-0">{tm}</span></div>);
        })}</div>)}
      </div>)}
    </div>)}
  </div></div>);
}
function BreakTimerSection({settings}){
  const[status,setStatus]=useState(null); // null=載入中, {exists,isOpen,remainSeconds,reqId,...}
  const[busy,setBusy]=useState(false);
  const[tick,setTick]=useState(0); // 每秒觸發重新渲染,讓倒數畫面動起來
  const syncedAtRef=React.useRef(Date.now()); // 上次跟伺服器同步remainSeconds的本機時間點
  const FD_QUICK_URL='https://john7t.github.io/massage-pay/fd-quick.html';
  const load=async()=>{
    try{const r=await gasCall('breakGetStatus',{code:settings.code,workStart:settings.workStart||'',workEnd:settings.workEnd||''},10000);syncedAtRef.current=Date.now();if(r&&r.ok)setStatus(r);else setStatus({exists:false})}catch(_e){setStatus({exists:false})}
  };
  useEffect(()=>{load()},[]);
  useEffect(()=>{const iv=setInterval(()=>setTick(x=>x+1),1000);return()=>clearInterval(iv)},[]);
  useEffect(()=>{const iv=setInterval(load,30000);return()=>clearInterval(iv)},[]); // 每30秒跟伺服器對一次時間,避免本機計時漂移
  // 顯示用的剩餘秒數:上次同步的秒數,扣掉本機這段時間又過去的秒數,每次tick都會重算,畫面才會真的跳動
  const liveRemain=status&&status.isOpen?status.remainSeconds-Math.floor((Date.now()-syncedAtRef.current)/1000):null;
  const fmtSec=(s)=>{const neg=s<0;const a=Math.abs(s);return (neg?'-':'')+String(Math.floor(a/3600)).padStart(2,'0')+':'+String(Math.floor(a/60)%60).padStart(2,'0')+':'+String(a%60).padStart(2,'0')};
  const[actionErr,setActionErr]=useState('');
  const doFlipGreen=async()=>{
    setBusy(true);setActionErr('');
    try{
      const r=await gasCallPost('breakFlipGreen',{code:settings.code,store:settings.store||'',workStart:settings.workStart||'',workEnd:settings.workEnd||''},10000);
      if(r&&r.ok){await load()}else{setActionErr((r&&r.error)||'翻綠失敗，請稍後再試')}
    }catch(e){setActionErr('連線失敗：'+String(e))}
    setBusy(false);
  };
  const doFlipWhite=async()=>{
    if(!status||!status.reqId)return;
    setBusy(true);setActionErr('');
    try{
      const r=await gasCallPost('breakFlipWhite',{reqId:status.reqId},10000);
      if(r&&r.ok){await load()}else{setActionErr((r&&r.error)||'回牌失敗，請稍後再試')}
    }catch(e){setActionErr('連線失敗：'+String(e))}
    setBusy(false);
  };
  if(status===null)return(<div className="mt-5 pt-4 border-t border-white/[0.06] flex justify-center py-3"><span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/></div>);
  return(<div className="mt-5 pt-4 border-t border-white/[0.06] space-y-2">
    <p className="text-xs font-semibold text-emerald-400 px-1">翻綠（休息）計時</p>
    {actionErr&&<p className="text-xs text-red-400 text-center px-2">{actionErr}</p>}
    {!status.isOpen?(<>
      <button onClick={doFlipGreen} disabled={busy} className="w-full py-3 rounded-xl bg-white text-gray-900 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 border border-white/20">{busy&&<span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"/>}⚪ 翻綠（開始休息）</button>
      {status.exists&&status.usedSeconds>0&&<p className="text-[11px] text-gray-500 text-center">今天已累計使用 {fmtSec(status.usedSeconds)}／01:00:00</p>}
    </>):(<>
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
        <p className="text-[11px] text-gray-500 mb-1">剩餘休息時間</p>
        <p className={`text-3xl font-bold tabular-nums ${liveRemain<0?'text-red-400':'text-emerald-400'}`}>{fmtSec(liveRemain)}</p>
        {liveRemain<0&&<p className="text-[11px] text-red-400 mt-1">已超過1小時額度</p>}
      </div>
      <button onClick={doFlipWhite} disabled={busy} className="w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2">{busy&&<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>}🟢 回牌（結束休息）</button>
    </>)}
  </div>);
}

function SupervisorSection(){
  const[phase,setPhase]=useState('locked'); // locked/checking/denied/granted
  const[errMsg,setErrMsg]=useState('');
  const SUP_LIFF_ID='2010673151-AU7Cpo5v'; // 借用employees.html的LIFF App做登入驗證,指定redirectUri導回本頁,不會跳去employees頁面
  const doCheck=async()=>{
    setPhase('checking');setErrMsg('');
    try{
      if(typeof liff==='undefined'){setErrMsg('LINE 元件載入失敗，請檢查網路');setPhase('locked');return}
      await liff.init({liffId:SUP_LIFF_ID});
      if(!liff.isLoggedIn()){liff.login({redirectUri:location.href});return}
      const profile=await liff.getProfile();
      const res=await fetch('./supervisors.cfg',{cache:'no-store'});
      const text=res.ok?(await res.text()):'';
      const lines=text.split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));
      const found=lines.some(l=>l.split(':')[0]===profile.userId);
      setPhase(found?'granted':'denied');
    }catch(e){setErrMsg(String((e&&e.message)||e));setPhase('locked')}
  };
  if(phase==='locked')return(<div className="mt-5 pt-4 border-t border-white/[0.06]">
    <button onClick={doCheck} className="w-full py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-gray-500 text-xs font-medium active:bg-white/[0.06]">🔒 主管專用區塊（點擊驗證身分）</button>
    {errMsg&&<p className="text-[11px] text-red-400 text-center mt-1.5">{errMsg}</p>}
  </div>);
  if(phase==='checking')return(<div className="mt-5 pt-4 border-t border-white/[0.06] flex justify-center py-3"><span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"/></div>);
  if(phase==='denied')return(<div className="mt-5 pt-4 border-t border-white/[0.06]"><p className="text-xs text-gray-500 text-center py-3">您目前不是主管身分</p></div>);
  return(<div className="mt-5 pt-4 border-t border-white/[0.06] space-y-2">
    <p className="text-xs font-semibold text-purple-400 px-1">主管專用</p>
    <div className="grid grid-cols-3 gap-3">
      <a href="https://liff.line.me/2010673151-AU7Cpo5v" className="flex flex-col items-center gap-1"><span className="w-11 h-11 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg">👥</span><span className="text-[10px] text-gray-500">員工管理</span></a>
      <a href="https://liff.line.me/2010673151-PEhuHeqe" className="flex flex-col items-center gap-1"><span className="w-11 h-11 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg">📋</span><span className="text-[10px] text-gray-500">公告管理</span></a>
      <a href="https://liff.line.me/2010673151-kemVP4Pi" className="flex flex-col items-center gap-1"><span className="w-11 h-11 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg">⚠️</span><span className="text-[10px] text-gray-500">安全回報</span></a>
    </div>
  </div>);
}

function HomePage({settings,t,refreshKey,onGotoProfile,onGotoNotices,onGotoBook,onGotoChart,onGotoSuggest,onGotoViolation,onGotoBackup,onGotoManage,onGotoMonthly,onGotoCustomers,onGotoSettings,settingsAlert,onUpdateSettings}){
  const now=bizDate();const bp=bizParts();const ty=settings.year||bp.y,tm=bp.m,td=bp.d;
  const[data,setData]=useState(null);const[prev,setPrev]=useState(null);const[otherMode,setOtherMode]=useState(false);const[otherVal,setOtherVal]=useState('');const[editPrev,setEditPrev]=useState(false);const[editToday,setEditToday]=useState(false);
  const[showStoreInfo,setShowStoreInfo]=useState(false);const[showBasicInfo,setShowBasicInfo]=useState(false);
  const[showGroupBuy,setShowGroupBuy]=useState(false);const[showDisasterReport,setShowDisasterReport]=useState(false);const[showLineQr,setShowLineQr]=useState(false);
  const[dailyQueue,setDailyQueue]=useState([]);const[gbPromptData,setGbPromptData]=useState(null);
  const[pwdInput,setPwdInput]=useState('');const[pwdErr,setPwdErr]=useState('');
  const advanceQueue=()=>setDailyQueue(q=>q.slice(1));
  useEffect(()=>{
    if(!settings.code)return;
    const today=new Date().toISOString().slice(0,10);
    const homeKey='home-daily-'+settings.code;
    let already=false;try{already=localStorage.getItem(homeKey)===today}catch(_e){}
    if(!already){
      if(!settings.disableHomePwd&&settings.lockPwd)setDailyQueue(q=>[...q,'pwd']);
      (async()=>{
        try{
          if(hasMyKey(settings.code)){const key=getMyKey(settings.code);await gasVerifyKey(settings.code,key)}
          await gasLogDailyCheck(settings.code);
        }catch(_e){}
        try{localStorage.setItem(homeKey,today)}catch(_e){}
      })();
    }
    const gbPromptKey='gb-prompt-'+settings.code;
    let gbAlready=false;try{gbAlready=localStorage.getItem(gbPromptKey)===today}catch(_e){}
    if(!gbAlready){
      (async()=>{
        try{
          const r=await gasListGroupBuys();
          const now=Date.now();
          const open=(r&&r.ok&&Array.isArray(r.list))?r.list.find(g=>g.status==='open'&&(!g.deadline||new Date(g.deadline).getTime()>now)):null;
          if(open){
            const mr=await gasMyGroupBuyOrders(settings.code);
            const mine=(mr&&mr.ok&&Array.isArray(mr.list))?mr.list:[];
            if(!mine.some(o=>o.buyId===open.id)){setGbPromptData(open);setDailyQueue(q=>[...q,'groupbuy'])}
          }
        }catch(_e){}
        try{localStorage.setItem(gbPromptKey,today)}catch(_e){}
      })();
    }
  },[settings.code]);
  const[pwdShake,setPwdShake]=useState(false);
  const pressPwdDigit=(d)=>{
    const next=(pwdInput+d).slice(0,4);
    setPwdInput(next);
    if(next.length===4){
      if(next===settings.lockPwd){setPwdInput('');setPwdErr('');advanceQueue()}
      else{setPwdErr(t.noticePwdWrong||'密碼錯誤');setPwdShake(true);setTimeout(()=>{setPwdShake(false);setPwdInput('')},500)}
    }
  };
  const[gbBusy,setGbBusy]=useState(false);
  const joinGbPrompt=()=>{
    if(gbBusy)return;
    setGbBusy(true);
    if(gbPromptData){gasJoinGroupBuy(gbPromptData.id,settings.code,gbPromptData.item==='glove'?(settings.gloveSize||'M'):'',1).catch(()=>{})}
    setTimeout(()=>{setGbBusy(false);advanceQueue()},500);
  };
  const declineGbPrompt=()=>{
    if(gbBusy)return;
    setGbBusy(true);
    if(gbPromptData){gasDeclineGroupBuy(gbPromptData.id,settings.code).catch(()=>{})}
    setTimeout(()=>{setGbBusy(false);advanceQueue()},500);
  };
  const load=()=>{const md=LS.get(dk(settings.code,ty,tm));if(md&&migrateMonthGroups(md)){LS.set(dk(settings.code,ty,tm),md)}setData(md);let found=false;if(md?.days){for(let d=td-1;d>=1;d--){const day=md.days[d];if(day&&(day.total>0||day.status>0)){setPrev({day:d,month:tm,year:ty,...day});found=true;break}}}if(!found){for(let pm=tm-1;pm>=1;pm--){const pmd=LS.get(dk(settings.code,ty,pm));if(!pmd)continue;for(let d=dim(ty,pm);d>=1;d--){const day=pmd.days?.[d];if(day&&(day.total>0||day.status>0)){setPrev({day:d,month:pm,year:ty,...day});found=true;break}}if(found)break}}if(!found)setPrev(null)};
  useEffect(load,[settings.code,refreshKey]);
  const[notices,setNotices]=useState(()=>{try{return typeof getNoticesLocal==='function'?getNoticesLocal():[]}catch(_e){return []}});const[noticeView,setNoticeView]=useState(null);const[nvLang,setNvLang]=useState({zh:true,vi:false});
  useEffect(()=>{try{if(typeof fetchNotices==='function')fetchNotices().then(list=>{if(Array.isArray(list))setNotices(list)}).catch(()=>{})}catch(_e){}},[]);
  const latestNotices=(Array.isArray(notices)?notices:[]).slice().reverse().slice(0,(typeof getNoticeHomeCount==='function'?getNoticeHomeCount():2));
  const openNotice=(n)=>{const vi=settings.lang==='vi';setNvLang({zh:!vi,vi:vi});setNoticeView(n);setNoticeReadCount(null);setReadersView(null);try{const c=getNoticeReadCount(n.id);if(c!==null)setNoticeReadCount(c)}catch(_e){}};
  const isAllStore=(n)=>{const d=String(n&&n.date||'');return d.indexOf('06-27')>=0||d.indexOf('6/27')>=0};
  const noticeShow=(typeof getNoticeShow==='function'?getNoticeShow():{cat:false,subcat:false,tags:false});
  const[noticeAct,setNoticeAct]=useState('');
  const[noticeReadCount,setNoticeReadCount]=useState(null);
  const[readersView,setReadersView]=useState(null);
  const showReaders=async()=>{if(!noticeView)return;setReadersView('loading');const r=await getNoticeReaders(noticeView.id);setReadersView(Array.isArray(r)?r:[])};
  const handleNoticeAction=async()=>{
    if(hasMyKey(settings.code)){
      // 有金鑰:記已讀(帶金鑰驗證)
      if(!noticeView)return;
      setNoticeAct('...');
      try{const r=await markNoticeRead(settings.code,noticeView.id);if(r&&r.ok){setNoticeAct('read');if(typeof r.count==='number')setNoticeReadCount(r.count)}else{setNoticeAct('fail')}}catch(_e){setNoticeAct('fail')}
      setTimeout(()=>setNoticeAct(''),4000);
      return;
    }
    // 沒金鑰:引導領金鑰
    setNoticeAct('...');
    try{const r=await autoClaimKey(settings.code);if(r&&r.ok){setNoticeAct('ok')}else{setNoticeAct('fail')}}catch(_e){setNoticeAct('fail')}
    setTimeout(()=>setNoticeAct(''),4000);
  };
  const todayData=data?.days?.[td]||eDay();const hasToday=todayData.total>0||todayData.status>0||(todayData.skills&&Object.values(todayData.skills).some(v=>v>0));const sal=calcSal(todayData,settings.unitPrice,settings.skills);
  const addUnits=(n)=>{const md=data?JSON.parse(JSON.stringify(data)):eMon();const dd=md.days[td]||eDay();if(!dd.slips)dd.slips=[];dd.slips=[...dd.slips,newSlip(n)];dd.groups=[];dd.total=slipUnitsTotal(dd.slips);dd.laodian=slipLaodianTotal(dd.slips);stamp(dd);md.days[td]=dd;setData({...md});LS.set(dk(settings.code,ty,tm),md);setOtherMode(false);setOtherVal('')};
  const addLaodian=(n)=>{const md=data?JSON.parse(JSON.stringify(data)):eMon();const dd=md.days[td]||eDay();dd.laodian+=n;stamp(dd);md.days[td]=dd;setData({...md});LS.set(dk(settings.code,ty,tm),md)};
  const setTodayStatus=(s)=>{const md=data?JSON.parse(JSON.stringify(data)):eMon();const dd=md.days[td]||eDay();dd.status=s;if(!canWork[s]){dd.total=0;dd.laodian=0;dd.groups=[];dd.skills={guasha:0,baguang:0,xiujiao:0}}stamp(dd);md.days[td]=dd;setData({...md});LS.set(dk(settings.code,ty,tm),md)};
  const addSkill=(key)=>{const md=data?JSON.parse(JSON.stringify(data)):eMon();const dd=md.days[td]||eDay();if(!dd.skills)dd.skills={guasha:0,baguang:0,xiujiao:0};dd.skills[key]=(dd.skills[key]||0)+1;stamp(dd);md.days[td]=dd;setData({...md});LS.set(dk(settings.code,ty,tm),md)};
  const savePrevDay=(d,dd)=>{if(!prev)return;const key=dk(settings.code,prev.year,prev.month);const md=JSON.parse(JSON.stringify(LS.get(key)||eMon()));md.days[d]=dd;LS.set(key,md);setPrev({...prev,...dd});if(prev.month===tm)setData(md);setEditPrev(false)};
  const saveTodayDay=(d,dd)=>{const md=data?JSON.parse(JSON.stringify(data)):eMon();md.days[d]=dd;LS.set(dk(settings.code,ty,tm),md);setData({...md});setEditToday(false)};
  const prevDow=prev?dow(prev.year,prev.month,prev.day):0;
  return(<div className="p-5 max-w-md mx-auto fi">
    <div className="flex items-center justify-between mb-2 px-1">
      <div onClick={()=>setShowStoreInfo(true)} className="flex items-baseline gap-1.5 active:opacity-70 cursor-pointer"><span className="text-base font-bold text-gray-100">雲心閣</span><span className="text-xs text-gray-500">養生會館</span><span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-600 text-white font-bold border border-red-400">24h</span></div>
      <button onClick={()=>setShowBasicInfo(true)} className="text-sm text-gray-500 font-mono active:text-gray-300 px-2 py-1 -mr-1">#{settings.code}</button>
    </div>
    {showStoreInfo&&<InfoEditModal type="store" settings={settings} t={t} onClose={()=>setShowStoreInfo(false)} onUpdateSettings={onUpdateSettings}/>}
    {showBasicInfo&&<InfoEditModal type="basic" settings={settings} t={t} onClose={()=>setShowBasicInfo(false)} onUpdateSettings={onUpdateSettings}/>}
    {latestNotices.length>0&&(<div className="mb-4"><div className="flex items-center justify-between mb-2 px-1"><span className="text-xs font-semibold text-amber-400">📢 {t.latestNotices||'最新公告'}</span>{onGotoNotices&&<button onClick={()=>onGotoNotices()} className="text-[11px] text-gray-500 active:text-gray-300">{t.viewAll||'看全部'} ›</button>}</div><div className="space-y-1.5">{latestNotices.map(n=>(<div key={n.id} onClick={()=>openNotice(n)} className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5 active:bg-white/[0.06] cursor-pointer"><div className="flex items-center justify-between gap-2"><p className="text-sm text-gray-200 font-medium truncate flex-1">{typeof noticeSummary==='function'?noticeSummary(n,settings.lang):(n.summary||n.title||'')}</p><span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${isAllStore(n)?'bg-red-500 text-white':'bg-amber-500 text-white'}`}>{isAllStore(n)?(t.allStore||'全店公告'):(t.oneStore||'單店公告')}</span></div><div className="flex items-center justify-between gap-2 mt-1"><span className="text-[10px] text-gray-500 truncate">👤 {n.author||''} · {n.date}</span><span className={`text-[11px] flex-shrink-0 ${isNoticeRead(n.id)?'text-emerald-500':'text-gray-500'}`}>{isNoticeRead(n.id)?('👍 '+(t.noticeReadMark||'已讀')):'○'}</span></div></div>))}</div></div>)}
    {prev&&(<div onClick={()=>setEditPrev(true)} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 mb-4 active:bg-white/[0.06] cursor-pointer"><div className="flex items-center justify-between"><div><span className="text-lg font-bold text-gray-400">{prev.month}/{prev.day}</span><span className="text-sm text-gray-600 ml-1">({t.dn[prevDow]})</span></div><div className="text-right">{canWork[prev.status||0]?(<span className="text-xl font-bold text-gray-400 tabular-nums">${calcSal(prev,settings.unitPrice,settings.skills).toLocaleString()}</span>):(<span className={`text-sm px-2 py-0.5 rounded-full ${SBG[prev.status]} ${STC[prev.status]}`}>{t[SK[prev.status]]}</span>)}</div></div>{canWork[prev.status||0]&&(<div className="flex items-center justify-between mt-0.5"><span className="text-xs text-gray-600">{prev.total}{t.units}{prev.laodian>0?` · ${prev.laodian}${t.laodian}`:''}</span><svg className="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></div>)}</div>)}
    <div onClick={()=>setEditToday(true)} className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 mb-4 active:bg-emerald-500/15 cursor-pointer"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${(canWork[todayData.status||0]&&todayData.total>0)?'led-green':'led-gray'}`}/><span className="text-lg font-bold text-gray-100">{tm}/{td}</span><span className="text-sm text-gray-500 ml-0.5">({t.dn[now.getDay()]})</span></div><div className="text-right">{canWork[todayData.status||0]?(<span className="text-xl font-bold text-emerald-400 tabular-nums">${sal.toLocaleString()}</span>):(<span className={`text-sm px-2 py-0.5 rounded-full ${SBG[todayData.status]} ${STC[todayData.status]}`}>{t[SK[todayData.status]]}</span>)}</div></div>{canWork[todayData.status||0]&&(<div className="flex items-center justify-between mt-0.5"><span className="text-xs text-gray-500">{todayData.total}{t.units}{todayData.laodian>0?` · ${todayData.laodian}${t.laodian}`:''}</span><svg className={`w-3.5 h-3.5 ${todayData.total>0?'text-red-500 arrow-blink':'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></div>)}</div>
    {false&&hasToday&&(<div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-5"><div className="flex items-center justify-between"><span className="text-sm text-emerald-400 font-medium">{t.todayDone}</span><div className="flex items-baseline gap-2"><span className="text-emerald-300 font-bold text-lg">{todayData.total}{t.units}</span><span className="text-emerald-400 font-bold text-lg">${sal.toLocaleString()}</span></div></div>{todayData.laodian>0&&<div className="mt-1 text-sm text-orange-400">{t.laodian}: {todayData.laodian}</div>}{(todayData.groups||[]).length>1&&<div className="mt-1 text-xs text-gray-600">{(todayData.groups||[]).join(' + ')} = {todayData.total}</div>}{todayData.skills&&SKILL_KEYS.map((k,i)=>(settings.skills?.[k]&&todayData.skills[k]>0)?<span key={k} className={`inline-block mt-1 mr-2 text-xs ${SKILL_COLORS[i]}`}>{t[SKILL_SHORT[i]]}×{todayData.skills[k]}</span>:null)}</div>)}
    <div className="mb-6"><p className="text-sm text-gray-400 mb-3">{hasToday?t.continueAdd:t.startAdd}</p><div className="grid grid-cols-5 gap-2">{[1,2,3].map(n=>(<button key={n} onClick={()=>addUnits(n)} className="py-4 rounded-xl bg-amber-600/15 border border-amber-600/20 text-amber-300 text-lg font-bold active:bg-amber-600/30 transition-all">+{n}</button>))}{!otherMode?(<button onClick={()=>setOtherMode(true)} className="col-span-2 py-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-gray-500 text-sm font-medium active:bg-white/[0.08]">{t.other}</button>):(<><input type="number" inputMode="numeric" value={otherVal} onChange={e=>setOtherVal(e.target.value)} autoFocus className="bg-white/[0.06] border border-amber-500/50 rounded-xl px-1 py-2 text-center text-lg text-gray-100 font-bold focus:outline-none" placeholder="?"/><button onClick={()=>{const v=parseInt(otherVal);if(v>0)addUnits(v)}} className="rounded-xl bg-amber-600 text-white font-bold">OK</button></>)}</div></div>
    {false&&<div className="mb-6"><p className="text-sm text-gray-400 mb-3">{t.addLaodian}</p><div className="grid grid-cols-6 gap-2">{[1,2,3,4,5,6].map(n=>(<button key={n} onClick={()=>addLaodian(n)} className="py-3.5 rounded-xl bg-orange-500/10 border border-orange-500/15 text-orange-400 font-bold active:bg-orange-500/25 transition-all">+{n}</button>))}</div></div>}
    {SKILL_KEYS.some(k=>settings.skills?.[k])&&(<div className="mb-6"><p className="text-sm text-gray-400 mb-3">{t.skills}</p><div className="grid grid-cols-3 gap-2">{SKILL_KEYS.map((k,i)=>settings.skills?.[k]?(<button key={k} onClick={()=>addSkill(k)} className="py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] active:bg-white/[0.08] transition-all text-center"><div className={`text-sm font-bold ${SKILL_COLORS[i]}`}>{t[SKILL_SHORT[i]]}{(todayData.skills?.[k]||0)>0?` ×${todayData.skills[k]}`:''}</div><div className="text-[10px] text-gray-600">{t[k]} ${SKILL_PRICES[i]}</div></button>):null)}</div></div>)}
    {/* 今日流水列表已移除,改由點今日標題開編輯器 */}
    <div><p className="text-sm text-gray-400 mb-3">{t.status}</p><div className="grid grid-cols-3 gap-2">{[0,3,4,1,2,5].map(s=>(<button key={s} onClick={()=>setTodayStatus(s)} className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${todayData.status===s?(s===0?'bg-gray-600 text-white ring-2 ring-gray-500':`${SBG[s].replace('/20','/30')} ${STC[s]} ring-2 ring-current`):'bg-white/[0.04] text-gray-600'}`}>{t[SK[s]]}</button>))}</div></div>
    <div className="grid grid-cols-4 gap-y-3 mt-3">
      <button onClick={()=>onGotoMonthly&&onGotoMonthly()} className="flex flex-col items-center gap-1"><span className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center active:bg-white/[0.1]"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><rect x="3" y="4" width="18" height="17" rx="2"/><path strokeWidth={1.8} d="M3 9h18M8 2v4M16 2v4"/></svg></span><span className="text-[10px] text-gray-500">{t.monthly}</span></button>
      <button onClick={()=>onGotoCustomers&&onGotoCustomers()} className="flex flex-col items-center gap-1"><span className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center active:bg-white/[0.1]"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM3 21v-1a6 6 0 0112 0v1"/><path d="M17 11a3 3 0 003-3M19 21v-1a5 5 0 00-3-4.6"/></svg></span><span className="text-[10px] text-gray-500">{t.custManage}</span></button>
      <button onClick={()=>onGotoNotices&&onGotoNotices()} className="flex flex-col items-center gap-1"><span className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center active:bg-white/[0.1]"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M3 11l18-6v14l-18-6v-2z"/><path d="M8 15v4a2 2 0 002 2h1"/></svg></span><span className="text-[10px] text-gray-500">{t.tabNotice}</span></button>
      <button onClick={()=>onGotoSettings&&onGotoSettings()} className="flex flex-col items-center gap-1 relative"><span className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center active:bg-white/[0.1] relative">{settingsAlert&&<span className="absolute -top-0.5 -right-0.5 text-red-500 text-[11px]">❗</span>}<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-2.82 1.17V21a2 2 0 01-4 0v-.09A1.65 1.65 0 006.6 19.4l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 8.6l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 6.6a1.65 1.65 0 001-1.51V5a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg></span><span className="text-[10px] text-gray-500">{t.settings}</span></button>
      <button onClick={()=>onGotoBook&&onGotoBook()} className="flex flex-col items-center gap-1"><span className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center active:bg-white/[0.1]"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></span><span className="text-[10px] text-gray-500">{t.tabBook2}</span></button>
      <button onClick={()=>onGotoChart&&onGotoChart()} className="flex flex-col items-center gap-1"><span className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center active:bg-white/[0.1]"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg></span><span className="text-[10px] text-gray-500">{t.tabChart}</span></button>
      <button onClick={()=>onGotoSuggest&&onGotoSuggest()} className="flex flex-col items-center gap-1"><span className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center active:bg-white/[0.1]"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"/></svg></span><span className="text-[10px] text-gray-500">{t.tabSuggest}</span></button>
      <button onClick={()=>onGotoViolation&&onGotoViolation()} className="flex flex-col items-center gap-1"><span className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center active:bg-white/[0.1]"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M4 22V4a1 1 0 011-1h13.5a.5.5 0 01.4.8l-2.9 3.7 2.9 3.7a.5.5 0 01-.4.8H5"/></svg></span><span className="text-[10px] text-gray-500">{t.tabViolation}</span></button>
      <button onClick={()=>onGotoBackup&&onGotoBackup()} className="flex flex-col items-center gap-1"><span className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center active:bg-white/[0.1]"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg></span><span className="text-[10px] text-gray-500">{t.tabBackup||'備份'}</span></button>
      <button onClick={()=>onGotoManage&&onGotoManage()} className="flex flex-col items-center gap-1"><span className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center active:bg-white/[0.1]"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4 7.2 17l.9-5.4L4.2 7.8l5.4-.8L12 2z"/></svg></span><span className="text-[10px] text-gray-500">{t.tabManage||'管理中心'}</span></button>
      <button onClick={()=>setShowGroupBuy(true)} className="flex flex-col items-center gap-1"><span className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center active:bg-white/[0.1]"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg></span><span className="text-[10px] text-gray-500">{t.groupBuyBtn}</span></button>
      <button onClick={()=>setShowLineQr(true)} className="flex flex-col items-center gap-1"><span className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center active:bg-white/[0.1]"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z"/></svg></span><span className="text-[10px] text-gray-500">LINE Bot</span></button>
      <button onClick={()=>setShowDisasterReport(true)} className="flex flex-col items-center gap-1"><span className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center active:bg-white/[0.1]"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg></span><span className="text-[10px] text-gray-500">{t.drBtn}</span></button>
    </div>
    <BreakTimerSection settings={settings}/>
    <SupervisorSection/>
    {showGroupBuy&&<GroupBuyModal t={t} settings={settings} onClose={()=>setShowGroupBuy(false)}/>}
    {showLineQr&&(<div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-6" style={{background:'rgba(0,0,0,0.9)'}} onClick={()=>setShowLineQr(false)}>
      <div onClick={e=>e.stopPropagation()} className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 max-w-xs">
        <p className="text-sm font-bold text-gray-900">加入 LINE Bot</p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https%3A%2F%2Flin.ee%2F58Dsob3" alt="LINE Bot QR Code" className="w-56 h-56"/>
        <a href="https://lin.ee/58Dsob3" target="_blank" rel="noopener" className="w-full py-2.5 rounded-xl bg-[#06C755] text-white text-sm font-bold text-center">直接開啟</a>
        <button onClick={()=>setShowLineQr(false)} className="text-xs text-gray-500">關閉</button>
      </div>
    </div>)}
    {showDisasterReport&&<DisasterReportModal t={t} settings={settings} onClose={()=>setShowDisasterReport(false)} onSaved={(patch)=>{if(onUpdateSettings)onUpdateSettings(Object.assign({},settings,patch));try{LS.set('app-settings',Object.assign({},settings,patch))}catch(_e){}}}/>}
    {dailyQueue[0]==='pwd'&&(<div className="pinGateBackdrop fixed inset-0 z-[70] flex flex-col items-center justify-center gap-6 p-6">
      <p className="pinGateTitle text-base font-bold text-center">{t.homePwdPopupTitle}</p>
      <p className="pinGateBody text-xs text-center max-w-xs -mt-3">{t.homePwdPopupBody}</p>
      <div className={pwdShake?'text-red-500':''}><PinDots length={pwdInput.length}/></div>
      {pwdErr&&<p className="text-xs text-red-400 text-center">{pwdErr}</p>}
      <PinKeypad onDigit={pressPwdDigit} onBackspace={()=>setPwdInput(v=>v.slice(0,-1))}/>
    </div>)}
    {dailyQueue[0]==='groupbuy'&&gbPromptData&&(<div className="fixed inset-0 z-[70] bg-black/80 flex items-end sm:items-center justify-center"><div className="bg-gray-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl" onClick={e=>e.stopPropagation()}>
      <div className="p-4 border-b border-white/[0.06]"><h3 className="text-base font-bold text-gray-100">{t.groupBuyPopupTitle}</h3></div>
      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-400 text-center">{gbPromptData.title}</p>
        <p className="text-xs text-gray-500 text-center">{t.groupBuyPopupBody}</p>
        <div className="flex gap-2"><button onClick={declineGbPrompt} disabled={gbBusy} className="flex-1 py-3 rounded-xl bg-white/[0.06] text-gray-400 font-semibold disabled:opacity-50 flex items-center justify-center gap-2">{gbBusy&&<svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>}{t.groupBuyPopupSkip}</button><button onClick={joinGbPrompt} disabled={gbBusy} className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2">{gbBusy&&<svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>}{t.groupBuyPopupJoin}</button></div>
      </div>
    </div></div>)}
    {editPrev&&prev&&(<DayEditor day={{groups:prev.groups||[],total:prev.total,laodian:prev.laodian,status:prev.status,skills:prev.skills||{},slips:prev.slips||[]}} d={prev.day} y={prev.year} m={prev.month} t={t} up={settings.unitPrice} sk={settings.skills} code={settings.code} onSave={savePrevDay} onCancel={()=>setEditPrev(false)}/>)}
    {editToday&&(<DayEditor day={{groups:todayData.groups||[],total:todayData.total,laodian:todayData.laodian,status:todayData.status,skills:todayData.skills||{},slips:todayData.slips||[]}} d={td} y={ty} m={tm} t={t} up={settings.unitPrice} sk={settings.skills} code={settings.code} onSave={saveTodayDay} onCancel={()=>setEditToday(false)}/>)}
    {noticeView&&window.NoticeDetailModal&&(()=>{const NDM=window.NoticeDetailModal;return <NDM notice={noticeView} settings={settings} t={t} onClose={()=>setNoticeView(null)} onMore={()=>{setNoticeView(null);if(onGotoNotices)onGotoNotices()}}/>;})()}
  </div>)}

/* ══════════ Shared components ══════════ */
function SummaryTable({prev,next,month,t}){const Row=({label,data,bold})=>(<div className={`flex items-center py-2.5 ${bold?'':'border-b border-white/[0.04]'}`}><div className={`w-16 text-sm font-semibold ${bold?'text-amber-300':'text-gray-400'}`}>{label}</div><div className={`flex-1 text-right text-lg font-bold tabular-nums ${bold?'text-emerald-400':'text-emerald-400/80'}`}>${data.salary.toLocaleString()}</div><div className="w-14 text-right text-sm text-gray-400 tabular-nums">{data.units}</div><div className="w-10 text-right text-sm text-orange-400 tabular-nums">{data.laodian}</div></div>);return(<div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-1"><div className="flex items-center pt-1.5 pb-1 text-[10px] text-gray-600"><div className="w-16"></div><div className="flex-1 text-right">{t.salary}</div><div className="w-14 text-right">{t.units}</div><div className="w-10 text-right">{t.laodian}</div></div><Row label={t.prevPeriod} data={prev}/><Row label={t.nextPeriod} data={next}/><div className="border-t border-amber-500/30 mt-0.5 pt-0.5"><Row label={t.monthTotal} data={month} bold/></div></div>)}

function DayRow({day,d,y,m,t,up,sk,onEdit,isToday}){const dw=dow(y,m,d),we=dw===0||dw===6,nw=!canWork[day.status];const sal=calcSal(day,up,sk);return(<div data-today-row={isToday?'1':undefined} onClick={()=>onEdit(d)} className={`flex items-center px-3 py-2.5 border-b active:bg-white/[0.06] cursor-pointer ${isToday?'border-emerald-500 border-l-4 bg-emerald-500/20':'border-white/[0.04]'} ${nw?'opacity-50':''}`}><div className="w-14 flex-shrink-0"><span className="text-sm font-semibold text-gray-200">{d}</span><span className={`text-[11px] ml-1 ${we?'text-amber-500':'text-gray-600'}`}>{t.dn[dw]}</span></div><div className="flex-1 flex items-center gap-2 min-w-0">{nw?(<span className={`text-xs px-2 py-0.5 rounded-full ${SBG[day.status]} ${STC[day.status]}`}>{t[SK[day.status]]}</span>):(<><span className="text-sm text-gray-200 w-8 text-right tabular-nums font-medium">{day.total||''}</span><span className="text-sm text-emerald-400/80 w-16 text-right tabular-nums">{sal>0?'$'+sal.toLocaleString():''}</span><span className="text-sm text-orange-400/80 w-5 text-center tabular-nums">{day.laodian||''}</span>{(day.status===2||day.status===5)&&<span className={`text-[10px] px-1.5 py-0.5 rounded-full ${SBG[day.status]} ${STC[day.status]}`}>{t[SK[day.status]]}</span>}{day.skills&&SKILL_KEYS.map((k,i)=>(sk?.[k]&&day.skills[k]>0)?<span key={k} className={`text-[10px] ${SKILL_COLORS[i]}`}>{t[SKILL_SHORT[i]]}{day.skills[k]}</span>:null)}{(day.groups||[]).length>1&&<span className="text-[10px] text-gray-600 truncate">{(day.groups||[]).join('+')}</span>}</>)}</div><svg className="w-3.5 h-3.5 text-gray-700 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></div>)}

function SlipTags({slip,t,code,onAdd,onDel}){
  const[input,setInput]=useState('');
  const hist=loadTagHistory(code).filter(h=>!(slip.tags||[]).includes(h)).slice(0,12);
  const submit=(val)=>{const parts=(val||input).split(/[\s,，]+/).filter(Boolean);parts.forEach(p=>onAdd(slip.id,p));setInput('')};
  return(<div className="space-y-1.5">
    <label className="text-xs text-gray-500 block">{t.slipTags}</label>
    <div className="flex gap-2"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();submit()}}} placeholder={t.slipTagsPlaceholder} className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/><button onClick={()=>submit()} disabled={!input.trim()} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${input.trim()?'bg-amber-600 text-white active:bg-amber-700':'bg-white/[0.05] text-gray-600'}`}>＋</button></div>
    {slip.tags&&slip.tags.length>0&&<div className="flex flex-wrap gap-1.5">{slip.tags.map(tag=>(<span key={tag} className="inline-flex items-center gap-1 bg-amber-600/15 text-amber-300 rounded-full pl-2 pr-1 py-0.5 text-xs">#{tag}<button onClick={()=>onDel(slip.id,tag)} className="w-4 h-4 flex items-center justify-center rounded-full bg-amber-600/30 text-amber-200 text-[10px]">×</button></span>))}</div>}
    {hist.length>0&&<div className="flex flex-wrap gap-1"><span className="text-[10px] text-gray-600 w-full">{t.slipTagHistory}</span>{hist.map(h=>(<button key={h} onClick={()=>onAdd(slip.id,h)} className="bg-white/[0.05] text-gray-400 rounded-full px-2 py-0.5 text-[11px] active:bg-white/[0.1]">#{h}</button>))}</div>}
  </div>);
}
function DayEditor({day,d,y,m,t,up,sk,onSave,onCancel,code:editorCode}){
  const[groups,setGroups]=useState((day.groups&&(day.groups||[]).length>0)?[...day.groups]:[]);const[lo,setLo]=useState(day.laodian);const[st,setSt]=useState(day.status);const[skCounts,setSkCounts]=useState(()=>{const s=day.skills||{};return{guasha:s.guasha||0,baguang:s.baguang||0,xiujiao:s.xiujiao||0}});
  const[slips,setSlips]=useState(()=>day.slips?JSON.parse(JSON.stringify(day.slips)):[]);
  const[editSlipId,setEditSlipId]=useState(null);
  const dw=dow(y,m,d);const slipTotal=slipUnitsTotal(slips);const oldGroupTotal=groups.reduce((a,b)=>a+(parseInt(b)||0),0);const ct=(!canWork[st])?0:slipTotal;const laodianTotal=slipLaodianTotal(slips);const sw=canWork[st];const previewSal=ct*up+SKILL_KEYS.reduce((a,k,i)=>a+(sk?.[k]?(skCounts[k]||0)*SKILL_PRICES[i]:0),0);
  const save=()=>{const nr=!canWork[st];if(!nr){(slips||[]).forEach(s=>{if((s.laodian||0)>=1&&(s.custName||'').trim()&&(s.custTitle||'').trim()){if(!s.tags)s.tags=[];if(!s.tags.includes('老點'))s.tags.push('老點')}});if(editorCode){(slips||[]).forEach(s=>{if((s.custName||'').trim()||(s.custPhone||'').trim()){try{upsertCust(editorCode,s)}catch(e){}}})}}onSave(d,{groups:[],total:nr?0:ct,laodian:nr?0:laodianTotal,status:st,skills:nr?{guasha:0,baguang:0,xiujiao:0}:skCounts,slips:nr?[]:(slips||[]),did:getDeviceId(),ts:Date.now()})};
  const clearAll=()=>{setLo(0);setSt(0);setGroups([]);setSlips([]);setSkCounts({guasha:0,baguang:0,xiujiao:0})};
  const skAdj=(k,delta)=>setSkCounts(p=>({...p,[k]:Math.max(0,(p[k]||0)+delta)}));
  const[eOtherMode,setEOtherMode]=useState(false);const[eOtherVal,setEOtherVal]=useState('');
  // 編輯畫面 +N：新增一筆流水(與首頁一致)
  const addSlipN=(n)=>{if(n>0){setSlips(prev=>[...prev,newSlip(n)]);}setEOtherMode(false);setEOtherVal('')};
  const fmtTime=(ms)=>{const dt=new Date(ms);return String(dt.getHours()).padStart(2,'0')+':'+String(dt.getMinutes()).padStart(2,'0')};
  const updSlip=(id,patch)=>setSlips(slips.map(s=>s.id===id?{...s,...patch}:s));
  const[custQuery,setCustQuery]=useState({});
  const applyCust=(id,c)=>{updSlip(id,{custName:c.custName||'',custTitle:c.custTitle||'',custPhone:c.custPhone||'',pressBody:c.pressBody||'',pressFoot:c.pressFoot||'',parts:c.parts||[]});setCustQuery(q=>({...q,[id]:''}))};
  const toggleArr=(id,field,val)=>{const s=slips.find(x=>x.id===id);const arr=s[field]||[];updSlip(id,{[field]:arr.includes(val)?arr.filter(x=>x!==val):[...arr,val]})};
  const delSlip=(id)=>setSlips(slips.filter(s=>s.id!==id));
  const setSlipStart=(id,hhmm)=>{if(!hhmm){updSlip(id,{startAt:0});return}const s=slips.find(x=>x.id===id);const base=new Date(s.createdAt);const[h,mi]=hhmm.split(':').map(Number);base.setHours(h,mi,0,0);updSlip(id,{startAt:base.getTime()})};
  const addSlipTag=(id,tag)=>{tag=(tag||'').trim();if(!tag)return;const s=slips.find(x=>x.id===id);if(s.tags&&s.tags.includes(tag))return;updSlip(id,{tags:[...(s.tags||[]),tag]});if(editorCode)addTagHistory(editorCode,tag)};
  const delSlipTag=(id,tag)=>{const s=slips.find(x=>x.id===id);updSlip(id,{tags:(s.tags||[]).filter(x=>x!==tag)})};
  return(<div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={onCancel}><div className="su bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
    <div className="p-4 border-b border-white/[0.06] flex items-center justify-between"><h3 className="text-lg font-bold text-gray-100">{m}/{d} <span className="text-gray-500 font-normal">({t.dn[dw]})</span></h3><div className="text-right"><div className="text-xs text-gray-500 mb-0.5">{ct}{t.units}{laodianTotal>0?` · ${laodianTotal}${t.laodian}`:''}</div><div className="text-emerald-400 text-xl font-bold tabular-nums">${previewSal.toLocaleString()}</div></div></div>
    <div className="p-4 space-y-5">
      {sw&&(<><div><p className="text-xs text-gray-500 mb-2">{t.addUnitTitle}</p><div className="grid grid-cols-5 gap-2">{[1,2,3].map(n=>(<button key={n} onClick={()=>addSlipN(n)} className="py-4 rounded-xl bg-amber-600/15 border border-amber-600/20 text-amber-300 text-lg font-bold active:bg-amber-600/30 transition-all">+{n}</button>))}{!eOtherMode?(<button onClick={()=>setEOtherMode(true)} className="col-span-2 py-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-gray-500 text-sm font-medium active:bg-white/[0.08]">{t.other}</button>):(<><input type="number" inputMode="numeric" value={eOtherVal} onChange={e=>setEOtherVal(e.target.value)} autoFocus className="bg-white/[0.06] border border-amber-500/50 rounded-xl px-1 py-2 text-center text-lg text-gray-100 font-bold focus:outline-none" placeholder="?"/><button onClick={()=>{const v=parseInt(eOtherVal);if(v>0)addSlipN(v)}} className="rounded-xl bg-amber-600 text-white font-bold">OK</button></>)}</div></div>
      {oldGroupTotal>0&&<div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-2"><span className="text-[11px] text-gray-500">{t.oldGroupData}：{groups.join('+')} = {oldGroupTotal}{t.units}</span></div>}
      {false&&laodianTotal>0&&<div><label className="text-xs text-gray-500 mb-2 block">{t.laodian}</label><div className="w-full bg-orange-500/5 border border-orange-500/15 rounded-xl px-4 py-3 text-xl text-center text-orange-300 font-semibold">{laodianTotal}</div></div>}
      {SKILL_KEYS.some(k=>sk?.[k])&&(<div><label className="text-xs text-gray-500 mb-2 block">{t.skills}</label><div className="space-y-2">{SKILL_KEYS.map((k,i)=>sk?.[k]?(<div key={k} className="flex items-center gap-2"><span className={`text-sm flex-1 ${SKILL_COLORS[i]}`}>{t[k]} <span className="text-xs text-gray-600">${SKILL_PRICES[i]}</span></span><button onClick={()=>skAdj(k,-1)} className="w-10 h-10 rounded-xl bg-white/[0.06] text-gray-400 text-lg font-bold active:bg-white/[0.1]">−</button><span className={`w-8 text-center text-lg font-bold ${SKILL_COLORS[i]}`}>{skCounts[k]||0}</span><button onClick={()=>skAdj(k,1)} className="w-10 h-10 rounded-xl bg-white/[0.06] text-gray-400 text-lg font-bold active:bg-white/[0.1]">+</button></div>):null)}</div></div>)}</>)}
      {slips.length>0&&(<div className="pt-3 mt-3 border-t border-white/[0.06]"><label className="text-xs text-gray-500 mb-2 block">{t.slipList}（{slips.length}）</label><div className="space-y-1.5">{slips.map(s=>{const open=editSlipId===s.id;const startMs=s.startAt||s.createdAt;return(<div key={s.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden"><div className="flex items-center gap-2 px-3 py-2 active:bg-white/[0.04]" onClick={()=>setEditSlipId(open?null:s.id)}><span className="text-sm font-bold text-amber-300 tabular-nums whitespace-nowrap">{s.units}{t===T.zh?'支':''} {slipSvcLabel(s,t===T.zh?"zh":"vi")}</span>{(s.laodian||0)>0&&<span className="text-xs font-semibold text-orange-400 whitespace-nowrap">{t.laodian}:{s.laodian}</span>}<span className="text-xs text-gray-300 truncate">{s.custName||''}{s.custTitle?bookTitleName(s.custTitle,t===T.zh?'zh':'vi'):''}{s.custPhone?' '+s.custPhone:''}</span><span className="text-xs text-gray-500 tabular-nums ml-auto whitespace-nowrap">{fmtTime(startMs)}</span><svg className={`w-3.5 h-3.5 text-gray-600 transition-transform ${open?'rotate-90':''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></div>{open&&(<div className="px-3 pb-3 pt-1 space-y-2 fi border-t border-white/[0.04]"><div className="flex items-center gap-2"><label className="text-xs text-gray-500 w-16">{t.slipStartTime}</label><input type="time" value={fmtTime(startMs)} onChange={e=>setSlipStart(s.id,e.target.value)} className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/></div><div className="grid grid-cols-2 gap-2"><div><label className="text-[10px] text-gray-600 mb-0.5 block">{t.svcLabel}</label><select value={s.svc||''} onChange={e=>updSlip(s.id,{svc:e.target.value})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500"><option value="">--</option>{SERVICES.map(o=><option key={o.code} value={o.code}>{o.code}（{o.min}{t===T.zh?'分':'p'}）</option>)}</select></div><div><label className="text-[10px] text-gray-600 mb-0.5 block">{t.addHour}</label><select value={s.extra||0} onChange={e=>updSlip(s.id,{extra:parseInt(e.target.value)||0})} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500">{[0,1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>+{n}</option>)}</select></div></div><div className="grid grid-cols-2 gap-2"><div><label className="text-[10px] text-gray-600 mb-0.5 block">{t.slipUnits}</label><select value={s.units||1} onChange={e=>{const nu=parseInt(e.target.value)||1;const patch={units:nu};if((s.laodian||0)>nu)patch.laodian=nu;updSlip(s.id,patch)}} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500">{[1,2,3,4,5,6,7,8,9,10].map(n=><option key={n} value={n}>{n}{t===T.zh?'支':''}</option>)}</select></div><div><label className="text-[10px] text-gray-600 mb-0.5 block flex items-center gap-1.5"><input type="checkbox" checked={(s.laodian||0)>0} onChange={e=>updSlip(s.id,{laodian:e.target.checked?1:0})} className="accent-orange-500"/>{t.laodian}</label><select value={s.laodian||0} disabled={(s.laodian||0)===0} onChange={e=>updSlip(s.id,{laodian:parseInt(e.target.value)||0})} className={`w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none ${(s.laodian||0)>0?'bg-white/[0.06] border-white/[0.08] text-orange-300 focus:border-orange-500':'bg-white/[0.02] border-white/[0.04] text-gray-600'}`}>{Array.from({length:(s.units||1)+1},(_,i)=>i).map(n=><option key={n} value={n}>{n}</option>)}</select></div></div><div className="relative"><input value={custQuery[s.id]||''} onChange={e=>setCustQuery(q=>({...q,[s.id]:e.target.value}))} placeholder={t.custSearchHint} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/>{(custQuery[s.id]||'').trim()&&(()=>{const res=searchCustDB(editorCode,custQuery[s.id]);return res.length>0?(<div className="mt-1 bg-gray-800 border border-white/[0.08] rounded-lg overflow-hidden">{res.map((c,i)=>(<div key={i} onClick={()=>applyCust(s.id,c)} className="px-2 py-1.5 text-xs text-gray-200 active:bg-white/[0.06] border-b border-white/[0.04] last:border-0">{c.custName}{c.custTitle?' '+bookTitleName(c.custTitle,t===T.zh?'zh':'vi'):''} {c.custPhone||''}</div>))}</div>):(<p className="mt-1 text-[10px] text-amber-500/70">{t.custNewHint}</p>)})()}</div><div className="grid grid-cols-2 gap-2"><input value={s.custName||''} onChange={e=>updSlip(s.id,{custName:e.target.value})} placeholder={t.custName} className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/><select value={s.custTitle||''} onChange={e=>updSlip(s.id,{custTitle:e.target.value})} className="bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500"><option value="">{t.custTitle}</option>{BOOK_TITLES.map(o=><option key={o.v} value={o.v}>{o[t===T.zh?'zh':'vi']}</option>)}</select></div><input value={s.custPhone||''} onChange={e=>updSlip(s.id,{custPhone:e.target.value})} inputMode="numeric" placeholder={t.custPhone} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/><SlipTags slip={s} t={t} code={editorCode} onAdd={addSlipTag} onDel={delSlipTag}/><div className="pt-2 mt-1 border-t border-white/[0.04] space-y-2">
<div className="grid grid-cols-2 gap-2"><div><label className="text-[10px] text-gray-600 block mb-0.5">{t.pressBody}</label><div className="flex gap-1">{PRESS_LEVELS.map(pl=>(<button key={pl} onClick={()=>updSlip(s.id,{pressBody:s.pressBody===pl?'':pl})} className={`flex-1 py-1 rounded text-[11px] ${s.pressBody===pl?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{t['press'+pl.charAt(0).toUpperCase()+pl.slice(1)]}</button>))}</div></div><div><label className="text-[10px] text-gray-600 block mb-0.5">{t.pressFoot}</label><div className="flex gap-1">{PRESS_LEVELS.map(pl=>(<button key={pl} onClick={()=>updSlip(s.id,{pressFoot:s.pressFoot===pl?'':pl})} className={`flex-1 py-1 rounded text-[11px] ${s.pressFoot===pl?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{t['press'+pl.charAt(0).toUpperCase()+pl.slice(1)]}</button>))}</div></div></div>
<div><label className="text-[10px] text-gray-600 block mb-0.5">{t.strengthParts}</label><div className="flex flex-wrap gap-1">{BODY_PARTS.map(bp=>(<button key={bp} onClick={()=>toggleArr(s.id,'parts',bp)} className={`px-2 py-1 rounded text-[11px] ${(s.parts||[]).includes(bp)?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{t['part'+bp.charAt(0).toUpperCase()+bp.slice(1)]}</button>))}</div></div>
<div><label className="text-[10px] text-gray-600 block mb-0.5">{t.clientReq}</label><div className="flex flex-wrap gap-1">{CLIENT_REQS.map(cr=>(<button key={cr} onClick={()=>toggleArr(s.id,'reqs',cr)} className={`px-2 py-1 rounded text-[11px] ${(s.reqs||[]).includes(cr)?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-500'}`}>{t['req'+cr.charAt(0).toUpperCase()+cr.slice(1)]}</button>))}</div></div>
<div className="grid grid-cols-2 gap-2"><div><label className="text-[10px] text-gray-600 block mb-0.5">{t.laodianOut}</label><input value={s.laodianOut||''} onChange={e=>updSlip(s.id,{laodianOut:e.target.value})} placeholder={t.teacherNoPlaceholder} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/></div><div><label className="text-[10px] text-gray-600 block mb-0.5">{t.shiftOut}</label><input value={s.shiftOut||''} onChange={e=>updSlip(s.id,{shiftOut:e.target.value})} placeholder={t.teacherNoPlaceholder} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"/></div></div>
</div><button onClick={()=>{delSlip(s.id);setEditSlipId(null)}} className="w-full py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs">{t.slipDelete}</button></div>)}</div>)})}</div></div>)}
      <div><label className="text-xs text-gray-500 mb-2 block font-medium">{t.status}</label><div className="grid grid-cols-3 gap-2">{[0,3,4,1,2,5].map(s=>(<button key={s} onClick={()=>setSt(s)} className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${st===s?(s===0?'bg-gray-600 text-white ring-2 ring-gray-500':`${SBG[s].replace('/20','/30')} ${STC[s]} ring-2 ring-current`):'bg-white/[0.04] text-gray-600'}`}>{t[SK[s]]}</button>))}</div></div>
    </div>
    <div className="p-4 border-t border-white/[0.06] space-y-2"><div className="flex gap-3"><button onClick={onCancel} className="flex-1 py-3.5 rounded-xl bg-white/[0.05] text-gray-400 font-semibold">{t.cancel}</button><button onClick={save} className="flex-1 py-3.5 rounded-xl bg-amber-600 text-white font-bold">{t.done}</button></div><button onClick={clearAll} className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium active:bg-red-500/20">🗑 {t.clearAll}</button></div>
  </div></div>)}

/* ══════════ Monthly ══════════ */
function MonthlyPage({settings,curM,setCurM,t,onGotoYear,onClose}){
  const[data,setData]=useState(null);const[editDay,setEditDay]=useState(null);const y=settings.year||bizParts().y;
  useEffect(()=>{setData(LS.get(dk(settings.code,y,curM))||eMon())},[settings.code,y,curM]);
  useEffect(()=>{if(data&&curM===bizParts().m&&y===bizParts().y){const el=document.querySelector('[data-today-row]');if(el)setTimeout(()=>{try{el.scrollIntoView({block:'center',behavior:'smooth'})}catch(_e){}},150)}},[data,curM,y]);
  const saveDay=(d,dd)=>{const nd={...data,days:{...data.days,[d]:dd}};setData(nd);setEditDay(null);LS.set(dk(settings.code,y,curM),nd)};
  const dm=dim(y,curM);
  const calc=useMemo(()=>{if(!data)return{prev:{units:0,salary:0,laodian:0},next:{units:0,salary:0,laodian:0},month:{units:0,salary:0,laodian:0}};let pu=0,ps=0,pl=0,nu=0,ns=0,nl=0;for(let d=1;d<=dm;d++){const day=data.days[d]||eDay();const u=day.total||0,lo=day.laodian||0,s=calcSal(day,settings.unitPrice,settings.skills);if(d<=15){pu+=u;ps+=s;pl+=lo}else{nu+=u;ns+=s;nl+=lo}}return{prev:{units:pu,salary:ps,laodian:pl},next:{units:nu,salary:ns,laodian:nl},month:{units:pu+nu,salary:ps+ns,laodian:pl+nl}}},[data,dm,settings.unitPrice,settings.skills]);
  return(<div className="max-w-lg mx-auto fi"><div className="sticky top-0 z-10 bg-gray-950 pb-1">
  <div className="flex items-center justify-between px-3 pt-2"><h2 className="text-base font-bold text-gray-100">{t.monthly}</h2><button onClick={()=>onClose&&onClose()} className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-400 active:bg-white/[0.12]">✕</button></div>
  <div className="px-2 py-2 flex gap-1 overflow-x-auto no-sb"><button onClick={()=>onGotoYear&&onGotoYear()} className="px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 bg-emerald-600 text-white">{t.yearly}</button>{Array.from({length:12},(_,i)=>i+1).map(m=>(<button key={m} onClick={()=>setCurM(m)} className={`px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${m===curM?'bg-amber-600 text-white':'bg-white/[0.04] text-gray-600'}`}>{t.months[m-1]}</button>))}<button onClick={()=>onGotoYear&&onGotoYear()} className="px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 bg-emerald-600 text-white">{t.yearly}</button></div><div className="px-3 py-2"><SummaryTable prev={calc.prev} next={calc.next} month={calc.month} t={t}/></div></div>
  <div className="px-3 py-1.5 bg-amber-600/[0.06] border-b border-amber-500/10"><span className="text-[11px] text-amber-500/80 font-semibold">{t.p1}</span></div>
  {Array.from({length:Math.min(15,dm)},(_,i)=>i+1).map(d=>(<DayRow key={d} d={d} day={data?.days[d]||eDay()} y={y} m={curM} t={t} up={settings.unitPrice} sk={settings.skills} onEdit={setEditDay} isToday={curM===bizParts().m&&y===bizParts().y&&d===bizParts().d}/>))}
  {dm>15&&(<><div className="px-3 py-1.5 bg-amber-600/[0.06] border-b border-amber-500/10 mt-0.5"><span className="text-[11px] text-amber-500/80 font-semibold">{t.p2}</span></div>{Array.from({length:dm-15},(_,i)=>i+16).map(d=>(<DayRow key={d} d={d} day={data?.days[d]||eDay()} y={y} m={curM} t={t} up={settings.unitPrice} sk={settings.skills} onEdit={setEditDay} isToday={curM===bizParts().m&&y===bizParts().y&&d===bizParts().d}/>))}</>)}
  {editDay&&data&&<DayEditor day={data.days[editDay]||eDay()} d={editDay} y={y} m={curM} t={t} up={settings.unitPrice} sk={settings.skills} code={settings.code} onSave={saveDay} onCancel={()=>setEditDay(null)}/>}
  </div>)}

/* ══════════ Yearly ══════════ */
function YearlyPage({settings,t,onBack}){
  const y=settings.year||bizParts().y;
  const rows=useMemo(()=>{const r=[];for(let m=1;m<=12;m++){const d=LS.get(dk(settings.code,y,m));let u=0,lo=0,sal=0;if(d?.days){for(let i=1;i<=dim(y,m);i++){const day=d.days[i];if(day){u+=day.total||0;lo+=day.laodian||0;sal+=calcSal(day,settings.unitPrice,settings.skills)}}}r.push({month:m,units:u,salary:sal,laodian:lo})}return r},[settings.code,y,settings.unitPrice]);
  const tot=rows.reduce((a,r)=>({u:a.u+r.units,s:a.s+r.salary,l:a.l+r.laodian}),{u:0,s:0,l:0});
  return(<div className="max-w-lg mx-auto fi"><div className="px-4 py-3 flex items-baseline justify-between"><h2 className="text-xl font-bold text-gray-100"><button onClick={()=>onBack&&onBack()} className="mr-2 text-gray-500 active:text-gray-300 align-middle"><svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button>{y} {t.yearly}</h2><span className="text-xs text-gray-600 font-mono">#{settings.code}</span></div><div className="flex px-3 py-2 border-b border-white/[0.06] text-[11px] text-gray-600 font-medium"><div className="w-12"></div><div className="flex-1 text-right">{t.units}</div><div className="flex-1 text-right">{t.salary}</div><div className="w-12 text-right">{t.laodian}</div><div className="flex-1 text-right">{t.subtotal}</div></div>{rows.map(r=>(<div key={r.month} className={`flex items-center px-3 py-3 border-b border-white/[0.03] ${r.units>0?'':'opacity-30'}`}><div className="w-12 text-sm font-medium text-gray-300">{t.months[r.month-1]}</div><div className="flex-1 text-right text-sm text-gray-400 tabular-nums">{r.units}</div><div className="flex-1 text-right text-sm text-emerald-400/80 tabular-nums">{r.salary.toLocaleString()}</div><div className="w-12 text-right text-sm text-orange-400/80 tabular-nums">{r.laodian}</div><div className="flex-1 text-right text-sm text-emerald-400 font-semibold tabular-nums">{r.salary.toLocaleString()}</div></div>))}<div className="flex items-center px-3 py-3.5 bg-amber-600/10 border-t-2 border-amber-500/40"><div className="w-12 text-sm font-bold text-amber-400">{t.total}</div><div className="flex-1 text-right text-sm text-amber-300 font-bold tabular-nums">{tot.u}</div><div className="flex-1 text-right text-sm text-emerald-400 font-bold tabular-nums">{tot.s.toLocaleString()}</div><div className="w-12 text-right text-sm text-orange-400 font-bold tabular-nums">{tot.l}</div><div className="flex-1 text-right text-sm text-emerald-400 font-bold tabular-nums">{tot.s.toLocaleString()}</div></div></div>)}

