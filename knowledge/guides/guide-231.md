# $hasExtension guide

> Community guide for `$hasExtension` (function) — package **ForgeScript**. Approved 2025-09-01. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-231)

# $hasExtension[name]

Checks if the given ForgeScript extension is loaded.  
Returns `true` if the extension is active, otherwise `false`.

**Example**
```fs
$hasExtension[ForgeColor] $c[ ForgeColor is loaded → true ]
$hasExtension[ForgeIndia] $c[ ForgeIndia is loaded → true ]
$hasExtension[ForgeDB] $c[ ForgeDB is not loaded → false ]
```
