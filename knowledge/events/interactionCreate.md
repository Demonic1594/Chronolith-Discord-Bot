# interactionCreate

> This event is fired every time a user uses a slash command, context menu, button, etc

| Package | Since | Intents required |
|---|---|---|
| ForgeScript | v1.0.1 | — |

## Registering

Enable `interactionCreate` in the client's `events` array, then create an event file:

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [],
    events: ["interactionCreate"],
    prefixes: ["!"]
})
```

```js
// events/interactionCreate.js
module.exports = {
    type: "interactionCreate",
    code: `$log[interactionCreate fired!]`
}
```

## Context data available

- **Triggering entity (`obj`)**: `BaseInteraction` — the runtime object context functions resolve against.
- No old/new states — this event fires with a single fresh entity.
- `$message[N]` args: not seeded by this event (empty).

## Example

**Component/button routing**

```js
// events/interactionCreate.js
module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["button"],
    code: `
        $onlyIf[$customID==my-button]
        $interactionReply[You clicked it!]
    `
}
```

## Related events

- [`autoModerationActionExecution`](autoModerationActionExecution.md)
- [`autoModerationRuleCreate`](autoModerationRuleCreate.md)
- [`autoModerationRuleDelete`](autoModerationRuleDelete.md)
- [`autoModerationRuleUpdate`](autoModerationRuleUpdate.md)
- [`channelCreate`](channelCreate.md)
- [`channelDelete`](channelDelete.md)
- [`channelPinsUpdate`](channelPinsUpdate.md)
- [`channelUpdate`](channelUpdate.md)
