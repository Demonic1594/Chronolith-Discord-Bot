# guildBanRemove

> This event is fired when a member is unbanned from a guild

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.4.0 | `GuildMembers`, `GuildModeration` |

> ⚠️ Privileged intent(s): `GuildMembers` — must be enabled in the Discord Developer Portal (and toggled on the client) or the gateway will refuse the connection.

## Registering

Enable `guildBanRemove` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildMembers", "GuildModeration"],
    events: ["guildBanRemove"],
    prefixes: ["!"]
})
```

```js
// events/guildBanRemove.js
module.exports = {
    type: "guildBanRemove",
    code: `$log[guildBanRemove fired!]`
}
```

## Context data available

- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `ban` | — | yes | — |

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
