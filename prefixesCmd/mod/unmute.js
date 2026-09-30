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
**__Silence has been lifted.__**
$author[Server Management]
$title[$serverName[$guildID]]
$color[$actionColor[unmute]]
$description[• **Action :** \`unmute\`
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
