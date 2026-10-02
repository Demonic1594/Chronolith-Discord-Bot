# $deleteGiveaway

> Deletes an existing giveaway from the database permanently, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeGiveaways | `database` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$deleteGiveaway[giveaway ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `giveaway ID` | `String` | **yes** | no | The giveaway to delete |

### Per-parameter notes

- **`giveaway ID`** (`String`, required): The giveaway to delete. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$deleteGiveaway` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteGiveaway[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/database/deleteGiveaway.ts` in the `ForgeGiveaways` repository — this is exactly what runs:

```ts
execute(...) {
        const result = await Database.delete(id)
        return this.success(result.affected === 1)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$getAllGiveaways`]($getAllGiveaways.md)
- [`$getGiveaway`]($getGiveaway.md)
- [`$wipeGiveaways`]($wipeGiveaways.md)

**Source:** [`src/native/database/deleteGiveaway.ts`](https://github.com/tryforge/ForgeGiveaways/blob/main/src/native/database/deleteGiveaway.ts)
