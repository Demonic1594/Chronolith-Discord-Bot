# $base guide

> Community guide for `$base` (function) — package **ForgeScript**. Approved 2026-03-21. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-225)

`$base[number;to;from?]` converts a number from one base to another.  
If `from` is not given, defaults to base 10.

**Example**
```fs
$base[15;2] $c[ Returns 1111 ]
$base[1111;10;2] $c[ Returns 15 ]
```
