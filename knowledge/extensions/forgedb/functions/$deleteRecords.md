# $deleteRecords

> Deletes variables associated with your inputs.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `advanced` | v2.0.8 | required | yes | `Unknown` |

> aliases: $deleteVars, $deleteVariables

## Signature

```fs
$deleteRecords[name;id;type;value;guild ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | no | no | The name of the variable from which you want to delete the value. |
| 2 | `id` | `String` | no | no | The unique identifier of the user, guild, channel, or any other type. |
| 3 | `type` | `Enum` | no | no | The type or category of the variable. |
| 4 | `value` | `String` | no | no | The value associated with the variable. |
| 5 | `guild ID` | `Guild` | no | no | The unique identifier of the guild to which the member, channel, or role belongs. |

### Per-parameter notes

- **`name`** (`String`, optional): The name of the variable from which you want to delete the value.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`id`** (`String`, optional): The unique identifier of the user, guild, channel, or any other type.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`type`** (`Enum`, optional): The type or category of the variable.. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`value`** (`String`, optional): The value associated with the variable.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`guild ID`** (`Guild`, optional): The unique identifier of the guild to which the member, channel, or role belongs.. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.

## How it works

See the function list below for exact signatures.

`$deleteRecords` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteRecords[name]
```

**Full form (all arguments)**

```fs
$deleteRecords[name;123456789012345678;value;value;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/advanced/deleteRecords.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        let search = {}

        if (name) search = { ...search, name: Like(name) }
        if (id) search = { ...search, id }
        if (type) search = { ...search, type: VariableType[type]?.toString() }
        if (value) search = { ...search, value: Like(value) }
        if (guild) search = { ...search, guildId: guild.id }

        for (const record of await DataBase.find({ ...search })) {
            await DataBase.delete(record as RecordData)
        }
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$deleteVars`, `$deleteVariables` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`name`, `id`, `type`, `value`, `guild ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
6. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
7. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$dbPing`]($dbPing.md)
- [`$getDB`]($getDB.md)
- [`$searchDB`]($searchDB.md)
- [`$wipeDB`]($wipeDB.md)

**Source:** [`src/functions/advanced/deleteRecords.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/advanced/deleteRecords.ts)
