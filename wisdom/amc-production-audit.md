# amc production audit — the deepest verification yet

> Source: `../../code/amc/` (github.com/GreenVGJR/amc, cloned 2026-09-26). A deployed music bot: TypeScript-first, **ForgeScript ^2.7.1 from npm** (pinned release, not `main`), ForgeMusic#main, QuorielDB (`@nationdex/qdb`) + **Edge** (`@nationdex/edge`) caches, hybrid with discord-player/youtubei extractors. "It works in production" is the ground truth here.

## Headline: 221/262 tokens verified, zero contradictions

Every `$function` used across the whole repo diffed against my knowledge: **203 core + 13 ForgeMusic + 4 QuorielDB + 1 ForgeLinked — all exist, all shapes match**. The 41 "unknowns" decomposed entirely into:
- **Cache-key string concatenation** — `$getCache[initclientmusic;musicplayer_message_$guildID_channelid]` is `$guildID` + literal `_channelid` text inside one argument (my token-grep over-captured; the lesson is now in the migration checklist).
- **Case-variant calls** — `$arrayload`, `$toLowercase`, `$toUppercase` in production code prove compiler case-insensitivity is relied upon, not theoretical.
- **This repo's own 44+ custom functions** (multi-definition files: one `.ts` exporting several `{name, code}` entries).
- **Edge extension functions** — which led to a knowledge-base expansion (below).

A pinned 2.7.1 release matching my `main`-based docs this completely is strong evidence the documented surfaces haven't drifted breaking-ly between 2.7.1 and `main`.

## New surfaces this audit added to knowledge

1. **`@nationdex/edge` is now documented** (`knowledge/extensions/edge/`) — a 28-function extension **absent from the docs-registry API**: named cache tables (`$getCache[table*;name*;var?]`, `$setCache[table*;name*;value*]`, `$hasCache`, `$deleteCache`, import/export/keys/range), JSON arithmetic (`$jsonSum/Divide/Multi/Sub`), math utilities (`$clamp`, `$factorial`, `$gcd`, `$lcm`, `$lerp`, `$benchmark`), `$qev`, `$call`, more. Repo ships full metadata + enums; harvested and generated like any official package.
2. **`type: 0` on slash command files** — `RegistrationType` (enum: `Global=0, Guild=1, All=2`) — per-command registration scope.
3. **Extension command managers** — `music.commands.load("back/events/fm")` (MusicCommandManager) and `quorielDb.commands.load("back/client/fdb")`: extension-scoped event handlers load through the *extension's own* manager, not `client.commands`.

## Verified mechanics used in anger

- **`$localFunction[name; code; ...params]` — params come AFTER the code body** (rest args). This bot: `$localFunction[loadinteraction; <40 lines of code>; typesload]` then `$callLocalFunction[loadinteraction;1-1]` → `1-1` lands in `$env[typesload]`. The custom-functions two-system doc, now shape-confirmed in production.
- **`$loop[-1; ...]` is the infinite loop** — `-1` runs forever; this bot polls with `$wait[5]` + `$if[...;$break]`. Source had the `-1` special case; production proves it's the intended idiom.
- **Countdown 0-based indexing idiom**: `$loop[N; $let[i;$math[$env[i]-1]]; ...$arrayAt[arr;$get[i]]...; i; false]` — the loop resets the env var to the (1-based, descending) counter at each iteration top; the manual `$sub` converts to 0-based inside the body. Both directions confirmed (`true` in id-search, `false` here).
- **`$silent`** — bare output-suppression function, used mid-command.
- **`$jsonSet[key;field;[\]]`** — empty JSON array literal via escaped brackets; `[\]` also appears as an empty-array sentinel in `$default[...]` fallbacks.
- **`$async[$callFunction[...]]`** — fire-and-forget background execution.
- **Per-guild cache namespacing** — every state key suffixed `_$guildID_*`; the cache table (`initclientmusic`) is the bot's cross-command shared memory (Edge caches + QuorielEdge `caches: [...]` config selects tables).
- **Autocomplete sentinel** — `__infointer-$authorID__` option value triggers `$ephemeral $defer $!interactionDelete` (an "info" pseudo-entry that defers then deletes itself).
- **`$interactionReply[content...; returnMessageID]`** with full embed-building inside the content arg + `$let[mid; ...]` capture — response-containers in production.
- **TS authoring**: `.ts` command/function/event files everywhere via a custom `installTypeScriptModuleLoaders()` patch (back/client/typescriptLoaders.ts) — the loader hack that makes every manager accept TypeScript; custom functions authored as `export default {...} satisfies IForgeFunction`.
- `waitGuildTimeout` client option — a discord.js `ClientOptions` passthrough (not a ForgeClient-native option on `main`), harmless via options spread.

