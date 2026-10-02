# $convertColor guide

> Community guide for `$convertColor` (function) — package **ForgeColor**. Approved 2025-09-01. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-230)

# $convertColor[code;to]

Converts a color code to the given format (hex, rgb, hsl, etc).

**Example**
```fs
$convertColor[#ff0000;rgb] $c[ Returns rgb(255,0,0) ]
$convertColor[rgb(0,255,0);hex] $c[ Returns #00ff00 ]
```
