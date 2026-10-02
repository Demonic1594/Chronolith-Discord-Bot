# voiceServerUpdate

> This event is fired when a voice server is updated

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v2.7.0 | `GuildVoiceStates` |

## Registering

Enable `voiceServerUpdate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildVoiceStates"],
    events: ["voiceServerUpdate"],
    prefixes: ["!"]
})
```

```js
// events/voiceServerUpdate.js
module.exports = {
    type: "voiceServerUpdate",
    code: `$log[voiceServerUpdate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `VoiceServerUpdateData` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `voiceServer` | yes | yes | `$voiceServer` |

- `$message[N]` args: not seeded by this event (empty).

## Related events

- [`autoModerationActionExecution`](autoModerationActionExecution.md)
- [`autoModerationRuleCreate`](autoModerationRuleCreate.md)
- [`autoModerationRuleDelete`](autoModerationRuleDelete.md)
- [`autoModerationRuleUpdate`](autoModerationRuleUpdate.md)
- [`channelCreate`](channelCreate.md)
- [`channelDelete`](channelDelete.md)
- [`channelPinsUpdate`](channelPinsUpdate.md)
- [`channelUpdate`](channelUpdate.md)
