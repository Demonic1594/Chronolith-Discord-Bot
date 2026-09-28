/*
 * Chronolith — warnings: List a user's warnings
 * Slash command (mirrors the %warnings prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "warnings",
        description: "List a user's warnings",
        options: [
            { type: 6, name: "user", description: "User to inspect", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[uc;$userCases[$guildID;$option[user]]]
$onlyIf[$get[uc]!=;No cases on record for that user.]
$arrayLoad[cs;,;$get[uc]]
$if[$arrayLength[cs]==0;
$ephemeral
$interactionReply[No cases on record for that user.]
$stop
]
$arrayMap[cs;k;$jsonLoad[one;$getGuildVar[case_$env[k];$guildID;{}]]$if[$env[one;t]==warn;$return[-# **#$env[k]** · $env[one;r]]];out]
$interactionReply[
$author[Warnings • $userTag[$option[user]];$userAvatar[$option[user];64;png]]
$color[F59E0B]
$description[$arrayJoin[out;
]]
$addField[Active on record;\`$warnCount[$guildID;$option[user]]\`;true]
$footer[Chronolith • Moderation]
]
    `
};
