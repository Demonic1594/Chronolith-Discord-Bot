/*
 * Chronolith — words: List banned words
 * Slash command (mirrors the %words prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "words",
        description: "List banned words"
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$interactionReply[$if[$env[cfg;automod;words]==;No banned words configured.;Banned words: $env[cfg;automod;words]]]
    `
};
