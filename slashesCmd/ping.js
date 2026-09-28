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
$author[Chronolith;$userAvatar[$botID;64;png]]
$title[🏓 Pong]
$color[22C55E]
$addField[API latency;$ping ms;true]
$addField[Uptime;$parseMS[$uptime];true]
$addField[Guilds;$guildCount;true]
$footer[Chronolith]
]
    `
};
