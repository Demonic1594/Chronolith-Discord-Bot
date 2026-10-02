# $let guide

> Community guide for `$let` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-170)

`$let[key;value]` creates a temporary variable that can be accessed within the code during command execution.

- `key` — the name of the variable  
- `value` — the value to store

You can retrieve this variable later using [`$get[]`](https://docs.botforge.org/function/$get).

Example:
```fs
$let[score;42]
Score is: $get[score]
```

Output:
```
Score is: 42
```

Useful for storing and reusing values temporarily within your commands.
