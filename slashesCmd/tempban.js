/*
 * Chronolith — tempban: Ban temporarily — auto-unban on schedule
 * Slash command (mirrors the %tempban prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "tempban",
        description: "Ban temporarily — auto-unban on schedule",
        options: [
            { type: 6, name: "user", description: "Member", required: true },
            { type: 3, name: "duration", description: "e.g. 3d, 1w", required: true },
            { type: 3, name: "reason", description: "Reason", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$onlyIf[$option[duration]!=;$ephemeral Provide a duration.]
$let[n;$tempban[$guildID;$authorID;$option[user];$option[duration];$if[$option[reason]==;No reason provided;$option[reason]]]]
$interactionReply[
$description[⛔ <@$option[user]> banned for **$option[duration]** — case #$get[n].]
$color[EF4444]
$footer[Chronolith]
]
    `
};
