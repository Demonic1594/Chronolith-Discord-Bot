# $getGiveaway

> Gets an existing giveaway from the database

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeGiveaways | `database` | v1.0.0 | required | yes | `Json`, `Unknown` |

## Signature

```fs
$getGiveaway[giveaway ID;property;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `giveaway ID` | `String` | **yes** | no | The giveaway to get |
| 2 | `property` | `Enum` | no | no | The property of the giveaway to return |
| 3 | `separator` | `String` | no | no | The separator to use in case of array |

### Per-parameter notes

- **`giveaway ID`** (`String`, required): The giveaway to get. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`property`** (`Enum`, optional): The property of the giveaway to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`separator`** (`String`, optional): The separator to use in case of array. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$getGiveaway` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getGiveaway[123456789012345678]
```

**Full form (all arguments)**

```fs
$getGiveaway[123456789012345678;value;,]
```

## Reference implementation (source)

Taken from `src/native/database/getGiveaway.ts` in the `ForgeGiveaways` repository — this is exactly what runs:

```ts
execute(...) {
        const giveaway = await Database.get(id)
        if (!giveaway) return this.success()

        if (prop) return this.success(GiveawayProperties[prop](giveaway, sep))
        return this.successJSON(giveaway)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`property`, `separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteGiveaway`]($deleteGiveaway.md)
- [`$getAllGiveaways`]($getAllGiveaways.md)
- [`$wipeGiveaways`]($wipeGiveaways.md)

**Source:** [`src/native/database/getGiveaway.ts`](https://github.com/tryforge/ForgeGiveaways/blob/main/src/native/database/getGiveaway.ts)
