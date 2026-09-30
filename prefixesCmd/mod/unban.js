/*
 * Chronolith — unban: Unban one or more users by ID (trailing words = reason)
 * Prefix command (mirrors the /unban slash command).
 */
module.exports = {
    name: "unban",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-unban;3s;]
$onlyIf[$message[0]!=;Provide one or more user IDs (extra words become the reason).]
$let[ulist;]
$let[reason;]
$!arrayLoad[toks; ;$message]
$!arrayForEach[toks;t;
$if[$isNumber[$env[t]]==true;
$let[ulist;$get[ulist]$if[$get[ulist]!=;,]$env[t]]
;
$let[reason;$get[reason]$if[$get[reason]!=; ]$env[t]]
]
]
$onlyIf[$get[ulist]!=;Provide one or more user IDs (extra words become the reason).]
$let[reason;$if[$get[reason]==;Unban;$get[reason]]]
$let[ok;0]
$!arrayLoad[ids;,;$get[ulist]]
$!arrayForEach[ids;u;
$if[$env[u]!=;
$let[r;$punish[unban;$guildID;$authorID;$env[u];;$get[reason]]]
$if[$checkContains[$get[r];⛔]!=true;
$letSum[ok;1]
]
]
]
$title[**__The Ban Hammer retracts.__**]
$author[$serverName[$guildID];$guildIcon[$guildID;128;png]]
$color[$actionColor[unban]]
$description[• **Action :** \`unban\`
> **Reason:** \`$get[reason]\`
> **Member:** $if[$checkContains[$get[ulist];,]!=true;[$username[$get[ulist]]\\](https://discord.com/users/$get[ulist]) (\`$get[ulist]\`);<@$get[ulist]>]
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID) (\`$authorID\`)]
> **Reason:** \`$get[reason]\`
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID)]
$thumbnail[$userAvatar[$authorID;128;png]]
$addField[Unbanned;$get[ok];true]
$footer[Chronolith • Moderation]
$timestamp
$if[$checkContains[$get[ulist];,]!=true;
$addActionRow
$addButton[bban-$get[ulist]-$authorID;Ban;Danger]
]
    `
};
