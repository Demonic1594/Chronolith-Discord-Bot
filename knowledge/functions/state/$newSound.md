# $newSound

> Retrieves new data from an event whose context was a soundboard sound instance

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `state` | v2.4.0 | required | yes | `Unknown` |

## Signature

```fs
$newSound[property;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `property` | `Enum` | **yes** | no | The property to pull |
| 2 | `separator` | `String` | no | no | The separator to use in case of array |

### Per-parameter notes

- **`property`** (`Enum`, required): The property to pull. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`separator`** (`String`, optional): The separator to use in case of array. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

State functions access event context state — old/new values for update events (`old`, `new` prefixes), voice states, presences.

`$newSound` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$newSound[value]
```

**Full form (all arguments)**

```fs
$newSound[value;,]
```

## Reference implementation (source)

Taken from `src/native/state/newSound.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(SoundboardSoundProperties[prop](ctx.states?.soundboardSound?.new, sep))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$auditLog`]($auditLog.md)
- [`$bulk`]($bulk.md)
- [`$effect`]($effect.md)
- [`$newAutomodRule`]($newAutomodRule.md)
- [`$newChannel`]($newChannel.md)
- [`$newEmoji`]($newEmoji.md)
- [`$newEntitlement`]($newEntitlement.md)
- [`$newGuild`]($newGuild.md)

**Source:** [`src/native/state/newSound.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/state/newSound.ts)
