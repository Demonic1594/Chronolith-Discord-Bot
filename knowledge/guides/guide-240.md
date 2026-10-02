# $sign guide

> Community guide for `$sign` (function) — package **ForgeScript**. Approved 2026-03-21. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-240)

# $sign[number]

Returns the sign of the number, indicating whether it’s positive, negative, or zero.  
Outputs:
- `1` if number > 0  
- `-1` if number < 0  
- `0` if number = 0  

**Examples**
```fs
$sign[10] $c[ Returns 1 ]
$sign[-42] $c[ Returns -1 ]
$sign[0] $c[ Returns 0 ]
```
