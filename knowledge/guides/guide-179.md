# $userExists guide

> Community guide for `$userExists` (function) — package **ForgeScript**. Approved 2025-06-23. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-179)

`$userExists[userID]` checks if a Discord user exists **globally** by their ID.

- `userID` — the Discord user ID to check

Example:
```fs
$userExists[1122842723867705356]
```

Returns:  
- `true` if the user exists  
- `false` if the user does not exist

If you want to check whether a user is in a **specific server**, use [`$memberExists[]`](https://docs.botforge.org/function/$memberExists) instead.

Useful for validating user IDs before performing global actions.
