/*
 * Chronolith — roleinfo: Role details
 * Prefix command (mirrors the /roleinfo slash command).
 */
module.exports = {
    name: "roleinfo",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$let[r;$replace[$replace[$message[0];<@&;];>;]]
$onlyIf[$get[r]!=;Usage: roleinfo <role>]
$description[@$roleName[$guildID;$get[r]]]
$color[5865F2]
$addField[ID;$get[r];true]
$addField[Position;$rolePosition[$guildID;$get[r];true] of $roleCount[$guildID];true]
$addField[Mention;<@&$get[r]>;true]
    `
};
