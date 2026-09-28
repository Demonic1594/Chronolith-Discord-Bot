/*
 * Chronolith — quicksetup: Apply sane defaults in one command
 * Prefix command (mirrors the /quicksetup slash command).
 */
module.exports = {
    name: "quicksetup",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-quicksetup;3s;]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;modlog;"$channelID"]
$if[$env[cfg;automod;words]==;
$!jsonSet[cfg;automod;words;]
]
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
$author[Chronolith • Quick setup;$userAvatar[$botID;64;png]]
$description[Defaults applied to **this channel** and the server:]
$color[22C55E]
$addField[Modlog;<#$channelID>;true]
$addField[Automod;invite blocking + flood ratelimit (5 msgs/5s);true]
$addField[Escalation;3 warns → 1h mute;true]
$addField[Anti-nuke;ON — 3 actions/20s → ban;true]
$footer[Chronolith • Fine-tune with %config commands]
    `
};
