/*
 * Chronolith — removenote: Remove notes by their IDs
 * Prefix command (mirrors the /removenote slash command).
 */
module.exports = {
    name: "removenote",
    aliases: ["removenotes", "deletenote", "deletenotes", "delnote", "delnotes"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-removenote;3s;]
$let[removed;0]
$!arrayLoad[nids; ;$message]
$!arrayForEach[nids;n;
$let[d;$noteDel[$guildID;$env[n]]]
$if[$get[d]==1;
$letSum[removed;1]
]
]
$onlyIf[$get[removed]>0;None of those note IDs exist.]
$description[🗑️ Removed \`$get[removed]\` note(s).]
$color[248046]
$footer[Chronolith • Notes]
    `
};
