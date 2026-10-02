# $drawText

> Draws a filled/stroked text on a canvas

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `drawing` | v1.0.0 | required | yes | — |

> aliases: $placeText, $text, $writeText

## Signature

```fs
$drawText[canvas;type;text;font;style;x;y;maxWidth;multiline;wrap;lineOffset;newlineBeginning;allowEmojis]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `canvas` | `String` | no | no | Name of the canvas |
| 2 | `type` | `Enum` | **yes** | no | The text type |
| 3 | `text` | `String` | **yes** | no | The text to draw |
| 4 | `font` | `String` | **yes** | no | The text font ({size}px {font name}) |
| 5 | `style` | `String` | **yes** | no | The style (color/gradient/pattern) |
| 6 | `x` | `Number` | **yes** | no | The text start X coordinate |
| 7 | `y` | `Number` | **yes** | no | The text start Y coordinate |
| 8 | `maxWidth` | `Number` | no | no | Maximum font width |
| 9 | `multiline` | `Boolean` | no | no | Indicates if new lines should be allowed |
| 10 | `wrap` | `Enum` | no | no | Indicates how the text should be wrapped if it exceeds the maximum width |
| 11 | `lineOffset` | `Number` | no | no | The text lines offset |
| 12 | `newlineBeginning` | `Enum` | no | no | The alignment of the text when a new line is encountered |
| 13 | `allowEmojis` | `Boolean` | no | no | Indicates if custom emojis should be drawn; emojis get cached into preload://cache_emoji_{id} |

### Per-parameter notes

- **`canvas`** (`String`, optional): Name of the canvas. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`type`** (`Enum`, required): The text type. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`text`** (`String`, required): The text to draw. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`font`** (`String`, required): The text font ({size}px {font name}). Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`style`** (`String`, required): The style (color/gradient/pattern). Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`x`** (`Number`, required): The text start X coordinate. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`y`** (`Number`, required): The text start Y coordinate. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`maxWidth`** (`Number`, optional): Maximum font width. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`multiline`** (`Boolean`, optional): Indicates if new lines should be allowed. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`wrap`** (`Enum`, optional): Indicates how the text should be wrapped if it exceeds the maximum width. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`lineOffset`** (`Number`, optional): The text lines offset. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`newlineBeginning`** (`Enum`, optional): The alignment of the text when a new line is encountered. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`allowEmojis`** (`Boolean`, optional): Indicates if custom emojis should be drawn; emojis get cached into preload://cache_emoji_{id}. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

See the function list below for exact signatures.

`$drawText` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$drawText[value;value;Hello!;value;value;5]
```

**Full form (all arguments)**

```fs
$drawText[value;value;Hello!;value;value;5;5;5;true;value;5;value;true]
```

## Reference implementation (source)

Taken from `src/functions/drawing/drawText.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const canvas = ctx.canvasManager?.getOrCurrent(name);
        if (!canvas) return this.customError(ForgeCanvasError.NoCanvas);

        const valid = validateFont(font);
        if (!valid || typeof valid === 'string') return this.customError(valid);

        const s = await resolveStyle(this, ctx, canvas, style);
        if (s instanceof Return) return s;

        canvas.ctx[t === FillOrStroke.fill ? 'fillStyle' : 'strokeStyle'] = s;
        canvas.text(
            t,
            await parseText(
                ctx.client, text,
                multiline === true, allowEmojis
            ),
            x, y,
            font,
            typeof maxWidth === 'number' ? maxWidth : undefined,
            // @ts-expect-error
            TextAlign[wrap] !== undefined ? wrap : undefined,
            typeof lineOffset === 'number' ? lineOffset : undefined,
            // @ts-expect-error
            typeof nlAlign === 'number' ? TextAlign[nlAlign] : nlAlign
        );

        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$placeText`, `$text`, `$writeText` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`canvas`, `maxWidth`, `multiline`, `wrap`, `lineOffset`, `newlineBeginning`, `allowEmojis`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$drawImage`]($drawImage.md)
- [`$drawImageArea`]($drawImageArea.md)
- [`$drawRect`]($drawRect.md)
- [`$putPixels`]($putPixels.md)

**Source:** [`src/functions/drawing/drawText.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/drawing/drawText.ts)
