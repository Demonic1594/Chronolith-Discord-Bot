# $divide guide

> Community guide for `$divide` (function) — package **ForgeScript**. Approved 2025-06-21. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-105)

`$divide[...]` divides numbers in order from left to right.

It starts with the first number and divides it by the second, then divides the result by the third, and so on.

Example:  
`$divide[100;2;5]`  
→ 100 / 2 = 50  
→ 50 / 5 = **10**

More examples:
- `$divide[64;4;2]` → 64 / 4 = 16 → 16 / 2 = **8**
- `$divide[81;3;3;3]` → 81 / 3 = 27 → 27 / 3 = 9 → 9 / 3 = **3**

⚠️ Division by zero will return "Infinity".
`$divide[10;0]` → **Infinity**
