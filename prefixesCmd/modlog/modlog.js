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
$if[$or[$get[mode]==recent;$get[mode]==user;$or[$get[mode]==action;$get[mode]==set]]!=true;
Usage: modlog [recent|user|action|set] [...]
;
$if[$get[mode]==set;
$let[c;$if[$message[1]==off;;$replace[$replace[$message[1];<#;];>;] ]]
$!jsonLoad[cfg;$getGuildVar[cfg;$guildID;{}]]
$!jsonSet[cfg;modlog;$trim[$get[c]]]
$setGuildVar[cfg;$jsonStringify[cfg];$guildID]
$description[$if[$get[c]==;Modlog channel disabled.;Modlog channel set to <#$get[c]>.]]
$color[7C3AED]
;
$if[$get[mode]==user;
$let[target;$findUser[$message[1]]]
$onlyIf[$get[target]!=;Provide a target: modlog user <target>]
$let[uc;$userCases[$guildID;$get[target]]]
$onlyIf[$get[uc]!=;No cases on record for that user.]
$arrayLoad[cs;,;$get[uc]]
$arrayMap[cs;k;$jsonLoad[one;$getGuildVar[case_$env[k];$guildID;{}]]$return[-# **#$env[k]** $actionEmoji[$env[one;t]] · <@$env[one;m]> · $env[one;r]];out]
$author[User logs • $userTag[$get[target]];$userAvatar[$get[target];64;png]]
$color[7C3AED]
$description[$arrayJoin[out;
]]
$footer[Chronolith • $arrayLength[cs] case(s)];
$if[$get[mode]==action;
$let[atype;$toLowerCase[$message[1]]]
$onlyIf[$get[atype]!=;Provide an action type: modlog action <warn|ban|kick|...>]
$let[total;$getGuildVar[caseCount;$guildID;0]]
$let[scanned;0]
$let[ptr;$get[total]]
$arrayLoad[out;]
$loop[200;
$if[$or[$get[ptr]<1;$math[$get[total]-$get[ptr]]>=200];
$break
]
$!jsonLoad[one;$getGuildVar[case_$get[ptr];$guildID;{}]]
$if[$env[one;t]==$get[atype];
$arrayPush[out;-# **#$get[ptr]** · <@$env[one;u]> · $env[one;r]]
]
$let[ptr;$math[$get[ptr]-1]]
]
$author[Action logs • $get[atype];$userAvatar[$botID;64;png]]
$color[7C3AED]
$description[$if[$arrayLength[out]==0;No cases of that type in the last 200.;$arrayJoin[out;
]]]
$footer[Chronolith • scanned up to 200];
$let[total;$getGuildVar[caseCount;$guildID;0]]
$let[start;$math[$if[$get[total]>10;$get[total]-10;0]]]
$let[ptr;$math[$get[start]+1]]
$arrayLoad[out;]
$loop[12;
$if[$get[ptr]>$get[total];
$break
]
$!jsonLoad[one;$getGuildVar[case_$get[ptr];$guildID;{}]]
$arrayPush[out;-# **#$get[ptr]** $actionEmoji[$env[one;t]] · <@$env[one;u]> · $env[one;r]]
$let[ptr;$math[$get[ptr]+1]]
]
$author[Recent logs;$userAvatar[$botID;64;png]]
$color[7C3AED]
$description[$arrayJoin[out;
]]
$footer[Chronolith • $get[total] case(s) total]
]
]
]
]
    `
};
