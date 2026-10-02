# $interactionReply

> Forces an interaction reply

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `interaction` | v1.0.0 | optional | yes | `Message` |

## Signature

```fs
$interactionReply[content;return message ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `content` | `String` | **yes** | no | The content to use for this response |
| 2 | `return message ID` | `Boolean` | no | no | Whether to fetch and return the message id of the reply |

### Per-parameter notes

- **`content`** (`String`, required): The content to use for this response. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`return message ID`** (`Boolean`, optional): Whether to fetch and return the message id of the reply. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Interaction functions handle slash commands, context menus, buttons, select menus and modals — replying, deferring, updating, reading options and raw data.

`$interactionReply` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Reply to a slash command**

```fs
$interactionReply[Hello from a slash command!]
```

**Ephemeral reply (set the flag first, then reply)**

```fs
$ephemeral$interactionReply[This is only visible to you.]
```

## Reference implementation (source)

Taken from `src/native/interaction/interactionReply.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.container.withResponse = returnMessageID ?? false
        ctx.container.content = content || undefined

        if (!this.hasFields) {
            await ctx.container.send(ctx.obj)
            return this.success()
        }

        const reply = await ctx.container.send<Message<true>>(ctx.obj)
        return this.success(returnMessageID ? reply?.id : undefined)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`return message ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$applicationCommandDescription`]($applicationCommandDescription.md)
- [`$applicationCommandDisplay`]($applicationCommandDisplay.md)
- [`$applicationCommandID`]($applicationCommandID.md)
- [`$applicationCommandName`]($applicationCommandName.md)
- [`$applicationCommandOptions`]($applicationCommandOptions.md)
- [`$applicationSubCommandGroupName`]($applicationSubCommandGroupName.md)
- [`$applicationSubCommandName`]($applicationSubCommandName.md)
- [`$authorizingIntegrationOwners`]($authorizingIntegrationOwners.md)

**Source:** [`src/native/interaction/interactionReply.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/interaction/interactionReply.ts)
