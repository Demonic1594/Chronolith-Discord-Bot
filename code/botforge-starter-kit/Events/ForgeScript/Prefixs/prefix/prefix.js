module.exports = {
    name: "prefix",
    type: "messageCreate",
    unprefixed: true,
    code: `
$color[#ff8c42]
$description[# ⚙️ Prefix Information
### 📋 Current Configuration
> Current Prefix: **$getGlobalVar[prefix]**
### 💡 Example Usage
> $getGlobalVar[prefix]botinfo
> $getGlobalVar[prefix]teaminfo
### 🔔 Note
Use \`prefixset <new prefix>\` to change the current prefix.
]
`}