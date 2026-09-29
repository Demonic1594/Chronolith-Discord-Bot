/*
 * Chronolith — archivereport: Delete a report record entirely
 * Prefix command (mirrors the /archivereport slash command).
 */
module.exports = {
    name: "archivereport",
    aliases: ["rarchive"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-archivereport;3s;]
$onlyIf[$message[0]!=;Usage: archivereport <id>]
$let[r;$reportArchive[$guildID;$message[0]]]
$onlyIf[$get[r]==1;Report not found.]
$description[📦 Report #$message[0] archived (record deleted).]
$color[#4E5058]
$footer[Chronolith • Reports]
    `
};
