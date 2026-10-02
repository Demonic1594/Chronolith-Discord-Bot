# Task → function map — the reverse index

> When you know the *job* but not the name. Every signature below verified against `../knowledge/` 2026-09-27. `*` = required. This maps to categories; browse the full surface in `../knowledge/functions/_INDEX.md` (1,120 functions, 46 categories).

## Say something

| Task | Function |
|---|---|
| Send to a channel | `$sendMessage[channel ID*;content;return message ID]` |
| Reply to the trigger | bare `$reply` — or `$reply[channel ID*;message ID*;disable ping]` |
| Edit a message | `$editMessage[channel ID*;message ID*;content]` |
| DM a user | `$sendDM[user ID*;content;return message ID]` |
| Delete later | `$deleteIn[...]` (message category) |
| React | `$addMessageReactions[channel ID*;message ID*;emojis...]` |

## Make it pretty

| Task | Function |
|---|---|
| Classic embed | `$title[text*;hyperlink;index]` `$description` `$addField[name;value;inline;index]` `$color[color]` `$author` `$footer` `$image[url]` `$thumbnail[url]` `$timestamp` |
| Components V2 layout | `$addContainer[components*;accentColor;spoiler]` + `$addTextDisplay[text]` `$addSeparator` `$addSection[...]` |
| Attach a file | `$attachment[content;filename;asText]` |
| Suppress the pings | `$nomention` |
| Generated image (welcome cards, leaderboards) | ForgeCanvas: `$createCanvas[name;w;h]` → `$loadImage`/`$drawImage`/`$drawText`/`$drawRect` → `$attachCanvas[name*;filename;format]` |

## Interact (buttons, selects, modals, autocomplete)

| Task | Function |
|---|---|
| Start a row | `$addActionRow` (bare; ≤5 buttons/row, a select takes the whole row) |
| Allow / deny / reset a channel overwrite | `$addChannelPerms[ch;id;Perm]` ALLOW · `$removeChannelPerms[ch;id;Perm]` DENY · `$deleteChannelPerms[ch;id;Perm]` INHERIT (enum keys, no +/- signs) |
| Button | `$addButton[custom ID*;label*;style*;emoji;disabled]` — style: `Primary Secondary Success Danger Link` |
| String select | `$addStringSelectMenu[custom ID*;placeholder;disabled;minValues;maxValues]` + `$addOption[name*;description;value*;emoji;default]` |
| Read the picks | `$selectMenuValues[index;separator]` (0-based) |
| Wait once for a click | `$awaitComponent[channel ID*;message ID*;filter*;success code*;time*]` |
| Reply to an interaction | `$interactionReply[content*;return message ID]`; ephemeral = `$ephemeral` before it; slow work = `$defer` → `$interactionFollowUp[content]`; refresh component message = `$interactionUpdate[content*]` |
| Modal | `$addTextInput[...]` → `$awaitModalSubmit[...]` |
| Autocomplete | option `autocomplete: true` + `allowedInteractionTypes: ["autocomplete"]` handler: `$focusedOptionName` `$focusedOptionValue` `$addChoice[name*;value*]` `$autocomplete` (≤25 choices) |
| Who clicked / what | `$customID` `$isButton` `$interactionRawData` `$applicationCommandName` `$applicationSubCommandName` |

## Gate & guard (order: restrictions → cooldown → guards → work → output)

| Task | Function |
|---|---|
| Generic condition gate | `$onlyIf[condition*;error code]` (empty response = silent stop) |
| Cooldown | `$cooldown[id*;duration*;code]` (sends its message + stops); scoped: `$userCooldown` `$channelCooldown` `$guildCooldown` `$memberCooldown` — key on IDs, e.g. `$authorID-$commandName` |
| Owner/staff only | `$onlyForUsers[code*;users(rest)]` (code FIRST — often left empty) · `$hasRoles[guild ID*;user ID*;roles*]==true` · `$hasPerms[guild ID*;user ID*;perm]` |
| Server only / NSFW / bots | `$onlyIf[$guildID!=;...]` · `$onlyIf[$channelNSFW[$channelID]==true;...]` · client `allowBots` |

## Members, roles, moderation

| Task | Function |
|---|---|
| Give/take roles | `$memberAddRoles[guild ID*;user ID*;roles(rest)]` / `$memberRemoveRoles[...]` |
| Ban / unban / kick | `$ban[guild ID*;user ID*;reason;delete message seconds]` · `$unban` · `$kick` |
| Timeout | `$timeout[guild ID*;user ID*;duration;reason]` |
| Who is this | `$username[id]` `$userTag[user ID*]` `$userAvatar[user ID*;size;extension]` — user-scoped works after they leave; member-scoped won't |
| Resolve input to an ID | `$mentioned[index*;return author]` `$mentionedRoles[index*]` `$findUser[...]` (lookup category) `$roleID` `$channelID` |
| Exists? | `$userExists` `$channelExists` `$roleExists[guild ID;role ID]` `$emojiExists` |
| Join/created dates | `$memberJoinedAt[guild;user]` `$userCreatedAt[id]` → format with `$parseDate[ms*;type*]`; humanize durations with `$parseMS` |

