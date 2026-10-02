/*
 * Chronolith — serverinfo: Server overview
 * Slash command (mirrors the %serverinfo prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "serverinfo",
        description: "Server overview"
    },
    type: 0,
    code: `
$interactionReply[
$description[$guildName[$guildID]]
$color[5865F2]
$addField[Owner;<@$guildOwnerID>;true]
$addField[Members;$guildMemberCount[$guildID];true]
$addField[Created;$discordTimestamp[$guildCreatedAt;RelativeTime];true]
$thumbnail[$guildIcon[$guildID;256;png]]
]
    `
};
