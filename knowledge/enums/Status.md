# Status

Enum defined by **ForgeScript** with `9` values.

> Presence statuses used by `$setPresence`-style functions: `online`, `idle`, `dnd`, `invisible`, ...

## Values

| Value | Index |
|---|---|
| `Ready` | 0 |
| `Connecting` | 1 |
| `Reconnecting` | 2 |
| `Idle` | 3 |
| `Nearly` | 4 |
| `Disconnected` | 5 |
| `WaitingForGuilds` | 6 |
| `Identifying` | 7 |
| `Resuming` | 8 |

## Used by

- [`$shardStatus`](../functions/bot/$shardStatus.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
