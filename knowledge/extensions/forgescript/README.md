# ForgeScript

> ForgeScript is a comprehensive package that empowers you to effortlessly interact with Discord's API. It ensures scripting remains easy to learn and consistently effective.

| | |
|---|---|
| Type | Official extension · verified |
| GitHub | https://github.com/TryForge/ForgeScript |
| npm | `forgescript` (`npm i forgescript`) |
| Lead dev | Nicky |
| Main branch | `main` |
| Docs page | https://docs.botforge.org/?p=ForgeScript |

## Contents

ForgeScript is the core package — its functions, events and enums live at the top level of this knowledge folder:

- [`functions/`](../../functions/_INDEX.md) — all ForgeScript functions by category
- [`events/`](../../events/_INDEX.md) — ForgeScript events
- [`enums/`](../../enums/_INDEX.md) — ForgeScript enums

## Changelog summary

| Version | Changes |
|---|---|
| 2.7.1 | Fixed $arrayIncludes for numbers |
| 2.7.0 | Updated commit file, $test<br>Refactored unprefixed property, added new properties to IBaseCommand<br>Refactor typingStart event to include all provided data objects<br>Fixed $botMutualGuilds incorrect filtering<br>Added many missing properties<br>Added $fetchSnapshot and $hasSnapshots<br>Added $getForumTag<br>Added $guildSystemChannelFlags, $deleteDM, $userURL |
| 2.6.0 | Marked $setCalendar as experimental for now<br>Clone and revamp local functions<br>Removed alias $addItem from $addMediaItem<br>Added $setGuildInvitesDisabled and $setGuildDmsDisabled<br>Allowed enabling mentions without ids, added $enableAllMentions<br>Added $silent<br>Support setting client guild avatar, banner and bio<br>Fixed $separateNumber and $separateBigint replace minus with sep |
| 2.5.0 | Renamed $fetchGuildPreview to $getGuildPreview<br>Added new events, optimized fetching app emojis<br>Added new functions and made small adjustments<br>Added $channelThreadIDs and $fetchThreads<br>Added int param to $rolePerms and $memberPerms<br>better fix of commit command<br>fix $ issue on commits and fixed generateMetadata<br>Remove ready event in favor of clientReady |
| 2.4.1 | Fixed broken legacy component functions |
| 2.4.0 | Fixed various component functions<br>Fixed $getComponents (cv2 support)<br>Fixed buffers and generating enums<br>Fixed generating paths<br>Fixed some time functions<br>Removed deprecated reason args of thread member functions<br>Small fixes<br>Support editing select menus in cv2 |
| 2.3.0 | Small changes, fixed ArgType.Date<br>Added more stage instance support<br>Marked affected guild functions as deprecated<br>Added embed support to $webhookEditMessage<br>Fixed custom function loader<br>Comited updates<br>Bumped to main depency Sucessfully<br>added $chalkLog |
| 2.2.0 | Added $djsVersion<br>Added $forward and new guild functions, djs v14.18<br>Added more forum functions<br>Added $jsonHas, fixed other json functions<br>Added $subtext<br>Fixed $loadComponents<br>Added $fetchMessage<br>Added optional guild arg to $applicationCommands |
| 2.1.0 | Added $deleteField, updated some descriptions<br>Removed deprecated djs stuff<br>Added bunch of new guild functions<br>Added some shard functions, updated $userBadges<br>Added $memberBanner, bump versions |
| 1.5.0 | Fixed $memberCustomStatus<br>Added prefixCaseInsensitive client option<br>Fixed $deleteMessage always returns 0 for one single deleted message<br>Added deprecation warning logger to $interactionRequirePremium<br>Added filters to $clearMessages and $clearUserMessages<br>Fixed $emojiID not working with app emojis<br>Added $botDescription, $setBotDescription and $setBotTags<br>Added $unparseDigital, renamed $isBool to $isBoolean |
| 1.4.0 | $arrayLoad now allows loading without values<br>Fixed $isSlashCommand and slashCommand int type<br>Fixed guild functions<br>$option now returns attachment urls<br>interactionCreate events now forward app commands, might become a breaking change for some (?),<br>Fixed $guildRulesChannelID<br>Added more time units<br>Added $discordTimestamp |
| 1.3.0 | Added mobile option to client<br>Added $addRoleSelectMenu<br>added $sliceText and $messageSlice<br>Added a lot of missing guild and role functions<br>added $arrayPushJSON and unshift variants<br>Added $guildChannelIDs and $guildRoleIDs<br>Added $hyperlink<br>Added $mentionedXCount |

Full changelog: [`CHANGELOG.md`](CHANGELOG.md)
