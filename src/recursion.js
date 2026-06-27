// recursion.js — pure recursion algorithms extracted from the
// "call stack" and "memoization" demos. No DOM, no canvas.
//
// These are the exact computations the visualisations trace:
//   - factorial / fibonacci (the two functions in the call-stack tracer)
//   - the naive fib() invocation count (the memoization demo's call counter)
//   - a memoized fib() that performs only O(n) work

/**
 * Factorial: fact(n) = n! = n * (n-1) * ... * 1, with fact(0) = fact(1) = 1.
 * Mirrors the call-stack demo's `fact(k) = k <= 1 ? 1 : k * fact(k-1)`.
 * @param {number} n non-negative integer
 * @returns {number}
 */
export function factorial(n) {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('factorial expects a non-negative integer');
  return n <= 1 ? 1 : n * factorial(n - 1);
}

/**
 * Fibonacci by the naive two-call recurrence used in the demos:
 *   fib(0) = 0, fib(1) = 1, fib(k) = fib(k-1) + fib(k-2).
 * @param {number} n non-negative integer index
 * @returns {number}
 */
export function fibonacci(n) {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('fibonacci expects a non-negative integer');
  return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
}

/**
 * Number of fib() invocations in the *unmemoized* recursion tree for fib(n).
 * Each leaf (k < 2) is one call; internal nodes spawn two children. The closed
 * form is 2*fib(n+1) - 1 — the property the memoization demo displays as
 * "naive calls" and contrasts against the cached count.
 * @param {number} n non-negative integer
 * @returns {number}
 */
export function naiveFibCalls(n) {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('naiveFibCalls expects a non-negative integer');
  // iterative fib(n+1) so this stays cheap even for large n
  let a = 0, b = 1;
  for (let i = 0; i < n + 1; i++) { const t = a + b; a = b; b = t; }
  return 2 * a - 1; // a === fib(n+1) at loop end
}

/**
 * Memoized fibonacci. Returns both the value and the number of times the
 * recursive helper was entered, so callers can prove the cache collapses the
 * exponential tree to a linear number of calls.
 * @param {number} n non-negative integer
 * @returns {{ value: number, calls: number }}
 */
export function memoizedFib(n) {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('memoizedFib expects a non-negative integer');
  const cache = new Map();
  let calls = 0;
  function go(k) {
    calls++;
    if (cache.has(k)) return cache.get(k);
    const val = k < 2 ? k : go(k - 1) + go(k - 2);
    cache.set(k, val);
    return val;
  }
  return { value: go(n), calls };
}

/**
 * Minimum number of single-disk moves to solve Towers of Hanoi with n disks.
 * Classic recursion identity moves(n) = 2*moves(n-1) + 1 = 2^n - 1.
 * @param {number} n number of disks (>= 0)
 * @returns {number}
 */
export function hanoiMoves(n) {
  if (!Number.isInteger(n) || n < 0) throw new RangeError('hanoiMoves expects a non-negative integer');
  return n === 0 ? 0 : 2 * hanoiMoves(n - 1) + 1;
}
