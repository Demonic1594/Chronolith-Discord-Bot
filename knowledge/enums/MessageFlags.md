# MessageFlags

Enum defined by **ForgeScript** with `14` values.

## Values

| Value | Index |
|---|---|
| `Crossposted` | 0 |
| `IsCrosspost` | 1 |
| `SuppressEmbeds` | 2 |
| `SourceMessageDeleted` | 3 |
| `Urgent` | 4 |
| `HasThread` | 5 |
| `Ephemeral` | 6 |
| `Loading` | 7 |
| `FailedToMentionSomeRolesInThread` | 8 |
| `ShouldShowLinkNotDiscordWarning` | 9 |
| `SuppressNotifications` | 10 |
| `IsVoiceMessage` | 11 |
| `HasSnapshot` | 12 |
| `IsComponentsV2` | 13 |

## Used by

- [`$defer`](../functions/interaction/$defer.md)
- [`$getComponents`](../functions/message/$getComponents.md)
- [`$messageFlags`](../functions/message/$messageFlags.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
