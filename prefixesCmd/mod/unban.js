/*
 *  * Chronolith — unban: Unban a user (by ID or username), clears any hardban timer
 *  * Prefix command (mirrors the /unban slash command).
 *
 *  v2 fixes vs the previous unban.js:
 *   - FIX  $unban returns false on failure, it does not throw, so $try[...;$letSum[fail;1]] never fired:
 *          unbanning someone who was not banned still wrote an "unban" case and said "retracts".
 *          Now: $isBanned pre-check + the $unban result is checked.
 *   - FIX  multi-target ids were overwritten instead of appended (same bug as ban.js) → fixed.
 *   - FIX  $color[248046] was read as DECIMAL (cyan), not hex green → #248046.
 *   - FIX  skip reasons were never shown; the Ban button was attached even when nothing was unbanned.
 *   - FIX  unguarded modlog $sendMessage → $channelExists + $!try.
 *   - NEW  failures no longer poison later targets (the old $get[fail]==0 gate was cumulative).
 */
module.exports = {
    name: "unban",
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-unban;3s;]
$onlyIf[$hasPerms[$guildID;$botID;BanMembers]==true;⛔ I am missing the Ban Members permission.]
$let[ids;]
$let[reason;]
$let[tn;0]
$let[uid;]
$!arrayLoad[toks; ;$message]
$!arrayForEach[toks;tok;
$if[$env[tok]!=;
$if[$get[reason]==;
$if[$get[tn]<10;
$let[cand;$replace[$replace[$replace[$env[tok];<@;];!;];>;]]
$!try[$let[uid;$findUser[$get[cand]]];$let[uid;]]
$if[$get[uid]!=;
$if[$checkContains[,$get[ids],;,$get[uid],]!=true;
$let[ids;$get[ids]$if[$get[ids]!=;,]$get[uid]]
$letSum[tn;1]
]
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
]
$onlyIf[$get[ids]!=;No valid target found. Provide a user ID or username.]
$let[reason2;$if[$trim[$get[reason]]==;No reason provided;$trim[$get[reason]]]]
$!jsonLoad[p;$getGuildVar[cfg;$guildID;{}]]
$let[ok;0]
$let[fail;0]
$let[failwhy;]
$let[okids;]
$!arrayLoad[tg;,;$get[ids]]
$!arrayForEach[tg;u;
$if[$env[u]!=;
$let[bad;]
$if[$isBanned[$guildID;$env[u]]!=true;
$let[bad;that user is not banned]
]
$if[$get[bad]==;
$let[res;$unban[$guildID;$env[u];$get[reason2]]]
$if[$get[res]!=true;
$let[bad;Discord rejected the unban]
]
]
$if[$get[bad]==;
$letSum[ok;1]
$let[okids;$get[okids]$if[$get[okids]!=;,]$env[u]]
$setGuildVar[tb_$env[u];0;$guildID]
$let[tball;$getGuildVar[tb_all;$guildID;]]
$if[$checkContains[,$get[tball],;,$env[u],]==true;
$!arrayLoad[tbids;,;$get[tball]]
$!arrayLoad[keep]
$!arrayForEach[tbids;w;
$if[$env[w]!=$env[u];
$!arrayPush[keep;$env[w]]
]
]
$setGuildVar[tb_all;$arrayJoin[keep;,];$guildID]
]
$let[cn;$math[$getGuildVar[caseCount;$guildID;0]+1]]
$setGuildVar[caseCount;$get[cn];$guildID]
$!jsonLoad[c;{}]
$!jsonSet[c;t;unban]
$!jsonSet[c;u;"$env[u]"]
$!jsonSet[c;m;"$authorID"]
$!jsonSet[c;d;""]
$!jsonSet[c;r;$get[reason2]]
$!jsonSet[c;ts;$getTimestamp]
$setGuildVar[case_$get[cn];$jsonStringify[c];$guildID]
$let[prev;$getGuildVar[ulist_$env[u];$guildID;]]
$if[$get[prev]!=;
$setGuildVar[ulist_$env[u];$get[prev],$get[cn];$guildID];
$setGuildVar[ulist_$env[u];$get[cn];$guildID]
]
$let[msraw;$getGuildVar[ms_$authorID;$guildID;{}]]
$!jsonLoad[msj;$get[msraw]]
$!jsonSet[msj;unban;$math[$default[$env[msj;unban];0] + 1]]
$setGuildVar[ms_$authorID;$jsonStringify[msj];$guildID]
$if[$env[p;modlog]!=;
$if[$channelExists[$env[p;modlog]]==true;
$!try[$sendMessage[$env[p;modlog];
$author[🕊️ Unbanned;$userAvatar[$env[u];64;png]]
$color[#248046]
$thumbnail[$userAvatar[$env[u];128;png]]
$description[<@$env[u]> — $userTag[$env[u]]
> $get[reason2]]
$addField[Moderator;<@$authorID>;true]
$addField[Target ID;$env[u];true]
$footer[Chronolith • Case #$get[cn]]
$timestamp
;false];]
]
]
]
$if[$get[bad]!=;
$letSum[fail;1]
$let[failwhy;$get[failwhy]
• <@$env[u]> — $get[bad]]
]
]
]
$if[$get[ok]>0;
**__The Ban Hammer retracts.__**
$author[Server Management]
$title[$serverName[$guildID]]
$color[#248046]
$description[• **Action :** \`unban\`
> **Reason:** \`$get[reason2]\`
> **Member:** $if[$checkContains[$get[okids];,]!=true;\\[$username[$get[okids]]\\](https://discord.com/users/$get[okids]) (\`$get[okids]\`);<@$get[okids]>]
> **Action By:** \\[$username[$authorID]\\](https://discord.com/users/$authorID) (\`$authorID\`)
$if[$get[fail]>0;> **Skipped:** $get[failwhy]]
]
$thumbnail[https://cdn.discordapp.com/emojis/1129080609248137266.png?size=4096]
$footer[Rule breakers begone!]
$timestamp
$if[$get[ok]==1;
$addActionRow
$addButton[bban-$get[okids]-$authorID;Ban;Danger]
]
]
$if[$get[ok]==0;
$title[Nobody was unbanned]
$color[#F23F24]
$description[$get[failwhy]]
$footer[Chronolith • Moderation]
]
    `
};
