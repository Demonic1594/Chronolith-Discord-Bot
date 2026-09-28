/*
 * Chronolith — removenote: Remove notes by their IDs
 * Slash command (mirrors the %removenote prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "removenote",
        description: "Remove notes by their IDs",
        options: [
            { type: 3, name: "ids", description: "Space-separated note IDs", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[removed;0]
$!arrayLoad[nids; ;$option[ids]]
$!arrayForEach[nids;n;
$let[d;$noteDel[$guildID;$env[n]]]
$if[$get[d]==1;
$letSum[removed;1]
]
]
$onlyIf[$get[removed]>0;$ephemeral None of those note IDs exist.]
$interactionReply[
$description[🗑️ Removed \`$get[removed]\` note(s).]
$color[22C55E]
$footer[Chronolith • Notes]
]
    `
};
