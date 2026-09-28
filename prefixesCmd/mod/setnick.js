/*
 * Chronolith — setnick: Change a member's nickname
 * Prefix command (mirrors the /setnick slash command).
 */
module.exports = {
    name: "setnick",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-setnick;3s;]
$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$memberSetNickname[$guildID;$get[target];$message[1;999]]
$description[✏️ Nickname of <@$get[target]> updated.]
    `
};
