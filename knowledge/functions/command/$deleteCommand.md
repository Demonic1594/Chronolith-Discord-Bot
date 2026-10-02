# $deleteCommand

> Deletes the author's message

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `command` | v1.2.0 | none | no | — |

## Signature

```fs
$deleteCommand
```

## How it works

Command functions inspect the command currently executing (name, count, info) or registered commands.

`$deleteCommand` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$deleteCommand
```

## Reference implementation (source)

Taken from `src/native/command/deleteCommand.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        await ctx.message?.delete().catch(ctx.noop)
        return this.success()
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
- [`$commandName`]($commandName.md)
- [`$commandNames`]($commandNames.md)

**Source:** [`src/native/command/deleteCommand.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/command/deleteCommand.ts)
