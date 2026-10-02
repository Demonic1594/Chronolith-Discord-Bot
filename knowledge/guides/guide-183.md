# $userAvatar guide

> Community guide for `$userAvatar` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-183)

`$userAvatar[userID;size;extension]` returns the avatar URL of a user.

- `userID` — the Discord user ID  
- `size` (optional) — image size in pixels (default: 1024)  
- `extension` (optional) — image format like `png`, `jpg`, `webp`, or `gif` (if the avatar supports it)

Example:
```fs
$userAvatar[1122842723867705356;512;png]
```

Returns the PNG avatar URL of the user with ID `1122842723867705356` at 512x512 pixels.

Useful for displaying user avatars in embeds or messages.
