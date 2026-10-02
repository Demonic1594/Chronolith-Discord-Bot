# $benchmark

> Runs a code block N times and returns elapsed time and ops/sec

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| Edge | `other` | v1.0.0 | required | no | `Json` |

## Signature

```fs
$benchmark[code;iterations;variable]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `code` | `String` | **yes** | no | Code block to benchmark |
| 2 | `iterations` | `Number` | no | no | How many times to run the code, defaults to 1 |
| 3 | `variable` | `String` | no | no | Environment variable to load the result into |

### Per-parameter notes

- **`code`** (`String`, required): Code block to benchmark. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`iterations`** (`Number`, optional): How many times to run the code, defaults to 1. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`variable`** (`String`, optional): Environment variable to load the result into. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Uncategorized utilities.

`$benchmark` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

## Examples

**Basic usage**

```fs
$benchmark[code]
```

**Full form (all arguments)**

```fs
$benchmark[code;5;value]
```

## Reference implementation (source)

Taken from `src/functions/other/benchmark.ts` in the `Edge` repository — this is exactly what runs:

```ts
execute(...) {
        const self = this as any;
        const resolved = await self.resolveMultipleArgs(ctx, 1, 2);
        if (!self.isValidReturnType(resolved.return)) return resolved.return;
        const want = Math.max(1, Math.floor(resolved.args[0] || 1));
        const variable = resolved.args[1];
        const code = this.data.fields![0];
        let ran = 0;
        const start = performance.now();
        for (; ran < want; ran++) {
            const exec = await self.resolveCode(ctx, code);
            if (exec.success || exec.continue || exec.return) continue;
            if (exec.break) break;
            return exec;
        }
        const time = performance.now() - start;
        const ops = ran / (time / 1000);
        const data = { time, ops, iterations: ran };
        if (variable) {
            ctx.setEnvironmentKey(variable, data);
            return this.success();
        }
        return this.successJSON(data);
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`iterations`, `variable`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$call`]($call.md)
- [`$parallel`]($parallel.md)
- [`$processEnv`]($processEnv.md)
- [`$require`]($require.md)
- [`$requireCache`]($requireCache.md)
- [`$spread`]($spread.md)
- [`$updateEvents`]($updateEvents.md)
- [`$updateStructures`]($updateStructures.md)

**Source:** [`src/functions/other/benchmark.ts`](https://github.com/nationdex/edge/blob/main/src/functions/other/benchmark.ts)
