# $loadComponents

> Loads components JSON (or array) to the response

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `message` | v1.4.0 | required | yes | — |

> aliases: $loadComponent

## Signature

```fs
$loadComponents[component data]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `component data` | `Json` | **yes** | no | The components object or array of objects to load |

### Per-parameter notes

- **`component data`** (`Json`, required): The components object or array of objects to load. Expects a JSON string. Parsed with ForgeScript's lenient `parseJSON`; invalid JSON is rejected.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$loadComponents` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$loadComponents[{"key":"value"}]
```

## Reference implementation (source)

Taken from `src/native/message/loadComponents.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const components = Array.isArray(json)
            ? Array.isArray(json[0])
                ? json.map((row) => new ActionRowBuilder().addComponents(row?.map((comp: any) => buildActionRow(comp))))
                : isTopLevel(json[0]?.type as ComponentType)
                    ? json.map((comp) => buildComponent(comp, ctx))
                    : new Array(new ActionRowBuilder().addComponents(json?.map((comp) => buildActionRow(comp))))
            : new Array(isTopLevel(json?.type as ComponentType) ? buildComponent(json, ctx) : new ActionRowBuilder().addComponents(buildActionRow(json)))

        ctx.container.components.push(...components)

        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$loadComponent` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
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

**Source:** [`src/native/message/loadComponents.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/message/loadComponents.ts)
