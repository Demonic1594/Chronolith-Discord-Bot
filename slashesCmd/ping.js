/*
 * Chronolith — ping: Latency and stats
 * Slash command (mirrors the %ping prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "ping",
        description: "Latency and stats"
    },
    type: 0,
    code: `
$interactionReply[
$author[Chronolith;$userAvatar[$botID;32;png]]
$color[5865F2]
$description[**Gateway** $ping ms
**Uptime** $parseMS[$uptime]
**Servers** $guildCount]
$footer[Chronolith • Utility]
]
    `
};
