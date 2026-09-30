/*
 * Chronolith — ban: Ban one or more users (optional duration = auto-unban)
 * Prefix command (mirrors the /ban slash command).
 */
module.exports = {
    name: "ban",
    aliases: ["hackban"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-ban;3s;]
$let[t;$resolveTargets[$guildID;$message;$channelID;$messageID]]
$!jsonLoad[tj;$get[t]]
$onlyIf[$env[tj;ids]!=;No valid target found. Mention a user, or type a username/ID.]
$let[dur;]
$let[rest;$env[tj;reason]]
$let[r;$punishMulti[ban;$guildID;$authorID;$env[tj;ids];$get[dur];$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]]]
$!jsonLoad[rj;$get[r]]
$title[**__The Ban Hammer has spoken!__**]
$author[$serverName[$guildID];$guildIcon[$guildID;128;png]]
$color[$actionColor[ban]]
$description[• **Action :** \`ban\`
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
