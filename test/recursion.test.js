import test from 'node:test';
import assert from 'node:assert/strict';
import { factorial, fibonacci, naiveFibCalls, memoizedFib, hanoiMoves } from '../src/recursion.js';

test('factorial — base cases and known values', () => {
  assert.equal(factorial(0), 1);
  assert.equal(factorial(1), 1);
  assert.equal(factorial(5), 120);   // the headline check
  assert.equal(factorial(6), 720);
  assert.equal(factorial(10), 3628800);
});

test('factorial — rejects negatives and non-integers', () => {
  assert.throws(() => factorial(-1), RangeError);
  assert.throws(() => factorial(2.5), RangeError);
});

test('fibonacci — matches the known sequence', () => {
  const expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
  for (let i = 0; i < expected.length; i++) {
    assert.equal(fibonacci(i), expected[i], `fib(${i})`);
  }
});

test('fibonacci — satisfies its own recurrence fib(n)=fib(n-1)+fib(n-2)', () => {
  for (let n = 2; n <= 15; n++) {
    assert.equal(fibonacci(n), fibonacci(n - 1) + fibonacci(n - 2));
  }
});

test('naiveFibCalls — equals 2*fib(n+1)-1 (the unmemoized tree size)', () => {
  for (let n = 0; n <= 12; n++) {
    assert.equal(naiveFibCalls(n), 2 * fibonacci(n + 1) - 1, `n=${n}`);
  }
  // small explicit values
  assert.equal(naiveFibCalls(0), 1);
  assert.equal(naiveFibCalls(1), 1);
  assert.equal(naiveFibCalls(5), 15);
});

test('memoizedFib — same value as fibonacci but O(n) calls', () => {
  for (let n = 0; n <= 20; n++) {
    const { value, calls } = memoizedFib(n);
    assert.equal(value, fibonacci(n), `value at n=${n}`);
    // memoized helper is entered at most 2n+1 times — far below the exponential naive count
    assert.ok(calls <= 2 * n + 1, `calls=${calls} should be linear for n=${n}`);
  }
  // and it is dramatically cheaper than the naive tree for a moderate n
  assert.ok(memoizedFib(15).calls < naiveFibCalls(15));
});

test('hanoiMoves — equals 2^n - 1', () => {
  for (let n = 0; n <= 16; n++) {
    assert.equal(hanoiMoves(n), 2 ** n - 1, `n=${n}`);
  }
  assert.equal(hanoiMoves(3), 7);
  assert.equal(hanoiMoves(10), 1023);
});
