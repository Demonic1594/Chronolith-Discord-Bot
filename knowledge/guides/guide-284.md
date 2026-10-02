# Slash Commands

> Community guide for `None` (none) — package **ForgeScript**. Approved 2026-06-13. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-284)

Slash commands offer a smooth, intuitive experience compared to traditional prefix commands. Instead of memorizing command formats and guessing arguments, users are guided through structured inputs. They are clean, discoverable, and natively supported by Discord's UI.

ForgeScript supports both slash and prefix commands, but they require different structures and loading methods.

---

## 1. Registering Slash Commands

Prefix commands are registered using:

```js
client.commands.load("./commands/prefix");
```

For slash commands, the registration method is:

```js
client.applicationCommands.load("./commands/slash");
```

> [!IMPORTANT]
> Never mix prefix and slash commands in the same directory. Keep them separated:
> ```
> commands/
> ├── prefix/
> └── slash/
> ```

---

## 2. Accessing User Input

Prefix commands parse raw message arguments using `$message[index]`. For example:

```fs
$message[0] // Returns the first argument
```

Slash commands do not parse raw messages. Instead, users supply structured parameters called **options**. You access these options in your code using:

```fs
$option[name]
```

For example, for a `/greet` command with a `user` option:

```fs
Hello, $option[user]!
```

---

## 3. Slash Command Structures

Slash commands require you to define their metadata using a `data` object alongside the command's executable code.

### Basic Example

```js
module.exports = {
  code: `
    Ping: \`$pingMS\` | Uptime: $discordTimestamp[$sub[$getTimestamp;$uptime];RelativeTime]
  `,
  data: {
    name: "ping",
    description: "Get the bot's current ping and uptime",
  },
};
```

### Example with Options

```js
module.exports = {
  code: `
    Hello, $option[user]!
  `,
  data: {
    name: "greet",
    description: "Send a greeting to a user",
    options: [
      {
        name: "user",
        description: "The user to greet",
        type: 3, // STRING
        required: true
      }
    ]
  }
};
```

---

## 4. Slash Command Option Types

Below is the complete list of Discord option types supported in the `options` array:

| Type | Value | Description |
|---|---|---|
| `SUB_COMMAND` | `1` | A sub-command (e.g., `/user profile`) |
| `SUB_COMMAND_GROUP` | `2` | A group of sub-commands |
| `STRING` | `3` | Text input (maximum of 100 characters) |
| `INTEGER` | `4` | Whole number input |
| `BOOLEAN` | `5` | True/false toggle |
| `USER` | `6` | Select a Discord user |
| `CHANNEL` | `7` | Select a Discord channel |
| `ROLE` | `8` | Select a server role |
| `MENTIONABLE` | `9` | Select a user or role |
| `NUMBER` | `10` | Any number (including decimals) |
| `ATTACHMENT` | `11` | Upload a file or attachment |

---

## 5. Deferring and Ephemeral Responses

If your command takes longer than 3 seconds to process (e.g., calling external APIs), you must defer the response to prevent timeouts.

### `$defer`
Acknowledge the slash command immediately and display a loading state:
```fs
$defer
```

### `$deferUpdate`
Acknowledge a message component interaction (like button clicks) without updating the message:
```fs
$deferUpdate
// Component click successfully acknowledged
```

### `$ephemeral`
Send a private response that is only visible to the user who triggered the interaction:
```fs
$ephemeral
This is a private confirmation message.
```
