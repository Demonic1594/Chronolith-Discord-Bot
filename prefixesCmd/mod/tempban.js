/*
 * Chronolith — tempban: Ban temporarily — auto-unban on schedule
 * Prefix command (mirrors the /tempban slash command).
 */
module.exports = {
    name: "tempban",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-tempban;3s;]
$let[target;$findUser[$message[0]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$onlyIf[$message[1]!=;Usage: tempban <user> <duration> \\[reason\\]]
$let[n;$tempban[$guildID;$authorID;$get[target];$message[1];$if[$message[2;999]==;No reason provided;$message[2;999]]]]
$description[⛔ <@$get[target]> banned for **$message[1]** — case #$get[n].]
$color[EF4444]
$footer[Chronolith]
    `
};
