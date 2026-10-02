# $sendDM guide

> Community guide for `$sendDM` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-134)

`$sendDM[user ID;content;return message ID?]` sends a direct message to a user.

Example:
```fs
$sendDM[$authorID;Hello there!]
```

To return the message ID of the DM sent, set the third argument to `true`:

```fs
$let[ID;$sendDM[$authorID;ok;true]]
$get[ID]
```

`$get[ID]` will return the **message ID** of the direct message that was sent.

Useful for logging, message tracking, or referencing the DM later.
