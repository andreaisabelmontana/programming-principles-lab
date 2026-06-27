// ============================================================
// programming-principles-lab — 10 visual demos across the four
// course modules of IE BCSAI "Principles of Programming" (Python):
//   1/4 fundamentals · 2/4 data structures · 3/4 ecosystem · 4/4 advanced.
//
// Every demo follows the same pattern as the rest of the *-lab series:
//   1. read control state through helpers that always return finite values
//   2. compute into a local buffer
//   3. render in a single idempotent `draw()` that resets + clears first
//
// `draw` resets the canvas transform and clears before drawing, so resizes
// and rapid input can never compound state.
//
// The genuinely-algorithmic kernels each demo traces live in their own
// DOM-free, unit-tested ES modules (see ./*.js + ../test/). The demos import
// them below so the page runs the exact code the tests cover.
// ============================================================

import { naiveFibCalls, memoizedFib } from './recursion.js';
import { traceLoop } from './flow.js';
import { inputList, mapSquares, filterEvens, reduceSum } from './hof.js';
import { hashStr, HashMap } from './hashmap.js';
import { broadcast } from './broadcasting.js';

// ---------- helpers ------------------------------------------------------
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function n(id, fallback) {
  const el = document.getElementById(id);
  const v = el ? +el.value : NaN;
  return Number.isFinite(v) ? v : fallback;
}
const $ = id => document.getElementById(id);
const setText = (id, t) => { const el = $(id); if (el) el.textContent = t; };
const setColor = (id, c) => { const el = $(id); if (el) el.style.color = c; };

// ---------- palette ------------------------------------------------------
const ACCENT = '#4338CA';
const ACCENT_S = 'rgba(67,56,202,0.16)';
const RULE  = '#E5E5EA';
const RULE_H = '#CDCDD4';
const INK   = '#15151A';
const INK_S = '#4B4B55';
const MUTED = '#8A8A92';
const GOOD  = '#16A34A';
const WARN  = '#F59E0B';
const BAD   = '#DC2626';

