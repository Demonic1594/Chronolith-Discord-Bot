# $isBot guide

> Community guide for `$isBot` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-167)

`$isBot[userID]` checks if a user is a **bot**.

- `userID` — the Discord user ID to check.

Example:
```fs
$isBot[1122842723867705356]
```

Returns:  
`true` if the user is a bot  
`false` if the user is not a bot

Useful for filtering bot users or managing bot-specific logic.
