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
$if[$get[dur]==;
$if[$isNumber[$replace[$replace[$replace[$replace[$replace[$env[w];s;];m;];h;];d;];w;]]==true;
$let[dur;$env[w]]
;
$let[rest;$get[rest] $env[w]]
]
]
]
]
$onlyIf[$get[dur]!=;A duration is required: hardban <targets> <duration> \\[reason\\]]
$let[r;$punishMulti[hardban;$guildID;$authorID;$env[tj;ids];$get[dur];$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]]]
$!jsonLoad[rj;$get[r]]
$author[$actionEmoji[hardban];$userAvatar[$botID;32;png]]
$color[$actionColor[hardban]]
$description[<@$env[tj;ids]>
> $if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]
]
$addField[Applied;$env[rj;ok];true]
$addField[Skipped;$env[rj;fail];true]
$footer[Chronolith • Moderation]
$timestamp
    `
};
