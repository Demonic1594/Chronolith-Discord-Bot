/*
 * Chronolith — stats: Bot statistics
 * Slash command (mirrors the %stats prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "stats",
        description: "Bot statistics"
    },
    type: 0,
    code: `
$interactionReply[
$author[Chronolith;$userAvatar[$botID;64;png]]
$color[5865F2]
$addField[Uptime;$parseMS[$uptime];true]
$addField[Ping;$ping ms;true]
$addField[Guilds;$guildCount;true]
$addField[Users;$userCount;true]
$footer[Chronolith • ForgeScript]
]
    `
};
