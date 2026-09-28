/*
 * Chronolith — editnote: Edit a note (original author kept, editor recorded)
 * Slash command (mirrors the %editnote prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "editnote",
        description: "Edit a note (original author kept, editor recorded)",
        options: [
            { type: 4, name: "id", description: "Note ID", required: true },
            { type: 3, name: "content", description: "New content", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$onlyIf[$option[content]!=;$ephemeral Provide the new content.]
$let[d;$noteEdit[$guildID;$option[id];$authorID;$option[content]]]
$onlyIf[$get[d]==1;$ephemeral Note not found.]
$interactionReply[
$description[✏️ Note #$option[id] updated.]
$color[22C55E]
$footer[Chronolith • Notes]
]
    `
};
