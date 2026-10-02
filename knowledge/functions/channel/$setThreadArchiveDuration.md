# $setThreadArchiveDuration

> Sets a thread's auto archive duration

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v1.5.0 | required | yes | `Boolean` |

> aliases: $setThreadAutoArchiveDuration

## Signature

```fs
$setThreadArchiveDuration[channel ID;duration;reason]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The thread to modify |
| 2 | `duration` | `Enum` | **yes** | no | The new duration of auto archive |
| 3 | `reason` | `String` | no | no | The reason for modifying archive duration |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The thread to modify. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`duration`** (`Enum`, required): The new duration of auto archive. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`reason`** (`String`, optional): The reason for modifying archive duration. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$setThreadArchiveDuration` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setThreadArchiveDuration[123456789012345678;value]
```

**Full form (all arguments)**

```fs
$setThreadArchiveDuration[123456789012345678;value;value]
```

## Reference implementation (source)

Taken from `src/native/channel/setThreadArchiveDuration.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(!!(await (ch as ThreadChannel).setAutoArchiveDuration(dur, reason || ctx.reason).catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$setThreadAutoArchiveDuration` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/channel/setThreadArchiveDuration.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/setThreadArchiveDuration.ts)
