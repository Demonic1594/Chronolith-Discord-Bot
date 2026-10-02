/*
 * Chronolith — inrole: List members holding a role
 * Slash command (mirrors the %inrole prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "inrole",
        description: "List members holding a role",
        options: [
            { type: 8, name: "role", description: "Role", required: true },
        ]
    },
    type: 0,
    code: `
$let[ids;$roleMembers[$guildID;$option[role];, <@>]]
$interactionReply[$if[$replace[$get[ids]; ;]==;Nobody holds that role.;<@$get[ids]>]]
    `
};
