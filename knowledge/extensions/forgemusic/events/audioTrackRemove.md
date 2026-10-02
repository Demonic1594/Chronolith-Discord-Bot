# audioTrackRemove

> Executed when audio track is removed from the queue.

| Package | Since | Intents required |
|---|---|---|
| ForgeMusic | v1.0.0 | — |

## Registering

Enable `audioTrackRemove` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["audioTrackRemove"],
    prefixes: ["!"]
})
```

```js
// events/audioTrackRemove.js
module.exports = {
    type: "audioTrackRemove",
    code: `$log[audioTrackRemove fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`audioFiltersUpdate`](audioFiltersUpdate.md)
- [`audioTrackAdd`](audioTrackAdd.md)
- [`audioTracksAdd`](audioTracksAdd.md)
- [`biquadFiltersUpdate`](biquadFiltersUpdate.md)
- [`channelPopulate`](channelPopulate.md)
- [`connection`](connection.md)
- [`connectionDestroyed`](connectionDestroyed.md)
- [`debug`](debug.md)
