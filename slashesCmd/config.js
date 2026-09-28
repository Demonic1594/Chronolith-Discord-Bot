/*
 * Chronolith — config: Show Chronolith settings for this server
 * Slash command (mirrors the %config prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "config",
        description: "Show Chronolith settings for this server"
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$ephemeral
$interactionReply[
$author[Chronolith • Settings;$userAvatar[$botID;64;png]]
$color[7C3AED]
$addField[Modlog;$if[$env[cfg;modlog]==;*not set*;<#$env[cfg;modlog]>];true]
$addField[Mod roles;$if[$env[cfg;modroles]==;*ManageServer by default*;<@&$replace[$env[cfg;modroles];,;>, <@&>]>];true]
$addField[Warn escalation;$if[$env[cfg;warns;threshold]==;*off*;$env[cfg;warns;threshold] warns → $env[cfg;warns;action]];true]
$addField[Anti-nuke;$if[$env[cfg;antinuke;on]==true;ON;*off*];true]
$addField[Automod;invites $if[$env[cfg;automod;invites]==true;**on**;off] · spam $if[$env[cfg;automod;spam]==true;**on**;off];false]
$footer[Chronolith]
]
    `
};
