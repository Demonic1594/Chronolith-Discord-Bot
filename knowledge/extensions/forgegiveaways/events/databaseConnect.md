# databaseConnect

> This event is fired when the database has connected

| Package | Since | Intents required |
|---|---|---|
| ForgeGiveaways | v1.0.0 | — |

## Registering

Enable `databaseConnect` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["databaseConnect"],
    prefixes: ["!"]
})
```

```js
// events/databaseConnect.js
module.exports = {
    type: "databaseConnect",
    code: `$log[databaseConnect fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`giveawayEdit`](giveawayEdit.md)
- [`giveawayEnd`](giveawayEnd.md)
- [`giveawayEntryAdd`](giveawayEntryAdd.md)
- [`giveawayEntryRemove`](giveawayEntryRemove.md)
- [`giveawayEntryRevoke`](giveawayEntryRevoke.md)
- [`giveawayReroll`](giveawayReroll.md)
- [`giveawayStart`](giveawayStart.md)
