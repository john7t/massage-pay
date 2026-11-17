/*BUILD gloves2.js v1.0-010 編譯版 h=81cf1e2d t=2026-11-17 16:44*/
(function () {
  const {
    useState,
    useEffect
  } = React;
  const C = window.S2Core;
  if (!C) {
    window.Gloves2Routes = () => React.createElement('div', {
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
    peek,
    CACHEABLE,
    WRITE_CLEAR
  } = C;
  ['gb2List', 'gb2Settings'].forEach(a => {
    if (CACHEABLE.indexOf(a) < 0) CACHEABLE.push(a);
  });
  ['gb2Join', 'gb2Start', 'gb2ItemSet', 'gb2ItemDel', 'gb2Claim', 'gb2Status', 'gb2Paid'].forEach(a => {
    WRITE_CLEAR[a] = ['gb2List', 'gb2Settings'];
  });
  WRITE_CLEAR.gb2SettingsSet = ['gb2Settings'];
  const COLORS = ['白色', '藍色', '均可'];
  const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
  const L = {
    zh: {
      title: '手套團購',
      views: '瀏覽紀錄',
      ppl2: '人次',
      vTime: '時間',
      vCode: '編號',
      vStore: '所屬店',
      vNote: '僅顯示最近 50 筆;同一人 10 分鐘內只記一次',
      plus: '我要 +1',
      need: '我有需求',
      noOrder: '目前沒有收單中的團購',
      noOrderHint: '有需求就按「我有需求」,會發起本店新團購',
      color: '顏色',
      size: '尺寸',
      boxes: '箱數',
      submit: '送出',
      save: '儲存',
      cancel: '取消',
      edit: '修改',
      del: '刪除',
      claim: '我來認領',
      release: '放棄認領',
      claimer: '認領人',
      none: '尚無',
      startClaim: '我來發起並認領（自己先不買）',
      proxyTitle: '代老師記錄（單純記事，不會推播）',
      proxyCode: '老師編號',
      proxyAdd: '記錄',
      proxyTag: '記事',
      progress: '達標進度',
      noClaimerWarn: '已達標,還沒有認領人!',
      people: '訂購名單',
      paid: '已交錢',
      unpaid: '未交錢',
      copyVendor: '複製廠商訂購單',
      copied: '已複製',
      admin: '認領人專區',
      history: '歷史',
      mine: '我的紀錄',
      back: '返回',
      set: '設定',
      store: '店別',
      expired: '已超過收單時限',
      claimHint: '認領人負責收錢、叫貨並更新狀態(老師或主管皆可)',
      changeTo: '變更狀態',
      mergeCopy: '合併複製(各店截止/收錢中)',
      failed: '失敗',
      pushed: '已推播給',
      ppl: '人',
      pushBlock: '(LINE 額度不足,未推播)',
      confirm: '確定要變更成「{0}」嗎?'
    },
    vi: {
      title: 'Mua chung găng tay',
      views: 'Lịch sử xem',
      ppl2: 'lượt',
      vTime: 'Thời gian',
      vCode: 'Số',
      vStore: 'Chi nhánh',
      vNote: 'Chỉ hiển thị 50 lượt gần nhất; cùng một người trong 10 phút chỉ ghi 1 lần',
      plus: 'Tôi +1',
      need: 'Tôi có nhu cầu',
      noOrder: 'Hiện chưa có đơn đang nhận',
      noOrderHint: 'Có nhu cầu hãy bấm "Tôi có nhu cầu" để tạo đơn mới cho chi nhánh',
      color: 'Màu',
      size: 'Size',
      boxes: 'Số thùng',
      submit: 'Gửi',
      save: 'Lưu',
      cancel: 'Hủy',
      edit: 'Sửa',
      del: 'Xóa',
      claim: 'Tôi nhận phụ trách',
      release: 'Bỏ nhận',
      claimer: 'Người phụ trách',
      none: 'Chưa có',
      startClaim: 'Tôi khởi tạo và phụ trách (không mua)',
      proxyTitle: 'Ghi hộ Sư phụ (chỉ ghi chú, không gửi thông báo)',
      proxyCode: 'Số Sư phụ',
      proxyAdd: 'Ghi',
      proxyTag: 'ghi chú',
      progress: 'Tiến độ',
      noClaimerWarn: 'Đủ số lượng, chưa có người phụ trách!',
      people: 'Danh sách đặt',
      paid: 'Đã nộp tiền',
      unpaid: 'Chưa nộp',
      copyVendor: 'Sao chép đơn gửi nhà cung cấp',
      copied: 'Đã sao chép',
      admin: 'Dành cho người phụ trách',
      history: 'Lịch sử',
      mine: 'Của tôi',
      back: 'Quay lại',
      set: 'Cài đặt',
      store: 'Chi nhánh',
      expired: 'Đã quá hạn nhận đơn',
      claimHint: 'Người phụ trách thu tiền, đặt hàng và cập nhật trạng thái',
      changeTo: 'Đổi trạng thái',
      mergeCopy: 'Gộp & sao chép',
      failed: 'Thất bại',
      pushed: 'Đã gửi thông báo cho',
      ppl: 'người',
      pushBlock: '(Hết hạn mức LINE, chưa gửi)',
      confirm: 'Đổi thành "{0}"?'
    }
  };
  const STATUS_ZH = {
    collecting: '收單中',
    closed: '提前截止',
    paying: '收錢中',
    shipping: '貨運寄送中',
    arrived: '已到貨',
    ended: '已結束',
    cancelled: '未達叫貨數量取消'
  };
  const STATUS_VI = {
    collecting: 'Đang nhận đơn',
    closed: 'Chốt sớm',
    paying: 'Đang thu tiền',
    shipping: 'Đang vận chuyển',
    arrived: 'Đã đến',
    ended: 'Kết thúc',
    cancelled: 'Hủy (chưa đủ số lượng)'
  };
  const sLabel = (s, lang) => (lang === 'vi' ? STATUS_VI : STATUS_ZH)[s] || s;
  const COLOR_VI = {
    '白色': 'Trắng',
    '藍色': 'Xanh',
    '均可': 'Màu nào cũng được'
  };
  const cLabel = (c, lang) => lang === 'vi' ? COLOR_VI[c] || c : c;
  const STATUS_TONE = {
    collecting: 'text-amber-300',
    closed: 'text-sky-300',
    paying: 'text-orange-300',
    shipping: 'text-violet-300',
    arrived: 'text-emerald-300',
    ended: 'text-gray-400',
    cancelled: 'text-red-400'
  };
  const MAKE_BTN = ['closed', 'paying', 'shipping', 'arrived', 'ended', 'cancelled'];
  const Chip = ({
    on,
    children,
    onClick
  }) => React.createElement("button", {
    onClick: onClick,
    className: 'px-4 py-2 rounded-full border text-sm ' + (on ? 'bg-violet-600 border-violet-600 text-white' : 'border-gray-600 text-gray-300')
  }, children);
  function Gloves2Routes() {
    const q = new URLSearchParams(location.search);
    const p = q.get('gb2') || 'l';
    return React.createElement(NeedUser, {
      render: me => p === 'set' ? React.createElement(SetPage, {
        me: me
      }) : React.createElement(MainPage, {
        me: me,
        tab: p === 'h' ? 'h' : 'l'
      })
    });
  }
  const AB = ({
    k,
    ak,
    onClick,
    className,
    children
  }) => React.createElement("button", {
    disabled: !!ak,
    onClick: onClick,
    className: className + (ak ? ' opacity-40' : '')
  }, ak === k ? React.createElement(Spinner, {
    size: 12
  }) : null, ak === k ? ' ' : '', children);
  function ItemForm({
    t,
    lang,
    init,
    onSubmit,
    onCancel,
    busy,
    submitText
  }) {
    const [color, setColor] = useState(init.color || '均可');
    const [size, setSize] = useState(init.size || 'M');
    const [boxes, setBoxes] = useState(String(init.boxes || 1));
    return React.createElement("div", {
      className: "space-y-3"
    }, React.createElement("div", null, React.createElement("p", {
      className: "text-xs text-gray-400 mb-1.5"
    }, t.color), React.createElement("div", {
      className: "flex flex-wrap gap-2"
    }, COLORS.map(c => React.createElement(Chip, {
      key: c,
      on: color === c,
      onClick: () => setColor(c)
    }, cLabel(c, lang))))), React.createElement("div", null, React.createElement("p", {
      className: "text-xs text-gray-400 mb-1.5"
    }, t.size), React.createElement("div", {
      className: "flex flex-wrap gap-2"
    }, SIZES.map(s => React.createElement(Chip, {
      key: s,
      on: size === s,
      onClick: () => setSize(s)
    }, s)))), React.createElement("div", null, React.createElement("p", {
      className: "text-xs text-gray-400 mb-1.5"
    }, t.boxes), React.createElement("div", {
      className: "flex items-center gap-3"
    }, React.createElement("button", {
      className: "w-10 h-10 rounded-full border border-gray-600 text-lg text-gray-200",
      onClick: () => setBoxes(String(Math.max(1, (parseInt(boxes, 10) || 1) - 1)))
    }, "−"), React.createElement("input", {
      value: boxes,
      inputMode: "numeric",
      onChange: e => setBoxes(e.target.value.replace(/\D/g, '').slice(0, 2)),
      className: "w-16 text-center bg-gray-800 border border-gray-700 rounded-lg py-2 text-white"
    }), React.createElement("button", {
      className: "w-10 h-10 rounded-full border border-gray-600 text-lg text-gray-200",
      onClick: () => setBoxes(String(Math.min(50, (parseInt(boxes, 10) || 0) + 1)))
    }, "＋"))), React.createElement("div", {
      className: "flex gap-2"
    }, onCancel && React.createElement(Btn, {
      color: "bg-gray-700 text-white",
      onClick: onCancel
    }, t.cancel), React.createElement(Btn, {
      loading: busy,
      onClick: () => onSubmit({
        color,
        size,
        boxes: parseInt(boxes, 10) || 1
      })
    }, submitText)));
  }
  function OrderCard({
    o,
    t,
    lang,
    last,
    reload,
    showForm,
    setShowForm
  }) {
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    const [editId, setEditId] = useState('');
    const [pcode, setPcode] = useState('');
    const [opt, setOpt] = useState([]);
    const [ak, setAk] = useState('');
    const [claimAsk, setClaimAsk] = useState(false);
    const joinNow = v => {
      const key = 'o' + Date.now() + Math.random();
      setOpt(a => a.concat([Object.assign({
        key: key
      }, v)]));
      setShowForm(false);
      setMsg('');
      api('gb2Join', Object.assign({
        orderId: o.id
      }, v)).then(r => {
        const drop = () => setOpt(a => a.filter(x => x.key !== key));
        if (!r || !r.ok) {
          drop();
          setMsg(r && r.error || t.failed);
          return;
        }
        const m = [];
        if (r.pushed) m.push(t.pushed + ' ' + r.pushed + ' ' + t.ppl);
        if (r.pushBlocked) m.push(t.pushBlock);
        if (m.length) setMsg(m.join(' '));
        Promise.resolve(reload()).then(drop, drop);
      }).catch(() => {
        setOpt(a => a.filter(x => x.key !== key));
        setMsg(t.failed);
      });
    };
    const run = async (action, params, okMsg, key) => {
      setBusy(true);
      setMsg('');
      if (key) setAk(key);
      const r = await api(action, params);
      if (!r.ok) {
        setBusy(false);
        setAk('');
        setMsg(r.error || t.failed);
        return null;
      }
      if (okMsg !== false) {
        const m = [];
        if (r.pushed) m.push(t.pushed + ' ' + r.pushed + ' ' + t.ppl);
        if (r.pushBlocked) m.push(t.pushBlock);
        if (m.length) setMsg(m.join(' '));
      }
      try {
        await Promise.resolve(reload());
      } catch (_e) {}
      setBusy(false);
      setAk('');
      return r;
    };
    const pct = Math.min(100, Math.round(o.boxes / o.threshold * 100));
    const collecting = o.status === 'collecting';
    const copyVendor = async () => {
      setBusy(true);
      const r = await api('gb2Vendor', {
        orderId: o.id
      });
      setBusy(false);
      if (!r.ok) {
        setMsg(r.error || t.failed);
        return;
      }
      const ok = await copyText(r.text);
      setMsg(ok ? t.copied : r.text);
    };
    const changeStatus = s => {
      if (!window.confirm(t.confirm.replace('{0}', sLabel(s, lang)))) return;
      run('gb2Status', {
        orderId: o.id,
        status: s
      });
    };
    return React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("div", {
      className: "flex items-start justify-between gap-2"
    }, React.createElement("div", null, React.createElement("p", {
      className: "text-xs text-gray-500"
    }, o.store, "\u3000", o.createdAt), React.createElement("p", {
      className: 'text-lg font-bold ' + (STATUS_TONE[o.status] || 'text-white')
    }, sLabel(o.status, lang))), React.createElement("div", {
      className: "text-right"
    }, React.createElement("p", {
      className: "text-2xl font-bold text-white"
    }, o.boxes, React.createElement("span", {
      className: "text-sm text-gray-400"
    }, " / ", o.threshold, " ", t.boxes)), o.expired && React.createElement("p", {
      className: "text-xs text-red-400"
    }, t.expired))), React.createElement("div", {
      className: "h-2 rounded-full bg-gray-800 overflow-hidden"
    }, React.createElement("div", {
      className: 'h-full ' + (o.qualified ? 'bg-emerald-500' : 'bg-violet-500'),
      style: {
        width: pct + '%'
      }
    })), o.attention && React.createElement("p", {
      className: "text-sm text-amber-300 font-semibold"
    }, "⚠ ", t.noClaimerWarn), React.createElement("div", {
      className: "flex items-center justify-between gap-2 text-sm"
    }, React.createElement("p", {
      className: "text-gray-300"
    }, t.claimer, "：", React.createElement("span", {
      className: "text-white"
    }, o.claimer || t.none)), !o.claimer && o.status !== 'ended' && o.status !== 'cancelled' && React.createElement(AB, {
      k: "claim",
      ak: ak || (busy ? 'x' : ''),
      className: "px-3 py-1.5 rounded-lg bg-violet-700 text-white text-sm",
      onClick: () => setClaimAsk(true)
    }, t.claim), o.claimer && o.canAdmin && o.status !== 'ended' && o.status !== 'cancelled' && React.createElement(AB, {
      k: "release",
      ak: ak || (busy ? 'x' : ''),
      className: "px-3 py-1.5 rounded-lg border border-gray-600 text-gray-300 text-xs",
      onClick: () => run('gb2Claim', {
        orderId: o.id,
        release: true
      }, undefined, 'release')
    }, t.release)), !o.claimer && React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, t.claimHint), (o.people.length > 0 || opt.length > 0) && React.createElement("div", {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.people, "（", o.peopleCount, "）"), opt.map(x => React.createElement("div", {
      key: x.key,
      className: "rounded-xl px-3 py-2 bg-violet-950/40 border border-dashed border-violet-500/60"
    }, React.createElement("p", {
      className: "text-sm text-white"
    }, "⭐ ", lang === 'vi' ? 'Bạn' : '我', React.createElement("span", {
      className: "ml-2 text-[11px] text-violet-300"
    }, lang === 'vi' ? 'đang gửi…' : '送出中…')), React.createElement("p", {
      className: "mt-1 text-sm text-gray-300"
    }, cLabel(x.color, lang), "\u3000", x.size, " × ", x.boxes))), o.people.map((pp, i) => React.createElement("div", {
      key: i,
      className: 'rounded-xl px-3 py-2 ' + (pp.mine ? 'bg-violet-950/40 border border-violet-700/50' : 'bg-gray-800/60')
    }, React.createElement("div", {
      className: "flex items-center justify-between gap-2"
    }, React.createElement("p", {
      className: "text-sm text-white"
    }, pp.label, pp.mine && ' ⭐', pp.proxy && React.createElement("span", {
      className: "ml-1 text-[11px] text-sky-300"
    }, "（", t.proxyTag, "）")), o.canAdmin && o.status !== 'cancelled' ? React.createElement("label", {
      className: "flex items-center gap-1.5 text-xs text-gray-300"
    }, React.createElement("input", {
      type: "checkbox",
      disabled: busy,
      checked: pp.paid,
      onChange: e => run('gb2Paid', {
        itemId: pp.firstItem,
        paid: e.target.checked
      })
    }), t.paid) : React.createElement("span", {
      className: 'text-xs ' + (pp.paid ? 'text-emerald-400' : 'text-gray-500')
    }, pp.paid ? '✓ ' + t.paid : t.unpaid)), React.createElement("div", {
      className: "mt-1 space-y-1"
    }, pp.lines.map((ln, li) => editId === ln.id ? React.createElement(ItemForm, {
      key: ln.id,
      t: t,
      lang: lang,
      init: ln,
      busy: busy,
      submitText: t.save,
      onCancel: () => setEditId(''),
      onSubmit: async v => {
        const r = await run('gb2ItemSet', Object.assign({
          itemId: ln.id
        }, v), false);
        if (r) setEditId('');
      }
    }) : React.createElement("div", {
      key: ln.id,
      className: "flex items-center justify-between gap-2 text-sm text-gray-300"
    }, React.createElement("span", null, cLabel(ln.color, lang), "\u3000", ln.size, " × ", ln.boxes), li === 0 && pp.paid && pp.paidAt && React.createElement("span", {
      className: "ml-auto text-[11px] text-gray-500"
    }, pp.paidAt), ln.editable && collecting && React.createElement("span", {
      className: "space-x-3 text-xs"
    }, React.createElement("button", {
      className: "text-violet-300",
      onClick: () => setEditId(ln.id)
    }, t.edit), React.createElement(AB, {
      k: 'del' + ln.id,
      ak: ak || (busy ? 'x' : ''),
      className: "text-red-400",
      onClick: () => {
        if (window.confirm(t.del + '?')) run('gb2ItemDel', {
          itemId: ln.id
        }, false, 'del' + ln.id);
      }
    }, t.del)))))))), collecting && !o.expired && (showForm ? React.createElement("div", {
      className: "rounded-xl border border-gray-700 p-3"
    }, React.createElement(ItemForm, {
      t: t,
      lang: lang,
      init: last || {},
      busy: busy,
      submitText: t.submit,
      onCancel: () => setShowForm(false),
      onSubmit: v => joinNow(v)
    })) : React.createElement(Btn, {
      onClick: () => setShowForm(true)
    }, t.plus)), o.canAdmin && collecting && React.createElement("div", {
      className: "rounded-xl border border-sky-700/40 p-3 space-y-2"
    }, React.createElement("p", {
      className: "text-xs text-sky-300"
    }, t.proxyTitle), React.createElement("input", {
      value: pcode,
      onChange: e => setPcode(e.target.value.slice(0, 12)),
      placeholder: t.proxyCode,
      className: "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
    }), pcode.trim() && React.createElement(ItemForm, {
      t: t,
      lang: lang,
      init: last || {},
      busy: busy,
      submitText: t.proxyAdd,
      onSubmit: async v => {
        const r = await run('gb2Join', Object.assign({
          orderId: o.id,
          forCode: pcode.trim()
        }, v), false);
        if (r) setPcode('');
      }
    })), o.canAdmin && React.createElement("div", {
      className: "rounded-xl border border-amber-700/40 p-3 space-y-2"
    }, React.createElement("p", {
      className: "text-xs text-amber-300"
    }, t.admin), React.createElement(Btn, {
      color: "bg-gray-800 text-gray-100 border border-gray-600",
      loading: busy,
      onClick: copyVendor
    }, "📋 ", t.copyVendor), o.status !== 'ended' && o.status !== 'cancelled' && React.createElement(React.Fragment, null, React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.changeTo), React.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, MAKE_BTN.filter(s => s !== o.status).map(s => React.createElement("button", {
      key: s,
      disabled: busy || s !== 'cancelled' && !o.qualified,
      onClick: () => changeStatus(s),
      className: 'rounded-lg py-2 text-sm border disabled:opacity-30 ' + (s === 'cancelled' ? 'border-red-700 text-red-300' : 'border-gray-600 text-gray-200')
    }, sLabel(s, lang))), o.status === 'closed' && React.createElement("button", {
      disabled: busy,
      onClick: () => changeStatus('collecting'),
      className: "rounded-lg py-2 text-sm border border-amber-700 text-amber-300"
    }, sLabel('collecting', lang))))), msg && React.createElement("p", {
      className: "text-center text-sm text-gray-300 whitespace-pre-wrap"
    }, msg), claimAsk && React.createElement("div", {
      className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6",
      onClick: () => setClaimAsk(false)
    }, React.createElement("div", {
      className: "w-full max-w-sm rounded-2xl bg-gray-900 border border-violet-600 p-5 space-y-3",
      onClick: e => e.stopPropagation()
    }, React.createElement("p", {
      className: "text-lg font-bold text-white"
    }, lang === 'vi' ? 'Người nhận đơn cần làm:' : '認領人要做：'), React.createElement("ol", {
      className: "list-decimal pl-5 space-y-1 text-base text-gray-100"
    }, React.createElement("li", null, lang === 'vi' ? 'Thu tiền của mọi người' : '收錢'), React.createElement("li", null, lang === 'vi' ? 'Khi hàng về, thông báo cho người đã đặt' : '貨到後通知團購的人')), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Btn, {
      color: "bg-gray-700 text-white",
      onClick: () => setClaimAsk(false)
    }, t.cancel), React.createElement(Btn, {
      loading: busy,
      onClick: () => {
        setClaimAsk(false);
        run('gb2Claim', {
          orderId: o.id
        }, undefined, 'claim');
      }
    }, lang === 'vi' ? 'Tôi nhận đơn' : '我來認領')))));
  }
  function HistoryCard({
    o,
    t,
    lang
  }) {
    const [open, setOpen] = useState(false);
    return React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("button", {
      className: "w-full flex items-center justify-between gap-2 text-left",
      onClick: () => setOpen(!open)
    }, React.createElement("span", {
      className: "text-sm text-gray-300"
    }, o.createdAt.slice(0, 10), "\u3000", o.boxes, " ", t.boxes, "\u3000", React.createElement("span", {
      className: STATUS_TONE[o.status]
    }, sLabel(o.status, lang))), React.createElement("span", {
      className: "text-gray-500 text-sm"
    }, open ? '▲' : '▼')), open && React.createElement("div", {
      className: "space-y-2 pt-1"
    }, o.claimer && React.createElement("p", {
      className: "text-xs text-gray-500"
    }, t.claimer, "：", o.claimer), o.people.map((pp, i) => React.createElement("div", {
      key: i,
      className: 'rounded-xl px-3 py-2 ' + (pp.mine ? 'bg-violet-950/40 border border-violet-700/50' : 'bg-gray-800/60')
    }, React.createElement("div", {
      className: "flex items-center justify-between gap-2"
    }, React.createElement("p", {
      className: "text-sm text-white"
    }, pp.label, pp.mine && ' ⭐', pp.proxy && React.createElement("span", {
      className: "ml-1 text-[11px] text-sky-300"
    }, "（", t.proxyTag, "）")), React.createElement("span", {
      className: 'text-xs ' + (pp.paid ? 'text-emerald-400' : 'text-gray-500')
    }, pp.paid ? '✓ ' + t.paid : t.unpaid)), React.createElement("div", {
      className: "mt-1 space-y-0.5"
    }, pp.lines.map((ln, li) => React.createElement("div", {
      key: ln.id,
      className: "flex items-center justify-between gap-2 text-sm text-gray-300"
    }, React.createElement("span", null, cLabel(ln.color, lang), "\u3000", ln.size, " × ", ln.boxes), li === 0 && pp.paid && pp.paidAt && React.createElement("span", {
      className: "text-[11px] text-gray-500"
    }, pp.paidAt)))))), o.people.length === 0 && React.createElement("p", {
      className: "text-xs text-gray-500"
    }, "—")));
  }
  function MainPage({
    me,
    tab
  }) {
    const lang = me.user.lang === 'vi' ? 'vi' : 'zh';
    const t = L[lang];
    const [store, setStore] = useState('');
    const lp = store ? {
      store: store
    } : {};
    const [st, reload] = useLoad('gb2List', lp);
    useEffect(() => {
      if (!window.__gb2Synced && st.data && st.data.ok && st.data._at && Date.now() - st.data._at > 2000) {
        window.__gb2Synced = 1;
        reload();
      } else if (st.data && st.data.ok) window.__gb2Synced = 1;
    }, []);
    const [showForm, setShowForm] = useState(false);
    const [need, setNeed] = useState(false);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    const [showViews, setShowViews] = useState(false);
    useEffect(() => {
      if (window.__gb2Viewed || !st.data || !st.data.ok) return;
      window.__gb2Viewed = 1;
      try {
        api('gb2View', {
          store: st.data.store
        }).then(() => {}).catch(() => {});
      } catch (_e) {}
    }, [st.data && st.data.ok]);
    if (st.loading && !st.data) return React.createElement(Loading, null);
    const d = st.data;
    if (!d || !d.ok) return React.createElement(Msg, {
      text: d && d.error || t.failed
    });
    const mine = d.store === d.myStore;
    const mergeCopy = async () => {
      setBusy(true);
      const r = await api('gb2Vendor', {
        scope: 'pending'
      });
      setBusy(false);
      if (!r.ok) {
        setMsg(r.error || t.failed);
        return;
      }
      const ok = await copyText(r.text);
      setMsg(ok ? t.copied + '\n' + r.text : r.text);
    };
    return React.createElement(Box, barOf(st, reload, lang), React.createElement("div", {
      className: "flex items-center justify-between"
    }, React.createElement("h1", {
      className: "text-xl font-bold text-white"
    }, "🧤 ", t.title), d.canSettings && React.createElement("button", {
      className: "text-sm text-violet-300",
      onClick: () => go('gb2=set')
    }, "⚙ ", t.set)), d.stores.length > 1 && React.createElement("div", {
      className: "flex flex-wrap gap-2"
    }, d.stores.map(s => React.createElement(Chip, {
      key: s,
      on: d.store === s,
      onClick: () => setStore(s)
    }, s))), React.createElement("div", {
      className: "flex gap-2"
    }, React.createElement(Chip, {
      on: tab === 'l',
      onClick: () => go('gb2=l')
    }, lang === 'vi' ? 'Đang nhận' : '進行中'), React.createElement(Chip, {
      on: tab === 'h',
      onClick: () => go('gb2=h')
    }, t.history)), tab === 'l' && React.createElement(React.Fragment, null, d.active.map(o => React.createElement(OrderCard, {
      key: o.id,
      o: o,
      t: t,
      lang: lang,
      last: d.last,
      reload: reload,
      showForm: showForm,
      setShowForm: setShowForm
    })), !d.hasCollecting && mine && React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("p", {
      className: "text-center text-gray-300"
    }, t.noOrder), React.createElement("p", {
      className: "text-center text-xs text-gray-500"
    }, t.noOrderHint), need ? React.createElement("div", {
      className: "rounded-xl border border-gray-700 p-3"
    }, React.createElement(ItemForm, {
      t: t,
      lang: lang,
      init: d.last || {},
      busy: busy,
      submitText: t.submit,
      onCancel: () => setNeed(false),
      onSubmit: async v => {
        setBusy(true);
        const r = await api('gb2Join', v);
        setBusy(false);
        if (!r.ok) {
          setMsg(r.error || t.failed);
          return;
        }
        setNeed(false);
        reload();
      }
    })) : React.createElement(Btn, {
      onClick: () => setNeed(true)
    }, t.need)), d.isMgr && React.createElement(Btn, {
      color: "bg-gray-800 text-gray-100 border border-gray-600",
      loading: busy,
      onClick: mergeCopy
    }, "📋 ", t.mergeCopy), msg && React.createElement("p", {
      className: "text-center text-sm text-gray-300 whitespace-pre-wrap"
    }, msg), React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-sm font-semibold text-white"
    }, t.mine), d.mine.length === 0 ? React.createElement("p", {
      className: "text-sm text-gray-500"
    }, "—") : d.mine.map((m, i) => React.createElement("div", {
      key: i,
      className: "flex justify-between text-sm text-gray-300"
    }, React.createElement("span", null, m.at, "\u3000", cLabel(m.color, lang), " ", m.size, " × ", m.boxes), React.createElement("span", {
      className: "text-xs text-gray-500"
    }, m.status, m.paid ? ' ✓' : ''))))), tab === 'h' && React.createElement(React.Fragment, null, d.history.map(o => React.createElement(HistoryCard, {
      key: o.id,
      o: o,
      t: t,
      lang: lang
    }))), d.views && React.createElement("div", {
      className: "pt-2 border-t border-gray-800"
    }, React.createElement("button", {
      onClick: () => setShowViews(v => !v),
      className: "w-full flex items-center justify-between min-h-[44px] text-sm text-gray-400"
    }, React.createElement("span", null, "👁 ", t.views, "（", lang === 'vi' ? 'hôm nay' : '今日', " ", d.views.today, " ", t.ppl2, "）"), React.createElement("span", null, showViews ? '▲' : '▼')), showViews && (d.views.list.length === 0 ? React.createElement("p", {
      className: "text-sm text-gray-500 py-2"
    }, "—") : React.createElement("div", {
      className: "text-sm"
    }, React.createElement("div", {
      className: "flex py-1.5 text-xs text-gray-500 border-b border-gray-800"
    }, React.createElement("span", {
      className: "w-[104px]"
    }, t.vTime), React.createElement("span", {
      className: "w-[64px]"
    }, t.vCode), React.createElement("span", {
      className: "flex-1"
    }, t.vStore)), d.views.list.map((v, i) => React.createElement("div", {
      key: i,
      className: "flex py-2 border-b border-gray-800/60 text-gray-300"
    }, React.createElement("span", {
      className: "w-[104px] tabular-nums"
    }, v.at.slice(5)), React.createElement("span", {
      className: "w-[64px] tabular-nums"
    }, v.code), React.createElement("span", {
      className: "flex-1"
    }, v.store))), React.createElement("p", {
      className: "text-xs text-gray-600 pt-2"
    }, t.vNote)))));
  }
  function SetPage({
    me
  }) {
    const [st, reload] = useLoad('gb2Settings', {});
    const [stSel, setStSel] = useState('');
    const [th, setTh] = useState('');
    const [hr, setHr] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    useEffect(() => {
      if (st.data && st.data.ok && th === '') {
        setTh(String(st.data.cfg.threshold));
        setHr(String(st.data.cfg.hours));
      }
    }, [st.data]);
    if (st.loading && !st.data) return React.createElement(Loading, null);
    const d = st.data;
    if (!d || !d.ok) return React.createElement(Msg, {
      text: d && d.error || '失敗'
    });
    const startOrder = async () => {
      setBusy(true);
      const r = await api('gb2Start', {
        store: stSel || d.myStore
      });
      setBusy(false);
      if (r.ok) go('gb2=l');else setMsg(r.error || '失敗');
    };
    const save = async () => {
      setBusy(true);
      const r = await api('gb2SettingsSet', {
        threshold: th,
        hours: hr
      });
      setBusy(false);
      setMsg(r.ok ? '已儲存' : r.error || '失敗');
      if (r.ok) reload();
    };
    return React.createElement(Box, barOf(st, reload, 'zh'), React.createElement("button", {
      className: "text-sm text-violet-300",
      onClick: () => go('gb2=l')
    }, "← 返回"), React.createElement("h1", {
      className: "text-xl font-bold text-white"
    }, "🧤 手套團購設定"), React.createElement(Card, {
      className: "space-y-3"
    }, React.createElement("div", null, React.createElement("p", {
      className: "text-xs text-gray-400 mb-1"
    }, "達標箱數（每店各自累計）"), React.createElement("input", {
      value: th,
      inputMode: "numeric",
      onChange: e => setTh(e.target.value.replace(/\D/g, '')),
      className: "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
    })), React.createElement("div", null, React.createElement("p", {
      className: "text-xs text-gray-400 mb-1"
    }, "收單時限（小時；0 = 不限）"), React.createElement("input", {
      value: hr,
      inputMode: "decimal",
      onChange: e => setHr(e.target.value.replace(/[^\d.]/g, '')),
      className: "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
    })), React.createElement(Btn, {
      loading: busy,
      onClick: save
    }, "儲存"), msg && React.createElement("p", {
      className: "text-center text-sm text-gray-300"
    }, msg)), React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-sm font-semibold text-white"
    }, "主管發起（自己先不買）"), React.createElement("p", {
      className: "text-xs text-gray-400"
    }, "建立一筆新的收單，並由你直接成為認領人；之後可在團購頁幫老師輸入編號記事。"), d.stores.length > 1 && React.createElement("div", {
      className: "flex flex-wrap gap-2"
    }, d.stores.map(s => React.createElement(Chip, {
      key: s,
      on: (stSel || d.myStore) === s,
      onClick: () => setStSel(s)
    }, s))), React.createElement(Btn, {
      loading: busy,
      disabled: !!d.collecting[stSel || d.myStore],
      onClick: startOrder
    }, d.collecting[stSel || d.myStore] ? '本店已有收單中的訂單' : '發起並認領')), React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-sm font-semibold text-white"
    }, "本月（", d.month, "）手套團購推播用量"), d.usage.map(u => React.createElement("div", {
      key: u.store,
      className: "flex justify-between text-sm text-gray-300"
    }, React.createElement("span", null, u.store), React.createElement("span", null, u.msgs, " 則（", u.times, " 次）"))), React.createElement("div", {
      className: "flex justify-between text-sm text-white border-t border-gray-700 pt-2"
    }, React.createElement("span", null, "合計"), React.createElement("span", null, d.total, " 則")), React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, "用量以本功能自己的紀錄計算（每位收到的人算 1 則），僅供參考。")));
  }
  window.Gloves2Routes = Gloves2Routes;
})();