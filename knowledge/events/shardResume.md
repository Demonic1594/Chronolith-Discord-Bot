# shardResume

> This event is fired when a shard starts resuming

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | — |

## Registering

Enable `shardResume` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["shardResume"],
    prefixes: ["!"]
})
```

```js
// events/shardResume.js
module.exports = {
    type: "shardResume",
    code: `$log[shardResume fired!]`
}
```

## Context data available

- No old/new states — this event fires with a single fresh entity.
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
