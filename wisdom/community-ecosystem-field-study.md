# Community ecosystem field study — 8 bots + 5 extensions, verified then learned from

> Session 2026-09-28, user-mandated: search GitHub for ForgeScript-made bots, **verify them first**, then learn. Method: GitHub search `forgescript bot` → 18 hits → every candidate verified (package.json dep `forgescript`/`@tryforge/forgescript` or real `ForgeClient` + `$`-code) → every function call in every repo cross-checked against the KB ground truth (source_map.json keys + all extension metadata + alias stubs). Full raw reports preserved in this session's audit files; this is the distilled wisdom.

## The verdict table

| Repo | ★ | Verified | FS version | One-line read |
|---|---|---|---|---|
| ddodogames/Dodo-Bot | 20 | yes | `^2.6.0` | Most mature of the set: dynamic prefix, author-locked menus, gated unsafe trio |
| blizzymoe/ForgeScript-Bot-Template | 4 | yes | git, unpinned | Minimal, clean, 0 flagged calls — the canonical starter |
| LynnuxDev/Akira | 1 | yes | `#dev` (TS) | Most sophisticated: error-catalog/i18n, per-user+guild prefixes, modal wizards |
| nyxcoding/Simple-Bot | 0 | yes | no pkg.json | 3-file demo of the three loaders; slash→event reuse via `$function[pingEvent]` |
| Aurea6/Chronium | 0 | code yes / **cannot boot** | `^1.5.0` | `new ForgeClient{...}` syntax error, invalid config.json, deprecated `ready` event — cautionary |
| Kiko-Labs/Kiko-San | 0 | yes | `#dev` | "LIMITER" guard convention, deterministic zero-pad URLs, self-validating custom fns |
| UndefinedBlastro/ayra | 0 | yes (template fork) | git | Sticky-confess + starboard; **live bot token committed** |
| bucu0368/Discord-Bot-Forgescript | 0 | yes | no pkg.json | Full AI-chat in FS incl. cookie harvest + UA spoof (ToS-gray) |
| user-lezi/fsgames | 3 | yes (extension) | `^2.1.0` | 13 fns, builder DSL showcase |
| xloxn69/ForgePages | 3 | yes (extension) | `^2.3.0` | In-memory array paging, NOT button pagination |
| Tape490/ForgeCron | 1 | yes (extension) | peer | `$cron`/`$deleteCron`, in-memory, buggy, name-collides with forge.timers |
| Daaisukidayo/ForgeTimers | 0 | yes, **on npm** (`forge.timers`) | ≥2.7.0 | Production-grade timer persistence — supersedes our hand-rolled wisdom |
| Demonic1594/Chronolith | 1 | yes | upstream `^1.4.0` | Upstream = abandoned 2024 skeleton; the local `/workspace/Chronolith-Discord-Bot` rewrite (2.7.1, 135 cmds) is the real artifact |

## What the cross-check proved (and disproved)

1. **Community code never over-signatures.** Automated arity scan of *every call in every repo*: zero calls exceeding documented signatures. The failure mode of real-world ForgeScript is **unknown names**, not wrong arity. Linters and reviews should prioritize name existence.
2. **The `$pingms` ghost is endemic.** 6 of 8 bots call `$pingms`/`$pingMS`/`$httpPingms` — a Discord Bot Maker folklore name that never existed in ForgeScript (verified absent at every tag 1.5.0→2.7.1 and in all aliases; real: `$ping`, `$httpPing`). Because unknown names pass through as literal text (not compile errors), these bots' ping commands silently break at runtime. Now in `error-decoder.md` and `migration-map.md`.
3. **"Unknown function" has four benign explanations before it's a typo** — in observed frequency order: alias (`$clientToken`), private extension (forge.quirks), concatenation artifact (`$commandName_$authorID` cooldown keys are *valid* — function-name charset excludes `_`), custom local definition. Audit tooling must decompose unknowns before flagging.
4. **Verification protocol that worked** (reusable): (a) package.json dep or `require` proves the framework; (b) record pinned version — claims must be checked against *that* tag, not main; (c) extract every `$token`, diff against canonical + alias + extension sets; (d) decompose remainder (concat/case/customs); (e) only then read architecture. Two bots would have produced false "ghost" reports if step (d) had been skipped.

## Patterns worth adopting (all verified in source, not README claims)

1. **Error-catalog + i18n pipeline** (Akira `customError.ts`): `errors.json` of numeric codes → `$jsonLoad[result;$readFile[./files/errors.json]]` → `$env[result;$id;meaning]` → cascaded `$replace` for `{{prefix}}`/`{{command}}` placeholders. i18n-ready error handling in pure FS.
2. **Interaction routing** (Dodo-Bot + Akira): `allowedInteractionTypes` filter + CustomID namespace with author-lock segment (see `id-search-patterns.md`).
3. **Sticky messages & starboard** via nameless unprefixed / `messageReactionAdd` commands (ayra — 2 lines each, see `id-search-patterns.md`).
4. **Deterministic no-parse API access** (Kiko-San): `$randomNumber` + zero-pad → direct `img_$get[num].gif` URL, with a separate status-only GET as preflight — zero JSON parsing at render time, immune to API shape drift.
5. **Custom functions that self-validate** (Kiko-San `FindUser.js`, fsgames setters): emit styled usage embeds on bad params instead of failing opaquely; refuse to run outside their intended scope.
6. **Per-guild AND per-user prefixes as callables** (Dodo `$getGuildVar[prefix]`; Akira `$callFunction[prefix]` with encrypted-key guild lookup → user var → global default fallback chain).
7. **Error escalation by size** (Dodo): `$if[$charCount[$error]>=4000; → $attachment[error.txt] ; → embed]` — Discord's 4,000-char embed limit turned into routing logic.
8. **Env-key accumulator builder DSL** (fsgames) and **whole-context snapshot persistence** (forge.timers) — see `custom-functions-two-systems.md` and `timeout-system-deep-dive.md`.

## Security observations (aggregate)

- **One live token committed** (ayra index.js — grep pattern `MT[A-Za-z0-9]{20,}\.` finds Discord tokens in seconds).
- `$eval`/`$djsEval`/`$exec` present in 5/8 bots — all owner/team-gated except the cautionary Chronium (allowlist-by-ID, acceptable).
- Unofficial API scraping with cookie-harvest + Chrome-UA spoof (blackbox.ai) — works, but ToS-gray and fragile; flag on sight in reviews.
- Env-secret baked into FS code strings (Akira customEncrypt) — functional but expands secret surface into any `$debug`/error dump.

## Meta-lessons for studying community code

- **Stars ≠ quality**: the 0★ ForgeTimers is the best-engineered repo found; the 20★ bot carries ghost calls. Judge by test files, metadata completeness, and pinned deps.
- **READMEs mislead even here**: ForgePages' description reads like button pagination; it isn't. Verify mechanism, don't trust description.
- **Forks inherit package names** (ayra still says "ForgeScript-Bot-Template") — check git lineage before crediting patterns.
- **Upstream vs local clones can be different worlds** (Chronolith): establish which artifact you're actually reading before drawing conclusions.
- A bot that "looks complete" may not boot at all (Chronium) — `node --check` every entry file before studying behavior claims.
