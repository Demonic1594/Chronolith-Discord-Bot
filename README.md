# Chronolith — slim build (ban family + kicks + modlog viewer)

This tree is the **active development build** as of 2026-10-01. The full command set
(automod, tickets, notes, reports, config, help, …) still exists — see `_shelved/` —
and will be restored module by module after the keep-set is hardened.
`../Chronolith-Discord-Bot/` remains the full-build reference copy.

## What's active

| area | commands |
|---|---|
| ban family | `%ban` (hackban), `%hardban` (tempban, auto-unban on expiry), `%softban` (purge), `%massban`, `%unban` — prefix **and** slash |
| kicks | `%kick` / `/kick` |
| modlog viewer | `%modlog` / `%modlogs` (CV2), `%case`, `%cases`, `%reason`, `%moderations` |
| events | component router (buttons + select menus), snipe caches, message/member/role/channel logs, ready |

All punish commands run **native** (no `$punish` pipeline): inline per-target validation
(self/bot/owner, protected users, bot hierarchy, moderator hierarchy, already-banned),
`$ban`/`$unban` result checks, multi-target with per-target skip reasons, cases +
`ulist_` index + `ms_<mod>` counters + guarded modlog posts written inline.
Slash mirrors `$defer` up front (3s window) and answer via `$interactionFollowUp`.

`%modlog` is Components V2: colored container, text displays, dividers, edge-locked
page buttons + inert page chip, and an action dropdown built from the live log
(`$modlogActions`). Pages ascend (1-5, 6-10, …); recent opens the newest page.
Syntax: `%modlog`, `%modlog <action>`, `%modlog <user>`, `%modlog "Ha ra" <action>`,
`%modlog set <#channel|off>` (Manage Server gated).

## Storage — per-concern databases (`dbsplit.js`)

ForgeDB is a singleton, so `dbsplit.js` wraps its static methods and routes by var-name
prefix into separate sqlite files under `database/`:

`moderation.sqlite` (case_*, caseCount, ulist_*, note/report indexes) ·
`security.sqlite` (tb_*, timedouts, lkd_*, anc_*, rl_*, joins_*) ·
`config.sqlite` (cfg) · `ephemeral.sqlite` (snipe/ms caches) ·
`cooldowns.sqlite` · `forge.db` = misc fallback (drained).

`DB_SPLIT=off` disables routing; `DB_FOLDER` relocates the buckets.
**Any harness or script that reads/writes guild vars must `require("./dbsplit")`
and await `init()` after login**, or it sees the drained `forge.db`.

## Operating

- Start/restart: **`sh restart.sh`** — the only sanctioned way. It pkills every
  `node index.js`, waits, removes the lock, starts one instance, and aborts loudly
  if more than one is running. Never kill a single PID: zombie sessions on one token
  double-handle every interaction.
- The startup lock refuses loudly (with the pkill instruction) if another instance lives.
- Offline gates: `node validate.js` (real compiler, lazy function bodies force-compiled),
  `node tools/scanbrackets.js` (heuristic — trust validate first).

## Test harnesses (`tests/`)

- `click.js <customID>…` — fabricates button/select interactions against the router
  (prefix `sel:` + `SEL_VALUE=` for dropdowns); captures payloads, no API calls.
- `native.js` — prefix-command live probes (rejection paths, viewer rendering).
- Message fabrication pattern (used everywhere): fabricate `Message`, emit
  `messageCreate`, read replies back via REST. Slash fabrication works but cannot
  pass `$defer` offline (fake token).

## Conventions (enforced by review)

- `;` between `$and`/`$or` conditions — never commas (silent always-false).
- `#`-prefix every color literal (digits-only = decimal; `4E5058`-shapes crash).
- `$math` grouping with `(` `)`, never brackets — a bare `]` terminates the field.
- Markdown links written `\[text\](url)`; no bare `]` in any displayed text.
- Snowflakes quote-wrapped into JSON (`$jsonSet[c;u;"$env[u]"]`).
- `$djsEval` bodies: no brackets, no backslashes, plain `;` (see `functions/duration.js`).
- Mod counters `ms_<modID>` JSON `{type: count}` on every successful action.

## Restore path (unshelving)

`_shelved/prefixesCmd/`, `_shelved/slashesCmd/` (files flattened with folder prefixes),
`_shelved/*.js` (events), `_shelved/functions/`. Move files back to their folders and
re-run `validate.js`. Note: `tools/gen_commands.py` predates the slim build — it still
emits the FULL command set; reconcile it before regenerating anything.
