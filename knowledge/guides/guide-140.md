# $guildID guide

> Community guide for `$guildID` (function) — package **ForgeScript**. Approved 2025-06-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-140)

This is a very commonly used function and as the name suggests, **`$guildID[]`** (Alias: `$serverID`) returns the ID of a guild (server). If no arguments are given, `$guildID` takes the current guild, this means the guild in which the command, interaction or context in general was executed.

If a valid guild name was provided, `$guildID[]` will return the ID of the specified guild name. In case of an invalid guild name the function simply returns no output.

Example Output: `997899472610795580`

The output can be used in various other functions that expect a guild ID as an argument.
