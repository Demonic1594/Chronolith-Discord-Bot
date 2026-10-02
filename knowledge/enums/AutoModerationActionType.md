# AutoModerationActionType

Enum defined by **ForgeScript** with `4` values.

> What an automod rule does when triggered (block message, send alert message, timeout user).

## Values

| Value | Index |
|---|---|
| `BlockMessage` | 0 |
| `SendAlertMessage` | 1 |
| `Timeout` | 2 |
| `BlockMemberInteraction` | 3 |

## Used by

- [`$automodActionType`](../functions/automod/$automodActionType.md)
- [`$setAutomodAction`](../functions/automod/$setAutomodAction.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
