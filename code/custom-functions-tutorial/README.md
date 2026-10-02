# Custom Functions — tutorial (as submitted)

In this guide, you will learn how to create and use your own custom functions in ForgeScript. Let's get started!

## Step #1
To create your custom function, add the following code to your `index.js` file:```js
client.functions.add({
    name: "",
    params: [],
    code: `
    $return[]  
    `
});
```

## Step #2
Customize your custom function; Add a function name, parameters and a code that is executed each time you call the function (don't forget to use `$return[]`!).

**Example:**```js
client.functions.add({
    name: "admin",
    params: ["guild", "user"],
    code: `
    $return[$hasPerms[$env[guild];$env[user];Administrator]]
    `
});
```
> To get the value of a parameter/an argument, use `$env[PARAM_NAME]` in the code of your custom function.

## Step #3
Restart your bot to apply the recent changes made to your `index.js` file.

## Step #4
Now, if you did everything correctly, you should be able to call your custom function using [`$callFunction[name;...args?]`](<https://docs.botforge.org/#function-list-$callFunction>) ✨

**Example:**```
$callFunction[admin;$guildID;$mentioned[0]]
```
> In this example, `$callFunction[]` would either return "true" or "false", depending on whether the mentioned user has the "Administrator" permission on the current server.
