# $channelWebhooks

> Returns all webhooks of a channel

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v2.3.0 | optional | yes | `Json`, `Unknown[]` |

## Signature

```fs
$channelWebhooks[channel ID;property;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to get its webhooks |
| 2 | `property` | `Enum` | no | no | The property to return |
| 3 | `separator` | `String` | no | no | The separator to use for every property |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to get its webhooks. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`property`** (`Enum`, optional): The property to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`separator`** (`String`, optional): The separator to use for every property. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$channelWebhooks` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$channelWebhooks[123456789012345678]
```

**Full form (all arguments)**

```fs
$channelWebhooks[123456789012345678;value;,]
```

## Reference implementation (source)

Taken from `src/native/channel/channelWebhooks.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const webhooks = await ((channel ?? ctx.channel) as BaseGuildTextChannel)?.fetchWebhooks().catch(ctx.noop)
        if (prop && webhooks) return this.success(webhooks.map((x) => WebhookProperties[prop](x)).join(sep ?? ", "))
        return this.successJSON(webhooks)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`property`, `separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/channel/channelWebhooks.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/channelWebhooks.ts)
