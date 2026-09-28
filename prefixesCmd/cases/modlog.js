/*
 * Chronolith — modlog: Set the modlog channel (cases post here)
 * Prefix command (mirrors the /modlog slash command).
 */
module.exports = {
    name: "modlog",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-modlog;3s;]
$if[$message[0]==off;
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;modlog;]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
Modlog disabled.;
$onlyIf[$message[0]!=;Usage: modlog <#channel|off>]
$let[c;$replace[$replace[$message[0];<#;];>;]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;modlog;$get[c]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
✅ Modlog set to <#$get[c]>.
]
    `
};
