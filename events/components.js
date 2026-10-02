/*
 * Chronolith — component router (interactionCreate, buttons + select menus), v2.
 *
 * CustomID protocols (delimiter "-", payloads digit-only / lowercase words):
 *   mlogs-back-<page> / mlogs-fwd-<page>            → recent pagination
 *   mlogu-back-<userID>-<page> / mlogu-fwd-...      → user pagination
 *   mloga-back-<type>-<page> / mloga-fwd-...        → action pagination
 *   mlogsel                                         → jump-to-action dropdown
 *   bunban-<userID> / bban-<userID>                 → one-click ban follow-ups
 *   pgr-...                                         → inert page label (never matches)
 *   help-<page>-<authorID>, tkclose-<authorID>, verify-<guildID>-<userID>
 *
 * Every branch re-checks permissions — clicks bypass command gates.
 *
 * v2 changes:
 *   - FIX  dropdown → "Recent" produced mloga-*-recent buttons with back always disabled
 *          (pagination dead after choosing Recent). All four modlog verbs now share one
 *          compute-then-render path, so recent always gets mlogs-* IDs and correct disabled states.
 *   - FIX  $color[248046] was read as DECIMAL 248046 (cyan), not hex green → #248046 (all colors #-prefixed)
 *   - FIX  bunban / bban recorded a case + showed success even when Discord rejected the action
 *          ($ban / $unban return false on any failure) → result is checked first
 *   - FIX  bunban / bban wrote the case JSON but never added it to ulist_<user>, so one-click cases
 *          were missing from %modlog user / %warnings / %cases  (still bypasses mod-stats and the
 *          modlog-channel post — switch to $newCase when you confirm its signature)
 *   - FIX  top-level $ban / $try[$unban] / $try[$memberRemoveRoles] leaked "true" into the output
 *   - FIX  tkclose only denied SendMessages for @everyone; the ticket owner's member overwrite
 *          (if any) beats that, so the channel was not really read-only → owner denied too
 *   - NEW  dropdown capped at 24 actions (+ Recent) — Discord rejects selects over 25 options
 *   - NEW  pages are clamped on both ends; one mod gate for all modlog verbs; the page body is
 *          computed once (it used to be computed twice per click)
 */

