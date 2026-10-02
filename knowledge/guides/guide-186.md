# $addButton guide

> Community guide for `$addButton` (function) — package **ForgeScript**. Approved 2025-06-27. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-186)

#### `$addButton[]`

`$addButton[custom ID;label;style;emoji?;disabled?]`  
Creates a clickable button component that can be used inside interactions or messages.

### Example:
```fs
$addButton[buttonID;Click me;Primary;😁;false]
```
This adds a **blue button** labeled `Click me` with a 😁 emoji.

### More Examples:
- `$addButton[voteBtn;Vote Now;Success;🗳️;false]` → Green button, often used for positive actions.
- `$addButton[cancelBtn;Cancel;Danger;✖️;false]` → Red button, often used for delete or cancel actions.
- `$addButton[disabledBtn;Disabled;Secondary;;true]` → Grey button, shown as disabled (not clickable).

---

### ✅ Buttons must be placed inside an Action Row

You **must** include `$addActionRow` before using any buttons.

```fs
$addActionRow
$addButton[yesBtn;Yes;Success;:thumbsup:;false]
$addButton[noBtn;No;Danger;:thumbsdown:;false]
```

---

### Button Styles:

You can use any of the following styles:
- `Primary` – Blue button  
- `Secondary` – Grey button  
- `Success` – Green button  
- `Danger` – Red button  
- `Link` – Sends the user to a URL (in this case, custom ID should be a valid link)

> When using `Link`, the **custom ID** must be replaced with a valid URL and the button won't trigger interactions.

```fs
$addActionRow
$addButton[https://example.com;Visit Site;Link;;false]
```

![Button Example](https://i.imgur.com/i5R17ka.png)
