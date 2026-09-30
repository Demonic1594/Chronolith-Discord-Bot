/*
 * Chronolith — hardban: Ban for a duration, auto-unbanned on expiry (persistent across restarts)
 * Prefix command (mirrors the /hardban slash command).
 */
module.exports = {
    name: "hardban",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-hardban;3s;]
$let[t;$resolveTargets[$guildID;$message;$channelID;$messageID]]
$!jsonLoad[tj;$get[t]]
$onlyIf[$env[tj;ids]!=;No valid target found. Mention a user, or type a username/ID.]
$let[dur;]
$let[rest;]
$if[$env[tj;reason]!=;
$!arrayLoad[rt; ;$env[tj;reason]]
$!arrayForEach[rt;w;
$if[$and[$get[dur]==;$isNumber[$replace[$replace[$replace[$replace[$replace[$env[w];s;];m;];h;];d;];w;]]==true]==true;
$let[dur;$env[w]]
;
$let[rest;$get[rest]$if[$get[rest]!=; ]$env[w]]
]
]
]

$onlyIf[$get[dur]!=;A duration is required: hardban <targets> <duration> \\[reason\\]]
$let[r;$punishMulti[hardban;$guildID;$authorID;$env[tj;ids];$get[dur];$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]]]
$!jsonLoad[rj;$get[r]]
$title[**__The Ban Hammer has spoken!__**]
$author[$serverName[$guildID];$guildIcon[$guildID;128;png]]
$color[$actionColor[hardban]]
$description[• **Action :** \`hardban\`
$if[$checkContains[$env[tj;ids];,]!=true;
> **Member:** [$username[$env[tj;ids]]\\](https://discord.com/users/$env[tj;ids])
;
> **Members:** <@$env[tj;ids]>
]
> **Reason:** \`$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]\`
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID)]
$thumbnail[$userAvatar[$authorID;128;png]]
$addField[Applied;$env[rj;ok];true]
$addField[Skipped;$env[rj;fail];true]
$footer[Chronolith • Moderation]
$timestamp
$if[$checkContains[$env[tj;ids];,]!=true;
$addActionRow
$addButton[bunban-$env[tj;ids]-$authorID;Unban;Success]
]
$image[https://cdn.discordapp.com/emojis/1129080609248137266.png?size=4096]
    `
};
