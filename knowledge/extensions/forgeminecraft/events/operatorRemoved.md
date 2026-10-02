# operatorRemoved

> This event is fired when an operator was removed

| Package | Since | Intents required |
|---|---|---|
| ForgeMinecraft | v1.0.0 | — |

## Registering

Enable `operatorRemoved` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["operatorRemoved"],
    prefixes: ["!"]
})
```

```js
// events/operatorRemoved.js
module.exports = {
    type: "operatorRemoved",
    code: `$log[operatorRemoved fired!]`
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
- [`disconnected`](disconnected.md)
- [`error`](error.md)
- [`gameRuleUpdated`](gameRuleUpdated.md)
