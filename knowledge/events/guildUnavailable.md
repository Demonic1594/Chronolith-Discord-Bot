# guildUnavailable

> This event is fired when a guild becomes unavailable

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.4.0 | `Guilds` |

## Registering

Enable `guildUnavailable` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds"],
    events: ["guildUnavailable"],
    prefixes: ["!"]
})
```

```js
// events/guildUnavailable.js
module.exports = {
    type: "guildUnavailable",
    code: `$log[guildUnavailable fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Guild` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `guild` | — | yes | `$newGuild` |

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
