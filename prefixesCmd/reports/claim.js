/*
 * Chronolith — claim: Claim an open report
 * Prefix command (mirrors the /claim slash command).
 */
module.exports = {
    name: "claim",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-claim;3s;]
$onlyIf[$message[0]!=;Usage: claim <id> \\[note\\]]
$let[r;$reportUpdate[$guildID;$message[0];claimed;$authorID;$message[1;999]]]
$onlyIf[$get[r]==1;Report not found.]
$onlyIf[$get[r]!=-1;Invalid transition for that report.]
$description[✅ Report #$message[0] marked **claimed**.]
$color[248046]
$footer[Chronolith • Reports]
    `
};
