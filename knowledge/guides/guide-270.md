# Introduction to ForgeCanvas

> Community guide for `None` (none) — package **ForgeCanvas**. Approved 2026-03-18. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-270)

### What is ForgeCanvas?
ForgeCanvas is an extension for the Forge ecosystem that allows you to create and manipulate images using code. Instead of sending static files, you use specialized functions to "draw" elements—like text, shapes, and images—onto a virtual blank space called a **Canvas**. Once your drawing is finished, the extension converts the canvas into a final image file (like a .png) to be displayed.

### When to use ForgeCanvas?
You should use ForgeCanvas when you need images to be **dynamic** or **personalized** for every user. Common use cases include:

* **Welcome Images:** Automatically putting a new member's avatar and name on a custom background.
* **Rank Cards:** Creating leveling bars that grow as a user gains XP.
* **Gaming Profiles:** Displaying live stats, inventories, or character data visually.
* **Dynamic Captions:** Adding custom text or memes to images provided by users.
* **Charts/Graphs:** Visualizing data or logs directly in a chat interface.

---

## 🛠 Basic Setup: The Canvas
Before drawing, you must define your workspace.

### $createCanvas[name; width; height; ...functions?]
This is the starting point for every project.
* **name**: A unique ID (e.g., `myImage`) used to identify the canvas.
* **width / height**: The pixel dimensions of your image.
* **functions**: (Optional) Drawing commands placed here automatically target this canvas.

### $renderCanvas[name]
This is the final step. It converts the data in your canvas into a viewable image file. Without this, nothing will be sent to the user.

---

## 📐 Understanding Coordinates (X & Y)
ForgeCanvas uses a 2D coordinate system. To place an object, you must tell the bot exactly where it goes on the grid.



* **Origin (0,0)**: The top-left corner of your image.
* **X-Axis**: Moves objects horizontally. Increasing X moves to the **right**.
* **Y-Axis**: Moves objects vertically. Increasing Y moves **down**.

---

## 📝 Example: Hello World Card
This simple script creates a 400x200 canvas and writes "Hello World" in the center.

```fs
$c[ 1. Create a canvas named 'hello' ]
$createCanvas[hello;400;200;
  $c[ 2. Draw white text at X:100 Y:100 ]
  $drawText[;fill;Hello World;30px DejaVu Sans;White;100;100]
]

$c[ 3. Render the result ]
$renderCanvas[hello]
```
Preview
[![hello.png](https://i.postimg.cc/d3JQLHRG/hello.png)](https://postimg.cc/HcP1NthL)
