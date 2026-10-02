# variableDelete

> This event is triggered when a variable gets deleted.

| Package | Since | Intents required |
|---|---|---|
| ForgeDB | v2.0.0 | — |

## Registering

Enable `variableDelete` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["variableDelete"],
    prefixes: ["!"]
})
```

```js
// events/variableDelete.js
module.exports = {
    type: "variableDelete",
    code: `$log[variableDelete fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`connect`](connect.md)
- [`variableCreate`](variableCreate.md)
- [`variableUpdate`](variableUpdate.md)
