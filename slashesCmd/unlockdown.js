/*
 * Chronolith — unlockdown: Restore channels locked by lockdown
 * Slash command (mirrors the %unlockdown prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "unlockdown",
        description: "Restore channels locked by lockdown"
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[rc;$unlockAll[$guildID]]
$interactionReply[$description[🔓 Restored $get[rc] channel(s).]]
    `
};
