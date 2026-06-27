import test from 'node:test';
import assert from 'node:assert/strict';
import { inputList, mapSquares, filterEvens, reduceSum, runPipeline } from '../src/hof.js';

test('inputList builds [1..n]', () => {
  assert.deepEqual(inputList(1), [1]);
  assert.deepEqual(inputList(6), [1, 2, 3, 4, 5, 6]);
  assert.throws(() => inputList(0), RangeError);
});

test('map(x => x*x)', () => {
  assert.deepEqual(mapSquares([1, 2, 3, 4]), [1, 4, 9, 16]);
  assert.deepEqual(mapSquares([]), []);
});

test('filter(x => x % 2 === 0)', () => {
  assert.deepEqual(filterEvens([1, 2, 3, 4, 5, 6]), [2, 4, 6]);
  assert.deepEqual(filterEvens([1, 3, 5]), []);
});

test('reduce((a,x) => a + x)', () => {
  assert.equal(reduceSum([1, 2, 3, 4, 5]), 15);
  assert.equal(reduceSum([]), 0);
  // sum of 1..n is n(n+1)/2
  for (const n of [3, 6, 9]) {
    assert.equal(reduceSum(inputList(n)), (n * (n + 1)) / 2);
  }
});

test('runPipeline dispatches to the right operation over [1..n]', () => {
  assert.deepEqual(runPipeline('map', 4), [1, 4, 9, 16]);
  assert.deepEqual(runPipeline('filter', 6), [2, 4, 6]);
  assert.equal(runPipeline('reduce', 5), 15);
  assert.throws(() => runPipeline('nope', 3), /unknown op/);
});
