/*
 * Chronolith — userinfo: User profile and mod-relevant stats
 * Slash command (mirrors the %userinfo prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "userinfo",
        description: "User profile and mod-relevant stats",
        options: [
            { type: 6, name: "user", description: "User (default: you)", required: false },
        ]
    },
    type: 0,
    code: `
$let[target;$default[$option[user];$authorID]]
$interactionReply[
$author[$userTag[$get[target]];$userAvatar[$get[target];64;png]]
$color[7C3AED]
$thumbnail[$userAvatar[$get[target];256;png]]
$description[-# $get[target]]
$addField[Created;$discordTimestamp[$userCreatedAt[$get[target]];RelativeTime];true]
$if[$memberExists[$guildID;$get[target]]==true;
$addField[Joined;$discordTimestamp[$memberJoinedAt[$guildID;$get[target]];RelativeTime];true]
$addField[Warnings;\\\`$warnCount[$guildID;$get[target]]\\\`;true]
$if[$userBanner[$get[target]]!=;
$image[$userBanner[$get[target];1024;png]]
]
]
$footer[Chronolith]
]
    `
};
