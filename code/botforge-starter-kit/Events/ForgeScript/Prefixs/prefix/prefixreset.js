module.exports = {
    name: "prefixreset",
    type: "messageCreate",
    code: `
$onlyIf[$or[$authorID==$botOwnerID;$hasRoles[$guildID;$authorID;$djsEval[process.env.TeamRoleID]]];You are not allowed to use this command!]
$setGlobalVar[prefix;!]
$color[#ff8c42]
$description[# 🔄 Prefix Reset
The bot prefix has been restored to its default value.
### 📋 Configuration
> Default Prefix: **$getGlobalVar[prefix]**
> Reset By: **<@$authorID>**
### 💡 Example Usage
> $getGlobalVar[prefix]help
> $getGlobalVar[prefix]botinfo
### 🔔 Note
The default prefix is now active.]
`}