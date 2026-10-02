# emojiDelete

> This event is fired when an emoji is deleted

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | `GuildExpressions` |

## Registering

Enable `emojiDelete` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildExpressions"],
    events: ["emojiDelete"],
    prefixes: ["!"]
})
```

```js
// events/emojiDelete.js
module.exports = {
    type: "emojiDelete",
    code: `$log[emojiDelete fired!]`
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
