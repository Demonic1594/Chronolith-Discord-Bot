/*
 * Chronolith — muterole: Use a role for mutes instead of timeouts
 * Prefix command (mirrors the /muterole slash command).
 */
module.exports = {
    name: "muterole",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-muterole;3s;]
$if[$message[0]==off;
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;muterole;]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
Mutes now use timeouts.;
$let[r;$replace[$replace[$message[0];<@&;];>;]]
$onlyIf[$get[r]!=;Usage: muterole <role|off>]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;muterole;$get[r]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
✅ Mutes now use <@&$get[r]>.
]
    `
};
