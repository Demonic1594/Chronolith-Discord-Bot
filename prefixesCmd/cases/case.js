/*
 * Chronolith — case: Inspect a case by number
 * Prefix command (mirrors the /case slash command).
 */
module.exports = {
    name: "case",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-case;3s;]
$onlyIf[$message[0]!=;Usage: case <number>]
$let[raw;$caseGet[$guildID;$message[0]]]
$onlyIf[$get[raw]!=;Case not found.]
$!jsonLoad[c;$get[raw]]
$author[Modlog • Case #$message[0];$userAvatar[$env[c;u];64;png]]
$color[$actionColor[$env[c;t]]]
$description[$modlogEntries[$guildID;$message[0]]]
$footer[Chronolith • Modlog • %reason <case#> <text> to edit]
$timestamp
    `
};
