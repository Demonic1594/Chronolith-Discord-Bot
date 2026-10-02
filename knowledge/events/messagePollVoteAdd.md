# messagePollVoteAdd

> This event is fired when a poll vote is added

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.5.0 | `GuildMessagePolls`, `DirectMessagePolls` |

## Registering

Enable `messagePollVoteAdd` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildMessagePolls", "DirectMessagePolls"],
    events: ["messagePollVoteAdd"],
    prefixes: ["!"]
})
```

```js
// events/messagePollVoteAdd.js
module.exports = {
    type: "messagePollVoteAdd",
    code: `$log[messagePollVoteAdd fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Message` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `poll` | — | yes | — |

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
