/*
 * Chronolith — slowmode: Set channel slowmode (seconds, or off)
 * Prefix command (mirrors the /slowmode slash command).
 */
module.exports = {
    name: "slowmode",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-slowmode;3s;]
$let[s;$if[$message[0]==off;0;$message[0]]]
$onlyIf[$and[$get[s]>=0;$get[s]<=21600]==true;Usage: slowmode <seconds|off>]
$let[r;$setChannelSlowmode[$channelID;$get[s]]]
$description[🐢 Slowmode in <#$channelID> set to $get[s]s.]
    `
};
