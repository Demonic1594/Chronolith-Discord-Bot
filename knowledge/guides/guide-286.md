# Setup

> Community guide for `None` (none) — package **ForgeDB**. Approved 2026-06-28. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-286)

ForgeDB is a powerful, high-performance database extension designed specifically for ForgeScript. It allows seamless integration of persistent database storage into your Discord bot.

This guide covers installation, client initialization, and variables configuration.

---

## 1. Installation

You can install the stable package from npm, or get the latest features directly from the development repository.

### Stable Release (Recommended)
```bash
npm i @tryforge/forge.db
```

### Pre-release Development Branches
```bash
# Main branch
npm i github:tryforge/ForgeDB

# Dev branch
npm i github:tryforge/ForgeDB#dev
```

### Database Driver Setup
ForgeDB supports multiple storage backends. For most applications, `better-sqlite3` is highly recommended:
```bash
npm i better-sqlite3
```

---

## 2. Configuration & Initialization

To load the extension, import `ForgeDB`, add it to your `ForgeClient` configurations, and define your global variables.

```js
// index.js
const { ForgeClient } = require("@tryforge/forgescript");
const { ForgeDB } = require("@tryforge/forge.db");

// Configure the database extension
const db = new ForgeDB({
  events: ["connect"], // Events to listen for
  type: "better-sqlite3",
});

// Initialize client with extensions
const client = new ForgeClient({
  extensions: [db],
  intents: ["Guilds", "GuildMessages", "MessageContent"]
});

// Register variables with default values
db.variables({
  prefix: "!",
  money: 0,
  blacklistedUsers: [],
  progress: {
    level: 1,
    xp: 0
  }
});

// Load commands and event handlers
client.commands.load("./commands");
db.commands.load("./dbEvents");
```

---

## 3. Modularizing Variables

To keep your entry file clean, you can manage variables in a separate configuration file.

### 1. Create a Variables File
Create `variables.js` in your root folder:

```js
// variables.js
module.exports = {
  prefix: "!",
  money: 0,
  blacklistedUsers: [],
  progress: {
    level: 1,
    xp: 0
  }
};
```

### 2. Import into Main File
Require the variables file and pass it directly to `db.variables()`:

```js
// index.js
const botVariables = require("./variables.js");
db.variables(botVariables);
```

---

## 4. Configuring Database Events

When `events: ["connect"]` is enabled, ForgeDB triggers a `connect` event command as soon as the storage connection is successfully opened.

Create an event command file inside your database events folder (e.g., `./dbEvents/connect.js`):

```js
module.exports = {
  type: "connect",
  code: `
    $logger[Info;Successfully connected to the database | Ping: $dbPingms]
  `
};
```
