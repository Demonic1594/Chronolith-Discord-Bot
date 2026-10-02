/*
 * Chronolith — inrole: List members holding a role
 * Prefix command (mirrors the /inrole slash command).
 */
module.exports = {
    name: "inrole",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$let[r;$replace[$replace[$message[0];<@&;];>;]]
$onlyIf[$get[r]!=;Usage: inrole <role>]
$let[ids;$roleMembers[$guildID;$get[r];, <@>]]
$if[$replace[$get[ids]; ;]==;
$description[Nobody holds that role.];
$description[Members with that role]
$addField[Count;$arrayLength[$arrayLoad[rm;,;$roleMembers[$guildID;$get[r];,]]];true]
$addField[Members;<@$get[ids]>;false]
]
    `
};
