# $addThumbnail

> Adds a new thumbnail accessory

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v2.4.0 | required | yes | — |

## Signature

```fs
$addThumbnail[url;description;spoiler]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `url` | `String` | **yes** | no | The url for the thumbnail |
| 2 | `description` | `String` | no | no | The description of the thumbnail |
| 3 | `spoiler` | `Boolean` | no | no | Whether to set a spoiler |

### Per-parameter notes

- **`url`** (`String`, required): The url for the thumbnail. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`description`** (`String`, optional): The description of the thumbnail. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`spoiler`** (`Boolean`, optional): Whether to set a spoiler. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addThumbnail` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$addThumbnail[https://example.com]
```

**Full form (all arguments)**

```fs
$addThumbnail[https://example.com;value;true]
```

## Reference implementation (source)

Taken from `src/native/component/addThumbnail.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const thumbnail = new ThumbnailBuilder().setURL(url).setSpoiler(!!spoiler)

        if (desc) thumbnail.setDescription(desc)
        ctx.component.section?.setThumbnailAccessory(thumbnail)

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`description`, `spoiler`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addActionRow`]($addActionRow.md)
- [`$addActionRowTo`]($addActionRowTo.md)
- [`$addButton`]($addButton.md)
- [`$addButtonTo`]($addButtonTo.md)
- [`$addChannelSelectMenu`]($addChannelSelectMenu.md)
- [`$addChannelSelectMenuTo`]($addChannelSelectMenuTo.md)
- [`$addChannelType`]($addChannelType.md)
- [`$addCheckbox`]($addCheckbox.md)

**Source:** [`src/native/component/addThumbnail.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addThumbnail.ts)
