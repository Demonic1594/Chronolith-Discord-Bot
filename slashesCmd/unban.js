/*
 * Chronolith — unban: Unban one or more users by ID
 * Slash command (mirrors the %unban prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "unban",
        description: "Unban one or more users by ID",
        options: [
            { type: 3, name: "ids", description: "Space-separated user IDs", required: true },
            { type: 3, name: "reason", description: "Reason", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[ok;0]
$arrayLoad[ids; ;$option[ids]]
$arrayForEach[ids;u;
$if[$env[u]!=;
$let[r;$punish[unban;$guildID;$authorID;$env[u];;$if[$option[reason]==;No reason provided;$option[reason]]]]
$if[$checkContains[$get[r];⛔]!=true;
$letSum[ok;1]
]
]
]
$interactionReply[
$description[🕊 Unbanned \`$get[ok]\` user(s).]
$color[$actionColor[unban]]
$footer[Chronolith • Moderation]
]
    `
};
