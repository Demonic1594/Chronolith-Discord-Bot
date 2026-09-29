/*
 * Chronolith — notes: Show a user's staff notes (first target only)
 * Slash command (mirrors the %notes prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "notes",
        description: "Show a user's staff notes (first target only)",
        options: [
            { type: 6, name: "user", description: "Target user (first only)", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[ns;$userNotes[$guildID;$option[user]]]
$if[$get[ns]==;
$ephemeral
$interactionReply[No notes on record for that user.]
$stop
]
$!arrayLoad[ns;,;$get[ns]]
$!arrayLoad[out;]
$!arrayMap[ns;n;$jsonLoad[one;$noteGet[$guildID;$env[n]]]$return[-# **#$env[n]** · <@$env[one;by]> · $discordTimestamp[$env[one;ts];RelativeTime]
> $env[one;c]];out]
$interactionReply[
$author[Notes • $userTag[$option[user]];$userAvatar[$option[user];64;png]]
$description[$arrayJoin[out;
]]
$footer[Chronolith • $arrayLength[ns] note(s)]
]
    `
};
