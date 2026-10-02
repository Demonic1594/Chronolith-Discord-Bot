# banAdded

> This event is fired when a player was banned

| Package | Since | Intents required |
|---|---|---|
| ForgeMinecraft | v1.0.0 | — |

## Registering

Enable `banAdded` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["banAdded"],
    prefixes: ["!"]
})
```

```js
// events/banAdded.js
module.exports = {
    type: "banAdded",
    code: `$log[banAdded fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`allowListAdded`](allowListAdded.md)
- [`allowListRemoved`](allowListRemoved.md)
- [`banRemoved`](banRemoved.md)
- [`connected`](connected.md)
- [`disconnected`](disconnected.md)
- [`error`](error.md)
- [`gameRuleUpdated`](gameRuleUpdated.md)
- [`ipBanAdded`](ipBanAdded.md)
