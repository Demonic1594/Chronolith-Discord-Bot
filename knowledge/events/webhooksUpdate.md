# webhooksUpdate

> This event is fired when a webhook is updated

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v2.5.0 | `GuildWebhooks` |

## Registering

Enable `webhooksUpdate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildWebhooks"],
    events: ["webhooksUpdate"],
    prefixes: ["!"]
})
```

```js
// events/webhooksUpdate.js
module.exports = {
    type: "webhooksUpdate",
    code: `$log[webhooksUpdate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `raw:c` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `channel` | yes | yes | `$oldChannel`, `$newChannel` |

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
