# $colorFormatType guide

> Community guide for `$colorFormatType` (function) — package **ForgeColor**. Approved 2025-09-01. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-229)

# $colorFormatType[code]

Returns the format type of the given color (hex, rgb, hsl, etc).  
If invalid, returns `null`.

**Example**
```fs
$colorFormatType[#ff0000] $c[ Returns hex ]
$colorFormatType[rgb(255,0,0)] $c[ Returns rgb ]
$colorFormatType[hello] $c[ Returns null ]
```
