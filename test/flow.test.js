import test from 'node:test';
import assert from 'node:assert/strict';
import { guard, traceLoop, loopTotal } from '../src/flow.js';

test('guard predicates', () => {
  assert.equal(guard('odd', 3), true);
  assert.equal(guard('odd', 4), false);
  assert.equal(guard('even', 4), true);
  assert.equal(guard('even', 3), false);
  assert.equal(guard('ge3', 3), true);
  assert.equal(guard('ge3', 2), false);
});

test('continue: skips the guarded indices but keeps looping', () => {
  // n=6, skip odds, action=continue → total = 0+2+4 = 6
  assert.equal(loopTotal(6, 'odd', 'continue'), 6);
  // skip evens → total = 1+3+5 = 9
  assert.equal(loopTotal(6, 'even', 'continue'), 9);
});

test('break: stops the loop the first time the guard fires', () => {
  // n=6, break when i>=3 → adds 0+1+2 then stops = 3
  assert.equal(loopTotal(6, 'ge3', 'break'), 3);
  // break on first odd (i=1) → only 0 added
  assert.equal(loopTotal(6, 'odd', 'break'), 0);
  // break on first even (i=0) → nothing added
  assert.equal(loopTotal(6, 'even', 'break'), 0);
});

test('no guard fires → plain sum of 0..n-1', () => {
  // ge3 with n=3 never... actually i reaches 2 only, guard ge3 never fires
  assert.equal(loopTotal(3, 'ge3', 'break'), 0 + 1 + 2);
  assert.equal(loopTotal(3, 'ge3', 'continue'), 0 + 1 + 2);
});

test('trace ends with a done marker carrying the final total', () => {
  const { trace, total } = traceLoop(6, 'odd', 'continue');
  const last = trace[trace.length - 1];
  assert.equal(last.done, true);
  assert.equal(last.total, total);
  assert.equal(total, 6);
});

test('break trace contains a stop event and nothing after it', () => {
  const { trace } = traceLoop(6, 'ge3', 'break');
  const stopIdx = trace.findIndex(e => e.stop);
  assert.ok(stopIdx >= 0, 'has a stop event');
  // only the terminal "done" follows the stop
  assert.equal(trace.length, stopIdx + 2);
  assert.equal(trace[trace.length - 1].done, true);
});
