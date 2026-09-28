/*
 * Chronolith — tickets: Set the category new tickets are created under
 * Prefix command (mirrors the /tickets slash command).
 */
module.exports = {
    name: "tickets",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-tickets;3s;]
$if[$message[0]==off;
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;tickets;]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
Tickets disabled.;
$let[c;$replace[$replace[$message[0];<#;];>;]]
$onlyIf[$get[c]!=;Usage: tickets <#category|off>]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;tickets;$get[c]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
✅ Tickets will open under <#$get[c]>.
]
    `
};
