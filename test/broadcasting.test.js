import test from 'node:test';
import assert from 'node:assert/strict';
import { broadcast, isBroadcastable } from '../src/broadcasting.js';

test('scalar broadcasts against anything', () => {
  assert.deepEqual(broadcast([1, 1], [3, 3]), [3, 3]);
  assert.deepEqual(broadcast([3, 3], [1, 1]), [3, 3]);
});

test('row and column stretch to fill a matrix', () => {
  assert.deepEqual(broadcast([1, 3], [3, 1]), [3, 3]); // row × column → 3×3
  assert.deepEqual(broadcast([3, 3], [1, 3]), [3, 3]); // matrix + row
  assert.deepEqual(broadcast([3, 3], [3, 1]), [3, 3]); // matrix + column
});

test('equal shapes pass through unchanged', () => {
  assert.deepEqual(broadcast([3, 3], [3, 3]), [3, 3]);
  assert.deepEqual(broadcast([1, 2], [1, 2]), [1, 2]);
});

test('incompatible trailing dimensions return null', () => {
  assert.equal(broadcast([1, 3], [1, 2]), null);  // 3 vs 2, neither is 1
  assert.equal(broadcast([2, 3], [3, 3]), null);  // rows 2 vs 3
  assert.equal(isBroadcastable([1, 3], [1, 2]), false);
});

test('isBroadcastable mirrors broadcast() != null', () => {
  assert.equal(isBroadcastable([1, 1], [3, 3]), true);
  assert.equal(isBroadcastable([1, 3], [3, 1]), true);
  assert.equal(isBroadcastable([3, 3], [1, 2]), false);
});
