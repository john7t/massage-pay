/*BUILD safety2.js v1.13-050 編譯版 h=31bf7f59 t=2026-11-17 16:44*/
(function () {
  const {
    useState,
    useEffect,
    useCallback,
    useRef
  } = React;
  const {
    gasCallPost
  } = window.MP || {};
  const TT = {
    zh: {
      bizT: '我是櫃台公務機',
      bizHint: '勾選後需主管審核；通過後，出勤異動等通知會送到這個帳號。一間店的公務機有數量上限。',
      bizOkTag: '已核准為公務機',
      bizReqTag: '公務機審核中',
      lang: '語系',
      role: '你的角色',
      teacher: '老師',
      counter: '櫃台',
      store: '店別',
      code: '老師編號',
      shift: '班別',
      early: '早班',
      late: '晚班',
      shiftHint: '在 06~15 時上班皆為早班',
      onT: '上牌時間',
      offT: '下牌時間',
      hrU: '時',
      pickHr: '請選擇',
      offHint: '預設為上牌時間 +12 小時,可自行調整',
      fillHr: '請補填上牌／下牌時間(只需填一次)',
      mgrNoT: '所屬主管編號',
      mgrNoHint: '請輸入你的主管(店內主管)編號',
      pendTitle: '你的帳號審核中',
      pendSub: '請直接找店內主管面對面確認',
      askStuck: '帳號審核卡住了？請點此詢問',
      askBtn: '詢問帳號審核情況',
      askNote: '點擊後會在官方帳號聊天室送出「詢問帳號審核情況」',
      askSent: '已送出,請回到聊天室查看回覆',
      askManual: '請在聊天室按送出',
      reEdit: '主管編號填錯了？重新填寫',
      recheck: '重新確認',
      name: '自訂名稱',
      codeHint: '請輸入你的老師編號',
      nameHint: '請輸入你的名稱(例如:小美)',
      next: '下一步',
      saving: '儲存中…',
      survey: '安全回報',
      by: '發起人',
      end: '截止',
      closed: '這筆回報已截止',
      ok: '我平安',
      help: '需要協助',
      other: '其他',
      otherHint: '請說明你的狀況',
      send: '送出',
      sent: '已回報',
      sentAt: '回報時間',
      change: '修改回報',
      list: '回報名單',
      editInfo: '修改基本資料',
      loading: '載入中…',
      copy: '點此複製',
      copied: '已複製',
      refresh: '重新整理',
      dataAt: '資料時間',
      noOne: '尚無人回報',
      needHelp: '需要協助',
      tapToChange: '你已回報,可再點選修改',
      back: '返回',
      fail: '失敗',
      detail: '詳細'
    },
    vi: {
      bizT: 'Tôi là máy công vụ của quầy',
      bizHint: 'Cần quản lý duyệt; sau khi được duyệt, thông báo chấm công sẽ gửi đến tài khoản này. Mỗi chi nhánh có giới hạn số lượng.',
      bizOkTag: 'Đã duyệt máy công vụ',
      bizReqTag: 'Đang chờ duyệt máy công vụ',
      lang: 'Ngôn ngữ',
      role: 'Vai trò',
      teacher: 'Sư phụ',
      counter: 'Lễ tân',
      store: 'Chi nhánh',
      code: 'Số Sư phụ',
      shift: 'Ca làm',
      early: 'Ca sáng',
      late: 'Ca tối',
      shiftHint: 'Làm việc trong khoảng 06~15 giờ đều là ca sáng',
      onT: 'Giờ lên bài',
      offT: 'Giờ xuống bài',
      hrU: 'giờ',
      pickHr: 'Vui lòng chọn',
      offHint: 'Mặc định là giờ lên bài +12 giờ, có thể chỉnh',
      fillHr: 'Vui lòng bổ sung giờ lên bài / xuống bài (chỉ cần điền một lần)',
      mgrNoT: 'Số quản lý trực tiếp',
      mgrNoHint: 'Nhập số của quản lý cửa hàng bạn',
      pendTitle: 'Tài khoản đang chờ duyệt',
      pendSub: 'Vui lòng gặp trực tiếp quản lý cửa hàng để xác nhận',
      askStuck: 'Tài khoản bị kẹt? Bấm vào đây để hỏi',
      askBtn: 'Hỏi về tình trạng duyệt tài khoản',
      askNote: 'Bấm để gửi tin nhắn “詢問帳號審核情況” trong khung chat của tài khoản chính thức',
      askSent: 'Đã gửi, vui lòng quay lại khung chat xem phản hồi',
      askManual: 'Vui lòng bấm gửi trong khung chat',
      reEdit: 'Nhập sai số quản lý? Điền lại',
      recheck: 'Kiểm tra lại',
      name: 'Tên của bạn',
      codeHint: 'Nhập số Sư phụ của bạn',
      nameHint: 'Nhập tên của bạn (ví dụ: Mai)',
      next: 'Tiếp theo',
      saving: 'Đang lưu…',
      survey: 'Báo cáo an toàn',
      by: 'Người tạo',
      end: 'Hạn chót',
      closed: 'Báo cáo này đã hết hạn',
      ok: 'Tôi an toàn',
      help: 'Cần hỗ trợ',
      other: 'Khác',
      otherHint: 'Hãy mô tả tình trạng của bạn',
      send: 'Gửi',
      sent: 'Đã báo cáo',
      sentAt: 'Thời gian',
      change: 'Sửa báo cáo',
      list: 'Danh sách báo cáo',
      editInfo: 'Sửa thông tin cơ bản',
      loading: 'Đang tải…',
      copy: 'Sao chép',
      copied: 'Đã sao chép',
      refresh: 'Làm mới',
      dataAt: 'Thời gian dữ liệu',
      noOne: 'Chưa có ai báo cáo',
      needHelp: 'Cần hỗ trợ',
      tapToChange: 'Bạn đã báo cáo, có thể sửa lại',
      back: 'Quay lại',
      fail: 'Thất bại',
      detail: 'Chi tiết'
    }
  };
  const STORES = ['龍山寺店', '東門店', '古亭店', '公館店'];
  const qs = new URLSearchParams(location.search);
  window.__s2nonce = window.__s2nonce || 0;
  function go(q) {
    try {
      history.pushState(null, '', location.pathname + '?' + q);
    } catch (_e) {
      location.href = location.pathname + '?' + q;
      return;
    }
    try {
      window.scrollTo(0, 0);
    } catch (_e) {}
    window.dispatchEvent(new Event('s2nav'));
  }
  const CACHE_TTL = 7 * 24 * 3600e3;
  const CACHEABLE = ['s2Me', 's2GetSurvey', 's2GetList', 's2MySurveys', 's2MgrInfo', 's2TodaySurveys', 's2MyReports'];
  const SWR = ['lv2Month', 'gb2List', 'b2List', 's2PtsMine', 's2PtsMonthAll', 'n2List', 'n2Get', 'n2Readers', 'n2Settings', 'gb2Settings', 'lv2Stats', 's2StaffList', 'my2OpenStats'];
  const WRITE_CLEAR = {
    s2Register: '*',
    s2PtsImport: '*',
    s2CreateSurvey: ['s2MySurveys', 's2TodaySurveys'],
    s2DeleteSurvey: ['s2MySurveys', 's2GetSurvey', 's2GetList', 's2TodaySurveys', 's2MyReports'],
    s2RestoreSurvey: ['s2MySurveys', 's2GetSurvey', 's2GetList'],
    s2Report: ['s2GetSurvey', 's2GetList', 's2TodaySurveys', 's2MyReports'],
    s2MgrApply: ['s2Me', 's2MgrInfo'],
    s2MgrApprove: ['s2MgrInfo', 's2Me', 's2MySurveys'],
    s2MgrSet: ['s2MgrInfo'],
    s2MgrNotify: ['s2MgrInfo', 's2Me'],
    s2StaffSetLeft: ['s2GetList', 'lv2Month'],
    s2ApvModeSet: ['s2MgrInfo'],
    s2BizSet: ['s2GetList', 's2MgrInfo'],
    s2BizMaxSet: ['s2MgrInfo'],
    s2UserApprove: [],
    s2StaffAddLeft: ['lv2Month'],
    s2WebAdminSet: ['s2MgrInfo', 's2Me'],
    s2OpenSet: ['s2MgrInfo', 's2GetList', 's2GetSurvey'],
    s2AdminHide: ['s2MgrInfo', 's2Me', 's2MySurveys', 's2GetList', 's2GetSurvey']
  };
  function cuid() {
    try {
      const c = liff.getContext();
      const u = c && c.userId;
      if (u) {
        try {
          localStorage.setItem('s2:lastuid', u);
        } catch (_e) {}
        return u;
      }
    } catch (_e) {}
    try {
      return localStorage.getItem('s2:lastuid') || '';
    } catch (_e) {
      return '';
    }
  }
  function ckey(action, params) {
    return 's2c:' + cuid() + ':' + action + ':' + JSON.stringify(params || {});
  }
  function cget(k) {
    try {
      const v = JSON.parse(localStorage.getItem(k) || 'null');
      if (v && Date.now() - v.t < CACHE_TTL) return Object.assign({}, v.d, {
        _at: v.t
      });
    } catch (_e) {}
    return null;
  }
  function cput(k, d) {
    try {
      localStorage.setItem(k, JSON.stringify({
        t: Date.now(),
        d: d
      }));
    } catch (_e) {}
  }
  function cclear(actions) {
    try {
      const ks = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf('s2c:') === 0) ks.push(k);
      }
      ks.forEach(k => {
        if (actions === '*' || actions.some(a => k.indexOf(':' + a + ':') >= 0)) localStorage.removeItem(k);
      });
    } catch (_e) {}
  }
  function peek(action, params) {
    if (CACHEABLE.indexOf(action) < 0 && SWR.indexOf(action) < 0) return null;
    return cget(ckey(action, params));
  }
  const S2_TIMEOUT = {
    n2Analyze: 90000
  };
  function kioskGet() {
    try {
      const k = JSON.parse(localStorage.getItem('mp:kiosk:v1') || 'null');
      return k && k.on && k.token ? k : null;
    } catch (_e) {
      return null;
    }
  }
  function csGet() {
    try {
      const c = JSON.parse(localStorage.getItem('mp:cn:cs') || 'null');
      return c && c.session && c.exp > Date.now() ? c : null;
    } catch (_e) {
      return null;
    }
  }
  window.__cnSess = {
    get: csGet,
    set: c => {
      try {
        localStorage.setItem('mp:cn:cs', JSON.stringify(c));
      } catch (_e) {}
    },
    clear: () => {
      try {
        localStorage.removeItem('mp:cn:cs');
      } catch (_e) {}
    }
  };
  window.__kiosk = {
    get: kioskGet,
    op: () => {
      try {
        return localStorage.getItem('mp:kiosk:op') || '';
      } catch (_e) {
        return '';
      }
    }
  };
  const QUEUE_ACTIONS = {
    s2Report: '安全回報',
    lv2Save: '休假單',
    lv2Cancel: '取消休假',
    lv2Decide: '休假簽核',
    b2Add: '拒接名單',
    b2Edit: '拒接名單修改',
    gb2Join: '手套團購登記',
    my2Open: '',
    lv2Track: ''
  };
  const QKEY = 's2q:jobs',
    QFAIL = 's2q:fail',
    QMAXAGE = 3 * 24 * 3600e3;
  function qLoad() {
    try {
      return JSON.parse(localStorage.getItem(QKEY) || '[]') || [];
    } catch (_e) {
      return [];
    }
  }
  function qSave(a) {
    try {
      localStorage.setItem(QKEY, JSON.stringify(a));
    } catch (_e) {}
  }
  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }
  function awaitLiff(ms) {
    return window.__s2Warm && window.__liffReady ? Promise.race([window.__liffReady, sleep(ms || 10000)]) : Promise.resolve();
  }
  function qEnqueue(action, params) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const a = qLoad();
    a.push({
      id: id,
      uid: cuid(),
      action: action,
      params: params || {},
      t: Date.now(),
      tries: 0
    });
    qSave(a);
    qUi();
    setTimeout(qKick, 0);
    const o = {
      ok: true,
      queued: true
    };
    if (action === 'lv2Save') {
      try {
        o.saved = JSON.parse((params || {}).items || '[]').length;
      } catch (_e) {}
    }
    return Promise.resolve(o);
  }
  let qBusy = null,
    qTimer = 0;
  function qKick() {
    if (qBusy) return qBusy;
    qBusy = (async () => {
      await 0;
      try {
        for (let guard = 0; guard < 200; guard++) {
          const jobs = qLoad();
          const u = cuid();
          const j = jobs.find(x => !x.uid || !u || x.uid === u);
          if (!j) break;
          if (Date.now() - j.t > QMAXAGE) {
            qSave(qLoad().filter(x => x.id !== j.id));
            qNote('fail', j, {
              error: '超過 3 天沒送出去,已放棄,請重新送出'
            });
            continue;
          }
          await awaitLiff(10000);
          const r = await rawSend(j.action, j.params);
          const retry = r && !r.ok && (r._net || /accessToken|token|登入|逾時|expired/i.test(String(r.error || '')));
          if (retry && j.tries < 30) {
            const a = qLoad();
            const x = a.find(y => y.id === j.id);
            if (x) {
              x.tries = (x.tries || 0) + 1;
              qSave(a);
            }
            qLater();
            break;
          }
          qSave(qLoad().filter(x => x.id !== j.id));
          if (r && r.ok) {
            if (WRITE_CLEAR[j.action]) cclear(WRITE_CLEAR[j.action]);
            qNote('ok', j, r);
          } else qNote('fail', j, r || {});
          if (QUEUE_ACTIONS[j.action] !== '') try {
            window.dispatchEvent(new Event('s2synced'));
          } catch (_e) {}
        }
      } finally {
        qBusy = null;
        qUi();
      }
    })();
    return qBusy;
  }
  function qLater() {
    clearTimeout(qTimer);
    qTimer = setTimeout(qKick, 15000);
  }
  try {
    window.addEventListener('online', () => qKick());
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) qKick();
    });
    setTimeout(qKick, 1500);
  } catch (_e) {}
  function qEl() {
    let e = document.getElementById('s2q-toast');
    if (!e) {
      e = document.createElement('div');
      e.id = 's2q-toast';
      e.setAttribute('role', 'status');
      e.setAttribute('aria-live', 'polite');
      e.style.cssText = 'position:fixed;left:12px;right:12px;bottom:14px;z-index:99990;display:flex;flex-direction:column;gap:6px;pointer-events:none;align-items:center';
      document.body.appendChild(e);
    }
    return e;
  }
  const qBox = 'pointer-events:auto;max-width:420px;width:100%;box-sizing:border-box;border-radius:12px;padding:10px 14px;font-size:14px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 4px 18px rgba(15,23,42,.18);border:1px solid;';
  function qFails() {
    try {
      return JSON.parse(localStorage.getItem(QFAIL) || '[]') || [];
    } catch (_e) {
      return [];
    }
  }
  function qUi() {
    try {
      const e = qEl();
      const n = qLoad().filter(x => QUEUE_ACTIONS[x.action] !== '').length;
      const f = qFails();
      let h = '';
      if (n > 0) h += '<div style="' + qBox + 'background:#fff;color:#1f2937;border-color:#d1d5db">⏳ 已存在本機,背景送出中（' + n + '）…</div>';
      f.forEach((x, i) => {
        h += '<div style="' + qBox + 'background:#fef2f2;color:#991b1b;border-color:#fca5a5;display:flex;gap:10px;align-items:flex-start"><span style="flex:1">✗ ' + (x.label || '資料') + '送出失敗:' + String(x.err || '').replace(/</g, '&lt;') + '</span><button data-i="' + i + '" style="border:1px solid #fca5a5;background:#fff;color:#991b1b;border-radius:8px;padding:2px 10px;font-size:13px">關閉</button></div>';
      });
      if (e.__ok) h += '<div style="' + qBox + 'background:#ecfdf5;color:#065f46;border-color:#6ee7b7">' + e.__ok + '</div>';
      e.innerHTML = h;
      e.querySelectorAll('button[data-i]').forEach(b => {
        b.onclick = () => {
          const a = qFails();
          a.splice(+b.getAttribute('data-i'), 1);
          try {
            localStorage.setItem(QFAIL, JSON.stringify(a));
          } catch (_e) {}
          qUi();
        };
      });
    } catch (_e) {}
  }
  function qNote(kind, j, r) {
    const label = QUEUE_ACTIONS[j.action];
    if (label === '') return;
    if (kind === 'ok') {
      let m = '✓ ' + label + '已送出';
      if (j.action === 'lv2Save' && r && r.approved != null && (j.params || {}).submit) m += '（已核准 ' + (r.approved || 0) + '、待主管簽核 ' + (r.pending || 0) + '）';
      const e = qEl();
      e.__ok = m;
      qUi();
      setTimeout(() => {
        e.__ok = '';
        qUi();
      }, 3500);
    } else {
      const a = qFails();
      a.push({
        label: label,
        err: r && r.error || '未知原因',
        t: Date.now()
      });
      try {
        localStorage.setItem(QFAIL, JSON.stringify(a.slice(-5)));
      } catch (_e) {}
      qUi();
    }
  }
  try {
    window.addEventListener('DOMContentLoaded', qUi);
    if (document.readyState !== 'loading') setTimeout(qUi, 0);
  } catch (_e) {}
  async function rawSend(action, params) {
    let tok = '';
    try {
      tok = liff.getAccessToken() || '';
    } catch (_e) {}
    const kk = kioskGet();
    const kx = kk && action !== 'cnKioskUnlock' ? {
      kioskToken: kk.token,
      op: window.__kiosk.op()
    } : {};
    if (!kk && /^cn/.test(action) && action !== 'cnCodeLogin') {
      const cs = csGet();
      if (cs) kx.codeSession = cs.session;
    }
    const raw = await gasCallPost(action, Object.assign({}, params || {}, {
      accessToken: tok
    }, kx), S2_TIMEOUT[action] || 20000);
    if (!raw) return {
      ok: false,
      _net: true,
      error: '連不上伺服器,請稍後再試' + (window.__gasErr ? '（' + window.__gasErr + '）' : '')
    };
    return raw;
  }
  async function api(action, params, force) {
    if (QUEUE_ACTIONS[action] !== undefined && !kioskGet()) return qEnqueue(action, params);
    const cacheable = CACHEABLE.indexOf(action) >= 0;
    const k = cacheable ? ckey(action, params) : '';
    if (cacheable && !force) {
      const c = cget(k);
      if (c) return c;
    }
    if (!/^cn/.test(action)) {
      await awaitLiff(10000);
      if (qLoad().length) {
        try {
          await Promise.race([qKick(), sleep(8000)]);
        } catch (_e) {}
      }
    }
    let tok = '';
    try {
      tok = liff.getAccessToken() || '';
    } catch (_e) {}
    const kk = kioskGet();
    const kx = kk && action !== 'cnKioskUnlock' ? {
      kioskToken: kk.token,
      op: window.__kiosk.op()
    } : {};
    if (!kk && /^cn/.test(action) && action !== 'cnCodeLogin') {
      const cs = csGet();
      if (cs) kx.codeSession = cs.session;
    }
    const r = (await gasCallPost(action, Object.assign({}, params || {}, {
      accessToken: tok
    }, kx), S2_TIMEOUT[action] || 20000)) || {
      ok: false,
      error: '連不上伺服器,請稍後再試' + (window.__gasErr ? '（' + window.__gasErr + '）' : '')
    };
    if (r.ok) {
      r._at = Date.now();
      if (cacheable) cput(k, r);else if (SWR.indexOf(action) >= 0) cput(ckey(action, params), r);else if (WRITE_CLEAR[action]) cclear(WRITE_CLEAR[action]);
    }
    return r;
  }
  function defaultLang() {
    try {
      return String(navigator.language || '').toLowerCase().indexOf('vi') === 0 ? 'vi' : 'zh';
    } catch (_e) {
      return 'zh';
    }
  }
  function copyText(txt) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(txt).then(() => true).catch(() => fallbackCopy(txt));
    } catch (_e) {}
    return Promise.resolve(fallbackCopy(txt));
  }
  function fallbackCopy(txt) {
    try {
      const ta = document.createElement('textarea');
      ta.value = txt;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return !!ok;
    } catch (_e) {
      return false;
    }
  }
  const liffBase = () => 'https://liff.line.me/' + (window.__S2_LIFF_ID || '');
  function fmtAt(at, lang) {
    if (!at) return '';
    const d = new Date(at);
    const p = n => String(n).padStart(2, '0');
    const ts = p(d.getMonth() + 1) + '/' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    const m = Math.floor((Date.now() - at) / 60000);
    const vi = lang === 'vi';
    const rel = m < 1 ? vi ? 'vừa xong' : '剛剛' : m < 60 ? m + (vi ? ' phút trước' : ' 分鐘前') : m < 1440 ? Math.floor(m / 60) + (vi ? ' giờ trước' : ' 小時前') : Math.floor(m / 1440) + (vi ? ' ngày trước' : ' 天前');
    return (vi ? 'Dữ liệu lúc ' : '資料時間 ') + ts + '（' + rel + '）';
  }
  const RefreshBar = ({
    at,
    lang,
    onRefresh,
    refreshing,
    err
  }) => React.createElement("div", null, React.createElement("div", {
    className: "flex items-center justify-between gap-2"
  }, React.createElement("span", {
    className: "text-xs text-gray-500"
  }, fmtAt(at, lang)), React.createElement("button", {
    disabled: refreshing,
    onClick: () => {
      if (onRefresh) onRefresh();else {
        cclear('*');
        window.__s2nonce++;
        window.dispatchEvent(new Event('s2nav'));
      }
    },
    className: "shrink-0 text-xs text-gray-300 border border-gray-700 rounded-full px-3 py-1 disabled:opacity-60"
  }, refreshing ? React.createElement("span", null, React.createElement(Spinner, {
    size: 12
  }), " ", lang === 'vi' ? 'Đang cập nhật…' : '更新中…') : lang === 'vi' ? '🔄 Làm mới' : '🔄 重新整理')), err && React.createElement("p", {
    className: "text-xs text-red-400 text-right mt-1"
  }, err));
  const Box = ({
    children,
    at,
    lang,
    onRefresh,
    refreshing,
    err
  }) => React.createElement("div", {
    className: "min-h-screen px-4 py-5"
  }, React.createElement("div", {
    className: "max-w-md mx-auto space-y-4"
  }, React.createElement(RefreshBar, {
    at: at,
    lang: lang,
    onRefresh: onRefresh,
    refreshing: refreshing,
    err: err
  }), children));
  const barOf = (st, reload, lang) => ({
    at: st.data && st.data._at,
    lang: lang,
    onRefresh: () => {
      reload();
    },
    refreshing: !!(st.loading && st.data),
    err: st.err
  });
  const Card = ({
    children,
    className
  }) => React.createElement("div", {
    className: 'rounded-2xl bg-gray-900 border border-gray-800 p-4 ' + (className || '')
  }, children);
  const Spinner = ({
    size,
    color
  }) => {
    const s = size || 14;
    const c = color || (s >= 28 ? '#0071e3' : 'currentColor');
    return React.createElement("span", {
      className: "ul-dr",
      role: "status",
      "aria-label": "載入中",
      style: {
        '--s': s + 'px',
        '--k': 1,
        '--c1': c
      }
    }, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(i => React.createElement("i", {
      key: i,
      style: {
        '--i': i
      }
    })));
  };
  const Loading = ({
    text
  }) => React.createElement(Box, null, React.createElement("div", {
    className: "flex flex-col items-center justify-center gap-3 pt-24 text-violet-300"
  }, React.createElement(Spinner, {
    size: 40
  }), React.createElement("p", {
    className: "text-sm text-gray-400"
  }, text || '載入中…')));
  const Btn = ({
    children,
    onClick,
    color,
    disabled,
    className,
    loading
  }) => React.createElement("button", {
    disabled: disabled || loading,
    onClick: onClick,
    className: 'w-full rounded-xl py-3 font-bold text-base disabled:opacity-40 ' + (color || 'bg-violet-600 text-white') + ' ' + (className || '')
  }, loading && React.createElement("span", {
    className: "mr-2"
  }, React.createElement(Spinner, null)), children);
  const Chip = ({
    on,
    children,
    onClick
  }) => React.createElement("button", {
    onClick: onClick,
    className: 'px-4 py-2 rounded-full border text-sm ' + (on ? 'bg-violet-600 border-violet-600 text-white' : 'border-gray-600 text-gray-300')
  }, children);
  const Msg = ({
    text
  }) => React.createElement(Box, null, React.createElement(Card, null, React.createElement("p", {
    className: "text-center text-gray-300 whitespace-pre-line"
  }, text)));
  function useLoad(action, params) {
    const pk = JSON.stringify(params || {});
    const [st, setSt] = useState(() => {
      const c = peek(action, params);
      return c ? {
        loading: false,
        data: c,
        err: ''
      } : {
        loading: true,
        data: null,
        err: ''
      };
    });
    const run = useCallback(force => {
      const swr = SWR.indexOf(action) >= 0 || CACHEABLE.indexOf(action) >= 0;
      if (!force) {
        const c = peek(action, params);
        if (c) {
          setSt({
            loading: false,
            data: c,
            err: ''
          });
          if (!swr) return;
        }
      }
      setSt(s => ({
        loading: true,
        data: s.data,
        err: ''
      }));
      return api(action, params, !!force || swr).then(d => setSt(s => d && d.ok ? {
        loading: false,
        data: d,
        err: ''
      } : s.data && s.data.ok ? {
        loading: false,
        data: s.data,
        err: '更新失敗,畫面上仍是舊資料'
      } : {
        loading: false,
        data: d,
        err: ''
      }));
    }, [action, pk]);
    useEffect(() => {
      run(false);
    }, [run]);
    useEffect(() => {
      if (/^cn/.test(action)) return;
      const f = () => {
        try {
          run(true);
        } catch (_e) {}
      };
      window.addEventListener('s2synced', f);
      return () => window.removeEventListener('s2synced', f);
    }, [run]);
    return [st, () => run(true)];
  }
  TT.zh.genderT = '性別';
  TT.zh.female = '女';
  TT.zh.male = '男';
  TT.zh.nationT = '國籍';
  TT.zh.nTW = '台灣';
  TT.zh.nCN = '中國';
  TT.zh.nVN = '越南';
  TT.zh.fillGn = '請補填性別與國籍(之後安排客人要用到)';
  TT.vi.genderT = 'Giới tính';
  TT.vi.female = 'Nữ';
  TT.vi.male = 'Nam';
  TT.vi.nationT = 'Quốc tịch';
  TT.vi.nTW = 'Đài Loan';
  TT.vi.nCN = 'Trung Quốc';
  TT.vi.nVN = 'Việt Nam';
  TT.vi.fillGn = 'Vui lòng bổ sung giới tính và quốc tịch';
  function RegisterForm({
    user,
    onDone,
    showLangFirst
  }) {
    const [lang, setLang] = useState(user ? user.lang : defaultLang());
    const [role, setRole] = useState(user ? user.role : '');
    const [store, setStore] = useState(user ? user.store : '');
    const [code, setCode] = useState(user ? user.code : '');
    const [shift, setShift] = useState(user && user.shift ? user.shift : '');
    const [biz, setBiz] = useState(!!(user && (user.bizPhone === '1' || user.bizPhone === 'req')));
    const [mgrNo, setMgrNo] = useState('');
    const needMgr = !user || user.status === 'pending';
    const [gender, setGender] = useState(user && user.gender ? user.gender : '');
    const [nation, setNation] = useState(user && user.nation ? user.nation : '');
    const [onH, setOnH] = useState(user && user.onHour ? user.onHour : 0);
    const [offH, setOffH] = useState(user && user.offHour ? user.offHour : 0);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const t = TT[lang];
    const ready = role && store && code.trim() && (role !== 'teacher' || shift && onH && offH && gender && nation) && (!needMgr || mgrNo.trim());
    const hrOpts = Array.from({
      length: 24
    }, (_, i) => i + 1);
    const hrTxt = n => n + ' ' + t.hrU;
    const pickOn = v => {
      const n = parseInt(v, 10) || 0;
      setOnH(n);
      if (n) setOffH((n + 12 - 1) % 24 + 1);
    };
    const submit = async () => {
      setBusy(true);
      setErr('');
      let name = '';
      try {
        const p = await liff.getProfile();
        name = p.displayName || '';
      } catch (_e) {}
      const r = await api('s2Register', {
        role,
        store,
        lang,
        code: code.trim(),
        displayName: name,
        shift: role === 'teacher' ? shift : '',
        onHour: role === 'teacher' ? onH : '',
        offHour: role === 'teacher' ? offH : '',
        gender: role === 'teacher' ? gender : '',
        nation: role === 'teacher' ? nation : '',
        mgrNo: needMgr ? mgrNo.trim() : '',
        bizPhone: role === 'counter' && biz ? '1' : ''
      });
      setBusy(false);
      if (r.ok && role === 'teacher' && !(r.user && r.user.onHour && r.user.offHour)) {
        setErr('已送出,但伺服器回傳的上牌/下牌時間是空的(請截圖給開發者)：' + JSON.stringify(r.user || {}));
        return;
      }
      if (r.ok) onDone(r.user);else setErr(r.error || t.fail);
    };
    return React.createElement(Box, null, user && user.role === 'teacher' && !(user.onHour && user.offHour) && React.createElement("p", {
      className: "text-sm text-amber-300 px-1"
    }, t.fillHr), user && user.role === 'teacher' && user.onHour && user.offHour && !(user.gender && user.nation) && React.createElement("p", {
      className: "text-sm text-amber-300 px-1"
    }, t.fillGn), React.createElement(Card, null, React.createElement("p", {
      className: "text-sm text-gray-400 mb-2"
    }, TT.zh.lang, " / ", TT.vi.lang), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Chip, {
      on: lang === 'zh',
      onClick: () => setLang('zh')
    }, "中文"), React.createElement(Chip, {
      on: lang === 'vi',
      onClick: () => setLang('vi')
    }, "Tiếng Việt"))), React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("div", null, React.createElement("p", {
      className: "text-sm text-gray-400 mb-2"
    }, t.role), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Chip, {
      on: role === 'teacher',
      onClick: () => setRole('teacher')
    }, t.teacher), React.createElement(Chip, {
      on: role === 'counter',
      onClick: () => setRole('counter')
    }, t.counter))), role === 'counter' && React.createElement("div", {
      className: "rounded-xl border border-gray-700 p-3"
    }, React.createElement("label", {
      className: "flex items-center gap-2 text-gray-100"
    }, React.createElement("input", {
      type: "checkbox",
      checked: biz,
      onChange: e => setBiz(e.target.checked),
      className: "w-5 h-5"
    }), React.createElement("span", null, "📞 ", t.bizT), user && user.bizPhone === '1' && biz && React.createElement("span", {
      className: "text-xs text-emerald-400"
    }, t.bizOkTag), user && user.bizPhone === 'req' && biz && React.createElement("span", {
      className: "text-xs text-amber-300"
    }, t.bizReqTag)), React.createElement("p", {
      className: "text-xs text-gray-400 mt-1"
    }, t.bizHint)), React.createElement("div", null, React.createElement("p", {
      className: "text-sm text-gray-400 mb-2"
    }, t.store), React.createElement("div", {
      className: "flex flex-wrap gap-2"
    }, STORES.map(s => React.createElement(Chip, {
      key: s,
      on: store === s,
      onClick: () => setStore(s)
    }, s)))), role && React.createElement("div", null, React.createElement("p", {
      className: "text-sm text-gray-400 mb-2"
    }, role === 'teacher' ? t.code : t.name), React.createElement("input", {
      value: code,
      onChange: e => setCode(e.target.value),
      maxLength: role === 'teacher' ? 6 : 20,
      inputMode: role === 'teacher' ? 'numeric' : 'text',
      placeholder: role === 'teacher' ? t.codeHint : t.nameHint,
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-lg text-white"
    })), role === 'teacher' && React.createElement("div", null, React.createElement("p", {
      className: "text-sm text-gray-400 mb-2"
    }, t.shift), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Chip, {
      on: shift === 'early',
      onClick: () => setShift('early')
    }, t.early), React.createElement(Chip, {
      on: shift === 'late',
      onClick: () => setShift('late')
    }, t.late)), React.createElement("p", {
      className: "text-xs text-gray-500 mt-2"
    }, t.shiftHint)), role === 'teacher' && React.createElement("div", null, React.createElement("p", {
      className: "text-sm text-gray-400 mb-2"
    }, t.genderT), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Chip, {
      on: gender === 'F',
      onClick: () => setGender('F')
    }, t.female), React.createElement(Chip, {
      on: gender === 'M',
      onClick: () => setGender('M')
    }, t.male)), React.createElement("p", {
      className: "text-sm text-gray-400 mb-2 mt-3"
    }, t.nationT), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Chip, {
      on: nation === 'TW',
      onClick: () => setNation('TW')
    }, t.nTW), React.createElement(Chip, {
      on: nation === 'CN',
      onClick: () => setNation('CN')
    }, t.nCN), React.createElement(Chip, {
      on: nation === 'VN',
      onClick: () => setNation('VN')
    }, t.nVN))), role === 'teacher' && React.createElement("div", null, React.createElement("p", {
      className: "text-sm text-gray-400 mb-2"
    }, t.onT), React.createElement("select", {
      value: onH || '',
      onChange: e => pickOn(e.target.value),
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-lg text-white"
    }, React.createElement("option", {
      value: ""
    }, t.pickHr), hrOpts.map(n => React.createElement("option", {
      key: n,
      value: n
    }, hrTxt(n)))), React.createElement("p", {
      className: "text-sm text-gray-400 mb-2 mt-3"
    }, t.offT), React.createElement("select", {
      value: offH || '',
      onChange: e => setOffH(parseInt(e.target.value, 10) || 0),
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-lg text-white"
    }, React.createElement("option", {
      value: ""
    }, t.pickHr), hrOpts.map(n => React.createElement("option", {
      key: n,
      value: n
    }, hrTxt(n)))), React.createElement("p", {
      className: "text-xs text-gray-500 mt-2"
    }, t.offHint)), role && needMgr && React.createElement("div", null, React.createElement("p", {
      className: "text-sm text-amber-300 mb-2"
    }, t.mgrNoT), React.createElement("input", {
      value: mgrNo,
      onChange: e => setMgrNo(e.target.value),
      maxLength: 10,
      inputMode: "numeric",
      placeholder: t.mgrNoHint,
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-lg text-white"
    }))), err && React.createElement("p", {
      className: "text-sm text-red-400 text-center"
    }, err), React.createElement(Btn, {
      disabled: !ready,
      loading: busy,
      onClick: submit
    }, busy ? t.saving : t.next));
  }
  const ASK_TEXT = '詢問帳號審核情況';
  function PendingScreen({
    user,
    onEdit,
    onRecheck
  }) {
    const lang = user && user.lang === 'vi' ? 'vi' : 'zh';
    const t = TT[lang];
    const [msg, setMsg] = useState('');
    const [busy, setBusy] = useState(false);
    const ask = async () => {
      setMsg('');
      setBusy(true);
      try {
        if (liff.isInClient && liff.isInClient() && liff.sendMessages) {
          await liff.sendMessages([{
            type: 'text',
            text: ASK_TEXT
          }]);
          setMsg(t.askSent);
          setBusy(false);
          try {
            setTimeout(() => liff.closeWindow(), 600);
          } catch (_e) {}
          return;
        }
      } catch (_e) {}
      setBusy(false);
      const bid = String(user && user.botId || '');
      if (bid) {
        setMsg(t.askManual);
        const u = 'https://line.me/R/oaMessage/' + bid + '/?' + encodeURIComponent(ASK_TEXT);
        try {
          liff.openWindow({
            url: u,
            external: false
          });
        } catch (_e) {
          location.href = u;
        }
      } else setMsg(t.askManual);
    };
    return React.createElement(Box, null, React.createElement(Card, {
      className: "space-y-3 text-center"
    }, React.createElement("div", {
      className: "text-4xl"
    }, "⏳"), React.createElement("p", {
      className: "text-lg font-bold text-white"
    }, t.pendTitle), React.createElement("p", {
      className: "text-sm text-gray-400"
    }, t.pendSub), React.createElement("p", {
      className: "text-sm text-violet-300 underline pt-2"
    }, t.askStuck), React.createElement(Btn, {
      color: "bg-gray-700 text-white",
      loading: busy,
      onClick: ask
    }, t.askBtn), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.askNote), msg && React.createElement("p", {
      className: "text-sm text-emerald-400"
    }, msg), React.createElement("div", {
      className: "flex gap-2 justify-center pt-1"
    }, React.createElement("button", {
      className: "px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-200",
      onClick: onRecheck
    }, t.recheck), React.createElement("button", {
      className: "px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-200",
      onClick: onEdit
    }, t.reEdit))));
  }
  function NeedUser({
    render
  }) {
    const [st, reload] = useLoad('s2Me', {});
    const [user, setUser] = useState(undefined);
    const [editing, setEditing] = useState(false);
    if (st.loading && !st.data) return React.createElement(Loading, {
      text: "載入中… / Đang tải…"
    });
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || '失敗'
    });
    const me = st.data;
    const u = user === undefined ? me.user : user;
    if (u && u.status === 'pending' && !editing) return React.createElement(PendingScreen, {
      user: u,
      onEdit: () => setEditing(true),
      onRecheck: () => {
        cclear('*');
        setUser(undefined);
        reload();
      }
    });
    if (!u || editing || u.role === 'teacher' && !(u.onHour && u.offHour && u.gender && u.nation)) return React.createElement(RegisterForm, {
      user: u,
      onDone: x => {
        setUser(x);
        setEditing(false);
      }
    });
    return render(Object.assign({}, me, {
      user: u
    }), () => setEditing(true), reload);
  }
  TT.zh.recOk = '你回報安全已記錄';
  TT.zh.recHelp = '你回報需要協助已記錄,主管會盡快處理';
  TT.zh.recOther = '你的回報已記錄';
  TT.zh.recording = '記錄中…';
  TT.vi.recOk = 'Đã ghi nhận bạn an toàn';
  TT.vi.recHelp = 'Đã ghi nhận bạn cần hỗ trợ, quản lý sẽ xử lý sớm';
  TT.vi.recOther = 'Đã ghi nhận báo cáo của bạn';
  TT.vi.recording = 'Đang ghi nhận…';
  function ReportPage({
    sid
  }) {
    const need = () => !(peek('s2Me', {}) && peek('s2GetSurvey', {
      id: sid
    }));
    const [ready, setReady] = useState(() => !need());
    useEffect(() => {
      if (ready) return;
      let dead = false;
      api('s2Open', {
        id: sid
      }).then(r => {
        if (r && r.ok) {
          if (r.me && r.me.ok) {
            r.me._at = Date.now();
            cput(ckey('s2Me', {}), r.me);
          }
          if (r.sv && r.sv.ok) {
            r.sv._at = Date.now();
            cput(ckey('s2GetSurvey', {
              id: sid
            }), r.sv);
          }
        }
        if (!dead) setReady(true);
      });
      return () => {
        dead = true;
      };
    }, [sid]);
    if (!ready) return React.createElement(Loading, null);
    return React.createElement(NeedUser, {
      render: (me, editInfo) => React.createElement(ReportInner, {
        me: me,
        sid: sid,
        editInfo: editInfo
      })
    });
  }
  function ReportInner({
    me,
    sid,
    editInfo
  }) {
    const lang = me.user.lang;
    const t = TT[lang];
    const [st, reload] = useLoad('s2GetSurvey', {
      id: sid
    });
    const [other, setOther] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const [picking, setPicking] = useState(new URLSearchParams(location.search).get('act') === 'edit');
    const act = new URLSearchParams(location.search).get('act') || '';
    const clearAct = () => {
      try {
        history.replaceState(null, '', location.pathname + '?s2=r&sid=' + sid);
      } catch (_e) {}
    };
    const autoRef = useRef(false);
    const [auto, setAuto] = useState(act === 'ok' || act === 'help' ? 'wait' : '');
    const [rec, setRec] = useState('');
    useEffect(() => {
      if (act !== 'ok' && act !== 'help' || autoRef.current) return;
      const d = st.data;
      if (!d || !d.ok) return;
      if (me.user && me.user.left) {
        autoRef.current = true;
        setAuto('');
        return;
      }
      autoRef.current = true;
      if (d.survey.closed || d.mine && d.mine.status === act) {
        setAuto('');
        clearAct();
        return;
      }
      api('s2Report', {
        id: sid,
        status: act,
        otherText: ''
      }).then(r => {
        if (r.ok) {
          setRec(act);
          reload();
        } else setErr(r.error || t.fail);
        setAuto('');
        clearAct();
      });
    }, [st.data]);
    if (me.user && me.user.left) return React.createElement(Msg, {
      text: lang === 'vi' ? 'Bạn đã được đặt là nghỉ việc, không thể báo cáo. Vui lòng liên hệ quản lý.' : '你已被設為離職，無法回報。如有疑問請洽主管。'
    });
    if (st.loading && !st.data) return React.createElement(Loading, {
      text: t.loading
    });
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || t.fail
    });
    const s = st.data.survey;
    const mine = st.data.mine;
    const send = async (status, txt) => {
      setBusy(true);
      setErr('');
      const r = await api('s2Report', {
        id: sid,
        status: status,
        otherText: txt || ''
      });
      setBusy(false);
      if (r.ok) {
        setPicking(false);
        setRec(status);
        clearAct();
        reload();
      } else setErr(r.error || t.fail);
    };
    const stLabel = x => x === 'ok' ? t.ok : x === 'help' ? t.help : t.other;
    if (auto === 'wait') return React.createElement(Loading, {
      text: t.recording
    });
    return React.createElement(Box, barOf(st, reload, lang), React.createElement(Card, null, React.createElement("p", {
      className: "text-xs text-amber-400 font-bold"
    }, "⚠️ ", t.survey), React.createElement("h1", {
      className: "text-xl font-bold text-white mt-1"
    }, s.title, s.dateLabel ? ' ' + s.dateLabel : ''), React.createElement("p", {
      className: "text-sm text-gray-400 mt-2"
    }, s.creatorStore || s.creatorLabel ? React.createElement("span", null, t.by, ":", s.creatorStore, " ", s.creatorLabel, React.createElement("br", null)) : null, t.end, ":", s.endDate)), s.closed && React.createElement("p", {
      className: "text-center text-amber-400"
    }, t.closed), rec && !picking && React.createElement(Card, {
      className: "text-center"
    }, React.createElement("p", {
      className: "text-lg font-bold text-emerald-400"
    }, "✅ ", rec === 'ok' ? t.recOk : rec === 'help' ? t.recHelp : t.recOther), !s.closed && React.createElement("button", {
      className: "text-sm text-violet-400 mt-3 underline",
      onClick: () => setPicking(true)
    }, t.change)), mine && !rec && !picking && React.createElement(Card, {
      className: "text-center"
    }, React.createElement("p", {
      className: "text-lg font-bold text-emerald-400"
    }, "✅ ", t.sent, ":", stLabel(mine.status), mine.status === 'other' && mine.otherText ? '(' + mine.otherText + ')' : ''), React.createElement("p", {
      className: "text-xs text-gray-500 mt-1"
    }, t.sentAt, " ", mine.time), !s.closed && React.createElement("button", {
      className: "text-sm text-violet-400 mt-3 underline",
      onClick: () => setPicking(true)
    }, t.change)), (!mine || picking) && !rec && !s.closed && React.createElement(Card, {
      className: "space-y-3"
    }, act !== 'other' && React.createElement("div", {
      className: "grid grid-cols-2 gap-3"
    }, React.createElement(Btn, {
      loading: busy,
      color: "bg-emerald-600 text-white",
      onClick: () => send('ok')
    }, t.ok), React.createElement(Btn, {
      loading: busy,
      color: "bg-red-600 text-white",
      onClick: () => send('help')
    }, t.help)), React.createElement("input", {
      value: other,
      onChange: e => setOther(e.target.value),
      maxLength: 200,
      placeholder: t.otherHint,
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"
    }), React.createElement(Btn, {
      disabled: busy || !other.trim(),
      color: "bg-gray-700 text-white",
      onClick: () => send('other', other.trim())
    }, t.other, " · ", t.send), err && React.createElement("p", {
      className: "text-sm text-red-400 text-center"
    }, err)), React.createElement(Btn, {
      color: "bg-gray-800 text-gray-200",
      onClick: () => go('s2=l&sid=' + sid)
    }, "📋 ", t.list), React.createElement("button", {
      className: "w-full text-center text-sm text-gray-500 underline",
      onClick: editInfo
    }, t.editInfo));
  }
  const SHOW_ENTRY_SHARE = false;
  const SHOW_WEBADMIN_BTN = false;
  const SHOW_REMIND_SHARE = false;
  function detailRows(items, sortBy, asc, flt) {
    const rows = items.filter(i => flt === 'all' || i.status === flt);
    const rank = {
      help: 0,
      other: 1,
      ok: 2
    };
    rows.sort((a, b) => {
      let c = 0;
      if (sortBy === 'time') c = String(a.time).localeCompare(String(b.time));else if (sortBy === 'code') {
        const x = parseFloat(a.label),
          y = parseFloat(b.label);
        c = isNaN(x) || isNaN(y) ? String(a.label).localeCompare(String(b.label)) : x - y;
      } else c = rank[a.status] - rank[b.status] || String(b.time).localeCompare(String(a.time));
      return asc ? c : -c;
    });
    return rows;
  }
  function ListPage({
    sid
  }) {
    return React.createElement(NeedUser, {
      render: (me, editInfo) => React.createElement(ListInner, {
        me: me,
        sid: sid
      })
    });
  }
  function missingText(title, codes) {
    const n = new Date();
    const p = x => String(x).padStart(2, '0');
    return String(title || '') + '尚未回報人員：' + (codes || []).join(' ') + ' (' + n.getFullYear() + '/' + p(n.getMonth() + 1) + '/' + p(n.getDate()) + ' ' + p(n.getHours()) + ':' + p(n.getMinutes()) + ')';
  }
  const SEGS = [['te', '老師 早班', '早班', 'Ca sáng'], ['tl', '老師 晚班', '晚班', 'Ca tối'], ['tn', '老師 未填班別', '未填班別', 'Chưa chọn ca'], ['c', '櫃台', '櫃台', 'Lễ tân']];
  function ListInner({
    me,
    sid
  }) {
    const t = TT[me.user.lang];
    const lang0 = me.user.lang;
    const [st, reload] = useLoad('s2GetList', {
      id: sid
    });
    const [copied, setCopied] = useState('');
    const [open, setOpen] = useState(false);
    const [sortBy, setSortBy] = useState('time');
    const [asc, setAsc] = useState(false);
    const [flt, setFlt] = useState('all');
    if (st.loading && !st.data) return React.createElement(Loading, {
      text: t.loading
    });
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || t.fail
    });
    const d = st.data;
    const doCopy = g => {
      copyText(g.items.map(i => i.label).join(' ')).then(ok => {
        if (ok) {
          setCopied(g.store);
          setTimeout(() => setCopied(''), 1800);
        }
      });
    };
    return React.createElement(Box, barOf(st, reload, lang0), React.createElement(Card, null, React.createElement("p", {
      className: "text-xs text-amber-400 font-bold"
    }, "⚠️ ", t.survey), React.createElement("h1", {
      className: "text-lg font-bold text-white mt-1"
    }, d.survey.title)), d.stores.map(g => React.createElement(Card, {
      key: g.store
    }, React.createElement("div", {
      className: "flex items-center justify-between"
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, g.store, "（", g.items.length, "/", g.total, "）"), g.items.length > 0 && React.createElement("button", {
      className: "text-sm text-violet-400",
      onClick: () => doCopy(g)
    }, copied === g.store ? t.copied : t.copy)), g.items.length === 0 && React.createElement("p", {
      className: "mt-2 text-gray-500"
    }, t.noOne), g.segTotals && (() => {
      const vi = lang0 === 'vi';
      const tk = ['te', 'tl', 'tn'];
      const tTot = tk.reduce((a, k) => a + g.segTotals[k], 0);
      const tRep = g.items.filter(i => tk.indexOf(i.seg) >= 0).length;
      const line = (sg, indent) => {
        if (!g.segTotals[sg[0]]) return null;
        const its = g.items.filter(i => i.seg === sg[0]);
        return React.createElement("p", {
          key: sg[0],
          className: 'text-base leading-8 break-all ' + (indent ? 'pl-4' : '')
        }, React.createElement("span", {
          className: "text-sm text-gray-400"
        }, vi ? sg[3] : sg[2], "（", its.length, "/", g.segTotals[sg[0]], "）："), its.map((i, k) => React.createElement("span", {
          key: k,
          className: 'mr-3 ' + (i.status === 'help' ? 'text-red-400 font-bold' : i.status === 'other' ? 'text-amber-300' : 'text-gray-100')
        }, i.label, i.status === 'help' ? '⚠' : '')));
      };
      return React.createElement("div", {
        className: "mt-2"
      }, tTot > 0 && React.createElement("p", {
        className: "text-sm font-bold text-white"
      }, vi ? 'Sư phụ' : '老師', "（", tRep, "/", tTot, "）"), SEGS.filter(sg => sg[0] !== 'c').map(sg => line(sg, true)), line(SEGS[3], false));
    })())), d.restricted && React.createElement("p", {
      className: "text-xs text-gray-500 text-center"
    }, lang0 === 'vi' ? 'Chỉ hiển thị chi nhánh của bạn' : '僅顯示你所屬店家', ":", d.myStore), d.showMissing && React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, "未回報名單", React.createElement("span", {
      className: "ml-2 text-xs font-normal text-gray-500"
    }, "(已登記但尚未回報)")), d.stores.map(g => React.createElement("div", {
      key: g.store
    }, React.createElement("div", {
      className: "flex items-center justify-between"
    }, React.createElement("p", {
      className: "text-sm text-gray-200"
    }, g.store, "（", (g.missing || []).length, "）"), (g.missing || []).length > 0 && React.createElement("button", {
      className: "text-sm text-violet-400",
      onClick: () => copyText(missingText(d.survey && d.survey.title, g.missing)).then(ok => {
        if (ok) {
          setCopied('m:' + g.store);
          setTimeout(() => setCopied(''), 1800);
        }
      })
    }, copied === 'm:' + g.store ? t.copied : t.copy)), React.createElement("p", {
      className: "mt-1 text-base leading-8 break-all text-gray-100"
    }, (g.missing || []).length === 0 ? React.createElement("span", {
      className: "text-emerald-400 text-sm"
    }, "都已回報 ✅") : (g.missing || []).map((x, k) => React.createElement("span", {
      key: k,
      className: "mr-3"
    }, x))))), SHOW_REMIND_SHARE && React.createElement(Btn, {
      color: "bg-blue-600 text-white",
      onClick: () => go('s2=share&sid=' + sid)
    }, "分享提醒(可再單獨傳給沒回報的人)")), d.detail && React.createElement("div", null, React.createElement("button", {
      className: "text-sm text-gray-400 underline",
      onClick: () => setOpen(!open)
    }, t.detail, " ", open ? '▲' : '▼'), open && React.createElement("div", {
      className: "mt-2 space-y-2"
    }, React.createElement("div", {
      className: "flex flex-wrap items-center gap-2"
    }, React.createElement("span", {
      className: "text-xs text-gray-500"
    }, "排序"), [['time', '時間'], ['code', '編號'], ['status', '狀態']].map(x => React.createElement(Chip, {
      key: x[0],
      on: sortBy === x[0],
      onClick: () => {
        if (sortBy === x[0]) setAsc(!asc);else {
          setSortBy(x[0]);
          setAsc(x[0] !== 'time');
        }
      }
    }, x[1], sortBy === x[0] ? asc ? ' ↑' : ' ↓' : ''))), React.createElement("div", {
      className: "flex flex-wrap items-center gap-2"
    }, React.createElement("span", {
      className: "text-xs text-gray-500"
    }, "篩選"), [['all', '全部'], ['ok', '平安'], ['help', '需要協助'], ['other', '其他']].map(x => React.createElement(Chip, {
      key: x[0],
      on: flt === x[0],
      onClick: () => setFlt(x[0])
    }, x[1]))), d.stores.map(g => {
      const rows = detailRows(g.items, sortBy, asc, flt);
      return rows.length > 0 && React.createElement(Card, {
        key: g.store
      }, React.createElement("p", {
        className: "font-bold text-white text-sm mb-1"
      }, g.store, "（", rows.length, "）"), rows.map((i, k) => React.createElement("p", {
        key: k,
        className: "text-xs leading-6 text-gray-300"
      }, React.createElement("span", {
        className: i.status === 'help' ? 'text-red-400 font-bold' : i.status === 'other' ? 'text-amber-300' : 'text-gray-100'
      }, i.label, "\u3000", i.status === 'ok' ? '平安' : i.status === 'help' ? '需要協助' : '其他'), i.otherText ? '：' + i.otherText : '', "\u3000", React.createElement("span", {
        className: "text-gray-500"
      }, String(i.time).slice(5, 16)))));
    }), d.stores.every(g => detailRows(g.items, sortBy, asc, flt).length === 0) && React.createElement("p", {
      className: "text-sm text-gray-500 text-center"
    }, "沒有符合的項目"))), React.createElement(Btn, {
      color: "bg-gray-800 text-gray-200",
      onClick: () => go('s2=r&sid=' + sid)
    }, "← ", t.back));
  }
  function NewPage({
    share
  }) {
    const inner = () => share ? React.createElement(NeedUser, {
      render: () => React.createElement(NewInner, {
        share: true
      })
    }) : React.createElement(NeedUser, {
      render: () => React.createElement(NewInner, null)
    });
    return React.createElement(NeedUserOptional, {
      render: me => me.canCreate === false ? React.createElement(NoCreate, null) : share ? React.createElement(MgrGate, {
        render: inner
      }) : inner()
    });
  }
  function NoCreate() {
    return React.createElement(Box, null, React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("h1", {
      className: "text-lg font-bold text-white"
    }, "📝 發起新回報"), React.createElement("p", {
      className: "text-amber-300 font-bold"
    }, "目前限制主管才能發起新回報"), React.createElement("p", {
      className: "text-sm text-gray-400"
    }, "如需發起，請洽主管。若你剛通過主管申請，請按下方重新整理。")), React.createElement(Btn, {
      color: "bg-gray-800 text-white border border-gray-600",
      onClick: () => {
        cclear('*');
        window.__s2nonce++;
        window.dispatchEvent(new Event('s2nav'));
      }
    }, "🔄 重新整理"), React.createElement(Btn, {
      color: "bg-gray-800 text-gray-200",
      onClick: () => go('s2=mine')
    }, "我發起的清單"));
  }
  function MgrGate({
    render
  }) {
    const [st] = useLoad('s2MgrInfo', {});
    if (st.loading && !st.data) return React.createElement(Loading, null);
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || '失敗'
    });
    if (!st.data.isMgr) return React.createElement(Msg, {
      text: "此功能僅限主管使用(請由「主管功能」申請)"
    });
    return render();
  }
  const HIST_KEY = 's2:titleHist';
  function loadTitleHist() {
    try {
      const v = JSON.parse(localStorage.getItem(HIST_KEY) || '[]');
      return Array.isArray(v) ? v.filter(x => typeof x === 'string').slice(0, 8) : [];
    } catch (_e) {
      return [];
    }
  }
  function saveTitleHist(t) {
    try {
      const v = [t].concat(loadTitleHist().filter(x => x !== t)).slice(0, 8);
      localStorage.setItem(HIST_KEY, JSON.stringify(v));
    } catch (_e) {}
  }
  function clearTitleHist() {
    try {
      localStorage.removeItem(HIST_KEY);
    } catch (_e) {}
  }
  function NewInner({
    share
  }) {
    const def = new Date();
    const pad = n => String(n).padStart(2, '0');
    const [title, setTitle] = useState('');
    const [end] = useState(def.getFullYear() + '-' + pad(def.getMonth() + 1) + '-' + pad(def.getDate()));
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const [entryRes, setEntryRes] = useState('');
    const [hist, setHist] = useState(loadTitleHist());
    const shareEntry = async () => {
      try {
        if (!liff.isApiAvailable('shareTargetPicker')) {
          setEntryRes('此環境不支援分享,請在 LINE 內開啟');
          return;
        }
        const r = await liff.shareTargetPicker([{
          type: 'flex',
          altText: '🚨 安全回報:天災、緊急事件時,一鍵回報平安',
          contents: buildEntryFlex()
        }]);
        setEntryRes(r ? '已分享 ✅' : '已取消');
      } catch (e) {
        setEntryRes('錯誤:' + String(e && e.message || e));
      }
    };
    const create = async () => {
      setBusy(true);
      setErr('');
      const r = await api('s2CreateSurvey', {
        title: title.trim(),
        endDate: end
      });
      setBusy(false);
      if (r.ok) {
        saveTitleHist(title.trim());
      }
      if (r.ok) go(share ? 's2=share&sid=' + r.id + '&fresh=1' : 's2=mine');else setErr(r.error || '失敗');
    };
    return React.createElement(Box, null, React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("h1", {
      className: "text-lg font-bold text-white"
    }, share ? '📤 建立新回報並分享' : '📝 發起新回報'), React.createElement("div", null, React.createElement("p", {
      className: "text-sm text-gray-400 mb-1"
    }, "標題(最多40字)"), React.createElement("input", {
      value: title,
      onChange: e => setTitle(e.target.value),
      maxLength: 40,
      placeholder: "例如:10/24 颱風 安全回報",
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"
    }), hist.length > 0 && React.createElement("div", {
      className: "mt-2"
    }, React.createElement("div", {
      className: "flex items-center justify-between"
    }, React.createElement("span", {
      className: "text-xs text-gray-500"
    }, "曾輸入過(點一下帶入)"), React.createElement("button", {
      className: "text-xs text-gray-500 underline",
      onClick: () => {
        clearTitleHist();
        setHist([]);
      }
    }, "清除")), React.createElement("div", {
      className: "flex flex-wrap gap-2 mt-1"
    }, hist.map(h => React.createElement("button", {
      key: h,
      onClick: () => setTitle(h),
      className: "px-3 py-1 rounded-full border border-gray-600 text-xs text-gray-300"
    }, h))))), React.createElement("div", null, React.createElement("p", {
      className: "text-sm text-gray-400 mb-1"
    }, "日期（今日，不可更改）"), React.createElement("p", {
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-gray-200"
    }, end)), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "備註：本回報頁為每日回報，故只能設一天到期。")), err && React.createElement("p", {
      className: "text-sm text-red-400 text-center"
    }, err), React.createElement(Btn, {
      disabled: !title.trim() || !end,
      loading: busy,
      onClick: create
    }, share ? '建立並分享' : '建立'), SHOW_ENTRY_SHARE && React.createElement(Btn, {
      color: "bg-gray-700 text-white",
      onClick: shareEntry
    }, "分享「發起新回報」入口"), SHOW_ENTRY_SHARE && entryRes && React.createElement("p", {
      className: "text-center text-sm text-gray-400"
    }, entryRes), React.createElement(Btn, {
      color: "bg-gray-800 text-gray-200",
      onClick: () => go('s2=mine')
    }, "我發起的清單"));
  }
  function MinePage() {
    return React.createElement(NeedUser, {
      render: () => React.createElement(MineInner, null)
    });
  }
  function MineInner() {
    const pick = new URLSearchParams(location.search).get('pick') === '1';
    const [st, reload] = useLoad('s2MySurveys', {});
    const [busy, setBusy] = useState('');
    if (st.loading && !st.data) return React.createElement(Loading, null);
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || '失敗'
    });
    const d = st.data;
    const del = async s => {
      if (!window.confirm('確定要刪除「' + s.title + '」嗎?(資料會保留,只是從清單隱藏)')) return;
      setBusy(s.id);
      const r = await api('s2DeleteSurvey', {
        id: s.id
      });
      if (r.ok) {
        reload();
        setTimeout(() => setBusy(''), 5000);
      } else {
        setBusy('');
        alert(r.error || '失敗');
      }
    };
    const restore = async s => {
      setBusy(s.id);
      const r = await api('s2RestoreSurvey', {
        id: s.id
      });
      if (r.ok) {
        reload();
        setTimeout(() => setBusy(''), 5000);
      } else {
        setBusy('');
        alert(r.error || '失敗');
      }
    };
    const row = s => React.createElement(Card, {
      key: s.id,
      className: s.hidden ? 'opacity-60' : ''
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, s.title, s.hidden && React.createElement("span", {
      className: "ml-2 text-xs text-red-400"
    }, "已刪除"), s.closed && !s.hidden && React.createElement("span", {
      className: "ml-2 text-xs text-gray-500"
    }, "已截止")), React.createElement("p", {
      className: "text-xs text-gray-400 mt-1"
    }, s.creatorStore, " ", s.creatorLabel, "\u3000截止 ", s.endDate, "\u3000已回報 ", s.count, " 人", s.help > 0 && React.createElement("span", {
      className: "text-red-400"
    }, "（需協助 ", s.help, "）")), React.createElement("div", {
      className: 'grid gap-2 mt-3 ' + (pick ? 'grid-cols-3' : 'grid-cols-2')
    }, React.createElement("button", {
      className: "rounded-lg bg-violet-600 text-white text-sm py-2",
      onClick: () => go('s2=l&sid=' + s.id)
    }, "查看名單"), pick && React.createElement("button", {
      disabled: s.hidden,
      className: "rounded-lg bg-blue-600 text-white text-sm py-2 disabled:opacity-30",
      onClick: () => go('s2=share&sid=' + s.id)
    }, "分享"), s.hidden ? d.canRestore ? React.createElement("button", {
      disabled: !!busy,
      className: 'rounded-lg border text-sm py-2 ' + (busy === s.id ? 'border-gray-600 text-gray-500 opacity-60' : 'border-emerald-500 text-emerald-400 disabled:opacity-40'),
      onClick: () => restore(s)
    }, busy === s.id ? React.createElement(Spinner, {
      size: 16
    }) : '還原') : React.createElement("span", null) : s.canDelete ? React.createElement("button", {
      disabled: !!busy,
      className: 'rounded-lg border text-sm py-2 ' + (busy === s.id ? 'border-gray-600 text-gray-500 opacity-60' : 'border-red-500 text-red-400 disabled:opacity-40'),
      onClick: () => del(s)
    }, busy === s.id ? React.createElement(Spinner, {
      size: 16
    }) : '刪除') : React.createElement("span", null)));
    let body;
    if (d.groupByStore) {
      const g = {};
      d.surveys.forEach(s => {
        (g[s.creatorStore || '未分店'] = g[s.creatorStore || '未分店'] || []).push(s);
      });
      body = Object.keys(g).map(k => React.createElement("div", {
        key: k
      }, React.createElement("p", {
        className: "text-sm font-bold text-violet-300 mb-2"
      }, k, "（", g[k].length, "）"), React.createElement("div", {
        className: "space-y-3"
      }, g[k].map(row))));
    } else body = React.createElement("div", {
      className: "space-y-3"
    }, d.surveys.map(row));
    return React.createElement(Box, barOf(st, reload, 'zh'), React.createElement("h1", {
      className: "text-lg font-bold text-white"
    }, "📋 我發起的清單"), React.createElement(Btn, {
      onClick: () => go('s2=new')
    }, "＋ 發起新回報"), d.surveys.length === 0 && React.createElement(Card, null, React.createElement("p", {
      className: "text-center text-gray-500"
    }, "目前沒有項目")), body);
  }
  function buildFlex(s, style) {
    const base = 'https://liff.line.me/' + window.__S2_LIFF_ID;
    return {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: 'lg',
        contents: [{
          type: 'text',
          text: '⚠️ 安全回報 / Báo cáo an toàn',
          weight: 'bold',
          size: 'sm',
          color: '#f59e0b'
        }, {
          type: 'text',
          text: s.title + (s.dateLabel ? ' ' + s.dateLabel : ''),
          weight: 'bold',
          size: 'lg',
          wrap: true,
          color: '#111111'
        }, {
          type: 'text',
          text: '截止:' + s.endDate,
          size: 'sm',
          color: '#888888',
          wrap: true
        }, {
          type: 'text',
          text: style === 2 ? '請直接點下方按鈕回報\nBấm nút bên dưới để báo cáo' : '請點下方按鈕回報\nBấm nút bên dưới để báo cáo',
          size: 'xs',
          color: '#888888',
          wrap: true
        }]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: 'lg',
        contents: (style === 2 ? [{
          type: 'button',
          style: 'primary',
          color: '#16a34a',
          height: 'sm',
          action: {
            type: 'uri',
            label: '✅ 我很安全 / Tôi an toàn',
            uri: base + '?s2=r&sid=' + s.id + '&act=ok'
          }
        }, {
          type: 'button',
          style: 'primary',
          color: '#dc2626',
          height: 'sm',
          action: {
            type: 'uri',
            label: '🆘 需要幫忙 / Cần hỗ trợ',
            uri: base + '?s2=r&sid=' + s.id + '&act=help'
          }
        }, {
          type: 'button',
          style: 'secondary',
          height: 'sm',
          action: {
            type: 'uri',
            label: '✍️ 其他（自行輸入）/ Khác',
            uri: base + '?s2=r&sid=' + s.id + '&act=other'
          }
        }, {
          type: 'button',
          style: 'secondary',
          height: 'sm',
          action: {
            type: 'uri',
            label: '修改回報 / Sửa báo cáo',
            uri: base + '?s2=r&sid=' + s.id + '&act=edit'
          }
        }] : [{
          type: 'button',
          style: 'primary',
          color: '#dc2626',
          height: 'sm',
          action: {
            type: 'uri',
            label: '我要回報 / Báo cáo',
            uri: base + '?s2=r&sid=' + s.id
          }
        }]).concat([{
          type: 'button',
          style: 'secondary',
          height: 'sm',
          action: {
            type: 'uri',
            label: '回報名單 / Danh sách',
            uri: base + '?s2=l&sid=' + s.id
          }
        }])
      }
    };
  }
  function buildEntryFlex() {
    const base = 'https://liff.line.me/' + window.__S2_LIFF_ID;
    const pts = ['不用再人工統計誰還沒回報。系統自動依店別列出已回報名單與人數。', '以 LINE 帳號回報,一個帳號一筆,降低代簽、冒名的狀況。', '發起後可分享到公司其他群組,各店都能一起回報;也能再單獨分享給遲遲沒回報的人,提醒他們補上。', '回報狀態分「平安、需要協助、其他」,需要協助的編號會標紅,可以優先處理。', '第一次回報填一次基本資料,之後點一下就完成。'];
    const rows = pts.map((t, i) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      contents: [{
        type: 'text',
        text: String(i + 1) + '.',
        size: 'sm',
        color: '#dc2626',
        weight: 'bold',
        flex: 0
      }, {
        type: 'text',
        text: t,
        size: 'sm',
        color: '#333333',
        wrap: true,
        flex: 1
      }]
    }));
    return {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: 'lg',
        contents: [{
          type: 'text',
          text: '🚨 安全回報',
          weight: 'bold',
          size: 'xl',
          color: '#dc2626'
        }, {
          type: 'text',
          text: '天災、緊急事件時,一鍵回報平安',
          size: 'sm',
          color: '#666666',
          wrap: true
        }, {
          type: 'separator',
          margin: 'md'
        }, {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          margin: 'md',
          contents: rows
        }]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: 'lg',
        contents: [{
          type: 'button',
          style: 'primary',
          color: '#dc2626',
          height: 'sm',
          action: {
            type: 'uri',
            label: '發起新回報',
            uri: base + '?s2=new'
          }
        }]
      }
    };
  }
  function noBigGroupBubble(title) {
    const line = t => ({
      type: 'text',
      text: t,
      weight: 'bold',
      size: '3xl',
      color: '#b34700',
      align: 'center',
      wrap: true
    });
    return {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#e65100',
        paddingAll: 'lg',
        contents: [{
          type: 'text',
          text: title,
          color: '#ffffff',
          weight: 'bold',
          size: '3xl',
          wrap: true
        }]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        justifyContent: 'center',
        spacing: 'md',
        paddingAll: 'xl',
        contents: [line('店內大群為'), line('主管公佈訊息專用'), line('主管公佈訊息專用'), line('主管公佈訊息專用')]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        contents: [{
          type: 'text',
          text: '說3次代表很重要　謝謝大家配合 🙏',
          color: '#888888',
          size: 'md',
          align: 'center'
        }]
      }
    };
  }
  function buildNoReplyFlex() {
    return noBigGroupBubble('老師不要在大群回文');
  }
  function buildTutorialFlex() {
    const step = (n, txt, extra, color) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'md',
      contents: [{
        type: 'box',
        layout: 'vertical',
        width: '32px',
        height: '32px',
        cornerRadius: '16px',
        backgroundColor: color || '#1e88e5',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 0,
        contents: [{
          type: 'text',
          text: String(n),
          color: '#ffffff',
          weight: 'bold',
          size: 'md',
          align: 'center'
        }]
      }, {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        flex: 1,
        contents: [{
          type: 'text',
          text: txt,
          wrap: true,
          size: 'xl',
          color: '#222222'
        }].concat(extra || [])
      }]
    });
    const fakeBtn = {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#06c755',
      cornerRadius: '8px',
      paddingAll: 'md',
      contents: [{
        type: 'text',
        text: '我要回報',
        color: '#ffffff',
        weight: 'bold',
        size: 'xl',
        align: 'center'
      }]
    };
    const p1 = {
      type: 'bubble',
      size: 'giga',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#1e88e5',
        paddingAll: 'lg',
        contents: [{
          type: 'text',
          text: '如何做 安全回報（教學）',
          color: '#ffffff',
          weight: 'bold',
          size: 'xxl',
          wrap: true
        }]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'xl',
        paddingAll: 'lg',
        contents: [step(1, '點訊息下方的', [fakeBtn]), step(2, '第一次使用：選擇身分（老師／櫃台）、店別、語系，按「下一步」'), step(3, '點選「平安」、「需要協助」或「其他」即完成')]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        contents: [{
          type: 'text',
          text: '只需設定一次，之後會自動記住你',
          color: '#888888',
          size: 'md',
          wrap: true
        }]
      }
    };
    const p2 = noBigGroupBubble('不會操作請找主管詢問');
    return {
      type: 'carousel',
      contents: [p1, p2]
    };
  }
  function buildMgrInviteFlex() {
    const base = 'https://liff.line.me/' + window.__S2_LIFF_ID;
    const pts = ['不用再人工統計誰還沒回報。系統自動依店別列出已回報名單與人數。', '以 LINE 帳號回報,一個帳號一筆,降低代簽、冒名的狀況。', '回報狀態分「平安、需要協助、其他」,需要協助的編號會標紅,可以優先處理。', '第一次回報填一次基本資料,之後點一下就完成。', '目前「發起新回報」以及「分享回報」,只能在主管功能頁進行。', '主管、組長、副理請點下方按鈕,申請設定主管職級,即可發起、分享安全回報並查看本店人員。'];
    const rows = pts.map((t, i) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'sm',
      contents: [{
        type: 'text',
        text: String(i + 1) + '.',
        size: 'sm',
        color: '#6d4aa8',
        weight: 'bold',
        flex: 0
      }, {
        type: 'text',
        text: t,
        size: 'sm',
        color: '#333333',
        wrap: true,
        flex: 1,
        weight: i === 4 ? 'bold' : 'regular'
      }]
    }));
    return {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: 'lg',
        contents: [{
          type: 'text',
          text: '🚨 安全回報',
          weight: 'bold',
          size: 'xl',
          color: '#dc2626'
        }, {
          type: 'text',
          text: '天災、緊急事件時,一鍵回報平安',
          size: 'sm',
          color: '#666666',
          wrap: true
        }, {
          type: 'separator',
          margin: 'md'
        }, {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          margin: 'md',
          contents: rows
        }]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: 'lg',
        contents: [{
          type: 'button',
          style: 'primary',
          color: '#6d4aa8',
          height: 'sm',
          action: {
            type: 'uri',
            label: '開啟主管功能',
            uri: base + '?s2=mgr'
          }
        }]
      }
    };
  }
  function ShareFlexBtn({
    label,
    altText,
    build
  }) {
    const [res, setRes] = useState('');
    const go2 = async () => {
      try {
        if (!liff.isApiAvailable('shareTargetPicker')) {
          setRes('此環境不支援分享,請在 LINE 內開啟');
          return;
        }
        const r = await liff.shareTargetPicker([{
          type: 'flex',
          altText: altText,
          contents: build()
        }]);
        setRes(r ? '已分享 ✅' : '已取消');
      } catch (e) {
        setRes('錯誤:' + String(e && e.message || e));
      }
    };
    return React.createElement("div", null, React.createElement(Btn, {
      color: "bg-gray-800 text-white border border-gray-600",
      onClick: go2
    }, label), res && React.createElement("p", {
      className: "text-center text-sm text-gray-400 mt-1"
    }, res));
  }
  function PendBanner({
    acct,
    biz
  }) {
    const n = (acct || 0) + (biz || 0);
    if (!n) return null;
    return React.createElement("div", {
      style: {
        background: '#c42b1f',
        color: '#fff',
        borderRadius: 12,
        padding: '10px 14px',
        fontWeight: 700,
        fontSize: 15
      }
    }, "🔴 待審 ", n, " 人", React.createElement("span", {
      style: {
        fontWeight: 500,
        fontSize: 13,
        marginLeft: 8
      }
    }, [acct ? '新帳號 ' + acct : '', biz ? '公務機 ' + biz : ''].filter(Boolean).join('、'), "\u3000→ 到「人員管理」按「通過」"));
  }
  function StaffList() {
    const [st, reload] = useLoad('s2StaffList', {});
    const [busy, setBusy] = useState('');
    const [err, setErr] = useState('');
    const today = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
    const [pick, setPick] = useState(null);
    const [add, setAdd] = useState({
      store: '',
      code: '',
      date: today
    });
    if (st.loading && !st.data) return React.createElement(Loading, null);
    if (!st.data || !st.data.ok) return React.createElement("p", {
      className: "text-sm text-red-400"
    }, st.data && st.data.error || '失敗');
    const d = st.data;
    const mdS = x => String(x || '').slice(5).replace('-', '/').replace(/\/0/, '/').replace(/^0/, '');
    const call = async (id, fn) => {
      setBusy(id);
      setErr('');
      const r = await fn();
      setBusy('');
      if (r.ok) {
        setPick(null);
        reload();
      } else setErr(r.error || '失敗');
      return r;
    };
    const approve = m => {
      if (!window.confirm('開通「' + m.store + ' ' + m.code + '」的帳號？')) return;
      call(m.id, () => api('s2UserApprove', {
        targetId: m.id
      }));
    };
    const bizAct = (m, a) => {
      const nm = '「' + m.store + ' ' + m.code + '」';
      if (a === 'no') {
        if (!window.confirm('拒絕 ' + nm + ' 的公務機申請？')) return;
        call(m.id, () => api('s2UserApprove', {
          targetId: m.id,
          reject: '1'
        }));
        return;
      }
      if (a === 'off') {
        if (!window.confirm('取消 ' + nm + ' 的公務機身分？')) return;
        call(m.id, () => api('s2BizSet', {
          targetId: m.id,
          on: ''
        }));
        return;
      }
      if (!window.confirm('將 ' + nm + ' 設為公務機？')) return;
      call(m.id, () => api('s2BizSet', {
        targetId: m.id,
        on: '1'
      }));
    };
    const doLeft = m => call(m.id, () => api('s2StaffSetLeft', {
      targetId: m.id,
      left: true,
      leftDate: pick.date
    }));
    const undo = m => {
      if (!window.confirm(m.manual ? '刪除「' + m.store + ' ' + m.code + '」這筆手動離職記錄？' : '將「' + m.store + ' ' + m.code + '」恢復為在職？\n(清除離職日期，之後可再設離職)')) return;
      call(m.id, () => api('s2StaffSetLeft', {
        targetId: m.id,
        left: false
      }));
    };
    const webToggle = async m => {
      if (!window.confirm((m.web ? '取消' : '設定') + '「' + m.store + ' ' + m.code + '」（LINE：' + (m.name || '未取得') + '）為網頁管理者？' + (m.web ? '' : '\n網頁管理者權限等同管理者。'))) return;
      call(m.id, () => api('s2WebAdminSet', {
        targetId: m.id,
        on: !m.web
      }));
    };
    const addLeft = () => {
      const store = add.store || d.myStore || (d.stores || [])[0] || '';
      if (!add.code.trim()) {
        setErr('請輸入編號');
        return;
      }
      call('add', () => api('s2StaffAddLeft', {
        store: store,
        code: add.code.trim(),
        leftDate: add.date
      })).then(r => {
        if (r && r.ok) setAdd({
          store: add.store,
          code: '',
          date: today
        });
      });
    };
    const groups = (d.stores || []).map(sn => ({
      store: sn,
      items: d.staff.filter(x => x.store === sn)
    })).filter(g => g.items.length > 0);
    const row = m => React.createElement("div", {
      key: m.id,
      className: "py-2"
    }, React.createElement("div", {
      className: "flex items-center justify-between"
    }, React.createElement("div", {
      className: "min-w-0"
    }, React.createElement("p", {
      className: m.left ? 'text-gray-400' : 'text-gray-100'
    }, m.code, m.role === 'counter' ? '（櫃台）' : '', m.biz === '1' ? React.createElement("span", {
      className: "ml-1 text-xs text-emerald-400"
    }, "📞公務機") : m.biz === 'req' ? React.createElement("span", {
      className: "ml-1 text-xs text-amber-300"
    }, "📞公務機申請中") : null, m.shift === 'early' ? '（早班）' : m.shift === 'late' ? '（晚班）' : '', m.onHour && m.offHour ? React.createElement("span", {
      className: "ml-2 text-xs text-gray-400"
    }, '上' + m.onHour + ' 下' + m.offHour) : null, m.left && React.createElement("span", {
      className: "ml-2 text-xs text-amber-400"
    }, m.leftDate ? mdS(m.leftDate) + '離' : '已離職(未填日期)'), m.manual && React.createElement("span", {
      className: "ml-2 text-xs text-gray-500"
    }, "手動記錄"), m.pend && React.createElement("span", {
      className: "ml-2 text-xs text-sky-300"
    }, "審核中", m.mgrNo ? '・填 ' + m.mgrNo : ''), m.web && React.createElement("span", {
      className: "ml-2 text-xs text-violet-300"
    }, "網頁管理者")), !m.manual && React.createElement("p", {
      className: "text-xs text-gray-400 break-all"
    }, "LINE：", m.name || '（未取得）')), React.createElement("div", {
      className: "flex flex-col gap-1 items-end flex-none ml-2"
    }, m.left ? React.createElement(React.Fragment, null, !m.manual && React.createElement("button", {
      disabled: busy === m.id,
      className: "px-3 py-1 rounded-full text-xs bg-gray-700 text-gray-200",
      onClick: () => setPick({
        id: m.id,
        date: m.leftDate || today
      })
    }, "改日期"), React.createElement("button", {
      disabled: busy === m.id,
      className: 'px-3 py-1 rounded-full text-sm ' + (m.manual ? 'bg-gray-700 text-red-300' : 'bg-emerald-700 text-white'),
      onClick: () => undo(m)
    }, m.manual ? '刪除記錄' : '恢復')) : React.createElement(React.Fragment, null, !m.pend && m.role === 'counter' && m.biz === 'req' && React.createElement(React.Fragment, null, React.createElement("button", {
      disabled: busy === m.id,
      className: "px-3 py-1 rounded-full text-xs bg-sky-600 text-white",
      onClick: () => bizAct(m, 'ok')
    }, "通過公務機"), React.createElement("button", {
      disabled: busy === m.id,
      className: "px-3 py-1 rounded-full text-xs bg-gray-700 text-gray-200",
      onClick: () => bizAct(m, 'no')
    }, "拒絕")), !m.pend && m.role === 'counter' && m.biz !== 'req' && React.createElement("button", {
      disabled: busy === m.id,
      className: "px-3 py-1 rounded-full text-xs border border-gray-600 text-gray-300",
      onClick: () => bizAct(m, m.biz === '1' ? 'off' : 'on')
    }, m.biz === '1' ? '取消公務機' : '設為公務機'), m.pend && React.createElement("button", {
      disabled: busy === m.id,
      className: "px-3 py-1 rounded-full text-sm bg-sky-600 text-white",
      onClick: () => approve(m)
    }, "通過"), React.createElement("button", {
      disabled: busy === m.id,
      className: "px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-200",
      onClick: () => setPick({
        id: m.id,
        date: today
      })
    }, "離職")), SHOW_WEBADMIN_BTN && d.realAdmin && !m.left && React.createElement("button", {
      disabled: busy === m.id,
      className: 'px-3 py-1 rounded-full text-xs border ' + (m.web ? 'border-red-500 text-red-400' : 'border-violet-500 text-violet-300'),
      onClick: () => webToggle(m)
    }, m.web ? '取消網頁管理者' : '設為網頁管理者'))), pick && pick.id === m.id && React.createElement("div", {
      className: "mt-2 p-2 rounded bg-gray-800 flex flex-wrap items-center gap-2"
    }, React.createElement("span", {
      className: "text-sm text-gray-200"
    }, "最後上班日(離職日)"), React.createElement("input", {
      type: "date",
      value: pick.date,
      onChange: e => setPick({
        id: m.id,
        date: e.target.value
      }),
      className: "bg-gray-900 text-white rounded px-2 py-1 text-sm border border-gray-600"
    }), React.createElement("button", {
      disabled: busy === m.id || !pick.date,
      className: "px-3 py-1 rounded-full text-sm bg-amber-600 text-white",
      onClick: () => doLeft(m)
    }, "確定"), React.createElement("button", {
      className: "px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-200",
      onClick: () => setPick(null)
    }, "取消"), React.createElement("p", {
      className: "w-full text-xs text-gray-400"
    }, "離職後移到下方「離職區」；總休表該編號下方會加註「", pick.date ? mdS(pick.date) : 'M/D', "離」，已排的休假不會刪除。")));
    const leftSort = (a, b) => a.leftDate < b.leftDate ? 1 : a.leftDate > b.leftDate ? -1 : 0;
    const stores = d.all ? d.stores || [] : [d.myStore];
    const pendA = d.staff.filter(x => x.pend && !x.left).length,
      pendB = d.staff.filter(x => !x.pend && x.biz === 'req' && !x.left).length;
    return React.createElement("div", {
      className: "space-y-3"
    }, React.createElement(PendBanner, {
      acct: pendA,
      biz: pendB
    }), groups.length === 0 && React.createElement("p", {
      className: "text-sm text-gray-500"
    }, "目前沒有人員"), groups.map(g => {
      const on = g.items.filter(x => !x.left).sort((a, b) => (b.pend ? 1 : 0) - (a.pend ? 1 : 0)),
        off = g.items.filter(x => x.left).sort(leftSort);
      return React.createElement("div", {
        key: g.store
      }, React.createElement("p", {
        className: "text-sm text-gray-300"
      }, g.store, "（在職 ", on.length, "／離職 ", off.length, "）"), React.createElement("div", {
        className: "mt-1 divide-y divide-gray-800"
      }, on.map(row)), off.length > 0 && React.createElement("div", {
        className: "mt-2"
      }, React.createElement("p", {
        className: "text-xs text-amber-400"
      }, "離職區"), React.createElement("div", {
        className: "mt-1 divide-y divide-gray-800 border-t border-gray-800"
      }, off.map(row))));
    }), React.createElement("div", {
      className: "p-2 rounded border border-gray-700 space-y-2"
    }, React.createElement("p", {
      className: "text-sm text-gray-200"
    }, "＋ 手動新增離職人員編號", React.createElement("span", {
      className: "text-xs text-gray-500"
    }, "（只做記錄：列入離職區、總休表編號下加註離職日）")), React.createElement("div", {
      className: "flex flex-wrap items-center gap-2"
    }, stores.length > 1 && React.createElement("select", {
      value: add.store || d.myStore || stores[0],
      onChange: e => setAdd({
        ...add,
        store: e.target.value
      }),
      className: "bg-gray-900 text-white rounded px-2 py-1 text-sm border border-gray-600"
    }, stores.map(x => React.createElement("option", {
      key: x,
      value: x
    }, x))), React.createElement("input", {
      value: add.code,
      onChange: e => setAdd({
        ...add,
        code: e.target.value
      }),
      placeholder: "編號",
      inputMode: "numeric",
      className: "w-20 bg-gray-900 text-white rounded px-2 py-1 text-sm border border-gray-600"
    }), React.createElement("input", {
      type: "date",
      value: add.date,
      onChange: e => setAdd({
        ...add,
        date: e.target.value
      }),
      className: "bg-gray-900 text-white rounded px-2 py-1 text-sm border border-gray-600"
    }), React.createElement("button", {
      disabled: busy === 'add',
      className: "px-3 py-1 rounded-full text-sm bg-amber-600 text-white",
      onClick: addLeft
    }, "新增"))), err && React.createElement("p", {
      className: "text-sm text-red-400"
    }, err));
  }
  function StaffCard() {
    const [open, setOpen] = useState(false);
    return React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("button", {
      className: "w-full flex items-center justify-between text-left",
      onClick: () => setOpen(!open)
    }, React.createElement("span", {
      className: "font-bold text-white"
    }, "👥 人員管理（離職）"), React.createElement("span", {
      className: "text-gray-400"
    }, open ? '▲' : '▼')), open && React.createElement(StaffList, null));
  }
  function SharePage({
    sid,
    fresh
  }) {
    return React.createElement(MgrGate, {
      render: () => React.createElement(NeedUser, {
        render: () => React.createElement(ShareInner, {
          sid: sid,
          fresh: fresh
        })
      })
    });
  }
  function ShareInner({
    sid,
    fresh
  }) {
    const [st] = useLoad('s2GetSurvey', {
      id: sid
    });
    const [res, setRes] = useState('');
    const pick = async (s, style) => {
      try {
        if (!liff.isApiAvailable('shareTargetPicker')) {
          setRes('此環境不支援分享,請在 LINE 內開啟');
          return;
        }
        const r = await liff.shareTargetPicker([{
          type: 'flex',
          altText: '⚠️ 安全回報:' + s.title + (s.dateLabel ? ' ' + s.dateLabel : ''),
          contents: buildFlex(s, style)
        }]);
        setRes(r ? 'ok' : 'cancel');
      } catch (e) {
        setRes('錯誤:' + String(e && e.message || e));
      }
    };
    if (st.loading && !st.data) return React.createElement(Loading, null);
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || '失敗'
    });
    const s = st.data.survey;
    return React.createElement(Box, null, React.createElement(Card, null, React.createElement("p", {
      className: "text-xs text-amber-400 font-bold"
    }, fresh ? '✅ 已建立' : '分享'), React.createElement("h1", {
      className: "text-lg font-bold text-white mt-1"
    }, s.title), React.createElement("p", {
      className: "text-sm text-gray-400 mt-1"
    }, "截止 ", s.endDate)), React.createElement(Btn, {
      onClick: () => pick(s, 2)
    }, "分享（樣式2：群組內直接按「我平安／其他」）"), React.createElement(Btn, {
      color: "bg-gray-700 text-white",
      onClick: () => pick(s, 1)
    }, "分享（樣式1：「我要回報」進頁面再選）"), res === 'ok' && React.createElement("p", {
      className: "text-center text-emerald-400"
    }, "已分享 ✅"), res === 'cancel' && React.createElement("p", {
      className: "text-center text-gray-400"
    }, "已取消"), res && res !== 'ok' && res !== 'cancel' && React.createElement("p", {
      className: "text-center text-red-400 text-sm"
    }, res), React.createElement(Btn, {
      color: "bg-gray-800 text-gray-200",
      onClick: () => go('s2=l&sid=' + sid)
    }, "查看名單"), React.createElement(Btn, {
      color: "bg-gray-800 text-gray-200",
      onClick: () => go('s2=mine')
    }, "我發起的清單"));
  }
  const TD = {
    zh: {
      title: '我的回報',
      none: '目前沒有需要回報的項目',
      end: '截止',
      done: '已回報',
      todo: '尚未回報',
      go: '前往回報',
      change: '修改回報',
      list: '回報名單',
      ok: '平安',
      help: '需要協助',
      other: '其他',
      loading: '載入中…'
    },
    vi: {
      title: 'Báo cáo của tôi',
      none: 'Hiện không có mục cần báo cáo',
      end: 'Hạn chót',
      done: 'Đã báo cáo',
      todo: 'Chưa báo cáo',
      go: 'Báo cáo ngay',
      change: 'Sửa báo cáo',
      list: 'Danh sách',
      ok: 'An toàn',
      help: 'Cần hỗ trợ',
      other: 'Khác',
      loading: 'Đang tải…'
    }
  };
  function TodayPage() {
    return React.createElement(NeedUser, {
      render: me => React.createElement(TodayInner, {
        me: me
      })
    });
  }
  function TodayInner({
    me
  }) {
    const lang = me.user && me.user.lang || 'zh';
    const t = TD[lang] || TD.zh;
    const [st, reload] = useLoad('s2TodaySurveys', {});
    if (me.user && me.user.left) return React.createElement(Msg, {
      text: lang === 'vi' ? 'Bạn đã được đặt là nghỉ việc, không thể báo cáo.' : '你已被設為離職，無法回報。如有疑問請洽主管。'
    });
    if (st.loading && !st.data) return React.createElement(Loading, {
      text: t.loading
    });
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || '失敗'
    });
    const d = st.data;
    return React.createElement(Box, barOf(st, reload, lang), React.createElement("h1", {
      className: "text-lg font-bold text-white"
    }, "🙋 ", t.title), d.surveys.length === 0 && React.createElement(Card, null, React.createElement("p", {
      className: "text-center text-gray-500"
    }, t.none)), d.surveys.map(x => React.createElement(Card, {
      key: x.id,
      className: "space-y-2"
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, x.title), React.createElement("p", {
      className: "text-xs text-gray-400"
    }, t.end, " ", x.endDate), React.createElement("p", {
      className: 'text-sm ' + (x.mine ? x.mine.status === 'help' ? 'text-red-400' : x.mine.status === 'other' ? 'text-amber-400' : 'text-emerald-400' : 'text-gray-400')
    }, x.mine ? t.done + '：' + (x.mine.status === 'ok' ? t.ok : x.mine.status === 'help' ? t.help : t.other) : t.todo), React.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, React.createElement(Btn, {
      onClick: () => go('s2=r&sid=' + x.id)
    }, x.mine ? t.change : t.go), React.createElement(Btn, {
      color: "bg-gray-800 text-gray-200",
      onClick: () => go('s2=l&sid=' + x.id)
    }, t.list)))));
  }
  const TM = {
    zh: {
      title: '我的安全回報記錄',
      none: '目前沒有回報記錄',
      ok: '平安',
      help: '需要協助',
      other: '其他',
      time: '回報時間',
      loading: '載入中…'
    },
    vi: {
      title: 'Lịch sử báo cáo an toàn của tôi',
      none: 'Chưa có lịch sử báo cáo',
      ok: 'An toàn',
      help: 'Cần hỗ trợ',
      other: 'Khác',
      time: 'Thời gian báo cáo',
      loading: 'Đang tải…'
    }
  };
  function MyReportsPage() {
    return React.createElement(NeedUser, {
      render: me => React.createElement(MyReportsInner, {
        me: me
      })
    });
  }
  function MyReportsInner({
    me
  }) {
    const lang = me.user && me.user.lang || 'zh';
    const t = TM[lang] || TM.zh;
    const [st, reload] = useLoad('s2MyReports', {});
    if (st.loading && !st.data) return React.createElement(Loading, {
      text: t.loading
    });
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || '失敗'
    });
    const d = st.data;
    return React.createElement(Box, barOf(st, reload, lang), React.createElement("h1", {
      className: "text-lg font-bold text-white"
    }, "🗒️ ", t.title), d.reports.length === 0 && React.createElement(Card, null, React.createElement("p", {
      className: "text-center text-gray-500"
    }, t.none)), d.reports.map((x, k) => React.createElement(Card, {
      key: x.id + '|' + k,
      className: "space-y-1"
    }, React.createElement("p", {
      className: "text-xs text-gray-400"
    }, x.date), React.createElement("p", {
      className: "font-bold text-white"
    }, x.title), React.createElement("p", {
      className: x.status === 'help' ? 'text-red-400 font-bold' : x.status === 'other' ? 'text-amber-400' : 'text-emerald-400'
    }, x.status === 'ok' ? t.ok : x.status === 'help' ? t.help : t.other + (x.otherText ? '：' + x.otherText : '')), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.time, "\u3000", x.time))));
  }
  function StaffPage() {
    return React.createElement(MgrGate, {
      render: () => React.createElement(Box, null, React.createElement(Card, {
        className: "space-y-3"
      }, React.createElement("h1", {
        className: "text-lg font-bold text-white"
      }, "👥 人員清單"), React.createElement(StaffList, null)))
    });
  }
  function BizCard({
    d,
    act
  }) {
    const stores = d.biz.stores || [];
    const [sel, setSel] = useState(d.biz.store || stores[0] || '');
    const info = (d.biz.byStore || {})[sel] || {
      max: 1,
      count: 0
    };
    const set = n => {
      if (n < 0 || n > 5 || n === info.max) return;
      act(() => api('s2BizMaxSet', {
        store: sel,
        max: n
      }));
    };
    const sb = 'w-10 h-10 rounded-xl border border-gray-600 text-xl text-white disabled:opacity-30';
    return React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, "📞 公務機數量"), stores.length > 1 && React.createElement("div", {
      className: "flex gap-2 flex-wrap"
    }, stores.map(sn => React.createElement(Chip, {
      key: sn,
      on: sel === sn,
      onClick: () => setSel(sn)
    }, sn))), React.createElement("div", {
      className: "flex items-center gap-3"
    }, React.createElement("button", {
      className: sb,
      disabled: info.max <= 0,
      onClick: () => set(info.max - 1)
    }, "‹"), React.createElement("span", {
      className: "text-2xl font-bold text-white w-8 text-center"
    }, info.max), React.createElement("button", {
      className: sb,
      disabled: info.max >= 5,
      onClick: () => set(info.max + 1)
    }, "›"), React.createElement("span", {
      className: "text-sm text-gray-300"
    }, sel, "\u3000已核准 ", info.count, " 支")), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "櫃台註冊時勾選「公務機」，主管審核通過才算；已核准數量達到上限就不能再通過。"));
  }
  function PtsAll({
    month,
    store
  }) {
    const [sort, setSort] = useState('code');
    const [m, setM] = useState(month || '');
    const [st] = useLoad('s2PtsMonthAll', store ? {
      month: m,
      store: store
    } : {
      month: m
    });
    useEffect(() => {
      if (month) setM(month);
    }, [month]);
    const D = st.data && st.data.ok && st.data.has ? st.data : null;
    if (!D) return React.createElement("p", {
      className: "text-xs text-gray-500"
    }, st.loading ? '載入中…' : st.data && st.data.error || '沒有資料');
    const srt = arr => arr.slice().sort(sort === 'pts' ? (a, b) => (b.p === null ? -1 : b.p) - (a.p === null ? -1 : a.p) || parseInt(a.c, 10) - parseInt(b.c, 10) : (a, b) => (parseInt(a.c, 10) || 1e9) - (parseInt(b.c, 10) || 1e9));
    const sw = !!(st.loading && month && D.month !== month);
    return React.createElement("div", {
      className: 'space-y-2 border-t border-gray-800 pt-2 ' + (sw ? 'opacity-50' : '')
    }, sw && React.createElement("div", {
      className: "flex items-center justify-center gap-2 text-violet-300 text-sm"
    }, React.createElement(Spinner, {
      size: 18
    }), "讀取中…"), React.createElement("div", {
      className: "flex items-center gap-2 flex-wrap"
    }, React.createElement("p", {
      className: "text-sm font-bold text-white"
    }, D.store, "\u3000", parseInt(D.month.slice(5), 10), " 月全店勞點"), React.createElement("span", {
      className: "flex-1"
    }), React.createElement(Chip, {
      on: sort === 'code',
      onClick: () => setSort('code')
    }, "依編號"), React.createElement(Chip, {
      on: sort === 'pts',
      onClick: () => setSort('pts')
    }, "依勞點")), ['early', 'late'].map(sh => React.createElement("div", {
      key: sh
    }, React.createElement("p", {
      className: "text-xs text-gray-400 mb-1"
    }, sh === 'early' ? '早班' : '晚班', "（標準 ", D.std[sh], "，", D[sh].length, " 人）"), D[sh].length === 0 && React.createElement("p", {
      className: "text-xs text-gray-600"
    }, "沒有人員"), React.createElement("div", {
      className: "grid grid-cols-2 gap-1"
    }, srt(D[sh]).map(x => React.createElement("div", {
      key: x.c,
      className: 'flex items-center gap-2 rounded-lg border px-2 py-1 text-sm ' + (x.c === D.me ? 'border-violet-400 bg-violet-950/30' : 'border-gray-800')
    }, React.createElement("span", {
      className: "font-bold text-gray-200 w-10"
    }, x.c), React.createElement("span", {
      className: 'w-8 text-right ' + (x.p === null ? 'text-gray-600' : x.nb ? 'text-gray-400' : x.met ? 'text-emerald-400' : 'text-red-400')
    }, x.p === null ? '—' : x.p), React.createElement("span", {
      className: "text-[10px] text-gray-500 flex-1 text-right"
    }, x.nb ? '新進' : x.rk > 0 ? '第' + x.rk + '名' : '')))))), React.createElement("p", {
      className: "text-[11px] text-gray-600"
    }, "綠=達標 紅=未達標 灰=新進(前三個月不考核)；—=該月沒有資料。名次為同班別內，同分並列。"));
  }
  function PointsCard({
    d
  }) {
    const stores = d.biz && d.biz.stores || [];
    const [sel, setSel] = useState(d.biz && d.biz.store || stores[0] || '龍山寺店');
    const [txt, setTxt] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');
    const [view, setView] = useState(false);
    const yr = new Date(Date.now() + 8 * 3600e3).getUTCFullYear();
    const example = '{\n  "store": "' + sel + '",\n  "rows": [\n    { "code": "150", "months": { "' + yr + '-01": 22, "' + yr + '-02": 1, "' + yr + '-09": 34 } },\n    { "code": "155", "months": { "' + yr + '-05": 1, "' + yr + '-09": 3 } }\n  ]\n}';
    const prompt = '你是資料轉換助手。我會附上「勞點表」的照片(可能有多張)。請把照片中每一位老師、每一個月份的手寫數字,轉成下面的 JSON,只輸出 JSON 本身(不要加說明文字、不要加 ``` 符號)。\n\n格式規則:\n1. 最外層是物件:{"store":"店別","rows":[…]}。store 固定填 "' + sel + '"。\n2. rows 每一列代表一位老師:{"code":"編號","months":{"yyyy-MM":點數,…}}。\n3. code 是表格最左欄的號碼(只取數字,去掉「號」字),必須是字串。\n4. months 的 key 一律用「' + yr + '-月份」兩位數格式,例如一月=「' + yr + '-01」、九月=「' + yr + '-09」。表頭是一月~十二月。\n5. 點數是整數(0 也要填 0)。空白的格子「不要」輸出該月份。\n6. 忽略「歷史最高」那一欄與備註文字。編號欄是空白的列整列略過。\n7. 看不清楚或不確定的數字,仍填你最可能的值,並在輸出最後另起一行寫「看不清楚:編號xxx 的 x 月」。\n\n範例輸出:\n' + example;
    const cp = async v => {
      let ok = false;
      try {
        ok = await copyText(v);
      } catch (_e) {}
      setMsg(ok ? '已複製' : '複製失敗,請長按文字框手動複製');
      setTimeout(() => setMsg(''), 2500);
    };
    const run = async () => {
      setErr('');
      setMsg('');
      if (!txt.trim()) {
        setErr('請先貼上 JSON');
        return;
      }
      setBusy(true);
      let r;
      try {
        r = await api('s2PtsImport', {
          json: txt.trim()
        });
      } catch (e) {
        r = {
          ok: false,
          error: String(e)
        };
      }
      setBusy(false);
      if (r && r.ok) {
        setMsg('匯入完成:新增 ' + r.added + ' 筆、更新 ' + r.updated + ' 筆(共 ' + r.people + ' 位)');
        setTxt('');
      } else setErr(r && r.error || '匯入失敗');
    };
    return React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, "🏅 勞點匯入"), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "勞點記錄為店內公開:老師在「我的」頁面可看自己的勞點、達標與否、同班別名次,點月份可查看該月全店名單。標準:早班 15、晚班 8;新進前三個月不列入。同一人同月重複匯入會覆蓋。"), stores.length > 1 && React.createElement("div", {
      className: "flex gap-2 flex-wrap"
    }, stores.map(sn => React.createElement(Chip, {
      key: sn,
      on: sel === sn,
      onClick: () => setSel(sn)
    }, sn))), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement("button", {
      onClick: () => cp(prompt),
      className: "flex-1 rounded-xl border border-violet-500 text-violet-300 py-2 text-sm"
    }, "📋 複製給 AI 的描述詞"), React.createElement("button", {
      onClick: () => cp(example),
      className: "flex-1 rounded-xl border border-gray-600 text-gray-200 py-2 text-sm"
    }, "📋 複製 JSON 範例")), React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, "步驟:①複製描述詞 ②貼給你自己的 AI,並附上勞點表照片 ③把 AI 輸出的 JSON 貼到下面 ④按匯入。每次匯入錯誤時整批不會寫入。"), React.createElement("textarea", {
      value: txt,
      onChange: e => setTxt(e.target.value),
      rows: 6,
      placeholder: example,
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white text-xs font-mono"
    }), err && React.createElement("p", {
      className: "text-xs text-red-400 whitespace-pre-wrap"
    }, err), msg && React.createElement("p", {
      className: "text-xs text-emerald-400"
    }, msg), React.createElement(Btn, {
      loading: busy,
      onClick: run
    }, "匯入勞點"), React.createElement("button", {
      onClick: () => setView(!view),
      className: "w-full rounded-xl border border-gray-600 text-gray-200 py-2 text-sm"
    }, view ? '收起全店勞點' : '📋 查看各月全店勞點'), view && React.createElement(PtsAll, {
      store: sel
    }));
  }
  function MgrPage() {
    return React.createElement(NeedUserOptional, {
      render: (me, needReg) => React.createElement(MgrInner, {
        me: me,
        needReg: needReg
      })
    });
  }
  function NeedUserOptional({
    render
  }) {
    const [st] = useLoad('s2Me', {});
    const [user, setUser] = useState(undefined);
    if (st.loading && !st.data) return React.createElement(Loading, null);
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || '失敗'
    });
    const me = Object.assign({}, st.data, {
      user: user === undefined ? st.data.user : user
    });
    return render(me, () => setUser(null));
  }
  function MgrInner({
    me,
    needReg
  }) {
    const [st, reload] = useLoad('s2MgrInfo', {});
    useEffect(() => {
      if (!(st.data && st.data.ok && st.data.isMgr)) return;
      try {
        const v = JSON.parse(localStorage.getItem('n2:afterMgr') || 'null');
        if (v) {
          localStorage.removeItem('n2:afterMgr');
          if (Date.now() - v.t < 7 * 86400e3 && v.to) {
            cclear(['n2List']);
            window.__n2SyncP = null;
            window.__n2Done = null;
            go(v.to);
          }
        }
      } catch (_e) {}
    }, [st.data]);
    const LP = 's2-mgr-pending';
    const lpGet = () => {
      try {
        const v = JSON.parse(localStorage.getItem(LP) || 'null');
        if (v && Date.now() - v.t < 3 * 86400e3) return v;
      } catch (_e) {}
      return null;
    };
    const [step, setStep] = useState(me.pending || lpGet() ? 'sent' : 'ask');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    const [reg, setReg] = useState(false);
    if (st.loading && !st.data) return React.createElement(Loading, null);
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || '失敗'
    });
    const d = st.data;
    const act = async fn => {
      setBusy(true);
      setErr('');
      const r = await fn();
      setBusy(false);
      if (r.ok) reload();else setErr(r.error || '失敗');
      return r;
    };
    if (d.isMgr) {
      try {
        localStorage.removeItem(LP);
      } catch (_e) {}
    }
    if (!d.isMgr) {
      if (reg || !me.user && step === 'level') return React.createElement(RegisterForm, {
        user: me.user,
        onDone: () => {
          cclear('*');
          window.__s2nonce++;
          window.dispatchEvent(new Event('s2nav'));
        }
      });
      return React.createElement(Box, null, React.createElement(Card, {
        className: "space-y-3"
      }, React.createElement("h1", {
        className: "text-lg font-bold text-white"
      }, "🛡️ 主管功能"), step === 'ask' && React.createElement("div", null, React.createElement("p", {
        className: "text-gray-300"
      }, "你目前尚未設定為主管，是否要送出設定申請？"), React.createElement("div", {
        className: "grid grid-cols-2 gap-3 mt-3"
      }, React.createElement(Btn, {
        onClick: () => {
          if (!me.user) setReg(true);else setStep('level');
        }
      }, "是"), React.createElement(Btn, {
        color: "bg-gray-700 text-white",
        onClick: () => go('s2=mine')
      }, "否"))), step === 'level' && React.createElement("div", null, React.createElement("p", {
        className: "text-gray-300 mb-3"
      }, "請選擇你的主管職級："), React.createElement("div", {
        className: "space-y-2"
      }, (me.levels || []).map(l => React.createElement(Btn, {
        key: l,
        disabled: busy,
        color: "bg-gray-800 text-white border border-gray-600",
        onClick: async () => {
          const r = await act(() => api('s2MgrApply', {
            level: l
          }));
          if (r.ok) {
            try {
              localStorage.setItem(LP, JSON.stringify({
                t: Date.now(),
                level: l
              }));
            } catch (_e) {}
            setStep('sent');
          }
        }
      }, l)))), step === 'sent' && React.createElement("div", {
        className: "space-y-2"
      }, React.createElement("p", {
        className: "text-emerald-400"
      }, "已送出申請", me.pending || lpGet() ? '（' + (me.pending || lpGet()).level + '）' : '', "，核准後會通知你。"), React.createElement("button", {
        className: "text-xs text-gray-400 underline",
        onClick: () => {
          try {
            localStorage.removeItem(LP);
          } catch (_e) {}
          setStep('level');
        }
      }, "重新申請其他職級")), err && React.createElement("p", {
        className: "text-sm text-red-400"
      }, err)));
    }
    const setLevel = (m, lv) => act(() => api('s2MgrSet', {
      targetId: m.lineUserId,
      level: lv
    }));
    return React.createElement(Box, barOf(st, () => {
      cclear(['s2Me']);
      reload();
    }, 'zh'), React.createElement(Card, null, React.createElement("h1", {
      className: "text-lg font-bold text-white"
    }, "🛡️ 主管功能"), React.createElement("p", {
      className: "text-sm text-gray-400 mt-1"
    }, "你的職級：", d.level, "\u3000", d.all ? '（可看所有店）' : '（僅限本店）')), React.createElement(PendBanner, {
      acct: d.pendAcct,
      biz: d.pendBiz
    }), d.pending.length > 0 && React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, "待審核申請"), d.pending.map(p => React.createElement("div", {
      key: p.reqId,
      className: "border-t border-gray-800 pt-2"
    }, React.createElement("p", {
      className: "text-gray-200"
    }, p.store, " ", p.label, "\u3000申請：", p.level), React.createElement("div", {
      className: "grid grid-cols-2 gap-2 mt-2"
    }, React.createElement(Btn, {
      disabled: busy,
      color: "bg-emerald-600 text-white",
      onClick: () => act(() => api('s2MgrApprove', {
        rid: p.reqId,
        approve: true
      }))
    }, "核准"), React.createElement(Btn, {
      disabled: busy,
      color: "bg-gray-700 text-white",
      onClick: () => act(() => api('s2MgrApprove', {
        rid: p.reqId,
        approve: false
      }))
    }, "拒絕"))))), React.createElement("p", {
      className: "text-sm font-bold text-violet-300 px-1 pt-3"
    }, "👥 人員與權限"), React.createElement(StaffCard, null), React.createElement(Card, {
      className: "space-y-3"
    }, d.level !== '櫃台組長' && React.createElement("div", {
      className: "flex items-center justify-between"
    }, React.createElement("span", {
      className: "text-gray-200"
    }, "🔔 接收主管申請通知"), React.createElement("button", {
      disabled: busy,
      className: 'px-4 py-1 rounded-full text-sm ' + (d.notify ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'),
      onClick: () => act(() => api('s2MgrNotify', {
        on: !d.notify
      }))
    }, d.notify ? '開' : '關'))), React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, "主管名單（調整職級）"), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "只能調整「職級比自己低」的人；同級或更高職級僅供查看。"), d.mgrs.length === 0 && React.createElement("p", {
      className: "text-gray-500 text-sm"
    }, "目前沒有主管"), d.mgrs.map(m => React.createElement("div", {
      key: m.lineUserId,
      className: "border-t border-gray-800 pt-2"
    }, React.createElement("p", {
      className: "text-gray-200"
    }, m.store, " ", m.label, "\u3000", React.createElement("span", {
      className: "text-violet-300"
    }, m.level)), m.canEdit && React.createElement("div", {
      className: "flex flex-wrap gap-2 mt-2"
    }, d.levels.filter(l => (d.settable || []).indexOf(l) >= 0).map(l => React.createElement(Chip, {
      key: l,
      on: m.level === l,
      onClick: () => m.level !== l && setLevel(m, l)
    }, l)), React.createElement("button", {
      className: "px-3 py-2 rounded-full border border-red-500 text-red-400 text-sm",
      onClick: () => window.confirm('取消「' + m.label + '」的主管職？') && setLevel(m, '')
    }, "取消主管"))))), d.biz && React.createElement(BizCard, {
      d: d,
      act: act
    }), d.biz && React.createElement(PointsCard, {
      d: d
    }), d.admin && React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, "🆕 新帳號審核方式"), React.createElement("div", {
      className: "flex gap-2 flex-wrap"
    }, React.createElement(Chip, {
      on: d.apvMode !== 'notify',
      onClick: () => d.apvMode === 'notify' && act(() => api('s2ApvModeSet', {
        mode: 'auto'
      }))
    }, "填對主管編號自動通過"), React.createElement(Chip, {
      on: d.apvMode === 'notify',
      onClick: () => d.apvMode !== 'notify' && act(() => api('s2ApvModeSet', {
        mode: 'notify'
      }))
    }, "推播給所填主管審核")), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "註冊時填的「所屬主管編號」若不是本店主管，一律不推播、不拒絕，帳號顯示「審核中」，由本人當面找主管確認，主管再到人員管理按「通過」。")), React.createElement("p", {
      className: "text-sm font-bold text-violet-300 px-1 pt-3"
    }, "🛡️ 安全回報"), React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement(Btn, {
      onClick: () => go('s2=mnew')
    }, "＋ 建立新回報並分享"), React.createElement(Btn, {
      color: "bg-gray-800 text-white border border-gray-600",
      onClick: () => go('s2=mine&pick=1')
    }, "目前的安全回報調查（查看名單／分享）"), React.createElement(Btn, {
      color: "bg-gray-800 text-gray-200 border border-gray-600",
      onClick: () => go('s2=mine')
    }, "我發起的清單"), d.admin && React.createElement("div", {
      className: "flex items-center justify-between"
    }, React.createElement("span", {
      className: "text-gray-200"
    }, "👁 已刪除項目對我也隱藏"), React.createElement("button", {
      disabled: busy,
      className: 'px-4 py-1 rounded-full text-sm ' + (d.hideAdmin ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'),
      onClick: () => act(() => api('s2AdminHide', {
        on: !d.hideAdmin
      }))
    }, d.hideAdmin ? '開' : '關'))), d.canSetOpen && React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, "👁 公開給成員（僅限本店）"), [['detail', '詳細頁（回報時間、說明）', d.detailOpen], ['missing', '未回報名單', d.missingOpen]].map(x => React.createElement("div", {
      key: x[0],
      className: "flex items-center justify-between"
    }, React.createElement("span", {
      className: "text-gray-200"
    }, x[1]), React.createElement("button", {
      disabled: busy,
      className: 'px-4 py-1 rounded-full text-sm ' + (x[2] ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'),
      onClick: () => act(() => api('s2OpenSet', {
        which: x[0],
        on: !x[2]
      }))
    }, x[2] ? '公開' : '僅主管'))), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "「僅主管」＝只有發起人、本店主管、區經理以上與管理者能看。")), React.createElement("p", {
      className: "text-sm font-bold text-violet-300 px-1 pt-3"
    }, "📢 公告與 🚫 拒接名單"), React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement(Btn, {
      color: "bg-gray-800 text-white border border-gray-600",
      onClick: () => go('n2=l')
    }, "📢 公司公告（發布／已讀情況）"), React.createElement(Btn, {
      color: "bg-gray-800 text-gray-200 border border-gray-600",
      onClick: () => go('n2=set')
    }, "⚙ 公告設定（測試模式、推播、LINE 額度）"), React.createElement(Btn, {
      color: "bg-gray-800 text-white border border-gray-600",
      onClick: () => go('b2=l')
    }, "🚫 拒接名單（查詢／核准）"), React.createElement(Btn, {
      color: "bg-gray-800 text-gray-200 border border-gray-600",
      onClick: () => go('b2=set')
    }, "⚙ 拒接名單設定（直接錄入模式、顯示）")), React.createElement("p", {
      className: "text-sm font-bold text-violet-300 px-1 pt-3"
    }, "📤 分享工具"), React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement(ShareFlexBtn, {
      label: "📖 分享「回報教學」給好友",
      altText: "如何做安全回報(教學)",
      build: buildTutorialFlex
    }), React.createElement(ShareFlexBtn, {
      label: "🚫 分享「老師不要在大群回文」字卡",
      altText: "老師不要在大群回文",
      build: buildNoReplyFlex
    }), React.createElement(ShareFlexBtn, {
      label: "🛡️ 分享「主管功能」邀請",
      altText: "主管功能",
      build: buildMgrInviteFlex
    }), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "Flex 傳到群組後無法收回，請確認標題與對象再分享。")), err && React.createElement("p", {
      className: "text-sm text-red-400 text-center"
    }, err));
  }
  function ApvPage({
    rid
  }) {
    const [st, reload] = useLoad('s2MgrInfo', {});
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    if (st.loading && !st.data) return React.createElement(Loading, null);
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || '失敗'
    });
    const p = (st.data.pending || []).find(x => x.reqId === rid);
    if (msg) return React.createElement(Msg, {
      text: msg
    });
    if (!p) return React.createElement(Msg, {
      text: '找不到這筆申請\n(可能已處理，或你沒有核准權限)'
    });
    const decide = async a => {
      setBusy(true);
      const r = await api('s2MgrApprove', {
        rid: rid,
        approve: a
      });
      setBusy(false);
      setMsg(r.ok ? a ? '已核准 ✅' : '已拒絕' : r.error || '失敗');
    };
    return React.createElement(Box, null, React.createElement(Card, null, React.createElement("p", {
      className: "text-xs text-violet-300 font-bold"
    }, "🛡️ 主管設定申請"), React.createElement("h1", {
      className: "text-lg font-bold text-white mt-1"
    }, p.store, " ", p.label), React.createElement("p", {
      className: "text-gray-300 mt-1"
    }, "申請職級：", p.level), React.createElement("p", {
      className: "text-xs text-gray-500 mt-1"
    }, p.requestedAt)), React.createElement("div", {
      className: "grid grid-cols-2 gap-3"
    }, React.createElement(Btn, {
      disabled: busy,
      color: "bg-emerald-600 text-white",
      onClick: () => decide(true)
    }, "核准"), React.createElement(Btn, {
      disabled: busy,
      color: "bg-gray-700 text-white",
      onClick: () => decide(false)
    }, "拒絕")));
  }
  const S2_BASE_VER = (document.title.match(/v\d+\.\d+-\d+/) || [''])[0];
  function s2PageName() {
    const q = new URLSearchParams(location.search);
    if (q.has('sp')) return q.get('sp') === 'early' ? '早鳥夜貓' : '價目表';
    if (q.has('gb2')) {
      const v = q.get('gb2') || 'l';
      return v === 'set' ? '手套團購設定' : '手套團購';
    }
    if (q.has('lv2')) return '預排休假';
    if (q.has('cn2')) return '主櫃';
    if (q.has('b2')) {
      const v = q.get('b2') || 'l';
      return v === 'new' ? '新增拒接' : v === 'set' ? '拒接名單設定' : '拒接名單';
    }
    if (q.has('n2')) {
      const v = q.get('n2') || 'l';
      return {
        v: '公告內容',
        new: '發布公告',
        edit: '編輯公告',
        r: '已讀情況',
        set: '設定'
      }[v] || '公司公告';
    }
    const v = q.get('s2') || '';
    return {
      mgr: '主管專區',
      staff: '人員管理',
      apv: '主管審核',
      mine: '我的通報',
      my: '我的回報',
      new: '發起通報',
      mnew: '發起通報',
      share: '分享通報',
      today: '今日回報',
      r: '安全回報',
      l: '通報名單'
    }[v] || '';
  }
  function s2SetTitle() {
    try {
      const n = s2PageName();
      document.title = '員工專區' + (n ? ' - ' + n : '') + (S2_BASE_VER ? ' ' + S2_BASE_VER : '');
    } catch (_e) {}
  }
  function Safety2App({
    liffId
  }) {
    window.__S2_LIFF_ID = liffId || window.__S2_LIFF_ID || '';
    const [, setN] = useState(0);
    useEffect(() => {
      s2SetTitle();
    }, [location.search]);
    useEffect(() => {
      const h = () => {
        setN(n => n + 1);
        s2SetTitle();
      };
      window.addEventListener('s2nav', h);
      window.addEventListener('popstate', h);
      return () => {
        window.removeEventListener('s2nav', h);
        window.removeEventListener('popstate', h);
      };
    }, []);
    return React.createElement(React.Fragment, {
      key: location.search + '|' + window.__s2nonce
    }, React.createElement(Safety2Routes, null));
  }
  function Safety2Routes() {
    const q = new URLSearchParams(location.search);
    if (kioskGet() && window.Counter2Routes) {
      const CNK = window.Counter2Routes;
      return React.createElement(CNK, null);
    }
    if (q.has('sp') && window.ShopRoutes) {
      const SP = window.ShopRoutes;
      return React.createElement(SP, null);
    }
    if (q.has('gb2') && window.Gloves2Routes) {
      const G2 = window.Gloves2Routes;
      return React.createElement(G2, null);
    }
    if (q.has('cn2') && window.Counter2Routes) {
      const CN = window.Counter2Routes;
      return React.createElement(CN, null);
    }
    if (q.has('my2') && window.My2Routes) {
      const M2 = window.My2Routes;
      return React.createElement(M2, null);
    }
    if (q.has('lv2') && window.Leave2Routes) {
      const L2 = window.Leave2Routes;
      return React.createElement(L2, null);
    }
    if (q.has('b2') && window.Blacklist2Routes) {
      const B2 = window.Blacklist2Routes;
      return React.createElement(B2, null);
    }
    if (q.has('n2') && window.Notice2Routes) {
      const N2 = window.Notice2Routes;
      return React.createElement(N2, null);
    }
    const p = q.get('s2') || '';
    const sid = q.get('sid') || '';
    if (p === 'r') return sid ? React.createElement(ReportPage, {
      sid: sid
    }) : React.createElement(Msg, {
      text: "缺少回報代碼"
    });
    if (p === 'l') return sid ? React.createElement(ListPage, {
      sid: sid
    }) : React.createElement(Msg, {
      text: "缺少回報代碼"
    });
    if (p === 'new') return React.createElement(NewPage, null);
    if (p === 'mnew') return React.createElement(NewPage, {
      share: true
    });
    if (p === 'mine') return React.createElement(MinePage, null);
    if (p === 'share') return sid ? React.createElement(SharePage, {
      sid: sid,
      fresh: q.get('fresh') === '1'
    }) : React.createElement(Msg, {
      text: "缺少回報代碼"
    });
    if (p === 'mgr') return React.createElement(MgrPage, null);
    if (p === 'today') return React.createElement(TodayPage, null);
    if (p === 'my') return React.createElement(MyReportsPage, null);
    if (p === 'staff') return React.createElement(StaffPage, null);
    if (p === 'apv') return React.createElement(ApvPage, {
      rid: q.get('rid') || ''
    });
    const mods = [['safety2.js', true], ['notice2.js', !!window.Notice2Routes], ['blacklist2.js', !!window.Blacklist2Routes], ['gloves2.js', !!window.Gloves2Routes], ['leave2.js', !!window.Leave2Routes], ['my2.js', !!window.My2Routes], ['shop2.js', !!window.ShopRoutes], ['counter2.js', !!window.Counter2Routes]];
    const vers = mods.map(([n, ok]) => {
      let v = '未引入';
      try {
        const el = [].slice.call(document.querySelectorAll('script[src]')).find(x => (x.getAttribute('src') || '').indexOf('/' + n) >= 0);
        if (el) {
          const m = (el.getAttribute('src') || '').match(/v=([\w.-]+)/);
          v = m ? m[1] : '無版本';
        }
      } catch (e) {}
      return n + ' ' + v + (ok ? ' ✅已載入' : ' ❌未載入');
    });
    const dbg = '參數: ' + (location.search || '(空)') + ' ｜ 頁面:' + (document.title || '');
    return React.createElement("div", {
      className: "space-y-2"
    }, React.createElement(Msg, {
      text: "不支援的頁面"
    }), React.createElement("p", {
      className: "text-xs text-gray-500 break-all px-2"
    }, dbg), React.createElement("div", {
      className: "text-xs text-gray-400 px-2 space-y-0.5"
    }, React.createElement("p", {
      className: "font-bold text-gray-300"
    }, "模組版本"), vers.map(x => React.createElement("p", {
      key: x
    }, x)), React.createElement("p", {
      className: "text-gray-600 pt-1"
    }, "❌未載入＝檔案沒上傳、檔名不符或內容有語法錯誤（請清除 LINE 快取後重開）")));
  }
  window.S2Core = {
    qKick,
    qLoad,
    PtsAll,
    Chip,
    api,
    useLoad,
    Box,
    Card,
    Btn,
    Loading,
    Msg,
    Spinner,
    NeedUser,
    go,
    copyText,
    barOf,
    cclear,
    cput,
    ckey,
    peek,
    CACHEABLE,
    WRITE_CLEAR,
    STORES
  };
  window.Safety2App = Safety2App;
})();