/*
 * Chronolith — logs: Set log channels (joinleave, serverlogs)
 * Prefix command (mirrors the /logs slash command).
 */
module.exports = {
    name: "logs",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-logs;3s;]
$onlyIf[$message[0]!=;Usage: logs <joinleave|serverlogs> <#channel|off>]
$onlyIf[$or[$message[0]==joinleave;$message[0]==serverlogs]==true;Kind must be joinleave or serverlogs.]
$let[c;$if[$message[1]==off;;$replace[$replace[$message[1];<#;];>;] ]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;logs;$message[0];$get[c]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[📋 $message[0] log $if[$get[c]==;disabled;set to <#$get[c]>.]]
    `
};
