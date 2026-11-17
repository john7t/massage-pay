/*BUILD c=themes/classic/classic-app-core.c.js v=1.13-080 src=dev/themes/classic/classic-app-core.js h=e4231fc8 t=2026-11-17 10:41*/
var {
  LS,
  getKeyConfig,
  saveKeyConfig,
  buildDynamicKey,
  getCK,
  xEnc,
  xDec,
  fnv,
  adminHash,
  genAdminAct,
  revokeHash,
  approveHash,
  supApproveHash,
  genSimpleAct,
  isValidPin,
  lockPwdCred,
  encWithKey,
  decWithKey,
  actKey,
  genActWithToken,
  verifyActToken,
  gasCall,
  gasCallPost,
  gasSubmitAction,
  gasCheckAction,
  gasBlacklistSearch,
  gasUpdatePwd,
  gasLoginPwd,
  gasSyncProfile,
  gasCheckCode,
  gasSetInitialPwd,
  gasResetLockPwd,
  gasVerifyKey,
  gasLeaveTeacher,
  gasLogDailyCheck,
  gasLogFlowEnter,
  gasCreateGroupBuy,
  gasListGroupBuys,
  gasJoinGroupBuy,
  gasMyGroupBuyOrders,
  gasDeclineGroupBuy,
  gasLogGroupBuyOpen,
  gasGroupBuyDetail,
  gasCloseGroupBuy,
  gasSetGroupBuyOrderStatus,
  gasSetGroupBuyStatus,
  gasSubmitDisasterReport,
  gasListDisasterSurveys,
  gasMyDisasterReports,
  getMyKey,
  setMyKey,
  genReqCode,
  parseReqCode,
  decReqCode,
  parseReqHash,
  buildReqLink,
  AUTH_LIFF_BASE,
  sendTicketFlex,
  genConfirmCode,
  verifyConfirmCode,
  confirmCodeIsBound,
  genUUID,
  getDeviceId,
  SUP_LEVELS,
  supLevelName,
  getGHConfig,
  saveGHConfigLocal,
  saveGHConfig,
  ghReadFile,
  ghWriteFile,
  ghAppendLine,
  ghRemoveLine,
  readStaff,
  writeStaff,
  syncMyStaffStatus,
  isStaffLeft,
  DISABLE_GH_DATA_FETCH,
  checkApproved,
  writeApproval,
  loadStores,
  saveStores,
  loadStats,
  getApproved,
  saveApproved,
  addApproved,
  addLog,
  getLogs,
  fmtLog,
  fmtDate,
  THEMES,
  SKILL_KEYS,
  SKILL_SHORT,
  SKILL_PRICES,
  SKILL_COLORS,
  SK,
  SBG,
  STC,
  canWork,
  toB36,
  fromB36,
  dim,
  dow,
  bizDate,
  bizParts,
  dk,
  eDay,
  stamp,
  calcSal,
  getUnitPriceForDate,
  eMon,
  newSlip,
  gasWarmup,
  getNoticesLocal,
  fetchNotices,
  getNoticeHomeCount,
  getNoticeShow,
  noticeBody,
  noticeTitle,
  noticeSummary,
  getGasUrl,
  hasMyKey,
  isNoticeRead,
  getNoticeReadCount,
  slipUnitsTotal,
  slipLaodianTotal,
  PRESS_LEVELS,
  BODY_PARTS,
  CLIENT_REQS,
  custKey,
  loadCustDB,
  getCust,
  upsertCust,
  searchCustDB,
  migrateDayGroups,
  migrateMonthGroups,
  slipSvcLabel,
  SERVICES,
  svcByCode,
  bookUnits,
  bookMinutes,
  bookLabel,
  bookRange,
  findConflicts,
  dayOffStatus,
  skName,
  getBookings,
  addBooking,
  updateBooking,
  deleteBooking,
  confirmBooking,
  slipStartTime,
  loadTagHistory,
  addTagHistory,
  visitStats,
  collectSlips,
  collectAllSlips,
  tagStats,
  searchSlips,
  normEmail,
  isValidEmail,
  gasEmailBackupCheck,
  doEmailBackupNow,
  emailRestore,
  getCardData,
  sendCardFlex,
  loadCardStores,
  CARD_STORE_DEFAULTS,
  CARD_BRAND,
  loadBreakStatus,
  breakFlipGreenLocal,
  breakFlipWhiteLocal,
  bookTitleName,
  BOOK_TITLES,
  encMonth,
  decBackup,
  makePersonalBackup,
  gasBackupSubmit,
  getMyLineUserId,
  HIDE_COMPANY_FEATURES,
  INDEX_LIFF_ID,
  TW_REGIONS,
  LANG_SCHOOLS,
  T
} = window.MP;
var {
  bindVerify = async () => 'error',
  readUnboundNotice = () => null,
  clearUnboundNotice = () => {},
  localHasPersonalData = () => true,
  backupUploadAllowed = () => true
} = window.MP;
var {
  useState,
  useEffect,
  useCallback,
  useMemo
} = React;
var {
  SkReveal
} = window.MP;
function isInLiffClient() {
  try {
    return typeof liff !== 'undefined' && typeof liff.isInClient === 'function' && liff.isInClient();
  } catch (_e) {
    return false;
  }
}
function LineRestoreBox({
  lang
}) {
  var M = window.MP;
  var vi = lang === 'vi';
  var [busy, setBusy] = useState(false);
  var [msg, setMsg] = useState('');
  var [offer, setOffer] = useState(null);
  var [uid, setUid] = useState('');
  if (!isInLiffClient()) return null;
  var login = async () => {
    setBusy(true);
    setMsg('');
    try {
      await liff.init({
        liffId: INDEX_LIFF_ID
      });
      if (!liff.isLoggedIn()) {
        liff.login({
          redirectUri: location.href
        });
        return;
      }
      var p = await liff.getProfile();
      if (!p || !p.userId) throw new Error('no profile');
      M.clearLineLogoutFlag();
      M.setMyLineUserId(p.userId);
      setUid(p.userId);
      try {
        await M.bindClaimNow(p.userId);
      } catch (_e) {}
      var r = await M.gasBackupCheck(p.userId);
      if (r && r.ok && r.found) setOffer(r);else setMsg(r && r.ok ? vi ? 'Đã đăng nhập LINE. Chưa có bản sao lưu trên đám mây, hãy điền thông tin bên dưới để bắt đầu.' : '已用 LINE 登入。雲端沒有備份，請繼續填寫下方資料開始使用。' : vi ? 'Không kiểm tra được bản sao lưu, vui lòng thử lại' : '查詢備份失敗，請稍後再試');
    } catch (e) {
      setMsg((vi ? 'Đăng nhập thất bại: ' : 'LINE 登入失敗：') + String(e && e.message || e));
    }
    setBusy(false);
  };
  var restore = async () => {
    setBusy(true);
    setMsg('');
    try {
      var f = await M.gasBackupFetch(uid);
      if (!f || !f.ok) throw new Error(f && f.error || 'fetch');
      var parsed = M.parsePersonalBackup(JSON.parse(f.jsonData));
      if (!parsed.ok) throw new Error('備份內容毀損');
      M.restorePersonalBackup(parsed);
      var st = LS.get('app-settings');
      var code = st && st.code || parsed.code;
      if (!code) throw new Error('備份缺少編號');
      LS.set(`activated-${code}`, {
        deviceId: M.getDeviceId(),
        ts: Date.now()
      });
      setMsg(vi ? '✓ Đã khôi phục, đang tải lại…' : '✓ 已還原，即將重新整理');
      setTimeout(() => location.reload(), 1200);
      return;
    } catch (e) {
      setMsg((vi ? 'Khôi phục thất bại: ' : '還原失敗：') + String(e && e.message || e));
    }
    setBusy(false);
  };
  return React.createElement("div", {
    className: "mb-4 space-y-3"
  }, !offer && React.createElement("button", {
    onClick: login,
    disabled: busy,
    className: "w-full min-h-[56px] rounded-xl bg-[#06C755] text-white font-bold text-lg active:opacity-80 disabled:opacity-60"
  }, busy ? vi ? 'Đang xử lý…' : '處理中…' : vi ? 'Đăng nhập LINE (khôi phục sao lưu)' : '用 LINE 登入（有備份可還原）'), offer && React.createElement("div", {
    className: "rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-3"
  }, React.createElement("p", {
    className: "text-base font-bold text-amber-300"
  }, vi ? 'Tìm thấy bản sao lưu trên đám mây' : '發現雲端上有備份'), React.createElement("p", {
    className: "text-sm text-gray-300 leading-relaxed"
  }, vi ? 'Ngày giờ sao lưu: ' : '備份檔日期時間：', React.createElement("b", {
    className: "text-gray-100"
  }, offer.updatedAt || '—'), "（", offer.year || '', " ", vi ? 'năm' : '年', "）。", vi ? 'Bạn có muốn khôi phục không?' : '要還原雲端上的備份嗎？'), React.createElement("button", {
    onClick: restore,
    disabled: busy,
    className: "w-full min-h-[48px] rounded-xl bg-emerald-600 text-white font-semibold active:opacity-80 disabled:opacity-60"
  }, busy ? '…' : vi ? 'Khôi phục sao lưu' : '還原雲端備份'), React.createElement("button", {
    onClick: () => {
      setOffer(null);
      setMsg(vi ? 'Đã bỏ qua khôi phục. Hãy điền thông tin bên dưới để bắt đầu mới (sao lưu tự động sẽ tạm dừng đến khi bạn chọn).' : '已先不還原，請填寫下方資料全新開始（雲端備份不會被覆蓋）。');
      try {
        localStorage.setItem('my-bind-pending', JSON.stringify({
          uid: uid,
          year: offer.year,
          updatedAt: offer.updatedAt,
          cloudOnly: true
        }));
      } catch (_e) {}
    },
    disabled: busy,
    className: "w-full min-h-[44px] rounded-xl text-sm text-gray-400"
  }, vi ? 'Không khôi phục' : '先不還原')), msg && React.createElement("p", {
    className: "text-sm text-center text-emerald-400"
  }, msg));
}
function NoticeBox({
  t,
  agreed,
  setAgreed,
  email,
  setEmail
}) {
  var zh = t === T.zh;
  var pts = [[t.privacyBody, ''], [setEmail ? t.emailPrivacy : '', 'text-amber-300/90'], [t.browserNote, ''], [t.backupReminder, 'text-red-400/90 font-semibold']].filter(x => x[0]);
  return React.createElement("div", {
    className: "mt-5 space-y-3"
  }, React.createElement("p", {
    className: "text-[13px] text-gray-400 font-semibold"
  }, t.noticeTitle || '本系統記錄的資料說明'), React.createElement("div", {
    className: "ob-card rounded-xl bg-white/[0.04] px-4 py-3.5 space-y-3 text-[15px] leading-relaxed text-gray-300"
  }, pts.map(([tx, cl], k) => React.createElement("div", {
    key: k,
    className: "flex gap-2.5"
  }, React.createElement("span", {
    className: "ob-green font-bold flex-shrink-0 text-amber-400"
  }, '①②③④'[k]), React.createElement("p", {
    className: cl
  }, tx)))), React.createElement("button", {
    onClick: () => setAgreed(!agreed),
    className: "flex items-center gap-3 w-full text-left min-h-[48px]"
  }, React.createElement("span", {
    className: `w-[26px] h-[26px] rounded-full flex items-center justify-center text-sm flex-shrink-0 ${agreed ? 'bg-amber-600 text-white' : 'bg-white/[0.06] border-2 border-white/[0.2] text-transparent'}`
  }, "✓"), React.createElement("span", {
    className: "text-base text-gray-200"
  }, t.readConfirm)), setEmail && React.createElement("div", {
    className: "pt-2 space-y-1.5"
  }, React.createElement("label", {
    className: "text-sm text-gray-300 font-semibold block"
  }, t.emailLabel), React.createElement("input", {
    type: "email",
    inputMode: "email",
    autoComplete: "email",
    autoCapitalize: "none",
    value: email || '',
    onChange: e => setEmail(e.target.value),
    placeholder: "name@example.com",
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
  }), React.createElement("p", {
    className: "text-xs text-gray-500 leading-relaxed"
  }, t.emailHint)));
}
function _pad2(n) {
  return String(n).padStart(2, '0');
}
function nextHalfHour() {
  var now = new Date();
  var h = now.getHours(),
    m = now.getMinutes();
  if (m === 0) return _pad2(h) + ':00';
  if (m <= 30) return _pad2(h) + ':30';
  return _pad2((h + 1) % 24) + ':00';
}
function addHalfHourTime(hhmm, hours) {
  var p = (hhmm || '00:00').split(':');
  var h = parseInt(p[0], 10) || 0,
    m = parseInt(p[1], 10) || 0;
  var total = (h * 60 + m + hours * 60) % 1440;
  if (total < 0) total += 1440;
  return _pad2(Math.floor(total / 60)) + ':' + _pad2(total % 60);
}
var TIME_OPTS = (() => {
  var a = [];
  for (var h = 0; h < 24; h++) {
    a.push(_pad2(h) + ':00');
    a.push(_pad2(h) + ':30');
  }
  return a;
})();
var ONBOARD_PENDING_KEY = 'onboard-pending-v1';
function loadPending() {
  try {
    return JSON.parse(localStorage.getItem(ONBOARD_PENDING_KEY) || 'null');
  } catch (_e) {
    return null;
  }
}
function savePending(obj) {
  try {
    localStorage.setItem(ONBOARD_PENDING_KEY, JSON.stringify(obj));
  } catch (_e) {}
}
function clearPending() {
  try {
    localStorage.removeItem(ONBOARD_PENDING_KEY);
  } catch (_e) {}
}
function Onboarding({
  onComplete
}) {
  var [pending] = useState(() => loadPending());
  var pendActive = pending && (pending.mode === 'newTicket' || pending.mode === 'forgotTicket');
  var [mode, setMode] = useState(() => pendActive ? pending.mode : 'choice');
  var [lang, setLang] = useState(() => pending && pending.lang || 'zh');
  var [code, setCode] = useState(() => pending && pending.code || '');
  var [err, setErr] = useState('');
  var [checking, setChecking] = useState(false);
  var [devId] = useState(() => getDeviceId());
  var [stores, setStores] = useState(['龍山寺店']);
  var [store, setStore] = useState(() => pending && pending.store || '龍山寺店');
  var [agreed, setAgreed] = useState(false);
  var [agreeErr, setAgreeErr] = useState(false);
  var [email, setEmail] = useState('');
  var [restoreOffer, setRestoreOffer] = useState(null);
  var [restoreBusy, setRestoreBusy] = useState(false);
  var [restoreErr, setRestoreErr] = useState('');
  var [codeCheck, setCodeCheck] = useState(null);
  var [gender, setGender] = useState(() => pending && pending.gender || '');
  var [shift, setShift] = useState(() => pending && pending.shift || '');
  var [workStart, setWorkStart] = useState(() => pending && pending.workStart || nextHalfHour());
  var [workEnd, setWorkEnd] = useState(() => pending && pending.workEnd || addHalfHourTime(nextHalfHour(), 12));
  var [workEndTouched, setWorkEndTouched] = useState(false);
  var [pwd, setPwd] = useState(() => pending && pending.pwd || '');
  var [pwd2, setPwd2] = useState('');
  var [fieldErr, setFieldErr] = useState('');
  var [loginPwdInput, setLoginPwdInput] = useState('');
  var [forgotPwd, setForgotPwd] = useState(() => pending && pending.forgotPwd || '');
  var [forgotPwd2, setForgotPwd2] = useState('');
  var [activeField, setActiveField] = useState('');
  var [ticketSeq, setTicketSeq] = useState(() => pending && pending.ticketSeq || '');
  var [ticketStatus, setTicketStatus] = useState('');
  var [cooldown, setCooldown] = useState(0);
  var [lineRestoreBusy, setLineRestoreBusy] = useState(false);
  var [lineRestoreErr, setLineRestoreErr] = useState('');
  var [pendingActivateSettings, setPendingActivateSettings] = useState(() => {
    try {
      var s = localStorage.getItem('onboard-pwd-settings');
      return s ? JSON.parse(s) : null;
    } catch (_e) {
      return null;
    }
  });
  var t = T[lang];
  useEffect(() => {
    loadStores().then(s => {
      setStores(s);
      if (!pending) setStore(s[0] || '龍山寺店');
    });
  }, []);
  var checkLightDataAndEnterForm = async uid => {
    var found = null;
    try {
      var res = await fetch('./backup-index.json', {
        cache: 'no-store'
      });
      if (res.ok) {
        var arr = await res.json();
        found = arr.find(a => a.lineUserId === uid) || null;
      }
    } catch (_e) {}
    var src = pendingActivateSettings || {};
    var pick = k => src[k] || found && found[k] || '';
    if (pick('code')) setCode(pick('code'));else if (found && found.code) setCode(found.code);
    if (pick('store')) setStore(pick('store'));
    if (pick('gender')) setGender(pick('gender'));
    if (pick('shift')) setShift(pick('shift'));
    if (pick('workStart')) setWorkStart(pick('workStart'));
    if (pick('workEnd')) setWorkEnd(pick('workEnd'));
    setCodeCheck('new');
    setMode('new');
  };
  useEffect(() => {
    if (!HIDE_COMPANY_FEATURES) return;
    var marker = (() => {
      try {
        return localStorage.getItem('onboard-flow-marker');
      } catch (_e) {
        return null;
      }
    })();
    if (!marker) return;
    var uid = getMyLineUserId();
    if (!uid) return;
    try {
      localStorage.removeItem('onboard-flow-marker');
    } catch (_e) {}
    if (marker === 'initial') {
      checkLightDataAndEnterForm(uid);
    } else if (marker === 'afterPwdLogin') {
      if (pendingActivateSettings && pendingActivateSettings.code) gasLogFlowEnter(pendingActivateSettings.code, 'lineLoginBind', pendingActivateSettings.store).catch(() => {});
      checkLightDataAndEnterForm(uid);
    }
  }, []);
  useEffect(() => {
    if (cooldown <= 0) return;
    var tm = setTimeout(() => setCooldown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearTimeout(tm);
  }, [cooldown]);
  var onWorkStartChange = v => {
    setWorkStart(v);
    if (!workEndTouched) setWorkEnd(addHalfHourTime(v, 12));
  };
  var onWorkEndChange = v => {
    setWorkEnd(v);
    setWorkEndTouched(true);
  };
  var baseSettings = extra => Object.assign({
    email: isValidEmail(email) ? normEmail(email) : '',
    code,
    unitPrice: 250,
    lang,
    store,
    year: bizParts().y,
    deviceId: devId,
    gender,
    workStart,
    workEnd,
    shift,
    lockPwd: pwd
  }, extra || {});
  var autoBackupIfLineBound = settings => {
    try {
      var lineUid = getMyLineUserId();
      if (lineUid && backupUploadAllowed(settings.code, settings.year || bizParts().y)) {
        var obj = makePersonalBackup(settings.code, settings.year || bizParts().y);
        var profileJson = JSON.stringify({
          store: settings.store || '',
          gender: settings.gender || '',
          shift: settings.shift || '',
          workStart: settings.workStart || '',
          workEnd: settings.workEnd || ''
        });
        gasBackupSubmit(lineUid, settings.code, settings.year || bizParts().y, JSON.stringify(obj), profileJson).catch(() => {});
      }
    } catch (_e) {}
  };
  var doActivate = settings => {
    clearPending();
    LS.set('app-settings', settings);
    LS.set(`activated-${code}`, {
      deviceId: devId,
      ts: Date.now()
    });
    autoBackupIfLineBound(settings);
    onComplete(settings);
  };
  var doEmailRestoreNow = async () => {
    setRestoreBusy(true);
    setRestoreErr('');
    var r = await emailRestore(code, normEmail(email));
    if (r.ok) {
      doActivate(Object.assign({}, r.settings || baseSettings(), {
        code,
        email: normEmail(email),
        deviceId: devId
      }));
    } else {
      setRestoreBusy(false);
      setRestoreErr(r.error || '還原失敗');
    }
  };
  var skipEmailRestore = () => {
    setRestoreOffer(null);
    doActivate(baseSettings());
  };
  var pinOk = isValidPin(pwd);
  var canSubmitNew = HIDE_COMPANY_FEATURES ? codeCheck === 'new' && code.trim() && agreed : codeCheck === 'new' && code.trim() && gender && shift && workStart && workEnd && pinOk && pwd === pwd2 && agreed;
  var toggleField = f => setActiveField(a => a === f ? '' : f);
  var goChoice = () => {
    clearPending();
    setMode('choice');
    setErr('');
    setFieldErr('');
    setChecking(false);
    setTicketStatus('');
    setCooldown(0);
    setPwd('');
    setPwd2('');
    setForgotPwd('');
    setForgotPwd2('');
    setLoginPwdInput('');
    setActiveField('');
  };
  var onCodeChange = v => {
    setCode(v.replace(/[^a-zA-Z0-9]/g, ''));
    if (!HIDE_COMPANY_FEATURES) setCodeCheck(null);
  };
  var codeDigit = d => {
    if (code.length >= 3) return;
    var next = code + d;
    onCodeChange(next);
    if (next.length >= 3) setActiveField('');
  };
  var codeBackspace = () => {
    onCodeChange(code.slice(0, -1));
  };
  var codeClear = () => onCodeChange('');
  var pwdDigit = d => {
    if (pwd.length >= 4) return;
    var next = pwd + d;
    setPwd(next);
    setFieldErr('');
    if (next.length >= 4) setActiveField('');
  };
  var pwdBackspace = () => setPwd(v => v.slice(0, -1));
  var pwdClear = () => setPwd('');
  var pwd2Digit = d => {
    if (pwd2.length >= 4) return;
    var next = pwd2 + d;
    setPwd2(next);
    setFieldErr('');
    if (next.length >= 4) setActiveField('');
  };
  var pwd2Backspace = () => setPwd2(v => v.slice(0, -1));
  var pwd2Clear = () => setPwd2('');
  var forgotPwdDigit = d => {
    if (forgotPwd.length >= 4) return;
    var next = forgotPwd + d;
    setForgotPwd(next);
    setFieldErr('');
    if (next.length >= 4) setActiveField('');
  };
  var forgotPwdBackspace = () => setForgotPwd(v => v.slice(0, -1));
  var forgotPwdClear = () => setForgotPwd('');
  var forgotPwd2Digit = d => {
    if (forgotPwd2.length >= 4) return;
    var next = forgotPwd2 + d;
    setForgotPwd2(next);
    setFieldErr('');
    if (next.length >= 4) setActiveField('');
  };
  var forgotPwd2Backspace = () => setForgotPwd2(v => v.slice(0, -1));
  var forgotPwd2Clear = () => setForgotPwd2('');
  var loginPwdDigit = d => {
    if (loginPwdInput.length >= 4) return;
    var next = loginPwdInput + d;
    setLoginPwdInput(next);
    if (next.length >= 4) setActiveField('');
  };
  var loginPwdBackspace = () => setLoginPwdInput(v => v.slice(0, -1));
  var loginPwdClear = () => setLoginPwdInput('');
  var doCheckCode = async () => {
    if (!code.trim()) return;
    if (HIDE_COMPANY_FEATURES) {
      setCodeCheck('new');
      return;
    }
    setCodeCheck('checking');
    setErr('');
    try {
      var r = await gasCheckCode(code.trim());
      if (r && r.ok) {
        if (r.exists) {
          setCodeCheck('exists');
          setMode('login');
          setLoginPwdInput('');
        } else {
          setCodeCheck('new');
        }
      } else {
        setCodeCheck('error');
        setErr(r && r.error || t.codeCheckFail);
      }
    } catch (e) {
      setCodeCheck('error');
      setErr(t.codeCheckFail);
    }
  };
  var submitNew = async () => {
    if (!canSubmitNew) {
      if (!agreed) setAgreeErr(true);
      return;
    }
    setAgreeErr(false);
    setFieldErr('');
    setChecking(true);
    if (HIDE_COMPANY_FEATURES) {
      var em = normEmail(email);
      if (em && !isValidEmail(em)) {
        setChecking(false);
        setFieldErr(t.emailInvalid || 'Email 格式不正確');
        return;
      }
      var lineUid = getMyLineUserId();
      if (lineUid && !pendingActivateSettings) gasLogFlowEnter(code, 'lineUidObtained', store).catch(() => {});
      gasLogFlowEnter(code, 'newDeviceSetup', store).catch(() => {});
      if (em) {
        try {
          var r = await gasEmailBackupCheck(code, em);
          if (r && r.ok && r.found) {
            setChecking(false);
            setRestoreOffer({
              updatedAt: r.updatedAt || ''
            });
            return;
          }
        } catch (_e) {}
      }
      setChecking(false);
      doActivate(baseSettings());
      return;
    }
    var syncAndActivate = async () => {
      try {
        await gasSyncProfile(code, {
          store,
          lang,
          gender,
          workStart,
          workEnd,
          shift,
          lockPwdEnc: lockPwdCred(code, pwd)
        });
      } catch (_e) {}
      doActivate(baseSettings());
    };
    try {
      var ctrl = new AbortController();
      var timer = setTimeout(() => ctrl.abort(), 5000);
      var res = await fetch('./admin.cfg', {
        cache: 'no-store',
        signal: ctrl.signal
      });
      clearTimeout(timer);
      if (res.ok) {
        var text = (await res.text()).trim();
        var lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        var myHash = adminHash(code);
        var match = lines.some(l => {
          var parts = l.split(':');
          var h = parts.length >= 2 ? parts[parts.length - 1] : parts[0];
          return h === myHash;
        });
        if (match) {
          await syncAndActivate();
          return;
        }
      }
    } catch (_e) {}
    try {
      var result = await checkApproved('t', approveHash(code, devId));
      if (result) {
        await syncAndActivate();
        return;
      }
    } catch (_e) {}
    try {
      var payload = {
        store,
        lang,
        gender,
        workStart,
        workEnd,
        shift,
        devId,
        lockPwdEnc: lockPwdCred(code, pwd)
      };
      var _r = await gasSubmitAction('N', code, payload);
      setChecking(false);
      if (_r && _r.ok) {
        setTicketSeq(_r.seq);
        setMode('newTicket');
        setTicketStatus('');
        setCooldown(0);
        savePending({
          mode: 'newTicket',
          ticketSeq: _r.seq,
          code,
          lang,
          store,
          gender,
          shift,
          workStart,
          workEnd,
          pwd
        });
      } else {
        setErr(_r && _r.error || '送出失敗,請檢查網路');
      }
    } catch (e) {
      setChecking(false);
      setErr(String(e));
    }
  };
  var checkTicket = async onApproved => {
    if (cooldown > 0 || ticketStatus === 'checking') return;
    setTicketStatus('checking');
    try {
      var myActionCode = mode === 'newTicket' ? 'N' : mode === 'forgotTicket' ? 'F' : '';
      var hasPreApprove = false;
      try {
        var pr = await fetch('./preapprove.json', {
          cache: 'no-store'
        });
        if (pr.ok) {
          var parr = await pr.json();
          hasPreApprove = parr.some(p => p.code === code && p.expiresAt > Date.now() && Array.isArray(p.actionCodes) && p.actionCodes.indexOf(myActionCode) >= 0);
        }
      } catch (_e) {}
      if (!hasPreApprove) {
        try {
          var res = await fetch('./actions.json', {
            cache: 'no-store'
          });
          if (res.ok) {
            var arr = await res.json();
            var found = arr.find(a => a.seq === ticketSeq);
            if (found && found.status !== 'approved') {
              setTicketStatus('pending');
              setCooldown(30);
              return;
            }
          }
        } catch (_e) {}
      }
      var r = await gasCheckAction(ticketSeq);
      if (r && r.ok) {
        if (r.status === 'approved') {
          setTicketStatus('approved');
          if (r.key) {
            try {
              setMyKey(code, r.key);
            } catch (_e) {}
          }
          onApproved && onApproved();
        } else {
          setTicketStatus('pending');
          setCooldown(30);
        }
      } else {
        setTicketStatus('error');
        setCooldown(30);
      }
    } catch (_e) {
      setTicketStatus('error');
      setCooldown(30);
    }
  };
  var doLogin = async () => {
    if (!code.trim() || !/^\d{4}$/.test(loginPwdInput)) {
      setErr(t.pwdLoginFail);
      return;
    }
    setChecking(true);
    setErr('');
    try {
      var cred = lockPwdCred(code, loginPwdInput);
      var r = await gasLoginPwd(code, cred);
      setChecking(false);
      if (r && r.ok) {
        var activated = {
          code: r.code || code,
          unitPrice: r.unitPrice || 250,
          unitPriceHistory: r.unitPriceHistory || [],
          lang: r.lang || lang,
          store: r.store || store,
          year: bizParts().y,
          deviceId: devId,
          gender: r.gender || '',
          workStart: r.workStart || '',
          workEnd: r.workEnd || '',
          shift: r.shift || '',
          lockPwd: loginPwdInput
        };
        if (HIDE_COMPANY_FEATURES) gasLogFlowEnter(r.code || code, 'pwdLogin', r.store || store).catch(() => {});
        doActivate(activated);
      } else if (r && r.reason === 'left') {
        setMode('reinstateAsk');
      } else {
        setErr(r && r.error ? t.pwdLoginFail + '（' + r.error + '）' : t.pwdLoginFail);
      }
    } catch (e) {
      setChecking(false);
      setErr(t.pwdLoginFail + '（' + e + '）');
    }
  };
  var forgotPinOk = isValidPin(forgotPwd);
  var canSubmitForgot = code.trim() && forgotPinOk && forgotPwd === forgotPwd2;
  var [loginNotice, setLoginNotice] = useState('');
  var submitForgot = async () => {
    if (!canSubmitForgot) return;
    setFieldErr('');
    setChecking(true);
    setErr('');
    try {
      var chk = await gasCheckCode(code);
      if (chk && chk.ok && chk.status === 'left') {
        setChecking(false);
        setMode('reinstateAsk');
        return;
      }
      var payload = {
        devId,
        lang,
        lockPwdEnc: lockPwdCred(code, forgotPwd)
      };
      var r = await gasSubmitAction('F', code, payload);
      setChecking(false);
      if (r && r.ok) {
        setTicketSeq(r.seq);
        setMode('forgotTicket');
        setTicketStatus('');
        setCooldown(0);
        savePending({
          mode: 'forgotTicket',
          ticketSeq: r.seq,
          code,
          lang,
          store,
          gender,
          shift,
          workStart,
          workEnd,
          forgotPwd
        });
      } else {
        setErr(r && r.error || '送出失敗');
      }
    } catch (e) {
      setChecking(false);
      setErr(String(e));
    }
  };
  var onForgotApproved = async () => {
    try {
      var cred = lockPwdCred(code, forgotPwd);
      var r = await gasLoginPwd(code, cred);
      if (r && r.ok) {
        doActivate({
          code: r.code || code,
          unitPrice: r.unitPrice || 250,
          unitPriceHistory: r.unitPriceHistory || [],
          lang: r.lang || lang,
          store: r.store || store,
          year: bizParts().y,
          deviceId: devId,
          gender: r.gender || '',
          workStart: r.workStart || '',
          workEnd: r.workEnd || '',
          shift: r.shift || '',
          lockPwd: forgotPwd
        });
      } else if (r && r.reason === 'left') {
        setMode('reinstateAsk');
      } else {
        setErr(r && r.error ? t.pwdLoginFail + '（' + r.error + '）' : t.pwdLoginFail);
      }
    } catch (e) {
      setErr(t.pwdLoginFail + '（' + e + '）');
    }
  };
  var submitReinstate = async () => {
    setChecking(true);
    setErr('');
    try {
      var r = await gasSubmitAction('R', code, {
        devId
      });
      setChecking(false);
      if (r && r.ok) {
        setTicketSeq(r.seq);
        setMode('reinstateTicket');
        setTicketStatus('');
        setCooldown(0);
        savePending({
          mode: 'reinstateTicket',
          ticketSeq: r.seq,
          code,
          lang,
          store,
          gender,
          shift,
          workStart,
          workEnd
        });
      } else {
        setErr(r && r.error || '送出失敗');
      }
    } catch (e) {
      setChecking(false);
      setErr(String(e));
    }
  };
  var onReinstateApproved = () => {
    clearPending();
    setLoginNotice(t.reinstateApprovedMsg);
    setMode('login');
    setErr('');
    setFieldErr('');
  };
  var ticketBlock = (prefixKey, titleKey, onApproved) => React.createElement("div", {
    className: "space-y-4"
  }, React.createElement("div", {
    className: "bg-white/[0.03] rounded-xl p-4 text-center"
  }, React.createElement("p", {
    className: "text-xs text-amber-400 font-semibold mb-3"
  }, t[titleKey]), React.createElement("p", {
    className: "text-[11px] text-gray-500 mb-1"
  }, t.ticketInfoTeacher), React.createElement("p", {
    className: "text-2xl font-bold text-gray-100 mb-3"
  }, code), React.createElement("p", {
    className: "text-[11px] text-gray-500 mb-1"
  }, t.ticketCode), React.createElement("p", {
    className: "text-base font-semibold text-amber-400 font-mono tracking-widest select-all"
  }, ticketSeq)), React.createElement("button", {
    onClick: () => {
      var link = buildReqLink(AUTH_LIFF_BASE, ticketSeq);
      var zhMsg = (T.zh[prefixKey] || '').replace('{code}', code);
      var isVi = ticketSeq && ticketSeq[1] === '2';
      var viMsg = isVi ? (T.vi[prefixKey] || '').replace('{code}', code) : '';
      sendTicketFlex('🔑 審核通知', zhMsg, link, viMsg);
    },
    className: "w-full px-3 py-4 rounded-xl text-base font-bold bg-[#06C755] text-white active:bg-[#05b34c]"
  }, t.ticketSend), React.createElement("div", {
    className: "space-y-2"
  }, React.createElement("button", {
    onClick: () => checkTicket(onApproved),
    disabled: cooldown > 0 || ticketStatus === 'checking',
    className: `w-full py-3.5 rounded-xl font-bold transition-all ${cooldown > 0 || ticketStatus === 'checking' ? 'bg-white/[0.06] text-gray-600 cursor-not-allowed' : 'bg-amber-600 text-white'}`
  }, ticketStatus === 'checking' ? t.ticketChecking : cooldown > 0 ? fmtLog(t.ticketWaitCountdown, [String(cooldown)]) : t.ticketCheckBtn), ticketStatus === 'pending' && React.createElement("p", {
    className: "text-xs text-gray-500 text-center"
  }, t.ticketPending), ticketStatus === 'error' && React.createElement("p", {
    className: "text-xs text-red-400 text-center"
  }, t.pwdLoginFail), err && React.createElement("p", {
    className: "text-xs text-red-400 text-center"
  }, err)), React.createElement("button", {
    onClick: goChoice,
    className: "w-full py-2.5 rounded-xl bg-white/[0.05] text-gray-400 text-sm font-semibold"
  }, t.backToChoice));
  var OB_CSS = `.ob-line{background:#fff !important;color:#111}.ob-line .text-gray-100,.ob-line .text-gray-200{color:#111 !important}.ob-line .text-gray-300{color:#333 !important}.ob-line .text-gray-400{color:#6b6b70 !important}.ob-line .text-gray-500{color:#8e8e93 !important}.ob-line .text-gray-600{color:#a8a8ae !important}.ob-line [class*="bg-white/["]{background-color:#f5f6f7 !important}.ob-line [class*="border-white"]{border-color:#e5e5e5 !important}.ob-line [class*="bg-amber-600"]{background-color:#06c755 !important;color:#fff !important}.ob-line .text-amber-300,.ob-line .text-amber-400{color:#06a847 !important}.ob-line .text-amber-300\\/90{color:#06a847 !important}.ob-line .text-red-400,.ob-line [class*="text-red-400"]{color:#e5352b !important}.ob-line .text-emerald-500{color:#06a847 !important}.ob-line input,.ob-line select{color:#111 !important;background:#fff !important;border-color:#e5e5e5 !important}.ob-line [class*="bg-gray-900"]{background:#fff !important}.ob-line [class*="border-white/[0.2]"]{border-color:#c4c4c8 !important}.ob-line .text-white{color:#fff !important}.ob-line button[disabled]{background:#e9e9ec !important;color:#a8a8ae !important}.ob-line .ob-card{background:#f5f6f7 !important}.ob-line .ob-green{color:#06c755 !important}.ob-line [class*="bg-emerald-600"]{background-color:#06c755 !important}`;
  var obReason = !canSubmitNew && !checking ? !code.trim() || code.length < 3 ? lang === 'zh' ? '請先輸入 3 碼老師編號' : 'Hãy nhập mã 3 chữ số' : !agreed ? lang === 'zh' ? '還差:勾選「我已閱讀以上說明」' : 'Còn thiếu: tích "Tôi đã đọc các hướng dẫn trên"' : '' : '';
  return React.createElement("div", {
    className: "ob-line min-h-screen flex items-center justify-center p-6 bg-gray-950"
  }, React.createElement("style", null, OB_CSS), React.createElement("div", {
    className: "w-full max-w-sm fi"
  }, ['new', 'login', 'forgot', 'reinstateAsk'].includes(mode) && React.createElement("button", {
    onClick: goChoice,
    "aria-label": "back",
    className: "w-11 h-11 -ml-3 mb-1 flex items-center justify-center text-3xl font-light text-gray-200"
  }, "‹"), false && React.createElement("div", {
    className: "text-center mb-6"
  }, React.createElement("div", {
    className: "w-16 h-16 bg-amber-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
  }, React.createElement("svg", {
    className: "w-8 h-8 text-amber-400",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.5,
    d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
  }))), React.createElement("h1", {
    className: "text-xl font-bold text-gray-100 mb-1"
  }, t.welcome)), mode === "choice" && React.createElement("h1", {
    className: "text-[28px] leading-tight font-extrabold text-gray-100 mb-6 pt-2"
  }, t.welcome), mode === 'choice' && React.createElement("div", {
    className: "space-y-3"
  }, React.createElement("div", {
    className: "flex justify-end gap-5 -mt-1 mb-2"
  }, [['zh', '中文'], ['vi', 'Tiếng Việt']].map(([c, l]) => React.createElement("button", {
    key: c,
    onClick: () => setLang(c),
    className: `min-h-[44px] text-sm font-semibold border-b-2 ${lang === c ? 'text-gray-100 border-[#06c755]' : 'text-gray-500 border-transparent'}`
  }, l))), React.createElement(LineRestoreBox, {
    lang: lang
  }), HIDE_COMPANY_FEATURES ? React.createElement("button", {
    onClick: () => {
      setMode('new');
      setCodeCheck('new');
    },
    className: "w-full py-4 rounded-xl font-bold text-lg bg-amber-600 text-white mt-2"
  }, t.startUseBtn || '開始使用') : React.createElement(React.Fragment, null, React.createElement("button", {
    onClick: () => {
      setMode('new');
      setCodeCheck(null);
    },
    className: "w-full py-4 rounded-xl font-bold text-lg bg-amber-600 text-white mt-2"
  }, t.flowNew), React.createElement("button", {
    onClick: () => {
      setMode('login');
      setErr('');
      setCodeCheck(null);
    },
    className: "w-full py-4 rounded-xl font-bold text-lg bg-white/[0.06] text-gray-200"
  }, t.flowLogin))), mode === 'new' && (() => {
    var locked = codeCheck !== 'new';
    return React.createElement("div", {
      className: "space-y-5"
    }, React.createElement("div", {
      className: "space-y-2"
    }, React.createElement("label", {
      className: "text-sm text-gray-400 block text-center"
    }, t.teacherCode), React.createElement("div", {
      className: "relative flex justify-center"
    }, React.createElement(PinDotsClickable, {
      length: code.length,
      total: 3,
      digits: code,
      active: activeField === 'code',
      onClick: () => toggleField('code'),
      onClear: codeClear
    }), activeField === 'code' && React.createElement("div", {
      className: "absolute z-30 top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900 border border-white/[0.1] rounded-xl p-2.5 shadow-2xl"
    }, React.createElement(PinKeypadCompact, {
      onDigit: codeDigit,
      onBackspace: codeBackspace
    }))), !HIDE_COMPANY_FEATURES && React.createElement("button", {
      onClick: doCheckCode,
      disabled: !code.trim() || codeCheck === 'checking' || codeCheck === 'new',
      className: `w-full py-3 rounded-xl text-sm font-bold ${codeCheck === 'new' ? 'bg-emerald-600 text-white' : code.trim() ? 'bg-amber-600 text-white' : 'bg-white/[0.06] text-gray-600'}`
    }, codeCheck === 'checking' ? t.checkingCode : codeCheck === 'new' ? '✓' : t.checkCodeBtn), !HIDE_COMPANY_FEATURES && codeCheck === 'new' && React.createElement("p", {
      className: "text-xs text-emerald-500 mt-1.5 text-center"
    }, t.codeAvailHint), codeCheck === 'error' && React.createElement("p", {
      className: "text-xs text-red-400 mt-1.5 text-center"
    }, err)), React.createElement("fieldset", {
      disabled: locked,
      className: locked ? 'opacity-40 space-y-5 pointer-events-none' : 'space-y-5'
    }, React.createElement("div", null, React.createElement("label", {
      className: "text-sm text-gray-400 mb-1.5 block"
    }, t.store), React.createElement("select", {
      value: store,
      onChange: e => setStore(e.target.value),
      className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-3.5 text-lg text-gray-100 focus:outline-none focus:border-amber-500 appearance-none"
    }, stores.map(s => React.createElement("option", {
      key: s,
      value: s
    }, s)))), !HIDE_COMPANY_FEATURES && React.createElement("div", null, React.createElement("label", {
      className: "text-sm text-gray-400 mb-1.5 block"
    }, t.gender), React.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, [['M', t.genderM], ['F', t.genderF]].map(([g, l]) => React.createElement("button", {
      key: g,
      onClick: () => setGender(g),
      className: `py-3 rounded-xl text-sm font-semibold transition-all ${gender === g ? 'bg-amber-600 text-white' : 'bg-white/[0.04] text-gray-500'}`
    }, l)))), !HIDE_COMPANY_FEATURES && React.createElement("div", null, React.createElement("label", {
      className: "text-sm text-gray-400 mb-1.5 block"
    }, t.shiftLabel), React.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, [['day', t.shiftDay], ['night', t.shiftNight]].map(([sv, l]) => React.createElement("button", {
      key: sv,
      onClick: () => setShift(sv),
      className: `py-3 rounded-xl text-sm font-semibold transition-all ${shift === sv ? 'bg-amber-600 text-white' : 'bg-white/[0.04] text-gray-500'}`
    }, l)))), !HIDE_COMPANY_FEATURES && React.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, React.createElement("div", null, React.createElement("label", {
      className: "text-sm text-gray-400 mb-1.5 block"
    }, t.workStart), React.createElement("select", {
      value: workStart,
      onChange: e => onWorkStartChange(e.target.value),
      className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-3.5 text-base text-center text-gray-100 focus:outline-none focus:border-amber-500 appearance-none"
    }, TIME_OPTS.map(o => React.createElement("option", {
      key: o,
      value: o
    }, o)))), React.createElement("div", null, React.createElement("label", {
      className: "text-sm text-gray-400 mb-1.5 block"
    }, t.workEnd), React.createElement("select", {
      value: workEnd,
      onChange: e => onWorkEndChange(e.target.value),
      className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-3.5 text-base text-center text-gray-100 focus:outline-none focus:border-amber-500 appearance-none"
    }, TIME_OPTS.map(o => React.createElement("option", {
      key: o,
      value: o
    }, o))))), !HIDE_COMPANY_FEATURES && React.createElement("div", {
      className: "space-y-3"
    }, React.createElement("label", {
      className: "text-sm text-gray-400 mb-1.5 block text-center"
    }, t.lockPwdTitle), React.createElement("div", {
      className: "space-y-1.5"
    }, React.createElement("p", {
      className: "text-[11px] text-gray-600 text-center"
    }, t.lockPwdHint), React.createElement("div", {
      className: "relative flex justify-center"
    }, React.createElement(PinDotsClickable, {
      length: pwd.length,
      total: 4,
      active: activeField === 'pwd1',
      onClick: () => toggleField('pwd1'),
      onClear: pwdClear
    }), activeField === 'pwd1' && React.createElement("div", {
      className: "absolute z-30 top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900 border border-white/[0.1] rounded-xl p-2.5 shadow-2xl"
    }, React.createElement(PinKeypadCompact, {
      onDigit: pwdDigit,
      onBackspace: pwdBackspace
    })))), React.createElement("div", {
      className: "space-y-1.5"
    }, React.createElement("p", {
      className: "text-[11px] text-gray-600 text-center"
    }, t.lockPwdConfirm), React.createElement("div", {
      className: "relative flex justify-center"
    }, React.createElement(PinDotsClickable, {
      length: pwd2.length,
      total: 4,
      active: activeField === 'pwd2',
      onClick: () => toggleField('pwd2'),
      onClear: pwd2Clear
    }), activeField === 'pwd2' && React.createElement("div", {
      className: "absolute z-30 top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900 border border-white/[0.1] rounded-xl p-2.5 shadow-2xl"
    }, React.createElement(PinKeypadCompact, {
      onDigit: pwd2Digit,
      onBackspace: pwd2Backspace
    })))), pwd.length === 4 && !pinOk && React.createElement("p", {
      className: "text-xs text-red-400 text-center"
    }, t.lockPwdInvalid), pwd2.length === 4 && pwd !== pwd2 && React.createElement("p", {
      className: "text-xs text-red-400 text-center"
    }, t.lockPwdMismatch)), React.createElement(NoticeBox, {
      t: t,
      agreed: agreed,
      setAgreed: v => {
        setAgreed(v);
        if (v) setAgreeErr(false);
      }
    })), obReason && React.createElement("p", {
      className: "text-sm text-orange-500 font-semibold text-center -mb-2"
    }, obReason), React.createElement("button", {
      onClick: submitNew,
      disabled: !canSubmitNew || checking,
      className: `w-full min-h-[56px] rounded-xl font-bold text-lg transition-all ${canSubmitNew && !checking ? 'bg-amber-600 text-white' : 'bg-white/[0.06] text-gray-600 cursor-not-allowed'}`
    }, checking ? t.adminWelcome : t.submitActivation), agreeErr && React.createElement("p", {
      className: "text-xs text-red-400 text-center -mt-3"
    }, t.mustReadFirst), fieldErr && React.createElement("p", {
      className: "text-xs text-red-400 text-center -mt-3"
    }, fieldErr), err && codeCheck !== 'error' && React.createElement("p", {
      className: "text-red-400 text-sm text-center fi"
    }, err), React.createElement("button", {
      onClick: goChoice,
      className: "w-full py-2.5 rounded-xl bg-white/[0.05] text-gray-400 text-sm font-semibold"
    }, t.backToChoice));
  })(), restoreOffer && React.createElement("div", {
    className: "fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-6"
  }, React.createElement("div", {
    className: "w-full max-w-sm bg-gray-900 border border-white/[0.1] rounded-2xl p-5 space-y-4"
  }, React.createElement("p", {
    className: "text-base font-bold text-gray-100 text-center"
  }, t.emailRestoreTitle), React.createElement("p", {
    className: "text-sm text-gray-300 leading-relaxed text-center"
  }, (t.emailRestoreBody || '').replace('{0}', restoreOffer.updatedAt || '-')), restoreErr && React.createElement("p", {
    className: "text-xs text-red-400 text-center"
  }, restoreErr), React.createElement("button", {
    onClick: doEmailRestoreNow,
    disabled: restoreBusy,
    className: "w-full py-3 rounded-xl bg-amber-600 text-white font-bold disabled:opacity-60"
  }, restoreBusy ? t.emailRestoring : t.emailRestoreBtn), React.createElement("button", {
    onClick: skipEmailRestore,
    disabled: restoreBusy,
    className: "w-full py-2.5 rounded-xl bg-white/[0.06] text-gray-300 text-sm font-semibold disabled:opacity-60"
  }, t.emailSkipBtn))), mode === 'newTicket' && ticketBlock('lineTicketNewPrefix', 'ticketPendingNewTitle', () => doActivate(baseSettings())), mode === 'login' && React.createElement("div", {
    className: "space-y-4"
  }, React.createElement("p", {
    className: "text-sm text-amber-400 text-center font-medium"
  }, codeCheck === 'exists' ? t.codeExistsHint : t.pwdLoginHint), loginNotice && React.createElement("p", {
    className: "text-sm text-emerald-500 text-center font-semibold"
  }, "✓ ", loginNotice), React.createElement("div", {
    className: "space-y-2"
  }, React.createElement("label", {
    className: "text-sm text-gray-400 block text-center"
  }, t.teacherCode), React.createElement("div", {
    className: "relative flex justify-center"
  }, React.createElement(PinDotsClickable, {
    length: code.length,
    total: 3,
    digits: code,
    active: activeField === 'code',
    onClick: () => toggleField('code'),
    onClear: () => {
      codeClear();
      setLoginNotice('');
    }
  }), activeField === 'code' && React.createElement("div", {
    className: "absolute z-30 top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900 border border-white/[0.1] rounded-xl p-2.5 shadow-2xl"
  }, React.createElement(PinKeypadCompact, {
    onDigit: codeDigit,
    onBackspace: () => {
      codeBackspace();
      setLoginNotice('');
    }
  })))), React.createElement("div", {
    className: "space-y-2"
  }, React.createElement("label", {
    className: "text-sm text-gray-400 block text-center"
  }, t.pwdInputPh), React.createElement("div", {
    className: "relative flex justify-center"
  }, React.createElement(PinDotsClickable, {
    length: loginPwdInput.length,
    total: 4,
    active: activeField === 'loginPwd',
    onClick: () => toggleField('loginPwd'),
    onClear: loginPwdClear
  }), activeField === 'loginPwd' && React.createElement("div", {
    className: "absolute z-30 top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900 border border-white/[0.1] rounded-xl p-2.5 shadow-2xl"
  }, React.createElement(PinKeypadCompact, {
    onDigit: loginPwdDigit,
    onBackspace: loginPwdBackspace
  })))), err && React.createElement("p", {
    className: "text-red-400 text-sm text-center fi"
  }, err), React.createElement("button", {
    onClick: doLogin,
    disabled: checking || !code.trim() || loginPwdInput.length !== 4,
    className: `w-full py-4 rounded-xl font-bold text-lg transition-all ${!checking && code.trim() && loginPwdInput.length === 4 ? 'bg-amber-600 text-white' : 'bg-white/[0.06] text-gray-600 cursor-not-allowed'}`
  }, checking ? t.adminWelcome : t.pwdLoginBtn), React.createElement("button", {
    onClick: () => {
      setMode('forgot');
      setErr('');
      setFieldErr('');
    },
    className: "w-full text-center text-xs text-gray-500 underline"
  }, t.forgotPwdLink), React.createElement("button", {
    onClick: goChoice,
    className: "w-full py-2.5 rounded-xl bg-white/[0.05] text-gray-400 text-sm font-semibold"
  }, t.backToChoice)), mode === 'forgot' && React.createElement("div", {
    className: "space-y-4"
  }, React.createElement("p", {
    className: "text-sm text-amber-400 text-center font-medium"
  }, t.forgotPwdHint), React.createElement("div", {
    className: "space-y-2"
  }, React.createElement("label", {
    className: "text-sm text-gray-400 block text-center"
  }, t.teacherCode), React.createElement("div", {
    className: "relative flex justify-center"
  }, React.createElement(PinDotsClickable, {
    length: code.length,
    total: 3,
    digits: code,
    active: activeField === 'code',
    onClick: () => toggleField('code'),
    onClear: codeClear
  }), activeField === 'code' && React.createElement("div", {
    className: "absolute z-30 top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900 border border-white/[0.1] rounded-xl p-2.5 shadow-2xl"
  }, React.createElement(PinKeypadCompact, {
    onDigit: codeDigit,
    onBackspace: codeBackspace
  })))), React.createElement("div", {
    className: "space-y-3"
  }, React.createElement("label", {
    className: "text-sm text-gray-400 mb-1.5 block text-center"
  }, t.newPwdTitle), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement("p", {
    className: "text-[11px] text-gray-600 text-center"
  }, t.newPwdHint), React.createElement("div", {
    className: "relative flex justify-center"
  }, React.createElement(PinDotsClickable, {
    length: forgotPwd.length,
    total: 4,
    active: activeField === 'forgotPwd1',
    onClick: () => toggleField('forgotPwd1'),
    onClear: forgotPwdClear
  }), activeField === 'forgotPwd1' && React.createElement("div", {
    className: "absolute z-30 top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900 border border-white/[0.1] rounded-xl p-2.5 shadow-2xl"
  }, React.createElement(PinKeypadCompact, {
    onDigit: forgotPwdDigit,
    onBackspace: forgotPwdBackspace
  })))), React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement("p", {
    className: "text-[11px] text-gray-600 text-center"
  }, t.lockPwdConfirm), React.createElement("div", {
    className: "relative flex justify-center"
  }, React.createElement(PinDotsClickable, {
    length: forgotPwd2.length,
    total: 4,
    active: activeField === 'forgotPwd2',
    onClick: () => toggleField('forgotPwd2'),
    onClear: forgotPwd2Clear
  }), activeField === 'forgotPwd2' && React.createElement("div", {
    className: "absolute z-30 top-full left-1/2 -translate-x-1/2 mt-2 bg-gray-900 border border-white/[0.1] rounded-xl p-2.5 shadow-2xl"
  }, React.createElement(PinKeypadCompact, {
    onDigit: forgotPwd2Digit,
    onBackspace: forgotPwd2Backspace
  })))), forgotPwd.length === 4 && !forgotPinOk && React.createElement("p", {
    className: "text-xs text-red-400 text-center"
  }, t.lockPwdInvalid), forgotPwd2.length === 4 && forgotPwd !== forgotPwd2 && React.createElement("p", {
    className: "text-xs text-red-400 text-center"
  }, t.lockPwdMismatch)), err && React.createElement("p", {
    className: "text-red-400 text-sm text-center fi"
  }, err), React.createElement("button", {
    onClick: submitForgot,
    disabled: checking || !canSubmitForgot,
    className: `w-full py-4 rounded-xl font-bold text-lg transition-all ${!checking && canSubmitForgot ? 'bg-amber-600 text-white' : 'bg-white/[0.06] text-gray-600 cursor-not-allowed'}`
  }, checking ? t.adminWelcome : t.submitActivation), React.createElement("button", {
    onClick: goChoice,
    className: "w-full py-2.5 rounded-xl bg-white/[0.05] text-gray-400 text-sm font-semibold"
  }, t.backToChoice)), mode === 'forgotTicket' && ticketBlock('lineTicketForgotPrefix', 'ticketPendingForgotTitle', onForgotApproved), mode === 'reinstateAsk' && React.createElement("div", {
    className: "space-y-4"
  }, React.createElement("p", {
    className: "text-sm text-amber-400 text-center font-medium"
  }, t.accountLeftMsg), React.createElement("p", {
    className: "text-xs text-gray-500 text-center"
  }, t.reinstateHint), err && React.createElement("p", {
    className: "text-red-400 text-sm text-center fi"
  }, err), React.createElement("button", {
    onClick: submitReinstate,
    disabled: checking,
    className: "w-full py-4 rounded-xl font-bold text-lg bg-amber-600 text-white disabled:opacity-50"
  }, checking ? t.adminWelcome : t.reinstateBtn), React.createElement("button", {
    onClick: goChoice,
    className: "w-full py-2.5 rounded-xl bg-white/[0.05] text-gray-400 text-sm font-semibold"
  }, t.backToChoice)), mode === 'reinstateTicket' && ticketBlock('lineTicketReinstatePrefix', 'ticketTypeR', onReinstateApproved)));
}
function infoFieldLabel(key, t) {
  var m = {
    nameZh: t.nameZh,
    nameVi: t.nameVi,
    gender: t.gender,
    gloveSize: t.gloveSize || '手套尺寸',
    phone: t.custPhone || '電話',
    email: t.email,
    addrCity: '縣市',
    addrDist: '鄉鎮區',
    addrDetail: '詳細地址',
    school: t.school,
    major: t.major,
    permitNo: t.permitNo,
    permitDate: t.permitDate,
    permitExpiry: '工作證到期日',
    permitOrg: t.permitOrgOpt || '核發單位',
    storeSel: t.store,
    shift: t.shiftLabel || '班別',
    workStart: t.workStart,
    workEnd: t.workEnd,
    workNote: t.workNote,
    techMentor: t.techMentor,
    lockerNo: t.lockerNo,
    unitPrice: t.unitPrice,
    preg: t.pregClient,
    oil: t.oilLabel,
    skills: t.skills
  };
  return m[key] || key;
}
var CITY_PRIORITY = ['桃園市', '新北市', '臺北市', '宜蘭縣'];
var CITY_OPTIONS = [...CITY_PRIORITY, ...Object.keys(TW_REGIONS).filter(c => !CITY_PRIORITY.includes(c))];
var BASIC_FIELD_KEYS = ['nameZh', 'gender', 'gloveSize', 'phone', 'email', 'addrCity', 'addrDist', 'addrDetail', 'nameVi', 'permitNo', 'permitDate', 'permitExpiry', 'permitOrg', 'school', 'major'];
var BASIC_FIELD_LAYOUT = ['nameZh', 'gender', 'gloveSize', 'phone', 'email', 'addrCity', 'addrDist', 'addrDetail', '__divider_foreign__', 'nameVi', 'permitNo', 'permitDate', 'permitExpiry', 'permitOrg', 'school', 'major'];
var STORE_FIELD_KEYS = ['storeSel', 'shift', 'workStart', 'workEnd', 'workNote', 'unitPrice', 'skills', 'preg', 'oil', 'techMentor', 'lockerNo'];
var PF_ALERT_FIELDS = ['gender', 'nameZh', 'nameVi', 'phone', 'email', 'addrCity', 'addrDist', 'addrDetail', 'school', 'major', 'schoolType', 'permitNo', 'permitDate', 'permitExpiry', 'permitOrg'];
var SF_ALERT_FIELDS = ['storeSel', 'shift', 'workStart', 'workEnd', 'workNote', 'unitPrice', 'skills', 'preg', 'oil', 'techMentor', 'lockerNo'];
var INFO_UNLOCK_KEY_PREFIX = 'notice-pwd-unlock-';
function getInfoUnlockTs(code) {
  try {
    return parseInt(localStorage.getItem(INFO_UNLOCK_KEY_PREFIX + code) || '0', 10) || 0;
  } catch (_e) {
    return 0;
  }
}
function setInfoUnlockTs(code) {
  try {
    localStorage.setItem(INFO_UNLOCK_KEY_PREFIX + code, String(Date.now()));
  } catch (_e) {}
}
function getCachedKeyCheck(code) {
  try {
    var today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem('key-check-date-' + code) === today) return localStorage.getItem('key-check-result-' + code);
  } catch (_e) {}
  return null;
}
function setCachedKeyCheck(code, result) {
  try {
    var today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('key-check-date-' + code, today);
    localStorage.setItem('key-check-result-' + code, result);
  } catch (_e) {}
}
function PinDots({
  length,
  total
}) {
  var n = total || 4;
  return React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      justifyContent: 'center'
    }
  }, Array.from({
    length: n
  }).map((_, i) => React.createElement("div", {
    key: i,
    style: {
      width: 16,
      height: 16,
      borderRadius: '50%',
      border: '2px solid',
      borderColor: length > i ? '#f59e0b' : 'rgba(255,255,255,0.2)',
      backgroundColor: length > i ? '#f59e0b' : 'transparent'
    }
  })));
}
function PinKeypad({
  onDigit,
  onBackspace
}) {
  var btnStyle = {
    width: 64,
    height: 64,
    borderRadius: '50%',
    fontSize: 20,
    fontWeight: 600,
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#f3f4f6',
    border: 'none'
  };
  return React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 16,
      justifyItems: 'center'
    }
  }, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => k === '' ? React.createElement("div", {
    key: i
  }) : React.createElement("button", {
    key: i,
    onClick: () => k === '⌫' ? onBackspace() : onDigit(k),
    style: btnStyle
  }, k)));
}
function PinKeypadCompact({
  onDigit,
  onBackspace
}) {
  var BtnCls = "w-11 h-12 rounded-lg bg-white/[0.08] text-gray-100 text-base font-semibold active:opacity-80 flex items-center justify-center flex-shrink-0";
  return React.createElement("div", {
    className: "grid grid-cols-3 gap-5 justify-items-center max-w-[260px] mx-auto"
  }, ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(k => React.createElement("button", {
    key: k,
    onClick: () => onDigit(k),
    className: BtnCls
  }, k)), React.createElement("div", null), React.createElement("button", {
    onClick: () => onDigit('0'),
    className: BtnCls
  }, "0"), React.createElement("button", {
    onClick: onBackspace,
    className: BtnCls + " text-gray-400"
  }, "⌫"));
}
function PinDotsClickable({
  length,
  total,
  digits,
  active,
  onClick,
  onClear
}) {
  var n = total || 4;
  return React.createElement("div", {
    className: "flex items-center justify-center gap-2"
  }, React.createElement("button", {
    onClick: onClick,
    className: `flex gap-2.5 p-1.5 rounded-xl ${active ? 'bg-white/[0.06] ring-1 ring-amber-500/40' : ''}`
  }, Array.from({
    length: n
  }).map((_, i) => {
    var filled = length > i;
    var ch = digits && digits[i];
    return React.createElement("div", {
      key: i,
      className: `flex items-center justify-center rounded-full border-2 ${ch ? 'w-8 h-8 text-base font-bold' : 'w-4 h-4'} ${filled ? 'bg-amber-500 border-amber-500 text-white' : 'border-white/[0.2]'}`
    }, ch || '');
  })), length > 0 && React.createElement("button", {
    onClick: onClear,
    className: "w-6 h-6 rounded-full bg-white/[0.06] text-gray-500 text-xs flex items-center justify-center flex-shrink-0"
  }, "✕"));
}
function InfoEditModal({
  type,
  settings,
  t,
  onClose,
  onUpdateSettings,
  onLogout
}) {
  var code = settings.code;
  var actionCode = type === 'basic' ? 'B' : 'S';
  var fieldKeys = type === 'basic' ? BASIC_FIELD_KEYS : STORE_FIELD_KEYS;
  var layoutKeys = type === 'basic' ? BASIC_FIELD_LAYOUT : STORE_FIELD_KEYS;
  var titleText = type === 'basic' ? t.secBasic || '基本資料' : t.secStore || '店家資訊';
  var pendingKey = 'info-pending-' + type + '-' + code;
  var loadPendingT = () => {
    try {
      return JSON.parse(localStorage.getItem(pendingKey) || 'null');
    } catch (_e) {
      return null;
    }
  };
  var savePendingT = o => {
    try {
      localStorage.setItem(pendingKey, JSON.stringify(o));
    } catch (_e) {}
  };
  var clearPendingT = () => {
    try {
      localStorage.removeItem(pendingKey);
    } catch (_e) {}
  };
  var [pending] = useState(() => loadPendingT());
  var [stores, setStores] = useState(['龍山寺店']);
  useEffect(() => {
    if (type === 'store') loadStores().then(s => setStores(s));
  }, []);
  var initGate = () => {
    if (HIDE_COMPANY_FEATURES) return 'none';
    if (!code) return 'none';
    if (!settings.lockPwd) return 'checking';
    if (Date.now() - getInfoUnlockTs(code) > (settings.lockAutoTime || 60) * 60 * 1000) return 'locked';
    return 'none';
  };
  var [gate, setGate] = useState(initGate);
  var [verifyMode, setVerifyMode] = useState(false);
  useEffect(() => {
    if (gate !== 'checking') return;
    (async () => {
      try {
        var r = await gasCheckCode(code);
        setVerifyMode(!!(r && r.ok && r.hasLockPwd));
        setGate(r && r.ok && r.hasLockPwd ? 'locked' : 'setup');
      } catch (_e) {
        setGate('setup');
      }
    })();
  }, [gate]);
  var [keyCheck, setKeyCheck] = useState(null);
  var [setupStep, setSetupStep] = useState(1);
  var [setupPwd, setSetupPwd] = useState('');
  var [setupPwd1, setSetupPwd1] = useState('');
  var [setupErr, setSetupErr] = useState('');
  var [setupBusy, setSetupBusy] = useState(false);
  var [unlockInput, setUnlockInput] = useState('');
  var [unlockErr, setUnlockErr] = useState('');
  var [unlockShake, setUnlockShake] = useState(false);
  var [showForgotPwd, setShowForgotPwd] = useState(false);
  var [unlockBusy, setUnlockBusy] = useState(false);
  var [mode, setMode] = useState(() => pending ? 'ticket' : 'view');
  var initForm = () => {
    var f = {};
    fieldKeys.forEach(k => {
      if (k === 'skills') {
        f[k] = settings[k] || {};
        return;
      }
      f[k] = settings[k] != null ? String(settings[k]) : k === 'gloveSize' ? 'M' : '';
    });
    return f;
  };
  var [form, setForm] = useState(initForm);
  var [ticketSeq, setTicketSeq] = useState(() => pending ? pending.seq : '');
  var [changedList, setChangedList] = useState(() => pending ? pending.changed : []);
  var [ticketStatus, setTicketStatus] = useState('');
  var [cooldown, setCooldown] = useState(0);
  var [err, setErr] = useState('');
  var [busy, setBusy] = useState(false);
  var [rejectReason, setRejectReason] = useState('');
  var [showLeave, setShowLeave] = useState(false);
  var [leaveBusy, setLeaveBusy] = useState(false);
  var [leaveDone, setLeaveDone] = useState(false);
  var [leaveErr, setLeaveErr] = useState('');
  var [priceAskModal, setPriceAskModal] = useState(null);
  var [priceFromDate, setPriceFromDate] = useState(() => {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  });
  var doLeave = async () => {
    setLeaveBusy(true);
    setLeaveErr('');
    try {
      var r = await gasLeaveTeacher(code, code);
      if (r && r.ok) {
        setLeaveDone(true);
      } else {
        setLeaveErr(r && r.error || t.leaveFail);
      }
    } catch (e) {
      setLeaveErr(t.leaveFail);
    }
    setLeaveBusy(false);
  };
  useEffect(() => {
    if (cooldown <= 0) return;
    var tm = setTimeout(() => setCooldown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearTimeout(tm);
  }, [cooldown]);
  useEffect(() => {
    if (gate !== 'none') {
      return;
    }
    if (!code || !hasMyKey(code)) {
      setKeyCheck('ok');
      return;
    }
    var cached = getCachedKeyCheck(code);
    if (cached) {
      setKeyCheck(cached);
      return;
    }
    setKeyCheck('checking');
    (async () => {
      try {
        var key = getMyKey(code);
        var r = await gasVerifyKey(code, key);
        var result = r && r.ok && r.valid ? 'ok' : 'invalid';
        setKeyCheck(result);
        setCachedKeyCheck(code, result);
      } catch (_e) {
        setKeyCheck('ok');
      }
    })();
  }, [gate]);
  var finishSetup = async pwd => {
    setSetupErr('');
    setSetupBusy(true);
    var updated = Object.assign({}, settings, {
      lockPwd: pwd
    });
    try {
      LS.set('app-settings', updated);
    } catch (_e) {}
    if (onUpdateSettings) onUpdateSettings(updated);
    setInfoUnlockTs(code);
    setSetupBusy(false);
    setGate('none');
    try {
      var cred = lockPwdCred(code, pwd);
      gasSetInitialPwd(code, cred);
    } catch (_e) {}
  };
  var pressSetupDigit = d => {
    var next = (setupPwd + d).slice(0, 4);
    setSetupPwd(next);
    if (next.length === 4) {
      if (setupStep === 1) {
        if (!isValidPin(next)) {
          setSetupErr(t.lockPwdInvalid);
          setSetupPwd('');
          return;
        }
        setSetupPwd1(next);
        setSetupStep(2);
        setSetupPwd('');
        setSetupErr('');
      } else {
        if (next !== setupPwd1) {
          setSetupErr(t.lockPwdMismatch);
          setSetupStep(1);
          setSetupPwd('');
          setSetupPwd1('');
          return;
        }
        finishSetup(next);
      }
    }
  };
  var pressUnlockDigit = d => {
    var next = (unlockInput + d).slice(0, 4);
    setUnlockInput(next);
    if (next.length === 4) {
      if (verifyMode) {
        setUnlockBusy(true);
        (async () => {
          try {
            var cred = lockPwdCred(code, next);
            var r = await gasLoginPwd(code, cred);
            if (r && r.ok) {
              var updated = Object.assign({}, settings, {
                lockPwd: next
              });
              try {
                LS.set('app-settings', updated);
              } catch (_e) {}
              if (onUpdateSettings) onUpdateSettings(updated);
              setInfoUnlockTs(code);
              setUnlockErr('');
              setUnlockBusy(false);
              setGate('none');
            } else {
              setUnlockBusy(false);
              setUnlockErr(r && r.error || t.noticePwdWrong || '密碼錯誤');
              setUnlockShake(true);
              setTimeout(() => {
                setUnlockShake(false);
                setUnlockInput('');
              }, 500);
            }
          } catch (e) {
            setUnlockBusy(false);
            setUnlockErr(String(e));
            setUnlockShake(true);
            setTimeout(() => {
              setUnlockShake(false);
              setUnlockInput('');
            }, 500);
          }
        })();
        return;
      }
      if (next === settings.lockPwd) {
        setInfoUnlockTs(code);
        setUnlockErr('');
        setGate('none');
      } else {
        setUnlockErr(t.noticePwdWrong || '密碼錯誤');
        setUnlockShake(true);
        setTimeout(() => {
          setUnlockShake(false);
          setUnlockInput('');
        }, 500);
      }
    }
  };
  var startEdit = () => {
    setForm(initForm());
    setMode('edit');
  };
  var cancelEdit = () => {
    setForm(initForm());
    setMode('view');
  };
  var backToEditAfterReject = () => {
    clearPendingT();
    var f = initForm();
    changedList.forEach(c => {
      f[c.key] = c.val;
    });
    setForm(f);
    setMode('edit');
    setTicketStatus('');
    setRejectReason('');
  };
  var submitEdit = async () => {
    if (keyCheck === 'invalid') {
      setErr(t.keyInvalidEditMsg);
      return;
    }
    var changed = {};
    var changedDisp = [];
    fieldKeys.forEach(k => {
      if (k === 'skills') {
        var _ov = JSON.stringify(settings.skills || {});
        var _nv = form.skills || {};
        if (_ov !== JSON.stringify(_nv)) {
          changed[k] = _nv;
          changedDisp.push({
            key: k,
            label: infoFieldLabel(k, t),
            val: SKILL_KEYS.filter(s => _nv[s]).map(s => t[s] || s).join('、') || '—'
          });
        }
        return;
      }
      var ov = String(settings[k] != null ? settings[k] : '');
      var nv = String(form[k] != null ? form[k] : '').trim();
      if (ov !== nv) {
        changed[k] = nv;
        changedDisp.push({
          key: k,
          label: infoFieldLabel(k, t),
          val: nv
        });
      }
    });
    if (Object.keys(changed).length === 0) {
      setMode('view');
      return;
    }
    if (changed.unitPrice !== undefined && Number(changed.unitPrice) !== Number(settings.unitPrice || 0)) {
      setPriceAskModal({
        changed,
        changedDisp
      });
      return;
    }
    await doSubmitTicket(changed, changedDisp);
  };
  var doSubmitTicket = async (changed, changedDisp, pendingPrice) => {
    if (HIDE_COMPANY_FEATURES) {
      var updated = {
        ...settings,
        ...changed
      };
      try {
        LS.set('app-settings', updated);
      } catch (_e) {}
      var snap = {};
      (type === 'basic' ? PF_ALERT_FIELDS : SF_ALERT_FIELDS).forEach(fk => {
        snap[fk] = updated[fk] !== undefined ? updated[fk] : '';
      });
      if (type === 'basic') updated.confirmedProfile = snap;else updated.confirmedStore = snap;
      try {
        LS.set('app-settings', updated);
      } catch (_e) {}
      if (onUpdateSettings) onUpdateSettings(updated);
      setChangedList(changedDisp);
      setMode('savedDirect');
      return;
    }
    setBusy(true);
    setErr('');
    try {
      var r = await gasSubmitAction(actionCode, code, changed);
      setBusy(false);
      if (r && r.ok) {
        setTicketSeq(r.seq);
        setChangedList(changedDisp);
        setMode('ticket');
        setTicketStatus('');
        setCooldown(0);
        savePendingT({
          seq: r.seq,
          changed: changedDisp,
          pendingPrice
        });
      } else {
        setErr(r && r.error || '送出失敗');
      }
    } catch (e) {
      setBusy(false);
      setErr(String(e));
    }
  };
  var applyPriceAll = () => {
    if (!priceAskModal) return;
    var {
      changed,
      changedDisp
    } = priceAskModal;
    var finalChanged = {
      ...changed,
      unitPriceHistory: []
    };
    setPriceAskModal(null);
    doSubmitTicket(finalChanged, changedDisp);
  };
  var applyPriceFrom = () => {
    if (!priceAskModal || !priceFromDate) return;
    var {
      changed,
      changedDisp
    } = priceAskModal;
    var newPrice = Number(changed.unitPrice);
    var history = [...(settings.unitPriceHistory || []).filter(h => h.from !== priceFromDate), {
      from: priceFromDate,
      price: newPrice
    }].sort((a, b) => a.from < b.from ? -1 : 1);
    var finalChanged = {
      ...changed,
      unitPriceHistory: history
    };
    delete finalChanged.unitPrice;
    var finalDisp = changedDisp.filter(c => c.key !== 'unitPrice');
    finalDisp.push({
      key: 'unitPriceHistory',
      label: t.unitPrice,
      val: priceFromDate + ' 起 ' + newPrice
    });
    setPriceAskModal(null);
    doSubmitTicket(finalChanged, finalDisp, {
      from: priceFromDate,
      price: newPrice
    });
  };
  var checkTicket = async () => {
    if (cooldown > 0 || ticketStatus === 'checking') return;
    setTicketStatus('checking');
    var applyResult = (st, payload) => {
      if (st === 'approved') {
        setTicketStatus('approved');
        var updated = Object.assign({}, settings, payload);
        var snap = {};
        (type === 'basic' ? PF_ALERT_FIELDS : SF_ALERT_FIELDS).forEach(fk => {
          snap[fk] = updated[fk] !== undefined ? updated[fk] : '';
        });
        if (type === 'basic') updated.confirmedProfile = snap;else updated.confirmedStore = snap;
        try {
          LS.set('app-settings', updated);
        } catch (_e) {}
        if (onUpdateSettings) onUpdateSettings(updated);
        clearPendingT();
        setTimeout(() => {
          if (onClose) onClose();
        }, 1200);
      } else if (st === 'rejected') {
        setTicketStatus('rejected');
        setRejectReason(payload && payload.rejectReason || '');
      } else {
        setTicketStatus('pending');
        setCooldown(30);
      }
    };
    try {
      try {
        var res = await fetch('./actions.json', {
          cache: 'no-store'
        });
        if (res.ok) {
          var arr = await res.json();
          var found = arr.find(a => a.seq === ticketSeq);
          if (found) {
            var payload = {};
            try {
              payload = JSON.parse(found.payload || '{}');
            } catch (_e) {}
            applyResult(found.status, payload);
            return;
          }
        }
      } catch (_e) {}
      var r = await gasCheckAction(ticketSeq);
      if (r && r.ok) {
        var _payload = {};
        try {
          _payload = JSON.parse(r.payload || '{}');
        } catch (_e) {}
        applyResult(r.status, _payload);
      } else {
        setTicketStatus('error');
        setCooldown(30);
      }
    } catch (_e) {
      setTicketStatus('error');
      setCooldown(30);
    }
  };
  if (gate === 'checking') {
    return React.createElement("div", {
      className: "pinGateBackdrop fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
    }, React.createElement("span", {
      className: "w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"
    }), React.createElement("p", {
      className: "pinGateBody text-xs"
    }, "確認中…"));
  }
  if (gate === 'setup') {
    return React.createElement("div", {
      className: "pinGateBackdrop fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 p-6",
      onClick: onClose
    }, React.createElement("div", {
      onClick: e => e.stopPropagation(),
      className: "flex flex-col items-center gap-6"
    }, React.createElement("p", {
      className: "pinGateTitle text-base font-bold text-center"
    }, setupStep === 1 ? t.noticePwdSetupTitle || '設定4位數密碼' : t.lockPwdConfirm || '再輸入一次確認'), setupStep === 1 && React.createElement("p", {
      className: "pinGateBody text-xs text-center max-w-xs -mt-3"
    }, type === 'basic' ? t.infoPwdSetupBasicBody : t.infoPwdSetupStoreBody), React.createElement(PinDots, {
      length: setupPwd.length
    }), setupErr && React.createElement("p", {
      className: "text-xs text-red-400 text-center"
    }, setupErr), React.createElement(PinKeypad, {
      onDigit: pressSetupDigit,
      onBackspace: () => setSetupPwd(v => v.slice(0, -1))
    }), React.createElement("button", {
      onClick: onClose,
      className: "pinGateBody text-xs"
    }, "✕ 取消")));
  }
  if (gate === 'locked') {
    return React.createElement("div", {
      className: "pinGateBackdrop fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 p-6",
      onClick: onClose
    }, React.createElement("div", {
      onClick: e => e.stopPropagation(),
      className: "flex flex-col items-center gap-6"
    }, React.createElement("p", {
      className: "pinGateTitle text-base font-bold text-center"
    }, t.noticePwdLockedTitle || '請輸入密碼'), React.createElement("p", {
      className: "pinGateBody text-xs text-center max-w-xs -mt-3"
    }, verifyMode ? '請輸入你原本設定的密碼' : type === 'basic' ? t.infoPwdLockedBasicBody : t.infoPwdLockedStoreBody), React.createElement("div", {
      className: unlockShake ? 'text-red-500' : ''
    }, React.createElement(PinDots, {
      length: unlockInput.length
    })), unlockBusy && React.createElement("span", {
      className: "w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"
    }), unlockErr && React.createElement("p", {
      className: "text-xs text-red-400 text-center"
    }, unlockErr), React.createElement(PinKeypad, {
      onDigit: pressUnlockDigit,
      onBackspace: () => setUnlockInput(v => v.slice(0, -1))
    }), React.createElement("div", {
      className: "flex items-center gap-4"
    }, React.createElement("button", {
      onClick: onClose,
      className: "pinGateBody text-xs"
    }, "✕ 取消"), React.createElement("button", {
      onClick: () => setShowForgotPwd(true),
      className: "pinGateBody text-xs underline"
    }, "忘記密碼"))), showForgotPwd && React.createElement("div", {
      className: "fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4",
      onClick: () => setShowForgotPwd(false)
    }, React.createElement("div", {
      className: "bg-gray-900 border border-white/[0.08] rounded-2xl p-5 w-full max-w-xs space-y-3 text-center",
      onClick: e => e.stopPropagation()
    }, React.createElement("p", {
      className: "text-2xl"
    }, "🔒"), React.createElement("p", {
      className: "text-sm font-bold text-gray-100"
    }, "鎖屏密碼不能直接重設"), React.createElement("p", {
      className: "text-xs text-gray-400 leading-relaxed"
    }, "鎖屏是為了防止非本人（例如撿到手機、已離職員工）看到公司資料，所以不能自助更改，需要透過登入密碼的忘記密碼流程，送交主管審核後才能重設。"), React.createElement("p", {
      className: "text-xs text-amber-400 leading-relaxed"
    }, "請先登出，登入畫面就有忘記密碼功能"), React.createElement("p", {
      className: "text-[11px] text-gray-500 leading-relaxed"
    }, "登出不會刪除本機資料（月報表、客戶資料都還在），但保險起見，建議登出前先到「系統設定」做一次資料備份"), React.createElement("div", {
      className: "flex gap-2 pt-1"
    }, React.createElement("button", {
      onClick: () => setShowForgotPwd(false),
      className: "flex-1 py-2.5 rounded-xl bg-white/[0.06] text-gray-400 text-sm"
    }, "取消"), React.createElement("button", {
      onClick: () => {
        if (onLogout) onLogout();
      },
      className: "flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold"
    }, "前往登出")))));
  }
  if (type === 'store' && keyCheck === 'invalid') {
    return React.createElement("div", {
      className: "fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center",
      onClick: onClose
    }, React.createElement("div", {
      className: "bg-gray-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl",
      onClick: e => e.stopPropagation()
    }, React.createElement("div", {
      className: "p-4 border-b border-white/[0.06] flex items-center justify-between"
    }, React.createElement("h3", {
      className: "text-base font-bold text-gray-100"
    }, t.keyInvalidMsg || '憑證已失效'), React.createElement("button", {
      onClick: onClose,
      className: "text-gray-500 text-sm"
    }, "✕")), React.createElement("div", {
      className: "p-4"
    }, React.createElement("p", {
      className: "text-sm text-gray-400 text-center"
    }, t.keyExpiredMsg))));
  }
  if (mode === 'savedDirect') {
    return React.createElement("div", {
      className: "fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center",
      onClick: onClose
    }, React.createElement("div", {
      className: "bg-gray-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto",
      onClick: e => e.stopPropagation()
    }, React.createElement("div", {
      className: "p-4 border-b border-white/[0.06] flex items-center justify-between"
    }, React.createElement("h3", {
      className: "text-base font-bold text-gray-100"
    }, titleText), React.createElement("button", {
      onClick: onClose,
      className: "text-gray-500 text-sm"
    }, "✕")), React.createElement("div", {
      className: "p-4 space-y-3"
    }, React.createElement("p", {
      className: "text-sm text-emerald-400 text-center font-semibold"
    }, "✓ ", t.infoSavedDirectMsg || '已儲存，立即生效'), React.createElement("div", {
      className: "bg-white/[0.03] rounded-xl p-3 space-y-1.5"
    }, changedList.map((c, i) => React.createElement("div", {
      key: i,
      className: "flex justify-between gap-3 text-xs"
    }, React.createElement("span", {
      className: "text-gray-500"
    }, c.label), React.createElement("span", {
      className: "text-gray-200 text-right"
    }, c.val)))), React.createElement("button", {
      onClick: onClose,
      className: "w-full py-3 rounded-xl bg-amber-600 text-white font-bold"
    }, t.done))));
  }
  if (mode === 'ticket') {
    return React.createElement("div", {
      className: "fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center",
      onClick: onClose
    }, React.createElement("div", {
      className: "bg-gray-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto",
      onClick: e => e.stopPropagation()
    }, React.createElement("div", {
      className: "p-4 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-gray-900"
    }, React.createElement("h3", {
      className: "text-base font-bold text-gray-100"
    }, type === 'basic' ? t.ticketTypeB : t.ticketTypeS), React.createElement("button", {
      onClick: onClose,
      className: "text-gray-500 text-sm"
    }, "✕")), React.createElement("div", {
      className: "p-4 space-y-4"
    }, React.createElement("div", {
      className: "bg-white/[0.03] rounded-xl p-4 text-center"
    }, React.createElement("p", {
      className: "text-[11px] text-gray-500 mb-1"
    }, t.ticketInfoTeacher), React.createElement("p", {
      className: "text-2xl font-bold text-gray-100 mb-3"
    }, code), React.createElement("p", {
      className: "text-[11px] text-gray-500 mb-1"
    }, t.ticketCode), React.createElement("p", {
      className: "text-base font-semibold text-amber-400 font-mono tracking-widest select-all"
    }, ticketSeq)), React.createElement("button", {
      onClick: () => {
        var link = buildReqLink(AUTH_LIFF_BASE, ticketSeq);
        var prefixKey = type === 'basic' ? 'lineTicketBasicPrefix' : 'lineTicketStorePrefix';
        var zhMsg = (T.zh[prefixKey] || '').replace('{code}', code);
        var isVi = ticketSeq && ticketSeq[1] === '2';
        var viMsg = isVi ? (T.vi[prefixKey] || '').replace('{code}', code) : '';
        sendTicketFlex('📝 審核通知', zhMsg, link, viMsg);
      },
      className: "w-full px-3 py-4 rounded-xl text-base font-bold bg-[#06C755] text-white active:bg-[#05b34c]"
    }, t.ticketSend), React.createElement("button", {
      onClick: checkTicket,
      disabled: cooldown > 0 || ticketStatus === 'checking',
      className: `w-full py-3.5 rounded-xl font-bold transition-all ${cooldown > 0 || ticketStatus === 'checking' ? 'bg-white/[0.06] text-gray-600 cursor-not-allowed' : 'bg-amber-600 text-white'}`
    }, ticketStatus === 'checking' ? t.ticketChecking : cooldown > 0 ? fmtLog(t.ticketWaitCountdown, [String(cooldown)]) : t.ticketCheckBtn), ticketStatus === 'pending' && React.createElement("p", {
      className: "text-xs text-gray-500 text-center"
    }, t.ticketPending), ticketStatus === 'approved' && React.createElement("p", {
      className: "text-xs text-emerald-400 text-center font-semibold"
    }, t.ticketApproved), ticketStatus === 'error' && React.createElement("p", {
      className: "text-xs text-red-400 text-center"
    }, t.pwdLoginFail), ticketStatus === 'rejected' && React.createElement("div", {
      className: "bg-red-500/10 border border-red-500/20 rounded-xl p-3 space-y-2"
    }, React.createElement("p", {
      className: "text-xs text-red-400 font-semibold text-center"
    }, t.ticketRejected), rejectReason && React.createElement("p", {
      className: "text-xs text-gray-400 text-center"
    }, t.ticketRejectedReason, "：", rejectReason), React.createElement("button", {
      onClick: backToEditAfterReject,
      className: "w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold"
    }, t.reeditBtn)), React.createElement("div", {
      className: "pt-3 border-t border-white/[0.06]"
    }, React.createElement("p", {
      className: "text-xs text-gray-500 mb-2"
    }, t.infoChangedTitle), React.createElement("div", {
      className: "space-y-1.5"
    }, changedList.map(c => React.createElement("div", {
      key: c.key,
      className: "flex justify-between gap-3 text-sm"
    }, React.createElement("span", {
      className: "text-gray-500"
    }, c.label), React.createElement("span", {
      className: "text-gray-200 text-right"
    }, c.val))))))));
  }
  var isEdit = mode === 'edit';
  return React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center",
    onClick: onClose
  }, React.createElement("div", {
    className: "bg-gray-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "pl-5 pr-2 h-14 border-b border-white/[0.08] flex items-center justify-between sticky top-0 z-10 bg-gray-900"
  }, React.createElement("h3", {
    className: "text-lg font-bold text-gray-100"
  }, titleText), React.createElement("button", {
    onClick: onClose,
    "aria-label": "close",
    className: "w-11 h-11 flex items-center justify-center text-gray-400 text-base"
  }, "✕")), type === 'basic' && keyCheck === 'invalid' && React.createElement("div", {
    className: "mx-4 mt-3 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2"
  }, React.createElement("p", {
    className: "text-xs text-red-400 text-center"
  }, t.keyInvalidEditMsg)), React.createElement("div", {
    className: `px-5 pt-2 ${isEdit ? 'space-y-4 pt-4' : ''}`
  }, layoutKeys.map(k => {
    if (k === '__divider_foreign__') {
      return React.createElement("div", {
        key: k,
        className: "flex items-center gap-3 py-1"
      }, React.createElement("div", {
        className: "flex-1 h-px bg-white/[0.08]"
      }), React.createElement("span", {
        className: "text-[13px] text-[#aab2c0]"
      }, "外籍員工"), React.createElement("div", {
        className: "flex-1 h-px bg-white/[0.08]"
      }));
    }
    var label = infoFieldLabel(k, t);
    if (!isEdit) {
      if (k === 'unitPrice') {
        var today = bizParts().y + '-' + String(bizParts().m).padStart(2, '0') + '-' + String(bizParts().d).padStart(2, '0');
        var future = (settings.unitPriceHistory || []).filter(h => h && h.from && h.from > today).sort((a, b) => a.from < b.from ? -1 : 1);
        var pendingP = null;
        try {
          var pt = LS.get(pendingKey);
          if (pt && pt.pendingPrice) pendingP = pt.pendingPrice;
        } catch (_e) {}
        return React.createElement("div", {
          key: k,
          className: "border-b border-white/[0.08]"
        }, React.createElement("div", {
          className: "flex justify-between items-start gap-3 min-h-[48px] py-3"
        }, React.createElement("span", {
          className: "text-[13px] text-[#aab2c0] flex-shrink-0"
        }, label), React.createElement("span", {
          className: "text-[15px] text-gray-100 text-right"
        }, settings.unitPrice || '—')), future.map((h, i) => React.createElement("p", {
          key: i,
          className: "text-[11px] text-amber-500/80 text-right mt-1"
        }, (t.priceFutureApproved || '自 {0} 起調整為 ${1}（已核准）').replace('{0}', h.from).replace('{1}', h.price))), pendingP && React.createElement("p", {
          className: "text-[11px] text-gray-500 text-right mt-1"
        }, (t.priceFuturePending || '自 {0} 起調整為 ${1}（申請中）').replace('{0}', pendingP.from).replace('{1}', pendingP.price)));
      }
      var v = settings[k] || '';
      if (k === 'skills') {
        var sk = settings.skills || {};
        v = SKILL_KEYS.filter(s => sk[s]).map(s => t[s] || s).join('、');
      } else if (k === 'preg' || k === 'oil') {
        v = settings[k] === 'yes' ? t.accept || '接' : settings[k] === 'no' ? t.reject || '不接' : '';
      }
      return React.createElement("div", {
        key: k,
        className: "flex justify-between items-start gap-3 min-h-[48px] py-3 border-b border-white/[0.08]"
      }, React.createElement("span", {
        className: "text-[13px] text-[#aab2c0] flex-shrink-0"
      }, label), React.createElement("span", {
        className: "text-[15px] text-gray-100 text-right"
      }, v || '—'));
    }
    if (k === 'gender') {
      return React.createElement("div", {
        key: k
      }, React.createElement("label", {
        className: "text-[13px] text-[#aab2c0] block mb-1.5"
      }, label), React.createElement("div", {
        className: "grid grid-cols-2 gap-2"
      }, [['M', t.genderM], ['F', t.genderF]].map(([g, l]) => React.createElement("button", {
        key: g,
        onClick: () => setForm(f => ({
          ...f,
          gender: g
        })),
        className: `h-11 rounded-xl text-[15px] font-semibold ${form.gender === g ? 'bg-amber-400 text-gray-950' : 'bg-white/[0.06] text-gray-300 border border-white/[0.1]'}`
      }, l))));
    }
    if (k === 'gloveSize') {
      return React.createElement("div", {
        key: k
      }, React.createElement("label", {
        className: "text-[13px] text-[#aab2c0] block mb-1.5"
      }, label), React.createElement("div", {
        className: "grid grid-cols-5 gap-1.5"
      }, ['XS', 'S', 'M', 'L', 'XL'].map(g => React.createElement("button", {
        key: g,
        onClick: () => setForm(f => ({
          ...f,
          gloveSize: g
        })),
        className: `h-11 rounded-xl text-[14px] font-semibold ${form.gloveSize === g ? 'bg-amber-400 text-gray-950' : 'bg-white/[0.06] text-gray-300 border border-white/[0.1]'}`
      }, g))));
    }
    if (k === 'preg' || k === 'oil') {
      return React.createElement("div", {
        key: k
      }, React.createElement("label", {
        className: "text-[13px] text-[#aab2c0] block mb-1.5"
      }, label), React.createElement("div", {
        className: "grid grid-cols-2 gap-2"
      }, [['yes', t.accept || '接'], ['no', t.reject || '不接']].map(([v, l]) => React.createElement("button", {
        key: v,
        onClick: () => setForm(f => ({
          ...f,
          [k]: v
        })),
        className: `h-11 rounded-xl text-[15px] font-semibold ${form[k] === v ? 'bg-amber-400 text-gray-950' : 'bg-white/[0.06] text-gray-300 border border-white/[0.1]'}`
      }, l))));
    }
    if (k === 'skills') {
      var skillsObj = form.skills || {};
      return React.createElement("div", {
        key: k
      }, React.createElement("label", {
        className: "text-[13px] text-[#aab2c0] block mb-1.5"
      }, label), React.createElement("div", {
        className: "grid grid-cols-3 gap-2"
      }, SKILL_KEYS.map((sk, i) => React.createElement("button", {
        key: sk,
        onClick: () => setForm(f => ({
          ...f,
          skills: {
            ...(f.skills || {}),
            [sk]: !(f.skills || {})[sk]
          }
        })),
        className: `h-11 rounded-xl text-[14px] font-semibold ${skillsObj[sk] ? 'bg-amber-400 text-gray-950' : 'bg-white/[0.06] text-gray-300 border border-white/[0.1]'}`
      }, t[sk] || sk))));
    }
    if (k === 'unitPrice') {
      return React.createElement("div", {
        key: k
      }, React.createElement("label", {
        className: "text-[13px] text-[#aab2c0] block mb-1.5"
      }, label), React.createElement("input", {
        value: form.unitPrice,
        onChange: e => setForm(f => ({
          ...f,
          unitPrice: e.target.value.replace(/\D/g, '')
        })),
        inputMode: "numeric",
        className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 h-12 text-[15px] text-gray-100 focus:outline-none focus:border-amber-400"
      }));
    }
    if (k === 'shift') {
      return React.createElement("div", {
        key: k
      }, React.createElement("label", {
        className: "text-[13px] text-[#aab2c0] block mb-1.5"
      }, label), React.createElement("div", {
        className: "grid grid-cols-2 gap-2"
      }, [['day', t.shiftDay], ['night', t.shiftNight]].map(([sv, l]) => React.createElement("button", {
        key: sv,
        onClick: () => setForm(f => ({
          ...f,
          shift: sv
        })),
        className: `h-11 rounded-xl text-[15px] font-semibold ${form.shift === sv ? 'bg-amber-400 text-gray-950' : 'bg-white/[0.06] text-gray-300 border border-white/[0.1]'}`
      }, l))));
    }
    if (k === 'workStart' || k === 'workEnd') {
      return React.createElement("div", {
        key: k
      }, React.createElement("label", {
        className: "text-[13px] text-[#aab2c0] block mb-1.5"
      }, label), React.createElement("select", {
        value: form[k],
        onChange: e => setForm(f => ({
          ...f,
          [k]: e.target.value
        })),
        className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 h-12 text-[15px] text-gray-100 focus:outline-none appearance-none"
      }, TIME_OPTS.map(o => React.createElement("option", {
        key: o,
        value: o
      }, o))));
    }
    if (k === 'storeSel') {
      return React.createElement("div", {
        key: k
      }, React.createElement("label", {
        className: "text-[13px] text-[#aab2c0] block mb-1.5"
      }, label), React.createElement("select", {
        value: form.storeSel,
        onChange: e => setForm(f => ({
          ...f,
          storeSel: e.target.value
        })),
        className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 h-12 text-[15px] text-gray-100 focus:outline-none appearance-none"
      }, React.createElement("option", {
        value: ""
      }, "-"), stores.map(s => React.createElement("option", {
        key: s,
        value: s
      }, s))));
    }
    if (k === 'addrCity') {
      return React.createElement("div", {
        key: k
      }, React.createElement("label", {
        className: "text-[13px] text-[#aab2c0] block mb-1.5"
      }, label), React.createElement("select", {
        value: form.addrCity,
        onChange: e => setForm(f => ({
          ...f,
          addrCity: e.target.value,
          addrDist: ''
        })),
        className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 h-12 text-[15px] text-gray-100 focus:outline-none appearance-none"
      }, React.createElement("option", {
        value: ""
      }, "-"), CITY_OPTIONS.map(c => React.createElement("option", {
        key: c,
        value: c
      }, c))));
    }
    if (k === 'addrDist') {
      var opts = TW_REGIONS[form.addrCity] || [];
      return React.createElement("div", {
        key: k
      }, React.createElement("label", {
        className: "text-[13px] text-[#aab2c0] block mb-1.5"
      }, label), React.createElement("select", {
        value: form.addrDist,
        onChange: e => setForm(f => ({
          ...f,
          addrDist: e.target.value
        })),
        disabled: !form.addrCity,
        className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 h-12 text-[15px] text-gray-100 focus:outline-none appearance-none disabled:opacity-40"
      }, React.createElement("option", {
        value: ""
      }, "-"), opts.map(d => React.createElement("option", {
        key: d,
        value: d
      }, d))));
    }
    if (k === 'permitDate' || k === 'permitExpiry') {
      return React.createElement("div", {
        key: k
      }, React.createElement("label", {
        className: "text-[13px] text-[#aab2c0] block mb-1.5"
      }, label), React.createElement("input", {
        type: "date",
        value: form[k],
        onChange: e => setForm(f => ({
          ...f,
          [k]: e.target.value
        })),
        className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 h-12 text-[15px] text-gray-100 focus:outline-none focus:border-amber-400"
      }));
    }
    return React.createElement("div", {
      key: k
    }, React.createElement("label", {
      className: "text-[13px] text-[#aab2c0] block mb-1.5"
    }, label), React.createElement("input", {
      value: form[k],
      onChange: e => setForm(f => ({
        ...f,
        [k]: e.target.value
      })),
      className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 h-12 text-[15px] text-gray-100 focus:outline-none focus:border-amber-400"
    }));
  }), err && React.createElement("p", {
    className: "text-[13px] text-red-400 text-center"
  }, err), React.createElement("div", {
    className: "sticky bottom-0 -mx-5 mt-4 px-5 pt-3 pb-5 bg-gray-900 border-t border-white/[0.08] flex gap-2"
  }, !isEdit ? React.createElement(React.Fragment, null, !HIDE_COMPANY_FEATURES && type === 'store' && React.createElement("button", {
    onClick: () => {
      setShowLeave(true);
      setLeaveDone(false);
      setLeaveErr('');
    },
    className: "px-4 h-[52px] rounded-2xl border border-white/[0.18] text-gray-300 text-[15px] font-semibold"
  }, t.leaveBtn), React.createElement("button", {
    onClick: startEdit,
    className: "flex-1 h-[52px] rounded-2xl bg-amber-400 text-gray-950 text-[16px] font-bold"
  }, t.infoEditBtn)) : React.createElement(React.Fragment, null, React.createElement("button", {
    onClick: cancelEdit,
    className: "flex-1 h-[52px] rounded-2xl border border-white/[0.18] text-gray-200 text-[15px] font-semibold"
  }, t.infoCancelBtn), React.createElement("button", {
    onClick: submitEdit,
    disabled: busy,
    className: "flex-[1.6] h-[52px] rounded-2xl bg-amber-400 text-gray-950 text-[16px] font-bold disabled:opacity-50 flex items-center justify-center gap-2"
  }, busy && React.createElement("span", {
    className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
  }), busy ? '' : t.infoSubmitBtn))), !HIDE_COMPANY_FEATURES && showLeave && React.createElement("div", {
    className: "fixed inset-0 z-[60] bg-black/80 flex items-end sm:items-center justify-center",
    onClick: () => !leaveBusy && setShowLeave(false)
  }, React.createElement("div", {
    className: "bg-gray-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "p-4 border-b border-white/[0.06]"
  }, React.createElement("h3", {
    className: "text-base font-bold text-gray-100"
  }, t.leaveConfirmTitle)), React.createElement("div", {
    className: "p-4 space-y-3"
  }, !leaveDone ? React.createElement(React.Fragment, null, React.createElement("p", {
    className: "text-sm text-gray-400"
  }, t.leaveConfirmMsg), leaveErr && React.createElement("p", {
    className: "text-xs text-red-400 text-center"
  }, leaveErr), React.createElement("div", {
    className: "flex gap-2"
  }, React.createElement("button", {
    onClick: () => setShowLeave(false),
    disabled: leaveBusy,
    className: "flex-1 py-2.5 rounded-xl bg-white/[0.06] text-gray-400 font-semibold"
  }, t.infoCancelBtn), React.createElement("button", {
    onClick: doLeave,
    disabled: leaveBusy,
    className: "flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold disabled:opacity-50"
  }, leaveBusy ? '…' : t.leaveConfirmBtn))) : React.createElement("p", {
    className: "text-sm text-emerald-500 text-center font-semibold"
  }, "✓ ", t.leaveOk)))), priceAskModal && React.createElement("div", {
    className: "fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end justify-center",
    onClick: () => setPriceAskModal(null)
  }, React.createElement("div", {
    className: "bg-gray-900 w-full rounded-t-2xl",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "p-4 border-b border-white/[0.06]"
  }, React.createElement("h3", {
    className: "text-base font-bold text-gray-100"
  }, t.priceAskTitle || '單價生效範圍')), React.createElement("div", {
    className: "p-4 space-y-3"
  }, React.createElement("p", {
    className: "text-sm text-gray-400"
  }, t.priceAskDesc || '新單價要套用到所有月份的小計，還是只從指定日期開始生效？'), React.createElement("button", {
    onClick: applyPriceAll,
    className: "w-full py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-gray-200 font-semibold text-sm"
  }, t.priceAskAll || '全部月份都套用新單價'), React.createElement("div", {
    className: "pt-1 border-t border-white/[0.06] space-y-2"
  }, React.createElement("label", {
    className: "text-xs text-gray-500 block"
  }, t.priceAskFromLabel || '從這天開始套用新單價'), React.createElement("input", {
    type: "date",
    value: priceFromDate,
    onChange: e => setPriceFromDate(e.target.value),
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
  }), React.createElement("button", {
    onClick: applyPriceFrom,
    disabled: !priceFromDate,
    className: "w-full py-3 rounded-xl bg-amber-600 text-white font-bold text-sm disabled:opacity-50"
  }, t.priceAskFromBtn || '從這天開始套用')), React.createElement("button", {
    onClick: () => setPriceAskModal(null),
    className: "w-full py-2 text-xs text-gray-500"
  }, t.infoCancelBtn)))))));
}
function fmtCountdown(deadline, t) {
  if (!deadline) return '-';
  var diff = new Date(deadline).getTime() - Date.now();
  var isVi = t && t.gbDayUnit === 'ngày';
  if (diff <= 0) return t && t.groupBuyClosedTag || '已截止';
  var days = Math.floor(diff / 86400000);
  var hours = Math.floor(diff % 86400000 / 3600000);
  var mins = Math.floor(diff % 3600000 / 60000);
  var dU = t && t.gbDayUnit || '天',
    hU = t && t.gbHourUnit || '時',
    mU = t && t.gbMinUnit || '分';
  if (isVi) {
    if (days > 0) return days + dU + ' ' + hours + hU;
    if (hours > 0) return hours + hU + ' ' + mins + mU;
    return mins + mU;
  }
  if (days > 0) return days + dU + hours + hU;
  if (hours > 0) return hours + hU + mins + mU;
  return mins + mU;
}
var Spinner = ({
  size
}) => React.createElement("svg", {
  className: "animate-spin",
  width: size || 14,
  height: size || 14,
  viewBox: "0 0 24 24",
  fill: "none"
}, React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "10",
  stroke: "currentColor",
  strokeWidth: "3",
  strokeOpacity: "0.3"
}), React.createElement("path", {
  d: "M12 2a10 10 0 0110 10",
  stroke: "currentColor",
  strokeWidth: "3",
  strokeLinecap: "round"
}));
var fmtBy = (creator, t) => (t && t.groupBuyByLabel || '由{0}發起').replace('{0}', creator);
function GroupBuyModal({
  t,
  settings,
  onClose
}) {
  var code = settings.code;
  var [tab, setTab] = useState('list');
  var [list, setList] = useState(null);
  var [mine, setMine] = useState(null);
  var [busy, setBusy] = useState('');
  var [regBuy, setRegBuy] = useState(null);
  var [regSize, setRegSize] = useState(settings.gloveSize || 'M');
  var [regQty, setRegQty] = useState('1');
  var [showCreate, setShowCreate] = useState(false);
  var tomorrow2359 = () => {
    var d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 0, 0);
    var pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T23:59`;
  };
  var [newItem, setNewItem] = useState('custom');
  var [newCustomItem, setNewCustomItem] = useState('');
  var [newAmount, setNewAmount] = useState('');
  var [newDeadline, setNewDeadline] = useState(tomorrow2359);
  var [newScope, setNewScope] = useState('none');
  var [isSup, setIsSup] = useState(false);
  useEffect(() => {
    gasCheckCode(code).then(r => {
      if (r && r.ok && r.found && (r.role === 'supervisor' || r.role === 'admin')) setIsSup(true);
    }).catch(() => {});
  }, [code]);
  var hasActiveGlove = useMemo(() => (list || []).some(g => g.item === 'glove' && g.status === 'open'), [list]);
  var [createBusy, setCreateBusy] = useState(false);
  var [createErr, setCreateErr] = useState('');
  var [detailBuy, setDetailBuy] = useState(null);
  var [detail, setDetail] = useState(null);
  var [listErr, setListErr] = useState('');
  var [showEnded, setShowEnded] = useState(false);
  var loadList = () => {
    gasListGroupBuys().then(r => {
      if (r && r.ok) {
        setList(r.list || []);
        setListErr('');
        (r.list || []).filter(g => g.status === 'open').forEach(g => {
          try {
            gasLogGroupBuyOpen(g.id, code);
          } catch (_e) {}
        });
      } else {
        setList([]);
        setListErr(r && r.error || '讀取失敗');
      }
    }).catch(e => {
      setList([]);
      setListErr(String(e));
    });
  };
  var loadMine = () => {
    gasMyGroupBuyOrders(code).then(r => {
      if (r && r.ok) setMine(r.list || []);else setMine([]);
    }).catch(() => setMine([]));
  };
  useEffect(() => {
    loadList();
    loadMine();
  }, []);
  var joinedIds = useMemo(() => new Set((mine || []).filter(o => o.response !== 'decline').map(o => o.buyId)), [mine]);
  var declinedIds = useMemo(() => new Set((mine || []).filter(o => o.response === 'decline').map(o => o.buyId)), [mine]);
  var startRegister = g => {
    setRegBuy(g);
    setRegSize(settings.gloveSize || 'M');
    setRegQty('1');
  };
  var confirmRegister = async () => {
    if (!regBuy) return;
    setBusy(regBuy.id);
    try {
      await gasJoinGroupBuy(regBuy.id, code, regBuy.item === 'glove' ? regSize : '', parseInt(regQty, 10) || 1);
    } catch (_e) {}
    setBusy('');
    setRegBuy(null);
    loadList();
    loadMine();
  };
  var doDecline = async g => {
    setBusy(g.id);
    try {
      await gasDeclineGroupBuy(g.id, code);
    } catch (_e) {}
    setBusy('');
    loadList();
    loadMine();
  };
  var doCreate = async () => {
    var item = newItem === 'custom' ? newCustomItem.trim() : 'glove';
    if (newItem === 'custom' && !item) {
      setCreateErr(t.groupBuyCustomItemPh);
      return;
    }
    if (!newAmount.trim()) {
      setCreateErr(t.groupBuyAmountLabel);
      return;
    }
    setCreateErr('');
    setCreateBusy(true);
    try {
      var titleToSend = newItem === 'glove' ? t.groupBuyGloveDefault || '手套團購' : item + (t === T.zh ? '團購' : '');
      var r = await gasCreateGroupBuy(code, titleToSend, item, newAmount, newDeadline, newScope);
      if (r && r.ok) {
        setShowCreate(false);
        setNewCustomItem('');
        setNewAmount('');
        setNewDeadline('');
        loadList();
      } else {
        setCreateErr(r && r.error || '送出失敗');
      }
    } catch (e) {
      setCreateErr(String(e));
    }
    setCreateBusy(false);
  };
  var openDetail = g => {
    setDetailBuy(g);
    setDetail(null);
    gasGroupBuyDetail(g.id).then(r => {
      if (r && r.ok) setDetail(r);
    });
  };
  var [statusBusy, setStatusBusy] = useState('');
  var toggleOrderStatus = async field => {
    if (!detailBuy || statusBusy) return;
    setStatusBusy(field);
    try {
      await gasSetGroupBuyOrderStatus(detailBuy.id, code, field);
    } catch (_e) {}
    setStatusBusy('');
    gasGroupBuyDetail(detailBuy.id).then(r => {
      if (r && r.ok) setDetail(r);
    });
  };
  var doClose = async g => {
    setBusy(g.id);
    try {
      await gasCloseGroupBuy(g.id, code);
    } catch (_e) {}
    setBusy('');
    setDetailBuy(null);
    loadList();
  };
  var isCreator = detailBuy && detailBuy.creator === code;
  var created = useMemo(() => (list || []).filter(g => g.creator === code), [list, code]);
  var SECTION_META = {
    open: {
      label: t.gbStatusOpen || '進行中',
      color: 'text-emerald-400'
    },
    closed: {
      label: t.gbStatusClosed || '已截止',
      color: 'text-gray-500'
    },
    collecting: {
      label: t.gbStatusCollecting || '收錢中',
      color: 'text-amber-400'
    },
    shipping: {
      label: t.gbStatusShipping || '貨運寄送中',
      color: 'text-sky-400'
    },
    ended: {
      label: t.gbStatusEnded || '已結束',
      color: 'text-gray-600'
    }
  };
  var SECTION_ORDER = ['open', 'collecting', 'shipping', 'closed', 'ended'];
  var sectionOf = status => SECTION_META[status] ? status : 'open';
  var groupBySection = (arr, statusOf) => {
    var buckets = {};
    SECTION_ORDER.forEach(k => buckets[k] = []);
    arr.forEach(item => {
      var s = sectionOf(statusOf(item));
      buckets[s].push(item);
    });
    return buckets;
  };
  var [statusChangeBusy, setStatusChangeBusy] = useState(false);
  var doSetStatus = async newStatus => {
    if (!detailBuy || statusChangeBusy) return;
    setStatusChangeBusy(true);
    try {
      var r = await gasSetGroupBuyStatus(detailBuy.id, code, newStatus);
      if (r && r.ok) {
        setDetailBuy({
          ...detailBuy,
          status: newStatus
        });
        loadList();
      }
    } catch (_e) {}
    setStatusChangeBusy(false);
  };
  return React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center",
    onClick: onClose
  }, React.createElement("div", {
    className: "bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "p-4 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-gray-900"
  }, React.createElement("h3", {
    className: "text-base font-bold text-gray-100"
  }, t.groupBuyTitle), !detailBuy && React.createElement("button", {
    onClick: () => setShowCreate(v => !v),
    className: "text-xs px-2.5 py-1.5 rounded-lg bg-amber-600 text-white font-semibold"
  }, "+ ", t.groupBuyCreateBtn)), detailBuy ? React.createElement("div", {
    className: "p-4 space-y-3"
  }, React.createElement("button", {
    onClick: () => setDetailBuy(null),
    className: "text-xs text-gray-500"
  }, "← ", t.backToChoice || '返回'), React.createElement("p", {
    className: "text-sm text-gray-200 font-medium"
  }, detailBuy.title, "（", fmtBy(detailBuy.creator, t), "）"), React.createElement("p", {
    className: "text-xs text-gray-500"
  }, t.groupBuyAmountLabel, "：", detailBuy.amount, "｜", fmtCountdown(detailBuy.deadline, t), detailBuy.status !== 'open' ? '・' + t.groupBuyClosedTag : ''), detail === null ? React.createElement(SkReveal, {
    ready: false,
    variant: "card",
    rows: 1
  }) : React.createElement("div", {
    className: "sk-in space-y-3"
  }, isCreator ? React.createElement(React.Fragment, null, React.createElement("p", {
    className: "text-sm text-amber-400 font-semibold"
  }, fmtLog(t.groupBuyCreatedCount, [String(detail.joined.length)])), detailBuy.item === 'glove' ? (() => {
    var bySize = {};
    detail.joined.forEach(o => {
      var s = o.size || '-';
      if (!bySize[s]) bySize[s] = [];
      bySize[s].push(o.code);
    });
    return Object.keys(bySize).sort().map(s => React.createElement("p", {
      key: s,
      className: "text-xs text-gray-400"
    }, fmtLog(t.groupBuySizeGroup, [s, String(bySize[s].length), bySize[s].join('、')])));
  })() : React.createElement("div", {
    className: "flex flex-wrap gap-1.5"
  }, detail.joined.map((o, i) => React.createElement("span", {
    key: i,
    className: "text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-300"
  }, o.code, o.qty > 1 ? '×' + o.qty : ''))), React.createElement("div", null, React.createElement("p", {
    className: "text-xs text-gray-500 mb-1.5 mt-2"
  }, t.groupBuyViewDeclined, "（", detail.declined.length, "）"), React.createElement("div", {
    className: "flex flex-wrap gap-1.5"
  }, detail.declined.map((o, i) => React.createElement("span", {
    key: i,
    className: "text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-500"
  }, o.code)))), React.createElement("div", null, React.createElement("p", {
    className: "text-xs text-gray-500 mb-1.5"
  }, t.groupBuyViewOpens, "（", detail.opens.length, "）"), React.createElement("div", {
    className: "flex flex-wrap gap-1.5"
  }, detail.opens.map((o, i) => React.createElement("span", {
    key: i,
    className: "text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-500"
  }, o.code)))), React.createElement("div", {
    className: "pt-2 border-t border-white/[0.06] space-y-1.5"
  }, React.createElement("p", {
    className: "text-[11px] text-gray-500"
  }, (t.gbChangeStatusLabel || '變更狀態（目前：{0}）').replace('{0}', SECTION_META[sectionOf(detailBuy.status)].label)), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, React.createElement("button", {
    onClick: () => doSetStatus('closed'),
    disabled: statusChangeBusy || detailBuy.status === 'closed',
    className: "py-2 rounded-lg bg-white/[0.06] text-gray-300 text-xs font-semibold disabled:opacity-40"
  }, t.gbStatusClosed || '提前截止'), React.createElement("button", {
    onClick: () => doSetStatus('collecting'),
    disabled: statusChangeBusy || detailBuy.status === 'collecting',
    className: "py-2 rounded-lg bg-amber-600/20 text-amber-400 text-xs font-semibold disabled:opacity-40"
  }, t.gbStatusCollecting || '收錢中'), React.createElement("button", {
    onClick: () => doSetStatus('shipping'),
    disabled: statusChangeBusy || detailBuy.status === 'shipping',
    className: "py-2 rounded-lg bg-sky-600/20 text-sky-400 text-xs font-semibold disabled:opacity-40"
  }, t.gbStatusShipping || '貨運寄送中'), React.createElement("button", {
    onClick: () => doSetStatus('ended'),
    disabled: statusChangeBusy || detailBuy.status === 'ended',
    className: "py-2 rounded-lg bg-red-600/20 text-red-400 text-xs font-semibold disabled:opacity-40"
  }, t.gbStatusEnded || '已結束')))) : React.createElement(React.Fragment, null, React.createElement("div", null, React.createElement("p", {
    className: "text-xs text-gray-500 mb-1.5"
  }, t.groupBuyViewJoined, "（", detail.joined.length, "）"), React.createElement("div", {
    className: "flex flex-wrap gap-1.5"
  }, detail.joined.map((o, i) => React.createElement("span", {
    key: i,
    className: "text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-300"
  }, o.code, o.size ? '(' + o.size + ')' : '')))), (() => {
    var mine = detail.joined.find(o => o.code === code);
    if (!mine) return null;
    return React.createElement("div", {
      className: "flex gap-2 pt-2 border-t border-white/[0.06]"
    }, React.createElement("button", {
      onClick: () => toggleOrderStatus('paid'),
      disabled: statusBusy === 'paid',
      className: `flex-1 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 ${mine.paid ? 'bg-emerald-600/20 text-emerald-400' : 'bg-white/[0.06] text-gray-400'}`
    }, statusBusy === 'paid' && React.createElement(Spinner, {
      size: 11
    }), mine.paid ? '✓ ' : '', t.groupBuyPaidBtn || '已交錢'), React.createElement("button", {
      onClick: () => toggleOrderStatus('arrived'),
      disabled: statusBusy === 'arrived',
      className: `flex-1 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 ${mine.arrived ? 'bg-emerald-600/20 text-emerald-400' : 'bg-white/[0.06] text-gray-400'}`
    }, statusBusy === 'arrived' && React.createElement(Spinner, {
      size: 11
    }), mine.arrived ? '✓ ' : '', t.groupBuyArrivedBtn || '已到貨'));
  })()))) : React.createElement(React.Fragment, null, React.createElement("div", {
    className: "flex gap-2 p-3 pb-0"
  }, React.createElement("button", {
    onClick: () => setTab('list'),
    className: `flex-1 py-2 rounded-lg text-xs font-semibold ${tab === 'list' ? 'bg-amber-600 text-white' : 'bg-white/[0.05] text-gray-400'}`
  }, t.groupBuyTabList), React.createElement("button", {
    onClick: () => setTab('mine'),
    className: `flex-1 py-2 rounded-lg text-xs font-semibold ${tab === 'mine' ? 'bg-amber-600 text-white' : 'bg-white/[0.05] text-gray-400'}`
  }, t.groupBuyTabMine), React.createElement("button", {
    onClick: () => setTab('created'),
    className: `flex-1 py-2 rounded-lg text-xs font-semibold ${tab === 'created' ? 'bg-amber-600 text-white' : 'bg-white/[0.05] text-gray-400'}`
  }, t.groupBuyTabCreated)), React.createElement("div", {
    className: "p-4 space-y-3"
  }, tab === 'list' && React.createElement(React.Fragment, null, showCreate && React.createElement("div", {
    className: "bg-white/[0.03] rounded-xl p-3 space-y-2.5"
  }, React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-500 block mb-1"
  }, t.groupBuyItemLabel), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, React.createElement("button", {
    onClick: () => !hasActiveGlove && setNewItem('glove'),
    disabled: hasActiveGlove,
    className: `py-2 rounded-lg text-sm font-semibold ${hasActiveGlove ? 'bg-white/[0.02] text-gray-700 cursor-not-allowed' : newItem === 'glove' ? 'bg-amber-600 text-white' : 'bg-white/[0.06] text-gray-400'}`
  }, t.groupBuyItemGlove, hasActiveGlove && t.gbGloveOngoingTag), React.createElement("button", {
    onClick: () => setNewItem('custom'),
    className: `py-2 rounded-lg text-sm font-semibold ${newItem === 'custom' ? 'bg-amber-600 text-white' : 'bg-white/[0.06] text-gray-400'}`
  }, t.groupBuyItemCustom)), hasActiveGlove && React.createElement("p", {
    className: "text-[10px] text-gray-600 mt-1"
  }, t.gbGloveOnlyOneHint)), newItem === 'custom' && React.createElement("input", {
    value: newCustomItem,
    onChange: e => setNewCustomItem(e.target.value),
    placeholder: t.groupBuyCustomItemPh,
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-100"
  }), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-500 block mb-1"
  }, t.groupBuyAmountLabel), React.createElement("input", {
    value: newAmount,
    onChange: e => setNewAmount(e.target.value.replace(/[^\d]/g, '')),
    inputMode: "numeric",
    placeholder: t.groupBuyAmountPh,
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-100"
  })), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-500 block mb-1"
  }, t.groupBuyDeadlineLabel), React.createElement("input", {
    type: "datetime-local",
    value: newDeadline,
    onChange: e => isSup && setNewDeadline(e.target.value),
    disabled: !isSup,
    className: `w-full border rounded-lg px-3 py-2 text-sm ${isSup ? 'bg-white/[0.06] border-white/[0.08] text-gray-100' : 'bg-white/[0.02] border-white/[0.04] text-gray-600 cursor-not-allowed'}`
  }), React.createElement("p", {
    className: "text-[10px] text-gray-600 mt-1"
  }, isSup ? t.groupBuyDeadline24hHint : t.gbDeadlineTeacherHint)), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-500 block mb-1"
  }, t.groupBuyScopeLabel), React.createElement("div", {
    className: "grid grid-cols-3 gap-2"
  }, React.createElement("button", {
    onClick: () => setNewScope('none'),
    className: `py-2 rounded-lg text-xs font-semibold ${newScope === 'none' ? 'bg-amber-600 text-white' : 'bg-white/[0.06] text-gray-400'}`
  }, t.groupBuyScopeNone || '不公告'), React.createElement("button", {
    onClick: () => setNewScope('store'),
    className: `py-2 rounded-lg text-xs font-semibold ${newScope === 'store' ? 'bg-amber-600 text-white' : 'bg-white/[0.06] text-gray-400'}`
  }, t.groupBuyScopeStore), React.createElement("button", {
    onClick: () => setNewScope('all'),
    className: `py-2 rounded-lg text-xs font-semibold ${newScope === 'all' ? 'bg-amber-600 text-white' : 'bg-white/[0.06] text-gray-400'}`
  }, t.groupBuyScopeAll))), createErr && React.createElement("p", {
    className: "text-xs text-red-400 text-center"
  }, createErr), React.createElement("button", {
    onClick: doCreate,
    disabled: createBusy,
    className: "w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold disabled:opacity-50"
  }, createBusy ? '…' : t.groupBuyCreateBtn)), listErr && React.createElement("p", {
    className: "text-xs text-red-400 text-center"
  }, listErr), list === null ? React.createElement(SkReveal, {
    ready: false,
    variant: "card",
    rows: 3
  }) : React.createElement("div", {
    className: "sk-in space-y-3"
  }, list.filter(g => g.status === 'open').length === 0 ? React.createElement("p", {
    className: "text-xs text-gray-600 text-center py-4"
  }, t.groupBuyEmpty) : list.filter(g => g.status === 'open').map(g => React.createElement("div", {
    key: g.id,
    className: "bg-white/[0.03] rounded-xl p-3 space-y-2"
  }, React.createElement("div", {
    onClick: () => openDetail(g),
    className: "flex items-center justify-between gap-2 cursor-pointer"
  }, React.createElement("p", {
    className: "text-sm text-gray-200 font-medium flex items-center gap-1.5"
  }, React.createElement("span", {
    className: "text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-mono flex-shrink-0"
  }, g.id), g.title, "（", fmtBy(g.creator, t), "）"), React.createElement("span", {
    className: "text-xs text-amber-400 font-semibold flex-shrink-0"
  }, fmtCountdown(g.deadline, t))), React.createElement("p", {
    className: "text-[11px] text-gray-500"
  }, t.groupBuyAmountLabel, "：", g.amount, "｜", g.orderCount, t.groupBuyOrderCount, g.declineCount ? '｜' + t.groupBuyDeclineCountLabel + '：' + g.declineCount : ''), regBuy && regBuy.id === g.id ? React.createElement("div", {
    className: "bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 space-y-2"
  }, g.item === 'glove' && React.createElement("div", null, React.createElement("label", {
    className: "text-[11px] text-gray-500 block mb-1"
  }, t.gloveSize), React.createElement("div", {
    className: "grid grid-cols-5 gap-1"
  }, ['XS', 'S', 'M', 'L', 'XL'].map(sz => React.createElement("button", {
    key: sz,
    onClick: () => setRegSize(sz),
    className: `py-1.5 rounded text-[11px] font-semibold ${regSize === sz ? 'bg-amber-600 text-white' : 'bg-white/[0.06] text-gray-400'}`
  }, sz)))), React.createElement("div", null, React.createElement("label", {
    className: "text-[11px] text-gray-500 block mb-1"
  }, t.groupBuyQtyLabel), React.createElement("input", {
    value: regQty,
    onChange: e => setRegQty(e.target.value.replace(/[^\d]/g, '') || '1'),
    inputMode: "numeric",
    className: "w-20 bg-white/[0.06] border border-white/[0.08] rounded px-2 py-1.5 text-sm text-gray-100 text-center"
  })), React.createElement("div", {
    className: "flex gap-2"
  }, React.createElement("button", {
    onClick: () => setRegBuy(null),
    className: "flex-1 py-2 rounded-lg bg-white/[0.06] text-gray-400 text-xs font-semibold"
  }, t.infoCancelBtn), React.createElement("button", {
    onClick: confirmRegister,
    disabled: busy === g.id,
    className: "flex-1 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
  }, busy === g.id && React.createElement(Spinner, {
    size: 11
  }), t.groupBuyConfirmBtn))) : React.createElement("div", {
    className: "flex gap-2"
  }, React.createElement("button", {
    onClick: () => startRegister(g),
    disabled: busy === g.id || joinedIds.has(g.id) || declinedIds.has(g.id),
    className: `flex-1 py-2 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 ${joinedIds.has(g.id) ? 'bg-white/[0.06] text-gray-500' : 'bg-amber-600 text-white'}`
  }, busy === g.id && React.createElement(Spinner, {
    size: 11
  }), joinedIds.has(g.id) ? t.groupBuyJoinOk || '已登記' : t.groupBuyJoinBtn), React.createElement("button", {
    onClick: () => doDecline(g),
    disabled: busy === g.id || joinedIds.has(g.id) || declinedIds.has(g.id),
    className: `flex-1 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5 ${declinedIds.has(g.id) ? 'bg-white/[0.03] text-gray-600' : 'bg-white/[0.06] text-gray-400'}`
  }, busy === g.id && React.createElement(Spinner, {
    size: 11
  }), declinedIds.has(g.id) ? t.groupBuyDeclinedOk || '已標記不需要' : t.groupBuyDeclineBtn)))), (() => {
    var ended = list.filter(g => g.status !== 'open');
    return ended.length > 0 && React.createElement("div", {
      className: "pt-2 border-t border-white/[0.06]"
    }, React.createElement("button", {
      onClick: () => setShowEnded(v => !v),
      className: "text-xs text-gray-500 flex items-center gap-1"
    }, t.groupBuyEndedTitle || '已結束', "（", ended.length, "）", showEnded ? '▲' : '▼'), showEnded && ended.map(g => React.createElement("div", {
      key: g.id,
      onClick: () => openDetail(g),
      className: "bg-white/[0.02] rounded-lg px-3 py-2 mt-2 cursor-pointer"
    }, React.createElement("p", {
      className: "text-xs text-gray-500 flex items-center gap-1.5"
    }, React.createElement("span", {
      className: "text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-gray-500 font-mono flex-shrink-0"
    }, g.id), g.title, "（", fmtBy(g.creator, t), "）"))));
  })())), tab === 'mine' && (mine === null ? React.createElement(SkReveal, {
    ready: false,
    variant: "card",
    rows: 3
  }) : mine.filter(o => o.response !== 'decline').length === 0 ? React.createElement("p", {
    className: "text-xs text-gray-600 text-center py-4"
  }, t.groupBuyMineEmpty) : (() => {
    var buckets = groupBySection(mine.filter(o => o.response !== 'decline'), o => o.status);
    return SECTION_ORDER.filter(k => buckets[k].length > 0).map(k => React.createElement("div", {
      key: k,
      className: "space-y-1.5"
    }, React.createElement("p", {
      className: `text-[11px] font-semibold ${SECTION_META[k].color}`
    }, SECTION_META[k].label, "（", buckets[k].length, "）"), buckets[k].map((o, i) => React.createElement("div", {
      key: i,
      onClick: () => openDetail({
        id: o.buyId,
        title: o.title,
        creator: o.creator,
        amount: o.amount,
        item: o.size ? 'glove' : '',
        deadline: o.deadline,
        status: o.status
      }),
      className: "bg-white/[0.03] rounded-xl p-3 flex items-center justify-between cursor-pointer active:bg-white/[0.05]"
    }, React.createElement("p", {
      className: "text-sm text-gray-200"
    }, o.title, "（", fmtBy(o.creator, t), "）"), React.createElement("span", {
      className: "text-xs text-amber-400 font-semibold flex-shrink-0"
    }, o.size ? t.gloveSize + ' ' + o.size + ' ' : '', t.groupBuyQtyLabel, o.qty, o.amount ? '　' + t.groupBuyAmountLabel + o.amount : '')))));
  })()), tab === 'created' && (created.length === 0 ? React.createElement("p", {
    className: "text-xs text-gray-600 text-center py-4"
  }, t.groupBuyMineCreatedEmpty) : (() => {
    var buckets = groupBySection(created, g => g.status);
    return SECTION_ORDER.filter(k => buckets[k].length > 0).map(k => React.createElement("div", {
      key: k,
      className: "space-y-1.5"
    }, React.createElement("p", {
      className: `text-[11px] font-semibold ${SECTION_META[k].color}`
    }, SECTION_META[k].label, "（", buckets[k].length, "）"), buckets[k].map(g => {
      var amt = parseFloat(g.amount) || 0;
      var sub = amt * (g.orderCount || 0);
      return React.createElement("div", {
        key: g.id,
        onClick: () => openDetail(g),
        className: "bg-white/[0.03] rounded-xl p-3 flex items-center justify-between cursor-pointer"
      }, React.createElement("p", {
        className: "text-sm text-gray-200"
      }, g.title), React.createElement("div", {
        className: "text-right flex-shrink-0"
      }, React.createElement("p", {
        className: "text-xs text-gray-500"
      }, fmtLog(t.groupBuyCreatedCount, [String(g.orderCount)])), sub > 0 && React.createElement("p", {
        className: "text-xs text-amber-400 font-semibold"
      }, g.orderCount, "×", amt, "＝", sub.toLocaleString())));
    })));
  })()), tab === 'created' && created.length > 0 && (() => {
    var total = created.reduce((s, g) => s + (parseFloat(g.amount) || 0) * (g.orderCount || 0), 0);
    return total > 0 && React.createElement("div", {
      className: "flex items-center justify-between pt-2 border-t border-white/[0.08]"
    }, React.createElement("span", {
      className: "text-sm text-gray-400 font-semibold"
    }, t.groupBuySubtotalLabel || '小計'), React.createElement("span", {
      className: "text-base text-amber-400 font-bold"
    }, total.toLocaleString()));
  })()))));
}
function DisasterReportModal({
  t,
  settings,
  onClose,
  onSaved
}) {
  var code = settings.code;
  var today = new Date().toISOString().slice(0, 10);
  var [survey, setSurvey] = useState(undefined);
  var [statuses, setStatuses] = useState([]);
  var [otherText, setOtherText] = useState('');
  var [city, setCity] = useState(settings.addrCity || '');
  var [dist, setDist] = useState(settings.addrDist || '');
  var [busy, setBusy] = useState(false);
  var [err, setErr] = useState('');
  var [myReports, setMyReports] = useState(null);
  var [showForm, setShowForm] = useState(false);
  var needAddr = !city || !dist;
  var statusLabel = k => ({
    safe: t.drSafe,
    cantLeave: t.drCantLeave,
    vehicleDamaged: t.drVehicleDamaged,
    sick: t.drSick
  })[k] || k;
  var fmtReportLine = r => {
    var parts = (r.type ? r.type.split(',') : []).map(statusLabel).filter(Boolean);
    if (r.otherText) parts.push(r.otherText);
    var dt = r.date;
    if (r.time) {
      try {
        var d = new Date(r.time);
        dt = r.date + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      } catch (_e) {}
    }
    return dt + ' ' + parts.join('、');
  };
  var toggleStatus = s => setStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  var loadMine = surveyId => gasMyDisasterReports(surveyId, code).then(mr => {
    if (mr && mr.ok) {
      setMyReports(mr.list || []);
      setShowForm(!(mr.list && mr.list.some(r => r.date === today)));
    }
  }).catch(() => {});
  useEffect(() => {
    gasListDisasterSurveys().then(r => {
      if (r && r.ok && Array.isArray(r.list)) {
        var active = r.list.find(s => !s.endDate);
        setSurvey(active || null);
        if (active) loadMine(active.id);else setShowForm(true);
      } else {
        setSurvey(null);
        setShowForm(true);
      }
    }).catch(() => {
      setSurvey(null);
      setShowForm(true);
    });
  }, []);
  var submit = async () => {
    if (needAddr || statuses.length === 0 && !otherText.trim() || !survey) return;
    setBusy(true);
    setErr('');
    try {
      var r = await gasSubmitDisasterReport({
        surveyId: survey.id,
        code,
        date: today,
        type: statuses.join(','),
        otherText,
        city,
        dist
      });
      if (r && r.ok) {
        if (onSaved) onSaved({
          addrCity: city,
          addrDist: dist
        });
        setStatuses([]);
        setOtherText('');
        loadMine(survey.id);
      } else {
        setErr(r && r.error || t.drSubmitFail);
      }
    } catch (e) {
      setErr(t.drSubmitFail);
    }
    setBusy(false);
  };
  var todayReports = (myReports || []).filter(r => r.date === today);
  var isSupervisor = (() => {
    try {
      var s = LS.get('supervisor-' + code);
      return !!(s && s.status === 'approved');
    } catch (_e) {
      return false;
    }
  })();
  var [showQuery, setShowQuery] = useState(false);
  var [queryDate, setQueryDate] = useState('');
  var [queryResult, setQueryResult] = useState(null);
  var dayOptions = useMemo(() => {
    if (!survey || !survey.startDate) return [];
    var start = new Date(survey.startDate + 'T00:00:00');
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var days = Math.floor((now - start) / 86400000) + 1;
    var opts = [];
    for (var n = 1; n <= Math.max(1, days); n++) {
      var d = new Date(start.getTime() + (n - 1) * 86400000);
      var p = x => String(x).padStart(2, '0');
      opts.push({
        n: n,
        date: d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
      });
    }
    return opts;
  }, [survey]);
  var doQuery = async date => {
    setQueryDate(date);
    setQueryResult(null);
    if (!date || !survey) return;
    var r = await gasDisasterDayStatus(survey.id, date);
    if (r && r.ok) setQueryResult(r);
  };
  return React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center",
    onClick: onClose
  }, React.createElement("div", {
    className: "bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "p-4 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-gray-900"
  }, React.createElement("h3", {
    className: "text-base font-bold text-gray-100"
  }, showForm ? survey ? survey.name : t.drTitle : t.drReportRecordTitle), React.createElement("button", {
    onClick: onClose,
    className: "text-gray-500 text-sm"
  }, "✕")), survey === undefined ? React.createElement("div", {
    className: "p-4"
  }, React.createElement(SkReveal, {
    ready: false,
    variant: "card",
    rows: 2
  })) : !survey ? React.createElement("p", {
    className: "p-8 text-sm text-gray-500 text-center"
  }, t.drNoActiveSurvey) : !showForm ? React.createElement("div", {
    className: "p-4 space-y-4"
  }, survey.message && React.createElement("p", {
    className: "text-xs text-gray-400 bg-white/[0.03] rounded-lg p-2.5"
  }, survey.message), React.createElement("div", {
    className: "space-y-2"
  }, React.createElement("p", {
    className: "text-xs text-gray-500"
  }, t.drTodayReported), todayReports.map((r, i) => React.createElement("p", {
    key: i,
    className: "text-sm text-emerald-500 font-semibold"
  }, fmtReportLine(r)))), myReports && myReports.length > todayReports.length && React.createElement("div", {
    className: "space-y-2 pt-2 border-t border-white/[0.06]"
  }, React.createElement("p", {
    className: "text-xs text-gray-500"
  }, t.drMyReportsTitle), myReports.filter(r => r.date !== today).map((r, i) => React.createElement("p", {
    key: i,
    className: "text-xs text-gray-400"
  }, fmtReportLine(r)))), React.createElement("button", {
    onClick: () => setShowForm(true),
    className: "w-full py-3 rounded-xl bg-white/[0.06] text-amber-400 text-sm font-semibold"
  }, "+ ", t.drAddMoreBtn)) : React.createElement("div", {
    className: "p-4 space-y-4"
  }, myReports && myReports.length > 0 && React.createElement("button", {
    onClick: () => setShowForm(false),
    className: "text-xs text-gray-500"
  }, "← ", t.drReportRecordTitle), React.createElement("div", {
    className: "flex justify-between text-sm"
  }, React.createElement("span", {
    className: "text-gray-500"
  }, t.drDateLabel), React.createElement("span", {
    className: "text-gray-300"
  }, today)), needAddr && React.createElement("div", {
    className: "bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-2"
  }, React.createElement("p", {
    className: "text-xs text-amber-400"
  }, t.drNeedAddrHint), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, React.createElement("select", {
    value: city,
    onChange: e => {
      setCity(e.target.value);
      setDist('');
    },
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-2 text-sm text-gray-200"
  }, React.createElement("option", {
    value: ""
  }, "-"), CITY_OPTIONS.map(c => React.createElement("option", {
    key: c,
    value: c
  }, c))), React.createElement("select", {
    value: dist,
    onChange: e => setDist(e.target.value),
    disabled: !city,
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-2 text-sm text-gray-200 disabled:opacity-40"
  }, React.createElement("option", {
    value: ""
  }, "-"), (TW_REGIONS[city] || []).map(d => React.createElement("option", {
    key: d,
    value: d
  }, d))))), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-500 block mb-1.5"
  }, t.drStatusLabel), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, [['safe', t.drSafe], ['cantLeave', t.drCantLeave], ['vehicleDamaged', t.drVehicleDamaged], ['sick', t.drSick]].map(([k, l]) => React.createElement("button", {
    key: k,
    onClick: () => toggleStatus(k),
    className: `py-2.5 rounded-xl text-sm font-semibold ${statuses.includes(k) ? 'bg-amber-600 text-white' : 'bg-white/[0.06] text-gray-400'}`
  }, l))), React.createElement("div", {
    className: "mt-2"
  }, React.createElement("label", {
    className: "text-[11px] text-gray-500 block mb-1"
  }, t.drOtherLabel), React.createElement("input", {
    value: otherText,
    onChange: e => setOtherText(e.target.value),
    placeholder: t.drOtherPh,
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-100"
  }))), err && React.createElement("p", {
    className: "text-xs text-red-400 text-center"
  }, err), React.createElement("button", {
    onClick: submit,
    disabled: busy || needAddr || statuses.length === 0 && !otherText.trim(),
    className: "w-full py-3 rounded-xl bg-red-600 text-white font-bold disabled:opacity-50"
  }, busy ? '…' : t.drSubmitBtn)), survey && isSupervisor && React.createElement("div", {
    className: "p-4 pt-0 space-y-2 border-t border-white/[0.06] mt-2"
  }, React.createElement("button", {
    onClick: () => setShowQuery(v => !v),
    className: "w-full py-2.5 rounded-xl bg-white/[0.05] text-gray-400 text-sm font-semibold"
  }, t.drQueryReportsBtn), showQuery && React.createElement("div", {
    className: "space-y-2"
  }, React.createElement("select", {
    onChange: e => doQuery(e.target.value),
    defaultValue: "",
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-gray-200"
  }, React.createElement("option", {
    value: "",
    disabled: true
  }, t.drSelectDayPh), dayOptions.map(o => React.createElement("option", {
    key: o.n,
    value: o.date
  }, 'day' + o.n + ': ' + o.date))), queryResult && React.createElement("div", {
    className: "space-y-1.5"
  }, React.createElement("p", {
    className: "text-xs text-gray-500"
  }, t.drDidReport, "：", queryResult.did.length, "｜", t.drNotReport, "：", queryResult.notDid.length), queryResult.did.map(c => {
    var rp = queryResult.reported[c];
    var parts = (rp.type ? rp.type.split(',') : []).map(statusLabel).filter(Boolean);
    if (rp.otherText) parts.push(rp.otherText);
    var tm = '';
    try {
      var d = new Date(rp.time);
      tm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
    } catch (_e) {}
    return React.createElement("div", {
      key: c,
      className: "flex items-center justify-between bg-white/[0.03] rounded-lg px-3 py-2"
    }, React.createElement("span", {
      className: "text-sm text-gray-200"
    }, c, " ", parts.join('、')), React.createElement("span", {
      className: "text-xs text-gray-500 flex-shrink-0"
    }, tm));
  }))))));
}
function BreakTimerSection({
  settings
}) {
  var [tick, setTick] = useState(0);
  var [actionErr, setActionErr] = useState('');
  var [lastSessionMsg, setLastSessionMsg] = useState('');
  useEffect(() => {
    var iv = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(iv);
  }, []);
  var status = loadBreakStatus(settings.code, settings.workStart || '', settings.workEnd || '');
  var lastSession = status.sessions.length ? status.sessions[status.sessions.length - 1] : null;
  var localElapsed = status.isOpen && lastSession ? Math.floor((Date.now() - lastSession.greenAt) / 1000) : 0;
  var fmtSec = s => {
    var neg = s < 0;
    var a = Math.abs(s);
    return (neg ? '-' : '') + String(Math.floor(a / 3600)).padStart(2, '0') + ':' + String(Math.floor(a / 60) % 60).padStart(2, '0') + ':' + String(a % 60).padStart(2, '0');
  };
  var doFlipGreen = () => {
    var r = breakFlipGreenLocal(settings.code, settings.workStart || '', settings.workEnd || '');
    if (!r.ok) {
      setActionErr(r.error || '翻綠失敗');
      return;
    }
    setActionErr('');
    setLastSessionMsg('');
    setTick(x => x + 1);
  };
  var doFlipWhite = () => {
    var thisSessionSec = localElapsed;
    var r = breakFlipWhiteLocal(settings.code, settings.workStart || '', settings.workEnd || '');
    if (r.ok) {
      setActionErr('');
      setLastSessionMsg('本次翻綠了 ' + fmtSec(thisSessionSec).replace(/^00:/, ''));
    } else {
      setActionErr(r.error || '回牌失敗');
    }
    setTick(x => x + 1);
  };
  return React.createElement("div", {
    className: "mt-5 pt-4 border-t border-white/[0.06] space-y-2"
  }, React.createElement("p", {
    className: "text-xs font-semibold text-emerald-400 px-1"
  }, "翻綠（休息）計時"), actionErr && React.createElement("p", {
    className: "text-xs text-red-400 text-center px-2"
  }, actionErr), !status.isOpen ? React.createElement(React.Fragment, null, React.createElement("button", {
    onClick: doFlipGreen,
    className: "w-full py-3 rounded-xl bg-white text-gray-900 text-sm font-bold flex items-center justify-center gap-2 border border-white/20"
  }, "⚪ 翻綠（開始休息）"), lastSessionMsg && React.createElement("p", {
    className: "text-[11px] text-emerald-400 text-center"
  }, lastSessionMsg), status.usedSeconds > 0 && React.createElement("p", {
    className: "text-[11px] text-gray-500 text-center"
  }, "今天已累計休息 ", fmtSec(status.usedSeconds))) : React.createElement(React.Fragment, null, React.createElement("div", {
    className: "bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center"
  }, React.createElement("p", {
    className: "text-[11px] text-gray-500 mb-1"
  }, "本次已翻綠時間"), React.createElement("p", {
    className: "text-3xl font-bold tabular-nums text-emerald-400"
  }, fmtSec(localElapsed))), React.createElement("button", {
    onClick: doFlipWhite,
    className: "w-full py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2"
  }, "🟢 回牌（結束休息）")));
}
function BottomSheetModal({
  onClose,
  children,
  heightPct
}) {
  var h = heightPct || 70;
  return React.createElement("div", {
    className: "fixed inset-0 z-40 flex flex-col justify-end"
  }, React.createElement("div", {
    className: "flex-1 bg-black/40 backdrop-blur-sm",
    onClick: () => onClose && onClose()
  }), React.createElement("div", {
    className: "bg-gray-950 rounded-t-3xl overflow-hidden flex flex-col shadow-2xl",
    style: {
      height: h + 'vh'
    }
  }, React.createElement("div", {
    className: "flex justify-center pt-1.5 pb-0.5 flex-shrink-0"
  }, React.createElement("div", {
    className: "w-9 h-1 rounded-full bg-white/15"
  })), React.createElement("div", {
    className: "flex-1 overflow-y-auto min-h-0"
  }, children)));
}
function SupervisorSection({
  t,
  settings
}) {
  return React.createElement("div", {
    className: "mt-5 pt-4 border-t border-white/[0.06] space-y-2"
  }, React.createElement("p", {
    className: "text-xs font-semibold text-purple-400 px-1"
  }, "主管專用"), React.createElement("div", {
    className: "grid grid-cols-4 gap-3"
  }, React.createElement("a", {
    href: "https://liff.line.me/2010673151-AU7Cpo5v",
    className: "flex flex-col items-center gap-1"
  }, React.createElement("span", {
    className: "w-11 h-11 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg"
  }, "👥"), React.createElement("span", {
    className: "text-[10px] text-gray-500"
  }, "員工管理")), React.createElement("a", {
    href: "https://liff.line.me/2010673151-PEhuHeqe",
    className: "flex flex-col items-center gap-1"
  }, React.createElement("span", {
    className: "w-11 h-11 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg"
  }, "📋"), React.createElement("span", {
    className: "text-[10px] text-gray-500"
  }, "公告管理")), React.createElement("a", {
    href: "https://liff.line.me/2010673151-kemVP4Pi",
    className: "flex flex-col items-center gap-1"
  }, React.createElement("span", {
    className: "w-11 h-11 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg"
  }, "⚠️"), React.createElement("span", {
    className: "text-[10px] text-gray-500"
  }, "安全回報")), React.createElement("a", {
    href: "https://liff.line.me/2010673151-OMHcBUjJ?tab=blacklist",
    className: "flex flex-col items-center gap-1"
  }, React.createElement("span", {
    className: "w-11 h-11 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg"
  }, "🚫"), React.createElement("span", {
    className: "text-[10px] text-gray-500"
  }, t && t.blacklistTab || '拒接名單')), React.createElement("button", {
    onClick: () => {
      location.href = './auth.html#lang=' + (settings && settings.lang || 'zh');
    },
    className: "flex flex-col items-center gap-1"
  }, React.createElement("span", {
    className: "w-11 h-11 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-lg"
  }, "⚙️"), React.createElement("span", {
    className: "text-[10px] text-gray-500"
  }, t && t.tabManage || '管理中心'))));
}
function NameCardModal({
  t,
  settings,
  onClose,
  onUpdateSettings
}) {
  var init = getCardData(settings);
  var storeKeys = Object.keys(CARD_STORE_DEFAULTS);
  var [f, setF] = useState({
    store: init.store,
    workStart: init.workStart,
    workEnd: init.workEnd,
    phone: init.phone,
    addr: init.addr,
    addrNote: init.addrNote,
    mapUrl: init.mapUrl,
    appleUrl: init.appleUrl
  });
  var [msg, setMsg] = useState('');
  var [, setTick] = useState(0);
  useEffect(() => {
    var old = JSON.parse(JSON.stringify(CARD_STORE_DEFAULTS));
    loadCardStores().then(ch => {
      if (!ch) return;
      setF(o => {
        var od = old[o.store] || {},
          nd = CARD_STORE_DEFAULTS[o.store] || {};
        var n = Object.assign({}, o);
        [['phone', 'phone'], ['addr', 'addr'], ['addrNote', 'addrNote'], ['mapUrl', 'mapUrl'], ['appleUrl', 'appleUrl']].forEach(([fk, dk]) => {
          if (o[fk] === od[dk] && nd[dk] != null) n[fk] = nd[dk];
        });
        return n;
      });
      setTick(x => x + 1);
    });
  }, []);
  var up = (k, v) => {
    setF(o => Object.assign({}, o, {
      [k]: v
    }));
    setMsg('');
  };
  var dflt = CARD_STORE_DEFAULTS[f.store] || CARD_STORE_DEFAULTS['龍山寺店'];
  var changeStore = st => {
    var d = CARD_STORE_DEFAULTS[st] || CARD_STORE_DEFAULTS['龍山寺店'];
    setF(o => Object.assign({}, o, {
      store: st,
      phone: d.phone,
      addr: d.addr,
      addrNote: d.addrNote,
      mapUrl: d.mapUrl,
      appleUrl: d.appleUrl || ''
    }));
    setMsg('');
  };
  var times = [];
  var _loop = function (h) {
    ['00', '30'].forEach(m => times.push(String(h).padStart(2, '0') + ':' + m));
  };
  for (var h = 0; h < 24; h++) {
    _loop(h);
  }
  if (f.workStart && !times.includes(f.workStart)) times.push(f.workStart);
  if (f.workEnd && !times.includes(f.workEnd)) times.push(f.workEnd);
  times.sort();
  var save = () => {
    var updated = Object.assign({}, settings, {
      workStart: f.workStart,
      workEnd: f.workEnd,
      cardStore: f.store,
      cardPhone: f.phone,
      cardAddr: f.addr,
      cardAddrNote: f.addrNote,
      cardMapUrl: f.mapUrl,
      cardAppleUrl: f.appleUrl
    });
    try {
      LS.set('app-settings', updated);
    } catch (_e) {}
    if (onUpdateSettings) onUpdateSettings(updated);
    setMsg(t.cardSaved || '已存檔');
  };
  var share = () => {
    save();
    sendCardFlex({
      store: f.store,
      code: init.code,
      brandMain: dflt.bm,
      brandSub: dflt.bs,
      workStart: f.workStart,
      workEnd: f.workEnd,
      phone: f.phone,
      addr: f.addr,
      addrNote: f.addrNote,
      mapUrl: f.mapUrl,
      appleUrl: f.appleUrl
    });
  };
  var inp = "w-full h-12 bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 text-[15px] text-gray-100 focus:outline-none focus:border-amber-400";
  var lab = "text-[13px] text-[#aab2c0] mb-1.5 block";
  var sec = "text-[13px] font-bold text-amber-400 tracking-wide pt-1";
  return React.createElement(BottomSheetModal, {
    onClose: onClose,
    heightPct: 90
  }, React.createElement("div", {
    className: "px-4 pb-0"
  }, React.createElement("p", {
    className: "text-lg font-bold text-gray-100 pt-1"
  }, t.cardTitle || '名片'), React.createElement("p", {
    className: "text-[13px] text-[#aab2c0] mt-0.5"
  }, t.cardSub || '設定後可一鍵分享給 LINE 好友'), React.createElement("div", {
    className: "mt-4 space-y-4"
  }, React.createElement("p", {
    className: sec
  }, "會館與時間"), React.createElement("div", null, React.createElement("label", {
    className: lab
  }, t.cardBrand || '館名'), React.createElement("select", {
    value: f.store,
    onChange: e => changeStore(e.target.value),
    className: inp
  }, storeKeys.map(k => {
    var d = CARD_STORE_DEFAULTS[k];
    return React.createElement("option", {
      key: k,
      value: k
    }, d.bm + d.bs, "（", k, "）");
  }))), React.createElement("div", {
    className: "flex gap-3"
  }, React.createElement("div", {
    className: "w-[76px] flex-shrink-0"
  }, React.createElement("label", {
    className: lab
  }, t.cardCode || '老師編號'), React.createElement("div", {
    className: inp + " opacity-70 text-center px-1 flex items-center justify-center"
  }, init.code)), React.createElement("div", {
    className: "flex-1 min-w-0"
  }, React.createElement("label", {
    className: lab
  }, t.cardWork || '上班時間'), React.createElement("div", {
    className: "flex items-center gap-2"
  }, React.createElement("select", {
    value: f.workStart,
    onChange: e => up('workStart', e.target.value),
    className: inp.replace('px-3', 'px-2')
  }, times.map(x => React.createElement("option", {
    key: x,
    value: x
  }, x))), React.createElement("span", {
    className: "text-gray-400"
  }, "~"), React.createElement("select", {
    value: f.workEnd,
    onChange: e => up('workEnd', e.target.value),
    className: inp.replace('px-3', 'px-2')
  }, times.map(x => React.createElement("option", {
    key: x,
    value: x
  }, x)))))), React.createElement("div", {
    className: "h-px bg-white/[0.08]"
  }), React.createElement("p", {
    className: sec
  }, "聯絡與地點"), React.createElement("div", null, React.createElement("label", {
    className: lab
  }, t.cardPhone || '訂位電話'), React.createElement("input", {
    type: "tel",
    value: f.phone,
    onChange: e => up('phone', e.target.value),
    className: inp
  })), React.createElement("div", null, React.createElement("label", {
    className: lab
  }, t.cardAddr || '會館地址'), React.createElement("input", {
    value: f.addr,
    onChange: e => up('addr', e.target.value),
    className: inp
  })), React.createElement("div", null, React.createElement("label", {
    className: lab
  }, t.cardAddrNote || '地址補充'), React.createElement("input", {
    value: f.addrNote,
    onChange: e => up('addrNote', e.target.value),
    className: inp
  })), React.createElement("div", {
    className: "h-px bg-white/[0.08]"
  }), React.createElement("p", {
    className: sec
  }, "地圖連結"), React.createElement("div", null, React.createElement("label", {
    className: lab
  }, t.cardMapUrl || 'Google Maps 連結'), React.createElement("input", {
    value: f.mapUrl,
    onChange: e => up('mapUrl', e.target.value),
    className: inp
  })), React.createElement("div", null, React.createElement("label", {
    className: lab
  }, t.cardAppleUrl || 'Apple 地圖連結'), React.createElement("input", {
    value: f.appleUrl,
    onChange: e => up('appleUrl', e.target.value),
    className: inp
  }))), React.createElement("div", {
    className: "sticky bottom-0 -mx-4 mt-4 px-4 pt-3 pb-5 bg-gray-950 border-t border-white/[0.08]"
  }, msg && React.createElement("p", {
    className: "text-[13px] text-emerald-400 text-center mb-2"
  }, msg), React.createElement("div", {
    className: "grid grid-cols-[1fr_2fr] gap-2"
  }, React.createElement("button", {
    onClick: save,
    className: "h-[52px] rounded-2xl border border-white/[0.18] text-gray-100 text-[15px] font-bold active:bg-white/[0.08]"
  }, t.cardSave || '存檔'), React.createElement("button", {
    onClick: share,
    className: "h-[52px] rounded-2xl text-white text-[15px] font-bold active:opacity-80",
    style: {
      background: '#06c755'
    }
  }, t.cardShare || '分享給 LINE 好友')))));
}
var HIDE_BREAK = true;
var GLOVE_LIFF = 'https://liff.line.me/2010673151-kemVP4Pi/?gb2=l';
function GloveBanner({
  settings
}) {
  var readCache = () => {
    try {
      var c = JSON.parse(localStorage.getItem('gloves-cache') || 'null');
      if (c && Array.isArray(c.orders) && Date.now() - c.t < 30 * 86400e3) return c;
    } catch (_e) {}
    return null;
  };
  var [orders, setOrders] = useState(() => {
    var c = readCache();
    return c ? c.orders : [];
  });
  var [known, setKnown] = useState(() => !!readCache());
  useEffect(() => {
    var dead = false,
      tm = 0;
    var pull = async () => {
      if (navigator.onLine === false) return;
      try {
        var r = await fetch('./data/gloves.json?t=' + Date.now(), {
          cache: 'no-store'
        });
        if (!r.ok) return;
        var j = await r.json();
        if (dead || !j || !Array.isArray(j.orders)) return;
        var old = readCache();
        var same = old && JSON.stringify(old.orders) === JSON.stringify(j.orders);
        if (!same) setOrders(j.orders);
        setKnown(true);
        try {
          localStorage.setItem('gloves-cache', JSON.stringify({
            t: Date.now(),
            orders: j.orders
          }));
        } catch (_e) {}
      } catch (_e) {}
    };
    tm = setTimeout(pull, 400);
    window.addEventListener('online', pull);
    return () => {
      dead = true;
      clearTimeout(tm);
      window.removeEventListener('online', pull);
    };
  }, []);
  var my = String(settings && (settings.storeSel || settings.store) || '');
  var ORDER = ['龍山寺店', '東門店', '古亭店', '公館店'];
  var byStore = {};
  orders.forEach(o => {
    if (!o || o.status === 'ended' || o.status === 'cancelled') return;
    var k = o.store || '';
    var c = byStore[k];
    if (!c || o.status === 'collecting' && c.status !== 'collecting') byStore[k] = o;else if (c.status === o.status || o.status !== 'collecting' && c.status !== 'collecting') byStore[k] = o;
  });
  var show = Object.keys(byStore).sort((x, y) => (x === my ? -1 : y === my ? 1 : 0) || (ORDER.indexOf(x) < 0 ? 9 : ORDER.indexOf(x)) - (ORDER.indexOf(y) < 0 ? 9 : ORDER.indexOf(y))).map(k => byStore[k]).slice(0, 4);
  if (!show.length) {
    if (!known) return null;
    var vi = settings && settings.lang === 'vi';
    return React.createElement("a", {
      href: GLOVE_LIFF,
      className: "block mt-2 mb-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 active:bg-white/[0.08]"
    }, React.createElement("p", {
      className: "text-sm text-gray-300 font-semibold"
    }, "🧤 ", vi ? 'Hiện chưa có đơn mua chung găng tay' : '目前沒有手套團購'), React.createElement("p", {
      className: "mt-0.5 text-xs text-violet-300 font-bold"
    }, vi ? 'Bấm để đăng ký nhu cầu >' : '點擊登記 我有需求 >'));
  }
  return React.createElement("div", {
    className: "mt-2 mb-1 space-y-2"
  }, show.map(o => React.createElement("a", {
    key: o.id,
    href: GLOVE_LIFF,
    className: "block bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 active:bg-white/[0.08]"
  }, (() => {
    var vi = settings && settings.lang === 'vi';
    var num = /^\d+$/.test(String(o.who || ''));
    var SVI = {
      collecting: 'Đang nhận đơn',
      closed: 'Chốt sớm',
      paying: 'Đang thu tiền',
      shipping: 'Đang vận chuyển',
      arrived: 'Đã đến nơi'
    };
    var who = o.who ? String(o.who) + (num ? '號' : '') : '';
    var line1 = vi ? 'Mua chung găng tay ' + (o.store || '') + ' đang diễn ra' + (o.who ? ' (do Sư phụ ' + o.who + ' khởi tạo)' : '') : (o.store || '') + '手套團購進行中' + (who ? '（由' + who + '發起）' : '');
    var st = vi ? SVI[o.status] || o.statusLabel : o.statusLabel;
    var tgt = vi ? 'Mục tiêu ' + o.boxes + '/' + o.threshold + ' thùng' : '目標 ' + o.boxes + '/' + o.threshold + ' 箱';
    var by = vi ? 'Do ' + (o.store || '') + (o.who ? ' #' + o.who : '') + ' khởi xướng' : '由' + (o.store || '') + (who ? ' ' + who : '') + '發起';
    return React.createElement(React.Fragment, null, React.createElement("div", {
      className: "flex items-center justify-between gap-2"
    }, React.createElement("div", {
      className: "flex items-center text-sm font-bold text-gray-100 min-w-0"
    }, React.createElement("span", {
      className: "w-6 flex-shrink-0"
    }, "🧤"), React.createElement("span", {
      className: "truncate"
    }, vi ? 'Mua chung găng tay đang mở' : '手套團購進行中', st ? (vi ? ', ' : '，') + st : '')), React.createElement("span", {
      className: "text-[13px] text-gray-400 whitespace-nowrap"
    }, tgt, " ›")), React.createElement("p", {
      className: "text-xs text-gray-400 mt-0.5 ml-6"
    }, by));
  })())));
}
var HIDE_CHART = true;
function HomePage({
  settings,
  t,
  refreshKey,
  onGotoProfile,
  onGotoNotices,
  onGotoBook,
  onGotoChart,
  onGotoSuggest,
  onGotoAcupoint,
  onGotoViolation,
  onGotoBackup,
  onGotoManage,
  onGotoMonthly,
  onGotoMonthlyCalendar,
  onGotoCustomers,
  onGotoSettings,
  settingsAlert,
  onUpdateSettings,
  onLogout
}) {
  var _data$days;
  var now = bizDate();
  var bp = bizParts();
  var ty = settings.year || bp.y,
    tm = bp.m,
    td = bp.d;
  var [data, setData] = useState(null);
  var [prev, setPrev] = useState(null);
  var [otherMode, setOtherMode] = useState(false);
  var [otherVal, setOtherVal] = useState('');
  var [editPrev, setEditPrev] = useState(false);
  var [editToday, setEditToday] = useState(false);
  var [showStoreInfo, setShowStoreInfo] = useState(false);
  var [showBasicInfo, setShowBasicInfo] = useState(false);
  var [showGroupBuy, setShowGroupBuy] = useState(false);
  var [showDisasterReport, setShowDisasterReport] = useState(false);
  var [showLineQr, setShowLineQr] = useState(false);
  var [showCard, setShowCard] = useState(false);
  var [lineQrIdx, setLineQrIdx] = useState(0);
  var [dailyQueue, setDailyQueue] = useState([]);
  var [gbPromptData, setGbPromptData] = useState(null);
  var [showMoreFunc, setShowMoreFunc] = useState(() => {
    try {
      var v = localStorage.getItem('home-morefunc-open');
      return v === null ? true : v === '1';
    } catch (_e) {
      return true;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('home-morefunc-open', showMoreFunc ? '1' : '0');
    } catch (_e) {}
  }, [showMoreFunc]);
  var [moreFuncBlocked, setMoreFuncBlocked] = useState(false);
  var [moreFuncGate, setMoreFuncGate] = useState('');
  var [mfPinStep, setMfPinStep] = useState(1);
  var [mfPin1, setMfPin1] = useState('');
  var [mfPin2, setMfPin2] = useState('');
  var [mfPinErr, setMfPinErr] = useState('');
  var [mfPinShake, setMfPinShake] = useState(false);
  var [pwdInput, setPwdInput] = useState('');
  var [pwdErr, setPwdErr] = useState('');
  var [showDailyForgotPwd, setShowDailyForgotPwd] = useState(false);
  var advanceQueue = () => setDailyQueue(q => q.slice(1));
  var doDailyEmailBackup = () => {
    try {
      doEmailBackupNow(settings).catch(() => {});
    } catch (_e) {}
  };
  var doDailyAutoCloudBackup = async () => {
    var lineUid = getMyLineUserId();
    if (!lineUid) return;
    if (!backupUploadAllowed(settings.code, settings.year || bizParts().y)) return;
    try {
      var obj = makePersonalBackup(settings.code, settings.year || bizParts().y);
      var profileJson = JSON.stringify({
        store: settings.store || '',
        gender: settings.gender || '',
        shift: settings.shift || '',
        workStart: settings.workStart || '',
        workEnd: settings.workEnd || ''
      });
      await gasBackupSubmit(lineUid, settings.code, settings.year || bizParts().y, JSON.stringify(obj), profileJson);
    } catch (_e) {}
  };
  var [unboundInfo, setUnboundInfo] = useState(() => readUnboundNotice());
  useEffect(() => {
    var uid = getMyLineUserId();
    if (!uid) return;
    var alive = true;
    bindVerify(uid).then(v => {
      if (alive && v === 'superseded') setUnboundInfo(readUnboundNotice());
    }).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!settings.code) return;
    var today = new Date().toISOString().slice(0, 10);
    var homeKey = 'home-daily-' + settings.code;
    var already = false;
    try {
      already = localStorage.getItem(homeKey) === today;
    } catch (_e) {}
    if (!already && navigator.onLine !== false) {
      try {
        localStorage.setItem(homeKey, today);
      } catch (_e) {}
      (async () => {
        try {
          if (hasMyKey(settings.code)) {
            var key = getMyKey(settings.code);
            await gasVerifyKey(settings.code, key);
          }
          await gasLogDailyCheck(settings.code, settings.storeSel || settings.store);
          doDailyEmailBackup();
          if (!DISABLE_GH_DATA_FETCH) await syncMyStaffStatus(settings.code);
        } catch (_e) {}
        doDailyAutoCloudBackup();
      })();
    }
  }, [settings.code]);
  var [pwdShake, setPwdShake] = useState(false);
  var pressPwdDigit = d => {
    var next = (pwdInput + d).slice(0, 4);
    setPwdInput(next);
    if (next.length === 4) {
      if (next === settings.lockPwd) {
        setPwdInput('');
        setPwdErr('');
        setInfoUnlockTs(settings.code);
        advanceQueue();
        doDailyAutoCloudBackup();
      } else {
        setPwdErr(t.noticePwdWrong || '密碼錯誤');
        setPwdShake(true);
        setTimeout(() => {
          setPwdShake(false);
          setPwdInput('');
        }, 500);
      }
    }
  };
  var pressMfSetupDigit = d => {
    if (mfPinStep === 1) {
      var next = (mfPin1 + d).slice(0, 4);
      setMfPin1(next);
      if (next.length === 4) {
        if (!isValidPin(next)) {
          setMfPinErr(t.lockPwdInvalid);
          setMfPinShake(true);
          setTimeout(() => {
            setMfPinShake(false);
            setMfPin1('');
          }, 500);
          return;
        }
        setMfPinStep(2);
        setMfPinErr('');
      }
    } else {
      var _next = (mfPin2 + d).slice(0, 4);
      setMfPin2(_next);
      if (_next.length === 4) {
        if (_next !== mfPin1) {
          setMfPinErr(t.lockPwdMismatch);
          setMfPinShake(true);
          setTimeout(() => {
            setMfPinShake(false);
            setMfPin2('');
            setMfPinStep(1);
            setMfPin1('');
          }, 500);
          return;
        }
        var updated = Object.assign({}, settings, {
          lockPwd: mfPin1
        });
        try {
          LS.set('app-settings', updated);
        } catch (_e) {}
        if (onUpdateSettings) onUpdateSettings(updated);
        setInfoUnlockTs(settings.code);
        try {
          if (lockPwdCred) gasSetInitialPwd(settings.code, lockPwdCred(settings.code, mfPin1));
        } catch (_e) {}
        setMoreFuncGate('');
        if (isStaffLeft(settings.code)) {
          setMoreFuncBlocked(true);
        } else {
          setMoreFuncBlocked(false);
          setShowMoreFunc(true);
        }
      }
    }
  };
  var pressMfVerifyDigit = d => {
    var next = (mfPin1 + d).slice(0, 4);
    setMfPin1(next);
    if (next.length === 4) {
      if (next === settings.lockPwd) {
        setInfoUnlockTs(settings.code);
        setMoreFuncGate('');
        setMfPin1('');
        if (isStaffLeft(settings.code)) {
          setMoreFuncBlocked(true);
        } else {
          setMoreFuncBlocked(false);
          setShowMoreFunc(true);
        }
      } else {
        setMfPinErr(t.noticePwdWrong || '密碼錯誤');
        setMfPinShake(true);
        setTimeout(() => {
          setMfPinShake(false);
          setMfPin1('');
        }, 500);
      }
    }
  };
  var [gbBusy, setGbBusy] = useState(false);
  var joinGbPrompt = () => {
    if (gbBusy) return;
    setGbBusy(true);
    if (gbPromptData) {
      gasJoinGroupBuy(gbPromptData.id, settings.code, gbPromptData.item === 'glove' ? settings.gloveSize || 'M' : '', 1).catch(() => {});
    }
    setTimeout(() => {
      setGbBusy(false);
      advanceQueue();
    }, 500);
  };
  var declineGbPrompt = () => {
    if (gbBusy) return;
    setGbBusy(true);
    if (gbPromptData) {
      gasDeclineGroupBuy(gbPromptData.id, settings.code).catch(() => {});
    }
    setTimeout(() => {
      setGbBusy(false);
      advanceQueue();
    }, 500);
  };
  var load = () => {
    var md = LS.get(dk(settings.code, ty, tm));
    if (md && migrateMonthGroups(md)) {
      LS.set(dk(settings.code, ty, tm), md);
    }
    setData(md);
    var found = false;
    if (md !== null && md !== void 0 && md.days) {
      for (var d = td - 1; d >= 1; d--) {
        var day = md.days[d];
        if (day && (day.total > 0 || day.status > 0)) {
          setPrev({
            day: d,
            month: tm,
            year: ty,
            ...day
          });
          found = true;
          break;
        }
      }
    }
    if (!found) {
      for (var pm = tm - 1; pm >= 1; pm--) {
        var pmd = LS.get(dk(settings.code, ty, pm));
        if (!pmd) continue;
        for (var _d = dim(ty, pm); _d >= 1; _d--) {
          var _pmd$days;
          var _day = (_pmd$days = pmd.days) === null || _pmd$days === void 0 ? void 0 : _pmd$days[_d];
          if (_day && (_day.total > 0 || _day.status > 0)) {
            setPrev({
              day: _d,
              month: pm,
              year: ty,
              ..._day
            });
            found = true;
            break;
          }
        }
        if (found) break;
      }
    }
    if (!found) setPrev(null);
  };
  useEffect(load, [settings.code, refreshKey]);
  var [notices, setNotices] = useState(() => {
    try {
      return typeof getNoticesLocal === 'function' ? getNoticesLocal() : [];
    } catch (_e) {
      return [];
    }
  });
  var [noticeView, setNoticeView] = useState(null);
  var [nvLang, setNvLang] = useState({
    zh: true,
    vi: false
  });
  useEffect(() => {
    if (DISABLE_GH_DATA_FETCH) return;
    try {
      if (typeof fetchNotices === 'function') fetchNotices().then(list => {
        if (Array.isArray(list)) setNotices(list);
      }).catch(() => {});
    } catch (_e) {}
  }, []);
  var latestNotices = (Array.isArray(notices) ? notices : []).slice().reverse().slice(0, typeof getNoticeHomeCount === 'function' ? getNoticeHomeCount() : 2);
  var openNotice = n => {
    var vi = settings.lang === 'vi';
    setNvLang({
      zh: !vi,
      vi: vi
    });
    setNoticeView(n);
    setNoticeReadCount(null);
    setReadersView(null);
    try {
      var c = getNoticeReadCount(n.id);
      if (c !== null) setNoticeReadCount(c);
    } catch (_e) {}
  };
  var isAllStore = n => {
    var d = String(n && n.date || '');
    return d.indexOf('06-27') >= 0 || d.indexOf('6/27') >= 0;
  };
  var noticeShow = typeof getNoticeShow === 'function' ? getNoticeShow() : {
    cat: false,
    subcat: false,
    tags: false
  };
  var [noticeReadCount, setNoticeReadCount] = useState(null);
  var todayData = (data === null || data === void 0 || (_data$days = data.days) === null || _data$days === void 0 ? void 0 : _data$days[td]) || eDay();
  var hasToday = todayData.total > 0 || todayData.status > 0 || todayData.skills && Object.values(todayData.skills).some(v => v > 0);
  var sal = calcSal(todayData, getUnitPriceForDate(settings, ty, tm, td), settings.skills);
  var [highlightSlipId, setHighlightSlipId] = useState(null);
  var addUnits = n => {
    var md = data ? JSON.parse(JSON.stringify(data)) : eMon();
    var dd = md.days[td] || eDay();
    if (!dd.slips) dd.slips = [];
    var ns = newSlip(n);
    dd.slips = [...dd.slips, ns];
    dd.groups = [];
    dd.total = slipUnitsTotal(dd.slips);
    dd.laodian = slipLaodianTotal(dd.slips);
    stamp(dd);
    md.days[td] = dd;
    setData({
      ...md
    });
    LS.set(dk(settings.code, ty, tm), md);
    setOtherMode(false);
    setOtherVal('');
    setHighlightSlipId(ns.id);
    setTimeout(() => setHighlightSlipId(id => id === ns.id ? null : id), 1200);
  };
  var delSlipHome = slipId => {
    var md = JSON.parse(JSON.stringify(data));
    var dd = md.days[td];
    dd.slips = (dd.slips || []).filter(s => s.id !== slipId);
    dd.total = slipUnitsTotal(dd.slips);
    dd.laodian = slipLaodianTotal(dd.slips);
    stamp(dd);
    md.days[td] = dd;
    setData({
      ...md
    });
    LS.set(dk(settings.code, ty, tm), md);
  };
  var updSlipHome = (slipId, patch) => {
    var md = JSON.parse(JSON.stringify(data));
    var dd = md.days[td];
    dd.slips = (dd.slips || []).map(s => s.id === slipId ? {
      ...s,
      ...patch
    } : s);
    dd.total = slipUnitsTotal(dd.slips);
    dd.laodian = slipLaodianTotal(dd.slips);
    stamp(dd);
    md.days[td] = dd;
    setData({
      ...md
    });
    LS.set(dk(settings.code, ty, tm), md);
  };
  var [homeEditSlipId, setHomeEditSlipId] = useState(null);
  var closeHomeSlipModal = () => {
    var s = (todayData.slips || []).find(x => x.id === homeEditSlipId);
    if (s && settings.code && ((s.custName || '').trim() || (s.custPhone || '').trim())) {
      var toSave = s;
      if ((s.laodian || 0) >= 1 && (s.custName || '').trim() && (s.custTitle || '').trim() && !(s.tags || []).includes('老點')) {
        toSave = {
          ...s,
          tags: [...(s.tags || []), '老點']
        };
        updSlipHome(s.id, {
          tags: toSave.tags
        });
      }
      try {
        upsertCust(settings.code, toSave);
      } catch (_e) {}
    }
    setHomeEditSlipId(null);
  };
  var [homeCustQuery, setHomeCustQuery] = useState({});
  var addLaodian = n => {
    var md = data ? JSON.parse(JSON.stringify(data)) : eMon();
    var dd = md.days[td] || eDay();
    dd.laodian += n;
    stamp(dd);
    md.days[td] = dd;
    setData({
      ...md
    });
    LS.set(dk(settings.code, ty, tm), md);
  };
  var setTodayStatus = s => {
    var md = data ? JSON.parse(JSON.stringify(data)) : eMon();
    var dd = md.days[td] || eDay();
    dd.status = s;
    stamp(dd);
    md.days[td] = dd;
    setData({
      ...md
    });
    LS.set(dk(settings.code, ty, tm), md);
  };
  var addSkill = key => {
    var md = data ? JSON.parse(JSON.stringify(data)) : eMon();
    var dd = md.days[td] || eDay();
    if (!dd.skills) dd.skills = {
      guasha: 0,
      baguang: 0,
      xiujiao: 0
    };
    dd.skills[key] = (dd.skills[key] || 0) + 1;
    stamp(dd);
    md.days[td] = dd;
    setData({
      ...md
    });
    LS.set(dk(settings.code, ty, tm), md);
  };
  var savePrevDay = (d, dd) => {
    if (!prev) return;
    var key = dk(settings.code, prev.year, prev.month);
    var md = JSON.parse(JSON.stringify(LS.get(key) || eMon()));
    md.days[d] = dd;
    LS.set(key, md);
    setPrev({
      ...prev,
      ...dd
    });
    if (prev.month === tm) setData(md);
    setEditPrev(false);
  };
  var saveTodayDay = (d, dd) => {
    var md = data ? JSON.parse(JSON.stringify(data)) : eMon();
    md.days[d] = dd;
    LS.set(dk(settings.code, ty, tm), md);
    setData({
      ...md
    });
    setEditToday(false);
  };
  var prevDow = prev ? dow(prev.year, prev.month, prev.day) : 0;
  return React.createElement("div", {
    className: "p-5 max-w-md mx-auto fi"
  }, unboundInfo && React.createElement("div", {
    className: "fixed inset-0 z-[80] bg-black/70 flex items-center justify-center p-6"
  }, React.createElement("div", {
    className: "w-full max-w-sm rounded-2xl bg-[#1a1d29] border border-amber-500/40 p-5 space-y-3"
  }, React.createElement("p", {
    className: "text-lg font-bold text-amber-300"
  }, "已有新的綁定設備"), React.createElement("p", {
    className: "text-sm text-gray-300 leading-relaxed"
  }, "這個 LINE 帳號已在另一個環境", unboundInfo.env ? '（' + unboundInfo.env + '）' : '', "重新綁定", unboundInfo.at ? '，時間 ' + unboundInfo.at : '', "。為避免資料互相覆蓋，這個環境已自動解除 LINE 綁定，不會再自動備份。"), React.createElement("p", {
    className: "text-xs text-gray-500"
  }, "要在這裡重新使用，到「設定」按「使用LINE登入」即可（會取代另一個環境的綁定）。"), React.createElement("button", {
    onClick: () => {
      clearUnboundNotice();
      setUnboundInfo(null);
    },
    className: "w-full min-h-[48px] rounded-xl bg-sky-600 text-white font-semibold"
  }, "知道了"))), React.createElement("div", {
    className: "flex items-center justify-between mb-2 px-1"
  }, React.createElement("div", {
    onClick: () => setShowStoreInfo(true),
    className: "flex items-baseline gap-1.5 active:opacity-70 cursor-pointer"
  }, React.createElement("span", {
    className: "text-base font-bold text-gray-100"
  }, (CARD_STORE_DEFAULTS[settings.storeSel || settings.store] || CARD_STORE_DEFAULTS['龍山寺店']).bm), React.createElement("span", {
    className: "text-xs text-gray-500"
  }, (CARD_STORE_DEFAULTS[settings.storeSel || settings.store] || CARD_STORE_DEFAULTS['龍山寺店']).bs), React.createElement("span", {
    className: "text-[10px] px-1.5 py-0.5 rounded-full bg-red-600 text-white font-bold border border-red-400"
  }, "24h")), React.createElement("button", {
    onClick: () => setShowBasicInfo(true),
    className: "text-sm text-gray-500 font-mono active:text-gray-300 px-2 min-h-[44px] flex items-center -mr-1"
  }, "#", settings.code)), showStoreInfo && React.createElement(InfoEditModal, {
    type: "store",
    settings: settings,
    t: t,
    onClose: () => setShowStoreInfo(false),
    onUpdateSettings: onUpdateSettings,
    onLogout: onLogout
  }), showBasicInfo && React.createElement(InfoEditModal, {
    type: "basic",
    settings: settings,
    t: t,
    onClose: () => setShowBasicInfo(false),
    onUpdateSettings: onUpdateSettings,
    onLogout: onLogout
  }), latestNotices.length > 0 && React.createElement("div", {
    className: "mb-4"
  }, React.createElement("div", {
    className: "flex items-center justify-between mb-2 px-1"
  }, React.createElement("span", {
    className: "text-xs font-semibold text-amber-400"
  }, "📢 ", t.latestNotices || '最新公告'), onGotoNotices && React.createElement("button", {
    onClick: () => onGotoNotices(),
    className: "text-[11px] text-gray-500 active:text-gray-300"
  }, t.viewAll || '看全部', " ›")), React.createElement("div", {
    className: "space-y-1.5"
  }, latestNotices.map(n => React.createElement("div", {
    key: n.id,
    onClick: () => openNotice(n),
    className: "bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5 active:bg-white/[0.06] cursor-pointer"
  }, React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, React.createElement("p", {
    className: "text-sm text-gray-200 font-medium truncate flex-1"
  }, typeof noticeSummary === 'function' ? noticeSummary(n, settings.lang) : n.summary || n.title || ''), React.createElement("span", {
    className: `text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${isAllStore(n) ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`
  }, isAllStore(n) ? t.allStore || '全店公告' : t.oneStore || '單店公告')), React.createElement("div", {
    className: "flex items-center justify-between gap-2 mt-1"
  }, React.createElement("span", {
    className: "text-[10px] text-gray-500 truncate"
  }, "👤 ", n.author || '', " · ", n.date), React.createElement("span", {
    className: `text-[11px] flex-shrink-0 ${isNoticeRead(n.id) ? 'text-emerald-500' : 'text-gray-500'}`
  }, isNoticeRead(n.id) ? '👍 ' + (t.noticeReadMark || '已讀') : '○')))))), prev && React.createElement("div", {
    onClick: () => setEditPrev(true),
    className: "flex items-center justify-between gap-2 px-1 pb-2 min-h-[40px] text-sm text-gray-400 active:opacity-70 cursor-pointer"
  }, React.createElement("span", {
    className: "truncate"
  }, t === T.zh ? '上一筆' : 'Lần trước', " ", prev.month, "/", prev.day, "(", t.dn[prevDow], ") · ", prev.total, t.units, prev.laodian > 0 ? ` · ${prev.laodian}${t.laodian}` : '', !canWork[prev.status || 0] && React.createElement("span", {
    className: `text-xs px-2 py-0.5 rounded-full ml-2 ${SBG[prev.status]} ${STC[prev.status]}`
  }, t[SK[prev.status]])), React.createElement("span", {
    className: "whitespace-nowrap flex items-center gap-1"
  }, React.createElement("b", {
    className: "text-gray-200 tabular-nums"
  }, "$", calcSal(prev, getUnitPriceForDate(settings, prev.year, prev.month, prev.day), settings.skills).toLocaleString()), React.createElement("svg", {
    className: "w-3.5 h-3.5 text-gray-600",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9 5l7 7-7 7"
  })))), false && React.createElement("div", {
    onClick: () => setEditToday(true),
    className: "bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 mb-4 active:bg-emerald-500/15 cursor-pointer"
  }, React.createElement("div", {
    className: "flex items-center justify-between"
  }, React.createElement("div", {
    className: "flex items-center gap-2"
  }, React.createElement("span", {
    className: `w-2.5 h-2.5 rounded-full flex-shrink-0 ${todayData.total > 0 ? 'led-green' : 'led-gray'}`
  }), React.createElement("span", {
    className: "text-lg font-bold text-gray-100"
  }, tm, "/", td), React.createElement("span", {
    className: "text-sm text-gray-500 ml-0.5"
  }, "(", t.dn[now.getDay()], ")")), React.createElement("div", {
    className: "text-right"
  }, !canWork[todayData.status || 0] && React.createElement("span", {
    className: `text-sm px-2 py-0.5 rounded-full mr-2 ${SBG[todayData.status]} ${STC[todayData.status]}`
  }, t[SK[todayData.status]]), React.createElement("span", {
    className: "text-xl font-bold text-emerald-400 tabular-nums"
  }, "$", sal.toLocaleString()))), React.createElement("div", {
    className: "flex items-center justify-between mt-0.5"
  }, React.createElement("span", {
    className: "text-xs text-gray-500"
  }, todayData.total, t.units, todayData.laodian > 0 ? ` · ${todayData.laodian}${t.laodian}` : ''), React.createElement("svg", {
    className: `w-3.5 h-3.5 ${todayData.total > 0 ? 'text-red-500 arrow-blink' : 'text-gray-600'}`,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9 5l7 7-7 7"
  })))), React.createElement("div", {
    onClick: () => setEditToday(true),
    className: `bg-emerald-500/10 border border-emerald-500/25 px-[18px] pt-4 pb-3.5 active:bg-emerald-500/15 cursor-pointer ${settings.homeShowA !== false ? 'rounded-t-2xl rounded-b-none' : 'rounded-2xl mb-4'}`
  }, React.createElement("div", {
    className: "flex items-center justify-between"
  }, React.createElement("div", {
    className: "flex items-center gap-2"
  }, React.createElement("span", {
    className: `w-2.5 h-2.5 rounded-full flex-shrink-0 ${todayData.total > 0 ? 'led-green' : 'led-gray'}`
  }), React.createElement("span", {
    className: "text-[17px] font-extrabold text-gray-100"
  }, tm, "/", td), React.createElement("span", {
    className: "text-sm text-gray-500 ml-0.5"
  }, "(", t.dn[now.getDay()], ")")), React.createElement("div", {
    className: "text-right"
  }, !canWork[todayData.status || 0] && React.createElement("span", {
    className: `text-sm px-2 py-0.5 rounded-full mb-1 inline-block ${SBG[todayData.status]} ${STC[todayData.status]}`
  }, t[SK[todayData.status]]), React.createElement("p", {
    className: "text-[32px] leading-[1.1] font-extrabold text-emerald-400 tabular-nums"
  }, "$", sal.toLocaleString()), React.createElement("p", {
    className: "text-[15px] text-emerald-300/90 mt-0.5"
  }, React.createElement("b", {
    className: "text-xl"
  }, todayData.total), " ", t.units, todayData.laodian > 0 ? ` · ${todayData.laodian} ${t.laodian}` : '')))), false && hasToday && React.createElement("div", {
    className: "bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-5"
  }, React.createElement("div", {
    className: "flex items-center justify-between"
  }, React.createElement("span", {
    className: "text-sm text-emerald-400 font-medium"
  }, t.todayDone), React.createElement("div", {
    className: "flex items-baseline gap-2"
  }, React.createElement("span", {
    className: "text-emerald-300 font-bold text-lg"
  }, todayData.total, t.units), React.createElement("span", {
    className: "text-emerald-400 font-bold text-lg"
  }, "$", sal.toLocaleString()))), todayData.laodian > 0 && React.createElement("div", {
    className: "mt-1 text-sm text-orange-400"
  }, t.laodian, ": ", todayData.laodian), (todayData.groups || []).length > 1 && React.createElement("div", {
    className: "mt-1 text-xs text-gray-600"
  }, (todayData.groups || []).join(' + '), " = ", todayData.total), todayData.skills && SKILL_KEYS.map((k, i) => {
    var _settings$skills;
    return (_settings$skills = settings.skills) !== null && _settings$skills !== void 0 && _settings$skills[k] && todayData.skills[k] > 0 ? React.createElement("span", {
      key: k,
      className: `inline-block mt-1 mr-2 text-xs ${SKILL_COLORS[i]}`
    }, t[SKILL_SHORT[i]], "×", todayData.skills[k]) : null;
  })), false && React.createElement("div", {
    className: "mb-6"
  }, React.createElement("p", {
    className: "text-sm text-gray-400 mb-3"
  }, hasToday ? t.continueAdd : t.startAdd), React.createElement("div", {
    className: "grid grid-cols-5 gap-2"
  }, [1, 2, 3].map(n => React.createElement("button", {
    key: n,
    onClick: () => addUnits(n),
    className: "py-4 rounded-xl bg-amber-600/15 border border-amber-600/20 text-amber-300 text-lg font-bold active:bg-amber-600/30 transition-all"
  }, "+", n)), !otherMode ? React.createElement("button", {
    onClick: () => setOtherMode(true),
    className: "col-span-2 py-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-gray-500 text-sm font-medium active:bg-white/[0.08]"
  }, t.other) : React.createElement(React.Fragment, null, React.createElement("input", {
    type: "number",
    inputMode: "numeric",
    value: otherVal,
    onChange: e => setOtherVal(e.target.value),
    autoFocus: true,
    className: "bg-white/[0.06] border border-amber-500/50 rounded-xl px-1 py-2 text-center text-lg text-gray-100 font-bold focus:outline-none",
    placeholder: "?"
  }), React.createElement("button", {
    onClick: () => {
      var v = parseInt(otherVal);
      if (v > 0) addUnits(v);
    },
    className: "rounded-xl bg-amber-600 text-white font-bold"
  }, "OK")))), settings.homeShowA !== false && React.createElement("div", {
    className: "mb-4"
  }, !otherMode ? React.createElement("div", {
    className: "grid grid-cols-[1fr_1fr_1.25fr_1.1fr] gap-[3px] mt-[3px]"
  }, React.createElement("button", {
    onClick: () => addUnits(1),
    className: "h-[60px] text-[23px] font-bold bg-amber-600/15 border border-amber-600/25 text-amber-300 rounded-[0_6px_6px_26px] active:bg-amber-600/30"
  }, "+1"), React.createElement("button", {
    onClick: () => addUnits(2),
    className: "h-[60px] text-[23px] font-bold bg-amber-600/15 border border-amber-600/25 text-amber-300 rounded-md active:bg-amber-600/30"
  }, "+2"), React.createElement("button", {
    onClick: () => addUnits(3),
    className: "h-[60px] text-[27px] font-extrabold bg-amber-600 border border-amber-600 text-white rounded-md shadow-lg active:opacity-85"
  }, "+3"), React.createElement("button", {
    onClick: () => setOtherMode(true),
    className: "h-[60px] text-[15px] font-bold bg-white/[0.06] border border-white/[0.12] text-gray-300 rounded-[6px_0_26px_6px] active:bg-white/[0.1]"
  }, t === T.zh ? '更多' : 'Thêm')) : React.createElement("div", {
    className: "grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-[3px] mt-[3px]"
  }, React.createElement("input", {
    type: "number",
    inputMode: "numeric",
    value: otherVal,
    onChange: e => setOtherVal(e.target.value),
    autoFocus: true,
    className: "w-full min-w-0 h-[60px] bg-white/[0.06] border border-amber-500/50 rounded-[0_6px_6px_26px] px-4 text-center text-2xl text-gray-100 font-bold focus:outline-none",
    placeholder: "?"
  }), React.createElement("button", {
    onClick: () => {
      var v = parseInt(otherVal);
      if (v > 0) {
        addUnits(v);
        setOtherVal('');
        setOtherMode(false);
      } else {
        setOtherVal('');
        setOtherMode(false);
      }
    },
    className: `min-w-0 h-[60px] rounded-[6px_0_26px_6px] text-lg font-bold ${parseInt(otherVal) > 0 ? 'bg-amber-600 text-white' : 'bg-white/[0.06] border border-white/[0.12] text-gray-300'}`
  }, parseInt(otherVal) > 0 ? 'OK' : '✕')), !(todayData.total > 0) && React.createElement("p", {
    className: "text-center text-[13px] text-amber-500 font-semibold mt-2"
  }, "↑ ", t === T.zh ? '做完一位客人,按上面的「+1」記一筆' : 'Làm xong một khách, bấm「+1」ở trên để ghi')), false && React.createElement("div", {
    className: "mb-6"
  }, React.createElement("p", {
    className: "text-sm text-gray-400 mb-3"
  }, t.addLaodian), React.createElement("div", {
    className: "grid grid-cols-6 gap-2"
  }, [1, 2, 3, 4, 5, 6].map(n => React.createElement("button", {
    key: n,
    onClick: () => addLaodian(n),
    className: "py-3.5 rounded-xl bg-orange-500/10 border border-orange-500/15 text-orange-400 font-bold active:bg-orange-500/25 transition-all"
  }, "+", n)))), SKILL_KEYS.some(k => {
    var _settings$skills2;
    return (_settings$skills2 = settings.skills) === null || _settings$skills2 === void 0 ? void 0 : _settings$skills2[k];
  }) && React.createElement("div", {
    className: "mb-6"
  }, React.createElement("p", {
    className: "text-sm text-gray-400 mb-3"
  }, t.skills), React.createElement("div", {
    className: "grid grid-cols-3 gap-2"
  }, SKILL_KEYS.map((k, i) => {
    var _settings$skills3, _todayData$skills;
    return (_settings$skills3 = settings.skills) !== null && _settings$skills3 !== void 0 && _settings$skills3[k] ? React.createElement("button", {
      key: k,
      onClick: () => addSkill(k),
      className: "py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] active:bg-white/[0.08] transition-all text-center"
    }, React.createElement("div", {
      className: `text-sm font-bold ${SKILL_COLORS[i]}`
    }, t[SKILL_SHORT[i]], (((_todayData$skills = todayData.skills) === null || _todayData$skills === void 0 ? void 0 : _todayData$skills[k]) || 0) > 0 ? ` ×${todayData.skills[k]}` : ''), React.createElement("div", {
      className: "text-[10px] text-gray-600"
    }, t[k], " $", SKILL_PRICES[i])) : null;
  }))), settings.homeShowB !== false && (todayData.slips || []).length > 0 && React.createElement("div", {
    className: "mb-3"
  }, React.createElement("p", {
    className: "text-[15px] font-bold text-gray-100 mb-2"
  }, t.slipList, "（", todayData.slips.length, "）"), React.createElement("div", {
    className: "space-y-1.5"
  }, todayData.slips.map(s => React.createElement("div", {
    key: s.id,
    onClick: () => setHomeEditSlipId(s.id),
    className: `flex items-center gap-2.5 rounded-xl px-3.5 min-h-[48px] active:bg-white/[0.06] cursor-pointer border transition-colors duration-1000 ${s.id === highlightSlipId ? 'bg-amber-500/25 border-amber-500/40' : 'bg-white/[0.03] border-white/[0.06]'}`
  }, React.createElement("span", {
    className: "text-[17px] font-bold text-amber-300 tabular-nums whitespace-nowrap"
  }, s.units, t.units, " ", slipSvcLabel(s, t === T.zh ? "zh" : "vi")), (s.laodian || 0) > 0 && React.createElement("span", {
    className: "text-[13px] font-semibold text-orange-400 whitespace-nowrap"
  }, t.laodian, (s.laodian || 0) > 1 ? ' ' + s.laodian : ''), React.createElement("span", {
    className: "text-sm text-gray-300 truncate"
  }, s.custName || '', s.custTitle ? bookTitleName(s.custTitle, t === T.zh ? 'zh' : 'vi') : ''), React.createElement("span", {
    className: "text-[15px] text-gray-400 tabular-nums ml-auto whitespace-nowrap"
  }, (() => {
    var d = new Date(s.startAt || s.createdAt);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  })()))))), homeEditSlipId && (() => {
    var s = (todayData.slips || []).find(x => x.id === homeEditSlipId);
    if (!s) return null;
    var st = new Date(s.startAt || s.createdAt);
    var hm = String(st.getHours()).padStart(2, '0') + ':' + String(st.getMinutes()).padStart(2, '0');
    return React.createElement("div", {
      className: "fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center",
      onClick: closeHomeSlipModal
    }, React.createElement("div", {
      className: "su bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] flex flex-col",
      onClick: e => e.stopPropagation()
    }, React.createElement("div", {
      className: "w-10 h-1 rounded-full bg-white/20 mx-auto mt-2 sm:hidden flex-shrink-0"
    }), React.createElement("div", {
      className: "px-5 pt-3 pb-3 flex items-start justify-between flex-shrink-0"
    }, React.createElement("div", {
      className: "min-w-0"
    }, React.createElement("h3", {
      className: "text-xl font-bold text-gray-100"
    }, t.slipList), React.createElement("p", {
      className: "text-sm text-gray-400 mt-0.5 tabular-nums"
    }, hm, " ", t === T.zh ? '開始' : '', " · ", s.units || 1, " ", t.units, (s.laodian || 0) > 0 ? ` · ${t.laodian} ${s.laodian}` : '')), React.createElement("button", {
      onClick: closeHomeSlipModal,
      "aria-label": "close",
      className: "w-10 h-10 flex-shrink-0 rounded-full bg-white/[0.07] flex items-center justify-center text-gray-300 active:bg-white/[0.12]"
    }, "✕")), React.createElement("div", {
      className: "flex-1 overflow-y-auto border-t border-white/[0.08]"
    }, React.createElement(SlipEditFields, {
      s: s,
      t: t,
      editorCode: settings.code,
      custQuery: homeCustQuery,
      setCustQuery: setHomeCustQuery,
      onUpdate: patch => updSlipHome(s.id, patch),
      onDelete: () => {
        delSlipHome(s.id);
        setHomeEditSlipId(null);
      },
      noDelete: true
    })), React.createElement("div", {
      className: "flex gap-2.5 px-5 pt-3 pb-5 border-t border-white/[0.08] flex-shrink-0"
    }, React.createElement("button", {
      onClick: () => {
        delSlipHome(s.id);
        setHomeEditSlipId(null);
      },
      className: "h-[50px] px-4 rounded-2xl text-red-400 text-[15px] font-semibold active:bg-red-500/10"
    }, t.slipDelete), React.createElement("button", {
      onClick: closeHomeSlipModal,
      className: "flex-1 h-[50px] rounded-2xl bg-amber-400 text-gray-950 text-[17px] font-bold active:opacity-85"
    }, t === T.zh ? '完成' : 'Xong'))));
  })(), settings.homeShowC === true && React.createElement("div", null, React.createElement("p", {
    className: "text-sm text-gray-400 mb-3"
  }, t.status), React.createElement("div", {
    className: "grid grid-cols-3 gap-2"
  }, [0, 3, 4, 1, 2, 5].map(s => React.createElement("button", {
    key: s,
    onClick: () => setTodayStatus(s),
    className: `py-2.5 rounded-xl text-sm font-semibold transition-all ${todayData.status === s ? s === 0 ? 'bg-gray-600 text-white ring-2 ring-gray-500' : `${SBG[s].replace('/20', '/30')} ${STC[s]} ring-2 ring-current` : 'bg-white/[0.04] text-gray-600'}`
  }, t[SK[s]])))), React.createElement(GloveBanner, {
    settings: settings
  }), React.createElement("button", {
    onClick: () => {
      if (showMoreFunc) {
        setShowMoreFunc(false);
        return;
      }
      if (!HIDE_COMPANY_FEATURES) {
        if (!settings.lockPwd) {
          setMoreFuncGate('setup');
          setMfPinStep(1);
          setMfPin1('');
          setMfPin2('');
          setMfPinErr('');
          return;
        }
        var lockAutoTime = settings.lockAutoTime || 60;
        if (Date.now() - getInfoUnlockTs(settings.code) > lockAutoTime * 60 * 1000) {
          setMoreFuncGate('verify');
          setMfPin1('');
          setMfPinErr('');
          return;
        }
      }
      if (isStaffLeft(settings.code)) {
        setMoreFuncBlocked(true);
        return;
      }
      setMoreFuncBlocked(false);
      setShowMoreFunc(true);
    },
    className: "mt-2 mb-1 min-h-[44px] pr-3 rounded-lg text-sm text-gray-400 font-semibold flex items-center gap-1.5"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "14",
    height: "14",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: `transition-transform ${showMoreFunc ? 'rotate-180' : ''}`
  }, React.createElement("path", {
    d: "M6 9l6 6 6-6"
  })), React.createElement("span", null, t.moreFuncBtn || '其他功能')), !HIDE_COMPANY_FEATURES && moreFuncGate === 'setup' && React.createElement("div", {
    className: "pinGateBackdrop fixed inset-0 z-[75] flex flex-col items-center justify-center gap-5 p-6",
    onClick: () => setMoreFuncGate('')
  }, React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "flex flex-col items-center gap-5"
  }, React.createElement("p", {
    className: "pinGateTitle text-base font-bold text-center"
  }, mfPinStep === 1 ? t.lockPwdTitle : t.lockPwdConfirm), mfPinStep === 1 && React.createElement("p", {
    className: "pinGateBody text-xs text-center max-w-xs -mt-3"
  }, t.lockPwdHint), React.createElement("div", {
    className: mfPinShake ? 'text-red-500' : ''
  }, React.createElement(PinDots, {
    length: mfPinStep === 1 ? mfPin1.length : mfPin2.length
  })), mfPinErr && React.createElement("p", {
    className: "text-xs text-red-400 text-center"
  }, mfPinErr), React.createElement(PinKeypad, {
    onDigit: pressMfSetupDigit,
    onBackspace: () => {
      if (mfPinStep === 1) setMfPin1(v => v.slice(0, -1));else setMfPin2(v => v.slice(0, -1));
    }
  }), React.createElement("button", {
    onClick: () => setMoreFuncGate(''),
    className: "pinGateBody text-xs underline"
  }, t.infoCancelBtn))), !HIDE_COMPANY_FEATURES && moreFuncGate === 'verify' && React.createElement("div", {
    className: "pinGateBackdrop fixed inset-0 z-[75] flex flex-col items-center justify-center gap-5 p-6",
    onClick: () => setMoreFuncGate('')
  }, React.createElement("div", {
    onClick: e => e.stopPropagation(),
    className: "flex flex-col items-center gap-5"
  }, React.createElement("p", {
    className: "pinGateTitle text-base font-bold text-center"
  }, t.homePwdPopupTitle), React.createElement("div", {
    className: mfPinShake ? 'text-red-500' : ''
  }, React.createElement(PinDots, {
    length: mfPin1.length
  })), mfPinErr && React.createElement("p", {
    className: "text-xs text-red-400 text-center"
  }, mfPinErr), React.createElement(PinKeypad, {
    onDigit: pressMfVerifyDigit,
    onBackspace: () => setMfPin1(v => v.slice(0, -1))
  }), React.createElement("button", {
    onClick: () => setMoreFuncGate(''),
    className: "pinGateBody text-xs underline"
  }, t.infoCancelBtn))), moreFuncBlocked && !showMoreFunc && React.createElement("p", {
    className: "text-xs text-red-400 text-center mt-2"
  }, t.moreFuncLeftMsg || '此區功能僅開放在職員工使用'), showMoreFunc && React.createElement(React.Fragment, null, React.createElement("div", {
    className: "grid grid-cols-4 mt-1 border-y border-white/[0.1]"
  }, React.createElement("button", {
    onClick: () => onGotoMonthly && onGotoMonthly(),
    className: "relative flex flex-col items-center justify-center gap-2 min-h-[92px] text-[14px] font-semibold text-gray-100 active:bg-white/[0.06]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "28",
    height: "28",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-amber-400"
  }, React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "17",
    rx: "2"
  }), React.createElement("path", {
    strokeWidth: 1.8,
    d: "M3 9h18M8 2v4M16 2v4"
  })), React.createElement("span", null, t.monthly)), React.createElement("button", {
    onClick: () => onGotoMonthlyCalendar && onGotoMonthlyCalendar(),
    className: "relative flex flex-col items-center justify-center gap-2 min-h-[92px] text-[14px] font-semibold text-gray-100 active:bg-white/[0.06] border-l border-white/[0.1]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "28",
    height: "28",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-amber-400"
  }, React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "18",
    rx: "2"
  }), React.createElement("path", {
    d: "M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"
  })), React.createElement("span", null, t.monthlyCalendar || '月曆')), React.createElement("button", {
    onClick: () => onGotoCustomers && onGotoCustomers(),
    className: "relative flex flex-col items-center justify-center gap-2 min-h-[92px] text-[14px] font-semibold text-gray-100 active:bg-white/[0.06] border-l border-white/[0.1]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "28",
    height: "28",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-amber-400"
  }, React.createElement("path", {
    d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM3 21v-1a6 6 0 0112 0v1"
  }), React.createElement("path", {
    d: "M17 11a3 3 0 003-3M19 21v-1a5 5 0 00-3-4.6"
  })), React.createElement("span", null, t.custManage)), React.createElement("button", {
    onClick: () => onGotoSettings && onGotoSettings(),
    className: "relative flex flex-col items-center justify-center gap-2 min-h-[92px] text-[14px] font-semibold text-gray-100 active:bg-white/[0.06] border-l border-white/[0.1]"
  }, settingsAlert && React.createElement("span", {
    className: "absolute top-2 right-[calc(50%-24px)] text-red-500 text-[11px]"
  }, "❗"), React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "28",
    height: "28",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-amber-400"
  }, React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "3"
  }), React.createElement("path", {
    d: "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-2.82 1.17V21a2 2 0 01-4 0v-.09A1.65 1.65 0 006.6 19.4l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 8.6l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 6.6a1.65 1.65 0 001-1.51V5a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
  })), React.createElement("span", null, t.settings))), React.createElement("p", {
    className: "text-[13px] font-semibold tracking-wider text-gray-400 mt-6 mb-1 px-1"
  }, t === T.zh ? '工具' : 'Công cụ'), React.createElement("div", {
    className: "border-t border-white/[0.1]"
  }, React.createElement("button", {
    onClick: () => onGotoBook && onGotoBook(),
    className: "w-full flex items-center gap-3.5 min-h-[56px] border-b border-white/[0.1] text-left active:bg-white/[0.05]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "22",
    height: "22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-gray-300"
  }, React.createElement("rect", {
    x: "3",
    y: "4",
    width: "18",
    height: "18",
    rx: "2"
  }), React.createElement("path", {
    d: "M16 2v4M8 2v4M3 10h18"
  })), React.createElement("span", {
    className: "flex-1 min-w-0"
  }, React.createElement("span", {
    className: "block text-base font-semibold text-gray-100"
  }, t.tabBook2), React.createElement("span", {
    className: "block text-[13px] text-gray-400"
  }, t === T.zh ? '登記自己約的客人' : 'Ghi lịch khách tự hẹn')), React.createElement("span", {
    className: "text-gray-500 text-lg"
  }, "›")), React.createElement("button", {
    onClick: () => setShowCard(true),
    className: "w-full flex items-center gap-3.5 min-h-[56px] border-b border-white/[0.1] text-left active:bg-white/[0.05]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "22",
    height: "22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-gray-300"
  }, React.createElement("rect", {
    x: "2.5",
    y: "5",
    width: "19",
    height: "14",
    rx: "2"
  }), React.createElement("circle", {
    cx: "8.5",
    cy: "11",
    r: "2"
  }), React.createElement("path", {
    d: "M5.5 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4M14 10h5M14 13.5h4"
  })), React.createElement("span", {
    className: "flex-1 min-w-0"
  }, React.createElement("span", {
    className: "block text-base font-semibold text-gray-100"
  }, t.cardBtn || '名片'), React.createElement("span", {
    className: "block text-[13px] text-gray-400"
  }, t === T.zh ? '編輯並分享給客人' : 'Chỉnh sửa & chia sẻ cho khách')), React.createElement("span", {
    className: "text-gray-500 text-lg"
  }, "›")), React.createElement("button", {
    onClick: () => onGotoAcupoint && onGotoAcupoint(),
    className: "w-full flex items-center gap-3.5 min-h-[56px] border-b border-white/[0.1] text-left active:bg-white/[0.05]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "22",
    height: "22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-gray-300"
  }, React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "1.5",
    fill: "currentColor",
    stroke: "none"
  }), React.createElement("path", {
    d: "M12 3a9 9 0 100 18 9 9 0 000-18z"
  }), React.createElement("path", {
    d: "M12 3v4M12 17v4M3 12h4M17 12h4"
  })), React.createElement("span", {
    className: "flex-1 min-w-0"
  }, React.createElement("span", {
    className: "block text-base font-semibold text-gray-100"
  }, t.acupointBtn)), React.createElement("span", {
    className: "text-gray-500 text-lg"
  }, "›")), React.createElement("button", {
    onClick: () => onGotoBackup && onGotoBackup(),
    className: "w-full flex items-center gap-3.5 min-h-[56px] border-b border-white/[0.1] text-left active:bg-white/[0.05]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "22",
    height: "22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-gray-300"
  }, React.createElement("path", {
    d: "M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
  })), React.createElement("span", {
    className: "flex-1 min-w-0"
  }, React.createElement("span", {
    className: "block text-base font-semibold text-gray-100"
  }, t.tabBackup || '備份'), React.createElement("span", {
    className: "block text-[13px] text-gray-400"
  }, t === T.zh ? '匯出／還原個人資料' : 'Xuất / khôi phục dữ liệu')), React.createElement("span", {
    className: "text-gray-500 text-lg"
  }, "›"))), React.createElement("p", {
    className: "text-[13px] font-semibold tracking-wider text-gray-400 mt-6 mb-1 px-1"
  }, "LINE"), React.createElement("div", {
    className: "border-t border-white/[0.1]"
  }, React.createElement("button", {
    onClick: () => setShowLineQr(true),
    className: "w-full flex items-center gap-3.5 min-h-[56px] border-b border-white/[0.1] text-left active:bg-white/[0.05]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "22",
    height: "22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-gray-300"
  }, React.createElement("rect", {
    x: "3",
    y: "3",
    width: "7",
    height: "7",
    rx: "1"
  }), React.createElement("rect", {
    x: "14",
    y: "3",
    width: "7",
    height: "7",
    rx: "1"
  }), React.createElement("rect", {
    x: "3",
    y: "14",
    width: "7",
    height: "7",
    rx: "1"
  }), React.createElement("path", {
    d: "M14 14h3v3h-3zM19 14h2v2h-2zM14 19h2v2h-2zM19 19h2v2h-2z"
  })), React.createElement("span", {
    className: "flex-1 min-w-0"
  }, React.createElement("span", {
    className: "block text-base font-semibold text-gray-100"
  }, "LINE Bot"), React.createElement("span", {
    className: "block text-[13px] text-gray-400"
  }, t === T.zh ? '掃 QR 加入／開啟網頁版' : 'Quét QR để thêm / mở bản web')), React.createElement("span", {
    className: "text-gray-500 text-lg"
  }, "›"))), !HIDE_COMPANY_FEATURES && React.createElement("div", {
    className: "border-t border-white/[0.1] mt-6"
  }, React.createElement("button", {
    onClick: () => onGotoNotices && onGotoNotices(),
    className: "w-full flex items-center gap-3.5 min-h-[56px] border-b border-white/[0.1] text-left active:bg-white/[0.05]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "22",
    height: "22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-gray-300"
  }, React.createElement("path", {
    d: "M3 11l18-6v14l-18-6v-2z"
  }), React.createElement("path", {
    d: "M8 15v4a2 2 0 002 2h1"
  })), React.createElement("span", {
    className: "flex-1 min-w-0"
  }, React.createElement("span", {
    className: "block text-base font-semibold text-gray-100"
  }, t.tabNotice)), React.createElement("span", {
    className: "text-gray-500 text-lg"
  }, "›")), !HIDE_CHART && React.createElement("button", {
    onClick: () => onGotoChart && onGotoChart(),
    className: "w-full flex items-center gap-3.5 min-h-[56px] border-b border-white/[0.1] text-left active:bg-white/[0.05]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "22",
    height: "22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-gray-300"
  }, React.createElement("path", {
    d: "M3 3v18h18"
  }), React.createElement("path", {
    d: "M18 17V9M13 17V5M8 17v-3"
  })), React.createElement("span", {
    className: "flex-1 min-w-0"
  }, React.createElement("span", {
    className: "block text-base font-semibold text-gray-100"
  }, t.tabChart)), React.createElement("span", {
    className: "text-gray-500 text-lg"
  }, "›")), React.createElement("button", {
    onClick: () => onGotoSuggest && onGotoSuggest(),
    className: "w-full flex items-center gap-3.5 min-h-[56px] border-b border-white/[0.1] text-left active:bg-white/[0.05]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "22",
    height: "22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-gray-300"
  }, React.createElement("path", {
    d: "M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z"
  })), React.createElement("span", {
    className: "flex-1 min-w-0"
  }, React.createElement("span", {
    className: "block text-base font-semibold text-gray-100"
  }, t.tabSuggest)), React.createElement("span", {
    className: "text-gray-500 text-lg"
  }, "›")), React.createElement("button", {
    onClick: () => onGotoViolation && onGotoViolation(),
    className: "w-full flex items-center gap-3.5 min-h-[56px] border-b border-white/[0.1] text-left active:bg-white/[0.05]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "22",
    height: "22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-gray-300"
  }, React.createElement("path", {
    d: "M4 22V4a1 1 0 011-1h13.5a.5.5 0 01.4.8l-2.9 3.7 2.9 3.7a.5.5 0 01-.4.8H5"
  })), React.createElement("span", {
    className: "flex-1 min-w-0"
  }, React.createElement("span", {
    className: "block text-base font-semibold text-gray-100"
  }, t.tabViolation)), React.createElement("span", {
    className: "text-gray-500 text-lg"
  }, "›")), React.createElement("button", {
    onClick: () => setShowGroupBuy(true),
    className: "w-full flex items-center gap-3.5 min-h-[56px] border-b border-white/[0.1] text-left active:bg-white/[0.05]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "22",
    height: "22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-gray-300"
  }, React.createElement("circle", {
    cx: "9",
    cy: "21",
    r: "1"
  }), React.createElement("circle", {
    cx: "20",
    cy: "21",
    r: "1"
  }), React.createElement("path", {
    d: "M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"
  })), React.createElement("span", {
    className: "flex-1 min-w-0"
  }, React.createElement("span", {
    className: "block text-base font-semibold text-gray-100"
  }, t.groupBuyBtn)), React.createElement("span", {
    className: "text-gray-500 text-lg"
  }, "›")), React.createElement("button", {
    onClick: () => setShowDisasterReport(true),
    className: "w-full flex items-center gap-3.5 min-h-[56px] border-b border-white/[0.1] text-left active:bg-white/[0.05]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "22",
    height: "22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "text-gray-300"
  }, React.createElement("path", {
    d: "M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
  })), React.createElement("span", {
    className: "flex-1 min-w-0"
  }, React.createElement("span", {
    className: "block text-base font-semibold text-gray-100"
  }, t.drBtn)), React.createElement("span", {
    className: "text-gray-500 text-lg"
  }, "›"))), !HIDE_BREAK && React.createElement(BreakTimerSection, {
    settings: settings
  })), !HIDE_COMPANY_FEATURES && React.createElement(SupervisorSection, {
    t: t,
    settings: settings
  }), showGroupBuy && React.createElement(GroupBuyModal, {
    t: t,
    settings: settings,
    onClose: () => setShowGroupBuy(false)
  }), showCard && React.createElement(NameCardModal, {
    t: t,
    settings: settings,
    onClose: () => setShowCard(false),
    onUpdateSettings: onUpdateSettings
  }), showLineQr && (() => {
    var qrPages = [{
      title: '加入 LINE Bot',
      data: 'https://lin.ee/58Dsob3',
      label: '直接開啟'
    }, {
      title: '開啟網頁版（LINE）',
      data: 'https://liff.line.me/2010673151-QNFLrsH0',
      label: '直接開啟'
    }, {
      title: '開啟網頁版（網址）',
      data: 'https://john7t.github.io/massage-pay/',
      label: '直接開啟'
    }];
    var idx = lineQrIdx % qrPages.length;
    var page = qrPages[idx];
    return React.createElement("div", {
      className: "fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-6",
      style: {
        background: 'rgba(0,0,0,0.9)'
      },
      onClick: () => setShowLineQr(false)
    }, React.createElement("div", {
      onClick: e => e.stopPropagation(),
      className: "bg-white rounded-2xl p-5 flex flex-col items-center gap-3 max-w-xs"
    }, React.createElement("p", {
      className: "text-lg font-bold text-gray-900"
    }, page.title), React.createElement("img", {
      src: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(page.data)}`,
      alt: "QR Code",
      className: "w-56 h-56"
    }), React.createElement("div", {
      className: "flex items-center gap-4"
    }, React.createElement("button", {
      onClick: () => setLineQrIdx(i => (i - 1 + qrPages.length) % qrPages.length),
      className: "w-11 h-11 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xl"
    }, "‹"), React.createElement("div", {
      className: "flex gap-1.5"
    }, qrPages.map((_, i) => React.createElement("span", {
      key: i,
      className: `w-1.5 h-1.5 rounded-full ${i === idx ? 'bg-gray-800' : 'bg-gray-300'}`
    }))), React.createElement("button", {
      onClick: () => setLineQrIdx(i => (i + 1) % qrPages.length),
      className: "w-11 h-11 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xl"
    }, "›")), React.createElement("a", {
      href: page.data,
      target: "_blank",
      rel: "noopener",
      className: "w-full h-[52px] flex items-center justify-center rounded-2xl bg-[#06C755] text-white text-[15px] font-bold text-center"
    }, page.label), React.createElement("button", {
      onClick: () => setShowLineQr(false),
      className: "h-11 px-6 text-[15px] text-gray-600"
    }, "關閉")));
  })(), showDisasterReport && React.createElement(DisasterReportModal, {
    t: t,
    settings: settings,
    onClose: () => setShowDisasterReport(false),
    onSaved: patch => {
      if (onUpdateSettings) onUpdateSettings(Object.assign({}, settings, patch));
      try {
        LS.set('app-settings', Object.assign({}, settings, patch));
      } catch (_e) {}
    }
  }), dailyQueue[0] === 'pwd' && React.createElement("div", {
    className: "pinGateBackdrop fixed inset-0 z-[70] flex flex-col items-center justify-center gap-6 p-6"
  }, React.createElement("p", {
    className: "pinGateTitle text-base font-bold text-center"
  }, t.homePwdPopupTitle), React.createElement("p", {
    className: "pinGateBody text-xs text-center max-w-xs -mt-3"
  }, t.homePwdPopupBody), React.createElement("div", {
    className: pwdShake ? 'text-red-500' : ''
  }, React.createElement(PinDots, {
    length: pwdInput.length
  })), pwdErr && React.createElement("p", {
    className: "text-xs text-red-400 text-center"
  }, pwdErr), React.createElement(PinKeypad, {
    onDigit: pressPwdDigit,
    onBackspace: () => setPwdInput(v => v.slice(0, -1))
  }), React.createElement("button", {
    onClick: () => setShowDailyForgotPwd(true),
    className: "pinGateBody text-xs underline"
  }, "忘記密碼"), showDailyForgotPwd && React.createElement("div", {
    className: "fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-4",
    onClick: () => setShowDailyForgotPwd(false)
  }, React.createElement("div", {
    className: "bg-gray-900 border border-white/[0.08] rounded-2xl p-5 w-full max-w-xs space-y-3 text-center",
    onClick: e => e.stopPropagation()
  }, React.createElement("p", {
    className: "text-2xl"
  }, "🔒"), React.createElement("p", {
    className: "text-sm font-bold text-gray-100"
  }, "鎖屏密碼不能直接重設"), React.createElement("p", {
    className: "text-xs text-gray-400 leading-relaxed"
  }, "鎖屏是為了防止非本人（例如撿到手機、已離職員工）看到公司資料，所以不能自助更改，需要透過登入密碼的忘記密碼流程，送交主管審核後才能重設。"), React.createElement("p", {
    className: "text-xs text-amber-400 leading-relaxed"
  }, "請先登出，登入畫面就有忘記密碼功能"), React.createElement("p", {
    className: "text-[11px] text-gray-500 leading-relaxed"
  }, "登出不會刪除本機資料（月報表、客戶資料都還在），但保險起見，建議登出前先到「系統設定」做一次資料備份"), React.createElement("div", {
    className: "flex gap-2 pt-1"
  }, React.createElement("button", {
    onClick: () => setShowDailyForgotPwd(false),
    className: "flex-1 py-2.5 rounded-xl bg-white/[0.06] text-gray-400 text-sm"
  }, "取消"), React.createElement("button", {
    onClick: () => {
      if (onLogout) onLogout();
    },
    className: "flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold"
  }, "前往登出"))))), dailyQueue[0] === 'groupbuy' && gbPromptData && React.createElement("div", {
    className: "fixed inset-0 z-[70] bg-black/80 flex items-end sm:items-center justify-center"
  }, React.createElement("div", {
    className: "bg-gray-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "p-4 border-b border-white/[0.06]"
  }, React.createElement("h3", {
    className: "text-base font-bold text-gray-100"
  }, t.groupBuyPopupTitle)), React.createElement("div", {
    className: "p-4 space-y-4"
  }, React.createElement("p", {
    className: "text-sm text-gray-400 text-center"
  }, gbPromptData.title), React.createElement("p", {
    className: "text-xs text-gray-500 text-center"
  }, t.groupBuyPopupBody), React.createElement("div", {
    className: "flex gap-2"
  }, React.createElement("button", {
    onClick: declineGbPrompt,
    disabled: gbBusy,
    className: "flex-1 py-3 rounded-xl bg-white/[0.06] text-gray-400 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
  }, gbBusy && React.createElement("svg", {
    className: "animate-spin",
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none"
  }, React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeOpacity: "0.3"
  }), React.createElement("path", {
    d: "M12 2a10 10 0 0110 10",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round"
  })), t.groupBuyPopupSkip), React.createElement("button", {
    onClick: joinGbPrompt,
    disabled: gbBusy,
    className: "flex-1 py-3 rounded-xl bg-amber-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
  }, gbBusy && React.createElement("svg", {
    className: "animate-spin",
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none"
  }, React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeOpacity: "0.3"
  }), React.createElement("path", {
    d: "M12 2a10 10 0 0110 10",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round"
  })), t.groupBuyPopupJoin))))), editPrev && prev && React.createElement(DayEditor, {
    day: {
      groups: prev.groups || [],
      total: prev.total,
      laodian: prev.laodian,
      status: prev.status,
      skills: prev.skills || {},
      slips: prev.slips || []
    },
    d: prev.day,
    y: prev.year,
    m: prev.month,
    t: t,
    up: getUnitPriceForDate(settings, prev.year, prev.month, prev.day),
    sk: settings.skills,
    code: settings.code,
    onSave: savePrevDay,
    onCancel: () => setEditPrev(false)
  }), editToday && React.createElement(DayEditor, {
    day: {
      groups: todayData.groups || [],
      total: todayData.total,
      laodian: todayData.laodian,
      status: todayData.status,
      skills: todayData.skills || {},
      slips: todayData.slips || []
    },
    d: td,
    y: ty,
    m: tm,
    t: t,
    up: getUnitPriceForDate(settings, ty, tm, td),
    sk: settings.skills,
    code: settings.code,
    onSave: saveTodayDay,
    onCancel: () => setEditToday(false)
  }), noticeView && window.NoticeDetailModal && (() => {
    var NDM = window.NoticeDetailModal;
    return React.createElement(NDM, {
      notice: noticeView,
      settings: settings,
      t: t,
      onClose: () => setNoticeView(null),
      onMore: () => {
        setNoticeView(null);
        if (onGotoNotices) onGotoNotices();
      },
      onLogout: onLogout
    });
  })());
}
function SummaryTable({
  prev,
  next,
  month,
  t
}) {
  var Row = ({
    label,
    data,
    bold
  }) => React.createElement("div", {
    className: `flex items-center py-2.5 ${bold ? '' : 'border-b border-white/[0.04]'}`
  }, React.createElement("div", {
    className: `w-16 text-sm font-semibold ${bold ? 'text-amber-300' : 'text-gray-400'}`
  }, label), React.createElement("div", {
    className: `flex-1 text-right text-lg font-bold tabular-nums ${bold ? 'text-emerald-400' : 'text-emerald-400/80'}`
  }, "$", data.salary.toLocaleString()), React.createElement("div", {
    className: "w-14 text-right text-sm text-gray-400 tabular-nums"
  }, data.units), React.createElement("div", {
    className: "w-10 text-right text-sm text-orange-400 tabular-nums"
  }, data.laodian));
  return React.createElement("div", {
    className: "bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-1"
  }, React.createElement("div", {
    className: "flex items-center pt-1.5 pb-1 text-[10px] text-gray-600"
  }, React.createElement("div", {
    className: "w-16"
  }), React.createElement("div", {
    className: "flex-1 text-right"
  }, t.salary), React.createElement("div", {
    className: "w-14 text-right"
  }, t.units), React.createElement("div", {
    className: "w-10 text-right"
  }, t.laodian)), React.createElement(Row, {
    label: t.prevPeriod,
    data: prev
  }), React.createElement(Row, {
    label: t.nextPeriod,
    data: next
  }), React.createElement("div", {
    className: "border-t border-amber-500/30 mt-0.5 pt-0.5"
  }, React.createElement(Row, {
    label: t.monthTotal,
    data: month,
    bold: true
  })));
}
function DayRow({
  day,
  d,
  y,
  m,
  t,
  up,
  sk,
  onEdit,
  isToday
}) {
  var dw = dow(y, m, d),
    we = dw === 0 || dw === 6,
    nw = !canWork[day.status];
  var sal = calcSal(day, up, sk);
  var emptyDay = !(day.total > 0) && !(sal > 0) && !(day.laodian > 0) && !nw;
  return React.createElement("div", {
    "data-today-row": isToday ? '1' : undefined,
    onClick: () => onEdit(d),
    className: `flex items-center px-4 border-b active:bg-white/[0.06] cursor-pointer ${emptyDay ? 'min-h-[40px] opacity-50' : 'min-h-[46px]'} ${isToday ? 'border-emerald-500 border-l-4 bg-emerald-500/20' : we && !emptyDay ? 'border-white/[0.04] bg-amber-500/[0.05]' : 'border-white/[0.04]'} `
  }, React.createElement("div", {
    className: "w-14 flex-shrink-0"
  }, React.createElement("span", {
    className: "text-[15px] font-bold text-gray-200"
  }, d), React.createElement("span", {
    className: `text-xs ml-1 ${we ? 'text-amber-500' : 'text-gray-500'}`
  }, t.dn[dw])), React.createElement("div", {
    className: "flex-1 flex items-center gap-2 min-w-0"
  }, nw && React.createElement("span", {
    className: `text-xs px-2 py-0.5 rounded-full ${SBG[day.status]} ${STC[day.status]}`
  }, t[SK[day.status]]), React.createElement(React.Fragment, null, emptyDay ? React.createElement("span", {
    className: "text-sm text-gray-600 w-10 text-right"
  }, "—") : React.createElement(React.Fragment, null, React.createElement("span", {
    className: "text-[15px] text-gray-100 w-10 text-right tabular-nums font-bold"
  }, day.total || ''), React.createElement("span", {
    className: "text-[15px] text-emerald-400/90 w-20 text-right tabular-nums font-semibold"
  }, sal > 0 ? '$' + sal.toLocaleString() : ''), React.createElement("span", {
    className: "text-sm text-orange-400 w-8 text-center tabular-nums font-bold"
  }, day.laodian || '')), (day.status === 2 || day.status === 5) && React.createElement("span", {
    className: `text-xs px-2 py-0.5 rounded-full ${SBG[day.status]} ${STC[day.status]}`
  }, t[SK[day.status]]), day.skills && SKILL_KEYS.map((k, i) => sk !== null && sk !== void 0 && sk[k] && day.skills[k] > 0 ? React.createElement("span", {
    key: k,
    className: `text-xs ${SKILL_COLORS[i]}`
  }, t[SKILL_SHORT[i]], day.skills[k]) : null), (day.groups || []).length > 1 && React.createElement("span", {
    className: "text-xs text-gray-500 truncate"
  }, (day.groups || []).join('+')))), React.createElement("svg", {
    className: "w-3.5 h-3.5 text-gray-700 flex-shrink-0 ml-1",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9 5l7 7-7 7"
  })));
}
function SlipTags({
  slip,
  t,
  code,
  onAdd,
  onDel
}) {
  var [input, setInput] = useState('');
  var hist = loadTagHistory(code).filter(h => !(slip.tags || []).includes(h)).slice(0, 12);
  var submit = val => {
    var parts = (val || input).split(/[\s,，]+/).filter(Boolean);
    parts.forEach(p => onAdd(slip.id, p));
    setInput('');
  };
  return React.createElement("div", {
    className: "space-y-2.5"
  }, React.createElement("p", {
    className: "text-[13px] font-semibold text-gray-400 tracking-wider"
  }, t.slipTags), React.createElement("div", {
    className: "flex gap-2"
  }, React.createElement("input", {
    value: input,
    onChange: e => setInput(e.target.value),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      }
    },
    placeholder: t.slipTagsPlaceholder,
    className: "flex-1 min-w-0 h-11 bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 text-[15px] text-gray-100 focus:outline-none focus:border-amber-400"
  }), React.createElement("button", {
    onClick: () => submit(),
    className: "w-11 h-11 flex-shrink-0 rounded-xl border border-white/[0.12] text-gray-200 text-xl active:bg-white/[0.08]"
  }, "+")), slip.tags && slip.tags.length > 0 && React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, slip.tags.map(tag => React.createElement("span", {
    key: tag,
    className: "inline-flex items-center gap-1.5 min-h-[36px] bg-amber-400 text-gray-950 font-bold rounded-full pl-3.5 pr-1.5 text-sm"
  }, "#", tag, React.createElement("button", {
    onClick: () => onDel(slip.id, tag),
    "aria-label": "remove",
    className: "w-7 h-7 flex items-center justify-center rounded-full active:bg-black/10"
  }, "✕")))), hist.length > 0 && React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, React.createElement("span", {
    className: "text-[13px] text-gray-400 w-full"
  }, t.slipTagHistory), hist.map(h => React.createElement("button", {
    key: h,
    onClick: () => onAdd(slip.id, h),
    className: "min-h-[36px] border border-white/[0.12] text-gray-200 rounded-full px-3 text-sm active:bg-white/[0.08]"
  }, "#", h))));
}
function SlipEditFields({
  s,
  t,
  editorCode,
  custQuery,
  setCustQuery,
  onUpdate,
  onDelete,
  noDelete
}) {
  var fmtTime = ms => {
    var dt = new Date(ms);
    return String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
  };
  var startMs = s.startAt || s.createdAt;
  var setStart = hhmm => {
    if (!hhmm) {
      onUpdate({
        startAt: 0
      });
      return;
    }
    var base = new Date(s.createdAt);
    var [h, mi] = hhmm.split(':').map(Number);
    base.setHours(h, mi, 0, 0);
    onUpdate({
      startAt: base.getTime()
    });
  };
  var toggleArr = (field, val) => {
    var arr = s[field] || [];
    onUpdate({
      [field]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]
    });
  };
  var applyCust = c => {
    onUpdate({
      custName: c.custName || '',
      custTitle: c.custTitle || '',
      custPhone: c.custPhone || '',
      pressBody: c.pressBody || '',
      pressFoot: c.pressFoot || '',
      parts: c.parts || []
    });
    setCustQuery(q => ({
      ...q,
      [s.id]: ''
    }));
  };
  var fld = "w-full h-11 bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 text-base text-gray-100 focus:outline-none focus:border-amber-400 min-w-0";
  var lbl = "text-[13px] text-gray-400 mb-1 block";
  var hd = "text-[13px] font-semibold text-gray-400 tracking-wider mb-2.5";
  var sec = "border-t border-white/[0.08] pt-4";
  var chip = on => `min-h-[40px] px-3.5 rounded-full text-sm border ${on ? 'bg-amber-400 border-amber-400 text-gray-950 font-bold' : 'border-white/[0.12] text-gray-200 active:bg-white/[0.08]'}`;
  var units = s.units || 1;
  var unitMax = Math.max(20, units);
  var press = (field, label) => React.createElement("div", null, React.createElement("p", {
    className: hd
  }, label), React.createElement("div", {
    className: "grid grid-cols-3 border border-white/[0.12] rounded-xl overflow-hidden"
  }, PRESS_LEVELS.map((pl, i) => React.createElement("button", {
    key: pl,
    onClick: () => onUpdate({
      [field]: s[field] === pl ? '' : pl
    }),
    className: `h-[42px] text-sm ${i > 0 ? 'border-l border-white/[0.12]' : ''} ${s[field] === pl ? 'bg-amber-400 text-gray-950 font-bold' : 'text-gray-200 active:bg-white/[0.08]'}`
  }, t['press' + pl.charAt(0).toUpperCase() + pl.slice(1)]))));
  return React.createElement("div", {
    className: "px-4 pb-4 pt-3 space-y-4 fi"
  }, React.createElement("div", null, React.createElement("p", {
    className: hd
  }, t.slipUnits, "／", t.laodian), React.createElement("div", {
    className: "grid grid-cols-2 gap-2.5"
  }, React.createElement("div", null, React.createElement("label", {
    className: lbl
  }, t.slipUnits), React.createElement("select", {
    value: units,
    onChange: e => {
      var nu = parseInt(e.target.value) || 1;
      var patch = {
        units: nu
      };
      if ((s.laodian || 0) > nu) patch.laodian = nu;
      onUpdate(patch);
    },
    className: fld
  }, Array.from({
    length: unitMax
  }, (_, i) => i + 1).map(n => React.createElement("option", {
    key: n,
    value: n
  }, n, t.units)))), React.createElement("div", null, React.createElement("label", {
    className: lbl
  }, t.laodian, "（0–", units, "）"), React.createElement("select", {
    value: s.laodian || 0,
    onChange: e => onUpdate({
      laodian: parseInt(e.target.value) || 0
    }),
    className: fld + ((s.laodian || 0) > 0 ? ' text-orange-300' : '')
  }, Array.from({
    length: units + 1
  }, (_, i) => i).map(n => React.createElement("option", {
    key: n,
    value: n
  }, n))))), React.createElement("div", {
    className: "grid grid-cols-3 gap-2.5 mt-2.5"
  }, React.createElement("div", null, React.createElement("label", {
    className: lbl
  }, t.svcLabel), React.createElement("select", {
    value: s.svc || '',
    onChange: e => onUpdate({
      svc: e.target.value
    }),
    className: fld
  }, React.createElement("option", {
    value: ""
  }, "--"), SERVICES.map(o => React.createElement("option", {
    key: o.code,
    value: o.code
  }, o.code)))), React.createElement("div", null, React.createElement("label", {
    className: lbl
  }, t.addHour), React.createElement("select", {
    value: s.extra || 0,
    onChange: e => {
      var ne = parseInt(e.target.value) || 0;
      var d = ne - (s.extra || 0);
      var nu = Math.max(1, (s.units || 1) + d);
      var patch = {
        extra: ne,
        units: nu
      };
      if ((s.laodian || 0) > nu) patch.laodian = nu;
      onUpdate(patch);
    },
    className: fld
  }, [0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => React.createElement("option", {
    key: n,
    value: n
  }, "+", n)))), React.createElement("div", null, React.createElement("label", {
    className: lbl
  }, t.slipStartTime), React.createElement("input", {
    type: "time",
    value: fmtTime(startMs),
    onChange: e => setStart(e.target.value),
    className: fld + ' px-2'
  })))), React.createElement("div", {
    className: sec + ' space-y-2.5'
  }, React.createElement("p", {
    className: hd
  }, t.custName), React.createElement("div", {
    className: "relative"
  }, React.createElement("input", {
    value: custQuery[s.id] || '',
    onChange: e => setCustQuery(q => ({
      ...q,
      [s.id]: e.target.value
    })),
    placeholder: t.custSearchHint,
    className: fld
  }), (custQuery[s.id] || '').trim() && (() => {
    var res = searchCustDB(editorCode, custQuery[s.id]);
    return res.length > 0 ? React.createElement("div", {
      className: "mt-1 bg-gray-800 border border-white/[0.1] rounded-xl overflow-hidden"
    }, res.map((c, i) => React.createElement("div", {
      key: i,
      onClick: () => applyCust(c),
      className: "px-3 min-h-[44px] flex items-center text-sm text-gray-200 active:bg-white/[0.06] border-b border-white/[0.06] last:border-0"
    }, c.custName, c.custTitle ? ' ' + bookTitleName(c.custTitle, t === T.zh ? 'zh' : 'vi') : '', "\u3000", c.custPhone || ''))) : React.createElement("p", {
      className: "mt-1.5 text-[13px] text-amber-400"
    }, t.custNewHint);
  })()), React.createElement("div", {
    className: "grid gap-2.5",
    style: {
      gridTemplateColumns: '1.2fr 1fr'
    }
  }, React.createElement("input", {
    value: s.custName || '',
    onChange: e => onUpdate({
      custName: e.target.value
    }),
    placeholder: t.custName,
    className: fld
  }), React.createElement("select", {
    value: s.custTitle || '',
    onChange: e => onUpdate({
      custTitle: e.target.value
    }),
    className: fld
  }, React.createElement("option", {
    value: ""
  }, t.custTitle), BOOK_TITLES.filter(o => o.v === 'sir' || o.v === 'ms').map(o => React.createElement("option", {
    key: o.v,
    value: o.v
  }, o[t === T.zh ? 'zh' : 'vi'])))), React.createElement("input", {
    value: s.custPhone || '',
    onChange: e => onUpdate({
      custPhone: e.target.value
    }),
    inputMode: "numeric",
    placeholder: t.custPhone,
    className: fld
  }), React.createElement("label", {
    className: "flex items-center justify-between min-h-[48px] cursor-pointer"
  }, React.createElement("span", {
    className: `text-base ${s.blacklist ? 'text-red-400 font-semibold' : 'text-gray-200'}`
  }, t.blacklistCheck || '拒接'), React.createElement("span", {
    className: "relative inline-block w-12 h-7"
  }, React.createElement("input", {
    type: "checkbox",
    checked: !!s.blacklist,
    onChange: e => {
      var on = e.target.checked;
      onUpdate({
        blacklist: on,
        blacklistReason: on ? s.blacklistReason || '騷擾' : s.blacklistReason
      });
    },
    className: "peer sr-only"
  }), React.createElement("span", {
    className: "absolute inset-0 rounded-full bg-gray-600 peer-checked:bg-red-500 transition-colors"
  }), React.createElement("span", {
    className: "absolute top-[3px] left-[3px] w-[22px] h-[22px] rounded-full bg-white transition-transform peer-checked:translate-x-5"
  }))), s.blacklist && React.createElement("select", {
    value: s.blacklistReason === '騷擾' || !s.blacklistReason ? '騷擾' : '其他',
    onChange: e => onUpdate({
      blacklistReason: e.target.value === '騷擾' ? '騷擾' : ''
    }),
    className: fld
  }, React.createElement("option", {
    value: "騷擾"
  }, t.blacklistReasonHarass || '騷擾'), React.createElement("option", {
    value: "其他"
  }, t.blacklistReasonOther || '其他')), s.blacklist && s.blacklistReason !== '騷擾' && React.createElement("input", {
    value: s.blacklistReason || '',
    onChange: e => onUpdate({
      blacklistReason: e.target.value
    }),
    placeholder: t.blacklistReasonPh || '請輸入原因',
    className: fld + ' border-red-500/40 focus:border-red-500'
  })), React.createElement("div", {
    className: sec
  }, React.createElement(SlipTags, {
    slip: s,
    t: t,
    code: editorCode,
    onAdd: (id, tag) => {
      tag = (tag || '').trim();
      if (!tag) return;
      if (s.tags && s.tags.includes(tag)) return;
      onUpdate({
        tags: [...(s.tags || []), tag]
      });
      if (editorCode) addTagHistory(editorCode, tag);
    },
    onDel: (id, tag) => onUpdate({
      tags: (s.tags || []).filter(x => x !== tag)
    })
  })), React.createElement("div", {
    className: sec + ' space-y-4'
  }, press('pressBody', t.pressBody), press('pressFoot', t.pressFoot), React.createElement("div", null, React.createElement("p", {
    className: hd
  }, t.strengthParts), React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, BODY_PARTS.map(bp => React.createElement("button", {
    key: bp,
    onClick: () => toggleArr('parts', bp),
    className: chip((s.parts || []).includes(bp))
  }, t['part' + bp.charAt(0).toUpperCase() + bp.slice(1)])))), React.createElement("div", null, React.createElement("p", {
    className: hd
  }, t.clientReq), React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, CLIENT_REQS.map(cr => React.createElement("button", {
    key: cr,
    onClick: () => toggleArr('reqs', cr),
    className: chip((s.reqs || []).includes(cr))
  }, t['req' + cr.charAt(0).toUpperCase() + cr.slice(1)])))), React.createElement("div", {
    className: "grid grid-cols-2 gap-2.5"
  }, React.createElement("div", null, React.createElement("label", {
    className: lbl
  }, t.laodianOut), React.createElement("input", {
    value: s.laodianOut || '',
    onChange: e => onUpdate({
      laodianOut: e.target.value
    }),
    placeholder: t.teacherNoPlaceholder,
    className: fld
  })), React.createElement("div", null, React.createElement("label", {
    className: lbl
  }, t.shiftOut), React.createElement("input", {
    value: s.shiftOut || '',
    onChange: e => onUpdate({
      shiftOut: e.target.value
    }),
    placeholder: t.teacherNoPlaceholder,
    className: fld
  })))), !noDelete && React.createElement("button", {
    onClick: onDelete,
    className: "w-full min-h-[44px] rounded-xl text-red-400 text-sm font-semibold active:bg-red-500/10"
  }, t.slipDelete));
}
function DayEditor({
  day,
  d,
  y,
  m,
  t,
  up,
  sk,
  onSave,
  onCancel,
  code: editorCode
}) {
  var [groups, setGroups] = useState(day.groups && (day.groups || []).length > 0 ? [...day.groups] : []);
  var [lo, setLo] = useState(day.laodian);
  var [st, setSt] = useState(day.status);
  var [skCounts, setSkCounts] = useState(() => {
    var s = day.skills || {};
    return {
      guasha: s.guasha || 0,
      baguang: s.baguang || 0,
      xiujiao: s.xiujiao || 0
    };
  });
  var [slips, setSlips] = useState(() => day.slips ? JSON.parse(JSON.stringify(day.slips)).filter(Boolean) : []);
  var [editSlipId, setEditSlipId] = useState(null);
  var dw = dow(y, m, d);
  var slipTotal = slipUnitsTotal(slips);
  var oldGroupTotal = groups.reduce((a, b) => a + (parseInt(b) || 0), 0);
  var ct = slipTotal;
  var laodianTotal = slipLaodianTotal(slips);
  var sw = true;
  var previewSal = ct * up + SKILL_KEYS.reduce((a, k, i) => a + (sk !== null && sk !== void 0 && sk[k] ? (skCounts[k] || 0) * SKILL_PRICES[i] : 0), 0);
  var save = () => {
    var nr = false;
    if (!nr) {
      (slips || []).forEach(s => {
        if (!s) return;
        if ((s.laodian || 0) >= 1 && (s.custName || '').trim() && (s.custTitle || '').trim()) {
          if (!s.tags) s.tags = [];
          if (!s.tags.includes('老點')) s.tags.push('老點');
        }
      });
      if (editorCode) {
        (slips || []).forEach(s => {
          if (!s) return;
          if ((s.custName || '').trim() || (s.custPhone || '').trim()) {
            try {
              upsertCust(editorCode, s);
            } catch (e) {}
          }
        });
      }
    }
    onSave(d, {
      groups: [],
      total: nr ? 0 : ct,
      laodian: nr ? 0 : laodianTotal,
      status: st,
      skills: nr ? {
        guasha: 0,
        baguang: 0,
        xiujiao: 0
      } : skCounts,
      slips: nr ? [] : (slips || []).filter(Boolean),
      did: getDeviceId(),
      ts: Date.now()
    });
  };
  var clearAll = () => {
    setLo(0);
    setSt(0);
    setGroups([]);
    setSlips([]);
    setSkCounts({
      guasha: 0,
      baguang: 0,
      xiujiao: 0
    });
  };
  var skAdj = (k, delta) => setSkCounts(p => ({
    ...p,
    [k]: Math.max(0, (p[k] || 0) + delta)
  }));
  var [eOtherMode, setEOtherMode] = useState(false);
  var [eOtherVal, setEOtherVal] = useState('');
  var addSlipN = n => {
    if (n > 0) {
      setSlips(prev => [...prev, newSlip(n)]);
    }
    setEOtherMode(false);
    setEOtherVal('');
  };
  var fmtTime = ms => {
    var dt = new Date(ms);
    return String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
  };
  var updSlip = (id, patch) => setSlips(slips.map(s => s.id === id ? {
    ...s,
    ...patch
  } : s));
  var [custQuery, setCustQuery] = useState({});
  var delSlip = id => setSlips(slips.filter(s => s.id !== id));
  return React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center",
    onClick: onCancel
  }, React.createElement("div", {
    className: "su bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "p-4 border-b border-white/[0.06] flex items-center justify-between"
  }, React.createElement("h3", {
    className: "text-lg font-bold text-gray-100"
  }, m, "/", d, " ", React.createElement("span", {
    className: "text-gray-500 font-normal"
  }, "(", t.dn[dw], ")")), React.createElement("div", {
    className: "text-right"
  }, React.createElement("div", {
    className: "text-xs text-gray-500 mb-0.5"
  }, ct, t.units, laodianTotal > 0 ? ` · ${laodianTotal}${t.laodian}` : ''), React.createElement("div", {
    className: "text-emerald-400 text-xl font-bold tabular-nums"
  }, "$", previewSal.toLocaleString()))), React.createElement("div", {
    className: "p-4 space-y-5"
  }, sw && React.createElement(React.Fragment, null, React.createElement("div", null, React.createElement("p", {
    className: "text-xs text-gray-500 mb-2"
  }, t.addUnitTitle), React.createElement("div", {
    className: "grid grid-cols-5 gap-2"
  }, [1, 2, 3].map(n => React.createElement("button", {
    key: n,
    onClick: () => addSlipN(n),
    className: "py-4 rounded-xl bg-amber-600/15 border border-amber-600/20 text-amber-300 text-lg font-bold active:bg-amber-600/30 transition-all"
  }, "+", n)), !eOtherMode ? React.createElement("button", {
    onClick: () => setEOtherMode(true),
    className: "col-span-2 py-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-gray-500 text-sm font-medium active:bg-white/[0.08]"
  }, t.other) : React.createElement(React.Fragment, null, React.createElement("input", {
    type: "number",
    inputMode: "numeric",
    value: eOtherVal,
    onChange: e => setEOtherVal(e.target.value),
    autoFocus: true,
    className: "bg-white/[0.06] border border-amber-500/50 rounded-xl px-1 py-2 text-center text-lg text-gray-100 font-bold focus:outline-none",
    placeholder: "?"
  }), React.createElement("button", {
    onClick: () => {
      var v = parseInt(eOtherVal);
      if (v > 0) addSlipN(v);
    },
    className: "rounded-xl bg-amber-600 text-white font-bold"
  }, "OK")))), oldGroupTotal > 0 && React.createElement("div", {
    className: "bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-2"
  }, React.createElement("span", {
    className: "text-[11px] text-gray-500"
  }, t.oldGroupData, "：", groups.join('+'), " = ", oldGroupTotal, t.units)), false && laodianTotal > 0 && React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-500 mb-2 block"
  }, t.laodian), React.createElement("div", {
    className: "w-full bg-orange-500/5 border border-orange-500/15 rounded-xl px-4 py-3 text-xl text-center text-orange-300 font-semibold"
  }, laodianTotal)), SKILL_KEYS.some(k => sk === null || sk === void 0 ? void 0 : sk[k]) && React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-500 mb-2 block"
  }, t.skills), React.createElement("div", {
    className: "space-y-2"
  }, SKILL_KEYS.map((k, i) => sk !== null && sk !== void 0 && sk[k] ? React.createElement("div", {
    key: k,
    className: "flex items-center gap-2"
  }, React.createElement("span", {
    className: `text-sm flex-1 ${SKILL_COLORS[i]}`
  }, t[k], " ", React.createElement("span", {
    className: "text-xs text-gray-600"
  }, "$", SKILL_PRICES[i])), React.createElement("button", {
    onClick: () => skAdj(k, -1),
    className: "w-10 h-10 rounded-xl bg-white/[0.06] text-gray-400 text-lg font-bold active:bg-white/[0.1]"
  }, "−"), React.createElement("span", {
    className: `w-8 text-center text-lg font-bold ${SKILL_COLORS[i]}`
  }, skCounts[k] || 0), React.createElement("button", {
    onClick: () => skAdj(k, 1),
    className: "w-10 h-10 rounded-xl bg-white/[0.06] text-gray-400 text-lg font-bold active:bg-white/[0.1]"
  }, "+")) : null)))), slips.length > 0 && React.createElement("div", {
    className: "pt-3 mt-3 border-t border-white/[0.06]"
  }, React.createElement("label", {
    className: "text-xs text-gray-500 mb-2 block"
  }, t.slipList, "（", slips.length, "）"), React.createElement("div", {
    className: "space-y-1.5"
  }, slips.map(s => {
    var open = editSlipId === s.id;
    var startMs = s.startAt || s.createdAt;
    return React.createElement("div", {
      key: s.id,
      className: "bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden"
    }, React.createElement("div", {
      className: "flex items-center gap-2 px-3 py-2 active:bg-white/[0.04]",
      onClick: () => setEditSlipId(open ? null : s.id)
    }, React.createElement("span", {
      className: "text-sm font-bold text-amber-300 tabular-nums whitespace-nowrap"
    }, s.units, t.units, " ", slipSvcLabel(s, t === T.zh ? "zh" : "vi")), (s.laodian || 0) > 0 && React.createElement("span", {
      className: "text-xs font-semibold text-orange-400 whitespace-nowrap"
    }, t.laodian, ":", s.laodian), React.createElement("span", {
      className: "text-xs text-gray-300 truncate"
    }, s.custName || '', s.custTitle ? bookTitleName(s.custTitle, t === T.zh ? 'zh' : 'vi') : '', s.custPhone ? ' ' + s.custPhone : ''), React.createElement("span", {
      className: "text-xs text-gray-500 tabular-nums ml-auto whitespace-nowrap"
    }, fmtTime(startMs)), React.createElement("svg", {
      className: `w-3.5 h-3.5 text-gray-600 transition-transform ${open ? 'rotate-90' : ''}`,
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24"
    }, React.createElement("path", {
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: 2,
      d: "M9 5l7 7-7 7"
    }))), open && React.createElement(SlipEditFields, {
      s: s,
      t: t,
      editorCode: editorCode,
      custQuery: custQuery,
      setCustQuery: setCustQuery,
      onUpdate: patch => updSlip(s.id, patch),
      onDelete: () => {
        delSlip(s.id);
        setEditSlipId(null);
      }
    }));
  }))), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-500 mb-2 block font-medium"
  }, t.status), React.createElement("div", {
    className: "grid grid-cols-3 gap-2"
  }, [0, 3, 4, 1, 2, 5].map(s => React.createElement("button", {
    key: s,
    onClick: () => setSt(s),
    className: `py-2.5 rounded-xl text-sm font-semibold transition-all ${st === s ? s === 0 ? 'bg-gray-600 text-white ring-2 ring-gray-500' : `${SBG[s].replace('/20', '/30')} ${STC[s]} ring-2 ring-current` : 'bg-white/[0.04] text-gray-600'}`
  }, t[SK[s]]))))), React.createElement("div", {
    className: "p-4 border-t border-white/[0.06] space-y-2"
  }, React.createElement("div", {
    className: "flex gap-3"
  }, React.createElement("button", {
    onClick: onCancel,
    className: "flex-1 py-3.5 rounded-xl bg-white/[0.05] text-gray-400 font-semibold"
  }, t.cancel), React.createElement("button", {
    onClick: save,
    className: "flex-1 py-3.5 rounded-xl bg-amber-600 text-white font-bold"
  }, t.done)), React.createElement("button", {
    onClick: clearAll,
    className: "w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium active:bg-red-500/20"
  }, "🗑 ", t.clearAll))));
}
function MonthlyCalendarPage({
  settings,
  t,
  onGotoYear,
  onClose
}) {
  var [calY, setCalY] = useState(() => bizParts().y);
  var [calM, setCalM] = useState(() => bizParts().m);
  var [showPick, setShowPick] = useState(false);
  var [pickY, setPickY] = useState(() => bizParts().y);
  var [data, setData] = useState(null);
  var [editDay, setEditDay] = useState(null);
  var [selectedDay, setSelectedDay] = useState(null);
  useEffect(() => {
    setData(LS.get(dk(settings.code, calY, calM)) || eMon());
  }, [settings.code, calY, calM]);
  useEffect(() => {
    setSelectedDay(null);
  }, [calY, calM]);
  var saveDay = (d, dd) => {
    var nd = {
      ...data,
      days: {
        ...data.days,
        [d]: dd
      }
    };
    setData(nd);
    setEditDay(null);
    LS.set(dk(settings.code, calY, calM), nd);
  };
  var dm = dim(calY, calM);
  var firstDow = dow(calY, calM, 1);
  var calc = useMemo(() => {
    if (!data) return {
      prev: {
        units: 0,
        salary: 0,
        laodian: 0
      },
      next: {
        units: 0,
        salary: 0,
        laodian: 0
      },
      month: {
        units: 0,
        salary: 0,
        laodian: 0
      }
    };
    var pu = 0,
      ps = 0,
      pl = 0,
      nu = 0,
      ns = 0,
      nl = 0;
    for (var d = 1; d <= dm; d++) {
      var day = data.days[d] || eDay();
      var u = day.total || 0,
        lo = day.laodian || 0,
        s = calcSal(day, getUnitPriceForDate(settings, calY, calM, d), settings.skills);
      if (d <= 15) {
        pu += u;
        ps += s;
        pl += lo;
      } else {
        nu += u;
        ns += s;
        nl += lo;
      }
    }
    return {
      prev: {
        units: pu,
        salary: ps,
        laodian: pl
      },
      next: {
        units: nu,
        salary: ns,
        laodian: nl
      },
      month: {
        units: pu + nu,
        salary: ps + ns,
        laodian: pl + nl
      }
    };
  }, [data, dm, calY, calM, settings.unitPrice, settings.unitPriceHistory, settings.skills]);
  var cells = [];
  for (var i = 0; i < firstDow; i++) cells.push(null);
  for (var d = 1; d <= dm; d++) cells.push(d);
  var selectedDayData = selectedDay ? (data === null || data === void 0 ? void 0 : data.days[selectedDay]) || eDay() : null;
  var selectedSal = selectedDayData ? calcSal(selectedDayData, getUnitPriceForDate(settings, calY, calM, selectedDay), settings.skills) : 0;
  var goPrevMonth = () => {
    if (calM <= 1) {
      setCalY(calY - 1);
      setCalM(12);
    } else {
      setCalM(calM - 1);
    }
  };
  var goNextMonth = () => {
    if (calM >= 12) {
      setCalY(calY + 1);
      setCalM(1);
    } else {
      setCalM(calM + 1);
    }
  };
  var goToday = () => {
    setCalY(bizParts().y);
    setCalM(bizParts().m);
  };
  var monthUnits = calc.month.units,
    monthLao = calc.month.laodian;
  var nav = "w-11 h-11 rounded-full flex items-center justify-center text-gray-300 active:bg-white/[0.08]";
  return React.createElement("div", {
    className: "max-w-lg mx-auto fi flex flex-col",
    style: {
      minHeight: '100%'
    }
  }, React.createElement("div", {
    className: "flex items-start justify-between pl-2 pr-4 pt-1 pb-3"
  }, React.createElement("div", {
    className: "flex-shrink-0"
  }, React.createElement("div", {
    className: "flex items-center"
  }, React.createElement("button", {
    onClick: goPrevMonth,
    "aria-label": "prev",
    className: nav
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "20",
    height: "20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M15 19l-7-7 7-7"
  }))), React.createElement("button", {
    onClick: () => {
      setPickY(calY);
      setShowPick(true);
    },
    className: "text-xl font-bold text-gray-100 whitespace-nowrap px-1 min-h-[44px] active:opacity-60"
  }, t === T.zh ? `${calY}年${t.months[calM - 1]}` : `${t.months[calM - 1]} ${calY}`, " ", React.createElement("span", {
    className: "text-sm text-gray-400"
  }, "▾")), React.createElement("button", {
    onClick: goNextMonth,
    "aria-label": "next",
    className: nav
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "20",
    height: "20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M9 5l7 7-7 7"
  })))), React.createElement("div", {
    className: "flex gap-1.5 pl-2 mt-2"
  }, React.createElement("button", {
    onClick: () => {
      goToday();
      setSelectedDay(bizParts().d);
    },
    className: "h-9 px-3.5 whitespace-nowrap rounded-full border border-white/[0.15] text-sm text-gray-100 active:bg-white/[0.08]"
  }, t.todayBtn || '今日'), React.createElement("button", {
    onClick: () => onGotoYear && onGotoYear(calY),
    className: "h-9 px-3.5 whitespace-nowrap rounded-full border border-white/[0.15] text-sm text-gray-100 active:bg-white/[0.08]"
  }, t.yearStatBtn || (t === T.zh ? '年度統計' : 'Thống kê năm')))), React.createElement("div", {
    className: "text-right pt-1.5 min-w-0 ml-2"
  }, React.createElement("p", {
    className: "text-[30px] leading-[1.1] font-extrabold text-gray-100 tabular-nums"
  }, "$", calc.month.salary.toLocaleString()), React.createElement("p", {
    className: "mt-1 text-[14px] text-gray-400 tabular-nums"
  }, monthUnits, t.units, monthLao > 0 ? ` · ${t.laodian} ${monthLao}` : ''), React.createElement("p", {
    className: "mt-1.5 text-[13px] text-gray-400 leading-[1.5]"
  }, React.createElement("span", {
    className: "block"
  }, t.prevPeriod, " ", React.createElement("b", {
    className: "text-gray-100 font-semibold tabular-nums"
  }, "$", calc.prev.salary.toLocaleString())), React.createElement("span", {
    className: "block"
  }, t.nextPeriod, " ", React.createElement("b", {
    className: "text-gray-100 font-semibold tabular-nums"
  }, "$", calc.next.salary.toLocaleString()))))), showPick && React.createElement("div", {
    className: "fixed inset-0 z-[60] bg-black/70 flex items-end justify-center",
    onClick: () => setShowPick(false)
  }, React.createElement("div", {
    className: "bg-gray-900 w-full max-w-lg rounded-t-2xl px-4 pt-3 pb-6",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "flex items-center justify-between mb-2"
  }, React.createElement("button", {
    onClick: () => setPickY(pickY - 1),
    "aria-label": "prev year",
    className: nav
  }, "‹"), React.createElement("span", {
    className: "text-lg font-bold text-gray-100 tabular-nums"
  }, pickY, t === T.zh ? ' 年' : ''), React.createElement("button", {
    onClick: () => setPickY(pickY + 1),
    "aria-label": "next year",
    className: nav
  }, "›")), React.createElement("div", {
    className: "grid grid-cols-4 gap-2"
  }, Array.from({
    length: 12
  }, (_, i) => i + 1).map(m => {
    var sel = pickY === calY && m === calM;
    var isNow = pickY === bizParts().y && m === bizParts().m;
    return React.createElement("button", {
      key: m,
      onClick: () => {
        setCalY(pickY);
        setCalM(m);
        setShowPick(false);
      },
      className: `h-12 rounded-xl text-[16px] font-semibold ${sel ? 'bg-amber-400 text-gray-950' : isNow ? 'border border-amber-400 text-amber-300' : 'border border-white/[0.12] text-gray-100'} active:opacity-80`
    }, t.months[m - 1]);
  })))), React.createElement("div", {
    className: "grid grid-cols-7 px-3 pb-1.5"
  }, t.dn.map((dn, i) => React.createElement("div", {
    key: i,
    className: `text-center text-[13px] font-semibold ${i === 0 || i === 6 ? 'text-amber-400' : 'text-gray-400'}`
  }, dn))), React.createElement("div", {
    className: "grid grid-cols-7 gap-1 px-3 pb-4"
  }, cells.map((d, i) => {
    if (d === null) return React.createElement("div", {
      key: 'e' + i
    });
    var day = (data === null || data === void 0 ? void 0 : data.days[d]) || eDay();
    var nw = !canWork[day.status];
    var isToday = calM === bizParts().m && calY === bizParts().y && d === bizParts().d;
    var u = day.total || 0,
      lo = day.laodian || 0;
    var empty = u === 0 && !nw && (day.status || 0) === 0;
    return React.createElement("button", {
      key: d,
      onClick: () => setSelectedDay(d),
      className: `h-[62px] rounded-[10px] px-1.5 pt-1.5 pb-1 flex flex-col justify-between text-left active:bg-white/[0.1] ${selectedDay === d ? 'bg-amber-400/20 ring-2 ring-amber-400' : isToday ? 'ring-2 ring-amber-400 bg-white/[0.05]' : empty ? 'border border-dashed border-white/[0.12]' : 'bg-white/[0.05]'}`
    }, React.createElement("div", {
      className: "flex items-center gap-1 min-w-0"
    }, React.createElement("span", {
      className: `text-[13px] ${isToday ? 'text-amber-400 font-bold' : 'text-gray-300'}`
    }, d), day.status !== 0 && React.createElement("span", {
      className: `text-[11px] px-1 rounded-full leading-tight truncate ${SBG[day.status]} ${STC[day.status]}`
    }, t[SK[day.status]])), React.createElement("div", {
      className: "text-right text-[18px] leading-none font-bold text-gray-100 tabular-nums"
    }, u > 0 && React.createElement(React.Fragment, null, lo > 0 && React.createElement("i", {
      className: "inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-1 align-middle"
    }), u)));
  })), selectedDay && selectedDayData && React.createElement("div", {
    className: "sticky bottom-0 mt-auto bg-gray-900 border-t border-white/[0.1] px-5 pt-3 pb-5"
  }, React.createElement("button", {
    onClick: () => setEditDay(selectedDay),
    className: "w-full flex items-center justify-between text-left active:opacity-70"
  }, React.createElement("span", null, React.createElement("span", {
    className: "block text-[13px] text-gray-400"
  }, calM, "/", selectedDay, "（", t.dn[dow(calY, calM, selectedDay)], "）"), React.createElement("span", {
    className: "block text-lg font-bold text-gray-100 mt-0.5 tabular-nums"
  }, selectedDayData.total || 0, " ", t.units, (selectedDayData.laodian || 0) > 0 ? ` · ${t.laodian} ${selectedDayData.laodian}` : '')), React.createElement("span", {
    className: "text-right"
  }, React.createElement("span", {
    className: "block text-[22px] font-extrabold text-amber-400 tabular-nums"
  }, "$", selectedSal.toLocaleString()), React.createElement("span", {
    className: "block text-[13px] text-gray-400"
  }, t === T.zh ? '點此編輯 ›' : 'Sửa ›')))), editDay && data && React.createElement(DayEditor, {
    day: data.days[editDay] || eDay(),
    d: editDay,
    y: calY,
    m: calM,
    t: t,
    up: getUnitPriceForDate(settings, calY, calM, editDay),
    sk: settings.skills,
    code: settings.code,
    onSave: saveDay,
    onCancel: () => setEditDay(null)
  }));
}
function MonthlyPage({
  settings,
  curM,
  setCurM,
  t,
  onGotoYear,
  onClose
}) {
  var [listY, setListY] = useState(() => settings.year || bizParts().y);
  var [data, setData] = useState(null);
  var [editDay, setEditDay] = useState(null);
  useEffect(() => {
    setData(LS.get(dk(settings.code, listY, curM)) || eMon());
  }, [settings.code, listY, curM]);
  useEffect(() => {
    if (data && curM === bizParts().m && listY === bizParts().y) {
      var el = document.querySelector('[data-today-row]');
      if (el) setTimeout(() => {
        try {
          el.scrollIntoView({
            block: 'center',
            behavior: 'smooth'
          });
        } catch (_e) {}
      }, 150);
    }
  }, [data, curM, listY]);
  useEffect(() => {
    var el = document.querySelector('[data-month-tab-active]');
    if (el) setTimeout(() => {
      try {
        el.scrollIntoView({
          inline: 'center',
          block: 'nearest',
          behavior: 'auto'
        });
      } catch (_e) {}
    }, 0);
  }, [curM]);
  var saveDay = (d, dd) => {
    var nd = {
      ...data,
      days: {
        ...data.days,
        [d]: dd
      }
    };
    setData(nd);
    setEditDay(null);
    LS.set(dk(settings.code, listY, curM), nd);
  };
  var dm = dim(listY, curM);
  var calc = useMemo(() => {
    if (!data) return {
      prev: {
        units: 0,
        salary: 0,
        laodian: 0
      },
      next: {
        units: 0,
        salary: 0,
        laodian: 0
      },
      month: {
        units: 0,
        salary: 0,
        laodian: 0
      }
    };
    var pu = 0,
      ps = 0,
      pl = 0,
      nu = 0,
      ns = 0,
      nl = 0;
    for (var d = 1; d <= dm; d++) {
      var day = data.days[d] || eDay();
      var u = day.total || 0,
        lo = day.laodian || 0,
        s = calcSal(day, getUnitPriceForDate(settings, listY, curM, d), settings.skills);
      if (d <= 15) {
        pu += u;
        ps += s;
        pl += lo;
      } else {
        nu += u;
        ns += s;
        nl += lo;
      }
    }
    return {
      prev: {
        units: pu,
        salary: ps,
        laodian: pl
      },
      next: {
        units: nu,
        salary: ns,
        laodian: nl
      },
      month: {
        units: pu + nu,
        salary: ps + ns,
        laodian: pl + nl
      }
    };
  }, [data, dm, listY, curM, settings.unitPrice, settings.unitPriceHistory, settings.skills]);
  var zh = t === T.zh;
  var isCurMonth = curM === bizParts().m && listY === bizParts().y;
  var halfHdr = (title, range, sal) => React.createElement(React.Fragment, null, React.createElement("div", {
    className: "flex items-baseline gap-2 px-4 pt-4 pb-1.5"
  }, React.createElement("span", {
    className: "text-[15px] font-bold text-gray-100"
  }, title), React.createElement("span", {
    className: "text-xs text-gray-500"
  }, range), React.createElement("span", {
    className: "ml-auto text-sm font-bold text-emerald-400 tabular-nums"
  }, "$", sal.toLocaleString())), React.createElement("div", {
    className: "flex items-center px-4 pb-1 text-xs text-gray-500"
  }, React.createElement("div", {
    className: "w-14"
  }, zh ? '日期' : 'Ngày'), React.createElement("div", {
    className: "flex-1 flex items-center gap-2"
  }, React.createElement("span", {
    className: "w-10 text-right"
  }, t.units), React.createElement("span", {
    className: "w-20 text-right"
  }, t.salary), React.createElement("span", {
    className: "w-8 text-center"
  }, t.laodian))));
  return React.createElement("div", {
    className: "max-w-lg mx-auto fi"
  }, false && React.createElement("div", {
    className: "px-3 py-2"
  }, React.createElement(SummaryTable, {
    prev: calc.prev,
    next: calc.next,
    month: calc.month,
    t: t
  })), React.createElement("div", {
    className: "px-4 pt-2"
  }, React.createElement("div", {
    className: "flex items-center justify-between"
  }, React.createElement("span", {
    className: "text-[30px] leading-none font-extrabold text-gray-100"
  }, t.months[curM - 1]), React.createElement("div", {
    className: "flex items-center"
  }, React.createElement("button", {
    onClick: () => setListY(listY - 1),
    className: "w-11 h-11 rounded-full flex items-center justify-center text-gray-400 active:bg-white/[0.08]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "18",
    height: "18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M15 19l-7-7 7-7"
  }))), React.createElement("button", {
    onClick: () => onGotoYear && onGotoYear(listY),
    className: "text-[15px] font-bold text-gray-100 active:opacity-60 min-w-[48px] min-h-[44px]"
  }, listY), React.createElement("button", {
    onClick: () => setListY(listY + 1),
    className: "w-11 h-11 rounded-full flex items-center justify-center text-gray-400 active:bg-white/[0.08]"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "18",
    height: "18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M9 5l7 7-7 7"
  }))))), React.createElement("p", {
    className: "mt-1.5 text-[36px] leading-tight font-extrabold text-emerald-400 tabular-nums"
  }, "$", calc.month.salary.toLocaleString(), React.createElement("span", {
    className: "text-sm font-semibold text-gray-400 ml-2"
  }, calc.month.units, " ", t.units, " · ", calc.month.laodian, " ", t.laodian))), React.createElement("div", {
    className: "grid grid-cols-2 gap-2 px-4 pt-3 pb-2"
  }, [[t.p1, calc.prev, zh ? '上半月 1–15' : 'Nửa đầu 1–15'], [t.p2, calc.next, zh ? '下半月 16–' + dm : 'Nửa sau 16–' + dm]].map(([, c, lb], i) => React.createElement("div", {
    key: i,
    className: `rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 ${c.units === 0 && c.salary === 0 ? 'opacity-60' : ''}`
  }, React.createElement("p", {
    className: "text-xs text-gray-400"
  }, lb), React.createElement("p", {
    className: "text-xl font-bold text-emerald-400 tabular-nums"
  }, "$", c.salary.toLocaleString()), React.createElement("p", {
    className: "text-xs text-gray-500"
  }, c.units === 0 && c.salary === 0 ? zh ? '尚無紀錄' : 'Chưa có' : `${c.units} ${t.units} · ${c.laodian} ${t.laodian}`)))), React.createElement("div", {
    className: "sticky top-0 z-10 bg-gray-950"
  }, React.createElement("div", {
    className: "flex overflow-x-auto no-sb px-2 border-b border-white/[0.08]"
  }, Array.from({
    length: 12
  }, (_, i) => i + 1).map(m => React.createElement("button", {
    key: m,
    "data-month-tab-active": m === curM ? true : undefined,
    onClick: () => setCurM(m),
    className: `px-3.5 min-h-[44px] text-[15px] font-semibold flex-shrink-0 border-b-[3px] ${m === curM ? 'text-amber-400 border-amber-500' : 'text-gray-500 border-transparent'}`
  }, t.months[m - 1])))), false && React.createElement("div", {
    className: "px-3 py-1.5 bg-amber-600/[0.06] border-b border-amber-500/10"
  }, React.createElement("span", {
    className: "text-[11px] text-amber-500/80 font-semibold"
  }, t.p1)), halfHdr(zh ? '上半月' : 'Nửa đầu', zh ? '1–15 日' : '1–15', calc.prev.salary), Array.from({
    length: Math.min(15, dm)
  }, (_, i) => i + 1).map(d => React.createElement(DayRow, {
    key: d,
    d: d,
    day: (data === null || data === void 0 ? void 0 : data.days[d]) || eDay(),
    y: listY,
    m: curM,
    t: t,
    up: getUnitPriceForDate(settings, listY, curM, d),
    sk: settings.skills,
    onEdit: setEditDay,
    isToday: curM === bizParts().m && listY === bizParts().y && d === bizParts().d
  })), dm > 15 && React.createElement(React.Fragment, null, halfHdr(zh ? '下半月' : 'Nửa sau', zh ? '16–' + dm + ' 日' : '16–' + dm, calc.next.salary), Array.from({
    length: dm - 15
  }, (_, i) => i + 16).map(d => React.createElement(DayRow, {
    key: d,
    d: d,
    day: (data === null || data === void 0 ? void 0 : data.days[d]) || eDay(),
    y: listY,
    m: curM,
    t: t,
    up: getUnitPriceForDate(settings, listY, curM, d),
    sk: settings.skills,
    onEdit: setEditDay,
    isToday: curM === bizParts().m && listY === bizParts().y && d === bizParts().d
  }))), isCurMonth && React.createElement("button", {
    onClick: () => {
      var el = document.querySelector('[data-today-row]');
      if (el) try {
        el.scrollIntoView({
          block: 'center',
          behavior: 'smooth'
        });
      } catch (_e) {}
    },
    className: "fixed right-4 bottom-6 z-20 min-h-[44px] px-5 rounded-full bg-amber-600 text-white text-sm font-bold shadow-lg active:opacity-80"
  }, zh ? '回到今天' : 'Về hôm nay', " ", bizParts().m, "/", bizParts().d), editDay && data && React.createElement(DayEditor, {
    day: data.days[editDay] || eDay(),
    d: editDay,
    y: listY,
    m: curM,
    t: t,
    up: getUnitPriceForDate(settings, listY, curM, editDay),
    sk: settings.skills,
    code: settings.code,
    onSave: saveDay,
    onCancel: () => setEditDay(null)
  }));
}
function YearlyPage({
  settings,
  t,
  onBack,
  year
}) {
  var [y, setY] = useState(year || settings.year || bizParts().y);
  var rows = useMemo(() => {
    var r = [];
    for (var m = 1; m <= 12; m++) {
      var d = LS.get(dk(settings.code, y, m));
      var u = 0,
        lo = 0,
        sal = 0;
      if (d !== null && d !== void 0 && d.days) {
        for (var i = 1; i <= dim(y, m); i++) {
          var day = d.days[i];
          if (day) {
            u += day.total || 0;
            lo += day.laodian || 0;
            sal += calcSal(day, getUnitPriceForDate(settings, y, m, i), settings.skills);
          }
        }
      }
      r.push({
        month: m,
        units: u,
        salary: sal,
        laodian: lo
      });
    }
    return r;
  }, [settings.code, y, settings.unitPrice, settings.unitPriceHistory, settings.skills]);
  var tot = rows.reduce((a, r) => ({
    u: a.u + r.units,
    s: a.s + r.salary,
    l: a.l + r.laodian
  }), {
    u: 0,
    s: 0,
    l: 0
  });
  var best = Math.max(0, ...rows.map(r => r.salary));
  var nv = "w-11 h-11 rounded-full flex items-center justify-center text-gray-300 active:bg-white/[0.08]";
  var cur = bizParts();
  return React.createElement("div", {
    className: "max-w-lg mx-auto fi px-4"
  }, React.createElement("div", {
    className: "flex items-center justify-between pt-1 pb-1"
  }, React.createElement("div", {
    className: "flex items-center -ml-2"
  }, React.createElement("button", {
    onClick: () => onBack && onBack(),
    "aria-label": "back",
    className: nv
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "20",
    height: "20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M15 19l-7-7 7-7"
  }))), React.createElement("h2", {
    className: "text-xl font-bold text-gray-100 whitespace-nowrap"
  }, y, " ", t.yearly)), React.createElement("div", {
    className: "flex items-center"
  }, React.createElement("button", {
    onClick: () => setY(y - 1),
    "aria-label": "prev year",
    className: nv
  }, "‹"), React.createElement("button", {
    onClick: () => setY(y + 1),
    "aria-label": "next year",
    className: nv
  }, "›"))), React.createElement("div", {
    className: "flex items-center h-8 border-b border-white/[0.12] text-[13px] text-[#aab2c0] font-medium"
  }, React.createElement("div", {
    className: "w-12"
  }), React.createElement("div", {
    className: "flex-1 text-right"
  }, t.units), React.createElement("div", {
    className: "w-16 text-right"
  }, t.laodian), React.createElement("div", {
    className: "flex-[1.6] text-right"
  }, t.salary)), rows.map(r => React.createElement("div", {
    key: r.month,
    className: `flex items-center h-9 border-b border-white/[0.06] ${r.units > 0 ? '' : 'opacity-35'} ${y === cur.y && r.month === cur.m ? 'bg-white/[0.04]' : ''}`
  }, React.createElement("div", {
    className: "w-12 text-[15px] font-medium text-gray-200"
  }, t.months[r.month - 1]), React.createElement("div", {
    className: "flex-1 text-right text-[15px] text-gray-200 tabular-nums"
  }, r.units), React.createElement("div", {
    className: "w-16 text-right text-[15px] text-[#aab2c0] tabular-nums"
  }, r.laodian), React.createElement("div", {
    className: `flex-[1.6] text-right text-[15px] font-semibold tabular-nums ${r.salary > 0 && r.salary === best ? 'text-amber-400' : 'text-gray-100'}`
  }, r.salary.toLocaleString()))), React.createElement("div", {
    className: "flex items-center h-12 border-t-2 border-amber-400/50 mt-0.5"
  }, React.createElement("div", {
    className: "w-12 text-[15px] font-bold text-amber-400"
  }, t.total), React.createElement("div", {
    className: "flex-1 text-right text-[15px] text-gray-100 font-bold tabular-nums"
  }, tot.u), React.createElement("div", {
    className: "w-16 text-right text-[15px] text-gray-100 font-bold tabular-nums"
  }, tot.l), React.createElement("div", {
    className: "flex-[1.6] text-right text-[18px] text-amber-400 font-extrabold tabular-nums"
  }, tot.s.toLocaleString())));
}
function bkPad(n) {
  return String(n).padStart(2, '0');
}
function bkFmtLogStr(s, args) {
  return (args || []).reduce((r, a, i) => r.replace('{' + i + '}', a), s || '');
}
function bkFmtDateInput(ts) {
  var d = ts ? new Date(ts) : new Date();
  return `${d.getFullYear()}-${bkPad(d.getMonth() + 1)}-${bkPad(d.getDate())}`;
}
function bkFmtTimeInput(ts) {
  var d = ts ? new Date(ts) : new Date();
  return `${bkPad(d.getHours())}:${bkPad(d.getMinutes())}`;
}
function bkNextHourTime() {
  var d = new Date();
  var h = d.getHours();
  if (d.getMinutes() > 0) h += 1;
  if (h > 23) h = 23;
  return bkPad(h) + ':00';
}
function BookingCustFields({
  code,
  t,
  custName,
  custTitle,
  custPhone,
  onChange
}) {
  var [q, setQ] = useState('');
  var lang = t === T.zh ? 'zh' : 'vi';
  var results = useMemo(() => q.trim() ? searchCustDB(code, q) : [], [code, q]);
  var applyCust = c => {
    onChange({
      custName: c.custName || '',
      custTitle: c.custTitle || 'sir',
      custPhone: c.custPhone || ''
    });
    setQ('');
  };
  return React.createElement("div", {
    className: "space-y-2"
  }, React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: t.custSearchHint,
    className: "w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 h-12 text-[15px] text-gray-100 focus:outline-none focus:border-amber-400"
  }), q.trim() && (results.length > 0 ? React.createElement("div", {
    className: "space-y-1 max-h-48 overflow-y-auto no-sb fi"
  }, results.map((c, i) => React.createElement("button", {
    key: i,
    onClick: () => applyCust(c),
    className: "w-full text-left min-h-[44px] px-1 border-b border-white/[0.08] text-[15px] text-gray-100 active:bg-white/[0.06]"
  }, React.createElement("span", null, c.custName || '—'), " ", React.createElement("span", {
    className: "text-[13px] text-amber-400"
  }, bookTitleName(c.custTitle, lang)), c.custPhone && React.createElement("span", {
    className: "text-[13px] text-[#aab2c0] font-mono ml-2"
  }, c.custPhone)))) : React.createElement("p", {
    className: "text-[13px] text-amber-400"
  }, t.custNewHint)), React.createElement("div", {
    className: "grid gap-2",
    style: {
      gridTemplateColumns: '1.2fr 0.95fr 1.5fr'
    }
  }, React.createElement("input", {
    value: custName || '',
    onChange: e => onChange({
      custName: e.target.value
    }),
    placeholder: t.custName,
    className: "bg-white/[0.06] border border-white/[0.10] rounded-xl px-2 h-12 text-[15px] text-gray-100 focus:outline-none focus:border-amber-400 min-w-0"
  }), React.createElement("select", {
    value: custTitle || 'sir',
    onChange: e => onChange({
      custTitle: e.target.value
    }),
    className: "bg-white/[0.06] border border-white/[0.10] rounded-xl px-1 h-12 text-[15px] text-gray-100 focus:outline-none focus:border-amber-400 min-w-0"
  }, BOOK_TITLES.filter(o => o.v === 'sir' || o.v === 'ms').map(o => React.createElement("option", {
    key: o.v,
    value: o.v
  }, o[lang]))), React.createElement("input", {
    value: custPhone || '',
    onChange: e => onChange({
      custPhone: e.target.value
    }),
    inputMode: "numeric",
    placeholder: t.custPhone,
    className: "bg-white/[0.06] border border-white/[0.10] rounded-xl px-2 h-12 text-[15px] text-gray-100 font-mono focus:outline-none focus:border-amber-400 min-w-0"
  })));
}
function BookingFormPanel({
  code,
  t,
  initial,
  onSave,
  onCancel
}) {
  var settings = LS.get('app-settings') || {};
  var lang = t === T.zh ? 'zh' : 'vi';
  var [custName, setCustName] = useState((initial === null || initial === void 0 ? void 0 : initial.custName) || '');
  var [custTitle, setCustTitle] = useState((initial === null || initial === void 0 ? void 0 : initial.custTitle) || 'sir');
  var [custPhone, setCustPhone] = useState((initial === null || initial === void 0 ? void 0 : initial.custPhone) || '');
  var [date, setDate] = useState(bkFmtDateInput());
  var [time, setTime] = useState(bkNextHourTime());
  var [svc, setSvc] = useState((initial === null || initial === void 0 ? void 0 : initial.svc) || 'FB3');
  var [extra, setExtra] = useState((initial === null || initial === void 0 ? void 0 : initial.extra) || 0);
  var [party, setParty] = useState((initial === null || initial === void 0 ? void 0 : initial.party) || 0);
  var [partyDetails, setPartyDetails] = useState(initial !== null && initial !== void 0 && initial.partyDetails ? JSON.parse(JSON.stringify(initial.partyDetails)) : []);
  var [note, setNote] = useState((initial === null || initial === void 0 ? void 0 : initial.note) || '');
  var [err, setErr] = useState('');
  var dt = useMemo(() => {
    var [y, m, d] = date.split('-').map(Number);
    var [hh, mm] = time.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm).getTime();
  }, [date, time]);
  var endTs = dt + bookMinutes(svc, extra) * 60000;
  var conflicts = useMemo(() => findConflicts(code, {
    datetime: dt,
    svc,
    extra
  }, null), [code, dt, svc, extra]);
  var dayOff = useMemo(() => dayOffStatus(code, dt), [code, dt]);
  var overWork = useMemo(() => {
    if (!settings.workEnd) return false;
    var [eh, em] = settings.workEnd.split(':').map(Number);
    var d = new Date(dt);
    var weTs = new Date(d.getFullYear(), d.getMonth(), d.getDate(), eh, em).getTime();
    if (settings.workStart) {
      var [sh, sm] = settings.workStart.split(':').map(Number);
      var swMin = sh * 60 + sm,
        ewMin = eh * 60 + em;
      if (ewMin <= swMin) weTs += 86400000;
    }
    return endTs > weTs;
  }, [dt, endTs, settings.workEnd, settings.workStart]);
  var fmtHM = ts => {
    var d = new Date(ts);
    return bkPad(d.getHours()) + ':' + bkPad(d.getMinutes());
  };
  var save = () => {
    if (!custName.trim() && !custPhone.trim()) {
      setErr(t.bookNoCustHint || t.pickCustomerFirst);
      return;
    }
    try {
      upsertCust(code, {
        custName: custName.trim(),
        custTitle,
        custPhone: custPhone.trim()
      });
    } catch (_e) {}
    addBooking(code, {
      custName: custName.trim(),
      custTitle,
      custPhone: custPhone.trim(),
      datetime: dt,
      svc,
      extra,
      party,
      partyDetails: partyDetails.slice(0, party),
      note: note.trim(),
      status: 'confirmed'
    });
    try {
      if (window.__logUse) window.__logUse('booking_add');
    } catch (_e) {}
    onSave();
  };
  return React.createElement("div", {
    className: "space-y-5 fi"
  }, React.createElement("h3", {
    className: "text-lg font-bold text-gray-100"
  }, initial ? t.duplicateBtn || t.bookingNew : t.bookingNew), React.createElement("p", {
    className: "text-[13px] font-bold text-amber-400 tracking-wide"
  }, "客人"), React.createElement("div", null, React.createElement("label", {
    className: "text-[13px] text-[#aab2c0] mb-1.5 block"
  }, t.selectCustomer || t.custName), React.createElement(BookingCustFields, {
    code: code,
    t: t,
    custName: custName,
    custTitle: custTitle,
    custPhone: custPhone,
    onChange: p => {
      if (p.custName !== undefined) setCustName(p.custName);
      if (p.custTitle !== undefined) setCustTitle(p.custTitle);
      if (p.custPhone !== undefined) setCustPhone(p.custPhone);
      setErr('');
    }
  })), React.createElement("div", {
    className: "h-px bg-white/[0.08]"
  }), React.createElement("p", {
    className: "text-[13px] font-bold text-amber-400 tracking-wide"
  }, "時間與項目"), React.createElement("div", {
    className: "grid grid-cols-[3fr_2fr] gap-3"
  }, React.createElement("div", null, React.createElement("label", {
    className: "text-[13px] text-[#aab2c0] mb-1.5 block"
  }, t.bookDate), React.createElement("input", {
    type: "date",
    value: date,
    onChange: e => setDate(e.target.value),
    className: "w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 h-12 text-[15px] text-gray-100 focus:outline-none focus:border-amber-400"
  })), React.createElement("div", null, React.createElement("label", {
    className: "text-[13px] text-[#aab2c0] mb-1.5 block"
  }, t.bookTime), React.createElement("input", {
    type: "time",
    step: "600",
    value: time,
    onChange: e => setTime(e.target.value),
    className: "w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 h-12 text-[15px] text-gray-100 focus:outline-none focus:border-amber-400"
  }))), dayOff > 0 && React.createElement("p", {
    className: "text-[13px] text-red-400"
  }, "⚠️ ", bkFmtLogStr(t.dayOffWarn, [skName(dayOff, lang)])), conflicts.length > 0 && conflicts.map(o => React.createElement("p", {
    key: o.id,
    className: "text-xs text-red-400"
  }, "⚠️ ", bkFmtLogStr(t.conflictWarn, [fmtHM(o.datetime), (o.custName || '') + ' ' + bookTitleName(o.custTitle, lang)]))), overWork && React.createElement("p", {
    className: "text-[13px] text-red-400"
  }, "⚠️ ", bookLabel(svc, extra), " → ", fmtHM(endTs), settings.workEnd ? '（' + t.workEnd + ' ' + settings.workEnd + '）' : ''), !settings.workEnd && React.createElement("p", {
    className: "text-[13px] text-[#aab2c0]"
  }, t.noWorkEnd), React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, React.createElement("div", null, React.createElement("label", {
    className: "text-[13px] text-[#aab2c0] mb-1.5 block"
  }, t.svcLabel), React.createElement("select", {
    value: svc,
    onChange: e => setSvc(e.target.value),
    className: "w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 h-12 text-[15px] text-gray-100 focus:outline-none focus:border-amber-400"
  }, SERVICES.map(s => React.createElement("option", {
    key: s.code,
    value: s.code
  }, s.code, "（", s.min, lang === 'zh' ? '分' : 'p', "）")))), React.createElement("div", null, React.createElement("label", {
    className: "text-[13px] text-[#aab2c0] mb-1.5 block"
  }, t.addHour), React.createElement("select", {
    value: extra,
    onChange: e => setExtra(parseInt(e.target.value)),
    className: "w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 h-12 text-[15px] text-gray-100 focus:outline-none focus:border-amber-400"
  }, [0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => React.createElement("option", {
    key: n,
    value: n
  }, "+", n))))), React.createElement("div", {
    className: "flex items-center justify-between"
  }, React.createElement("span", {
    className: "text-[14px] text-[#aab2c0]"
  }, bookLabel(svc, extra), " = ", bookUnits(svc, extra), " ", t.units, " · ", bookMinutes(svc, extra), lang === 'zh' ? '分' : 'p')), React.createElement("div", null, React.createElement("label", {
    className: "text-[13px] text-[#aab2c0] mb-1.5 block"
  }, t.party), React.createElement("div", {
    className: "flex items-center gap-3"
  }, React.createElement("button", {
    onClick: () => {
      var np = Math.max(0, party - 1);
      setParty(np);
      setPartyDetails(d => d.slice(0, np));
    },
    className: "w-12 h-12 rounded-xl border border-white/[0.14] text-gray-200 text-xl"
  }, "−"), React.createElement("span", {
    className: "text-xl font-bold text-gray-100 flex-1 text-center tabular-nums"
  }, party, " ", t.partyUnit), React.createElement("button", {
    onClick: () => {
      var np = party + 1;
      setParty(np);
      setPartyDetails(d => [...d, {
        svc: svc,
        teacher: '',
        note: ''
      }]);
    },
    className: "w-12 h-12 rounded-xl border border-white/[0.14] text-gray-200 text-xl"
  }, "+"))), party > 0 && React.createElement("div", {
    className: "space-y-2"
  }, Array.from({
    length: party
  }, (_, i) => {
    var pd = partyDetails[i] || {
      svc: svc,
      assignMode: 'none',
      teacher: '',
      conds: {},
      oil: false,
      note: ''
    };
    var setPd = patch => {
      setPartyDetails(d => {
        var nd = [...d];
        while (nd.length < party) nd.push({
          svc: svc,
          assignMode: 'none',
          teacher: '',
          conds: {},
          oil: false,
          note: ''
        });
        nd[i] = {
          ...nd[i],
          ...patch
        };
        return nd;
      });
    };
    var conds = pd.conds || {};
    var toggleCond = k => setPd({
      conds: {
        ...conds,
        [k]: !conds[k]
      }
    });
    return React.createElement("div", {
      key: i,
      className: "border-t border-white/[0.08] pt-3 space-y-2"
    }, React.createElement("p", {
      className: "text-[13px] text-amber-400 font-semibold"
    }, t.partyMember, i + 1, t.partyUnit), React.createElement("select", {
      value: pd.svc,
      onChange: e => setPd({
        svc: e.target.value
      }),
      className: "w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 h-11 text-[14px] text-gray-100 focus:outline-none focus:border-amber-400"
    }, SERVICES.map(s => React.createElement("option", {
      key: s.code,
      value: s.code
    }, s.code, "（", s.min, "分）"))), React.createElement("select", {
      value: pd.assignMode || 'none',
      onChange: e => setPd({
        assignMode: e.target.value
      }),
      className: "w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 h-11 text-[14px] text-gray-100 focus:outline-none focus:border-amber-400"
    }, React.createElement("option", {
      value: "none"
    }, t.noAssignTeacher), React.createElement("option", {
      value: "assign"
    }, t.assignTeacherMode)), pd.assignMode === 'assign' && React.createElement("div", {
      className: "space-y-2 fi"
    }, React.createElement("input", {
      value: pd.teacher || '',
      onChange: e => setPd({
        teacher: e.target.value,
        conds: {}
      }),
      placeholder: t.assignByCode,
      className: "w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 h-11 text-[14px] text-gray-100 focus:outline-none focus:border-amber-400"
    }), React.createElement("div", {
      className: "grid grid-cols-4 gap-1"
    }, [['male', t.assignMale], ['female', t.assignFemale], ['tw', t.assignTW], ['vn', t.assignVN]].map(([k, l]) => React.createElement("button", {
      key: k,
      onClick: () => {
        setPd({
          teacher: ''
        });
        toggleCond(k);
      },
      className: `h-10 rounded-xl text-[13px] font-medium ${conds[k] ? 'bg-amber-400 text-gray-950' : 'border border-white/[0.14] text-gray-300'}`
    }, l)))), React.createElement("button", {
      onClick: () => setPd({
        oil: !pd.oil
      }),
      className: `w-full h-10 rounded-xl text-[13px] font-medium ${pd.oil ? 'bg-amber-400 text-gray-950' : 'border border-white/[0.14] text-gray-300'}`
    }, t.assignOil), React.createElement("input", {
      value: pd.note || '',
      onChange: e => setPd({
        note: e.target.value
      }),
      placeholder: t.svcNote,
      className: "w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 h-11 text-[14px] text-gray-100 focus:outline-none focus:border-amber-400"
    }));
  })), React.createElement("div", null, React.createElement("label", {
    className: "text-[13px] text-[#aab2c0] mb-1.5 block"
  }, t.custNote), React.createElement("textarea", {
    value: note,
    onChange: e => setNote(e.target.value),
    rows: 2,
    placeholder: t.custNote,
    className: "w-full bg-white/[0.06] border border-white/[0.10] rounded-xl px-3 h-12 text-[15px] text-gray-100 focus:outline-none focus:border-amber-400 resize-none"
  })), err && React.createElement("p", {
    className: "text-[13px] text-red-400"
  }, err), React.createElement("div", {
    className: "sticky bottom-0 -mx-4 px-4 pt-3 pb-4 bg-gray-950 border-t border-white/[0.08] flex gap-2"
  }, React.createElement("button", {
    onClick: onCancel,
    className: "flex-1 h-[52px] rounded-2xl border border-white/[0.18] text-gray-200 text-[15px] font-semibold"
  }, t.bookCancel), React.createElement("button", {
    onClick: save,
    className: "flex-[1.6] h-[52px] rounded-2xl bg-amber-400 text-gray-950 text-[16px] font-bold"
  }, t.bookSave)));
}
function BookingListPanel({
  code,
  t,
  refresh,
  onOpen,
  onDuplicate
}) {
  var [viewMode, setViewMode] = useState('cal');
  var [hidePast, setHidePast] = useState(false);
  var [histOpen, setHistOpen] = useState(false);
  var bookings = useMemo(() => {
    var list = (getBookings(code) || []).filter(Boolean);
    return list.sort((a, b) => (a.datetime || 0) - (b.datetime || 0));
  }, [code, refresh]);
  var lang = t === T.zh ? 'zh' : 'vi';
  if (bookings.length === 0) return React.createElement("p", {
    className: "text-base text-gray-400 text-center py-10"
  }, t.bookingEmpty);
  var now = Date.now();
  var conflictMap = {};
  bookings.forEach(b => {
    var [s1, e1] = bookRange(b);
    var hit = bookings.find(o => o.id !== b.id && (() => {
      var [s2, e2] = bookRange(o);
      return s1 < e2 && s2 < e1;
    })());
    if (hit) conflictMap[b.id] = hit;
  });
  var pastBookings = bookings.filter(b => {
    var [, e] = bookRange(b);
    return e < now;
  });
  var upcomingBookings = bookings.filter(b => {
    var [, e] = bookRange(b);
    return e >= now;
  });
  var fmtDay = ts => {
    var d = new Date(ts);
    return `${d.getMonth() + 1}/${bkPad(d.getDate())}`;
  };
  var fmtHM = ts => {
    var d = new Date(ts);
    return `${bkPad(d.getHours())}:${bkPad(d.getMinutes())}`;
  };
  var card = (b, showDate) => {
    var past = b.datetime < now;
    var conf = conflictMap[b.id];
    var d = new Date(b.datetime);
    var wd = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
    return React.createElement("div", {
      key: b.id,
      className: `border-b border-white/[0.1] ${past ? 'opacity-60' : ''}`
    }, React.createElement("button", {
      onClick: () => onOpen(b.id),
      className: "w-full text-left flex items-center gap-4 py-3.5 active:opacity-70"
    }, React.createElement("div", {
      className: "flex-shrink-0 w-[64px]"
    }, showDate && React.createElement("span", {
      className: "block text-[13px] text-gray-400"
    }, fmtDay(b.datetime), "（", wd, "）"), React.createElement("span", {
      className: "block text-[22px] leading-tight font-bold text-gray-100 tabular-nums"
    }, fmtHM(b.datetime)), React.createElement("span", {
      className: "block text-[13px] text-gray-400"
    }, bookMinutes(b.svc, b.extra), lang === 'zh' ? ' 分' : 'p')), React.createElement("div", {
      className: "flex-1 min-w-0"
    }, React.createElement("p", {
      className: "text-[17px] font-bold text-gray-100 truncate"
    }, b.custName || '—', " ", React.createElement("span", {
      className: "text-sm font-normal text-gray-400"
    }, bookTitleName(b.custTitle, lang)), "\u3000", React.createElement("span", {
      className: "text-emerald-400 font-bold"
    }, bookLabel(b.svc, b.extra)), b.party > 0 ? React.createElement("span", {
      className: "text-sm text-amber-400 ml-1 font-semibold"
    }, t.totalPeople, b.party + 1, t.peopleUnit) : ''), conf && React.createElement("p", {
      className: "text-[13px] text-red-400 mt-0.5"
    }, "⚠️ ", bkFmtLogStr(t.conflictWarn, [fmtHM(conf.datetime), (conf.custName || '') + ' ' + bookTitleName(conf.custTitle, lang)]))), (() => {
      if (b.confirmed) return React.createElement("span", {
        className: "flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400"
      }, "✓ ", t.statusConfirmed);
      if (b.needReconfirm) return React.createElement("span", {
        className: "flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/15 text-red-400"
      }, t.statusReconfirm);
      return React.createElement("span", {
        className: "flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border border-white/[0.15] text-gray-300"
      }, t.statusUnconfirmed);
    })()), past && React.createElement("button", {
      onClick: () => onDuplicate(b),
      className: "mb-3 min-h-[40px] px-4 rounded-full border border-amber-400/40 text-amber-400 text-sm font-semibold active:bg-amber-400/10"
    }, "↻ ", t.duplicateBtn));
  };
  var switcher = React.createElement("div", {
    className: "space-y-3 mb-2"
  }, React.createElement("div", {
    className: "grid grid-cols-2 border border-white/[0.15] rounded-xl overflow-hidden"
  }, React.createElement("button", {
    onClick: () => setViewMode('cal'),
    className: `h-[42px] text-sm ${viewMode === 'cal' ? 'bg-amber-400 text-gray-950 font-bold' : 'text-gray-200 active:bg-white/[0.08]'}`
  }, t.calView), React.createElement("button", {
    onClick: () => setViewMode('event'),
    className: `h-[42px] text-sm border-l border-white/[0.15] ${viewMode === 'event' ? 'bg-amber-400 text-gray-950 font-bold' : 'text-gray-200 active:bg-white/[0.08]'}`
  }, t.eventView)), React.createElement("label", {
    className: "flex items-center justify-between min-h-[44px] text-sm text-gray-300 cursor-pointer"
  }, React.createElement("span", null, t.hidePast), React.createElement("span", {
    className: "relative inline-block w-12 h-7"
  }, React.createElement("input", {
    type: "checkbox",
    checked: hidePast,
    onChange: () => setHidePast(!hidePast),
    className: "peer sr-only"
  }), React.createElement("span", {
    className: "absolute inset-0 rounded-full bg-gray-600 peer-checked:bg-amber-400 transition-colors"
  }), React.createElement("span", {
    className: "absolute top-[3px] left-[3px] w-[22px] h-[22px] rounded-full bg-white peer-checked:bg-gray-950 transition-transform peer-checked:translate-x-5"
  }))));
  var histSection = pastBookings.length > 0 && React.createElement("div", {
    className: "mt-5 pt-2 border-t border-white/[0.1]"
  }, React.createElement("button", {
    onClick: () => setHistOpen(v => !v),
    className: "w-full flex items-center justify-between min-h-[44px]"
  }, React.createElement("span", {
    className: "text-sm text-gray-300 font-semibold"
  }, t.bookHistory, "（", pastBookings.length, "）"), React.createElement("span", {
    className: "text-gray-400 text-sm"
  }, histOpen ? '▲ ' + t.collapseBtn : '▼ ' + t.expandBtn)), histOpen && React.createElement("div", {
    className: "fi"
  }, pastBookings.map(b => card(b, true))));
  if (hidePast && viewMode === 'event') {
    return React.createElement("div", null, switcher, React.createElement("div", null, upcomingBookings.map(b => card(b, true))));
  }
  if (viewMode === 'event') {
    return React.createElement("div", null, switcher, React.createElement("div", null, upcomingBookings.map(b => card(b, true))), histSection);
  }
  var groups = {};
  upcomingBookings.forEach(b => {
    var d = new Date(b.datetime);
    var key = `${d.getFullYear()}-${bkPad(d.getMonth() + 1)}-${bkPad(d.getDate())}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  });
  var todayKey = (() => {
    var d = new Date();
    return `${d.getFullYear()}-${bkPad(d.getMonth() + 1)}-${bkPad(d.getDate())}`;
  })();
  return React.createElement("div", null, switcher, React.createElement("div", null, Object.keys(groups).sort().map(key => {
    var items = groups[key];
    var d0 = new Date(items[0].datetime);
    var wd = ['日', '一', '二', '三', '四', '五', '六'][d0.getDay()];
    return React.createElement("div", {
      key: key
    }, React.createElement("p", {
      className: `text-[13px] font-semibold tracking-wide pt-4 pb-1 ${key === todayKey ? 'text-amber-400' : 'text-gray-400'}`
    }, key === todayKey ? lang === 'zh' ? '今天 ' : 'Hôm nay ' : '', d0.getFullYear(), "/", bkPad(d0.getMonth() + 1), "/", bkPad(d0.getDate()), "（", lang === 'zh' ? wd : d0.getDay(), "）"), React.createElement("div", {
      className: "border-t border-white/[0.1]"
    }, items.map(b => card(b, false))));
  })), !hidePast && histSection);
}
function BookingDetailPanel({
  code,
  t,
  bookId,
  onDone,
  onCancel,
  onDuplicate
}) {
  var lang = t === T.zh ? 'zh' : 'vi';
  var [, force] = useState(0);
  var bk = (getBookings(code) || []).find(b => b && b.id === bookId);
  var [editing, setEditing] = useState(false);
  var [date, setDate] = useState(bk ? bkFmtDateInput(bk.datetime) : bkFmtDateInput());
  var [time, setTime] = useState(bk ? bkFmtTimeInput(bk.datetime) : '06:00');
  var [svc, setSvc] = useState((bk === null || bk === void 0 ? void 0 : bk.svc) || 'FB3');
  var [extra, setExtra] = useState((bk === null || bk === void 0 ? void 0 : bk.extra) || 0);
  var [note, setNote] = useState((bk === null || bk === void 0 ? void 0 : bk.note) || '');
  var [editParty, setEditParty] = useState(bk !== null && bk !== void 0 && bk.partyDetails ? JSON.parse(JSON.stringify(bk.partyDetails)) : []);
  var [delConfirm, setDelConfirm] = useState(false);
  var [confirmToast, setConfirmToast] = useState('');
  if (!bk) return React.createElement("p", {
    className: "text-gray-500"
  }, "—");
  var past = bk.datetime < Date.now();
  var confirmed = bk.confirmed;
  var fmtLogTime = ts => {
    var d = new Date(ts);
    return `${d.getFullYear()}/${bkPad(d.getMonth() + 1)}/${bkPad(d.getDate())} ${bkPad(d.getHours())}:${bkPad(d.getMinutes())}`;
  };
  var logMsg = l => {
    if (l.type === 'create') return t.logCreate;
    if (l.type === 'confirm') return t.logConfirm;
    if (l.type === 'unconfirm') return t.logUnconfirm || l.msg;
    if (l.type === 'change') return l.detail || t.logChange;
    if (l.type === 'conflict') return t.logConflict;
    return l.msg || '';
  };
  var saveEdit = () => {
    var [y, m, d] = date.split('-').map(Number);
    var [hh, mm] = time.split(':').map(Number);
    var newDt = new Date(y, m - 1, d, hh, mm).getTime();
    var changes = [];
    if (newDt !== bk.datetime) changes.push(bkFmtLogStr(t.timeChanged, [fmtLogTime(bk.datetime).slice(-5), time]));
    if (svc !== bk.svc || extra !== bk.extra) changes.push(bkFmtLogStr(t.svcChanged, [bookLabel(bk.svc, bk.extra), bookLabel(svc, extra)]));
    var detail = changes.length ? t.logChange + '：' + changes.join('、') : t.logChange;
    updateBooking(code, bookId, {
      datetime: newDt,
      svc,
      extra,
      note: note.trim(),
      partyDetails: editParty,
      confirmed: false,
      needReconfirm: true,
      confirmedTeachers: []
    }, {
      type: 'change',
      detail
    });
    setEditing(false);
    force(x => x + 1);
  };
  var fbUnconfirm = lang === 'zh' ? '取消與櫃台確認' : 'Hủy xác nhận với quầy';
  var fbUnconfirmAssigned = tc => lang === 'zh' ? `取消與指定老師${tc}確認` : `Hủy xác nhận với GV ${tc}`;
  var doConfirm = () => {
    confirmBooking(code, bookId);
    setConfirmToast(t.confirmedCounterToast);
    setTimeout(() => setConfirmToast(''), 3000);
    force(x => x + 1);
  };
  var doCancelConfirm = () => {
    var msg = t.logUnconfirm || fbUnconfirm;
    updateBooking(code, bookId, {
      confirmed: false
    }, {
      type: 'unconfirm',
      msg
    });
    setConfirmToast(t.cancelledCounterToast || msg);
    setTimeout(() => setConfirmToast(''), 3000);
    force(x => x + 1);
  };
  var assignedTeachers = bk && bk.partyDetails ? bk.partyDetails.filter(p => p && p.assignMode === 'assign' && p.teacher && p.teacher.trim()).map(p => p.teacher.trim()) : [];
  var doToggleAssigned = tc => {
    var cur = (bk.confirmedTeachers || []).slice();
    var i = cur.indexOf(tc);
    var wasOn = i >= 0;
    if (wasOn) {
      cur.splice(i, 1);
    } else {
      cur.push(tc);
    }
    var msg = wasOn ? bkFmtLogStr(t.logUnconfirmAssigned, [tc]) || fbUnconfirmAssigned(tc) : bkFmtLogStr(t.logConfirmAssigned, [tc]) || bkFmtLogStr('與指定老師{0}確認', [tc]);
    updateBooking(code, bookId, {
      confirmedTeachers: cur
    }, {
      type: wasOn ? 'unconfirmAssigned' : 'confirmAssigned',
      msg
    });
    setConfirmToast(wasOn ? msg : t.confirmedTeacherToast ? bkFmtLogStr(t.confirmedTeacherToast, [cur.length, assignedTeachers.length]) : msg);
    setTimeout(() => setConfirmToast(''), 3000);
    force(x => x + 1);
  };
  var ro = !editing;
  return React.createElement("div", {
    className: "space-y-4 fi"
  }, React.createElement("div", {
    className: "flex items-center gap-3"
  }, React.createElement("button", {
    onClick: onCancel,
    className: "text-gray-500"
  }, React.createElement("svg", {
    className: "w-6 h-6",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M15 19l-7-7 7-7"
  }))), React.createElement("h2", {
    className: "text-lg font-bold text-gray-100"
  }, bk.custName || '—', " ", bookTitleName(bk.custTitle, lang)), (() => {
    if (bk.confirmed) return React.createElement("span", {
      className: "text-[11px] text-emerald-400 ml-auto"
    }, "✓ ", t.statusConfirmed);
    if (bk.needReconfirm) return React.createElement("span", {
      className: "text-[11px] text-red-400 ml-auto"
    }, t.statusReconfirm);
    return React.createElement("span", {
      className: "text-[11px] text-gray-500 ml-auto"
    }, t.statusUnconfirmed);
  })()), past && React.createElement("button", {
    onClick: () => onDuplicate(bk),
    className: "w-full py-2.5 rounded-xl bg-amber-600/15 border border-amber-500/25 text-amber-400 text-sm font-semibold active:bg-amber-600/25"
  }, "↻ ", t.duplicateBtn), React.createElement("div", {
    className: `space-y-4 rounded-2xl p-4 border ${ro ? 'bg-white/[0.01] border-white/[0.04]' : 'bg-white/[0.02] border-white/[0.06]'}`
  }, React.createElement("div", {
    className: "flex"
  }, React.createElement("div", {
    style: {
      flexBasis: '35%'
    }
  }, React.createElement("label", {
    className: "text-xs text-gray-500 mb-1.5 block"
  }, t.bookDate), React.createElement("input", {
    type: "date",
    disabled: ro,
    value: date,
    onChange: e => setDate(e.target.value),
    className: `w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 ${ro ? 'opacity-50' : ''}`
  })), React.createElement("div", {
    style: {
      flexBasis: '5%'
    }
  }), React.createElement("div", {
    style: {
      flexBasis: '15%'
    }
  }, React.createElement("label", {
    className: "text-xs text-gray-500 mb-1.5 block"
  }, t.bookTime), React.createElement("input", {
    type: "time",
    step: "600",
    disabled: ro,
    value: time,
    onChange: e => setTime(e.target.value),
    className: `w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 ${ro ? 'opacity-50' : ''}`
  })), React.createElement("div", {
    style: {
      flexBasis: '5%'
    }
  })), React.createElement("div", {
    className: "grid grid-cols-2 gap-4"
  }, React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-500 mb-1.5 block"
  }, t.svcLabel), React.createElement("select", {
    disabled: ro,
    value: svc,
    onChange: e => setSvc(e.target.value),
    className: `w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 ${ro ? 'opacity-50' : ''}`
  }, SERVICES.map(s => React.createElement("option", {
    key: s.code,
    value: s.code
  }, s.code, "（", s.min, lang === 'zh' ? '分' : 'p', "）")))), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-500 mb-1.5 block"
  }, t.addHour), React.createElement("select", {
    disabled: ro,
    value: extra,
    onChange: e => setExtra(parseInt(e.target.value)),
    className: `w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 ${ro ? 'opacity-50' : ''}`
  }, [0, 1, 2, 3, 4, 5, 6, 7, 8].map(n => React.createElement("option", {
    key: n,
    value: n
  }, "+", n))))), React.createElement("p", {
    className: "text-xs text-gray-500"
  }, bookLabel(svc, extra), " = ", bookUnits(svc, extra), " ", t.units, " · ", bookMinutes(svc, extra), lang === 'zh' ? '分' : 'p'), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-500 mb-1.5 block"
  }, t.custNote), React.createElement("textarea", {
    disabled: ro,
    value: note,
    onChange: e => setNote(e.target.value),
    rows: 2,
    className: `w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 resize-none ${ro ? 'opacity-50' : ''}`
  })), bk.party > 0 && React.createElement("div", {
    className: "space-y-2"
  }, React.createElement("p", {
    className: "text-xs text-gray-500"
  }, t.party, "：", t.totalPeople, bk.party + 1, t.peopleUnit), (editing ? editParty : bk.partyDetails || []).map((pd, i) => {
    if (!pd) return null;
    var condList = [];
    if (pd.conds) {
      if (pd.conds.male) condList.push(t.assignMale);
      if (pd.conds.female) condList.push(t.assignFemale);
      if (pd.conds.tw) condList.push(t.assignTW);
      if (pd.conds.vn) condList.push(t.assignVN);
    }
    return React.createElement("div", {
      key: i,
      className: "bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2 text-xs"
    }, React.createElement("span", {
      className: "text-amber-400 font-semibold"
    }, t.partyMember, i + 1, t.partyUnit), editing ? React.createElement("select", {
      value: pd.svc,
      onChange: e => {
        var np = [...editParty];
        np[i] = {
          ...np[i],
          svc: e.target.value
        };
        setEditParty(np);
      },
      className: "ml-2 bg-white/[0.06] border border-white/[0.08] rounded px-2 py-1 text-xs text-gray-100 focus:outline-none focus:border-amber-500"
    }, SERVICES.map(s => React.createElement("option", {
      key: s.code,
      value: s.code
    }, s.code, "（", s.min, "分）"))) : React.createElement("span", {
      className: "text-emerald-400 ml-2 font-bold"
    }, pd.svc), pd.assignMode === 'assign' && pd.teacher && React.createElement("span", {
      className: "text-amber-300 ml-2"
    }, t.assignTeacher, " ", pd.teacher), condList.length > 0 && React.createElement("span", {
      className: "text-amber-300 ml-2"
    }, condList.join('/')), pd.oil && React.createElement("span", {
      className: "text-purple-300 ml-2"
    }, t.assignOil), pd.note && React.createElement("span", {
      className: "text-gray-400 ml-2"
    }, "· ", pd.note));
  }))), editing ? React.createElement("div", {
    className: "flex gap-2"
  }, React.createElement("button", {
    onClick: () => setEditing(false),
    className: "flex-1 py-3 bg-white/[0.04] rounded-xl text-gray-400 font-medium"
  }, t.bookCancel), React.createElement("button", {
    onClick: saveEdit,
    className: "flex-1 py-3 bg-amber-600 rounded-xl text-white font-bold"
  }, t.saveChange)) : React.createElement("div", {
    className: "space-y-2"
  }, React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, React.createElement("button", {
    onClick: () => setEditing(true),
    className: "py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-gray-300 font-medium"
  }, t.editBtn), delConfirm ? React.createElement("button", {
    onClick: () => {
      deleteBooking(code, bookId);
      onDone();
    },
    className: "py-3 bg-red-500 rounded-xl text-white font-bold"
  }, t.bookDeleteConfirm2 || '確定刪除') : React.createElement("button", {
    onClick: () => {
      setDelConfirm(true);
      setTimeout(() => setDelConfirm(false), 3000);
    },
    className: "py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-medium"
  }, t.bookDelete)), React.createElement("p", {
    className: "text-xs text-gray-500 text-center py-0.5"
  }, t.bookConfirmStatusLabel || (lang === 'zh' ? '自約確認情形' : 'Tình trạng xác nhận lịch hẹn')), React.createElement("div", {
    className: "space-y-2"
  }, assignedTeachers.length > 0 ? assignedTeachers.map((tc, idx) => {
    var done = (bk.confirmedTeachers || []).includes(tc);
    return React.createElement("div", {
      key: idx,
      className: "flex items-center justify-between rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5"
    }, React.createElement("span", {
      className: "text-xs text-gray-300 font-medium"
    }, tc), React.createElement("button", {
      onClick: () => doToggleAssigned(tc),
      className: `relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${done ? 'bg-emerald-500' : 'bg-gray-600'}`
    }, React.createElement("span", {
      className: `absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${done ? 'translate-x-5' : 'translate-x-0'}`
    })));
  }) : React.createElement("div", {
    className: "flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/[0.04] px-3 py-2.5 opacity-50"
  }, React.createElement("span", {
    className: "text-xs text-gray-600 font-medium"
  }, t.confirmWithAssigned), React.createElement("span", {
    className: "relative w-11 h-6 rounded-full bg-gray-700 flex-shrink-0"
  }, React.createElement("span", {
    className: "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-gray-500"
  }))), React.createElement("div", {
    className: "flex items-center justify-between rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5"
  }, React.createElement("span", {
    className: "text-xs text-gray-300 font-medium"
  }, t.confirmWithCounter), React.createElement("button", {
    onClick: confirmed ? doCancelConfirm : doConfirm,
    className: `relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 ${confirmed ? 'bg-emerald-500' : 'bg-gray-600'}`
  }, React.createElement("span", {
    className: `absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${confirmed ? 'translate-x-5' : 'translate-x-0'}`
  })))), confirmToast && React.createElement("p", {
    className: "text-sm text-center text-red-400 font-semibold fi"
  }, "✓ ", confirmToast)), bk.logs && bk.logs.length > 0 && React.createElement("div", {
    className: "pt-2"
  }, React.createElement("h3", {
    className: "text-sm font-semibold text-gray-400 mb-3"
  }, t.bookLogTitle), React.createElement("div", {
    className: "space-y-0"
  }, bk.logs.slice().reverse().map((l, i) => React.createElement("div", {
    key: i,
    className: "flex gap-3 pb-3 relative"
  }, React.createElement("div", {
    className: "flex flex-col items-center"
  }, React.createElement("div", {
    className: "w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"
  }), i < bk.logs.length - 1 && React.createElement("div", {
    className: "w-px flex-1 bg-white/[0.1] my-1"
  })), React.createElement("div", {
    className: "flex-1 -mt-0.5"
  }, React.createElement("p", {
    className: "text-[11px] text-gray-500 font-mono"
  }, fmtLogTime(l.ts)), React.createElement("p", {
    className: "text-sm text-gray-300"
  }, logMsg(l))))))));
}
function BookingSection({
  code,
  t
}) {
  var [mode, setMode] = useState('list');
  var [openId, setOpenId] = useState(null);
  var [dupInit, setDupInit] = useState(null);
  var [refresh, setRefresh] = useState(0);
  var toNew = fromBk => {
    setDupInit(fromBk ? {
      custName: fromBk.custName,
      custTitle: fromBk.custTitle,
      custPhone: fromBk.custPhone,
      svc: fromBk.svc,
      extra: fromBk.extra,
      party: fromBk.party,
      partyDetails: fromBk.partyDetails,
      note: fromBk.note
    } : null);
    setMode('new');
  };
  return React.createElement("div", {
    className: "space-y-3"
  }, mode === 'list' && React.createElement(React.Fragment, null, React.createElement(BookingListPanel, {
    code: code,
    t: t,
    refresh: refresh,
    onOpen: id => {
      setOpenId(id);
      setMode('detail');
    },
    onDuplicate: toNew
  }), React.createElement("div", {
    className: "sticky bottom-0 z-10 -mx-4 px-4 pt-3 pb-4 bg-gray-950 border-t border-white/[0.08]"
  }, React.createElement("button", {
    onClick: () => toNew(null),
    className: "w-full h-[54px] rounded-2xl bg-amber-400 text-gray-950 text-[17px] font-bold active:opacity-85"
  }, "+ ", t.bookingNew))), mode === 'new' && React.createElement(BookingFormPanel, {
    code: code,
    t: t,
    initial: dupInit,
    onSave: () => {
      setMode('list');
      setDupInit(null);
      setRefresh(x => x + 1);
    },
    onCancel: () => {
      setMode('list');
      setDupInit(null);
    }
  }), mode === 'detail' && React.createElement(BookingDetailPanel, {
    code: code,
    t: t,
    bookId: openId,
    onDone: () => {
      setMode('list');
      setRefresh(x => x + 1);
    },
    onCancel: () => {
      setMode('list');
      setRefresh(x => x + 1);
    },
    onDuplicate: toNew
  }));
}