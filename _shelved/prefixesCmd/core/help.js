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
$author[Chronolith;$userAvatar[$botID;32;png]]
$description[$helpPage[0]]
$color[5865F2]
$thumbnail[$userAvatar[$botID;128;png]]
$footer[Chronolith • Page 1 of $helpPages]
$addActionRow
$addButton[help--1-$authorID;◀;Primary]
$addButton[help-1-$authorID;▶;Primary]
    `
};
