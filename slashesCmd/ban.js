/*
 * Chronolith — ban: Ban one or more users (optional duration = auto-unban)
 * Slash command (mirrors the %ban prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "ban",
        description: "Ban one or more users (optional duration = auto-unban)",
        options: [
            { type: 3, name: "targets", description: "Mentions/usernames/IDs (space separated)", required: true },
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
$let[r;$punishMulti[ban;$guildID;$authorID;$env[tj;ids];$option[duration];$if[$option[reason]==;No reason provided;$option[reason]]]]
$!jsonLoad[rj;$get[r]]
$interactionReply[
$author[$actionEmoji[ban];$userAvatar[$botID;32;png]]
$color[$actionColor[ban]]
$description[<@$env[tj;ids]>]
$addField[Applied;$env[rj;ok];true]
$addField[Skipped;$env[rj;fail];true]
$addField[Reason;$if[$option[reason]==;No reason provided;$option[reason]];false]
$footer[Chronolith]
$timestamp
]
    `
};
