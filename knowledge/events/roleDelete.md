# roleDelete

> This event is fired when a role is deleted

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | `Guilds` |

## Registering

Enable `roleDelete` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds"],
    events: ["roleDelete"],
    prefixes: ["!"]
})
```

```js
// events/roleDelete.js
module.exports = {
    type: "roleDelete",
    code: `$log[roleDelete fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Role` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `role` | yes | yes | `$oldRole`, `$newRole` |

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
