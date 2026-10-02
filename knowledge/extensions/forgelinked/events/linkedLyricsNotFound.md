# linkedLyricsNotFound

> Triggered when lyrics for a track are not found

| Package | Since | Intents required |
|---|---|---|
| ForgeLinked | v2.0.0 | — |

## Registering

Enable `linkedLyricsNotFound` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["linkedLyricsNotFound"],
    prefixes: ["!"]
})
```

```js
// events/linkedLyricsNotFound.js
module.exports = {
    type: "linkedLyricsNotFound",
    code: `$log[linkedLyricsNotFound fired!]`
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
- [`linkedNodeConnect`](linkedNodeConnect.md)
- [`linkedPlayerCreate`](linkedPlayerCreate.md)
