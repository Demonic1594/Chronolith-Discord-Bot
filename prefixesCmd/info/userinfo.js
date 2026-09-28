/*
 * Chronolith — userinfo: User profile and mod-relevant stats
 * Prefix command (mirrors the /userinfo slash command).
 */
module.exports = {
    name: "userinfo",
    aliases: ["whois"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$let[target;$if[$message[0]!=;$findUser[$message[0]];$authorID]]
$author[$userTag[$get[target]];$userAvatar[$get[target];32;png]]
$color[5865F2]
$thumbnail[$userAvatar[$get[target];128;png]]
$description[-# $get[target]]
$addField[Created;$discordTimestamp[$userCreatedAt[$get[target]];RelativeTime];true]
$if[$memberExists[$guildID;$get[target]]==true;
$addField[Joined;$discordTimestamp[$memberJoinedAt[$guildID;$get[target]];RelativeTime];true]
$addField[Roles;$math[$arrayLength[$arrayLoad[rs;,;$memberRoles[$guildID;$get[target];,]]]];true]
$addField[Warnings;\\\`$warnCount[$guildID;$get[target]]\\\`;true]
$if[$userBanner[$get[target]]!=;
$image[$userBanner[$get[target];1024;png]]
]
]
$footer[Chronolith]
    `
};
