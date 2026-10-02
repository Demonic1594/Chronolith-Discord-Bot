module.exports = {
    name: "teaminfo",
    type: "messageCreate",
    code: `
$color[#ff8c42]
$description[# 👥 Team Information
Welcome to the team management system.
### 📊 Statistics
> Total Team Members: **$@[,]roleMembers[$guildID;$djsEval[process.env.TeamRoleID]]**
> Team Role: **<@&$djsEval[process.env.TeamRoleID]>**
> Owner: **<@$botOwnerID>**
### 🔐 Permissions
Members with the Team role can access:
• Team Commands
• Developer Utilities
• Management Tools
### 🏷️ Your Status
Role: **$ifx[
  $if[$authorID==$botOwnerID;Bot Owner]
  $elseIf[$hasRoles[$guildID;$authorID;$djsEval[process.env.TeamRoleID]];Team Member]
  $else[Normal Member]
]**
Access Level: **$ifx[
  $if[$authorID==$botOwnerID;Supreme]
  $elseIf[$hasRoles[$guildID;$authorID;$djsEval[process.env.TeamRoleID]];Trusted]
  $else[Standard]
]**
### 📋 Available Commands
\`teaminfo\`, \`teamlist\`, \`teamadd\` & \`teamremove\`.
### 💡 Note
Only the bot owner can use team management commands.]
`}