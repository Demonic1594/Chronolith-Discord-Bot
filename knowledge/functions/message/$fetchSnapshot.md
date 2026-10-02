# $fetchSnapshot

> Fetches all data from a message snapshot and loads it to the next response

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `message` | v2.7.0 | optional | yes | — |

## Signature

```fs
$fetchSnapshot[channel ID;message ID;index]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `TextChannel` | **yes** | no | The channel to pull message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to fetch its data |
| 3 | `index` | `Number` | no | no | The index of the snapshot to fetch, defaults to 0 |

### Per-parameter notes

- **`channel ID`** (`TextChannel`, required): The channel to pull message from. Expects a textable channel ID. Same snowflake rules as Channel, but the channel must support messages (`.messages` present), otherwise rejected.
- **`message ID`** (`Message`, required): The message to fetch its data. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`index`** (`Number`, optional): The index of the snapshot to fetch, defaults to 0. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$fetchSnapshot` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$fetchSnapshot[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$fetchSnapshot[123456789012345678;123456789012345678;5]
```

## Reference implementation (source)

Taken from `src/native/message/fetchSnapshot.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const snapshot = (message ?? ctx.message)?.messageSnapshots.at(index || 0)
        if (snapshot) {
            ctx.container.content = snapshot.content
            ctx.container.embeds.push(...snapshot.embeds.map(x => EmbedBuilder.from(x)))
            ctx.container.components.push(...snapshot.components.map(x => buildComponent(x, ctx)))
            ctx.container.files.push(...snapshot.attachments.map(x => new AttachmentBuilder(x.url, { name: x.name })))
            ctx.container.stickers.push(...snapshot.stickers.map(x => x.id))
        }
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`index`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addMessageReactions`]($addMessageReactions.md)
- [`$attachment`]($attachment.md)
- [`$deleteAllMessageReactions`]($deleteAllMessageReactions.md)
- [`$deleteIn`]($deleteIn.md)
- [`$deleteMessage`]($deleteMessage.md)
- [`$deleteUserMessageReaction`]($deleteUserMessageReaction.md)
- [`$editMessage`]($editMessage.md)
- [`$fetchComponents`]($fetchComponents.md)

**Source:** [`src/native/message/fetchSnapshot.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/message/fetchSnapshot.ts)
