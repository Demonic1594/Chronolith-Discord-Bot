# $commandCount

> Returns the command count

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `command` | v1.0.0 | optional | yes | `Number` |

## Signature

```fs
$commandCount[categories]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `categories` | `String` | **yes** | yes | The event types to filter by |

### Per-parameter notes

- **`categories`** (`String` , rest, required): The event types to filter by. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Command functions inspect the command currently executing (name, count, info) or registered commands.

`$commandCount` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `categories` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$commandCount[value]
```

## Reference implementation (source)

Taken from `src/native/command/commandCount.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            this.hasFields
                ? ctx.client.commands["commands"]
                    .filter((_, key) => categories.includes(key))
                    .reduce((x, y) => x + y.length, 0)
                : ctx.client.commands["commands"].reduce((x, y) => x + y.length, 0)
        )
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$commandInfo`]($commandInfo.md)
- [`$commandName`]($commandName.md)
- [`$commandNames`]($commandNames.md)
- [`$deleteCommand`]($deleteCommand.md)

**Source:** [`src/native/command/commandCount.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/command/commandCount.ts)
