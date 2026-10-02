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
$let[uc;$getGuildVar[ulist_$option[user];$guildID;]]
$onlyIf[$get[uc]!=;No cases on record for that user.]
$!arrayLoad[cs;,;$get[uc]]
$if[$arrayLength[cs]==0;
$ephemeral
$interactionReply[No cases on record for that user.]
$stop
]
$!arrayLoad[cs;,;$get[uc]]
$!arrayLoad[out;]
$!arrayMap[cs;k;$jsonLoad[one;$getGuildVar[case_$env[k];$guildID;{}]]$return[-# **#$env[k]** $if[$env[one;t]==ban;🔨;$if[$env[one;t]==hardban;⏳;$if[$env[one;t]==softban;🧹;$if[$env[one;t]==unban;🕊️;$if[$env[one;t]==kick;👢;📌]]]]]  · $env[one;r]];out]
$interactionReply[
$author[History • $userTag[$option[user]];$userAvatar[$option[user];64;png]]
$color[5865F2]
$description[$arrayJoin[out;
]]
$footer[Chronolith • $arrayLength[cs] case(s)]
]
    `
};
