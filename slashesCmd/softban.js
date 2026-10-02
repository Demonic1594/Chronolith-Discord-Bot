/*
 *  * Chronolith — softban: Ban + immediate unban to purge a user's last day of messages
 *  * Slash command (mirrors the %softban prefix command). v2: prefix v2 fixes + $defer / follow-ups.
 */
module.exports = {
    data: {
        type: 1,
        name: "softban",
        description: "Ban + immediate unban to purge a user's last day of messages",
        options: [
            { type: 3, name: "targets", description: "Mentions/usernames/IDs (space separated)", required: true },
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
$!arrayLoad[toks; ;$option[targets]]
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
$interactionFollowUp[No valid target found. Mention a user, or type a username/ID.]
$stop
]
$let[reason2;$if[$option[reason]==;No reason provided;$option[reason]]]
$!jsonLoad[p;$getGuildVar[cfg;$guildID;{}]]
$let[ok;0]
$let[fail;0]
$let[failwhy;]
$let[okids;]
$let[stuck;]
$!arrayLoad[tg;,;$get[ids]]
$!arrayForEach[tg;u;
$if[$env[u]!=;

$let[bad;]
$let[inGuild;false]
$if[$or[$env[u]==$authorID;$env[u]==$botID;$env[u]==$botOwnerID;$env[u]==$guildOwnerID[$guildID]]==true;
$let[bad;that target cannot be moderated]
]
$if[$get[bad]==;
$if[$checkContains[,$env[p;protected;users],;,$env[u],]==true;
$let[bad;that user is protected in this server]
]
]
$if[$get[bad]==;
$let[inGuild;$memberExists[$guildID;$env[u]]]
]
$if[$get[bad]==;
$if[$get[inGuild]==true;
$if[$isBannable[$guildID;$env[u]]!=true;
$let[bad;I lack permission to ban that member]
]
]
]
$if[$get[bad]==;
$if[$get[inGuild]==true;
$if[$authorID!=$guildOwnerID[$guildID];
$if[$rolePosition[$guildID;$memberHighestRoleID[$guildID;$authorID]]<=$rolePosition[$guildID;$memberHighestRoleID[$guildID;$env[u]]];
$let[bad;that member is not below you in the role hierarchy]
]
]
]
]
$if[$get[bad]==;
$if[$isBanned[$guildID;$env[u]]==true;
$let[bad;already banned]
]
]
$let[res;false]
$let[cn;$math[$getGuildVar[caseCount;$guildID;0]+1]]
$if[$get[bad]==;

$if[$env[p;dmnotices]!=false;
$!try[$sendDM[$env[u];
$author[🧹 Softban;$userAvatar[$botID;64;png]]
$color[#F23F24]
$description[You were softbanned from **$serverName[$guildID]** — you can rejoin, your last day of messages was purged.
> $get[reason2]]
$addField[Case;#$get[cn];true]
$footer[Chronolith • Moderation]
];]
]
$let[res;$ban[$guildID;$env[u];$get[reason2];86400]]
$if[$get[res]!=true;
$let[bad;Discord rejected the ban]
]
]
$if[$get[bad]==;
$let[res2;$unban[$guildID;$env[u];Softban cleanup]]
$if[$get[res2]!=true;
$let[stuck;$get[stuck]
• <@$env[u]>]
]

$letSum[ok;1]
$let[okids;$get[okids]$if[$get[okids]!=;,]$env[u]]

$setGuildVar[caseCount;$get[cn];$guildID]
$!jsonLoad[c;{}]
$!jsonSet[c;t;softban]
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
$!jsonSet[msj;softban;$math[$default[$env[msj;softban];0] + 1]]
$setGuildVar[ms_$authorID;$jsonStringify[msj];$guildID]

$if[$env[p;modlog]!=;
$if[$channelExists[$env[p;modlog]]==true;
$!try[$sendMessage[$env[p;modlog];
$author[🧹 Softban;$userAvatar[$env[u];64;png]]
$color[#F23F24]
$thumbnail[$userAvatar[$env[u];128;png]]
$description[<@$env[u]> — $userTag[$env[u]] · messages from the last 24h purged
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
**__The Ban Hammer has swept clean!__**
$author[Server Management]
$title[$serverName[$guildID]]
$color[#F23F24]
$description[• **Action :** \`softban\`
> **Reason:** \`$get[reason2]\`
> **Member:** $if[$checkContains[$get[okids];,]!=true;\[$username[$get[okids]]\](https://discord.com/users/$get[okids]) (\`$get[okids]\`);<@$get[okids]>]
> **Action By:** \[$username[$authorID]\](https://discord.com/users/$authorID) (\`$authorID\`)
$if[$get[fail]>0;> **Skipped:** $get[failwhy]]
$if[$get[stuck]!=;> ⚠️ **Still banned** (cleanup unban failed, run unban): $get[stuck]]
]
$thumbnail[https://cdn.discordapp.com/emojis/1129080609248137266.png?size=4096]
$footer[Rule breakers begone!]
$timestamp
]
]
$if[$get[ok]==0;
$interactionFollowUp[
$title[Nobody was softbanned]
$color[#F23F24]
$description[$get[failwhy]]
$footer[Chronolith • Moderation]
]
]
    `
};
