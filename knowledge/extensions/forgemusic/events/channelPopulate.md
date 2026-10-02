# channelPopulate

> Executed when a voice channel is populated.

| Package | Since | Intents required |
|---|---|---|
| ForgeMusic | v1.0.0 | — |

## Registering

Enable `channelPopulate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["channelPopulate"],
    prefixes: ["!"]
})
```

```js
// events/channelPopulate.js
module.exports = {
    type: "channelPopulate",
    code: `$log[channelPopulate fired!]`
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
- [`connection`](connection.md)
- [`connectionDestroyed`](connectionDestroyed.md)
- [`debug`](debug.md)
