/*
 * Chronolith — modstats: Moderation statistics for a moderator (default: you)
 * Prefix command (mirrors the /modstats slash command).
 */
module.exports = {
    name: "modstats",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-modstats;3s;]
$let[m;$if[$message[0]!=;$findUser[$message[0]];$authorID]]
$onlyIf[$get[m]!=;Could not resolve that user.]
$let[raw;$modStats[$guildID;$get[m]]]
$if[$get[raw]==;
$description[<@$get[m]> has no recorded moderation actions yet.]
$color[#4E5058];
$!jsonLoad[st;$get[raw]]
$author[Mod stats • $userTag[$get[m]];$userAvatar[$get[m];64;png]]
$thumbnail[$userAvatar[$get[m];256;png]]
$description[Actions recorded by this moderator]
$addField[Warns;\`$default[$env[st;warn];0]\`;true]
$addField[Kicks;\`$default[$env[st;kick];0]\`;true]
$addField[Bans;\`$default[$env[st;ban];0]\`;true]
$addField[Hardbans;\`$default[$env[st;hardban];0]\`;true]
$addField[Mutes;\`$default[$env[st;mute];0]\`;true]
$addField[Softbans;\`$default[$env[st;softban];0]\`;true]
$color[5865F2]
$footer[Chronolith • Stats]
]
    `
};
