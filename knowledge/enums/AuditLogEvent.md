# AuditLogEvent

Enum defined by **ForgeScript** with `69` values.

> Discord audit-log action names, mirrored from discord.js (`GuildUpdate`, `MemberKick`, `RoleCreate`, ...). Used as the action filter of audit-log functions.

## Values

| Value | Index |
|---|---|
| `GuildUpdate` | 0 |
| `ChannelCreate` | 1 |
| `ChannelUpdate` | 2 |
| `ChannelDelete` | 3 |
| `ChannelOverwriteCreate` | 4 |
| `ChannelOverwriteUpdate` | 5 |
| `ChannelOverwriteDelete` | 6 |
| `MemberKick` | 7 |
| `MemberPrune` | 8 |
| `MemberBanAdd` | 9 |
| `MemberBanRemove` | 10 |
| `MemberUpdate` | 11 |
| `MemberRoleUpdate` | 12 |
| `MemberMove` | 13 |
| `MemberDisconnect` | 14 |
| `BotAdd` | 15 |
| `RoleCreate` | 16 |
| `RoleUpdate` | 17 |
| `RoleDelete` | 18 |
| `InviteCreate` | 19 |
| `InviteUpdate` | 20 |
| `InviteDelete` | 21 |
| `WebhookCreate` | 22 |
| `WebhookUpdate` | 23 |
| `WebhookDelete` | 24 |
| `EmojiCreate` | 25 |
| `EmojiUpdate` | 26 |
| `EmojiDelete` | 27 |
| `MessageDelete` | 28 |
| `MessageBulkDelete` | 29 |
| `MessagePin` | 30 |
| `MessageUnpin` | 31 |
| `IntegrationCreate` | 32 |
| `IntegrationUpdate` | 33 |
| `IntegrationDelete` | 34 |
| `StageInstanceCreate` | 35 |
| `StageInstanceUpdate` | 36 |
| `StageInstanceDelete` | 37 |
| `StickerCreate` | 38 |
| `StickerUpdate` | 39 |
| `StickerDelete` | 40 |
| `GuildScheduledEventCreate` | 41 |
| `GuildScheduledEventUpdate` | 42 |
| `GuildScheduledEventDelete` | 43 |
| `ThreadCreate` | 44 |
| `ThreadUpdate` | 45 |
| `ThreadDelete` | 46 |
| `ApplicationCommandPermissionUpdate` | 47 |
| `SoundboardSoundCreate` | 48 |
| `SoundboardSoundUpdate` | 49 |
| `SoundboardSoundDelete` | 50 |
| `AutoModerationRuleCreate` | 51 |
| `AutoModerationRuleUpdate` | 52 |
| `AutoModerationRuleDelete` | 53 |
| `AutoModerationBlockMessage` | 54 |
| `AutoModerationFlagToChannel` | 55 |
| `AutoModerationUserCommunicationDisabled` | 56 |
| `AutoModerationQuarantineUser` | 57 |
| `CreatorMonetizationRequestCreated` | 58 |
| `CreatorMonetizationTermsAccepted` | 59 |
| `OnboardingPromptCreate` | 60 |
| `OnboardingPromptUpdate` | 61 |
| `OnboardingPromptDelete` | 62 |
| `OnboardingCreate` | 63 |
| `OnboardingUpdate` | 64 |
| `HomeSettingsCreate` | 65 |
| `HomeSettingsUpdate` | 66 |
| `VoiceChannelStatusCreate` | 67 |
| `VoiceChannelStatusDelete` | 68 |

## Used by

- [`$fetchAuditLog`](../functions/audit/$fetchAuditLog.md)
- [`$fetchAuditLogCount`](../functions/audit/$fetchAuditLogCount.md)
- [`$fetchUserAuditLog`](../functions/audit/$fetchUserAuditLog.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
