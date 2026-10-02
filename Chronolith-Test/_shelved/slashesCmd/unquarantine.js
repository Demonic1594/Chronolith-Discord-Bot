/*
 * Chronolith — unquarantine: Release a quarantined member
 * Slash command (mirrors the %unquarantine prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "unquarantine",
        description: "Release a quarantined member",
        options: [
            { type: 6, name: "user", description: "Member", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[r;$punish[unquarantine;$guildID;$authorID;$option[user];;Manual release]]
$interactionReply[
$color[$actionColor[unquarantine]]
$if[$checkContains[$get[r];⛔]==true;
$author[Chronolith;$userAvatar[$botID;64;png]]
$description[$get[r]]
;
$author[$actionEmoji[unquarantine];$userAvatar[$option[user];64;png]]
$description[**$userTag[$option[user]]** — released from quarantine]
$addField[Case;-# #$get[r];true]
]
$footer[Chronolith • Security]
]
    `
};
