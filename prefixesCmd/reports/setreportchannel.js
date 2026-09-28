/*
 * Chronolith — setreportchannel: Set the channel where user reports are sent
 * Prefix command (mirrors the /setreportchannel slash command).
 */
module.exports = {
    name: "setreportchannel",
    aliases: ["reportchannel"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-setreportchannel;3s;]
$let[c;$if[$message[0]!=;$replace[$replace[$message[0];<#;];>;];$channelID]]
$onlyIf[$get[c]!=;Usage: setreportchannel <#channel|ID>]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;reports;$trim[$get[c]]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$author[Chronolith • Reports;$userAvatar[$botID;64;png]]
$description[Report channel set to <#$get[c]>.]
$color[7C3AED]
$footer[Chronolith]
    `
};
