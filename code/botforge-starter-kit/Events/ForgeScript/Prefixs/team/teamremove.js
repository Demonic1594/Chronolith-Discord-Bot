module.exports = {
name: "teamremove",
type: "messageCreate",
code: `
$onlyIf[$authorID==$botOwnerID;You are not the bot owner and thus you can't use this command.]
$onlyIf[$message[0]!=;Please, specify an user!]
$let[user;$findUser[$message[0];false]]
$onlyIf[$get[user]!=;I couldn't find the user. Please try again!]
$onlyIf[$hasPerms[$guildID;$botID;ManageRoles];I don't have the permssion to use manage roles.]
$onlyIf[$rolePosition[$guildID;$memberHighestRoleID[$guildID;$botID]]>$rolePosition[$guildID;$djsEval[process.env.TeamRoleID]];My roles are not high enough to manage <@&$djsEval[process.env.TeamRoleID]>.]
$onlyIf[$hasRoles[$guildID;$get[user];$djsEval[process.env.TeamRoleID]]==true;This user is not a team member!]

$!memberRemoveRoles[$guildID;$get[user];$djsEval[process.env.TeamRoleID]]

$color[#ff8c42]
$description[# ❌ Team Member Removed
The selected user has been successfully removed from the team.
### 👤 Member Information
> User: **<@$get[user]>**
> Removed By: **<@$authorID>**
> Total Team Members: **$@[,]roleMembers[$guildID;$djsEval[process.env.TeamRoleID]]**
### 📋 Revoked Access
• Team Commands
• Developer Utilities
• Management Tools
### 💡 Note
The user no longer has access to team member features.
]
`}
