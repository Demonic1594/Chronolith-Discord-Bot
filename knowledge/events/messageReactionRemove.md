# messageReactionRemove

> This event is fired when a user stops reacting

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | `GuildMessageReactions`, `DirectMessageReactions` |

## Registering

Enable `messageReactionRemove` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildMessageReactions", "DirectMessageReactions"],
    events: ["messageReactionRemove"],
    prefixes: ["!"]
})
```

```js
// events/messageReactionRemove.js
module.exports = {
    type: "messageReactionRemove",
    code: `$log[messageReactionRemove fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `MessageReaction` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `user` | — | yes | `$newUser` |

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
