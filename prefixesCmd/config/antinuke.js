/*
 * Chronolith — antinuke: Anti-nuke: watch destructive admin actions
 * Prefix command (mirrors the /antinuke slash command).
 */
module.exports = {
    name: "antinuke",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-antinuke;3s;]
$onlyIf[$or[$toLowerCase[$message[0]]==on;$toLowerCase[$message[0]]==off]==true;Usage: antinuke <on|off> \\[threshold\\] \\[ban|kick|strip\\]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;antinuke;on;$if[$toLowerCase[$message[0]]==on;true;false]]
$if[$toLowerCase[$message[0]]==on;
$!jsonSet[cfg;antinuke;threshold;$if[$message[1]!=;$message[1];3]]
$!jsonSet[cfg;antinuke;action;$if[$message[2]!=;$message[2];ban]]
]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[🛡️ Anti-nuke **$toLowerCase[$message[0]]**$if[$toLowerCase[$message[0]]==on; — $if[$message[1]!=;$message[1];3] dangerous actions in 20s → $if[$message[2]!=;$message[2];ban]]. Whitelist: mods.]
$color[DA373C]
$footer[Chronolith • Security]
    `
};
