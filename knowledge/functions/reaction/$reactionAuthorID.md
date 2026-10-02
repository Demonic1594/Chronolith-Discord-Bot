# $reactionAuthorID

> Returns the reaction author id that reacted

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `reaction` | v1.0.0 | none | no | `User` |

## Signature

```fs
$reactionAuthorID
```

## How it works

Reaction functions add/remove/clear reactions and read reaction data.

`$reactionAuthorID` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$reactionAuthorID
```

## Reference implementation (source)

Taken from `src/native/reaction/reactionAuthorID.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.states?.user?.new?.id)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$reactionCount`]($reactionCount.md)
- [`$reactionEmoji`]($reactionEmoji.md)
- [`$reactionEmojiID`]($reactionEmojiID.md)
- [`$reactionMessageID`]($reactionMessageID.md)

**Source:** [`src/native/reaction/reactionAuthorID.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/reaction/reactionAuthorID.ts)
