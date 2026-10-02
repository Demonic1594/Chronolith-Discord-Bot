# linkedTrackEnd

> Triggered when a track finishes playing

| Package | Since | Intents required |
|---|---|---|
| ForgeLinked | v2.0.0 | — |

## Registering

Enable `linkedTrackEnd` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["linkedTrackEnd"],
    prefixes: ["!"]
})
```

```js
// events/linkedTrackEnd.js
module.exports = {
    type: "linkedTrackEnd",
    code: `$log[linkedTrackEnd fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`error`](error.md)
- [`linkedChapterStarted`](linkedChapterStarted.md)
- [`linkedChaptersLoaded`](linkedChaptersLoaded.md)
- [`linkedDebug`](linkedDebug.md)
- [`linkedLyricsFound`](linkedLyricsFound.md)
- [`linkedLyricsLine`](linkedLyricsLine.md)
- [`linkedLyricsNotFound`](linkedLyricsNotFound.md)
- [`linkedNodeConnect`](linkedNodeConnect.md)
