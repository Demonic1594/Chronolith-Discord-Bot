# $clearInterval guide

> Community guide for `$clearInterval` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-139)

`$clearInterval[name]` stops an interval that was previously started with [`$setInterval[]`](https://docs.botforge.org/function/$setInterval).

- `name` — the unique name of the interval to stop

Example:
```fs
$clearInterval[reminderInterval]
```

This will stop the interval named `reminderInterval` from running further.

Use this to cancel repeated code executions when needed.
