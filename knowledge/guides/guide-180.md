# $break guide

> Community guide for `$break` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-180)

`$break[]` is used to exit an active [`$loop[]`](https://docs.botforge.org/function/$loop) or [`$while[]`](https://docs.botforge.org/function/$while) early.

It immediately stops the loop when triggered.  
Only works inside a valid loop context — using it outside has no effect.

**Example:**
```fs
$loop[10;
  $if[$env[i]==5;
    $break
  ]
  $sendMessage[$channelID;Loop $env[i]]
;i]
```

This will only run up to loop 5 and then stop.

Useful for breaking out of infinite loops (`$loop[-1;...]`) or stopping when a condition is met.
