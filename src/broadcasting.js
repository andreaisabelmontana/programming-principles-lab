// broadcasting.js — the NumPy broadcasting rule from the "NumPy" demo, as a
// pure function over 2-D shapes [rows, cols]. No DOM.

/**
 * Apply NumPy's broadcasting rule to two 2-D shapes. Each (trailing) dimension
 * must be equal or one of them must be 1; the result takes the larger of the
 * two along each axis. Returns null when the shapes are incompatible.
 * @param {[number, number]} a shape [rows, cols]
 * @param {[number, number]} b shape [rows, cols]
 * @returns {[number, number]|null} broadcast result shape, or null if incompatible
 */
export function broadcast(a, b) {
  const [ar, ac] = a, [br, bc] = b;
  const rowsOk = ar === br || ar === 1 || br === 1;
  const colsOk = ac === bc || ac === 1 || bc === 1;
  if (!rowsOk || !colsOk) return null;
  return [Math.max(ar, br), Math.max(ac, bc)];
}

/** @returns {boolean} whether two 2-D shapes are broadcast-compatible. */
export function isBroadcastable(a, b) {
  return broadcast(a, b) !== null;
}
