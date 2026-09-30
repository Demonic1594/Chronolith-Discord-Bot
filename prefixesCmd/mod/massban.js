/*
 * Chronolith — massban: Ban many users by ID at once
 * Prefix command (mirrors the /massban slash command).
 */
module.exports = {
    name: "massban",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-massban;3s;]
$onlyIf[$message[0]!=;Usage: massban <id> <id> ...]
$let[done;$massBan[$guildID;$authorID;$message]]
$description[⛔ Banned **$get[done]** user(s).]
$color[F23F24]
$footer[Chronolith • Moderation]
    `
};
