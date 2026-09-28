/*
 * Chronolith — help: Command guide (button-paginated)
 * Slash command (mirrors the %help prefix command).
 */
module.exports = {
    data: {
        type: 1,
        name: "help",
        description: "Command guide (button-paginated)"
    },
    type: 0,
    code: `
$interactionReply[
$author[Chronolith — moderation suite;$userAvatar[$botID;64;png]]
$description[$helpPage[0]]
$color[7C3AED]
$thumbnail[$userAvatar[$botID;256;png]]
$footer[Chronolith • Page 1 of $helpPages]
$addActionRow
$addButton[help--1-$authorID;◀;Primary]
$addButton[help-1-$authorID;▶;Primary]
]
    `
};
