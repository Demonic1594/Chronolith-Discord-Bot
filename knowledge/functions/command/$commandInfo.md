# $commandInfo

> Retrieves command info

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `command` | v1.0.3 | required | yes | `Unknown` |

## Signature

```fs
$commandInfo[type;name;property]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `type` | `String` | **yes** | no | The command type |
| 2 | `name` | `String` | **yes** | no | The command name |
| 3 | `property` | `String` | no | yes | The property to retrieve |

### Per-parameter notes

- **`type`** (`String`, required): The command type. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`name`** (`String`, required): The command name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`property`** (`String` , rest, optional): The property to retrieve. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Command functions inspect the command currently executing (name, count, info) or registered commands.

`$commandInfo` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `property` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$commandInfo[value;name]
```

**Full form (all arguments)**

```fs
$commandInfo[value;name;value]
```

## Reference implementation (source)

Taken from `src/native/command/commandInfo.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const cmd = ctx.client.commands.get(type as keyof ClientEvents, (x) => x.name === name || !!x.data.aliases?.includes(name))[0]
        if (!cmd) return this.success()    
        return this.successJSON(Context.traverseGetValue(cmd.data, ...props))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$commandCount`]($commandCount.md)
- [`$commandName`]($commandName.md)
- [`$commandNames`]($commandNames.md)
- [`$deleteCommand`]($deleteCommand.md)

**Source:** [`src/native/command/commandInfo.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/command/commandInfo.ts)
