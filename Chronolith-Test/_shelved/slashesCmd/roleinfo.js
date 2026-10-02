/*
 * Chronolith — roleinfo: Role details
 * Slash command (mirrors the %roleinfo prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "roleinfo",
        description: "Role details",
        options: [
            { type: 8, name: "role", description: "Role", required: true },
        ]
    },
    type: 0,
    code: `
$interactionReply[
$description[@$roleName[$guildID;$option[role]]]
$color[5865F2]
$addField[ID;$option[role];true]
$addField[Position;$rolePosition[$guildID;$option[role];true];true]
$addField[Mention;<@&$option[role]>;true]
]
    `
};
