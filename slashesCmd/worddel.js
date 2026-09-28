/*
 * Chronolith — worddel: Remove a banned word
 * Slash command (mirrors the %worddel prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "worddel",
        description: "Remove a banned word",
        options: [
            { type: 3, name: "word", description: "Word to remove", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[w;$toLowerCase[$option[word]]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!arrayLoad[ws;,;$env[cfg;automod;words]]
$let[i;$arrayIndexOf[ws;$get[w]]]
$if[$get[i]==-1;
$interactionReply[That word is not on the list.];
$!arraySplice[ws;$get[i];1]
$!jsonSet[cfg;automod;words;$arrayJoin[ws;,]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[🛡️ Word removed ($arrayLength[ws] left).]]
]
    `
};
