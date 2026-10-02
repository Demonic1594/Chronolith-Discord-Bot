# $eval guide

> Community guide for `$eval` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-182)

`$eval[code]` runs ForgeScript code dynamically.

You can use this to evaluate expressions or execute logic inside a command, especially useful for admin or dev-only features.

- `code` — Any valid ForgeScript code you want to run.

Example:
```fs
$eval[$sum[5;10]]
```

Returns:
```
15
```

⚠️ Be cautious with this function. It is **not safe to expose** to regular users, as they could execute malicious or unintended code.  
It is highly recommended to restrict access to trusted users or bot owners only.
