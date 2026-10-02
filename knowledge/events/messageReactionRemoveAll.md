# messageReactionRemoveAll

> This event is fired when all emojis are removed from a message's reactions

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.4.0 | `GuildMessageReactions`, `DirectMessageReactions` |

## Registering

Enable `messageReactionRemoveAll` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildMessageReactions", "DirectMessageReactions"],
    events: ["messageReactionRemoveAll"],
    prefixes: ["!"]
})
```

```js
// events/messageReactionRemoveAll.js
module.exports = {
    type: "messageReactionRemoveAll",
    code: `$log[messageReactionRemoveAll fired!]`
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
