# $parallel

> Runs multiple code blocks in parallel and returns all results as an array

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| Edge | `other` | v1.0.0 | required | no | `Json` |

## Signature

```fs
$parallel[code]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `code` | `String` | **yes** | yes | Code block to run in parallel |

### Per-parameter notes

- **`code`** (`String` , rest, required): Code block to run in parallel. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Uncategorized utilities.

`$parallel` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

The `code` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$parallel[code]
```

## Reference implementation (source)

Taken from `src/functions/other/parallel.ts` in the `Edge` repository — this is exactly what runs:

```ts
execute(...) {
        const self = this as any;
        const fields = this.data.fields!;
        const len = fields.length;
        const promises = new Array(len);
        for (let i = 0; i < len; i++) {
            promises[i] = self.resolveCode(ctx, fields[i]);
        }
        const results = await Promise.all(promises);
        const values = new Array(len);
        for (let i = 0; i < len; i++) {
            values[i] = results[i].value;
        }
        return this.successJSON(values);
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$benchmark`]($benchmark.md)
- [`$call`]($call.md)
- [`$processEnv`]($processEnv.md)
- [`$require`]($require.md)
- [`$requireCache`]($requireCache.md)
- [`$spread`]($spread.md)
- [`$updateEvents`]($updateEvents.md)
- [`$updateStructures`]($updateStructures.md)

**Source:** [`src/functions/other/parallel.ts`](https://github.com/nationdex/edge/blob/main/src/functions/other/parallel.ts)
