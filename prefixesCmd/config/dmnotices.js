/*
 * Chronolith — dmnotices: Toggle DM notices for moderation actions (failed DMs never fail the action)
 * Prefix command (mirrors the /dmnotices slash command).
 */
module.exports = {
    name: "dmnotices",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-dmnotices;3s;]
$onlyIf[$or[$toLowerCase[$message[0]]==on,$toLowerCase[$message[0]]==off]==true;Usage: dmnotices <on|off>]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;dmnotices;$if[$toLowerCase[$message[0]]==on;true;false]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[DM notices **$toLowerCase[$message[0]]**.]
$color[7C3AED]
$footer[Chronolith]
    `
};
