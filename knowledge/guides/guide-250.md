# $addActionRow guide

> Community guide for `$addActionRow` (function) — package **ForgeScript**. Approved 2025-10-13. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-250)

This is one of the most essential layout functions.  
**`$addActionRow`** creates a new action row, which holds interactive components.

Every action row can hold up to **5** buttons or **1** select menu. The legacy version of components allows using up to **5** action rows per message.

Interactive components:
- [`$addButton[]`](https://docs.botforge.org/function/$addButton)
- [`$addStringSelectMenu[]`](https://docs.botforge.org/function/$addStringSelectMenu)
- [`$addChannelSelectMenu[]`](https://docs.botforge.org/function/$addChannelSelectMenu)
- [`$addRoleSelectMenu[]`](https://docs.botforge.org/function/$addRoleSelectMenu)
- [`$addUserSelectMenu[]`](https://docs.botforge.org/function/$addUserSelectMenu)
- [`$addMentionableSelectMenu[]`](https://docs.botforge.org/function/$addMentionableSelectMenu)

Example:
```fs
$addActionRow
$addButton[btnID;Click me;Primary]
```
