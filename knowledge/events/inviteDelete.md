# inviteDelete

> This event is fired when an invite is deleted

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.3 | `Guilds`, `GuildInvites` |

## Registering

Enable `inviteDelete` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["Guilds", "GuildInvites"],
    events: ["inviteDelete"],
    prefixes: ["!"]
})
```

```js
// events/inviteDelete.js
module.exports = {
    type: "inviteDelete",
    code: `$log[inviteDelete fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Invite` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `invite` | yes | yes | `$oldInvite`, `$newInvite` |

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
