# messageDelete

> This event is fired when a message is deleted

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | `GuildMessages`, `DirectMessages` |

## Registering

Enable `messageDelete` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildMessages", "DirectMessages"],
    events: ["messageDelete"],
    prefixes: ["!"]
})
```

```js
// events/messageDelete.js
module.exports = {
    type: "messageDelete",
    code: `$log[messageDelete fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Message` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `message` | yes | yes | `$oldMessage`, `$newMessage` |

- **`$message[N]` args**: seeded by this event (`m.content?.split(/ +/)`).

## Example

**Snipe-style capture**

```js
// events/messageDelete.js
module.exports = {
    type: "messageDelete",
    code: "$setUserVar[lastDeleted;$messageContent;$authorID]"
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
