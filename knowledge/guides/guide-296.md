# messageCreate guide

> Community guide for `messageCreate` (event) — package **ForgeScript**. Approved 2026-08-22. [View on docs.botforge.org](https://docs.botforge.org/guide/guide-296)

### Basic registering
`src/index.js`:
```js
client.commands.add({
    type: "messageCreate",
    code: `Your name is $username!`
})
```
### Registering from a root folder
`src/<folder>/messageCreate.js`:
```js
module.exports = {
    type: "messageCreate",
    code: `Your name is $username!`
}
```
`src/index.js`:
```js
client.commands.load("src/<folder>")
```
