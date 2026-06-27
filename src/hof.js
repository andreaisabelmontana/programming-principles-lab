// hof.js — the map / filter / reduce pipeline from the "higher-order
// functions" demo, as pure functions over the input list 1..n.

/** Build the demo's input list [1, 2, ..., n]. */
export function inputList(n) {
  if (!Number.isInteger(n) || n < 1) throw new RangeError('inputList expects a positive integer');
  return Array.from({ length: n }, (_, i) => i + 1);
}

/** map(x => x*x) over a list. */
export function mapSquares(xs) {
  return xs.map(x => x * x);
}

/** filter(x => x % 2 === 0) over a list. */
export function filterEvens(xs) {
  return xs.filter(x => x % 2 === 0);
}

/** reduce((a, x) => a + x, 0) over a list (sum). */
export function reduceSum(xs) {
  return xs.reduce((a, x) => a + x, 0);
}

/**
 * Run one of the three pipeline operations the demo offers over [1..n].
 * @param {'map'|'filter'|'reduce'} op
 * @param {number} n list length
 * @returns {number[]|number} array for map/filter, scalar for reduce
 */
export function runPipeline(op, n) {
  const xs = inputList(n);
  switch (op) {
    case 'map':    return mapSquares(xs);
    case 'filter': return filterEvens(xs);
    case 'reduce': return reduceSum(xs);
    default:       throw new Error(`unknown op: ${op}`);
  }
}
