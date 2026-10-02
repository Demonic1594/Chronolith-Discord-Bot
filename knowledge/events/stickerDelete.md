# stickerDelete

> This event is fired when an sticker is deleted

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.4.0 | `GuildExpressions` |

## Registering

Enable `stickerDelete` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildExpressions"],
    events: ["stickerDelete"],
    prefixes: ["!"]
})
```

```js
// events/stickerDelete.js
module.exports = {
    type: "stickerDelete",
    code: `$log[stickerDelete fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Sticker` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `sticker` | yes | yes | `$oldSticker`, `$newSticker` |

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
