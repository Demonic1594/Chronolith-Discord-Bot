/*
 * Chronolith — cases: A user's full case history (10 per page)
 * Slash command (mirrors the %cases prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "cases",
        description: "A user's full case history (10 per page)",
        options: [
            { type: 6, name: "user", description: "User", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[uc;$userCases[$guildID;$option[user]]]
$onlyIf[$get[uc]!=;No cases on record for that user.]
$!arrayLoad[cs;,;$get[uc]]
$if[$arrayLength[cs]==0;
$ephemeral
$interactionReply[No cases on record for that user.]
$stop
]
$!arrayMap[cs;k;$jsonLoad[one;$getGuildVar[case_$env[k];$guildID;{}]]$return[-# **#$env[k]** $actionEmoji[$env[one;t]] · $env[one;r]];out]
$interactionReply[
$author[History • $userTag[$option[user]];$userAvatar[$option[user];64;png]]
$color[7C3AED]
$description[$arrayJoin[out;
]]
$footer[Chronolith • $arrayLength[cs] case(s)]
]
    `
};
