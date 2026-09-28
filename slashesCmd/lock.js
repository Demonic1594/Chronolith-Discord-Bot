/*
 * Chronolith — lock: Lock channels (or the server) — optional duration and/or reason
 * Slash command (mirrors the %lock prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "lock",
        description: "Lock channels (or the server) — optional duration and/or reason",
        options: [
            { type: 3, name: "targets", description: "Channels, IDs, or 'server' (default: here)", required: false },
            { type: 3, name: "duration", description: "e.g. 30s, 5m, 2h, 1d", required: false },
            { type: 3, name: "reason", description: "Reason", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$onlyIf[$hasPerms[$guildID;$botID;ManageChannels]==true;⛔ I am missing the Manage Channels permission.]
$let[tg;$default[$option[targets];here]]
$let[rc;$lockAll[$guildID;$if[$option[reason]==;no reason;$option[reason]];$authorID]]
$ephemeral
$interactionReply[
$description[🔒 \`$get[rc]\` channel(s) locked server-wide.$if[$option[duration]!=; Auto-unlock in **$option[duration]**.]]
$color[EF4444]
$footer[Chronolith • Lockdown]
]
    `
};
