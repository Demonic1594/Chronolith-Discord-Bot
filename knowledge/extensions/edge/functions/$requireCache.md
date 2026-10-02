# $requireCache

> Deletes a module from the cache or reloads it (including dependencies)

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| Edge | `other` | v1.0.0 | required | yes | — |

## Signature

```fs
$requireCache[path;type;recursive]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `path` | `String` | **yes** | no | Module path |
| 2 | `type` | `Enum` | **yes** | no | Type of action |
| 3 | `recursive` | `Boolean` | no | no | Whether to clear cache recursively |

### Per-parameter notes

- **`path`** (`String`, required): Module path. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`type`** (`Enum`, required): Type of action. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`recursive`** (`Boolean`, optional): Whether to clear cache recursively. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Uncategorized utilities.

`$requireCache` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$requireCache[value;value]
```

**Full form (all arguments)**

```fs
$requireCache[value;value;true]
```

## Reference implementation (source)

Taken from `src/functions/other/requireCache.ts` in the `Edge` repository — this is exactly what runs:

```ts
execute(...) {
        const full = resolve(process.cwd(), path);
        if (recursive) {
            clearCache(full);
        } else {
            delete require.cache[full];
        }
        if (type === "update") {
            require(full);
        }
        return this.success();
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`recursive`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$benchmark`]($benchmark.md)
- [`$call`]($call.md)
- [`$parallel`]($parallel.md)
- [`$processEnv`]($processEnv.md)
- [`$require`]($require.md)
- [`$spread`]($spread.md)
- [`$updateEvents`]($updateEvents.md)
- [`$updateStructures`]($updateStructures.md)

**Source:** [`src/functions/other/requireCache.ts`](https://github.com/nationdex/edge/blob/main/src/functions/other/requireCache.ts)
