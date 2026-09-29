/*
 * Chronolith — ticket: Open a private ticket channel with the mods
 * Slash command (mirrors the %ticket prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "ticket",
        description: "Open a private ticket channel with the mods"
    },
    type: 0,
    code: `
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$if[$env[cfg;tickets]==;
$ephemeral
$interactionReply[Tickets are not configured here.]
$stop
]
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
$addActionRow
$addButton[tkclose-$authorID;Close;Danger]
;false]
$interactionReply[$ephemeral ✅ Ticket opened: <#$get[tch]>]
    `
};
