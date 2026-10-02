# typingStart

> This event is fired when a user starts typing in a channel

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.4.0 | `GuildMessageTyping`, `DirectMessageTyping` |

> ⚠️ Privileged intent(s): `GuildMessageTyping`, `DirectMessageTyping` — must be enabled in the Discord Developer Portal (and toggled on the client) or the gateway will refuse the connection.

## Registering

Enable `typingStart` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildMessageTyping", "DirectMessageTyping"],
    events: ["typingStart"],
    prefixes: ["!"]
})
```

```js
// events/typingStart.js
module.exports = {
    type: "typingStart",
    code: `$log[typingStart fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Typing` — the runtime object context functions resolve against.
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
