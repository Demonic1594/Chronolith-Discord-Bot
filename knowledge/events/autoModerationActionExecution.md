# autoModerationActionExecution

> This event is fired when an automod is fired under a message

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.2.0 | `Guilds`, `AutoModerationExecution` |

## Registering

Enable `autoModerationActionExecution` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds", "AutoModerationExecution"],
    events: ["autoModerationActionExecution"],
    prefixes: ["!"]
})
```

```js
// events/autoModerationActionExecution.js
module.exports = {
    type: "autoModerationActionExecution",
    code: `$log[autoModerationActionExecution fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `AutoModerationActionExecution` — the runtime object context functions resolve against.
- No old/new states — this event fires with a single fresh entity.
- `$message[N]` args: not seeded by this event (empty).

## Related events

- [`autoModerationRuleCreate`](autoModerationRuleCreate.md)
- [`autoModerationRuleDelete`](autoModerationRuleDelete.md)
- [`autoModerationRuleUpdate`](autoModerationRuleUpdate.md)
- [`channelCreate`](channelCreate.md)
- [`channelDelete`](channelDelete.md)
- [`channelPinsUpdate`](channelPinsUpdate.md)
- [`channelUpdate`](channelUpdate.md)
- [`clientReady`](clientReady.md)
