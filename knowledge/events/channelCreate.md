# channelCreate

> This event is fired when a channel is created

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | `Guilds` |

## Registering

Enable `channelCreate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds"],
    events: ["channelCreate"],
    prefixes: ["!"]
})
```

```js
// events/channelCreate.js
module.exports = {
    type: "channelCreate",
    code: `$log[channelCreate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Channel` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `channel` | — | yes | `$newChannel` |

- `$message[N]` args: not seeded by this event (empty).

## Related events

- [`autoModerationActionExecution`](autoModerationActionExecution.md)
- [`autoModerationRuleCreate`](autoModerationRuleCreate.md)
- [`autoModerationRuleDelete`](autoModerationRuleDelete.md)
- [`autoModerationRuleUpdate`](autoModerationRuleUpdate.md)
- [`channelDelete`](channelDelete.md)
- [`channelPinsUpdate`](channelPinsUpdate.md)
- [`channelUpdate`](channelUpdate.md)
- [`clientReady`](clientReady.md)
