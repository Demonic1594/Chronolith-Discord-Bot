/*
 * Chronolith — massban: Ban many users by ID at once
 * Slash command (mirrors the %massban prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "massban",
        description: "Ban many users by ID at once",
        options: [
            { type: 3, name: "ids", description: "Space-separated user IDs", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$onlyIf[$option[ids]!=;$ephemeral Provide space-separated user IDs.]
$let[done;$massBan[$guildID;$authorID;$option[ids]]]
$interactionReply[
$description[⛔ Banned **$get[done]** user(s).]
$color[DA373C]
$footer[Chronolith • Moderation]
]
    `
};
