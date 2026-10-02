# $ifx guide

> Community guide for `$ifx` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-174)

`$ifx[]` is an experimental but powerful function used for writing advanced conditional logic.

It works similarly to [`$if[]`](https://docs.botforge.org/function/$if), but allows **multiple branches** using [`$elseIf[]`](https://docs.botforge.org/function/$elseif) and [`$else[]`](https://docs.botforge.org/function/$else) inside one block.

- ⚠️ You can **only use `$if[]` once** at the start of the `$ifx[]`.  
  Any additional `$if[]` lines inside will not run, even if the condition is correct.  
  Always follow the first `$if[]` with `$elseIf[]` or `$else[]`.

### Example:
```fs
$ifx[
$if[$message==hi;Hello!]
$elseIf[$message==bye;Goodbye!]
$elseIf[$message==ok;Okay then.]
$else[I don't understand.]
]
```

What happens:
- If the user sends "hi" → `Hello!`
- If "bye" → `Goodbye!`
- If "ok" → `Okay then.`
- Anything else → `I don't understand.`

Useful for commands that require multiple conditional branches without nesting multiple `$if[]` calls.
