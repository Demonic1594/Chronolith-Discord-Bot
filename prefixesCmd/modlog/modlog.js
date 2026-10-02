/*
 * Chronolith — modlog: View moderation logs (recent / by user / by action / set channel)
 * Prefix command (mirrors the /modlog slash command).
 */
module.exports = {
    name: "modlog",
    aliases: ["modlogs"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-modlog;3s;]
$let[mode;$if[$message[0]!=;$toLowerCase[$message[0]];recent]]
$if[$get[mode]==user;
$let[target;$findUser[$message[1]]]
$onlyIf[$get[target]!=;Provide a target: modlog user <target>]
$let[uc;$userCases[$guildID;$get[target]]]
$onlyIf[$get[uc]!=;No cases on record for that user.]
]
$if[$get[mode]==action;
$let[atype;$toLowerCase[$message[1]]]
$onlyIf[$get[atype]!=;Provide an action type: modlog action <warn|ban|kick|...>]
]
$if[$or[$get[mode]==recent;$get[mode]==user;$or[$get[mode]==action;$get[mode]==set]]!=true;
Usage: modlog \\[recent\\|user\\|action\\|set\\] \\[...\\]
;
$if[$get[mode]==set;
$let[c;$if[$message[1]==off;;$replace[$replace[$message[1];<#;];>;] ]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;modlog;$trim[$get[c]]]
$!setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$author[Chronolith • Modlog;$userAvatar[$botID;64;png]]
$description[$if[$get[c]==;> Modlog channel disabled.;> Modlog channel set to <#$get[c]>.]]
$color[5865F2]
$footer[Chronolith • Settings]
$timestamp
;
$if[$get[mode]==user;
$author[Modlog • $userTag[$get[target]];$userAvatar[$get[target];64;png]]
$color[5865F2]
$description[$modlogUserPage[$guildID;$get[target];1]]
$footer[Chronolith • Modlog • Page 1 of $modlogUserPages[$guildID;$get[target]] • %reason <case#> <text> to edit]
$timestamp
$addActionRow
$addButton[mlogu-back-$get[target]-1-$authorID;◀;Primary]
$addButton[mlogu-fwd-$get[target]-1-$authorID;▶;Primary]
;
$if[$get[mode]==action;
$let[body;$modlogActionPage[$guildID;$get[atype];1]]
$author[Modlog • $toUpperCase[$get[atype]];$userAvatar[$botID;64;png]]
$color[$if[$get[body]==;#4E5058;5865F2]]
$description[$if[$get[body]==;
> No cases of that type in the last 200.
;
$get[body]
]]
$footer[Chronolith • Modlog • Page 1 of $modlogActionPages[$guildID;$get[atype]] • %reason <case#> <text> to edit]
$timestamp
$addActionRow
$addButton[mloga-back-$get[atype]-1-$authorID;◀;Primary]
$addButton[mloga-fwd-$get[atype]-1-$authorID;▶;Primary]
;
$let[total;$getGuildVar[caseCount;$guildID;0]]
$author[Chronolith • Modlog;$userAvatar[$botID;64;png]]
$color[$if[$get[total]==0;#4E5058;5865F2]]
$description[$if[$get[total]==0;
> No mod logs as of yet.
;
$modlogPage[$guildID;$get[total]]
]]
$footer[Chronolith • Modlog • Page 1 of $pageCount[$get[total]] • %reason <case#> <text> to edit]
$timestamp
$addActionRow
$addButton[mlogs-back-1-$authorID;◀;Primary]
$addButton[mlogs-fwd-1-$authorID;▶;Primary]
]
]
]
]
    `
};
