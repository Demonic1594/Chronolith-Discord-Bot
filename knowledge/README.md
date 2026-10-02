# BotForge / ForgeScript — agent knowledge base

> Private reference material mapping **everything** on https://docs.botforge.org plus the underlying source code of all packages — 14 total: the 13 registry packages **plus Edge** (`@nationdex/edge`), discovered during the amc production audit and absent from the registry API. Built 2026-09-26 from: the BotForge Developer API (`api.botforge.org`), raw GitHub metadata (`metadata/*.json` in each repo), full guide content, and a source-level harvest of every package repository (1,644 function implementations extracted verbatim).

## Layout

```
knowledge/
├── README.md                  ← you are here (map + stats + refresh instructions)
├── core/                      ← ground-truth semantics derived from compiler/interpreter source
│   ├── forgescript-syntax.md      every syntax rule: brackets, ;, escapes, $! $# $@[sep] prefixes, operators
│   ├── arg-types.md               coercion rules for ALL argument types + pointer dependency + rest/condition args
│   ├── forgescript-internals.md   compile→execute pipeline, Return types, Context/environment/container
│   ├── custom-functions.md        the ForgeFunction authoring layer: define your own $functions in JS files
│   └── bot-setup.md               the JS side: client init, command files, loading, extensions
├── functions/                 ← ALL ForgeScript functions (the core package), one .md per function
│   ├── _INDEX.md                  complete index grouped by the 46 categories
│   └── <category>/$name.md        per-function: signature, params table + per-param notes, how it works,
│                                  several examples, VERBATIM execute() source, quirks, related, guides
│                                  (alias files like $channelSendMessage.md redirect to canonical)
├── events/                    ← all 79 ForgeScript events — source-verified runtime data
│   └── _INDEX.md                  per event: intents + privileged warnings + registration recipe +
│                                  carried entity type, old/new state tables with the exact
│                                  $old/$new accessors, $message[N] seeding, special behaviors
│                                  (respondOnEdit re-dispatch, tracker feeds), curated examples
├── enums/                     ← all 96 ForgeScript enums: value tables, notes, and the functions
│   └── _INDEX.md                  that consume each enum (source-mined reverse map, linked)
├── guides/                    ← all 96 approved community guides from docs.botforge.org, full content
│   └── _INDEX.md
├── changelog/                 ← per-version pages: official changelog messages **plus** every function/event
│   └── _INDEX.md                  introduced in that version (derived from "since" metadata — richer than
│                                  the docs site's ?tab=changelog, which shows messages only)
├── validate/                  ← the /v1/validate endpoint: schema + EMPIRICALLY TESTED behavior & blind spots
│   └── README.md
├── tools/                     ← the ?tab=tools surface: clientgen/appbuilder/permissions/intents/analyzer + the /v1/discord data API (verified)
│   └── README.md
├── extensions/                ← one folder per package (13)
│   ├── _INDEX.md
│   ├── forgescript/               hub: registry data, changelog, links to top-level functions/events/enums
│   ├── forgedb/ … forgevsc/        per package: README (registry, install, changelog summary, verbatim GitHub
│                                  README), CHANGELOG.md, functions/, events/, enums/ with own _INDEX.md
└── _tools/                    ← refresh tooling (see below)
```

## Numbers

| Package | Functions | Events | Enums | Notes |
|---|---|---|---|---|
| **ForgeScript** (core → `functions/`, `events/`, `enums/`) | 1120 (+388 alias stubs) | 79 | 96 | 46 categories; every function ships its real `execute()` source |
| ForgeCanvas | 254* | 0 | 22 | *includes aliases |
| ForgeIndia | 234* | 0 | 0 | functions generated from translation files at runtime → metadata-only docs |
| ForgeDB | 84* | 4 | 3 | sqlite/mysql/mongo/postgres via typeorm; has DB events |
| ForgeLinked | 64* | 29 | 4 | voice/linked roles |
| ForgeColor | 65* | 0 | 4 | color spaces & manipulation |
| ForgeMinecraft | 102* | 21 | 15 | server status/queries |
| ForgeMusic | 44* | 25 | 3 | lavalink player |
| ForgeGiveaways | 33* | 8 | 1 | giveaway manager |
| ForgeRegex | 22* | 0 | 1 | regex toolkit |
| QuorielDB | 25* | 0 | 2 | LMDB-based DB |
| ForgeTopGG | 13* | 3 | 0 | top.gg votes |
| Edge | 28* | 0 | 1+ | **off-registry** (found in production): cache tables, JSON math, math utils — `knowledge/extensions/edge/` |
| ForgeVSC | — | — | — | VS Code extension, no runtime functions |

