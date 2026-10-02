# BotForge tools & the `/v1/discord` data API

> The `?tab=tools` surface of docs.botforge.org: six web tools at `tools.botforge.org` plus one shared JSON backend that is directly agent-usable. Verified 2026-09-26 (tools UIs fetched via the webfetch pipeline — plain `curl` gets a Cloudflare 403 challenge on that subdomain).

## Recreations (this folder, offline HTML)

The four live calculators/generators are rebuilt here as **single-file, zero-dependency HTML apps** with the verified datasets embedded — they work offline in any browser and are rebuildable via `../_tools/build_tools.py` (re-run after `refresh.sh`). Each was smoke-tested headlessly (render + output assertions via node):

| Recreation | Mirrors | Verified capabilities |
|---|---|---|
| [`client-generator.html`](client-generator.html) | Client Generator V3 | token/prefixes/folders, full client options + trackers, extension picker (ForgeDB DB-type config, ForgeTopGG token), 79-event picker with search → **auto-computed intents** (union of event intents, privileged flags surfaced), generates `index.js` (verified ForgeClient option keys from source: `commands`/`functions`/`respondOnEdit`/`trackers`/`mobile`/...) + `package.json` with `@tryforge/*` deps, `client.applicationCommands.load()` for the slash folder |
| [`app-commands-builder.html`](app-commands-builder.html) | Application Commands Builder V2 | slash / user-context / message-context types, options editor (11 option types, required, autocomplete, min/max, choices), default-member-permissions bit picker (52 perms), nsfw, **import from JSON**, export raw JSON + discord.js code (SlashCommandBuilder / ContextMenuCommandBuilder) |
| [`permissions-calculator.html`](permissions-calculator.html) | Permissions Calculator V3 | 52 permissions in 8 categories (bit-accurate: View Channel\|Send Messages = 3072), Administrator warning, 29 OAuth2 scopes with defaults + approval flags, client ID + redirect → invite link |
| [`intents-calculator.html`](intents-calculator.html) | Gateway Intents Calculator V3 | 21 intents with bits/privileged flags, presets (Messages & DMs, Voice Bots, Auto-Mod, ...), bitwise sum (verified: Messages & DMs preset = 65025), privileged-intent portal warning, code gen for **discord.js / discord.py / discord.go / ForgeScript**, active-events view |

Note: the client generator's intent computation is faithful to the events metadata (e.g. `messageCreate` → GuildMessages/DirectMessages/MessageContent) — add `Guilds` manually if your bot needs guild caching.

## Developer API documentation

Full reference with verified response shapes, auth tiers, rate-limit behavior and host quirks: [`developer-api.md`](developer-api.md).

## The original tools (tools.botforge.org)

| Tool | URL | What it does |
|---|---|---|
| Client Generator V3 | `/clientgen` | Visually builds `index.js` + `package.json`: token (never sent/stored — optional), prefixes, folder layout (commands / slash cmds / **functions** = custom-function folder), client options (below), extension picker with per-extension config (ForgeDB: MySQL/PostgreSQL/BetterSQLite/SQLite/MongoDB; ForgeTopGG token; ForgeLinked/ForgeMusic flagged "check their README"), per-extension event toggles, and live intents display. Output tabs: `index.js` / `package.json`. |
| Application Commands Builder V2 | `/appbuilder` | Visual slash/context-menu builder. Base command name/description, advanced (default member permissions, age-restricted), options editor, localizations editor, **import from JSON**, export as **JSON or discord.js code**. Pairs with the `data:` command-file format (see `../core/bot-setup.md`). |
| Permissions Calculator V3 | `/permissions` | Permission-bit picker → permissions integer + OAuth2 invite link (client ID, redirect URI, scope picker). |
| Gateway Intents Calculator V3 | `/intents` | Intent picker with presets (Messages & DMs, Moderation & Members, Voice Bots, Presence, AutoMod, Reactions & Polls...), bitwise sum, privileged-intent warnings, and **code generation for discord.js / discord.py / discord.go / ForgeScript**, plus an "Active Events" view (which gateway events each intent enables). |
| Analyzer V1 | `/analyzer` | **Deprecated** (per the docs site card). PC-first code analyzer/debugger with editor settings (autocomplete, tooltips, minimap, logs panel). Successor for programmatic checks: the `/v1/validate` endpoint — see `../validate/README.md`. |
| ForgeVSC | github.com/tryforge/ForgeVSC | VS Code extension: syntax highlighting, autocompletion, snippets, live diagnostics. Not a web tool. |

### Client options surfaced by the Client Generator (the ForgeClient config surface)

`prefixes` (array) · `commands` folder · `slashCommands` folder · `functions` folder (custom functions, see `../core/custom-functions.md`) · `prefixCaseInsensitive` · `logLevel` (`none` / `veryLow` / `low` / `medium` / `high`) · `allowBots` (respond to bots/self) · `disableConsoleErrors` · `mobile` · `respondOnEdit` (+ a ms window — messages older than N ms are unusable) · trackers: **InviteTracker**, **VoiceTracker** · `extensions` (with per-extension config).

## The `/v1/discord` API (the calculators' backend — use it directly)

`GET https://api.botforge.org/v1/discord?resource=<r>` — anonymous tier, **5 req/min shared across all `/v1/` endpoints**.

### resource=intents → 21 intents
Each: `{name, value (bit), privileged, py, go, description}`. Includes exactly the three privileged ones everyone trips on: `GuildMembers`, `GuildPresences`, `MessageContent`. `py`/`go` carry the discord.py / discord.go constant names.

### resource=permissions → grouped by category
`[{category, permissions: [{name, value (bit), description}]}]` — 52 permissions in 8 categories (General Server / Membership / Channel / Roles / ... `Administrator` = `8`).

### resource=scopes → 29 OAuth2 scopes
`{name, description, checked (default), requiresApproval}` — `bot`, `applications.commands`, `identify`, etc.

### resource=events → 14 gateway events
`{name, intents: [...], description}` — base gateway events and their intent requirements (distinct from ForgeScript's 79 command events).

### resource=calculate → bitwise decoder (verified live)

- `?resource=calculate&intents=3276799` → `{input, active_intents: [...every intent name in the bitmask]}`
- `?resource=calculate&permissions=8` → `{input_value, is_administrator, total_granted, granted_permissions: [...52 names]}`
- Accepts **numeric strings only** (`intents` / `permissions`); name lists are NOT accepted (`Invalid intents value. Must be a valid numeric string.`). Missing params → 400 with a self-describing error listing accepted keys (`permissions`, `permission_names`, `events`, `intents`, `intent_names` — suggesting name-based inputs may exist server-side but numeric is the verified path).

### Agent workflows this enables

1. Decode a user's intents/permissions number → human list without any tool UI.
2. Pick intents for a bot spec → compute the sum → paste into ForgeClient config (or use the intents doc pages in `../events/` which list per-event requirements).
3. Generate invite links offline: `https://discord.com/oauth2/authorize?client_id=<id>&scope=bot%20applications.commands&permissions=<int>`.
