# guildDelete

> This event is fired when a guild is deleted

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | `Guilds` |

## Registering

Enable `guildDelete` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds"],
    events: ["guildDelete"],
    prefixes: ["!"]
})
```

```js
// events/guildDelete.js
module.exports = {
    type: "guildDelete",
    code: `$log[guildDelete fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Guild` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `guild` | yes | yes | `$oldGuild`, `$newGuild` |

- `$message[N]` args: not seeded by this event (empty).
- ⚙️ Feeds the Invite Tracker (`trackers: { invites: true }`) — `$invite*` state data is available.

## Related events

- [`autoModerationActionExecution`](autoModerationActionExecution.md)
- [`autoModerationRuleCreate`](autoModerationRuleCreate.md)
- [`autoModerationRuleDelete`](autoModerationRuleDelete.md)
- [`autoModerationRuleUpdate`](autoModerationRuleUpdate.md)
- [`channelCreate`](channelCreate.md)
- [`channelDelete`](channelDelete.md)
- [`channelPinsUpdate`](channelPinsUpdate.md)
- [`channelUpdate`](channelUpdate.md)
