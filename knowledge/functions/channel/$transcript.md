# $transcript

> Creates a channel transcript

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v1.4.0 | required | no | `String[]` |

> aliases: $channelTranscript, $createTranscript

## Signature

```fs
$transcript[channel ID;variable;code;separator;full]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `TextChannel` | **yes** | no | The channel to create transcript of |
| 2 | `variable` | `String` | **yes** | no | The $env variable name to load the message id to |
| 3 | `code` | `String` | **yes** | no | The code to use for every message, make sure to use $return |
| 4 | `separator` | `String` | no | no | The separator to use for every result |
| 5 | `full` | `Boolean` | no | no | Whether to load entire message object to the variable |

### Per-parameter notes

- **`channel ID`** (`TextChannel`, required): The channel to create transcript of. Expects a textable channel ID. Same snowflake rules as Channel, but the channel must support messages (`.messages` present), otherwise rejected.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`variable`** (`String`, required): The $env variable name to load the message id to. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`code`** (`String`, required): The code to use for every message, make sure to use $return. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`separator`** (`String`, optional): The separator to use for every result. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`full`** (`Boolean`, optional): Whether to load entire message object to the variable. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$transcript` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$transcript[123456789012345678;value;code]
```

**Full form (all arguments)**

```fs
$transcript[123456789012345678;value;code;,;true]
```

## Reference implementation (source)

Taken from `src/native/channel/transcript.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3, 4)
        if (!this["isValidReturnType"](rt)) return rt

        const [channel, varName, sep, full] = args
        const code = this.data.fields![2] as IExtendedCompiledFunctionField

        const msgs = await fetchAllMessages(channel)
        const results = new Array<string>()

        for (let i = 0, len = msgs.length; i < len; i++) {
            const msg = msgs[i]
            ctx.setEnvironmentKey(varName, full ? msg : msg.id)
            const resolved = await this["resolveCode"](ctx, code)
            if (resolved.return) results.push(resolved.value as string)
            else if (!this["isValidReturnType"](resolved)) return resolved
        }

        return this.success(results.join(sep ?? ", "))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$channelTranscript`, `$createTranscript` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
4. Optional arguments (`separator`, `full`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
5. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
6. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
7. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
8. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addChannelPerms`]($addChannelPerms.md)
- [`$addPermissionOverwrite`]($addPermissionOverwrite.md)
- [`$addPostTags`]($addPostTags.md)
- [`$addThreadMember`]($addThreadMember.md)
- [`$archiveThread`]($archiveThread.md)
- [`$channelBitrate`]($channelBitrate.md)
- [`$channelCategoryID`]($channelCategoryID.md)
- [`$channelChildrenCount`]($channelChildrenCount.md)

**Source:** [`src/native/channel/transcript.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/transcript.ts)
