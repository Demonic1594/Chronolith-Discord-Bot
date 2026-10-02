# Level 03 — High school: interactions, UI, events, persistence

**Prerequisite:** 02. **Passing:** full component flows from memory; you know which context every event gives you.

## Lesson 1: the interaction lifecycle (the 3-response discipline)

1. **Reply fast or defer.** Immediate: `$interactionReply[content]`. Slow work first: bare `$defer` → work → `$interactionFollowUp[content]` (2 args: content, return message ID).
2. **Ephemeral** = bare `$ephemeral` flag *before* the reply — it marks the outgoing container.
3. **Editing your own reply**: `$interactionUpdate[...]` (for component messages), `$editMessage[...]` generally.

Component messages that take time: `$defer` → build → `$interactionUpdate[$fetchResponse[channelID;messageID] $disableComponents]` is the maintainer's loading→done idiom.

## Lesson 2: buttons & selects — build, route, await

Build (max 5 per action row; a select takes the whole row; never mix):

```fs
$addActionRow
$addButton[accept;Accept;Success]
$addButton[decline;Decline;Danger]
```

(`$addButton[custom ID*;label*;style*;emoji;disabled]` — style is the `ButtonStyle` enum, PascalCase keys only.)

Route two ways:
- **Persistent** — `interactionCreate` handler + `allowedInteractionTypes: ["button"]` + CustomID envelope. Read `$customID`, branch with `$switch`/`$if`. Encode state IN the id: `page-rows-action-authorID` (`-` safe for digits; use `!!!` when payload may contain `-`). Verify the author segment.
- **One-shot await** — `$awaitComponent[channel ID*;message ID*;filter*;success code*;time*]`; the filter is a condition over each incoming interaction (`$customID==accept`).

Selects: `$addStringSelectMenu[customID*;placeholder;disabled;minValues;maxValues]`, read with `$selectMenuValues[0]` (0-based).

## Lesson 3: autocomplete (the container pattern)

Option `autocomplete: true` in slash data → handler with `allowedInteractionTypes: ["autocomplete"]`:

```fs
$onlyIf[$and[$applicationCommandName==cmd;$focusedOptionName==opt]]
$let[q;$focusedOptionValue]
...build choices: $addChoice[display;value]   (≤25!)
$autocomplete                                   ← sends accumulated choices
```

Scale pattern (maintainer): dual-counter `$while` scanning a JSON array, `$letSum[n;1]` on each add, stop at 25.

## Lesson 4: output shape — classic embeds vs Components V2

Classic (`$title/$description/$addField/$color/$author/$footer/$image/$thumbnail/$timestamp`) mutate the container's embed; embed functions can live INSIDE response args (`$sendMessage[ch; $title[..]...]`) — the container rides the send.

V2 containers: `$addContainer[components; accentColor]` with `$addTextDisplay` (full markdown, `##`/`-#`), `$addSection[accessory+content]`, `$addSeparator`, thumbnail accessories — richer layouts (see id-search audit). Either is valid; containers compose better.

## Lesson 5: events & their payloads

Register in `events: [...]` + intents. Every event page (knowledge/events/) lists its carried entity, old/new states with exact accessors (`$oldMessage[content]` / `$newMessage[...]` in `messageUpdate`), and `$message[N]` seeding. Big ones:
- `messageCreate` — full context + args; `respondOnEdit` re-runs it on edits.
- `guildMemberAdd/Remove` — member context; feeds invite tracker.
- `interactionCreate` — everything interaction, filtered by `allowedInteractionTypes`.
- `clientReady` — **no user context**; the restart-resume slot.

## Lesson 6: persistence — pick the right store

| Need | Store |
|---|---|
| within one execution | `$let`/`$get` |
| across executions, gone on restart | Edge cache tables (`$setCache[table;key;v]`) |
| across restarts | ForgeDB / QuorielDB (`$setUserVar/$getGlobalVar`…) |

ForgeDB defaults via `ForgeDB.variables(json)`. Never store balances in `$let`.

## Exercises — READ

R1. `$interactionReply[hi;;;true;false]` — what happens?
R2. 6 buttons after one `$addActionRow` — what happens at send time?
R3. In `messageUpdate`, why might `$authorID` be empty and how do you still get the author?
R4. `$selectMenuValues[1]` with picks `[a,b]` → ?

## Exercises — WRITE

W1. Slash command: defer, "working…", then follow-up with the result of `$username[$option[user]]`.
W2. Persistent confirm button on a message; only the invoker may click; replies ephemeral "confirmed".
W3. Autocomplete for option `color` suggesting from `red, reef, green` filtered by typed text (≤25, sorted irrelevant).

## Exercises — FIX

F1. Button handler fires for every bot button. Handler lacks what?
F2. `$interactionReply[$ephemeral]` shows nothing ephemeral. Why?
F3. Welcome message in `clientReady` using `$username[$authorID]` prints garbage/nothing. Diagnosis?

## Answer key

- R1: Compile/arg error — `$interactionReply` takes `[content*;return message ID]`; the aoi-style 5-arg shape doesn't exist. Ephemeral is the `$ephemeral` flag.
- R2: Discord rejects >5 components per row — the send fails (platform rule).
- R3: Old messages may be partial (uncached); use `$newMessage[author;id]`-style property access on the fresh state.
- R4: `b`.
- W1: `$defer$let[u;$option[user]]$interactionFollowUp[Done: $username[$get[u]]]`
- W2: CustomID `confirm-$authorID`, handler: `$arrayLoad[id;-;$customID]$onlyIf[$arrayAt[id;0]==confirm]$onlyIf[$arrayAt[id;1]==$authorID]$ephemeral$interactionReply[Confirmed]`
- W3: `$onlyIf[$and[$applicationCommandName==cmdname;$focusedOptionName==color]]$arrayLoad[cs;,;red,reef,green]$let[q;$toLowerCase[$focusedOptionValue]]$arrayMap[cs;c;$if[$checkContains[$toLowerCase[$env[c]];$get[q]];$return[$env[c]]];cs]$loop[25;$let[one;$arrayAt[cs;$math[$env[i]-1]]]$if[$get[one]==;$break]$addChoice[$get[one];$get[one]];i;true]$autocomplete`
- F1: `allowedInteractionTypes: ["button"]` (or a `$onlyIf[$isButton]` gate) + a CustomID prefix check.
- F2: `$ephemeral` is a bare flag function — it must run BEFORE the reply to mark the container: `$ephemeral$interactionReply[hi]`. Inside an arg after content it's too late/pointless.
- F3: `clientReady` has no author — move welcome logic to `guildMemberAdd`; snapshot any needed context as data before restarts.

## Flashcards

| Prompt | Answer |
|---|---|
| `$interactionReply` args | `[content*, return message ID]` |
| Ephemeral | bare `$ephemeral` before the reply |
| Slow interaction work | `$defer` → `$interactionFollowUp[content]` |
| Buttons per row / selects | 5 / 1 (never mix) |
| One-shot button wait | `$awaitComponent[ch*;msg*;filter*;code*;time*]` |
| Autocomplete cap | 25 choices; `$autocomplete` sends them |
| Select values reader | `$selectMenuValues[0]` (0-based) |
| `$oldMessage`/`$newMessage` live in | `messageUpdate` |
| Restart-safe state | a DB extension, never `$let` |
