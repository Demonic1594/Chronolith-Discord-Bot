# Ecosystem judgment — my read on the 13 packages

Facts live in `../knowledge/extensions/`. This is my *opinion* on what to pick and what to expect, based on registry data, changelogs, source structure, and doc completeness.

## Trust tiers

**Tier 1 — core, bet on it:** ForgeScript. 1,120 functions, active changelog, the docs site itself is built around it. Its quirks are the language's quirks.

**Tier 2 — official extensions, production-viable:** ForgeDB (typeorm multi-backend, real changelog, has DB *events* — most mature), ForgeCanvas (largest function surface after core: 111), ForgeMusic, ForgeLinked, ForgeTopGG, ForgeGiveaways, ForgeMinecraft, ForgeVSC (dev tooling, no runtime functions).

**Tier 3 — community, use after a look at source:** ForgeRegex (xNickyDev — a lead dev's side project, so effectively official-grade), ForgeColor, QuorielDB (clean LMDB design, JS-source so the harvest covers it), ForgeIndia.

## Overlaps to know about

- **ForgeDB vs QuorielDB**: same role. ForgeDB is the official, heavier answer (sqlite/mysql/mongo/postgres via typeorm); QuorielDB is a lean LMDB key-value store with typed entity bindings. For a small/medium bot I'd take QuorielDB's simplicity; for anything with relations or planned migration, ForgeDB.
- **ForgeMusic vs ForgeLinked**: not substitutes — music (lavalink playback) vs voice-linked-role automation. They coexist fine.
- **ForgeCanvas vs raw `$attachment`**: canvas for generated images (welcome cards, leaderboards); don't reach for it when a static file/URL suffices — 111 functions is a lot of surface for one image.

## Maturity signals I used

- Changelog presence: ForgeScript, ForgeDB, ForgeRegex, ForgeLinked, ForgeGiveaways, ForgeMinecraft ship changelogs; the rest don't (refresh audits are harder for those).
- Events surface: ForgeLinked (29) and ForgeMusic (25) expose rich event hooks — sign of designed extensibility, but each event is more gateway traffic to be deliberate about.
- Source availability: everything except **ForgeIndia** (functions generated from translation files at runtime — metadata-only docs; verify behavior empirically when using it).
- The ForgeDB `old` category: legacy `$setVar`/`$getVar` still in metadata though the 2.0.0 changelog says they were removed "to secure better results" — treat `old`-category functions as landmines from a migration and prefer the modern helpers.
- **The registry is not exhaustive.** The amc audit found `@nationdex/edge` (28 functions: cache tables, JSON math) in production use with zero presence in the docs-registry API — now documented at `../knowledge/extensions/edge/`. Real bots can carry private/off-registry extensions; unknown `$fn` names mean "unknown package," not "typo," until checked against extension repos too. Watch for npm-scope drift as well (package `@quoriel/edge` vs github `nationdex/edge`).

## Community extensions & non-registry surfaces (field-verified 2026-09-28)

Full study: `community-ecosystem-field-study.md`. The short version of my trust read:

- **`forge.timers` (Daaisukidayo/ForgeTimers) — production-grade, on npm.** 23 functions + 10 events, 28 test files, DB-backends, shard-aware. The single highest-quality community package found; supersedes hand-rolled timeout persistence (see `timeout-system-deep-dive.md`).
- **`forge.quirks` (LynnuxDev) — the "personal extension" pattern.** Tiny self-published bag of missing functions (`$roundTripPing`, `$cpuUsage`, `$projectVersion`, `$shards*`...). Two independent bots depend on it. Lesson: before declaring a community bot's function "ghost," check the author's other repos — people ship their own gaps.
- **ForgeCron (Tape490) — avoid.** In-memory only (no restart survival despite the name), stale-context capture in the callback, name/uuid twin-entry leak — **and its `$cron` collides with ForgeTimers' alias with a different arg order.**
- **ForgePages (xloxn69) — in-memory array paging**, not button pagination (description misleads); loses stores on restart; nice `declare module` client-state augmentation pattern though.
- **fsgames (user-lezi) — small but well-built** (2048/Connect4 via discord-gamecord); cleanest community example of the env-key accumulator builder DSL.
- **Non-registry TryForge repos** (verified via org listing): **ForgeAPI** (`@tryforge/forge.api` on npm — HTTP bridge to a running bot; Chronolith upstream used it), ForgePanel, Cloud, WebServer, ForgeNotifications, ForgeTelemetry, lavaclient — infrastructure, no runtime functions, no docs presence.
- **npm trap:** the unscoped `forgescript` package is an abandoned 2023 fork (1.3.0, ruben40000). Everything current lives under the **`@tryforge/*` scope** (`@tryforge/forgescript` latest 2.7.1). Check the scope before npm-installing anything ForgeScript-adjacent.

## Picking defaults for a new bot

- Persistence: ForgeDB (or QuorielDB if key-value is genuinely enough).
- Music: ForgeMusic.
- Image cards: ForgeCanvas.
- Vote tracking: ForgeTopGG.
- Voice-role linking: ForgeLinked.
- Giveaways: ForgeGiveaways (has its own events — don't hand-roll timers with `$wait`).
- Minecraft server status: ForgeMinecraft.
- Anything else: check core's 46 categories first. The 1,120-function surface covers far more than people assume (crypto, websockets, automod, soundboard, polls...).
