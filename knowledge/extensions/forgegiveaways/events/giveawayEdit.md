# giveawayEdit

> This event is fired when a giveaway was edited

| Package | Since | Intents required |
|---|---|---|
| ForgeGiveaways | v1.1.0 | — |

## Registering

Enable `giveawayEdit` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["giveawayEdit"],
    prefixes: ["!"]
})
```

```js
// events/giveawayEdit.js
module.exports = {
    type: "giveawayEdit",
    code: `$log[giveawayEdit fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`databaseConnect`](databaseConnect.md)
- [`giveawayEnd`](giveawayEnd.md)
- [`giveawayEntryAdd`](giveawayEntryAdd.md)
- [`giveawayEntryRemove`](giveawayEntryRemove.md)
- [`giveawayEntryRevoke`](giveawayEntryRevoke.md)
- [`giveawayReroll`](giveawayReroll.md)
- [`giveawayStart`](giveawayStart.md)
