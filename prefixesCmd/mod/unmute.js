/*
 * Chronolith — unmute: Remove timeouts from one or more users
 * Prefix command (mirrors the /unmute slash command).
 */
module.exports = {
    name: "unmute",
    aliases: ["untimeout"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-unmute;3s;]
$let[t;$resolveTargets[$guildID;$message;$channelID;$messageID]]
$!jsonLoad[tj;$get[t]]
$onlyIf[$env[tj;ids]!=;No valid target found. Mention a user, or type a username/ID.]
$let[dur;]
$let[rest;$env[tj;reason]]
$let[r;$punishMulti[unmute;$guildID;$authorID;$env[tj;ids];$get[dur];$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]]]
$!jsonLoad[rj;$get[r]]
$author[$actionEmoji[unmute];$userAvatar[$botID;32;png]]
$color[$actionColor[unmute]]
$description[<@$env[tj;ids]>]
$addField[Applied;$env[rj;ok];true]
$addField[Skipped;$env[rj;fail];true]
$addField[Reason;$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]];false]
$footer[Chronolith]
$timestamp
    `
};
