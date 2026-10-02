# Bot setup & command authoring — the JS side

> Condensed from the ForgeScript README (verbatim copy cached at `.knowledge-cache/meta/ForgeScript__readme.md`) and the source tree. This is everything needed to host the `$functions` documented in `functions/`.

## Installation

```bash
npm i https://github.com/tryforge/ForgeScript/tree/main   # main
npm i https://github.com/tryforge/ForgeScript/tree/dev    # dev
```

## Minimal client

```js
const { ForgeClient } = require("@tryforge/forgescript")

const client = new ForgeClient({
    intents: [
        "Guilds",
        "GuildMessages",
        "MessageContent" // privileged — enable in the developer portal
    ],
    events: ["messageCreate", "clientReady"],
    prefixes: ["!", "?"]
})

client.login("TOKEN")
```

Notes:
- `intents` are discord.js `GatewayIntentBits` names (camelCase strings).
- `events` lists which of the 79 documented events (`events/` folder here) the bot should listen to.
- Extension events are added by the extension itself (see each `extensions/<pkg>/README.md`).

## Registering commands

**Basic** — `commands/ping.js`:

```js
module.exports = {
    name: "ping",              // trigger (optional for events; also used as custom ID filter on interactionCreate)
    type: "messageCreate",     // REQUIRED — the event this command binds to (keyof ClientEvents)
    code: `Pong! ($ping ms)$reply`   // bare $reply = mark output as a reply; full: $reply[channel ID*;message ID*;disable ping]
}
```

Command-file fields (source: `IBaseCommand`): `type` (required, event name), `name` (trigger; **compiled** — may contain `$functions`), `aliases`, `code`, `prefixMode` / `unprefixed` (run without/with-optional prefix — default requires one), `nameCaseInsensitive` (default **true**), `allowedInteractionTypes` (interactionCreate filtering), `disableConsoleErrors`, plus slash-specific `data`/`type` (registration scope).

```js
client.commands.load("./commands")   // auto-discovers *.js files
```

**Slash commands** — the current format is a `data` field holding raw Discord JSON (or a discord.js builder), verified against the manager source and official test commands on `main` — `commands/greet.js`:

```js
module.exports = {
    data: {
        type: 1,                        // CHAT_INPUT
        name: "greet",
        description: "Greet someone",
        integration_types: [0],          // guild install (user-installable apps use 1 here)
        contexts: [0],                   // guild context
        options: [{
            type: 3,                     // STRING
            name: "user",
            description: "User to greet",
            required: true
        }]
    },
    code: `$interactionReply[Hello <@$option[user]>!]`
}
```

`data` also accepts `SlashCommandBuilder`/`ContextMenuCommandBuilder` instances. Option values are read in code with `$option[name]` (attachment-type options conveniently resolve to the file URL). Note: older community posts (and the GitHub README) show a `name: "slash greet"` + `type: "slash"` + top-level `options` style — that's legacy README-era syntax; the manager on `main` (`IApplicationCommandData`) requires `data`.

**From a root folder:**

```js
client.commands.load({
    root: "commands",      // folders inside become command name prefixes
    type: "message"        // or "slash"
})
```

## Extensions

```js
const { ForgeDB } = require("forge.db")
client.extensions.add(ForgeDB)   // after client creation, before login
```

Extension functions then become available in all commands (they register into the same FunctionManager — that's why the compiler can see `$setVar` etc.). Extensions may also expose **their own command managers** for their custom events: `music.commands.load("./events")` (ForgeMusic player events), `quorielDb.commands.load("./db-events")` (QuorielDB database events) — those handlers use the extension's event names as `type` (e.g. `"playerTrigger"`, `"databaseConnect"`) and receive extension payloads through `$env[...]` keys. Per-extension install & usage: `extensions/<pkg>/README.md`.

## Client options reference

The Client Generator tool (`../tools/README.md`) exposes the full option surface: `prefixes`, folder loaders (`commands` / `slashCommands` / `functions` — the last one is the custom-function directory, see `custom-functions.md`), `prefixCaseInsensitive`, `logLevel` (`none`/`veryLow`/`low`/`medium`/`high`), `allowBots`, `disableConsoleErrors`, `mobile`, `respondOnEdit` (+ ms window), and trackers (`InviteTracker`, `VoiceTracker`).

## Command file structure (message & slash)

| Field | Purpose |
|---|---|
| `name` | trigger (message prefix command); **compiled** — may contain `$functions` |
| `code` | the ForgeScript body — everything in `functions/` runs here |
| `type` | REQUIRED — the event this command binds to (`keyof ClientEvents`, e.g. `messageCreate`, `interactionCreate`) |
| `data` | slash/context-menu registration: raw Discord JSON or a discord.js builder (the current format — replaces the legacy `type: "slash"` + top-level `options` style) |
| `aliases` | alternative triggers |
| `prefixMode` / `unprefixed` | run without / with-optional prefix (default requires one) |
| `nameCaseInsensitive` | default **true** |
| `allowedInteractionTypes` | `interactionCreate` filtering |
| `path` | set automatically by the loader |

## Execution model recap

1. Discord event fires → matching command files' `code` is **compiled once** (cached).
2. Restrictions run (`allowBots`, `guildOnly`, `restrictions`).
3. Top-level functions execute left-to-right; `$only*`/`$stop` may cut execution.
4. Final container (content + embeds + components + files) is sent to the trigger channel/interaction.

## Debugging tips

- `$log[...]` prints resolved values to the host console — the fastest way to inspect mid-execution state.
- `$c[...]` is an inline comment; anything inside is ignored.
- Wrap risky sections: `$try[code;catchCode;errorVar]` (stores the error message in a `$let`-style env var).
- The BotForge validator (`validate/README.md`) catches syntax issues (brackets, unknown functions, arg counts) without running a bot.
