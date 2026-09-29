/*
 * Chronolith — snipe: Recover a deleted message (mods only)
 * Prefix command (mirrors the /snipe slash command).
 */
module.exports = {
    name: "snipe",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-snipe;3s;]
$let[i;$default[$message[0];0]]
$let[e;$snipeGet[$guildID;$channelID;snipe;$get[i]]]
$onlyIf[$get[e]!=;Nothing to snipe in this channel.]
$!jsonLoad[e;$get[e]]
$description[$if[$env[e;c]==;*(empty message)*;$env[e;c]]]
$addField[Author;<@$env[e;a]>;true]
$addField[Deleted;$discordTimestamp[$env[e;t];RelativeTime];true]
$color[4E5058]
    `
};
