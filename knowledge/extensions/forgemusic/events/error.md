# error

> Executed when the queue encounters error.

| Package | Since | Intents required |
|---|---|---|
| ForgeMusic | v1.0.0 | — |

## Registering

Enable `error` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["error"],
    prefixes: ["!"]
})
```

```js
// events/error.js
module.exports = {
    type: "error",
    code: `$log[error fired!]`
}
```

## Context data available

- No old/new states — this event fires with a single fresh entity.
- `$message[N]` args: not seeded by this event (empty).

## Related events

- [`audioFiltersUpdate`](audioFiltersUpdate.md)
- [`audioTrackAdd`](audioTrackAdd.md)
- [`audioTrackRemove`](audioTrackRemove.md)
- [`audioTracksAdd`](audioTracksAdd.md)
- [`biquadFiltersUpdate`](biquadFiltersUpdate.md)
- [`channelPopulate`](channelPopulate.md)
- [`connection`](connection.md)
- [`connectionDestroyed`](connectionDestroyed.md)
