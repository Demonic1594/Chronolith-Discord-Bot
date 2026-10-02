# $randomNumber guide

> Community guide for `$randomNumber` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-153)

`$randomNumber[min;max;decimals?]` generates a random number between `min` and `max`.

- `min` — the smallest number possible  
- `max` — the largest number possible  
- `decimals` (optional) — `true` or `false` to include decimals (defaults to `false`)

Examples:
```fs
$randomNumber[1;10]
```
Possible output:  
`7`

```fs
$randomNumber[0;1;true]
```
Possible output:  
`0.438`

Useful for random values in games, simulations, or any feature needing random numbers.
