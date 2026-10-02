# $readFile guide

> Community guide for `$readFile` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-132)

`$readFile[path;encoding]` reads the contents of a file from your bot’s file system.

If no encoding is provided, it defaults to `utf-8`.

Example:
```fs
$readFile[cool-data.txt]
```

This will return the contents of the `cool-data.txt` file (if it exists).

⚠️ This function only works in environments where file access is supported.  
Make sure the file path is correct and the file exists, or it will return nothing.
