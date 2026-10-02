# ChannelType

Enum defined by **ForgeScript** with `17` values.

## Values

| Value | Index |
|---|---|
| `GuildText` | 0 |
| `DM` | 1 |
| `GuildVoice` | 2 |
| `GroupDM` | 3 |
| `GuildCategory` | 4 |
| `GuildAnnouncement` | 5 |
| `AnnouncementThread` | 6 |
| `PublicThread` | 7 |
| `PrivateThread` | 8 |
| `GuildStageVoice` | 9 |
| `GuildDirectory` | 10 |
| `GuildForum` | 11 |
| `GuildMedia` | 12 |
| `GuildNews` | 13 |
| `GuildNewsThread` | 14 |
| `GuildPublicThread` | 15 |
| `GuildPrivateThread` | 16 |

## Used by

- [`$addChannelType`](../functions/component/$addChannelType.md)
- [`$channelChildrenCount`](../functions/channel/$channelChildrenCount.md)
- [`$channelChildrenIDs`](../functions/channel/$channelChildrenIDs.md)
- [`$channelCount`](../functions/channel/$channelCount.md)
- [`$channelIsChildrenOf`](../functions/channel/$channelIsChildrenOf.md)
- [`$channelType`](../functions/channel/$channelType.md)
- [`$createChannel`](../functions/channel/$createChannel.md)
- [`$createStageInstance`](../functions/channel/$createStageInstance.md)
- [`$createThread`](../functions/channel/$createThread.md)
- [`$followChannel`](../functions/channel/$followChannel.md)
- [`$forumDefaultLayout`](../functions/channel/$forumDefaultLayout.md)
- [`$forwardMessage`](../functions/message/$forwardMessage.md)
- [`$guildChannelCount`](../functions/guild/$guildChannelCount.md)
- [`$onlyForCategories`](../functions/limiter/$onlyForCategories.md)
- [`$randomChannelID`](../functions/channel/$randomChannelID.md)
- [`$randomGuildChannelID`](../functions/channel/$randomGuildChannelID.md)
- [`$setChannelCategory`](../functions/channel/$setChannelCategory.md)
- [`$setChannelType`](../functions/component/$setChannelType.md)
- [`$setDefaultForumLayout`](../functions/channel/$setDefaultForumLayout.md)
- [`$setGuildAFKChannel`](../functions/guild/$setGuildAFKChannel.md)
- [`$setGuildPublicUpdatesChannel`](../functions/guild/$setGuildPublicUpdatesChannel.md)
- [`$setGuildRulesChannel`](../functions/guild/$setGuildRulesChannel.md)
- [`$setGuildSafetyAlertsChannel`](../functions/guild/$setGuildSafetyAlertsChannel.md)
- [`$setGuildSystemChannel`](../functions/guild/$setGuildSystemChannel.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
