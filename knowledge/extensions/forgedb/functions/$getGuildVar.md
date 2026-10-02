# $getGuildVar

> Retrieves the value of a variable associated with a guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `guild` | v2.0.0 | required | yes | `Unknown` |

> aliases: $getServerVar

## Signature

```fs
$getGuildVar[name;guild ID;default]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable to query |
| 2 | `guild ID` | `String` | no | no | The guild ID for which to retrieve the variable value |
| 3 | `default` | `String` | no | no | The default value to return if the identifier doesn't exist in the variable |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable to query. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`guild ID`** (`String`, optional): The guild ID for which to retrieve the variable value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`default`** (`String`, optional): The default value to return if the identifier doesn't exist in the variable. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$getGuildVar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getGuildVar[name]
```

**Full form (all arguments)**

```fs
$getGuildVar[name;123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/functions/guild/getGuildVar.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        const data = await DataBase.get({ name, id: guild ?? ctx.guild!.id, type: "guild" }).then((x) => x?.value)
        if (data === null || data === undefined) {
            if (def) return this.successJSON(def)
            else if (ForgeDB.defaults && name in ForgeDB.defaults) {
                const defData = ForgeDB.defaults[name]
                if (typeof defData === "object" && defData !== null && "functions" in (defData as IExtendedCompilationResult)) {
                    const d = <IExtendedCompilationResult>defData
                    // Run
                    const result = await Interpreter.run(
                        ctx.clone({
                            data: d,
                            allowTopLevelReturn: true,
                            doNotSend: true,
                            redirectErrorsToConsole: true,
                        })
                    )
                    return result === null ? this.stop() : this.successJSON(result)
                } else return this.successJSON(defData)
            }
        }

        return this.successJSON(data)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$getServerVar` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`guild ID`, `default`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteGuildVar`]($deleteGuildVar.md)
- [`$getGuildLeaderboardID`]($getGuildLeaderboardID.md)
- [`$getGuildLeaderboardLength`]($getGuildLeaderboardLength.md)
- [`$getGuildLeaderboardValue`]($getGuildLeaderboardValue.md)
- [`$guildLeaderboard`]($guildLeaderboard.md)
- [`$setGuildVar`]($setGuildVar.md)

**Source:** [`src/functions/guild/getGuildVar.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/guild/getGuildVar.ts)
