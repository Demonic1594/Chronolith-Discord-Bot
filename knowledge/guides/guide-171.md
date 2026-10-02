# $get guide

> Community guide for `$get` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-171)

`$get[key]` retrieves the value of a temporary variable set with [`$let[]`](https://docs.botforge.org/function/$let).

- `key` — the name of the variable to get

Example:
```fs
$let[username;User123]
User: $get[username]
```

Output:
```
User: User123
```

Use `$get[]` to access variables stored temporarily during command execution.
