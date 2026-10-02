# $addOption

> Adds a select menu option

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `component` | v1.0.0 | required | yes | — |

## Signature

```fs
$addOption[name;description;value;emoji;default]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The option name |
| 2 | `description` | `String` | no | no | The description for this option |
| 3 | `value` | `String` | **yes** | no | The value to use for this option |
| 4 | `emoji` | `String` | no | no | The emoji to use for this option |
| 5 | `default` | `Boolean` | no | no | Whether to set this option as default |

### Per-parameter notes

- **`name`** (`String`, required): The option name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`description`** (`String`, optional): The description for this option. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`value`** (`String`, required): The value to use for this option. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`emoji`** (`String`, optional): The emoji to use for this option. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`default`** (`Boolean`, optional): Whether to set this option as default. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Component functions build Discord UI components — buttons, select menus, text inputs, checkboxes, files, sections, media galleries, action rows — usually assembled into `$addActionRow[...]` chains and consumed by `$awaitComponent`-style interactions.

`$addOption` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$addOption[name;value]
```

**Full form (all arguments)**

```fs
$addOption[name;value;value;:smile:;true]
```

## Reference implementation (source)

Taken from `src/native/component/addOption.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const menu = getLastComponent(ctx)

        if (menu instanceof BaseSelectMenuBuilder && "addOptions" in menu) {
            const data: APISelectMenuOption = {
                label: name,
                description: desc || undefined,
                value,
                default: def || false,
                emoji: emoji
                    ? (parseEmoji(emoji) as APISelectMenuOption["emoji"]) ?? {
                        name: emoji,
                    }
                    : undefined,
            }

            menu.addOptions(data)
        }

        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`description`, `emoji`, `default`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/component/addOption.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/component/addOption.ts)

## Attachment quirk (live-verified 2026-10-01)

`$addOption` attaches to `getLastComponent()` — which returns the **FIRST component of the current action row** (`actionRow.components[0]`), not the most recently added one. Consequences:

- A select menu must be the **first component in its own action row**. If buttons precede the menu in the same row, options attach to the leading button (not a `BaseSelectMenuBuilder`) and are **silently dropped** — the menu ships with `options: []`, which Discord rejects (`BASE_TYPE_BAD_LENGTH`) or renders empty.
- Safe pattern: `$addActionRow` → `$addStringSelectMenu[...]` → all `$addOption[...]` calls → `$addActionRow` again for the buttons.

Bare `$arrayLoad[name]` (no separator/content args) is the documented way to create a truly EMPTY array; `$arrayLoad[name;]` risks a phantom `[""]` element that inflates counts and leaks into `checkContains` CSV padding.
