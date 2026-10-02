# $commandName

> Returns the current command name

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `command` | v1.0.3 | none | no | `String` |

## Signature

```fs
$commandName
```

## How it works

Command functions inspect the command currently executing (name, count, info) or registered commands.

`$commandName` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$commandName
```

## Reference implementation (source)

Taken from `src/native/command/commandName.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            ctx.runtime.command?.name ?? (ctx.obj && "commandName" in ctx.obj ? ctx.obj.commandName : undefined)
        )
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$commandCount`]($commandCount.md)
- [`$commandInfo`]($commandInfo.md)
- [`$commandNames`]($commandNames.md)
- [`$deleteCommand`]($deleteCommand.md)

**Source:** [`src/native/command/commandName.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/command/commandName.ts)
