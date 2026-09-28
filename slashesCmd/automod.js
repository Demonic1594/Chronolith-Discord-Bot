/*
 * Chronolith — automod: Toggle automod modules (invites, mentions, caps — the word list is active whenever it is non-empty)
 * Slash command (mirrors the %automod prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "automod",
        description: "Toggle automod modules (invites, mentions, caps — the word list is active whenever it is non-empty)",
        options: [
            { type: 3, name: "module", description: "invites, links, mentions, caps or spam", required: true },
            { type: 3, name: "state", description: "on or off", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[m;$option[module]]
$let[val;$option[state]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$if[$get[m]==invites;$jsonSet[cfg;automod;invites;$if[$get[val]==on;true;false]]]
$if[$get[m]==links;
$!jsonSet[cfg;automod;links;$if[$get[val]==on;true;false]]]
$if[$get[m]==mentions;
$!jsonSet[cfg;automod;mentionLimit;$if[$get[val]==on;6;]]
]
$if[$get[m]==caps;
$!jsonSet[cfg;automod;caps;$if[$get[val]==on;true;false]]
$!jsonSet[cfg;automod;capsMin;$if[$get[val]==on;12;]]
]
$if[$get[m]==spam;
$!jsonSet[cfg;automod;spam;$if[$get[val]==on;true;false]]
$!jsonSet[cfg;automod;spamN;5]
$!jsonSet[cfg;automod;spamS;5]
]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[
$description[🛡️ Automod module **$get[m]** is now **$get[val]**.]
$color[F59E0B]
$footer[Chronolith • Automod]
]
    `
};
