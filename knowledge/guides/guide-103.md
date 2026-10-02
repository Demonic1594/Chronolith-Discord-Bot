# $modulo guide

> Community guide for `$modulo` (function) — package **ForgeScript**. Approved 2025-06-21. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-103)

`$modulo[...]` returns the remainder after dividing the first number by the second, third, and so on, sequentially.

`$modulo[100;3;2]` will do:
1. 100 % 3 = 1  
2. 1 % 2 = 1  

^ So the final output will be `1`.

Example:  
`$modulo[50;7;5]`  
→ 50 % 7 = 1  
→ 1 % 5 = 1  
→ Output: **1**

If you do:  
`$modulo[81;9;2;2]`  
→ 81 % 9 = 0  
→ 0 % 2 = 0  
→ 0 % 2 = 0  
→ Output: **0**
