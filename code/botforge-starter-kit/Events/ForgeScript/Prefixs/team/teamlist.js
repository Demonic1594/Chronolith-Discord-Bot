module.exports = {
    name: "teamlist",
    type: "messageCreate",
    code: `
$color[#ff8c42]
$description[# 👥 Team Members
Below is a list of all registered team members.
### 📊 Statistics
> Total Team Members: **$@[,]roleMembers[$guildID;$djsEval[process.env.TeamRoleID]]**
> Team Role: **<@&$djsEval[process.env.TeamRoleID]>**
### 📋 Member List
$let[role;$djsEval[process.env.TeamRoleID]]
$arrayLoad[userIds;,;$roleMembers[$guildID;$get[role];,]]
$arrayMap[userIds;id;$return[<@$env[id]>];mentions]

$arrayJoin[mentions;, ].
### 💡 Note
Only the bot owner can use team management commands.]
`}