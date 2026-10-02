# $nodeVersion

> Returns the node version

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `system` | v1.0.0 | none | no | `String` |

## Signature

```fs
$nodeVersion
```

## How it works

System functions expose host/runtime info — uptime, memory, node version, platform.

`$nodeVersion` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$nodeVersion
```

## Reference implementation (source)

Taken from `src/native/system/nodeVersion.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(process.version)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$cpu`]($cpu.md)
- [`$cpuArch`]($cpuArch.md)
- [`$cpuCores`]($cpuCores.md)
- [`$cpuModel`]($cpuModel.md)
- [`$cpuSpeed`]($cpuSpeed.md)
- [`$networkCardIPs`]($networkCardIPs.md)
- [`$networkCardNames`]($networkCardNames.md)
- [`$os`]($os.md)

**Source:** [`src/native/system/nodeVersion.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/system/nodeVersion.ts)
