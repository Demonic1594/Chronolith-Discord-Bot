/*
 * Chronolith — warn: Warn a user (auto-escalates at threshold)
 * Slash command (mirrors the %warn prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "warn",
        description: "Warn a user (auto-escalates at threshold)",
        options: [
            { type: 6, name: "user", description: "Target user", required: true },
            { type: 3, name: "reason", description: "Reason", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[r;$punish[warn;$guildID;$authorID;$option[user];;$option[reason]]]
$interactionReply[
$color[$actionColor[warn]]
$if[$checkContains[$get[r];⛔]==true;
$author[Chronolith;$userAvatar[$botID;64;png]]
$description[$get[r]]
;
$author[$actionEmoji[warn];$userAvatar[$option[user];64;png]]
$description[**$userTag[$option[user]]**
> $if[$option[reason]==;No reason provided;$option[reason]]]
$addField[Case;-# #$get[r];true]
]
$footer[Chronolith • Moderation]
]
    `
};
