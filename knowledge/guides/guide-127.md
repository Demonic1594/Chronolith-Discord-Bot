# $sendMessage guide

> Community guide for `$sendMessage` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-127)

`$sendMessage[channel ID;content?;return message ID?]` sends a message to the specified channel.
You can also choose whether to return the **message ID**.

Example:  
`$sendMessage[$channelID;Hello there!]`
→ Sends "Hello there!" to the current channel.

More examples:
- `$sendMessage[123456789012345678;New update available!]` → Sends message to a specific channel.
- `$sendMessage[$channelID;This is important!;false]` → Sends a message without returning the message ID.
- `$sendMessage[$channelID;This will return an ID;true]` → Sends and returns the message ID.

You can store the ID like this:
```fs
$let[ID;$sendMessage[$channelID;Saved this message;true]]
$get[ID]
```
