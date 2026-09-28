/*
 * Chronolith — lockdown: Lock every text channel instantly (panic button)
 * Slash command (mirrors the %lockdown prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "lockdown",
        description: "Lock every text channel instantly (panic button)"
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[rc;$lockAll[$guildID]]
$interactionReply[$description[🚨 Locking down $get[rc] channel(s).]]
    `
};
