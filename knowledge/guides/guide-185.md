# $userDisplayName guide

> Community guide for `$userDisplayName` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-185)

`$userDisplayName[user ID]` returns the **display name** (global name or username) of a user.

- `user ID` (optional) — The Discord user ID.

Example:
```fs
$userDisplayName[1122842723867705356]
```

Returns the user’s global name if they have one, otherwise their username.

Useful for showing user names as they appear globally.

If you want to retrieve the user's display name in a **specific server**, use [`$memberDisplayName[]`](https://docs.botforge.org/function/$memberDisplayName) instead.
