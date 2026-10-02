# How to use Select Menus

> Community guide for `None` (none) — package **ForgeScript**. Approved 2025-06-26. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-190)

In this guide, you'll learn how to use all types of **Select Menus** in ForgeScript, including string, channel, role, user, and mentionable menus, along with related functions like adding options and editing components.

> [!WARNING]
> All **message components** (like buttons and select menus) must be placed inside an action row using `$addActionRow`.

## Table of Contents
1. Using `$addActionRow`
2. `$addStringSelectMenu[]`
3. `$addOption[]`
4. `$addChannelSelectMenu[]`
5. `$addRoleSelectMenu[]`
6. `$addUserSelectMenu[]`
7. `$addMentionableSelectMenu[]`

---

## 1. Using `$addActionRow`

Every message component must be placed inside an action row first. This applies to all types of select menus and buttons.

```fs
$addActionRow
$addStringSelectMenu[fruitMenu;Pick a fruit 🍎;false;1;1]
```

You **cannot** place buttons and select menus in the same row.

```fs
$addActionRow
$addButton[btn;Click me;Primary;;false]
$addStringSelectMenu[fruitMenu;Pick one;false;1;1] ; ❌ This won't work
```

---

## 2. [`$addStringSelectMenu[]`](https://docs.botforge.org/function/$addStringSelectMenu)

```fs
$addStringSelectMenu[custom ID;placeholder?;disabled?;min values?;max values?]
```

Creates a basic dropdown menu with customizable options. This must be followed by one or more `$addOption[]` functions to define choices.

### Example
```fs
$addActionRow
$addStringSelectMenu[fruitMenu;Pick a fruit 🍎;false;1;1]
$addOption[Apple;A red fruit;apple;🍎;false]
$addOption[Banana;A yellow fruit;banana;🍌;false]
$addOption[Orange;A citrus fruit;orange;🍊;true]
```

---

## 3. [`$addOption[]`](https://docs.botforge.org/function/$addOption)

```fs
$addOption[label;description;value;emoji?;default?]
```

Defines a selectable option inside a string select menu.

---

## 4. [`$addChannelSelectMenu[]`](https://docs.botforge.org/function/$addChannelSelectMenu)

```fs
$addChannelSelectMenu[custom ID;placeholder?;min values?;max values?;disabled?;...default channels?]
```

Creates a dropdown that allows the user to pick from one or more channels.

### Setting or Adding Channel Types

- Use `$setChannelType[...types?]` to **replace** the channel types allowed.
- Use `$addChannelType[...types?]` to **add** more allowed types.

```fs
$addActionRow
$addChannelSelectMenu[channelPicker;Select a channel;1;1;false]
$setChannelType[GuildText]
$addDefaultChannelOption[1122851133927989329]
```

See all valid types here: https://docs.botforge.org/enum/ChannelType

### Editing Functions
```fs
$editChannelSelectMenu[old ID;new ID;placeholder?;disabled?;min?;max?;...default channels?]
$editChannelSelectMenuOf[channel ID;message ID;old ID;new ID;placeholder?;disabled?;min?;max?;...default channels?]
```

---

## 5. [`$addRoleSelectMenu[]`](https://docs.botforge.org/function/$addRoleSelectMenu)

```fs
$addRoleSelectMenu[custom ID;placeholder?;min values?;max values?;disabled?;...default roles?]
```

Creates a select menu that allows users to pick one or more roles. Role IDs must be separated with `;`.

### Example
```fs
$addActionRow
$addRoleSelectMenu[roleMenu;Pick your role;1;1;false;1122852308593422386;1122852434567982345]
$addDefaultRoleOption[1122852308593422386]
```

### Related Functions
```fs
$addRoleSelectMenuTo[channel ID;message ID;custom ID;placeholder?;min?;max?;disabled?;...default roles?]
$editRoleSelectMenu[old ID;new ID;placeholder?;disabled?;min?;max?;...default roles?]
$editRoleSelectMenuOf[channel ID;message ID;old ID;new ID;placeholder?;disabled?;min?;max?;...default roles?]
```

---

## 6. [`$addUserSelectMenu[]`](https://docs.botforge.org/function/$addUserSelectMenu)

```fs
$addUserSelectMenu[custom ID;placeholder?;min values?;max values?;disabled?;...default users?]
```

Allows the user to select one or more users. All user IDs should be separated by `;`.

### Example
```fs
$addActionRow
$addUserSelectMenu[userPicker;Choose a user;1;1;false;1122842723867705356]
$addDefaultUserOption[1122842723867705356]
```

### Related Functions
```fs
$addUserSelectMenuTo[channel ID;message ID;custom ID;placeholder?;min?;max?;disabled?;...default users?]
$editUserSelectMenu[old ID;new ID;placeholder?;disabled?;min?;max?;...default users?]
$editUserSelectMenuOf[channel ID;message ID;old ID;new ID;placeholder?;disabled?;min?;max?;...default users?]
```

---

## 7. [`$addMentionableSelectMenu[]`](https://docs.botforge.org/function/$addMentionableSelectMenu)

```fs
$addMentionableSelectMenu[custom ID;placeholder?;min values?;max values?;disabled?]
```

Creates a select menu that supports mentionable entities, **users and roles** only.

### Example
```fs
$addActionRow
$addMentionableSelectMenu[mentionableMenu;Choose someone;1;1;false]
```

### Related Functions
```fs
$addMentionableSelectMenuTo[channel ID;message ID;custom ID;placeholder?;min?;max?;disabled?]
$editMentionableSelectMenu[old ID;new ID;placeholder?;disabled?;min?;max?]
$editMentionableSelectMenuOf[channel ID;message ID;old ID;new ID;placeholder?;disabled?;min?;max?]
```
