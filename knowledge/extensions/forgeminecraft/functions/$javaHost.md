# $javaHost

> Returns the host name of the java server

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMinecraft | `java` | v1.0.0 | none | no | `String` |

## Signature

```fs
$javaHost
```

## How it works

See the function list below for exact signatures.

`$javaHost` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$javaHost
```

## Reference implementation (source)

Taken from `src/native/java/javaHost.ts` in the `ForgeMinecraft` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success((await ctx.client.minecraft.getJavaStatus().catch(ctx.noop))?.host)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$javaEulaBlocked`]($javaEulaBlocked.md)
- [`$javaIPAddress`]($javaIPAddress.md)
- [`$javaIcon`]($javaIcon.md)
- [`$javaMOTD`]($javaMOTD.md)
- [`$javaMaxPlayers`]($javaMaxPlayers.md)
- [`$javaMods`]($javaMods.md)
- [`$javaPlayerCount`]($javaPlayerCount.md)
- [`$javaPlayerList`]($javaPlayerList.md)

**Source:** [`src/native/java/javaHost.ts`](https://github.com/tryforge/ForgeMinecraft/blob/main/src/native/java/javaHost.ts)
