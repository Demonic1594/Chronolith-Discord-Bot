# $setChannelSlowmode

> Sets a channel slowmode, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$setChannelSlowmode[channel ID;seconds]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to set its nsfw state |
| 2 | `seconds` | `Number` | no | no | The number of seconds per message |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to set its nsfw state. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`seconds`** (`Number`, optional): The number of seconds per message. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$setChannelSlowmode` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setChannelSlowmode[123456789012345678]
```

**Full form (all arguments)**

```fs
$setChannelSlowmode[123456789012345678;5]
```

## Reference implementation (source)

Taken from `src/native/channel/setChannelSlowmode.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(!!(await (channel as TextChannel).setRateLimitPerUser(seconds || 0, ctx.reason).catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`seconds`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addChannelPerms`]($addChannelPerms.md)
- [`$addPermissionOverwrite`]($addPermissionOverwrite.md)
- [`$addPostTags`]($addPostTags.md)
- [`$addThreadMember`]($addThreadMember.md)
- [`$archiveThread`]($archiveThread.md)
- [`$channelBitrate`]($channelBitrate.md)
- [`$channelCategoryID`]($channelCategoryID.md)
- [`$channelChildrenCount`]($channelChildrenCount.md)

**Source:** [`src/native/channel/setChannelSlowmode.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/setChannelSlowmode.ts)