function fitCanvas(cv) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = cv.getBoundingClientRect();
  const cssW = Math.max(80, rect.width);
  const cssH = Math.max(80, parseInt(cv.getAttribute('height'), 10) || 280);
  cv.width  = Math.floor(cssW * dpr);
  cv.height = Math.floor(cssH * dpr);
  cv.style.height = cssH + 'px';
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = '12px Inter, sans-serif';
  ctx.textBaseline = 'alphabetic';
  return { ctx, w: cssW, h: cssH };
}
// pointer position in CSS pixels relative to canvas
function ptr(cv, ev) {
  const r = cv.getBoundingClientRect();
  return { x: ev.clientX - r.left, y: ev.clientY - r.top };
}
// rounded-rect path helper (used by the code/frame renderers)
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ============================================================
// 1. EXECUTION MODEL — compiled vs interpreted pipeline
// ============================================================
(function execution() {
  const cv = $('cv-exec'); if (!cv) return;
  // a compiled pipeline runs translation phases once, then executes the
  // binary; an interpreted pipeline re-reads each source line every run.
  const COMPILED = ['source', 'lex', 'parse', 'compile', 'machine code', 'CPU runs'];
  const INTERP   = ['source', 'read line', 'interpret', 'CPU runs', '↻ next line'];
  let step = 0;

  function phases() { return $('ex-mode').value === 'compiled' ? COMPILED : INTERP; }

  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const mode = $('ex-mode').value;
    const lines = n('ex-n', 4);
    setText('ex-nv', lines);
    const ph = phases();
    step = clamp(step, 0, ph.length);

    // pipeline boxes down the canvas
    const bx = 24, bw = w * 0.42, bh = 30, gap = 12;
    const total = ph.length * (bh + gap);
    const by0 = (h - total) / 2 + 6;
    ctx.textAlign = 'left';
    ph.forEach((label, i) => {
      const y = by0 + i * (bh + gap);
      const active = i < step;
      const current = i === step - 1;
      ctx.fillStyle = current ? ACCENT : active ? ACCENT_S : '#fff';
      rrect(ctx, bx, y, bw, bh, 6); ctx.fill();
      ctx.strokeStyle = active ? ACCENT : RULE_H; ctx.lineWidth = 1.4;
      rrect(ctx, bx, y, bw, bh, 6); ctx.stroke();
      ctx.fillStyle = current ? '#fff' : active ? ACCENT : INK_S;
      ctx.font = '600 12px JetBrains Mono, monospace';
      ctx.fillText(label, bx + 12, y + bh * 0.64);
      // connector arrow
      if (i < ph.length - 1) {
        ctx.strokeStyle = active ? ACCENT : RULE; ctx.lineWidth = 1.4;
        const cxA = bx + bw / 2;
        ctx.beginPath(); ctx.moveTo(cxA, y + bh); ctx.lineTo(cxA, y + bh + gap); ctx.stroke();
      }
    });

    // source listing on the right
    const sx = bx + bw + 34, sy0 = by0;
    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif';
    ctx.fillText(mode === 'compiled' ? 'translated once, then run:' : 'walked every run:', sx, sy0 - 8);
    ctx.font = '11px JetBrains Mono, monospace';
    for (let i = 0; i < lines; i++) {
      const y = sy0 + i * 20;
      // in interpreted mode, highlight the "current" source line as the CPU loops
      const liveLine = mode === 'interpreted' && step >= 2 && (step - 2) % lines === i;
      ctx.fillStyle = liveLine ? ACCENT_S : '#fff';
      ctx.fillRect(sx - 4, y - 11, w - sx - 14, 16);
      ctx.fillStyle = liveLine ? ACCENT : INK_S;
      ctx.fillText(`${i + 1}  total += data[${i}]`, sx, y);
    }
    ctx.textAlign = 'left';

    // readouts
    const done = step >= ph.length;
    setText('ex-phase', step === 0 ? 'idle' : ph[step - 1]);
    // compiled: translation is fixed cost, then exactly `lines` CPU ops.
    // interpreted: every source line pays re-interpretation overhead each pass.
    let cpu;
    if (mode === 'compiled') cpu = step >= ph.length - 1 ? lines : 0;
    else cpu = Math.max(0, Math.min(lines, step - 1));
    setText('ex-cpu', `${cpu}`);
    setText('ex-port', mode === 'compiled' ? 'no (per-CPU)' : 'yes (runs anywhere)');
    setColor('ex-port', mode === 'compiled' ? WARN : GOOD);
    void done;
  }
  $('ex-step').addEventListener('click', () => { step = Math.min(step + 1, phases().length); draw(); });
  $('ex-reset').addEventListener('click', () => { step = 0; draw(); });
  $('ex-mode').addEventListener('change', () => { step = 0; draw(); });
  $('ex-n').addEventListener('input', () => { step = 0; draw(); });
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 2. FLOW CONTROL & LOOPS — for + if + break/continue tracer
// ============================================================
(function flow() {
  const cv = $('cv-flow'); if (!cv) return;
  // precompute the full trace so stepping is just an index into events.
  let trace = [], idx = 0;

  function build() {
    // delegate the loop replay to the unit-tested flow module
    trace = traceLoop(n('fl-n', 6), $('fl-cond').value, $('fl-act').value).trace;
    idx = 0;
  }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const N = n('fl-n', 6); setText('fl-nv', N);
    if (trace.length === 0) build();
    idx = clamp(idx, 0, trace.length - 1);
    const cur = trace[idx];
    const act = $('fl-act').value;

    // code listing on the left
    const code = [
      'total = 0',
      `for i in range(${N}):`,
      `    if guard(i):`,
      `        ${act}`,
      '    total += i',
      'print(total)',
    ];
    const cx = 22, cy0 = 30, lh = 24;
    ctx.textAlign = 'left'; ctx.font = '12px JetBrains Mono, monospace';
    // map current event to a highlighted line
    let hot = 4;
    if (cur.done) hot = 5;
    else if (cur.line === 'break' || cur.line === 'continue') hot = 3;
    else if (cur.skip) hot = 3;
    code.forEach((ln, i) => {
      const y = cy0 + i * lh;
      if (i === hot) { ctx.fillStyle = ACCENT_S; ctx.fillRect(cx - 6, y - 13, w * 0.5, 19); }
      ctx.fillStyle = i === hot ? ACCENT : INK_S;
      ctx.fillText(ln, cx, y);
    });

    // iteration cells on the right
    const gx = w * 0.56, gy = 36, cw = Math.min(34, (w - gx - 20) / N);
    ctx.textAlign = 'center';
    ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = MUTED;
    ctx.fillText('i =', gx - 4, gy - 10);
    for (let i = 0; i < N; i++) {
      const x = gx + i * cw;
      const visited = cur.i !== null && i <= cur.i && !(cur.done);
      const isCur = cur.i === i && !cur.done;
      ctx.fillStyle = isCur ? ACCENT : visited ? ACCENT_S : '#fff';
      ctx.fillRect(x, gy, cw - 3, 26);
      ctx.strokeStyle = isCur ? ACCENT : RULE_H; ctx.lineWidth = isCur ? 2 : 1;
      ctx.strokeRect(x, gy, cw - 3, 26);
      ctx.fillStyle = isCur ? '#fff' : INK_S; ctx.font = '600 12px JetBrains Mono, monospace';
      ctx.fillText(i, x + (cw - 3) / 2, gy + 17);
    }
    // status line
    ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = INK_S;
    let msg = cur.done ? 'loop finished' :
      cur.line === 'break' ? `i=${cur.i} hits guard → break out` :
      cur.line === 'continue' ? `i=${cur.i} hits guard → skip body` :
      `i=${cur.i} added to total`;
    ctx.fillText(msg, gx, gy + 56);
    ctx.textAlign = 'left';

    setText('fl-i', cur.i === null ? '—' : `${cur.i}`);
    setText('fl-total', `${cur.total}`);
    setColor('fl-total', ACCENT);
  }
  $('fl-step').addEventListener('click', () => { if (trace.length === 0) build(); idx = Math.min(idx + 1, trace.length - 1); draw(); });
  $('fl-run').addEventListener('click', () => { if (trace.length === 0) build(); idx = trace.length - 1; draw(); });
  $('fl-reset').addEventListener('click', () => { build(); draw(); });
  ['fl-n'].forEach(id => $(id).addEventListener('input', () => { build(); draw(); }));
  ['fl-cond', 'fl-act'].forEach(id => $(id).addEventListener('change', () => { build(); draw(); }));
  window.addEventListener('resize', draw);
  build(); draw();
})();

