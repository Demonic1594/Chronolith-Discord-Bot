/*
 * Chronolith — autorole: Role to give on join
 * Prefix command (mirrors the /autorole slash command).
 */
module.exports = {
    name: "autorole",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-autorole;3s;]
$if[$message[0]==off;
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;autorole;]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
Autorole disabled.;
$let[r;$replace[$replace[$message[0];<@&;];>;]]
$onlyIf[$get[r]!=;Usage: autorole <role|off>]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;autorole;"$get[r]"]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
✅ Autorole set to <@&$get[r]>.
]
    `
};
