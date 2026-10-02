# Custom Named Colors

> Community guide for `None` (none) — package **ForgeColor**. Approved 2026-02-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-264)

*ForgeColor 1.1.0* introduces **Custom Named Colors**, allowing you to define your own reusable color names in addition to the built-in color list.

This is useful if you want to register brand colors, theme palettes, or special color codes that you’ll use throughout your ForgeScript project.

## 🚀 Example Usage

You can pass your custom color names when initializing the extension:

```js
const { ForgeClient } = require("@tryforge/forgescript");
const { ForgeColor } = require("forge.color");

const client = new ForgeClient({
  extensions: [
    new ForgeColor({
      customColorNames: [
        { name: "brandBlue", color: "#1e90ff" },
        { name: "softPink", color: 0xffc0cb },
        { name: "deepRed", color: "rgb(200, 0, 0)" },
      ],
    }),
  ],
});
```

These names are now available everywhere in your script where ForgeColor functions can read named colors.

## 🧠 How It Works

When you create a new `ForgeColor` instance with the `customColorNames` option:

- Each entry must include:
  - `name`: a unique string (case-insensitive).
  - `color`: either a valid color code (hex, rgb, hsl, etc.) or an integer value
- Colors are validated and converted to numeric RGB internally.
- Once registered, your custom colors behave exactly like built-in named colors.



## 🧾 Validation Rules

| Property | Type | Required | Description |
|-----------|------|-----------|-------------|
| name  | string | ✅ | The identifier for your color. Must be unique. |
| color | string or number | ✅ | The color value. Can be `#hex`, `rgb()`, or an integer like `0xffaabb`. |


## ❗ Error Handling

- Duplicate names throw an error.
- Invalid color codes (e.g., malformed hex or out-of-range integers) throw an error.
- Numbers must be between `0x000000` and `0xFFFFFF`.

## 🔍 Accessing Custom Colors

You can access or verify your registered colors using static helpers:
```js
ForgeColor.GetColorFromName("brandBlue"); // → numeric value
ForgeColor.GetNameFromColor(0x1e90ff);    // → "brandBlue"
ForgeColor.IsNamedColor("softPink");      // → true
```
Or using ForgeColor native functions:
```fs
$colorName[deepRed;hex] $c[ Returns #c80000 ]
```

## 🧹 Removing a Custom Color (optional)

You can dynamically remove a custom color if needed:
```js
ForgeColor.Colors = ForgeColor.Colors.filter(c => c.name !== "deepRed");
```

> ✨ Tip: Combine this with `$findClosestColorName` and `$isNamedColor` to build dynamic color matchers or theme inspectors!
