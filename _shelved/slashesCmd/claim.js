/*
 * Chronolith — claim: Claim an open report
 * Slash command (mirrors the %claim prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "claim",
        description: "Claim an open report",
        options: [
            { type: 4, name: "id", description: "Report ID", required: true },
            { type: 3, name: "note", description: "Resolution note", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[r;$reportUpdate[$guildID;$option[id];claimed;$authorID;$option[note]]]
$onlyIf[$get[r]==1;$ephemeral Report not found.]
$onlyIf[$get[r]!=-1;$ephemeral Invalid transition.]
$interactionReply[
$description[✅ Report #$option[id] marked **claimed**.]
$color[248046]
]
    `
};
