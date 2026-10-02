# $commandNames

> Return commands with given type

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `command` | v1.0.6 | required | yes | `String[]` |

## Signature

```fs
$commandNames[type;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `type` | `String` | **yes** | no | The command type to pull names from |
| 2 | `separator` | `String` | no | no | The separator to use for every name |

### Per-parameter notes

- **`type`** (`String`, required): The command type to pull names from. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`separator`** (`String`, optional): The separator to use for every name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Command functions inspect the command currently executing (name, count, info) or registered commands.

`$commandNames` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$commandNames[value]
```

**Full form (all arguments)**

```fs
$commandNames[value;,]
```

## Reference implementation (source)

Taken from `src/native/command/commandNames.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            ctx.client.commands
                .get(type as keyof ClientEvents)
                .map((x) => x.name)
                .filter(Boolean)
                .join(sep || ", ")
        )
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$commandCount`]($commandCount.md)
- [`$commandInfo`]($commandInfo.md)
- [`$commandName`]($commandName.md)
- [`$deleteCommand`]($deleteCommand.md)

**Source:** [`src/native/command/commandNames.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/command/commandNames.ts)
