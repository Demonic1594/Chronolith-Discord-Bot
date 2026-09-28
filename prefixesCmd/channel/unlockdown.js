/*
 * Chronolith — unlockdown: Restore channels locked by lockdown
 * Prefix command (mirrors the /unlockdown slash command).
 */
module.exports = {
    name: "unlockdown",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-unlockdown;3s;]
$let[rc;$unlockAll[$guildID]]
$description[🔓 Restored $get[rc] channel(s).]
    `
};
