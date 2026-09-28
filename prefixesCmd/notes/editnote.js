/*
 * Chronolith — editnote: Edit a note (original author kept, editor recorded)
 * Prefix command (mirrors the /editnote slash command).
 */
module.exports = {
    name: "editnote",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-editnote;3s;]
$onlyIf[$message[0]!=;Usage: editnote <note id> <new content>]
$onlyIf[$message[1;999]!=;Provide the new content.]
$let[d;$noteEdit[$guildID;$message[0];$authorID;$message[1;999]]]
$onlyIf[$get[d]==1;Note not found.]
$description[✏️ Note #$message[0] updated — original author preserved, your edit recorded.]
$color[22C55E]
$footer[Chronolith • Notes]
    `
};
