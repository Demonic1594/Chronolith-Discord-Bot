# $networkCardIPs

> Returns your network's card ips

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `system` | v1.2.0 | optional | yes | `String[]` |

## Signature

```fs
$networkCardIPs[separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `separator` | `String` | **yes** | no | The separator to use |

### Per-parameter notes

- **`separator`** (`String`, required): The separator to use. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

System functions expose host/runtime info — uptime, memory, node version, platform.

`$networkCardIPs` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$networkCardIPs[,]
```

## Reference implementation (source)

Taken from `src/native/system/networkCardIPs.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(Object.values(networkInterfaces()).map(x => x?.map(x => x.address).filter(Boolean).join(sep ?? ", ")).join(sep ?? ", "))
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$cpu`]($cpu.md)
- [`$cpuArch`]($cpuArch.md)
- [`$cpuCores`]($cpuCores.md)
- [`$cpuModel`]($cpuModel.md)
- [`$cpuSpeed`]($cpuSpeed.md)
- [`$networkCardNames`]($networkCardNames.md)
- [`$nodeVersion`]($nodeVersion.md)
- [`$os`]($os.md)

**Source:** [`src/native/system/networkCardIPs.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/system/networkCardIPs.ts)
