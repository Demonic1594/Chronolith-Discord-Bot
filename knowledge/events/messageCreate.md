# messageCreate

> This event is fired when someone sends a message

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | `GuildMessages`, `DirectMessages`, `MessageContent` |

> ⚠️ Privileged intent(s): `MessageContent` — must be enabled in the Discord Developer Portal (and toggled on the client) or the gateway will refuse the connection.

## Registering

Enable `messageCreate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: ["GuildMessages", "DirectMessages", "MessageContent"],
    events: ["messageCreate"],
    prefixes: ["!"]
})
```

```js
// events/messageCreate.js
module.exports = {
    type: "messageCreate",
    code: `$log[messageCreate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `Message` — the runtime object context functions resolve against.
- **Old/new states** — read them with the matching `$old…`/`$new…` accessors:

  | Entity | old | new | Accessors |
  |---|---|---|---|
  | `message` | — | yes | `$newMessage` |

- `$message[N]` args: not seeded by this event (empty).

## Example

**Typical prefix command**

```js
// commands/ping.js
module.exports = {
    name: "ping",
    code: `$reply[Pong! $ping ms;no]`
}
```

## Community guides

- [messageCreate guide](../guides/guide-296.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-296)

## Related events

- [`autoModerationActionExecution`](autoModerationActionExecution.md)
- [`autoModerationRuleCreate`](autoModerationRuleCreate.md)
- [`autoModerationRuleDelete`](autoModerationRuleDelete.md)
- [`autoModerationRuleUpdate`](autoModerationRuleUpdate.md)
- [`channelCreate`](channelCreate.md)
- [`channelDelete`](channelDelete.md)
- [`channelPinsUpdate`](channelPinsUpdate.md)
- [`channelUpdate`](channelUpdate.md)
