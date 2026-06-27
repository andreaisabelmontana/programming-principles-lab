// flow.js — the control-flow tracer behind the "flow control & loops" demo,
// as a pure function. No DOM. Given n, a guard condition, and the action to
// take when the guard fires, it replays the loop and returns the event trace
// plus the final accumulated total.

/**
 * Guard predicates available in the demo's dropdown.
 * @param {'odd'|'even'|'ge3'} cond
 * @param {number} i loop index
 * @returns {boolean} whether the guard fires for this i
 */
export function guard(cond, i) {
  switch (cond) {
    case 'odd':  return i % 2 === 1;
    case 'even': return i % 2 === 0;
    case 'ge3':  return i >= 3;
    default:     return false;
  }
}

/**
 * Replay `total = 0; for i in range(n): if guard(i): <action>; total += i`.
 *
 *   action 'continue' → skip `total += i` for that i, keep looping
 *   action 'break'    → stop the loop entirely at that i
 *
 * @param {number} n loop bound (range(n) is 0..n-1)
 * @param {'odd'|'even'|'ge3'} cond guard condition
 * @param {'continue'|'break'} action what to do when the guard fires
 * @returns {{ total: number, trace: Array<{i:number|null,total:number,line:string,skip?:boolean,stop?:boolean,done?:boolean}> }}
 */
export function traceLoop(n, cond, action) {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('traceLoop expects a non-negative integer n');
  const trace = [];
  let total = 0;
  for (let i = 0; i < n; i++) {
    const hit = guard(cond, i);
    if (hit && action === 'break')    { trace.push({ i, total, line: 'break', stop: true }); break; }
    if (hit && action === 'continue') { trace.push({ i, total, line: 'continue', skip: true }); continue; }
    total += i;
    trace.push({ i, total, line: 'total += i' });
  }
  trace.push({ i: null, total, line: 'done', done: true });
  return { total, trace };
}

/**
 * Convenience wrapper returning just the final accumulated total.
 * @param {number} n
 * @param {'odd'|'even'|'ge3'} cond
 * @param {'continue'|'break'} action
 * @returns {number}
 */
export function loopTotal(n, cond, action) {
  return traceLoop(n, cond, action).total;
}
