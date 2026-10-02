# linkedPlayerVoiceLeave

> This event is called when a user leaves (or switches away from) the player voice channel while there is a player

| Package | Since | Intents required |
|---|---|---|
| ForgeLinked | v2.0.0 | — |

## Registering

Enable `linkedPlayerVoiceLeave` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["linkedPlayerVoiceLeave"],
    prefixes: ["!"]
})
```

```js
// events/linkedPlayerVoiceLeave.js
module.exports = {
    type: "linkedPlayerVoiceLeave",
    code: `$log[linkedPlayerVoiceLeave fired!]`
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
