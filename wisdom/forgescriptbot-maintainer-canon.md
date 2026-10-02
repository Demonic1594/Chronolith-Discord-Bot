# ForgeScriptBot — the maintainer canon

> Source: `../../code/forgescriptbot/` (github.com/xNickyDev/ForgeScriptBot, cloned 2026-09-26). Written by **Nicky — ForgeScript's lead developer** — running `github:tryforge/ForgeScript#dev`. This is the highest-authority style reference that exists: where maintainer code and my docs disagree, the docs are wrong. (Here, they didn't — but the bot *added* canon my docs lacked.)

## What the bot is

The official docs-bot: slash `/search` with subcommands (function/enum/event/package/changelog) and autocomplete over the live `raw.githubusercontent.com` metadata — the same data pipeline my knowledge base uses, written by the person who generates that metadata.

## Sweep verdict

108 distinct `$fn` tokens, **all resolve — zero unknowns** (the two "unresolved" were string-concatenation artifacts: `$pingms` in "Pong! $pingms", and `$applicationSubCommandName`+`sUrl` building the key `"functionsUrl"` from subcommand name "function"). Third repo confirming function-output-mid-string as a core idiom.

## Canonical patterns (maintainer-authored)

**Class-instance exports everywhere**: `new BaseCommand({...})`, `new ApplicationCommand({...})`, `new ForgeFunction({...})` — not plain objects. Managers accept both, but the maintainer prefers instances (type-safety). Now documented in `../knowledge/core/custom-functions.md`.

**The maintainer eval command** (the reference implementation of owner-eval):
```fs
$onlyForUsers[;$botOwnerID]
$let[result;$trim[$eval[$message;false]]]
$if[$charCount[$get[result]]>2000;$attachment[$get[result];result.json;true];$get[result]]
$try[$!addMessageReactions[$channelID;$messageID;✅]]
```
Gate → eval → long-output-to-attachment → success reaction, silent reaction failure. This is the shape to hand anyone writing an eval command.

**`$httpRequest` returns the HTTP status code** — `return this.success(req.status)` from source; the body goes to the env var auto-typed (JSON→object, image→base64 buffer, else text; `$httpSetContentType` overrides parsing). Maintainer idiom: `$onlyIf[$httpRequest[url;GET;var]==200]` / `"$if[...==200; ...]"` gates. My curated example now demonstrates this; previously undocumented.

**Sparse metadata flags**: `metadata/functions.json` emits `experimental`/`deprecated` keys **only when true** — `$env[function;deprecated]` reads undefined-falsy otherwise. Crosscheck against my source-harvest: **perfect agreement (25 experimental + 5 deprecated, both sources)** — my extraction is independently validated. Also: `metadata/paths.json` maps kind→source dir (`functions: src/native`) — how the docs-bot builds source links.

**Autocomplete at scale** (docs-bot `functions.ts`) — the canonical loop over a fetched array with dual counters:
```fs
$while[$and[$get[n]<25;$env[functions;$get[i]]!=];
  ...$if[$or[$includes[...];$arraySome[aliases;alias;...]];$addChoice[...;...]$letSum[n;1]]
  $letSum[i;1]
]
$autocomplete
```
- `$applicationSubCommandName` scopes autocomplete to a subcommand — new scoping function for subcommand-based commands.
- `$arrayFindIndex[arr;var;$return[$checkCondition[...]]]` — `$return` directly inside a find-predicate (cleaner than the `$if[...;$return[...]]` filter for single-match search).
- `$onlyIf[cond;]` with an **empty** response = silent stop (maintainer style, repeatedly).

**Rotating status** (setStatus.ts): `$setInterval[code;1m]` + `$readFile[data/statuses.json]` + `$eval[$env[statuses;$get[n]];false]` — stored JSON strings containing `$fn` code, executed via `$eval` (freeze/thaw without `$escapeCode` when the code passes through JSON, not through function args). Wraps the index manually (`$if[$get[n]>=$arrayLength[...];$let[n;0]]`).

**Ping-as-prefix**: `prefixes: [".", "f!", "<@$botID>", "<@!$botID>"]` — mention the bot to command it. Compiled prefixes with `$botID`, resolved per message.

**`ForgeDB.variables(json)`** — static default-value declaration; `$getGlobalVar[theme]` falls back to declared defaults. Plus `type: "better-sqlite3"` config and the ForgeDB event vocabulary in use again (`connect`/`variableCreate`/...).

**Delegation style**: message commands stay one-liners (`$avatarCmd[$findUser[$message[0]]]`) — lookup function (`$findUser`) resolves user text, custom function renders. Thin commands, fat custom functions.

## Notes

- `dist/` is committed alongside `src/` — the bot loads compiled output (`functions.load("dist/functions")`), a TS build-deploy pattern for ForgeScript.
- `client.commands.add({ type: "clientReady", code })` — programmatic inline command for trivial startup logging, no file needed.
- Command metadata fields in maintainer use: `name`, `aliases`, `description`, `usage`, `type` — the canonical message-command header set.
