# $if guide

> Community guide for `$if` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-172)

`$if[condition;code if true;code if false]` is a commonly used function that evaluates a condition and runs code based on the result.

- `condition` — a comparison or expression that returns true or false  
- `code if true` — code to run if the condition is true  
- `code if false` — (optional) code to run if the condition is false

Example:
```fs
$if[$message==hello;Hello there!;I didn't say hello!]
```

If the user’s message is exactly “hello”, it replies:  
`Hello there!`  
Otherwise, it replies:  
`I didn't say hello!`

Useful for conditional logic in commands.
