# Function relationships — ordering requirements, pairings, conflicts, context gates

Mined from all 1,120 function pages, 96 guides, and 8 real-world repos. This is the
companion to `task-to-function-map.md` — that file answers "which function?", this one
answers "in what order, with what prerequisites, and what conflicts?"

## Hard ordering requirements (skip = silent failure)

| Must run first | Then works | If skipped |
|---|---|---|
| `$arrayLoad` / `$arrayCreate` / `$let[name;...]` | `$arrayAt`, `$arrayJoin`, `$arrayLength`, `$arrayPush`, `$arraySort` | Empty/undefined, `$arrayPush` no-ops |
| `$jsonLoad[var;json]` | `$jsonKeys[var]`, `$jsonHas`, `$jsonStringify`, `$jsonSet` (operates on LAST loaded) | Empty return, writes go nowhere |
| `$textSplit[text;sep]` | `$splitText[i]`, `$getSplitTextLength`, `$splitTextJoin` | Empty (separate hidden store) |
| `$httpAddHeader` / `$httpSetBody` / `$httpSetContentType` | `$httpRequest` (consumes and CLEARS staged options) | Options ignored |
| `$httpRequest[...,var]` | `$httpResult[key]`, `$httpPing`, `$httpGetHeader` | Empty/0 |
| `$setAuditLogReason[reason]` | `$ban`, `$kick`, `$timeout`, `$memberAddRoles` (uses `reason \|\| ctx.reason`) | Action runs without reason |
| `$addActionRow` | `$addButton`, `$addStringSelectMenu` (attach to newest row) | Compile may pass but Discord rejects |
| `$addStringSelectMenu` | `$addOption` (attaches to newest select) | Option orphaned |
| `$sendMessage[...;true]` (returns ID) | `$awaitComponent[channel;msgID;...]` | Missing message ID |
| `$modal[customID;title]` + `$addLabel` + `$addTextInput` | `$showModal` dispatches → later `$input[customID]` reads | Modal incomplete |
| `$setTimeout[code;time;name]` | `$clearTimeout[name]` | Returns false (nothing to clear) |
| `$findUser` / `$findChannel` / `$findRole` | Any snowflake-arg function | InvalidArgType |
| `$fetchMembers` / `$fetchChannels` / `$fetchRoles` | Cache-dependent getters (`$memberRoles`, `$guildChannelIDs`) | Cache miss = empty |

## The container lifecycle (the #1 source of ordering bugs)

```
[decorator functions mutate container]
  embeds: $title, $description, $addField, $color, $author, $footer, $image, $thumbnail, $timestamp
  components: $addActionRow → $addButton / select → $addOption (LIFO stack)
  flags: $ephemeral, $tts, $silent, $reply, $nomention, $deleteIn, $attachment
  [send function flushes and RESETS]
    $sendMessage, $sendDM, $interactionReply, $interactionFollowUp, $editMessage
    implicit send (end of command) also flushes
  [after flush: container is EMPTY — rebuild everything for the next send]
```

**Critical: `$cooldown`/`$onlyIf` error sends bypass `doNotSend` and RESET the container.
Embeds built BEFORE a cooldown check are destroyed if the cooldown fires.**

## Mutually exclusive / conflicting functions

| Conflict | Why |
|---|---|
| `$defer` vs `$interactionReply` | Both consume the reply slot; after `$defer` use `$interactionFollowUp` |
| `$deferUpdate` vs `$interactionUpdate` | Same slot for component interactions |
| `$ephemeral` after reply/defer | No effect — read at flush time only |
| `$fetchComponents` + manual components | `$fetchComponents` OVERRIDES manually added components |
| `$tts` vs `$silent` | Contradictory message flags |
| `$wait` vs `$setTimeout` for same delay | Double-fires (blocks + schedules independently) |
| `$stop` vs `$break` | `$stop` kills whole command; `$break` only innermost loop |
| `$textSplit` store vs `$arrayLoad` store | Disjoint — `$splitText` can't read named arrays and vice versa |
| `$editMessage` + plain send in same response | `$editMessage` repurposes the container for editing |
| `$loadXContext` + any function needing original context | Context replacement is irreversible (use `$scope` to clone) |

