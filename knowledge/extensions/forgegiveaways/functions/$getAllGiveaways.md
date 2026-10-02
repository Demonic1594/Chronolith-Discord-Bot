# $getAllGiveaways

> Gets all existing giveaways from the database

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeGiveaways | `database` | v1.0.0 | optional | yes | `Json`, `Unknown[]` |

## Signature

```fs
$getAllGiveaways[property;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `property` | `Enum` | **yes** | no | The property of the giveaways to return |
| 2 | `separator` | `String` | no | no | The separator to use for each property |

### Per-parameter notes

- **`property`** (`Enum`, required): The property of the giveaways to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`separator`** (`String`, optional): The separator to use for each property. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$getAllGiveaways` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getAllGiveaways[value]
```

**Full form (all arguments)**

```fs
$getAllGiveaways[value;,]
```

## Reference implementation (source)

Taken from `src/native/database/getAllGiveaways.ts` in the `ForgeGiveaways` repository — this is exactly what runs:

```ts
execute(...) {
        const giveaways = await Database.getAll()
        if (prop) return this.success(giveaways.map((x) => GiveawayProperties[prop](x, sep)).join(sep ?? ", "))
        return this.successJSON(giveaways)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteGiveaway`]($deleteGiveaway.md)
- [`$getGiveaway`]($getGiveaway.md)
- [`$wipeGiveaways`]($wipeGiveaways.md)

**Source:** [`src/native/database/getAllGiveaways.ts`](https://github.com/tryforge/ForgeGiveaways/blob/main/src/native/database/getAllGiveaways.ts)
