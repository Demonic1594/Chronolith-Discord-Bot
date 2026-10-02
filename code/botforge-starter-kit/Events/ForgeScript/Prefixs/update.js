module.exports = {
    name: "update",
    type: "messageCreate",
    code: `
$onlyIf[$or[$authorID==$botOwnerID;$hasRoles[$guildID;$authorID;$djsEval[process.env.TeamRoleID]]];You are not allowed to use this command!]
$updateApplicationCommands
$updateCommands
$color[#ff8c42]
$description[# ⚙️ Registry Synchronization Complete
The command registry has been synchronized successfully.
### 📈 Statistics
> Prefix Commands Loaded: **$commandCount[messageCreate]**
> Slash Commands Loaded: **$applicationCommandCount[$guildID;true]**
### 🔍 Details
> Updated By: **<@$authorID>**
> Status: **Success**
> Execution Time: **$round[$executionTime]ms**
### 💡 Note
The latest command definitions are now active across the bot.
]
`}