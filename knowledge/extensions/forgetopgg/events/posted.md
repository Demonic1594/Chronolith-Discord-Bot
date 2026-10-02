# posted

> This event is called when your bot's stats are posted to Top.gg

| Package | Since | Intents required |
|---|---|---|
| ForgeTopGG | v1.0.0 | — |

## Registering

Enable `posted` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["posted"],
    prefixes: ["!"]
})
```

```js
// events/posted.js
module.exports = {
    type: "posted",
    code: `$log[posted fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`error`](error.md)
- [`voted`](voted.md)
