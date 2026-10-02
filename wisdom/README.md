# wisdom/ — my judgment layer (not facts)

`../knowledge/` is **what is true**: signatures, types, verbatim source, verified behavior.
This folder is **how I think about it**: mental models, patterns, debugging instincts, opinions, and the traps I've already fallen into (or nearly did) while building the knowledge base.

## The distinction that matters

- `knowledge/` answers "what does `$x` do?" — regenerated from upstream, safe to overwrite.
- `wisdom/` answers "what should I *do* about it?" — hand-written interpretation. **Never regenerate over this.**

Nothing here contradicts `knowledge/` on purpose; when they disagree, `knowledge/` (or the live source) wins and these files get fixed.

## Files

| File | What's in it |
|---|---|
| `mental-models.md` | The four framings that make ForgeScript predictable |
| `quick-reference.md` | The one-page cheat sheet to keep open while writing code (re-verified 2026-09-27) |
| `task-to-function-map.md` | Reverse index: "I want to do X" → the verified function (+ signature) |
| `function-relationships.md` | Ordering requirements, pairings, conflicts, context gates, side-effect classification, performance tiers |
| `idioms-and-patterns.md` | Code shapes I'd actually write, and anti-patterns to refuse |
| `debugging-playbook.md` | Symptom → root cause decision tree |
| `error-decoder.md` | Every error string I know, decoded into plain meaning + fix |
| `experimental-map.md` | The 25 experimental / 5 deprecated functions and how to treat them |
| `ecosystem-judgment.md` | My read on which of the 13 packages to trust for what |
| `security-notes.md` | The dangerous surfaces and how I'd guard them |
| `building-recipes.md` | Composite playbooks (economy, tickets, welcome cards, buttons) from verified functions |
| `timeout-system-deep-dive.md` | Patterns proven by real production code: 32-bit timer bypass, restart resumption, CustomID protocols, freeze/thaw code storage |
| `id-search-patterns.md` | Components V2 UI composition, mention-join trick, `$ifx` chain assembly, dual prefix/slash triggers, CustomID routing |
| `autocomplete-deep-dive.md` | Autocomplete pipeline, `$arrayMap` as map+filter (`$return`-only collection), `allowedInteractionTypes`, 25-choice guard |
| `custom-functions-two-systems.md` | ForgeFunctions vs local functions, `$callFunction` vs `$callFn` vs direct invocation, the naming trap |
| `migration-map.md` | aoi.js/BDFD/DBScript → ForgeScript cheat sheet: 0-based indexes, textSplit vs arrays, response-containers, names that don't exist |
| `amc-production-audit.md` | Deployed music bot audit (2.7.1 pinned): 221 fns verified, Edge extension discovery, `$loop[-1]`, param-after-code `$localFunction`, hybrid TS architecture |
| `starter-kit-audit.md` | Starter bot audit: the `type:`-required correction, dynamic compiled prefixes resolved per message, prefixMode/nameCaseInsensitive, `$chalkLog` |
| `forgescriptbot-maintainer-canon.md` | The lead dev's own bot: class-instance exports, `$httpRequest` status-code return, maintainer eval shape, autocomplete-at-scale, sparse metadata flags crosscheck |
| `community-ecosystem-field-study.md` | 8 community bots + 5 extensions, verified-then-studied (2026-09-28): the `$pingms` ghost, error-catalog i18n, interaction author-locking, `forge.timers` supremacy, starboard/sticky automations, security case studies |
| `meta-lessons.md` | What I learned maintaining this KB: API rate limits, the validator's lies, drift discipline |
| `study/` | The curriculum: kindergarten→PhD levels (READ/WRITE/FIX tracks), doctoral exam, generated drill banks, progress ledger |

## The one-liner versions (if I only had 30 seconds)

1. ForgeScript is a **template engine with side effects**, not a programming language — stop expecting language semantics and its quirks become obvious.
2. Most "bugs" are **type coercion** or **pointer order** — check `../knowledge/core/arg-types.md` before anything else.
3. The whole modern control-flow layer (`$while`, `$ifx`, `$try`, all cooldowns) is **experimental in source** — the docs site doesn't say so.
4. `$suppressErrors` **does not exist** here (it's an aoi.js thing). People will ask for it constantly. The real tools: `$#fn`, `$try[code;catch;errVar]`.
5. The BotForge **validator misses unknown functions and type errors entirely**, and lies after `$!#`/`$@[sep]` prefixes — never treat a clean report as proof.
6. **Ghost names are the #1 real-world failure** (`$pingms` in 6 of 8 community bots): unknown names compile as literal text and die at runtime. Triage unknowns: alias → private extension → concatenation → local def → typo.
7. Community quality is uncorrelated with stars — **verify the mechanism, never the README** (`forge.timers` at 0★ outbuilds everything; see `community-ecosystem-field-study.md`).
