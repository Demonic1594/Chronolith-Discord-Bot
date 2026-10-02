# $mentionedChannels

> Returns the mentioned channels

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `mention` | v1.0.0 | optional | yes | `Channel[]` |

> aliases: $mentionedChannel

## Signature

```fs
$mentionedChannels[index;return channel]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `index` | `Number` | **yes** | no | The index of the channel |
| 2 | `return channel` | `Boolean` | no | no | Whether to return current channel if not found |

### Per-parameter notes

- **`index`** (`Number`, required): The index of the channel. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`return channel`** (`Boolean`, optional): Whether to return current channel if not found. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Mention functions build mention strings (users, roles, channels, timestamps `<t:...>`).

`$mentionedChannels` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$mentionedChannels[5]
```

**Full form (all arguments)**

```fs
$mentionedChannels[5;true]
```

## Reference implementation (source)

Taken from `src/native/mention/mentionedChannels.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const id: string | undefined = this.hasFields
            ? ctx.message?.mentions.channels.at(i)?.id
            : ctx.message?.mentions.channels.map((x) => x.id).join(", ")

        return this.success(id ?? (rt ? ctx.channel?.id : undefined))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$mentionedChannel` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`return channel`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$disableAllMentions`]($disableAllMentions.md)
- [`$disableEveryoneMention`]($disableEveryoneMention.md)
- [`$disableRoleMentions`]($disableRoleMentions.md)
- [`$disableUserMentions`]($disableUserMentions.md)
- [`$enableAllMentions`]($enableAllMentions.md)
- [`$enableRoleMentions`]($enableRoleMentions.md)
- [`$enableUserMentions`]($enableUserMentions.md)
- [`$isChannelMentioned`]($isChannelMentioned.md)

**Source:** [`src/native/mention/mentionedChannels.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/mention/mentionedChannels.ts)
