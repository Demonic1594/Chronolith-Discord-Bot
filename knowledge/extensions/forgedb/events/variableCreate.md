# variableCreate

> This event is triggered when a new variable gets created.

| Package | Since | Intents required |
|---|---|---|
| ForgeDB | v2.0.0 | — |

## Registering

Enable `variableCreate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["variableCreate"],
    prefixes: ["!"]
})
```

```js
// events/variableCreate.js
module.exports = {
    type: "variableCreate",
    code: `$log[variableCreate fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`connect`](connect.md)
- [`variableDelete`](variableDelete.md)
- [`variableUpdate`](variableUpdate.md)
