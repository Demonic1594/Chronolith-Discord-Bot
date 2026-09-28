/*
 * Chronolith — wordadd: Add a banned word (substring match, case-insensitive)
 * Prefix command (mirrors the /wordadd slash command).
 */
module.exports = {
    name: "wordadd",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-wordadd;3s;]
$onlyIf[$message[0]!=;Usage: wordadd <word>]
$let[w;$toLowerCase[$message[0]]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$let[words;$env[cfg;automod;words]]
$arrayLoad[ws;,;$get[words]]
$if[$arrayIncludes[ws;$get[w]]!=true;
$arrayPush[ws;$get[w]]
$!jsonSet[cfg;automod;words;$arrayJoin[ws;,]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[🛡️ Word added ($arrayLength[ws] total).];
$description[That word is already on the list.]
]
    `
};
