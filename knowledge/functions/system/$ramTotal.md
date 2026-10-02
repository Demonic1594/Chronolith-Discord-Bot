# $ramTotal

> Returns the maximum total ram capacity of the system in GB

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `system` | v2.2.0 | none | no | `Number` |

> aliases: $memoryTotal, $maxRam

## Signature

```fs
$ramTotal
```

## How it works

System functions expose host/runtime info — uptime, memory, node version, platform.

`$ramTotal` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$ramTotal
```

## Reference implementation (source)

Taken from `src/native/system/ramTotal.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(os.totalmem() / (1024 ** 3))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$memoryTotal`, `$maxRam` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. This function has no brackets — it is used bare.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$cpu`]($cpu.md)
- [`$cpuArch`]($cpuArch.md)
- [`$cpuCores`]($cpuCores.md)
- [`$cpuModel`]($cpuModel.md)
- [`$cpuSpeed`]($cpuSpeed.md)
- [`$networkCardIPs`]($networkCardIPs.md)
- [`$networkCardNames`]($networkCardNames.md)
- [`$nodeVersion`]($nodeVersion.md)

**Source:** [`src/native/system/ramTotal.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/system/ramTotal.ts)
