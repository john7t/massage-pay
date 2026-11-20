/*BUILD fd2.js v1.0-015 編譯版 h=dba91c54 t=2026-11-21 04:01*/
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
  const VER = 'v1.0-015';
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
      n: '午班',
      s: 12,
      e: 22
    },
    C1: {
      n: '晚班1',
      s: 16,
      e: 26
    },
    C2: {
      n: '晚班2',
      s: 18,
      e: 28
    },
    D: {
      n: '夜班',
      s: 22,
      e: 32
    }
  };
  const LB = {
    A1: '早1',
    A2: '早2',
    B: '午',
    C1: '晚1',
    C2: '晚2',
    D: '夜'
  };
  const lb = c => LB[c] || c || '';
  const CODES = ['A1', 'A2', 'B', 'C1', 'C2', 'D'];
  const COVER = {
    A1: 'A2',
    D: 'C2'
  };
  const LV = {
    al: '特休',
    pl: '事假',
    sl: '病假'
  };
  const LVS = {
    al: '特',
    pl: '事',
    sl: '病'
  };
  const LVK = ['al', 'pl', 'sl'];
  const OTR = ['客人延後', '交接延誤', '提早上班', '其他'];
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
  const md = d => String(d || '').slice(5).replace('-', '/');
  const money = n => (n < 0 ? '-' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US');
  const dayN = min => {
    const d = min / 480;
    return Math.round(d * 100) / 100 + '';
  };
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
    QK = 'fd2:q:v1:' + U0,
    DK = 'fd2:draft:v1:' + U0;
  const CFG0 = {
    mgrLv: ['經理'],
    unit: {
      al: 'd',
      pl: 'd',
      sl: 'd'
    },
    fullAtt: 2000,
    grace: 0,
    attMode: 'cut',
    radius: 150,
    ips: []
  };
  function applyLocal(srv, q) {
    if (!srv) return null;
    const D = JSON.parse(JSON.stringify(srv));
    const me = D.me.uid;
    D.me.isWork = !!(D.me.isStaff || D.staff.some(s => s.uid === me));
    D.cfg = Object.assign({}, CFG0, D.cfg || {});
    D.cfg.unit = Object.assign({}, CFG0.unit, D.cfg.unit || {});
    D.hr = D.hr || [];
    D.reqs = D.reqs || [];
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
        type: o.type || 'ot',
        date: o.date,
        date2: o.date2 || o.date,
        start: o.start || '',
        end: o.end || '',
        min: o.min,
        reason: o.reason || '',
        note: o.note || '',
        status: 'pending',
        _p: 1
      });else if (o.act === 'req_cancel' || o.act === 'req_decide') {
        const r = D.reqs.find(x => x.id === o.id);
        if (r && r.status === 'pending') r.status = o.act === 'req_cancel' ? 'cancelled' : o.ok ? 'approved' : 'rejected';
      } else if (o.act === 'sched_set') {
        const u = o.uid || me;
        let r = D.sched.find(x => x.uid === u && x.month === o.month);
        if (!r) {
          r = {
            uid: u,
            month: o.month
          };
          D.sched.push(r);
        }
        if (r.status !== 'approved' || D.me.isSup) {
          r.base = o.base || r.base;
          r.days = o.days;
          if (!(D.me.isSup && r.status && r.status !== 'draft')) r.status = 'draft';
          r._p = 1;
        }
      } else if (o.act === 'sched_submit') {
        const r = D.sched.find(x => x.uid === (o.uid || me) && x.month === o.month);
        if (r && r.status !== 'approved') {
          r.status = 'submitted';
          r.viol = o.viol;
        }
      } else if (o.act === 'sched_decide') {
        const r = D.sched.find(x => x.uid === o.uid && x.month === o.month);
        if (r) r.status = o.ok ? 'approved' : 'returned';
      } else if (o.act === 'cfg_set') {
        Object.keys(o).forEach(k => {
          if (k === 'unit') D.cfg.unit = Object.assign({}, D.cfg.unit, o.unit);else if (k !== 'act' && k !== 'opId') D.cfg[k] = o[k];
        });
      } else if (o.act === 'hr_set') {
        let r = D.hr.find(x => x.uid === o.uid);
        if (!r) {
          r = {
            uid: o.uid
          };
          D.hr.push(r);
        }
        const f = Object.assign({}, o.f);
        if (f.hire !== undefined && !D.me.isSup) {
          r.hirePend = f.hire;
          delete f.hire;
        } else if (f.hire !== undefined) r.hirePend = '';
        Object.assign(r, f);
        r._p = 1;
        if (f.nick) {
          const st = D.staff.find(x => x.uid === o.uid);
          if (st) st.name = f.nick;
          if (o.uid === me) D.me.name = f.nick;
        }
      } else if (o.act === 'hr_hire_decide') {
        const r = D.hr.find(x => x.uid === o.uid);
        if (r && r.hirePend) {
          if (o.ok) r.hire = r.hirePend;
          r.hirePend = '';
        }
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
              if (!x.ok) {
                bad.push((o.act === 'sched_set' ? '班表沒有存成功:' : '') + (x.error || '操作失敗'));
                if (o.act === 'sched_set') {
                  const dd = LS.get(DK, {});
                  dd[(o.uid || srv && srv.me && srv.me.uid || '') + '|' + o.month] = {
                    base: o.base,
                    days: o.days
                  };
                  LS.set(DK, dd);
                  try {
                    window.dispatchEvent(new Event('fd2draft'));
                  } catch (_e) {}
                }
              }
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
          const net = !r || r._net || /連不上|逾時|網路|Failed|Load failed/.test(String(r.error || ''));
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
      let base = qR.current;
      if (o.act === 'sched_set') base = base.filter(x => !(x.act === 'sched_set' && (x.uid || '') === (o.uid || '') && x.month === o.month && !(busyR.current && x._s)));
      const nq = base.concat([o]);
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
  const lvActive = r => LV[r.type] && (r.status === 'pending' || r.status === 'approved');
  function leaveOn(D, uid, date) {
    const L = D.reqs.filter(r => r.uid === uid && lvActive(r) && r.date <= date && (r.date2 || r.date) >= date);
    return {
      full: L.find(r => !r.start) || null,
      part: L.filter(r => r.start)
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
    const main = {};
    D.staff.forEach(s => {
      const c = planned(D, s.uid, date);
      const L = leaveOn(D, s.uid, date).full;
      const r = schedOf(D, s.uid, date.slice(0, 7));
      const o = {
        code: c === 'off' ? null : c,
        off: c === 'off',
        unset: c === null
      };
      if (o.off) main[s.uid] = r && r.base;
      if (L) {
        o.lv = L.type;
        o.lvP = L.status === 'pending';
        o.unset = false;
        if (o.code) {
          main[s.uid] = o.code;
          o.code = null;
        }
      }
      out[s.uid] = o;
    });
    Object.keys(COVER).forEach(m => {
      const need = D.staff.filter(s => main[s.uid] === m);
      const avail = D.staff.filter(s => out[s.uid].code === COVER[m] && !out[s.uid].cover);
      need.forEach((s, i) => {
        const c = avail[i];
        if (c) {
          out[c.uid].code = m;
          out[c.uid].cover = m;
          out[s.uid].coveredBy = c.name;
        } else {
          warns.push({
            shift: m,
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
        if (off < 2) add(d, '第36條 ' + md(addD(d, -6)) + '~' + md(d) + ' 只休 ' + off + ' 天(每 7 天要休 2 天)');
        if (wk * 8 > 40) add(d, '第30條 ' + md(addD(d, -6)) + '~' + md(d) + ' 正常工時 ' + wk * 8 + ' 小時(每週 40 小時)');
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
    const L = leaveOn(D, uid, date);
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
    const otReqs = ot.filter(r => r.reason !== '提早上班' && r.status !== 'cancelled');
    let pay = inP ? inP.payStart || inP.ts : 0;
    if (inP && earlyReq && earlyReq.status !== 'approved' && sS) pay = Math.max(inP.ts, sS);
    const late = inP && sS && inP.ts > sS + 60000 ? Math.floor((inP.ts - sS) / 60000) : 0;
    const endCap = outP ? outP.ts : now;
    const otOk = otReqs.some(r => r.status === 'approved');
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
      otReqs,
      pay,
      lvFull: L.full,
      lvPart: L.part
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
  function hrOf(D, uid) {
    return D.hr.find(x => x.uid === uid) || {
      uid: uid
    };
  }
  const addYM = (s, y, m) => {
    const d = dOf(s);
    const t = new Date(d.getFullYear() + y, d.getMonth() + m, d.getDate());
    if (t.getDate() !== d.getDate()) t.setDate(0);
    return ymd(t);
  };
  const alDays = n => n < 1 ? 0 : n === 1 ? 7 : n === 2 ? 10 : n < 5 ? 14 : n < 10 ? 15 : Math.min(30, 15 + (n - 9));
  function senTxt(hire, today) {
    if (!hire) return '';
    const a = dOf(hire),
      b = dOf(today);
    let m = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();
    if (b.getDate() < a.getDate()) m--;
    if (m < 0) return '未到職';
    return (m >= 12 ? Math.floor(m / 12) + ' 年 ' : '') + m % 12 + ' 個月';
  }
  function alInfo(D, uid, today) {
    const hire = hrOf(D, uid).hire;
    if (!hire || !/^\d{4}-\d{2}-\d{2}$/.test(hire)) return null;
    let n = 0;
    while (addYM(hire, n + 1, 0) <= today && n < 60) n++;
    let days, from, to, next, nextDays;
    if (n >= 1) {
      days = alDays(n);
      from = addYM(hire, n, 0);
      to = addD(addYM(hire, n + 1, 0), -1);
      next = addYM(hire, n + 1, 0);
      nextDays = alDays(n + 1);
    } else if (addYM(hire, 0, 6) <= today) {
      days = 3;
      from = addYM(hire, 0, 6);
      to = addD(addYM(hire, 1, 0), -1);
      next = addYM(hire, 1, 0);
      nextDays = 7;
    } else {
      days = 0;
      from = '';
      to = '';
      next = addYM(hire, 0, 6);
      nextDays = 3;
    }
    const used = from ? D.reqs.filter(r => r.uid === uid && r.type === 'al' && lvActive(r) && r.date >= from && r.date <= to).reduce((s, r) => s + r.min, 0) / 480 : 0;
    return {
      days,
      from,
      to,
      next,
      nextDays,
      used,
      left: days - used,
      sen: senTxt(hire, today)
    };
  }
  function yearUsed(D, uid, type, today) {
    const y = today.slice(0, 4);
    return D.reqs.filter(r => r.uid === uid && r.type === type && lvActive(r) && r.date.slice(0, 4) === y).reduce((s, r) => s + r.min, 0) / 480;
  }
  function leftOf(D, uid, type, today) {
    if (type === 'al') {
      const a = alInfo(D, uid, today);
      return a ? a.left : null;
    }
    return (type === 'pl' ? 14 : 30) - yearUsed(D, uid, type, today);
  }
  function leaveWorkDays(D, uid, d1, d2) {
    let n = 0;
    for (let d = d1; d <= d2 && n < 40; d = addD(d, 1)) {
      if (planned(D, uid, d) !== 'off') n++;
    }
    return n;
  }
  function monthRows(D, uid, month, now) {
    const n = daysIn(month);
    const today = ymd(new Date(now));
    const rows = [];
    for (let i = 1; i <= n; i++) {
      const d = month + '-' + p2(i);
      if (d > today) break;
      rows.push({
        d,
        x: dayCalc(D, uid, d, d === today ? now : at(d, 48))
      });
    }
    return rows;
  }
  function salCalc(D, uid, month, now, rows) {
    const cfg = D.cfg;
    const S = +hrOf(D, uid).salary || 0;
    const F = +cfg.fullAtt || 0;
    const grace = +cfg.grace || 0;
    const today = ymd(new Date(now));
    rows = rows || monthRows(D, uid, month, now);
    let lateN = 0,
      lateMin = 0,
      miss = 0,
      ot1 = 0,
      ot2 = 0,
      otDays = 0;
    rows.forEach(({
      d,
      x
    }) => {
      if (x.late > grace) {
        lateN++;
        lateMin += x.late;
      }
      if (!x.lvFull && (!x.inP && x.outP || x.inP && !x.outP && d < today || !x.ps.length && x.code && d < today)) miss++;
      if (x.outP || x.inP && d < today) {
        const o = Math.max(0, Math.round(x.work) - 480);
        if (o > 0) {
          otDays++;
          ot1 += Math.min(120, o);
          ot2 += Math.min(120, Math.max(0, o - 120));
        }
      }
    });
    const lv = {
      al: 0,
      pl: 0,
      sl: 0
    };
    D.reqs.filter(r => r.uid === uid && lvActive(r)).forEach(r => {
      if (r.start) {
        if (r.date.slice(0, 7) === month) lv[r.type] += r.min / 480;
        return;
      }
      for (let d = r.date; d <= (r.date2 || r.date); d = addD(d, 1)) {
        if (d.slice(0, 7) === month && planned(D, uid, d) !== 'off') lv[r.type] += 1;
      }
    });
    let att = F,
      attNote = '';
    if ((lateN || miss) && cfg.attMode !== 'keep') {
      att = 0;
      attNote = (lateN ? '遲到' : '') + (lateN && miss ? '、' : '') + (miss ? '缺卡' : '') + '・當月不發';
    } else if (lv.pl + lv.sl > 0) {
      att = Math.max(0, F - F / 30 * (lv.pl + lv.sl));
      attNote = '事病假 ' + dayN((lv.pl + lv.sl) * 480) + ' 天比例扣';
    }
    const hourly = (S + F) / 240;
    const otPay = hourly * (ot1 / 60 * 1.34 + ot2 / 60 * 1.67);
    const lateDed = S / 240 / 60 * lateMin;
    const plDed = S / 30 * lv.pl;
    const slDed = S / 30 / 2 * lv.sl;
    const total = S + att + otPay - lateDed - plDed - slDed;
    return {
      S,
      F,
      att,
      attNote,
      hourly,
      ot1,
      ot2,
      otDays,
      otPay,
      lateN,
      lateMin,
      lateDed,
      miss,
      lv,
      plDed,
      slDed,
      total
    };
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
  const Seg = ({
    opts,
    val,
    on,
    small
  }) => React.createElement("div", {
    className: "flex gap-1.5 flex-wrap"
  }, opts.map(([k, l]) => React.createElement("button", {
    key: k,
    onClick: () => on(k),
    className: 'rounded-full font-bold ' + (small ? 'px-2.5 py-1 text-xs ' : 'px-3 py-1.5 text-sm ') + (val === k ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300')
  }, l)));
  const Inp = p => React.createElement("input", {
    ...p,
    className: 'rounded-xl bg-gray-800 border border-gray-700 px-3 py-2.5 text-gray-100 text-[15px] ' + (p.className || 'w-full')
  });
  const STX = {
    pending: ['待核准', 'y'],
    approved: ['已核准', 'g'],
    rejected: ['未核准', 'x'],
    cancelled: ['已取消', 'x']
  };
  const MonthNav = ({
    month,
    setMonth,
    suffix
  }) => React.createElement("div", {
    className: "flex items-center gap-2"
  }, React.createElement("button", {
    onClick: () => setMonth(addM(month, -1)),
    className: "px-3 py-2 rounded-full bg-gray-800 text-sm text-gray-300"
  }, "‹"), React.createElement("b", {
    className: "flex-1 text-center text-gray-100"
  }, month.replace('-', ' 年 '), " 月", suffix || ''), React.createElement("button", {
    onClick: () => setMonth(addM(month, 1)),
    className: "px-3 py-2 rounded-full bg-gray-800 text-sm text-gray-300"
  }, "›"));
  const nameOf = (D, uid) => (D.staff.find(s => s.uid === uid) || {}).name || (uid === D.me.uid ? D.me.name : '?');
  const RC = {
    work: '#3b82f6',
    rest: '#22c55e',
    ot: '#f59e0b',
    none: '#e5d3dc'
  };
  function ringIv(x, now) {
    const t0 = x.sS || (x.inP ? Math.floor(x.inP.ts / 3600000) * 3600000 : 0);
    if (!x.inP) return {
      t0,
      iv: []
    };
    const iv = [];
    const M = t => (t - t0) / 60000;
    const eM = x.sE ? M(x.sE) : 1e9;
    let cur = x.inP.ts,
      mode = 'work';
    const add = (a, b, k) => {
      if (b <= a) return;
      if (k === 'work' && a < eM && b > eM) {
        iv.push([a, eM, 'work']);
        iv.push([eM, b, 'ot']);
        return;
      }
      iv.push([a, b, k === 'work' && a >= eM ? 'ot' : k]);
    };
    x.ps.forEach(p => {
      if (p.ts < x.inP.ts) return;
      if (p.type === 'bs' && mode === 'work') {
        add(M(cur), M(p.ts), 'work');
        cur = p.ts;
        mode = 'rest';
      } else if (p.type === 'be' && mode === 'rest') {
        add(M(cur), M(p.ts), 'rest');
        cur = p.ts;
        mode = 'work';
      } else if (p.type === 'out') {
        add(M(cur), M(p.ts), mode);
        cur = p.ts;
        mode = 'end';
      }
    });
    if (mode !== 'end') add(M(cur), M(now), mode);
    return {
      t0,
      iv: iv.map(([a, b, k]) => [Math.max(0, a), b, k]).filter(([a, b]) => b > a)
    };
  }
  function Ring({
    x,
    now,
    children
  }) {
    const {
      t0,
      iv
    } = ringIv(x, now);
    const ext = x.inP && x.sE && x.latest ? Math.max(0, Math.ceil((x.latest - x.sE) / 3600000 - 1e-6)) : 2;
    const N = Math.min(24, 10 + ext);
    const R = 78,
      cx = 100,
      cy = 100,
      sw = 20,
      gap = 2.2,
      seg = 360 / N;
    const rad = a => (a - 90) * Math.PI / 180;
    const P = (r, a) => [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];
    const arc = (a0, a1, col, op, k) => {
      const [x0, y0] = P(R, a0),
        [x1, y1] = P(R, a1);
      return React.createElement("path", {
        key: k,
        d: 'M' + x0 + ' ' + y0 + ' A' + R + ' ' + R + ' 0 ' + (a1 - a0 > 180 ? 1 : 0) + ' 1 ' + x1 + ' ' + y1,
        stroke: col,
        strokeWidth: sw,
        fill: "none",
        opacity: op
      });
    };
    const els = [];
    for (let i = 0; i < N; i++) {
      const a0 = i * seg + gap / 2,
        a1 = (i + 1) * seg - gap / 2,
        m0 = i * 60,
        m1 = m0 + 60;
      els.push(arc(a0, a1, RC.none, i >= 10 ? .55 : 1, 'g' + i));
      iv.forEach(([b, e, k], j) => {
        const u = Math.max(b, m0),
          v = Math.min(e, m1);
        if (v > u) els.push(arc(a0 + (u - m0) / 60 * (a1 - a0), a0 + (v - m0) / 60 * (a1 - a0), RC[k], 1, 's' + i + '_' + j));
      });
    }
    const T = m => hm(t0 + m * 60000);
    const L = [];
    iv.forEach(([b, e, k], i) => {
      const pv = iv[i - 1];
      if (pv && Math.abs(pv[1] - b) < 0.5 && pv[2] === k) return;
      if (k === 'ot' && Math.abs(b - 600) < 0.5 && x.sE) return;
      if (b >= N * 60) return;
      L.push({
        m: b,
        t: i === 0 && x.inP ? hm(x.inP.ts) : T(b),
        c: RC[k]
      });
    });
    if (x.sE) L.push({
      m: 600,
      t: hm(x.sE),
      c: '#b0306a',
      bold: 1
    });
    L.sort((a, b) => a.m - b.m);
    let lastA = -99,
      lift = 0;
    L.forEach((l, i) => {
      const an = l.m / 60 * seg;
      lift = an - lastA < 16 ? lift + 13 : 0;
      lastA = an;
      const rr = R + 21 + lift;
      const [tx, ty] = P(rr, an);
      const c = Math.cos(rad(an));
      const [l0x, l0y] = P(R + 10, an),
        [l1x, l1y] = P(rr - 7, an);
      els.push(React.createElement("line", {
        key: 'll' + i,
        x1: l0x,
        y1: l0y,
        x2: l1x,
        y2: l1y,
        stroke: l.c,
        strokeWidth: "1.5"
      }));
      els.push(React.createElement("text", {
        key: 'lt' + i,
        x: tx,
        y: ty + 4,
        textAnchor: c > 0.25 ? 'start' : c < -0.25 ? 'end' : 'middle',
        fontSize: l.bold ? 13 : 11.5,
        fontWeight: l.bold ? 900 : 700,
        fill: l.bold ? '#b0306a' : '#4a2337'
      }, l.t));
    });
    if (x.sE) {
      const [a, b] = P(R - 14, 10 * seg),
        [c2, d] = P(R + 14, 10 * seg);
      els.push(React.createElement("line", {
        key: "eL",
        x1: a,
        y1: b,
        x2: c2,
        y2: d,
        stroke: "#b0306a",
        strokeWidth: "3",
        strokeLinecap: "round"
      }));
    }
    const nm = (now - t0) / 60000;
    if (x.inP && !x.outP && nm >= 0 && nm < N * 60) {
      const [a, b] = P(R, nm / 60 * seg);
      els.push(React.createElement("circle", {
        key: "now",
        cx: a,
        cy: b,
        r: "6",
        fill: "#fff",
        stroke: "#4a2337",
        strokeWidth: "2.5"
      }));
    }
    return React.createElement("div", {
      className: "relative mx-auto",
      style: {
        width: 330,
        height: 330,
        maxWidth: '100%'
      }
    }, React.createElement("svg", {
      viewBox: "-40 -40 280 280",
      width: "100%",
      height: "100%"
    }, els), React.createElement("div", {
      className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
    }, children));
  }
  function PunchTab({
    S,
    uid,
    isMe,
    goApply
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
          type: 'ot',
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
    const isOt = state === 'work' && x.sE && now > x.sE;
    let col = '#4a2337';
    if (state === 'work') {
      if (x.cont >= 210 || isOt) col = '#d97706';
      if (x.latest && now > x.latest - 30 * 60000) col = '#ef4444';
    }
    if (state === 'brk') {
      const tot = x.rest;
      col = tot >= 120 ? '#ef4444' : tot >= 60 ? '#16a34a' : '#3b82f6';
    }
    const restPct = Math.min(100, x.rest / 120 * 100);
    return React.createElement("div", {
      className: "space-y-3"
    }, React.createElement(Card, null, React.createElement("div", {
      className: "flex items-start gap-2"
    }, React.createElement("div", {
      className: "flex-1"
    }, React.createElement("p", {
      className: "text-xs text-gray-400"
    }, date === ymd(new Date(now)) ? '今日班別' : '前一天的班(跨日)', " ", md(date), "（", WD[dOf(date).getDay()], "）"), React.createElement("p", {
      className: "text-xl font-extrabold text-gray-100"
    }, x.code ? lb(x.code) + '・' + SH[x.code].n : x.lvFull ? LV[x.lvFull.type] + (x.lvFull.status === 'pending' ? '(待核准)' : '') : '今天沒有排班', x.a.cover && React.createElement("span", {
      className: "ml-2 align-middle"
    }, React.createElement(Chip, {
      c: "p"
    }, "卡班"))), React.createElement("p", {
      className: "text-xs text-gray-400"
    }, x.code ? hhmm(SH[x.code].s) + ' – ' + hhmm(SH[x.code].e) : x.lvFull ? '請假不用打卡' : '沒有排班也可以打卡', x.code ? ' ・下班時間固定 ' + hhmm(SH[x.code].e) : ''), x.lvPart.map(r => React.createElement("p", {
      key: r.id,
      className: "text-xs text-sky-300 mt-0.5"
    }, LV[r.type], " ", r.start, "–", r.end, r.status === 'pending' ? '(待核准)' : ''))), React.createElement(Chip, {
      c: isOt ? 'y' : state === 'work' ? 'g' : state === 'brk' ? 'b' : 'x'
    }, isOt ? '加班中' : state === 'work' ? '上班中' : state === 'brk' ? '休息中' : state === 'out' ? '已下班' : '尚未上班'))), React.createElement(Card, {
      className: "text-center !px-2"
    }, React.createElement(Ring, {
      x: x,
      now: now
    }, React.createElement("span", {
      className: "text-xs text-gray-400"
    }, state === 'brk' ? '休息中' : '今日實際工時'), React.createElement("span", {
      className: "text-4xl font-black",
      style: {
        color: col
      }
    }, state === 'brk' ? dur((now - x.bsTs) / 60000) : dur(x.work)), React.createElement("span", {
      className: "text-xs text-gray-400"
    }, isOt ? '加班 ' + dur((now - x.sE) / 60000) : state === 'work' ? '連續工作 ' + dur(x.cont) : state === 'brk' ? '今日休息 ' + Math.round(x.rest) + ' 分' : state === 'out' ? '已下班 ' + hm(x.outP.ts) : ' ')), React.createElement("div", {
      className: "flex justify-center gap-2.5 text-[11px] text-gray-400 flex-wrap"
    }, [['work', '上班'], ['rest', '休息'], ['ot', '加班'], ['none', '未上／未到']].map(([k, l]) => React.createElement("span", {
      key: k
    }, React.createElement("i", {
      style: {
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: 3,
        marginRight: 3,
        verticalAlign: -1,
        background: RC[k]
      }
    }), l))), x.code && React.createElement("div", {
      className: "grid grid-cols-3 gap-1 mt-3 text-[13px] text-gray-400"
    }, React.createElement("div", null, "表定下班", React.createElement("br", null), React.createElement("b", {
      className: "text-lg text-gray-100"
    }, hm(x.sE))), React.createElement("div", null, x.outP ? '下班打卡' : now > x.sE ? '已超過下班' : '距下班', React.createElement("br", null), React.createElement("b", {
      className: "text-lg text-gray-100"
    }, x.outP ? hm(x.outP.ts) : now > x.sE ? dur((now - x.sE) / 60000) : dur((x.sE - now) / 60000))), React.createElement("div", null, "最晚可加班到", React.createElement("br", null), React.createElement("b", {
      className: "text-lg text-gray-100"
    }, x.inP ? hm(x.latest) : '—'))), React.createElement("p", {
      className: "text-[11px] text-gray-500 mt-1"
    }, "1 格＝1 小時;粗線＝表定下班,之後是最多可加班(計薪起算+12 小時+休息,且隔天班前要休 11 小時)")), x.inP && React.createElement(Card, null, React.createElement("div", {
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
    }, msg), isMe && x.sE && (state === 'work' || state === 'brk' || state === 'out') && (x.outP ? x.outP.ts : now) > x.sE + 60000 && !x.otReqs.length && React.createElement(Card, {
      className: "flex items-center gap-3"
    }, React.createElement("p", {
      className: "flex-1 text-sm text-amber-300"
    }, "已過表定下班 ", hm(x.sE), ",超過的時間要有核准的加班才計薪"), React.createElement("button", {
      onClick: () => goApply({
        date,
        start: hm(x.sE),
        end: hm(x.outP ? x.outP.ts : Math.ceil(now / 300000) * 300000)
      }),
      className: "fd-w shrink-0 rounded-xl px-3 py-2 text-sm font-bold",
      style: {
        background: '#f59e0b'
      }
    }, "申請加班")), x.otReqs.map(r => React.createElement("p", {
      key: r.id,
      className: "text-sm text-center"
    }, React.createElement(Chip, {
      c: STX[r.status][1]
    }, "加班 ", r.start, "–", r.end, "・", STX[r.status][0]))), React.createElement(Card, null, React.createElement("p", {
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
    }, x.sE && now < x.sE - 60000 ? React.createElement(React.Fragment, null, React.createElement("p", {
      className: "text-lg font-extrabold text-gray-100"
    }, "還沒到下班時間"), React.createElement("p", {
      className: "text-[15px] text-gray-300"
    }, "表定 ", hm(x.sE), " 下班,現在 ", hm(now), "。現在打下班卡會記「早退 ", Math.ceil((x.sE - now) / 60000), " 分」。")) : React.createElement(React.Fragment, null, React.createElement("p", {
      className: "text-lg font-extrabold text-gray-100"
    }, "確定下班打卡？")), React.createElement("p", {
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
    }, x.sE && now < x.sE - 60000 ? '仍要下班' : '下班打卡'))), ask && ask.kind === 'loc' && React.createElement(Sheet, {
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
    const today = ymd(new Date());
    const rows = monthRows(D, uid, month, now);
    const st = {
      days: 0,
      work: 0,
      ot: 0,
      late: 0,
      miss: 0
    };
    const grace = +D.cfg.grace || 0;
    const S0 = +hrOf(D, uid).salary || 0;
    const list = rows.map(({
      d,
      x
    }) => {
      const notes = [];
      if (x.inP) {
        st.days++;
        st.work += x.work;
      }
      if (x.late) {
        notes.push(React.createElement(Chip, {
          key: "l",
          c: "r"
        }, "遲到 ", x.late, " 分", x.late > grace && S0 ? '・-' + money(S0 / 240 / 60 * x.late).slice(1) : ''));
        if (x.late > grace) st.late++;
      }
      if (x.earlyReq) notes.push(React.createElement(Chip, {
        key: "e",
        c: x.earlyReq.status === 'approved' ? 'b' : x.earlyReq.status === 'rejected' ? 'x' : 'y'
      }, "提早加班 ", x.earlyReq.min, " 分・", (STX[x.earlyReq.status] || [''])[0]));
      x.otReqs.forEach(r => notes.push(React.createElement(Chip, {
        key: r.id,
        c: r.status === 'approved' ? 'b' : 'y'
      }, "加班 ", r.min, " 分・", STX[r.status][0])));
      const o = Math.max(0, Math.round(x.work) - 480);
      if ((x.outP || x.inP && d < today) && o > 0) st.ot += o;
      if (!x.lvFull) {
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
        if (!x.ps.length && x.code && d < today) {
          notes.push(React.createElement(Chip, {
            key: "n",
            c: "r"
          }, "沒有打卡紀錄"));
          st.miss++;
        }
      }
      if (x.outP && x.rest < 60) notes.push(React.createElement(Chip, {
        key: "r",
        c: "y"
      }, "休息不足 1 小時"));
      if (x.ps.some(p => p.loc === 'none' || p.loc === 'unk')) notes.push(React.createElement(Chip, {
        key: "g",
        c: "r"
      }, "地點待確認"));
      x.lvPart.forEach(r => notes.push(React.createElement(Chip, {
        key: r.id,
        c: "b"
      }, LV[r.type], " ", r.start, "–", r.end, r.status === 'pending' ? '・待核准' : '')));
      return {
        d,
        x,
        notes,
        off: x.a.off
      };
    });
    const sal = salCalc(D, uid, month, now, rows);
    return React.createElement("div", {
      className: "space-y-3"
    }, React.createElement(MonthNav, {
      month: month,
      setMonth: setMonth
    }), React.createElement(Card, {
      className: "!p-2"
    }, React.createElement("table", {
      className: "w-full text-[12px] text-center"
    }, React.createElement("thead", null, React.createElement("tr", {
      className: "text-gray-400"
    }, React.createElement("th", null, "日"), React.createElement("th", null, "班"), React.createElement("th", null, "上班"), React.createElement("th", null, "下班"), React.createElement("th", null, "工時"), React.createElement("th", null, "休息"))), React.createElement("tbody", null, list.slice().reverse().map(r => React.createElement(React.Fragment, {
      key: r.d
    }, React.createElement("tr", {
      className: "border-t border-gray-800 text-gray-200",
      style: r.x.lvFull && !r.x.ps.length ? {
        background: 'rgba(56,189,248,.12)'
      } : null
    }, React.createElement("td", {
      className: "py-1.5"
    }, r.d.slice(8), React.createElement("span", {
      className: "text-gray-500"
    }, WD[dOf(r.d).getDay()])), r.x.lvFull && !r.x.ps.length ? React.createElement("td", {
      colSpan: "5",
      className: "text-sky-300 font-bold"
    }, LV[r.x.lvFull.type], "（整天）", r.x.lvFull.status === 'pending' ? '待核准' : '') : r.off && !r.x.ps.length ? React.createElement("td", {
      colSpan: "5",
      className: "text-pink-300 font-bold"
    }, "排休") : React.createElement(React.Fragment, null, React.createElement("td", null, r.x.code ? lb(r.x.code) : '—', r.x.a.cover && React.createElement("span", {
      className: "text-pink-300"
    }, "卡")), React.createElement("td", {
      className: r.x.late ? 'text-red-400' : ''
    }, r.x.inP ? hm(r.x.inP.ts) : '—'), React.createElement("td", null, r.x.outP ? hm(r.x.outP.ts) : '—'), React.createElement("td", null, r.x.inP ? dur(r.x.work) : '—'), React.createElement("td", null, r.x.inP ? Math.round(r.x.rest) : '—'))), r.notes.length > 0 && React.createElement("tr", null, React.createElement("td", {
      colSpan: "6",
      className: "text-left pb-1.5 space-x-1"
    }, r.notes)))), !list.length && React.createElement("tr", null, React.createElement("td", {
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
    }, LVK.filter(k => sal.lv[k]).map(k => LVS[k] + dayN(sal.lv[k] * 480)).join(' ') || '—'))), st.ot > 46 * 60 && React.createElement("p", {
      className: "text-xs text-red-400 mt-2"
    }, "⚠ 本月加班 ", (st.ot / 60).toFixed(1), " 小時,", st.ot > 54 * 60 ? '超過 54 小時(違規)' : '超過 46 小時'), React.createElement("p", {
      className: "text-[11px] text-gray-500 mt-2"
    }, "工時＝下班−上班−休息;提早打卡未核准、超過表定下班沒有核准加班的部分不計。")), React.createElement(Card, null, React.createElement("p", {
      className: "text-sm font-bold text-gray-300 mb-1"
    }, "當月薪資試算 ", React.createElement("span", {
      className: "text-[11px] text-gray-500 font-normal"
    }, "(未扣勞健保、勞退自提、所得稅)")), !sal.S ? React.createElement("p", {
      className: "text-sm text-gray-400 py-2"
    }, "還沒有設定月薪,請主管到「人資」設定。") : React.createElement("div", {
      className: "text-sm text-gray-200"
    }, [['月薪', money(sal.S)], [React.createElement(React.Fragment, null, "全勤獎金 ", sal.attNote && React.createElement(Chip, {
      c: sal.att ? 'y' : 'r'
    }, sal.attNote)), money(sal.att)], [React.createElement(React.Fragment, null, "加班費 ", React.createElement("span", {
      className: "text-[11px] text-gray-500"
    }, sal.ot1 ? dur(sal.ot1) + '×1.34' : '', sal.ot2 ? ' ' + dur(sal.ot2) + '×1.67' : '')), '+' + money(sal.otPay)], sal.lateMin ? [React.createElement(React.Fragment, null, "遲到扣款 ", React.createElement("span", {
      className: "text-[11px] text-gray-500"
    }, sal.lateMin, " 分")), '-' + money(sal.lateDed).replace('$', '$')] : null, sal.plDed ? ['事假扣款 ' + dayN(sal.lv.pl * 480) + ' 天', '-' + money(sal.plDed)] : null, sal.slDed ? ['病假扣款(半薪) ' + dayN(sal.lv.sl * 480) + ' 天', '-' + money(sal.slDed)] : null].filter(Boolean).map((r, i) => React.createElement("div", {
      key: i,
      className: "flex items-center justify-between py-1.5 border-b border-gray-800"
    }, React.createElement("span", null, r[0]), React.createElement("b", null, r[1]))), React.createElement("div", {
      className: "flex items-center justify-between pt-2"
    }, React.createElement("b", {
      className: "text-gray-100"
    }, "應發合計"), React.createElement("b", {
      className: "text-lg text-pink-400"
    }, money(sal.total))), React.createElement("p", {
      className: "text-[11px] text-gray-500 mt-1"
    }, "時薪＝(月薪+全勤)÷240＝", money(sal.hourly), ";每日超過 8 小時的部分算加班(前 2 小時×1.34、再 2 小時×1.67)。僅供參考,實際以公司核算為準。"))));
  }
  function SchedTab({
    S
  }) {
    const {
      D: D0,
      push
    } = S;
    const isSup = D0.me.isSup;
    const [tu, setTu] = useState(D0.me.isWork ? D0.me.uid : (D0.staff[0] || {}).uid || D0.me.uid);
    const me = tu;
    const mine = tu === D0.me.uid;
    const [month, setMonth] = useState(addM(ymd(new Date()).slice(0, 7), 1));
    const [pick, setPick] = useState('');
    const [more, setMore] = useState(false);
    const [drafts, setDrafts] = useState(() => LS.get(DK, {}));
    useEffect(() => {
      const f = () => setDrafts(LS.get(DK, {}));
      window.addEventListener('fd2draft', f);
      return () => window.removeEventListener('fd2draft', f);
    }, []);
    const dk = tu + '|' + month;
    const dr = drafts[dk];
    const saveDr = o => {
      const nx = Object.assign({}, LS.get(DK, {}));
      if (o) nx[dk] = o;else delete nx[dk];
      LS.set(DK, nx);
      setDrafts(nx);
    };
    const r0 = schedOf(D0, tu, month);
    const D = dr ? Object.assign({}, D0, {
      sched: D0.sched.filter(x => !(x.uid === tu && x.month === month)).concat([Object.assign({
        uid: tu,
        month,
        status: 'draft'
      }, r0 || {}, {
        base: dr.base,
        days: dr.days
      })])
    }) : D0;
    const flush = () => {
      if (dr) {
        push({
          act: 'sched_set',
          uid: tu,
          month,
          base: dr.base,
          days: dr.days
        });
        saveDr(null);
      }
    };
    if (!D.me.isWork && !isSup) return React.createElement(Card, null, React.createElement("p", {
      className: "text-sm text-gray-400"
    }, "排班只給本店排班人員使用。"));
    if (!D.staff.length) return React.createElement(Card, null, React.createElement("p", {
      className: "text-sm text-gray-400"
    }, "本店還沒有排班人員。"));
    const tName = (D.staff.find(x => x.uid === tu) || {}).name || '';
    const r = schedOf(D, me, month);
    const base = r && r.base;
    const days = r && r.days || {};
    const locked = r && r.status === 'approved' && !isSup;
    const n = daysIn(month);
    const law = lawCheck(D, me, month);
    const setDays = (nd, nb) => saveDr({
      base: nb || base,
      days: nd
    });
    const chooseBase = b => {
      if (locked) return;
      const nd = Object.assign({}, days);
      for (let i = 1; i <= n; i++) {
        const d = month + '-' + p2(i);
        if (!nd[d]) nd[d] = 'W';
      }
      setDays(nd, b);
      setPick('');
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
      if (!days[d] && !leaveOn(D, me, d).full) unset.push(d);
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
    }, isSup && React.createElement("div", {
      className: "flex items-center gap-2 text-sm text-gray-300"
    }, "排誰的班", React.createElement("select", {
      value: tu,
      onChange: e => {
        setTu(e.target.value);
        setPick('');
      },
      className: "flex-1 rounded-lg bg-gray-800 border border-gray-700 px-2 py-2 text-gray-100"
    }, D.staff.map(x => React.createElement("option", {
      key: x.uid,
      value: x.uid
    }, x.uid === D.me.uid ? '我自己' : x.name, x.mgr ? '(主管・' + x.mgr + ')' : '')))), React.createElement(MonthNav, {
      month: month,
      setMonth: setMonth,
      suffix: "班表"
    }), React.createElement("div", {
      className: "text-center"
    }, React.createElement(Chip, {
      c: stLbl[1]
    }, stLbl[0]), dr && React.createElement("span", {
      className: "ml-1"
    }, React.createElement(Chip, {
      c: "y"
    }, "有未儲存的變更")), isSup && !mine && React.createElement("span", {
      className: "ml-2 text-xs text-gray-400"
    }, "正在編輯 ", tName, " 的班表")), React.createElement(Card, null, React.createElement("p", {
      className: "text-sm font-bold text-gray-300 mb-2"
    }, "步驟 1\u3000", mine ? '我的班別' : tName + ' 的班別'), React.createElement("div", {
      className: "grid grid-cols-6 gap-1.5"
    }, CODES.map(c => React.createElement("button", {
      key: c,
      disabled: locked,
      onClick: () => chooseBase(c),
      className: 'rounded-xl py-2.5 font-extrabold text-sm ' + (base === c ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300')
    }, lb(c)))), React.createElement("p", {
      className: "text-xs text-gray-400 mt-1.5"
    }, base ? SH[base].n + ' ' + hhmm(SH[base].s) + '–' + hhmm(SH[base].e) : '選班別後,這個月每天會先標上該班別,再點要排休的日子改成「休」')), base && React.createElement(Card, {
      className: "!p-3"
    }, React.createElement("p", {
      className: "text-sm font-bold text-gray-300 mb-2"
    }, "步驟 2\u3000點日期排休 ", React.createElement("span", {
      className: "text-xs font-normal text-gray-400"
    }, "(休 ", Object.values(days).filter(v => v === 'O').length, " 天)")), React.createElement("div", {
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
      const lab = a.lv ? LVS[a.lv] : !v ? '未排' : v === 'O' ? '休' : a.cover ? '卡' + lb(a.cover) : lb(a.code || v);
      return React.createElement("button", {
        key: d,
        onClick: () => !locked && setPick(d),
        className: 'relative rounded-lg py-1 min-h-[44px] text-[12px] ' + (a.lv ? 'bg-sky-900/50 text-sky-300' : v === 'O' ? 'bg-pink-900/50 text-pink-300' : !v ? 'bg-gray-800/40 text-gray-500' : 'bg-gray-800 text-gray-200') + (pick === d ? ' ring-2 ring-violet-500' : '')
      }, i + 1, React.createElement("span", {
        className: 'block text-[10px] font-bold ' + (a.cover ? 'text-pink-400' : '')
      }, lab), lw && React.createElement("span", {
        className: "absolute right-1 w-2 h-2 rounded-full",
        style: {
          background: '#ef4444',
          top: 2
        }
      }), a.noCover && React.createElement("span", {
        className: "absolute right-1 w-2 h-2 rounded-full",
        style: {
          background: '#f59e0b',
          top: lw ? 12 : 2
        }
      }));
    })), pick && (() => {
      const a = myActual(D, me, pick, cache);
      return React.createElement("div", {
        className: "mt-3 rounded-xl border border-violet-600 p-3 space-y-2"
      }, React.createElement("p", {
        className: "text-sm font-bold text-gray-100"
      }, md(pick), "（", WD[dOf(pick).getDay()], "）"), a.lv && React.createElement("p", {
        className: "text-sm text-sky-300"
      }, "這天請", LV[a.lv], a.lvP ? '(待核准)' : ''), a.cover && React.createElement("p", {
        className: "text-sm text-pink-300"
      }, "同事排休,你這天改上 ", SH[a.cover].n, " ", hhmm(SH[a.cover].s), "–", hhmm(SH[a.cover].e)), (days[pick] === 'O' || a.lv) && COVER[base] && !a.noCover && React.createElement("p", {
        className: "text-sm text-gray-300"
      }, "你不上班 → 由 ", a.coveredBy || '?', " 卡你的班"), React.createElement("div", {
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
      }, "清除")), a.noCover && React.createElement("p", {
        className: "rounded-xl px-3 py-2 text-sm font-bold",
        style: {
          background: 'rgba(245,158,11,.12)',
          border: '1px solid rgba(245,158,11,.45)',
          color: '#b45309'
        }
      }, "● 這天沒有", lb(COVER[base]) || '人', "可以卡你的班"), (law[pick] || []).length > 0 ? React.createElement("div", {
        className: "rounded-xl px-3 py-2 space-y-1",
        style: {
          background: 'rgba(239,68,68,.08)',
          border: '1px solid rgba(239,68,68,.35)'
        }
      }, React.createElement("p", {
        className: "text-xs font-bold text-red-400"
      }, "這一天勞基法檢查"), (law[pick] || []).map((t, i) => React.createElement("p", {
        key: i,
        className: "text-sm text-red-400"
      }, "⚠ ", t)), (law[pick] || []).some(t => /第3[06]條 \d/.test(t)) && React.createElement("p", {
        className: "text-[11px] text-gray-400"
      }, "每週(週一~週日)的檢查結果標在週日;改這週任一天的上班/排休都會重新檢查")) : React.createElement("p", {
        className: "text-xs text-emerald-400"
      }, "✓ 這一天勞基法檢查沒有問題"), React.createElement("button", {
        onClick: () => setMore(!more),
        className: "text-xs text-violet-400 underline"
      }, "這天要上別的班？"), more && React.createElement("div", {
        className: "grid grid-cols-6 gap-1"
      }, CODES.filter(c => c !== base).map(c => React.createElement("button", {
        key: c,
        onClick: () => setDay(pick, c),
        className: "rounded-lg py-2 bg-gray-800 text-gray-200 text-xs font-bold"
      }, lb(c)))));
    })()), dr && React.createElement("div", {
      className: "sticky bottom-2 z-30 grid grid-cols-3 gap-2 rounded-2xl p-2",
      style: {
        background: 'rgba(255,255,255,.92)',
        boxShadow: '0 6px 18px rgba(0,0,0,.12)'
      }
    }, React.createElement(B, {
      cls: "col-span-2 fd-w",
      style: {
        background: '#16a34a'
      },
      onClick: flush
    }, "💾 儲存班表"), React.createElement(B, {
      cls: "bg-gray-800 text-gray-300",
      onClick: () => {
        saveDr(null);
        setPick('');
      }
    }, "放棄修改")), base && vCount > 0 && React.createElement(Card, null, React.createElement("p", {
      className: "text-sm font-bold text-red-400 mb-1"
    }, "⚠ 勞基法檢查 ", vCount, " 項"), Object.keys(law).sort().map(d => law[d].map((t, i) => React.createElement("p", {
      key: d + i,
      className: "text-[13px] text-gray-300"
    }, "● ", md(d), " ", t)))), base && vCount === 0 && React.createElement("p", {
      className: "text-xs text-emerald-400 text-center"
    }, "✓ 勞基法檢查(第 30、34、36 條)沒有問題"), base && isSup && r && r.status !== 'approved' && React.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, React.createElement(B, {
      cls: "fd-w",
      style: {
        background: '#16a34a'
      },
      disabled: !!unset.length,
      onClick: () => (flush(), push({
        act: 'sched_decide',
        uid: tu,
        month,
        ok: 1
      }))
    }, r.status === 'submitted' ? '核准' : '直接核准'), r.status === 'submitted' ? React.createElement(B, {
      cls: "bg-gray-800 text-gray-200",
      onClick: () => push({
        act: 'sched_decide',
        uid: tu,
        month,
        ok: 0
      })
    }, "退回") : React.createElement(B, {
      cls: "bg-gray-800 text-gray-200",
      disabled: !!unset.length,
      onClick: () => (flush(), push({
        act: 'sched_submit',
        uid: tu,
        month,
        viol: vCount
      }))
    }, mine ? '送出' : '代為送出')), base && isSup && r && r.status === 'approved' && React.createElement("p", {
      className: "text-xs text-gray-500 text-center"
    }, "主管修改已核准的班表,會直接生效、狀態維持已核准"), base && !locked && !isSup && React.createElement(B, {
      cls: 'w-full ' + (unset.length ? 'bg-gray-800 text-gray-400' : vCount ? 'bg-amber-500 text-gray-950' : 'bg-violet-600 text-white'),
      disabled: !!unset.length || r && r.status === 'submitted' && !dr,
      onClick: () => {
        flush();
        push({
          act: 'sched_submit',
          month,
          viol: vCount
        });
      }
    }, unset.length ? '還有 ' + unset.length + ' 天沒排,不能送出' : r && r.status === 'submitted' && !dr ? '已送出,等主管確認' : vCount ? '仍要送出（' + vCount + ' 項違規）' : '送出班表'), !isSup && r && r.status === 'submitted' && React.createElement("p", {
      className: "text-xs text-gray-500 text-center"
    }, "送出後再修改,狀態會回到未送出,需要重新送出"));
  }
  function WeekTab({
    S,
    goSet
  }) {
    const {
      D
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
    const nPend = isSup ? pendList(D).length : 0;
    const cell = (s, d) => {
      const a = plans[d].plan[s.uid] || {};
      if (a.lv) return React.createElement("span", {
        className: "inline-block rounded-md px-1 font-bold",
        style: {
          background: 'rgba(56,189,248,.18)',
          color: '#0284c7',
          opacity: a.lvP ? .6 : 1
        }
      }, LVS[a.lv]);
      if (a.off) return React.createElement("span", {
        className: "text-pink-300"
      }, "休");
      if (!a.code) return React.createElement("span", {
        className: "text-gray-600"
      }, "·");
      return React.createElement("span", {
        className: a.cover ? 'inline-block rounded-md border-2 border-pink-500 px-0.5' : ''
      }, lb(a.code), a.cover && React.createElement("b", {
        className: "block text-[9px] text-pink-400"
      }, "卡"));
    };
    return React.createElement("div", {
      className: "space-y-3"
    }, isSup && nPend > 0 && React.createElement("button", {
      onClick: goSet,
      className: "w-full rounded-2xl border border-amber-500 bg-amber-900/30 px-4 py-3 text-left text-sm font-bold text-amber-300"
    }, "📋 待審核 ", nPend, " 筆 → 主管設定"), React.createElement("div", {
      className: "flex items-center gap-2"
    }, React.createElement("button", {
      onClick: () => setWk(addD(wk, -7)),
      className: "px-3 py-2 rounded-full bg-gray-800 text-sm text-gray-300"
    }, "‹ 上週"), React.createElement("b", {
      className: "flex-1 text-center text-sm text-gray-100"
    }, md(wk), "（一）–", md(addD(wk, 6)), "（日）"), React.createElement("button", {
      onClick: () => setWk(addD(wk, 7)),
      className: "px-3 py-2 rounded-full bg-gray-800 text-sm text-gray-300"
    }, "下週 ›")), React.createElement(Card, {
      className: "!p-2 overflow-x-auto"
    }, React.createElement("table", {
      className: "w-full text-[12px] text-center"
    }, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null), days.map(d => React.createElement("th", {
      key: d,
      onClick: () => setSel(d),
      className: "py-1 cursor-pointer text-gray-400"
    }, WD[dOf(d).getDay()], React.createElement("br", null), +d.slice(8), plans[d].warns.length > 0 && React.createElement("span", {
      style: {
        color: '#f59e0b'
      }
    }, "●"))))), React.createElement("tbody", null, D.staff.map(s => {
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
      }, s.name, s.mgr && React.createElement("span", {
        className: "text-[10px] text-violet-400"
      }, "(主管)"), React.createElement("br", null), React.createElement(Chip, {
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
    }, "點日期看當天人力與打卡;黃點＝沒人可以卡班;特／事／病＝請整天假"), sel && (() => {
      const P = plans[sel] || dayPlan(D, sel);
      const by = {};
      D.staff.forEach(s => {
        const a = P.plan[s.uid] || {};
        if (a.code) (by[a.code] = by[a.code] || []).push(s.name + (a.cover ? '(卡)' : ''));
      });
      const offs = D.staff.filter(s => (P.plan[s.uid] || {}).off).map(s => s.name);
      const lvs = D.staff.filter(s => (P.plan[s.uid] || {}).lv).map(s => s.name + LV[P.plan[s.uid].lv]);
      const now = Date.now();
      const list = D.staff.filter(s => isSup || s.uid === D.me.uid);
      return React.createElement(Sheet, {
        onClose: () => setSel('')
      }, React.createElement("p", {
        className: "text-lg font-extrabold text-gray-100"
      }, md(sel), "（", WD[dOf(sel).getDay()], "）"), React.createElement("p", {
        className: "text-sm font-bold text-gray-300"
      }, "當天人力"), React.createElement("div", {
        className: "text-sm text-gray-200 leading-7"
      }, CODES.map(c => React.createElement("div", {
        key: c
      }, React.createElement("b", {
        className: "inline-block w-10"
      }, lb(c)), (by[c] || []).join('、') || React.createElement("span", {
        className: "text-gray-500"
      }, "—"))), offs.length > 0 && React.createElement("div", null, React.createElement("b", {
        className: "inline-block w-10 text-pink-300"
      }, "休"), offs.join('、')), lvs.length > 0 && React.createElement("div", null, React.createElement("b", {
        className: "inline-block w-10 text-sky-300"
      }, "請假"), lvs.join('、'))), D.staff.filter(s => (P.plan[s.uid] || {}).cover).map(s => {
        const a = P.plan[s.uid];
        return React.createElement("p", {
          key: s.uid,
          className: "text-sm text-pink-300"
        }, s.name, " 卡 ", lb(a.cover), "（", hhmm(SH[a.cover].s), "–", hhmm(SH[a.cover].e), "）");
      }), P.warns.map((w, i) => React.createElement("p", {
        key: i,
        className: "text-sm rounded-lg px-2 py-1 font-bold",
        style: {
          background: 'rgba(245,158,11,.12)',
          color: '#b45309'
        }
      }, "● ", w.who, " 不上班,沒人可以卡 ", lb(w.shift))), React.createElement("p", {
        className: "text-sm font-bold text-gray-300 pt-1"
      }, "當天上／下班打卡", !isSup && '(只看得到自己的)'), list.map(s => {
        const x = dayCalc(D, s.uid, sel, now);
        const a = P.plan[s.uid] || {};
        let st = null;
        if (a.lv && !x.inP) st = React.createElement(Chip, {
          c: "b"
        }, "請假不用打卡");else if (a.off && !x.inP) st = React.createElement(Chip, {
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
        }, s.name, " ", a.code ? lb(a.code) : ''), React.createElement("span", {
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
  function ApplyTab({
    S,
    pre,
    clearPre
  }) {
    const {
      D,
      push
    } = S;
    const me = D.me.uid;
    const today = ymd(new Date());
    const [k, setK] = useState(pre && pre.lv ? 'lv' : 'ot');
    const [ot, setOt] = useState(() => Object.assign({
      date: today,
      start: '',
      end: '',
      reason: '客人延後',
      note: ''
    }, pre && !pre.lv ? Object.assign({
      reason: '客人延後'
    }, pre) : {}));
    const [lv, setLv] = useState({
      type: 'al',
      d1: today,
      d2: today,
      mode: 'd',
      h1: '10',
      h2: '12',
      reason: ''
    });
    const [msg, setMsg] = useState('');
    useEffect(() => {
      if (pre) clearPre();
    }, []);
    if (!D.me.isWork) return React.createElement(Card, null, React.createElement("p", {
      className: "text-sm text-gray-400"
    }, "申請只給本店排班人員使用。主管請到「主管設定」審核。"));
    const toM = t => {
      const m = /^(\d{1,2}):(\d{2})$/.exec(t || '');
      return m ? +m[1] * 60 + +m[2] : null;
    };
    const s0 = toM(ot.start),
      e0 = toM(ot.end);
    let min = s0 !== null && e0 !== null ? e0 - s0 : 0;
    if (s0 !== null && e0 !== null && min <= 0) min += 1440;
    const sal = +hrOf(D, me).salary || 0;
    const hourly = (sal + (+D.cfg.fullAtt || 0)) / 240;
    const est = hourly * (Math.min(120, min) / 60 * 1.34 + Math.max(0, min - 120) / 60 * 1.67);
    const sendOt = () => {
      push({
        act: 'req_add',
        id: uidGen(),
        type: 'ot',
        date: ot.date,
        start: ot.start,
        end: ot.end,
        min: min,
        reason: ot.reason,
        note: ot.note
      });
      setOt(Object.assign({}, ot, {
        start: '',
        end: '',
        note: ''
      }));
      setMsg('已送出加班申請,等主管核准');
    };
    const unit = D.cfg.unit[lv.type] || 'd';
    const hourMode = unit === 'h' && lv.mode === 'h';
    const lvDays = hourMode ? 0 : lv.d2 >= lv.d1 ? leaveWorkDays(D, me, lv.d1, lv.d2) : 0;
    const lvMin = hourMode ? Math.max(0, +lv.h2 - +lv.h1) * 60 : lvDays * 480;
    const left = leftOf(D, me, lv.type, lv.d1);
    const over = left !== null && lvMin / 480 > left + 1e-9;
    const noAl = lv.type === 'al' && left === null;
    const sendLv = () => {
      push({
        act: 'req_add',
        id: uidGen(),
        type: lv.type,
        date: lv.d1,
        date2: hourMode ? lv.d1 : lv.d2,
        start: hourMode ? p2(lv.h1) + ':00' : '',
        end: hourMode ? p2(lv.h2) + ':00' : '',
        min: lvMin,
        reason: lv.reason
      });
      setLv(Object.assign({}, lv, {
        reason: ''
      }));
      setMsg('已送出' + LV[lv.type] + '申請,等主管核准');
    };
    const mine = D.reqs.filter(r => r.uid === me && (k === 'ot' ? r.type === 'ot' : LV[r.type])).sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start)).slice(0, 20);
    return React.createElement("div", {
      className: "space-y-3"
    }, React.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, [['ot', '加班申請'], ['lv', '請假申請']].map(([v, l]) => React.createElement("button", {
      key: v,
      onClick: () => {
        setK(v);
        setMsg('');
      },
      className: 'rounded-xl py-2.5 font-bold ' + (k === v ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300')
    }, l))), k === 'ot' && React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-sm font-bold text-gray-300"
    }, "加班申請"), React.createElement("label", {
      className: "block text-xs text-gray-400"
    }, "日期", React.createElement(Inp, {
      type: "date",
      value: ot.date,
      onChange: e => setOt(Object.assign({}, ot, {
        date: e.target.value
      }))
    })), React.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, React.createElement("label", {
      className: "text-xs text-gray-400"
    }, "開始", React.createElement(Inp, {
      type: "time",
      value: ot.start,
      onChange: e => setOt(Object.assign({}, ot, {
        start: e.target.value
      }))
    })), React.createElement("label", {
      className: "text-xs text-gray-400"
    }, "結束", React.createElement(Inp, {
      type: "time",
      value: ot.end,
      onChange: e => setOt(Object.assign({}, ot, {
        end: e.target.value
      }))
    }))), React.createElement(Seg, {
      small: true,
      opts: OTR.map(r => [r, r]),
      val: ot.reason,
      on: v => setOt(Object.assign({}, ot, {
        reason: v
      }))
    }), React.createElement(Inp, {
      placeholder: "說明(選填)",
      value: ot.note,
      onChange: e => setOt(Object.assign({}, ot, {
        note: e.target.value
      }))
    }), min > 0 && React.createElement("p", {
      className: 'rounded-xl px-3 py-2 text-sm ' + (min > 240 ? 'bg-red-950/40 text-red-300' : 'bg-gray-800 text-gray-200')
    }, min, " 分鐘・", min <= 120 ? '前 2 小時 ×1.34' : '前 2 小時 ×1.34、之後 ×1.67', sal ? '・約 ' + money(est) : '', min > 240 ? '・超過 4 小時不能送出' : ''), React.createElement(B, {
      cls: "w-full bg-violet-600 text-white",
      disabled: !ot.date || min <= 0 || min > 240,
      onClick: sendOt
    }, "送出加班申請")), k === 'lv' && React.createElement(Card, {
      className: "space-y-2"
    }, React.createElement("p", {
      className: "text-sm font-bold text-gray-300"
    }, "請假申請"), React.createElement("div", {
      className: "grid grid-cols-3 gap-2"
    }, LVK.map(t => {
      const l = leftOf(D, me, t, lv.d1);
      return React.createElement("button", {
        key: t,
        onClick: () => setLv(Object.assign({}, lv, {
          type: t,
          mode: 'd'
        })),
        className: 'rounded-xl py-2 text-sm font-bold ' + (lv.type === t ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300')
      }, LV[t], React.createElement("span", {
        className: "block text-[11px] font-normal"
      }, l === null ? '未設到職日' : '剩 ' + dayN(l * 480) + ' 天'));
    })), unit === 'h' && React.createElement(Seg, {
      opts: [['d', '整天'], ['h', '指定時段']],
      val: lv.mode,
      on: v => setLv(Object.assign({}, lv, {
        mode: v
      }))
    }), !hourMode ? React.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, React.createElement("label", {
      className: "text-xs text-gray-400"
    }, "開始日期", React.createElement(Inp, {
      type: "date",
      value: lv.d1,
      onChange: e => setLv(Object.assign({}, lv, {
        d1: e.target.value,
        d2: e.target.value > lv.d2 ? e.target.value : lv.d2
      }))
    })), React.createElement("label", {
      className: "text-xs text-gray-400"
    }, "結束日期", React.createElement(Inp, {
      type: "date",
      value: lv.d2,
      onChange: e => setLv(Object.assign({}, lv, {
        d2: e.target.value
      }))
    }))) : React.createElement("div", {
      className: "space-y-2"
    }, React.createElement("label", {
      className: "block text-xs text-gray-400"
    }, "日期", React.createElement(Inp, {
      type: "date",
      value: lv.d1,
      onChange: e => setLv(Object.assign({}, lv, {
        d1: e.target.value,
        d2: e.target.value
      }))
    })), React.createElement("div", {
      className: "flex items-center gap-2 text-sm text-gray-300"
    }, React.createElement("select", {
      value: lv.h1,
      onChange: e => setLv(Object.assign({}, lv, {
        h1: e.target.value
      })),
      className: "flex-1 rounded-xl bg-gray-800 border border-gray-700 px-2 py-2.5 text-gray-100"
    }, Array.from({
      length: 24
    }).map((_, h) => React.createElement("option", {
      key: h,
      value: h
    }, p2(h), ":00"))), "到", React.createElement("select", {
      value: lv.h2,
      onChange: e => setLv(Object.assign({}, lv, {
        h2: e.target.value
      })),
      className: "flex-1 rounded-xl bg-gray-800 border border-gray-700 px-2 py-2.5 text-gray-100"
    }, Array.from({
      length: 24
    }).map((_, h) => React.createElement("option", {
      key: h,
      value: h + 1
    }, p2(h + 1), ":00"))))), React.createElement(Inp, {
      placeholder: "原因",
      value: lv.reason,
      onChange: e => setLv(Object.assign({}, lv, {
        reason: e.target.value
      }))
    }), React.createElement("p", {
      className: 'rounded-xl px-3 py-2 text-sm ' + (over || noAl || hourMode && (lvMin <= 0 || lvMin > 480) ? 'bg-red-950/40 text-red-300' : 'bg-gray-800 text-gray-200')
    }, hourMode ? (lvMin > 0 ? lvMin / 60 + ' 小時(' + dayN(lvMin) + ' 天)' : '結束要晚於開始') + (lvMin > 480 ? '・最多 8 小時' : '') : lvDays + ' 天(排休日不算)', noAl ? '・還沒有到職日,不能請特休' : over ? '・超過剩餘天數,不能送出' : '', lv.type === 'pl' ? '・事假不給工資' : lv.type === 'sl' ? '・病假工資折半' + (lvMin > 3 * 480 ? ',超過 3 天主管可要求證明' : '') : '・特休工資照給'), !hourMode && (() => {
      const bad = [];
      for (let d = lv.d1; d <= lv.d2 && bad.length < 5; d = addD(d, 1)) {
        const c = planned(D, me, d);
        if (COVER[c]) {
          const P = dayPlan(D, d);
          const has = D.staff.some(s => s.uid !== me && (P.plan[s.uid] || {}).code === COVER[c]);
          if (!has) bad.push(md(d));
        }
      }
      return bad.length ? React.createElement("p", {
        className: "text-xs text-red-400"
      }, "⚠ ", bad.join('、'), " 沒有", lb(COVER[planned(D, me, lv.d1)] || '') || '人', "可以卡你的班") : null;
    })(), React.createElement(B, {
      cls: "w-full bg-violet-600 text-white",
      disabled: !lvMin || over || noAl || hourMode && lvMin > 480 || !hourMode && lv.d2 < lv.d1,
      onClick: sendLv
    }, "送出", LV[lv.type], "申請")), msg && React.createElement("p", {
      className: "text-sm text-emerald-400 text-center"
    }, msg), React.createElement(Card, null, React.createElement("p", {
      className: "text-sm font-bold text-gray-300 mb-1"
    }, "我的", k === 'ot' ? '加班' : '請假', "申請"), !mine.length && React.createElement("p", {
      className: "text-sm text-gray-500"
    }, "還沒有申請"), mine.map(r => React.createElement("div", {
      key: r.id,
      className: "flex items-center gap-2 py-1.5 border-b border-gray-800 text-sm"
    }, React.createElement("span", {
      className: "flex-1 text-gray-200"
    }, k === 'ot' ? md(r.date) + ' ' + r.start + '–' + r.end + ' ' + r.reason : LV[r.type] + ' ' + md(r.date) + (r.date2 && r.date2 !== r.date ? '~' + md(r.date2) : '') + ' ' + (r.start ? r.start + '–' + r.end : dayN(r.min) + ' 天')), React.createElement(Chip, {
      c: STX[r.status][1]
    }, STX[r.status][0], r._p ? '・待送出' : ''), r.status === 'pending' && React.createElement("button", {
      onClick: () => push({
        act: 'req_cancel',
        id: r.id
      }),
      className: "text-xs text-red-400 underline"
    }, "取消")))), k === 'lv' && React.createElement(Card, null, React.createElement("p", {
      className: "text-sm font-bold text-gray-300 mb-2"
    }, "剩餘假別"), React.createElement("div", {
      className: "grid grid-cols-3 text-center text-xs text-gray-400"
    }, LVK.map(t => {
      const l = leftOf(D, me, t, today);
      return React.createElement("div", {
        key: t
      }, LV[t], React.createElement("br", null), React.createElement("b", {
        className: "text-lg text-gray-100"
      }, l === null ? '—' : dayN(l * 480) + ' 天'));
    })), React.createElement("p", {
      className: "text-[11px] text-gray-500 mt-2"
    }, "特休依到職日(週年制);事假一年 14 天、病假一年 30 天(未住院)。待核准的也先扣。")));
  }
  const HRF = [['nick', '自訂名稱', 'text'], ['name', '姓名', 'text'], ['phone', '手機', 'tel'], ['birth', '生日', 'date'], ['emName', '緊急聯絡人', 'text'], ['emPhone', '聯絡電話', 'tel'], ['hire', '到職日', 'date'], ['salary', '月薪(不含全勤)', 'number']];
  function HrTab({
    S,
    uid,
    goSet
  }) {
    const {
      D,
      push
    } = S;
    const isSup = D.me.isSup;
    const h = hrOf(D, uid);
    const [ed, setEd] = useState(null);
    const today = ymd(new Date());
    const st = D.staff.find(s => s.uid === uid) || {};
    const al = alInfo(D, uid, today);
    if (!D.me.isWork && uid === D.me.uid) return React.createElement("div", {
      className: "space-y-3"
    }, React.createElement(Card, null, React.createElement("p", {
      className: "text-sm text-gray-400"
    }, "請在上方選擇人員查看與修改人資資料。")), isSup && React.createElement(B, {
      cls: "w-full bg-gray-800 text-pink-300 border border-pink-500",
      onClick: goSet
    }, "⚙ 主管設定"));
    const val = k => k === 'nick' ? h.nick || '未設定(用 ' + ((D.staff.find(x => x.uid === uid) || {}).name || '登記名稱') + ')' : k === 'salary' ? h.salary ? money(h.salary) : '未設定' : h[k] || '未填';
    const canEdit = k => k === 'salary' ? isSup : true;
    const noHire = uid === D.me.uid && !h.hire && !h.hirePend;
    return React.createElement("div", {
      className: "space-y-3"
    }, noHire && React.createElement("div", {
      className: "rounded-2xl px-4 py-3 text-sm",
      style: {
        background: 'rgba(245,158,11,.14)',
        border: '1px solid rgba(245,158,11,.5)',
        color: '#92400e'
      }
    }, React.createElement("b", null, "👋 請先填寫到職日"), React.createElement("br", null), "特休天數、薪資試算都要用到。點下方「到職日」填寫,主管確認後生效;也可以順便設定「自訂名稱」。", React.createElement("button", {
      className: "block mt-2 rounded-xl px-3 py-2 font-bold fd-w",
      style: {
        background: '#d97706'
      },
      onClick: () => setEd({
        k: 'hire',
        l: '到職日',
        t: 'date',
        v: ''
      })
    }, "填寫到職日")), React.createElement(Card, null, React.createElement("p", {
      className: "text-sm font-bold text-gray-300 mb-1"
    }, "基本資料"), HRF.map(([k, l, t]) => React.createElement("button", {
      key: k,
      disabled: !canEdit(k),
      onClick: () => setEd({
        k,
        l,
        t,
        v: k === 'salary' ? String(h.salary || '') : k === 'hire' && h.hirePend ? h.hirePend : h[k] || ''
      }),
      className: "w-full flex items-center justify-between py-2.5 border-b border-gray-800 text-sm text-left"
    }, React.createElement("span", {
      className: "text-gray-400"
    }, l), React.createElement("span", {
      className: "text-gray-100 font-bold"
    }, val(k), k === 'hire' && h.hirePend && React.createElement("span", {
      className: "ml-1"
    }, React.createElement(Chip, {
      c: "y"
    }, "改為 ", h.hirePend, "・待主管確認")), " ", canEdit(k) ? React.createElement("span", {
      className: "text-gray-500"
    }, "✎") : React.createElement("span", null, "🔒")))), React.createElement("div", {
      className: "flex items-center justify-between py-2.5 text-sm"
    }, React.createElement("span", {
      className: "text-gray-400"
    }, "櫃台代號／LINE"), React.createElement("span", {
      className: "text-gray-300"
    }, st.code || '—', "・已綁定")), h._p && React.createElement("p", {
      className: "text-xs text-amber-300"
    }, "修改待送出"), !isSup && React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, "到職日修改要主管確認才生效;月薪只有主管可以修改。")), React.createElement(Card, null, React.createElement("p", {
      className: "text-sm font-bold text-gray-300 mb-1"
    }, "特休假(週年制・第 38 條)"), !al ? React.createElement("p", {
      className: "text-sm text-gray-400"
    }, "還沒有到職日,無法計算特休。") : React.createElement(React.Fragment, null, React.createElement("div", {
      className: "flex items-end justify-between"
    }, React.createElement("div", null, React.createElement("b", {
      className: "text-2xl text-gray-100"
    }, "本期 ", al.days, " 天"), React.createElement("p", {
      className: "text-xs text-gray-400"
    }, "年資 ", al.sen)), React.createElement("div", {
      className: "text-right text-sm text-gray-400"
    }, "已用 ", dayN(al.used * 480), " 天", React.createElement("br", null), React.createElement("b", {
      className: "text-xl text-pink-400"
    }, "剩 ", dayN(al.left * 480), " 天"))), React.createElement("div", {
      className: "h-2 rounded-full mt-2 overflow-hidden",
      style: {
        background: 'rgba(148,163,184,.3)'
      }
    }, React.createElement("div", {
      className: "h-full",
      style: {
        width: (al.days ? Math.min(100, al.used / al.days * 100) : 0) + '%',
        background: '#ec4899'
      }
    })), React.createElement("p", {
      className: "text-xs text-gray-500 mt-1"
    }, al.from ? '本期 ' + al.from.replace(/-/g, '/') + ' – ' + al.to.replace(/-/g, '/') : '到職滿 6 個月才有特休', React.createElement("br", null), "下次增加:", al.next.replace(/-/g, '/'), " → ", al.nextDays, " 天"), React.createElement("p", {
      className: "text-[11px] text-gray-500 mt-1"
    }, "本期未休完:期滿依法折算工資,或經雙方同意遞延。")), React.createElement("div", {
      className: "grid grid-cols-2 text-center text-xs text-gray-400 mt-3"
    }, React.createElement("div", null, "事假(今年剩)", React.createElement("br", null), React.createElement("b", {
      className: "text-base text-gray-100"
    }, dayN(leftOf(D, uid, 'pl', today) * 480), " 天")), React.createElement("div", null, "病假(今年剩)", React.createElement("br", null), React.createElement("b", {
      className: "text-base text-gray-100"
    }, dayN(leftOf(D, uid, 'sl', today) * 480), " 天")))), isSup && React.createElement(B, {
      cls: "w-full bg-gray-800 text-pink-300 border border-pink-500",
      onClick: goSet
    }, "⚙ 主管設定"), ed && React.createElement(Sheet, {
      onClose: () => setEd(null)
    }, React.createElement("p", {
      className: "text-lg font-extrabold text-gray-100"
    }, "修改", ed.l), React.createElement(Inp, {
      type: ed.t,
      inputMode: ed.t === 'number' ? 'numeric' : undefined,
      value: ed.v,
      onChange: e => setEd(Object.assign({}, ed, {
        v: e.target.value
      })),
      autoFocus: true
    }), ed.k === 'hire' && !isSup && React.createElement("p", {
      className: "text-xs text-amber-300"
    }, "到職日修改要主管確認後才生效"), ed.k === 'nick' && React.createElement("p", {
      className: "text-xs text-gray-400"
    }, "櫃台人員頁(全班表、排班、審核、推播)顯示的名稱,最多 12 個字;空白＝用員工專區登記的名稱"), React.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, React.createElement(B, {
      cls: "bg-gray-800 text-gray-200",
      onClick: () => setEd(null)
    }, "取消"), React.createElement(B, {
      onClick: () => {
        const f = {};
        f[ed.k] = ed.k === 'salary' ? parseInt(ed.v, 10) || 0 : ed.v.trim();
        push({
          act: 'hr_set',
          uid,
          f
        });
        setEd(null);
      }
    }, "儲存"))));
  }
  function pendList(D) {
    const L = [];
    D.sched.filter(r => r.status === 'submitted').forEach(r => L.push({
      k: 's' + r.uid + r.month,
      txt: nameOf(D, r.uid) + ' ' + +r.month.slice(5) + ' 月班表',
      tag: r.viol > 0 ? '違規 ' + r.viol : '',
      yes: {
        act: 'sched_decide',
        uid: r.uid,
        month: r.month,
        ok: 1
      },
      no: {
        act: 'sched_decide',
        uid: r.uid,
        month: r.month,
        ok: 0
      }
    }));
    D.reqs.filter(r => r.status === 'pending').forEach(r => L.push({
      k: r.id,
      txt: nameOf(D, r.uid) + ' ' + (r.type === 'ot' ? '加班 ' + md(r.date) + ' ' + r.start + '–' + r.end + ' ' + r.min + ' 分' : LV[r.type] + ' ' + md(r.date) + (r.date2 && r.date2 !== r.date ? '~' + md(r.date2) : '') + ' ' + (r.start ? r.start + '–' + r.end : dayN(r.min) + ' 天')),
      tag: r.reason,
      yes: {
        act: 'req_decide',
        id: r.id,
        ok: 1
      },
      no: {
        act: 'req_decide',
        id: r.id,
        ok: 0
      }
    }));
    D.hr.filter(h => h.hirePend).forEach(h => L.push({
      k: 'h' + h.uid,
      txt: nameOf(D, h.uid) + ' 到職日 → ' + h.hirePend.replace(/-/g, '/'),
      tag: '',
      yes: {
        act: 'hr_hire_decide',
        uid: h.uid,
        ok: 1
      },
      no: {
        act: 'hr_hire_decide',
        uid: h.uid,
        ok: 0
      }
    }));
    return L;
  }
  function alertsOf(D, now) {
    const A = [];
    const add = (s, date, kind, text, sup) => A.push({
      uid: s.uid,
      name: s.name,
      date,
      kind,
      text,
      sup: sup ? 1 : 0
    });
    D.staff.forEach(s => {
      const date = curDate(D, s.uid, now);
      const x = dayCalc(D, s.uid, date, now);
      if (!x.inP) return;
      if (x.outP) {
        if (x.rest < 60 && now - x.outP.ts < 12 * 3600000) add(s, date, 'restShort', '今天休息只有 ' + Math.round(x.rest) + ' 分鐘,未滿 1 小時', 1);
        return;
      }
      if (x.onBreak) {
        if (x.rest > 120) add(s, date, 'rest120', '休息已超過 2 小時(' + Math.round(x.rest) + ' 分),請結束休息', 1);else if (x.rest >= 60) add(s, date, 'rest60', '休息已滿 1 小時,記得按「結束休息」', 0);
      } else {
        if (x.cont >= 240) add(s, date, 'cont4', '已連續工作 ' + dur(x.cont) + ' 沒休息(第 35 條:4 小時至少休息 30 分)', 1);else if (x.cont >= 210) add(s, date, 'cont35', '已連續工作 ' + dur(x.cont) + ',請安排休息', 0);
      }
      if (x.sE && now >= x.sE) add(s, date, 'endDue', '已到表定下班 ' + hm(x.sE) + ',還沒打下班卡', 0);
      if (now > x.latest) add(s, date, 'overLatest', '已超過最晚下班 ' + hm(x.latest) + ',請立即下班打卡(記錄違規)', 1);else if (now >= x.latest - 30 * 60000) add(s, date, 'late30', '離最晚下班 ' + hm(x.latest) + ' 剩 ' + Math.ceil((x.latest - now) / 60000) + ' 分鐘', 1);
    });
    return A;
  }
  function loadXlsx() {
    return new Promise((res, rej) => {
      if (window.XLSX) return res(window.XLSX);
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload = () => res(window.XLSX);
      s.onerror = () => rej(new Error('Excel 元件下載失敗,請連上網路再試'));
      document.head.appendChild(s);
    });
  }
  async function exportXlsx(D, month) {
    const X = await loadXlsx();
    const now = Date.now();
    const wb = X.utils.book_new();
    const r1 = [['人員', '日期', '星期', '班別', '上班', '下班', '休息(分)', '工時', '遲到(分)', '註記']];
    const r2 = [['人員', '月薪', '全勤獎金', '全勤說明', '加班(分)', '加班費', '遲到(分)', '遲到扣款', '事假(天)', '事假扣款', '病假(天)', '病假扣款', '特休(天)', '應發合計']];
    const r3 = [['人員', '類型', '日期', '結束日期', '開始', '結束', '分鐘', '原因', '狀態']];
    D.staff.forEach(s => {
      const rows = monthRows(D, s.uid, month, now);
      rows.forEach(({
        d,
        x
      }) => {
        const n = [];
        if (x.lvFull) n.push(LV[x.lvFull.type] + '(整天)');
        x.lvPart.forEach(r => n.push(LV[r.type] + ' ' + r.start + '-' + r.end));
        if (x.a.off && !x.inP) n.push('排休');
        if (x.a.cover) n.push('卡' + lb(x.a.cover));
        if (x.earlyReq) n.push('提早加班' + x.earlyReq.min + '分 ' + STX[x.earlyReq.status][0]);
        r1.push([s.name, d, WD[dOf(d).getDay()], x.code ? lb(x.code) : '', x.inP ? hm(x.inP.ts) : '', x.outP ? hm(x.outP.ts) : '', x.inP ? Math.round(x.rest) : '', x.inP ? +(x.work / 60).toFixed(2) : '', x.late || '', n.join('、')]);
      });
      const c = salCalc(D, s.uid, month, now, rows);
      r2.push([s.name, c.S, Math.round(c.att), c.attNote, c.ot1 + c.ot2, Math.round(c.otPay), c.lateMin, Math.round(c.lateDed), +c.lv.pl.toFixed(2), Math.round(c.plDed), +c.lv.sl.toFixed(2), Math.round(c.slDed), +c.lv.al.toFixed(2), Math.round(c.total)]);
    });
    D.reqs.filter(r => r.date.slice(0, 7) === month || (r.date2 || '').slice(0, 7) === month).forEach(r => r3.push([nameOf(D, r.uid), r.type === 'ot' ? '加班' : LV[r.type], r.date, r.date2 || '', r.start, r.end, r.min, r.reason, STX[r.status] ? STX[r.status][0] : r.status]));
    X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(r1), '打卡紀錄');
    X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(r2), '薪資試算');
    X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(r3), '申請');
    X.writeFile(wb, '櫃台_' + D.me.store + '_' + month + '.xlsx');
  }
  const fdEntryUrl = () => 'https://liff.line.me/' + (window.__S2_LIFF_ID || '2010673151-kemVP4Pi') + '/?fd2=p';
  const FD_SHARE_ROWS = [['⏱', '打卡', '上班、休息、下班一鍵打卡,沒網路也能先打,連上後自動送出'], ['📅', '排班', '選班別、點日期排休,自動提示卡班與勞基法檢查'], ['📝', '請假／特休／加班 申請', '線上送出,主管審核後 LINE 通知結果'], ['🗂', '人員基本資料', '聯絡資料、到職日、特休天數與剩餘假別']];
  function fdShareFlex(store) {
    const base = fdEntryUrl();
    const row = (ic, t, d) => ({
      type: 'box',
      layout: 'horizontal',
      spacing: 'md',
      contents: [{
        type: 'text',
        text: ic,
        size: 'lg',
        flex: 0
      }, {
        type: 'box',
        layout: 'vertical',
        contents: [{
          type: 'text',
          text: t,
          weight: 'bold',
          size: 'sm',
          color: '#4A2337'
        }, {
          type: 'text',
          text: d,
          size: 'xs',
          color: '#8A5A70',
          wrap: true
        }]
      }]
    });
    return {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '18px',
        paddingTop: '30px',
        paddingBottom: '26px',
        alignItems: 'center',
        background: {
          type: 'linearGradient',
          angle: '135deg',
          startColor: '#F472B6',
          endColor: '#FBCFE8'
        },
        contents: [{
          type: 'text',
          text: '🕒',
          size: '4xl',
          align: 'center'
        }, {
          type: 'text',
          text: '櫃台人員頁',
          weight: 'bold',
          size: 'xl',
          color: '#FFFFFF',
          align: 'center',
          margin: 'md'
        }, {
          type: 'text',
          text: store || '',
          size: 'sm',
          color: '#FFFFFF',
          align: 'center',
          margin: 'xs'
        }]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        paddingAll: '16px',
        contents: FD_SHARE_ROWS.map(r => row(r[0], r[1], r[2]))
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '14px',
        contents: [{
          type: 'button',
          style: 'primary',
          color: '#E0528F',
          height: 'sm',
          action: {
            type: 'uri',
            label: '進入櫃台人員頁',
            uri: base
          }
        }, {
          type: 'text',
          text: '需先在員工專區登記為櫃台並通過審核',
          size: 'xxs',
          color: '#999999',
          align: 'center',
          wrap: true
        }]
      }
    };
  }
  function ShareCard({
    store,
    staff
  }) {
    const [res, setRes] = useState('');
    const [ask, setAsk] = useState(false);
    const [busy, setBusy] = useState(false);
    const cnt = (staff || []).filter(x => !x.mgr).length;
    const pushAll = async () => {
      setAsk(false);
      setBusy(true);
      setRes('');
      const r = await api('fd2SharePush', {
        flex: JSON.stringify(fdShareFlex(store)),
        alt: '🕒 櫃台人員頁:打卡、排班、請假都在這裡'
      });
      setBusy(false);
      if (r && r.ok) setRes('已推播給 ' + r.sent + ' / ' + r.total + ' 位櫃台人員' + (r.fail && r.fail.length ? '。沒送到:' + r.fail.join('、') + '(可能沒加官方帳號好友)' : ''));else setRes(r && (r._net || !navigator.onLine) ? '目前離線,推播需要網路' : r && r.error || '推播失敗');
    };
    const go = async () => {
      setRes('');
      try {
        if (!window.liff || !liff.isApiAvailable || !liff.isApiAvailable('shareTargetPicker')) {
          setRes('這裡不能分享,請在 LINE 裡開啟櫃台人員頁再按');
          return;
        }
        const r = await liff.shareTargetPicker([{
          type: 'flex',
          altText: '🕒 櫃台人員頁:打卡、排班、請假都在這裡',
          contents: fdShareFlex(store)
        }]);
        setRes(r && r.status === 'success' ? '已分享 ✅ 卡片會出現在你和對方(或群組)的聊天室,由你的帳號送出' : r ? '分享結果:' + JSON.stringify(r) : '已取消');
      } catch (e) {
        setRes('分享失敗:' + String(e && e.message || e));
      }
    };
    return React.createElement(Card, null, React.createElement("b", {
      className: "text-sm text-gray-300"
    }, "分享／推播 櫃台人員頁"), React.createElement("p", {
      className: "text-xs text-gray-400 mb-2"
    }, "傳一張卡片給櫃台人員,點按鈕就能進櫃台人員頁(網址藏在按鈕裡)。"), React.createElement("div", {
      className: "mx-auto rounded-2xl overflow-hidden border border-gray-700 bg-white",
      style: {
        maxWidth: 260
      }
    }, React.createElement("div", {
      className: "text-center py-4",
      style: {
        background: 'linear-gradient(135deg,#F472B6,#FBCFE8)'
      }
    }, React.createElement("div", {
      className: "text-3xl"
    }, "🕒"), React.createElement("b", {
      className: "block text-lg",
      style: {
        color: '#fff'
      }
    }, "櫃台人員頁"), React.createElement("span", {
      className: "text-xs",
      style: {
        color: '#fff'
      }
    }, store)), React.createElement("div", {
      className: "px-3 py-2 space-y-1 text-left text-xs",
      style: {
        color: '#4A2337'
      }
    }, FD_SHARE_ROWS.map(([i, t, d]) => React.createElement("div", {
      key: t,
      className: "flex gap-2 py-0.5"
    }, React.createElement("span", null, i), React.createElement("span", null, React.createElement("b", null, t), React.createElement("br", null), React.createElement("span", {
      style: {
        color: '#8A5A70'
      }
    }, d))))), React.createElement("div", {
      className: "px-3 pb-3"
    }, React.createElement("div", {
      className: "rounded-lg py-1.5 text-center text-xs font-bold",
      style: {
        background: '#E0528F',
        color: '#fff'
      }
    }, "進入櫃台人員頁"))), React.createElement("div", {
      className: "grid grid-cols-2 gap-2 mt-3"
    }, React.createElement(B, {
      cls: "bg-violet-600 text-white",
      onClick: go
    }, "📤 分享給好友"), React.createElement(B, {
      cls: "fd-w",
      style: {
        background: '#be185d'
      },
      disabled: busy || !cnt,
      onClick: () => setAsk(true)
    }, busy ? React.createElement(Spinner, null) : '📣 推播給櫃台人員')), ask && React.createElement(Sheet, {
      onClose: () => setAsk(false)
    }, React.createElement("p", {
      className: "text-lg font-extrabold text-gray-100"
    }, "推播給本店櫃台人員？"), React.createElement("p", {
      className: "text-sm text-gray-300"
    }, "由官方帳號把這張卡片推播給 ", store, " 的 ", cnt, " 位櫃台人員(不含主管)。"), React.createElement("div", {
      className: "grid grid-cols-2 gap-2"
    }, React.createElement(B, {
      cls: "bg-gray-800 text-gray-200",
      onClick: () => setAsk(false)
    }, "取消"), React.createElement(B, {
      cls: "fd-w",
      style: {
        background: '#be185d'
      },
      onClick: pushAll
    }, "推播"))), res && React.createElement("p", {
      className: "text-sm text-amber-300 mt-1 text-center"
    }, res), React.createElement("p", {
      className: "text-[11px] text-gray-500 mt-2 break-all"
    }, "進入網址(Rich Menu 也可用):", fdEntryUrl(), " ", React.createElement("button", {
      className: "underline text-violet-400",
      onClick: async () => {
        const ok = await C.copyText(fdEntryUrl());
        setRes(ok ? '已複製網址' : '複製失敗');
      }
    }, "複製")));
  }
  function SetPage({
    S,
    back,
    openHr
  }) {
    const {
      D,
      push
    } = S;
    const c = D.cfg;
    const now = Date.now();
    const today = ymd(new Date(now));
    const [al, setAl] = useState(null);
    const [busy, setBusy] = useState('');
    const [msg, setMsg] = useState('');
    const [ex, setEx] = useState(today.slice(0, 7));
    const [fa, setFa] = useState(String(c.fullAtt));
    const [gr, setGr] = useState(String(c.grace));
    const [rad, setRad] = useState(String(c.radius || 150));
    const P = pendList(D);
    const inLine = (() => {
      try {
        return !!(window.liff && liff.isInClient && liff.isInClient());
      } catch (_e) {
        return false;
      }
    })();
    return React.createElement("div", {
      className: "space-y-3"
    }, React.createElement("button", {
      onClick: back,
      className: "text-sm text-violet-400"
    }, "‹ 返回"), React.createElement("p", {
      className: "text-lg font-extrabold text-gray-100"
    }, "⚙ 主管設定（", D.me.store, "）"), React.createElement(Card, null, React.createElement("div", {
      className: "flex items-center mb-1"
    }, React.createElement("b", {
      className: "flex-1 text-sm text-gray-300"
    }, "待審核"), P.length > 0 && React.createElement(Chip, {
      c: "r"
    }, P.length)), !P.length && React.createElement("p", {
      className: "text-sm text-gray-500"
    }, "沒有待審核的項目"), P.map(x => React.createElement("div", {
      key: x.k,
      className: "flex items-center gap-2 py-1.5 border-b border-gray-800 text-sm"
    }, React.createElement("span", {
      className: "flex-1 text-gray-200"
    }, x.txt, " ", x.tag && React.createElement(Chip, {
      c: /違規/.test(x.tag) ? 'r' : 'x'
    }, x.tag)), React.createElement("button", {
      onClick: () => push(x.yes),
      style: {
        background: '#16a34a'
      },
      className: "fd-w px-3 py-1.5 rounded-lg text-xs font-bold"
    }, "核准"), React.createElement("button", {
      onClick: () => push(x.no),
      className: "px-3 py-1.5 rounded-lg bg-gray-700 text-gray-200 text-xs font-bold"
    }, "退回"))), React.createElement("p", {
      className: "text-[11px] text-gray-500 mt-1"
    }, "結果會推播給申請人")), React.createElement(Card, null, React.createElement("b", {
      className: "text-sm text-gray-300"
    }, "檢查打卡"), React.createElement("p", {
      className: "text-xs text-gray-400 mb-2"
    }, "按下才檢查目前上班中的人(休息過久、連續工作沒休息、到表定下班、接近或超過最晚下班、下班時休息不足),確認後推播給本人／主管。同一件事不會重複推播。"), React.createElement(B, {
      cls: "w-full bg-violet-600 text-white",
      onClick: () => {
        setAl(alertsOf(D, Date.now()));
        setMsg('');
      }
    }, "🔍 檢查打卡"), al && React.createElement("div", {
      className: "mt-2 space-y-1"
    }, !al.length && React.createElement("p", {
      className: "text-sm text-emerald-400"
    }, "✓ 目前沒有需要提醒的狀況"), al.map((a, i) => React.createElement("p", {
      key: i,
      className: "text-sm text-gray-200"
    }, "● ", a.name, ":", a.text, " ", React.createElement(Chip, {
      c: a.sup ? 'r' : 'y'
    }, a.sup ? '本人＋主管' : '本人'))), al.length > 0 && React.createElement(B, {
      cls: "w-full fd-w",
      style: {
        background: '#be185d'
      },
      disabled: busy === 'n',
      onClick: async () => {
        setBusy('n');
        const r = await api('fd2Notify', {
          alerts: JSON.stringify(al)
        });
        setBusy('');
        setMsg(r && r.ok ? '已推播 ' + r.sent + ' 則' + (r.skipped ? '(另有 ' + r.skipped + ' 則之前推過,不再重複)' : '') : r && r._net || !navigator.onLine ? '目前離線,推播需要網路' : r && r.error || '推播失敗');
      }
    }, busy === 'n' ? React.createElement(Spinner, null) : '📣 推播 ' + al.length + ' 則提醒')), msg && React.createElement("p", {
      className: "text-sm text-amber-300 mt-1"
    }, msg)), React.createElement(Card, null, React.createElement("b", {
      className: "text-sm text-gray-300"
    }, "可排櫃台班的主管"), React.createElement("p", {
      className: "text-xs text-gray-400 mb-2"
    }, "勾選的職級,本店主管會列入排班人員(全班表、排班、打卡、申請),真的沒人時由主管上線。"), React.createElement("div", {
      className: "flex gap-1.5 flex-wrap"
    }, ['實習副理', '櫃台組長', '副理', '經理'].map(l => {
      const on = (c.mgrLv || []).indexOf(l) >= 0;
      return React.createElement("button", {
        key: l,
        onClick: () => push({
          act: 'cfg_set',
          mgrLv: on ? c.mgrLv.filter(x => x !== l) : (c.mgrLv || []).concat([l])
        }),
        className: 'rounded-full px-3 py-1.5 text-sm font-bold ' + (on ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300')
      }, on ? '✓ ' : '', l);
    })), React.createElement("p", {
      className: "text-[11px] text-gray-500 mt-1"
    }, "變更後下一次同步才會更新人員名單")), React.createElement(Card, null, React.createElement("b", {
      className: "text-sm text-gray-300"
    }, "請假最小單位"), LVK.map(t => React.createElement("div", {
      key: t,
      className: "flex items-center justify-between py-2 border-b border-gray-800 text-sm"
    }, React.createElement("span", {
      className: "text-gray-200"
    }, LV[t]), React.createElement(Seg, {
      small: true,
      opts: [['d', '1 日'], ['h', '1 小時']],
      val: c.unit[t],
      on: v => {
        const u = {};
        u[t] = v;
        push({
          act: 'cfg_set',
          unit: u
        });
      }
    }))), React.createElement("p", {
      className: "text-[11px] text-gray-500 mt-1"
    }, "1 小時:可選整天或指定時段(整點、同一天、最多 8 小時;1 日＝8 小時)")), React.createElement(Card, null, React.createElement("b", {
      className: "text-sm text-gray-300"
    }, "薪資規則"), React.createElement("div", {
      className: "flex items-center gap-2 py-2 border-b border-gray-800 text-sm text-gray-200"
    }, React.createElement("span", {
      className: "flex-1"
    }, "全勤獎金"), React.createElement(Inp, {
      className: "w-24",
      inputMode: "numeric",
      value: fa,
      onChange: e => setFa(e.target.value.replace(/\D/g, '')),
      onBlur: () => {
        if (+fa !== +c.fullAtt) push({
          act: 'cfg_set',
          fullAtt: +fa || 0
        });
      }
    })), React.createElement("div", {
      className: "flex items-center gap-2 py-2 border-b border-gray-800 text-sm text-gray-200"
    }, React.createElement("span", {
      className: "flex-1"
    }, "遲到寬限(分)"), React.createElement(Inp, {
      className: "w-24",
      inputMode: "numeric",
      value: gr,
      onChange: e => setGr(e.target.value.replace(/\D/g, '')),
      onBlur: () => {
        if (+gr !== +c.grace) push({
          act: 'cfg_set',
          grace: +gr || 0
        });
      }
    })), React.createElement("div", {
      className: "flex items-center justify-between py-2 text-sm text-gray-200"
    }, React.createElement("span", null, "遲到／缺卡時全勤"), React.createElement(Seg, {
      small: true,
      opts: [['cut', '當月不發'], ['keep', '照發']],
      val: c.attMode,
      on: v => push({
        act: 'cfg_set',
        attMode: v
      })
    })), React.createElement("p", {
      className: "text-[11px] text-gray-500"
    }, "事假／病假按天數比例扣全勤(全勤÷30×天數);特休不扣。特休計算方式:週年制(依到職日)。")), React.createElement(Card, {
      className: "!p-3"
    }, React.createElement("b", {
      className: "text-sm text-gray-300"
    }, "人員到職日與特休"), React.createElement("table", {
      className: "w-full text-[12px] text-center mt-1"
    }, React.createElement("thead", null, React.createElement("tr", {
      className: "text-gray-400"
    }, React.createElement("th", {
      className: "text-left"
    }, "人員"), React.createElement("th", null, "到職日"), React.createElement("th", null, "年資"), React.createElement("th", null, "特休"), React.createElement("th", null, "月薪"))), React.createElement("tbody", null, D.staff.map(s => {
      const h = hrOf(D, s.uid);
      const a = alInfo(D, s.uid, today);
      return React.createElement("tr", {
        key: s.uid,
        onClick: () => openHr(s.uid),
        className: "border-t border-gray-800 text-gray-200 cursor-pointer"
      }, React.createElement("td", {
        className: "text-left py-2"
      }, s.name, " ›"), React.createElement("td", null, h.hire ? h.hire.replace(/-/g, '/') : '—', h.hirePend && React.createElement("span", {
        className: "text-amber-300"
      }, "*")), React.createElement("td", null, h.hire ? senTxt(h.hire, today).replace(' 年 ', '年').replace(' 個月', '月') : '—'), React.createElement("td", null, a ? a.days : '—'), React.createElement("td", null, h.salary ? h.salary.toLocaleString() : '—'));
    }))), React.createElement("p", {
      className: "text-[11px] text-gray-500 mt-1"
    }, "點人員進入人資修改")), React.createElement(Card, null, React.createElement("b", {
      className: "text-sm text-gray-300"
    }, "匯出 Excel(打卡紀錄、薪資試算、申請)"), React.createElement("div", {
      className: "flex items-center gap-2 mt-2"
    }, React.createElement(Inp, {
      type: "month",
      className: "flex-1",
      value: ex,
      onChange: e => setEx(e.target.value)
    }), React.createElement(B, {
      cls: "px-4 bg-violet-600 text-white",
      disabled: busy === 'x',
      onClick: async () => {
        setBusy('x');
        setMsg('');
        try {
          await exportXlsx(D, ex);
        } catch (e) {
          setMsg(String(e && e.message || e));
        }
        setBusy('');
      }
    }, busy === 'x' ? React.createElement(Spinner, null) : '⬇ 下載')), inLine && React.createElement("p", {
      className: "text-xs text-amber-300 mt-2"
    }, "LINE 裡可能無法下載檔案,請按這裡用瀏覽器開啟後再下載:", React.createElement("button", {
      className: "underline font-bold",
      onClick: () => {
        try {
          liff.openWindow({
            url: location.origin + location.pathname + '?fd2=x&openExternalBrowser=1',
            external: true
          });
        } catch (_e) {}
      }
    }, "用瀏覽器開啟"))), React.createElement(Card, null, React.createElement("div", {
      className: "flex items-center"
    }, React.createElement("b", {
      className: "flex-1 text-sm text-gray-300"
    }, "打卡地點:GPS 範圍"), React.createElement("label", {
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
    }, c.lat ? '店的位置：' + c.lat + ', ' + c.lng : '還沒設定店的位置'), React.createElement(B, {
      cls: "w-full mt-2 bg-violet-600 text-white",
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
    }, busy === 'g' ? React.createElement(Spinner, null) : '📍 用我現在的位置'), React.createElement("div", {
      className: "flex items-center gap-2 mt-2 text-sm text-gray-300"
    }, "範圍半徑", React.createElement(Inp, {
      className: "w-20",
      value: rad,
      onChange: e => setRad(e.target.value.replace(/\D/g, '')),
      inputMode: "numeric"
    }), "公尺", React.createElement("button", {
      onClick: () => push({
        act: 'cfg_set',
        radius: Math.max(30, Math.min(2000, +rad || 150))
      }),
      className: "ml-auto px-3 py-1.5 rounded-lg bg-gray-800 text-gray-200 text-xs font-bold"
    }, "儲存"))), React.createElement(Card, null, React.createElement("div", {
      className: "flex items-center"
    }, React.createElement("b", {
      className: "flex-1 text-sm text-gray-300"
    }, "打卡地點:店內 Wi‑Fi"), React.createElement("label", {
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
    }, "GPS 在範圍內或連著店內 Wi‑Fi,任一個符合就算在店內;都不符合仍可打卡,但會標示給主管。")), msg && React.createElement("p", {
      className: "text-sm text-amber-300"
    }, msg), React.createElement(ShareCard, {
      store: D.me.store,
      staff: D.staff
    }));
  }
  function FdApp() {
    const S = useStore();
    const {
      D,
      q,
      sync
    } = S;
    const q0 = new URLSearchParams(location.search).get('fd2') || 'p';
    const [tab, setTab] = useState(q0 === 'm' ? 'p' : ['p', 's', 'w', 'a', 'h', 'x'].indexOf(q0) >= 0 ? q0 : 'p');
    const [sub, setSub] = useState(q0 === 'm' ? 'm' : 't');
    const [who, setWho] = useState('');
    const [pre, setPre] = useState(null);
    const guided = useRef(false);
    useEffect(() => {
      if (!D || guided.current) return;
      guided.current = true;
      const h = hrOf(D, D.me.uid);
      if (D.me.isWork && !h.hire && !h.hirePend) {
        setTab('h');
        setWho('');
      }
    }, [D]);
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
    const T = [['p', '打卡'], ['s', '排班'], ['w', '全班表'], ['a', '申請'], ['h', '人資']];
    const goSet = () => setTab('x');
    const showWho = me.isSup && (tab === 'p' || tab === 'h') && D.staff.length > 0;
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
      onClick: goSet,
      className: "text-lg px-1 relative",
      "aria-label": "主管設定"
    }, "⚙", pendList(D).length > 0 && React.createElement("span", {
      className: "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500"
    }))), tab !== 'x' && React.createElement("div", {
      className: "grid grid-cols-5 gap-1"
    }, T.map(([k, l]) => React.createElement("button", {
      key: k,
      onClick: () => setTab(k),
      className: 'rounded-xl py-2.5 text-[13px] font-bold ' + (tab === k ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-300')
    }, l))), S.notes.length > 0 && React.createElement("div", {
      className: "rounded-xl border border-red-700 bg-red-950/40 p-3 text-sm text-red-300"
    }, S.notes.map((n, i) => React.createElement("p", {
      key: i
    }, "⚠ ", n)), React.createElement("button", {
      onClick: S.clearNotes,
      className: "text-xs underline mt-1"
    }, "知道了")), sync.err && React.createElement("p", {
      className: "text-sm text-red-400"
    }, sync.err), (D.gasVer || '0') < '1.0-006' && React.createElement("p", {
      className: "rounded-xl px-3 py-2 text-sm font-bold",
      style: {
        background: 'rgba(245,158,11,.14)',
        color: '#92400e'
      }
    }, "⚠ GAS 的 gas-fd2 是舊版(", D.gasVer || '1.0-005 以前', "),請整份更新成最新版並重新部署,否則排班等功能可能存不起來"), showWho && React.createElement("div", {
      className: "flex items-center gap-2 text-sm text-gray-300"
    }, "查看人員", React.createElement("select", {
      value: uid,
      onChange: e => setWho(e.target.value === me.uid ? '' : e.target.value),
      className: "flex-1 rounded-lg bg-gray-800 border border-gray-700 px-2 py-2 text-gray-100"
    }, me.isWork && React.createElement("option", {
      value: me.uid
    }, "我自己"), !me.isWork && !who && React.createElement("option", {
      value: me.uid
    }, "請選擇"), D.staff.filter(s => s.uid !== me.uid).map(s => React.createElement("option", {
      key: s.uid,
      value: s.uid
    }, s.name)))), tab === 'p' && React.createElement("div", {
      className: "grid grid-cols-2 gap-1.5"
    }, [['t', '今日打卡'], ['m', '月紀錄・薪資']].map(([k, l]) => React.createElement("button", {
      key: k,
      onClick: () => setSub(k),
      className: 'rounded-full py-1.5 text-sm font-bold ' + (sub === k ? 'bg-gray-100 text-gray-900' : 'bg-gray-800 text-gray-400')
    }, l))), tab === 'p' && sub === 't' && (me.isWork || who ? React.createElement(PunchTab, {
      S: S,
      uid: uid,
      isMe: uid === me.uid,
      goApply: p => {
        setPre(p);
        setTab('a');
      }
    }) : React.createElement(Card, null, React.createElement("p", {
      className: "text-sm text-gray-400"
    }, "你不是櫃台人員,不需要打卡。請在上方選擇人員查看打卡狀況。"))), tab === 'p' && sub === 'm' && (me.isWork || who ? React.createElement(MonthRec, {
      key: uid,
      S: S,
      uid: uid
    }) : React.createElement(Card, null, React.createElement("p", {
      className: "text-sm text-gray-400"
    }, "請在上方選擇人員查看月打卡紀錄。"))), tab === 's' && React.createElement(SchedTab, {
      S: S
    }), tab === 'w' && React.createElement(WeekTab, {
      S: S,
      goSet: goSet
    }), tab === 'a' && React.createElement(ApplyTab, {
      S: S,
      pre: pre,
      clearPre: () => setPre(null)
    }), tab === 'h' && React.createElement(HrTab, {
      key: uid,
      S: S,
      uid: uid,
      goSet: goSet
    }), tab === 'x' && (me.isSup ? React.createElement(SetPage, {
      S: S,
      back: () => setTab('h'),
      openHr: u => {
        setWho(u === me.uid ? '' : u);
        setTab('h');
      }
    }) : React.createElement(Card, null, React.createElement("p", {
      className: "text-sm text-gray-400"
    }, "主管設定只有主管／櫃台組長可以使用。"))), React.createElement("p", {
      className: "text-[10px] text-gray-600 text-center"
    }, "櫃台人員頁 ", VER, " ・操作先存在手機,背景自動送出")));
  }
  window.Fd2Routes = FdApp;
})();