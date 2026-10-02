# emojiUpdate

> This event is fired when an emoji is updated

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | `GuildExpressions` |

## Registering

Enable `emojiUpdate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildExpressions"],
    events: ["emojiUpdate"],
    prefixes: ["!"]
})
```

```js
// events/emojiUpdate.js
module.exports = {
    type: "emojiUpdate",
    code: `$log[emojiUpdate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `GuildEmoji` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `emoji` | yes | yes | `$oldEmoji`, `$newEmoji` |

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
