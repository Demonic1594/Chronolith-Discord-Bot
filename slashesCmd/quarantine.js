/*
 * Chronolith — quarantine: Isolate a member (quarantine role + 28d mute)
 * Slash command (mirrors the %quarantine prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "quarantine",
        description: "Isolate a member (quarantine role + 28d mute)"
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[r;$punish[quarantine;$guildID;$authorID;$option[user];;$option[reason]]]
$interactionReply[
$color[$actionColor[quarantine]]
$if[$checkContains[$get[r];⛔]==true;
$author[Chronolith;$userAvatar[$botID;64;png]]
$description[$get[r]]
;
$author[$actionEmoji[quarantine];$userAvatar[$option[user];64;png]]
$description[**$userTag[$option[user]]** — isolated for review
> $if[$option[reason]==;No reason provided;$option[reason]]]
$addField[Case;-# #$get[r];true]
]
$footer[Chronolith • Security]
]
    `
};
