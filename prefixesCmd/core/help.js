/*
 * Chronolith — help: Command guide (button-paginated)
 * Prefix command (mirrors the /help slash command).
 */
module.exports = {
    name: "help",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$author[Chronolith — moderation suite;$userAvatar[$botID;64;png]]
$description[$helpPage[0]]
$color[7C3AED]
$thumbnail[$userAvatar[$botID;256;png]]
$footer[Chronolith • Page 1 of $helpPages]
$addActionRow
$addButton[help--1-$authorID;◀;Primary]
$addButton[help-1-$authorID;▶;Primary]
    `
};
