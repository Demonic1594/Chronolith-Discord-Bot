/*
 * Chronolith — modstats: Moderation statistics for a moderator (default: you)
 * Slash command (mirrors the %modstats prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "modstats",
        description: "Moderation statistics for a moderator (default: you)",
        options: [
            { type: 6, name: "user", description: "Moderator (default: you)", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$let[m;$default[$option[user];$authorID]]
$let[raw;$modStats[$guildID;$get[m]]]
$if[$get[raw]==;
$ephemeral
$interactionReply[No recorded moderation actions yet.]
$stop
]
$!jsonLoad[st;$get[raw]]
$interactionReply[
$author[Mod stats • $userTag[$get[m]];$userAvatar[$get[m];64;png]]
$addField[Warns;\`$default[$env[st;warn];0]\`;true]
$addField[Kicks;\`$default[$env[st;kick];0]\`;true]
$addField[Bans;\`$default[$env[st;ban];0]\`;true]
$addField[Mutes;\`$default[$env[st;mute];0]\`;true]
$color[5865F2]
]
    `
};
