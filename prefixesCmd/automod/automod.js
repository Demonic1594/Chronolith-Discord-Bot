/*
 * Chronolith — automod: Toggle automod modules (invites, mentions, caps — the word list is active whenever it is non-empty)
 * Prefix command (mirrors the /automod slash command).
 */
module.exports = {
    name: "automod",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-automod;3s;]
$onlyIf[$message[0]!=;Usage: automod <invites|links|words|mentions|caps|spam> <on|off>]
$let[mod2;$toLowerCase[$message[0]]]
$let[val;$toLowerCase[$message[1]]]
$onlyIf[$and[$or[$get[mod2]==invites;$or[$get[mod2]==links;$or[$get[mod2]==mentions;$or[$get[mod2]==caps;$get[mod2]==spam]]]]==true;$or[$get[val]==on;$get[val]==off]==true]==true;Usage: automod <module> <on|off>]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$if[$get[mod2]==invites;$jsonSet[cfg;automod;invites;$if[$get[val]==on;true;false]]]
$if[$get[mod2]==links;
$!jsonSet[cfg;automod;links;$if[$get[val]==on;true;false]]]
$if[$get[mod2]==mentions;
$!jsonSet[cfg;automod;mentionLimit;$if[$get[val]==on;6;]]
]
$if[$get[mod2]==caps;
$!jsonSet[cfg;automod;caps;$if[$get[val]==on;true;false]]
$!jsonSet[cfg;automod;capsMin;$if[$get[val]==on;12;]]
]
$if[$get[mod2]==spam;
$!jsonSet[cfg;automod;spam;$if[$get[val]==on;true;false]]
$!jsonSet[cfg;automod;spamN;5]
$!jsonSet[cfg;automod;spamS;5]
]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[🛡️ Automod module **$get[mod2]** is now **$get[val]**.]
$color[F59E0B]
$footer[Chronolith • Automod]
    `
};
