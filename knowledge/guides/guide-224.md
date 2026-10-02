# $abs guide

> Community guide for `$abs` (function) — package **ForgeScript**. Approved 2026-03-21. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-224)

`$abs[]` returns the number without the sign.  
Defined as:  
`x > 0 → x`  
`x = 0 → 0`  
`x < 0 → -x`

**Example**
```fs
$abs[15] $c[ Returns 15 ]
$abs[-69.4] $c[ Returns 69.4 ]
```
