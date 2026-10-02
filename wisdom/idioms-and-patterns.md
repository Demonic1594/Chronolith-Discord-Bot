# Idioms and patterns — code shapes I'd actually write

Everything here uses **verified signatures** (see the linked `../knowledge/functions/...` pages).

## Gates first, work last

Order a command: restrictions → cooldown → guards → side effects → response.

```fs
$cooldown[$authorID-$commandName;30s;Slow down!]
$onlyIf[$hasRoles[$guildID;$authorID;staff]==true;You need the staff role.]
$onlyIf[$arrayLength[$get[queue]]>0;Queue is empty.]
... real work ...
```

Why: `$cooldown` and `$onlyIf` **send their message and `$stop`** the command (verified in source). Putting them first means nothing expensive runs when a gate fails. Note the composite cooldown key `$authorID-$commandName` — bare `$authorID` shares one bucket across *all* commands.

## Env as typed pipeline, `$get` at the boundary

`$let` values keep JS types (arrays stay arrays) until printed. So do transformation chains in env, and stringify at the end:

```fs
$let[n;$randomNumber[1;100]]
$let[score;$math[$get[n]*10]]
Your number: $get[n] → score: $get[score]
```

Anti-pattern: stringifying an array into text then re-splitting it three functions later. Keep it in `$let` until the last moment.

## `$if` for picking strings, `$ifx` for running branches

```fs
$if[$get[x]>=10;high;low]
```

Multi-statement branches need `$ifx` (block form, `$else`/`$elseIf` inside):

```fs
$ifx[
  $if[$get[x]>10;
    $let[status;great];
    $let[status;ok]
  ]
]
Status: $get[status]
```

Caveat: `$ifx` is **experimental** (source flag). Its bodies are raw code — `;` separates statements.

## Error handling that actually exists

There is **no `$suppressErrors`** (constant confusion with aoi.js). The real toolkit:

```fs
$try[
  $djsEval[...heavy risky thing...];
  $let[err;$get[e]]Something went wrong.;
  e
]
```

`$try[code;catchCode;errorVar]` stores the error message in env var `errorVar` — log it with `$log[$get[e]]` in dev. For single risky calls, the silent prefix: `$#$userAvatar[...]` — runs, swallows failure, continues.

## Component flows: build, send, await, branch

```fs
$let[msgID;$sendMessage[$channelID;Choose:;true]]
$addActionRow
$addButton[accept;Accept;Success]
$addButton[decline;Decline;Danger]
```

(`$addButton[custom ID*;label*;style*;emoji;disabled]` — the style arg is the `ButtonStyle` enum, **PascalCase keys**: `Primary`/`Secondary`/`Success`/`Danger`/`Link`. Earlier revisions of this file wrote aoi-style `;success;false;` shapes — lowercase styles fail the enum gate and `false` landed in the *emoji* slot. Production code uses the 3-arg form.)

Then in a component event (or `$awaitComponent[channelID;messageID;filter;successCode;time]` — filter is a condition field over each incoming interaction):

```fs
$awaitComponent[$channelID;$get[msgID];$customID==accept;You accepted!;60s]
```

Verified shape: `$awaitComponent[channel ID*;message ID*;filter*;success code*;time*]`. The filter runs per interaction against a cloned context — `$customID`/`$isButton` resolve against each incoming click.

## Data persistence: know which store you're in

- `$let`/`$get` — per-execution memory. Dies with the command.
- ForgeDB (`forge.db`) — cross-restart persistence; **prefer the modern helpers over the legacy `old`-category `$setVar`/`$getVar`** (upstream's 2.0.0 changelog literally says they removed them "to secure better results", and their metadata still carries them under category `old` — I treat that category as a graveyard).
- QuorielDB — LMDB-backed alternative, similar role.

Economy/ticket state belongs in a DB extension, never in `$let`.

## Anti-patterns I refuse to ship

| Anti-pattern | Why |
|---|---|
| `$djsEval` for things native functions do | `unsafe` category, injection surface, breaks under refactor; check `../knowledge/functions/_INDEX.md` first — 1120 functions, the thing usually exists |
| Guessing arg order when pointers are involved | Entity args resolve against earlier args; reorder = silent miss. Read the signature's param table before writing |
| `yes`/`no` for booleans | Rejected — literally only `true`/`false` |
| Raw `http://` URLs in URL args | Fail the `https`-only check |
| Deep nesting where `$let` names the intermediate | `$$a[$b[$c[...]]]` is unreadable and re-executes inner calls; `$let[x;$c[...]]` once, reuse |
| Building on `$while`/`$loop` when an array iterator exists | `$arrayForEach`/`$arrayMap` (experimental but purpose-built) express intent and avoid infinite-loop foot-guns |
| Trusting a clean validator report | It can't see unknown functions or type errors (`../knowledge/validate/README.md`) |
| Secrets anywhere near `$djsEval`/`$eval`/`$log` | Token/IP/credential leakage into Discord or console; see `security-notes.md` |
