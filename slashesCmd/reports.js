/*
 * Chronolith — reports: List reports by status, or view one by ID
 * Slash command (mirrors the %reports prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "reports",
        description: "List reports by status, or view one by ID"
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$ephemeral
$interactionReply[
$description[Use the prefix command: %reports \\[open|claimed|resolved|dismissed|all|<id>\\]]
$color[7C3AED]
]
    `
};
