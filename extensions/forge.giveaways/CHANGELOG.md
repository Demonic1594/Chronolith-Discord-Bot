# Changelog

## 2.0.0 (Chronolith fork, November 2026)

Forked from [tryforge/ForgeGiveaways](https://github.com/tryforge/ForgeGiveaways) 1.1.0 (commit `586fb15`). The fork is a modified version of that program, under the same GPL-3.0 license.

### Fixed
- **Durations over ~24.8 days ended immediately.** Node turns any `setTimeout` delay above 2^31 - 1 ms into 1 ms. Replaced the per-giveaway timeouts with one scheduler that re-arms in safe steps; there is no maximum duration now.
- Times were stored as 32-bit `INTEGER` on Postgres and MySQL, which overflows for millisecond timestamps. Now `BIGINT`.
- MySQL stored entries in `TEXT` (64 KB, roughly 3,400 entries). Now `LONGTEXT`.
- Winners were only picked from members in the bot's cache, so without the `GuildMembers` intent giveaways often had no winners.
- Concurrent clicks could overwrite each other's entries; a timer racing `$endGiveaway` could announce winners twice.
- A giveaway whose message was deleted never ended and was retried on every restart.
- `oldGiveaway` in events lost all methods (`structuredClone` of a class instance).
- The reaction handler fired `giveawayEntryRemove` when it removed the reaction of somebody who never entered.
- Reroll ignored requirements, refused giveaways that ended without winners, and a unique reroll silently fell back to previous winners.
- Biased shuffle (`sort(() => Math.random() - 0.5)`) replaced by Fisher-Yates with `crypto.randomInt`.
- A prize containing `@everyone` pinged everyone.
- Clicks on ended or unknown giveaways showed "This interaction failed".
- Timers were not restored if the database connected after the bot became ready.
- `$getAllGiveaways`, `$newGiveaway` and `$oldGiveaway` required a property although they can return JSON.
- Requirement checks now report the real reason before "entries full".

### Security
- Management functions (`$editGiveaway`, `$endGiveaway`, `$rerollGiveaway`, `$cancelGiveaway`, `$pauseGiveaway`, `$resumeGiveaway`, `$extendGiveaway`, `$shortenGiveaway`, `$addGiveawayEntry`, `$removeGiveawayEntry`, `$deleteGiveaway`) only act on giveaways of the given guild, or the current guild when none is given. `$editGiveaway`'s existing guild argument must now match.
- Validation for winners, duration, prize and role IDs.
- Default messages use explicit `allowedMentions`.

### Performance
- Active giveaways cached in memory; no database read per click.
- Entry writes coalesced (`entryFlushDelay`, default 1 s).
- Live entry counter refresh is debounced (`messageUpdateDelay`, default 5 s).
- Winner draw fetches only as many members as needed.
- Indexes on `messageID` and `(guildID, hasEnded)`.

### Added
- `$pauseGiveaway`, `$resumeGiveaway`, `$extendGiveaway`, `$shortenGiveaway`, `$cancelGiveaway`
- `$addGiveawayEntry`, `$removeGiveawayEntry`, `$getGuildGiveaways`
- Requirements: `$setRequiredRolesMode`, `$setMinimumAccountAge`, `$setMinimumMemberAge`, `$setMaxEntries`
- Bonus entries: `$addBonusEntries` (weighted draw)
- Display: `$setGiveawayDescription`, `$setGiveawayColor`, `$setGiveawayImage`, `$setGiveawayThumbnail`, `$setGiveawayPingRole`
- Getters: `$giveawayEndTimestamp`, `$giveawayTimeLeft`, `$giveawayIsPaused`, `$giveawayIsCancelled`, `$giveawayEndedAt`, `$giveawayEntriesCount`, `$giveawayTotalTickets`, `$giveawayMaxEntries`, `$giveawayDescription`, `$giveawayMinAccountAge`, `$giveawayMinMemberAge`, `$giveawayRequiredRolesMode`, `$giveawayBonusEntries`, `$giveawayHasEntered`, `$giveawayEntryWeight`, `$giveawayDenyReason`, plus matching properties for `$getGiveaway`
- `$wipeGiveaways[guild]` wipes one guild only
- Events: `giveawayCancel`, `giveawayPause`, `giveawayResume`; `giveawayEntryRevoke` carries the reason
- Options: `emoji`, `buttonLabel`, `buttonStyle`, `showEntryCount`, `dmWinners`, `colors`, `messages`, `entryFlushDelay`, `messageUpdateDelay`, `deleteEndedAfter`, `handleSignals`
- A deadline reached while the bot is disconnected is retried a minute later instead of ending with no winners
- Test suite (`npm test`): scheduler, locking, draw fairness, requirements, and end-to-end runs on SQLite including a restart

### Changed
- Persistence uses TypeORM `EntitySchema` per driver instead of decorators; table names and stored formats are unchanged, so existing databases upgrade in place.
- `@tryforge/forgescript`, `@tryforge/forge.db` and `discord.js` are peer dependencies.
- The generated typedoc HTML (`docs/`) is no longer committed; run `npm run docs`.

## 1.1.0 and earlier

See [metadata/changelogs.json](metadata/changelogs.json) and the upstream repository.
