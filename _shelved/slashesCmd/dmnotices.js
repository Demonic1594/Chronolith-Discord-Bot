/*
 * Chronolith — dmnotices: Toggle DM notices for moderation actions (failed DMs never fail the action)
 * Slash command (mirrors the %dmnotices prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "dmnotices",
        description: "Toggle DM notices for moderation actions (failed DMs never fail the action)",
        options: [
            { type: 3, name: "state", description: "on or off", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;dmnotices;$option[state]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$ephemeral DM notices updated.]
    `
};
