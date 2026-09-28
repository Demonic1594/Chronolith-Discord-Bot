/*
 * Chronolith — stats: Bot statistics
 * Prefix command (mirrors the /stats slash command).
 */
module.exports = {
    name: "stats",
    aliases: ["about"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$author[Chronolith;$userAvatar[$botID;64;png]]
$color[7C3AED]
$addField[Uptime;$parseMS[$uptime];true]
$addField[Ping;$ping ms;true]
$addField[Guilds;$guildCount;true]
$addField[Users;$userCount;true]
$addField[Memory;$round[$ram] MB;true]
$addField[Node;$nodeVersion;true]
$footer[Chronolith • ForgeScript]
    `
};
