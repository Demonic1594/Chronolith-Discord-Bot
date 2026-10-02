# AutomodRuleProperty

Enum defined by **ForgeScript** with `16` values.

## Values

| Value | Index |
|---|---|
| `id` | 0 |
| `name` | 1 |
| `authorID` | 2 |
| `enabled` | 3 |
| `eventType` | 4 |
| `triggerType` | 5 |
| `triggerMetadata` | 6 |
| `exemptRoles` | 7 |
| `exemptChannels` | 8 |
| `actions` | 9 |
| `keywordFilter` | 10 |
| `regexPatterns` | 11 |
| `presets` | 12 |
| `allowList` | 13 |
| `mentionTotalLimit` | 14 |
| `mentionRaidProtectionEnabled` | 15 |

## Used by

- [`$getAutomodRule`](../functions/automod/$getAutomodRule.md)
- [`$guildAutomodRules`](../functions/guild/$guildAutomodRules.md)
- [`$newAutomodRule`](../functions/state/$newAutomodRule.md)
- [`$oldAutomodRule`](../functions/state/$oldAutomodRule.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
