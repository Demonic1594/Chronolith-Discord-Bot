/*
 * Chronolith — softban: Softban a user (ban + day purge + unban)
 * Slash command (mirrors the %softban prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "softban",
        description: "Softban a user (ban + day purge + unban)",
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
$let[r;$punishMulti[softban;$guildID;$authorID;$env[tj;ids];$option[duration];$if[$option[reason]==;No reason provided;$option[reason]]]]
$!jsonLoad[rj;$get[r]]
$interactionReply[
**__The Ban Hammer has swept clean!__**
$author[Server Management]
$title[$serverName[$guildID]]
$color[$actionColor[softban]]
$description[• **Action :** \`softban\`
> **Reason:** \`$if[$option[reason]==;No reason provided;$option[reason]]\`
> **Member:** $if[$checkContains[$env[tj;ids];,]!=true;[$username[$env[tj;ids]]\\](https://discord.com/users/$env[tj;ids]) (\`$env[tj;ids]\`);<@$env[tj;ids]>]
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID) (\`$authorID\`)]
$thumbnail[https://cdn.discordapp.com/emojis/1129080609248137266.png?size=4096]
$footer[Rule breakers begone!]
$timestamp
$if[$checkContains[$env[tj;ids];,]!=true;
$addActionRow
$addButton[bunban-$env[tj;ids]-$authorID;Unban;Danger]
]
]
    `
};
