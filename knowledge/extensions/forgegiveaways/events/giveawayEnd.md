# giveawayEnd

> This event is fired when a giveaway has ended

| Package | Since | Intents required |
|---|---|---|
| ForgeGiveaways | v1.0.0 | — |

## Registering

Enable `giveawayEnd` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["giveawayEnd"],
    prefixes: ["!"]
})
```

```js
// events/giveawayEnd.js
module.exports = {
    type: "giveawayEnd",
    code: `$log[giveawayEnd fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`databaseConnect`](databaseConnect.md)
- [`giveawayEdit`](giveawayEdit.md)
- [`giveawayEntryAdd`](giveawayEntryAdd.md)
- [`giveawayEntryRemove`](giveawayEntryRemove.md)
- [`giveawayEntryRevoke`](giveawayEntryRevoke.md)
- [`giveawayReroll`](giveawayReroll.md)
- [`giveawayStart`](giveawayStart.md)
