# $giveawayID

> Returns the id of the current giveaway

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeGiveaways | `giveaway` | v1.0.0 | none | no | `String` |

## Signature

```fs
$giveawayID
```

## How it works

See the function list below for exact signatures.

`$giveawayID` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$giveawayID
```

## Reference implementation (source)

Taken from `src/native/giveaway/giveawayID.ts` in the `ForgeGiveaways` repository — this is exactly what runs:

```ts
execute(...) {
        const giveaway = ctx.giveaway ?? ctx.extendedStates?.giveaway?.new
        return this.success(giveaway?.id)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$giveawayChannelID`]($giveawayChannelID.md)
- [`$giveawayDuration`]($giveawayDuration.md)
- [`$giveawayEntries`]($giveawayEntries.md)
- [`$giveawayExists`]($giveawayExists.md)
- [`$giveawayGuildID`]($giveawayGuildID.md)
- [`$giveawayHasEnded`]($giveawayHasEnded.md)
- [`$giveawayHostID`]($giveawayHostID.md)
- [`$giveawayMessageID`]($giveawayMessageID.md)

**Source:** [`src/native/giveaway/giveawayID.ts`](https://github.com/tryforge/ForgeGiveaways/blob/main/src/native/giveaway/giveawayID.ts)
