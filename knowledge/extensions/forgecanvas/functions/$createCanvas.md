# $createCanvas

> Creates a new canvas

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `canvas` | v1.3.0 | required | no | — |

> aliases: $newCanvas, $canvas

## Signature

```fs
$createCanvas[name;width;height;code]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the canvas |
| 2 | `width` | `Number` | **yes** | no | The width of the canvas |
| 3 | `height` | `Number` | **yes** | no | The height of the canvas |
| 4 | `code` | `Unknown` | no | yes | Executes code with this canvas as current (empty name) |

### Per-parameter notes

- **`name`** (`String`, required): The name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`width`** (`Number`, required): The width of the canvas. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`height`** (`Number`, required): The height of the canvas. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`code`** (`Unknown` , rest, optional): Executes code with this canvas as current (empty name). Expects anything. Kept as the raw resolved string.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

See the function list below for exact signatures.

`$createCanvas` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

The `code` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$createCanvas[name;5;5]
```

**Full form (all arguments)**

```fs
$createCanvas[name;5;5;code]
```

## Reference implementation (source)

Taken from `src/functions/canvas/createCanvas.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const manager = ctx.canvasManager instanceof CanvasManager ?
            ctx.canvasManager : ctx.canvasManager = new CanvasManager();

        const options = await this['resolveMultipleArgs'](ctx, 0,1,2);
        const [name, w,h] = options.args;

        const r = options.return;
        if (!r?.success) return r;

        if (!name?.trim()?.length)
            return this.customError(ForgeCanvasError.EmptyName);

        const previous = manager.current;
        manager.current = new CanvasBuilder(w,h);

        const fields = this.data.fields!;
        for (let i = 3; i < fields.length; i++) {
            const r = await this['resolveCode'](ctx, fields[i]);
            if (!r?.success) return r;
        }

        manager.set(name, manager.current);
        manager.current = previous;

        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$newCanvas`, `$canvas` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$attachCanvas`]($attachCanvas.md)
- [`$canvasBuffer`]($canvasBuffer.md)
- [`$canvasDataUrl`]($canvasDataUrl.md)
- [`$canvasSize`]($canvasSize.md)
- [`$deleteCanvas`]($deleteCanvas.md)
- [`$resizeCanvas`]($resizeCanvas.md)
- [`$saveCanvas`]($saveCanvas.md)
- [`$cropCanvas`]($cropCanvas.md)

**Source:** [`src/functions/canvas/createCanvas.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/canvas/createCanvas.ts)
