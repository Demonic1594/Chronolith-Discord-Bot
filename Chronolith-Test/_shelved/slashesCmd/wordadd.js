/*
 * Chronolith — wordadd: Add a banned word (substring match, case-insensitive)
 * Slash command (mirrors the %wordadd prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "wordadd",
        description: "Add a banned word (substring match, case-insensitive)",
        options: [
            { type: 3, name: "word", description: "Word to ban", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[w;$toLowerCase[$option[word]]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!arrayLoad[ws;,;$env[cfg;automod;words]]
$if[$arraySome[ws;x;$checkCondition[$env[x]==$get[w]]]!=true;
$!arrayPush[ws;$get[w]]
$!jsonSet[cfg;automod;words;$arrayJoin[ws;,]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[🛡️ Word added ($arrayLength[ws] total).]];
$interactionReply[That word is already on the list.]
]
    `
};
