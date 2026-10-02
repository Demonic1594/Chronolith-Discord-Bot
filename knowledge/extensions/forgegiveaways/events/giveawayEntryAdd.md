# giveawayEntryAdd

> This event is fired when a giveaway entry is added

| Package | Since | Intents required |
|---|---|---|
| ForgeGiveaways | v1.0.0 | — |

## Registering

Enable `giveawayEntryAdd` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["giveawayEntryAdd"],
    prefixes: ["!"]
})
```

```js
// events/giveawayEntryAdd.js
module.exports = {
    type: "giveawayEntryAdd",
    code: `$log[giveawayEntryAdd fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`databaseConnect`](databaseConnect.md)
- [`giveawayEdit`](giveawayEdit.md)
- [`giveawayEnd`](giveawayEnd.md)
- [`giveawayEntryRemove`](giveawayEntryRemove.md)
- [`giveawayEntryRevoke`](giveawayEntryRevoke.md)
- [`giveawayReroll`](giveawayReroll.md)
- [`giveawayStart`](giveawayStart.md)
