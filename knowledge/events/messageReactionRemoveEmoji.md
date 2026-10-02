# messageReactionRemoveEmoji

> This event is fired when an emoji is removed from a message's reactions

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.4.0 | `GuildMessageReactions`, `DirectMessageReactions` |

## Registering

Enable `messageReactionRemoveEmoji` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildMessageReactions", "DirectMessageReactions"],
    events: ["messageReactionRemoveEmoji"],
    prefixes: ["!"]
})
```

```js
// events/messageReactionRemoveEmoji.js
module.exports = {
    type: "messageReactionRemoveEmoji",
    code: `$log[messageReactionRemoveEmoji fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `MessageReaction` — the runtime object context functions resolve against.
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
