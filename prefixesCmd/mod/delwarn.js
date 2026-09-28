/*
 * Chronolith — delwarn: Remove one warning by case number
 * Prefix command (mirrors the /delwarn slash command).
 */
module.exports = {
    name: "delwarn",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-delwarn;3s;]
$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$onlyIf[$message[1]!=;Usage: delwarn <user> <case#>]
$description[$caseEditReason[$guildID;$message[1];Removed by moderator <@$authorID>]]
$addField[Note;Warning kept as history with an amended reason.;false]
    `
};
