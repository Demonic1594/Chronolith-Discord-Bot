# guildMemberAdd

> This event is fired when a member joins the guild

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | `GuildMembers` |

> ⚠️ Privileged intent(s): `GuildMembers` — must be enabled in the Discord Developer Portal (and toggled on the client) or the gateway will refuse the connection.

## Registering

Enable `guildMemberAdd` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildMembers"],
    events: ["guildMemberAdd"],
    prefixes: ["!"]
})
```

```js
// events/guildMemberAdd.js
module.exports = {
    type: "guildMemberAdd",
    code: `$log[guildMemberAdd fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `GuildMember` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `member` | — | yes | `$newMember` |

- `$message[N]` args: not seeded by this event (empty).
- ⚙️ Feeds the Invite Tracker (`trackers: { invites: true }`) — `$invite*` state data is available.

## Example

**Welcome on join**

```js
// events/guildMemberAdd.js
module.exports = {
    type: "guildMemberAdd",
    code: "$sendMessage[$channelID;Welcome <@$newMember[id]>!;false]"
}
```

## Related events

- [`autoModerationActionExecution`](autoModerationActionExecution.md)
- [`autoModerationRuleCreate`](autoModerationRuleCreate.md)
- [`autoModerationRuleDelete`](autoModerationRuleDelete.md)
- [`autoModerationRuleUpdate`](autoModerationRuleUpdate.md)
- [`channelCreate`](channelCreate.md)
- [`channelDelete`](channelDelete.md)
- [`channelPinsUpdate`](channelPinsUpdate.md)
- [`channelUpdate`](channelUpdate.md)
