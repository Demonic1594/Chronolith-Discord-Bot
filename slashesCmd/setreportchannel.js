/*
 * Chronolith — setreportchannel: Set the channel where user reports are sent
 * Slash command (mirrors the %setreportchannel prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "setreportchannel",
        description: "Set the channel where user reports are sent",
        options: [
            { type: 7, name: "channel", description: "Report inbox channel", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[c;$default[$option[channel];]]
$onlyIf[$get[c]!=;$ephemeral Provide a channel.]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;reports;$get[c]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[
$author[Chronolith • Reports;$userAvatar[$botID;64;png]]
$description[Report channel set to <#$get[c]>.]
$color[7C3AED]
$footer[Chronolith]
]
    `
};
