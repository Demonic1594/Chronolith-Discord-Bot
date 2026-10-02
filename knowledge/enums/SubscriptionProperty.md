# SubscriptionProperty

Enum defined by **ForgeScript** with `10` values.

## Values

| Value | Index |
|---|---|
| `id` | 0 |
| `userID` | 1 |
| `status` | 2 |
| `country` | 3 |
| `skuIDs` | 4 |
| `renewalSkuIDs` | 5 |
| `entitlementIDs` | 6 |
| `canceledTimestamp` | 7 |
| `periodEndTimestamp` | 8 |
| `periodStartTimestamp` | 9 |

## Used by

- [`$newSubscription`](../functions/state/$newSubscription.md)
- [`$oldSubscription`](../functions/state/$oldSubscription.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
