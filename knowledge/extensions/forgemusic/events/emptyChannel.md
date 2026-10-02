# emptyChannel

> Executed when the voice channel is empty.

| Package | Since | Intents required |
|---|---|---|
| ForgeMusic | v1.0.0 | — |

## Registering

Enable `emptyChannel` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["emptyChannel"],
    prefixes: ["!"]
})
```

```js
// events/emptyChannel.js
module.exports = {
    type: "emptyChannel",
    code: `$log[emptyChannel fired!]`
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
