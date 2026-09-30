/*
 * Chronolith — mute: Timeout one or more users (duration required)
 * Prefix command (mirrors the /mute slash command).
 */
module.exports = {
    name: "mute",
    aliases: ["timeout"],
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
$!arrayLoad[rt; ;$env[tj;reason]]
$!arrayForEach[rt;w;
$if[$and[$get[dur]==;$isNumber[$replace[$replace[$replace[$replace[$replace[$env[w];s;];m;];h;];d;];w;]]==true]==true;
$let[dur;$env[w]]
;
$let[rest;$get[rest]$if[$get[rest]!=; ]$env[w]]
]
]
]

$onlyIf[$get[dur]!=;A duration is required: mute <targets> <duration> \\[reason\\]]
$let[r;$punishMulti[mute;$guildID;$authorID;$env[tj;ids];$get[dur];$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]]]
$!jsonLoad[rj;$get[r]]
**__Silence has been decreed.__**
$author[Server Management]
$title[$serverName[$guildID]]
$color[$actionColor[mute]]
$description[• **Action :** \`mute\`
$if[$checkContains[$env[tj;ids];,]!=true;
> **Member:** [$username[$env[tj;ids]]\\](https://discord.com/users/$env[tj;ids]) (\`$env[tj;ids]\`)
;
> **Members:** <@$env[tj;ids]>
]
> **Reason:** \`$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]\`
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID) (\`$authorID\`)
$if[$env[rj;fail]!=;
> ⚠ Skipped: $env[rj;fail]]
]

$footer[Rule breakers begone! • Chronolith]
$timestamp
    `
};
