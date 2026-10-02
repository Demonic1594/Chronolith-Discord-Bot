# $clearTimeout guide

> Community guide for `$clearTimeout` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-137)

`$clearTimeout[name]` cancels a timeout that was previously set with [`$setTimeout[]`](https://docs.botforge.org/function/$setTimeout).

- `name` — the unique name of the timeout to cancel

Example:
```fs
$clearTimeout[reminder]
```

This will stop the timeout named `reminder` from running if it hasn't executed yet.

Use this to cancel scheduled code execution when needed.
