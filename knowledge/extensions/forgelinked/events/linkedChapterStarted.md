# linkedChapterStarted

> Triggered when a specific chapter starts playing

| Package | Since | Intents required |
|---|---|---|
| ForgeLinked | v2.0.0 | — |

## Registering

Enable `linkedChapterStarted` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["linkedChapterStarted"],
    prefixes: ["!"]
})
```

```js
// events/linkedChapterStarted.js
module.exports = {
    type: "linkedChapterStarted",
    code: `$log[linkedChapterStarted fired!]`
}
```

## Context data available

Inside the event code, the usual context functions apply (`$guildID`, `$channelID`, `$authorID`, `$message`, ... — availability depends on which entity the event carries).

## Related events

- [`error`](error.md)
- [`linkedChaptersLoaded`](linkedChaptersLoaded.md)
- [`linkedDebug`](linkedDebug.md)
- [`linkedLyricsFound`](linkedLyricsFound.md)
- [`linkedLyricsLine`](linkedLyricsLine.md)
- [`linkedLyricsNotFound`](linkedLyricsNotFound.md)
- [`linkedNodeConnect`](linkedNodeConnect.md)
- [`linkedPlayerCreate`](linkedPlayerCreate.md)
