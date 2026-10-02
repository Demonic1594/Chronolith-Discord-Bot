# AuditProperty

Enum defined by **ForgeScript** with `10` values.

## Values

| Value | Index |
|---|---|
| `id` | 0 |
| `targetID` | 1 |
| `timestamp` | 2 |
| `reason` | 3 |
| `executorID` | 4 |
| `actionType` | 5 |
| `targetType` | 6 |
| `action` | 7 |
| `changes` | 8 |
| `extra` | 9 |

## Used by

- [`$auditLog`](../functions/state/$auditLog.md)
- [`$fetchAuditLog`](../functions/audit/$fetchAuditLog.md)
- [`$fetchAuditLogCount`](../functions/audit/$fetchAuditLogCount.md)
- [`$fetchUserAuditLog`](../functions/audit/$fetchUserAuditLog.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
