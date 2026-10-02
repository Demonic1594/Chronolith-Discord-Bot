# Basic Drawing

> Community guide for `None` (none) — package **ForgeCanvas**. Approved 2026-03-18. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-271)

Once your canvas is created, you use drawing functions to layer shapes, images, and text from the bottom up.

---

## 🛠 Basic Drawing Functions
These are the core tools for building your image:

* **$drawRect**: Draws squares, rectangles, and circles.
* **$drawText**: Writes words on the screen.

---

## 🟢 Drawing Shapes (Rectangles & Circles)
In ForgeCanvas, the `$drawRect` function is the "all-in-one" tool for shapes.

### $drawRect[canvas?; type; style?; x; y; width; height; ...radius?]
* **type**: Use `fill` (solid) or `stroke` (outline).
* **style**: (Optional) The color (e.g., `Red`, `#FFFFFF`).
* **x / y**: Where the top-left corner of the shape starts.
* **width / height**: The size of the box.
* **radius**: (Optional) This rounds the corners.

> **💡 How to draw a Circle:**
> To make a perfect circle, set the **width** and **height** to the same number (a square), then set the **radius** to half of that number. 
> *Example: For a 100x100 square, use a radius of 50.*

---

## 🎨 Colors: Fill vs. Stroke
You can choose how to "paint" your shapes and text:

| Type | Description |
| :--- | :--- |
| **Fill** | Fills the inside of the shape with solid color. |
| **Stroke** | Draws only the outline (border) of the shape. |

**Color Formats:**
* **Named**: `Red`, `Blue`, `White`.
* **Hex**: `#ff0000`.
* **RGB**: `rgb(255, 0, 0)`.

---

## 📝 Basic Example: Hello Canvas with Shapes
This script creates a 500x300 canvas with a background, a "button" shape, and a circle.

```fs
$c[ 1. Setup the canvas ]
$createCanvas[myDrawing;500;300;
  $c[ 2. Draw a Blue Rectangle as the background ]
  $drawRect[;full;Blue;0;0;500;300]

  $c[ 3. Draw a Red Circle (100x100 square with 50 radius) ]
  $drawRect[;fill;Red;350;50;100;100;50]

  $c[ 4. Draw a White Rounded Box (a button) ]
  $drawRect[;fill;White;50;100;200;60;15]
]

$c[ 5. Add text on top of the white box ]
$drawText[myDrawing;fill;Click Me;20px Arial;black;85;138]

$c[ 6. Send the finished image ]
$renderCanvas[myDrawing]
```
Preview
[![my-Drawing.png](https://i.postimg.cc/xdHbmZm7/my-Drawing.png)](https://postimg.cc/v1YBF33L)
