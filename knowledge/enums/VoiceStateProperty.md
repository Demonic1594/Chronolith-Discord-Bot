# VoiceStateProperty

Enum defined by **ForgeScript** with `13` values.

## Values

| Value | Index |
|---|---|
| `channelID` | 0 |
| `guildID` | 1 |
| `authorID` | 2 |
| `deaf` | 3 |
| `selfDeaf` | 4 |
| `guildDeaf` | 5 |
| `muted` | 6 |
| `selfMuted` | 7 |
| `guildMuted` | 8 |
| `timestamp` | 9 |
| `selfVideo` | 10 |
| `streaming` | 11 |
| `suppressed` | 12 |

## Used by

- [`$newState`](../functions/state/$newState.md)
- [`$oldState`](../functions/state/$oldState.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
