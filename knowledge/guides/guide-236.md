# $chalkLog guide

> Community guide for `$chalkLog` (function) — package **ForgeScript**. Approved 2025-09-03. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-236)

The **`$chalkLog[]`** function logs the provided text with additional customizable styles to your client's console. This can be useful for colorful fancy logging messages or debugging purposes.

### Styles
This function supports all available [chalk styles](https://github.com/chalk/chalk?tab=readme-ov-file#styles). Multiple styles can be applied to the text at once by separating each style with a semicolon (`;`).

### Example
```fs
$chalkLog[Logged text with styles to the console!;bold;italic;underline;blueBright;bgBlackBright]
```

<img src="https://i.imgur.com/aU93uGP.png" draggable=false>
