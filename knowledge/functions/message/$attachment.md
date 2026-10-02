# $attachment

> Adds an attachment to the response

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `message` | v1.0.0 | required | yes | — |

> aliases: $addAttachment

## Signature

```fs
$attachment[path;name;as text;encoding;description;title]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `path` | `String` | **yes** | no | The attachment url or path to file |
| 2 | `name` | `String` | **yes** | no | The name for this attachment, with the extension |
| 3 | `as text` | `Boolean` | no | no | Whether to use url param as text |
| 4 | `encoding` | `String` | no | no | Encoding to use for text, utf-8 default |
| 5 | `description` | `String` | no | no | The description for this attachment |
| 6 | `title` | `String` | no | no | The title for this attachment |

### Per-parameter notes

- **`path`** (`String`, required): The attachment url or path to file. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`name`** (`String`, required): The name for this attachment, with the extension. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`as text`** (`Boolean`, optional): Whether to use url param as text. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`encoding`** (`String`, optional): Encoding to use for text, utf-8 default. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`description`** (`String`, optional): The description for this attachment. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`title`** (`String`, optional): The title for this attachment. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$attachment` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$attachment[value;name]
```

**Full form (all arguments)**

```fs
$attachment[value;name;true;value;value;value]
```

## Reference implementation (source)

Taken from `src/native/message/attachment.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const attachment = new AttachmentBuilder(asText ? Buffer.from(url, enc as BufferEncoding ?? "utf-8") : url, {
            name,
            title: title || undefined,
            description: desc || undefined
        })

        ctx.container.files.push(attachment)
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$addAttachment` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`as text`, `encoding`, `description`, `title`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addMessageReactions`]($addMessageReactions.md)
- [`$deleteAllMessageReactions`]($deleteAllMessageReactions.md)
- [`$deleteIn`]($deleteIn.md)
- [`$deleteMessage`]($deleteMessage.md)
- [`$deleteUserMessageReaction`]($deleteUserMessageReaction.md)
- [`$editMessage`]($editMessage.md)
- [`$fetchComponents`]($fetchComponents.md)
- [`$fetchEmbeds`]($fetchEmbeds.md)

**Source:** [`src/native/message/attachment.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/message/attachment.ts)
