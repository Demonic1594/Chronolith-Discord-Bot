# $sum guide

> Community guide for `$sum` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-112)

`$sum[...]` adds multiple numbers together and returns the result.  
Each number must be separated by a semicolon `;`.

Example:  
`$sum[4;7]`  
→ 4 + 7 = **11**

More examples:
- `$sum[6;9;6;5;7]` → 6 + 9 + 6 + 5 + 7 = **33**
- `$sum[100;250;150]` → 100 + 250 + 150 = **500**
- `$sum[1;2;3;4;5;6]` → **21**

❌ If you include anything that isn't a valid number (like `$sum[5;hi;3]`), the function will **error**.
