# guildIntegrationsUpdate

> This event is fired when an integration is updated on a guild

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v2.5.0 | `GuildIntegrations` |

## Registering

Enable `guildIntegrationsUpdate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildIntegrations"],
    events: ["guildIntegrationsUpdate"],
    prefixes: ["!"]
})
```

```js
// events/guildIntegrationsUpdate.js
module.exports = {
    type: "guildIntegrationsUpdate",
    code: `$log[guildIntegrationsUpdate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `raw:g` — the runtime object context functions resolve against.
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
