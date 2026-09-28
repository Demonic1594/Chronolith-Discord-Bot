/*
 * Chronolith — worddel: Remove a banned word
 * Prefix command (mirrors the /worddel slash command).
 */
module.exports = {
    name: "worddel",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-worddel;3s;]
$onlyIf[$message[0]!=;Usage: worddel <word>]
$let[w;$toLowerCase[$message[0]]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!arrayLoad[ws;,;$env[cfg;automod;words]]
$let[i;$arrayIndexOf[ws;$get[w]]]
$if[$get[i]==-1;
$description[That word is not on the list.];
$!arraySplice[ws;$get[i];1]
$!jsonSet[cfg;automod;words;$arrayJoin[ws;,]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[🛡️ Word removed ($arrayLength[ws] left).]
]
    `
};
