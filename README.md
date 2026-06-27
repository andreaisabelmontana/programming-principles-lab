# programming-principles-lab

Interactive companion for *Principles of Programming* (BCSAI, IE University). Ten self-contained canvas demos, one per core idea (Python: paradigms, evaluation, scope, data structures, NumPy).

**Live:** https://andreaisabelmontana.github.io/programming-principles-lab/

## Demos

Module 1 — Fundamentals
1. How code runs — step a compiled vs interpreted pipeline and compare CPU work + portability
2. Flow control & loops — trace a `for` loop with an `if` guard and `break` / `continue`, watching the running total
3. Recursion & the call stack — step `factorial(n)` / `fibonacci(n)` while frames push and pop
4. Recursion tree & memoization — naive `fib(n)` vs a cached version; compare the exploding call count to the linear one
5. Scope, lifetime & closures — LEGB name resolution

Module 1 (functional tools)
6. Higher-order functions — `map` / `filter` / `reduce`, animated element by element
7. Eager vs lazy evaluation — a list builds everything up front; a generator computes only what a `take(k)` consumer pulls

Module 2 — Data structures
8. Mutability & side effects — `append` vs rebinding vs copying vs immutable `int` (pass-by-reference)
9. Dictionaries as hash maps — hash a key, `hash % buckets` picks a slot, collisions chain; watch the load factor

Module 4 — Advanced
10. NumPy vectorization & broadcasting — element-wise ops; broadcast a smaller shape or detect incompatible shapes

Plain HTML + canvas + KaTeX. Indigo accent. Zero build step.

## Tested algorithm kernels

The genuinely-algorithmic parts of the demos are extracted into DOM-free ES modules under [`src/`](src/) and exercised by [`test/`](test/) using Node's built-in test runner — no dependencies. `index.html` loads `src/app.js`, which imports these same modules, so the page runs the exact code the tests cover.

| Module | Exports | What's proven |
|---|---|---|
| [`src/recursion.js`](src/recursion.js) | `factorial`, `fibonacci`, `naiveFibCalls`, `memoizedFib`, `hanoiMoves` | `factorial(5)=120`; fib matches the known sequence and its recurrence; naive fib call count `= 2·fib(n+1)−1`; memoizing collapses the tree to ≤ `2n+1` calls; Hanoi moves `= 2ⁿ−1` |
| [`src/flow.js`](src/flow.js) | `guard`, `traceLoop`, `loopTotal` | the guarded `for` loop accumulates correctly under `continue` (skip) and `break` (stop); trace ends with a `done` marker carrying the final total |
| [`src/hof.js`](src/hof.js) | `inputList`, `mapSquares`, `filterEvens`, `reduceSum`, `runPipeline` | `map(x²)`, `filter(even)`, and `reduce(sum)` over `[1..n]` return hand-checked results (e.g. `reduce` = `n(n+1)/2`) |
| [`src/hashmap.js`](src/hashmap.js) | `hashStr`, `slotFor`, `HashMap` | djb2 hash is deterministic and 32-bit; `slotFor` always lands in `[0, buckets)`; `put` is set-like; load factor, collision count, and chaining behave as specified |
| [`src/broadcasting.js`](src/broadcasting.js) | `broadcast`, `isBroadcastable` | NumPy's rule: each axis must be equal or 1; scalars/rows/columns stretch; incompatible shapes return `null` |

Scope (LEGB), the execution-model pipeline, lazy `take(k)`, and the mutability/pass-by-reference cases are conceptual visualisations rather than algorithms, so they are demonstrated in the page but not unit-tested.

## Run

Open `index.html` (or visit the live link). No build step.

Run the tests with Node 24+:

```
node --test
```

```
✔ scalar broadcasts against anything
✔ row and column stretch to fill a matrix
✔ equal shapes pass through unchanged
✔ incompatible trailing dimensions return null
✔ isBroadcastable mirrors broadcast() != null
✔ guard predicates
✔ continue: skips the guarded indices but keeps looping
✔ break: stops the loop the first time the guard fires
✔ no guard fires → plain sum of 0..n-1
✔ trace ends with a done marker carrying the final total
✔ break trace contains a stop event and nothing after it
✔ hashStr is deterministic and in unsigned 32-bit range
✔ slotFor always lands inside [0, buckets)
✔ put is set-like — duplicates are not stored twice
✔ keys land in the bucket slotFor predicts
✔ load factor = stored keys / buckets
✔ collisions counted as sum of (chainLength - 1)
✔ inputList builds [1..n]
✔ map(x => x*x)
✔ filter(x => x % 2 === 0)
✔ reduce((a,x) => a + x)
✔ runPipeline dispatches to the right operation over [1..n]
✔ factorial — base cases and known values
✔ factorial — rejects negatives and non-integers
✔ fibonacci — matches the known sequence
✔ fibonacci — satisfies its own recurrence fib(n)=fib(n-1)+fib(n-2)
✔ naiveFibCalls — equals 2*fib(n+1)-1 (the unmemoized tree size)
✔ memoizedFib — same value as fibonacci but O(n) calls
✔ hanoiMoves — equals 2^n - 1
ℹ tests 29
ℹ pass 29
ℹ fail 0
```

Part of the *-lab series: [discrete-math-lab](https://github.com/andreaisabelmontana/discrete-math-lab) · [prob-stats-lab](https://github.com/andreaisabelmontana/prob-stats-lab) · [business-lab](https://github.com/andreaisabelmontana/business-lab) · [research-methods-lab](https://github.com/andreaisabelmontana/research-methods-lab) · [big-history-lab](https://github.com/andreaisabelmontana/big-history-lab)
