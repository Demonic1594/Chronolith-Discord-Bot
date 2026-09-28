/*
 * Chronolith — close: Close/resolve a report (optionally with a note)
 * Prefix command (mirrors the /close slash command).
 */
module.exports = {
    name: "close",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-close;3s;]
$onlyIf[$message[0]!=;Usage: close <id> [note]]
$let[r;$reportUpdate[$guildID;$message[0];resolved;$authorID;$message[1;999]]]
$onlyIf[$get[r]==1;Report not found.]
$onlyIf[$get[r]!=-1;Invalid transition for that report.]
$description[✅ Report #$message[0] marked **resolved**.]
$color[22C55E]
$footer[Chronolith • Reports]
    `
};