## Architecture lessons (hybrid bots)

This bot treats ForgeScript as the *command layer* and uses Node libraries directly for the hard parts (youtubei signature generation, extractor warmup, DSP monkey-patching at import time). The boundary is custom functions: thin `$function`s wrapping TS logic (`back/functions/**` = 44+ adapters), keeping command code pure ForgeScript. That's the scaling pattern when scripts hit their ceiling — don't fight the interpreter, bridge it.

## Corrections/notes

No outdated or broken usage found — this audit only *added* (Edge package, RegistrationType, extension managers, param-after-code shape, `$loop[-1]`). The one earlier gap this exposed was mine: the registry is **not exhaustive** — off-registry extensions (Edge) exist in production use; `refresh.sh`'s registry step alone can't discover them. Edge is now integrated; future audits should name-scan unknown `$fns` against extension repos, not just the registry.

## Full comb (every file read) — additional findings

The first pass was token-exhaustive but spot-read; the full line-by-line comb added:

**A bug in my own docs, caught by production usage**: my curated `$httpRequest` example used an aoi-style 5-arg shape (`...;GET;;;json`). Real signature: **`$httpRequest[url*; method*; variable?]`** — the response lands in an env variable (default name `result`), read via `$env[res]`/`$jsonLoad`. Fixed in generator + recipes. The bot's usage (`$!httpRequest[url;POST;res]` with `$httpSetBody`/`$httpAddHeader` staged options, auto-cleared after) is the canonical request recipe.

**The `$djsEval` bridge API** (from `joinVC.ts`): inside eval code, the context is reachable — `ctx.getEnvironmentKey(name)` (the `$let` env), `ctx.getKeyword(name)`, `ctx.member`, `ctx.channel`, `ctx.client`. Semicolons in eval code are written `\\;` (escaped so argument-splitting doesn't break). Pattern: `$return[$try[$djsEval[...];false]]` — eval-or-false with `true\\;` as the final expression.

**Named intervals** exist alongside timers: `$setInterval[code*; time; name]` + `$clearInterval[name*]` — this bot keys them `intervalmusicmessage_$guildID_$channelID`.

**Interaction-update refresh pair**: `$interactionUpdate[$fetchResponse[channel*;message*] $disableComponents]` — re-render the existing message content and disable its components (loading-state idiom). `$selectMenuValues[index?;separator?]` reads picks (0-based).

**`$jsonEntries[var]` returns `Object.entries` order — `[key, value]` pairs** (index 0 = key, 1 = value). The lyrics autocomplete maps over entries and uses `$env[entry;1]` (the value) as the display, `$arraySlice[out;out;0;24]` to cap below Discord's 25-choice limit, and `$autocomplete` early-send when empty.

**Code generation patterns** (the `back/client/fdb` connector): TS template literals inject runtime values into ForgeScript code (`$let[x;${tarClient()}]`), with a `%SEMI%` sentinel later `$replace`d into `\;` — because raw `;` in generated args would split. Also `$readFile[path*;encoding?]` to load config files into env, `$djsEval[process.env.X]` for secrets, and bare `$arrayLoad[name]` to create an empty array.

**Extension event types as command `type`s**: `playerTrigger` (ForgeMusic), `databaseConnect` (QuorielDB) — extension command managers accept their own event names; their handlers receive extension data through env keys (`$env[reason]`, `$env[guildId]` — camelCase raw payloads, distinct from core context functions).

**Owner eval done right**: `commands/basic/eval.ts` — `$onlyIf[$botOwnerID==$authorID]` *first line*, then `$eval[$message;false]` (bare `$message` = all args). The gate-before-power pattern from `security-notes.md`, in the wild.

**The `_ _` placeholder trick**: `$sendMessage[$channelID;_ _;true]` — send a minimal placeholder, capture its ID, edit later — how the music player message gets owned and updated across commands.

Full-comb verdict unchanged: **zero contradictions in the bot's own code**; the only correction the comb produced was to my `$httpRequest` docs.
