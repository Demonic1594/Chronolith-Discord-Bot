/*
 * Chronolith — kick: Kick one or more users
 * Slash command (mirrors the %kick prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "kick",
        description: "Kick one or more users",
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
$let[r;$punishMulti[kick;$guildID;$authorID;$env[tj;ids];$option[duration];$if[$option[reason]==;No reason provided;$option[reason]]]]
$!jsonLoad[rj;$get[r]]
$interactionReply[
**__The Boot has spoken!__**
$author[Server Management]
$title[$serverName[$guildID]]
$color[$actionColor[kick]]
$description[• **Action :** \`kick\`
$if[$checkContains[$env[tj;ids];,]!=true;
> **Member:** [$username[$env[tj;ids]]\\](https://discord.com/users/$env[tj;ids]) (\`$env[tj;ids]\`)
;
> **Members:** <@$env[tj;ids]>
]
> **Reason:** \`$if[$option[reason]==;No reason provided;$option[reason]]\`
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID) (\`$authorID\`)
$if[$env[rj;fail]!=;
> ⚠ Skipped: $env[rj;fail]]
]

$footer[Rule breakers begone! • Chronolith]
$timestamp
$if[$checkContains[$env[tj;ids];,]!=true;
$addActionRow
$addButton[bunban-$env[tj;ids]-$authorID;Unban;Danger]
]
]
    `
};
