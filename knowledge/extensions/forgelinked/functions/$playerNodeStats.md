# $playerNodeStats

> Get CPU, memory, and other stats of a Lavalink node

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeLinked | `util` | v2.1.0 | required | yes | `Json` |

## Signature

```fs
$playerNodeStats[nodeId]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `nodeId` | `String` | no | no | Optional Lavalink node ID to query stats for |

### Per-parameter notes

- **`nodeId`** (`String`, optional): Optional Lavalink node ID to query stats for. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$playerNodeStats` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$playerNodeStats[123456789012345678]
```

## Reference implementation (source)

Taken from `src/natives/util/playerNodeStats.ts` in the `ForgeLinked` repository — this is exactly what runs:

```ts
execute(...) {
    const linked = ctx.client.getExtension(ForgeLinked, true)?.lavalink
    if (!linked) return this.customError('ForgeLinked is not initialized')

    let node: any | undefined

    if (nodeId) {
      node = linked.nodeManager.nodes.get(String(nodeId))
    } else {
      node = Array.from(linked.nodeManager.nodes.values())[0]
    }

    if (!node) return this.customError('Lavalink node not found')

    if (!node.connected) return this.customError('Lavalink node is not connected')

    return this.successJSON(node.stats ?? {})
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`nodeId`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$linkedEvent`]($linkedEvent.md)
- [`$playerPing`]($playerPing.md)

**Source:** [`src/natives/util/playerNodeStats.ts`](https://github.com/tryforge/ForgeLinked/blob/main/src/natives/util/playerNodeStats.ts)
