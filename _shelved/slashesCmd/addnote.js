/*
 * Chronolith — addnote: Add a staff note to a user
 * Slash command (mirrors the %addnote prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "addnote",
        description: "Add a staff note to a user",
        options: [
            { type: 6, name: "user", description: "Target user", required: true },
            { type: 3, name: "content", description: "Note content", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[n;$addNote[$guildID;$option[user];$authorID;$option[content]]]
$interactionReply[
$author[📝 Note #$get[n];$userAvatar[$botID;64;png]]
$description[**$userTag[$option[user]]**
> $option[content]]
$color[5865F2]
$footer[Chronolith • Notes]
]
    `
};
