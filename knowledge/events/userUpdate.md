# userUpdate

> This event is fired when a user updates their profile

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | `GuildMembers` |

> ⚠️ Privileged intent(s): `GuildMembers` — must be enabled in the Discord Developer Portal (and toggled on the client) or the gateway will refuse the connection.

## Registering

Enable `userUpdate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildMembers"],
    events: ["userUpdate"],
    prefixes: ["!"]
})
```

```js
// events/userUpdate.js
module.exports = {
    type: "userUpdate",
    code: `$log[userUpdate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `User` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `user` | yes | yes | `$oldUser`, `$newUser` |

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
