# $oldData

> Retrieves the old data that has been updated for a record during an update event

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `events` | v2.0.0 | required | yes | — |

## Signature

```fs
$oldData[type]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `type` | `Enum` | **yes** | no | The type of data you want to retrieve |

### Per-parameter notes

- **`type`** (`Enum`, required): The type of data you want to retrieve. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$oldData` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$oldData[value]
```

## Reference implementation (source)

Taken from `src/functions/events/oldData.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        //@ts-ignore
        return this.success((ctx.runtime.extras as { oldData: RecordData }).oldData[DataType[type].toString()])
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$data`]($data.md)
- [`$newData`]($newData.md)

**Source:** [`src/functions/events/oldData.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/events/oldData.ts)
