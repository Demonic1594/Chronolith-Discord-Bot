/*
 * Chronolith — kick: Kick one or more users
 * Prefix command (mirrors the /kick slash command).
 */
module.exports = {
    name: "kick",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-kick;3s;]
$let[t;$resolveTargets[$guildID;$message;$channelID;$messageID]]
$!jsonLoad[tj;$get[t]]
$onlyIf[$env[tj;ids]!=;No valid target found. Mention a user, or type a username/ID.]
$let[dur;]
$let[rest;$env[tj;reason]]
$let[r;$punishMulti[kick;$guildID;$authorID;$env[tj;ids];$get[dur];$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]]]
$!jsonLoad[rj;$get[r]]
**__The Boot has spoken!__**
$author[Server Management]
$title[$serverName[$guildID]]
$color[$actionColor[kick]]
$description[• **Action :** \`kick\`
> **Reason:** \`$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]\`
> **Member:** $if[$checkContains[$env[tj;ids];,]!=true;[$username[$env[tj;ids]]\\](https://discord.com/users/$env[tj;ids]) (\`$env[tj;ids]\`);<@$env[tj;ids]>]
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID) (\`$authorID\`)]

$footer[Rule breakers begone!]
$timestamp
    `
};
