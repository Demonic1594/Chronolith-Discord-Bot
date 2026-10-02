# $setInterval guide

> Community guide for `$setInterval` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-161)

`$setInterval[code;time;name]` runs a block of code repeatedly every specified interval.

- `code` — the code to execute each time  
- `time` — interval delay; can be in milliseconds (`60000`), or using time suffixes like `5s` (seconds) or `1m` (minutes)  
- `name` — a unique name to identify the interval

Example:
```fs
$setInterval[$sendMessage[$channelID;Reminder!];1m;reminderInterval]
```

This will send "Reminder!" every 1 minute.

You can stop it using [`$clearInterval[]`](https://docs.botforge.org/function/$clearInterval):

```fs
$clearInterval[reminderInterval]
```

Useful for recurring events, periodic updates, or repeated checks.
