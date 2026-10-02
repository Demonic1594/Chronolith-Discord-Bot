# entitlementDelete

> This event is fired when an entitlement is deleted

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.5.0 | — |

## Registering

Enable `entitlementDelete` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["entitlementDelete"],
    prefixes: ["!"]
})
```

```js
// events/entitlementDelete.js
module.exports = {
    type: "entitlementDelete",
    code: `$log[entitlementDelete fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Entitlement` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `entitlement` | yes | yes | `$oldEntitlement`, `$newEntitlement` |

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
