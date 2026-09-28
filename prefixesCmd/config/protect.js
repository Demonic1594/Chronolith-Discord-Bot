/*
 * Chronolith — protect: Configure protected roles/users (cannot be moderated here)
 * Prefix command (mirrors the /protect slash command).
 */
module.exports = {
    name: "protect",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-protect;3s;]
$if[$message[0]==;
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$author[Protection;$userAvatar[$botID;64;png]]
$description[Protected members cannot be moderated in this server — enabled by default, applies alongside owner protection and role hierarchy.]
$addField[Protected roles;$if[$env[cfg;protected;roles]==;*none*;<@&$replace[$env[cfg;protected;roles];,;>, <@&>]>];true]
$addField[Protected users;$if[$env[cfg;protected;users]==;*none*;<@$replace[$env[cfg;protected;users];,;>, <@>]>];true]
$color[7C3AED]
$footer[Chronolith • %protect role|user add|remove <target>];
$let[kind;$toLowerCase[$message[0]]]
$let[act;$toLowerCase[$message[1]]]
$onlyIf[$and[$or[$get[kind]==role;$get[kind]==user]==true;$or[$get[act]==add;$get[act]==remove]==true]==true;Usage: protect <role|user> <add|remove> <target>]
$let[tgt;$if[$get[kind]==role;$replace[$replace[$replace[$message[2];<@&;];!;];>;];$findUser[$message[2]]]]
$onlyIf[$get[tgt]!=;Provide the target.]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$arrayLoad[pl;,;$if[$get[kind]==role;$env[cfg;protected;roles];$env[cfg;protected;users]]]
$if[$get[act]==add;
$if[$arrayIncludes[pl;$get[tgt]]!=true;
$arrayPush[pl;$get[tgt]]
$if[$get[kind]==role;
$!jsonSet[cfg;protected;roles;$arrayJoin[pl;,]]
;
$!jsonSet[cfg;protected;users;$arrayJoin[pl;,]]
]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[✅ Protected $get[kind] added.];
$description[Already protected.]
];
$let[i;$arrayIndexOf[pl;$get[tgt]]]
$if[$get[i]==-1;
$description[Not on the protection list.];
$arraySplice[pl;$get[i];1]
$if[$get[kind]==role;
$!jsonSet[cfg;protected;roles;$arrayJoin[pl;,]]
;
$!jsonSet[cfg;protected;users;$arrayJoin[pl;,]]
]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[✅ Removed from protection.]
]
]
$footer[Chronolith • Security]
]
    `
};
