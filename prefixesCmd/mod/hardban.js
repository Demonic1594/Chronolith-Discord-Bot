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
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-hardban;3s;]
$let[t;$resolveTargets[$guildID;$message;$channelID;$messageID]]
$!jsonLoad[tj;$get[t]]
$onlyIf[$env[tj;ids]!=;No valid target found. Mention a user, or type a username/ID.]
$let[dur;]
$let[rest;]
$arrayLoad[rt; ;$env[tj;reason]]
$arrayForEach[rt;w;
$if[$get[dur]==;
$if[$and[$charCount[$env[w]]>=2;$checkContains[smhd;$cropText[$env[w];$charCount[$env[w]];$charCount[$env[w]]]]==true;$checkCondition[$cropText[$env[w];1;$math[$charCount[$env[w]]-1]] + 0 >= 0]]==true;
$let[dur;$env[w]]
;
$let[rest;$get[rest] $env[w]]
]
]
]
$let[r;$punishMulti[hardban;$guildID;$authorID;$env[tj;ids];$get[dur];$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]]]
$!jsonLoad[rj;$get[r]]
$author[$actionEmoji[hardban];$userAvatar[$botID;64;png]]
$color[$actionColor[hardban]]
$description[**$env[tj;ids]**]
$addField[Done;\`$env[rj;ok]\`;true]
$addField[Skipped;\`$env[rj;fail]\`;true]
$addField[Reason;$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]];false]
$footer[Chronolith • Moderation]
    `
};
