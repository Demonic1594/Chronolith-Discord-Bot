# ScheduledEventProperty

Enum defined by **ForgeScript** with `17` values.

## Values

| Value | Index |
|---|---|
| `id` | 0 |
| `userID` | 1 |
| `guildID` | 2 |
| `channelID` | 3 |
| `name` | 4 |
| `userCount` | 5 |
| `description` | 6 |
| `startTimestamp` | 7 |
| `endTimestamp` | 8 |
| `timestamp` | 9 |
| `url` | 10 |
| `cover` | 11 |
| `entityID` | 12 |
| `location` | 13 |
| `entityType` | 14 |
| `privacyLevel` | 15 |
| `status` | 16 |

## Used by

- [`$getScheduledEvent`](../functions/event/$getScheduledEvent.md)
- [`$guildScheduledEvents`](../functions/guild/$guildScheduledEvents.md)
- [`$newScheduledEvent`](../functions/state/$newScheduledEvent.md)
- [`$oldScheduledEvent`](../functions/state/$oldScheduledEvent.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
