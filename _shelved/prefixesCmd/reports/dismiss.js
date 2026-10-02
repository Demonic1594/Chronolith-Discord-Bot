/*
 * Chronolith — dismiss: Dismiss a report
 * Prefix command (mirrors the /dismiss slash command).
 */
module.exports = {
    name: "dismiss",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-dismiss;3s;]
$onlyIf[$message[0]!=;Usage: dismiss <id> \\[note\\]]
$let[r;$reportUpdate[$guildID;$message[0];dismissed;$authorID;$message[1;999]]]
$onlyIf[$get[r]==1;Report not found.]
$onlyIf[$get[r]!=-1;Invalid transition for that report.]
$description[✅ Report #$message[0] marked **dismissed**.]
$color[248046]
$footer[Chronolith • Reports]
    `
};
