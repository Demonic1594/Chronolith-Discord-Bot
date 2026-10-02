# disconnected

> This event is fired when the management server has disconnected

| Package | Since | Intents required |
|---|---|---|
| ForgeMinecraft | v1.0.0 | — |

## Registering

Enable `disconnected` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["disconnected"],
    prefixes: ["!"]
})
```

```js
// events/disconnected.js
module.exports = {
    type: "disconnected",
    code: `$log[disconnected fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`allowListAdded`](allowListAdded.md)
- [`allowListRemoved`](allowListRemoved.md)
- [`banAdded`](banAdded.md)
- [`banRemoved`](banRemoved.md)
- [`connected`](connected.md)
- [`error`](error.md)
- [`gameRuleUpdated`](gameRuleUpdated.md)
- [`ipBanAdded`](ipBanAdded.md)
