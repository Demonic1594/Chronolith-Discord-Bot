# autoModerationRuleDelete

> This event is fired when an automod rule is deleted

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.5.0 | `Guilds`, `AutoModerationConfiguration` |

## Registering

Enable `autoModerationRuleDelete` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds", "AutoModerationConfiguration"],
    events: ["autoModerationRuleDelete"],
    prefixes: ["!"]
})
```

```js
// events/autoModerationRuleDelete.js
module.exports = {
    type: "autoModerationRuleDelete",
    code: `$log[autoModerationRuleDelete fired!]`
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
- [`autoModerationRuleUpdate`](autoModerationRuleUpdate.md)
- [`channelCreate`](channelCreate.md)
- [`channelDelete`](channelDelete.md)
- [`channelPinsUpdate`](channelPinsUpdate.md)
- [`channelUpdate`](channelUpdate.md)
- [`clientReady`](clientReady.md)
