/*
 * Chronolith — reason: Edit a case's reason
 * Slash command (mirrors the %reason prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "reason",
        description: "Edit a case's reason",
        options: [
            { type: 4, name: "number", description: "Case number", required: true },
            { type: 3, name: "reason", description: "New reason", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$onlyIf[$option[reason]!=;$ephemeral Provide the new reason.]
$let[r;$caseEditReason[$guildID;$option[number];$option[reason]]]
$if[$get[r]==error;
$ephemeral
$interactionReply[⛔ Case not found.]
$stop
]
$interactionReply[✅ Reason updated for case #$option[number].]
    `
};
