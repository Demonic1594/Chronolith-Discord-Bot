# channelDelete

> This event is fired when a channel is deleted

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | `Guilds` |

## Registering

Enable `channelDelete` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds"],
    events: ["channelDelete"],
    prefixes: ["!"]
})
```

```js
// events/channelDelete.js
module.exports = {
    type: "channelDelete",
    code: `$log[channelDelete fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Channel` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `channel` | yes | yes | `$oldChannel`, `$newChannel` |

- `$message[N]` args: not seeded by this event (empty).

## Related events

- [`autoModerationActionExecution`](autoModerationActionExecution.md)
- [`autoModerationRuleCreate`](autoModerationRuleCreate.md)
- [`autoModerationRuleDelete`](autoModerationRuleDelete.md)
- [`autoModerationRuleUpdate`](autoModerationRuleUpdate.md)
- [`channelCreate`](channelCreate.md)
- [`channelPinsUpdate`](channelPinsUpdate.md)
- [`channelUpdate`](channelUpdate.md)
- [`clientReady`](clientReady.md)