## Logic & data shaping

| Task | Function |
|---|---|
| If / chain / switch | `$if[cond;then;else]` · `$ifx[block]` (sibling `$if`/`$elseIf`/`$else`) · `$switch[value*;cases*]` + `$case[value*;code*]` |
| Loop | `$loop[times*;code*;var;asc]` (counter 1-based; `-1` = infinite) · `$while[condition*;code*]` |
| Compare/compose conditions | `$checkCondition[expr]` `$and[...]` `$or[...]` (there is no `$not` — negate with `!=`) |
| Text | `$toLowerCase` `$toUpperCase` `$replace[text*;match*;new value*;amount]` `$checkContains[text*;matches*]` `$trim` `$charCount` |
| Math | `$math[expr*]` `$sum[numbers*]` `$randomNumber[min*;max;decimals]` `$round[n]` `$abbreviateNumber` `$separateNumber` `$parseInt` `$ordinal` |
| Array | `$arrayLoad[variable*;separator;values]` → `$arrayAt` `$arrayJoin` `$arrayPush` `$arrayLength` `$arraySort[variable*;output;sort type]` `$arrayFilter` `$arrayMap` `$arraySome` `$arrayFindIndex` `$arraySplice` `$arraySlice` |
| JSON | `$jsonLoad[variable*;json*]` `$env[var;path...]` `$jsonSet[...keys;value]` `$jsonDelete` `$jsonEntries[var]` `$jsonStringify` |
| Env | `$let[key;value]` `$get[key]` `$env[key;path...]` `$letSum[key;value]` |

## Persist

| Task | Function |
|---|---|
| Per-user value (restart-safe) | ForgeDB `$getUserVar[name*;user ID?;default?]` / `$setUserVar[name*;value*;user ID?]` |
| Global value | `$getGlobalVar[name;default]` / `$setGlobalVar[name;value]` |
| Per-guild value | `$getGuildVar` / `$setGuildVar` |
| Leaderboards | `$getUserLeaderboardID/Value/Length` |
| Cross-command scratch (dies on restart) | Edge `$setCache[table*;name*;value*]` `$getCache[table*;name*;var?]` `$hasCache` `$deleteCache` |
| Declare defaults once | `ForgeDB.variables(json)` in JS |

## Schedule & background

| Task | Function |
|---|---|
| Run code later (in-memory) | `$setTimeout[code*;time;name]` + `$clearTimeout[name]` |
| Repeat | `$setInterval[code*;time;name]` + `$clearInterval[name*]` |
| Survive restarts | persist absolute `endTime` + escaped code in a DB; `clientReady` resweep re-arms (timeout-system pattern) — timers >24.8 days must re-arm recursively |
| Fire-and-forget now | `$async[code]` |
| Pause this execution | `$wait[duration*]` |

## Reach outside

| Task | Function |
|---|---|
| HTTP GET/POST | `$httpRequest[url*;method*;variable?]` — returns status; body auto-typed into env var; stage `$httpAddHeader[k*;v*]` `$httpSetBody[...]` `$httpSetContentType[...]` (auto-cleared) |
| Raw JS escape hatch | `$djsEval[code*]` — owner-gated, never user input; inside it: `ctx.getEnvironmentKey(name)`, `ctx.member/channel/client`; escape `;` as `\\;` |
| Read a local file | `$readFile[path*;encoding?]` |
| Webhooks | `$webhookSend` + `$webhookCreate/Edit/Delete/Token/URL` family (webhook category) |
| Run stored code | `$eval[code*;send]` (pairs with `$escapeCode[code*]`) |

## Debug & meta

| Task | Function |
|---|---|
| Console breadcrumb | `$log[...messages]` (host console, NOT Discord) · colored: `$chalkLog[text*;styles...]` · typed: `$logger[type;text]` |
| Inline comment | `$c[comment]` |
| Suppress output/errors | `$!fn` / `$#fn` prefixes · `$silent` (bare) |
| Bot stats | `$ping` `$uptime` `$ram` `$cpu` `$guildCount` `$userCount` `$commandCount[type]` |
| Count pieces | `$@[sep]fn[...]` prefix |

## Notable absences (things people expect that DON'T exist)

`$suppressErrors` (→ `$#fn`/`$try`) · aoi `$interactionReply[msg;;;ephemeral]` 5-arg shape (→ 2 args + `$ephemeral`) · `$giveRole`/`$takeRole` (→ `$memberAddRoles`/`$memberRemoveRoles`) · `$argsCount` (→ `$argCount[text*]`) · in-language cron (→ `$setInterval`/host-side) · `$clientToken` (exists — enables raw Discord REST from ForgeScript; treat as highly sensitive).
