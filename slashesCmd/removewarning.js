/*
 * Chronolith — removewarning: Remove warnings by their case IDs
 * Slash command (mirrors the %removewarning prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "removewarning",
        description: "Remove warnings by their case IDs",
        options: [
            { type: 6, name: "user", description: "Target user", required: true },
            { type: 3, name: "ids", description: "Space-separated case IDs", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[removed;0]
$arrayLoad[wids; ;$option[ids]]
$arrayForEach[wids;w;
$let[d;$caseRemove[$guildID;$env[w]]]
$if[$get[d]==1;
$letSum[removed;1]
]
]
$onlyIf[$get[removed]>0;$ephemeral None of those case IDs exist for that user.]
$interactionReply[
$description[🗑️ Removed \`$get[removed]\` warning(s) from <@$option[user]>.]
$color[22C55E]
$footer[Chronolith • Moderation]
]
    `
};
