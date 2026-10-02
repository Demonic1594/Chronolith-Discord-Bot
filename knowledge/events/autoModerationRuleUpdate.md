# autoModerationRuleUpdate

> This event is fired when an automod rule is updated

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.5.0 | `Guilds`, `AutoModerationConfiguration` |

## Registering

Enable `autoModerationRuleUpdate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds", "AutoModerationConfiguration"],
    events: ["autoModerationRuleUpdate"],
    prefixes: ["!"]
})
```

```js
// events/autoModerationRuleUpdate.js
module.exports = {
    type: "autoModerationRuleUpdate",
    code: `$log[autoModerationRuleUpdate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `AutoModerationRule` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `automodRule` | yes | yes | `$oldAutomodRule`, `$newAutomodRule` |

- `$message[N]` args: not seeded by this event (empty).

## Related events

- [`autoModerationActionExecution`](autoModerationActionExecution.md)
- [`autoModerationRuleCreate`](autoModerationRuleCreate.md)
- [`autoModerationRuleDelete`](autoModerationRuleDelete.md)
- [`channelCreate`](channelCreate.md)
- [`channelDelete`](channelDelete.md)
- [`channelPinsUpdate`](channelPinsUpdate.md)
- [`channelUpdate`](channelUpdate.md)
- [`clientReady`](clientReady.md)
