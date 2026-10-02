# giveawayReroll

> This event is fired when a giveaway was rerolled

| Package | Since | Intents required |
|---|---|---|
| ForgeGiveaways | v1.0.0 | — |

## Registering

Enable `giveawayReroll` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["giveawayReroll"],
    prefixes: ["!"]
})
```

```js
// events/giveawayReroll.js
module.exports = {
    type: "giveawayReroll",
    code: `$log[giveawayReroll fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`databaseConnect`](databaseConnect.md)
- [`giveawayEdit`](giveawayEdit.md)
- [`giveawayEnd`](giveawayEnd.md)
- [`giveawayEntryAdd`](giveawayEntryAdd.md)
- [`giveawayEntryRemove`](giveawayEntryRemove.md)
- [`giveawayEntryRevoke`](giveawayEntryRevoke.md)
- [`giveawayStart`](giveawayStart.md)
