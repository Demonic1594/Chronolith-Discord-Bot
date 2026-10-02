# ForgeGiveaways

> ForgeGiveaways is a lightweight, flexible, and reliable extension for managing giveaways. Fully customizable features let you automate, track, and control every giveaway seamlessly.

| | |
|---|---|
| Type | Official extension · verified |
| GitHub | https://github.com/tryforge/ForgeGiveaways |
| npm | `forge.giveaways` (`npm i forge.giveaways`) |
| Lead dev | Nicky |
| Main branch | `main` |
| Docs page | https://docs.botforge.org/?p=ForgeGiveaways |

## Contents

- [`functions/`](functions/_INDEX.md) — 30 functions
- [`events/`](events/_INDEX.md) — 8 events
- [`enums/`](enums/_INDEX.md) — 1 enums

## Changelog summary

| Version | Changes |
|---|---|
| 1.1.0 | Bump djs<br>Added editing giveaways<br>Minor improvements<br>Giveaway ID is no longer required in custom IDs<br>Filter out bots<br>Added support for reactions<br>Save all previous winners<br>Fixed crash after starting giveaways without event file |
| 1.0.0 | Init ForgeGiveaways |

Full changelog: [`CHANGELOG.md`](CHANGELOG.md)

---

## Package README (verbatim from GitHub)

<div align="center">

<img height="150" width="150" src="https://raw.githubusercontent.com/tryforge/ForgeGiveaways/main/assets/ForgeGiveaways.png" alt="ForgeGiveaways">

# ForgeGiveaways
ForgeGiveaways is a lightweight, flexible, and reliable extension for managing giveaways. Fully customizable features let you automate, track, and control every giveaway seamlessly.

<a href="https://github.com/tryforge/ForgeGiveaways/"><img src="https://img.shields.io/github/package-json/v/tryforge/ForgeGiveaways/main?label=@tryforge/forge.giveaways&color=5c16d4" alt="@tryforge/forge.giveaways"></a>
<a href="https://github.com/tryforge/ForgeScript/"><img src="https://img.shields.io/github/package-json/v/tryforge/ForgeScript/main?label=@tryforge/forgescript&color=5c16d4" alt="@tryforge/forgescript"></a>
<a href="https://discord.gg/hcJgjzPvqb"><img src="https://img.shields.io/discord/997899472610795580?logo=discord" alt="Discord"></a>

</div>

---

## Contents

1. [Installation](#installation)
2. [Custom Messages](#custom-messages)
3. [Handling Interactions](#handling-interactions)
4. [Documentation](https://docs.botforge.org/p/ForgeGiveaways/)

<h3 align="center">Installation</h3><hr>

> ⚠️ **Warning**\
> **ForgeGiveaways** requires the extension [**ForgeDB**](https://docs.botforge.org/p/ForgeDB/) installed in order to operate.

1. Run the following command to install the required `npm` packages:
    ```bash
    npm i @tryforge/forge.giveaways @tryforge/forge.db
    ```

2. Here’s an example of how your main file should look:
    ```js
    const { ForgeClient } = require("@tryforge/forgescript")
    const { ForgeGiveaways } = require("@tryforge/forge.giveaways")
    const { ForgeDB } = require("@tryforge/forge.db")

    const giveaways = new ForgeGiveaways({
        events: [
            "giveawayStart",
            "giveawayEnd"
        ],
        useDefault: true
    })

    const client = new ForgeClient({
        ...options // The options you currently have
        extensions: [
            giveaways,
            new ForgeDB()
        ]
    })

    client.commands.load("commands")
    giveaways.commands.load("giveaways")

    client.login("YourToken")
    ```

    > ℹ️ **Note**\
    > View all available client options [here](https://tryforge.github.io/ForgeGiveaways/interfaces/IForgeGiveawaysOptions.html).

<h3 align="center">Custom Messages</h3><hr>

You can disable the default messages by setting `useDefault: false` in the client options, and override them with custom messages emitted through events. Use desired functions to retrieve information about the current giveaway.

> ⚠️ **Warning**\
> Only **one** `giveawayStart` event is allowed per client instance!

#### Examples
When using custom start messages, your event **must return the message ID** of the sent giveaway message. To ensure that only the message ID is returned (and no additional text), use the `$return[]` function.

```js
module.exports = {
  type: "giveawayStart",
  code: `
  $return[
    $sendMessage[$giveawayChannelID;
      $addContainer[
        $addTextDisplay[### 🎉 Giveaway 🎉]
        $addSeparator
        $addTextDisplay[**Prize:** $giveawayPrize\n**Winners:** $giveawayWinnersCount]
        $addSeparator
        $addActionRow
        $addButton[giveawayEntry;Join;Secondary;🎉]
      ;Green]
    ;true]
  ]
  `
}
```

```js
module.exports = {
  type: "giveawayEnd",
  code: `
  $sendMessage[$giveawayChannelID;
    $reply[$giveawayChannelID;$giveawayMessageID;true]
    🏆 **Winners:** <@$newGiveaway[winners;>, <@]>
  ]
  `
}
```

<h3 align="center">Handling Interactions</h3><hr>

The custom ID for giveaway entry buttons must follow this exact format:
```
giveawayEntry  
```
<sub>*See the `giveawayStart` example above for reference.*</sub>

\
Through the entry-related events, you can send custom responses directly to the current interaction context.

#### Examples
```js
module.exports = {
  type: "giveawayEntryAdd",
  code: `
  $interactionReply[
    $ephemeral
    You have joined this giveaway as **$ordinal[$@[,]giveawayEntries]** participant! 
  ]
  `
}
```

```js
module.exports = {
  type: "giveawayEntryRemove",
  code: `
  $interactionReply[
    $ephemeral
    You have left this giveaway! 
  ]
  `
}
```