## Context-gated functions (only work in specific events)

| Event | Functions that need it |
|---|---|
| interactionCreate (button/component) | `$customID`, `$isButton`, `$isAnySelectMenu`, `$selectMenuValues`, `$isMessageComponent` |
| interactionCreate (slash) | `$option`, `$applicationCommand*`, `$isSlashCommand` |
| autocomplete | `$focusedOptionName`, `$focusedOptionValue`, `$addChoice`, `$autocomplete` |
| modal submit | `$input`, `$isModal` |
| context menu | `$targetMember`, `$targetMessage`, `$targetMessageEmbeds` |
| messageUpdate | `$oldMessage[prop]`, `$newMessage[prop]` |
| guildMemberUpdate | `$oldMember[prop]`, `$newMember[prop]` |
| all `*Update` events | matching `$oldX[prop]` / `$newX[prop]` (38 state functions) |
| guildAuditLogEntryCreate | `$auditLog[prop]` |
| autoModerationActionExecution | all `$automod*` getters |
| poll vote events | `$pollAnswer*` functions |
| reaction events | `$reactionEmoji`, `$reactionAuthorID`, `$reactionCount` |
| guild-only (fail in DMs) | `$onlyForRoles`, `$onlyForChannels`, `$onlyForGuilds` (fail-closed in DMs) |

## Side-effect classification

| Category | Functions | Notes |
|---|---|---|
| **Sends** | `$sendMessage`, `$sendDM`, `$interactionReply`, `$interactionFollowUp`, `$interactionUpdate`, `$webhookSend`, `$forwardMessage`, `$eval[...;true]` (defaults to send!) | Network calls |
| **Container mutators** (83+) | embed fns, component fns, `$ephemeral`, `$tts`, `$reply`, `$attachment`, `$sticker`, `$fetchEmbeds`/`$fetchComponents`/`$fetchResponse`, `$loadEmbeds`/`$loadComponents` | In-memory until flushed |
| **Env mutators** | `$let`, `$delete`, `$arrayLoad`/`$arrayPush`/`$arraySort`, `$jsonLoad`/`$jsonSet`/`$jsonDelete`, `$httpRequest` (writes response), `$try` (writes error var), `$loop` (writes counter) | Per-execution |
| **Client mutators** | `$setTimeout`/`$clearTimeout`, `$setInterval`/`$clearInterval`, `$ws*`, `$setStatus`, buffer fns | Process-lifetime |
| **Discord mutations** | `$ban`, `$kick`, `$timeout`, `$unban`, role/channel/guild/automod ops | Network, bool-return (errors swallowed) |
| **Pure reads** | `$guildName`, `$roleColor`, `$username`, math/string/number fns, `$getMessage` (cache) | No side effects |
| **Cache primers** | `$fetchMembers`, `$fetchChannels`, `$fetchRoles`, `$fetchThreads`, `$fetchMessage` | API call, void return, mutates cache only |

## Performance tiers

| Tier | Examples | Notes |
|---|---|---|
| **API/REST** (slowest) | `$fetchAuditLog`, `$fetchMembers`, `$httpRequest`, `$userExists`, every Discord mutation | Network round-trip |
| **Cache-only** | `$guildID[name]`, `$channelID[name]`, `$hasRoles`, `$memberRoles`, `$getMessage` | Fast, may miss uncached |
| **Sub-interpreter** (expensive) | `$arrayFilter`, `$arrayMap`, `$arrayForEach`, `$arrayEvery`, `$arraySome`, `$arrayFind*`, `$arrayReduce` | Re-compiles per element; experimental |
| **In-memory** (fastest) | `$get`, `$env`, `$let`, `$ping`, `$uptime`, `$getTimestamp`, cooldown getters | No I/O |

## Common pairings (guide-corroborated)

| Pair | Guide count |
|---|---|
| `$channelID` + `$sendMessage` | 11 |
| `$let` + `$get` | 5 |
| `$addActionRow` + `$addButton` | 4 |
| `$setTimeout` + `$clearTimeout` | 2 |
| `$setInterval` + `$clearInterval` | 2 |
| `$c[comment]` (inline comment) | 36 (most-used function in guides) |
