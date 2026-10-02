# $multi guide

> Community guide for `$multi` (function) — package **ForgeScript**. Approved 2025-06-21. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-108)

`$multi[...]` multiplies all the numbers provided from left to right.

Example:  
`$multi[2;3;4]`  
→ 2 * 3 = 6  
→ 6 * 4 = **24**

More examples:
- `$multi[5;5]` → 5 * 5 = **25**
- `$multi[10;2;0.5]` → 10 * 2 = 20 → 20 * 0.5 = **10**
- `$multi[7;0;1000]` → 7 * 0 = 0 → 0 * 1000 = **0**

Multiplying anything by zero gives **0**.
