/*
 * Chronolith — serverinfo: Server overview
 * Prefix command (mirrors the /serverinfo slash command).
 */
module.exports = {
    name: "serverinfo",
    aliases: ["guildinfo"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$description[$guildName[$guildID]]
$color[5865F2]
$addField[Owner;<@$guildOwnerID>;true]
$addField[Members;$guildMemberCount[$guildID];true]
$addField[Channels;$arrayLength[$arrayLoad[chs;,;$channelIDs]];true]
$addField[Created;$discordTimestamp[$guildCreatedAt;RelativeTime];true]
$thumbnail[$guildIcon[$guildID;256;png]]
    `
};
