# variableUpdate

> This event is triggered when a variable gets updated.

| Package | Since | Intents required |
|---|---|---|
| ForgeDB | v2.0.0 | — |

## Registering

Enable `variableUpdate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["variableUpdate"],
    prefixes: ["!"]
})
```

```js
// events/variableUpdate.js
module.exports = {
    type: "variableUpdate",
    code: `$log[variableUpdate fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`connect`](connect.md)
- [`variableCreate`](variableCreate.md)
- [`variableDelete`](variableDelete.md)
