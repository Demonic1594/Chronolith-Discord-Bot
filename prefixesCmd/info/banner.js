/*
 * Chronolith — banner: A user's profile banner, full size
 * Prefix command (mirrors the /banner slash command).
 */
module.exports = {
    name: "banner",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$let[target;$if[$message[0]!=;$findUser[$message[0]];$authorID]]
$description[$userTag[$get[target]]'s banner]
$image[$userBanner[$get[target];1024;png]]
$footer[Chronolith • Utility]
    `
};
