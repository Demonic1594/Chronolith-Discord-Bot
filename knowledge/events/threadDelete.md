# threadDelete

> This event is fired when a thread is deleted

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.4.0 | `Guilds` |

## Registering

Enable `threadDelete` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds"],
    events: ["threadDelete"],
    prefixes: ["!"]
})
```

```js
// events/threadDelete.js
module.exports = {
    type: "threadDelete",
    code: `$log[threadDelete fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `ThreadChannel` — the runtime object context functions resolve against.
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
- [`channelDelete`](channelDelete.md)
- [`channelPinsUpdate`](channelPinsUpdate.md)
- [`channelUpdate`](channelUpdate.md)
