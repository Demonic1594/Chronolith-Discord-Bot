# ColorFormat guide

> Community guide for `ColorFormat` (enum) — package **ForgeColor**. Approved 2025-11-01. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-251)

`ColorFormat` represents a fixed set of named constants used to specify or identify color formats in ForgeColor functions.

---

### 🧩 Values

| Name | Description | Example |
|------|--------------|----------|
| **rgb** | Represents the standard Red–Green–Blue color model, using integer or percentage values. | `rgb(255, 0, 0)` or `rgb(100%, 0%, 0%)` |
| **rgba** | Represents RGB with an added alpha (transparency) channel between 0–1. | `rgba(255, 0, 0, 0.5)` |
| **hex** | Hexadecimal representation of color, with or without a hash symbol. | `#ff0000`, `#f00` |
| **hsl** | Represents color using hue (0–360), saturation (0–100%), and lightness (0–100%). | `hsl(120, 100%, 50%)` |
| **int** | Integer representation of color (decimal or hex). | `16711680` or `0xff0000` |
| **cmyk** | Cyan–Magenta–Yellow–Black color model, using either decimal or percentage values. | `cmyk(0, 1, 1, 0)` or `cmyk(0%, 100%, 100%, 0%)` |