// ============================================================
// 3. RECURSION & THE CALL STACK — frame push/pop tracer
// ============================================================
(function callStack() {
  const cv = $('cv-stack'); if (!cv) return;
  // build a flat event list: 'call' pushes a frame, 'return' pops it with a value.
  let events = [], idx = 0, maxDepth = 0, result = null;

  function build() {
    const fn = $('st-fn').value, N = clamp(n('st-n', 4), 1, 7);
    events = []; maxDepth = 0;
    function rec(label, compute) {
      events.push({ type: 'call', label });
      const here = depthNow();
      maxDepth = Math.max(maxDepth, here);
      const val = compute();
      events.push({ type: 'return', label, val });
      return val;
    }
    function depthNow() {
      let d = 0;
      for (const e of events) d += e.type === 'call' ? 1 : (e.type === 'return' ? -1 : 0);
      return d;
    }
    function fact(k) { return rec(`fact(${k})`, () => k <= 1 ? 1 : k * fact(k - 1)); }
    function fib(k)  { return rec(`fib(${k})`,  () => k < 2 ? k : fib(k - 1) + fib(k - 2)); }
    result = fn === 'fact' ? fact(N) : fib(N);
    idx = 0;
  }
  // reconstruct the live stack after `idx` events
  function stackAt(k) {
    const st = [];
    for (let i = 0; i < k; i++) {
      const e = events[i];
      if (e.type === 'call') st.push({ label: e.label, val: null });
      else if (e.type === 'return') { if (st.length) st[st.length - 1].val = e.val; st.pop(); }
    }
    return st;
  }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    setText('st-nv', clamp(n('st-n', 4), 1, 7));
    if (events.length === 0) build();
    idx = clamp(idx, 0, events.length);
    const st = stackAt(idx);
    const lastEv = idx > 0 ? events[idx - 1] : null;

    // draw the stack growing upward from the base
    const fw = Math.min(260, w * 0.5), fh = 32, gap = 6;
    const baseX = 28, baseY = h - 40;
    ctx.textAlign = 'left';
    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif';
    ctx.fillText('call stack (top grows up)', baseX, 22);
    st.forEach((fr, i) => {
      const y = baseY - (i + 1) * (fh + gap);
      const isTop = i === st.length - 1;
      ctx.fillStyle = isTop ? ACCENT : ACCENT_S;
      rrect(ctx, baseX, y, fw, fh, 6); ctx.fill();
      ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.2;
      rrect(ctx, baseX, y, fw, fh, 6); ctx.stroke();
      ctx.fillStyle = isTop ? '#fff' : ACCENT; ctx.font = '600 12px JetBrains Mono, monospace';
      ctx.fillText(fr.label, baseX + 12, y + fh * 0.64);
    });
    // base line
    ctx.strokeStyle = RULE_H; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(baseX, baseY); ctx.lineTo(baseX + fw, baseY); ctx.stroke();

    // event annotation on the right
    const rx = baseX + fw + 28, ry = h * 0.5;
    ctx.textAlign = 'left'; ctx.font = '12px JetBrains Mono, monospace';
    if (lastEv) {
      if (lastEv.type === 'call') {
        ctx.fillStyle = ACCENT; ctx.fillText('→ push', rx, ry - 10);
        ctx.fillStyle = INK_S; ctx.fillText(lastEv.label, rx, ry + 12);
      } else {
        ctx.fillStyle = GOOD; ctx.fillText('← return', rx, ry - 10);
        ctx.fillStyle = INK_S; ctx.fillText(`${lastEv.label} = ${lastEv.val}`, rx, ry + 12);
      }
    } else {
      ctx.fillStyle = MUTED; ctx.fillText('press step', rx, ry);
    }

    setText('st-depth', `${st.length}`);
    setText('st-max', `${maxDepth}`);
    const done = idx >= events.length;
    setText('st-res', done ? `${result}` : '…');
    setColor('st-res', done ? GOOD : MUTED);
  }
  $('st-step').addEventListener('click', () => { if (events.length === 0) build(); idx = Math.min(idx + 1, events.length); draw(); });
  $('st-run').addEventListener('click', () => { if (events.length === 0) build(); idx = events.length; draw(); });
  $('st-reset').addEventListener('click', () => { build(); draw(); });
  $('st-fn').addEventListener('change', () => { build(); draw(); });
  $('st-n').addEventListener('input', () => { build(); draw(); });
  window.addEventListener('resize', draw);
  build(); draw();
})();

