# ChannelProperty

Enum defined by **ForgeScript** with `22` values.

## Values

| Value | Index |
|---|---|
| `id` | 0 |
| `name` | 1 |
| `type` | 2 |
| `topic` | 3 |
| `bitrate` | 4 |
| `members` | 5 |
| `timestamp` | 6 |
| `url` | 7 |
| `nsfw` | 8 |
| `flags` | 9 |
| `parentID` | 10 |
| `position` | 11 |
| `rawPosition` | 12 |
| `slowmode` | 13 |
| `appliedTags` | 14 |
| `availableTags` | 15 |
| `archived` | 16 |
| `locked` | 17 |
| `deletable` | 18 |
| `manageable` | 19 |
| `lastMessageID` | 20 |
| `lastPinTimestamp` | 21 |

## Used by

- [`$findChannels`](../functions/lookup/$findChannels.md)
- [`$newChannel`](../functions/state/$newChannel.md)
- [`$oldChannel`](../functions/state/$oldChannel.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
