# subscriptionCreate

> This event is fired when a subscription is created

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v2.5.0 | — |

## Registering

Enable `subscriptionCreate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["subscriptionCreate"],
    prefixes: ["!"]
})
```

```js
// events/subscriptionCreate.js
module.exports = {
    type: "subscriptionCreate",
    code: `$log[subscriptionCreate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `raw:sub` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `subscription` | — | yes | `$newSubscription` |

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
