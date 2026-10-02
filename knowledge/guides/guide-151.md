# $randomString guide

> Community guide for `$randomString` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-151)

`$randomString[length;characters?]` generates a random string of the specified length.

- `length` — how many characters the string will have  
- `characters` (optional) — a custom set of characters to pick from; if omitted, defaults to letters and numbers

Examples:
```fs
$randomString[6]
```
Possible output:  
`a9Xk2Q`

```fs
$randomString[4;ABCD] 
```
Possible output:  
`BADA`

Useful for random codes, passwords, or any unique string needs.
