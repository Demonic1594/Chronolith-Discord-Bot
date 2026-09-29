/*
 * Chronolith — modrole: Add or remove a moderator role
 * Prefix command (mirrors the /modrole slash command).
 */
module.exports = {
    name: "modrole",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-modrole;3s;]
$onlyIf[$message[0]!=;Usage: modrole add|remove <role>]
$let[mode;$toLowerCase[$message[0]]]
$onlyIf[$or[$get[mode]==add;$get[mode]==remove]==true;Usage: modrole add|remove <role>]
$let[r;$replace[$replace[$message[1];<@&;];>;]]
$onlyIf[$get[r]!=;Mention the role.]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!arrayLoad[rs;,;$env[cfg;modroles]]
$if[$get[mode]==add;
$if[$arrayIncludes[rs;$get[r]]!=true;
$!arrayPush[rs;$get[r]]
$!jsonSet[cfg;modroles;$arrayJoin[rs;,]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[✅ <@&$get[r]> is now a mod role.];
$description[Already a mod role.]
];
$let[i;$arrayIndexOf[rs;$get[r]]]
$if[$get[i]==-1;
$description[Not a mod role.];
$!arraySplice[rs;$get[i];1]
$!jsonSet[cfg;modroles;$arrayJoin[rs;,]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[✅ <@&$get[r]> removed from mod roles.]
]
]
    `
};
