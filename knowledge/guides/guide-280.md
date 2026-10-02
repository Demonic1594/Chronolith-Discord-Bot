# Custom Functions

> Community guide for `None` (none) — package **ForgeScript**. Approved 2026-05-09. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-280)

Custom functions allow you to extend the capabilities of ForgeScript by writing your own Javascript-based logic. Once defined, these functions can be used in your bot's scripts just like native functions.

This guide will show you how to structure, register, and use custom functions.

---

## 1. Directory Structure

To keep your codebase organized, place all custom functions in a dedicated folder (e.g., `./functions/`):

```
project/
├── index.js
└── functions/
    ├── say.js
    └── apples.js
```

---

## 2. Function Structure

Every custom function is a Node.js module that exports a configuration object. This object defines the function's name, description, parameters, and executable logic.

### Parameters Configuration

The `params` array contains configurations for the arguments your function accepts:

- `name` (Required): The name of the parameter.
- `description` (Optional): A brief explanation of the parameter's purpose.
- `required` (Optional): A boolean indicating if the parameter is required (Default: `true`).
- `rest` (Optional): A boolean indicating if the parameter accepts multiple values as an array (Default: `false`).

---

## 3. Function Exclusive Properties

### Brackets (Optional)
- `true`: The function requires brackets when called (e.g., `$functionName[argument]`).
- `false`: The function is called without brackets (e.g., `$functionName`).

> [!NOTE]
> If none of your parameters require arguments or you don't define the `params` property, you can omit the `brackets` property.

### Code
Contains the actual executable logic of your custom function. Use `$return[value]` to return a value back to the script.

---

## 4. How to Use

Custom functions can be called in your scripts in two ways:
1. Using the call helper: `$callFunction[customFunctionName;arguments]`
2. Direct invocation: `$customFunctionName[arguments]` (recommended)

---

## 5. Examples

### Example 1: The `say` Function
Let's create a custom function that sends a message with the provided content.

Create `functions/say.js`:
```js
module.exports = {
  name: "say",
  description: "Sends a message with the provided content",
  params: [
    {
      name: "content",
      description: "The message to send",
      required: true
    }
  ],
  code: `
    $sendMessage[$channelID;$env[content]]
  `
};
```

#### Usage
```fs
$say[Hello, world!]
```

---

### Example 2: Returning a Value
Let's create a function that returns a random number of apples.

Create `functions/apples.js`:
```js
module.exports = {
  name: "apples",
  description: "Returns a random number of apples",
  code: `
    $return[$randomNumber[1;11] 🍎]
  `
};
```

#### Usage
```fs
$apples
```

---

### Example 3: Using the `rest` Parameter
The `rest` parameter allows your function to accept a dynamic number of arguments, which are collected into an array.

Create `functions/list.js`:
```js
module.exports = {
  name: "list",
  params: [
    {
      name: "items",
      rest: true,
      required: true
    }
  ],
  code: `
    $return[You provided: $arrayJoin[items;, ]]
  `
};
```

#### Usage
```fs
$list[apple;banana;orange]
```
