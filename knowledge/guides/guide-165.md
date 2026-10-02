# $username guide

> Community guide for `$username` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-165)

`$username` returns the username of a Discord user.

- Without arguments, it returns **your** username.  
- With a user ID as argument, it returns the username of that user.

Examples:
```fs
$username
```
Returns your username.

```fs
$username[1122842723867705356]
```
Returns the username of the user with ID `1122842723867705356`.

Useful for displaying usernames dynamically.
