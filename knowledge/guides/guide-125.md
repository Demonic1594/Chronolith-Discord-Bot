# $channelID guide

> Community guide for `$channelID` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-125)

This is a very commonly used function and as the name suggests, **`$channelID[]`** returns the ID of a channel. If no arguments are given, `$channelID` takes the current channel, this means the channel in which the command, interaction or context in general was executed.

If a valid channel name was provided, `$channelID[]` will return the ID of the specified channel name. In case of an invalid channel name the function simply returns no output.

Example Output: `985070471869530153`

The output can be used in various other functions that expect a channel ID as an argument.
