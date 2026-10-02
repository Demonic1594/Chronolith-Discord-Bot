# guildScheduledEventUserAdd

> This event is called when a user is added to a scheduled event

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.4.0 | `GuildScheduledEvents` |

## Registering

Enable `guildScheduledEventUserAdd` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildScheduledEvents"],
    events: ["guildScheduledEventUserAdd"],
    prefixes: ["!"]
})
```

```js
// events/guildScheduledEventUserAdd.js
module.exports = {
    type: "guildScheduledEventUserAdd",
    code: `$log[guildScheduledEventUserAdd fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `GuildScheduledEvent` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `scheduledEvent` | yes | yes | `$oldScheduledEvent`, `$newScheduledEvent` |

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
