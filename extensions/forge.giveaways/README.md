# ForgeGiveaways (Chronolith fork) 2.0.0

A giveaway extension for [ForgeScript](https://github.com/tryforge/ForgeScript): start, end, reroll, edit, pause, resume, extend and cancel giveaways, with role requirements, account and membership age gates, bonus entries, entry caps and fully customizable default messages.

This is a modified fork of [tryforge/ForgeGiveaways](https://github.com/tryforge/ForgeGiveaways) by xNickyDev, forked at upstream commit `586fb15` (version 1.1.0). It is licensed under the GNU GPL v3, like the original (see [LICENSE](LICENSE)). Modifications were made in November 2026; [CHANGELOG.md](CHANGELOG.md) lists them.

---

## What's different from upstream 1.1.0

**No duration limit.** Upstream used one `setTimeout` per giveaway. Node can't wait longer than 2^31 - 1 ms (about 24.8 days) and silently turns longer delays into 1 ms, so a 30 day giveaway ended right after it started. This fork uses a single scheduler that re-arms in safe steps, so a giveaway can run for a year or longer. On Postgres and MySQL, times were also stored in 32-bit `INTEGER` columns, which overflow for millisecond timestamps; they are `BIGINT` now.

**Fixed bugs**
- Winners were drawn only from members already in the bot's cache. Without the `GuildMembers` intent that is usually nobody, so giveaways often ended with no winners. Candidates are now fetched as needed.
- Two people clicking "Join" at the same time could overwrite each other's entry, and the end timer racing `$endGiveaway` could announce winners twice. Every change to a giveaway now runs under a per-giveaway lock.
- If the giveaway message was deleted, the giveaway never ended and was retried on every restart. It now ends anyway and logs a warning.
- `oldGiveaway` in events was a plain object without methods (`structuredClone` drops the class).
- Removing the reaction of somebody who didn't qualify fired `giveawayEntryRemove` for a user who never entered.
- Reroll ignored requirements and could not be used on giveaways that ended with no winners. A unique reroll silently fell back to previous winners.
- The winner draw used `sort(() => Math.random() - 0.5)`, which is biased. It now uses a Fisher-Yates shuffle with a cryptographically secure RNG.
- A prize containing `@everyone` pinged everyone. Default messages now only ping what they are meant to.
- Clicking an ended, unknown or not yet loaded giveaway showed "This interaction failed". It now gets a reply.
- Restoring timers could be skipped if the database connected after the bot was ready.
- On MySQL, the entries column was `TEXT` (64 KB, about 3,400 entries). It is `LONGTEXT` now.

**Hardening**
- `$editGiveaway`, `$endGiveaway`, `$rerollGiveaway`, `$deleteGiveaway` and the other management functions refuse to touch a giveaway of another guild. Giveaway IDs are time based and guessable, so a command run in guild A could otherwise end guild B's giveaway. See [Guild scoping](#guild-scoping).
- Input validation: winners must be at least 1, duration greater than 0, prize not empty, role IDs must be valid IDs or mentions.
- Winner announcements are split over several messages, so any number of winners fits Discord's 2,000 character limit.
- A failing event command, Discord API error or database hiccup is logged and does not crash the bot.
- Pending writes are flushed on `SIGINT`/`SIGTERM`.

**Faster**
- Active giveaways are kept in memory, so a click on "Join" needs no database read.
- A rush of entries is written to the database once per second instead of once per click.
- The live entry counter on the button is refreshed at most every 5 seconds.
- `messageID` and `guildID` are indexed.

**New features**: pause and resume, extend and shorten, cancel, bonus entries per role, entry caps, minimum account age, minimum time in the server, "any of" required roles, custom description, color, image, thumbnail and ping role, a live entry counter, optional winner DMs, configurable texts, colors, emoji and button, automatic cleanup of old giveaways, adding or removing entries on someone's behalf, per-guild listing, and the `giveawayCancel`, `giveawayPause` and `giveawayResume` events. `giveawayEntryRevoke` now tells you why with `$giveawayDenyReason`.

Existing databases are upgraded in place on first start. Function names and arguments from 1.1.0 keep working; new arguments were only added at the end.

---

## Installation

ForgeGiveaways needs the [ForgeDB](https://docs.botforge.org/p/ForgeDB/) extension.

1. Build the extension once (the compiled `dist/` folder is committed, so this is only needed after changing the source):
    ```bash
    cd extensions/forge.giveaways
    npm install
    npm run build
    ```

2. Load it in your main file:
    ```js
    const { ForgeClient } = require("@tryforge/forgescript")
    const { ForgeDB } = require("@tryforge/forge.db")
    const { ForgeGiveaways } = require("./extensions/forge.giveaways")

    const giveaways = new ForgeGiveaways({
        events: ["giveawayStart", "giveawayEnd"],
        useDefault: true,
    })

    const client = new ForgeClient({
        ...options, // the options you currently have
        extensions: [giveaways, new ForgeDB()],
    })

    client.commands.load("commands")
    giveaways.commands.load("giveaways")

    client.login("YourToken")
    ```

    The extension expects `@tryforge/forgescript`, `@tryforge/forge.db` and `discord.js` to come from your bot (they are peer dependencies), so only one copy of each is loaded. Don't keep the extension's own `node_modules` folder around when the bot runs, or Node will load those copies instead.

### Options

| Option | Default | What it does |
|---|---|---|
| `events` | `[]` | Giveaway events to listen to |
| `useDefault` | `true` | Send and update the built-in giveaway messages |
| `useReactions` | `false` | Enter by reacting instead of clicking a button. Needs the `GuildMessageReactions` intent and the `Message` and `Reaction` partials |
| `emoji` | `🎉` | Emoji on the button, or the reaction used to enter |
| `buttonLabel` | `Join` | Button label |
| `buttonStyle` | `ButtonStyle.Success` | Button style |
| `showEntryCount` | `true` | Show the live entry count on the button, e.g. "Join (42)" |
| `dmWinners` | `false` | Send winners a direct message |
| `colors` | green, yellow, red, grey | Embed colors for `active`, `paused`, `ended`, `cancelled` |
| `messages` | see `DEFAULT_MESSAGES` | Override any text of the default messages |
| `entryFlushDelay` | `1000` | Write entry changes at most this often (ms) per giveaway; `0` writes on every click |
| `messageUpdateDelay` | `5000` | Refresh the entry counter at most this often (ms) |
| `deleteEndedAfter` | off | Delete ended giveaways this many ms after they ended |
| `handleSignals` | `true` | Flush pending writes on `SIGINT`/`SIGTERM` |

Text placeholders in `messages`: `{prize}`, `{mentions}`, `{s}` (plural "s"), `{reason}`, `{guild}`, `{link}`, `{tickets}`, `{ping}`, `{entryMethod}`.

```js
new ForgeGiveaways({
    dmWinners: true,
    deleteEndedAfter: 30 * 24 * 60 * 60 * 1000, // keep ended giveaways for 30 days
    messages: { joined: "You're in for **{prize}**! Good luck.{tickets}" },
})
```

---

## Starting giveaways

Requirement and display functions apply to the `$startGiveaway` or `$editGiveaway` that follows them in the same command.

```js
module.exports = {
  name: "gstart",
  code: `
  $addRequiredRoles[123456789012345678]
  $setMinimumAccountAge[30d]
  $setMinimumMemberAge[7d]
  $addBonusEntries[234567890123456789;2]
  $setMaxEntries[500]
  $setGiveawayDescription[Thanks for being part of the community!]
  $setGiveawayColor[#5865F2]
  $let[id;$startGiveaway[$channelID;$authorID;Discord Nitro;60d;3]]
  Started giveaway $get[id]
  `
}
```

Role arguments accept IDs or mentions such as `<@&123...>`; anything else is rejected with an error.

### Functions

**Builders** (before `$startGiveaway` or `$editGiveaway`)

| Function | Effect |
|---|---|
| `$addRequiredRoles[roles...]` | Members need these roles |
| `$setRequiredRolesMode[all\|any]` | Need all of them (default) or any one |
| `$addRestrictedRoles[roles...]` | Members with any of these roles can't enter |
| `$addRestrictedMembers[users...]` | These users can't enter |
| `$setMinimumAccountAge[time]` | Discord account must be at least this old |
| `$setMinimumMemberAge[time]` | Must have been in the server this long |
| `$addBonusEntries[role;amount]` | Members with the role get `amount` extra tickets (bonuses add up) |
| `$setMaxEntries[amount]` | Cap the number of entrants (`0` removes the cap) |
| `$setGiveawayDescription[text]`, `$setGiveawayColor[color]`, `$setGiveawayImage[url]`, `$setGiveawayThumbnail[url]`, `$setGiveawayPingRole[role]` | Default message look |

**Managing** (all return `true` on success; the optional last `guild ID` argument is explained under [Guild scoping](#guild-scoping))

| Function | Effect |
|---|---|
| `$startGiveaway[channel;host;prize;duration;winners?]` | Start; returns the giveaway ID. Any duration works, e.g. `1y` |
| `$endGiveaway[id;guild?]` | End now and draw winners |
| `$rerollGiveaway[id;unique?;amount?;guild?]` | Draw new winners; `unique` excludes everyone who already won |
| `$editGiveaway[id;guild;host?;prize?;winners?]` | Change a running giveaway |
| `$extendGiveaway[id;time;guild?]` / `$shortenGiveaway[id;time;guild?]` | Move the end time |
| `$pauseGiveaway[id;guild?]` / `$resumeGiveaway[id;guild?]` | Freeze and unfreeze the timer and entries |
| `$cancelGiveaway[id;guild?]` | End without winners |
| `$addGiveawayEntry[id;user;bypass?;guild?]` / `$removeGiveawayEntry[id;user;guild?]` | Manage entries by hand |
| `$deleteGiveaway[id;guild?]` | Delete permanently |
| `$wipeGiveaways[guild?]` | Delete all giveaways of a guild, or all of them |

**Reading**: `$getGiveaway[id;property?;sep?]`, `$getAllGiveaways[property?;sep?]`, `$getGuildGiveaways[guild;all|active|paused|ended;property?;sep?]`, `$giveawayExists[id]`, and `$giveawayX[id?]` for every field: `ID`, `Prize`, `Duration`, `Timestamp`, `EndTimestamp`, `TimeLeft`, `EndedAt`, `HasEnded`, `IsPaused`, `IsCancelled`, `WinnersCount`, `Winners`, `PreviousWinners`, `Entries`, `EntriesCount`, `TotalTickets`, `MaxEntries`, `HostID`, `GuildID`, `ChannelID`, `MessageID`, `RequiredRoles`, `RequiredRolesMode`, `RestrictedRoles`, `RestrictedMembers`, `MinAccountAge`, `MinMemberAge`, `BonusEntries`, `Description`. Also `$giveawayHasEntered[id;user]`, `$giveawayEntryWeight[id;user]`, and in events `$newGiveaway[property]`, `$oldGiveaway[property]` and `$giveawayDenyReason`.

The full list with argument details is in [metadata/functions.json](metadata/functions.json).

### Guild scoping

Management functions only act on giveaways of the guild given as the last argument or, if you leave it out, of the guild the command runs in. In contexts without a guild (giveaway events, `ready`) they are unrestricted. `$editGiveaway` already had a required guild argument; it must now match the giveaway.

---

## Custom messages

Set `useDefault: false` and send your own messages from events. Only **one** `giveawayStart` event is allowed per client, and it **must return the message ID** of the message it sent:

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

The entry button's custom ID must be `giveawayEntry` (anything after a `-` is ignored, e.g. `giveawayEntry-1`). Through the entry events you can answer the interaction yourself:

```js
module.exports = {
  type: "giveawayEntryRevoke",
  code: `
  $interactionReply[
    $ephemeral
    You can't join: $giveawayDenyReason
  ]
  `
}
```

`$giveawayDenyReason` is one of `missingRoles`, `restrictedRole`, `restrictedMember`, `accountTooNew`, `memberTooNew`, `entriesFull`, `ended`, `paused`.

### Events

`databaseConnect`, `giveawayStart`, `giveawayEnd`, `giveawayReroll`, `giveawayEdit` (also fired by extend/shorten), `giveawayEntryAdd`, `giveawayEntryRemove`, `giveawayEntryRevoke`, `giveawayCancel`, `giveawayPause`, `giveawayResume`.

---

## Notes and limits

- Active giveaways are cached in memory, which assumes one bot process owns the giveaway table (the normal setup). Don't point two running bots at the same giveaway database.
- With the default `entryFlushDelay` of one second, a crash can lose up to the last second of entry clicks. Set it to `0` if that matters more than write volume.
- Bonus entries are counted from the member's roles at the time of the draw when the member is cached, otherwise from the roles they had when they entered.
- MongoDB support follows the original schema but has not been tested against a live MongoDB server.

## Development

```bash
npm install
npm run build      # compile TypeScript to dist/
npm test           # build, then run unit and integration tests (SQLite)
npm run docgen     # regenerate metadata/*.json
```
