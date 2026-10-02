# $while guide

> Community guide for `$while` (function) — package **ForgeScript**. Approved 2025-07-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-202)

`$while[]` is an **experimental** function that repeats code as long as a condition is true.

**Syntax:**  
```fs
$while[condition;code]
```

- `condition` — a boolean expression to check each iteration  
- `code` — the code to execute while the condition is true

Use [`$break`](https://docs.botforge.org/function/$break) to stop the loop early.

**Example:**  
```fs
$let[i;1]
$while[$get[i]<=5;
$sendMessage[$channelID;Loop $get[i]]
$letSum[i;1]
]
```

This sends messages "Loop 1" to "Loop 5".

Be careful with `$while[]` to avoid infinite loops that can crash your bot.
