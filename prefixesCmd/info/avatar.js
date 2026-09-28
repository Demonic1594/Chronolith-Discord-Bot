/*
 * Chronolith — avatar: A user's avatar, full size
 * Prefix command (mirrors the /avatar slash command).
 */
module.exports = {
    name: "avatar",
    aliases: ["pfp"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$let[target;$if[$message[0]!=;$findUser[$message[0]];$authorID]]
$description[$userTag[$get[target]]'s avatar]
$image[$userAvatar[$get[target];1024;png]]
    `
};
