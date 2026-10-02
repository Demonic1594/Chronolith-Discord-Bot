# threadMemberUpdate

> This event is fired when a thread member is updated in a guild

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | `Guilds`, `GuildMembers` |

> ⚠️ Privileged intent(s): `GuildMembers` — must be enabled in the Discord Developer Portal (and toggled on the client) or the gateway will refuse the connection.

## Registering

Enable `threadMemberUpdate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds", "GuildMembers"],
    events: ["threadMemberUpdate"],
    prefixes: ["!"]
})
```

```js
// events/threadMemberUpdate.js
module.exports = {
    type: "threadMemberUpdate",
    code: `$log[threadMemberUpdate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `ThreadMember` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `member` | yes | yes | `$oldMember`, `$newMember` |

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
