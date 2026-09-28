# Chronolith — test campaign report

Date: 2026-09-28. Layers: static analysis → compiler validation → REST smoke
tests → synthetic-gateway end-to-end → exploit/abuse review. Bottom line:
**16/16 end-to-end tests pass** after the fixes below.

## 1. Conventional (offline)

| Layer | Tool | Result |
|---|---|---|
| Bracket/name sanity | `tools/check.py` (models JS template cooking) | 141 files, 0 problems |
| Signature audit vs KB metadata | `tools/audit.py` (arity, required args, literal gate feasibility) | 2 false positives (empty-String `$let` — proven legal in runtime source) |
| Real compiler | `validate.js` (loads every command; **force-compiles engine bodies** — they compile lazily at runtime) | 184/184 definitions |

## 2. REST smoke tests (live)

- Identity/guild/session verified.
- **BUG FOUND & FIXED**: `applicationCommands.load()` turns *subfolders* into
  subcommand-groups — the bot had registered 8 group-commands (`/mod ban`…)
  instead of 55 flat commands. Slash files now emit flat; registration
  verified by listing the live application commands.

## 3. Synthetic-gateway E2E (`tests/synth.js`)

The harness process *is* the bot (full load + real login), fabricates
discord.js `Message` objects in a disposable test channel and emits
`messageCreate`, then asserts on the bot's real replies:

```
16/16 PASS — ping, help, config(mod gate), warn-reject, case-reject,
snipe-empty, slowmode-usage, stats, words, automod-validation, delwarn-reject,
unban-usage, reason-usage, massban-usage, tempban-reject, lockdown+report
```

Run with:
```bash
TEST_GUILD=<id> TEST_CHANNEL=<id> TEST_AUTHOR=<a real member with ManageServer> \
  node tests/synth.js     # production bot must be stopped first
```

## 4. Exploit / abuse review — findings and fixes

| Vector | Finding | Fix |
|---|---|---|
| Fake-command automod bypass (`c!discord.gg/x`) | prefix-prefixed junk skipped ALL filters | automod now only skips when the word after the prefix is a real command name |
| Warn escalation recursion | `warnset … warn` would recurse warn→escalate→warn forever | escalation only fires for terminal actions (mute/kick/ban); `warnset` rejects `warn` |
| Link-whitelist substring bypass (`evil.com/?x=youtube.com`) | substring match allowed forged domains | whitelist now anchored on `//domain` |
| Caps filter false positive | digit/emoji-only messages counted as "caps" | also requires the message to differ from its lowercase form (contains letters) |
| Timeout > 28d | Discord API rejects; case was still filed | durations clamped to 28d in the mute path |
| Deleted-fast messages | automod's content fetch 404'd and posted raw `InvalidArgType` errors to the channel | fetch silenced + early return |
| `[\]` empty-array defaults | fragile through JS-cooking + compiler bracket tracking; delivered garbage in at least one path (snipe) | replaced with empty-check + `$arrayLoad`/guarded `$jsonLoad` everywhere |
| Crash on transient storage errors | `SQLITE_IOERR` killed the process via unhandled rejection | `process.on("unhandledRejection"/"uncaughtException")` survival handlers in index.js |
| Cooldown bypass | keys are author-ID based, not user text | verified safe |
| CustomID forgery | verify/help/tkclose buttons check the author segment; page inputs clamped | verified safe |
| Case JSON injection | reasons stored via `$jsonSet` (proper escaping), never interpolated | verified safe |
| eval RCE surface | owner-only, first-line gate, maintainer shape | verified safe |

## 5. Not automatable here (needs a second member account)

- automod violations end-to-end (mods bypass by design — the test author is a mod)
- hierarchy rejections between two real members (mod vs higher-role target)
- verification button click-through in a real DM
- anti-nuke trip via a real non-mod admin action

These are logic-reviewed and compile-verified; the paths they share with the
tested flows (gates, cases, embeds, sweep interval) are covered.
