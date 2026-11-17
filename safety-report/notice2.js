/*BUILD notice2.js v1.0-016 編譯版 h=e7cd57f3 t=2026-11-17 16:44*/
(function () {
  const {
    useState,
    useEffect,
    useMemo,
    useRef
  } = React;
  const C = window.S2Core;
  if (!C) {
    window.Notice2Routes = () => React.createElement('div', {
      className: 'p-6 text-center text-red-400'
    }, '載入失敗:缺少 safety2.js');
    return;
  }
  const {
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
    WRITE_CLEAR
  } = C;
  const Chip = C.Chip || (({
    on,
    children,
    onClick
  }) => React.createElement("button", {
    onClick: onClick,
    className: 'px-4 py-2 rounded-full border text-sm ' + (on ? 'bg-violet-600 border-violet-600 text-white' : 'border-gray-600 text-gray-300')
  }, children));
  ['n2List', 'n2Get', 'n2Readers'].forEach(a => {
    if (CACHEABLE.indexOf(a) < 0) CACHEABLE.push(a);
  });
  ['n2Save', 'n2Hide', 'n2Pin', 'n2Delete'].forEach(a => {
    WRITE_CLEAR[a] = ['n2List', 'n2Get', 'n2Readers'];
  });
  WRITE_CLEAR.n2SettingsSet = ['n2List'];
  function clearLocalNotices() {
    try {
      cclear(['n2List', 'n2Get', 'n2Readers']);
      const ks = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.indexOf('n2draft:') === 0) ks.push(k);
      }
      ks.forEach(k => localStorage.removeItem(k));
    } catch (_e) {}
  }
  function n2SyncOnce() {
    if (!window.__n2SyncP) window.__n2SyncP = api('n2List', {}, true).then(r => {
      if (r && r.left) {
        clearLocalNotices();
        return {
          left: true,
          msg: r.error
        };
      }
      if (r && r.ok) {
        cclear(['n2Get']);
        return {
          ok: true
        };
      }
      return {
        ok: false
      };
    }).catch(() => ({
      ok: false
    }));
    return window.__n2SyncP;
  }
  function SyncGate({
    children,
    route
  }) {
    const have = !!peek('n2List', {});
    const [s, setS] = useState(window.__n2SyncP && window.__n2Done ? window.__n2Done : null);
    useEffect(() => {
      let dead = false;
      n2SyncOnce().then(r => {
        window.__n2Done = r;
        if (!dead) setS(r);
      });
      return () => {
        dead = true;
      };
    }, []);
    if (s && s.left) return React.createElement(Msg, {
      text: (s.msg || '此帳號已離職，無法查看公告') + '\n本機的公告資料已清除'
    });
    if (!s && !have) return React.createElement(Loading, {
      text: "載入公告中…"
    });
    return route === 'l' ? React.createElement(React.Fragment, {
      key: s ? 'synced' : 'init'
    }, children) : children;
  }
  const L = {
    zh: {
      title: '公司公告',
      search: '搜尋標題、內容、標籤',
      go: '搜尋',
      all: '全部',
      unreadOnly: '只看未讀',
      none: '目前沒有公告',
      pinned: '置頂',
      back: '返回列表',
      unread: '未讀',
      read: '已讀',
      loading: '載入中…',
      fail: '失敗',
      tags: '標籤',
      date: '發布',
      end: '到期',
      lang: '中文 / Tiếng Việt',
      noVi: '尚無越南文版本',
      readers: '已讀情況'
    },
    vi: {
      title: 'Thông báo công ty',
      search: 'Tìm tiêu đề, nội dung, thẻ',
      go: 'Tìm',
      all: 'Tất cả',
      unreadOnly: 'Chỉ chưa đọc',
      none: 'Hiện chưa có thông báo',
      pinned: 'Ghim',
      back: 'Quay lại danh sách',
      unread: 'Chưa đọc',
      read: 'Đã đọc',
      loading: 'Đang tải…',
      fail: 'Thất bại',
      tags: 'Thẻ',
      date: 'Đăng',
      end: 'Hết hạn',
      lang: '中文 / Tiếng Việt',
      noVi: 'Chưa có bản tiếng Việt',
      readers: 'Tình trạng đã đọc'
    }
  };
  const ROLE_LABEL = {
    teacher: '老師',
    counter: '櫃台'
  };
  const pick = (n, k, lang) => lang === 'vi' && n[k + 'Vi'] ? n[k + 'Vi'] : n[k];
  const tagsOf = (n, lang) => lang === 'vi' && n.tagsVi && n.tagsVi.length === n.tags.length ? n.tagsVi : n.tags;
  function Notice2Routes() {
    const q = new URLSearchParams(location.search);
    const p = q.get('n2') || 'l';
    const nid = q.get('nid') || '';
    return React.createElement(NeedUser, {
      render: (me, editInfo) => React.createElement(SyncGate, {
        route: p
      }, (() => {
        if (p === 'done') return nid ? React.createElement(DonePage, {
          me: me,
          nid: nid
        }) : React.createElement(Msg, {
          text: "缺少公告代碼"
        });
        if (p === 'v') return nid ? React.createElement(ViewPage, {
          me: me,
          nid: nid
        }) : React.createElement(Msg, {
          text: "缺少公告代碼"
        });
        if (p === 'new') return React.createElement(NewGate, {
          me: me
        });
        if (p === 'edit') return nid ? React.createElement(EditPage, {
          me: me,
          nid: nid
        }) : React.createElement(Msg, {
          text: "缺少公告代碼"
        });
        if (p === 'r') return nid ? React.createElement(ReadersPage, {
          me: me,
          nid: nid
        }) : React.createElement(Msg, {
          text: "缺少公告代碼"
        });
        if (p === 'set') return React.createElement(SettingsPage, {
          me: me,
          editInfo: editInfo
        });
        return React.createElement(ListPage, {
          me: me
        });
      })())
    });
  }
  function ListPage({
    me
  }) {
    const lang = me.user && me.user.lang === 'vi' ? 'vi' : 'zh';
    const t = L[lang];
    const qp = new URLSearchParams(location.search);
    const q0 = qp.get('q') || '';
    const tag0 = qp.get('tag') || '';
    const [showArch, setShowArch] = useState(false);
    const [qIn, setQIn] = useState(q0);
    const [tag, setTag] = useState(tag0);
    const [onlyUnread, setOnlyUnread] = useState(false);
    const [st, reload] = useLoad('n2List', {});
    if (st.loading && !st.data) return React.createElement(Loading, {
      text: t.loading
    });
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || t.fail
    });
    const d = st.data;
    const search = () => go('n2=l' + (qIn.trim() ? '&q=' + encodeURIComponent(qIn.trim()) : ''));
    let list = d.notices;
    if (q0) {
      const ql = q0.toLowerCase();
      list = list.filter(n => (n.title + ' ' + n.body + ' ' + n.tags.join(' ') + ' ' + n.titleVi + ' ' + n.bodyVi + ' ' + (n.tagsVi || []).join(' ')).toLowerCase().indexOf(ql) >= 0);
    }
    if (tag) list = list.filter(n => n.tags.indexOf(tag) >= 0);
    if (onlyUnread) list = list.filter(n => n.status === 'published' && !n.read && !n.expired);
    const flag = n => {
      const f = [];
      if (n.status === 'draft') f.push(['草稿', 'text-amber-400']);
      if (n.status === 'hidden') f.push(['已隱藏', 'text-red-400']);
      if (n.status === 'deleted') f.push(['已刪除', 'text-red-400']);
      if (n.test) f.push(['🧪 測試', 'text-sky-400']);
      if (n.expired && n.status === 'published') f.push(['已過期', 'text-gray-500']);
      return f;
    };
    const isArch = n => n.status === 'hidden' || n.status === 'deleted';
    const act = list.filter(n => !isArch(n)),
      arch = list.filter(isArch);
    const renderItem = n => React.createElement("button", {
      key: n.id,
      className: "w-full text-left",
      onClick: () => go('n2=v&nid=' + n.id)
    }, React.createElement(Card, {
      className: n.status !== 'published' || n.expired ? 'opacity-70' : ''
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, n.pinned && React.createElement("span", {
      className: "mr-1"
    }, "📌"), !n.read && n.status === 'published' && !n.expired && React.createElement("span", {
      className: "inline-block w-2 h-2 rounded-full bg-red-500 mr-2 align-middle"
    }), pick(n, 'title', lang), flag(n).map((f, i) => React.createElement("span", {
      key: i,
      className: 'ml-2 text-xs ' + f[1]
    }, f[0]))), React.createElement("p", {
      className: "text-xs text-gray-400 mt-1"
    }, n.dateLabel, n.cat ? '　' + n.cat : '', n.creatorLabel ? '　' + (n.creatorStore || '') + ' ' + n.creatorLabel : '', n.stores && n.stores.length > 0 && d.canPost ? '　→ ' + n.stores.map(s => s.replace('店', '')).join('、') : '', n.roles && n.roles.length > 0 && d.canPost ? '（' + n.roles.map(r => ROLE_LABEL[r]).join('、') + '）' : ''), React.createElement("p", {
      className: "text-sm text-gray-300 mt-2 line-clamp-2"
    }, lang === 'vi' && n.summaryVi ? n.summaryVi : n.summary), n.tags.length > 0 && React.createElement("p", {
      className: "text-xs text-violet-300 mt-2"
    }, tagsOf(n, lang).map(x => '#' + x).join(' '))));
    return React.createElement(Box, barOf(st, reload, lang), React.createElement("div", {
      className: "flex items-center justify-between"
    }, React.createElement("h1", {
      className: "text-lg font-bold text-white"
    }, "📢 ", t.title, d.unread > 0 && React.createElement("span", {
      className: "ml-2 text-xs bg-red-600 text-white rounded-full px-2 py-0.5"
    }, d.unread)), React.createElement("button", {
      className: "text-xs text-gray-400 border border-gray-700 rounded-full px-3 py-1",
      onClick: () => go('n2=set')
    }, "⚙ ", lang === 'vi' ? 'Cài đặt' : '設定')), d.canPost && React.createElement(Btn, {
      onClick: () => go('n2=new')
    }, "＋ 發布公告"), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement("input", {
      value: qIn,
      onChange: e => setQIn(e.target.value),
      onKeyDown: e => {
        if (e.key === 'Enter') search();
      },
      placeholder: t.search,
      className: "flex-1 min-w-0 rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white text-sm"
    }), React.createElement("button", {
      className: "rounded-xl bg-gray-700 text-white text-sm px-4",
      onClick: search
    }, t.go)), d.tags.length > 0 && React.createElement("div", {
      className: "flex flex-wrap gap-2"
    }, React.createElement("button", {
      className: 'px-3 py-1 rounded-full border text-xs ' + (!tag ? 'bg-violet-600 border-violet-600 text-white' : 'border-gray-600 text-gray-300'),
      onClick: () => setTag('')
    }, t.all), d.tags.map(x => React.createElement("button", {
      key: x.tag,
      className: 'px-3 py-1 rounded-full border text-xs ' + (tag === x.tag ? 'bg-violet-600 border-violet-600 text-white' : 'border-gray-600 text-gray-300'),
      onClick: () => setTag(tag === x.tag ? '' : x.tag)
    }, "#", lang === 'vi' && x.tagVi ? x.tagVi : x.tag))), React.createElement("label", {
      className: "flex items-center gap-2 text-sm text-gray-400"
    }, React.createElement("input", {
      type: "checkbox",
      checked: onlyUnread,
      onChange: e => setOnlyUnread(e.target.checked)
    }), t.unreadOnly), q0 && React.createElement("p", {
      className: "text-xs text-gray-400"
    }, "🔎 「", q0, "」\u3000", React.createElement("button", {
      className: "underline",
      onClick: () => go('n2=l')
    }, "清除")), list.length === 0 && React.createElement(Card, null, React.createElement("p", {
      className: "text-center text-gray-500"
    }, t.none)), React.createElement("div", {
      className: "space-y-3"
    }, act.map(renderItem)), arch.length > 0 && React.createElement("div", {
      className: "space-y-3"
    }, React.createElement("button", {
      className: "w-full flex items-center justify-between rounded-xl border border-gray-700 px-4 py-3 text-sm text-gray-300",
      onClick: () => setShowArch(!showArch)
    }, React.createElement("span", null, "🗑 已刪除／已隱藏（", arch.length, "）"), React.createElement("span", null, showArch ? '▲' : '▼')), showArch && arch.map(renderItem)));
  }
  const CAT_VI = {
    '緊急': 'Khẩn cấp',
    '排班': 'Xếp ca',
    '活動': 'Hoạt động',
    '規定': 'Quy định',
    '一般': 'Chung'
  };
  function noticeHead(n, vi, sep) {
    const st = n.stores || [];
    const store = st.length === 1 ? st[0] : '';
    const md = n.dateLabel || '';
    return vi ? 'Thông báo ' + (store || 'công ty') + (md ? ' ' + md : '') : (store ? store + '公告' : '公司公告') + (md ? sep + md : '');
  }
  const fmtTime = s => String(s || '').replace(/-/g, '/').slice(0, 16);
  function buildNoticeFlex(n) {
    const base = 'https://liff.line.me/' + window.__S2_LIFF_ID;
    const dUrl = base + '?n2=done&nid=' + n.id,
      rUrl = base + '?n2=r&nid=' + n.id;
    const mk = vi => {
      const title = (vi ? n.titleVi : n.title) || n.title;
      const text = (vi ? n.bodyVi : n.body) || '';
      const tags = (vi ? n.tagsVi : n.tags) || [];
      const col = '#6d4aa8';
      const body = [{
        type: 'text',
        text: noticeHead(n, vi, ' '),
        size: 'xs',
        color: '#6B7280',
        wrap: true
      }];
      if (n.cat) body.push({
        type: 'text',
        text: vi ? 'Phân loại: ' + (CAT_VI[n.cat] || n.cat) : '分類:' + n.cat,
        size: 'xs',
        color: '#888888'
      });
      body.push({
        type: 'text',
        text: title,
        weight: 'bold',
        size: 'xl',
        wrap: true,
        color: '#111111'
      });
      if (text) body.push({
        type: 'separator',
        margin: 'md'
      }, {
        type: 'text',
        text: text,
        size: 'sm',
        color: '#333333',
        wrap: true,
        margin: 'md'
      });
      const tg = tags.filter(Boolean);
      if (tg.length) body.push({
        type: 'text',
        text: tg.map(x => '#' + String(x).replace(/^#/, '')).join(' '),
        size: 'xs',
        color: col,
        wrap: true,
        margin: 'md'
      });
      return {
        type: 'bubble',
        size: 'mega',
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          paddingAll: 'lg',
          contents: body
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          paddingAll: 'lg',
          contents: [{
            type: 'button',
            style: 'primary',
            color: col,
            height: 'sm',
            action: {
              type: 'uri',
              label: vi ? 'Đã đọc xong' : '完成閱讀',
              uri: dUrl
            }
          }, {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'uri',
              label: vi ? 'Xem danh sách đã đọc' : '查看閱讀名單',
              uri: rUrl
            }
          }]
        }
      };
    };
    const hasVi = !!(n.titleVi || n.bodyVi);
    const bubbles = [mk(false)];
    if (hasVi) bubbles.push(mk(true));
    return bubbles.length > 1 ? {
      type: 'carousel',
      contents: bubbles
    } : bubbles[0];
  }
  function buildNoticeSumFlex(n, counts) {
    const base = 'https://liff.line.me/' + window.__S2_LIFF_ID;
    const dUrl = base + '?n2=done&nid=' + n.id;
    const col = '#7C3AED';
    const mk = vi => {
      const title = (vi ? n.titleVi : n.title) || n.title;
      const body = [{
        type: 'text',
        text: noticeHead(n, vi, '-'),
        size: 'xs',
        color: '#6B7280',
        wrap: true
      }, {
        type: 'text',
        text: title,
        size: 'xl',
        weight: 'bold',
        wrap: true,
        margin: 'sm'
      }];
      if (counts && counts.length) {
        body.push({
          type: 'separator',
          margin: 'md'
        });
        if (counts.length === 1) body.push({
          type: 'text',
          text: (vi ? 'Số người đã đọc：' : '閱讀人數：') + counts[0].read + '/' + counts[0].total,
          size: 'sm',
          color: '#374151',
          margin: 'md'
        });else {
          body.push({
            type: 'text',
            text: vi ? 'Số người đã đọc' : '閱讀人數',
            size: 'xs',
            color: '#6B7280',
            margin: 'md'
          });
          counts.forEach(c => body.push({
            type: 'text',
            text: c.store + '　' + c.read + '/' + c.total,
            size: 'sm',
            color: '#374151'
          }));
        }
      }
      return {
        type: 'bubble',
        size: 'kilo',
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'xs',
          contents: body
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [{
            type: 'button',
            style: 'primary',
            color: col,
            height: 'sm',
            action: {
              type: 'uri',
              label: vi ? 'Đã đọc xong' : '完成閱讀',
              uri: dUrl
            }
          }]
        }
      };
    };
    const bubbles = [mk(false)];
    if (n.titleVi || n.bodyVi) bubbles.push(mk(true));
    return bubbles.length > 1 ? {
      type: 'carousel',
      contents: bubbles
    } : bubbles[0];
  }
  const N2_BENEFITS = ['新加入 LINE 群組的老師，也能查到過去的公告', '系統自動統計誰已讀、誰還沒讀，不用人工一個個確認', '依店別、身分（老師／櫃台）精準發送，不打擾不相關的人', '中文、越南文雙語，各自看得懂', '用標籤與關鍵字搜尋，不必在群組裡往上滑找', '重要公告可置頂，不會被聊天訊息洗掉', '內容修改後，大家看到的都是最新版'];
  function buildIntroFlex() {
    const base = 'https://liff.line.me/' + window.__S2_LIFF_ID;
    const col = '#7C3AED';
    return {
      type: 'bubble',
      size: 'mega',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: 'lg',
        contents: [{
          type: 'text',
          text: '📢 公司公告系統',
          size: 'xs',
          color: '#6B7280'
        }, {
          type: 'text',
          text: '使用公告系統的好處',
          size: 'xl',
          weight: 'bold',
          wrap: true
        }, {
          type: 'separator',
          margin: 'md'
        }].concat(N2_BENEFITS.map((b, i) => ({
          type: 'text',
          text: i + 1 + '. ' + b,
          size: 'sm',
          wrap: true,
          color: '#111827',
          margin: 'md'
        })))
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        paddingAll: 'lg',
        contents: [{
          type: 'button',
          style: 'primary',
          color: col,
          height: 'sm',
          action: {
            type: 'uri',
            label: '測試公告系統',
            uri: base + '?n2=new&intro=1'
          }
        }]
      }
    };
  }
  function NewGate({
    me
  }) {
    const ok0 = (() => {
      const c = peek('n2List', {});
      return !!(c && c.ok && c.canPost);
    })();
    const [st, setSt] = useState(ok0 ? {
      ok: true
    } : {
      wait: true
    });
    useEffect(() => {
      if (st.ok) return;
      let dead = false;
      n2SyncOnce().then(async () => {
        if (dead) return;
        let c = peek('n2List', {});
        if (!c) c = await api('n2List', {}, true);
        if (c && c.ok && c.canPost) {
          setSt({
            ok: true
          });
          return;
        }
        if (c && c.ok) {
          try {
            localStorage.setItem('n2:afterMgr', JSON.stringify({
              t: Date.now(),
              to: 'n2=new'
            }));
          } catch (_e) {}
          go('s2=mgr');
          return;
        }
        setSt({
          err: '讀取失敗,請稍後再試'
        });
      });
      return () => {
        dead = true;
      };
    }, []);
    if (st.ok) return React.createElement(EditPage, {
      me: me,
      nid: ""
    });
    if (st.err) return React.createElement(Msg, {
      text: st.err
    });
    return React.createElement(Loading, {
      text: "確認權限中…"
    });
  }
  function DonePage({
    me,
    nid
  }) {
    const lang = me.user && me.user.lang === 'vi' ? 'vi' : 'zh';
    const [st, setSt] = useState({
      loading: true
    });
    useEffect(() => {
      let dead = false;
      api('n2Done', {
        id: nid
      }).then(r => {
        if (!dead) {
          setSt({
            loading: false,
            r: r
          });
          if (r && r.ok) cclear(['n2List', 'n2Get', 'n2Readers']);
        }
      });
      return () => {
        dead = true;
      };
    }, [nid]);
    if (st.loading) return React.createElement(Loading, {
      text: L[lang].loading
    });
    const r = st.r || {};
    if (!r.ok) return React.createElement(Msg, {
      text: r.error || L[lang].fail
    });
    const vi = lang === 'vi';
    return React.createElement(Box, null, React.createElement(Card, {
      className: "space-y-3 text-center"
    }, React.createElement("p", {
      className: "text-4xl"
    }, "✅"), React.createElement("p", {
      className: "text-lg font-bold text-white"
    }, vi ? 'Đã ghi nhận bạn đã đọc xong' : '已記錄你已完成閱讀'), React.createElement("p", {
      className: "text-gray-300"
    }, fmtTime(r.readAt)), React.createElement("p", {
      className: "text-sm text-gray-400"
    }, vi ? r.titleVi || r.title : r.title), !r.firstRead && r.recorded && React.createElement("p", {
      className: "text-xs text-gray-500"
    }, vi ? '(Bạn đã đọc trước đó, giữ nguyên thời gian đầu tiên)' : '(你之前已經讀過,時間為第一次完成閱讀的時間)')), React.createElement(Btn, {
      color: "bg-gray-800 text-gray-200 border border-gray-600",
      onClick: () => go('n2=v&nid=' + nid)
    }, vi ? 'Xem toàn văn thông báo' : '查看公告全文'));
  }
  function ViewPage({
    me,
    nid
  }) {
    const defLang = me.user && me.user.lang === 'vi' ? 'vi' : 'zh';
    const [lang, setLang] = useState(defLang);
    const t = L[lang];
    {
      const lst = peek('n2List', {});
      const ln = lst && lst.ok && (lst.notices || []).find(x => x.id === nid && typeof x.body === 'string');
      if (ln && !peek('n2Get', {
        id: nid
      })) cput(ckey('n2Get', {
        id: nid
      }), {
        ok: true,
        notice: ln,
        readAt: ln.read ? 'read' : '',
        canReaders: !!ln.canReaders,
        canPost: lst.canPost,
        cfg: lst.cfg,
        firstRead: false,
        _at: lst._at || Date.now()
      });
    }
    const [st, reload] = useLoad('n2Get', {
      id: nid
    });
    const [busy, setBusy] = useState(false);
    const [res, setRes] = useState('');
    const rdRef = useRef(null);
    useEffect(() => {
      const dd = st.data;
      if (!dd || !dd.ok || dd.firstRead || dd.readAt || dd.notice.status !== 'published') return;
      let dead = false;
      api('n2Done', {
        id: nid
      }).then(r => {
        if (!r || !r.ok) return;
        try {
          const k = ckey('n2List', {});
          const l = peek('n2List', {});
          if (l && l.ok) {
            const x = l.notices.find(y => y.id === nid);
            if (x && !x.read) {
              x.read = true;
              if (!x.expired) l.unread = Math.max(0, (l.unread || 0) - 1);
              cput(k, l);
            }
          }
          const k2 = ckey('n2Get', {
            id: nid
          });
          const g = peek('n2Get', {
            id: nid
          });
          if (g && g.ok) {
            g.readAt = r.readAt;
            g.notice.read = true;
            cput(k2, g);
          }
        } catch (_e) {}
      });
      return () => {
        dead = true;
      };
    }, [st.data && st.data.ok]);
    useEffect(() => {
      if (st.data && st.data.ok && st.data.canReaders && st.data.notice.status === 'published') {
        let dead = false;
        api('n2Readers', {
          id: nid
        }, true).then(r => {
          if (!dead && r && r.ok) rdRef.current = {
            t: Date.now(),
            stores: r.stores
          };
        });
        return () => {
          dead = true;
        };
      }
    }, [st.data && st.data.ok]);
    useEffect(() => {
      if (st.data && st.data.ok && st.data.firstRead && Date.now() - (st.data._at || 0) < 15000) cclear(['n2List']);
    }, [st.data]);
    if (st.loading && !st.data) return React.createElement(Loading, {
      text: t.loading
    });
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || t.fail
    });
    const d = st.data;
    const n = d.notice;
    const hasVi = !!(n.titleVi || n.bodyVi);
    const act = async (action, p) => {
      setBusy(true);
      const r = await api(action, Object.assign({
        id: nid
      }, p));
      setBusy(false);
      if (r.ok) {
        if (action === 'n2Delete' && p && p.deleted) go('n2=l');else reload();
      } else alert(r.error || '失敗');
    };
    const doShare = async (alt, contents) => {
      try {
        if (!liff.isApiAvailable('shareTargetPicker')) {
          setRes('此環境不支援分享,請在 LINE 內開啟');
          return;
        }
        const r = await liff.shareTargetPicker([{
          type: 'flex',
          altText: alt,
          contents: contents
        }]);
        setRes(r ? '已分享 ✅' : '已取消');
      } catch (e) {
        setRes('錯誤:' + String(e && e.message || e));
      }
    };
    const altOf = () => noticeHead(n, false, '-') + ':' + n.title;
    const share = () => doShare(altOf(), buildNoticeFlex(n));
    const shareSum = async () => {
      let rd = rdRef.current;
      if (!rd || Date.now() - rd.t > 60000) {
        setRes('讀取閱讀人數中…');
        const r = await api('n2Readers', {
          id: nid
        }, true);
        rd = r && r.ok ? {
          t: Date.now(),
          stores: r.stores
        } : null;
        rdRef.current = rd;
        setRes('');
      }
      const counts = rd ? rd.stores.map(g => ({
        store: g.store,
        read: g.read.length,
        total: g.total
      })) : null;
      doShare(altOf(), buildNoticeSumFlex(n, counts));
    };
    return React.createElement(Box, barOf(st, reload, lang), React.createElement("button", {
      className: "text-sm text-violet-300",
      onClick: () => go('n2=l')
    }, "← ", t.back), React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("div", {
      className: "flex items-start justify-between gap-2"
    }, React.createElement("h1", {
      className: "text-xl font-bold text-white"
    }, n.pinned && '📌 ', pick(n, 'title', lang)), hasVi && React.createElement("button", {
      className: "shrink-0 text-xs text-gray-300 border border-gray-700 rounded-full px-3 py-1",
      onClick: () => setLang(lang === 'zh' ? 'vi' : 'zh')
    }, lang === 'zh' ? 'Tiếng Việt' : '中文')), React.createElement("p", {
      className: "text-xs text-gray-400"
    }, t.date, " ", n.createdAt.slice(0, 16), n.endDate ? '　' + t.end + ' ' + n.endDate : '', n.cat ? '　' + n.cat : '', n.creatorLabel ? '　' + (n.creatorStore || '') + ' ' + n.creatorLabel : ''), lang === 'vi' && !n.bodyVi && React.createElement("p", {
      className: "text-xs text-amber-400"
    }, t.noVi), React.createElement("p", {
      className: "text-gray-100 whitespace-pre-wrap leading-relaxed"
    }, lang === 'vi' && n.bodyVi ? n.bodyVi : n.body), n.tags.length > 0 && React.createElement("div", {
      className: "flex flex-wrap gap-2"
    }, tagsOf(n, lang).map((x, i) => React.createElement("button", {
      key: i,
      className: "text-xs text-violet-300 border border-violet-500/40 rounded-full px-3 py-1",
      onClick: () => go('n2=l&q=' + encodeURIComponent(n.tags[i]))
    }, "#", x))), d.readAt && React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "✓ ", t.read, " ", d.readAt.slice(5, 16))), n.status === 'draft' && React.createElement("p", {
      className: "text-center text-amber-400 text-sm"
    }, "這是草稿,只有你看得到"), n.status === 'hidden' && React.createElement("p", {
      className: "text-center text-red-400 text-sm"
    }, "這則公告已隱藏"), n.status === 'deleted' && React.createElement("p", {
      className: "text-center text-red-400 text-sm"
    }, "這則公告已刪除（資料仍保留，可還原）"), d.canReaders && React.createElement(Btn, {
      color: "bg-gray-800 text-gray-200 border border-gray-600",
      onClick: () => go('n2=r&nid=' + nid)
    }, "📊 ", t.readers), n.canManage && d.canPost && React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "管理"), React.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, n.status !== 'deleted' && React.createElement(Btn, {
      color: "bg-gray-700 text-white",
      onClick: () => go('n2=edit&nid=' + nid)
    }, "✏️ 編輯"), n.status === 'published' && React.createElement(Btn, {
      color: "bg-gray-700 text-white",
      loading: busy,
      onClick: () => act('n2Pin', {
        pinned: !n.pinned
      })
    }, n.pinned ? '取消置頂' : '📌 置頂'), n.status !== 'deleted' && React.createElement(Btn, {
      color: n.status === 'hidden' ? 'bg-emerald-700 text-white' : 'bg-orange-700 text-white',
      loading: busy,
      onClick: () => {
        if (n.status === 'hidden' || window.confirm('確定要隱藏這則公告嗎?(資料會保留,可以還原)')) act('n2Hide', {
          hidden: n.status !== 'hidden'
        });
      }
    }, n.status === 'hidden' ? '還原' : '🙈 隱藏'), React.createElement(Btn, {
      color: n.status === 'deleted' ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white',
      loading: busy,
      onClick: () => {
        if (n.status === 'deleted' || window.confirm('確定要刪除這則公告嗎?(會收進「已刪除／已隱藏」,資料保留,可以還原)')) act('n2Delete', {
          deleted: n.status !== 'deleted'
        });
      }
    }, n.status === 'deleted' ? '還原' : '🗑 刪除'), n.status === 'published' && React.createElement(Btn, {
      color: "bg-blue-600 text-white",
      onClick: share
    }, "📤 分享到群組（完整內容）"), n.status === 'published' && d.canReaders && React.createElement(Btn, {
      color: "bg-blue-800 text-white",
      onClick: shareSum
    }, "📤 分享到群組（標題＋閱讀人數）")), res && React.createElement("p", {
      className: "text-center text-sm text-gray-400"
    }, res)));
  }
  function EditPage({
    me,
    nid
  }) {
    const [st] = useLoad('n2List', {});
    const [g, setG] = useState(nid ? undefined : null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [titleVi, setTitleVi] = useState('');
    const [bodyVi, setBodyVi] = useState('');
    const [tagsTxt, setTagsTxt] = useState('');
    const [tagsViTxt, setTagsViTxt] = useState('');
    const [cat, setCat] = useState('');
    const [stores, setStores] = useState([]);
    const [roles, setRoles] = useState([]);
    const [pinned, setPinned] = useState(false);
    const [endDate, setEndDate] = useState('');
    const [push, setPush] = useState(false);
    const [cnt, setCnt] = useState(null);
    const [isTest, setIsTest] = useState(null);
    const [testTo, setTestTo] = useState('self');
    const [busy, setBusy] = useState('');
    const [err, setErr] = useState('');
    const [aiMsg, setAiMsg] = useState('');
    const [aiErr, setAiErr] = useState('');
    const [aiUsed, setAiUsed] = useState(null);
    useEffect(() => {
      let dead = false;
      api('n2AiUsage', {}).then(r => {
        if (!dead && r && r.ok) setAiUsed(r.count);
      });
      return () => {
        dead = true;
      };
    }, []);
    const [asUid, setAsUid] = useState('');
    const [pubAt, setPubAt] = useState('');
    const pubAt0 = useRef('');
    const [ready, setReady] = useState(false);
    const [restored, setRestored] = useState('');
    const baseRef = useRef(null);
    const dkey = 'n2draft:' + (() => {
      try {
        return (liff.getContext() || {}).userId || '';
      } catch (_e) {
        return '';
      }
    })() + ':' + (nid || 'new');
    const pack = o => JSON.stringify({
      title: o.title,
      body: o.body,
      titleVi: o.titleVi,
      bodyVi: o.bodyVi,
      tagsTxt: o.tagsTxt,
      tagsViTxt: o.tagsViTxt,
      cat: o.cat,
      stores: o.stores,
      roles: o.roles,
      pinned: !!o.pinned,
      endDate: o.endDate,
      isTest: o.isTest,
      testTo: o.testTo,
      push: !!o.push
    });
    const restoreDraft = () => {
      try {
        const v = JSON.parse(localStorage.getItem(dkey) || 'null');
        if (!v || !v.d) return;
        const x = v.d;
        setTitle(x.title || '');
        setBody(x.body || '');
        setTitleVi(x.titleVi || '');
        setBodyVi(x.bodyVi || '');
        setTagsTxt(x.tagsTxt || '');
        setTagsViTxt(x.tagsViTxt || '');
        setCat(x.cat || '');
        setStores(x.stores || []);
        setRoles(x.roles || []);
        setPinned(!!x.pinned);
        setEndDate(x.endDate || '');
        setIsTest(x.isTest === undefined ? null : x.isTest);
        setTestTo(x.testTo === 'mgr' ? 'mgr' : 'self');
        setPush(!!x.push);
        const d = new Date(v.t);
        setRestored('已還原上次在這支手機輸入、還沒發布的內容（' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + '）');
      } catch (_e) {}
    };
    const dropDraft = () => {
      if (!window.confirm('確定捨棄這份暫存內容嗎?')) return;
      try {
        localStorage.removeItem(dkey);
      } catch (_e) {}
      location.reload();
    };
    useEffect(() => {
      if (!nid) return;
      let dead = false;
      api('n2Get', {
        id: nid,
        noMark: true
      }, true).then(r => {
        if (dead) return;
        if (!r.ok) {
          setG(false);
          setErr(r.error || '失敗');
          return;
        }
        const n = r.notice;
        setG(n);
        setTitle(n.title);
        setBody(n.body);
        setTitleVi(n.titleVi);
        setBodyVi(n.bodyVi);
        setTagsTxt(n.tags.join(' '));
        setTagsViTxt(n.tagsVi.join(' '));
        setCat(n.cat);
        setStores(n.stores);
        setRoles(n.roles);
        setPinned(n.pinned);
        setEndDate(n.endDate);
        setIsTest(!!n.test);
        setTestTo(n.testTo === 'mgr' ? 'mgr' : 'self');
        if (n.creatorId) setAsUid(n.creatorId);
        {
          const pv = String(n.createdAt || '').slice(0, 16).replace(' ', 'T');
          setPubAt(pv);
          pubAt0.current = pv;
        }
        baseRef.current = pack({
          title: n.title,
          body: n.body,
          titleVi: n.titleVi,
          bodyVi: n.bodyVi,
          tagsTxt: n.tags.join(' '),
          tagsViTxt: n.tagsVi.join(' '),
          cat: n.cat,
          stores: n.stores,
          roles: n.roles,
          pinned: n.pinned,
          endDate: n.endDate,
          isTest: !!n.test,
          testTo: n.testTo === 'mgr' ? 'mgr' : 'self',
          push: false
        });
        restoreDraft();
        setReady(true);
      });
      return () => {
        dead = true;
      };
    }, [nid]);
    useEffect(() => {
      if (!nid) {
        baseRef.current = pack({
          title: '',
          body: '',
          titleVi: '',
          bodyVi: '',
          tagsTxt: '',
          tagsViTxt: '',
          cat: '',
          stores: [],
          roles: [],
          pinned: false,
          endDate: '',
          isTest: null,
          testTo: 'self',
          push: false
        });
        restoreDraft();
        setReady(true);
      }
    }, [nid]);
    useEffect(() => {
      if (!ready) return;
      const cur = pack({
        title,
        body,
        titleVi,
        bodyVi,
        tagsTxt,
        tagsViTxt,
        cat,
        stores,
        roles,
        pinned,
        endDate,
        isTest,
        testTo,
        push
      });
      try {
        if (cur === baseRef.current) localStorage.removeItem(dkey);else localStorage.setItem(dkey, JSON.stringify({
          t: Date.now(),
          d: JSON.parse(cur)
        }));
      } catch (_e) {}
    }, [ready, title, body, titleVi, bodyVi, tagsTxt, tagsViTxt, cat, stores.join(','), roles.join(','), pinned, endDate, isTest, testTo, push]);
    const d = st.data && st.data.ok ? st.data : null;
    const cfg = d ? d.cfg : {};
    const testOn = isTest === null ? !!cfg.testMode : isTest;
    const showTest = !!cfg.testMode || !!g && !!g.test;
    const stKey = stores.join(',');
    const roKey = roles.join(',');
    useEffect(() => {
      if (!push || nid || testOn) {
        setCnt(null);
        return;
      }
      let dead = false;
      api('n2AudienceCount', {
        stores: d && !d.all ? [d.myStore] : stores,
        roles: roles
      }).then(r => {
        if (!dead) setCnt(r.ok ? r.count : null);
      });
      return () => {
        dead = true;
      };
    }, [push, stKey, roKey, testOn]);
    if (st.loading && !st.data) return React.createElement(Loading, null);
    if (!d) return React.createElement(Msg, {
      text: st.data && st.data.error || '失敗'
    });
    if (!d.canPost) return React.createElement(Msg, {
      text: "只有主管可以發布公告"
    });
    if (nid && g === undefined) return React.createElement(Loading, null);
    if (nid && g === false) return React.createElement(Msg, {
      text: err || '找不到這則公告'
    });
    const toggle = (arr, set, v) => set(arr.indexOf(v) >= 0 ? arr.filter(x => x !== v) : arr.concat([v]));
    const analyze = async () => {
      if (!body.trim()) {
        setAiErr('請先輸入公告內容');
        return;
      }
      setAiErr('');
      setAiMsg('');
      setBusy('ai');
      const r = await api('n2Analyze', {
        title: title,
        body: body
      });
      setBusy('');
      if (r && r.usage != null) setAiUsed(r.usage);
      if (!r || !r.ok) {
        setAiErr(r && r.error || '分析失敗或連線逾時,請再試一次');
        return;
      }
      const x = r.result;
      if (x.tags.length) {
        setTagsTxt(x.tags.join(' '));
        setTagsViTxt((x.tagsVi || []).join(' '));
      }
      if (x.cat) setCat(x.cat);
      if (x.titleVi) setTitleVi(x.titleVi);
      if (x.bodyVi) setBodyVi(x.bodyVi);
      if (!title.trim() && x.title) setTitle(x.title);
      setAiMsg('已產生標籤、分類與越南文,請檢查後再發布');
    };
    const save = async status => {
      setErr('');
      if (!title.trim() || !body.trim()) {
        setErr('標題與內容必填');
        return;
      }
      if (status === 'published' && !nid && !testOn && push && cfg.push) {
        if (!window.confirm('發布後會推播給 ' + (cnt == null ? '對象' : cnt + ' 位') + '同事,確定發布嗎?')) return;
      }
      setBusy(status);
      const r = await api('n2Save', {
        id: nid || undefined,
        title: title.trim(),
        body: body.trim(),
        titleVi: titleVi,
        bodyVi: bodyVi,
        tags: tagsTxt,
        tagsVi: tagsViTxt,
        cat: cat,
        stores: d.all ? stores : [d.myStore],
        roles: roles,
        pinned: pinned,
        endDate: endDate,
        status: status,
        push: push && !nid && !testOn,
        test: testOn && showTest,
        testTo: testTo,
        asUid: d.isAdmin ? asUid : undefined,
        pubAt: d.isAdmin && pubAt && pubAt !== pubAt0.current ? pubAt : undefined
      });
      setBusy('');
      if (!r.ok) {
        setErr(r.error || '失敗');
        return;
      }
      try {
        localStorage.removeItem(dkey);
      } catch (_e) {}
      if (r.quotaBlocked) {
        window.alert('公告已發布，但本月 LINE 訊息額度不足（已用 ' + (r.quota && r.quota.used) + ' / ' + (r.quota && r.quota.limit) + '，這次需要 ' + r.need + ' 則），所以沒有推播。');
      }
      go('n2=v&nid=' + r.id);
    };
    const storeBox = d.all ? React.createElement("div", null, React.createElement("p", {
      className: "text-sm text-gray-300 mb-2"
    }, "對象店別 ", React.createElement("span", {
      className: "text-xs text-gray-500"
    }, "(都不選＝全部店)")), React.createElement("div", {
      className: "flex flex-wrap gap-2"
    }, d.stores.map(s => React.createElement("button", {
      key: s,
      className: 'px-3 py-1.5 rounded-full border text-sm ' + (stores.indexOf(s) >= 0 ? 'bg-violet-600 border-violet-600 text-white' : 'border-gray-600 text-gray-300'),
      onClick: () => toggle(stores, setStores, s)
    }, s)))) : React.createElement("p", {
      className: "text-sm text-gray-300"
    }, "對象店別：", React.createElement("span", {
      className: "text-white"
    }, d.myStore), "（只能發給自己的店）");
    return React.createElement(Box, null, React.createElement("button", {
      className: "text-sm text-violet-300",
      onClick: () => nid ? go('n2=v&nid=' + nid) : go('n2=l')
    }, "← 返回"), React.createElement("h1", {
      className: "text-lg font-bold text-white"
    }, nid ? '✏️ 編輯公告' : '＋ 發布公告'), React.createElement("p", {
      className: "text-xs text-gray-400 -mt-2"
    }, "可以只輸入公告內容，按「AI 產生」，等 AI 補齊所有欄位後再進行修改。"), restored && React.createElement("div", {
      className: "rounded-xl border border-sky-700 bg-sky-950/40 px-3 py-2 text-xs text-sky-300 flex items-start justify-between gap-2"
    }, React.createElement("span", null, restored), React.createElement("button", {
      className: "shrink-0 underline",
      onClick: dropDraft
    }, "捨棄")), !restored && ready && (title || body) && React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "輸入的內容會自動暫存在這支手機,中途離開不會不見。"), React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("input", {
      value: title,
      onChange: e => setTitle(e.target.value),
      maxLength: 60,
      placeholder: "標題(最多60字)",
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"
    }), React.createElement("textarea", {
      value: body,
      onChange: e => setBody(e.target.value),
      rows: 8,
      maxLength: 3000,
      placeholder: "公告內容(中文)",
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-3 text-white"
    }), React.createElement(Btn, {
      color: "bg-indigo-600 text-white",
      loading: busy === 'ai',
      onClick: analyze
    }, "✨ AI 產生標籤、分類與越南文"), aiUsed != null && React.createElement("p", {
      className: "text-xs text-gray-500 text-right"
    }, "本月使用次數：", aiUsed), aiErr && React.createElement("p", {
      className: "text-sm text-red-400 text-center"
    }, aiErr), aiMsg && React.createElement("p", {
      className: "text-xs text-emerald-400 text-center"
    }, aiMsg)), React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("p", {
      className: "text-sm text-gray-300"
    }, "標籤 ", React.createElement("span", {
      className: "text-xs text-gray-500"
    }, "(用空白或逗號分開,最多 8 個,搜尋用)")), React.createElement("input", {
      value: tagsTxt,
      onChange: e => setTagsTxt(e.target.value),
      placeholder: "#颱風 #停業",
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"
    }), React.createElement("p", {
      className: "text-sm text-gray-300"
    }, "分類"), React.createElement("div", {
      className: "flex flex-wrap gap-2"
    }, d.cats.map(c => React.createElement("button", {
      key: c,
      className: 'px-3 py-1.5 rounded-full border text-sm ' + (cat === c ? 'bg-violet-600 border-violet-600 text-white' : 'border-gray-600 text-gray-300'),
      onClick: () => setCat(cat === c ? '' : c)
    }, c)))), React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("p", {
      className: "text-sm text-gray-300"
    }, "越南文版本 ", React.createElement("span", {
      className: "text-xs text-gray-500"
    }, "(可手動修改;空白＝越南文使用者看中文)")), React.createElement("input", {
      value: titleVi,
      onChange: e => setTitleVi(e.target.value),
      placeholder: "Tiêu đề",
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"
    }), React.createElement("textarea", {
      value: bodyVi,
      onChange: e => setBodyVi(e.target.value),
      rows: 6,
      placeholder: "Nội dung",
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"
    }), React.createElement("input", {
      value: tagsViTxt,
      onChange: e => setTagsViTxt(e.target.value),
      placeholder: "Thẻ (cùng thứ tự với thẻ tiếng Trung)",
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"
    })), d.isAdmin && React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("p", {
      className: "text-sm text-gray-300"
    }, "發布人與時間 ", React.createElement("span", {
      className: "text-xs text-gray-500"
    }, "(系統管理者專用;不選＝以你自己、現在時間發布)")), React.createElement("select", {
      value: asUid,
      onChange: e => setAsUid(e.target.value),
      className: "w-full rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"
    }, React.createElement("option", {
      value: ""
    }, "（我自己）"), (d.publishers || []).map(x => React.createElement("option", {
      key: x.uid,
      value: x.uid
    }, x.store ? x.store + ' ' : '', x.label, "（", x.level, "）"))), React.createElement("div", {
      className: "flex items-center gap-2"
    }, React.createElement("input", {
      type: "datetime-local",
      value: pubAt,
      onChange: e => setPubAt(e.target.value),
      className: "flex-1 rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"
    }), pubAt && pubAt !== pubAt0.current && React.createElement("button", {
      type: "button",
      onClick: () => setPubAt(pubAt0.current),
      className: "text-xs text-gray-400 underline"
    }, nid ? '還原' : '清除')), React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, "發布日期時間只影響公告顯示的日期與排序；推播仍是按下發布的當下送出。")), React.createElement(Card, {
      className: "space-y-3"
    }, storeBox, React.createElement("div", null, React.createElement("p", {
      className: "text-sm text-gray-300 mb-2"
    }, "對象角色 ", React.createElement("span", {
      className: "text-xs text-gray-500"
    }, "(都不選＝老師與櫃台)")), React.createElement("div", {
      className: "flex gap-2"
    }, ['teacher', 'counter'].map(r => React.createElement("button", {
      key: r,
      className: 'px-3 py-1.5 rounded-full border text-sm ' + (roles.indexOf(r) >= 0 ? 'bg-violet-600 border-violet-600 text-white' : 'border-gray-600 text-gray-300'),
      onClick: () => toggle(roles, setRoles, r)
    }, ROLE_LABEL[r])))), React.createElement("label", {
      className: "flex items-center gap-2 text-sm text-gray-300"
    }, React.createElement("input", {
      type: "checkbox",
      checked: pinned,
      onChange: e => setPinned(e.target.checked)
    }), "置頂"), React.createElement("div", null, React.createElement("p", {
      className: "text-sm text-gray-300 mb-1"
    }, "到期日 ", React.createElement("span", {
      className: "text-xs text-gray-500"
    }, "(選填,到期後成員看不到)")), React.createElement("input", {
      type: "date",
      value: endDate,
      onChange: e => setEndDate(e.target.value),
      className: "rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"
    })), showTest && React.createElement("div", {
      className: "space-y-2"
    }, React.createElement("label", {
      className: "flex items-start gap-2 text-sm text-sky-300"
    }, React.createElement("input", {
      type: "checkbox",
      className: "mt-1",
      checked: testOn,
      onChange: e => setIsTest(e.target.checked)
    }), React.createElement("span", null, "🧪 測試公告：會加上「測試」標籤，不會給一般成員看到。", nid && g && g.test && !testOn ? ' (取消勾選＝轉為正式公告,對象看得到)' : '')), testOn && React.createElement("div", {
      className: "ml-6 flex flex-wrap gap-2 text-sm"
    }, [['self', '個人（只發給我）'], ['mgr', '主管（本店所有主管）']].map(o => React.createElement("button", {
      key: o[0],
      type: "button",
      onClick: () => setTestTo(o[0]),
      className: 'px-3 py-1.5 rounded-full border ' + (testTo === o[0] ? 'bg-sky-600 border-sky-600 text-white' : 'border-gray-600 text-gray-300')
    }, o[1])), React.createElement("p", {
      className: "w-full text-xs text-gray-500"
    }, nid ? '編輯時不會重新推播。' : '發布後會用卡片通知推播給所選對象（每人消耗 1 則 LINE 額度）。'))), !nid && cfg.push && !testOn && React.createElement("label", {
      className: "flex items-center gap-2 text-sm text-amber-300"
    }, React.createElement("input", {
      type: "checkbox",
      checked: push,
      onChange: e => setPush(e.target.checked)
    }), "發布時推播給對象", push && cnt != null ? '（共 ' + cnt + ' 人,會消耗 LINE 訊息額度）' : '')), err && React.createElement("p", {
      className: "text-sm text-red-400 text-center"
    }, err), React.createElement(Btn, {
      loading: busy === 'published',
      disabled: !!busy,
      onClick: () => save('published')
    }, nid ? '儲存' : '發布'), (!nid || g && g.status === 'draft') && React.createElement(Btn, {
      color: "bg-gray-700 text-white",
      loading: busy === 'draft',
      disabled: !!busy,
      onClick: () => save('draft')
    }, "存成草稿"));
  }
  function ReadersPage({
    me,
    nid
  }) {
    const [st, reload] = useLoad('n2Readers', {
      id: nid
    });
    const [showUn, setShowUn] = useState(false);
    const [msg, setMsg] = useState('');
    if (st.loading && !st.data) return React.createElement(Loading, null);
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || '失敗'
    });
    const d = st.data;
    const n = d.notice;
    const SEGS = [['te', '老師 早班'], ['tl', '老師 晚班'], ['tn', '老師 未填班別'], ['c', '櫃台']];
    const copyUnread = async g => {
      const txt = '[' + n.title + ']尚未閱讀人員:' + g.unread.map(x => x.label).join(' ') + ' (' + d.at + ')';
      const ok = await copyText(txt);
      setMsg(ok ? '已複製 ' + g.store + ' 未讀名單' : '複製失敗');
      setTimeout(() => setMsg(''), 2500);
    };
    return React.createElement(Box, barOf(st, reload, 'zh'), React.createElement("button", {
      className: "text-sm text-violet-300",
      onClick: () => go('n2=v&nid=' + nid)
    }, "← 返回公告"), React.createElement(Card, null, React.createElement("p", {
      className: "text-xs text-violet-300 font-bold"
    }, "📊 已讀情況"), React.createElement("h1", {
      className: "text-lg font-bold text-white mt-1"
    }, n.title), React.createElement("p", {
      className: "text-xs text-gray-400 mt-1"
    }, d.restricted ? '僅顯示' + d.myStore : '全部店', "\u3000資料時間 ", d.at)), d.stores.length === 0 && React.createElement(Card, null, React.createElement("p", {
      className: "text-center text-gray-500"
    }, "這則公告目前沒有對象人員")), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Chip, {
      on: !showUn,
      onClick: () => setShowUn(false)
    }, "已讀名單"), React.createElement(Chip, {
      on: showUn,
      onClick: () => setShowUn(true)
    }, "未讀名單")), d.stores.map(g => React.createElement(Card, {
      key: g.store,
      className: "space-y-2"
    }, React.createElement("div", {
      className: "flex items-center justify-between"
    }, React.createElement("p", {
      className: "font-bold text-white"
    }, g.store, " ", React.createElement("span", {
      className: "font-normal text-gray-300"
    }, "（", g.read.length, "/", g.total, "）")), showUn && g.unread.length > 0 && React.createElement("button", {
      className: "text-xs text-gray-300 border border-gray-700 rounded-full px-3 py-1",
      onClick: () => copyUnread(g)
    }, "📋 複製未讀名單")), React.createElement("div", {
      className: "h-2 rounded-full bg-gray-800 overflow-hidden"
    }, React.createElement("div", {
      className: "h-2 bg-emerald-500",
      style: {
        width: (g.total ? Math.round(g.read.length * 100 / g.total) : 0) + '%'
      }
    })), (() => {
      const pick = (arr, keys) => arr.filter(x => keys.indexOf(x.seg) >= 0);
      const tk = ['te', 'tl', 'tn'];
      const tTot = tk.reduce((a, k) => a + g.segTotals[k], 0);
      const line = (key, label, keys, indent) => {
        const tot = keys.reduce((a, k) => a + g.segTotals[k], 0);
        if (!tot) return null;
        const rd = pick(g.read, keys),
          un = pick(g.unread, keys);
        const list = showUn ? un : rd;
        return React.createElement("p", {
          key: key,
          className: 'text-sm leading-7 break-all ' + (indent ? 'pl-4' : '')
        }, React.createElement("span", {
          className: "text-gray-400"
        }, label, "（", rd.length, "/", tot, "）："), React.createElement("span", {
          className: showUn ? 'text-amber-300' : 'text-gray-100'
        }, list.length ? list.map(x => x.label).join('　') : React.createElement("span", {
          className: "text-gray-500"
        }, showUn ? '全部已讀 🎉' : '尚無')));
      };
      return React.createElement("div", null, tTot > 0 && React.createElement("p", {
        className: "text-sm text-white font-bold mt-1"
      }, "老師（", pick(g.read, tk).length, "/", tTot, "）"), line('te', '早班', ['te'], true), line('tl', '晚班', ['tl'], true), line('tn', '未填班別', ['tn'], true), line('c', '櫃台', ['c'], false));
    })())), msg && React.createElement("p", {
      className: "text-center text-sm text-emerald-400"
    }, msg));
  }
  function QuotaCard({
    canSet
  }) {
    const [q, setQ] = useState(null);
    const [lim, setLim] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    const load = async () => {
      const r = await api('n2Quota', {});
      setQ(r);
      if (r.ok) setLim(r.override ? String(r.override) : '');
    };
    useEffect(() => {
      load();
    }, []);
    if (!q) return React.createElement(Card, null, React.createElement("p", {
      className: "text-sm text-gray-400"
    }, "讀取 LINE 額度中…"));
    if (!q.ok) return React.createElement(Card, null, React.createElement("p", {
      className: "text-sm text-red-400"
    }, q.error || '讀取失敗'));
    const save = async () => {
      setBusy(true);
      setMsg('');
      const r = await api('n2QuotaSet', {
        limit: lim.trim()
      });
      setBusy(false);
      if (r.ok) {
        setMsg('已儲存');
        load();
      } else setMsg(r.error || '失敗');
    };
    const pct = q.used != null && q.limit ? Math.min(100, Math.round(q.used * 100 / q.limit)) : 0;
    return React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("p", {
      className: "text-white text-sm font-bold"
    }, "📊 LINE 通知額度（", q.month, "）"), React.createElement("p", {
      className: "text-2xl text-white"
    }, q.used == null ? '—' : q.used, React.createElement("span", {
      className: "text-base text-gray-400"
    }, " / ", q.limit == null ? '不限' : q.limit, " 則")), q.limit != null && React.createElement("div", {
      className: "h-2 rounded-full bg-gray-800 overflow-hidden"
    }, React.createElement("div", {
      className: 'h-full ' + (pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'),
      style: {
        width: pct + '%'
      }
    })), !q.apiOk && React.createElement("p", {
      className: "text-xs text-amber-400"
    }, "暫時讀不到 LINE 的用量（檢查 LINE_CHANNEL_ACCESS_TOKEN），下方次數仍以本系統紀錄為準。"), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "用量來自 LINE 官方（含所有推播，每月 1 日歸零）。額度不足時，公告仍會發布，但不會推播。"), React.createElement("div", {
      className: "border-t border-gray-800 pt-2 space-y-1"
    }, React.createElement("p", {
      className: "text-xs text-gray-400"
    }, "本月公告推播紀錄（共 ", q.logged || 0, " 則）"), (q.byUser || []).length === 0 ? React.createElement("p", {
      className: "text-sm text-gray-500"
    }, "本月尚未推播") : (q.byUser || []).map((u, i) => React.createElement("p", {
      key: i,
      className: "text-sm text-gray-200"
    }, u.label, "\u3000發送 ", u.times, " 次，共 ", u.msgs, " 則"))), canSet && React.createElement("div", {
      className: "border-t border-gray-800 pt-2"
    }, React.createElement("p", {
      className: "text-xs text-gray-400 mb-1"
    }, "額度上限（改用付費方案時填寫；留空＝使用 LINE 回報的免費額度", q.autoLimit != null ? '：' + q.autoLimit : '', "）"), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement("input", {
      value: lim,
      onChange: e => setLim(e.target.value.replace(/\D/g, '')),
      inputMode: "numeric",
      placeholder: q.autoLimit != null ? String(q.autoLimit) : '例如 200',
      className: "flex-1 rounded-xl bg-gray-800 border border-gray-700 px-3 py-2 text-white"
    }), React.createElement("button", {
      disabled: busy,
      onClick: save,
      className: "px-4 rounded-xl bg-violet-600 text-white text-sm"
    }, "儲存")), msg && React.createElement("p", {
      className: "text-xs text-emerald-400 mt-1"
    }, msg)));
  }
  function SettingsPage({
    me,
    editInfo
  }) {
    const u = me && me.user || {};
    const lang = u.lang === 'vi' ? 'vi' : 'zh';
    const vi = lang === 'vi';
    const [st, reload] = useLoad('n2Settings', {});
    const [busy, setBusy] = useState('');
    const [err, setErr] = useState('');
    if (st.loading && !st.data) return React.createElement(Loading, null);
    if (!st.data || !st.data.ok) return React.createElement(Msg, {
      text: st.data && st.data.error || '失敗'
    });
    const d = st.data;
    const cfg = d.cfg;
    const set = async (key, val) => {
      setBusy(key);
      setErr('');
      const r = await api('n2SettingsSet', {
        key: key,
        value: val
      });
      setBusy('');
      if (r.ok) reload();else setErr(r.error || '失敗');
    };
    const row = (key, label, hint) => React.createElement("div", {
      className: "flex items-start justify-between gap-3 py-2 border-t border-gray-800 first:border-0"
    }, React.createElement("div", null, React.createElement("p", {
      className: "text-white text-sm"
    }, label), React.createElement("p", {
      className: "text-xs text-gray-500 mt-1"
    }, hint)), React.createElement("button", {
      disabled: !!busy || !d.canSet,
      onClick: () => set(key, !cfg[key]),
      className: 'shrink-0 w-12 h-7 rounded-full flex items-center px-0.5 ' + (cfg[key] ? 'bg-emerald-600 justify-end' : 'bg-gray-700 justify-start') + (busy === key || !d.canSet ? ' opacity-50' : '')
    }, React.createElement("span", {
      className: "w-6 h-6 rounded-full bg-white"
    })));
    const info = [[vi ? 'Vai trò' : '角色', u.role === 'teacher' ? vi ? 'Sư phụ' : '老師' : vi ? 'Lễ tân' : '櫃台'], [vi ? 'Chi nhánh' : '店別', u.store || '—'], [u.role === 'teacher' ? vi ? 'Số Sư phụ' : '老師編號' : vi ? 'Tên' : '自訂名稱', u.code || '—']];
    if (u.role === 'teacher') info.push([vi ? 'Ca làm' : '班別', u.shift === 'early' ? vi ? 'Ca sáng' : '早班' : u.shift === 'late' ? vi ? 'Ca tối' : '晚班' : vi ? 'Chưa chọn' : '未填']);
    info.push([vi ? 'Ngôn ngữ' : '語系', vi ? 'Tiếng Việt' : '中文']);
    return React.createElement(Box, barOf(st, reload, lang), React.createElement("button", {
      className: "text-sm text-violet-300",
      onClick: () => go('n2=l')
    }, "← ", vi ? 'Quay lại' : '返回列表'), React.createElement("h1", {
      className: "text-lg font-bold text-white"
    }, "⚙ ", vi ? 'Cài đặt' : '設定'), React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-white text-sm font-bold"
    }, "👤 ", vi ? 'Thông tin cơ bản của tôi' : '我的基本資料'), info.map((x, i) => React.createElement("div", {
      key: i,
      className: "flex justify-between text-sm"
    }, React.createElement("span", {
      className: "text-gray-400"
    }, x[0]), React.createElement("span", {
      className: "text-gray-100"
    }, x[1]))), React.createElement(Btn, {
      color: "bg-gray-700 text-white",
      onClick: () => {
        if (editInfo) editInfo();
      }
    }, "✏️ ", vi ? 'Sửa thông tin cơ bản' : '修改基本資料')), d.isMgr && React.createElement("div", {
      className: "space-y-4"
    }, React.createElement("p", {
      className: "text-sm text-violet-300 font-bold"
    }, "🛡️ 主管功能（公告）"), React.createElement(Card, null, !d.canSet && React.createElement("p", {
      className: "text-xs text-gray-500 mb-1"
    }, "以下開關只有網頁管理者可以修改。"), row('push', '發布時可推播給個人', '開啟後,發布公告時可勾選「推播給對象」(LINE 一人一則,會消耗官方帳號訊息額度)。預設關閉。'), row('testMode', '測試公告模式', '開啟後,發布頁會出現「測試公告」勾選(預設勾選):公告只有發布者自己看得到、自動加「測試」標籤,並自動推播給發布者本人(只有 1 則訊息)。測試完取消勾選即可轉為正式公告。預設關閉。'), row('readersOpen', '一般成員可看已讀名單', '開啟後,成員可看公告的已讀/未讀名單(僅限自己店)。預設關閉,只有主管看得到。')), React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-white text-sm font-bold"
    }, "📤 介紹公告系統"), React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "分享一張介紹卡到群組：列出使用公告系統的好處，下方「測試公告系統」按鈕會帶對方進入發新公告頁（還不是主管會先引導去申請）。"), React.createElement(Btn, {
      color: "bg-blue-600 text-white",
      onClick: async () => {
        try {
          if (!liff.isApiAvailable('shareTargetPicker')) {
            setErr('此環境不支援分享,請在 LINE 內開啟');
            return;
          }
          const r = await liff.shareTargetPicker([{
            type: 'flex',
            altText: '📢 使用公告系統的好處',
            contents: buildIntroFlex()
          }]);
          setErr(r ? '' : '已取消');
        } catch (e) {
          setErr('錯誤:' + String(e && e.message || e));
        }
      }
    }, "分享「使用公告系統」")), React.createElement(QuotaCard, {
      canSet: !!d.canSet
    })), window.B2SettingsBlock && React.createElement(window.B2SettingsBlock), err && React.createElement("p", {
      className: "text-sm text-red-400 text-center"
    }, err));
  }
  window.Notice2Routes = Notice2Routes;
})();