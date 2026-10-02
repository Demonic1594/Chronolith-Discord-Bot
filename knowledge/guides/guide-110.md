# $round guide

> Community guide for `$round` (function) — package **ForgeScript**. Approved 2025-06-21. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-110)

`$round[...]` rounds a number to the nearest whole number or to a specified number of decimal places.

This function accepts:
- The number to round (required)
- Decimal places (optional)

### Examples:

`$round[5.678]`  
→ Rounds to the nearest whole number = **6**

`$round[5.678;2]`  
→ Keeps 2 decimal places = **5.68**

`$round[3.1415926535;4]`  
→ **3.1416**

`$round[9.49]` → **9**  
`$round[9.5]` → **10**

⚠️ If you don't specify decimal places, it defaults to whole number rounding.
