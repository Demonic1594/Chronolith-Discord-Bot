# $logger

> Implements Logger API of ForgeScript

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `logging` | v1.3.0 | required | yes | — |

## Signature

```fs
$logger[log type;text]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `log type` | `Enum` | **yes** | no | The log type |
| 2 | `text` | `String` | **yes** | no | The text to log |

### Per-parameter notes

- **`log type`** (`Enum`, required): The log type. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`text`** (`String`, required): The text to log. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Logging functions print to the host console (useful for debugging command code).

`$logger` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$logger[value;Hello!]
```

## Reference implementation (source)

Taken from `src/native/logging/logger.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        Logger[LogType[type].toLowerCase() as Lowercase<keyof typeof LogType>](value)
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$chalkLog`]($chalkLog.md)
- [`$log`]($log.md)

**Source:** [`src/native/logging/logger.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/logging/logger.ts)