// ============================================================
// 4. RECURSION TREE & MEMOIZATION — fib call counting
// ============================================================
(function memoization() {
  const cv = $('cv-memo'); if (!cv) return;

  // build the naive recursion tree, marking nodes served from cache when memoizing.
  function buildTree(N, memoize) {
    let calls = 0;
    const cache = new Map();
    function node(k) {
      calls++;
      if (memoize && cache.has(k)) {
        return { k, val: cache.get(k), cached: true, children: [] };
      }
      let val, children = [];
      if (k < 2) { val = k; }
      else {
        const a = node(k - 1), b = node(k - 2);
        children = [a, b]; val = a.val + b.val;
      }
      if (memoize) cache.set(k, val);
      return { k, val, cached: false, children };
    }
    const root = node(N);
    return { root, calls };
  }

  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const N = clamp(n('mo-n', 5), 1, 8); setText('mo-nv', N);
    const memoize = $('mo-cache').checked;
    const { root, calls } = buildTree(N, memoize);

    // assign x positions by in-order leaf spread, y by depth
    const depthMax = N; // tree depth is ~N
    let nextX = 0;
    function layout(node, depth) {
      if (node.children.length === 0) { node._x = nextX++; node._d = depth; return; }
      node.children.forEach(c => layout(c, depth + 1));
      node._x = (node.children[0]._x + node.children[node.children.length - 1]._x) / 2;
      node._d = depth;
    }
    layout(root, 0);
    const leaves = Math.max(1, nextX);
    const padX = 30, padY = 30;
    const sx = (w - 2 * padX) / Math.max(1, leaves);
    const sy = (h - 2 * padY) / Math.max(1, depthMax);
    const px = node => padX + (node._x + 0.5) * sx;
    const py = node => padY + node._d * sy;

    // edges first
    ctx.strokeStyle = RULE_H; ctx.lineWidth = 1;
    (function edges(node) {
      node.children.forEach(c => {
        ctx.beginPath(); ctx.moveTo(px(node), py(node)); ctx.lineTo(px(c), py(c)); ctx.stroke();
        edges(c);
      });
    })(root);
    // nodes
    ctx.textAlign = 'center'; ctx.font = '600 10px JetBrains Mono, monospace';
    const r = clamp(sx * 0.32, 7, 14);
    (function nodes(node) {
      const x = px(node), y = py(node);
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      if (node.cached) { ctx.fillStyle = '#fff'; ctx.strokeStyle = RULE_H; }
      else { ctx.fillStyle = node.children.length ? ACCENT_S : '#fff'; ctx.strokeStyle = node.children.length ? ACCENT : GOOD; }
      ctx.fill(); ctx.lineWidth = 1.4; ctx.stroke();
      ctx.fillStyle = node.cached ? MUTED : (node.children.length ? ACCENT : GOOD);
      ctx.fillText(node.k, x, y + 3.5);
      node.children.forEach(nodes);
    })(root);
    ctx.textAlign = 'left';

    // fib(n) value comes from the unit-tested memoized kernel
    setText('mo-val', `${memoizedFib(N).value}`);
    setText('mo-calls', `${calls}`);
    setColor('mo-calls', memoize ? GOOD : (calls > 2 * N ? WARN : ACCENT));
    setText('mo-naive', `${naiveFibCalls(N)}`);
  }
  $('mo-n').addEventListener('input', draw);
  $('mo-cache').addEventListener('change', draw);
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 5. SCOPE & CLOSURES — LEGB resolution
// ============================================================
(function scope() {
  const cv = $('cv-scope'); if (!cv) return;

  // each scenario: a global x, an optional enclosing scope, an inner reference.
  const CASES = {
    local:    { via: 'Local', inner: 10, after: 5, hasEnclosing: false, declares: 'local',
      note: 'A local assignment creates a new name that shadows the global; the global is untouched.' },
    global:   { via: 'Global', inner: 5, after: 5, hasEnclosing: false, declares: 'none',
      note: 'No local x exists, so the reference falls through to the global binding.' },
    closure:  { via: 'Enclosing', inner: 7, after: 5, hasEnclosing: true, declares: 'enclosing',
      note: 'The inner function captures x from its enclosing scope — a closure keeps it alive after the outer returns.' },
    nonlocal: { via: 'Global', inner: 99, after: 99, hasEnclosing: false, declares: 'global-kw',
      note: 'The global keyword rebinds the module-level x, so the side effect is visible after the call.' },
  };

  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const key = $('sc-case').value;
    const c = CASES[key];

    // nested boxes: Global ⊃ (Enclosing) ⊃ Local. Highlight the resolving scope.
    const boxes = [];
    boxes.push({ name: 'Global', x: 20, y: 24, w: w * 0.5 - 30, h: h - 48, hl: c.via === 'Global' });
    if (c.hasEnclosing) {
      boxes.push({ name: 'Enclosing (outer)', x: 36, y: 56, w: w * 0.5 - 62, h: h - 110, hl: c.via === 'Enclosing' });
      boxes.push({ name: 'Local (inner)', x: 52, y: 92, w: w * 0.5 - 94, h: h - 168, hl: c.via === 'Local' });
    } else {
      boxes.push({ name: 'Local (function)', x: 36, y: 56, w: w * 0.5 - 62, h: h - 110, hl: c.via === 'Local' });
    }
    ctx.textAlign = 'left';
    boxes.forEach(b => {
      ctx.fillStyle = b.hl ? ACCENT_S : '#fff';
      rrect(ctx, b.x, b.y, b.w, b.h, 7); ctx.fill();
      ctx.strokeStyle = b.hl ? ACCENT : RULE_H; ctx.lineWidth = b.hl ? 2 : 1.2;
      rrect(ctx, b.x, b.y, b.w, b.h, 7); ctx.stroke();
      ctx.fillStyle = b.hl ? ACCENT : MUTED; ctx.font = '600 11px Inter, sans-serif';
      ctx.fillText(b.name, b.x + 10, b.y + 16);
    });
    // bindings of x
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.fillStyle = INK_S;
    ctx.fillText('x = 5', 30, 44);
    if (c.declares === 'local') ctx.fillText('x = 10  (local)', 62, h - 56);
    if (c.declares === 'enclosing') { ctx.fillText('x = 7  (outer)', 46, 86); ctx.fillText('use x', 62, h - 56); }
    if (c.declares === 'global-kw') ctx.fillText('global x; x = 99', 46, h - 56);
    if (c.declares === 'none') ctx.fillText('use x  (no local)', 46, h - 56);

    // resolution arrow on the right
    const rx = w * 0.56;
    ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = MUTED;
    ctx.fillText('LEGB lookup order:', rx, 40);
    const order = ['Local', 'Enclosing', 'Global', 'Built-in'];
    order.forEach((o, i) => {
      const y = 64 + i * 26;
      const resolved = o === c.via;
      ctx.fillStyle = resolved ? ACCENT : '#fff';
      rrect(ctx, rx, y - 14, w - rx - 16, 20, 5); ctx.fill();
      ctx.strokeStyle = resolved ? ACCENT : RULE; ctx.lineWidth = 1.2;
      rrect(ctx, rx, y - 14, w - rx - 16, 20, 5); ctx.stroke();
      ctx.fillStyle = resolved ? '#fff' : INK_S; ctx.font = '600 11px JetBrains Mono, monospace';
      ctx.fillText(`${i + 1}. ${o}${resolved ? '  ✓' : ''}`, rx + 8, y);
    });
    ctx.textAlign = 'left';

    setText('sc-via', c.via);
    setColor('sc-via', ACCENT);
    setText('sc-inner', `x = ${c.inner}`);
    setText('sc-after', `x = ${c.after}`);
    setColor('sc-after', c.after === 5 ? INK_S : WARN);
    setText('sc-note', c.note);
  }
  $('sc-case').addEventListener('change', draw);
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 6. HIGHER-ORDER FUNCTIONS — map / filter / reduce pipeline
// ============================================================
(function hof() {
  const cv = $('cv-hof'); if (!cv) return;
  let input = [], steps = [], idx = 0;

  function build() {
    const N = clamp(n('hf-n', 6), 3, 9);
    input = inputList(N);                       // [1..N] from the hof module
    const op = $('hf-op').value;
    steps = [];
    if (op === 'map') {
      const out = mapSquares(input);            // tested map(x => x*x)
      input.forEach((x, i) => steps.push({ i, kept: true, out: out[i], acc: null }));
    } else if (op === 'filter') {
      const kept = new Set(filterEvens(input)); // tested filter(x => x % 2 === 0)
      input.forEach((x, i) => steps.push({ i, kept: kept.has(x), out: x, acc: null }));
    } else { // reduce — running prefix sums, final acc === reduceSum(input)
      let acc = 0;
      input.forEach((x, i) => { acc += x; steps.push({ i, kept: true, out: x, acc }); });
    }
    idx = 0;
  }
  function result() {
    const op = $('hf-op').value;
    const done = steps.slice(0, idx);
    if (op === 'map') return '[' + done.map(s => s.out).join(', ') + ']';
    if (op === 'filter') return '[' + done.filter(s => s.kept).map(s => s.out).join(', ') + ']';
    // reduce: show the running fold; once every element is folded it equals reduceSum(input)
    if (idx >= input.length) return `${reduceSum(input)}`;
    return done.length ? `${done[done.length - 1].acc}` : '0';
  }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    setText('hf-nv', clamp(n('hf-n', 6), 3, 9));
    if (steps.length === 0) build();
    idx = clamp(idx, 0, steps.length);
    const op = $('hf-op').value;

    const N = input.length;
    const cw = Math.min(46, (w - 40) / N);
    const x0 = (w - cw * N) / 2;
    const yIn = 50, yOut = h - 70, ch = 32;
    ctx.textAlign = 'center';
    ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = MUTED;
    ctx.fillText('input', 24, yIn + 18); ctx.fillText(op === 'reduce' ? 'fold' : 'output', 24, yOut + 18);

    // op label in the middle
    ctx.fillStyle = ACCENT; ctx.font = '600 12px JetBrains Mono, monospace';
    const lbl = op === 'map' ? 'map(x => x*x)' : op === 'filter' ? 'filter(x => x%2==0)' : 'reduce((a,x) => a+x)';
    ctx.fillText(lbl, w / 2, (yIn + yOut) / 2 + 4);

    input.forEach((x, i) => {
      const x1 = x0 + i * cw;
      const processed = i < idx;
      const s = steps[i];
      // input cell
      ctx.fillStyle = processed ? ACCENT_S : '#fff';
      ctx.fillRect(x1, yIn, cw - 4, ch);
      ctx.strokeStyle = (i === idx - 1) ? ACCENT : RULE_H; ctx.lineWidth = (i === idx - 1) ? 2 : 1;
      ctx.strokeRect(x1, yIn, cw - 4, ch);
      ctx.fillStyle = INK; ctx.font = '600 13px JetBrains Mono, monospace';
      ctx.fillText(x, x1 + (cw - 4) / 2, yIn + 21);

      if (processed) {
        // flow line
        ctx.strokeStyle = s.kept ? ACCENT : BAD; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x1 + (cw - 4) / 2, yIn + ch); ctx.lineTo(x1 + (cw - 4) / 2, yOut); ctx.stroke();
        // output cell
        if (op === 'reduce') {
          ctx.fillStyle = ACCENT; ctx.fillRect(x1, yOut, cw - 4, ch);
          ctx.fillStyle = '#fff'; ctx.font = '600 12px JetBrains Mono, monospace';
          ctx.fillText(s.acc, x1 + (cw - 4) / 2, yOut + 21);
        } else if (s.kept) {
          ctx.fillStyle = GOOD; ctx.fillRect(x1, yOut, cw - 4, ch);
          ctx.fillStyle = '#fff'; ctx.font = '600 13px JetBrains Mono, monospace';
          ctx.fillText(s.out, x1 + (cw - 4) / 2, yOut + 21);
        } else {
          ctx.fillStyle = MUTED; ctx.font = '11px JetBrains Mono, monospace';
          ctx.fillText('✗', x1 + (cw - 4) / 2, yOut + 21);
        }
      }
    });
    ctx.textAlign = 'left';

    setText('hf-proc', `${idx} / ${N}`);
    setText('hf-out', result());
    setColor('hf-out', ACCENT);
  }
  $('hf-step').addEventListener('click', () => { if (steps.length === 0) build(); idx = Math.min(idx + 1, steps.length); draw(); });
  $('hf-run').addEventListener('click', () => { if (steps.length === 0) build(); idx = steps.length; draw(); });
  $('hf-reset').addEventListener('click', () => { build(); draw(); });
  $('hf-n').addEventListener('input', () => { build(); draw(); });
  $('hf-op').addEventListener('change', () => { build(); draw(); });
  window.addEventListener('resize', draw);
  build(); draw();
})();

