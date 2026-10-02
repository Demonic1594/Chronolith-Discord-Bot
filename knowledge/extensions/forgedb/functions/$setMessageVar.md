# $setMessageVar

> Sets a message's value in a variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `messages` | v2.0.0 | required | yes | — |

## Signature

```fs
$setMessageVar[name;value;message ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable |
| 2 | `value` | `String` | **yes** | no | The value |
| 3 | `message ID` | `String` | no | no | The ID of the message |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`value`** (`String`, required): The value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`message ID`** (`String`, optional): The ID of the message. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$setMessageVar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setMessageVar[name;value]
```

**Full form (all arguments)**

```fs
$setMessageVar[name;value;Hello!]
```

## Reference implementation (source)

Taken from `src/functions/messages/setMessageVar.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        await DataBase.set({ name, id: message ?? ctx.message!.id, value, type: "message" })
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`message ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteMessageVar`]($deleteMessageVar.md)
- [`$getMessageVar`]($getMessageVar.md)

**Source:** [`src/functions/messages/setMessageVar.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/messages/setMessageVar.ts)
