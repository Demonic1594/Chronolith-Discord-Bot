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
$author[Chronolith;$userAvatar[$botID;32;png]]
$color[5865F2]
$description[**Gateway** $ping ms · $guildCount servers · $userCount users
**Runtime** $parseMS[$uptime] · $round[$ram] MB · Node $nodeVersion]
$footer[Chronolith • Utility]
    `
};
