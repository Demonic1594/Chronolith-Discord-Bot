/*
 * Chronolith — config: Show Chronolith settings for this server
 * Prefix command (mirrors the /config slash command).
 */
module.exports = {
    name: "config",
    aliases: ["settings"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-config;3s;]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$author[Chronolith • Settings;$userAvatar[$botID;64;png]]
$color[7C3AED]
$addField[Modlog;$if[$env[cfg;modlog]==;*not set*;<#$env[cfg;modlog]>];true]
$addField[Mod roles;$if[$env[cfg;modroles]==;*ManageServer by default*;<@&$replace[$env[cfg;modroles];,;>, <@&>]>];true]
$addField[Muterole;$if[$env[cfg;muterole]==;*timeouts*;<@&$env[cfg;muterole]>];true]
$addField[Autorole;$if[$env[cfg;autorole]==;*off*;<@&$env[cfg;autorole]>];true]
$addField[Quarantine role;$if[$env[cfg;qrole]==;*timeouts only*;<@&$env[cfg;qrole]>];true]
$addField[Warn escalation;$if[$env[cfg;warns;threshold]==;*off*;$env[cfg;warns;threshold] warns → $env[cfg;warns;action]];true]
$addField[Anti-nuke;$if[$env[cfg;antinuke;on]==true;ON — $if[$env[cfg;antinuke;threshold]!=;$env[cfg;antinuke;threshold];3] actions → $if[$env[cfg;antinuke;action]!=;$env[cfg;antinuke;action];ban];*off*];true]
$addField[Verification;$if[$env[cfg;verify;role]!=;ON — <@&$env[cfg;verify;role]>;*off*];true]
$addField[Automod;invites $if[$env[cfg;automod;invites]==true;**on**;off] · links $if[$env[cfg;automod;links]==true;**on**;off] · spam $if[$env[cfg;automod;spam]==true;**on**;off] · caps $if[$env[cfg;automod;caps]==true;**on**;off] · mentions $if[$env[cfg;automod;mentionLimit]==;off;>$env[cfg;automod;mentionLimit]];false]
$addField[Join gate;$if[$env[cfg;joingate;joins]==;*off*;$env[cfg;joingate;joins] joins / $env[cfg;joingate;window]s · min age $env[cfg;joingate;minAgeDays]d];false]
$footer[Chronolith • %quicksetup applies sane defaults]
    `
};
