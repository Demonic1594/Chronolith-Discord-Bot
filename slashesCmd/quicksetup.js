/*
 * Chronolith — quicksetup: Apply sane defaults in one command
 * Slash command (mirrors the %quicksetup prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "quicksetup",
        description: "Apply sane defaults in one command"
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;modlog;"$channelID"]
$!jsonSet[cfg;automod;invites;true]
$!jsonSet[cfg;automod;spam;true]
$!jsonSet[cfg;automod;spamN;5]
$!jsonSet[cfg;automod;spamS;5]
$!jsonSet[cfg;warns;threshold;3]
$!jsonSet[cfg;warns;action;mute]
$!jsonSet[cfg;warns;duration;1h]
$!jsonSet[cfg;antinuke;on;true]
$!jsonSet[cfg;antinuke;threshold;3]
$!jsonSet[cfg;antinuke;action;ban]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[
$author[Chronolith • Quick setup;$userAvatar[$botID;64;png]]
$description[Defaults applied — modlog now this channel, automod + escalation + anti-nuke ON.]
$color[22C55E]
$footer[Chronolith]
]
    `
};
