/*
 *  * Chronolith — massban: Ban many users by ID at once (max 25 per run)
 *  * Slash command (mirrors the %massban prefix command). v2: prefix v2 fixes + $defer / follow-ups.
 */
module.exports = {
    data: {
        type: 1,
        name: "massban",
        description: "Ban many users by ID at once (max 25 per run)",
        options: [
            { type: 3, name: "ids", description: "Space-separated user IDs (max 25)", required: true },
        ]
    },
    type: 0,
    code: `
$onlyIf[$guildID!=;$ephemeral Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;$ephemeral ⛔ You need moderator permissions.]
$onlyIf[$hasPerms[$guildID;$botID;BanMembers]==true;$ephemeral ⛔ I am missing the Ban Members permission.]
$defer
$if[$option[ids]==;
$interactionFollowUp[Usage: massban <id> <id> ... (max 25 per run)]
$stop
]
$let[reason;Mass ban]
$!jsonLoad[p;$getGuildVar[cfg;$guildID;{}]]
$let[done;0]
$let[fail;0]
$let[seen;0]
$let[seenids;]
$let[failwhy;]
$!arrayLoad[toks; ;$option[ids]]
$!arrayForEach[toks;tok;
$if[$env[tok]!=;
$if[$checkContains[,$get[seenids],;,$env[tok],]!=true;
$let[seenids;$get[seenids]$if[$get[seenids]!=;,]$env[tok]]
$letSum[seen;1]
$let[bad;]
$let[inGuild;false]
$if[$get[seen]>25;
$let[bad;over the 25-target limit, run it again]
]
$if[$get[bad]==;
$if[$userExists[$env[tok]]!=true;
$let[bad;not a valid user ID]
]
]
$if[$get[bad]==;
$if[$or[$env[tok]==$authorID;$env[tok]==$botID;$env[tok]==$botOwnerID;$env[tok]==$guildOwnerID[$guildID]]==true;
$let[bad;that target cannot be moderated]
]
]
$if[$get[bad]==;
$if[$checkContains[,$env[p;protected;users],;,$env[tok],]==true;
$let[bad;that user is protected in this server]
]
]
$if[$get[bad]==;
$let[inGuild;$memberExists[$guildID;$env[tok]]]
]
$if[$get[bad]==;
$if[$get[inGuild]==true;
$if[$isBannable[$guildID;$env[tok]]!=true;
$let[bad;I lack permission to ban that member]
]
]
]
$if[$get[bad]==;
$if[$get[inGuild]==true;
$if[$authorID!=$guildOwnerID[$guildID];
$if[$rolePosition[$guildID;$memberHighestRoleID[$guildID;$authorID]]<=$rolePosition[$guildID;$memberHighestRoleID[$guildID;$env[tok]]];
$let[bad;that member is not below you in the role hierarchy]
]
]
]
]
$if[$get[bad]==;
$if[$isBanned[$guildID;$env[tok]]==true;
$let[bad;already banned]
]
]
$if[$get[bad]==;
$let[res;$ban[$guildID;$env[tok];$get[reason]]]
$if[$get[res]!=true;
$let[bad;Discord rejected the ban]
]
]
$if[$get[bad]==;
$letSum[done;1]
$let[cn;$math[$getGuildVar[caseCount;$guildID;0]+1]]
$setGuildVar[caseCount;$get[cn];$guildID]
$!jsonLoad[c;{}]
$!jsonSet[c;t;ban]
$!jsonSet[c;u;"$env[tok]"]
$!jsonSet[c;m;"$authorID"]
$!jsonSet[c;d;""]
$!jsonSet[c;r;$get[reason]]
$!jsonSet[c;ts;$getTimestamp]
$setGuildVar[case_$get[cn];$jsonStringify[c];$guildID]
$let[prev;$getGuildVar[ulist_$env[tok];$guildID;]]
$if[$get[prev]!=;
$setGuildVar[ulist_$env[tok];$get[prev],$get[cn];$guildID];
$setGuildVar[ulist_$env[tok];$get[cn];$guildID]
]
$let[msraw;$getGuildVar[ms_$authorID;$guildID;{}]]
$!jsonLoad[msj;$get[msraw]]
$!jsonSet[msj;ban;$math[$default[$env[msj;ban];0] + 1]]
$setGuildVar[ms_$authorID;$jsonStringify[msj];$guildID]
$if[$env[p;modlog]!=;
$if[$channelExists[$env[p;modlog]]==true;
$!try[$sendMessage[$env[p;modlog];
$author[🔨 Banned;$userAvatar[$env[tok];64;png]]
$color[#F23F24]
$description[<@$env[tok]> — mass ban
> $get[reason]]
$addField[Moderator;<@$authorID>;true]
$addField[Target ID;$env[tok];true]
$footer[Chronolith • Case #$get[cn]]
$timestamp
;false];]
]
]
]
$if[$get[bad]!=;
$letSum[fail;1]
$if[$get[fail]<=10;
$let[failwhy;$get[failwhy]
• $env[tok] — $get[bad]]
]
]
]
]
]
$interactionFollowUp[
$title[Mass ban finished]
$color[#F23F24]
$description[⛔ Banned **$get[done]** user(s).$if[$get[fail]>0;
Skipped **$get[fail]**:$get[failwhy]]]
$footer[Chronolith • Moderation]
]
    `
};
