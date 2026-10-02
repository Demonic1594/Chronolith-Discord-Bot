# $math guide

> Community guide for `$math` (function) — package **ForgeScript**. Approved 2025-06-21. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-104)

`$math[...]` evaluates a mathematical expression and returns the result.  
If the expression is invalid or contains errors, it returns nothing.

This function takes a single expression as a string, written like regular math.

Example:  
`$math[5+3*2]`  
→ 3 * 2 = 6  
→ 5 + 6 = **11**

More examples:
- `$math[(10+5)/3]` → (10+5) = 15 → 15 / 3 = **5**
- `$math[2^3]` → 2 raised to the power of 3 = **8**
- `$math[100-25*2]` → 25 * 2 = 50 → 100 - 50 = **50**

⚠️ If you type something like `$math[5++2]` or `$math[2*/5]`, it will return **nothing**, because the syntax is invalid.
