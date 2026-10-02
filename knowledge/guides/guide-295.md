# $addPermissionOverwrite guide

> Community guide for `$addPermissionOverwrite` (function) — package **ForgeScript**. Approved 2026-08-15. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-295)

The **`$addPermissionOverwrite[]`** function adds permission overwrites for a specific role or member while creating a new channel. This allows you to configure the channel's permissions immediately, rather than modifying them after the channel has been created.

> [!NOTE]
> This function must be called **before** `$createChannel[]`.

### Example
```fs
$addPermissionOverwrite[729343563401265193;+ViewChannel;+ManageMessages]
$addPermissionOverwrite[1393308768304894013;+ViewChannel;-SendMessages]
$createChannel[$guildID;talk;GuildText]
```
