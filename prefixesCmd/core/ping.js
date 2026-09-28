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
$author[Chronolith;$userAvatar[$botID;64;png]]
$title[🏓 Pong]
$color[22C55E]
$addField[API latency;$ping ms;true]
$addField[Uptime;$parseMS[$uptime];true]
$addField[Guilds;$guildCount;true]
$footer[Chronolith]
    `
};
