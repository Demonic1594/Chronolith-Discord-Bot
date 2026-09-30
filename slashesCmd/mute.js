/*
 * Chronolith — mute: Timeout one or more users (duration required)
 * Slash command (mirrors the %mute prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "mute",
        description: "Timeout one or more users (duration required)",
        options: [
            { type: 3, name: "targets", description: "Mentions/usernames/IDs (space separated)", required: true },
            { type: 3, name: "duration", description: "e.g. 30s, 5m, 2h, 1d", required: true },
            { type: 3, name: "reason", description: "Reason", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[t;$resolveTargets[$guildID;$option[targets];$channelID;$messageID]]
$!jsonLoad[tj;$get[t]]
$onlyIf[$env[tj;ids]!=;$ephemeral No valid target found.]
$onlyIf[$option[duration]!=;$ephemeral A duration is required.]
$let[r;$punishMulti[mute;$guildID;$authorID;$env[tj;ids];$option[duration];$if[$option[reason]==;No reason provided;$option[reason]]]]
$!jsonLoad[rj;$get[r]]
$interactionReply[
$author[$actionEmoji[mute];$userAvatar[$botID;32;png]]
$color[$actionColor[mute]]
$description[<@$env[tj;ids]>
> $if[$option[reason]==;No reason provided;$option[reason]]
]
$addField[Applied;$env[rj;ok];true]
$addField[Skipped;$env[rj;fail];true]
$footer[Chronolith • Moderation]
$timestamp
$if[$checkContains[$env[tj;ids];,]!=true;
$addActionRow
$addButton[bunban-$env[tj;ids]-$authorID;Unban;Success]
]
]
    `
};
