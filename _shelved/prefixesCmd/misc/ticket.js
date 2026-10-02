/*
 * Chronolith — ticket: Open a private ticket channel with the mods
 * Prefix command (mirrors the /ticket slash command).
 */
module.exports = {
    name: "ticket",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$onlyIf[$env[cfg;tickets]!=;Tickets are not configured here (mods: set %tickets <#category>).]
$let[tch;$createChannel[$guildID;ticket-$username[$authorID];GuildText;;$env[cfg;tickets]]]
$!removeChannelPerms[$get[tch];$guildID;ViewChannel]
$!addChannelPerms[$get[tch];$authorID;+ViewChannel;+SendMessages]
$if[$env[cfg;modroles]!=;
$!arrayLoad[mrs;,;$env[cfg;modroles]]
$!arrayForEach[mrs;mr;$addChannelPerms[$get[tch];$env[mr];+ViewChannel;+SendMessages]]
]
$sendMessage[$get[tch];
$title[Ticket for $userTag[$authorID]]
$description[Explain your issue here. A moderator will respond.
When resolved, press Close — the channel locks for review.]
$color[248046]
$footer[Opened from <#$channelID>]
$addActionRow
$addButton[tkclose-$authorID;Close;Danger]
;false]
$description[✅ Ticket opened: <#$get[tch]>]
    `
};
