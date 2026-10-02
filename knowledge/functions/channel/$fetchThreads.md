# $fetchThreads

> Caches all threads of a channel

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v2.5.0 | optional | yes | — |

## Signature

```fs
$fetchThreads[channel ID;archived;private]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to cache its threads |
| 2 | `archived` | `Boolean` | no | no | Whether to cache archived threads, otherwise active |
| 3 | `private` | `Boolean` | no | no | Whether to cache archived private threads, otherwise public |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to cache its threads. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`archived`** (`Boolean`, optional): Whether to cache archived threads, otherwise active. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`private`** (`Boolean`, optional): Whether to cache archived private threads, otherwise public. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$fetchThreads` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$fetchThreads[123456789012345678]
```

**Full form (all arguments)**

```fs
$fetchThreads[123456789012345678;true;true]
```

## Reference implementation (source)

Taken from `src/native/channel/fetchThreads.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const chan = channel ?? ctx.channel

        if ("threads" in chan) {
            const threads = chan.threads as ThreadManager
            
            if (archived) await threads.fetchArchived({ type: priv ? "private" : undefined, fetchAll: true }).catch(ctx.noop)
            else await threads.fetchActive().catch(ctx.noop)
        }

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`archived`, `private`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addChannelPerms`]($addChannelPerms.md)
- [`$addPermissionOverwrite`]($addPermissionOverwrite.md)
- [`$addPostTags`]($addPostTags.md)
- [`$addThreadMember`]($addThreadMember.md)
- [`$archiveThread`]($archiveThread.md)
- [`$channelBitrate`]($channelBitrate.md)
- [`$channelCategoryID`]($channelCategoryID.md)
- [`$channelChildrenCount`]($channelChildrenCount.md)

**Source:** [`src/native/channel/fetchThreads.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/fetchThreads.ts)
