/*
 * Chronolith — role: Add or remove a role from a member
 * Slash command (mirrors the %role prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "role",
        description: "Add or remove a role from a member",
        options: [
            { type: 3, name: "mode", description: "add or remove", required: true },
            { type: 6, name: "user", description: "Member", required: true },
            { type: 8, name: "role", description: "Role", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[r;$option[role]]
$if[$option[mode]==add;
$!memberAddRoles[$guildID;$option[user];$get[r]]
$interactionReply[$description[✅ Added <@&$get[r]> to <@$option[user]>.]];
$!memberRemoveRoles[$guildID;$option[user];$get[r]]
$interactionReply[$description[✅ Removed <@&$get[r]> from <@$option[user]>.]]
]
$footer[Chronolith]
    `
};
