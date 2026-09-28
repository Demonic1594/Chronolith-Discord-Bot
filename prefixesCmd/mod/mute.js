/*
 * Chronolith — mute: Timeout one or more users (duration required)
 * Prefix command (mirrors the /mute slash command).
 */
module.exports = {
    name: "mute",
    aliases: ["timeout", "timeout"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-mute;3s;]
$let[t;$resolveTargets[$guildID;$message;$channelID;$messageID]]
$!jsonLoad[tj;$get[t]]
$onlyIf[$env[tj;ids]!=;No valid target found. Mention a user, or type a username/ID.]
$let[dur;]
$let[rest;]
$if[$env[tj;reason]!=;
$arrayLoad[rt; ;$env[tj;reason]]
$arrayForEach[rt;w;
$if[$get[dur]==;
$if[$isNumber[$replace[$replace[$replace[$replace[$replace[$env[w];s;];m;];h;];d;];w;]]==true;
$let[dur;$env[w]]
;
$let[rest;$get[rest] $env[w]]
]
]
]
]
$onlyIf[$get[dur]!=;A duration is required: mute <targets> <duration> [reason]]
$let[r;$punishMulti[mute;$guildID;$authorID;$env[tj;ids];$get[dur];$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]]]
$!jsonLoad[rj;$get[r]]
$author[$actionEmoji[mute];$userAvatar[$botID;64;png]]
$color[$actionColor[mute]]
$description[**$env[tj;ids]**]
$addField[Done;\`$env[rj;ok]\`;true]
$addField[Skipped;\`$env[rj;fail]\`;true]
$addField[Reason;$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]];false]
$footer[Chronolith • Moderation]
    `
};
