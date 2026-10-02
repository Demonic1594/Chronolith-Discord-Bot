/*
 *  * Chronolith — kick: Kick one or more users
 *  * Prefix command (mirrors the /kick slash command).
 */
module.exports = {
    name: "kick",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-kick;3s;]
$onlyIf[$hasPerms[$guildID;$botID;KickMembers]==true;⛔ I am missing the Kick Members permission.]
$let[ids;]
$let[reason;]
$let[tn;0]
$!arrayLoad[toks; ;$message]
$!arrayForEach[toks;tok;
$if[$get[reason]==;
$if[$get[tn]<10;
$let[cand;$replace[$replace[$replace[$env[tok];<@;];!;];>;]]
$try[$let[uid;$findUser[$get[cand]]];$let[uid;]]
$if[$get[uid]!=;
$let[ids;$if[$get[ids]!=;,]$get[uid]]
$letSum[tn;1]
;
$let[reason;$env[tok]]
]
;
$let[reason;$get[reason] $env[tok]]
]
;
$let[reason;$get[reason] $env[tok]]
]
]
$onlyIf[$get[ids]!=;No valid target found. Mention a user, or type a username/ID.]
$let[reason2;$if[$trim[$get[reason]]==;No reason provided;$trim[$get[reason]]]]
$!jsonLoad[p;$getGuildVar[cfg;$guildID;{}]]
$let[ok;0]
$let[fail;0]
$let[failwhy;]
$let[last;0]
$!arrayLoad[tg;,;$get[ids]]
$!arrayForEach[tg;u;
$if[$env[u]!=;
$let[bad;]
$if[$or[$env[u]==$authorID;$env[u]==$botID;$env[u]==$botOwnerID;$env[u]==$guildOwnerID]==true;
$let[bad;that target cannot be moderated]
]
$if[$get[bad]==;
$if[$checkContains[,$env[p;protected;users],;,$env[u],]==true;
$let[bad;that user is protected in this server]
]
]
$if[$get[bad]==;
$if[$isKickable[$guildID;$env[u]]!=true;
$let[bad;I lack permission to kick that member]
]
]
$if[$get[bad]==;
$kick[$guildID;$env[u];$get[reason2]]
$letSum[ok;1]
$let[cn;$math[$getGuildVar[caseCount;$guildID;0]+1]]
$setGuildVar[caseCount;$get[cn];$guildID]
$!jsonLoad[c;{}]
$!jsonSet[c;t;kick]
$!jsonSet[c;u;"$env[u]"]
$!jsonSet[c;m;"$authorID"]
$!jsonSet[c;d;]
$!jsonSet[c;r;$get[reason2]]
$!jsonSet[c;ts;$getTimestamp]
$setGuildVar[case_$get[cn];$jsonStringify[c];$guildID]
$let[prev;$getGuildVar[ulist_$env[u];$guildID;]]
$if[$get[prev]!=;
$setGuildVar[ulist_$env[u];$get[prev],$get[cn];$guildID];
$setGuildVar[ulist_$env[u];$get[cn];$guildID]
]
$let[last;$get[cn]]
$let[msraw;$getGuildVar[ms_$authorID;$guildID;{}]]
$!jsonLoad[msj;$get[msraw]]
$!jsonSet[msj;kick;$math[$default[$env[msj;kick];0] + 1]]
$setGuildVar[ms_$authorID;$jsonStringify[msj];$guildID]
$if[$env[p;modlog]!=;
$sendMessage[$env[p;modlog];
$author[👢 Kicked;$userAvatar[$env[u];64;png]]
$color[F23F24]
$thumbnail[$userAvatar[$env[u];128;png]]
$description[<@$env[u]> — $userTag[$env[u]]
> $get[reason2]]
$addField[Moderator;<@$authorID>;true]
$addField[Target ID;$env[u];true]
$footer[Chronolith • Case #$get[cn]]
$timestamp
;false]
]
$if[$env[p;dmnotices]!=false;
$try[$sendDM[$env[u];
$author[👢 Kicked;$userAvatar[$botID;64;png]]
$color[F23F24]
$description[You were kicked from **$serverName[$guildID]**.
> $get[reason2]]
$addField[Case;#$get[cn];true]
$footer[Chronolith • Moderation]
];]
]
;
$letSum[fail;1]
$let[failwhy;$get[bad]]
]
]
]
**__The Booty Kick has spoken!__**
$author[Server Management]
$title[$serverName[$guildID]]
$color[F23F24]
$description[• **Action :** \`kick\`
> **Reason:** \`$get[reason2]\`
> **Member:** $if[$checkContains[$get[ids];,]!=true;[$username[$get[ids]]\\](https://discord.com/users/$get[ids]) (\`$get[ids]\`);<@$get[ids]>]
> **Action By:** [$username[$authorID]\\](https://discord.com/users/$authorID) (\`$authorID\`)
]
$thumbnail[https://media.discordapp.net/attachments/1064138335922167808/1131099018185953300/image0.jpg?size=4096]
$footer[Rule breakers begone!]
$timestamp
    `
};
