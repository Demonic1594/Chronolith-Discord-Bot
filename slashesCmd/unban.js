/*
 * Chronolith — unban: Unban one or more users by ID (trailing words = reason)
 * Slash command (mirrors the %unban prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "unban",
        description: "Unban one or more users by ID (trailing words = reason)",
        options: [
            { type: 3, name: "ids", description: "Space-separated user IDs", required: true },
            { type: 3, name: "reason", description: "Reason", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[ok;0]
$!arrayLoad[ids; ;$option[ids]]
$!arrayForEach[ids;u;
$if[$env[u]!=;
$let[r;$punish[unban;$guildID;$authorID;$env[u];;$if[$option[reason]==;No reason provided;$option[reason]]]]
$if[$checkContains[$get[r];⛔]!=true;
$letSum[ok;1]
]
]
]
$let[ulist;$replace[$option[ids]; ;,]]
$interactionReply[
$title[**__The Ban Hammer retracts.__**]
$author[$serverName[$guildID];$guildIcon[$guildID;128;png]]
$color[$actionColor[unban]]
$description[• **Action :** \`unban\`
> **Reason:** \`$if[$option[reason]==;No reason provided;$option[reason]]\`
> **Member:** $if[$checkContains[$get[ulist];,]!=true;[$username[$get[ulist]]\\](https://discord.com/users/$get[ulist]) (\`$get[ulist]\`);<@$get[ulist]>]
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID) (\`$authorID\`)]
> **Reason:** \`$if[$option[reason]==;No reason provided;$option[reason]]\`
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID)]
$thumbnail[$userAvatar[$authorID;128;png]]
$addField[Unbanned;$get[ok];true]
$footer[Chronolith • Moderation]
$timestamp
$if[$checkContains[$get[ulist];,]!=true;
$addActionRow
$addButton[bban-$get[ulist]-$authorID;Ban;Danger]
]
]
    `
};
