/*
 * Chronolith — clearwarns: Clear all warnings from one or more targets
 * Slash command (mirrors the %clearwarns prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "clearwarns",
        description: "Clear all warnings from one or more targets",
        options: [
            { type: 3, name: "users", description: "Mentions/usernames/IDs", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[c;$warnsRemove[$guildID;$option[users]]]
$interactionReply[
$description[🧼 Cleared \`$get[c]\` warning(s).]
$color[248046]
$footer[Chronolith • Moderation]
]
    `
};
