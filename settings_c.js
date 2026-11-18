/*BUILD c=settings_c.js v=1.13-081 src=dev/settings.js h=d6a287a3 t=2026-11-19 02:32*/
var {
  useState,
  useEffect,
  useCallback,
  useMemo
} = React;
var {
  SkReveal
} = window.MP;
var {
  normEmail,
  isValidEmail,
  doEmailBackupNow,
  gasAnalyze,
  gasAddNotice,
  gasEditNotice,
  noticeSummary,
  noticeTitle,
  getNoticeReadCount,
  getNoticeShow,
  getNoticeListText,
  getNoticeCountType,
  getNoticeMainCats,
  getNoticesLocal,
  fetchNotices,
  gasVerifyKey,
  gasLeaveTeacher,
  gasSubmitAction,
  gasCheckAction,
  gasBlacklistSubmit,
  gasBlacklistCheck,
  gasBlacklistApprove,
  gasBlacklistSearch,
  gasBackupSubmit,
  gasBackupCheck,
  gasBackupFetch,
  gasDebugEcho,
  HIDE_COMPANY_FEATURES,
  INDEX_LIFF_ID,
  getMyLineUserId,
  setMyLineUserId,
  clearMyLineUserId,
  getLineLogoutFlag,
  setLineLogoutFlag,
  clearLineLogoutFlag,
  gasToggleNoticeStatus,
  gasSubmitSuggestion,
  gasListSuggestions,
  gasPushNoticeFlexToMe,
  getMyKey,
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
  gasSetInitialPwd,
  encWithKey,
  decWithKey,
  actKey,
  genActWithToken,
  verifyActToken,
  genReqCode,
  parseReqCode,
  decReqCode,
  identifyReqCode,
  buildReqLink,
  sendTicketFlex,
  parseReqHash,
  genConnReq,
  parseConnReq,
  genSupReq,
  parseSupReq,
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
  checkApproved,
  writeApproval,
  loadStores,
  saveStores,
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
  eMon,
  newSlip,
  slipSvcLabel,
  SERVICES,
  PRESS_LEVELS,
  BODY_PARTS,
  CLIENT_REQS,
  custKey,
  loadCustDB,
  getCust,
  upsertCust,
  getGasUrl,
  setGasUrl,
  gasCall,
  hasMyKey,
  issueKey,
  claimMyKey,
  deleteCust,
  searchCustDB,
  recentCust,
  custLastSlip,
  slipStartTime,
  loadTagHistory,
  addTagHistory,
  visitStats,
  collectSlips,
  collectAllSlips,
  tagStats,
  searchSlips,
  personalChartStats,
  bookTitleName,
  BOOK_TITLES,
  fetchAcupoints,
  clearAcupointsCache,
  checkCredentialValid,
  encMonth,
  decBackup,
  dataMonthRange,
  encRange,
  decRange,
  makePersonalBackup,
  parsePersonalBackup,
  restorePersonalBackup,
  TW_REGIONS,
  LANG_SCHOOLS,
  T
} = window.MP;
var {
  bindClaimNow = async () => ({
    ok: false
  }),
  bindVerify = async () => 'error',
  readUnboundNotice = () => null,
  clearUnboundNotice = () => {},
  localHasPersonalData = () => true,
  backupUploadAllowed = () => true
} = window.MP;
function fmtSyncTime(iso) {
  try {
    var d = new Date(iso);
    var p = n => String(n).padStart(2, "0");
    return d.getFullYear() + "/" + p(d.getMonth() + 1) + "/" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  } catch (_e) {
    return "";
  }
}
function ChartPage({
  t,
  settings,
  onClose
}) {
  var [sub, setSub] = useState('heat');
  var SUBS = [['heat', t.chartTabHeat], ['weekday', t.chartTabWeekday], ['extra', t.chartTabExtra]];
  var year = settings.year || new Date().getFullYear();
  var allSlips = useMemo(() => collectAllSlips(settings.code, year), [settings.code, year]);
  var stats = useMemo(() => personalChartStats(allSlips.map(s => ({
    time: s.startTime,
    units: s.units
  }))), [allSlips]);
  var WD_ZH = ['日', '一', '二', '三', '四', '五', '六'];
  var WD_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  var WD = t === T.zh ? WD_ZH : WD_VI;
  var noData = stats.totalSlips === 0 && stats.curWeek.slips === 0;
  var heatView = () => {
    var hours = stats.hourOrder || [];
    if (hours.length === 0) return React.createElement("p", {
      className: "text-sm text-gray-500 text-center py-8"
    }, t.chartNoSlipData);
    var max = Math.max(1, ...stats.heat.flat());
    var order = [1, 2, 3, 4, 5, 6, 0];
    return React.createElement("div", {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.chartHeatDesc), React.createElement("div", {
      className: "overflow-x-auto"
    }, React.createElement("div", {
      style: {
        display: 'inline-block'
      }
    }, React.createElement("div", {
      className: "flex gap-[2px] pl-6 mb-1"
    }, hours.map(h => React.createElement("span", {
      key: h,
      className: "text-[9px] text-gray-600 tabular-nums",
      style: {
        width: 16,
        textAlign: 'center'
      }
    }, h))), order.map(wd => React.createElement("div", {
      key: wd,
      className: "flex items-center gap-[2px] mb-[2px]"
    }, React.createElement("span", {
      className: "text-[10px] text-gray-500 w-5 text-right pr-1"
    }, WD[wd]), hours.map(h => {
      var v = stats.heat[wd][h] || 0;
      var ratio = v / max;
      var bg = v === 0 ? 'rgba(255,255,255,0.03)' : `rgba(217,119,6,${0.15 + ratio * 0.75})`;
      return React.createElement("div", {
        key: h,
        title: `${WD[wd]} ${h}:00 — ${v}`,
        style: {
          width: 16,
          height: 16,
          background: bg,
          borderRadius: 3
        }
      });
    }))))), stats.curWeek.slips > 0 && React.createElement("p", {
      className: "text-xs text-amber-400/90 pt-1"
    }, (t.chartCurWeekNote || '').replace('{0}', stats.curWeek.slips)));
  };
  var weekdayView = () => {
    var max = Math.max(1, ...stats.weekdayTotals);
    var order = [1, 2, 3, 4, 5, 6, 0];
    var total = stats.weekdayTotals.reduce((a, b) => a + b, 0);
    if (total === 0) return React.createElement("p", {
      className: "text-sm text-gray-500 text-center py-8"
    }, t.chartNoSlipData);
    return React.createElement("div", {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.chartWeekdayDesc), React.createElement("div", {
      className: "space-y-1.5"
    }, order.map(wd => {
      var v = stats.weekdayTotals[wd] || 0;
      return React.createElement("div", {
        key: wd,
        className: "flex items-center gap-2"
      }, React.createElement("span", {
        className: "text-[11px] text-gray-500 w-5 text-right"
      }, WD[wd]), React.createElement("div", {
        className: "flex-1 h-4 bg-white/[0.03] rounded-sm overflow-hidden"
      }, React.createElement("div", {
        className: "h-full rounded-sm",
        style: {
          width: v / max * 100 + '%',
          background: '#D97706'
        }
      })), React.createElement("span", {
        className: "text-[10px] tabular-nums w-6 text-gray-500"
      }, v || ''));
    })), stats.curWeek.slips > 0 && React.createElement("p", {
      className: "text-xs text-amber-400/90 pt-1"
    }, (t.chartCurWeekNote || '').replace('{0}', stats.curWeek.slips)));
  };
  var extraView = () => {
    var keys = ['2', '3', '4', '5+'];
    var vals = keys.map(k => stats.extraDist[k] || 0);
    var max = Math.max(1, ...vals);
    var total = vals.reduce((a, b) => a + b, 0);
    return React.createElement("div", {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.chartExtraDesc), total === 0 ? React.createElement("p", {
      className: "text-sm text-gray-500 text-center py-6"
    }, t.chartNoSlipData) : React.createElement("div", {
      className: "space-y-1.5"
    }, keys.map((k, i) => {
      var v = vals[i];
      return React.createElement("div", {
        key: k,
        className: "flex items-center gap-2"
      }, React.createElement("span", {
        className: "text-[11px] text-gray-500 w-8 text-right"
      }, "+", k), React.createElement("div", {
        className: "flex-1 h-4 bg-white/[0.03] rounded-sm overflow-hidden"
      }, React.createElement("div", {
        className: "h-full rounded-sm",
        style: {
          width: v / max * 100 + '%',
          background: '#7C3AED'
        }
      })), React.createElement("span", {
        className: "text-[10px] tabular-nums w-10 text-gray-500"
      }, v ? `${v} ${t.chartExtraDaysUnit}` : ''));
    })), stats.curWeek.extraDays > 0 && React.createElement("p", {
      className: "text-xs text-amber-400/90 pt-1"
    }, (t.chartCurWeekNote || '').replace('{0}', stats.curWeek.slips)));
  };
  return React.createElement("div", {
    className: "fi space-y-4"
  }, React.createElement("div", {
    className: "sticky top-0 z-10 -mx-4 px-4 py-2.5 bg-gray-950 flex items-center justify-center"
  }, React.createElement("h2", {
    className: "text-lg font-bold text-gray-100"
  }, t.tabChart)), React.createElement("div", {
    className: "flex gap-1 bg-white/[0.03] rounded-lg p-1 overflow-x-auto"
  }, SUBS.map(([id, label]) => React.createElement("button", {
    key: id,
    onClick: () => setSub(id),
    className: `flex-1 whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-semibold ${sub === id ? 'bg-amber-600 text-white' : 'text-gray-500'}`
  }, label))), noData ? React.createElement("p", {
    className: "text-sm text-gray-500 text-center py-8"
  }, t.chartNoSlipData) : React.createElement("div", {
    className: "space-y-3"
  }, sub === 'heat' && heatView(), sub === 'weekday' && weekdayView(), sub === 'extra' && extraView(), React.createElement("p", {
    className: "text-[11px] text-gray-500 text-center"
  }, t.statTotal, " ", stats.totalSlips, " · ", t.chartUpdatedAt, "：", new Date(stats.updatedAt).toLocaleString('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })), React.createElement("p", {
    className: "text-[10px] text-gray-600 text-center"
  }, t.chartMockupHint)));
}
async function bindSyncCloud(uid, settings) {
  var year = settings.year || bizParts().y;
  var r = null;
  try {
    r = await gasBackupCheck(uid);
  } catch (_e) {}
  if (!r || !r.ok) return {
    status: 'error'
  };
  var has = localHasPersonalData(settings.code, year);
  if (!r.found) {
    if (has) {
      try {
        var obj = makePersonalBackup(settings.code, year);
        var pj = JSON.stringify({
          store: settings.store || '',
          gender: settings.gender || '',
          shift: settings.shift || '',
          workStart: settings.workStart || '',
          workEnd: settings.workEnd || ''
        });
        await gasBackupSubmit(uid, settings.code, year, JSON.stringify(obj), pj);
      } catch (_e) {}
    }
    return {
      status: 'uploaded'
    };
  }
  var pend = {
    uid: uid,
    year: r.year,
    updatedAt: r.updatedAt,
    cloudOnly: !has
  };
  try {
    localStorage.setItem('my-bind-pending', JSON.stringify(pend));
  } catch (_e) {}
  return {
    status: 'choose',
    pend: pend
  };
}
function maskEmail(em) {
  em = String(em || '');
  var i = em.indexOf('@');
  if (i < 1) return em ? em.charAt(0) + '***' : '';
  return em.charAt(0) + '***' + em.slice(i);
}
function BackupSection({
  settings,
  t,
  onUpdate,
  lineUserId
}) {
  var [cloudBusy, setCloudBusy] = useState(false);
  var [cloudMsg, setCloudMsg] = useState(null);
  var [emailInput, setEmailInput] = useState(settings.email || '');
  var [unb, setUnb] = useState(false);
  var [unbInput, setUnbInput] = useState('');
  var [emailMsg, setEmailMsg] = useState(null);
  var [emailBusy, setEmailBusy] = useState(false);
  var saveEmail = async () => {
    var em = normEmail(emailInput);
    if (em && !isValidEmail(em)) {
      setEmailMsg({
        ok: false,
        text: t.emailInvalid || 'Email 格式不正確'
      });
      return;
    }
    var updated = Object.assign({}, settings, {
      email: em
    });
    if (onUpdate) onUpdate(updated);
    if (!em) {
      setEmailMsg({
        ok: true,
        text: t.emailClearedMsg
      });
      return;
    }
    setEmailBusy(true);
    setEmailMsg(null);
    var r = await doEmailBackupNow(updated);
    setEmailBusy(false);
    setEmailMsg(r && r.ok ? {
      ok: true,
      text: t.emailSavedMsg
    } : {
      ok: false,
      text: (t.emailSavedFailMsg || '') + (r && r.error || '')
    });
  };
  var [cloudCheck, setCloudCheck] = useState(null);
  var [cloudConfirm, setCloudConfirm] = useState(false);
  var [cooldownUntil, setCooldownUntil] = useState(0);
  var [cooldownTick, setCooldownTick] = useState(0);
  useEffect(() => {
    if (!cooldownUntil) return;
    var iv = setInterval(() => setCooldownTick(x => x + 1), 1000);
    return () => clearInterval(iv);
  }, [cooldownUntil]);
  var cooldownLeft = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000)) : 0;
  var doCloudBackup = async () => {
    if (!lineUserId) {
      setCloudMsg({
        ok: false,
        text: t.lineLoginRequiredMsg || '請先用LINE登入才能使用雲端備份'
      });
      return;
    }
    if (!localHasPersonalData(settings.code, settings.year)) {
      setCloudMsg({
        ok: false,
        text: '這裡還沒有任何記錄，為避免覆蓋雲端原有備份，已取消備份'
      });
      return;
    }
    setCloudBusy(true);
    setCloudMsg(null);
    try {
      var obj = makePersonalBackup(settings.code, settings.year);
      var jsonStr = JSON.stringify(obj);
      var profileJson = JSON.stringify({
        store: settings.store || '',
        gender: settings.gender || '',
        shift: settings.shift || '',
        workStart: settings.workStart || '',
        workEnd: settings.workEnd || ''
      });
      var r = await gasBackupSubmit(lineUserId, settings.code, settings.year, jsonStr, profileJson);
      if (r && r.ok) {
        setCloudMsg({
          ok: true,
          text: t.cloudBackedUpMsg.replace('{0}', settings.year)
        });
        setCooldownUntil(Date.now() + 60000);
      } else setCloudMsg({
        ok: false,
        text: r && r.error || '備份失敗'
      });
    } catch (e) {
      setCloudMsg({
        ok: false,
        text: String(e)
      });
    }
    setCloudBusy(false);
  };
  var [debugResult, setDebugResult] = useState(null);
  var [debugBusy, setDebugBusy] = useState(false);
  var doDebugEcho = async () => {
    if (!lineUserId) {
      setDebugResult({
        ok: false,
        error: '請先登入LINE'
      });
      return;
    }
    setDebugBusy(true);
    setDebugResult(null);
    try {
      var obj = makePersonalBackup(settings.code, settings.year);
      var jsonStr = JSON.stringify(obj);
      var r = await gasDebugEcho({
        lineUserId: lineUserId,
        code: settings.code,
        year: settings.year,
        jsonData: jsonStr
      });
      setDebugResult(r);
    } catch (e) {
      setDebugResult({
        ok: false,
        error: String(e)
      });
    }
    setDebugBusy(false);
  };
  var doCloudCheck = async () => {
    if (!lineUserId) {
      setCloudMsg({
        ok: false,
        text: t.lineLoginRequiredMsg || '請先用LINE登入才能使用雲端備份'
      });
      return;
    }
    if (cooldownLeft > 0) return;
    setCloudBusy(true);
    setCloudMsg(null);
    setCloudConfirm(false);
    try {
      var r = await gasBackupCheck(lineUserId);
      if (r && r.ok) setCloudCheck(r);else setCloudMsg({
        ok: false,
        text: r && r.error || '查詢失敗'
      });
    } catch (e) {
      setCloudMsg({
        ok: false,
        text: String(e)
      });
    }
    setCloudBusy(false);
  };
  var doCloudRestore = async () => {
    if (!lineUserId) {
      setCloudMsg({
        ok: false,
        text: t.lineLoginRequiredMsg || '請先用LINE登入才能使用雲端備份'
      });
      return;
    }
    setCloudBusy(true);
    setCloudMsg(null);
    try {
      var r = await gasBackupFetch(lineUserId);
      if (r && r.ok) {
        var obj;
        try {
          obj = JSON.parse(r.jsonData);
        } catch (_e) {
          setCloudMsg({
            ok: false,
            text: '備份內容毀損'
          });
          setCloudBusy(false);
          return;
        }
        var parsed = parsePersonalBackup(obj);
        if (!parsed.ok) {
          var map = {
            notBackup: t.jsonNotBackup,
            broken: t.jsonBroken,
            modified: t.jsonModified
          };
          setCloudMsg({
            ok: false,
            text: map[parsed.reason] || t.jsonBroken
          });
          setCloudBusy(false);
          return;
        }
        restorePersonalBackup(parsed);
        setCloudMsg({
          ok: true,
          text: '✓ 已還原，重新整理頁面套用'
        });
        setTimeout(() => location.reload(), 1200);
      } else {
        setCloudMsg({
          ok: false,
          text: r && r.error || '還原失敗'
        });
      }
    } catch (e) {
      setCloudMsg({
        ok: false,
        text: String(e)
      });
    }
    setCloudBusy(false);
  };
  var doJsonExport = async () => {
    try {
      var obj = makePersonalBackup(settings.code, settings.year);
      var jsonStr = JSON.stringify(obj, null, 2);
      var today = new Date();
      var dateStr = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
      var fileName = `備份_${settings.code}_${settings.year}_${dateStr}.json`;
      try {
        var file = new File([jsonStr], fileName, {
          type: 'application/json'
        });
        if (navigator.canShare && navigator.canShare({
          files: [file]
        })) {
          await navigator.share({
            files: [file],
            title: fileName
          });
          setCloudMsg({
            ok: true,
            text: t.jsonExportOk || '已匯出JSON檔案'
          });
          return;
        }
      } catch (shareErr) {
        if (shareErr && shareErr.name === 'AbortError') return;
      }
      var blob = new Blob([jsonStr], {
        type: 'application/json'
      });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setCloudMsg({
        ok: true,
        text: t.jsonExportOk || '已匯出JSON檔案'
      });
    } catch (e) {
      setCloudMsg({
        ok: false,
        text: t.jsonExportFail || '匯出失敗'
      });
    }
  };
  var [importBusy, setImportBusy] = useState(false);
  var doImportFile = async file => {
    if (!file) return;
    setImportBusy(true);
    setCloudMsg(null);
    try {
      var text = await file.text();
      var obj = JSON.parse(text);
      var parsed = parsePersonalBackup(obj);
      if (!parsed.ok) {
        var map = {
          notBackup: t.jsonNotBackup,
          broken: t.jsonBroken,
          modified: t.jsonModified
        };
        setCloudMsg({
          ok: false,
          text: map[parsed.reason] || t.jsonBroken
        });
        setImportBusy(false);
        return;
      }
      restorePersonalBackup(parsed);
      setCloudMsg({
        ok: true,
        text: '✓ 已還原，重新整理頁面套用'
      });
      setTimeout(() => location.reload(), 1200);
    } catch (_e) {
      setCloudMsg({
        ok: false,
        text: t.jsonBroken
      });
      setImportBusy(false);
    }
  };
  var zh = t === T.zh;
  var Pill = ({
    on,
    children
  }) => React.createElement("span", {
    className: `text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${on ? 'bg-emerald-500/15 text-emerald-400' : 'border border-white/[0.15] text-gray-300'}`
  }, children);
  var Head = ({
    n,
    title,
    pill
  }) => React.createElement("div", {
    className: "flex items-center gap-2.5 mb-2"
  }, React.createElement("span", {
    className: "w-[26px] h-[26px] rounded-full bg-amber-400 text-gray-950 text-sm font-extrabold flex items-center justify-center flex-shrink-0"
  }, n), React.createElement("h4", {
    className: "flex-1 text-lg font-bold text-gray-100"
  }, title), pill);
  var emailOn = !!(settings && settings.email);
  return React.createElement("div", {
    className: "pt-2 pb-4"
  }, React.createElement("p", {
    className: "text-sm text-gray-400 leading-relaxed pb-3"
  }, zh ? '三種備份方式，可以同時使用。換手機時任一種都能還原。' : 'Ba cách sao lưu, có thể dùng cùng lúc. Khi đổi điện thoại, cách nào cũng khôi phục được.'), React.createElement("section", {
    className: "border-t border-white/[0.1] py-5"
  }, React.createElement(Head, {
    n: "1",
    title: zh ? 'LINE 自動備份' : 'Sao lưu LINE tự động',
    pill: React.createElement(Pill, {
      on: !!lineUserId
    }, lineUserId ? zh ? '✓ 已開啟' : '✓ Đã bật' : zh ? '未開啟' : 'Chưa bật')
  }), React.createElement("p", {
    className: "text-sm text-gray-400 leading-relaxed"
  }, lineUserId ? t.cloudAutoBackupActiveMsg || t.cloudBackupDesc : zh ? '用 LINE 登入後，每天第一次開啟 App 會自動備份到雲端，換手機後登入就能還原。目前本裝置尚未用 LINE 登入。' : 'Sau khi đăng nhập LINE, mỗi ngày lần mở đầu tiên sẽ tự động sao lưu lên đám mây. Thiết bị này chưa đăng nhập LINE.'), lineUserId && cloudMsg && React.createElement("p", {
    className: `mt-2 text-sm ${cloudMsg.ok ? 'text-emerald-400' : 'text-red-400'}`
  }, cloudMsg.text)), React.createElement("section", {
    className: "border-t border-white/[0.1] py-5"
  }, React.createElement(Head, {
    n: "2",
    title: t.emailBackupTitle || 'Email 雲端備份',
    pill: React.createElement(Pill, {
      on: emailOn
    }, emailOn ? zh ? '✓ 已設定' : '✓ Đã đặt' : zh ? '未設定' : 'Chưa đặt')
  }), React.createElement("p", {
    className: "text-sm text-gray-400 leading-relaxed"
  }, t.emailBackupDesc), emailOn ? React.createElement(React.Fragment, null, React.createElement("div", {
    className: "mt-3 flex items-center gap-2 min-h-[48px] px-3.5 rounded-xl bg-white/[0.06] border border-white/[0.1]"
  }, React.createElement("span", {
    className: "text-sm text-gray-400"
  }, zh ? '已綁定' : 'Đã liên kết'), React.createElement("b", {
    className: "text-base text-gray-100 tracking-wide"
  }, maskEmail(settings.email))), unb ? React.createElement("div", {
    className: "mt-3 space-y-2.5"
  }, React.createElement("p", {
    className: "text-sm text-gray-300"
  }, zh ? '請輸入原本綁定的 Email 確認：' : 'Nhập Email đã liên kết để xác nhận:'), React.createElement("input", {
    type: "email",
    inputMode: "email",
    autoComplete: "off",
    autoCapitalize: "none",
    value: unbInput,
    onChange: e => {
      setUnbInput(e.target.value);
      setEmailMsg(null);
    },
    placeholder: "name@example.com",
    className: "w-full h-12 bg-white/[0.06] border border-white/[0.1] rounded-xl px-3.5 text-base text-gray-100 focus:outline-none focus:border-amber-400"
  }), React.createElement("div", {
    className: "grid grid-cols-2 gap-2.5"
  }, React.createElement("button", {
    onClick: () => {
      setUnb(false);
      setUnbInput('');
      setEmailMsg(null);
    },
    className: "h-12 rounded-xl border border-white/[0.2] text-gray-200 text-[15px] font-bold"
  }, zh ? '返回' : 'Quay lại'), React.createElement("button", {
    onClick: () => {
      if (normEmail(unbInput) !== normEmail(settings.email)) {
        setEmailMsg({
          ok: false,
          text: zh ? 'Email 不正確，請輸入原本綁定的 Email' : 'Email không đúng'
        });
        return;
      }
      if (onUpdate) onUpdate(Object.assign({}, settings, {
        email: ''
      }));
      setUnb(false);
      setUnbInput('');
      setEmailInput('');
      setEmailMsg({
        ok: true,
        text: zh ? '已取消綁定，之後不會再自動備份到這個 Email。' : 'Đã hủy liên kết.'
      });
    },
    className: "h-12 rounded-xl bg-red-500 text-white text-[15px] font-bold"
  }, zh ? '確認取消綁定' : 'Xác nhận hủy'))) : React.createElement("button", {
    onClick: () => {
      setUnb(true);
      setEmailMsg(null);
    },
    className: "mt-3 w-full h-12 rounded-xl border border-red-400/60 text-red-400 text-[15px] font-bold"
  }, zh ? '取消綁定' : 'Hủy liên kết'), emailMsg && React.createElement("p", {
    className: `mt-2 text-sm ${emailMsg.ok ? 'text-emerald-400' : 'text-red-400'}`
  }, emailMsg.text)) : React.createElement(React.Fragment, null, React.createElement("input", {
    type: "email",
    inputMode: "email",
    autoComplete: "email",
    autoCapitalize: "none",
    value: emailInput,
    onChange: e => {
      setEmailInput(e.target.value);
      setEmailMsg(null);
    },
    placeholder: "name@example.com",
    className: "mt-3 w-full h-12 bg-white/[0.06] border border-white/[0.1] rounded-xl px-3.5 text-base text-gray-100 focus:outline-none focus:border-amber-400"
  }), emailMsg && React.createElement("p", {
    className: `mt-2 text-sm ${emailMsg.ok ? 'text-emerald-400' : 'text-red-400'}`
  }, emailMsg.text), React.createElement("button", {
    onClick: () => {
      if (!normEmail(emailInput)) {
        setEmailMsg({
          ok: false,
          text: t.emailInvalid || 'Email 格式不正確'
        });
        return;
      }
      saveEmail();
    },
    disabled: emailBusy,
    className: "mt-3 w-full h-12 rounded-xl bg-amber-400 text-gray-950 text-[15px] font-bold disabled:opacity-60 active:opacity-85"
  }, emailBusy ? '…' : zh ? '綁定 Email' : 'Liên kết Email')), React.createElement("p", {
    className: "mt-3 text-[13px] text-amber-300 leading-relaxed"
  }, t.emailPrivacy)), React.createElement("section", {
    className: "border-t border-white/[0.1] py-5"
  }, React.createElement(Head, {
    n: "3",
    title: zh ? '手動匯出／匯入' : 'Xuất / nhập thủ công',
    pill: React.createElement(Pill, {
      on: false
    }, zh ? '自己保管' : 'Tự lưu')
  }), React.createElement("p", {
    className: "text-sm text-gray-400 leading-relaxed"
  }, t.jsonExportDesc || '下載一份本年度資料的JSON檔案，自行保存在手機或電腦，不上傳雲端。'), React.createElement("div", {
    className: "grid grid-cols-2 gap-2.5 mt-3"
  }, React.createElement("button", {
    onClick: doJsonExport,
    className: "h-12 rounded-xl border border-white/[0.15] text-gray-100 text-[15px] font-semibold active:bg-white/[0.08]"
  }, zh ? '匯出備份檔' : t.jsonExportBtn || 'Xuất'), React.createElement("label", {
    className: "h-12 rounded-xl border border-white/[0.15] text-gray-100 text-[15px] font-semibold flex items-center justify-center cursor-pointer active:bg-white/[0.08]"
  }, importBusy ? t.restoreImporting || '處理中…' : zh ? '匯入備份檔' : t.restoreImportBtn || 'Nhập', React.createElement("input", {
    type: "file",
    accept: ".json,application/json",
    className: "hidden",
    disabled: importBusy,
    onChange: e => {
      var f = e.target.files && e.target.files[0];
      doImportFile(f);
      e.target.value = '';
    }
  }))), !lineUserId && cloudMsg && React.createElement("p", {
    className: `mt-2 text-sm ${cloudMsg.ok ? 'text-emerald-400' : 'text-red-400'}`
  }, cloudMsg.text)), lineUserId && React.createElement("details", {
    className: "border-t border-white/[0.1] pt-3"
  }, React.createElement("summary", {
    className: "min-h-[44px] flex items-center justify-between text-[15px] text-gray-300 cursor-pointer list-none"
  }, React.createElement("span", null, zh ? '疑難排解' : 'Khắc phục sự cố', React.createElement("span", {
    className: "block text-[13px] text-gray-500"
  }, zh ? '暫時性除錯工具，排查完問題後會移除' : 'Công cụ gỡ lỗi tạm thời')), React.createElement("span", {
    className: "text-gray-500"
  }, "›")), React.createElement("div", {
    className: "pt-2 space-y-2"
  }, React.createElement("button", {
    onClick: doDebugEcho,
    disabled: debugBusy,
    className: "w-full h-11 rounded-xl border border-white/[0.12] text-gray-300 text-sm disabled:opacity-50"
  }, debugBusy ? '檢查中…' : '除錯：檢查GAS實際收到什麼'), debugResult && React.createElement("pre", {
    className: "bg-black/40 rounded-lg p-2 text-[11px] text-gray-300 overflow-x-auto whitespace-pre-wrap break-all"
  }, JSON.stringify(debugResult, null, 2)))));
}
function CustomerPage({
  t,
  settings,
  onClose
}) {
  var [mode, setMode] = useState('search');
  var [openTag, setOpenTag] = useState(null);
  var [openHistory, setOpenHistory] = useState(null);
  var [q, setQ] = useState('');
  var [editCust, setEditCust] = useState(null);
  var [delConfirm, setDelConfirm] = useState(false);
  var [blSubmitting, setBlSubmitting] = useState(null);
  var blSubKey = 'bl-submitted-' + settings.code;
  var [blSubmitted, setBlSubmittedRaw] = useState(() => {
    try {
      return LS.get(blSubKey) || {};
    } catch (_e) {
      return {};
    }
  });
  var setBlSubmitted = updater => {
    setBlSubmittedRaw(prev => {
      var next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        LS.set(blSubKey, next);
      } catch (_e) {}
      return next;
    });
  };
  var [blCheckBusy, setBlCheckBusy] = useState(null);
  var year = settings.year || new Date().getFullYear();
  var custList = useMemo(() => {
    return (q || '').trim() ? searchCustDB(settings.code, q) : recentCust(settings.code, 10);
  }, [q, settings.code, mode, editCust]);
  var saveCust = () => {
    if (!editCust) return;
    upsertCust(settings.code, editCust);
    setEditCust(null);
  };
  var allSlips = useMemo(() => collectAllSlips(settings.code, year), [settings.code, year]);
  var tags = useMemo(() => tagStats(allSlips), [allSlips]);
  var blCandidates = useMemo(() => {
    var seen = {};
    var out = [];
    allSlips.filter(s => s.blacklist && (s.custName || '').trim() && (s.custPhone || '').trim()).forEach(s => {
      var key = (s.custPhone || '') + '|' + (s.custName || '') + '|' + (s.custTitle || '') + '|' + s.id;
      if (seen[key]) return;
      seen[key] = true;
      var ms = s.startAt || s.createdAt;
      var d = new Date(ms);
      var startAtStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      out.push({
        key,
        custName: s.custName,
        custTitle: s.custTitle,
        custPhone: s.custPhone,
        reason: s.blacklistReason || '騷擾',
        svc: s.svc || '',
        startAt: startAtStr
      });
    });
    return out;
  }, [allSlips]);
  var doBlSubmit = async cand => {
    setBlSubmitting(cand.key);
    try {
      var r = await gasBlacklistSubmit(settings.code, cand.custName, cand.custTitle, cand.custPhone, cand.reason, cand.svc, cand.startAt);
      if (r && r.ok) {
        setBlSubmitted(m => ({
          ...m,
          [cand.key]: {
            reqId: r.reqId,
            status: 'pending'
          }
        }));
      } else {
        alert(r && r.error || '送出失敗');
      }
    } catch (e) {
      alert(String(e));
    }
    setBlSubmitting(null);
  };
  var doBlRecheck = async key => {
    var rec = blSubmitted[key];
    if (!rec) return;
    setBlCheckBusy(key);
    try {
      var r = await gasBlacklistCheck(rec.reqId);
      if (r && r.ok) setBlSubmitted(m => ({
        ...m,
        [key]: {
          ...m[key],
          status: r.status
        }
      }));
    } catch (_e) {}
    setBlCheckBusy(null);
  };
  var doBlShare = (cand, reqId) => {
    var base = location.origin + (window.__appBase || location.pathname.replace(/index\.html$/, '')) + 'auth.html';
    var link = buildReqLink(base, reqId);
    sendTicketFlex('🚫 拒接申請審核通知', '請協助審核' + settings.code + '號老師的拒接申請，代碼：', link);
  };
  var fmtDT = s => `${s.month}/${s.day} ${String(new Date(s.startTime).getHours()).padStart(2, '0')}:${String(new Date(s.startTime).getMinutes()).padStart(2, '0')}`;
  var tagSlips = openTag ? allSlips.filter(s => (s.tags || []).includes(openTag)) : [];
  var found = mode === 'search' ? searchSlips(allSlips, q) : [];
  var slipRow = s => React.createElement("div", {
    key: s.id,
    className: "flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/[0.05] rounded-lg"
  }, React.createElement("span", {
    className: "text-sm font-bold text-amber-300 min-w-[3rem]"
  }, slipSvcLabel(s, t === T.zh ? "zh" : "vi")), React.createElement("span", {
    className: "text-xs text-gray-400 tabular-nums w-20"
  }, fmtDT(s)), React.createElement("div", {
    className: "flex-1 min-w-0"
  }, React.createElement("span", {
    className: "text-xs text-gray-300"
  }, s.custName || '', s.custTitle ? ' ' + bookTitleName(s.custTitle, t === T.zh ? 'zh' : 'vi') : ''), s.tags && s.tags.length > 0 && React.createElement("span", {
    className: "text-[10px] text-gray-500 ml-1"
  }, s.tags.map(x => '#' + x).join(' '))), s.custPhone && React.createElement("span", {
    className: "text-[10px] text-gray-500"
  }, s.custPhone));
  return React.createElement("div", {
    className: "fi space-y-3 max-w-lg mx-auto px-4 py-2"
  }, React.createElement("div", {
    className: "sticky top-0 z-10 -mx-4 px-4 pt-1 bg-gray-950"
  }, React.createElement("h2", {
    className: "text-xl font-bold text-gray-100 py-1"
  }, t.custMgmt), React.createElement("div", {
    className: "flex border-b border-white/[0.08] -mx-4 px-4"
  }, React.createElement("button", {
    onClick: () => setMode('search'),
    className: `px-4 min-h-[44px] text-[15px] font-semibold border-b-[3px] ${mode === 'search' ? 'text-amber-400 border-amber-500' : 'text-gray-500 border-transparent'}`
  }, t.custSearchBtn), React.createElement("button", {
    onClick: () => setMode('tags'),
    className: `px-4 min-h-[44px] text-[15px] font-semibold border-b-[3px] ${mode === 'tags' ? 'text-amber-400 border-amber-500' : 'text-gray-500 border-transparent'}`
  }, t.custTagStats), false && React.createElement("button", {
    onClick: () => setMode('blacklist'),
    className: "px-4 min-h-[44px] text-[15px] font-semibold text-red-400"
  }, t.blacklistTab || '拒接名單'))), mode === 'blacklist' && React.createElement("div", {
    className: "space-y-2"
  }, blCandidates.length === 0 && React.createElement("p", {
    className: "text-sm text-gray-500 text-center py-8"
  }, t.blacklistNoCandidate || '目前沒有標記拒接的客人，請先在流水詳情勾選拒接'), blCandidates.map(cand => {
    var sub = blSubmitted[cand.key];
    return React.createElement("div", {
      key: cand.key,
      className: "bg-white/[0.03] border border-red-500/20 rounded-xl p-3 space-y-1.5"
    }, React.createElement("div", {
      className: "flex items-center gap-2"
    }, React.createElement("span", {
      className: "text-sm text-gray-200 font-semibold"
    }, cand.custName, cand.custTitle ? bookTitleName(cand.custTitle, t === T.zh ? 'zh' : 'vi') : ''), React.createElement("span", {
      className: "text-xs text-gray-500"
    }, cand.custPhone)), React.createElement("p", {
      className: "text-xs text-red-400"
    }, t.blacklistReasonLabel || '拒接原因', "：", cand.reason), React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, cand.svc || '—', "・", cand.startAt), !sub ? React.createElement("button", {
      onClick: () => doBlSubmit(cand),
      disabled: blSubmitting === cand.key,
      className: "w-full py-2 rounded-lg bg-red-600 text-white text-sm font-bold disabled:opacity-50"
    }, blSubmitting === cand.key ? '送出中…' : t.blacklistSubmitBtn || '送出拒接申請') : React.createElement("div", {
      className: "space-y-1.5"
    }, React.createElement("p", {
      className: "text-[11px] text-gray-500 font-mono"
    }, t.ticketCode, "：", sub.reqId), React.createElement("p", {
      className: `text-xs font-semibold ${sub.status === 'approved' ? 'text-emerald-400' : sub.status === 'rejected' ? 'text-red-500' : 'text-amber-400'}`
    }, sub.status === 'approved' ? t.ticketApproved || '已核准！' : sub.status === 'rejected' ? '已拒絕' : t.ticketPending || '尚未核准，請稍候'), sub.status === 'pending' && React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement("button", {
      onClick: () => doBlShare(cand, sub.reqId),
      className: "flex-1 py-2 rounded-lg bg-[#06C755] text-white text-xs font-bold"
    }, t.ticketSend), React.createElement("button", {
      onClick: () => doBlRecheck(cand.key),
      disabled: blCheckBusy === cand.key,
      className: "flex-1 py-2 rounded-lg bg-white/[0.06] text-gray-300 text-xs font-semibold disabled:opacity-50"
    }, blCheckBusy === cand.key ? '…' : t.ticketCheckBtn || '重新檢查核准情形'))));
  }), React.createElement("p", {
    className: "text-sm text-amber-300 text-center pt-2 leading-relaxed"
  }, t.blacklistTabHint)), mode === 'tags' && React.createElement("div", {
    className: "space-y-2"
  }, tags.length === 0 && React.createElement("p", {
    className: "text-sm text-gray-500 text-center py-8"
  }, t.custNoTags), tags.length > 0 && React.createElement("div", {
    className: "flex flex-wrap gap-2 pt-1"
  }, tags.map(({
    tag,
    count
  }) => React.createElement("button", {
    key: tag,
    onClick: () => setOpenTag(openTag === tag ? null : tag),
    className: `inline-flex items-center gap-1.5 rounded-full px-3.5 min-h-[40px] text-[15px] ${openTag === tag ? 'bg-amber-600 text-white' : 'bg-white/[0.05] border border-white/[0.08] text-gray-200'}`
  }, "#", tag, React.createElement("span", {
    className: "text-xs opacity-70"
  }, count)))), openTag && React.createElement("div", {
    className: "space-y-1.5 pt-2"
  }, React.createElement("p", {
    className: "text-xs text-gray-400 font-semibold"
  }, "#", openTag, " · ", tagSlips.length), tagSlips.map(slipRow))), mode === 'search' && React.createElement("div", {
    className: "space-y-2"
  }, React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: t.custSearchPlaceholder,
    className: "w-full min-h-[46px] bg-white/[0.06] border border-white/[0.08] rounded-xl px-3.5 text-base text-gray-100 focus:outline-none focus:border-amber-500"
  }), custList.length > 0 && React.createElement("p", {
    className: "text-xs text-gray-500 px-1"
  }, (q || '').trim() ? '' : t === T.zh ? '最近 · ' : 'Gần đây · ', custList.length, t === T.zh ? ' 位' : ''), custList.length === 0 && React.createElement("p", {
    className: "text-sm text-gray-500 text-center py-6"
  }, (q || '').trim() ? t.noMatch : t.custNoRecent), React.createElement("div", {
    className: "space-y-1.5"
  }, custList.map((c, i) => {
    var last = custLastSlip(settings.code, year, c.custName, c.custTitle, c.custPhone);
    var key = c.custPhone ? 'p:' + c.custPhone : 'n:' + (c.custName || '') + '|' + (c.custTitle || '');
    var hist = c.history || [];
    var histOpen = openHistory === key;
    return React.createElement("div", {
      key: i
    }, React.createElement("div", {
      className: "flex items-center gap-2 px-3.5 min-h-[60px] bg-white/[0.03] border border-white/[0.05] rounded-xl"
    }, React.createElement("div", {
      onClick: () => setEditCust({
        custName: c.custName || '',
        custTitle: c.custTitle || '',
        custPhone: c.custPhone || '',
        pressBody: c.pressBody || '',
        pressFoot: c.pressFoot || '',
        parts: c.parts || []
      }),
      className: "flex items-center gap-2 flex-1 min-w-0 active:opacity-70 py-2"
    }, React.createElement("div", {
      className: "flex-1 min-w-0"
    }, React.createElement("p", {
      className: "text-base font-semibold text-gray-100 truncate"
    }, c.custName || '', c.custTitle && React.createElement("span", {
      className: "text-[13px] font-normal text-gray-400 ml-1"
    }, bookTitleName(c.custTitle, t === T.zh ? 'zh' : 'vi'))), c.custPhone && React.createElement("p", {
      className: "text-[13px] text-gray-500 tabular-nums"
    }, c.custPhone)), React.createElement("div", {
      className: "text-right flex-shrink-0"
    }, last && last.svc && React.createElement("p", {
      className: "text-[13px] font-bold text-amber-300"
    }, slipSvcLabel(last, t === T.zh ? "zh" : "vi")), last && React.createElement("p", {
      className: "text-xs text-gray-500 tabular-nums whitespace-nowrap"
    }, last.month, "/", last.day))), hist.length > 0 && React.createElement("button", {
      onClick: () => setOpenHistory(histOpen ? null : key),
      className: `text-xs min-w-[40px] min-h-[36px] px-2.5 rounded-full font-semibold flex-shrink-0 ${histOpen ? 'bg-amber-600 text-white' : 'bg-white/[0.06] text-gray-400'}`
    }, "(", hist.length, ")")), histOpen && React.createElement("div", {
      className: "mt-1.5 ml-2 pl-3 border-l-2 border-white/[0.08] space-y-1.5 fi"
    }, hist.slice().reverse().map((h, hi) => React.createElement("div", {
      key: hi,
      className: "bg-white/[0.02] rounded-lg px-2.5 py-2 text-[11px] text-gray-400"
    }, React.createElement("p", {
      className: "text-gray-500"
    }, h.lastAt ? new Date(h.lastAt).toLocaleString('zh-TW', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '—'), (h.pressBody || h.pressFoot) && React.createElement("p", null, t.pressBody, "：", h.pressBody ? t['press' + h.pressBody.charAt(0).toUpperCase() + h.pressBody.slice(1)] : '—', "\u3000", t.pressFoot, "：", h.pressFoot ? t['press' + h.pressFoot.charAt(0).toUpperCase() + h.pressFoot.slice(1)] : '—'), h.parts && h.parts.length > 0 && React.createElement("p", null, t.strengthParts, "：", h.parts.map(p => t['part' + p.charAt(0).toUpperCase() + p.slice(1)]).join('、'))))));
  }))), editCust && React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center",
    onClick: () => setEditCust(null)
  }, React.createElement("div", {
    className: "su bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "p-4 border-b border-white/[0.06] flex items-center justify-between"
  }, React.createElement("h3", {
    className: "text-lg font-bold text-gray-100"
  }, t.custEditTitle), React.createElement("button", {
    onClick: () => setEditCust(null),
    className: "text-gray-500 text-sm"
  }, "✕")), React.createElement("div", {
    className: "p-4 space-y-3"
  }, React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, React.createElement("input", {
    value: editCust.custName,
    onChange: e => setEditCust({
      ...editCust,
      custName: e.target.value
    }),
    placeholder: t.custName,
    className: "bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 min-h-[46px] text-base text-gray-100 focus:outline-none focus:border-amber-500"
  }), React.createElement("select", {
    value: editCust.custTitle,
    onChange: e => setEditCust({
      ...editCust,
      custTitle: e.target.value
    }),
    className: "bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 min-h-[46px] text-base text-gray-200 focus:outline-none focus:border-amber-500"
  }, React.createElement("option", {
    value: ""
  }, t.custTitle), BOOK_TITLES.map(o => React.createElement("option", {
    key: o.v,
    value: o.v
  }, o[t === T.zh ? 'zh' : 'vi'])))), React.createElement("input", {
    value: editCust.custPhone,
    onChange: e => setEditCust({
      ...editCust,
      custPhone: e.target.value
    }),
    inputMode: "numeric",
    placeholder: t.custPhone,
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 min-h-[46px] text-base text-gray-100 focus:outline-none focus:border-amber-500"
  }), React.createElement("div", {
    className: "grid grid-cols-1 gap-3"
  }, React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 block mb-1"
  }, t.pressBody), React.createElement("div", {
    className: "flex gap-1.5"
  }, PRESS_LEVELS.map(pl => React.createElement("button", {
    key: pl,
    onClick: () => setEditCust({
      ...editCust,
      pressBody: editCust.pressBody === pl ? '' : pl
    }),
    className: `flex-1 min-h-[40px] rounded-lg text-sm ${editCust.pressBody === pl ? 'bg-amber-600 text-white' : 'bg-white/[0.04] text-gray-500'}`
  }, t['press' + pl.charAt(0).toUpperCase() + pl.slice(1)])))), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 block mb-1"
  }, t.pressFoot), React.createElement("div", {
    className: "flex gap-1.5"
  }, PRESS_LEVELS.map(pl => React.createElement("button", {
    key: pl,
    onClick: () => setEditCust({
      ...editCust,
      pressFoot: editCust.pressFoot === pl ? '' : pl
    }),
    className: `flex-1 min-h-[40px] rounded-lg text-sm ${editCust.pressFoot === pl ? 'bg-amber-600 text-white' : 'bg-white/[0.04] text-gray-500'}`
  }, t['press' + pl.charAt(0).toUpperCase() + pl.slice(1)]))))), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 block mb-1"
  }, t.strengthParts), React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, BODY_PARTS.map(bp => React.createElement("button", {
    key: bp,
    onClick: () => {
      var arr = editCust.parts || [];
      setEditCust({
        ...editCust,
        parts: arr.includes(bp) ? arr.filter(x => x !== bp) : [...arr, bp]
      });
    },
    className: `px-3.5 min-h-[40px] rounded-full text-sm ${(editCust.parts || []).includes(bp) ? 'bg-amber-600 text-white' : 'bg-white/[0.04] text-gray-500'}`
  }, t['part' + bp.charAt(0).toUpperCase() + bp.slice(1)])))), React.createElement("button", {
    onClick: saveCust,
    className: "w-full min-h-[52px] rounded-xl bg-amber-600 text-white text-[17px] font-bold"
  }, t.save), React.createElement("button", {
    onClick: () => {
      if (delConfirm) {
        deleteCust(settings.code, editCust.custName, editCust.custTitle, editCust.custPhone);
        setEditCust(null);
        setDelConfirm(false);
      } else {
        setDelConfirm(true);
        setTimeout(() => setDelConfirm(false), 3000);
      }
    },
    className: `w-full min-h-[48px] mt-1 rounded-xl text-[15px] font-semibold ${delConfirm ? "bg-red-600 text-white" : "text-red-400"}`
  }, delConfirm ? t.custDelConfirm || "再按一次確認刪除" : t.custDelBtn || "刪除此客戶")))));
}
function AcupointPage({
  t,
  settings
}) {
  var isVi = t === T.vi;
  var lang = isVi ? 'vi' : 'zh';
  var fb = obj => obj && (obj[lang] || obj.zh) || '';
  var code = settings && settings.code;
  var [gate, setGate] = useState(() => {
    try {
      if (!code || !localStorage.getItem(ACUPOINTS_CACHE_KEY)) return null;
      if (!HIDE_COMPANY_FEATURES) {
        var lat = settings && settings.lockAutoTime || 60;
        var ut = parseInt(localStorage.getItem('notice-pwd-unlock-' + code) || '0', 10) || 0;
        if (Date.now() - ut > lat * 60 * 1000) return null;
      }
      return 'ok';
    } catch (_e) {
      return null;
    }
  });
  useEffect(() => {
    (async () => {
      if (!code) {
        setGate('ok');
        return;
      }
      if (!HIDE_COMPANY_FEATURES) {
        try {
          var lockAutoTime = settings && settings.lockAutoTime || 60;
          var unlockTs = parseInt(localStorage.getItem('notice-pwd-unlock-' + code) || '0', 10) || 0;
          if (Date.now() - unlockTs > lockAutoTime * 60 * 1000) {
            setGate('locked');
            return;
          }
        } catch (_e) {}
      }
      try {
        var valid = await checkCredentialValid(code);
        if (!valid) {
          clearAcupointsCache();
          setGate('invalid');
          return;
        }
        setGate('ok');
      } catch (_e) {
        setGate('ok');
      }
    })();
  }, [code]);
  var [data, setData] = useState(null);
  var [bp, setBp] = useState('');
  var [meridian, setMeridian] = useState('all');
  var [q, setQ] = useState('');
  var [openId, setOpenId] = useState(null);
  var [history, setHistory] = useState(() => LS.get('acupoint-search-history') || []);
  useEffect(() => {
    if (gate === 'ok') fetchAcupoints().then(d => {
      setData(d);
      if (d.bodyParts && d.bodyParts.length) setBp(d.bodyParts[0].id);
    });
  }, [gate]);
  useEffect(() => {
    setMeridian('all');
    setOpenId(null);
  }, [bp]);
  useEffect(() => {
    var kw = q.trim();
    if (!kw) return;
    var tm = setTimeout(() => {
      setHistory(h => {
        var next = [kw, ...h.filter(x => x !== kw)].slice(0, 5);
        LS.set('acupoint-search-history', next);
        return next;
      });
    }, 800);
    return () => clearTimeout(tm);
  }, [q]);
  var [favorites, setFavorites] = useState(() => LS.get('acupoint-favorites') || []);
  var toggleFavorite = id => {
    setFavorites(f => {
      var next = f.includes(id) ? f.filter(x => x !== id) : [...f, id];
      LS.set('acupoint-favorites', next);
      return next;
    });
  };
  var bodyParts = data && data.bodyParts || [];
  var points = data && data.points || [];
  var bpList = useMemo(() => {
    var arr = points.filter(a => a.bodyPart === bp);
    return arr.slice().sort((x, y) => {
      var fx = favorites.includes(x.id) ? 1 : 0,
        fy = favorites.includes(y.id) ? 1 : 0;
      return fy - fx;
    });
  }, [points, bp, favorites]);
  var meridianList = useMemo(() => {
    var seen = [];
    var set = new Set();
    bpList.forEach(a => {
      var m = fb(a.meridian);
      if (!set.has(m)) {
        set.add(m);
        seen.push(m);
      }
    });
    return seen;
  }, [bpList, lang]);
  var results = useMemo(() => {
    var arr = bpList;
    if (meridian !== 'all') arr = arr.filter(a => fb(a.meridian) === meridian);
    var kw = q.trim().toLowerCase();
    if (kw) {
      arr = arr.filter(a => {
        if (fb(a.name).toLowerCase().includes(kw)) return true;
        if (a.name.zh.toLowerCase().includes(kw)) return true;
        if ((a.keywords[lang] || []).some(k => k.toLowerCase().includes(kw)) || (a.keywords.zh || []).some(k => k.toLowerCase().includes(kw))) return true;
        if (fb(a.caution).toLowerCase().includes(kw)) return true;
        if (a.caution.zh.toLowerCase().includes(kw)) return true;
        return false;
      });
    }
    return arr;
  }, [bpList, meridian, q, lang]);
  if (gate === null) return React.createElement("div", {
    className: "space-y-3 fi"
  }, React.createElement("div", {
    className: "sticky top-0 z-10 -mx-4 px-4 py-2.5 bg-gray-950 flex items-center justify-center"
  }, React.createElement("h2", {
    className: "text-lg font-bold text-gray-100"
  }, t.acupointTitle)), React.createElement("div", {
    className: "flex justify-center py-10"
  }, React.createElement("span", {
    className: "w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"
  })));
  if (gate === 'locked') return React.createElement("div", {
    className: "space-y-3 fi"
  }, React.createElement("div", {
    className: "sticky top-0 z-10 -mx-4 px-4 py-2.5 bg-gray-950 flex items-center justify-center"
  }, React.createElement("h2", {
    className: "text-lg font-bold text-gray-100"
  }, t.acupointTitle)), React.createElement("p", {
    className: "text-sm text-gray-500 text-center py-8 px-4"
  }, t.acupointNeedUnlock || '請先到公告頁面完成每日密碼驗證，再回來查看穴道知識庫'));
  if (gate === 'invalid') return React.createElement("div", {
    className: "space-y-3 fi"
  }, React.createElement("div", {
    className: "sticky top-0 z-10 -mx-4 px-4 py-2.5 bg-gray-950 flex items-center justify-center"
  }, React.createElement("h2", {
    className: "text-lg font-bold text-gray-100"
  }, t.acupointTitle)), React.createElement("p", {
    className: "text-sm text-red-400 text-center py-8 px-4"
  }, t.keyInvalidMsg));
  if (data === null) return React.createElement("div", {
    className: "space-y-3 fi"
  }, React.createElement("div", {
    className: "sticky top-0 z-10 -mx-4 px-4 py-2.5 bg-gray-950 flex items-center justify-center"
  }, React.createElement("h2", {
    className: "text-lg font-bold text-gray-100"
  }, t.acupointTitle)), React.createElement("div", {
    className: "flex justify-center py-10"
  }, React.createElement("span", {
    className: "w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"
  })));
  if (data.error || bodyParts.length === 0) return React.createElement("div", {
    className: "space-y-3 fi"
  }, React.createElement("div", {
    className: "sticky top-0 z-10 -mx-4 px-4 py-2.5 bg-gray-950 flex items-center justify-center"
  }, React.createElement("h2", {
    className: "text-lg font-bold text-gray-100"
  }, t.acupointTitle)), React.createElement("p", {
    className: "text-sm text-gray-600 text-center py-8"
  }, t.acupointLoadFail || '讀取失敗，請檢查網路後重新整理'));
  return React.createElement("div", {
    className: "space-y-3 fi"
  }, React.createElement("div", {
    className: "sticky top-0 z-10 -mx-4 px-4 pt-1 pb-2 bg-gray-950 space-y-2.5"
  }, React.createElement("div", {
    className: "relative"
  }, React.createElement("input", {
    value: q,
    onChange: e => setQ(e.target.value),
    placeholder: t.acupointSearchPh,
    className: "w-full h-12 bg-white/[0.06] border border-white/[0.10] rounded-xl pl-3 pr-11 text-[15px] text-gray-100 focus:outline-none focus:border-amber-400"
  }), q && React.createElement("button", {
    onClick: () => setQ(''),
    className: "absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400"
  }, "✕")), React.createElement("div", {
    className: "flex gap-5 overflow-x-auto border-b border-white/[0.08]",
    style: {
      scrollbarWidth: 'none'
    }
  }, bodyParts.map(b => React.createElement("button", {
    key: b.id,
    onClick: () => setBp(b.id),
    className: `flex-shrink-0 h-11 text-[15px] font-semibold whitespace-nowrap border-b-2 ${bp === b.id ? 'text-amber-400 border-amber-400' : 'text-[#aab2c0] border-transparent'}`
  }, fb(b))))), React.createElement("div", {
    className: "flex gap-2 overflow-x-auto pb-1",
    style: {
      scrollbarWidth: 'none'
    }
  }, React.createElement("button", {
    onClick: () => setMeridian('all'),
    className: `flex-shrink-0 px-3 h-9 rounded-full text-[13px] font-medium whitespace-nowrap border ${meridian === 'all' ? 'border-sky-400 text-sky-400 bg-sky-400/10' : 'border-white/[0.14] text-[#aab2c0]'}`
  }, t.acupointAllMeridian || '全部經脈'), meridianList.map(m => React.createElement("button", {
    key: m,
    onClick: () => setMeridian(m),
    className: `flex-shrink-0 px-3 h-9 rounded-full text-[13px] font-medium whitespace-nowrap border ${meridian === m ? 'border-sky-400 text-sky-400 bg-sky-400/10' : 'border-white/[0.14] text-[#aab2c0]'}`
  }, m))), history.length > 0 && React.createElement("div", {
    className: "flex items-center gap-2 flex-wrap"
  }, React.createElement("span", {
    className: "text-[13px] text-[#aab2c0] flex-shrink-0"
  }, t.acupointRecentSearch || '最近搜尋：'), history.map((h, i) => React.createElement("button", {
    key: i,
    onClick: () => setQ(h),
    className: "px-3 h-8 rounded-full bg-white/[0.06] text-[13px] text-gray-300 active:bg-white/[0.12]"
  }, h))), results.length === 0 && React.createElement("p", {
    className: "text-[15px] text-[#aab2c0] text-center py-8"
  }, t.acupointNoResult), React.createElement("div", {
    className: "divide-y divide-white/[0.08] border-y border-white/[0.08]"
  }, results.map(a => {
    var open = openId === a.id;
    var kw = q.trim().toLowerCase();
    var nameOrKwMatch = kw && (fb(a.name).toLowerCase().includes(kw) || a.name.zh.toLowerCase().includes(kw) || (a.keywords[lang] || []).some(k => k.toLowerCase().includes(kw)) || (a.keywords.zh || []).some(k => k.toLowerCase().includes(kw)));
    var cautionMatch = kw && !nameOrKwMatch;
    return React.createElement("div", {
      key: a.id
    }, React.createElement("div", {
      onClick: () => setOpenId(open ? null : a.id),
      className: "min-h-[52px] py-2 flex items-center justify-between cursor-pointer active:bg-white/[0.04]"
    }, React.createElement("div", {
      className: "flex-1 min-w-0"
    }, React.createElement("span", {
      className: "text-[16px] font-semibold text-gray-100"
    }, favorites.includes(a.id) ? '♥ ' : '', fb(a.name)), React.createElement("span", {
      className: "text-[13px] text-sky-400 ml-2"
    }, fb(a.meridian)), !open && cautionMatch && React.createElement("p", {
      className: "text-[13px] text-red-400 mt-0.5 truncate"
    }, "⚠️ ", fb(a.caution))), React.createElement("span", {
      className: "text-gray-400 text-sm flex-shrink-0 ml-2 w-6 text-center"
    }, open ? '▲' : '▼')), open && React.createElement("div", {
      className: "pb-4 space-y-3"
    }, React.createElement("div", null, React.createElement("p", {
      className: "text-[13px] text-amber-400 font-semibold mb-0.5"
    }, t.acupointLocation), React.createElement("p", {
      className: "text-[15px] text-gray-200 leading-relaxed"
    }, fb(a.location))), React.createElement("div", null, React.createElement("p", {
      className: "text-[13px] text-amber-400 font-semibold mb-0.5"
    }, t.acupointBenefit), React.createElement("p", {
      className: "text-[15px] text-gray-200 leading-relaxed"
    }, fb(a.benefit))), React.createElement("div", null, React.createElement("p", {
      className: "text-[13px] text-amber-400 font-semibold mb-0.5"
    }, t.acupointTechnique), React.createElement("p", {
      className: "text-[15px] text-gray-200 leading-relaxed"
    }, fb(a.technique))), React.createElement("div", null, React.createElement("p", {
      className: "text-[13px] text-red-400 font-semibold mb-0.5"
    }, t.acupointCaution), React.createElement("p", {
      className: "text-[15px] text-[#aab2c0] leading-relaxed"
    }, fb(a.caution))), React.createElement("div", {
      className: "flex items-center gap-3 pt-1"
    }, React.createElement("button", {
      onClick: () => {
        var link = location.origin + location.pathname;
        var title = '🌿 ' + fb(a.name);
        var body = t.acupointLocation + '：' + fb(a.location) + '\n\n' + t.acupointBenefit + '：' + fb(a.benefit) + '\n\n' + t.acupointTechnique + '：' + fb(a.technique) + '\n\n' + t.acupointCaution + '：' + fb(a.caution);
        sendTicketFlex(title, body, link);
      },
      className: "w-11 h-11 rounded-full bg-[#06C755] flex items-center justify-center active:bg-[#05b34c] flex-shrink-0",
      title: t.acupointShareLine || '分享到LINE'
    }, React.createElement("svg", {
      viewBox: "0 0 24 24",
      width: "18",
      height: "18",
      fill: "white"
    }, React.createElement("path", {
      d: "M12 2C6.48 2 2 5.85 2 10.5c0 4.15 3.53 7.63 8.31 8.34.32.07.76.21.87.48.1.25.07.63.03.88l-.14.85c-.04.25-.19.98.86.53 1.05-.44 5.68-3.35 7.75-5.73C21.24 13.9 22 12.28 22 10.5 22 5.85 17.52 2 12 2z"
    }))), React.createElement("button", {
      onClick: () => toggleFavorite(a.id),
      className: "w-11 h-11 rounded-full bg-white/[0.08] flex items-center justify-center active:bg-white/[0.14] flex-shrink-0",
      title: t.acupointFavorite || '收藏，排到最上面'
    }, React.createElement("svg", {
      viewBox: "0 0 24 24",
      width: "18",
      height: "18",
      fill: favorites.includes(a.id) ? '#f43f5e' : 'none',
      stroke: favorites.includes(a.id) ? '#f43f5e' : '#9ca3af',
      strokeWidth: 1.8
    }, React.createElement("path", {
      d: "M12 21s-6.7-4.35-9.3-8.1C1.1 10.5 1.6 7 4.6 5.6c2.2-1 4.6-.2 5.9 1.5.5.6.9 1.3 1.5 1.3s1-.7 1.5-1.3c1.3-1.7 3.7-2.5 5.9-1.5 3 1.4 3.5 4.9 1.9 7.3C18.7 16.65 12 21 12 21z"
    }))), favorites.includes(a.id) && React.createElement("span", {
      className: "text-[13px] text-rose-400"
    }, t.acupointFavoritedHint || '已收藏，排在此部位最上方'))));
  })), React.createElement("p", {
    className: "text-[12px] text-[#aab2c0] text-center pt-2 leading-relaxed"
  }, t.acupointDisclaimer));
}
function SuggestPage({
  t,
  settings,
  onClose
}) {
  var [showAdd, setShowAdd] = React.useState(false);
  var [title, setTitle] = React.useState('');
  var [body, setBody] = React.useState('');
  var [anon, setAnon] = React.useState(false);
  var [status, setStatus] = React.useState('');
  var [busy, setBusy] = React.useState(false);
  var [list, setList] = React.useState(undefined);
  var load = () => {
    gasListSuggestions().then(r => {
      if (r && r.ok) setList(r.list || []);else setList([]);
    }).catch(() => setList([]));
  };
  React.useEffect(() => {
    load();
  }, []);
  var closeAdd = () => {
    setShowAdd(false);
    setTitle('');
    setBody('');
    setAnon(false);
    setStatus('');
  };
  var submit = async () => {
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    setStatus('');
    try {
      var r = await gasSubmitSuggestion(title.trim(), body.trim(), settings.code || '', anon);
      if (r && r.ok) {
        closeAdd();
        load();
      } else {
        setStatus('err');
      }
    } catch (_e) {
      setStatus('err');
    }
    setBusy(false);
  };
  return React.createElement("div", {
    className: "fi"
  }, React.createElement("div", {
    className: "sticky top-0 z-10 -mx-4 px-4 py-1 bg-gray-950 relative flex items-center justify-center mb-2"
  }, React.createElement("h2", {
    className: "text-sm font-semibold text-gray-300"
  }, t.suggestBox || '建議'), React.createElement("button", {
    onClick: () => setShowAdd(true),
    className: "absolute right-4 px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-semibold active:bg-amber-700"
  }, "+ ", t.suggestAdd || '新建議')), list === undefined ? React.createElement(SkReveal, {
    ready: false,
    rows: 3
  }) : list.length === 0 ? React.createElement("p", {
    className: "text-xs text-gray-600 text-center py-6"
  }, t.suggestEmpty || '目前沒有建議') : React.createElement("div", {
    className: "space-y-2"
  }, list.map(s => React.createElement("div", {
    key: s.id,
    className: "bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5"
  }, React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, React.createElement("p", {
    className: "text-sm text-gray-200 font-medium truncate flex-1"
  }, s.title), React.createElement("span", {
    className: "text-[10px] text-gray-500 flex-shrink-0"
  }, s.anon ? t.suggestAnon || '發布人：隱藏' : '發布人：' + s.author)), React.createElement("div", {
    className: "flex items-center justify-between gap-2 mt-1"
  }, React.createElement("p", {
    className: "text-[11px] text-gray-500 truncate flex-1"
  }, s.body), React.createElement("span", {
    className: "text-[10px] text-gray-600 flex-shrink-0"
  }, s.time))))), showAdd && React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center",
    onClick: closeAdd
  }, React.createElement("div", {
    className: "bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "p-4 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-gray-900"
  }, React.createElement("h3", {
    className: "text-base font-bold text-gray-100"
  }, t.suggestAdd || '新建議'), React.createElement("button", {
    onClick: closeAdd,
    className: "text-gray-500 text-sm"
  }, "✕")), React.createElement("div", {
    className: "p-4 space-y-4"
  }, React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.suggestTitle || '標題'), React.createElement("input", {
    value: title,
    onChange: e => setTitle(e.target.value),
    placeholder: t.suggestTitlePh || '一句話說明你的建議',
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500",
    style: {
      boxSizing: 'border-box'
    }
  })), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.suggestContent || '內容'), React.createElement("textarea", {
    value: body,
    onChange: e => setBody(e.target.value),
    rows: 5,
    placeholder: t.suggestContentPh || '詳細說明你的想法…',
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 resize-none",
    style: {
      boxSizing: 'border-box'
    }
  })), React.createElement("label", {
    className: "flex items-center gap-2 cursor-pointer"
  }, React.createElement("input", {
    type: "checkbox",
    checked: anon,
    onChange: e => setAnon(e.target.checked),
    className: "w-4 h-4 rounded accent-amber-500"
  }), React.createElement("span", {
    className: "text-sm text-gray-300"
  }, t.suggestAnonOpt || '匿名發布（不顯示我的編號）')), status === 'err' && React.createElement("p", {
    className: "text-[11px] text-red-400 text-center"
  }, t.suggestSubmitFail || '送出失敗，請再試一次'), React.createElement("button", {
    onClick: submit,
    disabled: busy || !title.trim() || !body.trim(),
    className: "w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold active:bg-emerald-700 disabled:opacity-50"
  }, busy ? '…' : t.suggestSubmit || '送出建議')))));
}
function NoticeManagePage({
  t,
  settings,
  onClose,
  onLogout
}) {
  var [showAdd, setShowAdd] = React.useState(false);
  var [content, setContent] = React.useState('');
  var [aiResult, setAiResult] = React.useState(null);
  var [aiStatus, setAiStatus] = React.useState('');
  var [list, setList] = React.useState(() => {
    try {
      return getNoticesLocal();
    } catch (_e) {
      return [];
    }
  });
  var [noticeView, setNoticeView] = React.useState(null);
  var [canManage, setCanManage] = React.useState(false);
  var [editing, setEditing] = React.useState(null);
  var [editForm, setEditForm] = React.useState(null);
  var [editStatus, setEditStatus] = React.useState('');
  var openNotice = n => {
    try {
      if (getNoticeReadCount) getNoticeReadCount(n.id);
    } catch (_e) {}
    setNoticeView(n);
  };
  React.useEffect(() => {
    fetchNotices().then(l => {
      if (Array.isArray(l)) setList(l);
    }).catch(() => {});
  }, []);
  React.useEffect(() => {
    var alive = true;
    (async () => {
      var code = settings && settings.code || '';
      if (!code) return;
      try {
        var staff = await readStaff();
        var me = (staff || []).find(s => String(s.code) === String(code));
        if (me && (me.role === 'supervisor' || me.role === 'admin')) {
          if (alive) setCanManage(true);
          return;
        }
      } catch (_e) {}
      try {
        var res = await fetch('./admin.cfg', {
          cache: 'no-store'
        });
        if (res.ok) {
          var text = (await res.text()).trim();
          var lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
          var myHash = adminHash(code);
          var match = lines.some(l => {
            var parts = l.split(':');
            var h = parts.length >= 2 ? parts[parts.length - 1] : parts[0];
            return h === myHash;
          });
          if (match && alive) setCanManage(true);
        }
      } catch (_e) {}
    })();
    return () => {
      alive = false;
    };
  }, [settings && settings.code]);
  var closeAdd = () => {
    setShowAdd(false);
    setContent('');
    setAiResult(null);
    setAiStatus('');
  };
  var myCode = (() => {
    try {
      return settings && settings.code || '';
    } catch (_e) {
      return '';
    }
  })();
  var [editAiFilled, setEditAiFilled] = React.useState([]);
  var openEdit = (n, ev) => {
    try {
      if (ev) ev.stopPropagation();
    } catch (_e) {}
    setEditing(n);
    setEditForm({
      cat: n.cat || '',
      subcat: n.subcat || '',
      title: n.title || '',
      summary: n.summary || '',
      body: n.body || '',
      tags: n.tags || ''
    });
    setEditStatus('');
    setEditAiFilled([]);
    setReadInfo(null);
    setUnreadInfo(null);
    setEditPushMsg('');
  };
  var closeEdit = () => {
    setEditing(null);
    setEditForm(null);
    setEditStatus('');
    setEditAiFilled([]);
  };
  var updEdit = (k, v) => setEditForm(p => Object.assign({}, p, {
    [k]: v
  }));
  var FIELD_ZH = {
    cat: '主分類',
    subcat: '子分類',
    title: '標題',
    summary: '摘要',
    tags: '標籤'
  };
  var submitEdit = async () => {
    if (!editing || !editForm) return;
    setEditStatus('saving');
    setEditAiFilled([]);
    try {
      var r = await gasEditNotice({
        id: editing.id,
        cat: editForm.cat,
        subcat: editForm.subcat,
        title: editForm.title,
        summary: editForm.summary,
        body: editForm.body,
        tags: editForm.tags,
        code: myCode
      });
      if (r && r.ok) {
        setEditAiFilled(Array.isArray(r.aiFilled) ? r.aiFilled : []);
        var merged = r.fields || editForm;
        setList(prev => prev.map(x => x.id === editing.id ? Object.assign({}, x, merged) : x));
        setLocalOverrides(prev => Object.assign({}, prev, {
          [editing.id]: true
        }));
        setEditStatus(r.viOk === false ? 'savedNoVi' : 'saved');
        setTimeout(() => closeEdit(), 4500);
      } else {
        setEditStatus('失敗：' + (r && r.error || '?'));
      }
    } catch (e) {
      setEditStatus('錯誤：' + e);
    }
  };
  var runAI = async () => {
    if (!content.trim()) {
      setAiStatus('請先輸入公告內容');
      return;
    }
    setAiStatus('processing');
    setAiResult(null);
    try {
      var r = await gasAnalyze(content, myCode, '新增公告');
      if (r && r.ok) {
        setAiResult(Object.assign({
          body: content
        }, r.result));
        setAiStatus('');
      } else {
        setAiStatus('AI 失敗：' + (r && r.error || '?'));
      }
    } catch (e) {
      setAiStatus('錯誤：' + e);
    }
  };
  var publish = async () => {
    if (!aiResult) {
      setAiStatus('請先產生 AI 結果');
      return;
    }
    setAiStatus('publishing');
    try {
      var r = await gasAddNotice({
        cat: aiResult.cat,
        subcat: aiResult.subcat,
        title: aiResult.title,
        summary: aiResult.summary,
        body: aiResult.body || content,
        bodyVi: aiResult.bodyVi,
        tags: aiResult.tags,
        titleVi: aiResult.titleVi,
        summaryVi: aiResult.summaryVi,
        author: myCode,
        code: myCode
      });
      if (r && r.ok) {
        setAiStatus('done:' + r.id);
      } else {
        setAiStatus('發布失敗：' + (r && r.error || '?'));
      }
    } catch (e) {
      setAiStatus('錯誤：' + e);
    }
  };
  var [pushBusy, setPushBusy] = React.useState(false);
  var [pushMsg, setPushMsg] = React.useState('');
  var doPushNotice = async noticeId => {
    setPushBusy(true);
    setPushMsg('');
    try {
      var r = await gasPushNoticeFlexToMe(noticeId, myCode);
      if (r && r.ok) setPushMsg('✓ 已推播到你的LINE');else if (r && r.needBind) setPushMsg('尚未綁定LINE帳號，請先到安全回報頁面登記一次');else setPushMsg('推播失敗：' + (r && r.error || '?'));
    } catch (e) {
      setPushMsg('推播失敗：' + e);
    }
    setPushBusy(false);
  };
  var [readInfo, setReadInfo] = React.useState(null);
  var [readBusy, setReadBusy] = React.useState(false);
  var checkRead = async noticeId => {
    setReadBusy(true);
    try {
      var r = await gasCall('noticeReads', {
        noticeId,
        detail: true
      }, 10000);
      if (r && r.ok) setReadInfo(r);
    } catch (_e) {}
    setReadBusy(false);
  };
  var copyText = async text => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_e) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        return true;
      } catch (_e2) {
        return false;
      }
    }
  };
  var [copyMsg, setCopyMsg] = React.useState('');
  var doCopy = async (text, label) => {
    var ok = await copyText(text);
    setCopyMsg(ok ? label + '已複製' : '複製失敗');
    setTimeout(() => setCopyMsg(''), 2000);
  };
  var [editPushBusy, setEditPushBusy] = React.useState(false);
  var [editPushMsg, setEditPushMsg] = React.useState('');
  var doPushEdit = async () => {
    if (!editing) return;
    setEditPushBusy(true);
    try {
      var r = await gasPushNoticeFlexToMe(editing.id, myCode);
      setEditPushMsg(r && r.ok ? '✓ 已推播' : r && r.needBind ? '尚未綁定LINE' : '推播失敗');
    } catch (_e) {
      setEditPushMsg('推播失敗');
    }
    setEditPushBusy(false);
    setTimeout(() => setEditPushMsg(''), 2500);
  };
  var [unreadInfo, setUnreadInfo] = React.useState(null);
  var [unreadBusy, setUnreadBusy] = React.useState(false);
  var checkUnread = async noticeId => {
    setUnreadBusy(true);
    try {
      var r = await gasCall('noticeUnread', {
        noticeId
      }, 10000);
      if (r && r.ok) setUnreadInfo(r);
    } catch (_e) {}
    setUnreadBusy(false);
  };
  var upd = (k, v) => setAiResult(p => Object.assign({}, p, {
    [k]: v
  }));
  var [catTab, setCatTab] = React.useState('all');
  var [subTabSel, setSubTabSel] = React.useState('all');
  var [localOverrides, setLocalOverrides] = React.useState({});
  var mainCatsAll = React.useMemo(() => {
    try {
      var v = getNoticeMainCats();
      if (v && v.length) return v;
    } catch (_e) {}
    var s = [];
    var seen = {};
    list.forEach(n => {
      if (n.cat && !seen[n.cat]) {
        seen[n.cat] = 1;
        s.push({
          zh: n.cat,
          vi: ''
        });
      }
    });
    return s;
  }, [list]);
  var catLabel = zh => {
    var found = mainCatsAll.find(c => c.zh === zh);
    return settings.lang === 'vi' && found && found.vi ? found.vi : zh;
  };
  var subCatsPresent = React.useMemo(() => {
    if (catTab === 'all') return [];
    var s = [];
    var seen = {};
    list.forEach(n => {
      if (n.cat === catTab && n.subcat && !seen[n.subcat]) {
        seen[n.subcat] = 1;
        s.push(n.subcat);
      }
    });
    return s;
  }, [list, catTab]);
  var [toggleBusy, setToggleBusy] = React.useState(false);
  var toggleStatus = async () => {
    if (!editing) return;
    setToggleBusy(true);
    try {
      var r = await gasToggleNoticeStatus(editing.id, myCode);
      if (r && r.ok) {
        setList(prev => prev.map(x => x.id === editing.id ? Object.assign({}, x, {
          status: r.status
        }) : x));
        setEditing(prev => prev ? Object.assign({}, prev, {
          status: r.status
        }) : prev);
      }
    } catch (_e) {}
    setToggleBusy(false);
  };
  return React.createElement("div", {
    className: "fi"
  }, React.createElement("div", {
    className: "sticky top-0 z-10 -mx-4 px-4 py-1 bg-gray-950 relative flex items-center justify-center mb-2"
  }, React.createElement("h2", {
    className: "text-sm font-semibold text-gray-300"
  }, t.noticeCenter || '公告'), canManage && React.createElement("button", {
    onClick: () => setShowAdd(true),
    className: "absolute right-4 px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-semibold active:bg-amber-700"
  }, "+ ", t.noticeAdd || '新增公告')), React.createElement("div", {
    className: "grid grid-cols-3 gap-1.5 mb-2"
  }, [['all', t.catTabAll || '全部'], ...mainCatsAll.map(c => [c.zh, catLabel(c.zh)])].map(([k, l]) => React.createElement("button", {
    key: k,
    onClick: () => {
      setCatTab(k);
      setSubTabSel('all');
    },
    className: `py-2 rounded-lg text-[11px] font-semibold truncate px-1 ${catTab === k ? 'bg-amber-600 text-white' : 'bg-white/[0.05] text-gray-400'}`
  }, l))), catTab !== 'all' && subCatsPresent.length > 0 && React.createElement("div", {
    className: "flex flex-wrap gap-1.5 mb-3"
  }, [['all', t.catTabAll || '全部'], ...subCatsPresent.map(c => [c, c])].map(([k, l]) => React.createElement("button", {
    key: k,
    onClick: () => setSubTabSel(k),
    className: `px-2.5 py-1 rounded-full text-[10px] font-medium ${subTabSel === k ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.04] text-gray-500 border border-transparent'}`
  }, l))), React.createElement("div", {
    className: "space-y-2 mt-3"
  }, list.length === 0 ? React.createElement("p", {
    className: "text-xs text-gray-600 text-center py-6"
  }, t.noticeEmpty || '目前沒有公告') : list.filter(n => (catTab === 'all' || n.cat === catTab) && (subTabSel === 'all' || n.subcat === subTabSel)).slice().reverse().map(n => {
    var listText = typeof getNoticeListText === 'function' ? getNoticeListText() : 'summary';
    var showFlags = typeof getNoticeShow === 'function' ? getNoticeShow() : {
      cat: false,
      subcat: false
    };
    var countType = typeof getNoticeCountType === 'function' ? getNoticeCountType() : 'people';
    var displayText = listText === 'title' ? noticeTitle ? noticeTitle(n, settings.lang) : n.title : (noticeSummary ? noticeSummary(n, settings.lang) : n.summary) || n.title;
    var openN = countType === 'visits' ? typeof n.openVisits === 'number' ? n.openVisits : 0 : typeof n.openCount === 'number' ? n.openCount : 0;
    var isOff = n.status === 'off';
    var isLocal = !!localOverrides[n.id];
    return React.createElement("div", {
      key: n.id,
      onClick: () => openNotice(n),
      className: `bg-white/[0.03] border border-white/[0.05] rounded-xl px-3 py-2.5 active:bg-white/[0.06] cursor-pointer ${isOff ? 'opacity-50' : ''}`
    }, React.createElement("div", {
      className: "flex items-center justify-between gap-2"
    }, React.createElement("div", {
      className: "flex items-center gap-1.5 min-w-0 flex-1"
    }, React.createElement("span", {
      className: "text-[10px] text-gray-600 font-mono flex-shrink-0"
    }, n.id), React.createElement("span", {
      className: "text-[10px] text-gray-600 flex-shrink-0"
    }, "・", n.date), React.createElement("span", {
      className: "w-4 h-4 rounded-full bg-amber-600/30 flex items-center justify-center flex-shrink-0"
    }, React.createElement("span", {
      className: "text-[8px]"
    }, "👤")), React.createElement("span", {
      className: "text-[10px] text-gray-500 truncate"
    }, n.author || '')), canManage && React.createElement("button", {
      onClick: ev => openEdit(n, ev),
      className: "text-[11px] px-1.5 py-0.5 rounded-full bg-white/[0.08] text-gray-300 active:bg-white/[0.15] flex-shrink-0"
    }, "✏️")), React.createElement("p", {
      className: `text-sm font-medium truncate mt-1 ${isOff ? 'text-gray-500' : 'text-gray-200'}`
    }, displayText), React.createElement("div", {
      className: "flex items-center justify-between gap-2 mt-1"
    }, React.createElement("div", {
      className: "flex items-center gap-2 flex-wrap min-w-0"
    }, showFlags.cat && n.cat && React.createElement("span", {
      className: "text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 flex-shrink-0"
    }, n.cat, showFlags.subcat && n.subcat ? '・' + n.subcat : ''), isOff && React.createElement("span", {
      className: "text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-gray-500 flex-shrink-0"
    }, t.noticeOffBtn || '下架'), isLocal && React.createElement("span", {
      className: "text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-600 text-white flex-shrink-0"
    }, t.noticeLocalBadge || '本機')), React.createElement("span", {
      className: "text-[10px] text-gray-500 flex-shrink-0"
    }, "👁 ", openN)));
  })), noticeView && window.NoticeDetailModal && (() => {
    var NDM = window.NoticeDetailModal;
    return React.createElement(NDM, {
      notice: noticeView,
      settings: settings,
      t: t,
      onClose: () => setNoticeView(null),
      onMore: () => setNoticeView(null),
      onLogout: onLogout
    });
  })(), editing && editForm && React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center",
    onClick: closeEdit
  }, React.createElement("div", {
    className: "bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "p-4 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-gray-900"
  }, React.createElement("h3", {
    className: "text-base font-bold text-gray-100"
  }, t.noticeEdit || '編輯公告', " #", editing.id), React.createElement("button", {
    onClick: closeEdit,
    className: "text-gray-500 text-sm"
  }, "✕")), React.createElement("div", {
    className: "p-4 space-y-3"
  }, React.createElement("p", {
    className: "text-sm text-red-500 font-semibold leading-relaxed"
  }, "只需改中文,存檔後系統會在背景自動更新越南文翻譯;哪個欄位留空,AI 會依內文自動幫你補上。"), React.createElement("p", {
    className: "text-sm text-red-500 font-semibold leading-relaxed"
  }, "目前頁面是靜態的,每天晚上12點才會重新生成、計算已閱讀人數,所以你在重新整理後看到的還會是舊的,這是正常的。"), React.createElement("p", {
    className: "text-sm text-red-500 font-semibold leading-relaxed"
  }, "AI 翻譯及處理摘要等,每天免費是有額度的,請不要過度使用,造成額外費用。"), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, React.createElement("div", null, React.createElement("label", {
    className: "text-[10px] text-gray-500"
  }, "主分類", !editForm.cat && React.createElement("span", {
    className: "text-amber-500"
  }, "（留空→AI自動判斷）")), React.createElement("div", {
    className: "relative"
  }, React.createElement("input", {
    value: editForm.cat,
    onChange: e => updEdit('cat', e.target.value),
    className: "w-full bg-white/[0.06] rounded-lg pl-2 pr-6 py-1.5 text-xs text-gray-100",
    style: {
      boxSizing: 'border-box'
    }
  }), editForm.cat && React.createElement("button", {
    type: "button",
    onClick: () => updEdit('cat', ''),
    className: "absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 active:text-red-400 text-xs px-1"
  }, "✕"))), React.createElement("div", null, React.createElement("label", {
    className: "text-[10px] text-gray-500"
  }, "子分類", !editForm.subcat && React.createElement("span", {
    className: "text-amber-500"
  }, "（留空→AI自動判斷）")), React.createElement("div", {
    className: "relative"
  }, React.createElement("input", {
    value: editForm.subcat,
    onChange: e => updEdit('subcat', e.target.value),
    className: "w-full bg-white/[0.06] rounded-lg pl-2 pr-6 py-1.5 text-xs text-gray-100",
    style: {
      boxSizing: 'border-box'
    }
  }), editForm.subcat && React.createElement("button", {
    type: "button",
    onClick: () => updEdit('subcat', ''),
    className: "absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 active:text-red-400 text-xs px-1"
  }, "✕")))), React.createElement("div", null, React.createElement("label", {
    className: "text-[10px] text-gray-500"
  }, "標題", !editForm.title && React.createElement("span", {
    className: "text-amber-500"
  }, "（留空→AI自動生成）")), React.createElement("div", {
    className: "relative"
  }, React.createElement("input", {
    value: editForm.title,
    onChange: e => updEdit('title', e.target.value),
    className: "w-full bg-white/[0.06] rounded-lg pl-2 pr-6 py-1.5 text-xs text-gray-100",
    style: {
      boxSizing: 'border-box'
    }
  }), editForm.title && React.createElement("button", {
    type: "button",
    onClick: () => updEdit('title', ''),
    className: "absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 active:text-red-400 text-xs px-1"
  }, "✕"))), React.createElement("div", null, React.createElement("label", {
    className: "text-[10px] text-gray-500"
  }, "摘要", !editForm.summary && React.createElement("span", {
    className: "text-amber-500"
  }, "（留空→AI自動生成）")), React.createElement("div", {
    className: "relative"
  }, React.createElement("input", {
    value: editForm.summary,
    onChange: e => updEdit('summary', e.target.value),
    className: "w-full bg-white/[0.06] rounded-lg pl-2 pr-6 py-1.5 text-xs text-gray-100",
    style: {
      boxSizing: 'border-box'
    }
  }), editForm.summary && React.createElement("button", {
    type: "button",
    onClick: () => updEdit('summary', ''),
    className: "absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 active:text-red-400 text-xs px-1"
  }, "✕"))), React.createElement("div", null, React.createElement("label", {
    className: "text-[10px] text-gray-500"
  }, "內文"), React.createElement("textarea", {
    value: editForm.body,
    onChange: e => updEdit('body', e.target.value),
    rows: 5,
    className: "w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-gray-100 resize-none",
    style: {
      boxSizing: 'border-box'
    }
  })), React.createElement("div", null, React.createElement("label", {
    className: "text-[10px] text-gray-500"
  }, "標籤", !editForm.tags && React.createElement("span", {
    className: "text-amber-500"
  }, "（留空→AI自動生成）")), React.createElement("div", {
    className: "relative"
  }, React.createElement("input", {
    value: editForm.tags,
    onChange: e => updEdit('tags', e.target.value),
    className: "w-full bg-white/[0.06] rounded-lg pl-2 pr-6 py-1.5 text-xs text-gray-100",
    style: {
      boxSizing: 'border-box'
    }
  }), editForm.tags && React.createElement("button", {
    type: "button",
    onClick: () => updEdit('tags', ''),
    className: "absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 active:text-red-400 text-xs px-1"
  }, "✕"))), editStatus === 'saving' && React.createElement("p", {
    className: "text-[11px] text-amber-500 text-center"
  }, "存檔中…（背景AI處理，免費空間較慢）"), editStatus === 'saved' && React.createElement("p", {
    className: "text-[11px] text-emerald-500 text-center font-semibold"
  }, "✓ 已存檔，越南文已同步更新", editAiFilled.length > 0 ? '，AI 已自動補上：' + editAiFilled.map(k => FIELD_ZH[k] || k).join('、') : '', "。公告頁是快取，需等下次更新才會顯示，當下沒變是正常的。"), editStatus === 'savedNoVi' && React.createElement("p", {
    className: "text-[11px] text-amber-500 text-center font-semibold"
  }, "✓ 中文已存檔", editAiFilled.length === 0 ? '' : '（部分欄位待AI補，', "，AI 處理暫時失敗待補（不影響已填的中文內容）。"), editStatus && editStatus !== 'saving' && editStatus !== 'saved' && editStatus !== 'savedNoVi' && React.createElement("p", {
    className: "text-[11px] text-red-400 text-center"
  }, editStatus), React.createElement("div", {
    className: "pt-2 border-t border-white/[0.06] space-y-2"
  }, React.createElement("div", {
    className: "flex items-center justify-between"
  }, React.createElement("p", {
    className: "text-xs font-semibold text-gray-400"
  }, "誰有看"), React.createElement("div", {
    className: "flex gap-1.5"
  }, React.createElement("button", {
    onClick: () => checkRead(editing.id),
    disabled: readBusy,
    className: "text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-400 disabled:opacity-50"
  }, readBusy ? '查詢中…' : '查詢'), readInfo && readInfo.readers && readInfo.readers.length > 0 && React.createElement("button", {
    onClick: () => doCopy('公告編號：' + editing.id + '\n公告摘要：' + (editing.summary || editing.title || '') + '\n已閱讀（' + readInfo.readers.length + '人）：' + readInfo.readers.map(r => r.code).join('、'), '已閱讀名單'),
    className: "text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-400"
  }, "複製"))), readInfo && (readInfo.readers ? React.createElement("div", {
    className: "bg-white/[0.03] rounded-lg p-2.5"
  }, React.createElement("p", {
    className: "text-[11px] text-gray-500 mb-1"
  }, "共", readInfo.readers.length, "人"), React.createElement("div", {
    className: "flex flex-wrap gap-1"
  }, readInfo.readers.map(r => React.createElement("span", {
    key: r.code,
    className: "text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400"
  }, r.code)))) : null), React.createElement("div", {
    className: "flex items-center justify-between"
  }, React.createElement("p", {
    className: "text-xs font-semibold text-gray-400"
  }, "誰沒看"), React.createElement("div", {
    className: "flex gap-1.5"
  }, React.createElement("button", {
    onClick: () => checkUnread(editing.id),
    disabled: unreadBusy,
    className: "text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-400 disabled:opacity-50"
  }, unreadBusy ? '查詢中…' : '查詢'), unreadInfo && unreadInfo.total > 0 && React.createElement("button", {
    onClick: () => doCopy('公告編號：' + editing.id + '\n公告摘要：' + (editing.summary || editing.title || '') + '\n未閱讀（' + unreadInfo.total + '人）：\n' + ['day', 'night', 'other'].map(k => unreadInfo[k] && unreadInfo[k].length ? (k === 'day' ? '早班：' : k === 'night' ? '晚班：' : '未選班別：') + unreadInfo[k].join('、') : '').filter(Boolean).join('\n'), '未閱讀名單'),
    className: "text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-400"
  }, "複製"))), unreadInfo && React.createElement("div", {
    className: "bg-white/[0.03] rounded-lg p-2.5 space-y-1"
  }, React.createElement("p", {
    className: "text-[11px] text-gray-500"
  }, "未讀共", unreadInfo.total, "人"), unreadInfo.day.length > 0 && React.createElement("p", {
    className: "text-[11px] text-gray-400"
  }, "早班：", unreadInfo.day.join('、')), unreadInfo.night.length > 0 && React.createElement("p", {
    className: "text-[11px] text-gray-400"
  }, "晚班：", unreadInfo.night.join('、')), unreadInfo.other.length > 0 && React.createElement("p", {
    className: "text-[11px] text-gray-400"
  }, "未選班別：", unreadInfo.other.join('、'))), copyMsg && React.createElement("p", {
    className: "text-[11px] text-center text-emerald-400"
  }, copyMsg)), React.createElement("div", {
    className: "pt-2 border-t border-white/[0.06] grid grid-cols-3 gap-2"
  }, React.createElement("button", {
    onClick: submitEdit,
    disabled: editStatus === 'saving',
    className: "py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold active:bg-emerald-700 disabled:opacity-50"
  }, editStatus === 'saving' ? '…' : t.noticeSaveBtn || '修改'), React.createElement("button", {
    onClick: toggleStatus,
    disabled: toggleBusy,
    className: `py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 ${editing.status === 'off' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-red-600/20 text-red-400'}`
  }, toggleBusy ? '…' : editing.status === 'off' ? t.noticeOnBtn || '上架' : t.noticeOffBtn || '下架'), React.createElement("button", {
    onClick: doPushEdit,
    disabled: editPushBusy,
    className: "py-2.5 rounded-xl bg-[#06C755] text-white text-xs font-semibold active:opacity-80 disabled:opacity-50 flex items-center justify-center gap-1"
  }, editPushBusy ? '…' : React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "white"
  }, React.createElement("path", {
    d: "M12 2C6.5 2 2 5.6 2 10c0 3.9 3.6 7.2 8.4 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1.1 1 .6 1.1-.5 6.2-3.7 8.5-6.3C22.1 12.6 22 11.3 22 10c0-4.4-4.5-8-10-8z"
  })), "分享")), editPushMsg && React.createElement("p", {
    className: "text-[11px] text-center text-gray-400"
  }, editPushMsg)))), showAdd && React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center",
    onClick: closeAdd
  }, React.createElement("div", {
    className: "bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[88vh] overflow-y-auto",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "p-4 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-gray-900"
  }, React.createElement("h3", {
    className: "text-base font-bold text-gray-100"
  }, t.noticeAdd || '新增公告'), React.createElement("button", {
    onClick: closeAdd,
    className: "text-gray-500 text-sm"
  }, "✕")), React.createElement("div", {
    className: "p-4 space-y-4"
  }, React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.noticeContentLabel || '公告內容（中文）'), React.createElement("textarea", {
    value: content,
    onChange: e => setContent(e.target.value),
    rows: 6,
    placeholder: t.noticeContentPh || '直接貼上或輸入公告內容，其他交給 AI…',
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 resize-none",
    style: {
      boxSizing: 'border-box'
    }
  })), React.createElement("button", {
    onClick: runAI,
    disabled: aiStatus === 'processing' || aiStatus === 'publishing',
    className: "w-full py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold active:bg-sky-700 disabled:opacity-50"
  }, aiStatus === 'processing' ? 'AI 處理中…（免費空間較慢）' : '✨ ' + (t.noticeAIGen || 'AI 產生')), aiStatus && aiStatus !== 'processing' && aiStatus !== 'publishing' && !aiStatus.startsWith('done:') && React.createElement("p", {
    className: "text-[11px] text-amber-500 text-center"
  }, aiStatus), aiResult && React.createElement("div", {
    className: "space-y-2 bg-white/[0.03] rounded-xl p-3"
  }, React.createElement("p", {
    className: "text-[11px] text-gray-500"
  }, t.noticeAIPreview || 'AI 產生結果（可修改後發布）'), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, React.createElement("div", null, React.createElement("label", {
    className: "text-[10px] text-gray-500"
  }, "主分類"), React.createElement("input", {
    value: aiResult.cat || '',
    onChange: e => upd('cat', e.target.value),
    className: "w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-gray-100",
    style: {
      boxSizing: 'border-box'
    }
  })), React.createElement("div", null, React.createElement("label", {
    className: "text-[10px] text-gray-500"
  }, "子分類"), React.createElement("input", {
    value: aiResult.subcat || '',
    onChange: e => upd('subcat', e.target.value),
    className: "w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-gray-100",
    style: {
      boxSizing: 'border-box'
    }
  }))), React.createElement("div", null, React.createElement("label", {
    className: "text-[10px] text-gray-500"
  }, "標題"), React.createElement("input", {
    value: aiResult.title || '',
    onChange: e => upd('title', e.target.value),
    className: "w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-gray-100",
    style: {
      boxSizing: 'border-box'
    }
  })), React.createElement("div", null, React.createElement("label", {
    className: "text-[10px] text-gray-500"
  }, "摘要"), React.createElement("input", {
    value: aiResult.summary || '',
    onChange: e => upd('summary', e.target.value),
    className: "w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-gray-100",
    style: {
      boxSizing: 'border-box'
    }
  })), React.createElement("div", null, React.createElement("label", {
    className: "text-[10px] text-gray-500"
  }, "標籤"), React.createElement("input", {
    value: aiResult.tags || '',
    onChange: e => upd('tags', e.target.value),
    className: "w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-gray-100",
    style: {
      boxSizing: 'border-box'
    }
  })), React.createElement("div", null, React.createElement("label", {
    className: "text-[10px] text-emerald-600"
  }, "越南文標題"), React.createElement("input", {
    value: aiResult.titleVi || '',
    onChange: e => upd('titleVi', e.target.value),
    className: "w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-emerald-500",
    style: {
      boxSizing: 'border-box'
    }
  })), React.createElement("div", null, React.createElement("label", {
    className: "text-[10px] text-emerald-600"
  }, "越南文內容"), React.createElement("textarea", {
    value: aiResult.bodyVi || '',
    onChange: e => upd('bodyVi', e.target.value),
    rows: 3,
    className: "w-full bg-white/[0.06] rounded-lg px-2 py-1.5 text-xs text-emerald-500 resize-none",
    style: {
      boxSizing: 'border-box'
    }
  }))), aiStatus && aiStatus.startsWith('done:') && React.createElement("div", {
    className: "space-y-2"
  }, React.createElement("p", {
    className: "text-[11px] text-emerald-500 text-center font-semibold"
  }, "✓ 已發布（", aiStatus.slice(5), "號）。公告頁是快取，需等下次更新才會顯示，當下沒變是正常的。"), React.createElement("button", {
    onClick: () => doPushNotice(aiStatus.slice(5)),
    disabled: pushBusy,
    className: "w-full py-2.5 rounded-xl bg-[#06C755] text-white text-sm font-semibold active:bg-[#05a648] disabled:opacity-50"
  }, pushBusy ? '推播中…' : '📲 推播到我的LINE'), pushMsg && React.createElement("p", {
    className: "text-[11px] text-center text-gray-400"
  }, pushMsg), React.createElement("button", {
    onClick: () => checkUnread(aiStatus.slice(5)),
    disabled: unreadBusy,
    className: "w-full py-2 rounded-xl bg-white/[0.06] text-gray-400 text-xs font-semibold disabled:opacity-50"
  }, unreadBusy ? '查詢中…' : '查誰還沒看'), unreadInfo && React.createElement("div", {
    className: "bg-white/[0.03] rounded-lg p-2.5 space-y-1"
  }, React.createElement("p", {
    className: "text-[11px] text-gray-500"
  }, "未讀共", unreadInfo.total, "人"), unreadInfo.day.length > 0 && React.createElement("p", {
    className: "text-[11px] text-gray-400"
  }, "早班：", unreadInfo.day.join('、')), unreadInfo.night.length > 0 && React.createElement("p", {
    className: "text-[11px] text-gray-400"
  }, "晚班：", unreadInfo.night.join('、')), unreadInfo.other.length > 0 && React.createElement("p", {
    className: "text-[11px] text-gray-400"
  }, "其他：", unreadInfo.other.join('、'))), React.createElement("button", {
    onClick: closeAdd,
    className: "w-full py-2 rounded-xl bg-white/[0.04] text-gray-500 text-xs"
  }, "關閉")), React.createElement("div", {
    className: "pt-2 border-t border-white/[0.06]"
  }, React.createElement("button", {
    onClick: publish,
    disabled: !aiResult || aiStatus === 'publishing' || aiStatus && aiStatus.startsWith('done:'),
    className: "w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold active:bg-emerald-700 disabled:opacity-50"
  }, aiStatus === 'publishing' ? '發布中…' : aiStatus && aiStatus.startsWith('done:') ? '✓ 已發布' : t.noticePublishBtn || '發布公告'))))));
}
function CredentialCard({
  t,
  settings
}) {
  var code = settings && settings.code;
  var [status, setStatus] = React.useState(null);
  var [expiresAt, setExpiresAt] = React.useState('');
  var [reason, setReason] = React.useState('');
  var [daysLeft, setDaysLeft] = React.useState(null);
  var [showRenew, setShowRenew] = React.useState(false);
  var [devId] = React.useState(() => getDeviceId());
  var [ticketSeq, setTicketSeq] = React.useState('');
  var [ticketStatus, setTicketStatus] = React.useState('');
  var [cooldown, setCooldown] = React.useState(0);
  var [busy, setBusy] = React.useState(false);
  var [err, setErr] = React.useState('');
  var doCheck = React.useCallback(() => {
    if (!code || !hasMyKey(code)) {
      setStatus('ok');
      return;
    }
    setStatus('checking');
    (async () => {
      try {
        var key = getMyKey(code);
        var r = await gasVerifyKey(code, key);
        setStatus(r && r.ok && r.valid ? 'ok' : 'invalid');
        setExpiresAt(r && r.expiresAt || '');
        setReason(r && r.reason || '');
        if (r && r.expiresAt) {
          var d = Math.ceil((new Date(r.expiresAt.replace(/\//g, '-')).getTime() - Date.now()) / 86400000);
          setDaysLeft(d);
        } else {
          setDaysLeft(null);
        }
      } catch (_e) {
        setStatus('ok');
      }
    })();
  }, [code]);
  React.useEffect(() => {
    doCheck();
  }, [doCheck]);
  React.useEffect(() => {
    if (cooldown <= 0) return;
    var tm = setTimeout(() => setCooldown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearTimeout(tm);
  }, [cooldown]);
  var submitRenew = async () => {
    setBusy(true);
    setErr('');
    try {
      var r = await gasSubmitAction('E', code, {
        devId
      });
      setBusy(false);
      if (r && r.ok) {
        setTicketSeq(r.seq);
        setTicketStatus('');
      } else {
        setErr(r && r.error || '送出失敗');
      }
    } catch (e) {
      setBusy(false);
      setErr(String(e));
    }
  };
  var checkRenew = async () => {
    if (cooldown > 0 || ticketStatus === 'checking') return;
    setTicketStatus('checking');
    try {
      var r = await gasCheckAction(ticketSeq);
      if (r && r.ok) {
        if (r.status === 'approved') {
          setTicketStatus('approved');
          try {
            var today = new Date().toISOString().slice(0, 10);
            localStorage.setItem('key-check-date-' + code, today);
            localStorage.setItem('key-check-result-' + code, 'ok');
          } catch (_e) {}
          setTimeout(() => {
            setShowRenew(false);
            setTicketSeq('');
            setTicketStatus('');
            doCheck();
          }, 1500);
        } else {
          setTicketStatus('pending');
          setCooldown(60);
        }
      } else {
        setTicketStatus('error');
        setCooldown(60);
      }
    } catch (_e) {
      setTicketStatus('error');
      setCooldown(60);
    }
  };
  var showRenewBtn = status === 'invalid' || typeof daysLeft === 'number' && daysLeft <= 7 && daysLeft >= 0;
  return React.createElement(React.Fragment, null, React.createElement("div", {
    className: "bg-white/[0.04] rounded-xl px-4 py-3"
  }, React.createElement("div", {
    className: "flex items-center justify-between"
  }, React.createElement("span", {
    className: "text-sm text-gray-400"
  }, t.teacherCert || '老師專屬憑證'), React.createElement("span", {
    className: `text-sm font-semibold ${status === 'invalid' ? 'text-red-400' : 'text-emerald-400'}`
  }, status === 'checking' ? '…' : status === 'invalid' ? t.credentialInvalid || '無效' : '✓ ' + (t.certGot || '本機已領'))), expiresAt && React.createElement("div", {
    className: "flex items-center justify-between mt-1"
  }, React.createElement("span", {
    className: "text-xs text-gray-500"
  }, t.credentialExpiryLabel || '憑證期限'), React.createElement("span", {
    className: "text-xs text-gray-400"
  }, expiresAt, reason === 'left' ? '（' + (t.leftDateLabel || '離職日') + '）' : reason === 'expired' ? '（' + (t.expiredLabel || '已逾期') + '）' : ''))), showRenewBtn && React.createElement("button", {
    onClick: () => setShowRenew(true),
    className: "w-full py-2.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 text-sm font-semibold active:bg-amber-600/30"
  }, t.renewModalTitle || '憑證展期'), showRenew && React.createElement("div", {
    className: "fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center",
    onClick: () => setShowRenew(false)
  }, React.createElement("div", {
    className: "bg-gray-900 w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl",
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "p-4 border-b border-white/[0.06] flex items-center justify-between"
  }, React.createElement("h3", {
    className: "text-base font-bold text-gray-100"
  }, t.renewModalTitle), React.createElement("button", {
    onClick: () => setShowRenew(false),
    className: "text-gray-500 text-sm"
  }, "✕")), React.createElement("div", {
    className: "p-4 space-y-4"
  }, !ticketSeq ? React.createElement(React.Fragment, null, React.createElement("p", {
    className: "text-sm text-gray-400"
  }, t.renewModalBody), err && React.createElement("p", {
    className: "text-xs text-red-400 text-center"
  }, err), React.createElement("button", {
    onClick: submitRenew,
    disabled: busy,
    className: "w-full py-3 rounded-xl bg-amber-600 text-white font-bold disabled:opacity-50"
  }, busy ? '…' : t.submitActivation)) : React.createElement(React.Fragment, null, React.createElement("div", {
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
      var base = location.origin + (window.__appBase || location.pathname.replace(/index\.html$/, '')) + 'auth.html';
      var link = buildReqLink(base, ticketSeq);
      var zhMsg = (T.zh.lineTicketRenewPrefix || '').replace('{code}', code);
      var isVi = ticketSeq && ticketSeq[1] === '2';
      var viMsg = isVi ? (T.vi.lineTicketRenewPrefix || '').replace('{code}', code) : '';
      sendTicketFlex('📅 審核通知', zhMsg, link, viMsg);
    },
    className: "w-full px-3 py-4 rounded-xl text-base font-bold bg-[#06C755] text-white active:bg-[#05b34c]"
  }, t.ticketSend), React.createElement("button", {
    onClick: checkRenew,
    disabled: cooldown > 0 || ticketStatus === 'checking',
    className: `w-full py-3.5 rounded-xl font-bold transition-all ${cooldown > 0 || ticketStatus === 'checking' ? 'bg-white/[0.06] text-gray-600 cursor-not-allowed' : 'bg-amber-600 text-white'}`
  }, ticketStatus === 'checking' ? t.ticketChecking : cooldown > 0 ? fmtLog(t.ticketWaitCountdown, [String(cooldown)]) : t.ticketCheckBtn), ticketStatus === 'pending' && React.createElement("p", {
    className: "text-xs text-gray-500 text-center"
  }, t.ticketPending), ticketStatus === 'approved' && React.createElement("p", {
    className: "text-xs text-emerald-400 text-center font-semibold"
  }, t.ticketApproved), ticketStatus === 'error' && React.createElement("p", {
    className: "text-xs text-red-400 text-center"
  }, t.pwdLoginFail))))));
}
var HIDE_CERT_FOR_NEW = true;
function SettingsPage({
  settings,
  onUpdate,
  t,
  theme,
  setTheme,
  onClose,
  onLogout
}) {
  var [form, setForm] = useState({
    ...settings
  });
  var [gasTest, setGasTest] = useState('');
  var [keyAdminSec, setKeyAdminSec] = useState('');
  var [keyGenCode, setKeyGenCode] = useState('');
  var [keyGenResult, setKeyGenResult] = useState(null);
  var [claimInput, setClaimInput] = useState('');
  var [claimMsg, setClaimMsg] = useState('');
  var [saved, setSaved] = useState(false);
  var [subTab, setSubTab] = useState('home');
  useEffect(() => {
    try {
      var s = sessionStorage.getItem('__settingsSub');
      if (s) {
        setSubTab(s);
        sessionStorage.removeItem('__settingsSub');
      }
    } catch (e) {}
  }, []);
  var devId = getDeviceId();
  var [connMode, setConnMode] = useState(null);
  var [connInput, setConnInput] = useState('');
  var [connStatus, setConnStatus] = useState('');
  var [stores, setStores] = useState([]);
  var [logoutConfirm, setLogoutConfirm] = useState(false);
  var [basicCode, setBasicCode] = useState('');
  var [storeCode, setStoreCode] = useState('');
  var lang = t === T.zh ? 'zh' : 'vi';
  useEffect(() => {
    loadStores().then(setStores);
  }, []);
  var [lineUserId, setLineUserIdState] = useState(() => getMyLineUserId());
  var [liffBusy, setLiffBusy] = useState(false);
  var [bindChoice, setBindChoice] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('my-bind-pending') || 'null');
    } catch (_e) {
      return null;
    }
  });
  var [bindMsg, setBindMsg] = useState('');
  var [unbound, setUnbound] = useState(() => readUnboundNotice());
  useEffect(() => {
    if (!lineUserId) return;
    var alive = true;
    bindVerify(lineUserId).then(v => {
      if (alive && v === 'superseded') {
        setLineUserIdState('');
        setBindChoice(null);
        setUnbound(readUnboundNotice());
      }
    }).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  var [liffErr, setLiffErr] = useState('');
  useEffect(() => {
    if (lineUserId) return;
    if (getLineLogoutFlag()) return;
    if (typeof liff === 'undefined') return;
    (async () => {
      try {
        await liff.init({
          liffId: INDEX_LIFF_ID
        });
        if (liff.isLoggedIn()) {
          var profile = await liff.getProfile();
          if (profile && profile.userId) {
            saveLineProfile(profile);
          }
        }
      } catch (_e) {}
    })();
  }, []);
  var saveLineProfile = profile => {
    var isNew = getMyLineUserId() !== profile.userId;
    setMyLineUserId(profile.userId);
    setLineUserIdState(profile.userId);
    if (!isNew) return;
    (async () => {
      try {
        await bindClaimNow(profile.userId);
      } catch (_e) {}
      setUnbound(null);
      clearUnboundNotice();
      var res = await bindSyncCloud(profile.userId, settings);
      if (res.status === 'restored') {
        setBindMsg('✓ 已從雲端備份還原（' + (res.year || '') + ' 年・' + (res.updatedAt || '') + '），即將重新整理');
        setTimeout(() => location.reload(), 1500);
      } else if (res.status === 'choose') setBindChoice(res.pend);
    })();
  };
  var bindUseCloud = async () => {
    setBindMsg('還原中…');
    try {
      var f = await gasBackupFetch(lineUserId);
      if (f && f.ok) {
        var parsed = parsePersonalBackup(JSON.parse(f.jsonData));
        if (parsed.ok) {
          restorePersonalBackup(parsed);
          try {
            localStorage.removeItem('my-bind-pending');
          } catch (_e) {}
          setBindChoice(null);
          setBindMsg('✓ 已用雲端備份還原，即將重新整理');
          setTimeout(() => location.reload(), 1200);
          return;
        }
      }
    } catch (_e) {}
    setBindMsg('還原失敗，請稍後再試');
  };
  var bindUseLocal = async () => {
    setBindMsg('上傳中…');
    try {
      var y = settings.year || bizParts().y;
      var obj = makePersonalBackup(settings.code, y);
      var pj = JSON.stringify({
        store: settings.store || '',
        gender: settings.gender || '',
        shift: settings.shift || '',
        workStart: settings.workStart || '',
        workEnd: settings.workEnd || ''
      });
      var r = await gasBackupSubmit(lineUserId, settings.code, y, JSON.stringify(obj), pj);
      if (r && r.ok) {
        try {
          localStorage.removeItem('my-bind-pending');
        } catch (_e) {}
        setBindChoice(null);
        setBindMsg('✓ 已用本機資料覆蓋雲端備份');
        return;
      }
    } catch (_e) {}
    setBindMsg('上傳失敗，請稍後再試');
  };
  var bindLater = () => {
    setBindMsg('已先不處理：在你選擇前不會自動備份');
  };
  var doLineLogin = async () => {
    if (typeof liff === 'undefined') {
      setLiffErr(t.liffSdkFail || 'LINE SDK載入失敗，請檢查網路');
      return;
    }
    setLiffBusy(true);
    setLiffErr('');
    clearLineLogoutFlag();
    try {
      await liff.init({
        liffId: INDEX_LIFF_ID
      });
      var inLineApp = /Line\//i.test(navigator.userAgent || '');
      var inLiff = !!(liff.isInClient && liff.isInClient());
      if (liff.isLoggedIn()) {
        try {
          var profile = await liff.getProfile();
          if (profile && profile.userId) {
            saveLineProfile(profile);
            setLiffBusy(false);
            return;
          }
        } catch (_e) {
          liff.logout();
        }
      }
      if (inLineApp && !inLiff) {
        location.href = 'https://liff.line.me/' + INDEX_LIFF_ID + '?lineBind=1';
        return;
      }
      var cleanUrl = location.origin + location.pathname + location.hash;
      liff.login({
        redirectUri: cleanUrl
      });
    } catch (e) {
      setLiffBusy(false);
      setLiffErr(String(e));
    }
  };
  var doLineLogout = () => {
    try {
      if (typeof liff !== 'undefined' && liff.isLoggedIn()) liff.logout();
    } catch (_e) {}
    clearMyLineUserId();
    setLineUserIdState('');
    setLineLogoutFlag();
  };
  var upd = patch => {
    var ns = {
      ...form,
      ...patch
    };
    setForm(ns);
    onUpdate({
      ...ns,
      lastSyncBasic: settings.lastSyncBasic,
      lastSyncStore: settings.lastSyncStore
    });
  };
  var [goAuthChecking, setGoAuthChecking] = useState(false);
  var goAuth = async () => {
    if (goAuthChecking) return;
    setGoAuthChecking(true);
    var hasPerm = false;
    try {
      var sup = LS.get('supervisor-' + settings.code);
      if (sup && sup.status === 'approved') hasPerm = true;
    } catch (_e) {}
    if (!hasPerm) {
      try {
        var ctrl = new AbortController();
        var timer = setTimeout(() => ctrl.abort(), 4000);
        var res = await fetch('./admin.cfg', {
          cache: 'no-store',
          signal: ctrl.signal
        });
        clearTimeout(timer);
        if (res.ok) {
          var text = (await res.text()).trim();
          var lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
          var myHash = adminHash(settings.code);
          hasPerm = lines.some(l => {
            var parts = l.split(':');
            var h = parts.length >= 2 ? parts[parts.length - 1] : parts[0];
            return h === myHash;
          });
        }
      } catch (_e) {}
    }
    location.href = './auth.html#lang=' + (settings.lang || 'zh') + (hasPerm ? '&auto=1' : '');
  };
  var fld = (label, key, opt) => React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, label, opt && React.createElement("span", {
    className: "text-[10px] text-gray-600 ml-1"
  }, "(", t.optional, ")")), React.createElement("input", {
    value: form[key] || '',
    onChange: e => upd({
      [key]: e.target.value
    }),
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
  }));
  var Construction = () => React.createElement("div", {
    className: "flex flex-col items-center justify-center py-20 text-center"
  }, React.createElement("svg", {
    className: "w-12 h-12 text-gray-600 mb-3",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.5,
    d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
  })), React.createElement("p", {
    className: "text-sm text-gray-500"
  }, t.underConstruction));
  var isBound = () => {
    try {
      return localStorage.getItem('uuid-bound-' + settings.code) === '1';
    } catch (_e) {
      return false;
    }
  };
  var [reqErr, setReqErr] = useState('');
  var checkRequired = (cat, fields) => {
    var miss = [];
    if (cat === 'basic') {
      if (!fields.gender) miss.push(t.gender);
      if (!fields.addrCity) miss.push(t.city);
      if (!fields.addrDist) miss.push(t.district);
    } else if (cat === 'store') {
      if (!fields.shift) miss.push(t.shift);
      if (!fields.workStart) miss.push(t.workStart);
      if (!fields.workEnd) miss.push(t.workEnd);
      if (!fields.preg) miss.push(t.pregClient);
      if (!fields.oil) miss.push(t.oilLabel);
    }
    return miss;
  };
  var genCode = (cat, fields, setter) => {
    var miss = checkRequired(cat, fields);
    if (miss.length) {
      setReqErr(t.reqMissing + '：' + miss.join('、'));
      setter('');
      setTimeout(() => setReqErr(''), 4000);
      return;
    }
    setReqErr('');
    try {
      var enc = genReqCode(cat, settings.code, devId, fields, isBound());
      setter(enc);
    } catch (e) {
      setter('');
    }
  };
  var [confirmInput, setConfirmInput] = useState('');
  var [confirmMsg, setConfirmMsg] = useState('');
  var applyConfirm = async (cat, fields, snapKey) => {
    var ok = verifyConfirmCode(confirmInput, cat, settings.code, fields);
    if (ok) {
      var snap = {
        ...fields
      };
      if (cat === 'store') {
        snap.storeSel = form.storeSel || '';
      }
      var nowIso = new Date().toISOString();
      var syncKey = cat === 'store' ? 'lastSyncStore' : 'lastSyncBasic';
      var ns = {
        ...settings,
        ...form,
        [snapKey]: snap,
        [syncKey]: nowIso
      };
      try {
        var staff = await readStaff({});
        if (Array.isArray(staff) && staff.length) {
          var me = staff.find(s => String(s.code) === String(settings.code));
          if (me) {
            var merge = {};
            ['nameZh', 'nameVi', 'phone', 'email', 'storeSel', 'shift', 'permitNo', 'permitExpiry', 'permitDate', 'permitOrg'].forEach(k => {
              if (me[k] !== undefined && me[k] !== '' && me[k] !== null) merge[k] = me[k];
            });
            ns = {
              ...ns,
              ...merge
            };
          }
        }
      } catch (_e) {}
      onUpdate(ns);
      setForm(f => ({
        ...f,
        lastSyncBasic: ns.lastSyncBasic,
        lastSyncStore: ns.lastSyncStore
      }));
      if (confirmCodeIsBound(confirmInput)) {
        try {
          localStorage.setItem('uuid-bound-' + settings.code, '1');
        } catch (_e) {}
      }
      setConfirmMsg('ok');
      setConfirmInput('');
      setTimeout(() => setConfirmMsg(''), 3000);
    } else {
      setConfirmMsg('fail');
      setTimeout(() => setConfirmMsg(''), 3000);
    }
  };
  var onWorkStartChange = hh => {
    var patch = {
      workStart: hh
    };
    if (hh !== '') {
      var h = Number(hh);
      var eh = (h + 12) % 24;
      patch.workEnd = String(eh).padStart(2, '0') + ':00';
    }
    upd(patch);
  };
  useEffect(() => {
    if (!form.workStart && !settings.workStart) {
      var nowH = new Date().getHours();
      var eh = (nowH + 12) % 24;
      upd({
        workStart: String(nowH).padStart(2, '0') + ':00',
        workEnd: String(eh).padStart(2, '0') + ':00'
      });
    }
  }, []);
  var confirmedP = settings.confirmedProfile || null;
  var confirmedS = settings.confirmedStore || null;
  var isSupervisor = useMemo(() => {
    var gh = getGHConfig();
    return !!(gh && gh.token);
  }, []);
  var profileFields = ['gender', 'nameZh', 'nameVi', 'phone', 'email', 'addrCity', 'addrDist', 'addrDetail', 'school', 'major', 'schoolType', 'permitNo', 'permitDate', 'permitExpiry', 'permitOrg'];
  var storeFields = ['storeSel', 'shift', 'workStart', 'workEnd', 'workNote', 'unitPrice', 'preg', 'oil', 'techMentor', 'lockerNo'];
  var hasChg = (snapshot, fields, src) => {
    if (isSupervisor) return false;
    if (!snapshot) return fields.some(k => {
      var v = src[k];
      return v !== undefined && v !== '' && v !== null;
    });
    return fields.some(k => (snapshot[k] || '') !== ((src[k] !== undefined ? src[k] : '') || ''));
  };
  var basicChanged = hasChg(confirmedP, profileFields, form);
  var storeChanged = hasChg(confirmedS, storeFields, form);
  var anyChanged = basicChanged || storeChanged;
  var permitExpiring = (() => {
    if (!form.permitExpiry) return false;
    var exp = new Date(form.permitExpiry);
    var now = new Date();
    var days = (exp - now) / 86400000;
    return days <= 30;
  })();
  var prevHint = (snapshot, key, curVal) => {
    var sv = settings.staffValues && settings.staffValues[key];
    if (sv !== undefined && sv !== null && sv !== '') {
      if (String(sv) !== String(curVal || '')) return React.createElement("p", {
        className: "text-[11px] text-red-400 mt-1"
      }, t.staffValueHint, "：", String(sv));
      return null;
    }
    if (!snapshot || !(key in snapshot)) return null;
    var prev = snapshot[key];
    if ((prev || '') === (curVal || '')) return null;
    return React.createElement("p", {
      className: "text-[11px] text-red-400 mt-1"
    }, t.prevConfirmed, "：", prev || '—');
  };
  var fldP = (label, key, opt, snapshot) => React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, label, opt && React.createElement("span", {
    className: "text-[10px] text-gray-600 ml-1"
  }, "(", t.optional, ")")), React.createElement("input", {
    value: form[key] || '',
    onChange: e => upd({
      [key]: e.target.value
    }),
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
  }), prevHint(snapshot, key, form[key]));
  var Tgl = (on, fn) => React.createElement("button", {
    onClick: fn,
    className: `w-[51px] h-[31px] rounded-full flex items-center px-0.5 flex-shrink-0 ${on ? 'bg-amber-600 justify-end' : 'bg-white/[0.12] justify-start'}`
  }, React.createElement("span", {
    className: "w-[27px] h-[27px] rounded-full bg-white block shadow"
  }));
  var sheetHeight = subTab === 'home' || subTab === 'notice' || subTab === 'acupoint' ? 80 : 50;
  return React.createElement(BottomSheetModal, {
    heightPct: sheetHeight,
    onClose: onClose
  }, React.createElement("div", {
    className: "flex h-full fi"
  }, React.createElement("div", {
    className: "flex-1 w-full overflow-y-auto p-4 pb-8 space-y-5 min-w-0"
  }, subTab === 'home' && React.createElement("div", {
    className: "space-y-5 fi -mt-4"
  }, false && React.createElement("div", null, "        ", React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.year), React.createElement("div", {
    className: "flex items-center gap-3"
  }, React.createElement("button", {
    onClick: () => upd({
      year: form.year - 1
    }),
    className: "w-12 h-12 rounded-xl bg-white/[0.04] text-gray-300 text-2xl active:bg-white/[0.08]"
  }, "−"), React.createElement("span", {
    className: "text-2xl font-bold text-gray-100 flex-1 text-center tabular-nums"
  }, form.year), React.createElement("button", {
    onClick: () => upd({
      year: form.year + 1
    }),
    className: "w-12 h-12 rounded-xl bg-white/[0.04] text-gray-300 text-2xl active:bg-white/[0.08]"
  }, "+")))), React.createElement("div", {
    className: "text-[13px] font-semibold text-gray-400 px-1 -mb-3"
  }, lang === 'zh' ? '外觀' : 'Giao diện'), React.createElement("div", {
    className: "bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.06]"
  }, React.createElement("div", {
    className: "flex items-center gap-3 min-h-[52px] px-4"
  }, React.createElement("span", {
    className: "text-base text-gray-200"
  }, t.language), React.createElement("div", {
    className: "ml-auto flex bg-white/[0.06] rounded-lg p-0.5"
  }, [['zh', '中文'], ['vi', 'Tiếng Việt']].map(([c, l]) => React.createElement("button", {
    key: c,
    onClick: () => upd({
      lang: c
    }),
    className: `px-3.5 min-h-[36px] rounded-md text-sm font-semibold ${form.lang === c ? 'bg-amber-600 text-white' : 'text-gray-400'}`
  }, l)))), React.createElement("div", {
    className: "px-4 py-3"
  }, React.createElement("div", {
    className: "flex items-center justify-between mb-2"
  }, React.createElement("span", {
    className: "text-base text-gray-200"
  }, t.theme), React.createElement("span", {
    className: "text-sm text-gray-500"
  }, (window.__appUi || 'card') === 'classic' ? lang === 'zh' ? '經典(白色)' : 'Cổ điển' : lang === 'zh' ? '卡片(粉紅)' : 'Thẻ (hồng)')), React.createElement("div", {
    className: "flex gap-2.5"
  }, [['card', lang === 'zh' ? '卡片(粉紅)' : 'Thẻ (hồng)', 'linear-gradient(165deg,#ffc6de,#ffffff)'], ['classic', lang === 'zh' ? '經典(白色)' : 'Cổ điển', '#ffffff']].map(([k, l, c]) => React.createElement("button", {
    key: k,
    onClick: () => {
      if ((window.__appUi || 'card') === k) return;
      try {
        localStorage.setItem('app-ui', k);
      } catch (_e) {}
      location.reload();
    },
    className: `flex-1 h-12 rounded-xl border text-sm font-semibold text-gray-800 ${(window.__appUi || 'card') === k ? 'border-amber-500 ring-2 ring-amber-500' : 'border-white/[0.2]'}`,
    style: {
      background: c
    }
  }, l))), React.createElement("p", {
    className: "text-xs text-gray-500 mt-2"
  }, lang === 'zh' ? '切換後會重新載入頁面,資料不受影響。' : 'Trang sẽ tải lại sau khi đổi, dữ liệu không đổi.')), (window.__appUi || 'card') === 'card' && window.MPFx && React.createElement(FxRow, {
    lang: lang
  })), React.createElement("div", {
    className: "text-[13px] font-semibold text-gray-400 px-1 -mb-3"
  }, lang === 'zh' ? '帳號與備份' : 'Tài khoản & sao lưu'), React.createElement("div", {
    className: "bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.06]"
  }, React.createElement("div", {
    onClick: () => {
      if (!lineUserId && !liffBusy) doLineLogin();
    },
    className: `flex items-center gap-3 min-h-[60px] px-4 py-2 ${lineUserId ? '' : 'cursor-pointer active:bg-white/[0.04]'}`
  }, React.createElement("span", {
    className: "w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-extrabold text-white",
    style: {
      background: '#06C755'
    }
  }, "LINE"), React.createElement("div", {
    className: "flex-1 min-w-0"
  }, React.createElement("p", {
    className: "text-base text-gray-100"
  }, t.lineLoginTitle || 'LINE 登入'), React.createElement("p", {
    className: "text-xs text-gray-500"
  }, lineUserId ? t.lineLoginBoundDesc || '已綁定LINE帳號，雲端備份會用這個身份存取。' : lang === 'zh' ? '雲端備份、換手機找回資料需要' : 'Cần cho sao lưu và khôi phục khi đổi máy')), lineUserId ? React.createElement("span", {
    className: "text-sm font-semibold text-emerald-400"
  }, "✓ ", t.lineLoginBoundLabel || '已綁定') : React.createElement("span", {
    className: "text-sm font-semibold text-orange-400"
  }, liffBusy ? t.liffLoggingIn || '登入中…' : t.lineLoginBtn || '使用LINE登入', " ›")), liffErr && React.createElement("p", {
    className: "text-xs text-red-400 px-4 py-2"
  }, liffErr)), unbound && !lineUserId && React.createElement("div", {
    className: "rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-3 fi"
  }, React.createElement("p", {
    className: "text-base font-semibold text-amber-300"
  }, "已有新的綁定設備"), React.createElement("p", {
    className: "text-sm text-gray-300 leading-relaxed"
  }, "這個 LINE 帳號已在另一個環境", unbound.env ? '（' + unbound.env + '）' : '', "重新綁定", unbound.at ? '，時間 ' + unbound.at : '', "。為避免資料互相覆蓋，這個環境已自動解除 LINE 綁定，不會再自動備份。需要在這裡使用時，可以重新按「使用LINE登入」（會取代另一個環境的綁定）。"), React.createElement("button", {
    onClick: () => {
      clearUnboundNotice();
      setUnbound(null);
    },
    className: "w-full min-h-[44px] rounded-xl bg-white/[0.08] border border-white/[0.1] text-gray-100 font-semibold active:opacity-80"
  }, "知道了")), lineUserId && bindChoice && React.createElement("div", {
    className: "rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-3 fi"
  }, React.createElement("p", {
    className: "text-base font-semibold text-amber-300"
  }, "發現雲端上有備份"), React.createElement("p", {
    className: "text-sm text-gray-300 leading-relaxed"
  }, "備份檔日期時間：", React.createElement("b", {
    className: "text-gray-100"
  }, bindChoice.updatedAt || '—'), "（", bindChoice.year || '', " 年）。", bindChoice.cloudOnly ? '這裡目前沒有記錄，要還原雲端上的備份嗎？' : '這裡也有記錄，為避免互相覆蓋，請選擇要用哪一份。', "選擇之前不會自動備份。"), React.createElement("div", {
    className: "grid grid-cols-1 gap-2"
  }, React.createElement("button", {
    onClick: bindUseCloud,
    className: "min-h-[48px] rounded-xl bg-emerald-600 text-white font-semibold active:opacity-80"
  }, bindChoice.cloudOnly ? '還原雲端備份' : '用雲端備份還原（取代這裡的記錄）'), !bindChoice.cloudOnly && React.createElement("button", {
    onClick: bindUseLocal,
    className: "min-h-[48px] rounded-xl bg-white/[0.08] border border-white/[0.1] text-gray-100 font-semibold active:opacity-80"
  }, "用這裡的記錄覆蓋雲端"), React.createElement("button", {
    onClick: bindLater,
    className: "min-h-[44px] rounded-xl text-sm text-gray-400"
  }, bindChoice.cloudOnly ? '先不還原' : '先不處理')), bindMsg && React.createElement("p", {
    className: "text-sm text-center text-amber-200"
  }, bindMsg)), lineUserId && !bindChoice && bindMsg && React.createElement("p", {
    className: "text-sm text-center text-emerald-400"
  }, bindMsg), !lineUserId && React.createElement("p", {
    className: "text-xs text-gray-500 px-2 -mt-3 leading-relaxed"
  }, t.lineLoginDesc || '請先用LINE登入——這樣才能使用雲端備份，且能確保換手機或忘記密碼時，用LINE身份就能安全找回資料。'), !HIDE_COMPANY_FEATURES && React.createElement("div", {
    className: "space-y-2"
  }, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.lockPwdSectionTitle), React.createElement("label", {
    className: "flex items-center gap-2 bg-white/[0.04] rounded-xl px-4 py-3 cursor-pointer"
  }, React.createElement("input", {
    type: "checkbox",
    checked: !!form.disableHomePwd,
    onChange: e => upd({
      disableHomePwd: e.target.checked
    }),
    className: "w-4 h-4 rounded accent-amber-500"
  }), React.createElement("span", {
    className: "text-sm text-gray-300"
  }, t.disableHomePwdLabel)), React.createElement("div", {
    className: "bg-white/[0.04] rounded-xl px-4 py-3"
  }, React.createElement("label", {
    className: "text-xs text-gray-500 block mb-1.5"
  }, t.lockAutoTimeLabel), React.createElement("div", {
    className: "flex items-center gap-2"
  }, React.createElement("select", {
    value: [5, 10, 20, 30, 40, 50, 60, 120].includes(form.lockAutoTime) ? form.lockAutoTime : 60,
    onChange: e => upd({
      lockAutoTime: parseInt(e.target.value, 10)
    }),
    className: "bg-white/[0.06] border border-white/[0.08] rounded-lg px-2 py-1.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
  }, [5, 10, 20, 30, 40, 50, 60, 120].map(v => React.createElement("option", {
    key: v,
    value: v
  }, v))), React.createElement("span", {
    className: "text-xs text-gray-500"
  }, t.lockAutoTimeHint)))), window.WgPanel && React.createElement(React.Fragment, null, React.createElement("div", {
    className: "text-[13px] font-semibold text-gray-400 px-1 -mb-3"
  }, lang === 'zh' ? '小工具(測試)' : 'Widget (thử)'), React.createElement(window.WgPanel, {
    code: settings.code
  })), React.createElement("div", {
    className: "text-[13px] font-semibold text-gray-400 px-1 -mb-3"
  }, lang === 'zh' ? '首頁' : 'Trang chủ'), React.createElement("div", {
    className: "bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden divide-y divide-white/[0.06]"
  }, React.createElement("div", {
    className: "flex items-center justify-between gap-3 min-h-[52px] px-4"
  }, React.createElement("span", {
    className: "text-base text-gray-200"
  }, t.homeLayoutA), Tgl(form.homeShowA !== false, () => upd({
    homeShowA: form.homeShowA === false
  }))), React.createElement("div", {
    className: "flex items-center justify-between gap-3 min-h-[52px] px-4"
  }, React.createElement("span", {
    className: "text-base text-gray-200"
  }, t.homeLayoutB), Tgl(form.homeShowB !== false, () => upd({
    homeShowB: form.homeShowB === false
  }))), React.createElement("div", {
    className: "flex items-center justify-between gap-3 min-h-[52px] px-4"
  }, React.createElement("span", {
    className: "text-base text-gray-200"
  }, t.homeLayoutC), Tgl(form.homeShowC === true, () => upd({
    homeShowC: form.homeShowC !== true
  }))), React.createElement("div", {
    className: "flex items-center justify-between gap-3 min-h-[52px] px-4"
  }, React.createElement("span", {
    className: "text-base text-gray-200"
  }, t.bizCutoffLabel), React.createElement("input", {
    type: "time",
    value: form.bizCutoff || '06:30',
    onChange: e => upd({
      bizCutoff: e.target.value
    }),
    className: "bg-white/[0.06] border border-white/[0.08] rounded-lg px-2.5 min-h-[40px] text-base text-gray-100 focus:outline-none focus:border-amber-500"
  }))), React.createElement("p", {
    className: "text-xs text-gray-500 px-2 -mt-3 leading-relaxed"
  }, t.homeLayoutHint), React.createElement("details", {
    className: "-mt-3 px-2"
  }, React.createElement("summary", {
    className: "text-xs text-amber-400 min-h-[32px] flex items-center cursor-pointer"
  }, lang === 'zh' ? '換日時間說明' : 'Giải thích giờ chuyển ngày'), React.createElement("p", {
    className: "text-xs text-gray-500 leading-relaxed pb-1"
  }, t.bizCutoffHint)), (() => {
    var ghLocal = getGHConfig();
    var hasConn = !!(ghLocal && ghLocal.token);
    return React.createElement("div", {
      className: "space-y-2"
    }, (!HIDE_CERT_FOR_NEW || hasMyKey(settings.code)) && React.createElement(CredentialCard, {
      t: t,
      settings: settings
    }), !HIDE_CERT_FOR_NEW && !hasConn && !connMode && React.createElement("button", {
      onClick: () => setConnMode('apply'),
      className: "w-full py-2.5 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 text-sm font-semibold active:bg-amber-600/30"
    }, t.connApply), connMode === 'apply' && React.createElement("div", {
      className: "space-y-3 fi"
    }, React.createElement("div", {
      className: "flex justify-center"
    }, React.createElement("div", {
      className: "bg-white p-2.5 rounded-xl"
    }, React.createElement("img", {
      src: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(settings.code + ':' + devId)}`,
      alt: "QR",
      className: "w-40 h-40"
    }))), React.createElement("p", {
      className: "text-[10px] text-gray-600 text-center font-mono select-all break-all"
    }, settings.code, ":", devId), React.createElement("button", {
      onClick: () => {
        var link = buildReqLink(location.origin + (window.__appBase || location.pathname.replace(/index\.html$/, '')) + 'auth.html', genConnReq(settings.code, devId));
        sendTicketFlex('🔗 連線申請', t.lineConnReqPrefix, link, settings.lang === 'vi' ? T.vi.lineConnReqPrefix : '');
      },
      className: "w-full py-2.5 rounded-xl text-white text-sm font-bold bg-[#06C755] active:bg-[#05b34c]"
    }, t.sendViaLine), React.createElement("div", null, React.createElement("label", {
      className: "text-xs text-gray-500 mb-1 block"
    }, t.connCode), React.createElement("textarea", {
      value: connInput,
      onChange: e => setConnInput(e.target.value),
      rows: 2,
      placeholder: t.connInput,
      className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500 resize-none"
    })), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement("button", {
      onClick: () => {
        setConnMode(null);
        setConnInput('');
        setConnStatus('');
      },
      className: "flex-1 py-2.5 bg-white/[0.04] rounded-xl text-gray-500 text-sm"
    }, t.cancel), React.createElement("button", {
      onClick: () => {
        var ghCfg = verifyActToken(connInput.trim(), settings.code, devId);
        if (ghCfg) {
          saveGHConfigLocal(ghCfg);
          setConnStatus(t.connOk);
          setConnMode(null);
          setConnInput('');
        } else {
          setConnStatus(t.connFail);
        }
      },
      className: "flex-1 py-2.5 bg-amber-600 rounded-xl text-white text-sm font-bold"
    }, t.confirm)), connStatus && React.createElement("p", {
      className: `text-xs text-center ${connStatus.includes('✓') ? 'text-emerald-400' : 'text-red-400'}`
    }, connStatus)));
  })(), (() => {
    var gh = getGHConfig();
    if (!(gh && gh.token)) return null;
    return React.createElement("div", {
      className: "space-y-2 bg-white/[0.02] border border-emerald-500/20 rounded-xl p-3"
    }, React.createElement("label", {
      className: "text-xs text-emerald-400 font-semibold mb-1 block"
    }, t.gasSettingTitle), React.createElement("input", {
      value: form.gasUrl || '',
      onChange: e => upd({
        gasUrl: e.target.value
      }),
      placeholder: "https://script.google.com/.../exec",
      className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-emerald-500"
    }), React.createElement("button", {
      onClick: async () => {
        if (form.gasUrl) setGasUrl(form.gasUrl);
        setGasTest('...');
        try {
          var r = await gasCall('ping', {});
          setGasTest(r && r.ok ? 'ok' : 'fail');
        } catch (_e) {
          setGasTest('fail');
        }
        setTimeout(() => setGasTest(''), 3000);
      },
      className: "w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold active:bg-emerald-700"
    }, gasTest === '...' ? t.gasTesting : gasTest === 'ok' ? '✓ ' + t.gasTestOk : gasTest === 'fail' ? '✗ ' + t.gasTestFail : t.gasTestBtn), React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, t.gasSettingHint));
  })(), (() => {
    var gh = getGHConfig();
    if (!(gh && gh.token) || !getGasUrl()) return null;
    return React.createElement("div", {
      className: "space-y-2 bg-white/[0.02] border border-emerald-500/20 rounded-xl p-3"
    }, React.createElement("label", {
      className: "text-xs text-emerald-400 font-semibold block"
    }, t.keyGenTitle), React.createElement("input", {
      value: keyAdminSec,
      onChange: e => setKeyAdminSec(e.target.value),
      type: "password",
      placeholder: t.keyAdminSecPh,
      className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-emerald-500"
    }), React.createElement("input", {
      value: keyGenCode,
      onChange: e => setKeyGenCode(e.target.value),
      placeholder: t.keyGenCodePh,
      className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-emerald-500"
    }), React.createElement("button", {
      onClick: async () => {
        if (!keyGenCode.trim() || !keyAdminSec.trim()) return;
        setKeyGenResult({
          loading: true
        });
        var r = await issueKey(keyGenCode.trim(), keyAdminSec.trim());
        setKeyGenResult(r);
      },
      className: "w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold active:bg-emerald-700"
    }, keyGenResult && keyGenResult.loading ? t.gasTesting : t.keyGenBtn), keyGenResult && !keyGenResult.loading && (keyGenResult.ok ? React.createElement("div", {
      className: "bg-emerald-500/10 rounded-lg p-2.5 space-y-1"
    }, React.createElement("p", {
      className: "text-[11px] text-gray-400"
    }, t.keyClaimCode, "："), React.createElement("p", {
      className: "text-sm text-emerald-400 font-mono font-bold break-all select-all"
    }, keyGenResult.claim), React.createElement("p", {
      className: "text-[10px] text-gray-500"
    }, t.keyClaimHint)) : React.createElement("p", {
      className: "text-[11px] text-red-400"
    }, "✗ ", keyGenResult.error || t.gasTestFail)));
  })(), !HIDE_CERT_FOR_NEW && settings.code && getGasUrl() && !hasMyKey(settings.code) && React.createElement("div", {
    className: "space-y-2 bg-white/[0.02] border border-amber-500/20 rounded-xl p-3"
  }, React.createElement("label", {
    className: "text-xs text-amber-400 font-semibold block"
  }, t.keyClaimTitle), React.createElement("input", {
    value: claimInput,
    onChange: e => setClaimInput(e.target.value.toUpperCase()),
    placeholder: t.keyClaimPh,
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono text-center focus:outline-none focus:border-amber-500"
  }), React.createElement("button", {
    onClick: async () => {
      if (!claimInput.trim()) return;
      setClaimMsg('...');
      var r = await claimMyKey(settings.code, claimInput.trim());
      setClaimMsg(r.ok ? 'ok' : 'fail');
      if (r.ok) setTimeout(() => setClaimMsg(''), 2000);
    },
    className: "w-full py-2 rounded-lg bg-amber-600 text-white text-xs font-semibold active:bg-amber-700"
  }, claimMsg === '...' ? t.gasTesting : claimMsg === 'ok' ? '✓ ' + t.keyClaimOk : claimMsg === 'fail' ? '✗ ' + t.keyClaimFail : t.keyClaimBtn), React.createElement("p", {
    className: "text-[11px] text-gray-500"
  }, t.keyClaimTeacherHint)), React.createElement("details", {
    className: "bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden"
  }, React.createElement("summary", {
    className: "flex items-center justify-between min-h-[52px] px-4 cursor-pointer text-base text-gray-200 list-none"
  }, React.createElement("span", null, t.privacyTitle), React.createElement("span", {
    className: "text-gray-500"
  }, "›")), React.createElement("div", {
    className: "px-4 pb-3 space-y-2"
  }, React.createElement("p", {
    className: "text-[13px] text-gray-400 leading-relaxed"
  }, t.privacyBody), React.createElement("p", {
    className: "text-[13px] text-gray-400 leading-relaxed"
  }, t.browserNote), React.createElement("p", {
    className: "text-[13px] text-gray-400 leading-relaxed"
  }, t.myBookingNote), React.createElement("p", {
    className: "text-[13px] text-red-400 leading-relaxed"
  }, t.backupReminder))), onLogout && React.createElement("div", {
    className: "pt-2 border-t border-white/[0.06]"
  }, React.createElement("button", {
    onClick: () => {
      if (logoutConfirm) {
        doLineLogout();
        onLogout();
      } else {
        setLogoutConfirm(true);
        setTimeout(() => setLogoutConfirm(false), 3000);
      }
    },
    className: `w-full min-h-[52px] rounded-2xl border border-white/[0.06] text-base font-semibold ${logoutConfirm ? 'bg-red-600 text-white' : 'bg-white/[0.04] text-red-400'}`
  }, logoutConfirm ? t.logoutConfirmBtn : t.logoutBtn), React.createElement("p", {
    className: "text-xs text-gray-500 text-center mt-2"
  }, t.logoutHint))), subTab === 'basic' && React.createElement("div", {
    className: "space-y-4 fi"
  }, React.createElement("h2", {
    className: "text-lg font-bold text-gray-100"
  }, t.secBasic), basicChanged && React.createElement("div", {
    className: "bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"
  }, React.createElement("p", {
    className: "text-xs text-red-400"
  }, "❗ ", t.needConfirm)), permitExpiring && React.createElement("div", {
    className: "bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"
  }, React.createElement("p", {
    className: "text-xs text-red-400"
  }, "❗ ", t.permitExpiringSoon, form.permitExpiry ? '：' + form.permitExpiry : '')), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.teacherCode), React.createElement("div", {
    className: "bg-white/[0.04] rounded-xl px-3 py-2.5 text-base text-gray-300 font-mono"
  }, settings.code)), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.gender, React.createElement("span", {
    className: "text-red-400 ml-0.5"
  }, "*")), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, [['M', t.genderM], ['F', t.genderF]].map(([g, l]) => React.createElement("button", {
    key: g,
    onClick: () => upd({
      gender: g
    }),
    className: `py-2.5 rounded-xl text-sm font-semibold ${form.gender === g ? 'bg-amber-600 text-white' : 'bg-white/[0.04] text-gray-500'}`
  }, l)))), fldP(t.nameZh, 'nameZh', false, confirmedP), fldP(t.nameVi, 'nameVi', false, confirmedP), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.phone2), React.createElement("input", {
    value: form.phone || '',
    onChange: e => {
      var v = e.target.value.split('').filter(ch => ch >= '0' && ch <= '9').join('').slice(0, 10);
      if (v.length > 7) v = v.slice(0, 4) + '-' + v.slice(4, 7) + '-' + v.slice(7);else if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4);
      upd({
        phone: v
      });
    },
    inputMode: "tel",
    placeholder: "09xx-xxx-xxx",
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
  }), prevHint(confirmedP, 'phone', form.phone)), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.email), React.createElement("input", {
    value: form.email || '',
    onChange: e => upd({
      email: e.target.value
    }),
    inputMode: "email",
    placeholder: "example@mail.com",
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
  }), prevHint(confirmedP, 'email', form.email)), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.address), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, React.createElement("div", null, React.createElement("span", {
    className: "text-[10px] text-gray-400 mb-0.5 block"
  }, t.city, React.createElement("span", {
    className: "text-red-400"
  }, "*")), React.createElement("select", {
    value: form.addrCity || '',
    onChange: e => upd({
      addrCity: e.target.value,
      addrDist: ''
    }),
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-amber-500"
  }, React.createElement("option", {
    value: ""
  }, t.selectCity), Object.keys(TW_REGIONS).map(c => React.createElement("option", {
    key: c,
    value: c
  }, c)))), React.createElement("div", null, React.createElement("span", {
    className: "text-[10px] text-gray-400 mb-0.5 block"
  }, t.district, React.createElement("span", {
    className: "text-red-400"
  }, "*")), form.addrCity && TW_REGIONS[form.addrCity] && TW_REGIONS[form.addrCity].length > 0 ? React.createElement("select", {
    value: form.addrDist || '',
    onChange: e => upd({
      addrDist: e.target.value
    }),
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-amber-500"
  }, React.createElement("option", {
    value: ""
  }, t.selectDist), TW_REGIONS[form.addrCity].map(d => React.createElement("option", {
    key: d,
    value: d
  }, d))) : React.createElement("input", {
    value: form.addrDist || '',
    onChange: e => upd({
      addrDist: e.target.value
    }),
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-2 py-2.5 text-xs text-gray-100 focus:outline-none focus:border-amber-500"
  }))), React.createElement("div", {
    className: "mt-2"
  }, React.createElement("span", {
    className: "text-[10px] text-gray-500 mb-0.5 block"
  }, t.addrDetail), React.createElement("input", {
    value: form.addrDetail || '',
    onChange: e => upd({
      addrDetail: e.target.value
    }),
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
  }))), React.createElement("div", {
    className: "bg-white/[0.02] border border-white/[0.08] rounded-xl p-3 space-y-3"
  }, React.createElement("p", {
    className: "text-xs text-amber-400 font-semibold"
  }, t.foreignSection), fldP(t.permitNoLabel, 'permitNo', false, confirmedP), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, React.createElement("div", null, React.createElement("label", {
    className: "text-[11px] text-gray-400 mb-1 block"
  }, t.permitDate), React.createElement("div", {
    className: "flex gap-1"
  }, React.createElement("input", {
    type: "date",
    value: form.permitDate || '',
    onChange: e => upd({
      permitDate: e.target.value
    }),
    className: "flex-1 min-w-0 bg-white/[0.06] border border-white/[0.08] rounded-xl px-1 py-2 text-[10px] text-gray-100 focus:outline-none focus:border-amber-500",
    style: {
      colorScheme: 'dark'
    }
  }), form.permitDate && React.createElement("button", {
    onClick: () => upd({
      permitDate: ''
    }),
    className: "w-7 flex-shrink-0 rounded-lg bg-white/[0.06] text-gray-500 text-xs active:bg-red-500/20"
  }, "✕"))), React.createElement("div", null, React.createElement("label", {
    className: "text-[11px] text-gray-400 mb-1 block"
  }, t.permitExpiry), React.createElement("div", {
    className: "flex gap-1"
  }, React.createElement("input", {
    type: "date",
    value: form.permitExpiry || '',
    onChange: e => upd({
      permitExpiry: e.target.value
    }),
    className: "flex-1 min-w-0 bg-white/[0.06] border border-white/[0.08] rounded-xl px-1 py-2 text-[10px] text-gray-100 focus:outline-none focus:border-amber-500",
    style: {
      colorScheme: 'dark'
    }
  }), form.permitExpiry && React.createElement("button", {
    onClick: () => upd({
      permitExpiry: ''
    }),
    className: "w-7 flex-shrink-0 rounded-lg bg-white/[0.06] text-gray-500 text-xs active:bg-red-500/20"
  }, "✕")))), prevHint(confirmedP, 'permitDate', form.permitDate), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.permitOrgOpt), React.createElement("select", {
    value: form.permitOrg || '',
    onChange: e => upd({
      permitOrg: e.target.value
    }),
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
  }, React.createElement("option", {
    value: ""
  }, "—"), React.createElement("option", {
    value: t.orgWDA
  }, t.orgWDA), React.createElement("option", {
    value: t.orgNIA
  }, t.orgNIA), React.createElement("option", {
    value: t.orgOther
  }, t.orgOther)), prevHint(confirmedP, 'permitOrg', form.permitOrg)), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.schoolType), React.createElement("select", {
    value: form.schoolType || 'uni',
    onChange: e => upd({
      schoolType: e.target.value
    }),
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
  }, React.createElement("option", {
    value: "lang"
  }, t.schoolTypeLang), React.createElement("option", {
    value: "uni"
  }, t.schoolTypeUni), React.createElement("option", {
    value: "master"
  }, t.schoolTypeMaster), React.createElement("option", {
    value: "phd"
  }, t.schoolTypePhd))), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, React.createElement("div", null, fldP(t.school, 'school', false, confirmedP)), React.createElement("div", null, fldP(t.major, 'major', false, confirmedP)))), React.createElement("div", {
    className: "pt-2 space-y-2"
  }, React.createElement("button", {
    onClick: () => genCode('basic', {
      nameZh: form.nameZh,
      nameVi: form.nameVi,
      phone: form.phone,
      email: form.email,
      addrCity: form.addrCity,
      addrDist: form.addrDist,
      addrDetail: form.addrDetail,
      school: form.school,
      major: form.major,
      schoolType: form.schoolType,
      permitNo: form.permitNo,
      permitDate: form.permitDate,
      permitExpiry: form.permitExpiry,
      permitOrg: form.permitOrg,
      gender: form.gender
    }, setBasicCode),
    className: "w-full py-3 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700"
  }, t.basicUpdateCode), reqErr && React.createElement("p", {
    className: "text-xs text-red-400 text-center fi"
  }, reqErr), basicCode && React.createElement("div", {
    className: "space-y-2 fi"
  }, React.createElement("div", {
    className: "flex justify-center"
  }, React.createElement("div", {
    className: "bg-white p-2.5 rounded-xl"
  }, React.createElement("img", {
    src: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(basicCode)}`,
    alt: "QR",
    className: "w-44 h-44"
  }))), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, React.createElement("button", {
    onClick: () => {
      navigator.clipboard.writeText(basicCode).catch(() => {});
    },
    className: "py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 text-sm font-medium"
  }, t.copyBtn), React.createElement("button", {
    onClick: () => {
      var link = buildReqLink(location.origin + (window.__appBase || location.pathname.replace(/index\.html$/, '')) + 'auth.html', basicCode);
      sendTicketFlex('📝 審核通知', t.lineReqPrefix, link, settings.lang === 'vi' ? T.vi.lineReqPrefix : '');
    },
    className: "py-2.5 rounded-xl text-white text-sm font-bold bg-[#06C755] active:bg-[#05b34c]"
  }, t.sendViaLine)), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-500 mb-1 block"
  }, t.basicConfirmCode), React.createElement("input", {
    value: confirmInput,
    onChange: e => setConfirmInput(e.target.value),
    placeholder: t.basicConfirmCode,
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500"
  })), React.createElement("button", {
    onClick: () => applyConfirm('basic', {
      nameZh: form.nameZh,
      nameVi: form.nameVi,
      phone: form.phone,
      email: form.email,
      addrCity: form.addrCity,
      addrDist: form.addrDist,
      addrDetail: form.addrDetail,
      school: form.school,
      major: form.major,
      schoolType: form.schoolType,
      permitNo: form.permitNo,
      permitDate: form.permitDate,
      permitExpiry: form.permitExpiry,
      permitOrg: form.permitOrg,
      gender: form.gender
    }, 'confirmedProfile'),
    className: "w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700"
  }, t.confirm), settings.lastSyncBasic && React.createElement("p", {
    className: "text-[11px] text-gray-500 mt-1.5 text-center"
  }, t.lastSyncAt, "：", fmtSyncTime(settings.lastSyncBasic)), confirmMsg === 'ok' && React.createElement("p", {
    className: "text-xs text-center text-emerald-400 fi"
  }, "✓ ", t.confirmSuccess), confirmMsg === 'fail' && React.createElement("p", {
    className: "text-xs text-center text-red-400 fi"
  }, t.confirmFail)))), subTab === 'store' && React.createElement("div", {
    className: "space-y-4 fi"
  }, React.createElement("h2", {
    className: "text-lg font-bold text-gray-100"
  }, t.secStore), storeChanged && React.createElement("div", {
    className: "bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5"
  }, React.createElement("p", {
    className: "text-xs text-red-400"
  }, "❗ ", t.needConfirm)), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.teacherCode), React.createElement("div", {
    className: "bg-white/[0.04] rounded-xl px-3 py-2.5 text-base text-gray-300 font-mono"
  }, settings.code)), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.curStore), React.createElement("select", {
    value: form.storeSel || settings.store || '',
    onChange: e => upd({
      storeSel: e.target.value
    }),
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
  }, React.createElement("option", {
    value: ""
  }, "—"), stores.map(s => React.createElement("option", {
    key: s,
    value: s
  }, s))), form.storeSel && form.storeSel !== settings.store && React.createElement("p", {
    className: "text-xs text-red-400 mt-1"
  }, t.applyChange, "：", form.storeSel)), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.shift, React.createElement("span", {
    className: "text-red-400 ml-0.5"
  }, "*")), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, [['day', t.shiftDay], ['night', t.shiftNight]].map(([s, l]) => React.createElement("button", {
    key: s,
    onClick: () => upd({
      shift: s
    }),
    className: `py-2.5 rounded-xl text-sm font-semibold ${form.shift === s ? 'bg-amber-600 text-white' : 'bg-white/[0.04] text-gray-500'}`
  }, l)))), React.createElement("div", {
    className: "grid grid-cols-5 gap-3"
  }, React.createElement("div", {
    className: "col-span-2"
  }, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.workStart, React.createElement("span", {
    className: "text-red-400 ml-0.5"
  }, "*")), React.createElement("select", {
    value: form.workStart ? String(Number(form.workStart.split(':')[0])) : '',
    onChange: e => onWorkStartChange(e.target.value),
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-1 py-2.5 text-sm text-center text-gray-100 focus:outline-none focus:border-amber-500"
  }, React.createElement("option", {
    value: ""
  }, "--"), Array.from({
    length: 24
  }, (_, i) => React.createElement("option", {
    key: i,
    value: i
  }, String(i).padStart(2, '0'), ":00")))), React.createElement("div", {
    className: "col-span-2 col-start-4"
  }, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.workEnd, React.createElement("span", {
    className: "text-red-400 ml-0.5"
  }, "*")), React.createElement("select", {
    value: form.workEnd ? String(Number(form.workEnd.split(':')[0])) : '',
    onChange: e => upd({
      workEnd: e.target.value === '' ? '' : String(Number(e.target.value)).padStart(2, '0') + ':00'
    }),
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-1 py-2.5 text-sm text-center text-gray-100 focus:outline-none focus:border-amber-500"
  }, React.createElement("option", {
    value: ""
  }, "--"), Array.from({
    length: 24
  }, (_, i) => React.createElement("option", {
    key: i,
    value: i
  }, String(i).padStart(2, '0'), ":00"))))), confirmedS && ((confirmedS.workStart || '') !== (form.workStart || '') || (confirmedS.workEnd || '') !== (form.workEnd || '')) && React.createElement("p", {
    className: "text-[11px] text-red-400"
  }, t.prevConfirmed, "：", confirmedS.workStart || '—', " ~ ", confirmedS.workEnd || '—'), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.workNote, React.createElement("span", {
    className: "text-[10px] text-gray-600 ml-1"
  }, "(", t.optional, ")")), React.createElement("textarea", {
    value: form.workNote || '',
    onChange: e => upd({
      workNote: e.target.value
    }),
    rows: 2,
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500 resize-none"
  }), prevHint(confirmedS, 'workNote', form.workNote)), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.unitPrice), React.createElement("div", {
    className: "relative"
  }, React.createElement("span", {
    className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
  }, "$"), React.createElement("input", {
    type: "number",
    inputMode: "numeric",
    value: form.unitPrice,
    onChange: e => upd({
      unitPrice: parseInt(e.target.value) || 0
    }),
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl pl-8 pr-3 py-3 text-base text-gray-100 focus:outline-none focus:border-amber-500"
  }))), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-2 block"
  }, t.skills), React.createElement("div", {
    className: "space-y-2"
  }, SKILL_KEYS.map((k, i) => ({
    k,
    label: t[k],
    price: SKILL_PRICES[i]
  })).map(({
    k,
    label,
    price
  }) => {
    var _form$skills;
    var checked = ((_form$skills = form.skills) === null || _form$skills === void 0 ? void 0 : _form$skills[k]) || false;
    return React.createElement("button", {
      key: k,
      onClick: () => upd({
        skills: {
          ...(form.skills || {}),
          [k]: !checked
        }
      }),
      className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${checked ? 'bg-white/[0.06] border border-amber-500/30' : 'bg-white/[0.02] border border-white/[0.06]'}`
    }, React.createElement("div", {
      className: `w-5 h-5 rounded flex items-center justify-center text-xs ${checked ? 'bg-amber-600 text-white' : 'bg-white/[0.06] text-gray-700'}`
    }, checked ? '✓' : ''), React.createElement("span", {
      className: `text-sm ${checked ? 'text-gray-200' : 'text-gray-500'}`
    }, label), price != null && React.createElement("span", {
      className: "text-xs text-gray-600 ml-auto"
    }, "$", price));
  }))), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.pregClient, React.createElement("span", {
    className: "text-red-400 ml-0.5"
  }, "*")), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, [['yes', t.accept], ['no', t.reject]].map(([v, l]) => React.createElement("button", {
    key: v,
    onClick: () => upd({
      preg: v
    }),
    className: `py-2.5 rounded-xl text-sm font-semibold ${form.preg === v ? 'bg-amber-600 text-white' : 'bg-white/[0.04] text-gray-500'}`
  }, l)))), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.oilLabel, React.createElement("span", {
    className: "text-red-400 ml-0.5"
  }, "*")), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, [['yes', t.accept], ['no', t.reject]].map(([v, l]) => React.createElement("button", {
    key: v,
    onClick: () => upd({
      oil: v
    }),
    className: `py-2.5 rounded-xl text-sm font-semibold ${form.oil === v ? 'bg-amber-600 text-white' : 'bg-white/[0.04] text-gray-500'}`
  }, l)))), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.techMentor), React.createElement("input", {
    value: form.techMentor || '',
    onChange: e => upd({
      techMentor: e.target.value
    }),
    placeholder: t.techMentorPlaceholder,
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-amber-500"
  }), prevHint(confirmedS, 'techMentor', form.techMentor)), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-400 mb-1 block"
  }, t.lockerNo), React.createElement("select", {
    value: form.lockerNo || '',
    onChange: e => upd({
      lockerNo: e.target.value
    }),
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-amber-500"
  }, React.createElement("option", {
    value: ""
  }, "--"), Array.from({
    length: 100
  }, (_, i) => i + 1).map(n => React.createElement("option", {
    key: n,
    value: n
  }, n, t === T.zh ? '號' : ''))), prevHint(confirmedS, 'lockerNo', form.lockerNo)), React.createElement("div", {
    className: "pt-2 space-y-2"
  }, React.createElement("button", {
    onClick: () => genCode('store', {
      store: form.storeSel || settings.store,
      shift: form.shift,
      workStart: form.workStart,
      workEnd: form.workEnd,
      workNote: form.workNote,
      unitPrice: form.unitPrice,
      skills: form.skills,
      preg: form.preg,
      oil: form.oil,
      techMentor: form.techMentor,
      lockerNo: form.lockerNo
    }, setStoreCode),
    className: "w-full py-3 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700"
  }, t.storeUpdateCode), reqErr && React.createElement("p", {
    className: "text-xs text-red-400 text-center fi"
  }, reqErr), storeCode && React.createElement("div", {
    className: "space-y-2 fi"
  }, React.createElement("div", {
    className: "flex justify-center"
  }, React.createElement("div", {
    className: "bg-white p-2.5 rounded-xl"
  }, React.createElement("img", {
    src: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(storeCode)}`,
    alt: "QR",
    className: "w-44 h-44"
  }))), React.createElement("div", {
    className: "grid grid-cols-2 gap-2"
  }, React.createElement("button", {
    onClick: () => {
      navigator.clipboard.writeText(storeCode).catch(() => {});
    },
    className: "py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-gray-300 text-sm font-medium"
  }, t.copyBtn), React.createElement("button", {
    onClick: () => {
      var link = buildReqLink(location.origin + (window.__appBase || location.pathname.replace(/index\.html$/, '')) + 'auth.html', storeCode);
      sendTicketFlex('📝 審核通知', t.lineReqPrefix, link, settings.lang === 'vi' ? T.vi.lineReqPrefix : '');
    },
    className: "py-2.5 rounded-xl text-white text-sm font-bold bg-[#06C755] active:bg-[#05b34c]"
  }, t.sendViaLine)), React.createElement("div", null, React.createElement("label", {
    className: "text-xs text-gray-500 mb-1 block"
  }, t.storeConfirmCode), React.createElement("input", {
    value: confirmInput,
    onChange: e => setConfirmInput(e.target.value),
    placeholder: t.storeConfirmCode,
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500"
  })), React.createElement("button", {
    onClick: () => applyConfirm('store', {
      store: form.storeSel || settings.store,
      shift: form.shift,
      workStart: form.workStart,
      workEnd: form.workEnd,
      workNote: form.workNote,
      unitPrice: form.unitPrice,
      skills: form.skills,
      preg: form.preg,
      oil: form.oil,
      techMentor: form.techMentor,
      lockerNo: form.lockerNo
    }, 'confirmedStore'),
    className: "w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700"
  }, t.confirm), settings.lastSyncStore && React.createElement("p", {
    className: "text-[11px] text-gray-500 mt-1.5 text-center"
  }, t.lastSyncAt, "：", fmtSyncTime(settings.lastSyncStore)), confirmMsg === 'ok' && React.createElement("p", {
    className: "text-xs text-center text-emerald-400 fi"
  }, "✓ ", t.confirmSuccess), confirmMsg === 'fail' && React.createElement("p", {
    className: "text-xs text-center text-red-400 fi"
  }, t.confirmFail)))), subTab === 'book' && React.createElement("div", {
    className: "space-y-4 fi"
  }, React.createElement("div", {
    className: "sticky top-0 z-10 -mx-4 px-4 py-2.5 bg-gray-950 flex items-center justify-center"
  }, React.createElement("h2", {
    className: "text-lg font-bold text-gray-100"
  }, t.myBooking2)), React.createElement(BookingSection, {
    code: settings.code,
    t: t
  })), subTab === 'cust' && React.createElement(CustomerPage, {
    t: t,
    settings: settings,
    onClose: onClose
  }), subTab === 'notice' && React.createElement(NoticeManagePage, {
    t: t,
    settings: settings,
    onClose: onClose,
    onLogout: onLogout
  }), subTab === 'chart' && React.createElement(ChartPage, {
    t: t,
    settings: settings,
    onClose: onClose
  }), subTab === 'suggest' && React.createElement(SuggestPage, {
    t: t,
    settings: settings,
    onClose: onClose
  }), subTab === 'acupoint' && React.createElement(AcupointPage, {
    t: t,
    settings: settings
  }), subTab === 'backup' && React.createElement("div", {
    className: "space-y-4 fi"
  }, React.createElement("div", {
    className: "sticky top-0 z-10 -mx-4 px-4 py-2.5 bg-gray-950 flex items-center justify-center"
  }, React.createElement("h2", {
    className: "text-lg font-bold text-gray-100"
  }, t.backupCenter)), React.createElement(BackupSection, {
    settings: settings,
    t: t,
    onUpdate: onUpdate,
    lineUserId: lineUserId
  })), subTab === 'violation' && React.createElement("div", {
    className: "space-y-6 fi"
  }, React.createElement("div", null, React.createElement("div", {
    className: "sticky top-0 z-10 -mx-4 px-4 py-1 bg-gray-950 flex items-center justify-center mb-2"
  }, React.createElement("h2", {
    className: "text-sm font-semibold text-gray-300"
  }, t.violationTitle)), React.createElement("div", {
    className: "bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-6 text-center"
  }, React.createElement("p", {
    className: "text-sm text-gray-500"
  }, t.noViolation))), React.createElement("div", {
    className: "space-y-2"
  }, React.createElement("p", {
    className: "text-sm text-gray-400 font-medium"
  }, t.violationCode), React.createElement("textarea", {
    rows: 2,
    placeholder: t.connInput,
    className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500 resize-none"
  }), React.createElement("div", {
    className: "flex gap-2"
  }, React.createElement("button", {
    className: "flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-sm flex items-center justify-center gap-1"
  }, React.createElement("svg", {
    className: "w-4 h-4",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.5,
    d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 4v12m0 0l-4-4m4 4l4-4"
  }))), React.createElement("button", {
    className: "flex-1 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-400 text-sm"
  }, t.pasteBtn)), React.createElement("button", {
    className: "w-full py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold active:bg-amber-700"
  }, t.confirm)), React.createElement("div", {
    className: "pt-4 border-t border-white/[0.06]"
  }, React.createElement("h2", {
    className: "text-lg font-bold text-gray-100 mb-3"
  }, t.dutyTitle), React.createElement("div", {
    className: "bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-6 text-center"
  }, React.createElement("p", {
    className: "text-sm text-gray-500"
  }, t.noDuty)))), subTab === 'manage' && React.createElement("div", {
    className: "space-y-5 fi"
  }, React.createElement("h2", {
    className: "text-lg font-bold text-gray-100"
  }, t.manageCenter), (() => {
    var ghLocal = getGHConfig();
    var hasConn = !!(ghLocal && ghLocal.token);
    return React.createElement("div", {
      className: "space-y-3"
    }, React.createElement("div", {
      className: "flex items-center justify-between"
    }, React.createElement("p", {
      className: "text-sm text-gray-500 font-medium"
    }, t.connection), React.createElement("span", {
      className: "text-xs"
    }, hasConn ? t.connOnline : t.connOffline)), !hasConn && !connMode && React.createElement("button", {
      onClick: () => setConnMode('apply'),
      className: "w-full py-3 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 text-sm font-semibold active:bg-amber-600/30"
    }, t.connApply), connMode === 'apply' && React.createElement("div", {
      className: "space-y-3 fi"
    }, React.createElement("div", {
      className: "flex justify-center"
    }, React.createElement("div", {
      className: "bg-white p-2.5 rounded-xl"
    }, React.createElement("img", {
      src: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(settings.code + ':' + devId)}`,
      alt: "QR",
      className: "w-40 h-40"
    }))), React.createElement("p", {
      className: "text-[10px] text-gray-600 text-center font-mono select-all break-all"
    }, settings.code, ":", devId), React.createElement("button", {
      onClick: () => {
        var link = buildReqLink(location.origin + (window.__appBase || location.pathname.replace(/index\.html$/, '')) + 'auth.html', genConnReq(settings.code, devId));
        sendTicketFlex('🔗 連線申請', t.lineConnReqPrefix, link, settings.lang === 'vi' ? T.vi.lineConnReqPrefix : '');
      },
      className: "w-full py-2.5 rounded-xl text-white text-sm font-bold bg-[#06C755] active:bg-[#05b34c]"
    }, t.sendViaLine), React.createElement("div", null, React.createElement("label", {
      className: "text-xs text-gray-500 mb-1 block"
    }, t.connCode), React.createElement("textarea", {
      value: connInput,
      onChange: e => setConnInput(e.target.value),
      rows: 2,
      placeholder: t.connInput,
      className: "w-full bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-gray-100 font-mono focus:outline-none focus:border-amber-500 resize-none"
    })), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement("button", {
      onClick: () => {
        setConnMode(null);
        setConnInput('');
        setConnStatus('');
      },
      className: "flex-1 py-2.5 bg-white/[0.04] rounded-xl text-gray-500 text-sm"
    }, t.cancel), React.createElement("button", {
      onClick: () => {
        var ghCfg = verifyActToken(connInput.trim(), settings.code, devId);
        if (ghCfg) {
          saveGHConfigLocal(ghCfg);
          setConnStatus(t.connOk);
          setConnMode(null);
          setConnInput('');
        } else {
          setConnStatus(t.connFail);
        }
      },
      className: "flex-1 py-2.5 bg-amber-600 rounded-xl text-white text-sm font-bold"
    }, t.confirm)), connStatus && React.createElement("p", {
      className: `text-xs text-center ${connStatus.includes('✓') ? 'text-emerald-400' : 'text-red-400'}`
    }, connStatus)));
  })(), React.createElement("div", {
    className: "pt-4 border-t border-white/[0.06] space-y-2"
  }, React.createElement("button", {
    onClick: goAuth,
    disabled: goAuthChecking,
    className: "w-full py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 text-sm font-semibold active:bg-white/[0.08] flex items-center justify-center gap-2 disabled:opacity-60"
  }, React.createElement("svg", {
    className: "w-4 h-4",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.5,
    d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
  })), goAuthChecking ? t.checking || '檢查中…' : t.admin + ' / ' + t.supervisor)), React.createElement("div", {
    className: "text-[10px] text-gray-700 font-mono break-all"
  }, t.deviceId, ": ", devId)))));
}
var IC = {
  home: React.createElement("svg", {
    className: "w-5 h-5",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.5,
    d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
  })),
  monthly: React.createElement("svg", {
    className: "w-5 h-5",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.5,
    d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
  })),
  yearly: React.createElement("svg", {
    className: "w-5 h-5",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.5,
    d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
  })),
  settings: React.createElement("svg", {
    className: "w-5 h-5",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.5,
    d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
  }), React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.5,
    d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
  }))
};
window.__V = Object.assign(window.__V || {}, {
  ChartPage,
  CustomerPage,
  BackupSection,
  SettingsPage
});
function FxRow({
  lang
}) {
  var zh = lang !== 'vi';
  var [v, setV] = React.useState(() => window.MPFx.get());
  var L = [['glow', zh ? '光影移動' : 'Ánh sáng'], ['petals', zh ? '櫻花飄落' : 'Hoa rơi'], ['mesh', zh ? '流動背景' : 'Nền chuyển động'], ['off', zh ? '關閉' : 'Tắt']];
  return React.createElement("div", {
    className: "px-4 py-3"
  }, React.createElement("div", {
    className: "flex items-center justify-between mb-2"
  }, React.createElement("span", {
    className: "text-base text-gray-200"
  }, zh ? '卡片效果' : 'Hiệu ứng thẻ'), React.createElement("span", {
    className: "text-sm text-gray-500"
  }, (L.find(x => x[0] === v) || L[1])[1])), React.createElement("div", {
    className: "grid grid-cols-4 gap-2",
    role: "radiogroup",
    "aria-label": zh ? '卡片效果' : 'Hiệu ứng thẻ'
  }, L.map(([k, l]) => React.createElement("button", {
    key: k,
    role: "radio",
    "aria-checked": v === k,
    onClick: () => {
      window.MPFx.set(k);
      setV(k);
    },
    className: `min-h-[44px] rounded-xl border text-sm font-semibold ${v === k ? 'border-amber-500 ring-2 ring-amber-500 text-amber-300' : 'border-white/[0.2] text-gray-300'}`
  }, l))), React.createElement("p", {
    className: "text-xs text-gray-500 mt-2"
  }, zh ? '一次只能開一種效果;系統開「減少動態效果」時會自動停止動畫。' : 'Chỉ bật một hiệu ứng; tự dừng khi bật "Giảm chuyển động".'));
}