/*
 *  * Chronolith — unban: Unban a user and clear any hardban timer
 *  * Slash command (mirrors the %unban prefix command). v2: prefix v2 fixes + $defer / follow-ups.
 */
module.exports = {
    data: {
        type: 1,
        name: "unban",
        description: "Unban a user and clear any hardban timer",
        options: [
            { type: 3, name: "ids", description: "Space-separated user IDs", required: true },
            { type: 3, name: "reason", description: "Reason", required: false },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$onlyIf[$hasPerms[$guildID;$botID;BanMembers]==true;$ephemeral ⛔ I am missing the Ban Members permission.]
$defer

$let[ids;]
$let[tn;0]
$let[uid;]
$!arrayLoad[toks; ;$option[ids]]
$!arrayForEach[toks;tok;
$if[$env[tok]!=;
$if[$get[tn]<10;
$let[cand;$replace[$replace[$replace[$env[tok];<@;];!;];>;]]
$!try[$let[uid;$findUser[$get[cand]]];$let[uid;]]
$if[$get[uid]!=;
$if[$checkContains[,$get[ids],;,$get[uid],]!=true;
$let[ids;$get[ids]$if[$get[ids]!=;,]$get[uid]]
$letSum[tn;1]
]
]
]
]
]
$if[$get[ids]==;
$interactionFollowUp[No valid target found. Provide a user ID or username.]
$stop
]
$let[reason2;$if[$option[reason]==;No reason provided;$option[reason]]]
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
$interactionFollowUp[
**__The Ban Hammer retracts.__**
$author[Server Management]
$title[$serverName[$guildID]]
$color[#248046]
$description[• **Action :** \`unban\`
> **Reason:** \`$get[reason2]\`
> **Member:** $if[$checkContains[$get[okids];,]!=true;\[$username[$get[okids]]\](https://discord.com/users/$get[okids]) (\`$get[okids]\`);<@$get[okids]>]
> **Action By:** \[$username[$authorID]\](https://discord.com/users/$authorID) (\`$authorID\`)
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
]
$if[$get[ok]==0;
$interactionFollowUp[
$title[Nobody was unbanned]
$color[#F23F24]
$description[$get[failwhy]]
$footer[Chronolith • Moderation]
]
]
    `
};
