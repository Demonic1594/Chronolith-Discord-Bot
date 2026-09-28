/*
 * Chronolith — protect: Configure protected roles/users (cannot be moderated here)
 * Slash command (mirrors the %protect prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "protect",
        description: "Configure protected roles/users (cannot be moderated here)"
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$ephemeral
$interactionReply[
$description[Use the prefix command: %protect <role|user> <add|remove> <target>]
$color[7C3AED]
]
    `
};
