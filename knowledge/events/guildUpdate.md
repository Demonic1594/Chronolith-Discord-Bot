# guildUpdate

> This event is fired when a guild updates their settings

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | `Guilds` |

## Registering

Enable `guildUpdate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds"],
    events: ["guildUpdate"],
    prefixes: ["!"]
})
```

```js
// events/guildUpdate.js
module.exports = {
    type: "guildUpdate",
    code: `$log[guildUpdate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `raw:newer` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `guild` | yes | yes | `$oldGuild`, `$newGuild` |

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
