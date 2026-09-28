/*
 * Chronolith — role: Add or remove a role from a member
 * Prefix command (mirrors the /role slash command).
 */
module.exports = {
    name: "role",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-role;3s;]
$let[mode;$toLowerCase[$message[0]]]
$onlyIf[$or[$get[mode]==add;$get[mode]==remove]==true;Usage: role add|remove <user> <role>]
$let[target;$findUser[$message[1]]]
$onlyIf[$get[target]!=;Could not resolve that user.]
$let[r;$replace[$replace[$message[2];<@&;];>;]]
$onlyIf[$get[r]!=;Mention the role.]
$if[$get[mode]==add;
$memberAddRoles[$guildID;$get[target];$get[r]]
$description[✅ Added <@&$get[r]> to <@$get[target]>.];
$memberRemoveRoles[$guildID;$get[target];$get[r]]
$description[✅ Removed <@&$get[r]> from <@$get[target]>.]
]
$footer[Chronolith]
    `
};
