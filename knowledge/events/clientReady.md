# clientReady

> This event is fired when the bot becomes ready

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | — |

## Registering

Enable `clientReady` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["clientReady"],
    prefixes: ["!"]
})
```

```js
// events/clientReady.js
module.exports = {
    type: "clientReady",
    code: `$log[clientReady fired!]`
}
```

## Context data available

- No old/new states — this event fires with a single fresh entity.
- `$message[N]` args: not seeded by this event (empty).
- ⚙️ Feeds the Invite Tracker (`trackers: { invites: true }`) — `$invite*` state data is available.

## Example

**Startup handler (no user context)**

```js
// events/clientReady.js
module.exports = {
    type: "clientReady",
    code: "$log[Bot ready as $username[$clientID]]"
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
