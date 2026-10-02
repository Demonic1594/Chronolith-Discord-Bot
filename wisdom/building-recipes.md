# Building recipes — composable playbooks from verified functions

Every function below was signature-checked against `../knowledge/`. These are skeletons to adapt, not drop-in code — fill gates, IDs, and error handling per `idioms-and-patterns.md`.

## 1. Prefix command with gates + embed response

```fs
$cooldown[$authorID-$commandName;10s;You're doing that too fast.]
$onlyIf[$argCount[$message]>=1;Usage: !say <text>]
$title[Announcement]
$description[$message]
$color[#5865F2]
$footer[From $username[$authorID]]
```

Message args are **0-based**: bare `$message` = all args, `$message[0]` = first, `$message[0;3]` = slice, `$argCount[text]` counts.

## 2. Slash command with options + ephemeral feedback

```js
// command file: name "greet", type "slash", option "user" (USER, required)
```

```fs
$interactionReply[Welcome, <@$input[user]>!]
```

`$input[customID*;separator]` reads option values. Ephemeral: `$ephemeral` (bare flag) before the reply. Long work first: `$defer` (bare) → `$interactionFollowUp[Done!]` (2 args: content, return message ID).

## 3. Buttons → branch on click

```fs
$let[mid;$sendMessage[$channelID;Accept the rules?;true]]
$addActionRow
$addButton[rules-accept;I agree;Success]
$addButton[rules-decline;Decline;Danger]
```

Button style is the `ButtonStyle` enum — **PascalCase** (`Primary`/`Secondary`/`Success`/`Danger`/`Link`); aoi-style lowercase `success`/`danger` fail the enum gate. Emoji and disabled are the 4th/5th args (`$addButton[id;Label;Style;:emoji:;true]`) — earlier revisions of this file put `false` in the emoji slot via the `;false;` trailing shape; corrected 2026-09-27.

Interactive wait (same code path):
```fs
$awaitComponent[$channelID;$get[mid];$customID==rules-accept;You are now a member!;5m]
```
`$awaitComponent[channel ID*;message ID*;filter*;success code*;time*]` — the filter is a condition over each incoming interaction (`$customID`, `$isButton`, ...). For persistent buttons, branch in a component interaction event instead.

## 4. Economy counter (ForgeDB)

```fs
$cooldown[$authorID-work;1h;You already worked. Try again later.]
$let[pay;$randomNumber[5;25]]
$setUserVar[balance;$math[$getUserVar[balance]+$get[pay]]]
You earned $get[pay] coins. Balance: $getUserVar[balance]
```
Verified shapes: `$getUserVar[name*;userID?;default?]` (userID defaults to context user), `$setUserVar[name*;value*;userID?]`. Leaderboards exist as `$getUserLeaderboardID/Value/Length`. Never store balances in `$let` — env dies with the command.

## 5. Welcome card (ForgeCanvas — named-canvas model)

```fs
// on guildMemberAdd event
$createCanvas[welcome;800;300]
$loadImage[avatar;$userAvatar[$userID;1024;png]]
$drawImage[welcome;$get[avatar];0;0;800;300]
$drawRect[welcome;fill;rgba(0,0,0,0.5);0;0;800;300]
$drawText[welcome;fill;Welcome $userTag[$userID]!;bold 42px sans-serif;#ffffff;400;150]
$attachCanvas[welcome;welcome.png]
$sendMessage[$channelID;Welcome, <@$userID>!;false]
```
ForgeCanvas is a named-canvas API: create → load/draw → `$attachCanvas[canvas*;filename;format]`. Shape-check every call against `../knowledge/extensions/forgecanvas/functions/_INDEX.md` — 111 functions, that index is authoritative.

## 6. Moderation: timeout with reason

```fs
$onlyIf[$hasRoles[$guildID;$authorID;staff]==true;Staff only.]
$onlyIf[$mentioned[0]!=;Mention a user to timeout.]
$timeout[$guildID;$mentioned[0];$message[1] or 10m;Timed out by $username[$authorID]]
```
`$ban[guildID;userID;reason?;deleteSeconds?]`, `$kick`, `$unban` follow the same shape. `$mentioned[N]` extracts mentioned IDs — **0-based** (`$mentioned[0]` = first mention, matching `$message[0]`).

## 7. Poll / vote collector

```fs
$let[mid;$sendMessage[$channelID;Vote below!;true]]
$addActionRow
$addStringSelectMenu[vote-menu;Pick one]
$addOption[Yes;Vote yes;yes]
$addOption[No;Vote no;no]
```

`$addStringSelectMenu[custom ID*;placeholder;disabled;minValues;maxValues]` takes the whole row; its options come from `$addOption[name*;description;value*;emoji;default]` — a select without options is dead UI. Then handle in the string-select interaction event branching on `$isStringSelectMenu` + `$customID`, reading picks with `$selectMenuValues[0]` (0-based). For structured answers use `$awaitModalSubmit` after `$addTextInput`-built modals.

## 8. HTTP API read with error handling

```fs
$try[
  $httpAddHeader[Authorization;Bearer $get[token]]
  $!httpRequest[https://api.example.com/status;GET;res]
  $jsonLoad[data;$env[res]]
  Status: $env[data;status];
  API unreachable (stored: $get[err]);
  err
]
```
`$httpRequest[url*; method*; variable?]` — the response lands in an env variable (default name `result`); read it with `$env[res]` / `$jsonLoad[res;$env[res]]` + `$env[data;key]` paths. Request options are staged on the context (`$httpAddHeader`, `$httpSetBody`, `$httpSetContentType`, form fields) and cleared after the call. URL must be `https://`. (Note: an aoi-style 5-arg shape with a trailing `json` flag is WRONG here — that shape slipped into earlier revisions of this file and was corrected after the amc audit.)

## 9. Auto-role on join (ForgeLinked does this natively)

Prefer ForgeLinked's voice/link roles over hand-rolled event code. For join roles without it:

```fs
// guildMemberAdd event
$memberAddRoles[$guildID;$userID;123456789012345678]
```

## 10. Scheduled loop (e.g. hourly cleanup)

No cron in-language: use an event or interval via `$async`/`$coroutine` carefully, or host-side scheduling that triggers a command. Don't fake timers with `$wait` in a loop in a user-facing command — `$wait[duration]` blocks that execution, not just the reply.
