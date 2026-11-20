/*BUILD fd2.js v1.0-001 編譯版 h=61886fea t=2026-11-20 11:43*/
(function () {
  const {
    useState,
    useEffect,
    useRef,
    useMemo
  } = React;
  const C = window.S2Core;
  if (!C) {
    window.Fd2Routes = () => React.createElement('div', {
      className: 'p-6 text-center text-red-400'
    }, '載入失敗:缺少 safety2.js');
    return;
  }
  const {
    api,
    Spinner
  } = C;
  const VER = 'v1.0-001';
  const SH = {
    A1: {
      n: '早班1',
      s: 8,
      e: 18
    },
    A2: {
      n: '早班2',
      s: 10,
      e: 20
    },
    B: {
      n: '中班',
      s: 12,
      e: 22
    },
    C1: {
      n: '小夜1',
      s: 16,
      e: 26
    },
    C2: {
      n: '小夜2',
      s: 18,
      e: 28
    },
    D: {
      n: '大夜',
      s: 22,
      e: 32
    }
  };
  const CODES = ['A1', 'A2', 'B', 'C1', 'C2', 'D'];
  const COVER = {
    A1: 'A2',
    D: 'C2'
  };
  const p2 = n => String(n).padStart(2, '0');
  const ymd = d => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
  const dOf = s => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const addD = (s, n) => {
    const d = dOf(s);
    d.setDate(d.getDate() + n);
    return ymd(d);
  };
  const addM = (m, n) => {
    const d = new Date(+m.slice(0, 4), +m.slice(5, 7) - 1 + n, 1);
    return d.getFullYear() + '-' + p2(d.getMonth() + 1);
  };
  const daysIn = m => new Date(+m.slice(0, 4), +m.slice(5, 7), 0).getDate();
  const hm = ts => {
    const d = new Date(ts);
    return p2(d.getHours()) + ':' + p2(d.getMinutes());
  };
  const hhmm = h => p2(Math.floor(h) % 24) + ':' + p2(Math.round(h % 1 * 60));
  const dur = min => {
    min = Math.max(0, Math.round(min));
    return Math.floor(min / 60) + ':' + p2(min % 60);
  };
  const at = (date, h) => dOf(date).getTime() + h * 3600000;
  const WD = '日一二三四五六';
  const uidGen = () => 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const LS = {
    get: (k, d) => {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : d;
      } catch (_e) {
        return d;
      }
    },
    set: (k, v) => {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (_e) {}
    }
  };
  const U0 = (() => {
    try {
      return localStorage.getItem('s2:lastuid') || '';
    } catch (_e) {
      return '';
    }
  })();
  const SK = 'fd2:st:v1:' + U0,
    QK = 'fd2:q:v1:' + U0;
  function applyLocal(srv, q) {
    if (!srv) return null;
    const D = JSON.parse(JSON.stringify(srv));
    const me = D.me.uid;
    q.forEach(o => {
      if (o.act === 'punch' && !D.punches.some(x => x.id === o.id)) D.punches.push({
        id: o.id,
        uid: me,
        date: o.date,
        type: o.type,
        ts: o.ts,
        loc: o.loc,
        dist: o.dist,
        early: o.early || 0,
        apply: !!o.apply,
        payStart: o.payStart || 0,
        _p: 1
      });else if (o.act === 'req_add' && !D.reqs.some(x => x.id === o.id)) D.reqs.push({
        id: o.id,
        uid: me,
        type: 'ot',
        date: o.date,
        start: o.start,
        end: o.end,
        min: o.min,
        reason: o.reason,
        status: 'pending',
        _p: 1
      });else if (o.act === 'req_cancel' || o.act === 'req_decide') {
        const r = D.reqs.find(x => x.id === o.id);
        if (r) r.status = o.act === 'req_cancel' ? 'cancelled' : o.ok ? 'approved' : 'rejected';
      } else if (o.act === 'sched_set') {
        let r = D.sched.find(x => x.uid === me && x.month === o.month);
        if (!r) {
          r = {
            uid: me,
            month: o.month
          };
          D.sched.push(r);
        }
        if (r.status !== 'approved') {
          r.base = o.base || r.base;
          r.days = o.days;
          r.status = 'draft';
          r._p = 1;
        }
      } else if (o.act === 'sched_submit') {
        const r = D.sched.find(x => x.uid === me && x.month === o.month);
        if (r && r.status !== 'approved') {
          r.status = 'submitted';
          r.viol = o.viol;
        }
      } else if (o.act === 'sched_decide') {
        const r = D.sched.find(x => x.uid === o.uid && x.month === o.month);
        if (r) r.status = o.ok ? 'approved' : 'returned';
      } else if (o.act === 'cfg_set') {
        Object.keys(o).forEach(k => {
          if (k !== 'act' && k !== 'opId') D.cfg[k] = o[k];
        });
      }
    });
    return D;
  }
  function useStore() {
    const [srv, setSrv] = useState(() => {
      const c = LS.get(SK, null);
      return c && c.srv;
    });
    const [q, setQ] = useState(() => LS.get(QK, []));
    const [sync, setSync] = useState({
      at: (LS.get(SK, {}) || {}).at || 0,
      busy: false,
      off: false,
      err: ''
    });
    const [notes, setNotes] = useState([]);
    const qR = useRef(q);
    qR.current = q;
    const busyR = useRef(false);
    const tmR = useRef(0);
    const doSync = async () => {
      if (busyR.current) return;
      busyR.current = true;
      setSync(s => Object.assign({}, s, {
        busy: true
      }));
      const sent = qR.current.slice();
      try {
        const r = await api('fd2Sync', {
          ops: JSON.stringify(sent)
        });
        if (r && r.ok) {
          const done = {};
          const bad = [];
          sent.forEach(o => {
            const x = r.results && r.results[o.opId];
            if (x) {
              done[o.opId] = 1;
              if (!x.ok) bad.push(x.error || '操作失敗');
            }
          });
          const rest = qR.current.filter(o => !done[o.opId]);
          LS.set(QK, rest);
          setQ(rest);
          const s = Object.assign({}, r);
          delete s.results;
          LS.set(SK, {
            srv: s,
            at: Date.now()
          });
          setSrv(s);
          if (bad.length) setNotes(n => n.concat(bad));
          setSync({
            at: Date.now(),
            busy: false,
            off: false,
            err: ''
          });
        } else {
          const net = !r || /連不上|逾時|網路|Failed|Load failed/.test(String(r.error || ''));
          setSync(s => Object.assign({}, s, {
            busy: false,
            off: net,
            err: net ? '' : String(r.error || '同步失敗')
          }));
        }
      } catch (_e) {
        setSync(s => Object.assign({}, s, {
          busy: false,
          off: true
        }));
      }
      busyR.current = false;
    };
    const push = op => {
      const o = Object.assign({
        opId: op.opId || uidGen()
      }, op);
      const nq = qR.current.concat([o]);
      qR.current = nq;
      LS.set(QK, nq);
      setQ(nq);
      clearTimeout(tmR.current);
      tmR.current = setTimeout(doSync, 1500);
    };
    useEffect(() => {
      doSync();
      const t = setInterval(() => {
        if (!document.hidden) doSync();
      }, 60000);
      const on = () => doSync();
      const vis = () => {
        if (!document.hidden) doSync();
      };
      window.addEventListener('online', on);
      document.addEventListener('visibilitychange', vis);
      return () => {
        clearInterval(t);
        window.removeEventListener('online', on);
        document.removeEventListener('visibilitychange', vis);
      };
    }, []);
    const D = useMemo(() => applyLocal(srv, q), [srv, q]);
    return {
      D,
      q,
      sync,
      doSync,
      push,
      notes,
      clearNotes: () => setNotes([])
    };
  }
  function schedOf(D, uid, month) {
    return D.sched.find(x => x.uid === uid && x.month === month);
  }
  function planned(D, uid, date) {
    const r = schedOf(D, uid, date.slice(0, 7));
    if (!r || !r.days) return null;
    const v = r.days[date];
    if (v === 'W') return r.base || null;
    if (v === 'O') return 'off';
    return SH[v] ? v : null;
  }
  function dayPlan(D, date) {
    const out = {};
    const warns = [];
    D.staff.forEach(s => {
      const c = planned(D, s.uid, date);
      out[s.uid] = {
        code: c === 'off' ? null : c,
        off: c === 'off',
        unset: c === null
      };
    });
    Object.keys(COVER).forEach(main => {
      const need = D.staff.filter(s => {
        const r = schedOf(D, s.uid, date.slice(0, 7));
        return out[s.uid].off && r && r.base === main;
      });
      const avail = D.staff.filter(s => out[s.uid].code === COVER[main]);
      need.forEach((s, i) => {
        const c = avail[i];
        if (c) {
          out[c.uid].code = main;
          out[c.uid].cover = main;
          out[s.uid].coveredBy = c.name;
        } else {
          warns.push({
            shift: main,
            who: s.name
          });
          out[s.uid].noCover = true;
        }
      });
    });
    return {
      plan: out,
      warns: warns
    };
  }
  function myActual(D, uid, date, cache) {
    const k = date;
    if (!cache[k]) cache[k] = dayPlan(D, date);
    return cache[k].plan[uid] || {};
  }
  function lawCheck(D, uid, month) {
    const cache = {};
    const n = daysIn(month);
    const res = {};
    const add = (d, t) => {
      (res[d] = res[d] || []).push(t);
    };
    const code = d => myActual(D, uid, d, cache).code || null;
    let streak = 0;
    for (let i = 7; i >= 1; i--) {
      const d = addD(month + '-01', -i);
      streak = code(d) ? streak + 1 : 0;
    }
    for (let i = 1; i <= n; i++) {
      const d = month + '-' + p2(i);
      const c = code(d);
      const pv = code(addD(d, -1));
      if (c && pv) {
        const gap = 24 + SH[c].s - SH[pv].e;
        if (gap < 11) add(d, '第34條 換班間隔只有 ' + gap + ' 小時(至少 11 小時)');
      }
      streak = c ? streak + 1 : 0;
      if (streak === 7) add(d, '第36條 連續上班超過 6 天');
      if (dOf(d).getDay() === 0 && i >= 7) {
        let off = 0,
          wk = 0;
        for (let k = 0; k < 7; k++) {
          const x = code(addD(d, -k));
          if (x) wk++;else off++;
        }
        if (off < 2) add(d, '第36條 ' + addD(d, -6).slice(5) + '~' + d.slice(5) + ' 只休 ' + off + ' 天(每 7 天要休 2 天)');
        if (wk * 8 > 40) add(d, '第30條 ' + addD(d, -6).slice(5) + '~' + d.slice(5) + ' 正常工時 ' + wk * 8 + ' 小時(每週 40 小時)');
      }
    }
    return res;
  }
  function punchesOf(D, uid, date) {
    return D.punches.filter(p => p.uid === uid && p.date === date).sort((a, b) => a.ts - b.ts);
  }
  function dayCalc(D, uid, date, now) {
    const ps = punchesOf(D, uid, date);
    const cache = {};
    const a = myActual(D, uid, date, cache);
    const c = a.code;
    const inP = ps.find(p => p.type === 'in');
    const outs = ps.filter(p => p.type === 'out');
    const outP = outs[outs.length - 1];
    let rest = 0,
      bs = null;
    ps.forEach(p => {
      if (p.type === 'bs') bs = p.ts;else if (p.type === 'be' && bs) {
        rest += (p.ts - bs) / 60000;
        bs = null;
      }
    });
    const onBreak = bs !== null && !outP;
    if (onBreak) rest += (now - bs) / 60000;
    const sS = c ? at(date, SH[c].s) : 0,
      sE = c ? at(date, SH[c].e) : 0;
    const ot = D.reqs.filter(r => r.uid === uid && r.date === date && r.type === 'ot');
    const earlyReq = ot.find(r => r.reason === '提早上班' && r.status !== 'cancelled');
    let pay = inP ? inP.payStart || inP.ts : 0;
    if (inP && earlyReq && earlyReq.status !== 'approved' && sS) pay = Math.max(inP.ts, sS);
    const late = inP && sS && inP.ts > sS + 60000 ? Math.floor((inP.ts - sS) / 60000) : 0;
    const endCap = outP ? outP.ts : now;
    const otOk = ot.some(r => r.status === 'approved' && r.reason !== '提早上班');
    const endT = sE && !otOk ? Math.min(endCap, sE) : endCap;
    const work = inP ? Math.max(0, (endT - pay) / 60000 - rest) : 0;
    let lastStart = pay;
    ps.forEach(p => {
      if (p.type === 'be') lastStart = p.ts;
    });
    const cont = inP && !outP && !onBreak ? (now - lastStart) / 60000 : 0;
    const nx = myActual(D, uid, addD(date, 1), cache).code;
    let latest = inP ? pay + 12 * 3600000 + rest * 60000 : 0;
    if (inP && nx) latest = Math.min(latest, at(addD(date, 1), SH[nx].s) - 11 * 3600000);
    return {
      ps,
      code: c,
      a,
      inP,
      outP,
      rest,
      onBreak,
      bsTs: bs,
      sS,
      sE,
      late,
      work,
      cont,
      latest,
      earlyReq,
      pay
    };
  }
  function curDate(D, uid, now) {
    const y = ymd(new Date(now - 86400000)),
      t = ymd(new Date(now));
    const cache = {};
    const yc = myActual(D, uid, y, cache).code;
    const yp = punchesOf(D, uid, y);
    const yIn = yp.some(p => p.type === 'in'),
      yOut = yp.some(p => p.type === 'out');
    if (yIn && !yOut && now - yp[0].ts < 20 * 3600000) return y;
    if (yc && SH[yc].e > 24 && now < at(y, SH[yc].e) + 4 * 3600000 && !yOut) return y;
    return t;
  }
  function distM(a, b, c, d) {
    const R = 6371000,
      r = x => x * Math.PI / 180;
    const x = r(c - a),
      y = r(d - b);
    const h = Math.sin(x / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(y / 2) ** 2;
    return Math.round(2 * R * Math.asin(Math.sqrt(h)));
  }
  function getGps(ms) {
    return new Promise(res => {
      if (!navigator.geolocation) return res(null);
      let done = false;
      const t = setTimeout(() => {
        if (!done) {
          done = true;
          res(null);
        }
      }, ms || 8000);
      navigator.geolocation.getCurrentPosition(p => {
        if (done) return;
        done = true;
        clearTimeout(t);
        res({
          lat: +p.coords.latitude.toFixed(6),
          lng: +p.coords.longitude.toFixed(6),
          acc: Math.round(p.coords.accuracy)
        });
      }, () => {
        if (!done) {
          done = true;
          clearTimeout(t);
          res(null);
        }
      }, {
        enableHighAccuracy: true,
        timeout: ms || 8000,
        maximumAge: 60000
      });
    });
  }
  function getIp(ms) {
    if (!navigator.onLine) return Promise.resolve('');
    return Promise.race([fetch('https://api.ipify.org?format=json').then(r => r.json()).then(j => String(j.ip || '')).catch(() => ''), new Promise(r => setTimeout(() => r(''), ms || 3000))]);
  }
  async function checkLoc(cfg) {
    const useG = cfg.gps !== false && cfg.lat,
      useI = cfg.ip !== false && (cfg.ips || []).length;
    if (!useG && !useI) return {
      loc: 'off'
    };
    const [g, ip] = await Promise.all([useG ? getGps(8000) : Promise.resolve(null), useI ? getIp(3000) : Promise.resolve('')]);
    const out = {
      ip: ip
    };
    if (g) {
      out.lat = g.lat;
      out.lng = g.lng;
      out.acc = g.acc;
    }
    if (useI && ip && cfg.ips.indexOf(ip) >= 0) return Object.assign(out, {
      loc: 'ip',
      ok: true
    });
    if (useG && g) {
      const dist = distM(g.lat, g.lng, cfg.lat, cfg.lng);
      out.dist = dist;
      if (dist <= (cfg.radius || 150) + Math.min(g.acc || 0, 100)) return Object.assign(out, {
        loc: 'gps',
        ok: true
      });
      return Object.assign(out, {
        loc: 'none',
        ok: false
      });
    }
    return Object.assign(out, {
      loc: 'unk',
      ok: false
    });
  }
  const Card = ({
    children,
    className,
    style
  }) => React.createElement("div", {
    style: style,
    className: 'rounded-2xl bg-gray-900 border border-gray-800 p-4 ' + (className || '')
  }, children);
  const Chip = ({
    children,
    c
  }) => {
    const M = {
      g: 'bg-emerald-900/60 text-emerald-300',
      r: 'bg-red-900/60 text-red-300',
      y: 'bg-amber-900/60 text-amber-300',
      b: 'bg-sky-900/60 text-sky-300',
      p: 'bg-pink-900/60 text-pink-300',
      x: 'bg-gray-800 text-gray-400'
    };
    return React.createElement("span", {
      className: 'inline-block text-[11px] font-bold rounded-full px-2 py-0.5 ' + (M[c] || M.x)
    }, children);
  };
  function Sheet({
    onClose,
    children
  }) {
    return React.createElement("div", {
      className: "fixed inset-0 z-50 flex items-end justify-center",
      style: {
        background: 'rgba(30,10,20,.45)'
      },
      onClick: onClose
    }, React.createElement("div", {
      className: "w-full max-w-md rounded-t-3xl bg-gray-900 border border-gray-700 p-4 pb-8 space-y-3 max-h-[85vh] overflow-y-auto",
      onClick: e => e.stopPropagation()
    }, children));
  }
  const B = ({
    children,
    onClick,
    cls,
    disabled,
    style
  }) => React.createElement("button", {
    style: style,
    disabled: disabled,
    onClick: onClick,
    className: 'rounded-xl py-3 font-bold text-[15px] disabled:opacity-40 ' + (cls || 'bg-violet-600 text-white')
  }, children);
  function PunchTab({
    S,
    uid,
    isMe
  }) {
    const {
      D,
      push
    } = S;
    const [now, setNow] = useState(Date.now());
    const [busy, setBusy] = useState('');
    const [ask, setAsk] = useState(null);
    const [msg, setMsg] = useState('');
    useEffect(() => {
      const t = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(t);
    }, []);
    const date = curDate(D, uid, now);
    const x = dayCalc(D, uid, date, now);
    const doPunch = async (type, extra) => {
      setBusy(type);
      setMsg('');
      const L = await checkLoc(D.cfg || {});
      const go = confirmOut => {
        const ts = extra && extra.ts || Date.now();
        const op = Object.assign({
          act: 'punch',
          id: uidGen(),
          type: type,
          date: date,
          ts: ts,
          loc: L.loc,
          dist: L.dist || '',
          lat: L.lat || '',
          lng: L.lng || '',
          acc: L.acc || '',
          ip: L.ip || ''
        }, extra || {});
        push(op);
        if (extra && extra.apply && extra.early) push({
          act: 'req_add',
          id: uidGen(),
          date: date,
          start: hm(ts),
          end: hhmm(SH[x.code].s),
          min: extra.early,
          reason: '提早上班'
        });
        setBusy('');
        setAsk(null);
        if (confirmOut) setMsg('已打卡(地點未確認,已標示給主管)');
      };
      if (L.loc === 'none' || L.loc === 'unk') {
        setBusy('');
        setAsk({
          kind: 'loc',
          L,
          go: () => go(true)
        });
        return;
      }
      go(false);
    };
    const clickIn = () => {
      const t = Date.now();
      if (x.sS && t < x.sS - 60000) {
        const early = Math.floor((x.sS - t) / 60000);
        setAsk({
          kind: 'early',
          early,
          ts: t
        });
        return;
      }
      doPunch('in', {
        ts: t,
        payStart: t
      });
    };
    const state = !x.inP ? 'none' : x.outP ? 'out' : x.onBreak ? 'brk' : 'work';
    let col = '#9ca3af',
      cl = '灰';
    if (state === 'work') {
      col = '#22c55e';
      if (x.cont >= 210 || x.sE && now > x.sE) col = '#f59e0b';
      if (x.latest && now > x.latest - 30 * 60000) col = '#ef4444';
    }
    if (state === 'brk') {
      const b = (now - x.bsTs) / 60000 + 0;
      const tot = x.rest;
      col = tot >= 120 ? '#ef4444' : tot >= 60 ? '#22c55e' : '#3b82f6';
    }
    if (state === 'none' && x.inP === undefined && x.sS && now > x.sS) col = '#9ca3af';
    const restPct = Math.min(100, x.rest / 120 * 100);
    return React.createElement("div", {
      className: "space-y-3"
    }, React.createElement(Card, null, React.createElement("div", {
      className: "flex items-start gap-2"
    }, React.createElement("div", {
      className: "flex-1"
    }, React.createElement("p", {
      className: "text-xs text-gray-400"
    }, date === ymd(new Date(now)) ? '今日班別' : '前一天的班(跨日)', " ", date.slice(5).replace('-', '/'), "（", WD[dOf(date).getDay()], "）"), React.createElement("p", {
      className: "text-xl font-extrabold text-gray-100"
    }, x.code ? x.code + ' ' + SH[x.code].n : '今天沒有排班', x.a.cover && React.createElement("span", {
      className: "ml-2 align-middle"
    }, React.createElement(Chip, {
      c: "p"
    }, "卡班"))), React.createElement("p", {
      className: "text-xs text-gray-400"
    }, x.code ? hhmm(SH[x.code].s) + ' – ' + hhmm(SH[x.code].e) : '沒有排班也可以打卡', x.inP ? ' ・計薪起算 ' + hm(x.pay) : '')), React.createElement(Chip, {
      c: state === 'work' ? 'g' : state === 'brk' ? 'b' : state === 'out' ? 'x' : 'x'
    }, state === 'work' ? '上班中' : state === 'brk' ? '休息中' : state === 'out' ? '已下班' : '尚未上班'))), React.createElement(Card, {
      className: "text-center"
    }, React.createElement("div", {
      className: "mx-auto flex flex-col items-center justify-center rounded-full",
      style: {
        width: 170,
        height: 170,
        border: '12px solid ' + col
      }
    }, React.createElement("span", {
      className: "text-xs text-gray-400"
    }, state === 'brk' ? '休息中' : '今日實際工時'), React.createElement("span", {
      className: "text-4xl font-black text-gray-100",
      style: {
        color: col
      }
    }, state === 'brk' ? dur((now - x.bsTs) / 60000) : dur(x.work)), React.createElement("span", {
      className: "text-xs text-gray-400"
    }, state === 'work' ? '連續工作 ' + dur(x.cont) : state === 'brk' ? '今日休息 ' + Math.round(x.rest) + ' 分' : ' ')), x.inP && !x.outP && React.createElement("div", {
      className: "grid grid-cols-2 gap-2 mt-3 text-sm"
    }, React.createElement("div", {
      className: "text-gray-400"
    }, "距最晚下班", React.createElement("br", null), React.createElement("b", {
      className: "text-lg text-gray-100"
    }, dur((x.latest - now) / 60000))), React.createElement("div", {
      className: "text-gray-400"
    }, "最晚下班", React.createElement("br", null), React.createElement("b", {
      className: "text-lg text-gray-100"
    }, hm(x.latest)))), x.inP && !x.outP && React.createElement("p", {
      className: "text-[11px] text-gray-500 mt-1"
    }, "最晚下班＝計薪起算+12小時+休息(第32條)與隔天班前11小時(第34條)取較早")), x.inP && React.createElement(Card, null, React.createElement("div", {
      className: "flex items-center"
    }, React.createElement("span", {
      className: "text-sm font-bold text-gray-300 flex-1"
    }, "今日休息"), React.createElement("b", {
      className: "text-gray-100"
    }, Math.round(x.rest), " 分"), React.createElement("span", {
      className: "text-xs text-gray-500 ml-1"
    }, "／目標 60–120")), React.createElement("div", {
      className: "relative h-2.5 rounded-full mt-2 overflow-hidden",
      style: {
        background: 'rgba(148,163,184,.3)'
      }
    }, React.createElement("div", {
      className: "absolute inset-y-0",
      style: {
        left: '50%',
        width: '50%',
        background: 'rgba(34,197,94,.25)'
      }
    }), React.createElement("div", {
      className: "absolute inset-y-0 left-0",
      style: {
        width: restPct + '%',
        background: x.rest > 120 ? '#ef4444' : x.rest >= 60 ? '#22c55e' : '#3b82f6'
      }
    }))), isMe && React.createElement("div", {
      className: "grid grid-cols-3 gap-2"
    }, React.createElement(B, {
      cls: state === 'none' ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400',
      disabled: state !== 'none' || !!busy,
      onClick: clickIn
    }, busy === 'in' ? React.createElement(Spinner, null) : x.inP ? '✓ 上班 ' + hm(x.inP.ts) : '上班打卡'), React.createElement(B, {
      cls: "fd-w",
      style: {
        background: '#3b82f6',
        color: '#fff'
      },
      disabled: !(state === 'work' || state === 'brk') || !!busy,
      onClick: () => doPunch(state === 'brk' ? 'be' : 'bs')
    }, busy === 'bs' || busy === 'be' ? React.createElement(Spinner, null) : state === 'brk' ? '結束休息' : '☕ 開始休息'), React.createElement(B, {
      cls: "fd-w",
      style: {
        background: '#be185d',
        color: '#fff'
      },
      disabled: !(state === 'work' || state === 'brk') || !!busy,
      onClick: () => setAsk({
        kind: 'out'
      })
    }, busy === 'out' ? React.createElement(Spinner, null) : x.outP ? '✓ 下班 ' + hm(x.outP.ts) : '下班打卡')), msg && React.createElement("p", {
      className: "text-sm text-amber-300 text-center"
    }, msg), x.sE && state === 'work' && now > x.sE && React.createElement("p", {
      className: "text-sm text-amber-300 text-center"
    }, "已過表定下班 ", hm(x.sE), ",超過的時間要有核准的加班才計薪(加班申請在第二批開放)"), React.createElement(Card, null, React.createElement("p", {
      className: "text-sm font-bold text-gray-300 mb-1"
    }, "今日打卡紀錄"), x.ps.length === 0 && React.createElement("p", {
      className: "text-sm text-gray-500"
    }, "尚無打卡"), x.ps.map(p => React.createElement("div", {
      key: p.id,
      className: "flex items-center justify-between py-1.5 border-b border-gray-800 text-sm"
    }, React.createElement("span", {
      className: "text-gray-200"
    }, hm(p.ts), " ", {
      in: '上班',
      out: '下班',
      bs: '開始休息',
      be: '結束休息'
    }[p.type]), React.createElement("span", {
      className: "space-x-1"
    }, p.early > 0 && React.createElement(Chip, {
      c: p.apply ? 'b' : 'y'
    }, '提早 ' + p.early + ' 分' + (p.apply ? '・申請加班' : '・不申請')), (p.loc === 'none' || p.loc === 'unk') && React.createElement(Chip, {
      c: "r"
    }, p.loc === 'none' ? '不在店內範圍' + (p.dist ? ' ' + p.dist + 'm' : '') : '無法確認地點'), p._p && React.createElement(Chip, {
      c: "y"
    }, "待送出"))))), ask && ask.kind === 'early' && React.createElement(Sheet, {
      onClose: () => setAsk(null)
    }, React.createElement("p", {
      className: "text-lg font-extrabold text-gray-100"
    }, "⏰ 你提早 ", ask.early, " 分鐘打卡"), React.createElement("p", {
      className: "text-[15px] text-gray-300 leading-relaxed"
    }, "表定 ", hhmm(SH[x.code].s), " 上班,現在 ", hm(ask.ts), "。要向主管申請加班 ", ask.early, " 分鐘嗎？"), React.createElement("p", {
      className: "text-xs text-gray-400 leading-relaxed"
    }, "・申請加班:從 ", hm(ask.ts), " 開始計時,自動送出「提早上班」加班申請給主管核准", React.createElement("br", null), "・不用:從 ", hhmm(SH[x.code].s), " 開始計時,之前不算工時", React.createElement("br", null), "・打卡原始時間都會照實保存"), React.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, React.createElement(B, {
      onClick: () => doPunch('in', {
        ts: ask.ts,
        payStart: ask.ts,
        early: ask.early,
        apply: 1
      })
    }, "申請加班 ", ask.early, " 分"), React.createElement(B, {
      cls: "bg-gray-800 text-gray-200",
      onClick: () => doPunch('in', {
        ts: ask.ts,
        payStart: x.sS,
        early: ask.early,
        apply: 0
      })
    }, "不用,", hhmm(SH[x.code].s), " 起算"))), ask && ask.kind === 'out' && React.createElement(Sheet, {
      onClose: () => setAsk(null)
    }, React.createElement("p", {
      className: "text-lg font-extrabold text-gray-100"
    }, "確定下班打卡？"), React.createElement("p", {
      className: "text-sm text-gray-300"
    }, "今日工時 ", dur(x.work), "、休息 ", Math.round(x.rest), " 分", x.rest < 60 ? '(未滿 1 小時)' : ''), React.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, React.createElement(B, {
      cls: "bg-gray-800 text-gray-200",
      onClick: () => setAsk(null)
    }, "取消"), React.createElement(B, {
      cls: "fd-w",
      style: {
        background: '#be185d',
        color: '#fff'
      },
      onClick: () => {
        setAsk(null);
        doPunch('out');
      }
    }, "下班打卡"))), ask && ask.kind === 'loc' && React.createElement(Sheet, {
      onClose: () => setAsk(null)
    }, React.createElement("p", {
      className: "text-lg font-extrabold text-gray-100"
    }, "📍 ", ask.L.loc === 'none' ? '不在店內範圍' : '無法確認地點'), React.createElement("p", {
      className: "text-sm text-gray-300"
    }, ask.L.loc === 'none' ? '目前距離店 ' + ask.L.dist + ' 公尺。' : '抓不到 GPS,也不是店內網路。請確認已允許定位,或連上店內 Wi‑Fi。', "仍要打卡的話,這筆會標示給主管確認。"), React.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, React.createElement(B, {
      cls: "bg-gray-800 text-gray-200",
      onClick: () => setAsk(null)
    }, "取消"), React.createElement(B, {
      cls: "bg-amber-500 text-gray-950",
      onClick: ask.go
    }, "仍要打卡"))));
  }
  function MonthRec({
    S,
    uid
  }) {
    const {
      D
    } = S;
    const now = Date.now();
    const [month, setMonth] = useState(ymd(new Date()).slice(0, 7));
    const n = daysIn(month);
    const today = ymd(new Date());
    const rows = [];
    const st = {
      days: 0,
      work: 0,
      ot: 0,
      late: 0,
      miss: 0
    };
    for (let i = 1; i <= n; i++) {
      const d = month + '-' + p2(i);
      if (d > today) break;
      const x = dayCalc(D, uid, d, d === today ? now : at(d, 48));
      const notes = [];
      if (x.inP) {
        st.days++;
        st.work += x.work;
      }
      if (x.late) {
        notes.push(React.createElement(Chip, {
          key: "l",
          c: "r"
        }, "遲到 ", x.late, " 分"));
        st.late++;
      }
      if (x.earlyReq) notes.push(React.createElement(Chip, {
        key: "e",
        c: x.earlyReq.status === 'approved' ? 'b' : x.earlyReq.status === 'rejected' ? 'x' : 'y'
      }, "提早加班 ", x.earlyReq.min, " 分・", {
        pending: '待核准',
        approved: '已核准',
        rejected: '未核准'
      }[x.earlyReq.status] || ''));
      if (x.earlyReq && x.earlyReq.status === 'approved') st.ot += x.earlyReq.min;
      if (!x.inP && x.outP) {
        notes.push(React.createElement(Chip, {
          key: "mi",
          c: "r"
        }, "缺上班卡"));
        st.miss++;
      }
      if (x.inP && !x.outP && d < today) {
        notes.push(React.createElement(Chip, {
          key: "mo",
          c: "r"
        }, "缺下班卡"));
        st.miss++;
      }
      if (x.outP && x.rest < 60) notes.push(React.createElement(Chip, {
        key: "r",
        c: "y"
      }, "休息不足 1 小時"));
      if (x.ps.some(p => p.loc === 'none' || p.loc === 'unk')) notes.push(React.createElement(Chip, {
        key: "g",
        c: "r"
      }, "地點待確認"));
      if (!x.ps.length && x.code && d < today) {
        notes.push(React.createElement(Chip, {
          key: "n",
          c: "r"
        }, "沒有打卡紀錄"));
        st.miss++;
      }
      rows.push({
        d,
        x,
        notes,
        off: x.a.off
      });
    }
    return React.createElement("div", {
      className: "space-y-3"
    }, React.createElement("div", {
      className: "flex items-center gap-2"
    }, React.createElement("button", {
      onClick: () => setMonth(addM(month, -1)),
      className: "px-3 py-2 rounded-full bg-gray-800 text-sm text-gray-300"
    }, "‹"), React.createElement("b", {
      className: "flex-1 text-center text-gray-100"
    }, month.replace('-', ' 年 '), " 月"), React.createElement("button", {
      onClick: () => setMonth(addM(month, 1)),
      className: "px-3 py-2 rounded-full bg-gray-800 text-sm text-gray-300"
    }, "›")), React.createElement(Card, {
      className: "!p-2"
    }, React.createElement("table", {
      className: "w-full text-[12px] text-center"
    }, React.createElement("thead", null, React.createElement("tr", {
      className: "text-gray-400"
    }, React.createElement("th", null, "日"), React.createElement("th", null, "班"), React.createElement("th", null, "上班"), React.createElement("th", null, "下班"), React.createElement("th", null, "工時"), React.createElement("th", null, "休息"))), React.createElement("tbody", null, rows.slice().reverse().map(r => React.createElement(React.Fragment, {
      key: r.d
    }, React.createElement("tr", {
      className: "border-t border-gray-800 text-gray-200"
    }, React.createElement("td", {
      className: "py-1.5"
    }, r.d.slice(8), React.createElement("span", {
      className: "text-gray-500"
    }, WD[dOf(r.d).getDay()])), r.off && !r.x.ps.length ? React.createElement("td", {
      colSpan: "5",
      className: "text-pink-300 font-bold"
    }, "排休") : React.createElement(React.Fragment, null, React.createElement("td", null, r.x.code || '—', r.x.a.cover && React.createElement("span", {
      className: "text-pink-300"
    }, "卡")), React.createElement("td", {
      className: r.x.late ? 'text-red-400' : ''
    }, r.x.inP ? hm(r.x.inP.ts) : '—'), React.createElement("td", null, r.x.outP ? hm(r.x.outP.ts) : '—'), React.createElement("td", null, r.x.inP ? dur(r.x.work) : '—'), React.createElement("td", null, r.x.inP ? Math.round(r.x.rest) : '—'))), r.notes.length > 0 && React.createElement("tr", null, React.createElement("td", {
      colSpan: "6",
      className: "text-left pb-1.5 space-x-1"
    }, r.notes)))), !rows.length && React.createElement("tr", null, React.createElement("td", {
      colSpan: "6",
      className: "py-4 text-gray-500"
    }, "這個月還沒有資料"))))), React.createElement(Card, null, React.createElement("p", {
      className: "text-sm font-bold text-gray-300 mb-2"
    }, "月統計"), React.createElement("div", {
      className: "grid grid-cols-3 gap-2 text-center text-xs text-gray-400"
    }, React.createElement("div", null, "出勤", React.createElement("br", null), React.createElement("b", {
      className: "text-base text-gray-100"
    }, st.days, " 天")), React.createElement("div", null, "總工時", React.createElement("br", null), React.createElement("b", {
      className: "text-base text-gray-100"
    }, (st.work / 60).toFixed(1), "h")), React.createElement("div", null, "加班", React.createElement("br", null), React.createElement("b", {
      className: "text-base text-gray-100"
    }, st.ot, " 分")), React.createElement("div", null, "遲到", React.createElement("br", null), React.createElement("b", {
      className: "text-base text-gray-100"
    }, st.late, " 次")), React.createElement("div", null, "缺卡", React.createElement("br", null), React.createElement("b", {
      className: "text-base text-gray-100"
    }, st.miss, " 次")), React.createElement("div", null, "請假", React.createElement("br", null), React.createElement("b", {
      className: "text-base text-gray-100"
    }, "—"))), React.createElement("p", {
      className: "text-[11px] text-gray-500 mt-2"
    }, "請假與薪資試算在第二批開放。工時＝下班−上班−休息;提早打卡未核准、超過表定下班沒有核准加班的部分不計。")));
  }
  function SchedTab({
    S
  }) {
    const {
      D,
      push
    } = S;
    const me = D.me.uid;
    const [month, setMonth] = useState(addM(ymd(new Date()).slice(0, 7), 1));
    const [pick, setPick] = useState('');
    const [more, setMore] = useState(false);
    if (!D.me.isCounter) return React.createElement(Card, null, React.createElement("p", {
      className: "text-sm text-gray-400"
    }, "排班只給櫃台人員使用。主管可在「全班表」看大家的班表並審核。"));
    const r = schedOf(D, me, month);
    const base = r && r.base;
    const days = r && r.days || {};
    const locked = r && r.status === 'approved';
    const n = daysIn(month);
    const law = lawCheck(D, me, month);
    const setDays = (nd, nb) => push({
      act: 'sched_set',
      month,
      base: nb || base,
      days: nd
    });
    const chooseBase = b => {
      if (locked) return;
      if (!r || !base) {
        const nd = {};
        for (let i = 1; i <= n; i++) nd[month + '-' + p2(i)] = 'W';
        setDays(nd, b);
      } else setDays(days, b);
    };
    const setDay = (d, v) => {
      const nd = Object.assign({}, days);
      if (v) nd[d] = v;else delete nd[d];
      setDays(nd);
      const nx = addD(d, 1);
      setPick(nx.slice(0, 7) === month ? nx : '');
      setMore(false);
    };
    const first = dOf(month + '-01').getDay();
    const lead = (first + 6) % 7;
    const cache = {};
    const unset = [];
    for (let i = 1; i <= n; i++) {
      const d = month + '-' + p2(i);
      if (!days[d]) unset.push(d);
    }
    const vCount = Object.values(law).reduce((s, a) => s + a.length, 0);
    const stLbl = {
      draft: ['未送出', 'x'],
      submitted: ['已送出・待主管確認', 'y'],
      approved: ['主管已核准', 'g'],
      returned: ['主管退回,請修改後重送', 'r']
    }[r && r.status || 'draft'];
    return React.createElement("div", {
      className: "space-y-3"
    }, React.createElement("div", {
      className: "flex items-center gap-2"
    }, React.createElement("button", {
      onClick: () => setMonth(addM(month, -1)),
      className: "px-3 py-2 rounded-full bg-gray-800 text-sm text-gray-300"
    }, "‹"), React.createElement("b", {
      className: "flex-1 text-center text-gray-100"
    }, month.replace('-', ' 年 '), " 月班表"), React.createElement("button", {
      onClick: () => setMonth(addM(month, 1)),
      className: "px-3 py-2 rounded-full bg-gray-800 text-sm text-gray-300"
    }, "›")), React.createElement("div", {
      className: "text-center"
    }, React.createElement(Chip, {
      c: stLbl[1]
    }, stLbl[0])), React.createElement(Card, null, React.createElement("p", {
      className: "text-sm font-bold text-gray-300 mb-2"
    }, "步驟 1\u3000我的班別"), React.createElement("div", {
      className: "grid grid-cols-6 gap-1.5"
    }, CODES.map(c => React.createElement("button", {
      key: c,
      disabled: locked,
      onClick: () => chooseBase(c),
      className: 'rounded-xl py-2.5 font-extrabold text-sm ' + (base === c ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300')
    }, c))), React.createElement("p", {
      className: "text-xs text-gray-400 mt-1.5"
    }, base ? base + ' ' + SH[base].n + ' ' + hhmm(SH[base].s) + '–' + hhmm(SH[base].e) : '第一次選班別,會把整個月先填成上班')), base && React.createElement(Card, {
      className: "!p-3"
    }, React.createElement("p", {
      className: "text-sm font-bold text-gray-300 mb-2"
    }, "步驟 2\u3000點日期排休"), React.createElement("div", {
      className: "grid grid-cols-7 gap-1 text-center"
    }, '一二三四五六日'.split('').map(w => React.createElement("div", {
      key: w,
      className: "text-[11px] text-gray-500"
    }, w)), Array.from({
      length: lead
    }).map((_, i) => React.createElement("div", {
      key: 'b' + i
    })), Array.from({
      length: n
    }).map((_, i) => {
      const d = month + '-' + p2(i + 1);
      const v = days[d];
      const a = myActual(D, me, d, cache);
      const lw = law[d];
      const lab = !v ? '未排' : v === 'O' ? '休' : a.cover ? '卡' + a.cover : a.code || v;
      return React.createElement("button", {
        key: d,
        onClick: () => !locked && setPick(d),
        className: 'relative rounded-lg py-1 min-h-[44px] text-[12px] ' + (v === 'O' ? 'bg-pink-900/50 text-pink-300' : !v ? 'bg-gray-800/40 text-gray-500' : 'bg-gray-800 text-gray-200') + (pick === d ? ' ring-2 ring-violet-500' : '')
      }, i + 1, React.createElement("span", {
        className: 'block text-[10px] font-bold ' + (a.cover ? 'text-pink-400' : '')
      }, lab), (lw || a.noCover) && React.createElement("span", {
        className: "absolute top-0.5 right-1 w-2 h-2 rounded-full bg-red-500"
      }));
    })), pick && (() => {
      const a = myActual(D, me, pick, cache);
      return React.createElement("div", {
        className: "mt-3 rounded-xl border border-violet-600 p-3 space-y-2"
      }, React.createElement("p", {
        className: "text-sm font-bold text-gray-100"
      }, pick.slice(5).replace('-', '/'), "（", WD[dOf(pick).getDay()], "）"), a.cover && React.createElement("p", {
        className: "text-sm text-pink-300"
      }, COVER[a.cover] === base ? '同事排休,你這天改上 ' + a.cover + ' ' + SH[a.cover].n + ' ' + hhmm(SH[a.cover].s) + '–' + hhmm(SH[a.cover].e) : ''), days[pick] === 'O' && COVER[base] && React.createElement("p", {
        className: 'text-sm ' + (a.noCover ? 'text-red-400' : 'text-gray-300')
      }, a.noCover ? '⚠ 你排休,但這天沒有 ' + COVER[base] + ' 可以卡你的班' : '你排休 → 由 ' + (a.coveredBy || '?') + ' 卡你的班'), (law[pick] || []).map((t, i) => React.createElement("p", {
        key: i,
        className: "text-sm text-red-400"
      }, "⚠ ", t)), React.createElement("div", {
        className: "grid grid-cols-3 gap-2"
      }, React.createElement(B, {
        onClick: () => setDay(pick, 'W'),
        cls: "bg-gray-800 text-gray-100"
      }, "上班"), React.createElement(B, {
        onClick: () => setDay(pick, 'O'),
        cls: "fd-w",
        style: {
          background: '#db2777',
          color: '#fff'
        }
      }, "排休"), React.createElement(B, {
        onClick: () => setDay(pick, ''),
        cls: "bg-gray-800 text-gray-400"
      }, "清除")), React.createElement("button", {
        onClick: () => setMore(!more),
        className: "text-xs text-violet-400 underline"
      }, "這天要上別的班？"), more && React.createElement("div", {
        className: "grid grid-cols-6 gap-1"
      }, CODES.filter(c => c !== base).map(c => React.createElement("button", {
        key: c,
        onClick: () => setDay(pick, c),
        className: "rounded-lg py-2 bg-gray-800 text-gray-200 text-xs font-bold"
      }, c))));
    })()), base && vCount > 0 && React.createElement(Card, null, React.createElement("p", {
      className: "text-sm font-bold text-red-400 mb-1"
    }, "⚠ 勞基法檢查 ", vCount, " 項"), Object.keys(law).sort().map(d => law[d].map((t, i) => React.createElement("p", {
      key: d + i,
      className: "text-[13px] text-gray-300"
    }, "● ", d.slice(5).replace('-', '/'), " ", t)))), base && vCount === 0 && React.createElement("p", {
      className: "text-xs text-emerald-400 text-center"
    }, "✓ 勞基法檢查(第 30、34、36 條)沒有問題"), base && !locked && React.createElement(B, {
      cls: 'w-full ' + (unset.length ? 'bg-gray-800 text-gray-400' : vCount ? 'bg-amber-500 text-gray-950' : 'bg-violet-600 text-white'),
      disabled: !!unset.length || r && r.status === 'submitted',
      onClick: () => push({
        act: 'sched_submit',
        month,
        viol: vCount
      })
    }, unset.length ? '還有 ' + unset.length + ' 天沒排,不能送出' : r && r.status === 'submitted' ? '已送出,等主管確認' : vCount ? '仍要送出（' + vCount + ' 項違規）' : '送出班表'), r && r.status === 'submitted' && React.createElement("p", {
      className: "text-xs text-gray-500 text-center"
    }, "送出後再修改,狀態會回到未送出,需要重新送出"));
  }
  function WeekTab({
    S
  }) {
    const {
      D,
      push
    } = S;
    const isSup = D.me.isSup;
    const t0 = dOf(ymd(new Date()));
    const mon = ymd(new Date(t0.getTime() - (t0.getDay() + 6) % 7 * 86400000));
    const [wk, setWk] = useState(mon);
    const [sel, setSel] = useState('');
    const days = Array.from({
      length: 7
    }).map((_, i) => addD(wk, i));
    const plans = {};
    days.forEach(d => {
      plans[d] = dayPlan(D, d);
    });
    const pend = isSup ? D.sched.filter(r => r.status === 'submitted') : [];
    const pendOt = isSup ? D.reqs.filter(r => r.status === 'pending') : [];
    const nm = uid => (D.staff.find(s => s.uid === uid) || {}).name || '?';
    const cell = (s, d) => {
      const a = plans[d].plan[s.uid] || {};
      if (a.off) return React.createElement("span", {
        className: "text-pink-300"
      }, "休");
      if (!a.code) return React.createElement("span", {
        className: "text-gray-600"
      }, "·");
      return React.createElement("span", {
        className: a.cover ? 'inline-block rounded-md border-2 border-pink-500 px-0.5' : ''
      }, a.code, a.cover && React.createElement("b", {
        className: "block text-[9px] text-pink-400"
      }, "卡"));
    };
    return React.createElement("div", {
      className: "space-y-3"
    }, isSup && (pend.length > 0 || pendOt.length > 0) && React.createElement(Card, null, React.createElement("p", {
      className: "text-sm font-bold text-gray-300 mb-1"
    }, "待審核 ", pend.length + pendOt.length), pend.map(r => React.createElement("div", {
      key: r.uid + r.month,
      className: "flex items-center gap-2 py-1.5 border-b border-gray-800 text-sm"
    }, React.createElement("span", {
      className: "flex-1 text-gray-200"
    }, nm(r.uid), " ", r.month.slice(5), " 月班表 ", r.viol > 0 && React.createElement(Chip, {
      c: "r"
    }, "違規 ", r.viol)), React.createElement("button", {
      onClick: () => push({
        act: 'sched_decide',
        uid: r.uid,
        month: r.month,
        ok: 1
      }),
      style: {
        background: '#16a34a'
      },
      className: "fd-w px-3 py-1.5 rounded-lg text-xs font-bold"
    }, "核准"), React.createElement("button", {
      onClick: () => push({
        act: 'sched_decide',
        uid: r.uid,
        month: r.month,
        ok: 0
      }),
      className: "px-3 py-1.5 rounded-lg bg-gray-700 text-gray-200 text-xs font-bold"
    }, "退回"))), pendOt.map(r => React.createElement("div", {
      key: r.id,
      className: "flex items-center gap-2 py-1.5 border-b border-gray-800 text-sm"
    }, React.createElement("span", {
      className: "flex-1 text-gray-200"
    }, nm(r.uid), " ", r.date.slice(5), " ", r.reason, " ", r.min, " 分"), React.createElement("button", {
      onClick: () => push({
        act: 'req_decide',
        id: r.id,
        ok: 1
      }),
      style: {
        background: '#16a34a'
      },
      className: "fd-w px-3 py-1.5 rounded-lg text-xs font-bold"
    }, "核准"), React.createElement("button", {
      onClick: () => push({
        act: 'req_decide',
        id: r.id,
        ok: 0
      }),
      className: "px-3 py-1.5 rounded-lg bg-gray-700 text-gray-200 text-xs font-bold"
    }, "退回")))), React.createElement("div", {
      className: "flex items-center gap-2"
    }, React.createElement("button", {
      onClick: () => setWk(addD(wk, -7)),
      className: "px-3 py-2 rounded-full bg-gray-800 text-sm text-gray-300"
    }, "‹ 上週"), React.createElement("b", {
      className: "flex-1 text-center text-sm text-gray-100"
    }, wk.slice(5).replace('-', '/'), "（一）–", addD(wk, 6).slice(5).replace('-', '/'), "（日）"), React.createElement("button", {
      onClick: () => setWk(addD(wk, 7)),
      className: "px-3 py-2 rounded-full bg-gray-800 text-sm text-gray-300"
    }, "下週 ›")), React.createElement(Card, {
      className: "!p-2 overflow-x-auto"
    }, React.createElement("table", {
      className: "w-full text-[12px] text-center"
    }, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null), days.map(d => React.createElement("th", {
      key: d,
      onClick: () => setSel(d),
      className: 'py-1 cursor-pointer ' + (plans[d].warns.length ? 'text-red-400' : 'text-gray-400')
    }, WD[dOf(d).getDay()], React.createElement("br", null), +d.slice(8), plans[d].warns.length > 0 && '•')))), React.createElement("tbody", null, D.staff.map(s => {
      const r = schedOf(D, s.uid, wk.slice(0, 7));
      const stc = {
        submitted: ['待確認', 'y'],
        approved: ['已核准', 'g'],
        returned: ['退回', 'r']
      }[r && r.status] || ['未送出', 'x'];
      return React.createElement("tr", {
        key: s.uid,
        className: "border-t border-gray-800 text-gray-200"
      }, React.createElement("td", {
        className: "text-left py-1.5 pr-1 whitespace-nowrap"
      }, s.name, React.createElement("br", null), React.createElement(Chip, {
        c: stc[1]
      }, stc[0])), days.map(d => React.createElement("td", {
        key: d,
        onClick: () => setSel(d)
      }, cell(s, d))));
    }), !D.staff.length && React.createElement("tr", null, React.createElement("td", {
      colSpan: "8",
      className: "py-4 text-gray-500"
    }, "本店還沒有櫃台人員"))))), React.createElement("p", {
      className: "text-[11px] text-gray-500 text-center"
    }, "點日期看當天人力與打卡;紅點＝沒人可以卡班"), sel && (() => {
      const P = plans[sel] || dayPlan(D, sel);
      const by = {};
      D.staff.forEach(s => {
        const a = P.plan[s.uid] || {};
        if (a.code) (by[a.code] = by[a.code] || []).push(s.name + (a.cover ? '(卡)' : ''));
      });
      const offs = D.staff.filter(s => (P.plan[s.uid] || {}).off).map(s => s.name);
      const now = Date.now();
      const list = D.staff.filter(s => isSup || s.uid === D.me.uid);
      return React.createElement(Sheet, {
        onClose: () => setSel('')
      }, React.createElement("p", {
        className: "text-lg font-extrabold text-gray-100"
      }, sel.slice(5).replace('-', '/'), "（", WD[dOf(sel).getDay()], "）"), React.createElement("p", {
        className: "text-sm font-bold text-gray-300"
      }, "當天人力"), React.createElement("div", {
        className: "text-sm text-gray-200 leading-7"
      }, CODES.map(c => React.createElement("div", {
        key: c
      }, React.createElement("b", {
        className: "inline-block w-8"
      }, c), (by[c] || []).join('、') || React.createElement("span", {
        className: "text-gray-500"
      }, "—"))), offs.length > 0 && React.createElement("div", null, React.createElement("b", {
        className: "inline-block w-8 text-pink-300"
      }, "休"), offs.join('、'))), D.staff.filter(s => (P.plan[s.uid] || {}).cover).map(s => {
        const a = P.plan[s.uid];
        return React.createElement("p", {
          key: s.uid,
          className: "text-sm text-pink-300"
        }, s.name, " 卡 ", a.cover, "（", hhmm(SH[a.cover].s), "–", hhmm(SH[a.cover].e), "）");
      }), P.warns.map((w, i) => React.createElement("p", {
        key: i,
        className: "text-sm text-red-400 rounded-lg bg-red-950/40 px-2 py-1"
      }, "⚠ ", w.who, " 排休,沒人可以卡 ", w.shift)), React.createElement("p", {
        className: "text-sm font-bold text-gray-300 pt-1"
      }, "當天上／下班打卡", !isSup && '(只看得到自己的)'), list.map(s => {
        const x = dayCalc(D, s.uid, sel, now);
        const a = P.plan[s.uid] || {};
        let st = null;
        if (a.off) st = React.createElement(Chip, {
          c: "x"
        }, "排休");else if (!x.inP) st = sel < ymd(new Date()) ? React.createElement(Chip, {
          c: "r"
        }, "沒有打卡") : React.createElement(Chip, {
          c: "x"
        }, "還沒打卡");
        return React.createElement("div", {
          key: s.uid,
          className: "flex items-center justify-between py-1.5 border-b border-gray-800 text-sm"
        }, React.createElement("span", {
          className: "text-gray-200"
        }, s.name, " ", a.code || ''), React.createElement("span", {
          className: "space-x-1 text-gray-300"
        }, x.inP && React.createElement(React.Fragment, null, hm(x.inP.ts), " ", x.late ? React.createElement(Chip, {
          c: "r"
        }, "遲到 ", x.late, " 分") : x.inP.early > 0 ? React.createElement(Chip, {
          c: x.inP.apply ? 'b' : 'y'
        }, "提早 ", x.inP.early, " 分・", x.inP.apply ? '已申請加班' : '不計薪') : React.createElement(Chip, {
          c: "g"
        }, "準時")), x.inP && (x.outP ? React.createElement(React.Fragment, null, " – ", hm(x.outP.ts), " ", x.sE && x.outP.ts < x.sE - 60000 ? React.createElement(Chip, {
          c: "r"
        }, "早退") : x.sE && x.outP.ts > x.sE + 15 * 60000 ? React.createElement(Chip, {
          c: "y"
        }, "晚下班") : null) : React.createElement(Chip, {
          c: "b"
        }, "上班中")), st));
      }));
    })());
  }
  function CfgSheet({
    S,
    onClose
  }) {
    const {
      D,
      push
    } = S;
    const c = D.cfg || {};
    const [busy, setBusy] = useState('');
    const [msg, setMsg] = useState('');
    const [rad, setRad] = useState(String(c.radius || 150));
    return React.createElement(Sheet, {
      onClose: onClose
    }, React.createElement("p", {
      className: "text-lg font-extrabold text-gray-100"
    }, "⚙ 打卡地點設定（", D.me.store, "）"), React.createElement("p", {
      className: "text-xs text-gray-400"
    }, "GPS 在範圍內,或連著店內 Wi‑Fi(網路 IP 相符),任一個符合就算在店內。都不符合時仍可打卡,但會標示給主管。"), React.createElement(Card, null, React.createElement("div", {
      className: "flex items-center"
    }, React.createElement("b", {
      className: "flex-1 text-gray-100"
    }, "GPS 範圍"), React.createElement("label", {
      className: "text-sm text-gray-300"
    }, React.createElement("input", {
      type: "checkbox",
      checked: c.gps !== false,
      onChange: e => push({
        act: 'cfg_set',
        gps: e.target.checked
      }),
      className: "mr-1"
    }), "啟用")), React.createElement("p", {
      className: "text-sm text-gray-300 mt-1"
    }, c.lat ? '店的位置：' + c.lat + ', ' + c.lng : '還沒設定店的位置'), React.createElement("div", {
      className: "flex gap-2 mt-2"
    }, React.createElement(B, {
      cls: "flex-1 bg-violet-600 text-white",
      onClick: async () => {
        setBusy('g');
        const g = await getGps(10000);
        setBusy('');
        if (!g) {
          setMsg('抓不到 GPS,請允許定位後再試');
          return;
        }
        push({
          act: 'cfg_set',
          lat: g.lat,
          lng: g.lng
        });
        setMsg('已用目前位置設定(誤差約 ' + g.acc + ' 公尺)');
      }
    }, busy === 'g' ? React.createElement(Spinner, null) : '📍 用我現在的位置')), React.createElement("div", {
      className: "flex items-center gap-2 mt-2 text-sm text-gray-300"
    }, "範圍半徑", React.createElement("input", {
      value: rad,
      onChange: e => setRad(e.target.value.replace(/\D/g, '')),
      inputMode: "numeric",
      className: "w-20 rounded-lg bg-gray-800 border border-gray-700 px-2 py-1.5 text-gray-100"
    }), "公尺", React.createElement("button", {
      onClick: () => push({
        act: 'cfg_set',
        radius: Math.max(30, Math.min(2000, +rad || 150))
      }),
      className: "ml-auto px-3 py-1.5 rounded-lg bg-gray-800 text-gray-200 text-xs font-bold"
    }, "儲存"))), React.createElement(Card, null, React.createElement("div", {
      className: "flex items-center"
    }, React.createElement("b", {
      className: "flex-1 text-gray-100"
    }, "店內 Wi‑Fi"), React.createElement("label", {
      className: "text-sm text-gray-300"
    }, React.createElement("input", {
      type: "checkbox",
      checked: c.ip !== false,
      onChange: e => push({
        act: 'cfg_set',
        ip: e.target.checked
      }),
      className: "mr-1"
    }), "啟用")), (c.ips || []).map(ip => React.createElement("div", {
      key: ip,
      className: "flex items-center text-sm text-gray-300 py-1"
    }, React.createElement("span", {
      className: "flex-1"
    }, ip), React.createElement("button", {
      onClick: () => push({
        act: 'cfg_set',
        ips: (c.ips || []).filter(x => x !== ip)
      }),
      className: "text-xs text-red-400"
    }, "移除"))), React.createElement(B, {
      cls: "w-full mt-2 bg-violet-600 text-white",
      onClick: async () => {
        setBusy('i');
        const ip = await getIp(5000);
        setBusy('');
        if (!ip) {
          setMsg('抓不到網路位址,請確認已連上店內 Wi‑Fi 並有網路');
          return;
        }
        if ((c.ips || []).indexOf(ip) >= 0) {
          setMsg('這個網路已經在清單裡');
          return;
        }
        push({
          act: 'cfg_set',
          ips: (c.ips || []).concat([ip])
        });
        setMsg('已加入 ' + ip);
      }
    }, busy === 'i' ? React.createElement(Spinner, null) : '📶 把我現在連的網路設為店內 Wi‑Fi'), React.createElement("p", {
      className: "text-[11px] text-gray-500 mt-1"
    }, "要在店內連著店裡的 Wi‑Fi 時按。換網路業者或路由器重開後 IP 可能改變,要重新加入。")), msg && React.createElement("p", {
      className: "text-sm text-amber-300"
    }, msg), React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, "申請、人資、主管待審核完整版、LINE 推播提醒、薪資試算、匯出 Excel 在第二批開放。"));
  }
  function FdApp() {
    const S = useStore();
    const {
      D,
      q,
      sync
    } = S;
    const q0 = new URLSearchParams(location.search).get('fd2') || 'p';
    const [tab, setTab] = useState(['p', 'm', 's', 'w'].indexOf(q0) >= 0 ? q0 : 'p');
    const [cfg, setCfg] = useState(false);
    const [who, setWho] = useState('');
    if (!D) return React.createElement("div", {
      className: "min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center"
    }, sync.err ? React.createElement("p", {
      className: "text-red-400"
    }, sync.err) : sync.off ? React.createElement("p", {
      className: "text-gray-400"
    }, "目前離線,第一次使用需要連上網路一次") : React.createElement(React.Fragment, null, React.createElement(Spinner, null), React.createElement("p", {
      className: "text-gray-400"
    }, "載入中…")), React.createElement("button", {
      onClick: S.doSync,
      className: "text-sm text-violet-400 underline"
    }, "重試"));
    const me = D.me;
    const uid = who || me.uid;
    const syncTxt = sync.off ? '離線' + (q.length ? '・' + q.length + ' 筆待送' : '') : q.length ? q.length + ' 筆待送' : '已同步 ' + (sync.at ? hm(sync.at) : '');
    const T = [['p', '打卡'], ['m', '月紀錄'], ['s', '排班'], ['w', '全班表']];
    return React.createElement("div", {
      className: "min-h-screen px-3 py-3"
    }, React.createElement("div", {
      className: "max-w-md mx-auto space-y-3"
    }, React.createElement("style", null, ".fd-w,.fd-w *{color:#fff !important}"), React.createElement("div", {
      className: "flex items-center gap-2"
    }, React.createElement("b", {
      className: "flex-1 text-lg text-gray-100"
    }, "🕒 櫃台 · ", me.store), React.createElement("button", {
      onClick: S.doSync,
      className: 'text-[11px] font-bold rounded-full px-2.5 py-1 ' + (sync.off || q.length ? 'bg-amber-900/60 text-amber-300' : 'bg-emerald-900/60 text-emerald-300')
    }, sync.busy ? React.createElement(Spinner, {
      size: 11
    }) : null, " ", syncTxt), me.isSup && React.createElement("button", {
      onClick: () => setCfg(true),
      className: "text-lg px-1",
      "aria-label": "設定"
    }, "⚙")), React.createElement("div", {
      className: "grid grid-cols-4 gap-1.5"
    }, T.map(([k, l]) => React.createElement("button", {
      key: k,
      onClick: () => setTab(k),
      className: 'rounded-xl py-2.5 text-sm font-bold ' + (tab === k ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300')
    }, l))), S.notes.length > 0 && React.createElement("div", {
      className: "rounded-xl border border-red-700 bg-red-950/40 p-3 text-sm text-red-300"
    }, S.notes.map((n, i) => React.createElement("p", {
      key: i
    }, "⚠ ", n)), React.createElement("button", {
      onClick: S.clearNotes,
      className: "text-xs underline mt-1"
    }, "知道了")), sync.err && React.createElement("p", {
      className: "text-sm text-red-400"
    }, sync.err), me.isSup && (tab === 'p' || tab === 'm') && D.staff.length > 0 && React.createElement("div", {
      className: "flex items-center gap-2 text-sm text-gray-300"
    }, "查看人員", React.createElement("select", {
      value: uid,
      onChange: e => setWho(e.target.value === me.uid ? '' : e.target.value),
      className: "flex-1 rounded-lg bg-gray-800 border border-gray-700 px-2 py-2 text-gray-100"
    }, me.isCounter && React.createElement("option", {
      value: me.uid
    }, "我自己"), D.staff.filter(s => s.uid !== me.uid).map(s => React.createElement("option", {
      key: s.uid,
      value: s.uid
    }, s.name)))), tab === 'p' && (me.isCounter || who ? React.createElement(PunchTab, {
      S: S,
      uid: who && me.isSup ? who : me.uid,
      isMe: !who || who === me.uid
    }) : React.createElement(Card, null, React.createElement("p", {
      className: "text-sm text-gray-400"
    }, "你不是櫃台人員,不需要打卡。請在上方選擇人員查看打卡狀況。"))), tab === 'm' && (me.isCounter || who ? React.createElement(MonthRec, {
      S: S,
      uid: who || me.uid
    }) : React.createElement(Card, null, React.createElement("p", {
      className: "text-sm text-gray-400"
    }, "請在上方選擇人員查看月打卡紀錄。"))), tab === 's' && React.createElement(SchedTab, {
      S: S
    }), tab === 'w' && React.createElement(WeekTab, {
      S: S
    }), React.createElement("p", {
      className: "text-[10px] text-gray-600 text-center"
    }, "櫃台人員頁 ", VER, " ・操作先存在手機,背景自動送出"), cfg && React.createElement(CfgSheet, {
      S: S,
      onClose: () => setCfg(false)
    })));
  }
  window.Fd2Routes = FdApp;
})();
