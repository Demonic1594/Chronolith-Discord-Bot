# InviteProperty

Enum defined by **ForgeScript** with `17` values.

## Values

| Value | Index |
|---|---|
| `authorID` | 0 |
| `channelID` | 1 |
| `guildID` | 2 |
| `uses` | 3 |
| `maxUses` | 4 |
| `maxAge` | 5 |
| `timestamp` | 6 |
| `code` | 7 |
| `url` | 8 |
| `type` | 9 |
| `expiresTimestamp` | 10 |
| `temporary` | 11 |
| `deletable` | 12 |
| `memberCount` | 13 |
| `presenceCount` | 14 |
| `targetType` | 15 |
| `targetUser` | 16 |

## Used by

- [`$getGuildInvite`](../functions/guild/$getGuildInvite.md)
- [`$getInvite`](../functions/invite/$getInvite.md)
- [`$guildInvites`](../functions/guild/$guildInvites.md)
- [`$newInvite`](../functions/state/$newInvite.md)
- [`$oldInvite`](../functions/state/$oldInvite.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
