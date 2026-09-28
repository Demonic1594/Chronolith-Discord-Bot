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
$author[Chronolith;$userAvatar[$botID;32;png]]
$description[$helpPage[0]]
$color[5865F2]
$thumbnail[$userAvatar[$botID;128;png]]
$footer[Chronolith • Page 1 of $helpPages]
$addActionRow
$addButton[help--1-$authorID;◀;Primary]
$addButton[help-1-$authorID;▶;Primary]
]
    `
};
