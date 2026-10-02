# queueCreate

> Executed when a queue is successfully created.

| Package | Since | Intents required |
|---|---|---|
| ForgeMusic | v1.0.0 | — |

## Registering

Enable `queueCreate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["queueCreate"],
    prefixes: ["!"]
})
```

```js
// events/queueCreate.js
module.exports = {
    type: "queueCreate",
    code: `$log[queueCreate fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`audioFiltersUpdate`](audioFiltersUpdate.md)
- [`audioTrackAdd`](audioTrackAdd.md)
- [`audioTrackRemove`](audioTrackRemove.md)
- [`audioTracksAdd`](audioTracksAdd.md)
- [`biquadFiltersUpdate`](biquadFiltersUpdate.md)
- [`channelPopulate`](channelPopulate.md)
- [`connection`](connection.md)
- [`connectionDestroyed`](connectionDestroyed.md)
