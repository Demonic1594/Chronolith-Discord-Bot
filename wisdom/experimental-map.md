# Experimental map — upstream's own uncertainty, hidden from the docs site

The docs site does not render `experimental`/`deprecated` flags, but the source carries them. Extracted 2026-09-26 from `main` (see `../knowledge/_tools/harvest_sources.py`). **25 experimental, 5 deprecated.**

## The uncomfortable truth

The **entire modern control-flow layer is experimental**: every loop, every block-if, every try/catch, every coroutine, and every cooldown function. That doesn't mean "broken" — it means upstream reserves the right to change semantics without a major bump.

## Experimental (25)

**Control flow / statements:** `$ifx`, `$while`, `$loop`, `$switch`, `$case`, `$try`, `$async`, `$coroutine`, `$function`
**Cooldowns (all of them):** `$cooldown`, `$channelCooldown`, `$guildCooldown`, `$memberCooldown`, `$userCooldown`
**Array iterators:** `$arrayEvery`, `$arrayFilter`, `$arrayFind`, `$arrayFindIndex`, `$arrayFindLast`, `$arrayFindLastIndex`, `$arrayForEach`, `$arrayMap`, `$arrayReduce`
**Misc:** `$httpPing`, `$setCalendar`

## Deprecated (5)

`$createGuild`, `$deleteGuild` (bot-created guilds were removed by Discord), `$interactionRequirePremium`, `$setGuildMFALevel`, `$setGuildOwner` (guild-owner transfers/API removals).

## How I treat them

1. **Use them anyway, but defensively.** `$while`/`$try`/`$cooldown` are the only tools for their jobs. Wrap load-bearing uses in `$try`, and don't build intricate abstractions on their exact semantics.
2. **Pin and verify.** When a bot targets a specific ForgeScript commit, these are the first functions to re-verify after `refresh.sh` — they're where behavior shifts between releases.
3. **Prefer stable equivalents when they exist.** `$if` (stable) over `$ifx` (experimental) unless I need multi-statement branches. Plain `$arrayAt`/`$arrayJoin` over the iterator family when the job is simple access.
4. **Deprecated = refuse to ship.** The five are API-dead ends; suggest replacements (`$editGuild` family where applicable) rather than new uses.

## Where the flags live

Each function page in `../knowledge/functions/` shows `⚠️ experimental` / `🚫 deprecated` in its facts line (from the source harvest, not the metadata). If a page disagrees with reality, re-run the harvest — the repos are truth, the docs metadata doesn't carry these flags at all.
