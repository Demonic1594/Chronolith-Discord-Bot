# Starter-kit audit — the one that corrected my event docs

> Source: `../../code/botforge-starter-kit/` (github.com/rokon-sm/botforge-starter-kit, cloned 2026-09-26). A small, clean starter bot: **ForgeScript ^2.6.0 npm**, ForgeDB ^2.1.0 (sqlite), 13 files. "Verified working" — and it immediately caught a real bug in my generated docs.

## The correction: event/command files require `type`

Every command file in this kit (and amc) carries `type: "messageCreate"` / `type: "clientReady"` / `type: "interactionCreate"`. Source: `IBaseCommand.type: T` is **required** (`validate()` throws `MissingCommandType`), `CommandType = keyof ClientEvents`; `name` is *optional* and primarily the trigger/custom-ID filter. My generated event pages and `bot-setup.md` taught `module.exports = { name: "messageCreate", code }` — which would throw on current `main`. Fixed generator + curated examples + bot-setup (regenerated all 79 event pages).

This is the **third** README-legacy-drift surface: slash `data:` format, command `type:` requirement, and the old `name`-only example — each corrected only because a production repo contradicted my inherited example.

## Dynamic prefixes: prefixes are compiled and resolve per message

```js
prefixes: ["$getGlobalVar[prefix]"]
```

ForgeClient compiles each prefix entry (`Compiler.compile`), and the messageCreate handler resolves them **per message** (`await this.getPrefix(message)`). Consequence: a DB-backed prefix updates **live** — the kit's `prefixset` command just writes the global var ("active immediately, does not require a bot restart" — its own words, mechanism now explained). Prefix entries may be arbitrary `$fn` expressions.

## More command-matching mechanics (from the messageCreate handler source)

- Command names are matched **case-insensitively by default** (opt out with `nameCaseInsensitive: false`).
- `prefixMode` / `unprefixed` fields: commands can require (default), optionally accept, or ignore prefixes.
- The command name is stripped before args → `$message[0]` is the first argument (re-confirmed, third repo).

## New functions verified

- `$chalkLog[text*; styles(rest)]` — colored console output (`cyanBright`, `greenBright;bold`, ...) — the pretty-startup-banner function.
- `$applicationCommandCount[guildID?;local?]`, `$commandCount[type]` — command statistics for botinfo panels.
- Stats family confirmed in context: `$guildCount`, `$userCount`, `$parseMS[$uptime]`, `$round[$ram]`, `$cpu`, `$nodeVersion`, `$ping`.
- `$pingms` in botinfo = `$ping` + literal `ms` text — second repo with the concatenation gotcha.

## Patterns worth keeping

- **Owner-or-team gate**: `$onlyIf[$or[$authorID==$botOwnerID;$hasRoles[$guildID;$authorID;$djsEval[process.env.TeamRoleID]]];...]` — env-var-injected role ID inside `$hasRoles`, `$djsEval` as the process.env bridge.
- **Eval command done right** (second sighting): gate first, `$onlyIf[$message!=;...]` for non-empty, then `$eval[$message;false]`.
- **Folder layout is organization, not namespacing**: `Events/ForgeScript/Prefixs/<group>/<cmd>.js` — group folders don't alter triggers; `name` is explicit per file.
- **ForgeDB events**: `connect`, `variableCreate`, `variableDelete`, `variableUpdate` (different naming from QuorielDB's `databaseConnect`/`recordUpdate`/`recordRemove` — don't mix the two DB extensions' event vocabularies).
- `$log[]` bare as an empty console line — cheap banner spacing.
- `client.functions.load('./Functions')` + `applicationCommands.load('./Commands')` on directories that don't exist in the repo — the loaders no-op gracefully on missing folders (worth knowing: no crash, just nothing loaded).

## Verdict

Zero contradictions in the kit's own code; one real doc bug found in mine (the `name:`-only event example). Small repos audit fast and catch shape-level errors the big token sweeps can miss — because starter kits exercise the *canonical minimal patterns* every beginner copies, which is exactly where my docs' examples live.
