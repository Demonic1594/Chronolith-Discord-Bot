# channelPinsUpdate

> This event is fired when a channel's pins are updated

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.4.0 | `Guilds`, `DirectMessages` |

## Registering

Enable `channelPinsUpdate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds", "DirectMessages"],
    events: ["channelPinsUpdate"],
    prefixes: ["!"]
})
```

```js
// events/channelPinsUpdate.js
module.exports = {
    type: "channelPinsUpdate",
    code: `$log[channelPinsUpdate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Channel` — the runtime object context functions resolve against.
- No old/new states — this event fires with a single fresh entity.
- `$message[N]` args: not seeded by this event (empty).

## Related events

- [`autoModerationActionExecution`](autoModerationActionExecution.md)
- [`autoModerationRuleCreate`](autoModerationRuleCreate.md)
- [`autoModerationRuleDelete`](autoModerationRuleDelete.md)
- [`autoModerationRuleUpdate`](autoModerationRuleUpdate.md)
- [`channelCreate`](channelCreate.md)
- [`channelDelete`](channelDelete.md)
- [`channelUpdate`](channelUpdate.md)
- [`clientReady`](clientReady.md)
