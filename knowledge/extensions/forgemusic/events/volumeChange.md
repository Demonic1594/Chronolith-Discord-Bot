# volumeChange

> Executed when audio player's volume is changed.

| Package | Since | Intents required |
|---|---|---|
| ForgeMusic | v1.0.0 | — |

## Registering

Enable `volumeChange` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["volumeChange"],
    prefixes: ["!"]
})
```

```js
// events/volumeChange.js
module.exports = {
    type: "volumeChange",
    code: `$log[volumeChange fired!]`
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
