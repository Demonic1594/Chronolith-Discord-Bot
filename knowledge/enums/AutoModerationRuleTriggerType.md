# AutoModerationRuleTriggerType

Enum defined by **ForgeScript** with `5` values.

> What causes an automod rule to trigger (keyword, keyword preset, mention spam, ...).

## Values

| Value | Index |
|---|---|
| `Keyword` | 0 |
| `Spam` | 1 |
| `KeywordPreset` | 2 |
| `MentionSpam` | 3 |
| `MemberProfile` | 4 |

## Used by

- [`$automodRuleTriggerType`](../functions/automod/$automodRuleTriggerType.md)
- [`$createAutomodRule`](../functions/automod/$createAutomodRule.md)

## Usage

Enum arguments must receive one of the exact values above (case matters). Depending on the underlying implementation, some functions also accept the numeric index.
