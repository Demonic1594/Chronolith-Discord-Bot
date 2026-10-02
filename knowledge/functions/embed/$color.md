# $color

> Adds an embed color

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `embed` | v1.0.0 | required | yes | — |

## Signature

```fs
$color[color;index]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `color` | `Color` | **yes** | no | The color for the embed |
| 2 | `index` | `Number` | no | no | The index to add this data to |

### Per-parameter notes

- **`color`** (`Color`, required): The color for the embed. Expects a color. Accepts hex (`#5865F2` or `5865F2`), integer (`4455093`), and known color names via `resolveColor`.
- **`index`** (`Number`, optional): The index to add this data to. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Embed functions mutate the message's embed container in-place: `$title`, `$description`, `$addField`, `$color`, `$author`, `$footer`, `$image`, `$thumbnail`, `$timestamp`. They take an optional index to target a specific embed.

`$color` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$color[#5865F2]
```

**Full form (all arguments)**

```fs
$color[#5865F2;5]
```

## Reference implementation (source)

Taken from `src/native/embed/color.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.container.embed(index ?? 0).setColor(color || null)
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`index`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.
5. VERIFIED (2.7.1): hex values that are valid JS scientific notation (digits-E-digits, e.g. 4E5058) hit the resolver numeric pre-check and become Infinity — ColorConvert throws and the command dies. Prefix such hexes with # ($color[#4E5058]).

## Related functions

- [`$addField`]($addField.md)
- [`$author`]($author.md)
- [`$deleteField`]($deleteField.md)
- [`$description`]($description.md)
- [`$editField`]($editField.md)
- [`$footer`]($footer.md)
- [`$image`]($image.md)
- [`$thumbnail`]($thumbnail.md)

**Source:** [`src/native/embed/color.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/embed/color.ts)

## Color string parsing traps (live-verified 2026-10-01)

The resolver runs a numeric pre-check (`Number(x)`) before hex parsing. Two failure modes:

- **Digits-only strings parse as DECIMAL.** `$color[248046]` is the integer 248046 (a dark blue/cyan), NOT hex green. This does not error — it silently paints the wrong color. Always write the `#`: `$color[#248046]`.
- **Hex that looks like scientific notation CRASHES.** `4E5058` → `Number("4E5058")` = `Infinity` → `ColorConvert: Unable to convert Infinity`. Any `<digits>E<digits>` shape is affected; the `#` prefix routes it to hex parsing and fixes it. (`F23F24`, `5865F2`, `F0B232` are immune — their letters sit where `Number()` refuses them.)

Repo rule that fell out of this: every color literal is `#`-prefixed, including colors produced inside `$if[...]` chains (a bare `248046` mid-chain is just as decimal).
