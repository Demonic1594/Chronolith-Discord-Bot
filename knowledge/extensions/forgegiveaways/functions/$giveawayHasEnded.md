# $giveawayHasEnded

> Returns whether a giveaway has ended

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeGiveaways | `giveaway` | v1.0.0 | optional | yes | `Boolean` |

## Signature

```fs
$giveawayHasEnded[giveaway ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `giveaway ID` | `String` | **yes** | no | The giveaway to pull data from |

### Per-parameter notes

- **`giveaway ID`** (`String`, required): The giveaway to pull data from. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$giveawayHasEnded` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$giveawayHasEnded[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/giveaway/giveawayHasEnded.ts` in the `ForgeGiveaways` repository — this is exactly what runs:

```ts
execute(...) {
        const giveaway = await pullGiveaway(ctx, id)
        return this.success(giveaway?.hasEnded)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$giveawayChannelID`]($giveawayChannelID.md)
- [`$giveawayDuration`]($giveawayDuration.md)
- [`$giveawayEntries`]($giveawayEntries.md)
- [`$giveawayExists`]($giveawayExists.md)
- [`$giveawayGuildID`]($giveawayGuildID.md)
- [`$giveawayHostID`]($giveawayHostID.md)
- [`$giveawayID`]($giveawayID.md)
- [`$giveawayMessageID`]($giveawayMessageID.md)

**Source:** [`src/native/giveaway/giveawayHasEnded.ts`](https://github.com/tryforge/ForgeGiveaways/blob/main/src/native/giveaway/giveawayHasEnded.ts)
