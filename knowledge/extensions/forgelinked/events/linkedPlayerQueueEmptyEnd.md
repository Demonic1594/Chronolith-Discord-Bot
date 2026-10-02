# linkedPlayerQueueEmptyEnd

> This event is called when the queue empty handler finishes and destroys the player

| Package | Since | Intents required |
|---|---|---|
| ForgeLinked | v2.0.0 | — |

## Registering

Enable `linkedPlayerQueueEmptyEnd` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["linkedPlayerQueueEmptyEnd"],
    prefixes: ["!"]
})
```

```js
// events/linkedPlayerQueueEmptyEnd.js
module.exports = {
    type: "linkedPlayerQueueEmptyEnd",
    code: `$log[linkedPlayerQueueEmptyEnd fired!]`
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
