/*
 * Chronolith — ping: Latency and stats
 * Prefix command (mirrors the /ping slash command).
 */
module.exports = {
    name: "ping",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$author[Chronolith;$userAvatar[$botID;32;png]]
$color[5865F2]
$description[**Gateway** $ping ms
**Uptime** $parseMS[$uptime]
**Servers** $guildCount]
$footer[Chronolith • Utility]
    `
};
