/*
 * Chronolith — banner: A user's profile banner, full size
 * Slash command (mirrors the %banner prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "banner",
        description: "A user's profile banner, full size",
        options: [
            { type: 6, name: "user", description: "User (default: you)", required: false },
        ]
    },
    type: 0,
    code: `
$let[target;$default[$option[user];$authorID]]
$interactionReply[
$description[$userTag[$get[target]]'s banner]
$image[$userBanner[$get[target];1024;png]]
$footer[Chronolith • Utility]
]
    `
};
