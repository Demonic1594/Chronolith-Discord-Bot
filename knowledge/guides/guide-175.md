# $loop guide

> Community guide for `$loop` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-175)

`$loop[]` is an experimental function that repeats code multiple times.

**Syntax:**
```fs
$loop[times;code;iteration name?;ascending?]
```

- `times` — how many times to run (`-1` = infinite)
- `code` — what to run each time
- `iteration name?` — optional variable name
- `ascending?` — `true` (1 → n) or `false` (n → 1)

Use [`$env[]`](https://docs.botforge.org/function/$env) to access the current loop count.

**Use [`$break`](https://docs.botforge.org/function/$break) to stop the loop early.**  
If `times` is `-1`, the loop will run until the bot is turned off or `$break` is used.

**Ascending example:**
```fs
$loop[5;$sendMessage[$channelID;Loop $env[i]];i;true]
```

**Descending example:**
```fs
$loop[3;$sendMessage[$channelID;Countdown $env[n]];n;false]
```

**Infinite loop example:**
```fs
$loop[-1;$sendMessage[$channelID;Still running...]]
```

Avoid infinite loops unless you handle them with `$break` or other controls.
