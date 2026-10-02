# presenceUpdate

> This event is fired when a presence is updated

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.1.0 | `Guilds`, `GuildPresences` |

> ⚠️ Privileged intent(s): `GuildPresences` — must be enabled in the Discord Developer Portal (and toggled on the client) or the gateway will refuse the connection.

## Registering

Enable `presenceUpdate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds", "GuildPresences"],
    events: ["presenceUpdate"],
    prefixes: ["!"]
})
```

```js
// events/presenceUpdate.js
module.exports = {
    type: "presenceUpdate",
    code: `$log[presenceUpdate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Presence` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `presence` | yes | yes | `$oldPresence`, `$newPresence` |

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
