/*
 * Chronolith — editsnipe: Show a message's text before it was edited (mods only)
 * Prefix command (mirrors the /editsnipe slash command).
 */
module.exports = {
    name: "editsnipe",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-editsnipe;3s;]
$let[i;$default[$message[0];0]]
$let[e;$snipeGet[$guildID;$channelID;esnipe;$get[i]]]
$onlyIf[$get[e]!=;No recent edits in this channel.]
$!jsonLoad[e;$get[e]]
$description[**Before:** $env[e;before]
**After:** $env[e;after]]
$addField[Author;<@$env[e;a]>;true]
$color[#4E5058]
    `
};
