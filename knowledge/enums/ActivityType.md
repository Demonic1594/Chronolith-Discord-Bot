# ActivityType

Enum defined by **ForgeScript** with `6` values.

> Discord presence activity kinds: `Playing`/`Streaming`/`Listening`/`Watching`/`Competing` map to discord.js `ActivityType` values; `Custom` is the custom status type.

## Values

| Value | Index |
|---|---|
| `Playing` | 0 |
| `Streaming` | 1 |
| `Listening` | 2 |
| `Watching` | 3 |
| `Custom` | 4 |
| `Competing` | 5 |

## Used by

- [`$memberCustomStatus`](../functions/member/$memberCustomStatus.md)
- [`$setStatus`](../functions/bot/$setStatus.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
