# guildAuditLogEntryCreate

> This event is fired when a guild audit log entry is created

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.3 | `Guilds`, `GuildModeration` |

## Registering

Enable `guildAuditLogEntryCreate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds", "GuildModeration"],
    events: ["guildAuditLogEntryCreate"],
    prefixes: ["!"]
})
```

```js
// events/guildAuditLogEntryCreate.js
module.exports = {
    type: "guildAuditLogEntryCreate",
    code: `$log[guildAuditLogEntryCreate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `raw:guild` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `audit` | yes | yes | `$auditLog` |

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
