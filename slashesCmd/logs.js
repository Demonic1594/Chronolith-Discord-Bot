/*
 * Chronolith — logs: Set log channels (joinleave, serverlogs)
 * Slash command (mirrors the %logs prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "logs",
        description: "Set log channels (joinleave, serverlogs)",
        options: [
            { type: 3, name: "kind", description: "joinleave or serverlogs", required: true },
            { type: 7, name: "channel", description: "Channel (omit to disable)", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[c;$default[$option[channel];]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;logs;$option[kind];$get[c]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$interactionReply[$description[📋 $option[kind] log updated.]]
    `
};
