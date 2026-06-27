import test from 'node:test';
import assert from 'node:assert/strict';
import { hashStr, slotFor, HashMap } from '../src/hashmap.js';

test('hashStr is deterministic and in unsigned 32-bit range', () => {
  const a = hashStr('cat');
  const b = hashStr('cat');
  assert.equal(a, b);                 // same input → same hash
  assert.ok(a >= 0 && a <= 0xffffffff);
  assert.notEqual(hashStr('cat'), hashStr('dog'));
  assert.equal(hashStr(''), 5381);    // djb2 seed for the empty string
});

test('slotFor always lands inside [0, buckets)', () => {
  for (const key of ['cat', 'dog', 'fox', 'elephant', 'zebra', 'antelope']) {
    for (const b of [4, 8, 12]) {
      const s = slotFor(key, b);
      assert.ok(Number.isInteger(s) && s >= 0 && s < b, `${key} % ${b} = ${s}`);
      assert.equal(s, hashStr(key) % b);
    }
  }
  assert.throws(() => slotFor('cat', 0), RangeError);
});

test('put is set-like — duplicates are not stored twice', () => {
  const m = new HashMap(8);
  assert.equal(m.put('cat'), true);
  assert.equal(m.put('cat'), false);  // already present
  assert.equal(m.put('  '), false);   // blank ignored
  assert.equal(m.count(), 1);
  assert.equal(m.has('cat'), true);
  assert.equal(m.has('dog'), false);
});

test('keys land in the bucket slotFor predicts', () => {
  const m = new HashMap(8);
  for (const k of ['cat', 'dog', 'fox']) {
    m.put(k);
    assert.ok(m.buckets[slotFor(k, 8)].some(it => it.key === k));
  }
  assert.equal(m.count(), 3);
});

test('load factor = stored keys / buckets', () => {
  const m = new HashMap(4);
  m.put('a'); m.put('b'); m.put('c');
  assert.equal(m.count(), 3);
  assert.equal(m.loadFactor(), 3 / 4);
});

test('collisions counted as sum of (chainLength - 1)', () => {
  // a single bucket forces every key after the first to collide
  const m = new HashMap(1);
  m.put('cat'); m.put('dog'); m.put('fox');
  assert.equal(m.count(), 3);
  assert.equal(m.collisions(), 2);    // 3 keys in one bucket → 2 collisions
  // an empty map has no collisions
  assert.equal(new HashMap(8).collisions(), 0);
});
