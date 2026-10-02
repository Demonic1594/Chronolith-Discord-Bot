/*
 * Chronolith — archivereport: Delete a report record entirely
 * Slash command (mirrors the %archivereport prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "archivereport",
        description: "Delete a report record entirely",
        options: [
            { type: 4, name: "id", description: "Report ID", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[r;$reportArchive[$guildID;$option[id]]]
$onlyIf[$get[r]==1;$ephemeral Report not found.]
$interactionReply[
$description[📦 Report #$option[id] archived.]
$color[#4E5058]
]
    `
};
