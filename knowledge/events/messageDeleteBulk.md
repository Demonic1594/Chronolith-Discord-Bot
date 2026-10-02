# messageDeleteBulk

> This event is fired when a row of messages is deleted

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.4.0 | `GuildMessages` |

## Registering

Enable `messageDeleteBulk` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildMessages"],
    events: ["messageDeleteBulk"],
    prefixes: ["!"]
})
```

```js
// events/messageDeleteBulk.js
module.exports = {
    type: "messageDeleteBulk",
    code: `$log[messageDeleteBulk fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Message` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `bulk` | — | yes | — |

- `$message[N]` args: not seeded by this event (empty).

## Related events

- [`autoModerationActionExecution`](autoModerationActionExecution.md)
- [`autoModerationRuleCreate`](autoModerationRuleCreate.md)
- [`autoModerationRuleDelete`](autoModerationRuleDelete.md)
- [`autoModerationRuleUpdate`](autoModerationRuleUpdate.md)
- [`channelCreate`](channelCreate.md)
- [`channelDelete`](channelDelete.md)
- [`channelPinsUpdate`](channelPinsUpdate.md)
- [`channelUpdate`](channelUpdate.md)
