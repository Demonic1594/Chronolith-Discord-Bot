/*
 * Chronolith — softban: Softban a user (ban + day purge + unban)
 * Prefix command (mirrors the /softban slash command).
 */
module.exports = {
    name: "softban",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-softban;3s;]
$let[t;$resolveTargets[$guildID;$message;$channelID;$messageID]]
$!jsonLoad[tj;$get[t]]
$onlyIf[$env[tj;ids]!=;No valid target found. Mention a user, or type a username/ID.]
$let[dur;]
$let[rest;$env[tj;reason]]
$let[r;$punishMulti[softban;$guildID;$authorID;$env[tj;ids];$get[dur];$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]]]
$!jsonLoad[rj;$get[r]]
**__The Ban Hammer has swept clean!__**
$author[Server Management]
$title[$serverName[$guildID]]
$color[$actionColor[softban]]
$description[• **Action :** \`softban\`
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
$thumbnail[https://cdn.discordapp.com/emojis/1129080609248137266.png?size=4096]
$footer[Rule breakers begone! • Chronolith]
$timestamp
    `
};
