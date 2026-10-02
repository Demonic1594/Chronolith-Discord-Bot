# operatorAdded

> This event is fired when an operator was added

| Package | Since | Intents required |
|---|---|---|
| ForgeMinecraft | v1.0.0 | — |

## Registering

Enable `operatorAdded` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["operatorAdded"],
    prefixes: ["!"]
})
```

```js
// events/operatorAdded.js
module.exports = {
    type: "operatorAdded",
    code: `$log[operatorAdded fired!]`
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
