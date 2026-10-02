# linkedPlayerQueueEmptyStart

> This event is called when the queue empty handler starts (the timeout)

| Package | Since | Intents required |
|---|---|---|
| ForgeLinked | v2.0.0 | — |

## Registering

Enable `linkedPlayerQueueEmptyStart` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["linkedPlayerQueueEmptyStart"],
    prefixes: ["!"]
})
```

```js
// events/linkedPlayerQueueEmptyStart.js
module.exports = {
    type: "linkedPlayerQueueEmptyStart",
    code: `$log[linkedPlayerQueueEmptyStart fired!]`
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
