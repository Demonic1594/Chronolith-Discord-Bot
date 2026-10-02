# linkedNodeConnect

> Triggered when connects to a node

| Package | Since | Intents required |
|---|---|---|
| ForgeLinked | v2.1.3 | — |

## Registering

Enable `linkedNodeConnect` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["linkedNodeConnect"],
    prefixes: ["!"]
})
```

```js
// events/linkedNodeConnect.js
module.exports = {
    type: "linkedNodeConnect",
    code: `$log[linkedNodeConnect fired!]`
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
- [`linkedPlayerCreate`](linkedPlayerCreate.md)
