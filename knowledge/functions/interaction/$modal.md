# $modal

> Creates a modal

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `interaction` | v1.0.0 | required | yes | — |

## Signature

```fs
$modal[custom ID;title]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `custom ID` | `String` | **yes** | no | The custom id for this modal |
| 2 | `title` | `String` | **yes** | no | The title for the modal |

### Per-parameter notes

- **`custom ID`** (`String`, required): The custom id for this modal. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`title`** (`String`, required): The title for the modal. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Interaction functions handle slash commands, context menus, buttons, select menus and modals — replying, deferring, updating, reading options and raw data.

`$modal` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$modal[123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/native/interaction/modal.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (ctx.interaction) ctx.container.modal = new ModalBuilder().setCustomId(id).setTitle(title)

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$applicationCommandDescription`]($applicationCommandDescription.md)
- [`$applicationCommandDisplay`]($applicationCommandDisplay.md)
- [`$applicationCommandID`]($applicationCommandID.md)
- [`$applicationCommandName`]($applicationCommandName.md)
- [`$applicationCommandOptions`]($applicationCommandOptions.md)
- [`$applicationSubCommandGroupName`]($applicationSubCommandGroupName.md)
- [`$applicationSubCommandName`]($applicationSubCommandName.md)
- [`$authorizingIntegrationOwners`]($authorizingIntegrationOwners.md)

## Community guides covering this function

- [$modal guide](../../guides/guide-281.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-281)

**Source:** [`src/native/interaction/modal.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/interaction/modal.ts)
