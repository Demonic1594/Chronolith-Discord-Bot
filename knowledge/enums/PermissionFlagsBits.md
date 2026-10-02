# PermissionFlagsBits

Enum defined by **ForgeScript** with `53` values.

> The full camelCase permission-name list used by permission arguments everywhere.

## Values

| Value | Index |
|---|---|
| `CreateInstantInvite` | 0 |
| `KickMembers` | 1 |
| `BanMembers` | 2 |
| `Administrator` | 3 |
| `ManageChannels` | 4 |
| `ManageGuild` | 5 |
| `AddReactions` | 6 |
| `ViewAuditLog` | 7 |
| `PrioritySpeaker` | 8 |
| `Stream` | 9 |
| `ViewChannel` | 10 |
| `SendMessages` | 11 |
| `SendTTSMessages` | 12 |
| `ManageMessages` | 13 |
| `EmbedLinks` | 14 |
| `AttachFiles` | 15 |
| `ReadMessageHistory` | 16 |
| `MentionEveryone` | 17 |
| `UseExternalEmojis` | 18 |
| `ViewGuildInsights` | 19 |
| `Connect` | 20 |
| `Speak` | 21 |
| `MuteMembers` | 22 |
| `DeafenMembers` | 23 |
| `MoveMembers` | 24 |
| `UseVAD` | 25 |
| `ChangeNickname` | 26 |
| `ManageNicknames` | 27 |
| `ManageRoles` | 28 |
| `ManageWebhooks` | 29 |
| `ManageEmojisAndStickers` | 30 |
| `ManageGuildExpressions` | 31 |
| `UseApplicationCommands` | 32 |
| `RequestToSpeak` | 33 |
| `ManageEvents` | 34 |
| `ManageThreads` | 35 |
| `CreatePublicThreads` | 36 |
| `CreatePrivateThreads` | 37 |
| `UseExternalStickers` | 38 |
| `SendMessagesInThreads` | 39 |
| `UseEmbeddedActivities` | 40 |
| `ModerateMembers` | 41 |
| `ViewCreatorMonetizationAnalytics` | 42 |
| `UseSoundboard` | 43 |
| `CreateGuildExpressions` | 44 |
| `CreateEvents` | 45 |
| `UseExternalSounds` | 46 |
| `SendVoiceMessages` | 47 |
| `SetVoiceChannelStatus` | 48 |
| `SendPolls` | 49 |
| `UseExternalApps` | 50 |
| `PinMessages` | 51 |
| `BypassSlowmode` | 52 |

## Used by

- [`$addChannelPerms`](../functions/channel/$addChannelPerms.md)
- [`$addPermissionOverwrite`](../functions/channel/$addPermissionOverwrite.md)
- [`$addRole`](../functions/role/$addRole.md)
- [`$channelHasAnyPerms`](../functions/channel/$channelHasAnyPerms.md)
- [`$channelHasPerms`](../functions/channel/$channelHasPerms.md)
- [`$channelPermissionsFor`](../functions/channel/$channelPermissionsFor.md)
- [`$channelPermissionsOf`](../functions/channel/$channelPermissionsOf.md)
- [`$deleteChannelPerms`](../functions/channel/$deleteChannelPerms.md)
- [`$hasAnyPerms`](../functions/member/$hasAnyPerms.md)
- [`$hasPerms`](../functions/member/$hasPerms.md)
- [`$memberPerms`](../functions/member/$memberPerms.md)
- [`$modifyChannelPerms`](../functions/channel/$modifyChannelPerms.md)
- [`$removeChannelPerms`](../functions/channel/$removeChannelPerms.md)
- [`$roleHasAnyPerms`](../functions/role/$roleHasAnyPerms.md)
- [`$roleHasPerms`](../functions/role/$roleHasPerms.md)
- [`$rolePerms`](../functions/role/$rolePerms.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
