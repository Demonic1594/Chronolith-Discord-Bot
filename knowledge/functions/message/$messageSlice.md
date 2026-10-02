# $messageSlice

> Slices this message's args

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `message` | v1.3.0 | required | yes | `String` |

## Signature

```fs
$messageSlice[start;end]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `start` | `Number` | no | no | The start index |
| 2 | `end` | `Number` | no | no | The end index |

### Per-parameter notes

- **`start`** (`Number`, optional): The start index. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`end`** (`Number`, optional): The end index. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$messageSlice` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$messageSlice[5]
```

**Full form (all arguments)**

```fs
$messageSlice[5;5]
```

## Reference implementation (source)

Taken from `src/native/message/messageSlice.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.args.slice(start ?? undefined, end ?? undefined).join(" "))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`start`, `end`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addMessageReactions`]($addMessageReactions.md)
- [`$attachment`]($attachment.md)
- [`$deleteAllMessageReactions`]($deleteAllMessageReactions.md)
- [`$deleteIn`]($deleteIn.md)
- [`$deleteMessage`]($deleteMessage.md)
- [`$deleteUserMessageReaction`]($deleteUserMessageReaction.md)
- [`$editMessage`]($editMessage.md)
- [`$fetchComponents`]($fetchComponents.md)

**Source:** [`src/native/message/messageSlice.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/message/messageSlice.ts)
