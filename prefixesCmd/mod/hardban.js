/*
 *  * Chronolith — hardban: Ban for a duration, auto-unbanned on expiry (persistent across restarts)
 *  * Prefix command (mirrors the /hardban slash command).
 *
 *  v2 fixes vs the previous hardban.js (same fixes as ban.js v2, plus the duration scan):
 *   - FIX  multi-target ids were overwritten instead of appended → only the last target was banned.
 *   - FIX  $ban's result was ignored: a rejected ban still wrote the expiry registry entry, a case, a
 *          counter bump and a modlog post. The timer/registry/case are now written only after success.
 *   - FIX  duration scan treated ANY bare number as the duration ("rule 6 violation" → dur=6). A duration
 *          now needs a unit: the token must change when m/h/d/s/w are stripped and the rest must be a number.
 *   - NEW  duration is validated (>= 1 minute) before anything runs; the reason joins words with a real space
 *          (the old $if[..; ] branch was whitespace-only and could be trimmed to nothing).
 *   - FIX  moderator hierarchy, member-only $isBannable (hackban of non-members), already-banned skip,
 *          guarded modlog post, DM before the ban, shown skip reasons, no Unban button when nothing banned.
 *   - NOTE a user who is already banned is skipped ("already banned"): to change a timer, unban first.
 */
module.exports = {
    name: "hardban",
    aliases: ["tempban"],
    type: "messageCreate",
    code: `
$nomention
$onlyIf[$guildID!=;Server only.]
$onlyIf[$isMod[$guildID;$authorID]==true;⛔ You need moderator permissions.]
$cooldown[$authorID-hardban;3s;]
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
$onlyIf[$get[ids]!=;No valid target found. Mention a user, or type a username/ID.]
$let[dur;]
$let[rest;]
$!arrayLoad[rt; ;$trim[$get[reason]]]
$!arrayForEach[rt;w;
$if[$env[w]!=;
$let[wl;$toLowerCase[$env[w]]]
$let[stripped;$replace[$replace[$replace[$replace[$replace[$get[wl];s;];m;];h;];d;];w;]]
$let[isdur;false]
$if[$get[dur]==;
$if[$get[stripped]!=;
$if[$get[stripped]!=$get[wl];
$let[isdur;$isNumber[$get[stripped]]]
]
]
]
$if[$get[isdur]==true;
$let[dur;$get[wl]]
;
$let[rest;$get[rest] $env[w]]
]
]
]
$onlyIf[$get[dur]!=;A duration is required: hardban <targets> <duration> \\[reason\\]]
$let[ms;$durationToMs[$get[dur]]]
$onlyIf[$get[ms]>=60000;That duration is not valid or is under 1 minute. Use for example 10m or 2d.]
$let[reason2;$if[$trim[$get[rest]]==;No reason provided;$trim[$get[rest]]]]
$!jsonLoad[p;$getGuildVar[cfg;$guildID;{}]]
$let[until;$math[$getTimestamp+$get[ms]]]
$let[ok;0]
$let[fail;0]
$let[failwhy;]
$let[okids;]
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
$author[⏳ Timed Ban;$userAvatar[$botID;64;png]]
$color[#F23F24]
$description[You were banned from **$serverName[$guildID]** for **$get[dur]**.
> $get[reason2]]
$addField[Case;#$get[cn];true]
$footer[Chronolith • Moderation]
];]
]
$let[res;$ban[$guildID;$env[u];$get[reason2] — expires $discordTimestamp[$get[until];RelativeTime]]]
$if[$get[res]!=true;
$let[bad;Discord rejected the ban]
]
]
$if[$get[bad]==;
$letSum[ok;1]
$let[okids;$get[okids]$if[$get[okids]!=;,]$env[u]]
$setGuildVar[tb_$env[u];$get[until];$guildID]
$let[tball;$getGuildVar[tb_all;$guildID;]]
$if[$checkContains[,$get[tball],;,$env[u],]!=true;
$if[$get[tball]!=;
$setGuildVar[tb_all;$get[tball],$env[u];$guildID];
$setGuildVar[tb_all;$env[u];$guildID]
]
]
$setGuildVar[caseCount;$get[cn];$guildID]
$!jsonLoad[c;{}]
$!jsonSet[c;t;hardban]
$!jsonSet[c;u;"$env[u]"]
$!jsonSet[c;m;"$authorID"]
$!jsonSet[c;d;$get[dur]]
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
$!jsonSet[msj;hardban;$math[$default[$env[msj;hardban];0] + 1]]
$setGuildVar[ms_$authorID;$jsonStringify[msj];$guildID]
$if[$env[p;modlog]!=;
$if[$channelExists[$env[p;modlog]]==true;
$!try[$sendMessage[$env[p;modlog];
$author[⏳ Timed Ban;$userAvatar[$env[u];64;png]]
$color[#F23F24]
$thumbnail[$userAvatar[$env[u];128;png]]
$description[<@$env[u]> — $userTag[$env[u]] · **$get[dur]** · auto-unban $discordTimestamp[$get[until];RelativeTime]
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
**__The Ban Hammer has spoken!__**
$author[Server Management]
$title[$serverName[$guildID]]
$color[#F23F24]
$description[• **Action :** \`hardban\` · \`$get[dur]\`
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
$addButton[bunban-$get[okids]-$authorID;Unban;Danger]
]
]
$if[$get[ok]==0;
$title[Nobody was banned]
$color[#F23F24]
$description[$get[failwhy]]
$footer[Chronolith • Moderation]
]
    `
};
