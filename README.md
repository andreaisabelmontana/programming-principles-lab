# programming-principles-lab

Visual principles of programming. 10 self-contained demos, one per core idea from the IE BCSAI *Principles of Programming* course (Python: paradigms, evaluation, scope, data structures, NumPy).

**Live:** https://andreaisabelmontana.github.io/programming-principles-lab/

Module 1 — Fundamentals
1. How code runs — step a compiled vs interpreted pipeline (lex → parse → compile → run vs read-line → interpret) and compare CPU work + portability
2. Flow control & loops — trace a `for` loop with an `if` guard and `break` / `continue`, watching the running total
3. Recursion & the call stack — step `factorial(n)` / `fibonacci(n)` while frames push and pop
4. Recursion tree & memoization — naive `fib(n)` vs a cached version; compare the exploding call count to the linear one
5. Scope, lifetime & closures — LEGB name resolution: local shadowing, reading globals, closures capturing an enclosing variable, and the `global` keyword

Module 1 (functional tools) — Higher-order functions & lazy evaluation
6. Higher-order functions — `map` / `filter` / `reduce` with a `lambda`, animated element by element through the pipeline
7. Eager vs lazy evaluation — a list builds everything up front; a generator with `yield` computes only what a `take(k)` consumer pulls

Module 2 — Data structures
8. Mutability & function side effects — `append` (mutate in place) vs rebinding vs copying vs immutable `int`; see what the caller observes (pass-by-reference)
9. Dictionaries as hash maps — hash a key, `hash % buckets` picks a slot, collisions chain; watch the load factor

Module 4 — Advanced (NumPy)
10. NumPy vectorization & broadcasting — element-wise ops across arrays; broadcast a smaller shape to match, or detect incompatible shapes

Plain HTML + canvas + KaTeX. Indigo accent. Zero build step.

Part of the *-lab series: [discrete-math-lab](https://github.com/andreaisabelmontana/discrete-math-lab) · [prob-stats-lab](https://github.com/andreaisabelmontana/prob-stats-lab) · [business-lab](https://github.com/andreaisabelmontana/business-lab) · [research-methods-lab](https://github.com/andreaisabelmontana/research-methods-lab) · [big-history-lab](https://github.com/andreaisabelmontana/big-history-lab)
