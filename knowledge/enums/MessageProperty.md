# MessageProperty

Enum defined by **ForgeScript** with `28` values.

## Values

| Value | Index |
|---|---|
| `id` | 0 |
| `content` | 1 |
| `type` | 2 |
| `flags` | 3 |
| `username` | 4 |
| `authorID` | 5 |
| `channelID` | 6 |
| `threadID` | 7 |
| `guildID` | 8 |
| `webhookID` | 9 |
| `interactionID` | 10 |
| `interactionType` | 11 |
| `timestamp` | 12 |
| `editTimestamp` | 13 |
| `hasSnapshots` | 14 |
| `hasThread` | 15 |
| `hasPoll` | 16 |
| `system` | 17 |
| `pinned` | 18 |
| `tts` | 19 |
| `url` | 20 |
| `attachments` | 21 |
| `stickers` | 22 |
| `embeds` | 23 |
| `crosspostable` | 24 |
| `deletable` | 25 |
| `editable` | 26 |
| `pinnable` | 27 |

## Used by

- [`$getMessage`](../functions/message/$getMessage.md)
- [`$getSnapshots`](../functions/message/$getSnapshots.md)
- [`$newMessage`](../functions/state/$newMessage.md)
- [`$oldMessage`](../functions/state/$oldMessage.md)
- [`$targetMessage`](../functions/interaction/$targetMessage.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
