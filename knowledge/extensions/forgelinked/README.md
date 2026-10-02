# ForgeLinked

> An extension to facilitate the use of Lavalink server with ForgeScript.

| | |
|---|---|
| Type | Official extension · verified |
| GitHub | https://github.com/tryforge/ForgeLinked |
| npm | `forge.linked` (`npm i forge.linked`) |
| Lead dev | Akaneruwumi |
| Main branch | `main` |
| Docs page | https://docs.botforge.org/?p=ForgeLinked |

## Contents

- [`functions/`](functions/_INDEX.md) — 64 functions
- [`events/`](events/_INDEX.md) — 29 events
- [`enums/`](enums/_INDEX.md) — 4 enums

## Changelog summary

| Version | Changes |
|---|---|
| 2.1.2 | Fix: Had overlapping function names |
| 2.1.0 | Docs: Generate Metadata<br>Style: Ran Prettier<br><br>Feat: Edit the commit function for more control<br>Chore: Add Lavalink Folder From Tests Into Ignore Files<br>Chore: Updated all dependencies to their latest versions<br>Feat: Added the exclude argument to $playerQueueTimes — allows skipping specific sources (e.g. radio streams) to prevent incorrect large values<br>Fix: $playerExists now correctly returns false when a player isn’t found |
| 2.0.1 | hi<br>Added some error handling<br>Added an arg<br>Some fixes and shit<br>Added $playerSkip and $playerLoopStatus and fixed $playerQueue<br>Added limit arg to playersearchtrack<br>Added requester and source arguments to $playerSearchTrack.<br>rawr |
| 2.0.0 | move dotenv to dev dep<br>No<br>Ran prettier<br>Switched License<br>rawr<br>Uwu<br>Made guildID field first and required on some control functions<br>Made guildID field first and required on some player functions |
| 1.0.0 | Switched From Kazagumo to LavalinkClient<br>Added $playerNextExists & $playerSkipTrack<br>Added $playerSetVolume |
| 0.0.0 | Added $playerSeekTrack<br>Added $playerResume<br>Add Basic Functions |

Full changelog: [`CHANGELOG.md`](CHANGELOG.md)

---

## Package README (verbatim from GitHub)

# ForgeLinked v2 🌋
Music made stronger with Lavalink for ForgeScript.

---

## ✨ Features
- Simple and easy-to-use ForgeScript functions
- Support for multiple event listeners
- Support for different audio providers
- Playlist & queue management
- Lavalink v4 ready

---

## 📦 Installation

Install via npm, yarn, pnpm etc:

```bash
npm install @tryforge/forge.linked
```

---

## 🚀 Setup

First, import ForgeClient and ForgeLinked in your main file:

```js
const { ForgeClient } = require('@tryforge/forgescript')
const { ForgeLinked } = require('@tryforge/forge.linked')
import * as dotenv from 'dotenv'
dotenv.config()

const lavalink = new ForgeLinked({
  nodes: [
    {
      id: "Public Lavalink Server",
      host: "lavalink.zack911.xyz",   // or your VPS IP/domain
      port: 443,
      authorization: "ZackIsSoCool", // ✅ must be 'authorization'
      secure: true
    }    
  ],
  playerOptions: {
    defaultSearchPlatform: "youtube"
  },
  events: ['linkedPlayerCreate', 'linkedPlayerDestroy']
})

const client = new ForgeClient({
  intents: [
    'Guilds',
    'GuildMessages',
    'MessageContent',
    'GuildVoiceStates'
  ],
  events: ['messageCreate'],
  extensions: [lavalink],
  prefixes: ['.']
})

client.commands.add({
  name: 'e',
  type: 'messageCreate',
  code: '$onlyForUsers[Not for you!;$botOwnerID] $eval[$message]'
})

client.login(process.env.BOT_TOKEN)
```

---

## ⚙️ Lavalink Configuration

Provide Lavalink server details inside `nodes`:

```js
const lavalink = new ForgeLinked({
  nodes: [
    {
      id: "Main Node",
      host: "lavalink.example.com",
      port: 2333,
      authorization: "youshallnotpass",
      secure: false
    }
  ]
})
```

> 🔑 You can find public Lavalink nodes online or [host your own](https://github.com/freyacodes/Lavalink).

---

## 💡 Tips

### Default Search Engine

Set a default search engine in `playerOptions`:

```js
const lavalink = new ForgeLinked({
  playerOptions: {
    defaultSearchPlatform: 'youtube'
  }
})
```

Available:

* `youtube`
* `youtube music`
* `soundcloud`
* `spotify` (if enabled)

---

## 📄 License

ForgeLinked v2 is licensed under the **GPL-3 License**.
See [LICENSE](https://github.com/Zack-911/ForgeLinked/blob/main/LICENSE.md) for more info.
