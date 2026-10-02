# connect

> This event is triggered when ForgeDB is connected with ForgeScript

| Package | Since | Intents required |
|---|---|---|
| ForgeDB | v2.0.0 | — |

## Registering

Enable `connect` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["connect"],
    prefixes: ["!"]
})
```

```js
// events/connect.js
module.exports = {
    type: "connect",
    code: `$log[connect fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`variableCreate`](variableCreate.md)
- [`variableDelete`](variableDelete.md)
- [`variableUpdate`](variableUpdate.md)
