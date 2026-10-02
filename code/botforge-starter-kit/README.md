# 🚀 BotForge Starter Kit

> A clean and developer-friendly starter template for building Discord bots with BotForge.

BotForge Starter Kit provides a solid foundation for your next project, including team management, prefix management, command synchronization, and developer utilities.

Built by **Rokon**.

---

## ✨ Features

* 👥 Team Management System
* ⚙️ Runtime Prefix Management
* 🔄 Command Synchronization
* 🧪 ForgeScript Evaluation
* 🤖 Bot Information Command
* 🛠️ Slash & Prefix Commands

---

## 📦 Packages

* ForgeScript
* ForgeDB
* dotenv
* sqlite3

---

## 🚀 Getting Started

### Install Dependencies

```bash
npm i
```

### Configure Environment Variables

Create a `.env` file in the project root:

```env
Token=YOUR_BOT_TOKEN
TeamRoleID=YOUR_TEAM_ROLE_ID
```

### Start The Bot

```bash
node .
```

> ⚠️ The bot will not start if any required environment variables are missing.

---

## 📚 Commands

### 👥 Team Commands

| Command      | Description                   |
| ------------ | ----------------------------- |
| `teaminfo`   | Display team information      |
| `teamlist`   | Display all team members      |
| `teamadd`    | Add a member to the team      |
| `teamremove` | Remove a member from the team |

### ⚙️ Utility Commands

| Command       | Description                       |
| ------------- | --------------------------------- |
| `botinfo`     | Display bot information           |
| `prefix`      | View the current prefix           |
| `prefixset`   | Change the current prefix         |
| `prefixreset` | Reset the prefix                  |
| `update`      | Refresh slash and prefix commands |
| `eval`        | Execute ForgeScript code          |

---

## 🔐 Permission System

### 👑 Owner

Full access to all commands and systems.

Can access:

* Team Commands
* Team Management
* Prefix Management
* Eval
* Update
* Developer Utilities

### 🛡️ Team Member

Users with the configured Team Role.

Can access:

* Team Information
* Eval
* Update
* Developer Utilities

> Team members cannot add or remove other team members.

### 👤 User

Standard bot access.

---

## 📂 Project Structure

```txt
Commands/
│
└─ Contains all slash commands.

Events/
│
├─ ForgeDB/
│  └─ ForgeDB event files.
│
└─ ForgeScript/
   │
   ├─ Events/
   │  └─ General ForgeScript events.
   │
   └─ Prefixs/
      └─ All prefix commands.

Functions/
│
└─ Custom functions.

.env
│
└─ Environment variables.

index.js
│
└─ Main bot file.

package.json
│
└─ Project dependencies and scripts.
```

---

## 🆘 Need Help?

Join the official BotForge Discord server:

https://discord.gg/4QwMCcF9AY

Create a post in the support forum describing your issue.

You can also ping:

`@sm_rokon`

for Starter Kit related questions.

---

## ❤️ Credits

Developed by **Rokon**

Powered by the **BotForge Ecosystem**

---

## 📜 License

Licensed under the **MIT License**.

See the LICENSE file for details.

---

## ⭐ Support

If you find this project useful, consider giving the repository a star.

It helps more than you think.
