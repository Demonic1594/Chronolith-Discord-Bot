# JSON Functions

> Community guide for `None` (none) — package **ForgeScript**. Approved 2025-11-09. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-252)

In this guide, you will learn how to use various JSON functions in ForgeScript. Let's get started!

> [!NOTE]
> Before reading this guide, you should be familiar with what JSON is and where and how it is being used. You can familiarize yourself with JSON by reading tutorials on [W3Schools](https://www.w3schools.com/js/js_json_intro.asp).

## Table of Contents
1. [`$jsonLoad[]`](#1-jsonload-2)
2. [`$jsonSet[]`](#2-jsonset-7)
3. [`$jsonDelete[]`](#3-jsondelete-12)
4. [`$jsonAssign[]`](#4-jsonassign-17)
5. [`$jsonHas[]`](#5-jsonhas-22)
6. [`$jsonKeys[]`](#6-jsonkeys-27)
7. [`$jsonValues[]`](#7-jsonvalues-32)
8. [`$jsonEntries[]`](#8-jsonentries-37)
9. [`$jsonStringify[]`](#9-jsonstringify-42)

---

## 1. [`$jsonLoad[]`](https://docs.botforge.org/function/$jsonLoad)
This function loads the specified JSON object to an environment variable.

### Syntax
```fs
$jsonLoad[variable;json]
```

### Fields
- `variable` - The variable name to load the JSON object to.
- `json` - The JSON object to load to the variable.

### Example
```fs
$jsonLoad[data;{
    "user": {
        "id": "729343563401265193",
        "username": "itsnicky.",
        "displayName": "Nicky",
        "pronouns": [
            "He/Him"
        \]
    }
}]

Username: $env[data;user;username]
Pronouns: $env[data;user;pronouns;0]
```
> [!TIP]
> We use [`$env[...key?]`](https://docs.botforge.org/function/$env) to retrieve the JSON value of an environment variable. This function is also called `$jsonDump[]`.

### Output
```
Username: itsnicky.
Pronouns: He/Him
```

## 2. [`$jsonSet[]`](https://docs.botforge.org/function/$jsonSet)
This function adds a JSON key with a new value to a JSON object.

> [!NOTE]
> This function returns a boolean depending on whether the JSON key was added successfully. To disable this output, use the [negation operator](https://docs.botforge.org/guide/function-operators-198).

### Syntax
```fs
$jsonSet[...keys?;value]
```

### Fields
- `...keys?` - The JSON key where the new value will be set. This field can be repeated.
- `value` - The new value to set at the specified JSON key.

### Example
```fs
$jsonLoad[data;{
    "user": {
        "id": "729343563401265193",
        "username": "itsnicky.",
        "displayName": "ncy",
        "pronouns": [
            "He/Him"
        \]
    }
}]
$!jsonSet[data;user;displayName;Nicky]
$!jsonSet[data;user;banner;{}]
$!jsonSet[data;user;banner;color;$userAccentColor]

$env[data]
```
### Output
```json
{
    "user": {
        "id": "729343563401265193",
        "username": "itsnicky.",
        "displayName": "Nicky",
        "pronouns": [
            "He/Him"
        ],
        "banner": {
            "color": "#41333c"
        }
    }
}
```

## 3. [`$jsonDelete[]`](https://docs.botforge.org/function/$jsonDelete)
This function deletes a JSON key from a JSON object.

> [!NOTE]
> This function returns a boolean depending on whether the JSON key was deleted successfully. To disable this output, use the [negation operator](https://docs.botforge.org/guide/function-operators-198).

### Syntax
```fs
$jsonDelete[...keys?]
```

### Fields
- `...keys?` - The JSON key to delete. This field can be repeated.

### Example
```fs
$jsonLoad[data;{
    "user": {
        "id": "729343563401265193",
        "username": "itsnicky.",
        "displayName": "Nicky",
        "pronouns": [
            "He/Him"
        \],
        "banner": {
            "color": "#41333c"
        }
    }
}]
$!jsonDelete[data;user;id]
$!jsonDelete[data;user;pronouns;0]

$env[data]
```
### Output
```json
{
    "user": {
        "username": "itsnicky.",
        "displayName": "Nicky",
        "pronouns": [],
        "banner": {
            "color": "#41333c"
        }
    }
}
```

## 4. [`$jsonAssign[]`](https://docs.botforge.org/function/$jsonAssign)
This function combines multiple JSON objects into a single JSON object.

### Syntax
```fs
$jsonAssign[variable;other variable?;...objects?]
```

### Fields
- `variable` - The variable name that holds the target object.
- `other variable?` - The variable to load the result to, leave empty to return output.
- `...objects?` - The objects from which to copy properties. This field can be repeated.

### Example
```fs
$jsonLoad[data;{
    "user": {
        "username": "itsnicky.",
        "displayName": "Nicky",
        "pronouns": [\],
        "banner": {
            "color": "#41333c"
        }
    }
}]
$jsonLoad[user;$env[data;user]]

$jsonAssign[user;;{ "id": "729343563401265193" };{ "isBot": false }]
```
### Output
```json
{
    "username": "itsnicky.",
    "displayName": "Nicky",
    "pronouns": [],
    "banner": {
        "color": "#41333c"
    },
    "id": "729343563401265193",
    "isBot": false
}
```

## 5. [`$jsonHas[]`](https://docs.botforge.org/function/$jsonHas)
This function returns whether a key exists in a JSON object.

### Syntax
```fs
$jsonHas[variable;key]
```

### Fields
- `variable` - The variable name to get JSON object from.
- `key` - The key to check for in the JSON object.

### Example
```fs
$jsonLoad[data;{
    "user": {
        "username": "itsnicky.",
        "displayName": "Nicky",
        "pronouns": [\],
        "banner": {
            "color": "#41333c"
        }
    }
}]
$jsonLoad[user;$env[data;user]]

$jsonHas[user;id]
$jsonHas[user;banner]
```
### Output
*In this example, the key "id" does not exist, resulting in `false`. The key "banner" does exist, resulting in `true`.*
```
false
true
```

## 6. [`$jsonKeys[]`](https://docs.botforge.org/function/$jsonKeys)
This function returns all JSON keys from a JSON object.

### Syntax
```fs
$jsonKeys[variable]
```

### Fields
- `variable` - The variable name to get JSON keys from.

### Example
*In this example, we get all JSON keys of the `user` object.*
```fs
$jsonLoad[data;{
    "user": {
        "username": "itsnicky.",
        "displayName": "Nicky",
        "pronouns": [
            "He/Him",
            "They/Them"
        \],
        "isBot": false
    }
}]
$jsonLoad[user;$env[data;user]]

$jsonKeys[user]
```

### Output
```json
[
    "username",
    "displayName",
    "pronouns",
    "isBot"
]
```

## 7. [`$jsonValues[]`](https://docs.botforge.org/function/$jsonValues)
This function returns all JSON values from a JSON object.

### Syntax
```fs
$jsonValues[variable;separator?]
```

### Fields
- `variable` - The variable name to get JSON values from.
- `separator?` - The optional separator to use for each value.

### Example
*In this example, we get all JSON values of the `user` object separated by a new line.*
```fs
$jsonLoad[data;{
    "user": {
        "username": "itsnicky.",
        "displayName": "Nicky",
        "pronouns": [
            "He/Him",
            "They/Them"
        \],
        "isBot": false
    }
}]
$jsonLoad[user;$env[data;user]]

$jsonValues[user;
]
```

### Output
```
itsnicky.
Nicky
He/Him,They/Them
false
```

## 8. [`$jsonEntries[]`](https://docs.botforge.org/function/$jsonEntries)
This function returns all JSON entries from a JSON object.

### Syntax
```fs
$jsonEntries[variable]
```

### Fields
- `variable` - The variable name to get JSON entries from.

### Example
*In this example, we get all JSON entries of the `user` object.*
```fs
$jsonLoad[data;{
    "user": {
        "username": "itsnicky.",
        "displayName": "Nicky",
        "pronouns": [
            "He/Him",
            "They/Them"
        \],
        "isBot": false
    }
}]
$jsonLoad[user;$env[data;user]]

$jsonEntries[user]
```

### Output
```json
[
    [
        "username",
        "itsnicky."
    ],
    [
        "displayName",
        "Nicky"
    ],
    [
        "pronouns",
        [
            "He/Him",
            "They/Them"
        ]
    ],
    [
        "isBot",
        false
    ]
]
```

## 9. [`$jsonStringify[]`](https://docs.botforge.org/function/$jsonStringify)
This function returns the JSON in stringified format.

### Syntax
```fs
$jsonStringify[variable;space?]
```

### Fields
- `variable` - The variable name that holds the JSON to stringify.
- `space?` - The number of spaces to use for stringifying JSON.

### Example
*In this example, we stringify the JSON with and without spaces.*
```fs
$jsonLoad[data;{
    "user": {
        "username": "itsnicky.",
        "displayName": "Nicky",
        "pronouns": [
            "He/Him",
            "They/Them"
        \],
        "isBot": false
    }
}]

2 Spaces:
$jsonStringify[data;2]

No Spaces:
$jsonStringify[data]
```

### Output
```
2 Spaces:
{
  "user": {
    "username": "itsnicky.",
    "displayName": "Nicky",
    "pronouns": [
      "He/Him",
      "They/Them"
    ],
    "isBot": false
  }
}

No Spaces:
{"user":{"username":"itsnicky.","displayName":"Nicky","pronouns":["He/Him","They/Them"],"isBot":false}}
```