module.exports = {
    type: "interactionCreate",
    allowedInteractionTypes: ["button", "selectMenu"],
    code: `
        $arrayLoad[id;-;$customID]
        $let[verb;$arrayAt[id;0]]

        $if[$get[verb]==verify;
            $let[vg;$arrayAt[id;1]]
            $let[vu;$arrayAt[id;2]]
            $if[$authorID!=$get[vu];
                $ephemeral
                $interactionReply[This verification link belongs to someone else.]
                $stop
            ]
            $!jsonLoad[cfg;$getGuildVar[cfg;$get[vg];{}]]
            $!try[$memberRemoveRoles[$get[vg];$authorID;$env[cfg;verify;role]];]
            $ephemeral
            $interactionReply[
                $description[You are verified — welcome to **$guildName[$get[vg]]**.]
                $color[#248046]
                $footer[Chronolith • Verification]
                    $timestamp
            ]
            $stop
        ]

        $onlyIf[$guildID!=;]
        $let[owner;$arrayAt[id;2]]

        $if[$get[verb]==help;
            $let[page;$arrayAt[id;1]]
            $let[allowed;$if[$authorID==$get[owner];true;$isMod[$guildID;$authorID]]]
            $if[$get[allowed]!=true;
                $ephemeral
                $interactionReply[This menu belongs to <@$get[owner]> — run /help or %help yourself.]
                $stop
            ]
            $if[$get[page]<0;
                $let[page;$math[$helpPages-1]]
            ]
            $if[$get[page]>=$helpPages;
                $let[page;0]
            ]
            $interactionUpdate[
                $author[Chronolith;$userAvatar[$botID;32;png]]
                $description[$helpPage[$get[page]]]
                $color[#5865F2]
                $footer[Chronolith • Page $math[$get[page]+1] of $helpPages]
                $addActionRow
                $addButton[help-$math[$get[page]-1]-$get[owner];◀;Primary]
                $addButton[help-$math[$get[page]+1]-$get[owner];▶;Primary]
            ]
        ]

        $c[ ───────── modlog family: mlogs / mlogu / mloga / mlogsel share one path ───────── ]

        $let[isLog;$or[$get[verb]==mlogs;$get[verb]==mlogu;$get[verb]==mloga;$get[verb]==mlogsel]]
        $if[$get[isLog]==true;
            $onlyIf[$isMod[$guildID;$authorID]==true;
                $ephemeral
                $interactionReply[⛔ Missing permissions to change the pages.]
                $stop
            ]

            $let[kind;]
            $let[dir;]
            $let[arg;]
            $let[page;1]
            $let[pages;1]
            $let[jump;false]
            $let[total;$getGuildVar[caseCount;$guildID;0]]
            $let[acts;$modlogActions[$guildID]]

            $if[$get[verb]==mlogs;
                $let[kind;recent]
                $let[dir;$arrayAt[id;1]]
                $let[page;$arrayAt[id;2]]
            ]
            $if[$get[verb]==mlogu;
                $let[kind;user]
                $let[dir;$arrayAt[id;1]]
                $let[arg;$arrayAt[id;2]]
                $let[page;$arrayAt[id;3]]
            ]
            $if[$get[verb]==mloga;
                $let[kind;action]
                $let[dir;$arrayAt[id;1]]
                $let[arg;$arrayAt[id;2]]
                $let[page;$arrayAt[id;3]]
            ]
            $if[$get[verb]==mlogsel;
                $let[jump;true]
                $let[kind;action]
                $let[arg;$selectMenuValues[0]]
                $if[$get[arg]==recent;
                    $let[kind;recent]
                    $let[arg;]
                ]
            ]

            $if[$get[kind]==recent;
                $let[pages;$pageCount[$get[total]]]
            ]
            $if[$get[kind]==user;
                $let[pages;$modlogUserPages[$guildID;$get[arg]]]
            ]
            $if[$get[kind]==action;
                $let[pages;$modlogActionPages[$guildID;$get[arg]]]
            ]
            $if[$get[pages]<1;
                $let[pages;1]
            ]

            $if[$get[jump]==true;
                $let[page;1]
                $if[$get[kind]==recent;
                    $let[page;$get[pages]]
                ]
            ]
            $if[$and[$get[jump]!=true;$get[dir]==back]==true;
                $let[page;$math[$get[page]-1]]
            ]
            $if[$and[$get[jump]!=true;$get[dir]==fwd]==true;
                $let[page;$math[$get[page]+1]]
            ]
            $if[$get[page]<1;
                $let[page;1]
            ]
            $if[$get[page]>$get[pages];
                $let[page;$get[pages]]
            ]

            $if[$get[kind]==recent;
                $let[body;$modlogPage[$guildID;$get[page]]]
                $let[head;## 📋 Modlog — recent activity]
                $let[sub;-# $get[total] case(s) on record · page $get[page] of $get[pages]]
                $let[empty;*No mod logs as of yet — the slate is clean.*]
                $let[idBack;mlogs-back-$get[page]]
                $let[idFwd;mlogs-fwd-$get[page]]
            ]
            $if[$get[kind]==user;
                $let[body;$modlogUserPage[$guildID;$get[arg];$get[page]]]
                $let[head;## 👤 Modlog — $userTag[$get[arg]]]
                $let[sub;-# Page $get[page] of $get[pages]]
                $let[empty;*Nothing on this page.*]
                $let[idBack;mlogu-back-$get[arg]-$get[page]]
                $let[idFwd;mlogu-fwd-$get[arg]-$get[page]]
            ]
            $if[$get[kind]==action;
                $let[body;$modlogActionPage[$guildID;$get[arg];$get[page]]]
                $let[head;## 🎯 Modlog — $toUpperCase[$get[arg]] cases]
                $let[sub;-# Page $get[page] of $get[pages] · newest first]
                $let[empty;*Nothing here.*]
                $let[idBack;mloga-back-$get[arg]-$get[page]]
                $let[idFwd;mloga-fwd-$get[arg]-$get[page]]
            ]

            $let[backDis;$if[$get[page]<=1;true;false]]
            $let[fwdDis;$if[$get[page]>=$get[pages];true;false]]
            $!arrayLoad[al;,;$get[acts]]
            $let[alen;$if[$get[acts]==;0;$arrayLength[al]]]
            $let[oi;0]

            $interactionUpdate[
                $addContainer[
$addTextDisplay[$get[head]
$get[sub]]
$addSeparator[Large;true]
$addTextDisplay[$if[$get[body]==;$get[empty];$get[body]]]
$addSeparator[Small;true]
$addTextDisplay[-# %reason <case#> <text> to edit a case]
$addActionRow
$addStringSelectMenu[mlogsel;Jump to action…]
$addOption[📋 Recent;All recent cases;recent]
$loop[24;
$if[$get[oi]>=$get[alen];
$break
]
$let[a;$arrayAt[al;$get[oi]]]
$if[$get[a]!=;
$addOption[$toUpperCase[$get[a]] cases;Every $get[a] case on record;$get[a]]
]
$let[oi;$math[$get[oi]+1]]
]
$addActionRow
$addButton[$get[idBack];◀;Primary;;$get[backDis]]
$addButton[pgr-$get[page]-of-$get[pages];Page $get[page] of $get[pages];Secondary;;true]
$addButton[$get[idFwd];▶;Primary;;$get[fwdDis]]
;#5865F2]
            ]
        ]

        $c[ ───────── one-click unban ───────── ]

        $if[$get[verb]==bunban;
            $let[tgt;$arrayAt[id;1]]
            $onlyIf[$isMod[$guildID;$authorID]==true;
                $ephemeral
                $interactionReply[⛔ You need moderator permissions.]
                $stop
            ]
            $let[ok;$unban[$guildID;$get[tgt];Unban — one-click follow-up on the ban]]
            $if[$get[ok]!=true;
                $ephemeral
                $interactionReply[I could not unban that user — they may already be unbanned, or I am missing permissions.]
                $stop
            ]
            $setGuildVar[tb_$get[tgt];0;$guildID]
            $let[tball;$getGuildVar[tb_all;$guildID;]]
            $if[$checkContains[,$get[tball],;,$get[tgt],]==true;
                $!arrayLoad[tbids;,;$get[tball]]
                $!arrayLoad[keep]
                $!arrayForEach[tbids;w;
                    $if[$env[w]!=$get[tgt];
                        $!arrayPush[keep;$env[w]]
                    ]
                ]
                $setGuildVar[tb_all;$arrayJoin[keep;,];$guildID]
            ]
            $let[cn;$math[$getGuildVar[caseCount;$guildID;0]+1]]
            $setGuildVar[caseCount;$get[cn];$guildID]
            $!jsonLoad[c;{}]
            $!jsonSet[c;t;unban]
            $!jsonSet[c;u;"$get[tgt]"]
            $!jsonSet[c;m;"$authorID"]
            $!jsonSet[c;d;""]
            $!jsonSet[c;r;Unbanned via one-click follow-up]
            $!jsonSet[c;ts;$getTimestamp]
            $setGuildVar[case_$get[cn];$jsonStringify[c];$guildID]
            $let[ul;$getGuildVar[ulist_$get[tgt];$guildID;]]
            $setGuildVar[ulist_$get[tgt];$if[$get[ul]==;$get[cn];$get[ul],$get[cn]];$guildID]
            $let[msraw;$getGuildVar[ms_$authorID;$guildID;{}]]
            $!jsonLoad[msj;$get[msraw]]
            $!jsonSet[msj;unban;$math[$default[$env[msj;unban];0] + 1]]
            $setGuildVar[ms_$authorID;$jsonStringify[msj];$guildID]
            $!jsonLoad[p;$getGuildVar[cfg;$guildID;{}]]
            $if[$env[p;modlog]!=;
                $if[$channelExists[$env[p;modlog]]==true;
                    $!try[$sendMessage[$env[p;modlog];
                        $title[**__The Ban Hammer retracts.__**]
                        $author[$serverName[$guildID];$guildIcon[$guildID]]
                        $color[#248046]
                        $description[• **Action :** \`unban\`
> **Reason:** \`Unbanned via one-click follow-up\`
> **Member:** \\[$username[$get[tgt]]\\](https://discord.com/users/$get[tgt])
> **Action By:** \\[$username[$authorID]\\](https://discord.com/users/$authorID)
> **Case:** \`$get[cn]\`]
                        $thumbnail[$userAvatar[$authorID;128;png]]
                        $footer[Chronolith • Moderation]
                        $timestamp
                    ;false];]
                ]
            ]
            $interactionUpdate[
                $title[**__The Ban Hammer retracts.__**]
                $author[$serverName[$guildID];$guildIcon[$guildID]]
                $color[#248046]
                $description[• **Action :** \`unban\`
> **Reason:** \`Unbanned via one-click follow-up\`
> **Member:** \\[$username[$get[tgt]]\\](https://discord.com/users/$get[tgt])
> **Action By:** \\[$username[$authorID]\\](https://discord.com/users/$authorID)
> **Case:** \`$get[cn]\`]
                $thumbnail[$userAvatar[$authorID;128;png]]
                $footer[Chronolith • Moderation]
                $timestamp
            ]
        ]

        $c[ ───────── one-click re-ban ───────── ]

        $if[$get[verb]==bban;
            $let[tgt;$arrayAt[id;1]]
            $onlyIf[$isMod[$guildID;$authorID]==true;
                $ephemeral
                $interactionReply[⛔ You need moderator permissions.]
                $stop
            ]
            $let[ok;$ban[$guildID;$get[tgt];Re-banned via one-click follow-up]]
            $if[$get[ok]!=true;
                $ephemeral
                $interactionReply[I could not ban that user — check role hierarchy and my Ban Members permission.]
                $stop
            ]
            $let[cn;$math[$getGuildVar[caseCount;$guildID;0]+1]]
            $setGuildVar[caseCount;$get[cn];$guildID]
            $!jsonLoad[c;{}]
            $!jsonSet[c;t;ban]
            $!jsonSet[c;u;"$get[tgt]"]
            $!jsonSet[c;m;"$authorID"]
            $!jsonSet[c;d;""]
            $!jsonSet[c;r;Re-banned via one-click follow-up]
            $!jsonSet[c;ts;$getTimestamp]
            $setGuildVar[case_$get[cn];$jsonStringify[c];$guildID]
            $let[ul;$getGuildVar[ulist_$get[tgt];$guildID;]]
            $setGuildVar[ulist_$get[tgt];$if[$get[ul]==;$get[cn];$get[ul],$get[cn]];$guildID]
            $let[msraw;$getGuildVar[ms_$authorID;$guildID;{}]]
            $!jsonLoad[msj;$get[msraw]]
            $!jsonSet[msj;ban;$math[$default[$env[msj;ban];0] + 1]]
            $setGuildVar[ms_$authorID;$jsonStringify[msj];$guildID]
            $!jsonLoad[p;$getGuildVar[cfg;$guildID;{}]]
            $if[$env[p;modlog]!=;
                $if[$channelExists[$env[p;modlog]]==true;
                    $!try[$sendMessage[$env[p;modlog];
                        $title[**__The Ban Hammer has spoken!__**]
                        $author[$serverName[$guildID];$guildIcon[$guildID]]
                        $color[#F23F24]
                        $description[• **Action :** \`ban\`
> **Reason:** \`Re-banned via one-click follow-up\`
> **Member:** \\[$username[$get[tgt]]\\](https://discord.com/users/$get[tgt])
> **Action By:** \\[$username[$authorID]\\](https://discord.com/users/$authorID)
> **Case:** \`$get[cn]\`]
                        $thumbnail[$userAvatar[$authorID;128;png]]
                        $footer[Chronolith • Moderation]
                        $timestamp
                    ;false];]
                ]
            ]
            $interactionUpdate[
                $title[**__The Ban Hammer has spoken!__**]
                $author[$serverName[$guildID];$guildIcon[$guildID]]
                $color[#F23F24]
                $description[• **Action :** \`ban\`
> **Reason:** \`Re-banned via one-click follow-up\`
> **Member:** \\[$username[$get[tgt]]\\](https://discord.com/users/$get[tgt])
> **Action By:** \\[$username[$authorID]\\](https://discord.com/users/$authorID)
> **Case:** \`$get[cn]\`]
                $thumbnail[$userAvatar[$authorID;128;png]]
                $footer[Chronolith • Moderation]
                $timestamp
            ]
        ]

        $c[ ───────── ticket close ───────── ]

        $if[$get[verb]==tkclose;
            $let[owner;$arrayAt[id;1]]
            $let[allowed;$if[$authorID==$get[owner];true;$isMod[$guildID;$authorID]]]
            $if[$get[allowed]!=true;
                $ephemeral
                $interactionReply[Only the ticket owner or a moderator can close this.]
                $stop
            ]
            $!removeChannelPerms[$channelID;$guildID;SendMessages]
            $!try[$removeChannelPerms[$channelID;$get[owner];SendMessages];]
            $interactionUpdate[
                $author[Ticket;$userAvatar[$botID;64;png]]
                $title[Ticket closed]
                $color[#F23F24]
                $description[Closed by <@$authorID>. The channel is now read-only — a moderator may delete it after review.]
                $footer[Chronolith • Tickets]
                    $timestamp
            ]
        ]
    `
};
