# Setup

> Community guide for `None` (none) — package **ForgeIndia**. Approved 2025-09-01. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-232)

**ForgeIndia** is a Hinglish-powered extension for [ForgeScript](https://docs.botforge.org/) that lets you code in a mix of Hindi and English, just like how you talk IRL.

With this extension, you can use Hinglish keywords as aliases for ForgeScript functions — making coding more natural and fun for Indian developers.

---

## 📦 Installation

Since `forge.india` isn’t on npm yet, install it directly from GitHub:

```bash
npm install https://github.com/user-lezi/ForgeIndia
```

---

## ⚡ Initializing the Extension

Import **ForgeIndia** and add it as an extension in your `ForgeClient`:

```js
const { ForgeIndia, ForgeIndiaTranslation } = require("forge.india");
const { ForgeClient } = require("@tryforge/forgescript");

const client = new ForgeClient({
  intents: ["Guilds", "MessageContent", "GuildMessages"],
  events: ["ready", "messageCreate"],
  mobile: true,
  useInviteSystem: true,
  prefixes: ["!", "<@$botID>"],
  extensions: [
    new ForgeIndia({
      debug: true, // ✅ Enable Debug logs
      translation: ForgeIndiaTranslation.Hinglish, // ✅ Currently supports Hinglish
      exclude: ["$ping", "$uptime"], // ✅ Skip translations if you want originals
    }),
  ],
});

client.login("bot token");
```

---

## 📝 Command Examples

### 👍 Reaction Command

```js
module.exports = {
  name: "up",
  type: "messageCreate",
  code: `$!msgReactionAddKaro[$chnlID;$msgID;👍]`
};
```

### 💬 Say Command

```js
module.exports = {
  name: "say",
  type: "messageCreate",
  code: `$typingChaluKaro[$channelKaID]
$messageBhej[$channelKaID;$message]`
};
```

---

## 🔑 Configuration Options

```ts
export enum ForgeIndiaTranslation {
  Hinglish = "hinglish"
}

export interface IForgeIndiaOptions {
  debug: boolean;              // Enable debug logs
  translation: ForgeIndiaTranslation; // Choose translation set
  exclude: `$${string}`[];     // Functions to exclude from translation
}
```

---

## 📖 Common Function Aliases

Here are some popular ForgeScript functions and their Hinglish aliases:

| ForgeScript (English) | Hinglish Alias        |
| --------------------- | --------------------- |
| `$sendMessage`        | `$messageBhej`        |
| `$deleteMessage`      | `$msgHatado`          |
| `$isBot`              | `$kyaBotHai`          |
| `$reply`              | `$jawabDo`            |
| `$channelID`          | `$channelKaID`        |
| `$userID`             | `$userKaID`           |
| `$userAvatar`         | `$userKiPhoto`        |
| `$startTyping`        | `$typingChaluKaro`    |
| `$addReactions`       | `$msgReactionAddKaro` |

---

🚀 Start building your bot in **apni bhasha** today with ForgeIndia!
