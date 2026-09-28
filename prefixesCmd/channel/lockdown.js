/*
 * Chronolith — lockdown: Lock every text channel instantly (panic button)
 * Prefix command (mirrors the /lockdown slash command).
 */
module.exports = {
    name: "lockdown",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-lockdown;3s;]
$let[rc;$lockAll[$guildID]]
$description[🚨 Locking down $get[rc] channel(s).]
    `
};
