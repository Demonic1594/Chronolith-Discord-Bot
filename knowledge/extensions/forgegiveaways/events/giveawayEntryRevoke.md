# giveawayEntryRevoke

> This event is fired when a giveaway entry is revoked

| Package | Since | Intents required |
|---|---|---|
| ForgeGiveaways | v1.0.0 | — |

## Registering

Enable `giveawayEntryRevoke` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["giveawayEntryRevoke"],
    prefixes: ["!"]
})
```

```js
// events/giveawayEntryRevoke.js
module.exports = {
    type: "giveawayEntryRevoke",
    code: `$log[giveawayEntryRevoke fired!]`
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
- [`giveawayReroll`](giveawayReroll.md)
- [`giveawayStart`](giveawayStart.md)
