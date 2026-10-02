# guildSoundboardSoundCreate

> This event is fired when a soundboard sound is created

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v2.4.0 | `GuildExpressions` |

## Registering

Enable `guildSoundboardSoundCreate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildExpressions"],
    events: ["guildSoundboardSoundCreate"],
    prefixes: ["!"]
})
```

```js
// events/guildSoundboardSoundCreate.js
module.exports = {
    type: "guildSoundboardSoundCreate",
    code: `$log[guildSoundboardSoundCreate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `raw:s` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `soundboardSound` | yes | yes | `$oldSound`, `$newSound` |

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
