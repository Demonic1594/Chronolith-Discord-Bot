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
$description[Case #$message[0] — $toUpperCase[$env[c;t]]]
$color[5865F2]
$addField[User;<@$env[c;u]>;true]
$addField[Moderator;<@$env[c;m]>;true]
$addField[Duration;$if[$env[c;d]==;n/a;$env[c;d]];true]
$addField[Reason;$env[c;r];false]
$addField[When;$discordTimestamp[$env[c;ts];RelativeTime];true]
    `
};
