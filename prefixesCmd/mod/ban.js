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
$author[$actionEmoji[ban];$userAvatar[$botID;64;png]]
$color[$actionColor[ban]]
$description[**$env[tj;ids]**]
$addField[Done;\`$env[rj;ok]\`;true]
$addField[Skipped;\`$env[rj;fail]\`;true]
$addField[Reason;$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]];false]
$footer[Chronolith • Moderation]
    `
};
