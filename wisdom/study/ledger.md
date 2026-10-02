# Study ledger — session log

Log every study session: date, level/track, score, and — the part that matters — **which rule each miss violated** (rule-misses, not answer-misses, are the curriculum).

| Date | Level | Track | Score | Rule-misses (cite the rule, not the answer) |
|---|---|---|---|---|
| 2026-09-27 | all (00–06 + exam) | corpus read + banks | banks 3/3 sampled; 8 self-fossils found & fixed | see below |

### 2026-09-27 — full-corpus study pass

- attempted: read 100% of `wisdom/` (17 files + study/), `knowledge/core/` (5), all indexes + validate/tools READMEs; banks 1–3 sampled cold (3 items each, all correct against answer keys); existence-swept ~200 function names cited in new writings; re-verified headline stats (46 categories · 79 events · 96 enums · 25 experimental + 5 deprecated · 1120+388 functions — all confirmed, one README stat fixed)
- results: banks clean; the *curated examples* were what failed — 8 defects in 7 files, all fixed same day (see `../meta-lessons.md` audit #9)
- misses (rules violated by my own prior files):
  - `$reply[...;no]` aoi-shape in 2 files → rule: "metadata signature + execute() outrank remembered shapes" (arg-types: Channel gate would reject)
  - `$addButton[...;success;false;]` in 4 files → rule: "Enum args are exact keys — ButtonStyle is PascalCase"; also `false` occupied the emoji slot (positional contract)
  - `$webhookExecute` / `$interactionData` / `$onlyNSFW` / `$numberWithCommas` cited without existing → rule: "existence-check every name before writing it" (`find knowledge -name '$fn.md'`)
  - select menu with no `$addOption` → rule: "a select without options is dead UI"
  - "+188 alias files" stat vs actual 388 → rule: "count from the tree, not from memory"
- promoted drills: none — fixes applied at the source files instead (the misses were authoring-discipline failures, not recall failures)
- additions: `../quick-reference.md`, `../task-to-function-map.md` (both fully signature-verified today)
- next session: re-run exam-comprehensive cold after the next `refresh.sh` cycle; add "derive every arg position from the page" to the pre-ship checklist


## Miss-pattern tracker

When the same rule appears in three sessions, promote it: write a dedicated drill for it in this folder (hand-written, e.g. `drill-0based.md`) until it stops recurring.

## Session template

```
## YYYY-MM-DD — level NN, track READ/WRITE/FIX
- exercises attempted: R1-R4, W1-W2, F1-F3
- results: 7/9
- misses:
  - F2 → rule: "$message is 0-based over user args" (level 01, lesson 4)
- promoted drills: none / <name>
- next session: <level/track>
```

### 2026-09-28 (later) — live E2E campaign II: data-layer seams

- attempted: full Phase-1 matrix against the running bot via synthetic-gateway harness (fabricated messages, REST-poll reply matching); ~15 targeted micro-probes (p1–p22) isolating single mechanisms
- results: 24/30 verified end-to-end; 5 engine-class bugs found and fixed (jsonSet snowflake coercion, consecutive dynamic keys, doubled-gate cooldown kill, newCase arg order across 11 call sites, probe-loader poisoning)
- misses (the rules the bugs violated):
  - quote-wrap snowflaves entering ANY jsonSet → rule: "jsonSet parseJSONs the value — bare IDs die at 2^53"
  - registry shape with nested dynamic keys → rule: "dynamic var names + literal keys + CSV index; never nested dynamic paths"
  - gate embedded in both template and emitter → rule: "generators own the gate; spec bodies never include it"
  - $newCase called (type, guild) at 11 sites → rule: "after changing a custom fn's params, grep every call site — field alignment by luck is not verification"
  - trusted probe output while a broken probe file killed the loader → rule: "node --check the whole loader dir before believing ANY test result"
- promoted: the silent-death checklist now lives in ../quick-reference.md
- next session: none scheduled — campaign complete, product green

### 2026-09-28 (final) — multi-agent adversarial audit

- attempted: 3 parallel sub-agents (engine, security, tooling) auditing the full Chronolith codebase
- results: 15+ critical/high bugs found and fixed; 108 files changed; net -117 lines
- misses (the rules the bugs violated):
  - $parseMS is ms→text, not text→ms → rule: "param TYPE is the contract — Number params never accept text"
  - $arrayIncludes coerces the needle, not the array → rule: "digit-string needles always fail — use $arraySome for IDs"
  - _fix_seps nest tracking went 1 bracket too far → rule: "nesting counters must close scope BEFORE checking for exit"
  - djsEval interpolated user-reachable text → rule: "any djsEval body with interpolated values is injection, regardless of caller claims"
  - automod exempted by content pattern (command prefix), not identity → rule: "security exemptions by content = bypass; exempt by identity only"
  - warnsRemove blanked entire index instead of rebuilding survivors → rule: "destructive operations must reconstruct, not blank"
  - 6 empty log handlers → rule: "every $sendMessage needs a title or description to avoid API 50006"
  - orphan command files from old iterations → rule: "generators must clean up files they no longer produce"
- promoted: new debugging-playbook levels 7-8 (engine coercion + tooling bugs); quick-reference audit checklist
- methodology lesson: multi-agent adversarial review with runtime verification finds bugs no single perspective catches

### 2026-09-28 (final+) — three-agent knowledge mining

- attempted: 3 parallel agents (runtime internals, function catalog mining, real-world code analysis) to extract every undocumented pattern, correct every KB error, and build relationship maps
- results: 10 KB inaccuracies corrected, 23 runtime behaviors newly documented, 96 enums reverse-mapped, 8 repos mined for novel patterns
- new wisdom files: function-relationships.md (ordering/pairings/conflicts/context gates)
- updated: meta-lessons (three-agent entry), quick-reference (runtime corrections + hidden stores + container + bridge + join)
- misses (rules that were WRONG in the KB):
  - unknown fns are not compile errors → they're plain text; inner functions still run
  - $let/$get ≠ $env store → completely separate maps
  - $# on nested calls is ignored → only top-level flag is checked
  - $clientToken exists → KB said it didn't
  - $parseString is the native text→ms → KB said to hand-build with djsEval
  - local fn env writes DO escape → the clone claim applies to functions.add, not $fn
  - Json/Color resolvers never reject → invalid JSON returns raw string
  - $loop discards plain output → only $return accumulates
  - \$fn loses the backslash → SystemRegex bug/feature
  - unwrap:false functions skip required-arg enforcement entirely
- methodology: three-perspective triangulation (internals + catalog + usage) catches contradictions that no single perspective reveals

### 2026-09-29 — fslint v3.1: three-agent findings integrated into the linter

- The knowledge is no longer just docs — 22 new executable checks (48 → 70) encode the runtime-internals, relationship, and pattern findings:
  - runtime semantics: store confusion ($env vs $get, both directions), container-reset-by-gate, \$fn backslash quirk, $# nested/top-level truth, time-unit traps (decimals/ms/M), $loop output discard
  - relationships: component/modal producer ordering, jsonLoad→jsonSet, textSplit→splitText, httpRequest→httpResult, array producers→consumers, ephemeral-before-flush, defer→followUp conflict, fetchComponents override, context-gated accessors in command files
  - patterns: spin-lock throttle detection, $jsonStringify eval bridge
- FIXED existing-check bugs found during integration: TIME_RE accepted '1.5h'/'500ms' (both throw at runtime); check-40 fix text referenced nonexistent $durationToMs (real fn: $parseString)
- Linter-engineering lessons:
  - CALL_RE requires '[' but bare calls ($addActionRow, $ephemeral, $defer) are legal → line-based word-boundary sweep for producers/gates, regex scan only for arg-dependent tracking
  - custom-fn param seeding must be scoped to the fn's own body (exact code match); a global union caused false $get[ids] store-confusion in commands that merely share a param name with some custom fn
- The linter caught a REAL production bug immediately: functions/punish.js hardban path passed $env[reason2] (empty env store) instead of $get[reason2] into $ban and $newCase — hardban cases logged with no reason. Fixed in main + synced to test deployment.
- Baseline after: 173 files, 3 errors (2 known false-positives + 1 by-design), 202/0 compile clean.

### 2026-09-29 (second pass) — KB alignment: the knowledge base itself corrected

- The three-agent corrections had only reached wisdom/; knowledge/ still taught the wrong claims. This pass made the KB itself tell the truth:
  - **Re-verified against installed dist source before rewriting** (node_modules/@tryforge/forgescript/dist): read Interpreter.run, Context.handleNotSuccess, CompiledFunction.resolveCode/resolveArgs, Compiler.getFunction/Regex. Every Agent-1 claim confirmed first-hand:
    - handleNotSuccess returns false on EVERY path (even fn.data.silent) -> ctx["error"]() = throw null -> abort. `#` = alert-hider, never continue-on-error.
    - resolveCode propagates nested error Returns without reading the nested silent flag -> nested `#` ignored.
    - Compiler.Regex is built from registered names only -> unknown $fn[ never matches -> literal text; the "not registered" throw is dead code.
    - Context has #keywords (getKeyword/setKeyword, powers $let/$get) AND #environment (setEnvironmentKey, powers $env) — two disjoint maps.
  - **Core docs fixed**: forgescript-syntax.md (# semantics, unknown fns, ctx stores, \$fn escape quirk, compile-error list), forgescript-internals.md (keywords/env swap, container lifecycle section, error/silent mechanics section, 6 practice points), arg-types.md (Json/Color never reject, present-vs-absent required args, Time unit traps incl. M=month), custom-functions.md ($get[_code] trap, container sharing, local-fn env escape, jsonSet last-loaded pointer).
  - **1,756 generated pages**: replaced the false universal boilerplate ("errors abort unless silenced ($#fn)...") and the wrong prefix syntax (`!$fn`/`#$fn` -> `$!fn`/`$#fn`); fixed the variable-category "How it works" on 11 pages ($let writes keywords, not env).
  - **10 key pages got specific VERIFIED (2.7.1) quirks**: parseString, parseMS, arrayIncludes, jsonSet, jsonLoad, ephemeral, cooldown, loop, textSplit, httpRequest.
  - **Generator future-proofed**: _tools/generate.py now emits the corrected boilerplate and has a VERIFIED_QUIRKS dict spliced into page generation — regens can't reintroduce the lies.
- Lesson: when a knowledge base is machine-generated, corrections must land in the GENERATOR or the next regen resurrects the errors. And when correcting docs, re-read the installed dist source same-day — memory of a finding is weaker than re-deriving it.

### 2026-09-29 (third pass) — public API key provisioned; guide surface verified exhausted

- User provided a public-tier key (bf_pub_...). Probed what it actually changes:
  - rate ceiling 5/min -> **60/min** (discovered via a 429 that names the tier limit verbatim — the 429 body is the tier probe)
  - analytics endpoints still private-only (clean 403, message verbatim)
- Full sweep with the key: 96 guides on the API == 96 local, IDs identical, contents byte-identical. All 12 function catalogs unchanged; the 388 local "extras" are alias pages (the API lists canonicals only — never re-harvest aliases as missing).
- Gotcha discovered the hard way: Python-urllib default UA = 403 on /v1/guides?id=... while curl works. Any scripted harvesting must use curl or override the UA.
- Built knowledge/tools/sync_guides.py — the permanent incremental harvester (check/fetch/index-rebuild modes, curl-based, 1.15s pacing under the 60/min limit). Verified idempotent: re-run produces a complete 96-link index, no broken links, no orphans.
- Lesson: before "fetch more data," measure the delta surface first (list endpoints are cheap). The catalog was already fully synced; the deliverable became the sync tool that makes the NEXT guide appear within one command, not a re-harvest.

### 2026-09-29 (fourth pass) — fslint v4: ForgeVSC engine port, linter → language toolkit

- Ported the official VS Code extension's engine (github.com/tryforge/ForgeVSC) into CLI space. The transferable core wasn't the VS Code API glue — it was their PARSING TRUTH:
  - escape parity: count the backslash run; odd = escaped (in cooked space; ForgeVSC counts even>=2 in raw template space — same predicate, different coordinate system; translating between them wrong silently breaks everything)
  - call-bracket awareness: a '[' only opens a call when it directly follows a function token — literal/array brackets never open or close calls (this killed our 2 longstanding $onlyIf false positives)
  - loose operator scanning: any order, any multiplicity, THEN validate order/dupes separately ($#! → literal text; $!! → one ! plus literal)
  - $c[...] / $escapeCode[...] regions are ignored-scan zones (commented code no longer lints)
  - bare calls ($addActionRow with no brackets) are first-class scanner citizens now — the old CALL_RE required '[' and was blind to them
- New modes: --complete, --signature, --guides, --outline, --events, --fix, --(un)comment. The tool is no longer just a linter — it's a language toolkit.
- New checks 71-76: operator order, duplicated operators, bare brackets-required calls, $!$fn double-$, event-type validation (80-event KB registry), condition-field traps.
- THE CATCH OF THE CAMPAIGN: condition-trap fired 432× initially → looked like noise → source-dived the Compiler: separator is ";" ONLY, first operator wins, empty rhs = compare-vs-"" idiom. Narrowed the check (mention guard <@ <# <&, empty-LHS only, multi-op). The remaining 28 fires were ALL REAL: 52 comma-separated $and/$or gate bodies across ~20 generated prefix commands compiled to single bogus conditions ("a == 'b,c==d'") — gates that could never pass.
- ROOT CAUSE in the generator: _fix_seps had TWO bugs — (1) it started nest counting ON the $or's own '[' so every body comma sat at nest>=1 and was NEVER replaced (the function had likely never worked), (2) it skipped past nested $and/$or bodies after processing an outer one. Fixed both, regenerated 135 files, hand-fixed functions/reports.js.
- Lint-engineering lessons:
  - a new check firing hundreds of times is not automatically noise — verify against the runtime source before suppressing; the noise was the linter pointing at a generator bug
  - empty-right-side != bug: $onlyIf[$get[x]!=;...] is the canonical not-empty idiom (rhs = ""); only empty LEFT side is a constant-comparison bug
  - porting code across coordinate systems (raw vs cooked text) requires re-deriving every escape predicate, not transliterating it
- Baseline: 173 files, 1 error (by-design $eval flag), 202/0 compile clean. Test deployment synced (260/0).

### 2026-09-29 (fifth pass) — v4.1 deep dive over all commands

- Full sweep with the v4 engine + the uncommitted v4.1 field-study checks (77 dup-cooldown, 78 author-lock, 24b dynamic snowflake). 172 files, 1 error (by-design owner-only $eval), 6 warnings.
- Fixed in this pass:
  - container-reset check is now $stop-aware: a decorator inside a branch that $stops before the gate can never coexist with the gate's error send (components.js verify-branch FP resolved; real cases still caught)
  - 4 event files (joinGate, leaveLog, ready, snipeEdit) lacked $nomention — log embeds were PINGGING the users they described
  - deps scanner: custom-fn usage now scans functions/ too AND sees bare calls — killed 3 false "unused" ($dmnotify, $helppages, $punishcheck were all real)
- Verified non-issues (each checked, not suppressed):
  - $punish→$punish "cycle": intentional one-level warn escalation; the escalated action is never warn → terminates
  - 13 jsonset-dyn-snowflake infos: all text vars (reason/type/duration/until/content) — Tier 2 safe
  - 201 definitions vs 202: modlog consolidated (%modlog + cases subcommands; slash modlog kept as redirect stub) — coherent, not a loss
  - O(n²) advisories: word×list and role-strip loops over small config lists — accepted
  - mirror "drift" in 67 commands: interface fns only ($message/$findUser vs $option/$interactionReply) — by design
- Lesson: a "deleted file" in a diff can be a consolidation, not a loss — verify the replacement exists (the slash stub redirected to the prefix command) before restoring anything.

### 2026-09-29 (sixth pass) — visual identity v3: palette lock + embed/message overhaul

- Survey found heavy drift from the declared v2 palette: THREE greens, TWO reds, TWO ambers, THREE slates, plus an off-palette violet (7C3AED, 25 uses). 36 embeds had bare "Chronolith" footers vs the "Chronolith • Module" pattern. Log embeds almost universally lacked $timestamp.
- v3 design system, now enforced:
  - Palette locked to six hexes: 5865F2 brand/info, DA373C danger, F0B232 warning, 248046 success, 9B59B6 mute/quarantine, 4E5058 slate — one hex per semantic role, zero exceptions repo-wide
  - Every footer names its module (Chronolith • Moderation/Security/Reports/...); separators unified to "•"
  - $timestamp on every log/event embed (automod, message logs, member logs, verification, interactions)
  - Punishment replies unified with the design language: mention line + BLOCKQUOTED reason as description (was a Reason field — inconsistent with modlog); Applied/Skipped inline counts
  - actionColor deduplicated into theme.js (was defined in both theme.js and notify.js — last-registered silently won)
- Found + fixed a display bug while surveying messages: "[note]" in usage texts — the literal ] closed the $onlyIf, users saw "[note" (claim/close/dismiss; spec + files fixed with \\[note\\]).
- Generator hardening: footer-module naming lives at the EMIT site (every registration path gets it — multi_punish_cmd and lock/unlock bypass cmd()); palette rules applied to the spec itself so regen can't reintroduce drift.
- Process lesson: a git stash cycle mid-overhaul silently reverted parts of the generator spec — the regen resurrected off-palette hexes and bare footers. Re-ran the full layer stack + audited from scratch (off-palette: 0, bare footers: 0). Always re-audit after stash juggling; never trust partial recovery.

### 2026-09-29 (seventh pass) — live command testing round 10: visual suite + bracket-escape bug class

- Ran the full synthetic-gateway suite after the v3 visual overhaul: 17/17 functional PASS. Then built tests/visual.js (8 assertions of the actual rendered embeds: blockquote replies, palette hexes, module footers, usage texts, rejection UX) — 8/8 PASS.
- THE NEW BUG CLASS (found live, invisible to compiler AND linter): literal brackets in usage TEXT inside $onlyIf messages. "Usage: modlog [recent|user|action|set] [...]" — the literal [ and ] count in the compiler's arg-depth tracking, silently RESHUFFLING the $if's then/else structure. Symptom: %modlog recent leaked raw source fragments as a plain message. Fixed class-wide: [reason]/[note]/[all|bot|...]/[what happened] escaped in spec + regenerated. compile 200/0 both before and after — THIS IS WHY LIVE TESTING MATTERS.
- Test-harness lessons:
  - TEST_AUTHOR must be the GUILD OWNER (608198733506543629), not the bot's own ID — using the bot ID made every mod gate reject (fabricated messages authored by "the bot" pass allowBots but fail isMod)
  - punishing the bot itself = fast clean rejection embed; punishing protected/absent targets can STALL the pipeline (DM-to-bot API failure) — assertion suites must use deterministic rejection paths, not lucky timing
  - back-to-back same-command tests trip the 3s cooldown: the second reply never comes (silent cooldown stop) — space or vary them
  - cooked-text audits false-flag escaped brackets (js_cook consumes the backslash) — audit raw source, or expect \\[ to become [

### 2026-09-29 (eighth pass) — all-commands live sweep: the sci-notation color trap

- Swept EVERY command (77 probes, every prefix command + aliases' shared paths) with leak detection on every reply. All 77 pass.
- THE BUG (invisible to compile, lint, and code review): $color[4E5058] throws ColorConvert "Unable to convert Infinity". The slate hex 4E5058 is valid JS scientific notation — ForgeScript's color resolver runs a numeric pre-check (Number(x)) before hex parsing, so "4E5058" becomes 4e5058=Infinity and dies in EmbedBuilder.setColor. Fixed with a # prefix (13 call sites + spec). The other five palette hexes are immune (all contain non-digit letters in non-scientific positions). RULE: any hex of the form <digits>E<digits> (also D for exponent-free safety: anything Number() accepts) must be # prefixed.
- Also caught: duplicate %report definition (misc/ + reports/ both named "report" — the loader silently overrides; the reports/ lifecycle version is canonical, misc/ deleted). Enumerate command NAMES across files whenever adding or consolidating — same-name files across folders collide silently.
- Sweep-harness design: 350ms default pacing trips sibling-command cooldown keys (authorID-commandName) — %modlog after %modlog recent, %case after %cases. Either space >=3s between same-family commands or accept known-race reruns. Failures were deterministic and reproducible, which made them easy to separate from real bugs.
- The p33 prototype probe in probe/ fires a debug embed on some messages when probe/ is loaded — never load probe/ in assertion suites, only in interactive dumps.

### 2026-09-30 — BDScript 2 (BDFD) translation: constraint-driven patterns worth respecting

- Translated a user's BDFD ban command + interaction toggle button into Chronolith (~250 lines → ~30 lines riding the $punish engine + components router). Dialect mappings recorded: $var/$endif → $let/bracket-$if, $sendEmbedMessage → embed container fns, $onInteraction → interactionCreate+$customID router, $checkUserPerms → $hasPerms, $serverOwner → $guildOwnerID, $banID → $punish pipeline.
- Their code teaches by contrast — patterns worth stealing:
  - INJECTION-PROOF CUSTOMID PACKING: they used {§∆§} (untypeable unicode) as the data separator so user text in a reason can never forge fields. Our "-" separators are safe only because our payloads are numeric. If we ever pack free text into customIDs, use an untypeable separator.
  - CORRELATION IDS ON ERROR PATHS: $randomString[5] in error footers = poor-man's correlation ID. Real observability instinct on a platform with no logs.
  - VAR-SIZE CHUNKING: the modLogs1-5 try/catch chain is the only way to exceed BDFD var caps — append-only logs chunked across vars with fallback. Wrong for us (we have a DB), but the right answer under their constraints.
- Lesson: judge hand-written code against its platform's ceiling, not yours. Their hierarchy/owner-bypass semantics were CORRECT (owner bypasses, admin doesn't) — most hand-rolled bots get that wrong. The gap was leverage (no functions to factor into), not skill.


### 2026-10-01 (ninth pass) — slim build, the zombie era, and the bracket law consolidated

- Scope: user shelved everything except the ban family, kicks and the modlog viewer ("shag off the rest"), then we rebuilt the keep-set native (no $punish pipeline — $ban/$kick/$unban inline with per-target validation, cases written via $getGuildVar/$jsonSet directly). 258 definitions → 84. The user hand-audited every command file across several review rounds and found real bugs each time: the multi-target append drop ($let[ids;$if[..;,]$get[uid]] keeps ONLY the last id — the fix is $get[ids]$if[...;,]$get[uid]), ignored $ban/$unban booleans recording failures as success, missing moderator-hierarchy checks, hackban breaking on $isBannable (member-only), massban accepting "5" via $isNumber, DMs sent after the ban (no mutual server → always fails), and digits-only colors parsing as decimal.
- THE ZOMBIE ERA: months of "flaky" interaction failures ("already acknowledged", dead buttons, Unknown interaction) were caused by MULTIPLE bot processes sharing one token — restarts had killed a single PID while others survived. Four simultaneous sessions at peak. Fixes: lock guard now refuses loudly with the pkill instruction; restart.sh (pkill-all → wait → verify-single → start → abort on anomaly) is the only sanctioned restart. Anything previously written off as flaky deserves a re-test.
- $durationToMs was OUR custom function (functions/duration.js) and I shelved it during the slim-down because my usage grep searched $parseDuration (the name I remembered) instead of enumerating DEFINED names. Hardban's timer math was silently dead. Deletion audit rule: enumerate the names each file DEFINES and grep for those — never grep for names you think you remember.
- The $djsEval body law (paid for three times in one day): a bare ] terminates the argument — match[1], t[i], units[ch] are all fatal with "Unexpected end of input"; backslashes are stripped pre-eval so \d-regexes die; plain ; is fine (rest-arg rejoin). Working pattern: bracket-free backslash-free bodies (see functions/duration.js). Recorded in the KB ($djsEval page + core/forgescript-syntax.md).
- Also into the KB: comma-vs-semicolon in $or/$and (the comma is a silent always-false), $math grouping with parens not brackets, the digits-only-decimal and sci-notation color traps, $addOption attaching to actionRow.components[0] (menu must lead its own row or options silently drop → Discord 400).
- modlog v3 (Components V2): container + text displays + separators + edge-locked page buttons + inert page chip + action dropdown built from a live $modlogActions scan. Pages ascend (1-5, 6-9…), recent opens the LAST page. Smart syntax: %modlog <action> / <user> / "quoted name" [action] / set (ManageGuild-gated, channel-validated). CV2 rules learned: top-level components auto-set the flag; no embeds+CV2 mixing.
- Slash mirrors: $defer before the work (3s window), permission gates BEFORE defer for ephemerality, everything after is $interactionFollowUp. This retroactively explains part of the old interaction-404 mystery beyond the zombies.
- dbsplit.js: per-concern sqlite routing (moderation/security/config/ephemeral/cooldowns + misc fallback) over ForgeDB's static singleton; one-time migration (upsert-then-delete, backup first); harnesses MUST require it or they read the drained forge.db. TypeORM save() occasionally chose INSERT on existing rows (SQLITE_CONSTRAINT_PRIMARYKEY) → explicit findOne→update-else-insert.
- Process: the review loop works — hand the user a verbatim file, they return a fixed version with a fix-list, I verify live and ship. Their fix lists have been accurate every round; trust but verify with the real compiler, and remember offline slash fabrication cannot get past $defer (fake token 404s the callback).
