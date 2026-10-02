# stageInstanceCreate

> This event is fired when a stage is created

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.4.0 | `Guilds` |

## Registering

Enable `stageInstanceCreate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds"],
    events: ["stageInstanceCreate"],
    prefixes: ["!"]
})
```

```js
// events/stageInstanceCreate.js
module.exports = {
    type: "stageInstanceCreate",
    code: `$log[stageInstanceCreate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `StageInstance` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `stage` | — | yes | `$newStage` |

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
