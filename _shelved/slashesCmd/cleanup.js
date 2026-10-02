/*
 * Chronolith — cleanup: Purge the bot's own messages (pinned included)
 * Slash command (mirrors the %cleanup prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "cleanup",
        description: "Purge the bot's own messages (pinned included)",
        options: [
            { type: 4, name: "search", description: "How many to scan (default 100)", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[scan;$scanMessages[$channelID;$default[$option[search];100]]]
$!jsonLoad[found;$get[scan]]
$interactionReply[$ephemeral 🧹 Cleanup queued.]
    `
};
