// hashmap.js — the dictionary/hash-map model behind the "hash maps" demo:
// a deterministic string hash, slot selection by hash % buckets, and separate
// chaining with load-factor / collision accounting. No DOM.

/**
 * Deterministic djb2-style string hash (the demo's `hashStr`).
 * Folds with `(h * 33) ^ charCode`, kept in unsigned 32-bit range so results
 * are reproducible across runs and machines.
 * @param {string} s
 * @returns {number} unsigned 32-bit hash
 */
export function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h;
}

/** Slot index for a key in a table of `buckets` buckets: hash(key) % buckets. */
export function slotFor(key, buckets) {
  if (!Number.isInteger(buckets) || buckets < 1) throw new RangeError('buckets must be a positive integer');
  return hashStr(key) % buckets;
}

/**
 * A minimal separate-chaining hash map over string keys. Mirrors the demo:
 * each key hashes to a slot; duplicate keys are ignored; multiple keys in one
 * slot chain together (a collision).
 */
export class HashMap {
  /** @param {number} buckets number of buckets (>= 1) */
  constructor(buckets = 8) {
    if (!Number.isInteger(buckets) || buckets < 1) throw new RangeError('buckets must be a positive integer');
    this.buckets = Array.from({ length: buckets }, () => []);
  }

  /** @returns {number} number of buckets */
  get size() { return this.buckets.length; }

  /** Slot a key would land in. */
  slot(key) { return hashStr(key) % this.buckets.length; }

  /**
   * Insert a key (set semantics — duplicates are not stored twice).
   * @returns {boolean} true if newly added, false if it was already present or empty
   */
  put(key) {
    key = (key || '').trim();
    if (!key) return false;
    const chain = this.buckets[this.slot(key)];
    if (chain.some(it => it.key === key)) return false;
    chain.push({ key, hash: hashStr(key) });
    return true;
  }

  /** @returns {boolean} whether the key is present. */
  has(key) {
    key = (key || '').trim();
    if (!key) return false;
    return this.buckets[this.slot(key)].some(it => it.key === key);
  }

  /** @returns {number} total number of stored keys. */
  count() {
    return this.buckets.reduce((sum, chain) => sum + chain.length, 0);
  }

  /** @returns {number} load factor = stored keys / buckets. */
  loadFactor() {
    return this.count() / this.buckets.length;
  }

  /**
   * @returns {number} number of collisions = sum over buckets of
   * max(0, chainLength - 1) (every key beyond the first in a bucket collided).
   */
  collisions() {
    return this.buckets.reduce((sum, chain) => sum + Math.max(0, chain.length - 1), 0);
  }
}
