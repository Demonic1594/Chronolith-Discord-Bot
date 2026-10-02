/*
 * Chronolith — avatar: A user's avatar, full size
 * Slash command (mirrors the %avatar prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "avatar",
        description: "A user's avatar, full size",
        options: [
            { type: 6, name: "user", description: "User (default: you)", required: false },
        ]
    },
    type: 0,
    code: `
$let[target;$default[$option[user];$authorID]]
$interactionReply[
$description[$userTag[$get[target]]'s avatar]
$image[$userAvatar[$get[target];1024;png]]
]
    `
};