\* Counts marked with `*` are **page counts = canonical + alias stubs**; the raw metadata files list canonical functions only, so page counts float with upstream alias churn (e.g. ForgeCanvas: 111 canonical, 253 pages at build, 255 after upstream's 2026-09-28 push). Never diff page count against metadata count directly — expand aliases first. Canvas's historical 254-vs-253 stats gap is `$drawImageRect`, an alias registered under *two* canonical functions (counted twice in stats, one stub file on disk).

**Non-registry TryForge ecosystem repos** (verified 2026-09-28 via GitHub org listing; not in `/v1/extensions`, no function pages here): **ForgeAPI** (`@tryforge/forge.api` on npm — HTTP bridge to interact with a running bot; used by Chronolith upstream), ForgePanel, Cloud, WebServer, ForgeNotifications, ForgeTelemetry, lavaclient — infrastructure/CI, no ForgeScript runtime functions.

**Re-verified 2026-09-28:** live `metadata/functions.json` (1,120 entries) identical to cache — no core drift; npm `@tryforge/forgescript` latest = **2.7.1** (12 versions) so the changelog is current. Beware: npm `forgescript` (unscoped) is a different, abandoned 2023 package (1.3.0) — the real one is `@tryforge/*` scoped.

**Known gaps (audited 2026-09-28):** 14 function pages have no verbatim `execute()` block because the source-harvest map has an empty `execute` for them: `$day $hour $minute $month $second $week $weekday $year $calendarDay $calendarWeek` (time), `$customID $locale` (interaction), `$function` (unsafe), `$username` (user). `$uwu` appears in the harvest map only as a **test fixture** (`src/__tests__/custom/uwu.ts`) — deliberately excluded. `extensions/forgescript/` hub carries README+CHANGELOG only (by design; core content lives top-level).

**Totals: ~2,475 function pages (1,508 core + 967 extensions) · 96 guides · 96 enums · 79 core events + 90 extension events · 22 changelog versions. Full tree: ~3,000 markdown files.**

## Sourcing & trust levels

1. **Docs metadata** (description/args/types/brackets/unwrap/output/category/version/aliases) — from each repo's `metadata/functions.json` (identical to what docs.botforge.org renders).
2. **Source implementations** — the `execute()` body, `experimental`/`deprecated` flags extracted from the repos (things the docs site does NOT show). Reference implementations in function pages are verbatim.
3. **Semantics docs** (`core/`) — read directly from compiler/interpreter source; these explain *why* things behave as they do (e.g. Boolean accepts only `true`/`false`; `http://` URLs are rejected by the URL check; `@[sep]` count prefix; condition operator rules).
4. **Guides** — verbatim community content, cross-linked from the functions/events they cover.
5. **Validate** — behavior confirmed by live tests (documented blind spots: no unknown-function check, no type check, false positives after `$!#` and `$@[...]` prefixes).

## How to look things up

- Know the name? `knowledge/functions/<category>/$name.md` (core) or `knowledge/extensions/<pkg>/functions/$name.md`. Aliases have their own stub files, so `$channelSendMessage.md` resolves.
- Don't know the category? Start from `functions/_INDEX.md`.
- Weird behavior? Check the function's **Quirks & gotchas** + `core/arg-types.md` (most surprises are type coercion, pointers, or empty-optional-args-to-null).
- Syntax/escaping trouble → `core/forgescript-syntax.md`.
- Validating user code → `validate/README.md` first (know the false positives).

## Refreshing (stays reproducible)

```bash
bash knowledge/_tools/refresh.sh              # full: registry+metadata → guides (~20 min, API is 5 req/min) → harvest → generate
bash knowledge/_tools/refresh.sh --skip-guides # metadata + source only (fast)
```

Tools: `_tools/harvest_sources.py` (extracts execute bodies from shallow clones in `/tmp/opencode`), `_tools/generate.py` (renders every file in this folder), `refresh.sh` (orchestrates). Raw inputs are cached in `../.knowledge-cache/` (gitignore-worthy).
