# $memberDisplayName guide

> Community guide for `$memberDisplayName` (function) — package **ForgeScript**. Approved 2025-06-27. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-197)

`$memberDisplayName[guild ID;user ID]` returns the **display name** (nickname or user display name) of a **member** in a specific server.

- `guild ID` — The ID of the server to look in.
- `user ID` — The Discord user ID of the member to fetch.

### Example:
```fs
$memberDisplayName[1122887063049607248;1122842723867705356]
```

This returns the member’s nickname in the server `1122887063049607248`.  
If the member doesn’t have a nickname, it will return their regular **user display name** (which may be their global name or username, depending on what they’ve set).

Use this when you want to show how a member appears **within a server**, not globally.

If you want to retrieve a user's **global display name** (global name or username), use [`$userDisplayName[]`](https://docs.botforge.org/function/$userDisplayName).
