/*
 * Chronolith — unlock: Unlock channels (or every locked channel with 'server')
 * Slash command (mirrors the %unlock prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "unlock",
        description: "Unlock channels (or every locked channel with 'server')",
        options: [
            { type: 3, name: "targets", description: "Channels, IDs, or 'server' (default: here)", required: false },
            { type: 3, name: "reason", description: "Reason", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$onlyIf[$hasPerms[$guildID;$botID;ManageChannels]==true;⛔ I am missing the Manage Channels permission.]
$let[n;$unlockAll[$guildID;$authorID]]
$interactionReply[
$description[🔓 \`$get[n]\` channel(s) unlocked.]
$color[22C55E]
$footer[Chronolith • Lockdown]
]
    `
};
