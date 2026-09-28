/*
 * Chronolith — setnick: Change a member's nickname
 * Slash command (mirrors the %setnick prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "setnick",
        description: "Change a member's nickname",
        options: [
            { type: 6, name: "user", description: "Member", required: true },
            { type: 3, name: "nickname", description: "New nickname (empty to reset)", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$memberSetNickname[$guildID;$option[user];$option[nickname]]
$interactionReply[$description[✏️ Nickname of <@$option[user]> updated.]]
    `
};
