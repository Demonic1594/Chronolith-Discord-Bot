/*
 * Chronolith — purge: Purge messages with filters (pinned are ignored)
 * Slash command (mirrors the %purge prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "purge",
        description: "Purge messages with filters (pinned are ignored)",
        options: [
            { type: 3, name: "mode", description: "all, bot, contains, embeds, emoji, files, images, links, mentions, human, reactions", required: false },
            { type: 4, name: "search", description: "How many to scan (default 100)", required: false },
            { type: 3, name: "extra", description: "substring / prefix", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$onlyIf[$hasPerms[$guildID;$botID;ManageMessages]==true;$ephemeral I am missing the Manage Messages permission.]
$let[scan;$scanMessages[$channelID;$if[$option[search]>500;500;$option[search]]]]
$!jsonLoad[found;$get[scan]]
$interactionReply[$ephemeral 🧹 Purge queued — \`$option[mode]\` mode.]
    `
};
