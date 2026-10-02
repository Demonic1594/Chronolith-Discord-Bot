# Level 02 — Middle school: control flow and arrays

**Prerequisite:** 01. **Passing:** compose loops/filters blindfolded; never confuse the three if-forms.

## Lesson 1: the three condition worlds

1. **Condition fields** (inside `$if`, `$elseIf`, `$onlyIf`, `$while`, `$awaitComponent` filters): inline operators `== != < <= > >=`; no operator = compare against `"true"`. **No `&&`/`||`** — combine with `$and[...]/$or[...]` calls.
2. **`$checkCondition[expr]`** — evaluates one condition string → `true`/`false` text; nest these inside `$and`/`$or`.
3. **`$ifx[ block ]`** — chain assembler: put one `$if`, N `$elseIf`, one `$else` as SIBLINGS inside; first truthy branch runs. Multi-statement bodies live here.

```fs
$if[$get[n]>10;big;small]                          ← single expression choice
$ifx[
$if[$get[n]>=90;$let[grade;A]]
$elseIf[$get[n]>=80;$let[grade;B]]
$else[$let[grade;C]]
]                                                   ← chain
```

Raw-code laziness: untaken branches never execute (put expensive calls in the branch you're guarding).

## Lesson 2: `$loop` — the four-arg truth

`$loop[times; code; varName; asc]` — counter is **1-based** and lands in `$env[varName]`, RESET at each iteration's top. `asc` truthy counts 1→N; omitted/falsy counts **N→1**; `times: -1` = infinite (escape with `$break`). The universal 0-based idiom decrements inside:

```fs
$loop[$get[n];
  $let[i;$math[$env[i] - 1]]        ← 0-based index for THIS iteration
  ...$arrayAt[list;$get[i]]...
;i;true]
```

Infinite polling (production pattern): `$loop[-1; $if[$get[done];$break]$wait[5]; i;true]`.

## Lesson 3: arrays — named slots, map-and-filter

```fs
$arrayLoad[fruits;,;apple,banana,cherry]     ← split into env key
$arrayLoad[empty]                             ← bare = empty array
$arrayAt[fruits;0]          → apple           ← 0-based, negatives from the end
$arrayJoin[fruits;, ]       → apple, banana, cherry
$arrayPush[fruits;date]  $arrayLength[fruits]
```

**`$arrayMap[name; var; code; outputVar]` is map+filter**: only `$return` values survive (and they're JSON-parsed). Name the output the same as input → in-place filter:

```fs
$arrayMap[fruits;f;
  $if[$checkContains[$toLowerCase[$env[f]];an];$return[$env[f]]]
;fruits]        ← keeps only fruits containing "an"
```

`$arraySome/Every/Find/FindIndex/ForEach[name; var; code]` — predicate var lands in `$env[var]`. `$arrayMap` inside `$arrayFindIndex` predicates accepts a direct `$return[...]`.

## Lesson 4: `$switch` + `$case`

```fs
$switch[$get[mode];
  $case[fast;$let[speed;10]]
  $case[safe;$let[speed;2]]
  $default[$let[speed;5]]
]
```

## Exercises — READ

R1. `$if[$and[$get[a]==1;$get[b]==2];yes;no]` with a=1,b=3 → ?
R2. `$loop[3;$let[out;$env[out]x]]` — what's in `$env[out]` if unset before? (trick: think counter var)
R3. Filter `[5,3,8,1]` descending with `$arraySort[list;;desc]` → ? (note the empty slot — sortType is the THIRD arg)
R4. `$while[$checkCondition[$get[i]<3];$letSum[i;1]]$get[i]` from i=0 → ?

## Exercises — WRITE

W1. Sum only the even numbers of `$arrayLoad[ns;,;1,2,3,4,5,6]`.
W2. Print each member of `list` on its own line with its 1-based position (`#1 apple`).
W3. Retry-shaped loop: check `$getCache[api;done_$authorID]` every 5s up to 10 times; break when non-empty.

## Exercises — FIX

F1. `$if[$get[x]==1 && $get[y]==2;ok]` errors. Why, two ways to fix.
F2. Loop runs 3 times over `[a;b;c]` but `$arrayAt[list;$env[i]]` misses the last item. Why?
F3. `$arrayMap[list;x;$toUpperCase[$env[x]];out]` fills `out` with original casing. Why?

## Answer key

- R1: `no`.
- R2: Trick — `$env[out]` was never written by anything; `$loop` only sets the *counter* var (which this call didn't name). `$get[out]` is empty. Lesson: loops don't accumulate for you.
- R3: `8,5,3,1` — and if you called it `$arraySort[list;desc]`, `desc` landed in the *output variable* slot (2nd arg) and the sort never applied. Empty-arg slots between `;` are real args.
- R4: 3.
- W1: `$let[sum;0]$arrayForEach[ns;n;$if[$math[$env[n]%2]==0;$letSum[sum;$env[n]]]]$get[sum]`
- W2: `$loop[$arrayLength[list];$let[item;$arrayAt[list;$math[$env[i]-1]]]$let[out;$get[out]#$env[i] $get[item]\n];i;true]$get[out]` — counter 1-based, index decremented, lines appended via `$let` chaining (`\n` for line breaks; plain `#` in text needs no escape — only `$#fn` is a modifier).
- W3: `$let[t;0]$loop[10;$let[v;$getCache[api;done_$authorID]]$if[$get[v]!=;$break]$letSum[t;1]$wait[5];t;true]`
- F1: No `&&` in condition fields AND `$get[x]==1 && …` parses as one weird lhs. Fix: `$if[$and[$get[x]==1;$get[y]==2];ok]`.
- F2: Counter is 1-based; last iteration has `$env[i]=3` but the array's last index is 2. Apply the `-1` idiom.
- F3: Map collects **`$return` values only** — `$toUpperCase` returns normally but the map only pushes `$return`-typed results. Fix: `$arrayMap[list;x;$return[$toUpperCase[$env[x]]];out]`.

## Flashcards

| Prompt | Answer |
|---|---|
| `&&` / `||` in condition fields | don't exist — `$and[]` / `$or[]` |
| `$loop` counter base | 1 (reset every iteration) |
| `asc` omitted in `$loop` | counts DOWN |
| `$loop[-1;…]` | infinite — escape with `$break` |
| `$arrayMap` collects | only `$return` values (JSON-parsed) |
| Output var = input var in map | in-place filter |
| `$ifx` is | a sibling-chain assembler |
| Untaken `$if` branch | never executes (lazy raw code) |
