# messageUpdate

> This event is fired when a message is updated

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | `GuildMessages`, `DirectMessages` |

## Registering

Enable `messageUpdate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildMessages", "DirectMessages"],
    events: ["messageUpdate"],
    prefixes: ["!"]
})
```

```js
// events/messageUpdate.js
module.exports = {
    type: "messageUpdate",
    code: `$log[messageUpdate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Message` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `message` | yes | yes | `$oldMessage`, `$newMessage` |

- **`$message[N]` args**: seeded by this event (`newer.content?.split(/ +/)`).
- ⚙️ Re-runs messageCreate handling when the client option `respondOnEdit` is set (respecting its ms window) — edited messages can re-trigger prefix commands.

## Example

**old/new states**

```js
// events/messageUpdate.js — both snapshots readable
module.exports = {
    type: "messageUpdate",
    code: "$oldMessage[content] -> $newMessage[content]"
}
```

## Related events

- [`autoModerationActionExecution`](autoModerationActionExecution.md)
- [`autoModerationRuleCreate`](autoModerationRuleCreate.md)
- [`autoModerationRuleDelete`](autoModerationRuleDelete.md)
- [`autoModerationRuleUpdate`](autoModerationRuleUpdate.md)
- [`channelCreate`](channelCreate.md)
- [`channelDelete`](channelDelete.md)
- [`channelPinsUpdate`](channelPinsUpdate.md)
- [`channelUpdate`](channelUpdate.md)
