# Level 06 — PhD: the language itself

**Prerequisite:** 05. **Passing:** you can explain any behavior by compiling it in your head, predict drift, and reason about performance from first principles.

## Lesson 1: compilation as template construction

The compiler tokenizes with ONE giant regex (longest-name-first, case-insensitive) over registered names, builds a tree of `CompiledFunction`s, and replaces each call with a `[SYSTEM_FUNCTION(n)]` token in a generated JS template. Consequences you can *use*:

- Name shadowing is impossible by construction — longer names always win (`$username` never matches `$user`+`name`).
- Compilation is **per command load, cached** — runtime cost is all execution. Adding functions later (extensions, `functions.add`) doesn't recompile loaded commands → the "restart to apply" rule.
- Escapes are handled at tokenize time: `\X` yields literal X and skips a would-be match — this is why `\$` reliably defuses function-looking text.
- Condition fields are parsed with operator awareness at compile time; `==`/`!=` compare **stringified**, `<`-family compares numerically.

## Lesson 2: execution as container accumulation + type gates

Interpreter: top-level calls in order → each `unwrap:true` call resolves args (inner calls → type gate) → body runs → `Return` flows. The output message is `template(args)` — the code text with results interpolated. So:

- "Return values" are literally template substitutions. `$!fn` = substitution becomes empty. `$@[x]fn` = substitution becomes a count.
- Container mutation (embeds/components/choices/attachments) is the *other* output channel — order of side effects = order of execution, full stop.
- Return types: Success/Error/Stop/Return/Break/Continue. `$return` at top level ends the whole run and defines its content; Break/Continue only mean anything inside loops; Error aborts unless silenced — and silencing is *per-call*, which is why `$try` must wrap the *call*, not the "block" (raw-code bodies re-dispatch internally).

## Lesson 3: the type system is a resolver table

Every `resolve*` method is a tiny function from string → value or `undefined` (reject). Expert predictions come from *reading the resolver*, not memorizing outcomes: Emoji accepts CDN URLs because its resolver regexes them; Guild only sees cache because its resolver hits `guilds.cache.get`; Time parses `10m` via TimeParser and passes numbers through. When behavior surprises, the resolver is the 10-line answer. Pointers (`arg.pointer`) explain all "depends on earlier arg" behavior — resolution order is arg-array order.

## Lesson 4: performance reasoning

- Cost centers: API-touching resolvers (User/Channel/Message fetch), `$httpRequest`, loops with sends, `$djsEval` compile overhead (cached?), and serialization churn (`$jsonStringify` big objects in hot loops).
- Env is a plain object; `$env` path-walk is O(path). Big JSON in/out per command is fine; per *keystroke* (autocomplete!) it's not — autocomplete handlers must: fetch once → cache, scan with early exit at 25, avoid re-parsing per item.
- `$loop[-1]` polling: each `$wait` blocks that execution only — but the execution holds memory; bound your polls.
- Rate-limits (Discord): batch sends, defer+followUp instead of many replies, avoid message churn (edit one player message instead of resending).

## Lesson 5: drift engineering

Sources rank: maintainer code (intent) > source (mechanism) > metadata (declared) > docs prose (memory). Drift signals: `experimental`/`deprecated` flags (sparse in metadata, always in source), changelog versions vs npm pins, `#dev` vs `main`. My docs' own drift history (README shapes ×3, curated arg shapes ×3) is the cautionary dataset: **every example should cite its verification moment**. After any `refresh.sh`: re-diff the experimental list, re-grep your own recipes for changed shapes, re-run the curated sanity checker.

## Lesson 6: the validator's epistemology

The validator checks *syntax topology* (bracket balance, arg counts) but not semantics (unknown functions pass! types pass!) and false-positives after `$!#`/`$@[sep]` prefixes. Deep lesson: every linter has a blind model of the language — know the model, not just the messages. Your own reviews follow the same rule: state what you *actually verified* vs what you assumed.

## Doctoral exercises

D1. Without running: does `$if[$username[$authorID]==Nicky;hi]` inside `$function[…]` re-evaluate per call? Argue from compilation + lazy branch semantics.
D2. A command does 200 `$httpRequest`s in a `$loop`. Refactor three ways (cache table + interval; batch endpoint; JS bridge) and rank by user-perceived latency and rate-limit risk.
D3. `$mentioned[0]` returns a snowflake. `$userAvatar[$mentioned[0]]` sometimes still fails for left-server users. Explain via resolver (User vs Member types) and fix.
D4. Design the drift test-suite for a bot pinned to npm 2.7.1 (what do you re-verify after each upstream release, in what order?).
D5. Explain why `$try[$eval[...]]` catches eval-time function errors but not compile-time ones, from the two-phase pipeline.

## Answer key

- D1: The `$function[…]` body compiles once at load; per *call*, execution runs the `$if`'s chosen branch — condition side (`$username[$authorID]`) resolves only when that `$if` executes. So yes, fresh evaluation per call, but no recompilation — the cost model is "resolve per execution, compile once."
- D2: (a) interval→cache: user latency ~0, API load constant; (b) batch: latency 1 call, needs API support; (c) bridge: latency ~1 eval, moves rate-limit handling to JS where you can parallelize + backoff. Rank: batch > bridge > cache for correctness-per-latency; cache wins on API quota.
- D3: `$userAvatar` resolves a **User** (fetch works for any user ID); some avatar variants/paths prefer the **Member** object (guild-scoped). A user who left has no Member — guild-scoped resolvers miss (silent undefined → gate fail or empty). Fix: use user-scoped functions for left members; verify which scope each avatar function takes (its page's arg types).
- D4: Order: (1) experimental/deprecated diff → adopt/migrate list; (2) changelog pages for touched functions; (3) curated-example sanity checker over your command corpus; (4) validator re-run (syntax drift); (5) staging run of the 10 most-used commands.
- D5: Compile errors happen at load (whole command fails to register — `$try` never gets to run). Eval creates a *new* compilation at runtime whose errors surface as execution Returns — which `$try` intercepts. Two phases, two failure worlds.

## Flashcards

| Prompt | Answer |
|---|---|
| Name matching | single regex, longest-first, case-insensitive |
| Compile happens | once per load, cached |
| `$return` at top level | ends the run, defines output |
| Condition `==` compares | stringified values |
| Experimental flags live in | source + sparse metadata keys |
| Validator blind spots | unknown fns, types, `!#`/`@[sep]` cascades |
| Autocomplete perf rule | fetch once, cache, early-exit at 25 |
| Source ranking | maintainer code > source > metadata > prose |