// ============================================================
// 7. EAGER vs LAZY EVALUATION — generator pull model
// ============================================================
(function lazy() {
  const cv = $('cv-lazy'); if (!cv) return;
  let pulled = 0; // how many items the consumer has requested

  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const mode = $('lz-mode').value;
    const N = clamp(n('lz-n', 8), 4, 12);
    const K = clamp(n('lz-k', 3), 1, 6);
    setText('lz-nv', N); setText('lz-kv', K);
    pulled = clamp(pulled, 0, K);

    // in eager mode the whole source is computed immediately;
    // in lazy mode only the items pulled so far (capped at K) are computed.
    const computed = mode === 'eager' ? N : Math.min(pulled, K, N);
    const wasted = mode === 'eager' ? Math.max(0, N - K) : 0;

    const cw = Math.min(40, (w - 40) / N), x0 = (w - cw * N) / 2, y = h * 0.4, ch = 34;
    ctx.textAlign = 'center';
    ctx.font = '11px Inter, sans-serif'; ctx.fillStyle = MUTED;
    ctx.fillText(mode === 'eager' ? 'list: all values built up front (squares of 1..N)'
                                  : 'generator: yields one value per pull', w / 2, 26);
    for (let i = 0; i < N; i++) {
      const x = x0 + i * cw;
      const isComputed = i < computed;
      const isWastedCell = mode === 'eager' && i >= K;
      ctx.fillStyle = isComputed ? (isWastedCell ? WARN : ACCENT) : '#fff';
      ctx.fillRect(x, y, cw - 4, ch);
      ctx.strokeStyle = isComputed ? (isWastedCell ? WARN : ACCENT) : RULE_H; ctx.lineWidth = 1.2;
      ctx.strokeRect(x, y, cw - 4, ch);
      ctx.fillStyle = isComputed ? '#fff' : RULE_H; ctx.font = '600 12px JetBrains Mono, monospace';
      ctx.fillText(isComputed ? ((i + 1) * (i + 1)) : '·', x + (cw - 4) / 2, y + 22);
    }
    // take(K) bracket
    const bx0 = x0, bx1 = x0 + K * cw - 4;
    ctx.strokeStyle = GOOD; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(bx0, y + ch + 10); ctx.lineTo(bx0, y + ch + 16);
    ctx.lineTo(bx1, y + ch + 16); ctx.lineTo(bx1, y + ch + 10); ctx.stroke();
    ctx.fillStyle = GOOD; ctx.font = '600 11px JetBrains Mono, monospace';
    ctx.fillText(`take(${K})`, (bx0 + bx1) / 2, y + ch + 32);
    ctx.textAlign = 'left';

    setText('lz-comp', `${computed}`);
    setColor('lz-comp', mode === 'lazy' ? GOOD : (wasted ? WARN : ACCENT));
    setText('lz-waste', `${wasted}`);
    setColor('lz-waste', wasted ? WARN : INK_S);
  }
  $('lz-step').addEventListener('click', () => { pulled = Math.min(pulled + 1, n('lz-k', 3)); draw(); });
  $('lz-reset').addEventListener('click', () => { pulled = 0; draw(); });
  $('lz-mode').addEventListener('change', () => { pulled = 0; draw(); });
  ['lz-n', 'lz-k'].forEach(id => $(id).addEventListener('input', () => { pulled = clamp(pulled, 0, n('lz-k', 3)); draw(); }));
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 8. MUTABILITY & SIDE EFFECTS — pass-by-reference model
// ============================================================
(function mutability() {
  const cv = $('cv-mut'); if (!cv) return;
  let called = false;

  // each mode reports: does the function operate on the SAME object as the caller,
  // and is the caller's binding observably changed afterwards?
  const MODES = {
    inplace: { same: true,  changed: true,  caller: [1, 2, 3, 99], local: [1, 2, 3, 99], isList: true,
      note: 'append() mutates the shared list object in place — the caller sees the change.' },
    rebind:  { same: false, changed: false, caller: [1, 2, 3], local: [1, 2, 3, 99], isList: true,
      note: 'xs = xs + [99] rebinds the LOCAL name to a new list; the caller still points at the original.' },
    copy:    { same: false, changed: false, caller: [1, 2, 3], local: [1, 2, 3, 99], isList: true,
      note: 'xs[:] makes a copy; mutating the copy leaves the caller untouched.' },
    int:     { same: false, changed: false, caller: 7, local: 8, isList: false,
      note: 'ints are immutable — n = n + 1 makes a new int and rebinds the local; the caller is unaffected.' },
  };

  function box(ctx, x, y, label, val, isList, color) {
    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(label, x, y - 8);
    ctx.font = '600 12px JetBrains Mono, monospace';
    const text = isList ? '[' + val.join(', ') + ']' : `${val}`;
    const bw = Math.max(70, ctx.measureText(text).width + 24), bh = 30;
    ctx.fillStyle = '#fff'; rrect(ctx, x, y, bw, bh, 6); ctx.fill();
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; rrect(ctx, x, y, bw, bh, 6); ctx.stroke();
    ctx.fillStyle = INK; ctx.fillText(text, x + 12, y + bh * 0.66);
    return { x, y, bw, bh };
  }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const m = MODES[$('mu-mode').value];

    // caller frame (left) and function frame (right)
    const callerVal = called ? m.caller : (m.isList ? [1, 2, 3] : 7);
    const fX = 30, gX = w * 0.55;
    ctx.fillStyle = ACCENT; ctx.font = '600 12px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('caller scope', fX, 28);
    ctx.fillText('function scope', gX, 28);
    ctx.strokeStyle = RULE; ctx.setLineDash([4, 4]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(w / 2, 16); ctx.lineTo(w / 2, h - 16); ctx.stroke();
    ctx.setLineDash([]);

    const cb = box(ctx, fX, 56, 'xs (caller)', callerVal, m.isList, m.changed && called ? WARN : ACCENT);
    if (called) {
      const lb = box(ctx, gX, 56, m.isList ? 'local xs/ys' : 'local n', m.local, m.isList, m.same ? ACCENT : INK_S);
      // reference arrows: if same object, both names point to one heap cell
      if (m.isList) {
        const heapX = w * 0.5 - 30, heapY = h - 70;
        ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif';
        ctx.fillText('heap', heapX, heapY - 8);
        const sharedVal = m.same ? m.local : m.caller;
        box(ctx, heapX - 20, heapY, '', sharedVal, true, m.same ? ACCENT : RULE_H);
        // arrow from caller
        ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(cb.x + cb.bw / 2, cb.y + cb.bh); ctx.lineTo(heapX, heapY + 14); ctx.stroke();
        // arrow from local
        ctx.strokeStyle = m.same ? ACCENT : INK_S; ctx.lineWidth = 1.4;
        if (m.same) { ctx.beginPath(); ctx.moveTo(lb.x, lb.y + lb.bh); ctx.lineTo(heapX + 70, heapY); ctx.stroke(); }
        else {
          // separate object for the rebound/copied local
          box(ctx, gX, h - 70, '', m.local, true, INK_S);
          ctx.beginPath(); ctx.moveTo(lb.x + 20, lb.y + lb.bh); ctx.lineTo(gX + 20, h - 70); ctx.stroke();
        }
      }
    } else {
      ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif';
      ctx.fillText('press “call function”', gX, 72);
    }
    ctx.textAlign = 'left';

    setText('mu-same', !called ? '—' : m.same ? 'yes (aliased)' : 'no (new object)');
    setColor('mu-same', !called ? INK_S : m.same ? WARN : GOOD);
    setText('mu-changed', !called ? '—' : m.changed ? 'YES' : 'no');
    setColor('mu-changed', !called ? INK_S : m.changed ? WARN : GOOD);
    setText('mu-note', called ? m.note : '');
  }
  $('mu-run').addEventListener('click', () => { called = true; draw(); });
  $('mu-reset').addEventListener('click', () => { called = false; draw(); });
  $('mu-mode').addEventListener('change', () => { called = false; draw(); });
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 9. HASH MAPS / DICTIONARIES — hashing into buckets, chaining
// ============================================================
(function hashmap() {
  const cv = $('cv-hash'); if (!cv) return;
  // backing store is the unit-tested HashMap (djb2 hash, separate chaining)
  let map = new HashMap(clamp(n('ha-b', 8), 4, 12));

  function rebuild() {
    const B = clamp(n('ha-b', 8), 4, 12);
    const keys = map.buckets.flat().map(it => it.key);
    map = new HashMap(B);
    keys.forEach(k => map.put(k));
  }
  function insert(key, redraw) {
    map.put(key);
    if (redraw) draw();
  }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const B = clamp(n('ha-b', 8), 4, 12);
    setText('ha-bv', B);
    if (map.size !== B) rebuild();
    const buckets = map.buckets;

    const rowH = Math.min(26, (h - 30) / B), gx = 30, gy = 18, lblW = 30, cellW = 70;
    ctx.textAlign = 'left';
    for (let i = 0; i < B; i++) {
      const y = gy + i * rowH;
      // slot index
      ctx.fillStyle = MUTED; ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText(`[${i}]`, gx - 8, y + rowH * 0.66);
      // bucket frame
      ctx.strokeStyle = RULE; ctx.lineWidth = 1;
      ctx.strokeRect(gx + lblW, y, w - gx - lblW - 14, rowH - 3);
      const chain = buckets[i];
      chain.forEach((it, k) => {
        const x = gx + lblW + 6 + k * (cellW + 8);
        if (x + cellW > w - 16) return; // clip overflow
        ctx.fillStyle = chain.length > 1 ? WARN : ACCENT;
        rrect(ctx, x, y + 2, cellW, rowH - 7, 4); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = '600 11px JetBrains Mono, monospace';
        const t = it.key.length > 7 ? it.key.slice(0, 6) + '…' : it.key;
        ctx.fillText(t, x + 6, y + rowH * 0.6);
        // chain link arrow
        if (k > 0) {
          ctx.strokeStyle = WARN; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(x - 8, y + rowH / 2); ctx.lineTo(x, y + rowH / 2); ctx.stroke();
        }
      });
    }
    ctx.textAlign = 'left';

    const key = $('ha-key').value.trim();
    const hv = key ? hashStr(key) : null;
    setText('ha-hash', hv === null ? '—' : `${hv}`);
    setText('ha-slot', hv === null ? '—' : `${hv % B}`);
    setColor('ha-slot', ACCENT);
    const count = map.count(), load = map.loadFactor(), collisions = map.collisions();
    setText('ha-load', `${count}/${B} = ${load.toFixed(2)}`);
    setColor('ha-load', load > 0.75 ? WARN : INK_S);
    setText('ha-coll', `${collisions}`);
    setColor('ha-coll', collisions > 0 ? WARN : GOOD);
  }
  $('ha-add').addEventListener('click', () => insert($('ha-key').value, true));
  $('ha-key').addEventListener('keydown', e => { if (e.key === 'Enter') insert($('ha-key').value, true); });
  $('ha-key').addEventListener('input', draw);
  $('ha-b').addEventListener('input', () => { rebuild(); draw(); });
  $('ha-clear').addEventListener('click', () => { map = new HashMap(clamp(n('ha-b', 8), 4, 12)); draw(); });
  window.addEventListener('resize', draw);
  // seed with a couple of keys so the picture isn't empty
  insert('cat', false); insert('dog', false); insert('fox', false);
  draw();
})();

// ============================================================
// 10. NUMPY — vectorization & broadcasting
// ============================================================
(function numpy() {
  const cv = $('cv-numpy'); if (!cv) return;

  const SHAPES = {
    scalar: [1, 1], r13: [1, 3], c31: [3, 1], m33: [3, 3], r12: [1, 2],
  };
  // broadcasting rule lives in the unit-tested ./broadcasting.js module
  function valAt(shape, i, j) {
    const [r, c] = shape;
    const ri = r === 1 ? 0 : i, cj = c === 1 ? 0 : j;
    return ri * 3 + cj + 1; // simple readable contents
  }
  function drawGrid(ctx, shape, gx, gy, cell, color, label, outShape) {
    const [r, c] = shape;
    ctx.textAlign = 'center';
    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`${label} (${r}×${c})`, gx + (outShape[1] * cell) / 2, gy - 8);
    for (let i = 0; i < outShape[0]; i++) {
      for (let j = 0; j < outShape[1]; j++) {
        const x = gx + j * cell, y = gy + i * cell;
        const stretched = (r === 1 && outShape[0] > 1) || (c === 1 && outShape[1] > 1);
        ctx.fillStyle = stretched ? 'rgba(67,56,202,0.06)' : '#fff';
        ctx.fillRect(x, y, cell - 3, cell - 3);
        ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.strokeRect(x, y, cell - 3, cell - 3);
        ctx.fillStyle = INK; ctx.font = '600 12px JetBrains Mono, monospace';
        ctx.fillText(valAt(shape, i, j), x + (cell - 3) / 2, y + cell * 0.6);
      }
    }
    ctx.textAlign = 'left';
  }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const a = SHAPES[$('np-a').value], b = SHAPES[$('np-b').value];
    const op = $('np-op').value === 'add' ? '+' : '×';
    const out = broadcast(a, b);

    const cell = 34;
    const blockW = 3 * cell;
    const gap = 40;
    const totalW = blockW * 3 + gap * 2 + 28;
    const gx0 = (w - totalW) / 2;
    const gy = 60;

    if (out) {
      drawGrid(ctx, a, gx0, gy, cell, ACCENT, 'A', out);
      // op symbol
      ctx.fillStyle = ACCENT; ctx.font = '700 22px JetBrains Mono, monospace'; ctx.textAlign = 'center';
      ctx.fillText(op, gx0 + blockW + gap / 2, gy + out[0] * cell / 2 + 6);
      drawGrid(ctx, b, gx0 + blockW + gap, gy, cell, INK_S, 'B', out);
      ctx.fillText('=', gx0 + 2 * blockW + 1.5 * gap, gy + out[0] * cell / 2 + 6);
      // result grid
      const rgx = gx0 + 2 * (blockW + gap);
      ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif';
      ctx.fillText(`result (${out[0]}×${out[1]})`, rgx + (out[1] * cell) / 2, gy - 8);
      for (let i = 0; i < out[0]; i++) for (let j = 0; j < out[1]; j++) {
        const x = rgx + j * cell, y = gy + i * cell;
        const va = valAt(a, i, j), vb = valAt(b, i, j);
        const rv = op === '+' ? va + vb : va * vb;
        ctx.fillStyle = GOOD; ctx.fillRect(x, y, cell - 3, cell - 3);
        ctx.fillStyle = '#fff'; ctx.font = '600 12px JetBrains Mono, monospace';
        ctx.fillText(rv, x + (cell - 3) / 2, y + cell * 0.6);
      }
      ctx.textAlign = 'left';
    } else {
      ctx.fillStyle = BAD; ctx.font = '600 13px Inter, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('shapes are NOT broadcast-compatible', w / 2, h / 2 - 8);
      ctx.fillStyle = INK_S; ctx.font = '12px JetBrains Mono, monospace';
      ctx.fillText(`(${a[0]}×${a[1]})  vs  (${b[0]}×${b[1]})`, w / 2, h / 2 + 14);
      ctx.textAlign = 'left';
    }

    setText('np-shape', out ? `${out[0]}×${out[1]}` : '—');
    setColor('np-shape', out ? ACCENT : BAD);
    setText('np-ok', out ? 'yes' : 'no');
    setColor('np-ok', out ? GOOD : BAD);
    setText('np-note', out
      ? 'Each trailing dimension matches or is 1, so the smaller array is stretched (no data copied).'
      : 'A dimension differs and neither is 1 — NumPy raises a ValueError.');
  }
  ['np-a', 'np-b', 'np-op'].forEach(id => $(id).addEventListener('change', draw));
  window.addEventListener('resize', draw);
  draw();
})();
