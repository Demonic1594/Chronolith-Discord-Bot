# $chalkLog

> Logs styled text to the console using Chalk

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `logging` | v2.3.0 | required | yes | — |

## Signature

```fs
$chalkLog[text;styles]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `text` | `String` | **yes** | no | The text to log |
| 2 | `styles` | `String` | **yes** | yes | The styles to apply to the text |

### Per-parameter notes

- **`text`** (`String`, required): The text to log. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`styles`** (`String` , rest, required): The styles to apply to the text. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Logging functions print to the host console (useful for debugging command code).

`$chalkLog` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `styles` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$chalkLog[Hello!;value]
```

## Reference implementation (source)

Taken from `src/native/logging/chalkLog.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        console.log(applyStyles(text, styles))
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$log`]($log.md)
- [`$logger`]($logger.md)

## Community guides covering this function

- [$chalkLog guide](../../guides/guide-236.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-236)

**Source:** [`src/native/logging/chalkLog.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/logging/chalkLog.ts)
