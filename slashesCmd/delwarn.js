/*
 * Chronolith — delwarn: Remove one warning by case number
 * Slash command (mirrors the %delwarn prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "delwarn",
        description: "Remove one warning by case number",
        options: [
            { type: 6, name: "user", description: "User (unused by engine, kept for UX)", required: true },
            { type: 4, name: "case", description: "Case number to strike", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$interactionReply[
$description[$caseEditReason[$guildID;$option[case];Removed by moderator <@$authorID>]]
$addField[Note;Warning kept as history with an amended reason.;false]
]
    `
};
