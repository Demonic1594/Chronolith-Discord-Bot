/*
 * Chronolith — linkwl: Link-filter whitelist domains
 * Prefix command (mirrors the /linkwl slash command).
 */
module.exports = {
    name: "linkwl",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-linkwl;3s;]
$onlyIf[$or[$toLowerCase[$message[0]]==add;$or[$toLowerCase[$message[0]]==remove;$toLowerCase[$message[0]]==list]]==true;Usage: linkwl add|remove|list <domain>]
$if[$toLowerCase[$message[0]]!=list;
$let[d;$toLowerCase[$message[1]]]
$onlyIf[$get[d]!=;Provide the domain.]
]
$if[$toLowerCase[$message[0]]==list;
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$description[Whitelisted domains]
$addField[Domains;$if[$env[cfg;automod;linkwl]==;*none*;$env[cfg;automod;linkwl]];false];
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!arrayLoad[ds;,;$env[cfg;automod;linkwl]]
$if[$toLowerCase[$message[0]]==add;
$if[$arraySome[ds;x;$checkCondition[$env[x]==$get[d]]]!=true;
$!arrayPush[ds;$get[d]]
$!jsonSet[cfg;automod;linkwl;$arrayJoin[ds;,]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[✅ Domain whitelisted ($arrayLength[ds] total).];
$description[Already whitelisted.]
];
$let[i;$arrayIndexOf[ds;$get[d]]]
$if[$get[i]==-1;
$description[Not on the list.];
$!arraySplice[ds;$get[i];1]
$!jsonSet[cfg;automod;linkwl;$arrayJoin[ds;,]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[✅ Domain removed ($arrayLength[ds] left).]
]
]
]
$footer[Chronolith • Automod]
    `
};
