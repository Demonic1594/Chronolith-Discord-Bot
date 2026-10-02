# MessageType

Enum defined by **ForgeScript** with `38` values.

## Values

| Value | Index |
|---|---|
| `Default` | 0 |
| `RecipientAdd` | 1 |
| `RecipientRemove` | 2 |
| `Call` | 3 |
| `ChannelNameChange` | 4 |
| `ChannelIconChange` | 5 |
| `ChannelPinnedMessage` | 6 |
| `UserJoin` | 7 |
| `GuildBoost` | 8 |
| `GuildBoostTier1` | 9 |
| `GuildBoostTier2` | 10 |
| `GuildBoostTier3` | 11 |
| `ChannelFollowAdd` | 12 |
| `GuildDiscoveryDisqualified` | 13 |
| `GuildDiscoveryRequalified` | 14 |
| `GuildDiscoveryGracePeriodInitialWarning` | 15 |
| `GuildDiscoveryGracePeriodFinalWarning` | 16 |
| `ThreadCreated` | 17 |
| `Reply` | 18 |
| `ChatInputCommand` | 19 |
| `ThreadStarterMessage` | 20 |
| `GuildInviteReminder` | 21 |
| `ContextMenuCommand` | 22 |
| `AutoModerationAction` | 23 |
| `RoleSubscriptionPurchase` | 24 |
| `InteractionPremiumUpsell` | 25 |
| `StageStart` | 26 |
| `StageEnd` | 27 |
| `StageSpeaker` | 28 |
| `StageRaiseHand` | 29 |
| `StageTopic` | 30 |
| `GuildApplicationPremiumSubscription` | 31 |
| `GuildIncidentAlertModeEnabled` | 32 |
| `GuildIncidentAlertModeDisabled` | 33 |
| `GuildIncidentReportRaid` | 34 |
| `GuildIncidentReportFalseAlarm` | 35 |
| `PurchaseNotification` | 36 |
| `PollResult` | 37 |

## Used by

- [`$messageType`](../functions/message/$messageType.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
