# $setTimeout guide

> Community guide for `$setTimeout` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-160)

`$setTimeout[code;time;name]` runs a block of code **after a delay**.

- `code` — the code you want to execute later  
- `time` — delay before execution; can be in milliseconds (`5000`), or using time suffixes like `5s` (seconds) or `1m` (minutes)  
- `name` — a unique name to identify the timeout

Example:
```fs
$setTimeout[$sendMessage[$channelID;Time's up!];5s;reminder]
```

This will send "Time's up!" after 5 seconds.

You can cancel a timeout using:
[`$clearTimeout[]`](https://docs.botforge.org/function/$clearTimeout)

Example:
```fs
$clearTimeout[reminder]
```

Useful for reminders, cooldowns, delayed events, or auto timeouts.
