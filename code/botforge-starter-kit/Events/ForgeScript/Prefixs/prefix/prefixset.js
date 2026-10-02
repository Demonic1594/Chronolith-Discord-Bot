module.exports = {
    name: "prefixset",
    type: "messageCreate",
    code: `
$onlyIf[$or[$authorID==$botOwnerID;$hasRoles[$guildID;$authorID;$djsEval[process.env.TeamRoleID]]];You are not allowed to use this command!]
$onlyIf[$message[0]!=;Please, specify a value!]
$let[old;$getGlobalVar[prefix]]
$setGlobalVar[prefix;$message[0]]
$let[new;$getGlobalVar[prefix]]
$color[#ff8c42]
$description[# ⚙️ Prefix Updated
The bot prefix has been successfully updated.
### 📋 Configuration
> Previous Prefix: **$get[old]**
> New Prefix: **$get[new]**
> Updated By: **<@$authorID>**
### 💡 Example Usage
> $get[new]botinfo
> $get[new]team info
### 🔔 Note
The new prefix is active immediately and does not require a bot restart.]
`}