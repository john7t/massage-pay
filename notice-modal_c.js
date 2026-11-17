/*BUILD c=notice-modal.c.js v=1.12-047 src=dev/notice-modal.js h=0934e646 t=2026-11-17 10:41*/
(function () {
  var {
    useState,
    useEffect
  } = React;
  var MP = window.MP || {};
  var UNLOCK_KEY_PREFIX = 'notice-pwd-unlock-';
  function getUnlockTs(code) {
    try {
      return parseInt(localStorage.getItem(UNLOCK_KEY_PREFIX + code) || '0', 10) || 0;
    } catch (_e) {
      return 0;
    }
  }
  function setUnlockTs(code) {
    try {
      localStorage.setItem(UNLOCK_KEY_PREFIX + code, String(Date.now()));
    } catch (_e) {}
  }
  try {
    if (!document.getElementById('__pinGateStyle')) {
      var st = document.createElement('style');
      st.id = '__pinGateStyle';
      st.textContent = '.pinGateBackdrop{background-color:#000000!important;opacity:1!important}.pinGateBtn{background-color:rgba(255,255,255,0.12)!important;color:#f3f4f6!important}.pinGateTitle{color:#f9fafb!important}.pinGateBody{color:#9ca3af!important}';
      document.head.appendChild(st);
    }
  } catch (_e) {}
  function PinDots({
    length
  }) {
    return React.createElement("div", {
      className: "flex gap-3 justify-center"
    }, Array.from({
      length: 4
    }).map((_, i) => React.createElement("div", {
      key: i,
      className: `w-4 h-4 rounded-full border-2 ${length > i ? 'bg-amber-500 border-amber-500' : 'border-white/[0.2]'}`
    })));
  }
  function PinKeypad({
    onDigit,
    onBackspace
  }) {
    return React.createElement("div", {
      className: "grid grid-cols-3 gap-4 justify-items-center"
    }, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => k === '' ? React.createElement("div", {
      key: i
    }) : React.createElement("button", {
      key: i,
      onClick: () => k === '⌫' ? onBackspace() : onDigit(k),
      className: "pinGateBtn w-16 h-16 rounded-full text-xl font-semibold active:opacity-80"
    }, k)));
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
  function NoticeDetailModal({
    notice,
    settings,
    t,
    onClose,
    onMore,
    skipGate,
    onLogout
  }) {
    var code = settings && settings.code;
    var vi = settings && settings.lang === 'vi';
    var getFreshSettings = () => {
      try {
        return MP.LS && MP.LS.get('app-settings') || settings || {};
      } catch (_e) {
        return settings || {};
      }
    };
    var initGate = () => {
      if (skipGate) return 'none';
      if (!code) return 'none';
      var fs = getFreshSettings();
      if (!fs.lockPwd) return 'setup';
      if (Date.now() - getUnlockTs(code) > (fs.lockAutoTime || 60) * 60 * 1000) return 'locked';
      return 'none';
    };
    var [gate, setGate] = useState(initGate);
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
    var [nvLang, setNvLang] = useState({
      zh: !vi,
      vi: !!vi
    });
    var [act, setAct] = useState('');
    var [readCount, setReadCount] = useState(() => {
      try {
        return MP.getNoticeReadCount ? MP.getNoticeReadCount(notice.id) : null;
      } catch (_e) {
        return null;
      }
    });
    var [readers, setReaders] = useState(null);
    var [openers, setOpeners] = useState(null);
    useEffect(() => {
      if (gate !== 'none') {
        return;
      }
      if (!code || !MP.hasMyKey || !MP.hasMyKey(code) || !MP.gasVerifyKey) {
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
          var key = MP.getMyKey ? MP.getMyKey(code) : '';
          var r = await MP.gasVerifyKey(code, key);
          var result = r && r.ok && r.valid ? 'ok' : 'invalid';
          setKeyCheck(result);
          setCachedKeyCheck(code, result);
        } catch (_e) {
          setKeyCheck('ok');
        }
      })();
    }, [gate]);
    useEffect(() => {
      if (gate !== 'none' || keyCheck !== 'ok') return;
      if (!code || !notice || !notice.id || !MP.gasLogNoticeOpen) return;
      var tm = setTimeout(() => {
        try {
          MP.gasLogNoticeOpen(notice.id, code);
        } catch (_e) {}
      }, 1500);
      return () => clearTimeout(tm);
    }, [gate, keyCheck]);
    var finishSetup = async pwd => {
      setSetupErr('');
      setSetupBusy(true);
      var updated = Object.assign({}, getFreshSettings(), {
        lockPwd: pwd
      });
      try {
        if (MP.LS) MP.LS.set('app-settings', updated);
      } catch (_e) {}
      setUnlockTs(code);
      setSetupBusy(false);
      setGate('none');
      try {
        if (MP.gasSetInitialPwd && MP.lockPwdCred) {
          var cred = MP.lockPwdCred(code, pwd);
          MP.gasSetInitialPwd(code, cred);
        }
      } catch (_e) {}
    };
    var pressSetupDigit = d => {
      var next = (setupPwd + d).slice(0, 4);
      setSetupPwd(next);
      if (next.length === 4) {
        if (setupStep === 1) {
          if (!MP.isValidPin || !MP.isValidPin(next)) {
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
      var fs = getFreshSettings();
      var next = (unlockInput + d).slice(0, 4);
      setUnlockInput(next);
      if (next.length === 4) {
        if (next === fs.lockPwd) {
          setUnlockTs(code);
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
      }, t.noticePwdSetupBody), React.createElement(PinDots, {
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
      }, t.noticePwdLockedBody), React.createElement("div", {
        className: unlockShake ? 'text-red-500' : ''
      }, React.createElement(PinDots, {
        length: unlockInput.length
      })), unlockErr && React.createElement("p", {
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
    if (keyCheck === 'invalid') {
      return React.createElement("div", {
        className: "fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center",
        onClick: onClose
      }, React.createElement("div", {
        className: "bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl",
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
    var show = MP.getNoticeShow ? MP.getNoticeShow() : {
      cat: false,
      subcat: false,
      tags: false
    };
    var nb = (n, lang) => MP.noticeBody ? MP.noticeBody(n, lang) : n && n.body || '';
    var handleAction = async () => {
      if (MP.hasMyKey && MP.hasMyKey(code)) {
        setAct('...');
        try {
          var r = await MP.markNoticeRead(code, notice.id);
          if (r && r.ok) {
            setAct('read');
            if (typeof r.count === 'number') setReadCount(r.count);
          } else {
            setAct('fail');
          }
        } catch (_e) {
          setAct('fail');
        }
        setTimeout(() => setAct(''), 4000);
        return;
      }
      setAct('...');
      try {
        var _r = await MP.autoClaimKey(code);
        setAct(_r && _r.ok ? 'ok' : 'fail');
      } catch (_e) {
        setAct('fail');
      }
      setTimeout(() => setAct(''), 4000);
    };
    var showReaders = () => {
      setReaders(Array.isArray(notice.readers) ? notice.readers : []);
      setOpeners(null);
    };
    var showOpeners = () => {
      setOpeners(Array.isArray(notice.openers) ? notice.openers : []);
      setReaders(null);
    };
    var isRead = MP.isNoticeRead && MP.isNoticeRead(notice.id);
    var ThumbIcon = () => React.createElement("svg", {
      viewBox: "0 0 24 24",
      width: "22",
      height: "22",
      fill: isRead ? 'currentColor' : 'none',
      stroke: "currentColor",
      strokeWidth: isRead ? 0 : 1.8,
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, React.createElement("path", {
      d: "M7 10v11H4a1 1 0 01-1-1v-9a1 1 0 011-1h3zM7 10l4.5-7a2 2 0 013 1.5V9h5.1a2 2 0 011.98 2.3l-1.2 8A2 2 0 0118.4 21H10a3 3 0 01-3-3v-8z"
    }));
    return React.createElement("div", {
      className: "fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center",
      onClick: onClose
    }, React.createElement("div", {
      className: "bg-gray-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto",
      onClick: e => e.stopPropagation()
    }, React.createElement("div", {
      className: "p-4 border-b border-white/[0.06] flex items-start justify-between gap-2 sticky top-0 bg-gray-900"
    }, React.createElement("div", {
      className: "flex-1"
    }, React.createElement("div", {
      className: "flex items-center gap-2 mb-1"
    }, React.createElement("span", {
      className: "text-[10px] text-gray-600 font-mono"
    }, notice.id), show.cat && React.createElement("span", {
      className: "text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400"
    }, nvLang.vi && !nvLang.zh && notice.catVi || notice.cat), show.subcat && notice.subcat && React.createElement("span", {
      className: "text-[10px] text-gray-500"
    }, nvLang.vi && !nvLang.zh && notice.subcatVi || notice.subcat), React.createElement("span", {
      className: "text-[10px] text-gray-600"
    }, notice.date)), React.createElement("h3", {
      className: "text-base font-bold text-gray-100"
    }, notice.title), notice.author && React.createElement("div", {
      className: "flex items-center gap-1.5 mt-1"
    }, React.createElement("span", {
      className: "w-4 h-4 rounded-full bg-white/[0.1] border border-white/[0.15] flex items-center justify-center flex-shrink-0"
    }, React.createElement("svg", {
      viewBox: "0 0 24 24",
      width: "10",
      height: "10",
      fill: "currentColor",
      className: "text-gray-400"
    }, React.createElement("path", {
      d: "M12 12a5 5 0 100-10 5 5 0 000 10zM12 14c-5 0-9 2.5-9 6v1a1 1 0 001 1h16a1 1 0 001-1v-1c0-3.5-4-6-9-6z"
    }))), React.createElement("span", {
      className: "text-[11px] text-gray-500"
    }, notice.author))), React.createElement("div", {
      className: "flex items-center gap-1 flex-shrink-0"
    }, React.createElement("button", {
      onClick: () => setNvLang(p => {
        var nz = !p.zh;
        if (!nz && !p.vi) return {
          zh: false,
          vi: true
        };
        return {
          ...p,
          zh: nz
        };
      }),
      className: `text-xs px-2 py-1 rounded-lg font-semibold ${nvLang.zh ? 'bg-amber-500 text-white' : 'bg-white/[0.08] text-gray-500'}`
    }, "中"), React.createElement("button", {
      onClick: () => setNvLang(p => {
        var nv = !p.vi;
        if (!nv && !p.zh) return {
          zh: true,
          vi: false
        };
        return {
          ...p,
          vi: nv
        };
      }),
      className: `text-xs px-2 py-1 rounded-lg font-semibold ${nvLang.vi ? 'bg-emerald-500 text-white' : 'bg-white/[0.08] text-gray-500'}`
    }, "VI"), React.createElement("button", {
      onClick: onClose,
      className: "text-gray-500 text-sm ml-1"
    }, "✕"))), React.createElement("div", {
      className: "p-4"
    }, nvLang.zh && React.createElement("p", {
      className: "text-sm text-gray-300 whitespace-pre-wrap leading-relaxed"
    }, notice.body || ''), nvLang.zh && nvLang.vi && (notice.bodyVi || '').trim() && React.createElement("div", {
      className: "my-3 border-t border-white/[0.06]"
    }), nvLang.vi && ((notice.bodyVi || '').trim() ? React.createElement("p", {
      className: "text-sm text-emerald-600 whitespace-pre-wrap leading-relaxed"
    }, notice.bodyVi) : !nvLang.zh && React.createElement("p", {
      className: "text-sm text-gray-300 whitespace-pre-wrap leading-relaxed"
    }, notice.body || '')), React.createElement("div", {
      className: "flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/[0.06]"
    }, React.createElement("button", {
      onClick: handleAction,
      className: "flex items-center justify-center w-9 h-9 rounded-full bg-transparent active:bg-white/[0.08]",
      style: {
        color: isRead ? '#f59e0b' : '#6b7280'
      }
    }, React.createElement(ThumbIcon, null)), React.createElement("div", {
      className: "flex items-center gap-3"
    }, React.createElement("button", {
      onClick: showOpeners,
      className: "text-[11px] text-gray-500 px-1"
    }, "👁", typeof notice.openCount === 'number' ? notice.openCount : 0), React.createElement("button", {
      onClick: showReaders,
      className: "text-[11px] text-gray-500 px-1"
    }, "👍", readCount !== null ? readCount : 0))), readers !== null && React.createElement("div", {
      className: "mt-3 bg-white/[0.03] rounded-lg p-3"
    }, React.createElement("div", {
      className: "flex items-center justify-between mb-2"
    }, React.createElement("span", {
      className: "text-xs font-semibold text-gray-400"
    }, t.noticeReaders || '閱讀人員', ' (' + readers.length + ')'), React.createElement("button", {
      onClick: () => setReaders(null),
      className: "text-[11px] text-gray-500"
    }, "✕")), readers.length === 0 ? React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, t.noReaders || '尚無人閱讀') : React.createElement("div", {
      className: "flex flex-wrap gap-1.5"
    }, readers.map((rd, i) => React.createElement("span", {
      key: i,
      className: "text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-300"
    }, rd.code)))), openers !== null && React.createElement("div", {
      className: "mt-3 bg-white/[0.03] rounded-lg p-3"
    }, React.createElement("div", {
      className: "flex items-center justify-between mb-2"
    }, React.createElement("span", {
      className: "text-xs font-semibold text-gray-400"
    }, t.noticeOpenersTitle || '開啟人員', ' (' + openers.length + ')'), React.createElement("button", {
      onClick: () => setOpeners(null),
      className: "text-[11px] text-gray-500"
    }, "✕")), openers.length === 0 ? React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, t.noReaders || '尚無資料') : React.createElement("div", {
      className: "flex flex-wrap gap-1.5"
    }, openers.map((rd, i) => React.createElement("span", {
      key: i,
      className: "text-[11px] px-2 py-1 rounded-lg bg-white/[0.06] text-gray-300"
    }, rd.code)))), act === '...' ? React.createElement("p", {
      className: "text-[11px] text-sky-400 text-center mt-2"
    }, "⏳ ", t.noticeKeyClaiming || '開通中…') : act === 'ok' ? React.createElement("p", {
      className: "text-[11px] text-emerald-500 text-center mt-2 font-semibold"
    }, "✓ ", t.noticeKeyGot || '已為你開通！互動功能即將開放') : act === 'read' ? React.createElement("p", {
      className: "text-[11px] text-emerald-500 text-center mt-2 font-semibold"
    }, "✓ ", t.noticeReadOk || '已記錄閱讀，感謝！') : act === 'fail' ? React.createElement("p", {
      className: "text-[11px] text-red-500 text-center mt-2 font-semibold"
    }, "✗ ", t.noticeKeyFail || '開通失敗，請稍後再試或聯繫主管') : MP.hasMyKey && !MP.hasMyKey(code) && React.createElement("p", {
      className: "text-[10px] text-gray-500 text-center mt-2"
    }, t.noticeKeyHint || '點上方按鈕即可開通互動功能'), show.tags && notice.tags && React.createElement("div", {
      className: "flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/[0.06]"
    }, String(notice.tags).split(/[,、\s]+/).filter(Boolean).map((tg, i) => React.createElement("span", {
      key: i,
      className: "text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-gray-400"
    }, "#", tg))))));
  }
  window.NoticeDetailModal = NoticeDetailModal;
})();