# voted

> This event is called when someone votes for your Top.gg bot

| Package | Since | Intents required |
|---|---|---|
| ForgeTopGG | v1.0.0 | — |

## Registering

Enable `voted` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["voted"],
    prefixes: ["!"]
})
```

```js
// events/voted.js
module.exports = {
    type: "voted",
    code: `$log[voted fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`error`](error.md)
- [`posted`](posted.md)
