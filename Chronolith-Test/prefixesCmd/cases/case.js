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
$let[raw;$getGuildVar[case_$message[0];$guildID;]]
$onlyIf[$get[raw]!=;Case not found.]
$!jsonLoad[c;$get[raw]]
$author[Modlog • Case #$message[0];$userAvatar[$env[c;u];64;png]]
$color[$if[$or[$env[c;t]==ban;$or[$env[c;t]==kick;$or[$env[c;t]==hardban;$or[$env[c;t]==softban;$or[$env[c;t]==lock;$env[c;t]==nuke]]]]]==true;F23F24;$if[$env[c;t]==unban;#248046;5865F2]]]
$description[$modlogEntries[$guildID;$message[0]]]
$footer[Chronolith • Modlog • %reason <case#> <text> to edit]
$timestamp
    `
};
