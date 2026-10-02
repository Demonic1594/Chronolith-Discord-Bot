# $writeFile guide

> Community guide for `$writeFile` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-133)

`$writeFile[path;text;encoding]` writes text to a file.  
If the file already exists, it will be **overwritten**.  
If the file does not exist, it will be **created**.

Example:
```fs
$writeFile[cool-data.txt;Hello there!]
```

This will write `Hello there!` into the `cool-data.txt` file using the default `utf-8` encoding.

Use this to store data, logs, or any other text output your bot needs.

⚠️ Be careful, this will replace any existing content in the file.
