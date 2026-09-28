/*
 * Chronolith — addnote: Add a staff note to a user
 * Prefix command (mirrors the /addnote slash command).
 */
module.exports = {
    name: "addnote",
    aliases: ["setnote"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-addnote;3s;]
$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$onlyIf[$message[1;999]!=;Note content is required.]
$let[n;$addNote[$guildID;$get[target];$authorID;$message[1;999]]]
$author[📝 Note #$get[n];$userAvatar[$get[target];64;png]]
$description[**$userTag[$get[target]]**
> $message[1;999]]
$color[7C3AED]
$footer[Chronolith • Notes]
    `
};
