# $charCount guide

> Community guide for `$charCount` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-152)

`$charCount[text;char?]` returns the number of characters in `text`.

- If you only provide `text`, it returns the total number of characters.  
- If you provide `char` as the second argument, it counts **how many times that specific character appears** in the text.

Examples:
```fs
$charCount[Hello world!]
```
Returns:  
`12` (total characters)

```fs
$charCount[Hello world!;l]
```
Returns:  
`3` (number of times "l" appears)

Useful for text analysis or specific character counting.
