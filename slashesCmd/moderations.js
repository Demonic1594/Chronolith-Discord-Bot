/*
 * Chronolith — moderations: Show active timed bans, timeouts and lockdowns
 * Slash command (mirrors the %moderations prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "moderations",
        description: "Show active timed bans, timeouts and lockdowns"
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[all;$timedList[$guildID]]
$ephemeral
$interactionReply[
$author[Active timed moderations;$userAvatar[$botID;64;png]]
$description[$get[all]]
$color[7C3AED]
]
    `
};
