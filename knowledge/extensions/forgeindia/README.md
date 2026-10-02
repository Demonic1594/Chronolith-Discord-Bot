# ForgeIndia

> Your code. Your accent. Your rules. Tired of writing $sendMessage when your heart says $msgBhej? ForgeIndia is here to desi-fy your ForgeScript code with Hinglish. No grammar stress. No colon confusion. Just code the way you talk.

| | |
|---|---|
| Type | Community extension · verified |
| GitHub | https://github.com/user-lezi/ForgeIndia |
| Lead dev | Lezi |
| Main branch | `main` |
| Docs page | https://docs.botforge.org/?p=ForgeIndia |

## Contents

- [`functions/`](functions/_INDEX.md) — 113 functions

---

## Package README (verbatim from GitHub)

# 🇮🇳 ForgeIndia

**Your code, your accent, your rules.**

> Tired of writing `$sendMessage` when your heart says `$msgBhej`?
> **ForgeIndia** is here to desi-fy your ForgeScript code with Hinglish.
> No grammar stress. No colon confusion. Just code the way you talk.

---

## ✨ Features

* 🔤 Code in **Hinglish** (Hindi + English)
* 🤝 Beginner-friendly for native Hindi speakers
* 🧠 Focus on logic, not *angrezi*
* 🚀 Works just like native ForgeScript — only chattier

---

## 🚀 Example

`index.js`:

```js
const { ForgeIndia } = require("forge.india");
const { ForgeClient } = require("@tryforge/forgescript");

const client = new ForgeClient({
  intents: ["Guilds", "MessageContent", "GuildMessages"],
  events: ["ready", "messageCreate"],
  mobile: true,
  useInviteSystem: true,
  prefixes: ["!", "<@$botID>"],
  extensions: [new ForgeIndia()],
});

client.login("bot token");
```

`commands/test.js`:

```js
module.exports = {
  name: "up",
  type: "messageCreate",
  code: `$!msgReactionAddKaro[$chnlID;$msgID;👍]`
};
```

Yes, it works. No, you don't need a dictionary.

---

## 📦 Installation

```bash
npm install https://github.com/user-lezi/ForgeIndia
```

You’re one `npm install` away from coding in your *apni bhasha*.

---

## 🧠 Why?

Because `"sendMessage"` doesn't vibe the same as `"msgBhej"`.
Because accessibility isn't just about screen readers — it's about *language* too.
Because *English* shouldn't be a blocker to *logic*.

---

## 👥 Contribute

Got a better translation for `$math`?
Want `$msgDeleteKaro` to be a thing?

👉 Check out [`CONTRIBUTION.md`](CONTRIBUTION.md) to learn how to submit your own Hinglish magic.

---

## 💖 Made with love

This package is made for the **real** devs — the ones who think in Hindi, code in Hinglish, and build like pros.

Go ahead. Write `$msgBhej`.
Because *syntax should sound like you*.
