# $pow guide

> Community guide for `$pow` (function) — package **ForgeScript**. Approved 2025-06-21. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-109)

`$pow[...]` (alias: `$power`) raises numbers to the power of the next one from left to right.

Example:  
`$pow[2;3]`  
→ 2 ^ 3 = **8**

Chained example:  
`$pow[2;3;2]`  
→ 2 ^ 3 = 8  
→ 8 ^ 2 = **64**

More examples:
- `$pow[5;2]` → 5 ^ 2 = **25**
- `$pow[9;0.5]` → square root of 9 = **3**
- `$pow[2;2;3]` → 2 ^ 2 = 4 → 4 ^ 3 = **64**

⚠️ Large chains can return very big numbers fast.
Example: `$pow[2;10;2]` → 2^10 = 1024 → 1024^2 = **1,048,576**
